package app.wallet;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.OutputStream;

/** Wallet web uygulamasını tam ekran bir Android uygulaması olarak açar. */
public class MainActivity extends Activity {
    private static final String HOST = "baris0dinc-svg.github.io";
    private static final String URL = "https://" + HOST + "/wallet/";
    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
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
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");

        if (state != null) web.restoreState(state); else web.loadUrl(URL);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    /** Yedek ve CSV dosyalarını İndirilenler klasörüne kaydeder. */
    private class Bridge {
        @JavascriptInterface
        public String save(String name, String text) {
            try {
                String lower = name.toLowerCase();
                String mime = lower.endsWith(".json") ? "application/json" : lower.endsWith(".csv") ? "text/csv" : "text/plain";
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                v.put(MediaStore.Downloads.MIME_TYPE, mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (u == null) return "err";
                try (OutputStream o = getContentResolver().openOutputStream(u)) {
                    o.write(text.getBytes("UTF-8"));
                }
                return "ok";
            } catch (Exception e) {
                return "err";
            }
        }
    }
}
