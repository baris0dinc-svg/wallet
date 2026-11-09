
  /* ---------- Claude'a sor ----------
   Finansal durumun kısa bir özeti hazırlanır; kullanıcı görüp düzenledikten sonra Claude'a kendisi gönderir.
   Uygulama hiçbir yere veri göndermez: metin panoya kopyalanır, Claude açılır ya da paylaşım menüsü kullanılır.
   Hesap adları, işlem notları ve kişisel bilgiler özete girmez. */
  var AIQ = [
    [
      'genel',
      'Genel değerlendirme',
      'Finansal durumumu değerlendir; güçlü ve zayıf yönlerimi, önceliklerimi sırayla yaz.'
    ],
    ['butce', 'Bütçe', 'Harcamalarımı ve bütçemi değerlendir; nerede, ne kadar kısabileceğimi somut önerilerle söyle.'],
    ['borc', 'Borç planı', 'Borçlarımı en az faiz ödeyerek ve en hızlı nasıl kapatırım? Adım adım bir plan öner.'],
    ['birikim', 'Birikim', 'Gelirime göre gerçekçi bir aylık birikim planı ve acil durum fonu hedefi öner.'],
    ['yatirim', 'Yatırım', 'Yatırım dağılımımı risk ve çeşitlendirme açısından değerlendir; nelere dikkat etmeliyim?']
  ];
  function aiSummary() {
    var m = maskOn;
    maskOn = false;
    try {
      var L = [],
        cur = curP(),
        W = wealth(),
        g = W.g,
        T0 = function (v) {
          return R0.format(Math.round(v)).replace('-', '−');
        };
      L.push(
        'Kişisel finans özetim (' +
          new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) +
          '). Tutarlar Türk lirası.'
      );
      var ks = prevKs(cur, 3).reverse().concat([cur]),
        fl = [];
      ks.forEach(function (k) {
        var p = pstat(k);
        if (p.inc || p.exp)
          fl.push(
            '- ' +
              plabel(k) +
              (k === cur ? ' (dönem sürüyor)' : '') +
              ': gelir ' +
              T0(p.inc) +
              ', gider ' +
              T0(p.exp) +
              (p.rate != null ? ', tasarruf oranı %' + Math.round(p.rate) : '')
          );
      });
      if (fl.length) {
        L.push('', 'Aylık gelir ve gider:');
        L.push.apply(L, fl);
      }
      var avg = catAvg(cur),
        ca = Object.keys(avg)
          .filter(function (c) {
            return avg[c] >= 1;
          })
          .sort(function (a, b) {
            return avg[b] - avg[a];
          })
          .slice(0, 8);
      if (ca.length) {
        L.push('', 'Kategorilere göre aylık ortalama gider (son 3 ay):');
        ca.forEach(function (c) {
          L.push('- ' + c + ': ' + T0(avg[c]) + (+S.budgets[c] > 0 ? ' (bütçe limiti ' + T0(S.budgets[c]) + ')' : ''));
        });
      }
      L.push('', 'Net servet: ' + T0(W.net));
      [
        ['Nakit', g.nakit],
        ['Banka hesapları', g.banka],
        ['Birikim hesapları', g.birikim],
        ['Yatırımlar', g.inv],
        ['Diğer varlıklar (ev, araç vb.)', g.asset],
        ['Kredi kartı borcu', -Math.abs(g.cardDebt || 0)],
        ['Kredi ve diğer borçlar', -Math.abs(g.debts || 0)]
      ].forEach(function (x) {
        if (Math.abs(+x[1] || 0) >= 1) L.push('- ' + x[0] + ': ' + T0(x[1]));
      });
      var inv = S.holdings.filter(function (h) {
          return hKind(h) === 'inv';
        }),
        by = {},
        tot = 0;
      inv.forEach(function (h) {
        var v = hVal(h);
        by[h.type] = (by[h.type] || 0) + v;
        tot += v;
      });
      if (tot > 0) {
        L.push('', 'Yatırım dağılımı:');
        Object.keys(by)
          .sort(function (a, b) {
            return by[b] - by[a];
          })
          .forEach(function (k) {
            L.push('- ' + k + ': %' + Math.round((by[k] / tot) * 100) + ' (' + T0(by[k]) + ')');
          });
      }
      var ds = S.debts.filter(function (d) {
        return debtLeft(d) > 0;
      });
      if (ds.length) {
        L.push('', 'Borçlar:');
        ds.forEach(function (d) {
          L.push('- ' + d.type + ': kalan ' + T0(debtLeft(d)) + ' (toplam ' + T0(d.amt) + ')');
        });
      }
      if (S.recurring.length) {
        var rt = recMonthlyTot(),
          ri = S.recurring
            .filter(function (r) {
              return r.inc;
            })
            .reduce(function (a, r) {
              return a + recMonthly(r);
            }, 0);
        L.push(
          '',
          'Düzenli ödemeler: ' +
            S.recurring.filter(function (r) {
              return !r.inc;
            }).length +
            ' kalem, aylık yaklaşık ' +
            T0(rt) +
            (ri > 0 ? '; düzenli gelir aylık ' + T0(ri) : '')
        );
      }
      if (S.goals.length) {
        L.push('', 'Hedefler:');
        S.goals.forEach(function (x) {
          L.push(
            '- ' +
              x.name +
              ': ' +
              T0(goalSaved(x)) +
              ' / ' +
              T0(x.target) +
              (x.date ? ' (hedef tarih ' + x.date + ')' : '')
          );
        });
      }
      var H = health(),
        hp = H.parts.filter(function (p) {
          return p.p != null;
        });
      if (hp.length)
        L.push(
          '',
          'Göstergeler: ' +
            hp
              .map(function (p) {
                return p.k.toLocaleLowerCase('tr-TR') + ' ' + p.v;
              })
              .join(', ') +
            '.'
        );
      try {
        var cl = coachSteps(),
          ci = coachCur(cl);
        if (ci >= 0)
          L.push(
            '',
            'Wallet koçunun sıradaki adımı: ' + cl[ci].t + ' (' + String(cl[ci].sum).replace(/<[^>]*>/g, '') + ')'
          );
      } catch (e) {}
      return L.join('\n');
    } finally {
      maskOn = m;
    }
  }
  function aiText() {
    var q = (val('ai-q') || '').trim(),
      e = document.getElementById('ai-s'),
      s = e ? e.value : aiSummary();
    return (
      'Deneyimli ve tarafsız bir kişisel finans danışmanı gibi yanıt ver. Aşağıdaki verilere dayanarak Türkçe, sade ve uygulanabilir öneriler sun; varsayımlarını belirt, eksik bilgi varsa sor.\n\nSorum: ' +
      (q || AIQ[0][2]) +
      '\n\n' +
      s
    );
  }
  function aiSheet() {
    openSheet(
      '<h2>Claude’a sor</h2><p class="small muted" style="margin:0">Finansal durumunun özeti hazır. Bir konu seç ya da sorunu yaz; Claude’a gönderilecek metni aşağıda görüp düzenleyebilirsin. Hesap adların ve işlem notların gönderilmez.</p>' +
        '<div class="chips">' +
        AIQ.map(function (x, i) {
          return (
            '<button class="chip" data-act="ai-q" data-id="' +
            x[0] +
            '" aria-pressed="' +
            (i === 0) +
            '">' +
            x[1] +
            '</button>'
          );
        }).join('') +
        '</div>' +
        '<div class="field"><label for="ai-q">Sorun</label><textarea id="ai-q" rows="3" placeholder="Örn. 3 yılda ev peşinatı için ayda ne kadar biriktirmeliyim?">' +
        esc(AIQ[0][2]) +
        '</textarea></div>' +
        '<details><summary class="small">Gönderilecek özet</summary><textarea id="ai-s" aria-label="Gönderilecek özet" style="min-height:42vh;margin-top:8px">' +
        esc(aiSummary()) +
        '</textarea></details>' +
        '<div class="err" id="f-ai"></div>' +
        '<button class="btn" data-act="ai-go">Kopyala ve Claude’u aç</button>' +
        (nb('shareText') || navigator.share
          ? '<button class="btn ghost" data-act="ai-share">Claude uygulamasıyla paylaş</button>'
          : '') +
        '<button class="btn ghost" data-act="ai-copy">Yalnızca kopyala</button>' +
        '<p class="small muted" style="margin:0">Claude açılınca soru kutusu boşsa uzun basıp yapıştır. Yanıtlar genel bilgi amaçlıdır; yatırım, vergi ve hukuk kararlarında bir uzmana da danış.</p>'
    );
  }
  function copyTxt(t) {
    if (nb('copyText')) {
      try {
        if (NB.copyText(t) === 'ok') return Promise.resolve(true);
      } catch (e) {}
    }
    var fb = function () {
      var a = document.createElement('textarea'),
        ok = false;
      a.value = t;
      a.setAttribute('readonly', '');
      a.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(a);
      a.select();
      try {
        ok = document.execCommand('copy');
      } catch (e) {}
      a.remove();
      return ok;
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText)
        return navigator.clipboard.writeText(t).then(function () {
          return true;
        }, fb);
    } catch (e) {}
    return Promise.resolve(fb());
  }
  function openExt(url) {
    if (nb('openUrl')) {
      try {
        NB.openUrl(url);
        return;
      } catch (e) {}
    }
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      location.href = url;
    }
  }
  ACT['ai-open'] = function () {
    aiSheet();
  };
  ACT['ai-q'] = function (el, id) {
    var x = AIQ.filter(function (a) {
        return a[0] === id;
      })[0],
      e = document.getElementById('ai-q');
    if (x && e) e.value = x[2];
    document.querySelectorAll('[data-act="ai-q"]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.id === id));
    });
  };
  ACT['ai-go'] = function () {
    var t = aiText();
    copyTxt(t).then(function (ok) {
      var u = 'https://claude.ai/new?q=' + encodeURIComponent(t);
      if (u.length > 6000) u = 'https://claude.ai/new';
      msg(
        ok ? 'Metin kopyalandı, Claude açılıyor.' : 'Claude açılıyor; metni “Yalnızca kopyala” ile kopyalayabilirsin.',
        ok,
        'f-ai'
      );
      openExt(u);
    });
  };
  ACT['ai-share'] = function () {
    var t = aiText();
    if (nb('shareText')) {
      try {
        NB.shareText(t, 'Claude’a gönder');
      } catch (e) {}
      return;
    }
    try {
      navigator.share({ text: t }).catch(function () {});
    } catch (e) {}
  };
  ACT['ai-copy'] = function () {
    copyTxt(aiText()).then(function (ok) {
      msg(
        ok ? 'Kopyalandı. Claude’a yapıştırabilirsin.' : 'Kopyalanamadı; özet metnini elle seçip kopyala.',
        ok,
        'f-ai'
      );
    });
  };

