
  /* ---------- 4.12: fiş fotoğrafı ----------
   Fotoğraf küçültülür (en uzun kenar 1600 px, JPEG) ve cihazdaki IndexedDB'de tutulur; işlemde yalnız t.rc=1 işareti olur.
   Normal yedeğe girmez (yedek küçük ve hızlı kalsın); Veri ve yedek › Fiş fotoğrafları ayrı bir yedek dosyası üretir.
   Silinen işlemlerin fotoğrafları açılıştan biraz sonra temizlenir. */
  var RDB = null;
  function rcDb() {
    if (RDB) return RDB;
    RDB = new Promise(function (res, rej) {
      if (!window.indexedDB) {
        rej(new Error('idb'));
        return;
      }
      var q;
      try {
        q = indexedDB.open('wallet-media', 1);
      } catch (e) {
        rej(e);
        return;
      }
      q.onupgradeneeded = function () {
        q.result.createObjectStore('rc');
      };
      q.onsuccess = function () {
        res(q.result);
      };
      q.onerror = function () {
        rej(q.error);
      };
      q.onblocked = function () {
        rej(new Error('blocked'));
      };
    });
    RDB.catch(function () {
      RDB = null;
    });
    return RDB;
  }
  function rcReq(mode, fn) {
    return rcDb().then(function (db) {
      return new Promise(function (res, rej) {
        var tr = db.transaction('rc', mode),
          rq = fn(tr.objectStore('rc'));
        tr.oncomplete = function () {
          res(rq ? rq.result : undefined);
        };
        tr.onerror = function () {
          rej(tr.error);
        };
        tr.onabort = function () {
          rej(tr.error);
        };
      });
    });
  }
  function rcPut(id, blob) {
    return rcReq('readwrite', function (st) {
      return st.put({ b: blob, ts: Date.now() }, String(id));
    });
  }
  function rcGet(id) {
    return rcReq('readonly', function (st) {
      return st.get(String(id));
    }).then(function (v) {
      return (v && v.b) || null;
    });
  }
  function rcDel(id) {
    return rcReq('readwrite', function (st) {
      return st.delete(String(id));
    });
  }
  function rcKeys() {
    return rcReq('readonly', function (st) {
      return st.getAllKeys();
    });
  }
  function rcAll() {
    return rcReq('readonly', function (st) {
      return st.getAll();
    }).then(function (vals) {
      return rcKeys().then(function (ks) {
        var o = {};
        ks.forEach(function (k, i) {
          if (vals[i] && vals[i].b) o[k] = vals[i].b;
        });
        return o;
      });
    });
  }
  /* fotoğrafı küçült: EXIF yönü tarayıcıca uygulanır; şeffaf alan beyaz olur */
  function rcShrink(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file),
        im = new Image();
      im.onload = function () {
        var w = im.naturalWidth,
          h = im.naturalHeight,
          s = Math.min(1, 1600 / Math.max(w, h, 1)),
          c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * s));
        c.height = Math.max(1, Math.round(h * s));
        var x = c.getContext('2d');
        x.fillStyle = '#fff';
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(
          function (b) {
            if (b) res(b);
            else rej(new Error('blob'));
          },
          'image/jpeg',
          0.72
        );
      };
      im.onerror = function () {
        URL.revokeObjectURL(u);
        rej(new Error('img'));
      };
      im.src = u;
    });
  }
  /* işlem penceresindeki fotoğraf alanı: ui.rcPend yeni seçilen (henüz kaydedilmedi), ui.rcDel kaldırılacak */
  var RCURL = null;
  function rcFree() {
    if (RCURL) {
      try {
        URL.revokeObjectURL(RCURL);
      } catch (e) {}
      RCURL = null;
    }
  }
  function rcHas(t) {
    return !!ui.rcPend || (!!(t && t.rc) && !ui.rcDel);
  }
  function rcField(t) {
    return (
      '<div class="field" id="row-rc"><span class="flbl">Fiş fotoğrafı</span><div id="rc-box" class="rcbox">' +
      rcBox(t) +
      '</div></div>'
    );
  }
  function rcBox(t) {
    if (!rcHas(t))
      return (
        '<label class="btn ghost filebtn rcadd">' +
        ic('camera') +
        '<span>Fotoğraf ekle</span><input type="file" id="rc-file" accept="image/*"></label>'
      );
    return (
      '<button class="rcthumb" data-act="rc-view" aria-label="Fiş fotoğrafını büyüt"><img id="rc-img" alt="Fiş fotoğrafı"><span class="small muted" id="rc-msg">Yükleniyor…</span></button>' +
      '<div class="rcacts"><label class="btn small ghost filebtn">Değiştir<input type="file" id="rc-file" accept="image/*"></label><button class="btn small ghost" data-act="rc-rm">Kaldır</button></div>'
    );
  }
  function rcFill(t) {
    var img = document.getElementById('rc-img'),
      m = document.getElementById('rc-msg');
    if (!img) return;
    rcFree();
    var show = function (b) {
      if (!b) {
        if (m) m.textContent = 'Fotoğraf bu cihazda yok (yedekten yüklenmiş olabilir).';
        img.hidden = true;
        return;
      }
      RCURL = URL.createObjectURL(b);
      img.src = RCURL;
      img.hidden = false;
      if (m) m.hidden = true;
    };
    if (ui.rcPend) {
      show(ui.rcPend);
      return;
    }
    if (t && t.rc)
      rcGet(t.id).then(show, function () {
        show(null);
      });
  }
  function rcRedraw() {
    var box = document.getElementById('rc-box');
    if (!box) return;
    box.innerHTML = rcBox(txOrig);
    rcFill(txOrig);
  }
  function rcPick(f) {
    if (!f) return;
    var box = document.getElementById('rc-box');
    if (box) box.insertAdjacentHTML('beforeend', '<div class="small muted" id="rc-wait">Fotoğraf hazırlanıyor…</div>');
    rcShrink(f).then(
      function (b) {
        ui.rcPend = b;
        ui.rcDel = false;
        rcRedraw();
      },
      function () {
        var w = document.getElementById('rc-wait');
        if (w) w.remove();
        toast('Bu fotoğraf açılamadı. JPEG ya da PNG olarak seçmeyi dene.');
      }
    );
  }
  ACT['rc-rm'] = function () {
    ui.rcPend = null;
    ui.rcDel = !!(txOrig && txOrig.rc);
    rcRedraw();
  };
  ACT['rc-view'] = function () {
    if (!RCURL) return;
    var v = document.createElement('div');
    v.id = 'rcview';
    v.className = 'rcview';
    v.setAttribute('role', 'dialog');
    v.setAttribute('aria-label', 'Fiş fotoğrafı');
    v.innerHTML =
      '<img src="' +
      RCURL +
      '" alt="Fiş fotoğrafı"><button class="icon-btn" data-act="rc-close" aria-label="Kapat">' +
      ic('x') +
      '</button>';
    v.addEventListener('click', function (e) {
      if (e.target === v || e.target.tagName === 'IMG') v.remove();
    });
    document.body.appendChild(v);
  };
  ACT['rc-close'] = function () {
    var v = document.getElementById('rcview');
    if (v) v.remove();
  };
  /* kayıt: işlem kaydedilince bekleyen fotoğraf yazılır ya da kaldırılır */
  function rcCommit(id) {
    var t = byId(S.tx, id),
      p = ui.rcPend,
      d = ui.rcDel;
    ui.rcPend = null;
    ui.rcDel = false;
    if (!t) return;
    if (p) {
      t.rc = 1;
      S.rcUsed = 1;
      rcPut(id, p).catch(function () {
        var x = byId(S.tx, id);
        if (x) {
          delete x.rc;
          save();
        }
        toast('Fiş fotoğrafı kaydedilemedi: cihaz deposu dolu olabilir.');
      });
    } else if (d) {
      delete t.rc;
      rcDel(id).catch(function () {});
    }
  }
  /* artık olmayan işlemlerin fotoğrafları temizlenir */
  function rcGc() {
    if (!S.rcUsed) return Promise.resolve(0);
    return rcKeys().then(
      function (ks) {
        var ids = {};
        S.tx.forEach(function (t) {
          ids[t.id] = 1;
        });
        var old = ks.filter(function (k) {
          return !ids[k];
        });
        return Promise.all(old.map(rcDel)).then(function () {
          return old.length;
        });
      },
      function () {
        return 0;
      }
    );
  }
  /* fotoğraf yedeği: {walletMedia:1, items:{işlemKimliği: dataURL}} */
  function blobUrl(b) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        res(String(fr.result));
      };
      fr.onerror = function () {
        rej(fr.error);
      };
      fr.readAsDataURL(b);
    });
  }
  function urlBlob(u) {
    var m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(u || ''));
    if (!m) return null;
    var a = unb64(m[2]);
    return new Blob([a], { type: m[1] });
  }
  ACT['rc-bk'] = function () {
    rcAll().then(
      function (o) {
        var ids = {};
        S.tx.forEach(function (t) {
          ids[t.id] = 1;
        });
        var ks = Object.keys(o).filter(function (k) {
          return ids[k];
        });
        if (!ks.length) {
          msg('Yedeklenecek fiş fotoğrafı yok.', false, 'f-rcm');
          return;
        }
        return Promise.all(
          ks.map(function (k) {
            return blobUrl(o[k]);
          })
        ).then(function (us) {
          var it = {};
          ks.forEach(function (k, i) {
            it[k] = us[i];
          });
          saveFile(
            'wallet-fisler-' + todayS() + '.json',
            JSON.stringify({ walletMedia: 1, ts: Date.now(), items: it }),
            ks.length + ' fiş fotoğrafı kaydedildi.',
            'f-rcm'
          );
        });
      },
      function () {
        msg('Fotoğraflar okunamadı.', false, 'f-rcm');
      }
    );
  };
  function rcImport(txt) {
    var o;
    try {
      o = JSON.parse(txt);
    } catch (e) {
      o = null;
    }
    if (!o || !o.walletMedia || !o.items || typeof o.items !== 'object') {
      msg('Bu bir fiş fotoğrafı yedeği değil.', false, 'f-rcm');
      return;
    }
    var ks = Object.keys(o.items).filter(function (k) {
        return /^[\w.:-]{1,64}$/.test(k);
      }),
      n = 0,
      jobs = [];
    if (ks.length) S.rcUsed = 1;
    ks.forEach(function (k) {
      var b = urlBlob(o.items[k]);
      if (!b) return;
      n++;
      jobs.push(rcPut(k, b));
      var t = byId(S.tx, k);
      if (t) t.rc = 1;
    });
    Promise.all(jobs).then(
      function () {
        save();
        render();
        msg(n + ' fiş fotoğrafı yüklendi.', true, 'f-rcm');
      },
      function () {
        msg('Fotoğraflar yazılamadı: cihaz deposu dolu olabilir.', false, 'f-rcm');
      }
    );
  }
  function rcStats() {
    return rcAll().then(function (o) {
      var n = 0,
        sz = 0;
      Object.keys(o).forEach(function (k) {
        if (byId(S.tx, k)) {
          n++;
          sz += o[k].size || 0;
        }
      });
      return { n: n, sz: sz };
    });
  }
  function rcSec() {
    var n = S.tx.filter(function (t) {
      return t.rc;
    }).length;
    return sec(
      'Fiş fotoğrafları',
      '<div class="small muted" id="rc-stat">' +
        (n
          ? n + ' işlemde fotoğraf var.'
          : 'Henüz fiş fotoğrafı yok. İşlem penceresindeki “Fotoğraf ekle” ile eklenir.') +
        '</div>' +
        (n ? '<button class="btn ghost" data-act="rc-bk">Fotoğrafları yedekle</button>' : '') +
        '<label class="btn ghost filebtn">Fotoğraf yedeğini yükle<input id="rcm-file" type="file" accept=".json,application/json,text/plain"></label><div class="err" id="f-rcm"></div>',
      'Fotoğraflar bu cihazda tutulur ve normal yedeğe girmez (yedek küçük kalsın diye). Telefon değiştirirken fotoğraf yedeğini de al; önce normal yedeği, sonra fotoğraf yedeğini yükle.'
    );
  }
  function rcStatFill() {
    var e = document.getElementById('rc-stat');
    if (!e) return;
    rcStats().then(
      function (s) {
        if (s.n) e.textContent = s.n + ' fotoğraf · ' + NUM1.format(s.sz / 1048576) + ' MB';
      },
      function () {}
    );
  }

