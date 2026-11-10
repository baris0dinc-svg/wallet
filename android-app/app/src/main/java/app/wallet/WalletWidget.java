package app.wallet;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

/** Ana ekran bileşeni (4.28): bu ay harcanan, bütçeden kalan ve tek dokunuşla gider/gelir ekleme.
 *  Veriyi web uygulaması gönderir (AndroidBridge.widget); burada yalnızca gösterilir, internet kullanılmaz. */
public class WalletWidget extends AppWidgetProvider {
    static final String PREFS = "wallet-widget";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, views(ctx));
    }

    static void refresh(Context ctx) {
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        int[] ids = m.getAppWidgetIds(new ComponentName(ctx, WalletWidget.class));
        if (ids == null || ids.length == 0) return;
        RemoteViews v = views(ctx);
        for (int id : ids) m.updateAppWidget(id, v);
    }

    private static PendingIntent open(Context ctx, String action, int code) {
        Intent i = new Intent(Intent.ACTION_VIEW, action == null ? null : Uri.parse("wallet:" + action), ctx, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        return PendingIntent.getActivity(ctx, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static RemoteViews views(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget);
        String d = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("d", null);
        try {
            JSONObject o = new JSONObject(d == null ? "{}" : d);
            if (!o.has("v")) throw new Exception("veri yok");
            v.setTextViewText(R.id.w_t, o.optString("t", ""));
            v.setTextViewText(R.id.w_a, o.optString("a", ""));
            v.setTextViewText(R.id.w_v, o.optString("v", ""));
            v.setTextViewText(R.id.w_b, o.optString("b", ""));
            v.setTextViewText(R.id.w_w, o.optString("w", ""));
            String c = o.optString("c", "");
            v.setTextViewText(R.id.w_c, c);
            v.setViewVisibility(R.id.w_c, c.isEmpty() ? View.GONE : View.VISIBLE);
            v.setViewVisibility(R.id.w_row2, View.VISIBLE);
        } catch (Exception e) {
            v.setTextViewText(R.id.w_t, "Wallet");
            v.setTextViewText(R.id.w_a, "Özeti görmek için");
            v.setTextViewText(R.id.w_v, "uygulamayı bir kez aç");
            v.setViewVisibility(R.id.w_row2, View.GONE);
            v.setViewVisibility(R.id.w_c, View.GONE);
        }
        v.setOnClickPendingIntent(R.id.w_root, open(ctx, null, 10));
        v.setOnClickPendingIntent(R.id.w_exp, open(ctx, "exp", 11));
        v.setOnClickPendingIntent(R.id.w_inc, open(ctx, "inc", 12));
        return v;
    }
}
