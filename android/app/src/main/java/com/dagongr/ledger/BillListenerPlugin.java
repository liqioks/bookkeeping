package com.dagongr.ledger;

import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;
import java.util.Map;

/**
 * 暴露给页面的接口：
 *   isEnabled()      → 是否已获得「通知使用权」
 *   openSettings()   → 跳到系统的通知使用权设置页
 *   start()          → 开始把支付通知推给页面（事件名 billNotification）
 *   stop()           → 停止推送
 *   drainPending()   → 取插件注册之前缓存的那些通知
 */
@CapacitorPlugin(name = "BillListener")
public class BillListenerPlugin extends Plugin {

    private static JSObject toJs(Map<String, Object> src) {
        JSObject o = new JSObject();
        if (src == null) return o;
        for (Map.Entry<String, Object> e : src.entrySet()) {
            try {
                o.put(e.getKey(), e.getValue());
            } catch (Throwable ignored) {
            }
        }
        return o;
    }

    private boolean hasNotificationAccess() {
        try {
            String flat = Settings.Secure.getString(
                    getContext().getContentResolver(), "enabled_notification_listeners");
            if (TextUtils.isEmpty(flat)) return false;
            return flat.contains(getContext().getPackageName());
        } catch (Throwable t) {
            return false;
        }
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("enabled", hasNotificationAccess());
        call.resolve(ret);
    }

    /** 诊断用：授权状态 / 服务是否已连接 / 待补记条数 */
    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", hasNotificationAccess());
        ret.put("connected", BillEventBus.isConnected());
        ret.put("queueCount", BillEventBus.queueCount());
        ret.put("lastEventAt", BillEventBus.getLastEventAt());
        call.resolve(ret);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Throwable t) {
            call.reject("无法打开通知使用权设置页：" + t.getMessage());
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        BillEventBus.setSink(new BillEventBus.Sink() {
            @Override
            public void onEvent(Map<String, Object> data) {
                try {
                    notifyListeners("billNotification", toJs(data));
                } catch (Throwable ignored) {
                }
            }
        });
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        BillEventBus.setSink(null);
        call.resolve();
    }

    @PluginMethod
    public void drainPending(PluginCall call) {
        JSObject ret = new JSObject();
        JSArray arr = new JSArray();
        List<Map<String, Object>> list = BillEventBus.drainQueue();
        for (Map<String, Object> d : list) {
            arr.put(toJs(d));
        }
        ret.put("events", arr);
        call.resolve(ret);
    }

    @Override
    protected void handleOnDestroy() {
        BillEventBus.setSink(null);
        super.handleOnDestroy();
    }
}
