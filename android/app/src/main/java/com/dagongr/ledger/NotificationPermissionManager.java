package com.dagongr.ledger;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

/**
 * 权限状态统一管理（对应优化方案 §4 AccessibilityPermissionManager + §9 覆盖安装检测）。
 *
 * 集中处理：
 *   1. 权限检测（委托 {@link PermissionChecker}）
 *   2. 版本变化检测（覆盖安装后主动重新检查）
 *   3. 前台检测 → 异常时引导进入 {@link PermissionRecoveryActivity}
 *
 * 不修改自动记账核心逻辑；权限判断/恢复流程统一从这里走。
 */
public final class NotificationPermissionManager {

    private static final String SP_NAME = "bill_permission_mgr";
    private static final String KEY_LAST_VERSION = "last_version_code";
    private static final String KEY_DISMISS_AT = "last_dismiss_at";
    private static final long DISMISS_WINDOW_MS = 24 * 60 * 60 * 1000L; // 24 小时内不再自动弹

    private NotificationPermissionManager() {
    }

    /**
     * MainActivity.onResume() 时调用。
     * 每次进入前台检测权限状态，异常时（未被打扰拦截）引导进入恢复页。
     */
    public static void onForeground(Activity activity) {
        if (activity == null) return;
        Context ctx = activity.getApplicationContext();

        detectVersionChange(ctx);

        PermissionState state = PermissionChecker.check(ctx);
        if (state == PermissionState.ENABLED) {
            return; // 正常，不打扰
        }

        PermissionLogger.log(ctx, "foreground_check", state);

        if (isDismissed(ctx)) {
            return; // 用户刚点了「稍后处理」，本次窗口内不再弹
        }

        PermissionRecoveryActivity.start(activity, state);
    }

    /** 覆盖安装后版本变化 → 记录日志（辅助发现问题，不假设一定失效） */
    private static void detectVersionChange(Context ctx) {
        try {
            int current = currentVersionCode(ctx);
            SharedPreferences sp = ctx.getSharedPreferences(SP_NAME, Context.MODE_PRIVATE);
            int last = sp.getInt(KEY_LAST_VERSION, -1);
            if (last != -1 && last != current) {
                PermissionLogger.log(ctx, "version_changed", PermissionChecker.check(ctx));
            }
            sp.edit().putInt(KEY_LAST_VERSION, current).apply();
        } catch (Throwable ignored) {
        }
    }

    private static int currentVersionCode(Context ctx) {
        try {
            PackageInfo pi = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            return pi.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            return -1;
        }
    }

    /** 用户点「稍后处理」后调用 */
    public static void markDismissed(Context ctx) {
        if (ctx == null) return;
        try {
            ctx.getSharedPreferences(SP_NAME, Context.MODE_PRIVATE)
                    .edit().putLong(KEY_DISMISS_AT, System.currentTimeMillis()).apply();
        } catch (Throwable ignored) {
        }
    }

    private static boolean isDismissed(Context ctx) {
        try {
            long t = ctx.getSharedPreferences(SP_NAME, Context.MODE_PRIVATE)
                    .getLong(KEY_DISMISS_AT, 0L);
            return t > 0 && (System.currentTimeMillis() - t) < DISMISS_WINDOW_MS;
        } catch (Throwable t) {
            return false;
        }
    }
}
