# 4.28 Excel dosyası denetimi: openpyxl ile açılır mı, sayfalar, formüller ve özel karakterler doğru mu
import sys
try:
    import openpyxl
except ImportError:
    print('OK (openpyxl yok, yalnızca ZIP denetlendi)'); import zipfile; zipfile.ZipFile(sys.argv[1]).testzip(); sys.exit(0)
wb = openpyxl.load_workbook(sys.argv[1])
err = []
if wb.sheetnames != ['Aylık özet', 'İşlemler']: err.append('sayfalar %r' % wb.sheetnames)
a = wb['Aylık özet']; t = wb['İşlemler']
hdr = [c.value for c in t[1]]
if hdr[:5] != ['Tarih', 'Tür', 'Kategori', 'Alt kategori', 'Tutar']: err.append('başlık %r' % hdr)
notes = [r[9].value for r in t.iter_rows(min_row=2)]
if 'A & <B> "q"' not in notes: err.append('özel karakterli not yok')
dates = [r[0].value for r in t.iter_rows(min_row=2)]
if not all(hasattr(x, 'year') for x in dates): err.append('tarih hücreleri tarih değil')
xs = [r for r in t.iter_rows(min_row=2) if r[9].value == 'xs']
if not xs or xs[0][10].value != 'Hayır': err.append('istatistik dışı sütunu')
col = [c.value for c in a['A']]
for need in ['Toplam gider', 'Gelir', 'Net (gelir − gider)', 'Birikim oranı']:
    if need not in col: err.append('özet satırı yok: ' + need)
rowT = col.index('Toplam gider') + 1
f = a.cell(row=rowT, column=2).value
if not (isinstance(f, str) and f.startswith('=SUM(')): err.append('toplam formülü %r' % f)
if a.cell(row=2, column=a.max_column - 1).value is None or not str(a.cell(row=2, column=a.max_column - 1).value).startswith('=SUM('): err.append('satır toplamı formülü')
vals = [a.cell(row=i, column=2).value for i in range(2, rowT)]
if any(v == 99 for v in vals): err.append('istatistik dışı özete girdi')
print('OK' if not err else 'HATA: ' + '; '.join(err))
