package com.liqioks.bookkeeping;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;

final class BookkeepingDatabase extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "bookkeeping.db";
    private static final int DATABASE_VERSION = 1;

    BookkeepingDatabase(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase database) {
        database.execSQL("CREATE TABLE entries ("
                + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                + "amount_cents INTEGER NOT NULL, "
                + "type TEXT NOT NULL, "
                + "category TEXT NOT NULL, "
                + "note TEXT NOT NULL, "
                + "created_at TEXT NOT NULL)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase database, int oldVersion, int newVersion) {
    }

    long addEntry(long amountCents, String type, String category, String note) {
        ContentValues values = new ContentValues();
        values.put("amount_cents", amountCents);
        values.put("type", type);
        values.put("category", category);
        values.put("note", note);
        values.put("created_at", new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US).format(new Date()));
        return getWritableDatabase().insertOrThrow("entries", null, values);
    }

    ArrayList<Entry> getEntriesForMonth(String month) {
        ArrayList<Entry> entries = new ArrayList<>();
        try (Cursor cursor = getReadableDatabase().query(
                "entries",
                new String[]{"amount_cents", "type", "category", "note", "created_at"},
                "substr(created_at, 1, 7) = ?",
                new String[]{month},
                null,
                null,
                "created_at DESC, id DESC")) {
            while (cursor.moveToNext()) {
                entries.add(new Entry(
                        cursor.getLong(0),
                        cursor.getString(1),
                        cursor.getString(2),
                        cursor.getString(3),
                        cursor.getString(4)));
            }
        }
        return entries;
    }

    long getMonthlyTotal(String month, String type) {
        try (Cursor cursor = getReadableDatabase().rawQuery(
                "SELECT COALESCE(SUM(amount_cents), 0) FROM entries "
                        + "WHERE substr(created_at, 1, 7) = ? AND type = ?",
                new String[]{month, type})) {
            return cursor.moveToFirst() ? cursor.getLong(0) : 0;
        }
    }

    static final class Entry {
        final long amountCents;
        final String type;
        final String category;
        final String note;
        final String createdAt;

        Entry(long amountCents, String type, String category, String note, String createdAt) {
            this.amountCents = amountCents;
            this.type = type;
            this.category = category;
            this.note = note;
            this.createdAt = createdAt;
        }
    }
}
