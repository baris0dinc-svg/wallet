package app.wallet;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

/** Fatura ve ödeme hatırlatmaları: uygulama kapalıyken de telefonun alarmıyla bildirim gösterir. */
public class Reminders extends BroadcastReceiver {
    static final String CHANNEL = "odeme";
    static final String ACTION = "app.wallet.REMIND";

    private static PendingIntent pending(Context c, int n, String title, String body, int flags) {
        Intent i = new Intent(c, Reminders.class).setAction(ACTION);
        if (title != null) { i.putExtra("id", n); i.putExtra("title", title); i.putExtra("body", body); }
        return PendingIntent.getBroadcast(c, n, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Eski planı iptal eder, yenisini kurar ve telefon yeniden başlarsa diye saklar. */
    static synchronized void apply(Context c, String json) {
        SharedPreferences p = MainActivity.prefs(c);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        int old = p.getInt("nAlarms", 0);
        for (int i = 1; i <= old; i++) {
            PendingIntent pi = pending(c, i, null, null, PendingIntent.FLAG_NO_CREATE);
            if (pi != null && am != null) { am.cancel(pi); pi.cancel(); }
        }
        int n = 0;
        try {
            JSONArray a = new JSONArray(json == null || json.isEmpty() ? "[]" : json);
            long now = System.currentTimeMillis();
            for (int i = 0; i < a.length() && n < 60; i++) {
                JSONObject o = a.getJSONObject(i);
                long at = o.optLong("at", 0);
                if (at <= now) continue;
                n++;
                PendingIntent pi = pending(c, n, o.optString("title", "Wallet"), o.optString("body", ""), PendingIntent.FLAG_UPDATE_CURRENT);
                if (am != null) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (Exception ignored) { }
        p.edit().putString("plan", json == null ? "[]" : json).putInt("nAlarms", n).apply();
    }

    static boolean enabled(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        return nm != null && nm.areNotificationsEnabled();
    }

    static void show(Context c, int id, String title, String body) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        nm.createNotificationChannel(new NotificationChannel(CHANNEL, "Ödeme hatırlatıcısı", NotificationManager.IMPORTANCE_DEFAULT));
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent cp = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification no = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(R.drawable.ic_notif)
                .setLargeIcon(android.graphics.drawable.Icon.createWithResource(c, R.drawable.notif_large))
                .setColor(0xFF0E6B58)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setContentIntent(cp)
                .setAutoCancel(true)
                .build();
        try { nm.notify(id, no); } catch (Exception ignored) { }
    }

    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if (ACTION.equals(a)) {
            show(c, 100 + i.getIntExtra("id", 0), i.getStringExtra("title"), i.getStringExtra("body"));
        } else if (Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)) {
            apply(c, MainActivity.prefs(c).getString("plan", "[]"));
            if (Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)) refreshIcons(c);
        }
    }

    /** 4.31: güncellemeden önce gösterilmiş bildirimler eski (zil) simgeyle kalmasın: ekrandakileri Wallet logosuyla yeniden yaz. */
    static void refreshIcons(Context c) {
        try {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            if (nm == null) return;
            SharedPreferences p = MainActivity.prefs(c);
            if (p.getInt("notifIconV", 0) >= 2) return;
            for (android.service.notification.StatusBarNotification s : nm.getActiveNotifications()) {
                try {
                    Notification n = Notification.Builder.recoverBuilder(c, s.getNotification())
                            .setSmallIcon(R.drawable.ic_notif)
                            .setLargeIcon(android.graphics.drawable.Icon.createWithResource(c, R.drawable.notif_large))
                            .setColor(0xFF0E6B58)
                            .setOnlyAlertOnce(true)
                            .build();
                    nm.notify(s.getTag(), s.getId(), n);
                } catch (Exception ignored) { }
            }
            p.edit().putInt("notifIconV", 2).apply();
        } catch (Exception ignored) { }
    }
}
