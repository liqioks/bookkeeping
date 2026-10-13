package com.dagongr.ledger;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * 权限异常日志（对应优化方案 §10 PermissionLogger）。
 *
 * 本地记录，不上传网络、不记录交易数据、不记录页面文本。
 * 最多保留 {@link #MAX_LOGS} 条。
 */
public final class PermissionLogger {

    private static final String SP_NAME = "bill_permission_log";
    private static final String KEY = "logs";
    private static final int MAX_LOGS = 1000;

    private PermissionLogger() {
    }

    public static void log(Context ctx, String event, PermissionState state) {
        if (ctx == null) return;
        try {
            JSONObject o = new JSONObject();
            o.put("time", System.currentTimeMillis());
            o.put("event", event == null ? "" : event);
            o.put("permissionState", state == null ? "UNKNOWN" : state.name());
            o.put("appVersion", appVersion(ctx));
            o.put("androidVersion", Build.VERSION.RELEASE);
            o.put("sdkInt", Build.VERSION.SDK_INT);
            o.put("manufacturer", Build.MANUFACTURER);
            o.put("rom", Build.DISPLAY);
            o.put("installSource", installSource(ctx));

            SharedPreferences sp = ctx.getSharedPreferences(SP_NAME, Context.MODE_PRIVATE);
            String raw = sp.getString(KEY, "");
            JSONArray arr = raw == null || raw.isEmpty() ? new JSONArray() : new JSONArray(raw);
            arr.put(o);
            // 只保留最近 MAX_LOGS 条
            while (arr.length() > MAX_LOGS) {
                arr.remove(0);
            }
            sp.edit().putString(KEY, arr.toString()).apply();
        } catch (Throwable ignored) {
        }
    }

    private static String appVersion(Context ctx) {
        try {
            return ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName;
        } catch (Throwable t) {
            return "";
        }
    }

    private static String installSource(Context ctx) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                return ctx.getPackageManager()
                        .getInstallSourceInfo(ctx.getPackageName())
                        .getInstallingPackageName();
            }
        } catch (Throwable ignored) {
        }
        try {
            //noinspection deprecation
            return ctx.getPackageManager().getInstallerPackageName(ctx.getPackageName());
        } catch (Throwable t) {
            return "";
        }
    }
}
