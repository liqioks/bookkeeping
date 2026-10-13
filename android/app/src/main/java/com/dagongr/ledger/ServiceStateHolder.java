package com.dagongr.ledger;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * 记录通知监听服务的真实运行状态（对应优化方案 §8 ServiceStateHolder）。
 *
 * 由 {@link BillNotificationListener} 在 onListenerConnected / onListenerDisconnected 回调里维护。
 * 用静态变量 + SharedPreferences 持久化「最近一次连接时间」，
 * 以便区分「刚启动还没连上」和「曾经连上、现在断了（疑似被系统限制/杀死）」。
 */
public final class ServiceStateHolder {

    private static final String SP_NAME = "bill_service_state";
    private static final String KEY_CONNECTED_AT = "last_connected_at";

    private static volatile boolean connected = false;
    private static volatile long connectedAt = 0L;
    private static volatile long disconnectedAt = 0L;

    private ServiceStateHolder() {
    }

    public static void onConnected(Context ctx) {
        connected = true;
        connectedAt = System.currentTimeMillis();
        if (ctx != null) {
            try {
                ctx.getSharedPreferences(SP_NAME, Context.MODE_PRIVATE)
                        .edit().putLong(KEY_CONNECTED_AT, connectedAt).apply();
            } catch (Throwable ignored) {
            }
        }
    }

    public static void onDisconnected() {
        connected = false;
        disconnectedAt = System.currentTimeMillis();
    }

    public static boolean isConnected() {
        return connected;
    }

    public static long getConnectedAt() {
        return connectedAt;
    }

    public static long getDisconnectedAt() {
        return disconnectedAt;
    }

    /** 是否曾经连接成功过（含跨进程重启的历史记录） */
    public static boolean everConnected(Context ctx) {
        if (connectedAt > 0) return true;
        if (ctx == null) return false;
        try {
            SharedPreferences sp = ctx.getSharedPreferences(SP_NAME, Context.MODE_PRIVATE);
            return sp.getLong(KEY_CONNECTED_AT, 0L) > 0L;
        } catch (Throwable t) {
            return false;
        }
    }
}
