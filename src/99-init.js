/* ---------- başlangıç ---------- */
document.getElementById('fab').innerHTML=ic('plus');
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}
purgeTrash();
try{autoPost();}catch(e){}
restoreUi();
try{var h0=(location.hash||'').slice(1);if(TABH[h0]){ui.page=null;ui.sub=TABH[h0];}}catch(e){}
try{var lu=+localStorage.getItem('wallet-lock')||0;if(lu>Date.now())ui.lockUntil=lu;}catch(e){}
render();
if(ui.locked)setTimeout(askBio,400);
applySecure();
if(nb('smsSet')){try{NB.smsSet(!!S.sms.on);}catch(e){}}
ntfSync();
/* açılış ekranı: logo yerinde kalır, ışık geçer, yazı belirir, sonra yumuşakça kapanır (yaklaşık 1,3 sn) */
(function(){var sp=document.getElementById('splash'),done=function(){if(nb('splashDone')){try{NB.splashDone();}catch(e){}}};
  if(!sp){done();return;}
  var rm=false;try{rm=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  setTimeout(function(){sp.classList.add('out');done();setTimeout(function(){sp.remove();},470);},rm?450:1300);})();
if(ui.intent)setTimeout(runIntent,ui.locked?0:700);
bgRates();setTimeout(function(){notifyDue();pushPlan();pullSms();if(S.autoBk&&bkOk()&&Date.now()-(S.bkTs||0)>864e5)autoBackup();},1500);
})();
