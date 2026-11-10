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
    w(os.path.join(res, 'drawable/ic_notif.xml'), vec(24, 24, logo_vec(24, 22, '#FFFFFFFF')))
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
        w(os.path.join(res, 'drawable%s/splash_icon.xml' % q), vec(288, 288, '<path android:fillColor="#00000000" android:pathData="M0,0h1v1h-1z"/>'))
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
    # 4.30: daha özenli açılış: logo üstte (marka renk geçişiyle), altında "Wallet" ve kısa alt yazı; arkada hafif ışık,
    # altta dolan ince çizgi (açılış süresi kadar). Telefonun temasını izler; hareket azaltılmışsa animasyon yok.
    css = (
        '#splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;'
        'background:radial-gradient(120%% 70%% at 50%% 38%%,%(dhi)s 0%%,%(dbg)s 58%%,%(dlo)s 100%%);transition:opacity .45s ease,transform .45s ease}'
        '#splash .sp-r{position:relative;display:flex;flex-direction:column;align-items:center}'
        '#splash .sp-g{position:absolute;left:50%%;top:34px;width:220px;height:220px;margin:-110px 0 0 -110px;border-radius:50%%;'
        'background:radial-gradient(circle,%(dglow)s 0%%,transparent 68%%);opacity:0;animation:spGlow 1.3s ease-out .1s both}'
        '/* yalnızca -webkit-mask: eski Android WebView içinde öneksiz mask öğeyi tümüyle gizler */'
        '#splash .sp-l{position:relative;display:block;width:108px;height:68px;'
        'background:linear-gradient(135deg,%(dl0)s 0%%,%(dl1)s 55%%,%(dl2)s 100%%);-webkit-mask:%(m1)s center/100%% 100%% no-repeat;'
        'animation:spLogo .7s cubic-bezier(.2,.8,.2,1) both}'
        "#splash .sp-w{position:relative;margin-top:22px;font:700 34px/1 'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;"
        'letter-spacing:-.01em;color:%(dink)s;animation:spUp .6s cubic-bezier(.2,.8,.2,1) .12s both}'
        "#splash .sp-t{position:relative;margin-top:10px;font:500 14px/1.2 'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;"
        'color:%(dmut)s;animation:spUp .6s cubic-bezier(.2,.8,.2,1) .24s both}'
        '#splash .sp-b{position:absolute;left:50%%;bottom:calc(56px + env(safe-area-inset-bottom,0px));width:72px;height:3px;margin-left:-36px;'
        'border-radius:3px;background:%(dtrk)s;overflow:hidden}'
        '#splash .sp-b i{display:block;height:100%%;width:100%%;border-radius:3px;background:%(dac)s;transform-origin:left;animation:spBar 1.2s cubic-bezier(.4,0,.2,1) both}'
        '@media (prefers-color-scheme:light){#splash{background:radial-gradient(120%% 70%% at 50%% 38%%,%(lhi)s 0%%,%(lbg)s 58%%,%(llo)s 100%%)}'
        '#splash .sp-g{background:radial-gradient(circle,%(lglow)s 0%%,transparent 68%%)}'
        '#splash .sp-l{background:linear-gradient(135deg,%(ll0)s 0%%,%(ll1)s 55%%,%(ll2)s 100%%)}#splash .sp-w{color:%(link)s}#splash .sp-t{color:%(lmut)s}'
        '#splash .sp-b{background:%(ltrk)s}#splash .sp-b i{background:%(lac)s}}'
        '#splash.out{opacity:0;transform:scale(1.03)}'
        '@keyframes spLogo{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}'
        '@keyframes spUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
        '@keyframes spGlow{0%%{opacity:0;transform:scale(.6)}55%%{opacity:1}100%%{opacity:.7;transform:none}}'
        '@keyframes spBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}'
        '@media (prefers-reduced-motion:reduce){#splash .sp-l,#splash .sp-w,#splash .sp-t,#splash .sp-g,#splash .sp-b i{animation:none}#splash .sp-g{opacity:.7}#splash.out{transform:none}}'
    ) % dict(dbg=DARK['bg'], dhi='#16231D', dlo='#0A100D', dglow='rgba(63,191,159,.22)', dl0=DARK['logo'][0], dl1=DARK['logo'][1], dl2=DARK['logo'][2],
             dink=DARK['ink'], dmut='#8A9A93', dtrk='rgba(231,238,234,.12)', dac=DARK['accent'],
             lbg=LIGHT['bg'], lhi='#FFFFFF', llo='#E4EAE5', lglow='rgba(14,107,88,.12)', ll0=LIGHT['logo'][0], ll1=LIGHT['logo'][1], ll2=LIGHT['logo'][2],
             link=LIGHT['ink'], lmut='#5E6E67', ltrk='rgba(19,32,27,.1)', lac=LIGHT['accent'], m1=mask(BW, BH, logo_d))
    block = ('<!-- açılış:başla (tools/brand/build.py üretir) -->\n<style>%s</style>\n'
             '<div id="splash" aria-hidden="true"><div class="sp-r"><i class="sp-g"></i><i class="sp-l"></i><span class="sp-w">Wallet</span>'
             '<span class="sp-t">Paranın tamamı tek yerde</span></div><div class="sp-b"><i></i></div></div>\n<!-- açılış:bitir -->') % css
    ip = os.path.join(ROOT, 'index.html')
    h = open(ip, encoding='utf-8').read()
    h2 = re.sub(r'<!-- açılış:başla.*?<!-- açılış:bitir -->', lambda m: block, h, flags=re.S)
    assert h2 != h or block in h, 'index.html içinde açılış işaretleri yok'
    open(ip, 'w', encoding='utf-8').write(h2)
    print('logo genişliği: simge %.1fdp, açılış %.1fdp' % (fg_w, sp_w))


if __name__ == '__main__':
    main()
