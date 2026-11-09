
/* ---------- 4.15: Piyasalar ----------
   Çevirici (TL, döviz ve altın arasında), günün yükseleni/düşeni, takip listesinde kategori süzgeci,
   satırda rozet ve renkli değişim, elindeki miktar ("Sende"), ayrıntıda portföy özeti, dokunarak okunan grafik
   ve fiyat hedefi (fiyatlar yenilendiğinde denetlenir; ulaşılınca bildirim ve Gündem'de görünür). */
var MCATN={fx:'Döviz ve altın',bist:'Hisse',fon:'Fon',cg:'Kripto',yh:'Yabancı'};
function mCats(){var o=[];S.watch.forEach(function(w){var c=mk(w.k).src;if(MCATN[c]&&o.indexOf(c)<0)o.push(c);});return ['fx','bist','fon','cg','yh'].filter(function(c){return o.indexOf(c)>=0;});}
ACT['m-cat']=function(el,id,v){ui.mcat=v||'';mUpd();};
ACT['m-mv']=function(el,k){mSheet(k);};
/* satır rozeti: döviz simgesi, altın/gümüş, hisse ve fon kodu */
var MSYMB={USD:'$',EUR:'€',GBP:'£',CHF:'₣',JPY:'¥',ONS:'oz',BRENT:'Br',XU100:'100',GUMUS:'Ag'};
function mBadge(k){var m=mk(k),s=mSym(k),t,c;
  if(m.src==='fx'){t=MSYMB[m.sym]||(MGOLD[m.sym]?'Au':m.sym.slice(0,3));c=MGOLD[m.sym]&&m.sym!=='XU100'&&m.sym!=='BRENT'?(m.sym==='GUMUS'?'var(--ink2)':'var(--warn)'):(m.sym==='XU100'?'var(--accent)':'var(--blue)');}
  else if(m.src==='cg'){t={bitcoin:'₿',ethereum:'Ξ'}[m.sym]||s.slice(0,3);c='var(--warn)';}
  else{t=s.replace(/\.[A-Z]+$/,'').slice(0,m.src==='fon'?3:4);c=m.src==='bist'?'var(--accent)':(m.src==='fon'?'var(--inc)':'var(--ink2)');}
  return '<span class="mbadge'+(t.length>2?' sm':'')+'" style="--c:'+c+'" aria-hidden="true">'+esc(t)+'</span>';}
function chgPill(c){if(c==null||!isFinite(c))return '';var cl=c>0.0049?'up':(c<-0.0049?'dn':'');return '<span class="chg num '+cl+'">'+pctTxt(c)+'</span>';}
/* elindeki: bu fiyata bağlı yatırımlar (piyasa bağlantısı ya da aynı döviz/altın) */
function mHolds(k){var m=mk(k),f=m.src==='fx'&&MFXK[m.sym];return S.holdings.filter(function(h){return hKind(h)==='inv'&&(h.mk===k||(f&&!h.mk&&h.ccy===f));});}
function mHeld(k){var l=mHolds(k);if(!l.length)return null;var q=0,v=0,c=0;l.forEach(function(h){q+=+h.qty||0;v+=hVal(h);c+=hCost(h);});
  var x=l[0],qt=l.length===1?qtyTxt(x):(x.ccy?qtyTxt({qty:q,ccy:x.ccy}):NUM2.format(q)+' adet');return {q:qt,v:r2(v),c:r2(c),n:l.length};}
function mHeldBox(k){var d=mHeld(k);if(!d)return '';var g=d.v-d.c,p=d.c>0?g/d.c*100:0;
  return '<div class="mheldbox"><div class="lbl">Portföyünde</div><div class="row"><span>'+esc(d.q)+(d.n>1?' · '+d.n+' kayıt':'')+'</span><b class="num">'+TRY0.format(d.v)+'</b></div>'
   +(d.c>0?'<div class="row small"><span class="muted">Maliyet '+TRY0.format(d.c)+'</span><span class="num '+(g>=0?'inc':'exp')+'">'+(g>=0?'+':'−')+TRY0.format(Math.abs(g))+' ('+pctTxt(p)+')</span></div>':'')+'</div>';}
/* günün yükseleni ve düşeni (takip listesinde değişimi bilinen en az 3 kalem varsa) */
function mMovers(){var l=S.watch.map(function(w){var q=mQ(w.k);return {k:w.k,c:q&&q.c};}).filter(function(x){return x.c!=null&&isFinite(x.c);});if(l.length<3)return '';
  l.sort(function(a,b){return b.c-a.c;});var up=l[0],dn=l[l.length-1];if(!(up.c>0.0049)&&!(dn.c<-0.0049))return '';
   var cell=function(x,t){return '<button class="mmv" data-act="m-mv" data-id="'+esc(x.k)+'"><span class="lbl">'+t+'</span><span class="t ell">'+esc(mk(x.k).src==='fx'?mName(x.k).replace(' endeksi',''):mSym(x.k))+'</span>'+chgPill(x.c)+'</button>';};
  return '<div class="mmovers">'+(up.c>0.0049?cell(up,'Günün yükseleni'):'')+(dn.c<-0.0049?cell(dn,'Günün düşeni'):'')+'</div>';}

/* ---- çevirici: TL, döviz ve altın arasında, uygulamanın güncel satış kuruyla ---- */
var MCV=[['TRY','Türk lirası (₺)'],['USD','ABD doları'],['EUR','Euro'],['GBP','İngiliz sterlini'],['CHF','İsviçre frangı'],['XAU','Gram altın'],['CEY','Çeyrek altın'],['XAG','Gram gümüş']];
function cvRate(c){return c==='TRY'?1:(rateOf(c)||0);}
function cvList(){return MCV.filter(function(x){return cvRate(x[0])>0;});}
function cvState(){var s=ui.mcv||{a:'100',f:'USD',t:'TRY'},l=cvList().map(function(x){return x[0];});if(l.indexOf(s.f)<0)s.f=l[1]||'TRY';if(l.indexOf(s.t)<0)s.t='TRY';ui.mcv=s;return s;}
function cvCalc(){var s=cvState(),a=num(s.a),rf=cvRate(s.f),rt=cvRate(s.t);if(!(a>0)||!(rf>0)||!(rt>0))return null;return {v:a*rf/rt,one:rf/rt};}
function cvFmt(v,c){var d=c==='TRY'||v>=1000?2:4;var u={TRY:'₺',USD:'$',EUR:'€',GBP:'£'}[c];var n=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:d}).format(v);
  return u?u+n:n+' '+({CHF:'CHF',XAU:'gr altın',CEY:'çeyrek',XAG:'gr gümüş'}[c]||c);}
function cvOut(){var s=cvState(),r=cvCalc();if(!r)return '<span class="muted">Tutar gir</span>';
  return '<b class="num">'+cvFmt(r.v,s.t)+'</b><span class="small muted num">1 '+esc(cvShort(s.f))+' = '+cvFmt(r.one,s.t)+'</span>';}
function cvShort(c){return {TRY:'₺',XAU:'gr altın',CEY:'çeyrek',XAG:'gr gümüş'}[c]||c;}
function mConv(){var l=cvList();if(l.length<2)return '';var s=cvState(),o=function(v){return l.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===v?' selected':'')+'>'+esc(x[1])+'</option>';}).join('');};
  return '<div class="card mconv"><div class="mh"><b>Çevirici</b><span class="small muted">'+(S.fxTs?esc(ago(S.fxTs))+' · ':'')+'satış kuru</span></div>'
   +'<div class="cvrow"><input id="mc-a" inputmode="decimal" aria-label="Tutar" value="'+esc(s.a)+'" autocomplete="off"><select id="mc-f" aria-label="Çevrilecek birim">'+o(s.f)+'</select></div>'
   +'<div class="cvmid"><button class="icon-btn sm" data-act="mc-swap" aria-label="Birimleri yer değiştir">'+ic('swap')+'</button><select id="mc-t" aria-label="Karşılığı">'+o(s.t)+'</select></div>'
   +'<div class="cvres" id="mc-out" aria-live="polite">'+cvOut()+'</div></div>';}
function cvUpd(){var s=cvState();s.a=val('mc-a');s.f=val('mc-f')||s.f;s.t=val('mc-t')||s.t;var o=document.getElementById('mc-out');if(o)o.innerHTML=cvOut();}
ACT['mc-swap']=function(){var s=cvState(),t=s.f;s.f=s.t;s.t=t;s.a=val('mc-a')||s.a;mUpd();};
document.addEventListener('input',function(e){if(e.target&&e.target.id==='mc-a')cvUpd();});
document.addEventListener('change',function(e){var i=e.target&&e.target.id;if(i==='mc-f'||i==='mc-t')cvUpd();});

/* ---- fiyat hedefi ---- */
function mTargets(k){return S.ptgt.filter(function(x){return x.k===k;});}
function mTgtBox(k){var l=mTargets(k),q=mQ(k),u=q&&q.ccy||'TRY';
  return '<div class="lbl">Fiyat hedefi</div>'+(l.length?'<div class="list">'+l.map(function(x){return '<div class="item" style="padding:7px 0"><span class="mid small">'+(x.up?'Üstüne çıkınca':'Altına inince')+' <b class="num">'+fmtPx(x.v,u,k)+'</b>'+(x.hit?' · <span class="inc">ulaşıldı '+esc(ago(x.hit))+'</span>':'')+'</span><button class="icon-btn sm" data-act="mt-del" data-id="'+esc(x.id)+'" aria-label="Hedefi sil">'+ic('x')+'</button></div>';}).join('')+'</div>':'')
   +'<div class="two" style="grid-template-columns:1fr auto"><input id="mt-v" inputmode="decimal" placeholder="'+(q&&q.p>0?'Şu an '+fmtPx(q.p,u,k):'Hedef fiyat')+'" aria-label="Hedef fiyat"><button class="btn small" data-act="mt-add" data-id="'+esc(k)+'">Hedef ekle</button></div>'
   +'<div class="small muted">Fiyatlar yenilendiğinde (uygulama açıkken) denetlenir; ulaşılınca bildirim gelir ve Gündem’de görünür.</div><div class="err" id="f-mt"></div>';}
ACT['mt-add']=function(el,k){var v=num(val('mt-v')),q=mQ(k);if(!(v>0)){msg('Hedef fiyatı yaz.',false,'f-mt');return;}if(!q||!(q.p>0)){msg('Önce fiyat alınmalı; biraz bekleyip tekrar dene.',false,'f-mt');return;}
  if(Math.abs(v-q.p)/q.p<0.0005){msg('Hedef şu anki fiyata çok yakın.',false,'f-mt');return;}if(mTargets(k).length>=5){msg('Bir kalem için en fazla 5 hedef.',false,'f-mt');return;}
  S.ptgt.push({id:uid(),k:k,v:v,up:v>q.p,n:mName(k)});if(!mW(k))mAdd(k);save();var b=document.getElementById('mtgt');if(b)b.innerHTML=mTgtBox(k);mUpd();toast(mName(k)+': '+(v>q.p?'üstüne çıkınca':'altına inince')+' haber vereceğim');};
ACT['mt-del']=function(el,id){var x=byId(S.ptgt,id);if(!x)return;S.ptgt=S.ptgt.filter(function(y){return y!==x;});save();var b=document.getElementById('mtgt');if(b)b.innerHTML=mTgtBox(x.k);mUpd();if(!ui.page&&!sheetOpen())render();};
/* fiyatlar her yenilendiğinde: ulaşılan hedef işaretlenir, bildirim gönderilir */
function mTgtCheck(){var hit=[];S.ptgt.forEach(function(x){if(x.hit)return;var q=mQ(x.k);if(!q||!(q.p>0))return;if(x.up?q.p>=x.v:q.p<=x.v){x.hit=Date.now();x.hp=q.p;hit.push(x);}});
  if(!hit.length)return 0;save();hit.forEach(function(x){var t=(x.n||mName(x.k))+' '+fmtPx(x.v,(mQ(x.k)||{}).ccy||'TRY',x.k)+(x.up?' üstüne çıktı':' altına indi');toast(t+' · şu an '+fmtPx(x.hp,(mQ(x.k)||{}).ccy||'TRY',x.k));mNotify('Fiyat hedefi',t);});return hit.length;}
function mNotify(title,body){try{if(nb('schedule'))return;if(S.notif&&'Notification' in window&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(function(r){r.showNotification(title,{body:body,icon:'icons/icon-192.png',tag:'wallet-px'});});}catch(e){}}
/* Gündem: son 3 günde ulaşılan hedefler */
function mTgtAlerts(){var t0=Date.now();return S.ptgt.filter(function(x){return x.hit&&t0-x.hit<3*864e5;}).map(function(x){var u=(mQ(x.k)||{}).ccy||'TRY';return ['inc',(x.n||mName(x.k))+' '+fmtPx(x.v,u,x.k)+(x.up?' hedefinin üstüne çıktı':' hedefinin altına indi'),['mt-done',x.id,null,'Tamam']];});}
ACT['mt-done']=function(el,id){S.ptgt=S.ptgt.filter(function(x){return x.id!==id;});save();render();};

/* ---- grafik: dokunup kaydırınca o günün fiyatı ---- */
function mScrubOn(){var w=document.getElementById('mcw');if(!w||!mCur||!mCur.pts)return;var pts=mCur.pts,k=mCur.k,q=mQ(k),u=q&&q.ccy||'TRY';
  var show=function(e){var r=w.getBoundingClientRect(),x=Math.min(Math.max((e.clientX-r.left)/r.width,0),1),t0=pts[0][0],sp=(pts[pts.length-1][0]-t0)||1,tt=t0+x*sp,bi=0,bd=1e18;
    pts.forEach(function(p,i){var d=Math.abs(p[0]-tt);if(d<bd){bd=d;bi=i;}});var p=pts[bi],ln=document.getElementById('mcl'),o=document.getElementById('mscr');
    if(ln){var X=(p[0]-t0)/sp*300;ln.setAttribute('x1',X);ln.setAttribute('x2',X);ln.setAttribute('visibility','visible');}
    if(o){var ch=(p[1]/pts[0][1]-1)*100;o.innerHTML='<b>'+esc(new Date(p[0]).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}))+'</b> · '+fmtPx(p[1],u,k)+' · dönem başına göre '+chgPill(ch);}};
  w.addEventListener('pointerdown',function(e){show(e);try{w.setPointerCapture(e.pointerId);}catch(x){}});
  w.addEventListener('pointermove',function(e){if(e.buttons||e.pointerType==='mouse')show(e);});}
