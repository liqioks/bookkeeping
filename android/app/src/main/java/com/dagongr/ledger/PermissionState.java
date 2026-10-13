package com.dagongr.ledger;

/**
 * 自动记账权限状态模型（对应优化方案 §3）。
 *
 * 本项目实际使用的是「通知使用权」（NotificationListenerService），
 * 而非无障碍服务（AccessibilityService）——两套权限体系，但状态模型与恢复思路完全一致。
 */
public enum PermissionState {
    /** 权限正常，服务已连接，可运行 */
    ENABLED,
    /** 用户未开启 / 已关闭权限 */
    DISABLED,
    /** 已授权但服务未连接（疑似系统限制 / 服务被杀） */
    BLOCKED,
    /** 检测结果异常或从未连接过，无法确定 */
    UNKNOWN
}
