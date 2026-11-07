#!/usr/bin/env python3
"""Borsa İstanbul hisse listesi (kod, ad, sektör, son kapanış) → bist.json
İş Yatırım'ın 'Temel Değerler ve Oranlar' sayfasından okunur. Uygulama aramada adları buradan bulur;
tarayıcıda (Android uygulaması dışında) fiyat için de bu dosyayı kullanır.
Kullanım: python3 tools/bist_list.py [çıktı yolu]   (300'den az hisse bulunursa dosyaya dokunmaz)"""
import datetime, html, json, re, sys, urllib.request

URL = "https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/Temel-Degerler-Ve-Oranlar.aspx"
out_path = sys.argv[1] if len(sys.argv) > 1 else "bist.json"
req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"})
page = urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "replace")
body = page.split('id="temelTBody_Ozet"', 1)
if len(body) < 2:
    sys.exit("tablo bulunamadı")
body = body[1].split("</tbody>", 1)[0]


def num(s):
    s = s.strip().replace(".", "").replace(",", ".")
    try:
        return round(float(s), 4)
    except ValueError:
        return 0


rows = []
for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", body, re.S):
    cells = [html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
    if len(cells) < 4 or not re.fullmatch(r"[A-Z0-9]{3,6}", cells[0]):
        continue
    rows.append([cells[0], re.sub(r"\s+", " ", cells[1]), cells[2], num(cells[3])])
rows.sort(key=lambda r: r[0])
if len(rows) < 300:
    sys.exit("az hisse bulundu: %d" % len(rows))
stamp = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=3))).isoformat(timespec="minutes")
json.dump({"u": stamp, "l": rows}, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("bist.json:", len(rows), "hisse")
