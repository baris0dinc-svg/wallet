package app.wallet;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Wallet web uygulamasını tam ekran bir Android uygulaması olarak açar. */
public class MainActivity extends Activity {
    private static final String HOST = "baris0dinc-svg.github.io";
    private static final String URL_APP = "https://" + HOST + "/wallet/";
    private static final String RATES = "https://finans.truncgil.com/v4/today.json";
    private static final int FILE_REQ = 7;
    private static final int NOTIF_REQ = 11;
    private WebView web;
    private ValueCallback<Uri[]> fileCb;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (prefs(this).getBoolean("secure", false)) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
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

        if (state != null) web.restoreState(state); else web.loadUrl(URL_APP);
    }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("wallet", Context.MODE_PRIVATE);
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
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ) {
            if (fileCb != null) fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        super.onRequestPermissionsResult(req, perms, results);
        if (req == NOTIF_REQ) js("window.walletPerm&&window.walletPerm()");
    }

    /** Geri tuşu: önce uygulamadaki açık pencereyi/sayfayı kapatır, en son uygulamadan çıkar. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.walletBack&&window.walletBack())?'1':'0'", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String v) {
                if ("\"1\"".equals(v)) return;
                if (web.canGoBack()) web.goBack(); else finish();
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

    /** Web uygulamasının çağırdığı yerel işlevler. */
    private class Bridge {
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
    }
}
