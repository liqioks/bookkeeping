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
}
