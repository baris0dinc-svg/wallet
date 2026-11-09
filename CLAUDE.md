# Wallet: Claude oturumları için kurallar

Bu uygulamayı sahibi her gün kullanıyor; içinde gerçek verisi var. 4.13'te başka bir oturum bütün kodu yeniden biçimlendirip
sürüm dosyasını bozduğu için geri alınmak zorunda kalındı. Bu kurallar her Claude oturumu için bağlayıcıdır.

## Kesin yasaklar
- **Sahibi o oturumda açıkça istemedikçe `main`e push etme, PR açma, PR birleştirme.** "İncele", "puanla", "kontrol et" gibi istekler
  yalnızca rapor ister; koda dokunma.
- **Kodu yeniden biçimlendirme.** Prettier, ESLint --fix, toplu girinti/tırnak değişikliği yok. Diff yalnızca istenen değişikliği içersin.
  `.prettierrc`, biçim denetimi ya da yeni araç ekleme.
- **Android imzasına, `applicationId`'ye, keystore'a ve `apk.yml`'deki imza adımlarına dokunma.** İmza değişirse yeni APK eskisinin
  üstüne kurulmaz; kaldırıp kurmak telefondaki bütün veriyi siler.
- `app.js`'i elle düzenleme; kaynak `src/*.js`, derleme `python3 tools/build.py`.
- Özellik kaldırma, ana sayfa düzenini ve tema renklerini değiştirme (ilk kart her zaman büyük "Net servetim").

## Her değişiklikte
1. `python3 tools/build.py` → `version.json` içindeki sürüm `src/01-core.js`deki `VER` ile aynı olmalı (asla "0" değil).
2. `bash tests/run.sh` → "TÜM TESTLER GEÇTİ" görmeden commit yok.
3. Sürüm: `VER` (src/01-core.js) artar, `sw.js`'deki `CACHE` adı değişir; yerel (Android) kod değiştiyse `versionName` de.
4. Değişikliği sahibine Türkçe, kısa ve sade anlat; neyin değiştiğini ve telefonda ne yapması gerektiğini (Denetle / yeni APK) söyle.
