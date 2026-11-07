#!/usr/bin/env python3
"""src/*.js dosyalarını sırayla birleştirip app.js üretir.
Kullanım: python3 tools/build.py          → app.js yazar
          python3 tools/build.py --check  → app.js güncel değilse hata verir (CI)"""
import glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parts = sorted(glob.glob(os.path.join(root, 'src', '*.js')))
out = ''.join(open(p, encoding='utf-8').read() for p in parts)
target = os.path.join(root, 'app.js')
if '--check' in sys.argv:
    cur = open(target, encoding='utf-8').read() if os.path.exists(target) else ''
    if cur != out:
        sys.exit('app.js src/ ile uyuşmuyor: python3 tools/build.py çalıştırın')
    print('app.js güncel (%d parça)' % len(parts))
else:
    open(target, 'w', encoding='utf-8').write(out)
    print('app.js yazıldı (%d parça, %d karakter)' % (len(parts), len(out)))
