
/* ---------- 4.12: otomatik bulut yedeği (GitHub Gist, şifreli) ----------
   Ücretsiz ve sunucusuz: kullanıcının kendi GitHub hesabında gizli (secret) bir gist'e yedek yazılır.
   Yedek her zaman yedek şifresiyle AES-256 şifrelidir; GitHub dahil kimse içeriği okuyamaz.
   S.cloud: {tok: erişim anahtarı, gid: gist kimliği, login, on: otomatik, ts: son başarılı yükleme, sig: o andaki savedAt,
             err: son hata, hold: bulutta bu cihazdan önceki bir yedek var (üzerine yazılmasın diye bekler), rts: buluttaki yedeğin zamanı}
   Yükleme: değişiklikten 45 sn sonra, uygulama arka plana geçince ve açılışta (bekleyen değişiklik varsa); en sık 2 dakikada bir. */
var CL_FILE='wallet-yedek.json',CL_DESC='Wallet yedeği (şifreli)',clBusy=false,clLast=0,clT=null,clPend=null,clPw='';
function clOn(){var c=S.cloud;return !!(c&&c.tok&&c.gid);}
function gh(path,opt){opt=opt||{};var tok=opt.tok||(S.cloud&&S.cloud.tok)||'',h={'Accept':'application/vnd.github+json','Authorization':'Bearer '+tok};if(opt.body)h['Content-Type']='application/json';
  return fetch('https://api.github.com'+path,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,cache:'no-store'}).then(function(r){
    if(r.status===204)return null;return r.json().catch(function(){return null;}).then(function(j){if(!r.ok){var e=new Error((j&&j.message)||('HTTP '+r.status));e.status=r.status;throw e;}return j;});});}
function clErr(e){var s=e&&e.status;if(s===401)return 'Erişim anahtarı geçersiz ya da süresi dolmuş. Yeni anahtar oluşturup yeniden bağla.';if(s===403)return 'GitHub isteği reddetti (anahtarda “gist” izni olmalı ya da istek sınırı doldu).';
  if(s===404)return 'Gist bulunamadı.';if(s===422)return 'GitHub yedeği kabul etmedi ('+(e.message||'')+').';return 'Buluta ulaşılamadı. İnternet bağlantını kontrol et.';}
/* bu kalıcı bir kayıt değil: savedAt değişmesin diye (yoksa her yükleme yeni bir yüklemeyi tetikler) doğrudan depoya yazılır */
function clStore(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}if(nb('saveData')){NSJ=JSON.stringify(S);if(!NST)NST=setTimeout(flushNative,120);}}
function clDue(){var c=S.cloud;return clOn()&&c.on!==false&&!c.hold&&!!S.bkKey&&bkOk()&&(+S.savedAt||0)>(+c.sig||0);}
/* gist içeriği: kısa dosyalar yanıtta gelir, büyükler (1 MB üstü) ham adresten okunur */
function clFileText(g){var f=g&&g.files&&g.files[CL_FILE];if(!f)return Promise.resolve(null);if(!f.truncated&&typeof f.content==='string')return Promise.resolve(f.content);
  return fetch(f.raw_url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('raw');return r.text();});}
function clPush(force){
  if(!clOn()||clBusy)return Promise.resolve(false);if(!S.bkKey){S.cloud.err='Önce yedek şifresi belirle.';return Promise.resolve(false);}
  if(!force&&(Date.now()-clLast<12e4))return Promise.resolve(false);
  clBusy=true;clLast=Date.now();var sig=+S.savedAt||0,c=S.cloud;
  return backupText().then(function(text){
    var body={description:CL_DESC,files:{}};body.files[CL_FILE]={content:text};
    return gh('/gists/'+encodeURIComponent(c.gid),{method:'PATCH',body:body}).catch(function(e){if(e.status!==404)throw e;body.public=false;return gh('/gists',{method:'POST',body:body}).then(function(g){c.gid=g.id;return g;});});
  }).then(function(){c.ts=Date.now();c.rts=c.ts;c.sig=sig;delete c.err;delete c.hold;clBusy=false;clStore();clUi();return true;},
    function(e){c.err=clErr(e);clBusy=false;clLast=Date.now()+48e4;clStore();clUi();return false;});
}
/* otomatik: değişiklikten sonra, arka plana geçince ve açılışta */
function clSoon(ms){if(!clDue())return;clearTimeout(clT);clT=setTimeout(function(){if(clDue())clPush();},ms==null?45000:ms);}
document.addEventListener('visibilitychange',function(){if(document.hidden&&clDue())clPush();});
/* ayarlardaki durum satırı, sayfayı baştan çizmeden */
function clUi(){var e=document.getElementById('cl-stat');if(e)e.outerHTML=clStat();}
function clStat(){var c=S.cloud||{},t;
  if(c.err)t='<span class="exp">'+esc(c.err)+'</span>';
  else if(c.hold)t='<span style="color:var(--warn)">Bulutta '+(c.rts?esc(fmtTs(c.rts))+' tarihli ':'')+'bir yedek var. Bu cihazdaki veri onun üzerine yazılmasın diye otomatik yedek bekliyor: aşağıdan geri yükle ya da “Şimdi yedekle” ile bu cihazdakini yaz.</span>';
  else if(c.ts)t='Son bulut yedeği: '+esc(fmtTs(c.ts))+((+S.savedAt||0)>(+c.sig||0)?' · yeni değişiklikler bekliyor':' · güncel');
  else t='Henüz yüklenmedi.';
  return '<div class="small muted" id="cl-stat">'+(c.login?'GitHub: @'+esc(c.login)+' · ':'')+t+'</div>';}
function cloudSec(){var c=S.cloud||{};
  if(!clOn())return sec('Bulut yedeği','<p class="small" style="margin:0">Yedeğin her değişiklikten sonra kendiliğinden GitHub hesabındaki gizli bir gist’e, <b>şifreli</b> olarak yazılır. Telefon kaybolsa ya da değişse de verin kalır. Ücretsizdir.</p>'
    +'<ol class="small steps"><li><a href="https://github.com/settings/tokens/new?scopes=gist&amp;description=Wallet%20yedek" target="_blank" rel="noopener">GitHub’da erişim anahtarı oluştur</a>: yalnızca <b>gist</b> izni seçili gelir. Süre olarak “No expiration” seçebilirsin.</li><li>Oluşan anahtarı (ghp_ ile başlar) aşağıya yapıştır.</li>'+(S.bkKey?'':'<li>Bir yedek şifresi belirle. Yeni telefonda geri yüklerken bu şifre sorulur; unutursan yedek açılmaz.</li>')+'</ol>'
    +'<div class="field"><label for="cl-tok">Erişim anahtarı</label><input id="cl-tok" type="password" autocomplete="off" spellcheck="false" placeholder="ghp_…"></div>'
    +(S.bkKey?'<div class="small inc">Yedek şifren kayıtlı; bulut yedeği onunla şifrelenir.</div>':'<div class="two"><div class="field"><label for="cl-pw1">Yedek şifresi</label><input id="cl-pw1" type="password" autocomplete="new-password" placeholder="6+ karakter"></div><div class="field"><label for="cl-pw2">Tekrar</label><input id="cl-pw2" type="password" autocomplete="new-password"></div></div>')
    +'<div class="err" id="f-cl"></div><button class="btn" data-act="cl-link">Bağla</button>',
    'Anahtar yalnızca bu cihazda saklanır ve yedek dosyalarına yazılmaz. Gist gizlidir; bağlantıyı bilen görebilir ama içerik şifreli olduğundan okunamaz.');
  return sec('Bulut yedeği',tgl('cloud.on','Otomatik bulut yedeği','Değişiklikten kısa süre sonra ve uygulamadan çıkınca GitHub gist’e şifreli yazılır')+clStat()
    +'<div class="two"><button class="btn ghost" data-act="cl-push">Şimdi yedekle</button><button class="btn ghost" data-act="cl-pull">Buluttan geri yükle</button></div>'
    +'<div class="field" id="row-clpw" hidden><label for="cl-pw">Yedek şifresi</label><input id="cl-pw" type="password" autocomplete="off"><div class="small muted" style="margin-top:4px">Buluttaki yedek başka bir cihazda ya da eski şifreyle oluşturulmuş; o şifreyi gir.</div></div>'
    +'<div class="err" id="f-cl"></div><div class="two"><a class="btn ghost small" href="https://gist.github.com/'+esc(c.gid)+'" target="_blank" rel="noopener">Gist’i aç</a><button class="btn ghost small" data-act="cl-off">Bağlantıyı kaldır</button></div>',
    'Geri yükleme bu cihazdaki verinin yerine geçer; önceki veri saklanır, geri dönebilirsin.');}
ACT['cl-link']=function(el){var tok=val('cl-tok').trim().replace(/\s/g,'');
  if(!/^(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})$/.test(tok)){msg('Anahtarı tam olarak yapıştır (ghp_ ya da github_pat_ ile başlar).',false,'f-cl');return;}
  var p1=val('cl-pw1'),p2=val('cl-pw2');if(!S.bkKey){if(p1.length<6){msg('Yedek şifresi en az 6 karakter olmalı.',false,'f-cl');return;}if(p1!==p2){msg('İki şifre aynı olmalı.',false,'f-cl');return;}}
  if(!(window.crypto&&crypto.subtle)){msg('Bu cihaz şifrelemeyi desteklemiyor.',false,'f-cl');return;}
  msg('Bağlanıyor…',true,'f-cl');if(el)el.disabled=true;var login='';
  gh('/user',{tok:tok}).then(function(u){login=u&&u.login||'';return gh('/gists?per_page=100',{tok:tok});})
  .then(function(list){var g=(list||[]).filter(function(x){return x&&x.files&&x.files[CL_FILE];})[0];clPw=S.bkKey?'':p1;return (S.bkKey?Promise.resolve():setBkPw(p1)).then(function(){return g;});})
  .then(function(g){S.cloud={tok:tok,login:login,on:true};
    if(g){S.cloud.gid=g.id;S.cloud.rts=Date.parse(g.updated_at)||0;S.cloud.hold=true;save();render();toast('Bağlandı. Bulutta önceki bir yedek bulundu.');return;}
    var body={description:CL_DESC,public:false,files:{}};
    return backupText().then(function(text){body.files[CL_FILE]={content:text};return gh('/gists',{method:'POST',body:body,tok:tok});}).then(function(g2){S.cloud.gid=g2.id;S.cloud.ts=S.cloud.rts=Date.now();save();S.cloud.sig=S.savedAt;clStore();render();toast('Bulut yedeği açıldı · ilk yedek yüklendi');});})
  .catch(function(e){if(el)el.disabled=false;msg(clErr(e),false,'f-cl');});};
ACT['cl-push']=function(el){if(!clOn())return;delete S.cloud.hold;msg('Yükleniyor…',true,'f-cl');clPush(true).then(function(ok){msg(ok?'Yedek buluta yüklendi.':(S.cloud.err||'Yüklenemedi.'),ok,'f-cl');});};
/* geri yükleme: buluttaki yedek indirilir, şifre çözülür, ikinci dokunuşta uygulanır */
ACT['cl-pull']=function(el){if(!clOn())return;
  if(clPend&&el.dataset.armed){var d=clPend;clPend=null;delete el.dataset.armed;try{applyBackup(d,'f-cl');}catch(e){msg('Yedek okunamadı.',false,'f-cl');}return;}
  msg('Buluttaki yedek indiriliyor…',true,'f-cl');
  gh('/gists/'+encodeURIComponent(S.cloud.gid)).then(function(g){S.cloud.rts=Date.parse(g.updated_at)||S.cloud.rts;return clFileText(g);}).then(function(text){
    if(!text){msg('Bulutta yedek yok.',false,'f-cl');return;}var o;try{o=JSON.parse(text);}catch(e){msg('Buluttaki yedek okunamadı.',false,'f-cl');return;}
    var dec;if(o&&o.wallet&&o.d){var k=S.bkKey,pw=val('cl-pw')||clPw;
      if(k&&k.s===o.s)dec=crypto.subtle.importKey('raw',unb64(k.k),{name:'AES-GCM'},false,['decrypt']).then(function(key){return crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(o.i)},key,unb64(o.d));}).then(function(b){return new TextDecoder().decode(b);});
      else if(pw)dec=decText(o,pw);
      else{var r=document.getElementById('row-clpw');if(r)r.hidden=false;var i=document.getElementById('cl-pw');if(i)i.focus();msg('Yedek şifresini girip yeniden dokun.',false,'f-cl');return;}}
    else dec=Promise.resolve(text);
    return dec.then(function(t){var d=JSON.parse(t);if(!d||!Array.isArray(d.tx))throw new Error('x');clPend=d;el.dataset.armed='1';el.textContent='Yüklemek için tekrar dokun';
      msg('Buluttaki yedek ('+(S.cloud.rts?fmtTs(S.cloud.rts)+', ':'')+d.tx.length+' işlem, '+(d.accounts||[]).length+' hesap) bu cihazdaki verinin yerine geçecek.',true,'f-cl');},
      function(){clPw='';var r=document.getElementById('row-clpw');if(r)r.hidden=false;msg('Şifre yanlış ya da yedek bozuk. Buluttaki yedeğin şifresini girip yeniden dokun.',false,'f-cl');});
  },function(e){msg(clErr(e),false,'f-cl');});};
ACT['cl-off']=function(el){if(!armed(el))return;delete S.cloud;save();render();toast('Bulut bağlantısı kaldırıldı · gist GitHub’da duruyor');};
