package app.wallet;

import android.app.Notification;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Banka uygulamalarının bildirimlerinden tutar içerenleri SMS kuyruğuna ekler; ayrıştırma web tarafında yapılır.
 * Yalnızca kullanıcı açtıysa ve uygulama adı/paketi banka anahtar kelimelerinden birini içeriyorsa çalışır.
 */
public class NotifIn extends NotificationListenerService {
    static final String DEFAULT_KW = "bank,banka,garanti,akbank,ykb,yapikredi,iscep,isbank,ziraat,vakif,halkbank,enpara,finansbank,qnb,teb,deniz,ingbank,ingmobil,kuveyt,albaraka,papara,odeabank,fibabanka,sekerbank,anadolubank,hsbc,burgan,aktifbank,emlak,tosla,ininal,walletnfcrel";
    private static final Map<String, Long> recent = new LinkedHashMap<>();

    @Override
    public void onListenerConnected() { Log.i("WalletNotif", "dinleyici bağlandı"); }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            SharedPreferences p = MainActivity.prefs(this);
            String pkg = sbn.getPackageName();
            Log.i("WalletNotif", "bildirim: " + pkg + " açık=" + p.getBoolean("ntfOn", false));
            if (!p.getBoolean("ntfOn", false)) return;
            if (pkg == null || pkg.equals(getPackageName())) return;
            Notification n = sbn.getNotification();
            if (n == null || (n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
            String label = label(pkg);
            if (!match(p.getString("ntfKw", DEFAULT_KW), pkg, label)) { Log.i("WalletNotif", "banka değil: " + pkg + " / " + label); return; }
            Bundle x = n.extras;
            if (x == null) return;
            CharSequence title = x.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence text = x.getCharSequence(Notification.EXTRA_TEXT);
            CharSequence big = x.getCharSequence(Notification.EXTRA_BIG_TEXT);
            String body = ((title != null ? title + " " : "") + (big != null ? big : (text != null ? text : ""))).replaceAll("\\s+", " ").trim();
            if (body.length() < 12 || !SmsIn.TX.matcher(body).find()) { Log.i("WalletNotif", "tutar yok: " + body.length()); return; }
            long now = System.currentTimeMillis();
            String key = pkg + "|" + body;
            synchronized (recent) {
                Long t = recent.get(key);
                if (t != null && now - t < 30 * 60000L) return;
                recent.put(key, now);
                Iterator<String> it = recent.keySet().iterator();
                while (recent.size() > 60 && it.hasNext()) { it.next(); it.remove(); }
            }
            SmsIn.queue(this, label, body, now, "app");
            Log.i("WalletNotif", "kuyruğa alındı: " + label);
            MainActivity.notifyJs("window.walletSms&&window.walletSms()");
        } catch (Exception e) { Log.w("WalletNotif", "hata", e); }
    }

    private String label(String pkg) {
        try {
            PackageManager pm = getPackageManager();
            CharSequence l = pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0));
            if (l != null && l.length() > 0) return l.toString();
        } catch (Exception ignored) { }
        return pkg;
    }

    static boolean match(String kws, String pkg, String label) {
        String a = pkg.toLowerCase(), b = label.toLowerCase(java.util.Locale.ROOT)
                .replace('ı', 'i').replace('ş', 's').replace('ğ', 'g').replace('ü', 'u').replace('ö', 'o').replace('ç', 'c');
        for (String k : (kws == null || kws.isEmpty() ? DEFAULT_KW : kws).split(",")) {
            k = k.trim().toLowerCase();
            if (k.length() < 2) continue;
            if (a.contains(k)) return true;
            if (k.length() >= 4 && b.contains(k)) return true;
        }
        return false;
    }
}
