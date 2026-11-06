# Wallet

Kişisel finans uygulaması: gelir-gider, bütçe, hedefler, düzenli ödemeler, portföy, borçlar, notlar, FIRE ve finans hesaplayıcıları.

- Düz HTML/CSS/JS, derleme gerekmez. PWA: ana ekrana eklenir, çevrimdışı çalışır.
- Veriler yalnızca cihazın tarayıcısında (`localStorage`, anahtar `kumbara-v1`) tutulur; depoda kişisel veri yoktur.
- Dosyalar: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icons/`.
- Yayın: `main`'e push edilince `.github/workflows/pages.yml` GitHub Pages'e yayınlar.
- Önbellek sürümü: `sw.js` içindeki `CACHE` adını, dosyalar değişince artırın.
- Canlı kur: `pages.yml` her 15 dakikada Truncgil verisini `rates.json` olarak yayına ekler; uygulama bunu okur. Alan adları (GRA, XU100) canlı yanıta göre doğrulanmalıdır.
