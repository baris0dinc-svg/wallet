
/* ---------- Akıllı motor ----------
   Tamamen cihazda çalışır; hiçbir veri dışarı gitmez. Kendi işlemlerinden öğrenir:
   1) Kategori tahmini: not / SMS'teki satıcı kelimelerinden (Türkçe eklerine dayanıklı kökler) ve tutar aralığından
      öğrenen olasılık modeli (naive Bayes). Düzelttiğin her kategori bir sonraki tahmini iyileştirir.
   2) Tespitler: kaydedilmemiş düzenli ödemeler, olağandışı harcamalar, olası çift kayıtlar, bütçenin dolacağı gün,
      maaş gününe göre dönem başlangıcı önerisi.
   3) Dönem sonu tahmini: sabit (düzenli) ödemeler ile değişken harcama hızını ayırarak. */

/* ---- 1. kategori modeli ---- */
var STOP={'ile':1,'icin':1,'olan':1,'odeme':1,'odemesi':1,'harcama':1,'tutar':1,'islem':1,'kart':1,'karti':1,'kartiniz':1,'hesap':1,'hesabiniz':1,'tarih':1,'saat':1,'lira':1,'bakiye':1,'kullanilabilir':1,'limit':1,'nolu':1,'ref':1,'pos':1,'tl':1,'try':1,'the':1,'and':1};
function bTok(text){
  var w=fold(text||'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/),out=[];
  w.forEach(function(x){if(x.length<3||/^\d+$/.test(x)||STOP[x])return;out.push('w:'+x);if(x.length>5)out.push('s:'+x.slice(0,5));});
  return out;
}
function amtTok(a){a=+a||0;return a>0?'a:'+Math.min(12,Math.floor(Math.log(a)/Math.log(2.2))):'a:0';}
var BMC={k:null};
function bModel(){
  var k=(S.savedAt||0)+'|'+S.tx.length;if(BMC.k===k&&BMC.s===S.tx)return BMC.m;
  var m={exp:{n:0,c:{},t:{},v:{}},inc:{n:0,c:{},t:{},v:{}}};
  S.tx.forEach(function(t){if((t.type!=='exp'&&t.type!=='inc')||t.sample||!t.cat)return;var M=m[t.type];
    var tk=bTok(t.note);if(!tk.length)return;tk.push(amtTok(t.amt));
    M.n++;M.c[t.cat]=(M.c[t.cat]||0)+1;var T=M.t[t.cat]||(M.t[t.cat]={_:0});
    tk.forEach(function(x){T[x]=(T[x]||0)+1;T._++;M.v[x]=1;});});
  BMC={k:k,s:S.tx,m:m};return m;
}
/* {cat, p (0–1 olasılık), n (destek: o kelimelerle kaç kez görüldü)} ya da null */
function catGuess(type,text,amt){
  if(type!=='exp'&&type!=='inc')return null;var M=bModel()[type],tk=bTok(text);if(!M.n||!tk.length)return null;
  var known=tk.filter(function(x){return M.v[x];});if(!known.length)return null;known.push(amtTok(amt));
  var V=Object.keys(M.v).length+1,cats=Object.keys(M.c),allowed=type==='inc'?INCC():EXPC(),sc=[];
  cats.forEach(function(c){if(allowed.indexOf(c)<0)return;var T=M.t[c],s=Math.log(M.c[c]/M.n);known.forEach(function(x){s+=Math.log(((T[x]||0)+0.5)/(T._+0.5*V));});sc.push([c,s]);});
  if(!sc.length)return null;sc.sort(function(a,b){return b[1]-a[1];});
  var mx=sc[0][1],z=sc.reduce(function(a,x){return a+Math.exp(x[1]-mx);},0),top=sc[0][0],T=M.t[top],sup=0;
  known.forEach(function(x){if(x.charAt(0)!=='a')sup=Math.max(sup,T[x]||0);});
  return {cat:top,p:1/z,n:sup};
}
/* tüm otomatik kategorilerin tek giriş noktası: kurallar > öğrenilen model (güvenliyse) > anahtar kelimeler > model > Diğer */
function smartCat(text,type,amt){
  var n=fold(text||''),l=type==='inc'?INCC():EXPC();
  var r=S.rules.filter(function(x){return x.kw&&n.indexOf(fold(x.kw))>-1&&l.indexOf(x.cat)>=0;})[0];if(r)return r.cat;
  var g=catGuess(type,text,amt);if(g&&g.p>=0.6&&g.n>=2)return g.cat;
  for(var i=0;i<SMS_CAT.length;i++){if(SMS_CAT[i][1].test(n)&&l.indexOf(SMS_CAT[i][0])>=0)return SMS_CAT[i][0];}
  if(g&&g.p>=0.4)return g.cat;
  return type==='inc'?(l.indexOf('Diğer gelir')>=0?'Diğer gelir':l[l.length-1]):(l.indexOf('Diğer')>=0?'Diğer':l[l.length-1]);
}

/* ---- yardımcılar ---- */
function median(a){if(!a.length)return 0;var b=a.slice().sort(function(x,y){return x-y;}),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2;}
function mKey(t){var w=fold(t.note||'').replace(/[^a-z ]+/g,' ').split(/\s+/).filter(function(x){return x.length>=3&&!STOP[x];}).slice(0,3).join(' ');return w;}
function recPaidIds(){var o={};S.recurring.forEach(function(r){Object.keys(r.paid||{}).forEach(function(k){o[r.paid[k]]=1;});});return o;}

/* ---- 2a. kaydedilmemiş düzenli ödemeler ---- */
function recurCands(){
  var from=new Date(today0());from.setMonth(from.getMonth()-13);var f=isoDate(from),g={},pid=recPaidIds();
  S.tx.forEach(function(t){if(t.type!=='exp'||t.date<f||t.sample||pid[t.id])return;var k=mKey(t);if(!k)return;k=t.cat+'|'+k;(g[k]||(g[k]=[])).push(t);});
  var out=[],t0=todayS();
  Object.keys(g).forEach(function(k){var l=g[k].sort(function(a,b){return a.date<b.date?-1:1;});
    var byM={};l.forEach(function(t){byM[t.date.slice(0,7)]=t;});var ms=Object.keys(byM).sort();if(ms.length<3)return;
    var L=ms.map(function(m){return byM[m];}),gaps=[];for(var i=1;i<L.length;i++)gaps.push(daysBetween(L[i-1].date,L[i].date));
    var mg=median(gaps);if(mg<25||mg>36)return;if(gaps.filter(function(x){return x<20||x>45;}).length>Math.floor(gaps.length/3))return;
    var am=L.map(function(t){return txTL(t);}),md=median(am);if(!(md>0))return;
    if(am.filter(function(a){return Math.abs(a-md)/md>0.15;}).length>Math.floor(am.length/4))return;
    /* abonelik/fatura her ay aşağı yukarı aynı gün çekilir: günlerin en az %75'i medyana 4 gün yakın olmalı */
    var dms=L.map(function(t){return +t.date.slice(8,10);}),mdd=median(dms);if(dms.filter(function(d){var x=Math.abs(d-mdd);return Math.min(x,31-x)<=4;}).length<Math.ceil(L.length*0.75))return;
    var last=L[L.length-1];if(daysBetween(last.date,t0)>45)return;
    var nm=String(last.note||last.cat).trim();
    if(S.recurring.some(function(r){var rn=fold(r.name||'');return (rn&&(fold(nm).indexOf(rn)>-1||rn.indexOf(mKey(last))>-1))||(r.cat===last.cat&&Math.abs(toTL(r.amt,r.acct)-md)/md<0.1);}))return;
    var day=Math.round(median(L.map(function(t){return +t.date.slice(8,10);})));
    out.push({key:'rec:'+k,name:nm.charAt(0).toLocaleUpperCase('tr-TR')+nm.slice(1),amt:r2(last.amt),acct:last.acct,cat:last.cat,day:day,n:L.length,last:last});});
  return out.sort(function(a,b){return b.n-a.n;});
}
/* ---- 2b. olağandışı harcamalar (son 14 gün; kategorinin olağan tutarının çok üstünde) ---- */
function unusualTx(){
  var t0=todayS(),d14=new Date(today0());d14.setDate(d14.getDate()-14);var s14=isoDate(d14),d180=new Date(today0());d180.setDate(d180.getDate()-200);var s180=isoDate(d180),byC={},out=[],pid=recPaidIds();
  S.tx.forEach(function(t){if(t.type==='exp'&&t.date>=s180&&t.date<s14&&!t.sample)(byC[t.cat]||(byC[t.cat]=[])).push(txTL(t));});
  S.tx.forEach(function(t){if(t.type!=='exp'||t.date<s14||t.date>t0||t.sample||pid[t.id])return;var h=byC[t.cat];if(!h||h.length<5)return;
    var md=median(h),v=txTL(t),hi=h.slice().sort(function(a,b){return a-b;})[Math.floor(h.length*0.95)];
    if(v>=500&&v>=md*3&&v>hi)out.push({key:'unu:'+t.id,t:t,md:md,x:v/md});});
  return out.sort(function(a,b){return b.x-a.x;});
}
/* ---- 2c. olası çift kayıt (aynı gün, aynı hesap, tutar ve not) ---- */
function dupTx(){
  var d30=new Date(today0());d30.setDate(d30.getDate()-30);var s30=isoDate(d30),m={},out=[];
  var L=recLinked(),m2={};
  S.tx.forEach(function(t){if((t.type!=='exp'&&t.type!=='inc')||t.date<s30||t.sample||!(t.amt>=100))return;var k=[t.type,t.date,t.acct,r2(t.amt),fold(t.note||'').trim(),t.cat].join('|'),k2=[t.type,t.date,t.acct,r2(t.amt),t.cat].join('|');
    if(m[k])out.push({key:'dup:'+m[k].id+':'+t.id,a:m[k],b:t});else if(m2[k2]&&(L[m2[k2].id]||L[t.id]))out.push({key:'dup:'+m2[k2].id+':'+t.id,a:m2[k2],b:t});else{m[k]=t;m2[k2]=t;}});
  return out;
}
/* ---- 3. dönem sonu tahmini ---- */
/* hıza katılmayan giderler: kira, fatura, aidat gibi ayda bir ödenenler ve tek seferlik büyük kalemler
   (dönemin olağan giderinin dörtte biri ve üstü) — bunlar zaten ödendi, dönemin kalanına yayılmaz */
var FIXC=/^(kira|fatura|aidat|egitim|okul|sigorta|vergi|abonelik|kredi|taksit|kasko|mtv|emlak)/;
function lumpy(t,big){return FIXC.test(fold(t.cat||''))||(big>0&&txTL(t)>=big);}
function forecast(){
  var k=curP(),s=pStart(k),e=pEnd(k),t0=todayS(),days=pDays(k),el=Math.min(days,Math.max(1,daysBetween(s,t0)+1)),rem=days-el,pid=recPaidIds();
  var big=avgMonthly('exp')*0.25;
  var mt=monthTx(k),spent=sum(mt,'exp'),inc=sum(mt,'inc'),varNow=0;mt.forEach(function(t){if(t.type==='exp'&&!pid[t.id]&&!lumpy(t,big))varNow+=txTL(t);});
  var hist=monthBase().ks.slice(0,3).map(function(p){var v=0;monthTx(p).forEach(function(t){if(t.type==='exp'&&!pid[t.id]&&!lumpy(t,big))v+=txTL(t);});return v>0?v/pDays(p):null;}).filter(function(x){return x!=null;});
  var hRate=hist.length?median(hist):null,cRate=varNow/el,w=Math.min(1,el/days*1.5),rate=hRate==null?cRate:(cRate*w+hRate*(1-w));
  var recLeft=recDue(k).tot;
  var exp=r2(spent+rate*rem+recLeft),ai=avgMonthly('inc'),expInc=Math.max(inc+recIncDue(k),ai||0);
  return {spent:spent,exp:exp,recLeft:r2(recLeft),rate:rate,rem:rem,inc:inc,expInc:r2(expInc),incAssumed:expInc>inc+1,net:r2(expInc-exp),hist:hist.length};
}
/* ---- 2d. bütçenin dolacağı gün ---- */
function budgetPace(){
  var k=curP(),s=pStart(k),e=pEnd(k),t0=todayS(),days=pDays(k),el=Math.max(1,daysBetween(s,t0)+1),sp=spentByCat(k),out=[];
  if(el<3||el>=days)return out;
  /* ayda bir ödenen kategoriler (kira, fatura…) ve 3'ten az işlemli kategoriler için hız tahmini yapılmaz */
  var cnt={};monthTx(k).forEach(function(t){if(t.type==='exp')cnt[t.cat]=(cnt[t.cat]||0)+1;});
  EXPC().forEach(function(c){var b=budLim(c,k);if(!(b>0)||FIXC.test(fold(c))||(cnt[c]||0)<3)return;var v=sp[c]||0;if(v>=b||v<b*0.25)return;var rate=v/el,need=(b-v)/rate;if(el+need>=days)return;
    var d=pdate(t0);d.setDate(d.getDate()+Math.ceil(need));out.push({key:'pace:'+c+':'+k,c:c,date:isoDate(d),left:b-v});});
  return out;
}
/* ---- 2e. maaş günü önerisi ---- */
function paydayHint(){
  var l=S.tx.filter(function(t){return t.type==='inc'&&!t.sample&&(/maas|ucret/.test(fold(t.cat+' '+(t.note||''))))&&txTL(t)>=1000;}),byM={};
  l.forEach(function(t){byM[t.date.slice(0,7)]=+t.date.slice(8,10);});var ds=Object.keys(byM).sort().slice(-6).map(function(m){return byM[m];});
  if(ds.length<3)return null;var md=Math.round(median(ds));if(ds.filter(function(d){return Math.abs(d-md)>2;}).length)return null;
  if(md<=3||Math.abs((S.payday||1)-md)<=2)return null;return {key:'pay:'+md,day:md};
}

/* ---- tespitlerin listesi ve kartı ---- */
function brainItems(){
  S.brainDis=S.brainDis||{};var D=S.brainDis,out=[];
  /* kapatılanlar önce elenir, sonra her türden en çok 2 gösterilir (kapatılan bir öneri sıradakini gizlemesin) */
  var top=function(l){return l.filter(function(x){return !D[x.key];}).slice(0,2);};
  top(dupTx()).forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'warn',ic:'copy',t:'Olası çift kayıt: '+esc(x.b.note||x.b.cat)+' '+esc(moneyIn(x.b.amt,x.b.acct,1))+' ('+esc(pdate(x.b.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+', '+esc(x.b.acct)+') iki kez girilmiş.',btn:'Birini sil',act:'br-dup',id:x.b.id});});
  top(recurCands()).forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'blue',ic:'repeat',t:esc(x.name)+' her ay yaklaşık '+esc(moneyIn(x.amt,x.acct,1))+' ('+x.n+' aydır, ayın '+x.day+'’i civarı). Düzenli ödemelere eklersen hatırlatılır ve tahminlere girer.',btn:'Düzenli ödemelere ekle',act:'br-rec',id:x.key});});
  budgetPace().forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'exp',ic:'scale',t:'Bu hızla '+esc(x.c)+' bütçesi '+esc(pdate(x.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' civarında biter (kalan '+TRY0.format(x.left)+').',btn:'İşlemleri gör',act:'br-cat',id:x.c});});
  top(unusualTx()).forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'warn',ic:'bell',t:'Olağandışı harcama: '+esc(x.t.note||x.t.cat)+' '+TRY0.format(txTL(x.t))+'. '+esc(x.t.cat)+' harcamaların genelde '+TRY0.format(x.md)+' civarı.',btn:'İşlemi aç',act:'edit-tx',id:x.t.id});});
  /* telefon kaybolursa veri de gider: 30 günde bir yedeği Drive'a ya da e-postaya paylaşmayı hatırlat */
  var bo=S.bkOutTs||0,ownN=S.tx.filter(function(t){return !t.sample;}).length;if(ownN>=20&&Date.now()-bo>30*864e5){var bk='bkout:'+todayS().slice(0,7);if(!D[bk])out.push({key:bk,c:'blue',ic:'share',t:bo?'Yedeğini telefon dışına '+Math.floor((Date.now()-bo)/864e5)+' gündür kaydetmedin. Telefon kaybolursa veriler de gider.':'Yedeğin yalnızca bu telefonda. Bir kopyasını Google Drive’a ya da e-postana kaydet.',btn:'Yedeği paylaş',act:'bk-share',id:''});}
  var ph=paydayHint();if(ph&&!D[ph.key])out.push({key:ph.key,c:'inc',ic:'cal',t:'Maaşın genelde ayın '+ph.day+'’inde yatıyor. Dönemleri '+ph.day+'’inden başlatırsan bütçe ve analizler maaş döngüne göre hesaplanır.',btn:'Dönemi '+ph.day+'’inden başlat',act:'br-pay',id:String(ph.day)});
  return out;
}
function brainCard(max){
  var l=brainItems();if(!l.length)return '';
  return '<div class="card brain"><h2>'+ic('sparkles')+' Akıllı tespitler</h2><div class="list">'+l.slice(0,max||6).map(function(x){
    return '<div class="item bi"><span class="sic" style="--c:var(--'+x.c+')">'+ic(x.ic)+'</span><span class="mid"><div class="wrap-t">'+x.t+'</div><div class="bacts"><button class="btn small" data-act="'+x.act+'" data-id="'+esc(x.id)+'">'+x.btn+'</button><button class="linkbtn" data-act="br-dis" data-id="'+esc(x.key)+'">Gizle</button></div></span></div>';}).join('')+'</div></div>';
}
ACT['br-dis']=function(el,id){S.brainDis=S.brainDis||{};S.brainDis[id]=Date.now();save();render();};
ACT['br-dup']=function(el,id){var t=byId(S.tx,id);if(!t)return;S.tx=S.tx.filter(function(x){return x.id!==id;});save();render();toast('Çift kayıt silindi',function(){S.tx.push(t);save();render();toast('Geri alındı');});};
ACT['br-rec']=function(el,id){var x=recurCands().filter(function(c){return c.key===id;})[0];if(!x)return;
  var r={id:uid(),name:x.name,amt:x.amt,day:x.day,cat:x.cat,acct:x.acct,paid:{}};var k=pk(x.last.date);if(k===curP())r.paid[k]=x.last.id;
  S.recurring.push(r);save();render();toast(x.name+' düzenli ödemelere eklendi');};
ACT['br-cat']=function(el,id){ui.month=curP();ui.tq='';ui.rng='ay';ui.filter='exp';ui.txv='list';goSec('islem');var q=document.getElementById('tq');if(q){q.value=id;q.dispatchEvent(new Event('input',{bubbles:true}));}};
ACT['br-pay']=function(el,id){var d=+id;if(!(d>=1&&d<=31))return;S.payday=d;remapPaid();ui.month=curP();save();render();toast('Dönemler artık ayın '+d+'’inden başlıyor');};
