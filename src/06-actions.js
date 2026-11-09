var TQT=null;

/* ---------- eylemler ---------- */
ACT.back=function(){closePage();};
ACT.eye=function(){S.hide=!S.hide;save();render();};
ACT.sub=function(el,id,v){goSec(v);};
/* kaydırılabilir şeritlerin kenarında devamı olduğunu gösteren solgunluk */
function edgeFade(inId,wrapId){var b=document.getElementById(inId),w=document.getElementById(wrapId);if(!b||!w)return;w.classList.toggle('more-r',b.scrollLeft+b.clientWidth<b.scrollWidth-4);w.classList.toggle('more-l',b.scrollLeft>4);}
/* bölüm değişince sekme şeridi başlığın hemen altına gelsin, içerik görünsün */
function scrollToSec(){var a=document.getElementById('secanchor');if(!a)return;var y=a.getBoundingClientRect().top+window.scrollY-document.getElementById('hdr').offsetHeight;if(window.scrollY>y+2||window.scrollY<y-2)window.scrollTo(0,Math.max(y,0));}
ACT.mprev=function(){ui.month=addMonth(ui.month,-1);render();};
ACT.mnext=function(){ui.month=addMonth(ui.month,1);render();};
ACT.filter=function(el,id,v){ui.filter=v;render();};
ACT['acct-clear']=function(){ui.acctF='';render();};
ACT.plan=function(el,id,v){ui.plan=v;persistUi();render();};
/* 4.4: eski Hesaplar › Varlıklar, Yatırımlar'ın altındaki "Ev, araba ve diğer varlıklar" bölümü */
function toVarlik(){setTimeout(function(){var a=document.getElementById('varliklar');if(a)window.scrollTo(0,Math.max(a.getBoundingClientRect().top+window.scrollY-document.getElementById('hdr').offsetHeight-12,0));},0);}
ACT.sv=function(el,id,v){var va=v==='varlik';ui.sv=va?'yatirim':v;persistUi();render();if(va)toVarlik();};
/* eski Analiz › Servet: net servet gelişimi artık Hesaplar sekmesinin üstünde; eski Analiz › Takvim İşlemler'in takvim görünümü */
ACT.an=function(el,id,v){if(v==='servet'){ui.sv='hesap';goSec('servet');return;}if(v==='takvim'){goSec('takvim');return;}ui.an=v;persistUi();render();};
ACT['sv-go']=function(el,id,v){goSec(v);if(v==='varlik')toVarlik();};
ACT['an-go']=function(el,id,v){if(v==='servet'){ui.sv='hesap';goSec('servet');return;}if(v==='takvim'){goSec('takvim');return;}ui.an=v;goSec('analiz');};
/* İşlemler: liste ↔ takvim; dönem kartı ve ay aynı kalır */
ACT['tx-view']=function(){ui.txv=ui.txv==='cal'?'list':'cal';render();};
ACT.alerts=function(){if(!alertItems().length){toast('Şu an uyarı yok');return;}alertSheet();};
/* Gündem satırından ya da uyarı penceresinden "Ödendi": pencere açıksa güncellenir */
ACT['al-pay']=function(el,id,v){var r=byId(S.recurring,id);if(!r)return;var inSheet=!!(el&&el.closest&&el.closest('.sheet'));payRec(r,v||curP());if(inSheet){if(alertItems().length)alertSheet();else closeSheet();}};
ACT['cat-pick']=function(el,id,v){var s=document.getElementById('f-cat');if(!s)return;s.value=v;s.dataset.manual='1';syncCatChips();};
ACT['date-pick']=function(el,id,v){var e=document.getElementById('f-date');if(!e)return;var d=new Date(today0());d.setDate(d.getDate()-(+v||0));e.value=isoDate(d);dateChips();};
ACT['al-all']=function(){ui.alAll=!ui.alAll;render();};
ACT['trend-pick']=function(el,id,v){ui.trPick=ui.trPick===v?null:v;render();};
ACT['go-month']=function(el,id,v){ui.month=v;ui.trPick=null;render();};
ACT['wk-pick']=function(el,id,v){ui.wk=+v;render();};
ACT.nwr=function(el,id,v){ui.nwr=+v;render();};
ACT['cat-tx']=function(el,id,v){catSheet(v);};
ACT['cat-new']=function(el,id,v){txSheet(null,INCC().indexOf(v)>=0&&EXPC().indexOf(v)<0?'inc':'exp',{cat:v});};
ACT.trn=function(el,id,v){ui.tr=+v===12?12:6;render();};
ACT.calc=function(el,id,v){ui.calc=v;render();};
ACT.close=function(){closeSheet();};
ACT['open-fire']=function(){openPage({k:'fire'},'fire');};
ACT['open-set']=function(el,id,v){openPage({k:'set',s:id,from:v==='ayarlar'?'ayarlar':null},'ayar-'+id);};
ACT['open-settings']=function(){goSec('ayar');};
ACT['plan-go']=function(el,id,v){ui.plan=v;goSec('plan');};
ACT.srch=function(){ui.txv='list';goSec('islem');setTimeout(function(){var e=document.getElementById('tq');if(e)e.focus();},60);};
ACT.tgl=function(el,id,v){setP(v,!getP(v));if(v==='secure')applySecure();if(v==='sms.on'){if(nb('smsSet')){try{NB.smsSet(!!S.sms.on);}catch(e){}}if(S.sms.on&&smsState()!=='granted'&&nb('askSms')){try{NB.askSms();}catch(e){}}}if(v==='sms.ntf'){ntfSync();if(S.sms.ntf&&ntfState()!=='granted'&&nb('ntfAsk')){try{NB.ntfAsk();}catch(e){}}}if(v==='alerts.push'&&S.alerts.push&&notifState()!=='granted'&&nb('askNotif')){try{NB.askNotif();}catch(e){}}save();render();};
ACT.setv=function(el,id,v){var x=el.dataset.x;if(/^-?\d+(\.\d+)?$/.test(x))x=Number(x);setP(v,x);save();render();};

/* doğrudan pencere açan eylemler (kısayollar, hesap ve borç pencereleri) */
ACT['qa-inc']=function(){txSheet(null,'inc',{title:'Gelir ekle'});};
ACT['qa-exp']=function(){txSheet(null,'exp',{title:'Gider ekle'});};
ACT['qa-cash']=function(){grpSheet('nakit');};
ACT['qa-bank']=function(){grpSheet('banka');};
ACT['qa-trf']=function(){txSheet(null,'trf',{title:'Transfer'});};
ACT['qa-debt']=function(){debtListSheet();};
ACT['qa-inv']=function(){hSheet(null,'inv');};
ACT['qa-save']=function(){birSheet();};
ACT['qa-asset']=function(){hSheet(null,'asset');};
ACT['qa-calc']=function(){openPage({k:'araclar'},'araclar');};

/* işlemler */
ACT['new-tx']=function(){txSheet();};
ACT['edit-tx']=function(el,id){txSheet(id);};
ACT['tx-type']=function(el,id,v){
  txType=v;
  var dl=document.getElementById('note-dl');if(dl&&v!=='trf')dl.outerHTML=noteDl(v);
  document.querySelectorAll('#f-type button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===v));});
  var trf=v==='trf';
  document.getElementById('row-cat').hidden=trf;document.getElementById('row-to').hidden=!trf;
  document.getElementById('lb-acct').textContent=trf?'Çıkış hesabı':'Hesap';
  if(!trf){var c=document.getElementById('f-cat'),cl=v==='exp'?EXPC():INCC(),keep=txOrig&&txOrig.type===v?txOrig.cat:lastSel(v,'cat',cl);c.innerHTML=txOrig&&txOrig.type===v?optsKeep(cl,keep):opts(cl,keep);delete c.dataset.manual;catChips();if(!txOrig){var ac=document.getElementById('f-acct'),as=lastSel(v,'acct',ACCS());if(as)ac.value=as;}}
  else{var fa=document.getElementById('f-acct'),ft=document.getElementById('f-to');if(ft&&fa&&ft.value===fa.value){var o=ACCS().filter(function(a){return a!==fa.value;})[0];if(o)ft.value=o;}}
  syncCcy();
};
ACT['save-tx']=function(el,id){
  var amt=r2(num(val('f-amt')));if(amt<=0){ferr('Tutarı sıfırdan büyük gir.');return;}if(tooBig(amt)||tooBig(num(val('f-amt2')))){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  var d=val('f-date');if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){ferr('Tarih seç.');return;}
  var o={type:txType,amt:amt,acct:val('f-acct'),date:d,note:val('f-note').trim()};
  if(ACCS().indexOf(o.acct)<0){ferr('Hesap seç.');return;}
  if(txType==='trf'){var to=val('f-to');if(to===o.acct){ferr('Çıkış ve giriş hesabı farklı olmalı.');return;}o.to=to;o.cat='Transfer';
    if(ccyOf(to)!==ccyOf(o.acct)){var a2=r2(num(val('f-amt2')));if(a2<=0){ferr('Giriş tutarını yaz.');return;}o.amt2=a2;}}
  else o.cat=val('f-cat');
  if(id){var t=byId(S.tx,id);if(!t){closeSheet();return;}if(t.acct!==o.acct)delete t.fx;if(txType!=='trf')delete t.to;delete t.amt2;Object.assign(t,o);delete t.sample;}else{o.id=uid();S.tx.push(o);}
  if(!id){S.last=S.last||{};S.last[txType]={cat:o.cat,acct:o.acct};}
  if(pk(d)!==ui.month)ui.month=pk(d);
  save();closeSheet();render();
  if(!id)toast((txType==='inc'?'Gelir':(txType==='exp'?'Gider':'Transfer'))+' kaydedildi · '+o.acct+': '+moneyIn(acctBal(o.acct),o.acct),function(){S.tx=S.tx.filter(function(z){return z.id!==o.id;});save();render();toast('Geri alındı');});
};
ACT['save-mv']=function(el,id){var t=byId(S.tx,id);if(!t)return;var amt=r2(num(val('m-amt')));
  if(tooBig(amt)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(t.type==='adj'?amt===0:amt<=0){ferr(t.type==='adj'?'Tutar sıfır olamaz.':'Tutarı sıfırdan büyük gir.');return;}var d=val('m-date');if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){ferr('Tarih seç.');return;}
  if(t.acct!==val('m-acct'))delete t.fx;t.amt=amt;t.acct=val('m-acct');t.date=d;t.note=val('m-note').trim();delete t.sample;if(pk(d)!==ui.month)ui.month=pk(d);save();closeSheet();render();};
var toastT=null;
function toast(text,undo,label){
  var e=document.getElementById('toast');if(!e){e=document.createElement('div');e.id='toast';e.setAttribute('role','status');document.body.appendChild(e);}
  ui.undoFn=undo||null;e.innerHTML='<span>'+esc(text)+'</span>'+(undo?'<button data-act="undo">'+esc(label||'Geri al')+'</button>':'');e.hidden=false;
  clearTimeout(toastT);toastT=setTimeout(function(){e.hidden=true;ui.undoFn=null;},undo?6000:3500);
}
ACT.undo=function(){var f=ui.undoFn;ui.undoFn=null;var e=document.getElementById('toast');if(e)e.hidden=true;if(f)f();};
ACT['del-tx']=function(el,id){var t=byId(S.tx,id);if(!t)return;var i=S.tx.indexOf(t);S.tx=S.tx.filter(function(x){return x.id!==id;});save();closeSheet();render();toast('İşlem silindi, bakiye güncellendi',function(){S.tx.splice(Math.min(i,S.tx.length),0,t);save();render();});};
ACT['dup-tx']=function(el,id){var t=byId(S.tx,id);if(!t)return;var c=Object.assign({},t,{id:uid(),date:todayS()});delete c.sample;delete c.fx;S.tx.push(c);ui.month=pk(c.date);save();closeSheet();render();toast('Bugüne kopyalandı');};

/* hesaplar */
ACT['acct-open']=function(el,id){acctSheet(id);};
ACT['acct-exp']=function(el,id){txSheet(null,'exp',{acct:id});};
ACT['acct-inc']=function(el,id){txSheet(null,'inc',{acct:id});};
ACT['acct-trf']=function(el,id){if(acctType(id)==='kart'){var src=ACCS().filter(function(a){return a!==id&&acctType(a)==='banka';})[0];txSheet(null,'trf',{acct:src,to:id,title:'Kart borcu öde'});var b=acctBal(id),e=document.getElementById('f-amt');if(e&&b<0){e.value=nv(-b);syncCcy();}}else txSheet(null,'trf',{acct:id});};
ACT['acct-rec']=function(el,id){recSheet(id);};
ACT['acct-all']=function(el,id){ui.acctF=id;ui.filter='all';ui.tq='';ui.txv='list';goSec('islem');};
ACT['rc-mode']=function(el){el.setAttribute('aria-checked',String(el.getAttribute('aria-checked')!=='true'));};
ACT['rc-save']=function(el,a){
  if(ACCS().indexOf(a)<0)return;var real=r2(num(val('rc-amt'))),cur=acctBal(a),diff=r2(real-cur);if(tooBig(real)||tooBig(diff)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(Math.abs(diff)<0.005){closeSheet();toast('Bakiye zaten doğru');return;}
  var asTx=document.getElementById('rc-mode').getAttribute('aria-checked')==='true',t={id:uid(),acct:a,date:todayS(),note:'Bakiye eşitleme'};
  if(asTx){t.type=diff<0?'exp':'inc';t.amt=Math.abs(diff);t.cat=diff<0?(EXPC().indexOf('Diğer')>=0?'Diğer':EXPC()[EXPC().length-1]):(INCC().indexOf('Diğer gelir')>=0?'Diğer gelir':INCC()[INCC().length-1]);}
  else{t.type='adj';t.amt=diff;}
  S.tx.push(t);save();closeSheet();render();toast(a+' bakiyesi '+moneyIn(real,a)+' olarak eşitlendi',function(){S.tx=S.tx.filter(function(x){return x.id!==t.id;});save();render();});
};
ACT['new-a']=function(el,id,v){aSheet(null,v);};ACT['edit-a']=function(el,id){aSheet(id);};
ACT['save-a']=function(el,id){
  var nm=val('a-name').trim(),ex=!!id&&ACCS().indexOf(id)>=0;
  if(!nm){ferr('Hesaba bir ad yaz.');return;}
  if(badName(nm)||(nm!==id&&ACCS().indexOf(nm)>-1)){ferr('Bu ad kullanılamaz ya da zaten var.');return;}
  var type=val('a-type'),dueS=val('a-due').trim(),due=parseInt(dueS,10),lim=r2(num(val('a-limit')));
  if(type==='kart'&&dueS&&!(due>=1&&due<=31)){ferr('Son ödeme günü 1 ile 31 arasında olmalı.');return;}
  var op=r2(num(val('a-open'))),cs=document.getElementById('a-ccy');if(tooBig(op)||tooBig(lim)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(ex&&nm!==id)renameAcct(id,nm);else if(!ex)S.accounts.push(nm);
  var x=S.accx[nm]=S.accx[nm]||{};x.type=type;
  if(cs&&!acctUsed(nm))x.ccy=cs.value;
  if(type==='kart'&&due>=1&&due<=31)x.due=due;else delete x.due;
  if(type==='kart'&&lim>0)x.limit=lim;else delete x.limit;
  if(!ex||op!==(+S.opening[nm]||0))S.sampleExtras=false;
  S.opening[nm]=op;
  save();closeSheet();render();toast(ex?'Hesap güncellendi':nm+' eklendi');
};
ACT['del-a']=function(el,id){if(acctUsed(id)||ACCS().length<2)return;if(!armed(el))return;S.accounts=S.accounts.filter(function(x){return x!==id;});delete S.opening[id];delete S.accx[id];if(S.defAcct===id)S.defAcct='';save();closeSheet();render();};

/* yatırım ve varlık */
ACT['new-h']=function(el,id,v){hSheet(null,v);};ACT['edit-h']=function(el,id){hSheet(id);};
ACT['save-h']=function(el,id,v){
  var nm=val('h-name').trim();if(!nm){ferr('Bir ad yaz.');return;}var x=id?byId(S.holdings,id):null,h;
  if(v==='asset'){var pv=r2(num(val('h-price')));if(pv<=0){ferr('Güncel değeri gir.');return;}var cv=r2(num(val('h-cost')))||pv;if(cv<0){ferr('Alış değeri eksi olamaz.');return;}h={name:nm,type:val('h-type'),kind:'asset',ccy:'',qty:1,cost:cv,price:pv};}
  else{var q=num(val('h-qty'));if(q<=0){ferr('Miktarı gir.');return;}var co=num(val('h-cost')),cc=val('h-ccy'),mkk=cc.indexOf('mk:')===0?cc.slice(3):'',mp=0;if(mkk){cc='';mp=mTL(mkk);}
    if(co<0||num(val('h-price'))<0){ferr('Maliyet ve fiyat eksi olamaz.');return;}if(co<=0&&!cc&&!(mp>0)&&num(val('h-price'))<=0){ferr('Maliyet ya da güncel fiyat gir.');return;}
    h={name:nm,type:val('h-type'),kind:'inv',ccy:cc,qty:q,cost:co||(cc?rateOf(cc):(mp||num(val('h-price')))),price:mp||num(val('h-price'))||co||rateOf(cc),mk:mkk||undefined,mks:mkk?((x&&x.mk===mkk&&x.mks)||mSym(mkk)):undefined};}
  var acct=val('h-acct');
  if(tooBig(h.qty*h.cost)||tooBig(h.qty*h.price)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(!x&&acct&&!(r2(fromTL(h.qty*h.cost,acct))>0)){ferr(rateOf(ccyOf(acct))>0?'Tutar bu hesabın para biriminde çok küçük.':'Hesabın kuru yok; önce kurları güncelle.');return;}
  if(x){Object.assign(x,h);delete x.sample;}else{h.id=uid();S.holdings.push(h);
    if(acct&&ACCS().indexOf(acct)>=0&&r2(fromTL(h.qty*h.cost,acct))>0){var tl=h.qty*h.cost;S.tx.push({id:uid(),type:'inv',side:'buy',hold:h.id,hname:h.name,qty:h.qty,amt:r2(fromTL(tl,acct)),acct:acct,date:todayS(),note:''});}}
  save();closeSheet();render();toast(x?'Güncellendi':(acct?nm+' eklendi, '+acct+' hesabından düşüldü':nm+' eklendi'));
};
ACT['del-h']=function(el,id){if(!armed(el))return;S.holdings=S.holdings.filter(function(x){return x.id!==id;});save();closeSheet();render();toast('Silindi. Önceki alım/satım hareketleri İşlemler’de kalır.');};
ACT['h-buy']=function(el,id){tradeSheet(id,'buy');};ACT['h-sell']=function(el,id){tradeSheet(id,'sell');};
ACT.trade=function(el,id,side){
  var x=byId(S.holdings,id);if(!x)return;var ast=hKind(x)==='asset',q=ast?1:num(val('tr-qty')),p=num(val('tr-price')),acct=val('tr-acct'),d=val('tr-date')||todayS();
  if(!(q>0)){ferr('Miktarı gir.');return;}if(!(p>0)){ferr(ast?'Satış tutarını gir.':'Birim fiyatı gir.');return;}
  if(side==='sell'&&q>x.qty+1e-9){ferr('Elindekinden fazla satamazsın ('+NUM2.format(x.qty)+').');return;}
  if(acct&&!(rateOf(ccyOf(acct))>0)){ferr('Hesabın kuru yok; önce kurları güncelle.');return;}
  var tl=q*p;if(tooBig(tl)||tooBig((x.qty+q)*x.cost)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}if(acct&&!(r2(fromTL(tl,acct))>0)){ferr('Tutar bu hesabın para biriminde çok küçük.');return;}
  if(side==='buy'){x.cost=(x.qty*x.cost+tl)/(x.qty+q);x.qty=x.qty+q;if(!x.ccy)x.price=p;}
  else{var pl=r2((p-x.cost)*q);S.realized.push({id:uid(),name:x.name,qty:q,pl:pl,date:d});x.qty=x.qty-q;if(!x.ccy)x.price=p;
    if(x.qty<=1e-9)S.holdings=S.holdings.filter(function(h){return h.id!==x.id;});}
  delete x.sample;
  if(acct&&r2(fromTL(tl,acct))>0)S.tx.push({id:uid(),type:'inv',side:side,hold:x.id,hname:x.name,qty:q,amt:r2(fromTL(tl,acct)),acct:acct,date:d,note:''});
  if(pk(d)!==ui.month)ui.month=pk(d);
  save();closeSheet();render();toast((side==='buy'?'Alım':'Satış')+' kaydedildi'+(acct?' · '+acct+': '+moneyIn(acctBal(acct),acct):''));
};

/* borçlar */
ACT['new-d']=function(){dSheet();};ACT['edit-d']=function(el,id){dSheet(id);};
ACT['save-d']=function(el,id){
  var n=val('d-name').trim(),a=r2(num(val('d-amt')));if(!n){ferr('Bir ad yaz.');return;}if(a<=0){ferr('Tutarı gir.');return;}if(tooBig(a)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  var rt=num(val('d-rate'));if(rt<0||rt>30){ferr('Aylık faiz 0 ile 30 arasında olmalı.');return;}
  var o={name:n,type:val('d-type'),amt:a};if(rt>0)o.rate=r2(rt);
  if(id){var d0=byId(S.debts,id);Object.assign(d0,o);if(!(rt>0))delete d0.rate;delete d0.sample;}
  else{o.id=uid();S.debts.push(o);var acct=val('d-acct');if(acct&&ACCS().indexOf(acct)>=0&&r2(fromTL(a,acct))>0)S.tx.push({id:uid(),type:'dbt',side:'in',debt:o.id,dname:n,amt:r2(fromTL(a,acct)),acct:acct,date:todayS(),note:''});}
  save();closeSheet();render();toast(id?'Borç güncellendi':n+' eklendi');
};
ACT['pay-d']=function(el,id){
  var d=byId(S.debts,id);if(!d)return;var p=r2(num(val('dp-amt'))),it=r2(num(val('dp-int'))),acct=val('dp-acct'),dt=val('dp-date')||todayS();
  if(p<=0&&it<=0){msg('Ödeme tutarını gir.',false,'f-err2');return;}if(tooBig(p)||tooBig(it)){msg('Tutar çok büyük.',false,'f-err2');return;}
  var left=debtLeft(d);if(p>left+0.005){msg('Anapara kalan borçtan ('+TRY0.format(left)+') fazla olamaz.',false,'f-err2');return;}
  if(ACCS().indexOf(acct)<0||!(rateOf(ccyOf(acct))>0)){msg('Ödeme hesabını seç.',false,'f-err2');return;}
  if((p>0&&!(r2(fromTL(p,acct))>0))||(it>0&&!(r2(fromTL(it,acct))>0))){msg('Tutar bu hesabın para biriminde çok küçük.',false,'f-err2');return;}
  if(r2(fromTL(p,acct))>0)S.tx.push({id:uid(),type:'dbt',side:'out',debt:d.id,dname:d.name,amt:r2(fromTL(p,acct)),acct:acct,date:dt,note:''});
  if(r2(fromTL(it,acct))>0)S.tx.push({id:uid(),type:'exp',amt:r2(fromTL(it,acct)),cat:ensureCat('exp','Faiz ve masraf'),acct:acct,date:dt,note:d.name+' faizi'});
  delete d.sample;if(pk(dt)!==ui.month)ui.month=pk(dt);save();render();dSheet(d.id);toast('Ödeme kaydedildi · kalan borç '+TRY0.format(debtLeft(d)));
};
ACT['del-d']=function(el,id){if(!armed(el))return;S.debts=S.debts.filter(function(x){return x.id!==id;});S.recurring.forEach(function(r){if(r.debt===id)delete r.debt;});save();closeSheet();render();};

/* hedefler */
ACT['new-g']=function(){gSheet();};
ACT['em-open']=function(){var g=emGoal();if(g)gSheet(g.id);else gSheet(null,{em:true});};ACT['edit-g']=function(el,id){gSheet(id);};
ACT['save-g']=function(el,id){
  var gn=val('g-name').trim(),gt=num(val('g-target'));if(!gn){ferr('Bir ad yaz.');return;}if(gt<=0){ferr('Hedef tutarı gir.');return;}if(tooBig(gt)||tooBig(num(val('g-saved')))){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  var ga=val('g-acct'),ge=document.getElementById('g-em'),go={name:gn,target:r2(gt),saved:r2(num(val('g-saved'))),date:val('g-date'),acct:ACCS().indexOf(ga)>=0?ga:'',em:!!(ge&&ge.checked)};
  var sv;if(id){sv=byId(S.goals,id);if(!sv)return;Object.assign(sv,go);delete sv.sample;}else{go.id=uid();S.goals.push(go);sv=go;}
  if(go.em)S.goals.forEach(function(x){if(x!==sv&&isEm(x))x.em=false;});  // tek acil durum fonu
  save();closeSheet();render();
};
ACT['del-g']=function(el,id){if(!armed(el))return;S.goals=S.goals.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT['goal-add']=function(el,id){gaddSheet(id);};
ACT['ga-save']=function(el,id){
  var g=byId(S.goals,id);if(!g)return;var a=r2(num(val('ga-amt')));if(a<=0){ferr('Tutarı gir.');return;}if(tooBig(a)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(g.acct&&ACCS().indexOf(g.acct)>=0){var from=val('ga-from');if(ACCS().indexOf(from)<0||from===g.acct){ferr('Başka bir hesap seç.');return;}
    var t={id:uid(),type:'trf',amt:r2(fromTL(a,from)),acct:from,to:g.acct,cat:'Transfer',date:todayS(),note:g.name+' hedefine'};if(ccyOf(from)!==ccyOf(g.acct))t.amt2=r2(fromTL(a,g.acct));if(!(t.amt>0)){ferr('Hesabın kuru yok.');return;}S.tx.push(t);}
  else g.saved=r2((+g.saved||0)+a);
  delete g.sample;save();closeSheet();render();toast(g.name+': '+TRY0.format(goalSaved(g))+' / '+TRY0.format(g.target));
};

/* düzenli ödemeler */
ACT['new-r']=function(){rSheet();};ACT['edit-r']=function(el,id){rSheet(id);};
ACT['save-r']=function(el,id){
  var rn=val('r-name').trim(),ra=r2(num(val('r-amt'))),rd=Math.round(num(val('r-day')));
  if(!rn){ferr('Bir ad yaz.');return;}if(ra<=0){ferr('Tutarı gir.');return;}if(tooBig(ra)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}if(rd<1||rd>31){ferr('Gün 1 ile 31 arasında olmalı.');return;}
  var ro={name:rn,amt:ra,day:rd,cat:val('r-cat'),acct:val('r-acct')},db=val('r-debt');
  if(id){var r0=byId(S.recurring,id);Object.assign(r0,ro);if(db)r0.debt=db;else delete r0.debt;delete r0.sample;}else{ro.id=uid();ro.paid={};if(db)ro.debt=db;S.recurring.push(ro);}
  save();closeSheet();render();
};
ACT['del-r']=function(el,id){if(!armed(el))return;S.recurring=S.recurring.filter(function(x){return x.id!==id;});save();closeSheet();render();};
/* düzenli ödemeyi bir dönem için öde: işlem eklenir, bakiye düşer (borca bağlıysa borçtan düşer) */
function payRec(r,k){var d=r.debt&&byId(S.debts,r.debt),tx,dd=dueDate(r,k),pd=dd>todayS()&&todayS()>=pStart(k)?todayS():dd;
  if(d&&debtLeft(d)>0)tx={id:uid(),type:'dbt',side:'out',debt:d.id,dname:d.name,amt:r.amt,acct:r.acct,note:r.name,date:pd};
  else tx={id:uid(),type:'exp',amt:r.amt,cat:r.cat,acct:r.acct,note:r.name,date:pd};
  S.tx.push(tx);r.paid=r.paid||{};r.paid[k]=tx.id;save();render();
  /* fatura tutarı her ay değişebilir (elektrik, doğalgaz): tek dokunuşla gerçek tutar girilir */
  toast(r.name+' ödendi · '+r.acct+': '+moneyIn(acctBal(r.acct),r.acct),function(){if(byId(S.tx,tx.id))txSheet(tx.id);},'Tutarı düzenle');}
ACT.rpay=function(el,id){var r=byId(S.recurring,id);if(r)payRec(r,ui.month);};
ACT.rundo=function(el,id){var r=byId(S.recurring,id);if(r&&r.paid){var pid=r.paid[ui.month];S.tx=S.tx.filter(function(x){return x.id!==pid;});delete r.paid[ui.month];save();render();}};

/* notlar */
function noteSet(id,fn,text,undo){var n=byId(S.notes,id);if(!n)return;var before={arch:n.arch,trash:n.trash,pin:n.pin};fn(n);delete n.sample;save();render();if(text)toast(text,undo===false?null:function(){n.arch=before.arch;n.trash=before.trash;n.pin=before.pin;save();render();});}
ACT.nview=function(el,id,v){ui.nv=v;ui.nq='';persistUi();render();};
ACT['n-pin']=function(el,id){noteSet(id,function(n){n.pin=!n.pin;},'',false);};
ACT['n-arch']=function(el,id){noteSet(id,function(n){n.arch=true;n.pin=false;},'Not arşivlendi');};
ACT['n-unarch']=function(el,id){noteSet(id,function(n){n.arch=false;},'Not arşivden çıkarıldı');};
ACT['n-trash']=function(el,id){noteSet(id,function(n){n.trash=Date.now();},'Not çöp kutusuna taşındı');};
ACT['n-restore']=function(el,id){noteSet(id,function(n){delete n.trash;},'Not geri yüklendi');};
ACT['n-purge']=function(el,id){if(S.nset.confirmDel&&!armed(el)){el.classList.add('armed');toast('Kalıcı silmek için çöp kutusu simgesine tekrar dokun');return;}S.notes=S.notes.filter(function(x){return x.id!==id;});save();render();toast('Not kalıcı olarak silindi');};
ACT['n-empty']=function(el){if(!armed(el))return;S.notes=S.notes.filter(function(n){return !n.trash;});save();render();toast('Çöp kutusu boşaltıldı');};
ACT['note-arch']=function(){var p=ui.page;if(!p.id){var d=p.draft;if(!d.title.trim()&&!d.body.trim()){msg('Önce bir şey yaz.');return;}p.dirty=true;}saveNote();var n=byId(S.notes,p.id);if(!n)return;var was=n.arch;closePage();noteSet(n.id,function(x){x.arch=!was;if(!was)x.pin=false;},was?'Not arşivden çıkarıldı':'Not arşivlendi');};
ACT['note-restore']=function(){var id=ui.page.id;closePage();noteSet(id,function(x){delete x.trash;},'Not geri yüklendi');};
ACT['note-purge']=function(el){if(S.nset.confirmDel&&!armed(el))return;var id=ui.page.id;ui.page.dirty=false;S.notes=S.notes.filter(function(x){return x.id!==id;});save();closePage();toast('Not kalıcı olarak silindi');};
ACT['notes-copy']=function(){if(!allNotesText()){msg('Kopyalanacak not yok.',false,'f-err5');return;}copyText(allNotesText(),'f-err5','Notlar kopyalandı.');};
ACT['notes-save']=function(){if(!allNotesText()){msg('Kaydedilecek not yok.',false,'f-err5');return;}saveFile('wallet-notlar.txt',allNotesText(),'Notlar kaydedildi.','f-err5');};

/* kategoriler */
ACT['cat-add']=function(el,id,v){var n=val('nc-'+v).trim();if(!n||badName(n)||S.cats[v].indexOf(n)>-1)return;S.cats[v].push(n);save();render();};
ACT['cat-del']=function(el,id,v){if(S.cats[v].length<2)return;if(!armed(el))return;S.cats[v]=S.cats[v].filter(function(x){return x!==id;});S.rules=S.rules.filter(function(r){return r.cat!==id||S.cats.exp.indexOf(id)>=0||S.cats.inc.indexOf(id)>=0;});if(v==='exp')delete S.budgets[id];save();render();};
ACT['rule-add']=function(){var kw=val('rl-kw').trim().toLocaleLowerCase('tr-TR');if(!kw){msg('Bir kelime yaz.');return;}S.rules.push({kw:kw,cat:val('rl-cat')});save();render();};
ACT['rule-del']=function(el,id){S.rules.splice(+id,1);save();render();};
ACT['fire-auto']=function(){S.fire.target='';save();render();};

/* PIN */
ACT['pin-set']=function(){var a=val('pin1'),b=val('pin2');if(!/^\d{4}$/.test(a)){msg('PIN 4 rakam olmalı.');return;}if(a!==b){msg('İki PIN aynı olmalı.');return;}var salt=uid();pinHash(a,salt).then(function(h){S.pin={h:h,s:salt,auto:1};save();render();});};
ACT['pin-change']=function(){var o=val('pold'),a=val('pnew1'),b=val('pnew2');if(!/^\d{4}$/.test(a)){msg('Yeni PIN 4 rakam olmalı.');return;}if(a!==b){msg('Yeni PIN’ler aynı olmalı.');return;}
  pinHash(o,S.pin.s).then(function(h){if(h!==S.pin.h){msg('Mevcut PIN yanlış.');return;}var salt=uid();return pinHash(a,salt).then(function(h2){S.pin={h:h2,s:salt,auto:S.pin.auto};save();render();msg('PIN değiştirildi.',true);});});};
ACT['pin-remove']=function(){pinHash(val('prem'),S.pin.s).then(function(h){if(h!==S.pin.h){msg('PIN yanlış.',false,'f-err2');return;}S.pin=null;S.bio=false;save();render();});};
ACT['lock-now']=function(){lockNow();};
ACT['lk-forgot']=function(){ui.forgot=true;render();};
ACT['lk-back']=function(){ui.forgot=false;render();};
ACT['lk-bio']=function(){askBio();};
ACT['lk-reset']=function(el){if(!armed(el))return;wipeAll(true);};
ACT.lk=function(el,id,v){
  if(Date.now()<ui.lockUntil||!S.pin)return;
  if(v==='<')ui.pinBuf=ui.pinBuf.slice(0,-1);else if(ui.pinBuf.length<4)ui.pinBuf+=v;
  ui.lkMsg='';
  if(ui.pinBuf.length===4){
    var buf=ui.pinBuf;
    pinHash(buf,S.pin.s).then(function(h){
      if(h===S.pin.h){ui.locked=false;ui.pinBuf='';ui.fails=0;ui.lkMsg='';render();setTimeout(runIntent,50);}
      else{ui.fails++;ui.pinBuf='';ui.lkMsg='Yanlış PIN';
        if(ui.fails>=5){ui.fails=0;ui.lockUntil=Date.now()+30000;ui.lkMsg='Çok fazla deneme. 30 saniye bekle.';setTimeout(function(){if(ui.locked){ui.lkMsg='';render();}},30000);}
        render();}
    });
  }else render();
};

/* yedek */
ACT.csv=function(){saveFile('wallet-islemler.csv',csvAll(),'CSV kaydedildi.');};
ACT['csv-copy']=function(){copyText(csvAll(),'f-err','CSV kopyalandı.');};
ACT['bk-auto']=function(){msg('Yedekleniyor…',true,'f-bka');autoBackup(true).then(function(ok){if(ok)render();msg(ok?'Yedek İndirilenler/Wallet klasörüne yazıldı'+(S.bkKey?' (şifreli).':'.'):'Yedek yazılamadı.',ok,'f-bka');});};
ACT['bk-pw-set']=function(){var a=val('bkp1'),b=val('bkp2');if(a.length<6){msg('Şifre en az 6 karakter olmalı.',false,'f-bka');return;}if(a!==b){msg('İki şifre aynı olmalı.',false,'f-bka');return;}
  if(!(window.crypto&&crypto.subtle)){msg('Bu görünümde şifreleme kullanılamıyor.',false,'f-bka');return;}
  setBkPw(a).then(function(){return nb('autoBackup')?autoBackup(true):true;}).then(function(){render();msg('Yedekler artık şifreli.',true,'f-bka');});};
ACT['bk-pw-del']=function(el){if(!armed(el))return;delete S.bkKey;save();(nb('autoBackup')?autoBackup(true):Promise.resolve()).then(function(){render();});};
function shareText(name,text,id){
  if(nb('shareFile')){var r='err';try{r=NB.shareFile(name,text);}catch(e){}if(r!=='ok')msg('Paylaşılamadı.',false,id);return;}
  try{var f=new File([text],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Wallet yedeği'}).catch(function(){});return;}}catch(e){}
  saveFile(name,text,'Yedek kaydedildi.',id);
}
ACT['bk-share']=function(){backupText().then(function(t){shareText(bkName(),t,'f-bka');});};
function bkName(){return S.bkKey?'wallet-yedek-sifreli.json':'wallet-yedek.json';}
ACT['bk-save']=function(){backupText().then(function(t){saveFile(bkName(),t,'Yedek kaydedildi'+(S.bkKey?' (şifreli).':'.'),'f-bka');});};
ACT['bk-copy']=function(){backupText().then(function(t){copyText(t,'f-bka','Yedek kopyalandı'+(S.bkKey?' (şifreli).':'.'));});};
ACT['rs-go']=function(el0){
  var raw=val('rs-txt').trim(),pw=val('rs-pw');
  if(!raw){msg('Yedek dosyasını seç ya da metni yapıştır.',false,'f-err2');return;}
  var o;try{o=JSON.parse(raw);}catch(e){msg('Yedek okunamadı. Tüm metni kopyaladığından emin ol.',false,'f-err2');return;}
  /* yükleme mevcut verilerin yerine geçer: önce onay, sonra eski veri saklanır (Geri al ve Ayarlar'dan dönüş) */
  var el=el0&&el0.nodeType?el0:document.querySelector('[data-act="rs-go"]');if(el&&!armed(el)){msg('Yedek mevcut verilerinin yerine geçecek. Onaylamak için yeniden dokun.',false,'f-err2');return;}
  var apply=function(d){if(!d||!Array.isArray(d.tx))throw new Error('x');var old=JSON.stringify(S),keep=S.pin,bio=S.bio,bk=S.bkKey;
    try{localStorage.setItem('wallet-prerestore',old);}catch(e){}
    S=norm(d);S.pin=keep||null;S.bio=!!keep&&bio;if(bk)S.bkKey=bk;delete S.bkHold;ui.month=curP();save();render();msg('Yedek yüklendi: '+S.tx.length+' işlem, '+S.accounts.length+' hesap.',true,'f-err2');
    toast('Yedek yüklendi',function(){S=norm(JSON.parse(old));ui.month=curP();save();render();toast('Önceki verine dönüldü');});};
  if(o&&o.wallet&&o.d){
    if(!pw){msg('Bu yedek şifreli, şifreyi gir.',false,'f-err2');return;}
    decText(o,pw).then(function(t){try{apply(JSON.parse(t));}catch(e){msg('Yedek okunamadı.',false,'f-err2');}},function(){msg('Şifre yanlış ya da yedek bozuk.',false,'f-err2');});
  }else{try{apply(o);}catch(e){msg('Yedek okunamadı.',false,'f-err2');}}
};

/* CSV içe aktarma */
function csvParse(txt){
  txt=String(txt||'').replace(/^﻿/,'');
  var first=txt.split(/\r?\n/)[0]||'',dl0=';',best=0;
  [';',',','\t'].forEach(function(d){var n=first.split(d).length;if(n>best){best=n;dl0=d;}});
  var rows=[],row=[],cur='',q=false,i,ch;
  for(i=0;i<txt.length;i++){ch=txt[i];
    if(q){if(ch==='"'){if(txt[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
    else if(ch==='"')q=true;
    else if(ch===dl0){row.push(cur);cur='';}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&txt[i+1]==='\n')i++;row.push(cur);cur='';if(row.some(function(x){return x.trim()!=='';}))rows.push(row);row=[];}
    else cur+=ch;}
  row.push(cur);if(row.some(function(x){return x.trim()!=='';}))rows.push(row);
  return rows;}
var TRMON=['ocak','subat','mart','nisan','mayis','haziran','temmuz','agustos','eylul','ekim','kasim','aralik'];
function csvDate(s){s=String(s||'').trim();var m,r='';
  if((m=s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)))r=m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);
  else if((m=s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/)))r=m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);
  else if((m=s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2})(?!\d)/)))r='20'+m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);
  else if((m=fold(s).match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})/))){var mi=TRMON.indexOf(m[2]);if(mi<0)mi=TRMON.map(function(x){return x.slice(0,3);}).indexOf(m[2].slice(0,3));if(mi>=0)r=m[3]+'-'+pad(mi+1)+'-'+pad(+m[1]);}
  else if(/^\d{5}(\.\d+)?$/.test(s)&&+s>30000&&+s<80000)r=serialDate(+s);
  if(r){var dt=new Date(+r.slice(0,4),+r.slice(5,7)-1,+r.slice(8,10));if(dt.getMonth()!==+r.slice(5,7)-1||dt.getDate()!==+r.slice(8,10))r='';}
  return r;}
function csvKey(h){h=fold(h).replace(/\s*\([^)]*\)\s*/g,' ').replace(/[*:.]+$/,'').replace(/\s+/g,' ').trim();
  if(/^(borc|borc tutari|cikan|cikan tutar|giden|odenen)$/.test(h))return 'debit';
  if(/^(alacak|alacak tutari|giren|giris|gelen|yatan)$/.test(h))return 'credit';
  if(/^(giris tutari|amt2)/.test(h))return 'amt2';
  if(/^(para birimi|currency|doviz cinsi)/.test(h))return 'ccy';
  if(/^(islem tarihi|tarih|date)/.test(h))return 'date';
  if(/^(tur|islem turu|type)$/.test(h))return 'type';
  if(/^(kategori|category)/.test(h))return 'cat';
  if(/^(islem tutari|tutar|miktar|amount)/.test(h))return 'amt';
  if(/^(karsi hesap|to)$/.test(h))return 'to';
  if(/^(hesap|account)/.test(h))return 'acct';
  if(/^(not|aciklama|islem aciklamasi|islem detayi|detay|islem|description|note|explanation)/.test(h))return 'note';
  return '';}
/* ekstre tekrar içe aktarılınca çift kayıt olmasın: tarih, tür, tutar, hesap ve bankadaki ÖZGÜN açıklama
   (sonradan değiştirilebilen kategori ve not değil) karşılaştırılır */
function txSig2(t){return [t.date,t.type,r2(t.amt).toFixed(2),t.acct,fold(t.src!=null?t.src:(t.note||'')).replace(/\s+/g,' ').trim()].join('|');}
function txSig(t){return [t.date,t.type,t.side||'',t.type==='inc'||t.type==='exp'?(t.cat||''):'',r2(t.amt).toFixed(2),t.acct,t.to||'',t.note||'',t.amt2?r2(t.amt2).toFixed(2):''].join('|');}
function csvImport(text,defAcct0){
  var rows=csvParse(text);if(rows.length<2)return {err:'Başlık satırı ve en az bir kayıt gerekli.'};
  /* banka ekstrelerinde tablo birkaç bilgi satırından sonra başlar: başlık satırını bul */
  var map={},hi=0;
  for(var ri=0;ri<Math.min(rows.length,40);ri++){var mp={};rows[ri].forEach(function(h,i){var k=csvKey(h);if(k&&mp[k]==null)mp[k]=i;});
    if(mp.date!=null&&(mp.amt!=null||mp.debit!=null||mp.credit!=null)){map=mp;hi=ri;break;}}
  if(map.date==null)return {err:'“Tarih” ve “Tutar” (ya da “Borç/Alacak”) sütunları bulunamadı.'};
  var seen={},seen2={};S.tx.forEach(function(t){var k=txSig(t);seen[k]=(seen[k]||0)+1;if(t.type==='inc'||t.type==='exp'){var k2=txSig2(t);seen2[k2]=(seen2[k2]||0)+1;}});
  var add=[],dup=0,bad=0,newA=[],newC=[],aCcy={},defA=(defAcct0&&ACCS().indexOf(defAcct0)>=0)?defAcct0:ACCS()[0];
  var card=map.type==null&&map.debit==null&&map.credit==null&&acctType(defA)==='kart';
  rows.slice(hi+1).forEach(function(r){
    var g=function(k){return map[k]==null?'':String(r[map[k]]==null?'':r[map[k]]).trim();};
    var date=csvDate(g('date')),raw=map.amt!=null?num(g('amt')):r2(Math.abs(num(g('credit')))-Math.abs(num(g('debit')))),tv=fold(g('type')),type,side;
    /* tarihi olmayan satırlar (Toplam, Devreden bakiye…) sessizce atlanır */
    if(!date&&!/\d/.test(g('date')))return;
    if(!date||!raw){bad++;return;}
    /* kredi kartı ekstresinde artı tutar harcamadır */
    if(card)raw=-raw;
    if(/duzeltme/.test(tv))type='adj';
    else if(/yatirim sat/.test(tv)){type='inv';side='sell';}
    else if(/yatirim/.test(tv)){type='inv';side='buy';}
    else if(/borc alindi/.test(tv)){type='dbt';side='in';}
    else if(/borc/.test(tv)){type='dbt';side='out';}
    else if(/gelir|income|^inc$/.test(tv))type='inc';else if(/gider|expense|^exp$/.test(tv))type='exp';else if(/transfer|^trf$/.test(tv))type='trf';
    else type=raw<0?'exp':'inc';
    var amt=type==='adj'?r2(raw):r2(Math.abs(raw)),acct=g('acct')||defA,to=g('to'),nt=g('note');
    if(badName(acct)||(to&&badName(to))||(type==='trf'&&(!to||to===acct))){bad++;return;}
    var t={id:uid(),type:type,amt:amt,acct:acct,date:date};if(side)t.side=side;
    if(type==='inc'||type==='exp')t.cat=g('cat')||smsCat(nt,type);else if(type==='trf')t.cat='Transfer';
    if(type==='trf')t.to=to;var a2=r2(num(g('amt2')));if(type==='trf'&&a2>0)t.amt2=a2;if(nt)t.note=nt;
    if(type==='inv')t.hname=(g('cat')||'').replace(/^Yatırım (alımı|satışı) · /,'');if(type==='dbt')t.dname=(g('cat')||'').replace(/^Borç (alındı|ödemesi) · /,'');
    var cc=g('ccy').toUpperCase();if(CCYS.indexOf(cc)>=0&&!aCcy[acct])aCcy[acct]=cc;
    if(t.type==='inc'||t.type==='exp'){t.src=nt||'';var k2=txSig2(t);if(seen2[k2]>0){seen2[k2]--;var k1=txSig(t);if(seen[k1]>0)seen[k1]--;dup++;return;}}
    var k=txSig(t);if(seen[k]>0){seen[k]--;if(t.src!=null){var k3=txSig2(t);if(seen2[k3]>0)seen2[k3]--;}dup++;return;}
    add.push(t);});
  add.forEach(function(t){
    [t.acct,t.to].forEach(function(a){if(a&&ACCS().indexOf(a)<0&&newA.indexOf(a)<0)newA.push(a);});
    if(t.type==='inc'||t.type==='exp'){var l=t.type==='inc'?INCC():EXPC();if(l.indexOf(t.cat)<0&&newC.indexOf(t.type+'|'+t.cat)<0)newC.push(t.type+'|'+t.cat);}});
  newA.forEach(function(a){S.accounts.push(a);S.opening[a]=0;if(aCcy[a]&&aCcy[a]!=='TRY'){S.accx[a]=S.accx[a]||{};S.accx[a].ccy=aCcy[a];}});
  newC.forEach(function(c){var p=c.split('|');S.cats[p[0]==='inc'?'inc':'exp'].push(p.slice(1).join('|'));});
  S.tx=S.tx.concat(add);
  return {added:add.length,dup:dup,bad:bad,accts:newA.length,cats:newC.length};}
ACT['im-go']=function(){
  var raw=val('im-txt').trim();if(!raw){msg('CSV dosyasını seç ya da metni yapıştır.',false,'f-err4');return;}
  var r=csvImport(raw,val('im-acct'));if(r.err){msg(r.err,false,'f-err4');return;}
  save();render();
  msg(r.added+' işlem eklendi'+(r.dup?', '+r.dup+' tekrar atlandı':'')+(r.bad?', '+r.bad+' satır okunamadı':'')+(r.accts?'. '+r.accts+' yeni hesap':'')+(r.cats?'. '+r.cats+' yeni kategori':'')+'.',r.added>0||r.dup>0,'f-err4');};

/* örnek veriler ve sıfırlama */
ACT['sample-load']=function(){
  var d=seed(),acc=ACCS();
  d.tx.forEach(function(t){if(acc.indexOf(t.acct)<0)t.acct=acc[0];});
  d.recurring.forEach(function(r){if(acc.indexOf(r.acct)<0)r.acct=acc[0];});
  S.tx=S.tx.concat(d.tx);S.goals=S.goals.concat(d.goals);S.recurring=S.recurring.concat(d.recurring);S.holdings=S.holdings.concat(d.holdings);S.notes=S.notes.concat(d.notes);S.debts=S.debts.concat(d.debts);
  if(!Object.keys(S.budgets).length&&!acc.some(function(a){return S.opening[a];})){S.budgets=d.budgets;acc.forEach(function(a){if(d.opening[a]!=null)S.opening[a]=d.opening[a];});S.sampleExtras=true;}
  save();render();
};
ACT['sample-clear']=function(){
  S.tx=S.tx.filter(function(x){return !x.sample;});S.holdings=S.holdings.filter(function(x){return !x.sample;});S.notes=S.notes.filter(function(x){return !x.sample;});S.goals=S.goals.filter(function(x){return !x.sample;});S.recurring=S.recurring.filter(function(x){return !x.sample;});S.debts=S.debts.filter(function(x){return !x.sample;});
  if(S.sampleExtras){S.budgets={};S.opening={};S.sampleExtras=false;}
  S.hist={};
  save();render();toast('Örnek veriler silindi');
};
/* gerçekten her şeyi siler: tarayıcı deposu, Android kopyası, otomatik yedek, hatırlatmalar */
/* keepBk: PIN unutulunca — otomatik yedek dosyası silinmez ve üzerine yazılmasın diye otomatik yedek duraklatılır */
function wipeAll(keepBk){
  try{[KEY,UIKEY,'wallet-prerestore'].forEach(function(k){localStorage.removeItem(k);});}catch(e){}
  try{sessionStorage.clear();}catch(e){}
  if(keepBk&&nb('wipeKeep')){try{NB.wipeKeep();}catch(e){}}else if(nb('wipe')){try{NB.wipe();}catch(e){}}
  S=norm({tx:[]});if(keepBk)S.bkHold=Date.now();
  ui.locked=false;ui.forgot=false;ui.page=null;ui.sub='ev';ui.month=curP();ui.filter='all';ui.acctF='';ui.tq='';ui.nq='';ui.nv='act';ui.cv={};
  save();flushNative();applySecure();
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  closeSheet();render();window.scrollTo(0,0);toast('Tüm veriler silindi');
  refreshRates({}).then(function(){if(!ui.page&&!sheetOpen())render();});
}
ACT['reset-all']=function(el){if(!armed(el))return;wipeAll();};

/* ---------- canlı kur ---------- */
var RK={USD:['USD'],EUR:['EUR'],GBP:['GBP'],CHF:['CHF'],XAU:['GRA','GRAM-ALTIN','GRAMALTIN','GA','GRAM_ALTIN'],XAG:['GUMUS','GRAM-GUMUS','GRAMGUMUS','GAG'],CEY:['CEYREKALTIN','CEYREK-ALTIN','C'],BIST:['XU100','BIST100','BIST-100','XU-100']};
function findRate(items,names){var keys=Object.keys(items||{});for(var i=0;i<names.length;i++){for(var j=0;j<keys.length;j++){if(keys[j].toUpperCase()===names[i]&&items[keys[j]]&&typeof items[keys[j]]==='object')return items[keys[j]];}}return null;}
function rPrice(o){if(!o)return 0;var v=num(o.Selling!=null?o.Selling:(o.sell!=null?o.sell:(o.price!=null?o.price:(o.Buying!=null?o.Buying:o.buy))));return v>0?v:0;}
function rChg(o){if(!o)return null;var c=o.Change!=null?o.Change:o.change;if(c==null||c==='')return null;c=num(String(c).replace('%',''));return isFinite(c)?c:null;}
function pickRates(j){var it=(j&&j.items)||j||{},o={chg:{},BIST:null,prov:(j&&(j.updated||j.Update_Date))||''};
  FXK.forEach(function(k){var x=findRate(it,RK[k]);o[k]=rPrice(x);o.chg[k]=rChg(x);});
  var b=findRate(it,RK.BIST);if(b&&rPrice(b)>0)o.BIST={price:rPrice(b),chg:rChg(b)};
  return o;}
function parseLoose(t){t=String(t||'');var c=[t,t.replace(/\s+$/,'')+'}',t.slice(0,t.lastIndexOf('},"')+1)+'}'];for(var i=0;i<c.length;i++){try{return JSON.parse(c[i]);}catch(e){}}return null;}
var nreq={};
window.walletNative=function(id,text){var f=nreq[id];if(f){delete nreq[id];f(text);}};
function nativeRates(){return new Promise(function(ok,no){var id='r'+Date.now();var tm=setTimeout(function(){delete nreq[id];no(new Error('zaman aşımı'));},15000);
  nreq[id]=function(text){clearTimeout(tm);var j=text&&parseLoose(text);if(j)ok(j);else no(new Error('veri yok'));};
  try{NB.fetchRates(id);}catch(e){clearTimeout(tm);delete nreq[id];no(e);}});}
function siteRates(){return fetch('rates.json?_='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();});}
/* sonuç: {ok, got:[…], msg} — çağıran ekranda gösterir */
function refreshRates(opt){
  opt=opt||{};
  if(!S.fxAuto&&!opt.force)return Promise.resolve({ok:false,skip:true});
  var chk=function(j){var o=pickRates(j);if(!(o.USD>0))throw new Error('eksik');return j;};
  /* Truncgil (uygulamada doğrudan, tarayıcıda yayın sunucusundaki kopya) alınamazsa döviz için ECB günlük referans kuru */
  var src=(nb('fetchRates')?nativeRates().then(chk).catch(function(){return siteRates().then(chk);}):siteRates().then(chk)).catch(function(){return frkLatest().then(function(o){return {ecb:o};});});
  return src.then(function(j){
    if(j&&j.ecb){var e=j.ecb,g2=[];FRKC.forEach(function(c){if(e[c]>0){S.fx[c]=e[c];g2.push(c);if(S.fxChg)delete S.fxChg[c];}});
      if(!g2.length)return {ok:false,msg:'Kurlar alınamadı. İnternet bağlantını kontrol et.'};
      /* takip listesi de uygulamanın kullandığı kurları göstersin: eski Truncgil önbelleği bırakılır */
      FXALL=null;S.fxTs=Date.now();S.fxProv=e.date||'';S.fxSrc='ecb';save();
      return {ok:true,got:g2,ecb:true,msg:'Döviz kurları yedek kaynaktan alındı (ECB günlük referans kuru'+(e.date?', '+e.date:'')+'). Altın ve BIST 100 güncellenemedi.'};}
    var o=pickRates(j),got=[],it=(j&&j.items)||j||{},all={};
    Object.keys(it).forEach(function(k){if(it[k]&&typeof it[k]==='object')all[k]=it[k];});if(Object.keys(all).length){FXALL=all;FXALLT=Date.now();}
    FXK.forEach(function(k){if(o[k]>0){S.fx[k]=o[k];got.push(k);}});
    S.fxChg={};FXK.forEach(function(k){if(o[k]>0&&o.chg[k]!=null)S.fxChg[k]=o.chg[k];});
    if(o.BIST){S.mkt.BIST=o.BIST;got.push('BIST');}
    if(!got.length){var n=Object.keys((j&&j.items)||j||{}).length;return {ok:false,msg:n?'Veri geldi ama kur bulunamadı.':'Henüz kur verisi yok; biraz sonra tekrar dene.'};}
    S.fxTs=Date.now();S.fxProv=String(o.prov||'');delete S.fxSrc;save();
    return {ok:true,got:got,msg:'Güncellendi: USD '+fx1(S.fx.USD)+' · EUR '+fx1(S.fx.EUR)+' · gram altın '+fx1(S.fx.XAU)};
  }).catch(function(){return {ok:false,msg:'Kurlar alınamadı. İnternet bağlantını kontrol et.'};});
}
function busy(){var ae=document.activeElement;return sheetOpen()||ui.locked||!!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));}
function bgRates(){refreshRates().then(function(r){return refreshMarket({}).then(function(m){if((r.ok||m.n)&&!busy()&&!(ui.page&&ui.page.k==='note'))render();});});}
ACT['rates-now']=function(){msg('Güncelleniyor…',true,'f-rates');refreshRates({force:true}).then(function(r){if(r.ok)render();msg(r.msg,r.ok,'f-rates');});};
var refreshing=false;
ACT.refresh=function(el){
  if(refreshing)return;refreshing=true;el.classList.add('spin');
  Promise.all([refreshRates({force:true}).then(function(r){return refreshMarket({force:true}).then(function(){return r;},function(){return r;});}),checkUpdate()]).then(function(r){refreshing=false;var b=document.getElementById('rfb');if(b)b.classList.remove('spin');
    if(r[0].ok){try{snap();}catch(e){}}if(!sheetOpen())render();
    if(r[1].newer)toast('Yeni sürüm '+r[1].v+' hazır',function(){hardReload();},'Yenile');else toast(r[0].ok?'Piyasalar güncellendi · '+fmtTs(S.fxTs):r[0].msg);});
};
/* güncelleme denetimi: sunucudaki version.json (önbelleksiz) çalışan sürümle (VER) karşılaştırılır.
   Eskiden yalnızca yeni hizmet çalışanı aranıyordu; o arka planda zaten kurulduysa sayfa eski kalsa da "güncel" deniyordu. */
function verNewer(a,b){a=String(a).split('.').map(Number);b=String(b).split('.').map(Number);for(var i=0;i<Math.max(a.length,b.length);i++){var x=a[i]||0,y=b[i]||0;if(x!==y)return x>y;}return false;}
function latestVer(){try{return fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){return j&&j.v?String(j.v):null;}).catch(function(){return null;});}catch(e){return Promise.resolve(null);}}
function swUpdate(){try{if(!('serviceWorker' in navigator))return Promise.resolve();return navigator.serviceWorker.getRegistration().then(function(rg){return rg&&rg.update();}).catch(function(){});}catch(e){return Promise.resolve();}}
function checkUpdate(){return latestVer().then(function(v){var n=!!v&&verNewer(v,VER);if(n)swUpdate();return {v:v,newer:n};});}
/* eski dosyaları önbellekten atıp yeniden yükle: yeni sürüm sunucudan gelir */
function hardReload(){try{if(ui.page&&ui.page.k==='note')saveNote();flushNative();}catch(e){}var go=function(){location.reload();};
  swUpdate().then(function(){return window.caches?caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k);}));}):null;}).then(go,go);}
ACT['check-upd']=function(){msg('Denetleniyor…',true,'f-upd');checkUpdate().then(function(r){
  if(!r.v){msg('Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene. (Şu anki sürüm '+VER+')',false,'f-upd');return;}
  if(r.newer){msg('Yeni sürüm '+r.v+' bulundu, yükleniyor…',true,'f-upd');setTimeout(hardReload,600);}
  else msg('Uygulama güncel · sürüm '+VER,true,'f-upd');});};
/* açılışta ve uygulamaya dönünce sessiz denetim: yeni sürüm varsa Yenile düğmesi */
var UPDT=0;function autoUpd(){if(Date.now()-UPDT<30*60000)return;UPDT=Date.now();checkUpdate().then(function(r){if(r.newer)toast('Yeni sürüm '+r.v+' hazır',function(){hardReload();},'Yenile');});}
setTimeout(autoUpd,4000);document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(autoUpd,1500);});

/* ---------- bildirim ve hatırlatıcı ---------- */
ACT['notif-ask']=function(){if(nb('askNotif')){try{NB.askNotif();}catch(e){}return;}try{Notification.requestPermission().then(function(){render();});}catch(e){}};
window.walletPerm=function(){if(ui.page&&ui.page.k==='set'&&(ui.page.s==='bild'||ui.page.s==='oto'))render();pushPlan();};
ACT['notif-test']=function(){var r='err';try{r=NB.testNotif();}catch(e){}msg(r==='ok'?'Bildirim gönderildi. Gelmediyse bildirim iznini kontrol et.':'Bildirim gönderilemedi. Önce bildirim izni ver.',r==='ok','f-ntest');};
/* telefonun alarm planına verilecek hatırlatmalar */
function reminderPlan(){
  if(!S.alerts.rec||!S.alerts.push)return [];
  var h=+S.alerts.hour||9,now=Date.now(),list=[],days=+S.alerts.days||0,m=maskOn;maskOn=!!S.hide;
  try{upcoming(62).forEach(function(u){var d=pdate(u.date),amt=S.hide?'':' · '+moneyIn(u.amt,u.acct,1);
    var at1=new Date(d.getFullYear(),d.getMonth(),d.getDate()-days,h,0,0).getTime(),at2=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,0,0).getTime();
    if(days>0&&at1>now)list.push({at:at1,title:'Yaklaşan ödeme: '+u.name,body:dayWord(days)+' sonra son gün ('+pdate(u.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})+')'+amt});
    if(at2>now)list.push({at:at2,title:'Bugün son gün: '+u.name,body:'Ödemeyi yaptıysan Wallet’ta “Ödendi” olarak işaretle'+amt});});}finally{maskOn=m;}
  return list.sort(function(a,b){return a.at-b.at;}).slice(0,40);
}
function pushPlan(){if(!nb('schedule'))return;try{NB.schedule(JSON.stringify(reminderPlan()));}catch(e){}}
function notifyDue(){
  if(nb('schedule'))return;
  if(!S.notif||!('Notification' in window)||Notification.permission!=='granted'||ui.locked)return;
  var day=todayS();if(S.notifDay===day)return;
  var items=alertItems();if(!items.length)return;
  S.notifDay=day;save();
  var body=items.slice(0,4).map(function(x){return x[1];}).join('\n');
  try{if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(function(reg){reg.showNotification('Wallet',{body:body,icon:'icons/icon-192.png',tag:'wallet-due'});});}else{new Notification('Wallet',{body:body,icon:'icons/icon-192.png'});}}catch(e){}
}
function applySecure(){if(nb('setSecure')){try{NB.setSecure(!!S.secure);}catch(e){}}}

/* ---------- olaylar ---------- */
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter'||e.isComposing)return;var t=e.target;
  if(t&&t.id==='nc-in'){e.preventDefault();ACT['cat-new-ok']();return;}
  if(t&&t.tagName==='INPUT'&&t.closest&&t.closest('.sheet')){var b=t.closest('.sheet').querySelector('.btn[data-act^="save"],.btn[data-act="trade"],.btn[data-act="ga-save"],.btn[data-act="rc-save"]');if(b){e.preventDefault();b.click();}}
});
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');if(!el)return;
  var a=el.dataset.act;if(!Object.prototype.hasOwnProperty.call(ACT,a))return;
  /* bir eylem hata verirse uygulama donmaz: kullanıcıya söylenir, hata kaydına yazılır (testler de görsün diye yeniden fırlatılır) */
  try{ACT[a](el,el.dataset.id,el.dataset.v);}catch(err){errLog('eylem '+a,err&&err.message,err&&err.stack&&String(err.stack).split('\n')[1]);
    try{toast('Bir sorun oldu, işlem tamamlanamadı. Ayrıntı: Ayarlar › Veri ve yedek › Hata kaydı.');}catch(e2){}try{err.__logged=true;}catch(e3){}setTimeout(function(){throw err;},0);}
});
document.addEventListener('change',function(e){
  var t=e.target,d=t.dataset||{};
  if(t.id==='dccy'||t.id==='dccy2'){S.dccy=t.value;save();if(t.value!=='TRY'&&!(rateOf(t.value)>0)){toast(CCYN[t.value]+' kuru alınıyor…');refreshRates({force:true}).then(function(r){render();if(!r.ok)toast(r.msg);});}render();return;}
  if(t.id==='fi-tccy'){var old=S.fire.tccy,nwc=t.value,tv=+S.fire.target;if(tv>0&&rateOf(old)>0&&rateOf(nwc)>0)S.fire.target=r2(tv*rateOf(old)/rateOf(nwc));S.fire.tccy=nwc;save();render();return;}
  if(t.id==='c-from'||t.id==='c-to'){ui[t.id==='c-from'?'cfrom':'cto']=t.value;var co=document.getElementById('calc-out');if(co)co.innerHTML=calcOut();return;}
  if(t.id==='f-acct'||t.id==='f-to'){syncCcy();}
  if(t.id==='f-date')dateChips();
  if(t.id==='r-acct'){var lr=document.getElementById('lb-ramt');if(lr)lr.textContent='Tutar ('+CSYM[ccyOf(t.value)]+')';}
  if(t.id==='h-ccy'||t.id==='h-acct')syncH();
  if(t.id==='g-acct')syncG();
  if(t.id==='a-type')syncA();
  if(t.id==='a-ccy')syncA(true);
  if(t.id==='tr-acct')tradePrev();
  if(d.bind){
    var k=d.kind,v=t.value;
    if(k==='num')v=num(v);else if(k==='auto')v=(String(v).trim()==='')?'':num(v);else if(k==='int')v=parseInt(v,10)||1;
    setP(d.bind,v);
    if(d.bind==='payday'){remapPaid();ui.month=curP();}
    if(d.bind.indexOf('fx.')===0){S.fxTs=Date.now();if(S.fxChg)delete S.fxChg[d.bind.slice(3)];}
    save();render();return;
  }
  if(d.budget!==undefined){var n=r2(num(t.value));if(tooBig(n))n=0;if(n>0)S.budgets[d.budget]=n;else delete S.budgets[d.budget];S.sampleExtras=false;save();render();}
  else if(d.price!==undefined){var h=byId(S.holdings,d.price),pv=num(t.value);if(h&&pv>=0){h.price=pv;delete h.sample;save();render();}}
  else if(t.id==='f-cat'){t.dataset.manual='1';syncCatChips();}
  else if(t.id==='im-file'){var f0=t.files&&t.files[0];if(f0)impFile(f0);}
  else if(t.id==='rs-file'){var f=t.files&&t.files[0],ta=document.getElementById('rs-txt'),nm=document.getElementById(t.id+'-name');
    if(f){if(nm)nm.textContent=f.name;var fr=new FileReader();fr.onload=function(){if(ta)ta.value=String(fr.result||'');};fr.onerror=function(){if(nm)nm.textContent='Dosya okunamadı.';};fr.readAsText(f);}}
});
document.addEventListener('input',function(e){
  var t=e.target,d=t.dataset||{};
  if(t.classList&&t.classList.contains('calc-in')){var k0=CALCS[ui.calc]?ui.calc:'kredi';ui.cv[k0][d.k]=t.value;document.getElementById('calc-out').innerHTML=calcOut();}
  else if(t.id==='nsearch'){ui.nq=t.value;document.getElementById('nlist').innerHTML=notesList();}
  else if(t.id==='tq'){ui.tq=t.value;ui.tqN=100;clearTimeout(TQT);/* yazarken her tuşta değil, kısa bir duraksamada ara */TQT=setTimeout(function(){var tl=document.getElementById('txlist');if(tl)tl.innerHTML=txList();},t.value?140:0);}
  else if(t.id==='sset'){ui.sq=t.value;document.getElementById('setlist').innerHTML=setList();}
  else if(t.id==='mq'){ui.mq=t.value;mUpd();clearTimeout(mTimer);var mqv=t.value;mTimer=setTimeout(function(){mRemote(mqv);},450);}
  else if(d.nf&&ui.page&&ui.page.k==='note'){ui.page.draft[d.nf]=t.value;ui.page.dirty=true;}
  else if(t.id==='f-amt'||t.id==='f-amt2'){if(t.id==='f-amt2')t.dataset.manual='1';if(t.id==='f-amt')syncCcy();else balPreview();}
  else if(t.id==='h-qty'||t.id==='h-cost')syncH();
  else if(t.id==='tr-qty'||t.id==='tr-price')tradePrev();
  else if(t.id==='rc-amt'){var bt=document.querySelector('[data-act="rc-save"]'),acc=bt&&bt.dataset.id,box=document.getElementById('rc-diff');if(acc&&box){var df=r2(num(t.value)-acctBal(acc));box.innerHTML=Math.abs(df)<0.005?'Fark yok.':'Fark: <b class="num '+(df<0?'exp':'inc')+'">'+(df<0?'−':'+')+moneyIn(Math.abs(df),acc)+'</b>';}}
  else if(t.id==='f-note'&&txType!=='trf'){
    var txt=fold(t.value),sel=document.getElementById('f-cat');
    if(sel&&!sel.dataset.manual){var r=S.rules.filter(function(x){return x.kw&&txt.indexOf(fold(x.kw))>-1;})[0];
      var g=r?null:catGuess(txType,txt,num(val('f-amt'))),rc=r?r.cat:(g&&g.p>=0.5?g.cat:noteCat(txType,txt.trim()));
      if(rc&&Array.prototype.some.call(sel.options,function(o){return o.value===rc;})){sel.value=rc;syncCatChips();}}
  }
});
/* net servet grafiğinde dokunma ve parmak kaydırma */
['pointerdown','pointermove'].forEach(function(ev){document.addEventListener(ev,function(e){var c=e.target.closest&&e.target.closest('.nwchart');if(!c)return;if(ev==='pointermove'&&!(e.buttons||e.pointerType==='touch'))return;nwScrub(c,e.clientX);},{passive:true});});
document.addEventListener('scroll',function(e){
  var t=e.target;if(!t||!t.id)return;
  if(t.id==='secbar')edgeFade('secbar','secwrap');
  else if(t.id==='qa'){ui.qaX=t.scrollLeft;edgeFade('qa','qawrap');}
},true);
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||ui.locked)return;
  if(sheetOpen())closeSheet();else if(ui.page)closePage();
});
document.addEventListener('visibilitychange',function(){
  if(document.hidden){ui.hiddenAt=Date.now();if(ui.page&&ui.page.k==='note'){saveNote();flushNative();}if(S.autoBk&&bkOk()&&(S.savedAt||0)>(S.bkTs||0))autoBackup();}
  else{
    if(S.pin&&!ui.locked&&ui.hiddenAt&&(Date.now()-ui.hiddenAt)>=(S.pin.auto||0)*60000)lockNow();
    if(!S.fxTs||Date.now()-S.fxTs>300000)bgRates();
    if(ui.month!==curP()&&ui.hiddenAt&&Date.now()-ui.hiddenAt>36e5)ui.month=curP();
    notifyDue();pushPlan();pullSms();
  }
});
window.addEventListener('pagehide',function(){if(ui.page&&ui.page.k==='note'){saveNote();flushNative();}});
window.addEventListener('hashchange',function(){
  var h=(location.hash||'').slice(1),cur=ui.page;
  if(cur&&cur.k==='note'&&h==='not')return;
  if(h==='planlama'||h==='koc'){if(h==='koc')ui.plan='koc';goSec('plan');return;}
  var want=pageFromHash(h);
  if((!want&&!cur)||(want&&cur&&want.k===cur.k&&want.s===cur.s))return;
  finishPage();closeSheet();ui.page=want;render();window.scrollTo(0,0);
});
/* Android geri tuşu: önce açık pencereyi, sonra sayfayı kapatır, sonra İşlemler'e döner */
window.walletBack=function(){
  if(ui.locked)return false;
  if(sheetOpen()){closeSheet();return true;}
  if(ui.page&&ui.page.k==='piyasa'&&(ui.mq||ui.mlink)){ui.mq='';ui.mlink=null;render();return true;}
  if(ui.page){closePage();return true;}
  if(ui.sub!=='ev'){ui.sub='ev';persistUi();render();window.scrollTo(0,0);return true;}
  return false;
};
/* yeni sürüm: kullanıcı bir şey yazmıyorsa sessizce yenile, yoksa sor */
try{if('serviceWorker' in navigator){var swHad=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',function(){
  if(!swHad)return;swHad=false;
  if(!busy()&&!ui.page)location.reload();else toast('Yeni sürüm hazır',function(){location.reload();},'Yenile');});}}catch(e){}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});}catch(e){}

/* pencereyi üst kısmından aşağı sürükleyerek kapat (pencere en üstteyken) */
(function(){var sy=null,sh=null,dy=0;
  document.addEventListener('touchstart',function(e){var s=e.target.closest&&e.target.closest('.sheet');if(!s||e.touches.length!==1)return;
    var top=s.getBoundingClientRect().top;if(s.scrollTop>0||e.touches[0].clientY-top>72||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;sy=e.touches[0].clientY;sh=s;dy=0;},{passive:true});
  document.addEventListener('touchmove',function(e){if(sh==null)return;dy=Math.max(0,e.touches[0].clientY-sy);sh.style.transition='none';sh.style.transform=dy?'translateY('+dy+'px)':'';},{passive:true});
  document.addEventListener('touchend',function(){if(sh==null)return;var s=sh;sh=null;s.style.transition='transform .18s ease';
    if(dy>90){s.style.transform='translateY(100%)';setTimeout(function(){if(ACT.close)ACT.close();},170);}else s.style.transform='';dy=0;},{passive:true});
})();

/* yedek yüklemeden önceki veriye dön (Ayarlar › Veri ve yedek) */
ACT['rs-undo']=function(el){if(!armed(el)){toast('Önceki veriye dönmek için yeniden dokun');return;}var j=null;try{j=localStorage.getItem('wallet-prerestore');}catch(e){}if(!j)return;
  var keep=S.pin,bio=S.bio;S=norm(JSON.parse(j));S.pin=keep||null;S.bio=!!keep&&bio;try{localStorage.removeItem('wallet-prerestore');}catch(e){}ui.month=curP();save();render();toast('Yedek yüklemeden önceki verine dönüldü');};
ACT['bk-resume']=function(){delete S.bkHold;save();render();toast('Otomatik yedek yeniden açık');};
