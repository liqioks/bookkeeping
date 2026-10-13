package com.dagongr.ledger;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 必须在 super.onCreate 之前注册自定义插件
        registerPlugin(BillListenerPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        // 每次进入前台检测「通知使用权」状态；异常时引导进入恢复页（不修改自动记账核心逻辑）
        NotificationPermissionManager.onForeground(this);
    }
}
