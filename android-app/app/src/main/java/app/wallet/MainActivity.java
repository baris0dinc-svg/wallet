package app.wallet;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ComponentName;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.provider.Telephony;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.content.res.Configuration;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Iterator;
import java.net.HttpURLConnection;
import java.net.URL;
import java.lang.ref.WeakReference;
import java.nio.charset.StandardCharsets;

/** Wallet web uygulamasını tam ekran bir Android uygulaması olarak açar. */
public class MainActivity extends Activity {
    private static final String HOST = "baris0dinc-svg.github.io";
    private static final String URL_APP = "https://" + HOST + "/wallet/";
    private static final String RATES = "https://finans.truncgil.com/v4/today.json";
    /** Piyasa verisi alınabilecek siteler (başka adrese istek gönderilmez). */
    private static final String[] NET_OK = {"isyatirim.com.tr", "finance.yahoo.com", "api.coingecko.com", "finans.truncgil.com", "tefas.gov.tr", "fundturkey.com.tr"};
    private static final String[] WEB_OK = {"tefas.gov.tr", "fundturkey.com.tr"};
    private static final int FILE_REQ = 7;
    private static final int VOICE_REQ = 8;
    private static final int NOTIF_REQ = 11;
    private static final int SMS_REQ = 12;
    private static WeakReference<MainActivity> live = new WeakReference<>(null);
    private WebView web;
    private ValueCallback<Uri[]> fileCb;
    /** Açılış: sistem açılış ekranı sayfa çizilene kadar kalır; web açılışı bitince çubuk renkleri uygulamanınkine döner. */
    private boolean splashOver = false, pageLoaded = false;
    /** uygulama kısayolundan gelen eylem (exp, inc, trf, voice); sayfa yüklenince web uygulamasına iletilir */
    private String pendIntent = null;
    private final Handler ui = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (prefs(this).getBoolean("secure", false)) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        // yalnızca test derlemesinde (webDebug=true) WebView uzaktan incelenebilir
        if (BuildConfig.WEB_DEBUG) WebView.setWebContentsDebuggingEnabled(true);
        web = new WebView(this);
        // sayfa çizilene kadar WebView saydam: arkadaki açılış zemini (lacivert + logo) görünür, beyaz yanıp sönme olmaz
        web.setBackgroundColor(0);
        setContentView(web);
        pendIntent = intentAction(getIntent());
        // eski bir web sürümü haber vermezse çubuk renkleri yine de düzelir
        ui.postDelayed(new Runnable() { public void run() { endSplash(); } }, 7000);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView v, String url) {
                pageLoaded = true;
                sendIntent();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            /** Telefon belleği azalınca WebView işlemi kapanırsa uygulama çökmez, sayfa yeniden kurulur (veriler cihazda). */
            @Override
            public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                if (v == web) {
                    try { ((android.view.ViewGroup) v.getParent()).removeView(v); } catch (Exception ignored) { }
                    v.destroy();
                    web = null;
                    recreate();
                }
                return true;
            }
        });
        // Yedek ve CSV için "Dosya seç" düğmesi: WebView bunu kendiliğinden açmaz
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Dosya seç"), FILE_REQ);
                } catch (Exception e) {
                    fileCb = null;
                    return false;
                }
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");

        if (state == null || web.restoreState(state) == null) web.loadUrl(URL_APP);
    }

    /** Web açılışı bitti: pencere ve sistem çubukları uygulamanın açık/koyu temasına döner. */
    static String intentAction(Intent i) {
        if (i == null || i.getData() == null || !"wallet".equals(i.getData().getScheme())) return null;
        String a = i.getData().getSchemeSpecificPart();
        if (a != null) a = a.replaceAll("^/+", "");
        return a != null && a.matches("exp|inc|trf|voice") ? a : null;
    }

    private void sendIntent() {
        if (pendIntent == null || !pageLoaded) return;
        js("window.walletIntent&&window.walletIntent('" + pendIntent + "')");
        pendIntent = null;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        String a = intentAction(i);
        if (a != null) { pendIntent = a; sendIntent(); }
    }

    private void endSplash() {
        splashOver = true;
        applyBars();
    }

    private void applyBars() {
        if (!splashOver) return;
        int bg = getColor(R.color.bg);
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(bg);
        getWindow().setBackgroundDrawableResource(R.color.bg);
        if (web != null) web.setBackgroundColor(bg);
        View d = getWindow().getDecorView();
        int f = d.getSystemUiVisibility() & ~(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        if (!night) f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        d.setSystemUiVisibility(f);
    }

    @Override
    public void onConfigurationChanged(Configuration c) {
        super.onConfigurationChanged(c);
        applyBars();
    }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("wallet", Context.MODE_PRIVATE);
    }

    /** Uygulama açıkken arka plandaki bileşenlerin web tarafını uyarması için. */
    static void notifyJs(String code) {
        MainActivity a = live.get();
        if (a != null) a.js(code);
    }

    private void js(final String code) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() { if (web != null) web.evaluateJavascript(code, null); }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        live = new WeakReference<>(null);
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        live = new WeakReference<>(this);
        if (web != null) web.onResume();
        // ayarlardan (bildirim erişimi gibi) dönünce izin durumunu yenile
        js("window.walletPerm&&window.walletPerm()");
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ) {
            if (fileCb != null) fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null;
            return;
        }
        if (req == VOICE_REQ) {
            String t = "";
            if (res == RESULT_OK && data != null) {
                java.util.ArrayList<String> r = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (r != null && !r.isEmpty() && r.get(0) != null) t = r.get(0);
            }
            js("window.walletVoice&&window.walletVoice(" + JSONObject.quote(t) + "," + (res == RESULT_OK ? "''" : "'iptal'") + ")");
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        super.onRequestPermissionsResult(req, perms, results);
        if (req == NOTIF_REQ || req == SMS_REQ) js("window.walletPerm&&window.walletPerm()");
    }

    /** Geri tuşu: önce uygulamadaki açık pencereyi/sayfayı kapatır, en son uygulamadan çıkar. */
    @Override
    public void onBackPressed() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("(window.walletBack&&window.walletBack())?'1':'0'", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String v) {
                if ("\"1\"".equals(v)) return;
                if (web != null && web.canGoBack()) web.goBack(); else finish();
            }
        });
    }

    private File dataFile() { return new File(getFilesDir(), "wallet-data.json"); }

    private static String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
        return new String(b.toByteArray(), StandardCharsets.UTF_8);
    }

    /** İndirilenler klasörüne dosya yazar; uri verilirse o dosyanın üstüne yazar. */
    private Uri writeDownload(String name, String sub, String text, Uri over) throws Exception {
        if (over != null) {
            try (OutputStream o = getContentResolver().openOutputStream(over, "wt")) {
                if (o != null) { o.write(text.getBytes(StandardCharsets.UTF_8)); return over; }
            } catch (Exception ignored) { }
        }
        String lower = name.toLowerCase();
        String mime = lower.endsWith(".json") ? "application/json" : lower.endsWith(".csv") ? "text/csv" : "text/plain";
        ContentValues v = new ContentValues();
        v.put(MediaStore.Downloads.DISPLAY_NAME, name);
        v.put(MediaStore.Downloads.MIME_TYPE, mime);
        v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + (sub != null ? "/" + sub : ""));
        Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
        if (u == null) throw new Exception("yazılamadı");
        try (OutputStream o = getContentResolver().openOutputStream(u)) {
            if (o == null) throw new Exception("yazılamadı");
            o.write(text.getBytes(StandardCharsets.UTF_8));
        }
        return u;
    }

    static boolean hostOk(String host, String[] list) {
        if (host == null) return false;
        host = host.toLowerCase();
        for (String h : list) if (host.equals(h) || host.endsWith("." + h)) return true;
        return false;
    }

    private static String readMax(InputStream in, int max) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) { b.write(buf, 0, n); if (b.size() > max) break; }
        return new String(b.toByteArray(), StandardCharsets.UTF_8);
    }

    private void httpDone(String id, int code, String text) {
        js("window.walletHttp&&window.walletHttp(" + JSONObject.quote(id) + "," + code + "," + (text == null ? "null" : JSONObject.quote(text)) + ")");
    }

    static boolean ntfGranted(Context c) {
        try {
            String flat = Settings.Secure.getString(c.getContentResolver(), "enabled_notification_listeners");
            return flat != null && flat.contains(new ComponentName(c, NotifIn.class).flattenToString());
        } catch (Exception e) { return false; }
    }

    /** Web uygulamasının çağırdığı yerel işlevler. */
    private class Bridge {
        /** Sesle ekle: telefonun ses tanıması var mı */
        @JavascriptInterface
        public String voiceOk() {
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            return i.resolveActivity(getPackageManager()) != null ? "ok" : "no";
        }

        /** Sesle ekle: Android'in ses tanıma penceresini açar; sonuç window.walletVoice(metin) ile döner */
        @JavascriptInterface
        public void voice() {
            runOnUiThread(new Runnable() {
                public void run() {
                    Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "tr-TR");
                    i.putExtra(RecognizerIntent.EXTRA_PROMPT, "Örn. markete 250 lira");
                    i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                    try { startActivityForResult(i, VOICE_REQ); }
                    catch (Exception e) { js("window.walletVoice&&window.walletVoice('','yok')"); }
                }
            });
        }

        /** Web açılış ekranı kapanırken çağrılır. */
        @JavascriptInterface
        public void splashDone() {
            runOnUiThread(new Runnable() { public void run() { endSplash(); } });
        }

        /** Yedek ve CSV dosyalarını İndirilenler klasörüne kaydeder. */
        @JavascriptInterface
        public String save(String name, String text) {
            try { writeDownload(name, null, text, null); return "ok"; } catch (Exception e) { return "err"; }
        }

        /** Tüm verinin uygulama içi kopyası: WebView deposu silinse de veri kaybolmaz. */
        @JavascriptInterface
        public String saveData(String json) {
            try {
                File f = dataFile(), tmp = new File(getFilesDir(), "wallet-data.tmp");
                try (FileOutputStream o = new FileOutputStream(tmp)) {
                    o.write(json.getBytes(StandardCharsets.UTF_8));
                    o.getFD().sync();
                }
                if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) return "err"; }
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface
        public String loadData() {
            File f = dataFile();
            if (!f.exists()) return "";
            try (FileInputStream in = new FileInputStream(f)) { return readAll(in); } catch (Exception e) { return ""; }
        }

        /** Otomatik yedek: İndirilenler/Wallet/Wallet-otomatik-yedek.json (hep aynı dosyanın üstüne). */
        @JavascriptInterface
        public String autoBackup(String json) {
            try {
                SharedPreferences p = prefs(MainActivity.this);
                String old = p.getString("bkUri", null);
                Uri u = writeDownload("Wallet-otomatik-yedek.json", "Wallet", json, old != null ? Uri.parse(old) : null);
                p.edit().putString("bkUri", u.toString()).apply();
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        /** Tüm verileri sil: uygulama içi kopya, otomatik yedek dosyası, hatırlatmalar, ayarlar. */
        @JavascriptInterface
        public String wipe() {
            try {
                dataFile().delete();
                SharedPreferences p = prefs(MainActivity.this);
                String old = p.getString("bkUri", null);
                if (old != null) { try { getContentResolver().delete(Uri.parse(old), null, null); } catch (Exception ignored) { } }
                Reminders.apply(MainActivity.this, "[]");
                p.edit().clear().apply();
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() { getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE); }
                });
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        /** Fatura ve ödeme hatırlatmalarını telefonun alarm planına yazar. */
        @JavascriptInterface
        public String schedule(String json) {
            try { Reminders.apply(MainActivity.this, json); return "ok"; } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface
        public String notifState() {
            if (Build.VERSION.SDK_INT >= 33) {
                if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED) return "granted";
                return prefs(MainActivity.this).getBoolean("asked", false) ? "denied" : "default";
            }
            return Reminders.enabled(MainActivity.this) ? "granted" : "denied";
        }

        @JavascriptInterface
        public void askNotif() {
            prefs(MainActivity.this).edit().putBoolean("asked", true).apply();
            if (Build.VERSION.SDK_INT >= 33) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() { requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, NOTIF_REQ); }
                });
            } else {
                try {
                    Intent i = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
                    i.putExtra("android.provider.extra.APP_PACKAGE", getPackageName());
                    startActivity(i);
                } catch (Exception ignored) { }
            }
        }

        @JavascriptInterface
        public String testNotif() {
            if (!Reminders.enabled(MainActivity.this)) return "err";
            Reminders.show(MainActivity.this, 999, "Wallet hatırlatıcısı çalışıyor", "Ödeme günlerinde bu şekilde bildirim alacaksın.");
            return "ok";
        }

        @JavascriptInterface
        public boolean bioAvail() {
            if (Build.VERSION.SDK_INT < 29) return false;
            try {
                BiometricManager bm = getSystemService(BiometricManager.class);
                return bm != null && bm.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS;
            } catch (Exception e) { return false; }
        }

        @JavascriptInterface
        public void bioAuth() {
            if (Build.VERSION.SDK_INT < 29) return;
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        BiometricPrompt bp = new BiometricPrompt.Builder(MainActivity.this)
                                .setTitle("Wallet kilidi")
                                .setSubtitle("Parmak izin ya da yüzünle aç")
                                .setNegativeButton("PIN gir", getMainExecutor(), new android.content.DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(android.content.DialogInterface d, int w) { js("window.walletBio&&window.walletBio(false)"); }
                                })
                                .build();
                        bp.authenticate(new CancellationSignal(), getMainExecutor(), new BiometricPrompt.AuthenticationCallback() {
                            @Override
                            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult r) { js("window.walletBio&&window.walletBio(true)"); }

                            @Override
                            public void onAuthenticationError(int code, CharSequence msg) { js("window.walletBio&&window.walletBio(false)"); }
                        });
                    } catch (Exception ignored) { }
                }
            });
        }

        @JavascriptInterface
        public void setSecure(final boolean on) {
            prefs(MainActivity.this).edit().putBoolean("secure", on).apply();
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                }
            });
        }

        /** Yedeği Drive, e-posta, WhatsApp gibi uygulamalarla paylaşır. */
        @JavascriptInterface
        public String shareFile(String name, String text) {
            try {
                SharedPreferences p = prefs(MainActivity.this);
                String old = p.getString("shUri", null);
                final Uri u = writeDownload(name, "Wallet", text, old != null ? Uri.parse(old) : null);
                p.edit().putString("shUri", u.toString()).apply();
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Intent s = new Intent(Intent.ACTION_SEND);
                        s.setType("application/json");
                        s.putExtra(Intent.EXTRA_STREAM, u);
                        s.putExtra(Intent.EXTRA_SUBJECT, "Wallet yedeği");
                        s.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        try { startActivity(Intent.createChooser(s, "Yedeği paylaş")); } catch (Exception ignored) { }
                    }
                });
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        /** Banka SMS'leri: izin durumu, izin isteği, aç/kapa, kuyruk ve gelen kutusu taraması. */
        @JavascriptInterface
        public String smsState() {
            boolean ok = checkSelfPermission("android.permission.RECEIVE_SMS") == PackageManager.PERMISSION_GRANTED
                    && checkSelfPermission("android.permission.READ_SMS") == PackageManager.PERMISSION_GRANTED;
            if (ok) return "granted";
            return prefs(MainActivity.this).getBoolean("smsAsked", false) ? "denied" : "default";
        }

        @JavascriptInterface
        public void askSms() {
            prefs(MainActivity.this).edit().putBoolean("smsAsked", true).apply();
            runOnUiThread(new Runnable() {
                @Override
                public void run() { requestPermissions(new String[]{"android.permission.RECEIVE_SMS", "android.permission.READ_SMS"}, SMS_REQ); }
            });
        }

        @JavascriptInterface
        public void smsSet(boolean on) { prefs(MainActivity.this).edit().putBoolean("smsOn", on).apply(); }

        @JavascriptInterface
        public String smsQueue() { return prefs(MainActivity.this).getString("smsQ", "[]"); }

        @JavascriptInterface
        public void smsAck(String ids) { SmsIn.ack(MainActivity.this, ids); }

        @JavascriptInterface
        public String smsScan(int days) {
            JSONArray out = new JSONArray();
            if (checkSelfPermission("android.permission.READ_SMS") != PackageManager.PERMISSION_GRANTED) return "[]";
            long since = System.currentTimeMillis() - Math.max(1, Math.min(days, 120)) * 86400000L;
            try (Cursor cu = getContentResolver().query(Telephony.Sms.Inbox.CONTENT_URI,
                    new String[]{"_id", "address", "body", "date"}, "date > ?", new String[]{String.valueOf(since)}, "date DESC")) {
                int n = 0;
                while (cu != null && cu.moveToNext() && n < 600) {
                    String body = cu.getString(2);
                    if (body == null || !SmsIn.TX.matcher(body).find()) continue;
                    JSONObject o = new JSONObject();
                    o.put("id", "i" + cu.getLong(0));
                    o.put("from", cu.getString(1) == null ? "" : cu.getString(1));
                    o.put("body", body);
                    o.put("ts", cu.getLong(3));
                    out.put(o);
                    n++;
                }
            } catch (Exception ignored) { }
            return out.toString();
        }

        /** Güncel kurları doğrudan kaynaktan alır (tarayıcı kısıtı yok); sonucu walletNative ile geri verir. */
        @JavascriptInterface
        public void fetchRates(final String reqId) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    String text = null;
                    HttpURLConnection c = null;
                    try {
                        c = (HttpURLConnection) new URL(RATES).openConnection();
                        c.setConnectTimeout(10000);
                        c.setReadTimeout(12000);
                        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Android) WalletApp");
                        c.setRequestProperty("Accept", "application/json");
                        c.setRequestProperty("Cache-Control", "no-cache");
                        if (c.getResponseCode() == 200) {
                            try (InputStream in = c.getInputStream()) { text = readAll(in); }
                        }
                    } catch (Exception ignored) {
                    } finally {
                        if (c != null) c.disconnect();
                    }
                    js("window.walletNative&&window.walletNative(" + JSONObject.quote(reqId) + "," + (text == null ? "null" : JSONObject.quote(text)) + ")");
                }
            }).start();
        }
        /** Piyasa verisi: izinli sitelere doğrudan istek (tarayıcıdaki CORS kısıtı olmadan). Sonuç walletHttp ile döner. */
        @JavascriptInterface
        public void http(final String reqId, final String url, final String method, final String body, final String hdrs) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    int code = 0;
                    String text = null;
                    HttpURLConnection c = null;
                    try {
                        URL u = new URL(url);
                        if (!"https".equals(u.getProtocol()) || !hostOk(u.getHost(), NET_OK)) throw new Exception("izinli değil");
                        c = (HttpURLConnection) u.openConnection();
                        c.setConnectTimeout(10000);
                        c.setReadTimeout(15000);
                        String ua;
                        try { ua = WebSettings.getDefaultUserAgent(MainActivity.this); } catch (Exception e) { ua = "Mozilla/5.0 (Linux; Android) Mobile"; }
                        c.setRequestProperty("User-Agent", ua);
                        c.setRequestProperty("Accept", "application/json, text/plain, */*");
                        c.setRequestProperty("Accept-Language", "tr-TR,tr;q=0.9,en;q=0.8");
                        if (hdrs != null && hdrs.length() > 2) {
                            JSONObject h = new JSONObject(hdrs);
                            Iterator<String> it = h.keys();
                            while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.optString(k)); }
                        }
                        if ("POST".equalsIgnoreCase(method)) {
                            c.setRequestMethod("POST");
                            c.setDoOutput(true);
                            try (OutputStream o = c.getOutputStream()) { o.write((body == null ? "" : body).getBytes(StandardCharsets.UTF_8)); }
                        }
                        code = c.getResponseCode();
                        InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                        if (in != null) try (InputStream i2 = in) { text = readMax(i2, 4 * 1024 * 1024); }
                    } catch (Exception ignored) {
                    } finally {
                        if (c != null) c.disconnect();
                    }
                    httpDone(reqId, code, text);
                }
            }).start();
        }

        /** Tarayıcı doğrulaması isteyen sayfalar (TEFAS gibi) için görünmez bir WebView'da sayfayı açıp metnini okur. */
        @JavascriptInterface
        public void webText(final String reqId, final String url, final String need, final int waitMs) {
            Uri pu = Uri.parse(url);
            if (!"https".equals(pu.getScheme()) || !hostOk(pu.getHost(), WEB_OK)) { httpDone(reqId, 0, null); return; }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    final WebView w = new WebView(MainActivity.this);
                    final Handler h = new Handler(Looper.getMainLooper());
                    final long until = System.currentTimeMillis() + Math.max(5000, Math.min(waitMs, 40000));
                    final boolean[] done = {false};
                    final String[] last = {null};
                    WebSettings ws = w.getSettings();
                    ws.setJavaScriptEnabled(true);
                    ws.setDomStorageEnabled(true);
                    ws.setBlockNetworkImage(true);
                    ws.setAllowFileAccess(false);
                    w.setWebViewClient(new WebViewClient());
                    w.layout(0, 0, 1080, 2400);
                    final Runnable[] poll = new Runnable[1];
                    poll[0] = new Runnable() {
                        @Override
                        public void run() {
                            if (done[0]) return;
                            w.evaluateJavascript("(function(){var b=document.body;return JSON.stringify({u:location.href,ti:document.title,t:b?b.innerText.slice(0,80000):''});})()", new ValueCallback<String>() {
                                @Override
                                public void onReceiveValue(String v) {
                                    if (done[0]) return;
                                    String txt = null;
                                    try { Object o = new JSONTokener(v).nextValue(); if (o instanceof String) txt = (String) o; } catch (Exception ignored) { }
                                    if (txt != null) last[0] = txt;
                                    boolean ready = txt != null && need != null && need.length() > 0 && txt.contains(need);
                                    if (ready || System.currentTimeMillis() > until) {
                                        done[0] = true;
                                        httpDone(reqId, ready ? 200 : 0, last[0]);
                                        try { w.stopLoading(); w.destroy(); } catch (Exception ignored) { }
                                    } else h.postDelayed(poll[0], 900);
                                }
                            });
                        }
                    };
                    w.loadUrl(url);
                    h.postDelayed(poll[0], 1500);
                }
            });
        }

        /** Bağlantıyı telefonun tarayıcısında ya da ilgili uygulamada açar. */
        @JavascriptInterface
        public void openUrl(final String url) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Uri u = Uri.parse(url);
                        if (!"https".equals(u.getScheme())) return;
                        startActivity(new Intent(Intent.ACTION_VIEW, u));
                    } catch (Exception ignored) { }
                }
            });
        }

        /** Metni Claude ya da başka bir uygulamayla paylaşır. */
        @JavascriptInterface
        public void shareText(final String text, final String title) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent s = new Intent(Intent.ACTION_SEND);
                    s.setType("text/plain");
                    s.putExtra(Intent.EXTRA_TEXT, text);
                    try { startActivity(Intent.createChooser(s, title == null || title.isEmpty() ? "Paylaş" : title)); } catch (Exception ignored) { }
                }
            });
        }

        @JavascriptInterface
        public String copyText(String text) {
            try {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                cm.setPrimaryClip(ClipData.newPlainText("Wallet", text));
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        /** Banka uygulaması bildirimleri: erişim durumu, ayar ekranı, aç/kapa ve hangi uygulamalar. */
        @JavascriptInterface
        public String ntfState() { return ntfGranted(MainActivity.this) ? "granted" : "default"; }

        @JavascriptInterface
        public void ntfAsk() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (Build.VERSION.SDK_INT >= 30) {
                            Intent i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS);
                            i.putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, new ComponentName(MainActivity.this, NotifIn.class).flattenToString());
                            startActivity(i);
                            return;
                        }
                    } catch (Exception ignored) { }
                    try { startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)); } catch (Exception ignored) { }
                }
            });
        }

        @JavascriptInterface
        public void ntfSet(boolean on, String keywords) {
            prefs(MainActivity.this).edit().putBoolean("ntfOn", on).putString("ntfKw", keywords == null ? "" : keywords).apply();
        }
    }
}
