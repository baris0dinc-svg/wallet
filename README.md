# Wallet

Kişisel finans uygulaması: net servet, hesaplar (cüzdan, banka, kart, birikim), gelir-gider, transfer, bütçe, analiz ve finansal sağlık puanı, hedefler, düzenli ödemeler ve fatura hatırlatıcısı, yatırım/varlık/borç takibi, notlar (arşiv ve çöp kutusu), FIRE ve finans hesaplayıcıları.

- Düz HTML/CSS/JS, derleme gerekmez. PWA: ana ekrana eklenir, çevrimdışı çalışır.
- Veriler cihazda tutulur (`localStorage`, anahtar `kumbara-v1`); depoda kişisel veri yoktur. Android uygulamasında ayrıca uygulama içi bir kopya (`wallet-data.json`) ve isteğe bağlı otomatik yedek (`İndirilenler/Wallet/Wallet-otomatik-yedek.json`) yazılır; açılışta hangisi daha yeniyse (`savedAt`) o kullanılır.
- Kaynak `src/` altında parçalara bölünmüştür (`01-core` veri ve hesap, `02-home` ana ekran, `03-analysis`, `04-settings`, `05-sheets`, `06-actions`, `07-sms`, `99-init`). `python3 tools/build.py` bunları `app.js` olarak birleştirir; CI `--check` ile denetler.
- Testler `tests/` altında: `bash tests/run.sh` (Playwright + Chromium) bakiye matematiği, SMS ayrıştırma, gezinme, Android köprüsü taklidi, taşma taraması, rastgele kullanım (monkey) ve güncelleme akışını dener. `main`'e her push'ta önce testler çalışır, geçmezse yayınlanmaz.
- `tests/android/` Android E2E: `android-e2e.yml` gerçek APK'yı Android 14 emülatöründe kurup WebView'a DevTools ile bağlanır; veri kalıcılığı, güncelleme, alarm hatırlatıcısı, bildirim, otomatik yedek, SMS, canlı kur ve tam silmeyi dener.
- Dosyalar: `index.html`, `style.css`, `app.js` (üretilir), `sw.js`, `manifest.webmanifest`, `icons/`; Android sarmalayıcı `android-app/`.
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

`saveData/loadData` (kalıcı kopya), `autoBackup`, `shareFile` (yedeği paylaş), `smsState/askSms/smsSet/smsQueue/smsAck/smsScan` (banka SMS'leri; ayrıştırma `src/07-sms.js` içinde), `wipe` (her şeyi siler), `schedule` (fatura hatırlatmaları AlarmManager ile; telefon yeniden başlayınca yeniden kurulur), `notifState/askNotif/testNotif`, `bioAvail/bioAuth` (parmak izi), `setSecure` (ekran gizliliği), `fetchRates` (kurları doğrudan Truncgil'den alır), `save` (İndirilenler'e dosya). Eski APK'da olmayan işlevler web tarafında sessizce atlanır.

## Canlı kur

Android uygulaması kurları doğrudan kaynaktan alır; tarayıcıda `pages.yml` Truncgil verisini düzenli aralıklarla `rates.json` olarak yayına ekler. Kullanılan alanlar: USD, EUR, GBP, CHF, GRA (gram altın), GUMUS, CEYREKALTIN, XU100.

## Banka SMS'leri

Android uygulaması tutar içeren gelen SMS'leri kuyruğa alır (`SmsIn`), web tarafı `smsParse` ile türü (gider, gelir, ATM'den nakit, kart borcu ödemesi), tutarı, para birimini, işyerini ve kartın son 4 hanesini çıkarır. Şifre/doğrulama, ekstre ve reklam mesajları yok sayılır. Onaylanan her işlemde kart → hesap eşlemesi ve değiştirilen kategori kuralı öğrenilir. Yeni bir banka biçimi `src/07-sms.js` ve `tests/sms.js` içine eklenir; APK güncellemesi gerekmez.

## Kurlar ve raporlar

Dövizli işlemlere kayıt anındaki kur (`fx`) yazılır; gelir-gider raporları bu kurla hesaplanır, hesap bakiyeleri ve net servet güncel kurla. Net servet geçmişi ilk işlemden itibaren ay sonları için işlemlerden geriye doğru hesaplanır (yatırımlar bugünkü fiyatla), sonrası günlük kayıtlardır.
