package com.dagongr.ledger;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 通知监听服务与 Capacitor 插件之间的桥。
 *
 * 关键点：App 退到后台后，Android 会暂停 WebView 里的 JS 执行 ——
 * 这时候即使把事件「发」给页面，页面也不会跑，事件就丢了。
 * 所以每条通知都先**持久化到 SharedPreferences 队列**，
 * 等页面回到前台时再主动 drain 出来补记，保证后台付款不丢。
 */
public class BillEventBus {

    public interface Sink {
        void onEvent(Map<String, Object> data);
    }

    private static final String SP_QUEUE = "bill_notify_queue";
    private static final String SP_SEEN = "bill_notify_seen";
    private static final String KEY_PREFIX = "n_";
    private static final int MAX_QUEUE = 300;
    private static final long SEEN_WINDOW_MS = 10 * 60 * 1000L;

    private static Context appCtx = null;
    private static Sink sink = null;
    private static long seq = 0;
    private static volatile boolean connected = false;
    private static volatile long lastEventAt = 0;

    /** Service 启动时调用，拿到 Application Context 用于持久化 */
    public static synchronized void init(Context c) {
        if (c != null) appCtx = c.getApplicationContext();
    }

    /** 插件启动时注册；传 null 表示注销 */
    public static synchronized void setSink(Sink s) {
        sink = s;
    }

    public static void setConnected(boolean v) {
        connected = v;
    }

    public static boolean isConnected() {
        return connected;
    }

    public static long getLastEventAt() {
        return lastEventAt;
    }

    public static synchronized void emit(String pkg, String title, String text, String bigText, String full, long postTime) {
        Map<String, Object> d = new HashMap<>();
        d.put("pkg", pkg == null ? "" : pkg);
        d.put("title", title == null ? "" : title);
        d.put("text", text == null ? "" : text);
        d.put("bigText", bigText == null ? "" : bigText);
        d.put("full", full == null ? "" : full);
        d.put("postTime", postTime);
        d.put("at", System.currentTimeMillis());
        lastEventAt = System.currentTimeMillis();

        // 1) 先落盘 —— App 在后台时页面收不到，靠这条队列补记
        persist(d);
        // 2) 页面在前台时顺带实时推一次（体验更好，不依赖补记）
        if (sink != null) {
            try {
                sink.onEvent(d);
            } catch (Throwable ignored) {
            }
        }
    }

    private static void persist(Map<String, Object> d) {
        if (appCtx == null) return;
        try {
            String full = String.valueOf(d.get("full"));
            long now = System.currentTimeMillis();

            // 同一段通知文本 10 分钟内只留一条（系统会重复推送同一条通知）
            SharedPreferences seen = appCtx.getSharedPreferences(SP_SEEN, Context.MODE_PRIVATE);
            String h = hashOf(full);
            long last = seen.getLong(h, 0L);
            if (last > 0 && now - last < SEEN_WINDOW_MS) return;
            seen.edit().putLong(h, now).apply();

            JSONObject o = new JSONObject();
            for (Map.Entry<String, Object> e : d.entrySet()) {
                o.put(e.getKey(), e.getValue());
            }
            SharedPreferences sp = appCtx.getSharedPreferences(SP_QUEUE, Context.MODE_PRIVATE);
            String key = KEY_PREFIX + String.format("%013d", now) + "_" + (seq++);
            sp.edit().putString(key, o.toString()).apply();

            // 只保留最近 MAX_QUEUE 条
            Map<String, ?> all = sp.getAll();
            if (all.size() > MAX_QUEUE) {
                List<String> keys = new ArrayList<>(all.keySet());
                Collections.sort(keys);
                int drop = keys.size() - MAX_QUEUE;
                SharedPreferences.Editor ed = sp.edit();
                for (int i = 0; i < drop; i++) ed.remove(keys.get(i));
                ed.apply();
            }
        } catch (Throwable ignored) {
        }
    }

    private static String hashOf(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] b = md.digest(s.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) sb.append(String.format("%02x", b[i]));
            return sb.toString();
        } catch (Throwable t) {
            return String.valueOf(s == null ? 0 : s.hashCode());
        }
    }

    /** 取出并清空队列（页面启动 / 回到前台时调用） */
    public static synchronized List<Map<String, Object>> drainQueue() {
        List<Map<String, Object>> out = new ArrayList<>();
        if (appCtx == null) return out;
        try {
            SharedPreferences sp = appCtx.getSharedPreferences(SP_QUEUE, Context.MODE_PRIVATE);
            Map<String, ?> all = sp.getAll();
            List<String> keys = new ArrayList<>(all.keySet());
            Collections.sort(keys);   // key 前缀是时间戳，排序即时间序
            for (String k : keys) {
                Object v = all.get(k);
                if (!(v instanceof String)) continue;
                try {
                    JSONObject o = new JSONObject((String) v);
                    Map<String, Object> d = new HashMap<>();
                    Iterator<String> it = o.keys();
                    while (it.hasNext()) {
                        String kk = it.next();
                        d.put(kk, o.get(kk));
                    }
                    out.add(d);
                } catch (Throwable ignored) {
                }
            }
            sp.edit().clear().apply();
        } catch (Throwable ignored) {
        }
        return out;
    }

    public static synchronized int queueCount() {
        if (appCtx == null) return 0;
        try {
            return appCtx.getSharedPreferences(SP_QUEUE, Context.MODE_PRIVATE).getAll().size();
        } catch (Throwable t) {
            return 0;
        }
    }
}
