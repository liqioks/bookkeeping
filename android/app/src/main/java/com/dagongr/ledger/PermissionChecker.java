package com.dagongr.ledger;

import android.content.Context;
import android.provider.Settings;
import android.text.TextUtils;

/**
 * 通知使用权检测（对应优化方案 §4 PermissionChecker）。
 *
 * 把「是否已授权 + 服务是否真实连接」映射为四态 {@link PermissionState}。
 */
public final class PermissionChecker {

    private PermissionChecker() {
    }

    /** 是否已获得「通知使用权」 */
    public static boolean hasNotificationAccess(Context ctx) {
        if (ctx == null) return false;
        try {
            String flat = Settings.Secure.getString(
                    ctx.getContentResolver(), "enabled_notification_listeners");
            if (TextUtils.isEmpty(flat)) return false;
            return flat.contains(ctx.getPackageName());
        } catch (Throwable t) {
            return false;
        }
    }

    /**
     * 判断当前权限状态：
     *   ENABLED  —— 已授权且服务已连接
     *   DISABLED —— 未授权（未开启 / 被关闭）
     *   BLOCKED  —— 已授权但服务未连接，且历史上曾连接过（疑似系统限制 / 服务被杀）
     *   UNKNOWN  —— 已授权但从未连接过（刚启动尚未回调，或检测不一致）
     */
    public static PermissionState check(Context ctx) {
        boolean granted;
        try {
            granted = hasNotificationAccess(ctx);
        } catch (Throwable t) {
            return PermissionState.UNKNOWN;
        }

        if (!granted) {
            return PermissionState.DISABLED;
        }

        if (ServiceStateHolder.isConnected()) {
            return PermissionState.ENABLED;
        }

        // 已授权但服务没连上
        if (ServiceStateHolder.everConnected(ctx)) {
            return PermissionState.BLOCKED;
        }
        return PermissionState.UNKNOWN;
    }
}
