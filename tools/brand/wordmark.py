"""Yazı tipinden 'WALLET' kelimesini SVG yoluna çevirir (yazı tipi dosyası uygulamaya gömülmez)."""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

def wordmark(font, text, size, tracking=0.0, wght=None):
    f = TTFont(font)
    if wght is not None and 'fvar' in f:
        from fontTools.varLib import instancer
        f = instancer.instantiateVariableFont(f, {'wght': wght})
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    s = size / upm; x = 0.0; pen = SVGPathPen(gs); n = len(text)
    asc = f['OS/2'].sCapHeight or f['hhea'].ascent * 0.7
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, x, asc * s))
        gs[g].draw(tp)
        x += gs[g].width * s + (tracking * size if i < n - 1 else 0)
    return pen.getCommands(), x, asc * s
