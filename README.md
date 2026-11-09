# Wallet

Kişisel finans uygulaması: bu dönem ne kadar kaldığı, net servet, hesaplar (cüzdan, banka, kart, birikim), gelir-gider, transfer, bütçe, analiz, hedefler, düzenli ödemeler ve fatura hatırlatıcısı, yatırım/varlık/borç takibi, piyasalar ve takip listesi (hisse, fon, döviz, altın, kripto), finansal özgürlük koçu (Türkiye'ye göre, kaynaklı oranlarla), banka SMS'i ve uygulama bildiriminden otomatik işlem, Excel/CSV ekstre içe aktarma, Claude'a sor, notlar, FIRE ve finans hesaplayıcıları, sesle işlem ekleme.

Gezinme (4.0): alt menüde Ana Sayfa, İşlemler, Plan, Analiz, Hesaplar; Ayarlar her sekmenin başlığındaki çark simgesinde. Ana Sayfa: bu dönem kalan (beklenen gelir − harcanan − dönem sonuna kadar ödenecek düzenli ödemeler) ve günlük harcama sınırı, net servet satırı, uyarılar, işlem ekle / sesle ekle, sık eklenenler, Koç'un sıradaki adımı, akıllı tespitler, piyasa şeridi, son işlemler, Notlar ve Hesaplayıcılar. Plan: Koç, Bütçe, Düzenli, Hedefler. Analiz: Özet, Kategori, Takvim, Servet. Hesaplar: üstte net servet, altında Hesaplar, Yatırımlar, Varlıklar, Borçlar. Eski adresler (#planlama, #ayarlar, ayar-profil/hesap/gor) yeni yerlerine gider. Marka varlıkları (simge, açılış ekranı) `tools/brand/build.py` ile üretilir; uygulama içindeki logo değişmez.

- Düz HTML/CSS/JS, derleme gerekmez. PWA: ana ekrana eklenir, çevrimdışı çalışır.
- Veriler cihazda tutulur (`localStorage`, anahtar `kumbara-v1`); depoda kişisel veri yoktur. Android uygulamasında ayrıca uygulama içi bir kopya (`wallet-data.json`) ve isteğe bağlı otomatik yedek (`İndirilenler/Wallet/Wallet-otomatik-yedek.json`) yazılır; açılışta hangisi daha yeniyse (`savedAt`) o kullanılır.
- Kaynak `src/` altında parçalara bölünmüştür (`00-fonts` yazı tipi ve hata kaydı, `01-core` veri ve hesap, `02-home` ana ekran, `03-analysis`, `04-settings`, `05-sheets`, `06-actions`, `07-sms`, `08-market` piyasalar, `09-import` Excel/CSV okuma, `10-claude`, `11-voice` sesle ekleme, `12-ease` sık eklenenler ve kısayollar, `13-keep` Keep tarzı notlar, `14-brain` akıllı motor, `15-coach` Koç, `99-init`). `python3 tools/build.py` bunları `app.js` olarak birleştirir; CI `--check` ile denetler. Aynı komut `index.html` içindeki içerik güvenlik politikasını (CSP; satır içi betiklerin SHA-256 özetleri dahil) yeniden üretir.
- Performans: bakiyeler, dönem anahtarları, uyarılar, sık eklenenler ve arama metni önbelleklenir; net servet geçmişi tek taramada hesaplanır; Android yedek kopyası ekran çizildikten sonra yazılır. Ölçüm (5.000 işlem, 4 kat yavaşlatılmış işlemci): ana sayfa çizimi 160 ms'den 15–40 ms'ye, aramada tuş başına 120 ms'den birkaç ms'ye indi; arama yazmaya ara verince çalışır ve ilk 100 sonucu gösterir.
- Akıllı motor (cihazda): notlardan ve SMS satıcı adlarından öğrenen kategori modeli (naive Bayes, Türkçe eklerine dayanıklı kökler; kurallar her zaman önce gelir), kaydedilmemiş düzenli ödeme, olağandışı harcama ve çift kayıt tespiti, bütçenin dolacağı gün, maaş gününe göre dönem önerisi; dönem sonu tahmini değişken harcama hızı ile kalan düzenli ödemeleri ayrı hesaplar.
- Hata kaydı: beklenmeyen hatalar ve güvenlik politikası ihlalleri cihazda saklanır (Ayarlar › Veri ve yedek › Hata kaydı); hiçbir yere gönderilmez.
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

`saveData/loadData` (kalıcı kopya), `autoBackup`, `shareFile` (yedeği paylaş), `smsState/askSms/smsSet/smsQueue/smsAck/smsScan` (banka SMS'leri; ayrıştırma `src/07-sms.js` içinde), `wipe` (her şeyi siler), `schedule` (fatura hatırlatmaları AlarmManager ile; telefon yeniden başlayınca yeniden kurulur), `notifState/askNotif/testNotif`, `bioAvail/bioAuth` (parmak izi), `setSecure` (ekran gizliliği), `fetchRates` (kurları doğrudan Truncgil'den alır), `http` (izinli piyasa sitelerine istek: İş Yatırım, Yahoo Finance, CoinGecko, Truncgil, TEFAS), `webText` (tarayıcı doğrulaması isteyen sayfayı — TEFAS — görünmez WebView'da açıp metnini okur), `ntfState/ntfAsk/ntfSet` (banka uygulaması bildirimleri, `NotifIn`), `openUrl/shareText/copyText` (Claude'a sor), `save` (İndirilenler'e dosya). Eski APK'da olmayan işlevler web tarafında sessizce atlanır.

## Canlı kur

Android uygulaması kurları doğrudan kaynaktan alır; tarayıcıda `pages.yml` Truncgil verisini düzenli aralıklarla `rates.json` olarak yayına ekler. Kullanılan alanlar: USD, EUR, GBP, CHF, GRA (gram altın), GUMUS, CEYREKALTIN, XU100.

## Banka SMS'leri

Android uygulaması tutar içeren gelen SMS'leri kuyruğa alır (`SmsIn`), web tarafı `smsParse` ile türü (gider, gelir, ATM'den nakit, kart borcu ödemesi), tutarı, para birimini, işyerini ve kartın son 4 hanesini çıkarır. Şifre/doğrulama, ekstre ve reklam mesajları yok sayılır. Onaylanan her işlemde kart → hesap eşlemesi ve değiştirilen kategori kuralı öğrenilir. Yeni bir banka biçimi `src/07-sms.js` ve `tests/sms.js` içine eklenir; APK güncellemesi gerekmez. Banka uygulaması bildirimleri (`NotifIn`, kullanıcı bildirim erişimi verirse) aynı kuyruğa `src: "app"` ile girer; hangi uygulamalara bakılacağı `NTF_KW` anahtar kelimeleriyle web tarafından belirlenir. Aynı işlem 20 dakika içinde hem SMS hem bildirim olarak gelirse bir kez sayılır.

## Piyasalar ve takip listesi

`src/08-market.js`. Varsayılan takip listesi (yeni kurulum): USD, EUR, gram altın, çeyrek altın, BIST 100, Bitcoin. Truncgil'e ulaşılamazsa USD/EUR/GBP/CHF için Avrupa Merkez Bankası günlük referans kuru Frankfurter'dan (`api.frankfurter.dev/v2`, anahtarsız, CORS açık) alınır ve kaynağı ekranda yazar; döviz grafikleri tarayıcıda da buradan çizilir. Her kalemin son 30 günlük kapanışı cihazda tutulur (küçük grafik), satırlarda ne kadar önce güncellendiği görünür, liste sıralanıp düzenlenebilir, çevrimdışıyken son fiyatların tarihi gösterilir. Anahtar biçimi `kaynak:sembol`: `fx:USD` (Truncgil; döviz, altın türleri, BIST 100), `bist:THYAO` (İş Yatırım `OneEndeks` anlık ~15 dk gecikmeli, `HisseTekil` günlük kapanış geçmişi), `cg:bitcoin` (CoinGecko), `yh:AAPL` (Yahoo Finance `v8/finance/chart` ve `v1/finance/search`; düz sunucu isteklerine 429 verir, uygulamanın WebView kimliğiyle çalışır), `fon:AFT` (TEFAS'ın veri servisi kapalı; yeni fon sayfası `tr/fon-detayli-analiz/KOD` görünmez WebView'da açılıp metninden son fiyat, günlük getiri ve fon adı okunur). Hepsi Android E2E'de emülatörde denenir. Tarayıcı CORS nedeniyle yalnızca Truncgil ve CoinGecko'ya erişir; hisseler için `bist.json` (her yayında `tools/bist_list.py` ile yenilenen hisse listesi ve son fiyat) kullanılır. Yatırımlar `mk` alanıyla bir sembole bağlanırsa değeri bu fiyattan hesaplanır (`hPrice`).

## Koç (`src/15-coach.js`)

Yol haritası: gelir ≥ gider → 1 aylık tampon → pahalı borç (kart ve faizi enflasyonun üstündeki krediler, en yüksek faizliden) → 3–6 aylık acil durum fonu → enflasyona karşı koruma (faizsiz bekleyen TL, yatırımların reel getirisi) → uzun vade (yoğunlaşma, BES) → finansal özgürlük. Her adım yalnızca kullanıcının verisinden tetiklenir ve sayıları gösterir; veri yetmiyorsa eksik veriyi söyler. Ürün adı verilmez. Türkiye'ye özgü oranlar `FACTS` içinde kaynağı ve tarihiyle durur (TÜİK TÜFE aylık serisi, TCMB politika faizi ve kart azami faizi, BDDK asgari ödeme, mevduat/fon/DİBS stopajı, BES devlet katkısı, TMSF güvencesi); anahtarsız güvenilir canlı kaynak olmadığından uygulama güncellemeleriyle yenilenir, enflasyon verisi 45 günden eskiyse ekranda belirtilir. Testler: `tests/coach.js`.

## Ekstre içe aktarma

`src/09-import.js`: `.xlsx` (ZIP + XML, `DecompressionStream`), eski `.xls` (BIFF8, paylaşılan metin tablosu CONTINUE bölünmeleri dahil), HTML biçimli `.xls`, CSV (UTF-8, UTF-16, Windows-1254). Tablo CSV metnine çevrilir; `csvImport` ilk 40 satırda başlık satırını (Tarih + Tutar ya da Borç/Alacak) bulur, tarihsiz satırları (Toplam) atlar, kredi kartı hesabında artı tutarı harcama sayar. Örnek dosyalar `tests/fixtures/`.

## Claude'a sor

`src/10-claude.js`: aylık gelir-gider, kategori ortalamaları, servet dağılımı, borçlar, hedefler ve sağlık göstergelerinden bir özet çıkarır (hesap adları ve işlem notları girmez). Kullanıcı düzenleyip panoya kopyalar ve `claude.ai/new?q=…` açılır ya da Claude uygulamasıyla paylaşır; uygulama kendisi veri göndermez.

## Kurlar ve raporlar

Dövizli işlemlere kayıt anındaki kur (`fx`) yazılır; gelir-gider raporları bu kurla hesaplanır, hesap bakiyeleri ve net servet güncel kurla. Net servet geçmişi ilk işlemden itibaren ay sonları için işlemlerden geriye doğru hesaplanır (yatırımlar bugünkü fiyatla), sonrası günlük kayıtlardır.
