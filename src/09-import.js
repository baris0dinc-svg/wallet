
  /* ---------- banka ekstresi dosyaları: CSV (UTF-8, UTF-16, Windows-1254), Excel .xlsx, eski Excel .xls, HTML biçimli .xls ----------
   Dosya tabloya çevrilir, CSV metni olarak kutuya yazılır; içe aktarma csvImport ile yapılır (başlık satırı kendiliğinden bulunur). */
  function decodeText(u) {
    if (u[0] === 0xff && u[1] === 0xfe) return new TextDecoder('utf-16le').decode(u.subarray(2));
    if (u[0] === 0xfe && u[1] === 0xff) return new TextDecoder('utf-16be').decode(u.subarray(2));
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(u).replace(/^﻿/, '');
    } catch (e) {
      try {
        return new TextDecoder('windows-1254').decode(u);
      } catch (e2) {
        return new TextDecoder().decode(u);
      }
    }
  }
  function csvCell(v) {
    if (typeof v === 'number') {
      v = String(+v.toFixed(6)).replace('.', ',');
    }
    v = String(v == null ? '' : v);
    return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function rowsCsv(rows) {
    return rows
      .map(function (r) {
        return r.map(csvCell).join(';');
      })
      .join('\n');
  }
  function serialDate(v) {
    if (!(v > 59 && v < 2958466)) return v;
    var d = new Date(Math.round((v - 25569) * 864e5));
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }
  function isDateFmt(id, code) {
    if ((id >= 14 && id <= 22) || (id >= 45 && id <= 47) || (id >= 27 && id <= 36) || (id >= 50 && id <= 58))
      return true;
    if (!code) return false;
    var c = String(code)
      .replace(/"[^"]*"/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\\./g, '');
    return /[dy]/i.test(c) || (/m/i.test(c) && /[\/.\-]/.test(c) && !/h/i.test(c));
  }
  /* --- .xlsx: ZIP + XML --- */
  function unzip(buf) {
    var dv = new DataView(buf),
      u = new Uint8Array(buf),
      e = -1,
      files = {},
      td = new TextDecoder();
    for (var i = u.length - 22; i >= Math.max(0, u.length - 65558); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        e = i;
        break;
      }
    }
    if (e < 0) throw new Error('Dosya bozuk görünüyor.');
    var n = dv.getUint16(e + 10, true),
      p = dv.getUint32(e + 16, true);
    for (var k = 0; k < n && p + 46 <= u.length; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var meth = dv.getUint16(p + 10, true),
        cs = dv.getUint32(p + 20, true),
        nl = dv.getUint16(p + 28, true),
        xl = dv.getUint16(p + 30, true),
        cl = dv.getUint16(p + 32, true),
        lo = dv.getUint32(p + 42, true);
      var name = td.decode(u.subarray(p + 46, p + 46 + nl)),
        st = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
      files[name] = { m: meth, d: u.subarray(st, st + cs) };
      p += 46 + nl + xl + cl;
    }
    return files;
  }
  function unz(f) {
    if (!f) return Promise.resolve(null);
    if (f.m === 0) return Promise.resolve(new TextDecoder().decode(f.d));
    if (f.m !== 8) return Promise.reject(new Error('Desteklenmeyen sıkıştırma.'));
    if (typeof DecompressionStream === 'undefined')
      return Promise.reject(new Error('Bu cihaz Excel dosyasını açamıyor; dosyayı CSV olarak kaydedip dene.'));
    return new Response(new Blob([f.d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
  }
  function xdoc(t) {
    return new DOMParser().parseFromString(t, 'application/xml');
  }
  function xtags(n, name) {
    return Array.prototype.slice.call(n.getElementsByTagNameNS('*', name));
  }
  function colIdx(ref) {
    var m = /^([A-Z]+)/.exec(ref || ''),
      c = 0;
    if (!m) return -1;
    for (var i = 0; i < m[1].length; i++) c = c * 26 + m[1].charCodeAt(i) - 64;
    return c - 1;
  }
  function xlsxRows(buf) {
    var z = unzip(buf),
      names = Object.keys(z);
    return Promise.all([
      unz(z['xl/workbook.xml']),
      unz(z['xl/_rels/workbook.xml.rels']),
      unz(z['xl/sharedStrings.xml']),
      unz(z['xl/styles.xml'])
    ]).then(function (a) {
      var path = null,
        d1904 = a[0] && /date1904="(1|true)"/.test(a[0]);
      if (a[0] && a[1]) {
        var sh = xtags(xdoc(a[0]), 'sheet')[0],
          rid =
            sh &&
            (sh.getAttribute('r:id') ||
              sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
        if (rid) {
          var rel = xtags(xdoc(a[1]), 'Relationship').filter(function (r) {
            return r.getAttribute('Id') === rid;
          })[0];
          if (rel) {
            var tg = rel.getAttribute('Target') || '';
            path = tg.charAt(0) === '/' ? tg.slice(1) : 'xl/' + tg.replace(/^\.\//, '');
          }
        }
      }
      if (!path || !z[path])
        path = names
          .filter(function (n) {
            return /^xl\/worksheets\/sheet\d+\.xml$/.test(n);
          })
          .sort()[0];
      if (!path) throw new Error('Excel’de sayfa bulunamadı.');
      var sst = a[2]
        ? xtags(xdoc(a[2]), 'si').map(function (si) {
            return xtags(si, 't')
              .filter(function (t) {
                return !(t.parentNode && t.parentNode.localName === 'rPh');
              })
              .map(function (t) {
                return t.textContent;
              })
              .join('');
          })
        : [];
      var dst = {};
      if (a[3]) {
        var sd = xdoc(a[3]),
          fm = {};
        xtags(sd, 'numFmt').forEach(function (n) {
          fm[n.getAttribute('numFmtId')] = n.getAttribute('formatCode') || '';
        });
        var cx = xtags(sd, 'cellXfs')[0];
        if (cx)
          xtags(cx, 'xf').forEach(function (x, i) {
            var id = +x.getAttribute('numFmtId') || 0;
            dst[i] = isDateFmt(id, fm[id]);
          });
      }
      return unz(z[path]).then(function (t) {
        var rows = [];
        xtags(xdoc(t), 'row').forEach(function (r) {
          var ri = (+r.getAttribute('r') || rows.length + 1) - 1,
            row = [];
          xtags(r, 'c').forEach(function (c, ci) {
            var ix = colIdx(c.getAttribute('r'));
            if (ix < 0) ix = ci;
            var ty = c.getAttribute('t'),
              v = xtags(c, 'v')[0],
              val;
            if (ty === 's') val = sst[+(v && v.textContent)] || '';
            else if (ty === 'inlineStr')
              val = xtags(c, 't')
                .map(function (x) {
                  return x.textContent;
                })
                .join('');
            else if (ty === 'str' || ty === 'e') val = v ? v.textContent : '';
            else if (ty === 'b') val = v && v.textContent === '1' ? 'DOĞRU' : 'YANLIŞ';
            else if (!v) val = '';
            else {
              val = +v.textContent;
              if (isNaN(val)) val = v.textContent;
              else if (dst[+c.getAttribute('s') || 0]) val = serialDate(d1904 ? val + 1462 : val);
            }
            row[ix] = val;
          });
          rows[ri] = row;
        });
        return tidy(rows);
      });
    });
  }
  function tidy(rows) {
    return rows
      .filter(Boolean)
      .map(function (r) {
        var o = [];
        for (var i = 0; i < r.length; i++) o.push(r[i] == null ? '' : r[i]);
        return o;
      })
      .filter(function (r) {
        return r.some(function (x) {
          return String(x).trim() !== '';
        });
      });
  }
  /* --- eski .xls (BIFF8): bileşik dosya içindeki Workbook akışı --- */
  function cfbStream(u, want) {
    var dv = new DataView(u.buffer, u.byteOffset, u.byteLength),
      ssz = 1 << dv.getUint16(0x1e, true),
      mss = 1 << dv.getUint16(0x20, true),
      nFat = dv.getUint32(0x2c, true),
      dir0 = dv.getInt32(0x30, true),
      cut = dv.getUint32(0x38, true),
      mf0 = dv.getInt32(0x3c, true),
      ds = dv.getInt32(0x44, true);
    var off = function (s) {
        return (s + 1) * ssz;
      },
      i32 = function (o) {
        return o + 4 <= u.length ? dv.getInt32(o, true) : -2;
      },
      fs = [],
      g = 0,
      j;
    for (j = 0; j < 109 && fs.length < nFat; j++) {
      var s0 = i32(0x4c + j * 4);
      if (s0 >= 0) fs.push(s0);
    }
    while (ds >= 0 && fs.length < nFat && g++ < 1e4) {
      for (j = 0; j < ssz / 4 - 1 && fs.length < nFat; j++) {
        var s1 = i32(off(ds) + j * 4);
        if (s1 >= 0) fs.push(s1);
      }
      ds = i32(off(ds) + ssz - 4);
    }
    var fat = [];
    fs.forEach(function (s) {
      for (var k = 0; k < ssz / 4; k++) fat.push(i32(off(s) + k * 4));
    });
    var chain = function (s, t) {
      var o = [],
        n = 0;
      while (s >= 0 && n++ < 2e6) {
        o.push(s);
        s = t[s];
        if (s === undefined) break;
      }
      return o;
    };
    var read = function (s) {
      var c = chain(s, fat),
        b = new Uint8Array(c.length * ssz);
      c.forEach(function (x, i) {
        b.set(u.subarray(off(x), Math.min(u.length, off(x) + ssz)), i * ssz);
      });
      return b;
    };
    var dir = read(dir0),
      dd = new DataView(dir.buffer),
      ents = [];
    for (var p = 0; p + 128 <= dir.length; p += 128) {
      var nl = dd.getUint16(p + 64, true),
        nm = '';
      for (var q = 0; q < Math.max(0, nl / 2 - 1); q++) nm += String.fromCharCode(dd.getUint16(p + q * 2, true));
      ents.push({ n: nm, t: dir[p + 66], s: dd.getInt32(p + 116, true), z: dd.getUint32(p + 120, true) });
    }
    var root = ents.filter(function (e) {
        return e.t === 5;
      })[0],
      e = ents.filter(function (x) {
        return x.t === 2 && want.indexOf(x.n) >= 0;
      })[0];
    if (!e) throw new Error('Excel çalışma kitabı bulunamadı.');
    if (e.z < cut && root) {
      var ms = read(root.s),
        mfat = [];
      chain(mf0, fat).forEach(function (s) {
        for (var k = 0; k < ssz / 4; k++) mfat.push(i32(off(s) + k * 4));
      });
      var mc = chain(e.s, mfat),
        b = new Uint8Array(mc.length * mss);
      mc.forEach(function (x, i) {
        b.set(ms.subarray(x * mss, x * mss + mss), i * mss);
      });
      return b.subarray(0, e.z);
    }
    return read(e.s).subarray(0, e.z);
  }
  function xlStr(d, o) {
    var cch = d[o] | (d[o + 1] << 8),
      fl = d[o + 2],
      p = o + 3,
      s = '',
      i;
    if (fl & 0x08) p += 2;
    if (fl & 0x04) p += 4;
    if (fl & 1) {
      for (i = 0; i < cch && p + 1 < d.length; i++, p += 2) s += String.fromCharCode(d[p] | (d[p + 1] << 8));
    } else {
      for (i = 0; i < cch && p < d.length; i++, p++) s += String.fromCharCode(d[p]);
    }
    return s;
  }
  function xlRk(n) {
    var v;
    if (n & 2) v = n >> 2;
    else {
      var b = new DataView(new ArrayBuffer(8));
      b.setUint32(4, (n & 0xfffffffc) >>> 0, true);
      v = b.getFloat64(0, true);
    }
    return n & 1 ? v / 100 : v;
  }
  /* paylaşılan metin tablosu; metinler CONTINUE kayıtlarına bölünebilir */
  function xlSst(segs) {
    var si = 0,
      cur = segs[0],
      p = 8,
      out = [],
      tot = new DataView(cur.buffer, cur.byteOffset, cur.byteLength).getUint32(4, true);
    var next = function () {
      if (p >= cur.length && si + 1 < segs.length) {
        cur = segs[++si];
        p = 0;
      }
    };
    var b8 = function () {
        next();
        return p < cur.length ? cur[p++] : 0;
      },
      b16 = function () {
        var a = b8();
        return a | (b8() << 8);
      };
    var skip = function (n) {
      while (n > 0) {
        next();
        if (p >= cur.length) return;
        var t = Math.min(n, cur.length - p);
        p += t;
        n -= t;
      }
    };
    for (var k = 0; k < tot; k++) {
      next();
      if (p >= cur.length) break;
      var cch = b16(),
        fl = b8(),
        rt = 0,
        ex = 0,
        hi = fl & 1,
        s = '';
      if (fl & 0x08) rt = b16();
      if (fl & 0x04) {
        ex = b16();
        ex += b16() * 65536;
      }
      while (cch > 0) {
        if (p >= cur.length) {
          if (si + 1 >= segs.length) break;
          cur = segs[++si];
          p = 0;
          hi = cur[p++] & 1;
        }
        var av = cur.length - p,
          n = hi ? Math.min(cch, av >> 1) : Math.min(cch, av);
        if (!n) {
          if (si + 1 >= segs.length) break;
          cur = segs[++si];
          p = 0;
          hi = cur[p++] & 1;
          continue;
        }
        for (var i = 0; i < n; i++) {
          s += String.fromCharCode(hi ? cur[p] | (cur[p + 1] << 8) : cur[p]);
          p += hi ? 2 : 1;
        }
        cch -= n;
      }
      skip(rt * 4 + ex);
      out.push(s);
    }
    return out;
  }
  function xlsRows(u) {
    var w = cfbStream(u, ['Workbook', 'Book']),
      dv = new DataView(w.buffer, w.byteOffset, w.byteLength),
      p = 0,
      recs = [];
    while (p + 4 <= w.length) {
      var ty = dv.getUint16(p, true),
        ln = dv.getUint16(p + 2, true);
      recs.push([ty, w.subarray(p + 4, Math.min(w.length, p + 4 + ln))]);
      p += 4 + ln;
    }
    var sst = [],
      xf = [],
      fmt = {},
      rows = [],
      bof = 0,
      inS = false,
      lastF = null,
      d1904 = false;
    var setc = function (r, c, v) {
      (rows[r] = rows[r] || [])[c] = v;
    };
    var numc = function (n, x) {
      var f = xf[x];
      return isDateFmt(f, fmt[f]) ? serialDate(d1904 ? n + 1462 : n) : n;
    };
    for (var i = 0; i < recs.length; i++) {
      var ty = recs[i][0],
        d = recs[i][1],
        v = new DataView(d.buffer, d.byteOffset, d.byteLength);
      if (ty === 0x0809) {
        bof++;
        if (bof === 2) inS = true;
        continue;
      }
      if (ty === 0x000a) {
        if (inS) break;
        continue;
      }
      if (!inS) {
        if (ty === 0x00fc) {
          var segs = [d];
          while (i + 1 < recs.length && recs[i + 1][0] === 0x003c) segs.push(recs[++i][1]);
          sst = xlSst(segs);
        } else if (ty === 0x00e0 && d.length >= 4) xf.push(v.getUint16(2, true));
        else if (ty === 0x041e && d.length >= 5) fmt[v.getUint16(0, true)] = xlStr(d, 2);
        else if (ty === 0x0022 && d.length >= 2) d1904 = v.getUint16(0, true) === 1;
        continue;
      }
      if (ty === 0x0207) {
        if (lastF) {
          var f = lastF;
          lastF = null;
          setc(f[0], f[1], xlStr(d, 0));
        }
        continue;
      }
      if (d.length < 6) continue;
      var r = v.getUint16(0, true),
        c = v.getUint16(2, true);
      if (ty === 0x00fd && d.length >= 10) setc(r, c, sst[v.getUint32(6, true)] || '');
      else if (ty === 0x0203 && d.length >= 14) setc(r, c, numc(v.getFloat64(6, true), v.getUint16(4, true)));
      else if (ty === 0x027e && d.length >= 10) setc(r, c, numc(xlRk(v.getUint32(6, true)), v.getUint16(4, true)));
      else if (ty === 0x00bd) {
        var nn = Math.floor((d.length - 6) / 6);
        for (var k = 0; k < nn; k++)
          setc(r, c + k, numc(xlRk(v.getUint32(4 + k * 6 + 2, true)), v.getUint16(4 + k * 6, true)));
      } else if (ty === 0x0204 || ty === 0x00d6) setc(r, c, xlStr(d, 6));
      else if (ty === 0x0006 && d.length >= 14) {
        if (v.getUint16(12, true) === 0xffff) {
          if (d[6] === 0) lastF = [r, c];
          else setc(r, c, d[6] === 1 ? (d[8] ? 'DOĞRU' : 'YANLIŞ') : '');
        } else setc(r, c, numc(v.getFloat64(6, true), v.getUint16(4, true)));
      } else if (ty === 0x0205) setc(r, c, d[7] ? '' : d[6] ? 'DOĞRU' : 'YANLIŞ');
    }
    return tidy(rows);
  }
  function htmlRows(t) {
    var d = new DOMParser().parseFromString(t, 'text/html'),
      rows = [];
    Array.prototype.forEach.call(d.querySelectorAll('tr'), function (tr) {
      if (tr.querySelector('tr')) return;
      var r = Array.prototype.map.call(tr.querySelectorAll('th,td'), function (c) {
        return (c.textContent || '').replace(/\s+/g, ' ').trim();
      });
      if (r.some(Boolean)) rows.push(r);
    });
    return rows;
  }
  /* dosya → {text, info} */
  function sheetText(buf) {
    var u = new Uint8Array(buf);
    if (u[0] === 0x50 && u[1] === 0x4b)
      return xlsxRows(buf).then(function (r) {
        return { text: rowsCsv(r), info: 'Excel tablosu, ' + r.length + ' satır' };
      });
    if (u[0] === 0xd0 && u[1] === 0xcf && u[2] === 0x11 && u[3] === 0xe0) {
      try {
        var r = xlsRows(u);
        return Promise.resolve({ text: rowsCsv(r), info: 'Excel tablosu (.xls), ' + r.length + ' satır' });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    var t = decodeText(u);
    if (/<table[\s>]/i.test(t)) {
      var h = htmlRows(t);
      return Promise.resolve({ text: rowsCsv(h), info: 'Excel tablosu, ' + h.length + ' satır' });
    }
    return Promise.resolve({ text: t.replace(/^﻿/, ''), info: 'metin dosyası' });
  }
  function impFile(f) {
    var nm = document.getElementById('im-file-name'),
      ta = document.getElementById('im-txt'),
      fr = new FileReader();
    if (nm) nm.textContent = f.name + ' okunuyor…';
    fr.onload = function () {
      sheetText(fr.result).then(
        function (r) {
          if (ta) ta.value = r.text;
          if (nm) nm.textContent = f.name + ' · ' + r.info + '. Kontrol edip “İçe aktar”a dokun.';
        },
        function (e) {
          if (ta) ta.value = '';
          if (nm) nm.textContent = f.name + ': ' + ((e && e.message) || 'okunamadı');
        }
      );
    };
    fr.onerror = function () {
      if (nm) nm.textContent = 'Dosya okunamadı.';
    };
    fr.readAsArrayBuffer(f);
  }

