package com.dagongr.ledger;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

/**
 * 自动记账权限恢复引导页（对应优化方案 §4 PermissionRecoveryActivity + §7）。
 *
 * 按权限状态显示不同引导：
 *   DISABLED —— 引导开启「通知使用权」
 *   BLOCKED  —— 引导解除系统限制（进入应用详情 → 允许受限制设置）
 *   UNKNOWN  —— 提供恢复入口 + 重新检测
 *
 * 用户在系统设置里操作后返回本页，会自动重新检测；恢复成功则自动关闭。
 * 恢复动作由用户在系统设置里完成，App 不尝试自动绕过权限。
 */
public class PermissionRecoveryActivity extends AppCompatActivity {

    public static final String EXTRA_STATE = "perm_state";

    private static final int COLOR_PRIMARY = 0xFF4A93D4;
    private static final int COLOR_INK = 0xFF3E4A57;
    private static final int COLOR_SOFT = 0xFF7C8A99;
    private static final int COLOR_BG = 0xFFEEF5FC;
    private static final int COLOR_WARN = 0xFFE8743B;
    private static final int COLOR_CARD = 0xFFFFFFFF;

    private PermissionState state = PermissionState.UNKNOWN;

    private TextView statusText;
    private TextView descText;
    private LinearLayout actionsBox;

    public static void start(android.app.Activity from, PermissionState st) {
        if (from == null) return;
        try {
            Intent i = new Intent(from, PermissionRecoveryActivity.class);
            i.putExtra(EXTRA_STATE, st.name());
            from.startActivity(i);
        } catch (Throwable ignored) {
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String s = getIntent().getStringExtra(EXTRA_STATE);
        if (s != null) {
            try { state = PermissionState.valueOf(s); } catch (Throwable ignored) { }
        }
        buildUi();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // 从系统设置返回后自动重新检测；恢复成功则自动关闭
        PermissionState now = PermissionChecker.check(getApplicationContext());
        if (now == PermissionState.ENABLED) {
            PermissionLogger.log(getApplicationContext(), "recovered", now);
            finish();
            return;
        }
        if (now != state) {
            state = now;
            refreshUi();
        }
    }

    private void buildUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(COLOR_BG);
        scroll.setFillViewport(true);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(24), dp(48), dp(24), dp(24));
        root.setGravity(Gravity.CENTER_HORIZONTAL);

        TextView title = new TextView(this);
        title.setText("自动记账");
        title.setTextColor(COLOR_INK);
        title.setTextSize(22);
        title.setTypeface(null, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        root.addView(title);

        statusText = new TextView(this);
        statusText.setTextColor(COLOR_WARN);
        statusText.setTextSize(16);
        statusText.setTypeface(null, Typeface.BOLD);
        statusText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        sp.topMargin = dp(16);
        root.addView(statusText, sp);

        descText = new TextView(this);
        descText.setTextColor(COLOR_SOFT);
        descText.setTextSize(15);
        descText.setLineSpacing(dp(4), 1.0f);
        descText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams dp2 = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        dp2.topMargin = dp(12);
        root.addView(descText, dp2);

        actionsBox = new LinearLayout(this);
        actionsBox.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams ap = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ap.topMargin = dp(28);
        root.addView(actionsBox, ap);

        scroll.addView(root);
        setContentView(scroll);

        refreshUi();
    }

    private void refreshUi() {
        if (statusText == null || descText == null || actionsBox == null) return;
        actionsBox.removeAllViews();

        switch (state) {
            case DISABLED:
                statusText.setText("自动记账已暂停");
                descText.setText("未授予「通知使用权」，自动记账无法读取支付通知。\n请在系统设置里勾选「小账本 · 自动记账」后返回。");
                addPrimary("立即恢复", new View.OnClickListener() {
                    @Override public void onClick(View v) { openNotificationSettings(); }
                });
                addSecondary("稍后处理", new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        NotificationPermissionManager.markDismissed(getApplicationContext());
                        finish();
                    }
                });
                break;

            case BLOCKED:
                statusText.setText("自动记账权限受到系统限制");
                descText.setText("检测到已授权但服务未连接，疑似被系统限制。\n请按顺序操作：\n1. 打开应用详情\n2. 允许「受限制的设置」\n3. 返回重新开启通知使用权");
                addPrimary("打开应用详情", new View.OnClickListener() {
                    @Override public void onClick(View v) { openAppDetails(); }
                });
                addSecondary("重新检测", new View.OnClickListener() {
                    @Override public void onClick(View v) { recheck(); }
                });
                addSecondary("稍后处理", new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        NotificationPermissionManager.markDismissed(getApplicationContext());
                        finish();
                    }
                });
                break;

            case UNKNOWN:
            default:
                statusText.setText("自动记账状态异常");
                descText.setText("无法确定通知监听状态，请尝试重新开启「通知使用权」。\n若仍无法恢复，请重启 App 后重试。");
                addPrimary("去开启通知使用权", new View.OnClickListener() {
                    @Override public void onClick(View v) { openNotificationSettings(); }
                });
                addSecondary("重新检测", new View.OnClickListener() {
                    @Override public void onClick(View v) { recheck(); }
                });
                addSecondary("稍后处理", new View.OnClickListener() {
                    @Override public void onClick(View v) {
                        NotificationPermissionManager.markDismissed(getApplicationContext());
                        finish();
                    }
                });
                break;
        }
    }

    private void addPrimary(String label, View.OnClickListener l) {
        Button b = button(label, true);
        b.setOnClickListener(l);
        actionsBox.addView(b);
    }

    private void addSecondary(String label, View.OnClickListener l) {
        Button b = button(label, false);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(52));
        lp.topMargin = dp(12);
        b.setLayoutParams(lp);
        b.setOnClickListener(l);
        actionsBox.addView(b);
    }

    private Button button(String label, boolean primary) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(16);
        b.setAllCaps(false);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(52));
        b.setLayoutParams(lp);
        if (primary) {
            b.setTextColor(Color.WHITE);
            b.setBackgroundColor(COLOR_PRIMARY);
        } else {
            b.setTextColor(COLOR_PRIMARY);
            b.setBackgroundColor(COLOR_CARD);
        }
        return b;
    }

    private void openNotificationSettings() {
        try {
            startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS));
        } catch (Throwable t) {
            try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Throwable ignored) { }
        }
    }

    private void openAppDetails() {
        try {
            Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            i.setData(Uri.parse("package:" + getPackageName()));
            startActivity(i);
        } catch (Throwable t) {
            try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Throwable ignored) { }
        }
    }

    private void recheck() {
        PermissionState now = PermissionChecker.check(getApplicationContext());
        if (now == PermissionState.ENABLED) {
            PermissionLogger.log(getApplicationContext(), "recovered_by_recheck", now);
            finish();
            return;
        }
        state = now;
        refreshUi();
    }

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density + 0.5f);
    }
}
