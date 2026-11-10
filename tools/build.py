#!/usr/bin/env python3
"""src/*.js dosyalarını sırayla birleştirip app.js üretir.
Kullanım: python3 tools/build.py          → app.js yazar
          python3 tools/build.py --check  → app.js güncel değilse hata verir (CI)"""
import base64, glob, hashlib, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parts = sorted(glob.glob(os.path.join(root, 'src', '*.js')))
out = ''.join(open(p, encoding='utf-8').read() for p in parts)
target = os.path.join(root, 'app.js')

# İçerik güvenlik politikası: yalnızca kendi dosyalarımız ve bilinen veri kaynakları; satır içi betikler özetleriyle (hash) izinli
CSP_T = ("default-src 'self'; script-src 'self' {h}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
         "font-src https://fonts.gstatic.com data:; img-src 'self' data: blob: https://www.google.com https://*.gstatic.com https://favicon.vemetric.com; "
         "connect-src 'self' https://www.tefas.gov.tr https://www.isyatirim.com.tr https://api.coingecko.com https://query1.finance.yahoo.com https://query2.finance.yahoo.com https://api.frankfurter.dev https://api.github.com https://gist.githubusercontent.com https://data-api.binance.vision; "
         "frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'self'; manifest-src 'self'")
ip = os.path.join(root, 'index.html')
html = open(ip, encoding='utf-8').read()
hs = ' '.join("'sha256-%s'" % base64.b64encode(hashlib.sha256(m.encode('utf-8')).digest()).decode()
              for m in re.findall(r'<script>(.*?)</script>', html, flags=re.S))
meta = '<meta http-equiv="Content-Security-Policy" content="%s">' % CSP_T.format(h=hs)
html2 = re.sub(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">', lambda m: meta, html)
if html2 == html and meta not in html:
    html2 = html.replace('<meta name="viewport"', meta + '\n<meta name="viewport"', 1)
if '--check' in sys.argv and html2 != html:
    sys.exit('index.html güvenlik politikası güncel değil: python3 tools/build.py çalıştırın')
if '--check' not in sys.argv and html2 != html:
    open(ip, 'w', encoding='utf-8').write(html2)
    print('index.html güvenlik politikası güncellendi')

# version.json: uygulamadaki "Güncellemeleri denetle" bu dosyayı önbelleksiz okuyup çalışan sürümle karşılaştırır
mv = re.search(r"VER\s*=\s*['\"](\d+\.\d+)['\"]", out)
if not mv:
    # 4.13'te kod yeniden biçimlendirilince sürüm okunamamış, version.json "0" yazılmıştı: artık derleme durur
    sys.exit('HATA: src/01-core.js içinde VER bulunamadı; version.json yazılmadı')
vj = os.path.join(root, 'version.json'); vtxt = '{"v":"%s"}\n' % mv.group(1)
vcur = open(vj, encoding='utf-8').read() if os.path.exists(vj) else ''
if '--check' in sys.argv and vcur != vtxt:
    sys.exit('version.json güncel değil: python3 tools/build.py çalıştırın')
if '--check' not in sys.argv and vcur != vtxt:
    open(vj, 'w', encoding='utf-8').write(vtxt)

if '--check' in sys.argv:
    cur = open(target, encoding='utf-8').read() if os.path.exists(target) else ''
    if cur != out:
        sys.exit('app.js src/ ile uyuşmuyor: python3 tools/build.py çalıştırın')
    print('app.js güncel (%d parça)' % len(parts))
else:
    open(target, 'w', encoding='utf-8').write(out)
    print('app.js yazıldı (%d parça, %d karakter)' % (len(parts), len(out)))
