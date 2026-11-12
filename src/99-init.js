  /* ---------- başlangıç ---------- */
  document.getElementById('fab').innerHTML = ic('plus');
  try {
    if ('scrollRestoration' in history)
      history.scrollRestoration = 'manual';
  }
  catch (e) {
  }
  purgeTrash();
  try {
    autoPost();
  }
  catch (e) {
  }
  try {
    yieldPost();
  }
  catch (e) {
  }
  try {
    wgSoon();
  }
  catch (e) {
  }
  var H0 = (location.hash || '').slice(1);
  restoreUi();
  try {
    if (TABH[H0]) {
      ui.page = null;
      ui.sub = TABH[H0];
      persistUi();
    }
  }
  catch (e) {
  }
  try {
    var lu = +localStorage.getItem('wallet-lock') || 0;
    if (lu > Date.now())
      ui.lockUntil = lu;
  }
  catch (e) {
  }
  render();
  if (ui.locked)
    setTimeout(askBio, 400);
  applySecure();
  if (nb('smsSet')) {
    try {
      NB.smsSet(!!S.sms.on);
    }
    catch (e) {
    }
  }
  ntfSync();
  /* açılış ekranı: logo yerinde kalır, ışık geçer, yazı belirir, sonra yumuşakça kapanır (yaklaşık 1,3 sn) */
  (function () {
    var sp = document.getElementById('splash'), done = function () {
      if (nb('splashDone')) {
        try {
          NB.splashDone();
        }
        catch (e) {
        }
      }
    };
    if (!sp) {
      done();
      return;
    }
    var rm = false;
    try {
      rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    catch (e) {
    }
    setTimeout(function () {
      sp.classList.add('out');
      done();
      setTimeout(function () {
        sp.remove();
      }, 320);
    }, rm ? 400 : 850);
  })();
  if (ui.intent)
    setTimeout(runIntent, ui.locked ? 0 : 700);
  /* 4.12: silinmiş işlemlerin fiş fotoğrafları temizlenir; bekleyen bulut yedeği yüklenir; mevduat ve birikim getirileri işlenir */
  setTimeout(function () {
    try {
      rcGc();
    }
    catch (e) {
    }
    try {
      if (clDue())
        clPush();
    }
    catch (e) {
    }
  }, 6000);
  bgRates();
  setTimeout(function () {
    notifyDue();
    pushPlan();
    pullSms();
    if (S.autoBk && bkOk() && Date.now() - (S.bkTs || 0) > 864e5)
      autoBackup();
  }, 1500);
})();
