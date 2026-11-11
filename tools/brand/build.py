#!/usr/bin/env python3
"""Wallet marka varlıklarını üretir: PWA simgeleri, Android uyarlanabilir simgesi ve açılış ekranı.

Logonun şekli değişmez: tools/brand/logo-path.txt, orijinal iki elmas simgesinden (icons/icon-512.png)
birebir izlenmiş vektördür. Burada yalnızca renkler ve yazı tipi belirlenir.
Uygulama içindeki üst çubuk logosu (style.css .logo) bu betikten etkilenmez.

Kullanım: python3 tools/brand/build.py   (rsvg-convert ve fontTools gerekir)
"""
import math, os, re, subprocess, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from wordmark import wordmark  # noqa: E402

# ---- marka: renkler ve yazı ----
# 4.16: renkler uygulamanın arayüzünden (style.css): koyu temada zemin #0E1512 ve nane yeşili vurgu #3FBF9F,
# açık temada zemin #F2F4F1 ve yeşil vurgu #0E6B58. Açılış ekranı telefonun temasını izler; simge koyu temadaki gibidir.
DARK = dict(accent='#3FBF9F', ink='#E7EEEA', bg='#0E1512', hi='#1A2620', lo='#080C0A', logo=['#8FE6CD', '#3FBF9F', '#2C9E83', '#6DD8BB'])
LIGHT = dict(accent='#0E6B58', ink='#13201B', bg='#F2F4F1', hi='#FFFFFF', lo='#E1E7E2', logo=['#1C8C73', '#0E6B58', '#0A5546', '#15806A'])
# 4.20: simge de uygulama içindeki logo gibi: koyu arayüz zemini üzerinde düz açık renk logo (geçiş yok)
ICON = dict(DARK, hi='#0E1512', lo='#0E1512', logo=['#E7EEEA'] * 4)
BG, BG_HI, BG_LO, GOLD = DARK['bg'], DARK['hi'], DARK['lo'], DARK['logo']


def use(t):
    """Çizimde kullanılacak renk takımını seç (zemin, ışık, köşe, logo geçişi)."""
    global BG, BG_HI, BG_LO, GOLD
    BG, BG_HI, BG_LO, GOLD = t['bg'], t['hi'], t['lo'], t['logo']


GOLD_OFF = [0, .45, .75, 1]
FONT = '/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
WORD, WORD_TRACK = 'WALLET', .42

PATH = open(os.path.join(HERE, 'logo-path.txt')).read().strip()
BX, BY, BW, BH = 53, 127, 407, 258   # logonun orijinal 512'lik simgedeki kutusu
CX, CY = BX + BW / 2, BY + BH / 2


def polys():
    out = []
    for seg in re.findall(r'M([^MZ]+)Z', PATH):
        v = [float(t) for t in seg.split()]
        out.append(list(zip(v[0::2], v[1::2])))
    return out


POLYS = polys()
RMAX = max(math.hypot(x - CX, y - CY) for p in POLYS for x, y in p)   # merkezden en uzak nokta


def path_tf(s, tx, ty, nd=2, android=False):
    """Logoyu ölçekle (merkezi tx,ty'ye) ve yol metni üret."""
    f = '%.' + str(nd) + 'f'
    parts = []
    for p in POLYS:
        pts = [(f % ((x - CX) * s + tx), f % ((y - CY) * s + ty)) for x, y in p]
        if android:
            parts.append('M' + ','.join(pts[0]) + 'L' + ' '.join(a + ',' + b for a, b in pts[1:]) + 'Z')
        else:
            parts.append('M' + ' '.join(a + ' ' + b for a, b in pts) + 'Z')
    return ''.join(parts)


def grad_svg(id_, x1, y1, x2, y2, units='objectBoundingBox'):
    st = ''.join('<stop offset="%s" stop-color="%s"/>' % (o, c) for o, c in zip(GOLD_OFF, GOLD))
    return '<linearGradient id="%s" gradientUnits="%s" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient>' % (id_, units, x1, y1, x2, y2, st)


def icon_svg(size, logo_w, cx=None, cy=None):
    s = logo_w / BW
    cx = size / 2 if cx is None else cx
    cy = size / 2 if cy is None else cy
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="{n}" height="{n}" viewBox="0 0 {n} {n}"><defs>'
            '<radialGradient id="b" cx=".5" cy=".38" r=".78"><stop offset="0" stop-color="{hi}"/><stop offset="1" stop-color="{lo}"/></radialGradient>'
            '{g}</defs><rect width="{n}" height="{n}" fill="url(#b)"/><path fill="url(#g)" fill-rule="evenodd" d="{d}"/></svg>').format(
        n=size, hi=BG_HI, lo=BG_LO, g=grad_svg('g', 0, 0, 1, 1), d=path_tf(s, cx, cy))


def render(svg, out, w):
    tmp = out + '.svg'
    open(tmp, 'w').write(svg)
    subprocess.run(['rsvg-convert', '-w', str(w), '-o', out, tmp], check=True)
    os.remove(tmp)


def android_grad(x1, y1, x2, y2):
    items = ''.join('<item android:offset="%s" android:color="%s"/>' % (o, c) for o, c in zip(GOLD_OFF, GOLD))
    return ('<aapt:attr name="android:fillColor"><gradient android:type="linear" android:startX="%.2f" android:startY="%.2f" '
            'android:endX="%.2f" android:endY="%.2f">%s</gradient></aapt:attr>') % (x1, y1, x2, y2, items)


def vec(size_dp, vp, body):
    return ('<?xml version="1.0" encoding="utf-8"?>\n<!-- tools/brand/build.py tarafından üretildi -->\n'
            '<vector xmlns:android="http://schemas.android.com/apk/res/android" xmlns:aapt="http://schemas.android.com/aapt" '
            'android:width="{s}dp" android:height="{s}dp" android:viewportWidth="{v}" android:viewportHeight="{v}">{b}</vector>\n').format(s=size_dp, v=vp, b=body)


def logo_vec(vp, logo_w, solid=None):
    s = logo_w / BW
    c = vp / 2
    d = path_tf(s, c, c, 3, android=True)
    hw, hh = BW * s / 2, BH * s / 2
    if solid:
        return '<path android:fillType="evenOdd" android:fillColor="%s" android:pathData="%s"/>' % (solid, d)
    return '<path android:fillType="evenOdd" android:pathData="%s">%s</path>' % (d, android_grad(c - hw, c - hh, c + hw, c + hh))


def main():
    res = os.path.join(ROOT, 'android-app/app/src/main/res')
    w = lambda p, t: (os.makedirs(os.path.dirname(p), exist_ok=True), open(p, 'w', encoding='utf-8').write(t))

    use(ICON)
    # PWA simgeleri: orijinal yerleşim (logo genişliği ve konumu) aynen korunur
    render(icon_svg(512, 405, 255.5, 255.5), os.path.join(ROOT, 'icons/icon-512.png'), 512)
    render(icon_svg(512, 405, 255.5, 255.5), os.path.join(ROOT, 'icons/icon-192.png'), 192)
    render(icon_svg(512, 302, 256, 255.5), os.path.join(ROOT, 'icons/icon-maskable-512.png'), 512)
    render(icon_svg(512, 405, 255.5, 255.5), os.path.join(res, 'mipmap-xxxhdpi/ic_launcher.png'), 192)

    # Android uyarlanabilir simge: logo 66dp güvenli dairenin içinde
    fg_w = BW * (31.5 / RMAX)
    w(os.path.join(res, 'drawable/ic_launcher_fg.xml'), vec(108, 108, logo_vec(108, fg_w)))
    w(os.path.join(res, 'drawable/ic_launcher_mono.xml'), vec(108, 108, logo_vec(108, fg_w, '#FFFFFFFF')))
    # 4.30: bildirim simgesi zil değil logo (durum çubuğu tek renk ister; renk Reminders.setColor ile)
    w(os.path.join(res, 'drawable/ic_notif.xml'), vec(24, 24, logo_vec(24, 21, '#FFFFFFFF').replace('/>', ' android:strokeColor="#FFFFFFFF" android:strokeWidth="0.9" android:strokeLineJoin="round"/>')))
    bg = ('<path android:pathData="M0,0h108v108h-108z"><aapt:attr name="android:fillColor"><gradient android:type="radial" '
          'android:centerX="54" android:centerY="41" android:gradientRadius="84"><item android:offset="0" android:color="%s"/>'
          '<item android:offset="1" android:color="%s"/></gradient></aapt:attr></path>') % (BG_HI, BG_LO)
    w(os.path.join(res, 'drawable/ic_launcher_bg.xml'), vec(108, 108, bg))
    w(os.path.join(res, 'mipmap-anydpi-v26/ic_launcher.xml'),
      '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
      '    <background android:drawable="@drawable/ic_launcher_bg" />\n    <foreground android:drawable="@drawable/ic_launcher_fg" />\n'
      '    <monochrome android:drawable="@drawable/ic_launcher_mono" />\n</adaptive-icon>\n')

    # Açılış ekranı simgesi (Android 12+: 288dp kutu, 192dp daireye sığmalı). Web açılışı aynı boyutu kullanır.
    # Gündüz (values, drawable) ve gece (values-night, drawable-night) ayrı: telefonun temasını izler.
    sp_w = 72.0  # 4.18: üst çubuktaki logoya yakın boyut (web açılışında 66 px)
    for t, q, light in ((LIGHT, '', True), (DARK, '-night', False)):
        use(t)
        # 4.19: üst çubuktaki logo gibi, yazı rengiyle aynı (uygulama içindeki logo değişmez)
        # 4.20: tek açılış ekranı: Android'in kendi açılışında logo gösterilmez (yalnız zemin rengi); logo ve "Wallet" web açılışında
        # 4.34: logo Android'in kendi açılışında ilk andan görünür (geç gelmesin); web açılışındaki logoyla aynı boyut ve yerde (86 dp, ortada)
        w(os.path.join(res, 'drawable%s/splash_icon.xml' % q), vec(288, 288, logo_vec(288, 86, '#FF' + t['ink'].lstrip('#').upper())))
        lt = 'true' if light else 'false'
        w(os.path.join(res, 'values%s/splash.xml' % q),
          '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="splash">%s</color>\n'
          '    <!-- açılış teması: sistem açılış ekranı, sayfa çizilene kadar ekranda kalır (MainActivity) -->\n'
          '    <style name="LaunchTheme" parent="AppTheme">\n'
          '        <item name="android:windowBackground">@drawable/splash_bg</item>\n'
          '        <item name="android:statusBarColor">@color/splash</item>\n'
          '        <item name="android:navigationBarColor">@color/splash</item>\n'
          '        <item name="android:windowLightStatusBar">%s</item>\n'
          '        <item name="android:windowLightNavigationBar">%s</item>\n'
          '    </style>\n</resources>\n' % (t['bg'], lt, lt))
        w(os.path.join(res, 'values%s-v31/splash.xml' % q),
          '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
          '    <style name="LaunchTheme" parent="AppTheme">\n'
          '        <item name="android:windowBackground">@drawable/splash_bg</item>\n'
          '        <item name="android:statusBarColor">@color/splash</item>\n'
          '        <item name="android:navigationBarColor">@color/splash</item>\n'
          '        <item name="android:windowLightStatusBar">%s</item>\n'
          '        <item name="android:windowLightNavigationBar">%s</item>\n'
          '        <item name="android:windowSplashScreenBackground">@color/splash</item>\n'
          '        <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>\n'
          '    </style>\n</resources>\n' % (lt, lt))
    w(os.path.join(res, 'drawable/splash_bg.xml'),
      '<?xml version="1.0" encoding="utf-8"?>\n<!-- Android 10-11 açılışı: düz zemin + ortada logo -->\n'
      '<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n'
      '    <item><color android:color="@color/splash" /></item>\n'
      '    <item android:width="288dp" android:height="288dp" android:gravity="center" android:drawable="@drawable/splash_icon" />\n'
      '</layer-list>\n')

    # Web açılış ekranı (4.18): üst çubuktaki gibi; solda logo, sağda uygulamanın yazı tipiyle "Wallet".
    # Renkler arayüzden ve telefonun temasından; geçiş, parlama ve harf aralıklı yazı yok.
    logo_d = path_tf(1, BW / 2, BH / 2, 2)
    def mask(vw, vh, d):
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.1f %.1f"><path fill-rule="evenodd" d="%s"/></svg>' % (vw, vh, d)
        return 'url("data:image/svg+xml,%s")' % urllib.parse.quote(svg, safe=' /=:,.-#')
    # 4.34: logo ilk karede, ekranın tam ortasında (Android açılışındaki logoyla aynı yer); yazı altında belirir.
    # 4.32: sade açılış: düz arayüz zemini (ışık, geçiş, çizgi yok), uygulama içindeki logo gibi yazı renginde logo ve "Wallet".
    # Telefonun teması yerine uygulamada seçilen temayı izler (wallet-theme); Android'in kendi açılış zeminiyle aynı renk.
    css = (
        '#splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:%(dbg)s;transition:opacity .3s ease}'
        '#splash .sp-r{position:absolute;inset:0}'
        '/* yalnızca -webkit-mask: eski Android WebView içinde öneksiz mask öğeyi tümüyle gizler */'
        '#splash .sp-l{position:absolute;left:50%%;top:50%%;width:86px;height:55px;margin:-27.5px 0 0 -43px;background:%(dink)s;-webkit-mask:%(m1)s center/100%% 100%% no-repeat}'
        "#splash .sp-w{position:absolute;left:0;right:0;top:calc(50%% + 44px);text-align:center;font:700 30px/1 'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:-.01em;color:%(dink)s;animation:spIn .3s ease-out both}"
        '@media (prefers-color-scheme:light){#splash{background:%(lbg)s}#splash .sp-l{background:%(link)s}#splash .sp-w{color:%(link)s}}'
        '#splash.d{background:%(dbg)s}#splash.d .sp-l{background:%(dink)s}#splash.d .sp-w{color:%(dink)s}'
        '#splash.l{background:%(lbg)s}#splash.l .sp-l{background:%(link)s}#splash.l .sp-w{color:%(link)s}'
        '#splash.out{opacity:0}'
        '@keyframes spIn{from{opacity:0}to{opacity:1}}'
        '@media (prefers-reduced-motion:reduce){#splash .sp-w{animation:none}}'
    ) % dict(dbg=DARK['bg'], dink=DARK['ink'], lbg=LIGHT['bg'], link=LIGHT['ink'], m1=mask(BW, BH, logo_d))
    block = ('<!-- açılış:başla (tools/brand/build.py üretir) -->\n<style>%s</style>\n'
             '<div id="splash" aria-hidden="true"><div class="sp-r"><i class="sp-l"></i><span class="sp-w">Wallet</span></div></div>\n'
             "<script>try{var t=localStorage.getItem('wallet-theme');if(t==='dark'||t==='light')document.getElementById('splash').className=t.charAt(0);}catch(e){}</script>\n"
             '<!-- açılış:bitir -->') % css
    ip = os.path.join(ROOT, 'index.html')
    h = open(ip, encoding='utf-8').read()
    h2 = re.sub(r'<!-- açılış:başla.*?<!-- açılış:bitir -->', lambda m: block, h, flags=re.S)
    assert h2 != h or block in h, 'index.html içinde açılış işaretleri yok'
    open(ip, 'w', encoding='utf-8').write(h2)
    print('logo genişliği: simge %.1fdp, açılış %.1fdp' % (fg_w, sp_w))


if __name__ == '__main__':
    main()
