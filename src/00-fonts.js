/* Google yazı tipi sayfanın ilk çizimini bekletmeden yüklenir (satır içi onload yerine: güvenlik politikası) */
(function () {
  var f = document.getElementById('gf');
  if (!f)
    return;
  var on = function () {
    f.media = 'all';
  };
  try {
    if (f.sheet)
      on();
    else
      f.addEventListener('load', on);
  }
  catch (e) {
    on();
  }
})();
/* hata kaydı: beklenmeyen hatalar ve güvenlik politikası ihlalleri cihazda saklanır (son 20); Ayarlar > Veri ve yedek'ten kopyalanabilir.
   Hiçbir yere gönderilmez. */
var ERRK = 'wallet-err';
function errLog(kind, msg, where) {
  try {
    var l = JSON.parse(localStorage.getItem(ERRK) || '[]');
    l.push({
      t: Date.now(), k: kind, m: String(msg || '').slice(0, 300), w: String(where || '').slice(0, 200)
    });
    localStorage.setItem(ERRK, JSON.stringify(l.slice(-20)));
  }
  catch (e) {
  }
}
window.addEventListener('error', function (e) {
  if (e.error && e.error.__logged)
    return;
  errLog('hata', e.message, (e.filename || '').split('/').pop() + ':' + e.lineno + ':' + e.colno);
});
window.addEventListener('unhandledrejection', function (e) {
  var r = e.reason;
  errLog('söz', r && r.message || r, r && r.stack && String(r.stack).split('\n')[1]);
});
document.addEventListener('securitypolicyviolation', function (e) {
  errLog('politika', e.violatedDirective, e.blockedURI);
});
