# Wallet

Kişisel finans uygulaması: net servet, hesaplar (cüzdan, banka, kart, birikim), gelir-gider, transfer, bütçe, analiz ve finansal sağlık puanı, hedefler, düzenli ödemeler ve fatura hatırlatıcısı, yatırım/varlık/borç takibi, notlar (arşiv ve çöp kutusu), FIRE ve finans hesaplayıcıları.

- Düz HTML/CSS/JS, derleme gerekmez. PWA: ana ekrana eklenir, çevrimdışı çalışır.
- Veriler cihazda tutulur (`localStorage`, anahtar `kumbara-v1`); depoda kişisel veri yoktur. Android uygulamasında ayrıca uygulama içi bir kopya (`wallet-data.json`) ve isteğe bağlı otomatik yedek (`İndirilenler/Wallet/Wallet-otomatik-yedek.json`) yazılır; açılışta hangisi daha yeniyse (`savedAt`) o kullanılır.
- Dosyalar: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icons/`; Android sarmalayıcı `android-app/`.
- Yayın: `main`'e push edilince `.github/workflows/pages.yml` GitHub Pages'e yayınlar; `android-app/` değişince `apk.yml` APK'yı derleyip `apk-latest` sürümüne yükler.
- Önbellek sürümü: `sw.js` içindeki `CACHE` adını, dosyalar değişince artırın.
- Güncelleme: yeni `sw.js` etkinleşince sayfa kendiliğinden yenilenir; kullanıcı o an bir pencere/sayfa açıksa "Yeni sürüm hazır · Yenile" bildirimi çıkar. Üst bardaki yenile düğmesi kurları ve yeni sürümü denetler.
- APK imzası sabittir (`android-app/debug.keystore`) ve `versionCode` her derlemede artar; yeni APK eskisinin üstüne kurulur, veriler silinmez.

## İşlem türleri ve bakiye

| Tür | Hesaba etkisi | Gelir/gider raporu |
|---|---|---|
| `inc` / `exp` | + / − | sayılır |
| `trf` (transfer, kart borcu ödeme, hedefe para) | çıkış − / giriş + (`amt2` farklı para birimi) | sayılmaz |
| `inv` (`side: buy/sell`, yatırım alım/satım) | alım − / satış + | sayılmaz; gerçekleşen kâr `realized` |
| `dbt` (`side: in/out`, borç alındı/ödendi) | + / − ; ödeme borcun kalanından düşer | sayılmaz; faiz ayrı `exp` |
| `adj` (bakiye eşitleme) | işaretli tutar | sayılmaz |

Borcun kalanı = girilen tutar − bağlı `dbt/out` ödemeleri; ödeme silinirse borç kendiliğinden geri artar.

## Android köprüsü (`window.AndroidBridge`)

`saveData/loadData` (kalıcı kopya), `autoBackup`, `wipe` (her şeyi siler), `schedule` (fatura hatırlatmaları AlarmManager ile; telefon yeniden başlayınca yeniden kurulur), `notifState/askNotif/testNotif`, `bioAvail/bioAuth` (parmak izi), `setSecure` (ekran gizliliği), `fetchRates` (kurları doğrudan Truncgil'den alır), `save` (İndirilenler'e dosya). Eski APK'da olmayan işlevler web tarafında sessizce atlanır.

## Canlı kur

Android uygulaması kurları doğrudan kaynaktan alır; tarayıcıda `pages.yml` Truncgil verisini düzenli aralıklarla `rates.json` olarak yayına ekler. Kullanılan alanlar: USD, EUR, GBP, CHF, GRA (gram altın), GUMUS, CEYREKALTIN, XU100.
