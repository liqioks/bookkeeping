package com.dagongr.ledger;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

/**
 * 监听支付类 App 的通知，把标题 / 正文原样转发给页面去解析。
 *
 * 这里只做「粗筛」——按包名过滤掉绝大多数无关通知，避免把聊天消息也送进 WebView；
 * 真正的金额 / 收支方向 / 商户解析全部放在页面侧（规则可随时更新，不用重新打包）。
 */
public class BillNotificationListener extends NotificationListenerService {

    /** 关注的 App 包名。要新增一家，在这里加包名即可（页面侧还有一份用于显示名称）。 */
    private static final String[] WATCHED = {
            "com.tencent.mm",                 // 微信（含微信支付）
            "com.tencent.mobileqq",           // QQ（QQ 钱包）
            "com.eg.android.AlipayGphone",    // 支付宝
            "com.sankuai.meituan",            // 美团
            "com.sankuai.meituan.takeoutnew", // 美团外卖
            "com.unionpay",                   // 云闪付
            "com.unionpay.tsmservice",
            "com.unionpay.mobile.android.phone",
            "cmb.pb",                         // 招商银行
            "com.icbc",                       // 工商银行
            "com.chinamworld.main",           // 建设银行
            "com.android.bankabc",            // 农业银行
            "com.chinamworld.bocmbci",        // 中国银行
            "com.bankcomm.Bankcomm",          // 交通银行
            "com.yitong.mbank.psbc",          // 邮储银行
            "com.pingan.paces.ccms",          // 平安银行
            "cmbc.com.cn",                    // 民生银行
            "cn.com.spdb.mobilebank.per",     // 浦发银行
            "com.cgbchina.xpt",               // 广发银行
            "com.android.cebbank",            // 光大银行
            "com.bank.ecitic",                // 中信银行
            "com.allinfinance.yillionb2c"     // 银联商务类
    };

    private static boolean watched(String pkg) {
        if (pkg == null) return false;
        for (String w : WATCHED) {
            if (w.equals(pkg)) return true;
        }
        return false;
    }

    private static String str(CharSequence c) {
        return c == null ? "" : c.toString();
    }

    @Override
    public void onCreate() {
        super.onCreate();
        BillEventBus.init(getApplicationContext());
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        BillEventBus.init(getApplicationContext());
        BillEventBus.setConnected(true);
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        BillEventBus.setConnected(false);
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            if (sbn == null) return;
            String pkg = sbn.getPackageName();
            if (!watched(pkg)) return;
            Notification n = sbn.getNotification();
            if (n == null || n.extras == null) return;
            Bundle ex = n.extras;

            String title = str(ex.getCharSequence(Notification.EXTRA_TITLE));
            String text = str(ex.getCharSequence(Notification.EXTRA_TEXT));
            String big = str(ex.getCharSequence(Notification.EXTRA_BIG_TEXT));
            String sub = str(ex.getCharSequence(Notification.EXTRA_SUB_TEXT));
            String info = str(ex.getCharSequence(Notification.EXTRA_INFO_TEXT));
            String summary = str(ex.getCharSequence(Notification.EXTRA_SUMMARY_TEXT));

            StringBuilder sb = new StringBuilder();
            sb.append(title).append(' ').append(sub).append(' ').append(text)
              .append(' ').append(big).append(' ').append(info).append(' ').append(summary);
            // 有些转发的通知把正文放在多行文本 / 消息数组里
            try {
                CharSequence[] lines = ex.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
                if (lines != null) {
                    for (CharSequence c : lines) sb.append(' ').append(str(c));
                }
            } catch (Throwable ignored) {
            }
            try {
                android.os.Parcelable[] msgs = ex.getParcelableArray(Notification.EXTRA_MESSAGES);
                if (msgs != null) {
                    for (android.os.Parcelable p : msgs) {
                        if (p instanceof android.os.Bundle) {
                            sb.append(' ').append(str(((android.os.Bundle) p).getCharSequence("text")));
                        }
                    }
                }
            } catch (Throwable ignored) {
            }

            String full = sb.toString().replaceAll("\\s+", " ").trim();
            if (full.isEmpty()) return;

            BillEventBus.emit(pkg, title, text, big, full, sbn.getPostTime());
        } catch (Throwable ignored) {
            // 通知解析失败不应影响系统
        }
    }
}
