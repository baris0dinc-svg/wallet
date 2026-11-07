package app.wallet;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Telephony;
import android.telephony.SmsMessage;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/** Gelen SMS'lerden tutar içerenleri kuyruğa alır; ayrıştırma web tarafında yapılır. */
public class SmsIn extends BroadcastReceiver {
    static final Pattern TX = Pattern.compile("(?i)(\\d[\\d.,]*\\s?(TL|TRY|₺|USD|EUR))|((TL|TRY|₺)\\s?\\d)");

    @Override
    public void onReceive(Context c, Intent i) {
        if (!MainActivity.prefs(c).getBoolean("smsOn", false)) return;
        SmsMessage[] ms;
        try { ms = Telephony.Sms.Intents.getMessagesFromIntent(i); } catch (Exception e) { return; }
        if (ms == null || ms.length == 0) return;
        Map<String, StringBuilder> body = new LinkedHashMap<>();
        Map<String, Long> when = new LinkedHashMap<>();
        for (SmsMessage m : ms) {
            if (m == null) continue;
            String from = m.getDisplayOriginatingAddress();
            if (from == null) from = "";
            if (!body.containsKey(from)) { body.put(from, new StringBuilder()); when.put(from, m.getTimestampMillis()); }
            body.get(from).append(m.getDisplayMessageBody());
        }
        int n = 0;
        for (Map.Entry<String, StringBuilder> e : body.entrySet()) {
            String text = e.getValue().toString();
            if (!TX.matcher(text).find()) continue;
            queue(c, e.getKey(), text, System.currentTimeMillis(), "sms");
            n++;
            String first = text.length() > 90 ? text.substring(0, 90) + "…" : text;
            Reminders.show(c, 5000 + (int) (System.currentTimeMillis() % 1000), "Banka işlemi algılandı · " + e.getKey(), first + "\nWallet’ta onaylamak için dokun.");
        }
        if (n > 0) MainActivity.notifyJs("window.walletSms&&window.walletSms()");
    }

    static synchronized void queue(Context c, String from, String text, long ts, String src) {
        SharedPreferences p = MainActivity.prefs(c);
        try {
            JSONArray a = new JSONArray(p.getString("smsQ", "[]"));
            JSONObject o = new JSONObject();
            o.put("id", "r" + ts + "_" + Integer.toHexString(text.hashCode()));
            o.put("from", from);
            o.put("body", text);
            o.put("ts", ts);
            o.put("src", src);
            a.put(o);
            JSONArray out = new JSONArray();
            for (int k = Math.max(0, a.length() - 200); k < a.length(); k++) out.put(a.get(k));
            p.edit().putString("smsQ", out.toString()).apply();
        } catch (Exception ignored) { }
    }

    static synchronized void ack(Context c, String idsJson) {
        SharedPreferences p = MainActivity.prefs(c);
        try {
            JSONArray ids = new JSONArray(idsJson);
            java.util.HashSet<String> rm = new java.util.HashSet<>();
            for (int k = 0; k < ids.length(); k++) rm.add(ids.getString(k));
            JSONArray a = new JSONArray(p.getString("smsQ", "[]")), out = new JSONArray();
            for (int k = 0; k < a.length(); k++) { JSONObject o = a.getJSONObject(k); if (!rm.contains(o.optString("id"))) out.put(o); }
            p.edit().putString("smsQ", out.toString()).apply();
        } catch (Exception ignored) { }
    }
}
