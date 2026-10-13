package com.liqioks.bookkeeping;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.Insets;
import android.os.Bundle;
import android.os.Build;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.TextView;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final int BACKGROUND = Color.rgb(246, 247, 243);
    private static final int INK = Color.rgb(39, 49, 44);
    private static final int MUTED = Color.rgb(127, 137, 130);
    private static final int GREEN = Color.rgb(39, 134, 106);
    private static final int RED = Color.rgb(210, 100, 82);
    private BookkeepingDatabase database;
    private LinearLayout entriesContainer;
    private TextView incomeTotal;
    private TextView expenseTotal;
    private TextView balanceTotal;
    private String selectedMonth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        database = new BookkeepingDatabase(this);
        selectedMonth = new SimpleDateFormat("yyyy-MM", Locale.US).format(new Date());
        setContentView(buildScreen());
        refreshEntries();
    }

    @Override
    protected void onDestroy() {
        database.close();
        super.onDestroy();
    }

    @SuppressWarnings("deprecation")
    private View buildScreen() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BACKGROUND);
        root.setPadding(dp(22), dp(12), dp(22), dp(14));
        int leftPadding = root.getPaddingLeft();
        int topPadding = root.getPaddingTop();
        int rightPadding = root.getPaddingRight();
        int bottomPadding = root.getPaddingBottom();
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            int topInset;
            int bottomInset;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Insets systemBars = insets.getInsets(android.view.WindowInsets.Type.systemBars());
                topInset = systemBars.top;
                bottomInset = systemBars.bottom;
            } else {
                topInset = insets.getSystemWindowInsetTop();
                bottomInset = insets.getSystemWindowInsetBottom();
            }
            view.setPadding(leftPadding, topPadding + topInset,
                    rightPadding, bottomPadding + bottomInset);
            return insets;
        });

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(0, dp(4), 0, dp(18));
        LinearLayout titleBlock = new LinearLayout(this);
        titleBlock.setOrientation(LinearLayout.VERTICAL);
        TextView title = text("小账本", 25, INK, true);
        TextView subtitle = text("认真生活，也认真记录", 13, MUTED, false);
        titleBlock.addView(title);
        titleBlock.addView(subtitle);
        header.addView(titleBlock, new LinearLayout.LayoutParams(0, -2, 1));
        TextView month = text(new SimpleDateFormat("yyyy年M月", Locale.CHINA).format(new Date()), 14, GREEN, true);
        month.setPadding(dp(13), dp(9), dp(13), dp(9));
        month.setBackground(rounded(Color.rgb(231, 241, 235), 18));
        header.addView(month);
        root.addView(header);

        LinearLayout summary = new LinearLayout(this);
        summary.setOrientation(LinearLayout.VERTICAL);
        summary.setPadding(dp(20), dp(18), dp(20), dp(18));
        summary.setBackground(rounded(Color.WHITE, 20));
        TextView summaryTitle = text("本月结余", 13, MUTED, false);
        summary.addView(summaryTitle);
        balanceTotal = text("¥0.00", 32, INK, true);
        LinearLayout.LayoutParams balanceParams = new LinearLayout.LayoutParams(-2, -2);
        balanceParams.topMargin = dp(4);
        balanceParams.bottomMargin = dp(18);
        summary.addView(balanceTotal, balanceParams);
        View divider = new View(this);
        divider.setBackgroundColor(Color.rgb(239, 241, 237));
        summary.addView(divider, new LinearLayout.LayoutParams(-1, dp(1)));
        LinearLayout totals = new LinearLayout(this);
        totals.setPadding(0, dp(14), 0, 0);
        totals.addView(totalColumn("收入", "¥0.00", GREEN), new LinearLayout.LayoutParams(0, -2, 1));
        totals.addView(totalColumn("支出", "¥0.00", RED), new LinearLayout.LayoutParams(0, -2, 1));
        incomeTotal = (TextView) ((LinearLayout) totals.getChildAt(0)).getChildAt(1);
        expenseTotal = (TextView) ((LinearLayout) totals.getChildAt(1)).getChildAt(1);
        summary.addView(totals);
        root.addView(summary);

        LinearLayout listHeader = new LinearLayout(this);
        listHeader.setGravity(Gravity.CENTER_VERTICAL);
        listHeader.setPadding(dp(2), dp(22), dp(2), dp(10));
        TextView listTitle = text("收支明细", 18, INK, true);
        listHeader.addView(listTitle, new LinearLayout.LayoutParams(0, -2, 1));
        listHeader.addView(text("每一笔都算数", 12, MUTED, false));
        root.addView(listHeader);

        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        entriesContainer = new LinearLayout(this);
        entriesContainer.setOrientation(LinearLayout.VERTICAL);
        scrollView.addView(entriesContainer);
        root.addView(scrollView, new LinearLayout.LayoutParams(-1, 0, 1));

        Button addButton = new Button(this);
        addButton.setText("＋  记一笔");
        addButton.setTextSize(16);
        addButton.setTextColor(Color.WHITE);
        addButton.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        addButton.setAllCaps(false);
        addButton.setBackground(rounded(GREEN, 16));
        addButton.setElevation(dp(2));
        addButton.setOnClickListener(view -> showAddEntryDialog());
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(-1, dp(54));
        buttonParams.topMargin = dp(12);
        root.addView(addButton, buttonParams);
        return root;
    }

    private LinearLayout totalColumn(String label, String amount, int color) {
        LinearLayout column = new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        column.addView(text(label, 12, MUTED, false));
        TextView value = text(amount, 17, color, true);
        LinearLayout.LayoutParams valueParams = new LinearLayout.LayoutParams(-2, -2);
        valueParams.topMargin = dp(5);
        column.addView(value, valueParams);
        return column;
    }

    private void refreshEntries() {
        long income = database.getMonthlyTotal(selectedMonth, "收入");
        long expense = database.getMonthlyTotal(selectedMonth, "支出");
        incomeTotal.setText(money(income));
        expenseTotal.setText(money(expense));
        balanceTotal.setText(money(income - expense));
        entriesContainer.removeAllViews();
        java.util.List<BookkeepingDatabase.Entry> entries = database.getEntriesForMonth(selectedMonth);
        if (entries.isEmpty()) {
            TextView empty = text("还没有记账，记下今天的第一笔吧", 14, MUTED, false);
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(dp(12), dp(45), dp(12), dp(45));
            entriesContainer.addView(empty);
            return;
        }
        for (BookkeepingDatabase.Entry entry : entries) {
            entriesContainer.addView(entryRow(entry));
        }
    }

    private View entryRow(BookkeepingDatabase.Entry entry) {
        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dp(13), dp(13), dp(13), dp(13));
        row.setBackground(rounded(Color.WHITE, 15));
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(-1, -2);
        rowParams.bottomMargin = dp(9);
        row.setLayoutParams(rowParams);

        TextView icon = text(entry.type.equals("收入") ? "＋" : "−", 19,
                entry.type.equals("收入") ? GREEN : RED, true);
        icon.setGravity(Gravity.CENTER);
        icon.setBackground(rounded(entry.type.equals("收入")
                ? Color.rgb(232, 244, 237) : Color.rgb(250, 239, 235), 13));
        row.addView(icon, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout details = new LinearLayout(this);
        details.setOrientation(LinearLayout.VERTICAL);
        details.setPadding(dp(12), 0, dp(5), 0);
        details.addView(text(entry.note.isEmpty() ? entry.category : entry.note, 15, INK, true));
        TextView category = text(entry.category + "  ·  " + formatDate(entry.createdAt), 12, MUTED, false);
        LinearLayout.LayoutParams categoryParams = new LinearLayout.LayoutParams(-2, -2);
        categoryParams.topMargin = dp(4);
        details.addView(category, categoryParams);
        row.addView(details, new LinearLayout.LayoutParams(0, -2, 1));
        long signedAmount = entry.type.equals("收入") ? entry.amountCents : -entry.amountCents;
        TextView amount = text((signedAmount > 0 ? "+" : "−") + money(Math.abs(signedAmount)),
                15, signedAmount > 0 ? GREEN : INK, true);
        row.addView(amount);
        return row;
    }

    private void showAddEntryDialog() {
        LinearLayout form = new LinearLayout(this);
        form.setOrientation(LinearLayout.VERTICAL);
        form.setPadding(dp(22), dp(4), dp(22), 0);

        RadioGroup typeGroup = new RadioGroup(this);
        typeGroup.setOrientation(RadioGroup.HORIZONTAL);
        RadioButton expenseOption = radio("支出");
        RadioButton incomeOption = radio("收入");
        expenseOption.setId(View.generateViewId());
        incomeOption.setId(View.generateViewId());
        typeGroup.addView(expenseOption, new RadioGroup.LayoutParams(0, -2, 1));
        typeGroup.addView(incomeOption, new RadioGroup.LayoutParams(0, -2, 1));
        expenseOption.setChecked(true);
        form.addView(typeGroup);

        EditText amountInput = input("金额，例如 28.50", InputType.TYPE_CLASS_NUMBER
                | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        form.addView(amountInput, fieldParams());
        EditText categoryInput = input("分类，例如 餐饮、交通、工资", InputType.TYPE_CLASS_TEXT
                | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        categoryInput.setText("餐饮");
        typeGroup.setOnCheckedChangeListener((group, checkedId) -> {
            String current = categoryInput.getText().toString();
            if (current.equals("餐饮") || current.equals("工资")) {
                categoryInput.setText(checkedId == incomeOption.getId() ? "工资" : "餐饮");
            }
        });
        form.addView(categoryInput, fieldParams());
        EditText noteInput = input("备注（选填）", InputType.TYPE_CLASS_TEXT
                | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        form.addView(noteInput, fieldParams());

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("记一笔")
                .setView(form)
                .setNegativeButton("取消", null)
                .setPositiveButton("保存", null)
                .create();
        dialog.setOnShowListener(ignored -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(view -> {
            String rawAmount = amountInput.getText().toString().trim();
            String category = categoryInput.getText().toString().trim();
            try {
                long cents = new BigDecimal(rawAmount).setScale(2, RoundingMode.HALF_UP)
                        .movePointRight(2).longValueExact();
                if (cents <= 0) {
                    amountInput.setError("请输入大于 0 的有效金额");
                    return;
                }
                if (category.isEmpty()) {
                    categoryInput.setError("请填写分类");
                    return;
                }
                String type = incomeOption.isChecked() ? "收入" : "支出";
                database.addEntry(cents, type, category, noteInput.getText().toString().trim());
                refreshEntries();
                dialog.dismiss();
            } catch (NumberFormatException | ArithmeticException exception) {
                amountInput.setError("请输入大于 0 的有效金额");
            }
        }));
        dialog.show();
    }

    private RadioButton radio(String label) {
        RadioButton button = new RadioButton(this);
        button.setText(label);
        button.setTextSize(15);
        button.setTextColor(INK);
        button.setPadding(dp(4), dp(6), dp(4), dp(6));
        return button;
    }

    private EditText input(String hint, int inputType) {
        EditText editText = new EditText(this);
        editText.setSingleLine(true);
        editText.setTextSize(15);
        editText.setHint(hint);
        editText.setInputType(inputType);
        editText.setPadding(dp(12), 0, dp(12), 0);
        editText.setBackground(rounded(Color.rgb(246, 247, 243), 11));
        return editText;
    }

    private LinearLayout.LayoutParams fieldParams() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, dp(48));
        params.topMargin = dp(10);
        return params;
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView text = new TextView(this);
        text.setText(value);
        text.setTextSize(size);
        text.setTextColor(color);
        if (bold) {
            text.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        }
        return text;
    }

    private GradientDrawable rounded(int color, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(dp(radius));
        return drawable;
    }

    private String formatDate(String value) {
        try {
            Date date = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US).parse(value);
            return new SimpleDateFormat("M月d日 HH:mm", Locale.CHINA).format(date);
        } catch (java.text.ParseException exception) {
            return value;
        }
    }

    private String money(long cents) {
        BigInteger absoluteCents = BigInteger.valueOf(cents).abs();
        BigInteger[] units = absoluteCents.divideAndRemainder(BigInteger.valueOf(100));
        return String.format(Locale.US, "%s¥%,d.%02d", cents < 0 ? "−" : "",
                units[0].longValue(), units[1].intValue());
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
