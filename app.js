(function(){
'use strict';
var KEY='kumbara-v1';
var D_EXP=['Market','Fatura','Kira','Ulaşım','Yeme-İçme','Sağlık','Eğlence','Giyim','Eğitim','Diğer'];
var D_INC=['Maaş','Ek gelir','Yatırım getirisi','Diğer gelir'];
var D_ACC=['Nakit','Banka','Kredi kartı'];
var HTYPES=['Hisse','Fon','Altın','Döviz','Kripto','Gayrimenkul','Araç','Mevduat','Diğer'];
var DTYPES=['Kredi','Kredi kartı','Taksit','Kişisel borç','Diğer'];
var FXL={USD:'USD/TL',EUR:'EUR/TL',XAU:'Gram altın'};
var R0=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0});
var R2=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2});
var NUM2=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2});
var maskOn=false;
var TRY0={format:function(n){return maskOn?'₺ ••••':R0.format(n);}};
var TRY2={format:function(n){return maskOn?'₺ ••••':R2.format(n);}};
var ICONS={
  home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  trend:'M3 17l5-5 4 4 8-9M15 7h5v5',
  note:'M5 3h10l4 4v14H5z M15 3v4h4 M8 12h8M8 16h6',
  calc:'M6 3h12v18H6z M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
  gear:'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 3.5v5M9 9.5v5M17 15.5v5',
  plus:'M12 5v14M5 12h14', l:'M15 6l-6 6 6 6', r:'M9 6l6 6-6 6',
  back:'M19 12H5M11 6l-6 6 6 6',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  bank:'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  shapes:'M7 3l4 7H3z M14 14h7v7h-7z M7.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  bell:'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4',
  palette:'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z M7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01',
  shield:'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z M9 12l2 2 4-4',
  server:'M4 5h16v5H4z M4 14h16v5H4z M8 7.5h.01M8 16.5h.01',
  info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5M12 8h.01',
  sparkles:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeoff:'M3 3l18 18 M10.6 6.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4 M6.6 6.7A17 17 0 0 0 2 12s4 7 10 7c1.7 0 3.2-.4 4.5-1 M9.9 9.9a3 3 0 0 0 4.2 4.2',
  fire:'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-.5-5 1-8z',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
  pin:'M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3z'
};
function ic(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICONS[n]+'"/></svg>';}
var TABS=[['cuzdan','Cüzdan','logo'],['portfoy','Portföy','trend'],['notlar','Notlar','note'],['arac','Araçlar','calc'],['ayarlar','Ayarlar','gear']];
var SETS=[
 {id:'profil',t:'Profil & Dönem',d:'Ad, ana para birimi ve maaş günü',i:'user',c:'var(--inc)'},
 {id:'hesap',t:'Hesaplar & Cüzdanlar',d:'Nakit, banka, kredi kartı hesapları ve transfer',i:'bank',c:'var(--blue)'},
 {id:'kat',t:'Kategoriler & Otomatik Kurallar',d:'Özel gelir/gider kategorileri ve not kuralları',i:'shapes',c:'var(--warn)'},
 {id:'kurlar',t:'Para Birimi & Piyasa Kurları',d:'Döviz ve altın kurlarını elle gir',i:'trend',c:'var(--inc)'},
 {id:'bild',t:'Bildirimler',d:'Bütçe aşımı ve ödeme uyarıları',i:'bell',c:'var(--warn)'},
 {id:'gor',t:'Görünüm & Gizlilik',d:'Tema, yazı boyutu ve bakiye gizleme',i:'palette',c:'var(--blue)'},
 {id:'notlar',t:'Notlar',d:'Sıralama, görünüm ve sabitleme',i:'note',c:'var(--accent)'},
 {id:'guv',t:'Güvenlik & Kilit',d:'PIN ile uygulama kilidi',i:'shield',c:'var(--inc)'},
 {id:'veri',t:'Veri Yönetimi & Yedekleme',d:'CSV dışa aktarma, şifreli yedek ve geri yükleme',i:'server',c:'var(--blue)'},
 {id:'hak',t:'Hakkında & Destek',d:'Sürüm, gizlilik özeti ve sınırlar',i:'info',c:'var(--ink2)'},
 {id:'demo',t:'Gelişmiş & Demo Verileri',d:'Örnek verileri yükle ya da sil, her şeyi sıfırla',i:'sparkles',c:'var(--warn)'}
];
var ACT={};
var dl=null;
try{if(window.claude&&window.claude.use){window.claude.use('downloads').then(function(x){dl=x||null;},function(){});}}catch(e){}

/* ---------- yardımcılar ---------- */
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function num(s){s=String(s==null?'':s).trim().replace(/\s/g,'');
  var c=s.split(',').length-1,d=s.split('.').length-1;
  if(c&&d){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'');}
  else if(c>1)s=s.replace(/,/g,'');
  else if(c)s=s.replace(',','.');
  else if(d>1||/^\d{1,3}\.\d{3}$/.test(s))s=s.replace(/\./g,'');
  var n=parseFloat(s);return isNaN(n)?0:n;}
function pad(n){return String(n).padStart(2,'0');}
function isoDate(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function mkey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1);}
function addMonth(k,o){var p=k.split('-');return mkey(new Date(+p[0],+p[1]-1+o,1));}
function mlabel(k,short){var p=k.split('-'),r=new Date(+p[0],+p[1]-1,1).toLocaleDateString('tr-TR',short?{month:'short'}:{month:'long',year:'numeric'});return r.charAt(0).toLocaleUpperCase('tr-TR')+r.slice(1);}
function pdate(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function color(name){var h=0,s=String(name);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return 'hsl('+(h%360)+' 45% 52%)';}
function sgn(n){return (n>=0?'+':'−')+TRY0.format(Math.abs(n));}
function byId(list,id){return list.filter(function(x){return x.id===id;})[0];}
function fx1(n){return n>0?NUM2.format(n):'—';}
function today0(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function daysBetween(a,b){return Math.round((pdate(b)-pdate(a))/864e5);}
function getP(path){return path.split('.').reduce(function(o,k){return o==null?o:o[k];},S);}
function setP(path,val){
  if(!/^[A-Za-z0-9_.]+$/.test(path)||/__proto__|constructor|prototype/.test(path))return;
  var ks=path.split('.'),o=S;
  for(var i=0;i<ks.length-1;i++){if(o[ks[i]]==null||typeof o[ks[i]]!=='object')o[ks[i]]={};o=o[ks[i]];}
  o[ks[ks.length-1]]=val;
}

/* ---------- veri ---------- */
function seed(){
  var now=new Date(),cur=mkey(now),pm=addMonth(cur,-1),pm2=addMonth(cur,-2),today=now.getDate();
  function t(m,day,type,amt,cat,note,acct){var dd=(m===cur)?Math.min(day,today):day;return {id:uid(),type:type,amt:amt,cat:cat,note:note,acct:acct,date:m+'-'+pad(dd),sample:true};}
  var tx=[
    t(cur,1,'inc',42000,'Maaş','Aylık maaş','Banka'), t(cur,2,'exp',14000,'Kira','Ev kirası','Banka'),
    t(cur,3,'exp',1850,'Market','Haftalık alışveriş','Kredi kartı'), t(cur,4,'exp',1340,'Fatura','Elektrik ve internet','Banka'),
    t(cur,5,'exp',650,'Ulaşım','Akbil yükleme','Nakit'), t(cur,6,'exp',780,'Yeme-İçme','Arkadaşlarla akşam yemeği','Kredi kartı'),
    t(cur,6,'exp',920,'Market','Pazar ve market','Nakit'),
    t(pm,1,'inc',42000,'Maaş','Aylık maaş','Banka'), t(pm,2,'exp',14000,'Kira','Ev kirası','Banka'),
    t(pm,8,'exp',5200,'Market','Aylık market','Kredi kartı'), t(pm,12,'exp',2100,'Fatura','Faturalar','Banka'),
    t(pm,15,'exp',2400,'Yeme-İçme','Dışarıda yemek','Kredi kartı'), t(pm,20,'exp',1900,'Eğlence','Sinema ve konser','Kredi kartı'),
    t(pm,24,'inc',3500,'Ek gelir','Serbest iş','Banka'),
    t(pm2,1,'inc',40000,'Maaş','Aylık maaş','Banka'), t(pm2,2,'exp',13000,'Kira','Ev kirası','Banka'),
    t(pm2,9,'exp',4800,'Market','Aylık market','Kredi kartı'), t(pm2,14,'exp',2600,'Fatura','Faturalar','Banka'),
    t(pm2,19,'exp',3100,'Giyim','Mevsimlik alışveriş','Kredi kartı'), t(pm2,25,'exp',1700,'Ulaşım','Yakıt','Nakit')
  ];
  return {tx:tx,budgets:{'Market':6000,'Yeme-İçme':3000,'Ulaşım':2000,'Eğlence':1500,'Fatura':2500},
    opening:{'Nakit':3500,'Banka':28000,'Kredi kartı':0},sampleExtras:true,fx:{USD:41.5,EUR:0,XAU:0},fxSample:true,
    goals:[{id:uid(),name:'Acil durum fonu',target:120000,saved:45000,date:addMonth(cur,10)+'-01',sample:true},{id:uid(),name:'Yaz tatili',target:60000,saved:12000,date:addMonth(cur,7)+'-01',sample:true}],
    recurring:[{id:uid(),name:'Spor salonu',amt:900,day:5,cat:'Eğlence',acct:'Kredi kartı',paid:{},sample:true},{id:uid(),name:'İnternet',amt:450,day:15,cat:'Fatura',acct:'Banka',paid:{},sample:true},{id:uid(),name:'Dijital abonelik',amt:229,day:22,cat:'Eğlence',acct:'Kredi kartı',paid:{},sample:true}],
    holdings:[
      {id:uid(),name:'Gram altın',type:'Altın',qty:25,cost:2900,price:3350,sample:true},
      {id:uid(),name:'Dolar',type:'Döviz',ccy:'USD',qty:1200,cost:34.2,price:41.5,sample:true},
      {id:uid(),name:'Endeks fonu',type:'Fon',qty:5000,cost:12.4,price:15.1,sample:true}],
    debts:[{id:uid(),name:'Taşıt kredisi',type:'Kredi',amt:85000,sample:true}],
    notes:[{id:uid(),title:'Aylık kontrol listesi',body:'Faturaları kontrol et\nKredi kartı ekstresini öde\nBirikim hesabına aktar',ts:Date.now(),cts:Date.now(),sample:true}]};
}
function norm(d){
  d.tx=d.tx||[];d.budgets=d.budgets||{};d.opening=d.opening||{};d.holdings=d.holdings||[];d.notes=d.notes||[];
  d.fx=d.fx||{};d.fx.USD=d.fx.USD||0;d.fx.EUR=d.fx.EUR||0;d.fx.XAU=d.fx.XAU||0;d.fxAuto=d.fxAuto!==false;d.mkt=d.mkt||{};d.notif=!!d.notif;d.notifDay=d.notifDay||'';
  d.goals=d.goals||[];d.recurring=d.recurring||[];d.debts=d.debts||[];
  d.accounts=(d.accounts&&d.accounts.length)?d.accounts:D_ACC.slice();
  d.cats=d.cats||{};d.cats.exp=d.cats.exp||D_EXP.slice();d.cats.inc=d.cats.inc||D_INC.slice();
  d.rules=d.rules||[];d.payday=d.payday||1;d.name=d.name||'';d.fs=d.fs||1;d.hide=!!d.hide;d.theme=d.theme||'auto';
  d.alerts=Object.assign({budget:true,rec:true,thr:80,days:3},d.alerts||{});
  d.nset=Object.assign({sort:'edited',view:'card',lines:3,date:true,pinFirst:true,confirmDel:true},d.nset||{});
  d.fire=Object.assign({exp:'',save:'',ret:4,wr:4,acc:true,pf:true,extra:0},d.fire||{});
  return d;
}
function load(){
  try{var raw=localStorage.getItem(KEY);if(raw){var d=JSON.parse(raw);if(d&&d.tx)return norm(d);}}catch(e){}
  return norm(seed());
}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
var hostTheme=document.documentElement.getAttribute('data-theme');
function applyTheme(){var r=document.documentElement,t=S.theme;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else if(hostTheme)r.setAttribute('data-theme',hostTheme);else r.removeAttribute('data-theme');}

function EXPC(){return S.cats.exp;} function INCC(){return S.cats.inc;} function ACCS(){return S.accounts;}

/* ---------- dönem (maaş günü) ---------- */
function dimYM(y,m){return new Date(y,m,0).getDate();}
function pStartDay(y,m){return Math.min(S.payday||1,dimYM(y,m));}
function pk(ds){var p=ds.split('-'),y=+p[0],m=+p[1],d=+p[2];if(d<pStartDay(y,m)){m--;if(m<1){m=12;y--;}}return y+'-'+pad(m);}
function pStart(k){var p=k.split('-');return k+'-'+pad(pStartDay(+p[0],+p[1]));}
function pEnd(k){var s=pdate(pStart(addMonth(k,1)));s.setDate(s.getDate()-1);return isoDate(s);}
function curP(){return pk(isoDate(new Date()));}
function plabel(k){return (S.payday>1)?mlabel(k)+' dönemi':mlabel(k);}
function prange(k){var f=function(d){return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});};return f(pdate(pStart(k)))+' – '+f(pdate(pEnd(k)));}
function dueDate(r,k){var p=k.split('-'),y=+p[0],m=+p[1],pd=pStartDay(y,m),day=r.day;if(pd>1&&day<pd){m++;if(m>12){m=1;y++;}}var r2=y+'-'+pad(m)+'-'+pad(Math.min(day,dimYM(y,m))),e=pEnd(k),st=pStart(k);return r2>e?e:(r2<st?st:r2);}
function daysLeft(k){return daysBetween(isoDate(today0()),pEnd(k))+1;}

var ui={slide:0,tab:'cuzdan',sub:'islem',month:curP(),filter:'all',calc:'kredi',cv:{},nq:'',sq:'',page:null,locked:!!S.pin,reveal:false,pinBuf:'',fails:0,lockUntil:0,forgot:false,hiddenAt:0};

/* ---------- hesap ---------- */
function monthTx(k){return S.tx.filter(function(t){return pk(t.date)===k;});}
function sum(list,type){return list.filter(function(t){return t.type===type;}).reduce(function(a,t){return a+t.amt;},0);}
function spentByCat(k){var o={};monthTx(k).forEach(function(t){if(t.type==='exp')o[t.cat]=(o[t.cat]||0)+t.amt;});return o;}
function acctBal(a){var b=+S.opening[a]||0;S.tx.forEach(function(t){if(t.type==='trf'){if(t.acct===a)b-=t.amt;if(t.to===a)b+=t.amt;}else if(t.acct===a)b+=(t.type==='inc'?t.amt:-t.amt);});return Math.round(b*100)/100;}
function accTotal(){return ACCS().reduce(function(a,x){return a+acctBal(x);},0);}
function acctUsed(a){return S.tx.some(function(t){return t.acct===a||t.to===a;})||S.recurring.some(function(r){return r.acct===a;});}
function hPrice(h){var r=h.ccy&&S.fx&&+S.fx[h.ccy];return r>0?r:h.price;}
function hVal(h){return h.qty*hPrice(h);} function hCost(h){return h.qty*h.cost;}
function pfTotals(){var v=0,c=0;S.holdings.forEach(function(h){v+=hVal(h);c+=hCost(h);});return {v:v,c:c};}
function hasSample(){return S.tx.some(function(t){return t.sample;})||S.holdings.some(function(h){return h.sample;})||S.notes.some(function(n){return n.sample;})||S.goals.some(function(n){return n.sample;})||S.recurring.some(function(n){return n.sample;})||S.debts.some(function(n){return n.sample;})||S.sampleExtras;}
function debtManual(){return S.debts.reduce(function(a,d){return a+(+d.amt||0);},0);}
function wealth(){
  var items=[],debts=[],by={};
  ACCS().forEach(function(a){var b=acctBal(a);if(b>0)items.push([a,b]);else if(b<0)debts.push([a,-b]);});
  S.holdings.forEach(function(x){var v=hVal(x);if(v>0)by[x.type]=(by[x.type]||0)+v;});
  Object.keys(by).forEach(function(k){items.push([k,by[k]]);});
  S.debts.forEach(function(d){if(d.amt>0)debts.push([d.name,+d.amt]);});
  var A=items.reduce(function(s,x){return s+x[1];},0),D=debts.reduce(function(s,x){return s+x[1];},0);
  return {items:items,debts:debts,assets:A,debt:D,net:A-D};
}
function recPaid(r,k){var id=r.paid&&r.paid[k];return !!id&&S.tx.some(function(t){return t.id===id;});}

/* ---------- FIRE ---------- */
function avgMonthly(type){var cur=curP(),v=[];for(var i=1;i<=6;i++){var s=sum(monthTx(addMonth(cur,-i)),type);if(s>0)v.push(s);}
  if(!v.length){var s0=sum(monthTx(cur),type);if(s0>0)v.push(s0);}
  return v.length?v.reduce(function(a,b){return a+b;},0)/v.length:0;}
function avgSave(){var cur=curP(),v=[];for(var i=1;i<=6;i++){var l=monthTx(addMonth(cur,-i));if(l.length)v.push(sum(l,'inc')-sum(l,'exp'));}
  if(!v.length){var l0=monthTx(cur);if(l0.length)v.push(sum(l0,'inc')-sum(l0,'exp'));}
  return v.length?v.reduce(function(a,b){return a+b;},0)/v.length:0;}
function monthsToFI(P,C,rm,T){
  if(P>=T)return 0;
  if(rm===0){return C<=0?Infinity:(T-P)/C;}
  var a=T+C/rm,b=P+C/rm;
  if(b<=0||a<=b)return Infinity;
  return Math.log(a/b)/Math.log(1+rm);
}
function fireModel(){
  var f=S.fire,autoE=avgMonthly('exp'),autoS=avgSave();
  var exp=(+f.exp>0)?+f.exp:autoE;
  var sv=(f.save!==''&&f.save!=null)?+f.save:Math.max(autoS,0);
  var assets=(f.acc?accTotal()-debtManual():0)+(f.pf?pfTotals().v:0)+(+f.extra||0);
  var wr=Math.max(+f.wr,0.1)/100,rm=Math.pow(1+(+f.ret)/100,1/12)-1;
  var o={ok:exp>0,exp:exp,autoE:autoE,autoS:autoS,sv:sv,assets:assets,wr:wr,rm:rm};
  if(!o.ok)return o;
  o.annual=exp*12;o.target=o.annual/wr;
  o.n=monthsToFI(Math.max(assets,0),sv,rm,o.target);
  o.prog=Math.min(Math.max(assets,0)/o.target*100,100);
  o.passive=assets*wr/12;
  return o;
}
function fmtYears(n){
  if(n<=0)return 'Hedefe ulaştın';
  if(!isFinite(n)||n>1200)return '100 yıldan fazla';
  var y=Math.floor(n/12),mo=Math.ceil(n-y*12);if(mo===12){y++;mo=0;}
  return ((y?y+' yıl ':'')+(mo?mo+' ay':'')).trim()||'1 ay';
}
function fireDate(n){if(!isFinite(n)||n>1200)return '';var d=new Date();d.setMonth(d.getMonth()+Math.ceil(n));return d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'});}

/* ---------- ortak parçalar ---------- */
function bannerHtml(){return hasSample()?'<div class="banner"><span>Örnek veriler gösteriliyor. Kendi verini girmeden önce sil.</span><button class="btn small ghost" data-act="sample-clear">Örnekleri sil</button></div>':'';}
function alertItems(){
  var A=S.alerts,items=[],cur=curP();
  if(A.budget){var sp=spentByCat(cur);EXPC().forEach(function(c){var lim=+S.budgets[c];if(lim>0){var s=sp[c]||0,r=s/lim*100;
    if(r>=100)items.push(['exp',c+' bütçesi aşıldı, '+TRY0.format(s-lim)+' fazla']);
    else if(r>=A.thr)items.push(['warn',c+': bütçenin %'+Math.round(r)+' kullanıldı']);}});}
  if(A.rec){var t0=isoDate(today0());S.recurring.forEach(function(r){if(recPaid(r,cur))return;var diff=daysBetween(t0,dueDate(r,cur));
    if(diff<=A.days)items.push([diff<0?'exp':'warn',r.name+' '+(diff<0?(-diff)+' gün gecikti':(diff===0?'bugün':diff+' gün sonra'))+' · '+TRY0.format(r.amt)]);});}
  return items;
}
function alertsHtml(){
  var items=alertItems();
  if(!items.length)return '';
  return '<div class="card"><h2>Uyarılar</h2><div class="list">'+items.slice(0,5).map(function(x){return '<div class="item"><span class="dot" style="background:var(--'+x[0]+')"></span><span class="mid"><div>'+esc(x[1])+'</div></span></div>';}).join('')+'</div></div>';
}
function trendCard(){
  var cur=curP(),ks=[],i;for(i=5;i>=0;i--)ks.push(addMonth(cur,-i));
  var rows=ks.map(function(k){var m=monthTx(k);return {k:k,inc:sum(m,'inc'),exp:sum(m,'exp')};});
  var mx=Math.max.apply(null,rows.map(function(r){return Math.max(r.inc,r.exp);}));
  if(!(mx>0))return '';
  var W=300,H=110,bw=14,gap=(W-rows.length*bw*2)/(rows.length+1),svg='',x=gap;
  rows.forEach(function(r){var hi=Math.round(r.inc/mx*H),he=Math.round(r.exp/mx*H);
    svg+='<rect x="'+x+'" y="'+(H-hi)+'" width="'+bw+'" height="'+hi+'" rx="3" fill="var(--inc)"/>';
    svg+='<rect x="'+(x+bw+2)+'" y="'+(H-he)+'" width="'+bw+'" height="'+he+'" rx="3" fill="var(--exp)"/>';
    svg+='<text x="'+(x+bw)+'" y="'+(H+14)+'" text-anchor="middle" font-size="9" fill="var(--ink2)">'+esc(mlabel(r.k).slice(0,3))+'</text>';x+=bw*2+gap;});
  var tot=rows.reduce(function(a,r){return a+r.exp;},0),nz=rows.filter(function(r){return r.exp>0;}).length,av=nz?tot/nz:0;
  return '<div class="card"><h2 style="margin:0 0 8px">Son 6 dönem</h2><svg viewBox="0 0 '+W+' '+(H+20)+'" width="100%" role="img" aria-label="Son 6 dönem gelir ve gider grafiği">'+svg+'</svg><div class="small muted" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px"><span><b style="color:var(--inc)">■</b> Gelir</span><span><b style="color:var(--exp)">■</b> Gider</span><span>Ortalama gider '+TRY0.format(av)+'</span></div></div>';
}
function monthNav(){return '<div class="mnav"><button class="icon-btn" data-act="mprev" aria-label="Önceki dönem">'+ic('l')+'</button><span style="text-align:center">'+esc(plabel(ui.month))+(S.payday>1?'<div class="small muted" style="font-weight:500;text-transform:none">'+esc(prange(ui.month))+'</div>':'')+'</span><button class="icon-btn" data-act="mnext" aria-label="Sonraki dönem">'+ic('r')+'</button></div>';}
function txRow(t){
  if(t.type==='trf')return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--ink2)"></span><span class="mid"><div class="t">Transfer'+(t.note?' · '+esc(t.note):'')+'</div><div class="small muted">'+esc(t.acct)+' → '+esc(t.to)+'</div></span><span class="num">'+TRY2.format(t.amt)+'</span></button>';
  var inc=t.type==='inc';
  return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:'+color(t.cat)+'"></span><span class="mid"><div class="t">'+esc(t.cat)+(t.note?' · '+esc(t.note):'')+'</div><div class="small muted">'+esc(t.acct)+'</div></span><span class="num '+(inc?'inc':'exp')+'">'+(inc?'+':'−')+TRY2.format(t.amt)+'</span></button>';
}
function fireCard(){
  var m=fireModel();
  if(!m.ok)return '<button class="card firecard" data-act="open-fire"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">FIRE</div><div class="small muted">Finansal özgürlük hedefini hesapla. Aylık harcamanı girerek başla.</div></span>'+ic('r')+'</button>';
  return '<button class="card firecard stack" data-act="open-fire" style="gap:10px"><span style="display:flex;align-items:center;gap:12px"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">FIRE</div><div class="small muted">Finansal özgürlük ilerlemen</div></span>'+ic('r')+'</span>'
   +'<span style="display:flex;align-items:baseline;justify-content:space-between;gap:10px"><span class="num" style="font-size:1.75rem;font-weight:700">%'+NUM2.format(m.prog)+'</span><span class="small muted num">'+TRY0.format(Math.max(m.assets,0))+' / '+TRY0.format(m.target)+'</span></span>'
   +'<span class="bar"><i style="width:'+m.prog+'%"></i></span>'
   +'<span class="small muted">'+(m.n<=0?'Hedefe ulaştın':'Tahmini süre: <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</span></button>';
}
function dailyLine(rem){if(ui.month!==curP()||rem<=0)return '';var left=daysLeft(ui.month);return '<div class="small" style="margin-top:8px"><b>Günde ~'+TRY0.format(rem/left)+'</b> harcayabilirsin ('+left+' gün kaldı)</div>';}

/* ---------- Cüzdan ---------- */
function dcol(i){return 'hsl('+((i*67+155)%360)+' 52% 55%)';}
function donut(items,emptyMsg){
  var tot=items.reduce(function(a,x){return a+x[1];},0);
  if(!(tot>0))return '<div class="small muted" style="padding:10px 0">'+emptyMsg+'</div>';
  items=items.slice().sort(function(a,b){return b[1]-a[1];});
  if(items.length>5){var rest=items.slice(4).reduce(function(a,x){return a+x[1];},0);items=items.slice(0,4).concat([['Diğer',rest]]);}
  var off=25,c='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--soft)" stroke-width="6"></circle>';
  items.forEach(function(x,i){var p=x[1]/tot*100;c+='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="'+dcol(i)+'" stroke-width="6" stroke-dasharray="'+p.toFixed(3)+' '+(100-p).toFixed(3)+'" stroke-dashoffset="'+off.toFixed(3)+'"></circle>';off-=p;});
  return '<div class="dwrap"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Dağılım grafiği">'+c+'</svg><div class="lgs">'+items.map(function(x,i){return '<div class="lg"><span class="dot" style="background:'+dcol(i)+'"></span><span class="mid">'+esc(x[0])+'</span><span class="num">'+(x[1]/tot<0.01?'&lt;%1':'%'+Math.round(x[1]/tot*100))+'</span></div>';}).join('')+'</div></div>';
}
function heroSlides(W){
  var s1='<div class="slide"><div class="lbl">Toplam varlık</div><p class="big">'+TRY0.format(W.net)+'</p><div class="row3" style="grid-template-columns:1fr 1fr"><div><div class="lbl">Varlıklar</div><span class="num">'+TRY0.format(W.assets)+'</span></div><div><div class="lbl">Borçlar</div><span class="num '+(W.debt>0?'exp':'')+'">'+TRY0.format(W.debt)+'</span></div></div></div>';
  var s2='<div class="slide"><div class="lbl">Varlık dağılımı</div>'+donut(W.items,'Henüz varlık yok.')+'<div class="small num muted">Toplam '+TRY0.format(W.assets)+'</div><button class="btn small ghost" data-act="new-h">Varlık ekle</button></div>';
  var s3='<div class="slide"><div class="lbl">Borç dağılımı</div>'+donut(W.debts,'Borç kaydı yok.')+'<div class="small num muted">Toplam '+TRY0.format(W.debt)+'</div><button class="btn small ghost" data-act="new-d">Borç ekle</button></div>';
  return '<div class="card hero"><div class="slides" id="slides">'+s1+s2+s3+'</div><div class="sdots" aria-hidden="true">'+[0,1,2].map(function(i){return '<i class="'+(ui.slide===i?'on':'')+'"></i>';}).join('')+'</div></div>';
}
function vCuzdan(){
  var mt=monthTx(ui.month),inc=sum(mt,'inc'),exp=sum(mt,'exp'),net=inc-exp;
  var h=bannerHtml();
  if(S.name)h+='<p class="small muted" style="margin:0 2px">Merhaba, <b>'+esc(S.name)+'</b></p>';
  h+=heroSlides(wealth());
  h+=alertsHtml()+fireCard()+trendCard()+monthNav();
  h+='<div class="card"><div class="row3" style="margin-top:0"><div><div class="lbl">Gelir</div><span class="num inc">'+TRY0.format(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+TRY0.format(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+sgn(net)+'</span></div></div></div>';
  var isCur=ui.month===curP(),prev=addMonth(ui.month,-1),el=isCur?daysBetween(pStart(ui.month),isoDate(today0())):9999;
  var pe=monthTx(prev).filter(function(t){return t.type==='exp'&&daysBetween(pStart(prev),t.date)<=el;}).reduce(function(x,t){return x+t.amt;},0);
  if(pe>0&&exp>0){var df=(exp-pe)/pe*100;h+='<p class="small muted" style="margin:-4px 2px 0">'+(isCur?'Geçen dönemin aynı gününe göre':'Geçen döneme göre')+' giderlerin %'+Math.round(Math.abs(df))+(df>=0?' fazla.':' az.')+'</p>';}
  h+='<div class="seg" role="group" aria-label="Görünüm">'+[['islem','İşlemler'],['butce','Bütçe'],['hedef','Hedefler'],['duzenli','Düzenli']].map(function(x){return '<button data-act="sub" data-v="'+x[0]+'" aria-pressed="'+((ui.sub||'islem')===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>';
  var body={islem:txBody,butce:budgetBody,hedef:hedefBody,duzenli:duzenliBody}[ui.sub]||txBody;
  return h+body();
}
function txBody(){
  var mt=monthTx(ui.month).filter(function(t){return ui.filter==='all'||t.type===ui.filter;}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var h='<div class="chips">'+[['all','Tümü'],['inc','Gelir'],['exp','Gider'],['trf','Transfer']].map(function(f){return '<button class="chip" data-act="filter" data-v="'+f[0]+'" aria-pressed="'+(ui.filter===f[0])+'">'+f[1]+'</button>';}).join('')+'</div>';
  if(!mt.length)return h+'<div class="empty">Bu dönemde işlem yok. Sağ alttaki + ile ilk işlemini ekle.</div>';
  var cur='',out='<div class="card" style="padding-top:2px">';
  mt.forEach(function(t){if(t.date!==cur){cur=t.date;out+='<div class="day">'+esc(pdate(t.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}))+'</div>';}out+='<div class="list">'+txRow(t)+'</div>';});
  return h+out+'</div>';
}
function budgetBody(){
  var sp=spentByCat(ui.month),limSum=0,spSum=0;
  EXPC().forEach(function(c){if(S.budgets[c]){limSum+=S.budgets[c];spSum+=(sp[c]||0);}});
  var h='<div class="card"><div class="lbl">Toplam bütçe</div><p class="big">'+TRY0.format(limSum)+'</p><div class="small muted">Harcanan '+TRY0.format(spSum)+' · '+(limSum-spSum>=0?TRY0.format(limSum-spSum)+' kaldı':TRY0.format(spSum-limSum)+' aşıldı')+'</div>'+dailyLine(limSum-spSum)+'</div>';
  h+='<div class="card"><h2>Kategori limitleri</h2><p class="small muted" style="margin:-4px 0 6px">Aylık limit gir. Boş bıraktığın kategori takip edilmez.</p>';
  EXPC().forEach(function(c){
    var lim=S.budgets[c]||0,s=sp[c]||0,ratio=lim?s/lim:0,cls=ratio>1?'over':(ratio>.8?'warn':'');
    h+='<div class="catrow"><div class="top"><span><span class="dot" style="display:inline-block;margin-right:8px;background:'+color(c)+'"></span>'+esc(c)+'</span><span class="small muted num">'+TRY0.format(s)+(lim?' / '+TRY0.format(lim):'')+'</span></div>'+(lim?'<div class="bar '+cls+'"><i style="width:'+Math.min(ratio*100,100)+'%"></i></div>':'')+'<input inputmode="decimal" data-budget="'+esc(c)+'" placeholder="Limit (₺)" value="'+(lim||'')+'" aria-label="'+esc(c)+' aylık limit"></div>';
  });
  return h+'</div>';
}
function hedefBody(){
  var h='<button class="btn" data-act="new-g">Hedef ekle</button>';
  if(!S.goals.length)return h+'<div class="empty">Henüz hedef yok. Tatil, acil durum fonu ya da büyük bir alışveriş için hedef koy.</div>';
  var tot=0,sv=0;S.goals.forEach(function(g){tot+=g.target;sv+=g.saved;});
  h+='<div class="card"><div class="lbl">Toplam birikim</div><p class="big">'+TRY0.format(sv)+'</p><div class="small muted">Hedeflerin toplamı '+TRY0.format(tot)+'</div></div>';
  S.goals.forEach(function(g){
    var p=g.target>0?Math.min(g.saved/g.target*100,100):0,left=Math.max(g.target-g.saved,0),info='';
    if(g.saved>=g.target)info='Hedefe ulaştın';
    else if(g.date){var now=new Date(),d=pdate(g.date),m=(d.getFullYear()-now.getFullYear())*12+d.getMonth()-now.getMonth();info=m>0?m+' ay kaldı · ayda ~'+TRY0.format(left/m)+' ayır':'Tarih geçti, '+TRY0.format(left)+' eksik';}
    else info=TRY0.format(left)+' kaldı';
    h+='<div class="card stack" style="gap:10px"><button class="item" style="padding:0;border:0" data-act="edit-g" data-id="'+g.id+'"><span class="mid"><div class="t" style="font-weight:700">'+esc(g.name)+'</div><div class="small muted">'+esc(info)+'</div></span><span class="num">%'+Math.round(p)+'</span></button><div class="bar"><i style="width:'+p+'%"></i></div><div class="small num muted">'+TRY0.format(g.saved)+' / '+TRY0.format(g.target)+'</div><div class="two" style="grid-template-columns:1fr auto"><input inputmode="decimal" placeholder="Eklenecek tutar" data-gadd="'+g.id+'" aria-label="'+esc(g.name)+' için eklenecek tutar"><button class="btn small" data-act="gadd" data-id="'+g.id+'">Ekle</button></div></div>';
  });
  return h;
}
function duzenliBody(){
  var h='<button class="btn" data-act="new-r">Düzenli ödeme ekle</button>';
  if(!S.recurring.length)return h+'<div class="empty">Henüz düzenli ödeme yok. Kira, fatura ve abonelikleri ekle, ödeme gününü kaçırma.</div>';
  var tot=0,rem=0,cur=curP(),t0=isoDate(today0());
  S.recurring.forEach(function(r){tot+=r.amt;if(!recPaid(r,ui.month))rem+=r.amt;});
  h+='<div class="card"><div class="row3" style="margin-top:0;grid-template-columns:1fr 1fr"><div><div class="lbl">Aylık toplam</div><span class="num">'+TRY0.format(tot)+'</span></div><div><div class="lbl">Bu dönem ödenecek</div><span class="num">'+TRY0.format(rem)+'</span></div></div></div>';
  var list=S.recurring.slice().sort(function(a,b){return dueDate(a,ui.month).localeCompare(dueDate(b,ui.month));});
  h+='<div class="card" style="padding-top:4px"><div class="list">'+list.map(function(r){
    var paid=recPaid(r,ui.month),st;
    if(paid)st='<span class="pill ok">Ödendi</span>';
    else if(ui.month===cur){var diff=daysBetween(t0,dueDate(r,cur));st=diff<0?'<span class="pill late">'+(-diff)+' gün gecikti</span>':(diff===0?'<span class="pill late">Bugün</span>':'<span class="pill">'+diff+' gün sonra</span>');}
    else if(ui.month<cur)st='<span class="pill late">Ödenmedi</span>';
    else st='<span class="pill">Bekliyor</span>';
    return '<div class="item"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-r" data-id="'+r.id+'"><span class="dot" style="background:'+color(r.cat)+'"></span><span class="mid"><div class="t">'+esc(r.name)+'</div><div class="small muted">Her ayın '+r.day+'. günü · '+esc(r.cat)+'</div></span></button><div style="display:grid;gap:6px;justify-items:end"><span class="num">'+TRY0.format(r.amt)+'</span>'+st+'<button class="btn small ghost" data-act="'+(paid?'rundo':'rpay')+'" data-id="'+r.id+'">'+(paid?'Geri al':'Ödendi yaz')+'</button></div></div>';}).join('')+'</div></div>';
  return h+'<p class="small muted">"Ödendi yaz" dediğinde gösterdiğin dönemin işlemi otomatik eklenir.</p>';
}

/* ---------- Portföy ---------- */
function debtsCard(){
  var tot=debtManual();
  return '<div class="card stack" style="gap:10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="margin:0">Borçlar</h2><span class="num exp">'+TRY0.format(tot)+'</span></div>'
   +(S.debts.length?'<div class="list">'+S.debts.map(function(d){return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="small muted">'+esc(d.type)+'</div></span><span class="num exp">'+TRY0.format(d.amt)+'</span></button>';}).join('')+'</div>':'<div class="small muted">Kredi, taksit ya da kişisel borçlarını ekle.</div>')
   +'<button class="btn ghost" data-act="new-d">Borç ekle</button><p class="small muted" style="margin:0">Hesaplardaki eksi bakiyeler (kredi kartı gibi) de borç dağılımında görünür.</p></div>';
}
function vPortfoy(){
  var pf=pfTotals(),pl=pf.v-pf.c,plp=pf.c?pl/pf.c*100:0,h=bannerHtml();
  h+='<div class="card hero"><div class="lbl">Portföy değeri</div><p class="big">'+TRY0.format(pf.v)+'</p><div class="row3" style="grid-template-columns:1fr 1fr"><div><div class="lbl">Maliyet</div><span class="num">'+TRY0.format(pf.c)+'</span></div><div><div class="lbl">Kâr / zarar</div><span class="num">'+sgn(pl)+' ('+(plp>=0?'+':'−')+NUM2.format(Math.abs(plp))+'%)</span></div></div></div>';
  if(pf.v>0){var by={};S.holdings.forEach(function(x){by[x.type]=(by[x.type]||0)+hVal(x);});var ks=Object.keys(by).sort(function(a,b){return by[b]-by[a];});
    h+='<div class="card"><h2>Dağılım</h2><div class="stackbar">'+ks.map(function(k){return '<i style="width:'+(by[k]/pf.v*100)+'%;background:'+color(k)+'"></i>';}).join('')+'</div><div class="legend">'+ks.map(function(k){return '<span style="--c:'+color(k)+'">'+esc(k)+' %'+NUM2.format(by[k]/pf.v*100)+'</span>';}).join('')+'</div></div>';}
  h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div class="small muted" style="min-width:0">USD '+fx1(S.fx.USD)+' · EUR '+fx1(S.fx.EUR)+' · Gram altın '+fx1(S.fx.XAU)+(S.mkt&&S.mkt.BIST?' · BIST 100 '+fx1(S.mkt.BIST.price)+(S.mkt.BIST.chg!=null?' ('+(S.mkt.BIST.chg>=0?'+':'')+NUM2.format(S.mkt.BIST.chg)+'%)':''):'')+'</div><button class="btn small ghost" data-act="open-set" data-id="kurlar">Kurları düzenle</button></div>';
  h+='<button class="btn" data-act="new-h">Varlık ekle</button>';
  if(!S.holdings.length)return h+'<div class="empty">Henüz varlık yok. Hisse, altın, döviz, fon, kripto, gayrimenkul ya da araç ekleyebilirsin.</div>'+debtsCard();
  h+=S.holdings.map(function(x){var p=hVal(x)-hCost(x),pp=hCost(x)?p/hCost(x)*100:0,linked=x.ccy&&+S.fx[x.ccy]>0;
    return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-h" data-id="'+x.id+'"><span class="dot" style="background:'+color(x.type)+'"></span><span class="mid"><div class="t" style="font-weight:600">'+esc(x.name)+'</div><div class="small muted">'+esc(x.type)+' · '+NUM2.format(x.qty)+' adet · ort. '+TRY2.format(x.cost)+'</div></span></button><span class="num" style="font-size:1.0625rem">'+TRY0.format(hVal(x))+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:10px"><span class="num small '+(p>=0?'inc':'exp')+'">'+sgn(p)+' ('+(pp>=0?'+':'−')+NUM2.format(Math.abs(pp))+'%)</span>'+(linked?'<span class="small muted">'+FXL[x.ccy]+' kuru: '+TRY2.format(hPrice(x))+'</span>':'<div style="width:46%"><input inputmode="decimal" data-price="'+x.id+'" value="'+x.price+'" aria-label="'+esc(x.name)+' güncel fiyat"></div>')+'</div></div>';}).join('');
  return h+debtsCard()+'<p class="small muted">Fiyatlar elle girilir. Güncel fiyatı kutuya yazınca değer ve kâr/zarar yenilenir.</p>';
}

/* ---------- Notlar ---------- */
function noteSorted(){
  var q=ui.nq.toLocaleLowerCase('tr-TR'),N=S.nset;
  var l=S.notes.filter(function(n){return !q||((n.title||'')+' '+n.body).toLocaleLowerCase('tr-TR').indexOf(q)>-1;});
  l.sort(function(a,b){
    if(N.pinFirst&&!!a.pin!==!!b.pin)return a.pin?-1:1;
    if(N.sort==='title')return (a.title||'').localeCompare(b.title||'','tr');
    if(N.sort==='created')return (b.cts||b.ts)-(a.cts||a.ts);
    return b.ts-a.ts;});
  return l;
}
function notesList(){
  var l=noteSorted(),N=S.nset;
  if(!l.length)return '<div class="empty">'+(S.notes.length?'Eşleşen not yok.':'Henüz not yok. Harcama fikirleri, hedefler, hatırlatmalar yazabilirsin.')+'</div>';
  return l.map(function(n){
    var dt=N.date?'<span class="small muted">'+esc(new Date(n.ts).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+'</span>':'';
    var pn=n.pin?'<span class="pinmark" aria-label="Sabit">'+ic('pin')+'</span>':'';
    if(N.view==='list')return '<button class="item note-row" data-act="edit-n" data-id="'+n.id+'"><span class="mid"><div class="t">'+esc(n.title||'Başlıksız')+'</div></span>'+pn+dt+'</button>';
    return '<button class="note-card" data-act="edit-n" data-id="'+n.id+'"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div class="t">'+esc(n.title||'Başlıksız')+'</div>'+pn+'</div>'+(N.lines>0?'<p style="-webkit-line-clamp:'+N.lines+'">'+esc(n.body)+'</p>':'')+(dt?'<div style="margin-top:6px">'+dt+'</div>':'')+'</button>';
  }).join('');
}
function vNotlar(){return bannerHtml()+'<div style="display:flex;gap:8px"><button class="btn" data-act="new-n">Not ekle</button><button class="btn ghost" style="width:auto;display:grid;place-items:center;padding:12px" data-act="open-set" data-id="notlar" aria-label="Not ayarları">'+ic('gear')+'</button></div><input id="nsearch" type="search" placeholder="Notlarda ara" value="'+esc(ui.nq)+'" aria-label="Notlarda ara"><div id="nlist" class="stack" style="gap:10px">'+notesList()+'</div>';}
function vNote(){
  var p=ui.page,d=p.draft,n=p.id?byId(S.notes,p.id):null;
  return '<div class="field"><label for="n-title">Başlık</label><input id="n-title" data-nf="title" value="'+esc(d.title)+'" placeholder="Başlık"></div>'
   +'<div class="field"><label for="n-body">Not</label><textarea id="n-body" data-nf="body" style="min-height:46vh" placeholder="Notunu yaz">'+esc(d.body)+'</textarea></div>'
   +'<button class="row-tgl" data-act="note-pin" role="switch" aria-checked="'+!!d.pin+'"><span class="mid"><div class="t">Üste sabitle</div><div class="small muted">Sabit notlar listede en üstte durur</div></span><span class="sw"></span></button>'
   +(n?'<div class="small muted">Son düzenleme: '+esc(new Date(n.ts).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))+'</div>':'')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="note-save">Kaydet</button>'+(n?'<button class="btn danger" data-act="note-del">Sil</button>':'');
}
function saveNote(){
  var p=ui.page;if(!p||p.k!=='note'||!p.dirty)return;
  var d=p.draft,ti=d.title.trim(),bo=d.body;
  if(!ti&&!bo.trim())return;
  if(p.id){var n=byId(S.notes,p.id);if(n){n.title=ti;n.body=bo;n.pin=!!d.pin;n.ts=Date.now();delete n.sample;}}
  else{var n2={id:uid(),title:ti,body:bo,pin:!!d.pin,ts:Date.now(),cts:Date.now()};S.notes.push(n2);p.id=n2.id;}
  p.dirty=false;save();
}

/* ---------- form parçaları ---------- */
function fld(label,id,path,kind,ph){var v=getP(path),s=(v===''||v==null)?'':String(v).replace('.',',');return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" inputmode="decimal" data-bind="'+path+'" data-kind="'+kind+'" placeholder="'+esc(ph||'')+'" value="'+esc(s)+'"></div>';}
function tgl(path,label,desc){var on=!!getP(path);return '<button class="row-tgl" data-act="tgl" data-v="'+path+'" role="switch" aria-checked="'+on+'"><span class="mid"><div class="t">'+label+'</div>'+(desc?'<div class="small muted">'+desc+'</div>':'')+'</span><span class="sw"></span></button>';}
function segv(path,opts,aria){var cur=getP(path);if(cur==null||cur==='')cur=opts[0][0];return '<div class="seg" role="group" aria-label="'+aria+'">'+opts.map(function(o){return '<button data-act="setv" data-v="'+path+'" data-x="'+o[0]+'" aria-pressed="'+(String(cur)===String(o[0]))+'">'+o[1]+'</button>';}).join('')+'</div>';}
function sec(t,inner,note){return '<div class="card stack" style="gap:12px">'+(t?'<h2 style="margin:0">'+t+'</h2>':'')+inner+(note?'<p class="small muted" style="margin:0">'+note+'</p>':'')+'</div>';}
function msg(text,ok,id){var e=document.getElementById(id||'f-err');if(e){e.textContent=text;e.style.color=ok?'var(--inc)':'var(--exp)';}}

/* ---------- FIRE sayfası ---------- */
function vFire(){
  var m=fireModel(),h='',P=Math.max(m.assets,0);
  var assume=sec('Varsayımlar',
    fld('Aylık harcama (₺)','fi-exp','fire.exp','auto','Otomatik: '+(m.autoE>0?TRY0.format(m.autoE):'veri yok'))
   +fld('Aylık birikim (₺)','fi-save','fire.save','auto','Otomatik: '+TRY0.format(Math.max(m.autoS,0)))
   +'<div class="two">'+fld('Yıllık reel getiri (%)','fi-ret','fire.ret','num','4')+fld('Çekim oranı (%)','fi-wr','fire.wr','num','4')+'</div>'
   +tgl('fire.acc','Hesapları ve borçları say','Nakit, banka ve kart bakiyelerin, kayıtlı borçların düşülür')+tgl('fire.pf','Portföyü say','Hisse, fon, altın, döviz ve kripto değerin')
   +fld('Ek yatırım varlığı (₺)','fi-extra','fire.extra','num','0'),
   'Boş bıraktığın alanlar geçmiş dönemlerdeki işlemlerinden otomatik hesaplanır. Reel getiri, enflasyondan arındırılmış yıllık getiridir.');
  if(!m.ok)return sec('','<div class="empty" style="padding:8px">Aylık harcamanı gir ya da birkaç dönemlik gider kaydı ekle. Sonuçlar burada görünür.</div>')+assume;
  h+='<div class="card hero"><div class="lbl">FIRE ilerlemesi</div><p class="big">%'+NUM2.format(m.prog)+'</p><div class="bar"><i style="width:'+m.prog+'%"></i></div><div class="small muted" style="margin-top:8px">'+(m.n<=0?'Hedefe ulaştın.':'Tahmini süre <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</div></div>';
  h+=sec('Özet',res([['FIRE hedefi',TRY0.format(m.target),1],['Mevcut varlık',TRY0.format(P)],['Kalan',TRY0.format(Math.max(m.target-P,0))],['Aylık birikim',TRY0.format(m.sv)],['Şu anki pasif gelir (aylık)',TRY0.format(m.passive)],['Aylık harcamanın karşılanan kısmı','%'+NUM2.format(m.passive/m.exp*100)]]),'Hedef = yıllık harcama ÷ çekim oranı.');
  var sc=[['Sade yaşam (harcamanın %70’i)',.7],['Mevcut harcama',1],['Rahat yaşam (%130)',1.3]];
  h+=sec('Senaryolar','<div class="res">'+sc.map(function(s){var T=m.target*s[1];return '<div class="r"><span>'+s[0]+'<div class="small muted">Hedef '+TRY0.format(T)+'</div></span><span class="num" style="text-align:right">'+esc(fmtYears(monthsToFI(P,m.sv,m.rm,T)))+'</span></div>';}).join('')+'</div>');
  if(m.n>0){
    var n1=monthsToFI(P,m.sv*1.1,m.rm,m.target),n2=monthsToFI(P,m.sv,m.rm,m.target*.9);
    var dif=function(n){if(!isFinite(n))return 'değişmez';if(!isFinite(m.n))return 'ulaşılır: '+fmtYears(n);var d=Math.round(m.n-n);return d>0?(d>=12?(Math.floor(d/12)+' yıl '+(d%12?d%12+' ay ':'')):d+' ay ')+'erken':'değişmez';};
    h+=sec('Ne işe yarar?',res([['Aylık birikim %10 artarsa',dif(n1)],['Aylık harcama %10 azalırsa',dif(n2)]]));
  }
  h+=assume;
  h+='<p class="small muted">Bu bir tahmindir, yatırım tavsiyesi değildir. Getiri ve çekim oranı varsayımdır. %4 çekim oranı ABD tarihsel verilerine dayanan genel bir kuraldır; Türkiye’de enflasyon ve getiriler farklı seyredebilir.</p>';
  return h;
}

/* ---------- ayar sayfaları ---------- */
function setList(){var q=ui.sq.toLocaleLowerCase('tr-TR');var l=SETS.filter(function(s){return !q||(s.t+' '+s.d).toLocaleLowerCase('tr-TR').indexOf(q)>-1;});
  if(!l.length)return '<div class="empty">Eşleşen ayar yok.</div>';
  return l.map(function(s){return '<button class="setcard" data-act="open-set" data-id="'+s.id+'"><span class="sic" style="--c:'+s.c+'">'+ic(s.i)+'</span><span class="mid"><div class="t">'+esc(s.t)+'</div><div class="small muted">'+esc(s.d)+'</div></span>'+ic('r')+'</button>';}).join('');}
function vAyarlar(){return '<div class="search">'+ic('search')+'<input id="sset" type="search" placeholder="Ayarlarda ara..." value="'+esc(ui.sq)+'" aria-label="Ayarlarda ara"></div><div id="setlist" class="stack" style="gap:10px">'+setList()+'</div><p class="small muted" style="text-align:center">Wallet 2.0 · Veriler bu cihazda saklanır</p>';}
function setBody(s){return ({profil:setProfil,hesap:setHesap,kat:setKat,kurlar:setKur,bild:setBild,gor:setGor,notlar:setNotlar,guv:setGuv,veri:setVeri,hak:setHak,demo:setDemo}[s]||setHak)();}
function setProfil(){
  var pd=S.payday||1,o='';for(var i=1;i<=31;i++)o+='<option value="'+i+'"'+(i===pd?' selected':'')+'>'+i+'. gün</option>';
  return sec('Profil','<div class="field"><label for="pf-name">Ad</label><input id="pf-name" data-bind="name" data-kind="text" placeholder="Adın" value="'+esc(S.name)+'"></div><div class="field"><label>Ana para birimi</label><div class="static">Türk Lirası (₺)</div></div>','Başka para birimi şimdilik desteklenmez. Döviz varlıkları portföyde kurla liraya çevrilir.')
   +sec('Dönem','<div class="field"><label for="pf-pd">Maaş günü (dönem başlangıcı)</label><select id="pf-pd" data-bind="payday" data-kind="int">'+o+'</select></div><div class="small">Şu anki dönem: <b>'+esc(plabel(curP()))+'</b> ('+esc(prange(curP()))+')</div>','Özetler, bütçe ve düzenli ödemeler bu günden başlayan döneme göre hesaplanır. Ayın 1’i için 1. günü seç.');
}
function setHesap(){
  var rows=ACCS().map(function(a,i){var used=acctUsed(a);
    return '<div class="stack" style="gap:8px;padding:8px 0;border-bottom:1px solid var(--line)"><div class="two"><div class="field"><label for="an'+i+'">Ad</label><input id="an'+i+'" data-acc-name="'+esc(a)+'" value="'+esc(a)+'"></div><div class="field"><label for="ao'+i+'">Başlangıç bakiyesi (₺)</label><input id="ao'+i+'" inputmode="decimal" data-acc-open="'+esc(a)+'" value="'+(S.opening[a]||0)+'"></div></div><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="small muted">Güncel bakiye: <b class="num">'+TRY0.format(acctBal(a))+'</b></span>'+((used||ACCS().length<2)?'<span class="small muted">Silinemez</span>':'<button class="btn small danger" data-act="acc-del" data-id="'+esc(a)+'">Sil</button>')+'</div></div>';}).join('');
  return sec('Hesaplar',rows,'Kredi kartı borcu için başlangıç bakiyesine eksi değer yaz. İşlemi olan hesap silinemez.')
   +sec('Yeni hesap','<div class="two"><div class="field"><label for="na-name">Ad</label><input id="na-name" placeholder="Örn. Birikim"></div><div class="field"><label for="na-open">Başlangıç bakiyesi (₺)</label><input id="na-open" inputmode="decimal" placeholder="0"></div></div><div class="err" id="f-err"></div><button class="btn" data-act="acc-add">Hesap ekle</button>')
   +sec('Transfer','<button class="btn ghost" data-act="new-trf">Hesaplar arası transfer yap</button>','Transfer gelir ya da gider sayılmaz, yalnızca hesap bakiyelerini değiştirir.');
}
function chipRow(type){return '<div class="chips">'+S.cats[type].map(function(c){return '<button class="chip rm" data-act="cat-del" data-v="'+type+'" data-id="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div>';}
function catAdd(type,label){return '<div class="two" style="grid-template-columns:1fr auto"><input id="nc-'+type+'" placeholder="'+label+'" aria-label="'+label+'"><button class="btn small" data-act="cat-add" data-v="'+type+'">Ekle</button></div>';}
function setKat(){
  var all=EXPC().concat(INCC()),rl=S.rules.length?'<div class="list">'+S.rules.map(function(r,i){return '<div class="item"><span class="mid"><div class="t">“'+esc(r.kw)+'” → '+esc(r.cat)+'</div></span><button class="btn small ghost" data-act="rule-del" data-id="'+i+'">Sil</button></div>';}).join('')+'</div>':'<div class="small muted">Henüz kural yok.</div>';
  return sec('Gider kategorileri',chipRow('exp')+catAdd('exp','Yeni gider kategorisi'),'Silmek için bir kategoriye iki kez dokun. Geçmiş işlemler silinmez.')
   +sec('Gelir kategorileri',chipRow('inc')+catAdd('inc','Yeni gelir kategorisi'))
   +sec('Otomatik kurallar',rl+'<div class="two" style="grid-template-columns:1fr 1fr"><div class="field"><label for="rl-kw">İşlem notunda geçen kelime</label><input id="rl-kw" placeholder="Örn. migros"></div><div class="field"><label for="rl-cat">Kategori</label><select id="rl-cat">'+opts(all)+'</select></div></div><div class="err" id="f-err"></div><button class="btn" data-act="rule-add">Kural ekle</button>','İşlem eklerken nota bu kelimeyi yazarsan kategori kendiliğinden seçilir.');
}
function setKur(){
  var when=S.fxTs?'<div class="small muted">Son güncelleme: '+esc(new Date(S.fxTs).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))+(S.fxProv?' · kaynak saati '+esc(S.fxProv):'')+'</div>':'';
  return sec('Canlı kurlar',tgl('fxAuto','Kurları otomatik güncelle','Uygulama açılınca USD, EUR ve gram altın kuru kendiliğinden gelir')+'<button class="btn ghost" data-act="rates-now">Şimdi güncelle</button><div class="err" id="f-rates"></div>','Veri, yayın sunucusunda yaklaşık 15 dakikada bir yenilenir; anlık borsa verisi değildir ve gecikmeli olabilir. Kaynak: Truncgil Finans.')
   +sec('Kurlar (₺)','<div class="two">'+fld('USD/TL','fx-USD','fx.USD','num','0')+fld('EUR/TL','fx-EUR','fx.EUR','num','0')+'</div>'+fld('Gram altın (₺)','fx-XAU','fx.XAU','num','0')+when,'Otomatik güncelleme açıkken elle girdiğin değerler bir sonraki yenilemede değişir. Portföyde “Fiyat kaynağı” olarak bir kur seçtiğin varlıklar kur değişince otomatik güncellenir.');
}
function setBild(){
  var perm=('Notification' in window)?Notification.permission:'yok';
  return sec('Uygulama içi uyarılar',tgl('alerts.budget','Bütçe aşımı uyarıları','Limite yaklaşınca ya da aşınca Cüzdan sayfasında gösterilir')+'<div class="lbl">Uyarı eşiği</div>'+segv('alerts.thr',[[70,'%70'],[80,'%80'],[90,'%90']],'Uyarı eşiği')
    +tgl('alerts.rec','Ödeme hatırlatmaları','Yaklaşan ve geciken düzenli ödemeler')+'<div class="lbl">Kaç gün önceden</div>'+segv('alerts.days',[[1,'1 gün'],[3,'3 gün'],[7,'7 gün']],'Gün'),
    'Uyarılar Cüzdan sayfasında görünür.')
   +sec('Telefon bildirimi',tgl('notif','Bildirim gönder','Uygulamayı açtığında, günde bir kez özet bildirim')+(perm==='granted'?'<div class="small muted">Bildirim izni verildi.</div>':perm==='denied'?'<div class="small muted">İzin reddedilmiş. Tarayıcı site ayarlarından açabilirsin.</div>':perm==='yok'?'<div class="small muted">Bu tarayıcı bildirimi desteklemiyor.</div>':'<button class="btn ghost" data-act="notif-ask">Bildirim izni ver</button>'),
    'Bildirimler uygulama açıkken veya açıldığında gelir. Kapalıyken arka planda bildirim göndermek için bir sunucu gerekir; bu sürümde yok.');
}
function setGor(){
  return sec('Tema',segv('theme',[['auto','Sistem'],['light','Açık'],['dark','Koyu']],'Tema'))
   +sec('Yazı boyutu',segv('fs',[[0.9,'Küçük'],[1,'Normal'],[1.15,'Büyük'],[1.3,'Çok büyük']],'Yazı boyutu'))
   +sec('Gizlilik',tgl('hide','Bakiyeleri gizle','Cüzdan ve Portföy’de tutarlar ••••, üst köşedeki göz düğmesiyle geçici gösterilir'));
}
function setNotlar(){
  return sec('Liste','<div class="lbl">Sıralama</div>'+segv('nset.sort',[['edited','Son düzenlenen'],['created','Oluşturulma'],['title','Başlık A–Z']],'Sıralama')
    +'<div class="lbl">Görünüm</div>'+segv('nset.view',[['card','Kart'],['list','Liste']],'Görünüm')
    +'<div class="lbl">Önizleme satırı</div>'+segv('nset.lines',[[0,'Yok'],[1,'1'],[3,'3'],[5,'5']],'Önizleme satırı')
    +tgl('nset.date','Tarihi göster')+tgl('nset.pinFirst','Sabit notlar üstte'))
   +sec('Silme',tgl('nset.confirmDel','Silmeden önce onay iste','Sil düğmesine iki kez dokunman gerekir'))
   +sec('Dışa aktar','<div class="small muted">'+S.notes.length+' not</div><button class="btn ghost" data-act="notes-copy">Tüm notları kopyala</button><button class="btn ghost" data-act="notes-save">Metin dosyası olarak kaydet</button><div class="err" id="f-err"></div>');
}
function setGuv(){
  var h='';
  if(!S.pin){
    h+=sec('PIN kilidi','<div class="field"><label for="pin1">Yeni PIN (4 rakam)</label><input id="pin1" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="field"><label for="pin2">PIN tekrar</label><input id="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="err" id="f-err"></div><button class="btn" data-act="pin-set">PIN kilidini aç</button>','PIN, uygulamayı açarken sorulur.');
  }else{
    h+=sec('PIN kilidi','<span class="pill ok" style="align-self:flex-start">Açık</span><div class="lbl">Otomatik kilit</div>'+segv('pin.auto',[[0,'Hemen'],[1,'1 dk'],[5,'5 dk'],[15,'15 dk']],'Otomatik kilit')+'<button class="btn ghost" data-act="lock-now">Şimdi kilitle</button>','Otomatik kilit, uygulamadan çıkıp geri döndüğünde çalışır.')
     +sec('PIN’i değiştir','<div class="field"><label for="pold">Mevcut PIN</label><input id="pold" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="two"><div class="field"><label for="pnew1">Yeni PIN</label><input id="pnew1" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="field"><label for="pnew2">Tekrar</label><input id="pnew2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div></div><div class="err" id="f-err"></div><button class="btn ghost" data-act="pin-change">PIN’i değiştir</button>')
     +sec('PIN’i kaldır','<div class="field"><label for="prem">Mevcut PIN</label><input id="prem" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn danger" data-act="pin-remove">Kilidi kaldır</button>');
  }
  h+=sec('Parmak izi / yüz tanıma','<div class="small">Bu sürümde kullanılamıyor.</div>','Web sayfaları bu görünümde cihazın biyometrik kilidine erişemez.');
  h+='<p class="small muted">PIN yalnızca ekranı kilitler. Veriler tarayıcıda şifresiz saklanır. PIN unutulursa kilit ancak tüm veriler silinerek kaldırılır, bu yüzden düzenli yedek al.</p>';
  return h;
}
function setVeri(){
  return sec('Dışa aktar','<button class="btn ghost" data-act="csv">İşlemleri CSV olarak kaydet</button><button class="btn ghost" data-act="csv-copy">CSV metnini kopyala</button><div class="err" id="f-err"></div>','CSV; Excel ve tablo uygulamalarında açılır. '+S.tx.length+' işlem.')
   +sec('Yedek','<div class="field"><label for="bk-pw">Yedek şifresi</label><input id="bk-pw" type="password" autocomplete="new-password" placeholder="Boş bırakırsan şifresiz yedek"></div><button class="btn" data-act="bk-make">Yedek hazırla</button><div id="bk-box" class="stack" style="gap:10px" hidden><textarea id="bk-out" readonly aria-label="Yedek metni"></textarea><button class="btn ghost" data-act="bk-copy">Yedeği kopyala</button><button class="btn ghost" data-act="bk-save">Dosya olarak kaydet</button></div><div class="err" id="f-err3"></div>','Şifreli yedek AES-256 ile korunur. Şifreyi unutursan yedek açılmaz, şifre hiçbir yerde saklanmaz.')
   +sec('Yedekten yükle','<div class="field"><label for="rs-file">Yedek dosyası</label><input id="rs-file" type="file" accept=".json,.txt,application/json,text/plain"></div><div class="field"><label for="rs-txt">Ya da yedek metni</label><textarea id="rs-txt" placeholder="Kopyaladığın yedeği buraya yapıştır"></textarea></div><div class="field"><label for="rs-pw">Şifre (yedek şifreliyse)</label><input id="rs-pw" type="password" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn ghost" data-act="rs-go">Yedeği yükle</button>','Yükleme mevcut verilerin yerine geçer. PIN ayarın korunur.');
}
function setHak(){
  return sec('Wallet','<div class="res"><div class="r"><span>Sürüm</span><span class="num">2.0</span></div><div class="r"><span>Veri konumu</span><span>Bu cihaz, tarayıcı</span></div></div>')
   +sec('Gizlilik özeti','<div class="small">Verilerin yalnızca bu tarayıcıda saklanır. Wallet bir sunucuya veri göndermez, hesap açmaz.</div>','Tarayıcı verilerini silersen ya da farklı bir cihaz kullanırsan veriler görünmez. Yedek al.')
   +sec('Sınırlar','<ul class="plain"><li>Canlı kur ve borsa verisi yok, fiyatlar elle girilir.</li><li>Telefon bildirimi gönderemez.</li><li>Banka bağlantısı yok, işlemler elle girilir.</li><li>Parmak izi kilidi yok, PIN vardır.</li></ul>');
}
function setDemo(){
  return sec('Örnek veriler','<button class="btn ghost" data-act="sample-load">Örnek verileri yükle</button>'+(hasSample()?'<button class="btn ghost" data-act="sample-clear">Örnek verileri sil</button>':''),'Örnek veriler kendi kayıtlarının yanına eklenir ve işaretlidir, istediğinde silebilirsin.')
   +sec('Sıfırla','<button class="btn danger" data-act="reset-all">Tüm verileri sil</button>','Bu cihazdaki tüm işlemler, hesaplar, notlar ve ayarlar silinir. Geri alınamaz.');
}

/* ---------- PIN ve kilit ---------- */
function cyrb(str){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(16);}
function pinHash(pin,salt){var str=salt+':'+pin;
  if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return pad(x.toString(16)).slice(-2);}).join('');});
  return Promise.resolve('x'+cyrb(str));}
function lockHtml(){
  var logo='<span class="logo biglogo" role="img" aria-label="Wallet"></span>';
  if(ui.forgot)return logo+'<h2 style="margin:0">PIN’ini mi unuttun?</h2><p class="small muted" style="max-width:320px;text-align:center;margin:0">PIN kurtarılamaz. Devam edersen bu cihazdaki tüm Wallet verileri silinir ve kilit kalkar. Yedeğin varsa sonra geri yükleyebilirsin.</p><button class="btn danger" style="max-width:320px" data-act="lk-reset">Tüm verileri sil ve kilidi kaldır</button><button class="btn ghost" style="max-width:320px" data-act="lk-back">Vazgeç</button>';
  var dots='';for(var i=0;i<4;i++)dots+='<i class="'+(i<ui.pinBuf.length?'on':'')+'"></i>';
  var wait=Date.now()<ui.lockUntil,keys=['1','2','3','4','5','6','7','8','9','','0','<'];
  return logo+'<h2 style="margin:0">PIN gir</h2><div class="dots">'+dots+'</div><div class="err" style="min-height:1.3em">'+esc(ui.lkMsg||'')+'</div><div class="keypad">'+keys.map(function(k){if(k==='')return '<span></span>';return '<button class="key" data-act="lk" data-v="'+k+'"'+(wait?' disabled':'')+' aria-label="'+(k==='<'?'Sil':k)+'">'+(k==='<'?'←':k)+'</button>';}).join('')+'</div><button class="linkbtn" data-act="lk-forgot">PIN’imi unuttum</button>';
}

/* ---------- yedek ---------- */
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s);}
function unb64(s){var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
function deriveKey(pw,salt){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']).then(function(k){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);});}
function encText(text,pw){var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  return deriveKey(pw,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(text));}).then(function(ct){return JSON.stringify({wallet:1,s:b64(salt),i:b64(iv),d:b64(ct)});});}
function decText(o,pw){var salt=unb64(o.s),iv=unb64(o.i);return deriveKey(pw,salt).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:iv},k,unb64(o.d));}).then(function(b){return new TextDecoder().decode(b);});}
function exportJson(){var c=JSON.parse(JSON.stringify(S));delete c.pin;return JSON.stringify(c);}
function csvCell(x){x=String(x==null?'':x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}
function csvAll(){var rows=[['Tarih','Tür','Kategori','Tutar','Hesap','Karşı hesap','Not']],tn={inc:'Gelir',exp:'Gider',trf:'Transfer'};
  S.tx.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).forEach(function(t){rows.push([t.date,tn[t.type]||t.type,t.cat||'',String(t.amt).replace('.',','),t.acct,t.to||'',t.note||'']);});
  return '﻿'+rows.map(function(r){return r.map(csvCell).join(';');}).join('\r\n');}
function saveFile(name,data,okText,id){
  if(!dl){try{var bl=new Blob([data],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u);},1000);msg(okText||'Kaydedildi.',true,id);}catch(e){msg('Dosya kaydedilemedi. Kopyala düğmesini dene.',false,id);}return;}
  dl.save({filename:name,data:data}).then(function(){msg(okText||'Kaydedildi.',true,id);},function(err){msg(err&&err.code==='declined'?'Kaydetme iptal edildi.':'Dosya kaydedilemedi. Kopyala düğmesini dene.',false,id);});
}
function copyText(text,id,okText){
  try{navigator.clipboard.writeText(text).then(function(){msg(okText||'Kopyalandı.',true,id);},function(){msg('Kopyalanamadı. Dosya olarak kaydetmeyi dene.',false,id);});}
  catch(e){msg('Kopyalanamadı. Dosya olarak kaydetmeyi dene.',false,id);}
}
function allNotesText(){return S.notes.map(function(n){return (n.title||'Başlıksız')+'\n\n'+n.body;}).join('\n\n----------\n\n');}

/* ---------- hesaplayıcılar ---------- */
function res(rows){return '<div class="res">'+rows.map(function(r){return '<div class="r'+(r[2]?' strong':'')+'"><span>'+esc(r[0])+'</span><span class="num">'+r[1]+'</span></div>';}).join('')+'</div>';}
var CALCS={
  kredi:{name:'Kredi',fields:[['amt','Kredi tutarı (₺)',100000],['rate','Aylık faiz (%)',3.5],['n','Vade (ay)',24],['tax','Faize eklenen vergi (%)',0]],
    run:function(v){var P=v.amt,n=Math.round(v.n),r=v.rate/100*(1+v.tax/100);if(P<=0||n<=0)return '<div class="empty">Tutar ve vadeyi gir.</div>';
      var pay=r===0?P/n:P*r/(1-Math.pow(1+r,-n)),bal=P,tot=0,rows='';
      for(var i=1;i<=n;i++){var it=bal*r,pr=pay-it;bal-=pr;tot+=it;rows+='<tr><td>'+i+'</td><td>'+TRY2.format(pay)+'</td><td>'+TRY2.format(pr)+'</td><td>'+TRY2.format(it)+'</td><td>'+TRY2.format(Math.max(bal,0))+'</td></tr>';}
      return res([['Aylık taksit',TRY2.format(pay),1],['Toplam geri ödeme',TRY2.format(pay*n)],['Toplam faiz',TRY2.format(tot)],['Yıllık bileşik maliyet','%'+NUM2.format((Math.pow(1+r,12)-1)*100)]])
       +'<details><summary>Ödeme planı</summary><div class="scroll-x"><table><thead><tr><th>Ay</th><th>Taksit</th><th>Anapara</th><th>Faiz</th><th>Kalan</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';}},
  birikim:{name:'Birikim',fields:[['p','Başlangıç tutarı (₺)',50000],['c','Aylık katkı (₺)',5000],['rate','Yıllık getiri (%)',40],['y','Süre (yıl)',5]],
    run:function(v){var n=Math.round(v.y*12);if(n<=0)return '<div class="empty">Süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var fv=r===0?v.p+v.c*n:v.p*g+v.c*(g-1)/r,put=v.p+v.c*n;
      return res([['Dönem sonu tutar',TRY0.format(fv),1],['Toplam yatırılan',TRY0.format(put)],['Kazanılan getiri',TRY0.format(fv-put)]])+'<p class="small muted">Aylık bileşik getiri varsayılır. Vergi ve enflasyon dahil değildir.</p>';}},
  mevduat:{name:'Mevduat',fields:[['p','Anapara (₺)',100000],['rate','Yıllık brüt faiz (%)',45],['d','Vade (gün)',32],['tax','Stopaj (%)',15]],
    run:function(v){if(v.p<=0||v.d<=0)return '<div class="empty">Anapara ve vadeyi gir.</div>';var g=v.p*v.rate/100*v.d/365,tx=g*v.tax/100,net=g-tx;
      return res([['Net getiri',TRY2.format(net),1],['Brüt faiz',TRY2.format(g)],['Stopaj',TRY2.format(tx)],['Vade sonu toplam',TRY2.format(v.p+net)],['Net yıllık oran','%'+NUM2.format(net/v.p*365/v.d*100)]])+'<p class="small muted">Stopaj oranını bankanın verdiği vadeye göre kontrol et.</p>';}},
  hedef:{name:'Hedef',fields:[['t','Hedef tutar (₺)',500000],['p','Mevcut birikim (₺)',50000],['m','Süre (ay)',36],['rate','Yıllık getiri (%)',30]],
    run:function(v){var n=Math.round(v.m);if(n<=0||v.t<=0)return '<div class="empty">Hedef tutar ve süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var need=r===0?(v.t-v.p)/n:(v.t-v.p*g)*r/(g-1);if(need<0)need=0;
      return res([['Aylık ayırman gereken',TRY2.format(need),1],['Toplam yatıracağın',TRY0.format(need*n+v.p)],['Getiriden gelen',TRY0.format(v.t-need*n-v.p)]])+(need===0?'<p class="small muted">Mevcut birikimin getiriyle hedefe ulaşır.</p>':'');}},
  enflasyon:{name:'Enflasyon',fields:[['a','Tutar (₺)',100000],['inf','Yıllık enflasyon (%)',35],['y','Süre (yıl)',3],['nom','Yıllık nominal getiri (%)',40]],
    run:function(v){if(v.y<0)return '<div class="empty">Süreyi gir.</div>';var f=Math.pow(1+v.inf/100,v.y),realRate=((1+v.nom/100)/(1+v.inf/100)-1)*100;
      return res([['Bugünkü alım gücünü korumak için',TRY0.format(v.a*f),1],['Bugünkü tutarın o günkü değeri',TRY0.format(v.a/f)],['Reel getiri (yıllık)',(realRate>=0?'+%':'−%')+NUM2.format(Math.abs(realRate))],['Getiri sonrası reel değer',TRY0.format(v.a*Math.pow(1+v.nom/100,v.y)/f)]]);}}
};
function vArac(){
  var key=ui.calc,c=CALCS[key];if(!ui.cv[key]){ui.cv[key]={};c.fields.forEach(function(f){ui.cv[key][f[0]]=String(f[2]);});}
  var h='<div class="calcseg">'+Object.keys(CALCS).map(function(k){return '<button class="chip" data-act="calc" data-v="'+k+'" aria-pressed="'+(k===key)+'">'+CALCS[k].name+'</button>';}).join('')+'</div>';
  h+='<div class="card"><div class="two" style="gap:12px">'+c.fields.map(function(f){return '<div class="field"><label for="c-'+f[0]+'">'+esc(f[1])+'</label><input id="c-'+f[0]+'" class="calc-in" data-k="'+f[0]+'" inputmode="decimal" value="'+esc(ui.cv[key][f[0]])+'"></div>';}).join('')+'</div></div>';
  h+='<div class="card" id="calc-out">'+calcOut()+'</div>';return h;
}
function calcOut(){var key=ui.calc,c=CALCS[key],v={};c.fields.forEach(function(f){v[f[0]]=num(ui.cv[key][f[0]]);});return c.run(v);}


/* ---------- render ---------- */
function pageInfo(){
  var p=ui.page;
  if(p.k==='fire')return {title:'FIRE',body:vFire};
  if(p.k==='set'){var s=SETS.filter(function(x){return x.id===p.s;})[0]||SETS[0];return {title:s.t,body:function(){return setBody(s.id);}};}
  return {title:p.id?'Not':'Yeni not',body:vNote};
}
function render(){
  var L=document.getElementById('lock');
  document.body.classList.toggle('locked',!!ui.locked);
  if(ui.locked){L.hidden=false;L.innerHTML=lockHtml();return;}
  L.hidden=true;L.innerHTML='';
  applyTheme();
  document.documentElement.style.fontSize=(16*(+S.fs||1))+'px';
  maskOn=!!S.hide&&!ui.reveal&&ui.tab!=='arac'&&!ui.page;
  var hd=document.getElementById('hdr'),vw=document.getElementById('view');
  if(ui.page){
    var P=pageInfo();
    hd.innerHTML='<button class="icon-btn" data-act="back" aria-label="Geri">'+ic('back')+'</button><h1>'+esc(P.title)+'</h1>';
    vw.innerHTML=P.body();
  }else{
    var eye=(S.hide&&(ui.tab==='cuzdan'||ui.tab==='portfoy'))?'<button class="icon-btn" data-act="eye" aria-label="'+(ui.reveal?'Tutarları gizle':'Tutarları göster')+'">'+ic(ui.reveal?'eye':'eyeoff')+'</button>':'';
    hd.innerHTML='<h1><span class="logo" role="img" aria-label="Wallet logosu"></span>Wallet</h1>'+eye;
    var f={ayarlar:vAyarlar,cuzdan:vCuzdan,portfoy:vPortfoy,notlar:vNotlar,arac:vArac};
    vw.innerHTML=f[ui.tab]();
    var sl=document.getElementById('slides');if(sl&&ui.slide)sl.scrollLeft=ui.slide*sl.clientWidth;
  }
  document.getElementById('tabs').innerHTML=TABS.map(function(t){return '<button class="tab" data-act="tab" data-v="'+t[0]+'"'+(t[0]===ui.tab?' aria-current="page"':'')+'>'+(t[2]==='logo'?'<span class="logo" aria-hidden="true"></span>':ic(t[2]))+'<span>'+t[1]+'</span></button>';}).join('');
  document.getElementById('tabsnav').hidden=!!ui.page;
  document.getElementById('fab').hidden=!(!ui.page&&ui.tab==='cuzdan'&&(ui.sub==='islem'||ui.sub==='butce'));
}
function openPage(p,hash){ui.page=p;try{if(hash)location.hash=hash;}catch(e){}render();window.scrollTo(0,0);}
function finishPage(){if(ui.page&&ui.page.k==='note')saveNote();}
function closePage(){finishPage();ui.page=null;render();try{if(location.hash.length>1)history.back();}catch(e){}}

/* ---------- alt sayfalar (sheet) ---------- */
function openSheet(inner){document.getElementById('sheet-root').innerHTML='<div class="sheet-bg" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in">'+inner+'</div></div>';}
function closeSheet(){document.getElementById('sheet-root').innerHTML='';}
function opts(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}
function delBtn(act,id){return '<button class="btn danger" data-act="'+act+'" data-id="'+id+'">Sil</button>';}
function armed(btn){if(btn.dataset.armed){return true;}btn.dataset.armed='1';btn.textContent='Silmek için tekrar dokun';return false;}
function ferr(m){var e=document.getElementById('f-err');if(e){e.textContent=m;e.style.color='var(--exp)';}}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function badName(n){return /^(__proto__|constructor|prototype)$/.test(n);}
var txType='exp';
function txSheet(id,force){
  var t=id?byId(S.tx,id):null;txType=t?t.type:(force||'exp');
  var acc=ACCS(),canTrf=acc.length>1;if(txType==='trf'&&!canTrf)txType='exp';
  var cats=txType==='inc'?INCC():EXPC(),trf=txType==='trf';
  openSheet('<h2>'+(t?'İşlemi düzenle':'Yeni işlem')+'</h2><div class="seg" id="f-type"><button data-act="tx-type" data-v="exp" aria-pressed="'+(txType==='exp')+'">Gider</button><button data-act="tx-type" data-v="inc" aria-pressed="'+(txType==='inc')+'">Gelir</button>'+(canTrf?'<button data-act="tx-type" data-v="trf" aria-pressed="'+trf+'">Transfer</button>':'')+'</div>'
   +'<div class="field"><label for="f-amt">Tutar (₺)</label><input id="f-amt" inputmode="decimal" placeholder="0,00" value="'+(t?t.amt:'')+'"></div>'
   +'<div class="two"><div class="field" id="row-cat"'+(trf?' hidden':'')+'><label for="f-cat">Kategori</label><select id="f-cat">'+opts(cats,t&&t.cat)+'</select></div><div class="field"><label for="f-acct" id="lb-acct">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="f-acct">'+opts(acc,t&&t.acct)+'</select></div></div>'
   +'<div class="field" id="row-to"'+(trf?'':' hidden')+'><label for="f-to">Giriş hesabı</label><select id="f-to">'+opts(acc,(t&&t.to)||acc[1])+'</select></div>'
   +'<div class="field"><label for="f-date">Tarih</label><input id="f-date" type="date" value="'+(t?t.date:isoDate(new Date()))+'"></div>'
   +'<div class="field"><label for="f-note">Not</label><input id="f-note" placeholder="İsteğe bağlı" value="'+esc(t?t.note:'')+'"></div><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-tx" data-id="'+(t?t.id:'')+'">Kaydet</button>'+(t?delBtn('del-tx',t.id):''));
  if(!t)setTimeout(function(){var e=document.getElementById('f-amt');if(e)e.focus();},50);
}
function hSheet(id){
  var x=id?byId(S.holdings,id):null;
  var co='<option value=""'+(x&&x.ccy?'':' selected')+'>Elle girilen fiyat</option>'+['USD','EUR','XAU'].map(function(k){return '<option value="'+k+'"'+(x&&x.ccy===k?' selected':'')+'>'+FXL[k]+' kuru</option>';}).join('');
  openSheet('<h2>'+(x?'Varlığı düzenle':'Varlık ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Gram altın" value="'+esc(x?x.name:'')+'"></div>'
   +'<div class="field"><label for="h-type">Tür</label><select id="h-type">'+opts(HTYPES,x&&x.type)+'</select></div>'
   +'<div class="field"><label for="h-ccy">Fiyat kaynağı</label><select id="h-ccy">'+co+'</select></div>'
   +'<div class="two"><div class="field"><label for="h-qty">Adet / miktar</label><input id="h-qty" inputmode="decimal" value="'+(x?x.qty:'')+'"></div><div class="field"><label for="h-cost">Ortalama maliyet (₺)</label><input id="h-cost" inputmode="decimal" value="'+(x?x.cost:'')+'"></div></div>'
   +'<div class="field"><label for="h-price">Güncel fiyat (₺)</label><input id="h-price" inputmode="decimal" value="'+(x?x.price:'')+'"></div><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'">Kaydet</button>'+(x?delBtn('del-h',x.id):''));
}
function dSheet(id){
  var d=id?byId(S.debts,id):null;
  openSheet('<h2>'+(d?'Borcu düzenle':'Borç ekle')+'</h2><div class="field"><label for="d-name">Ad</label><input id="d-name" placeholder="Örn. Taşıt kredisi" value="'+esc(d?d.name:'')+'"></div><div class="two"><div class="field"><label for="d-type">Tür</label><select id="d-type">'+opts(DTYPES,d&&d.type)+'</select></div><div class="field"><label for="d-amt">Kalan tutar (₺)</label><input id="d-amt" inputmode="decimal" value="'+(d?d.amt:'')+'"></div></div><div class="err" id="f-err"></div><button class="btn" data-act="save-d" data-id="'+(d?d.id:'')+'">Kaydet</button>'+(d?delBtn('del-d',d.id):''));
}
function gSheet(id){
  var g=id?byId(S.goals,id):null;
  openSheet('<h2>'+(g?'Hedefi düzenle':'Yeni hedef')+'</h2><div class="field"><label for="g-name">Ad</label><input id="g-name" placeholder="Örn. Yaz tatili" value="'+esc(g?g.name:'')+'"></div><div class="two"><div class="field"><label for="g-target">Hedef tutar (₺)</label><input id="g-target" inputmode="decimal" value="'+(g?g.target:'')+'"></div><div class="field"><label for="g-saved">Biriken (₺)</label><input id="g-saved" inputmode="decimal" value="'+(g?g.saved:0)+'"></div></div><div class="field"><label for="g-date">Hedef tarih (isteğe bağlı)</label><input id="g-date" type="date" value="'+(g&&g.date?g.date:'')+'"></div><div class="err" id="f-err"></div><button class="btn" data-act="save-g" data-id="'+(g?g.id:'')+'">Kaydet</button>'+(g?delBtn('del-g',g.id):''));
}
function rSheet(id){
  var r=id?byId(S.recurring,id):null;
  openSheet('<h2>'+(r?'Ödemeyi düzenle':'Yeni düzenli ödeme')+'</h2><div class="field"><label for="r-name">Ad</label><input id="r-name" placeholder="Örn. İnternet" value="'+esc(r?r.name:'')+'"></div><div class="two"><div class="field"><label for="r-amt">Tutar (₺)</label><input id="r-amt" inputmode="decimal" value="'+(r?r.amt:'')+'"></div><div class="field"><label for="r-day">Ayın kaçı</label><input id="r-day" inputmode="numeric" value="'+(r?r.day:'')+'"></div></div><div class="two"><div class="field"><label for="r-cat">Kategori</label><select id="r-cat">'+opts(EXPC(),r&&r.cat)+'</select></div><div class="field"><label for="r-acct">Hesap</label><select id="r-acct">'+opts(ACCS(),r&&r.acct)+'</select></div></div><div class="err" id="f-err"></div><button class="btn" data-act="save-r" data-id="'+(r?r.id:'')+'">Kaydet</button>'+(r?delBtn('del-r',r.id):''));
}

/* ---------- eylemler ---------- */
ACT.tab=function(el,id,v){ui.tab=v;render();window.scrollTo(0,0);};
ACT.back=function(){closePage();};
ACT.eye=function(){ui.reveal=!ui.reveal;render();};
ACT.sub=function(el,id,v){ui.sub=v;render();};
ACT.mprev=function(){ui.month=addMonth(ui.month,-1);render();};
ACT.mnext=function(){ui.month=addMonth(ui.month,1);render();};
ACT.filter=function(el,id,v){ui.filter=v;render();};
ACT.calc=function(el,id,v){ui.calc=v;render();};
ACT.close=function(){closeSheet();};
ACT['open-fire']=function(){openPage({k:'fire'},'fire');};
ACT['open-set']=function(el,id){openPage({k:'set',s:id},'ayar-'+id);};
ACT.tgl=function(el,id,v){setP(v,!getP(v));if(v==='hide')ui.reveal=false;save();render();};
ACT.setv=function(el,id,v){var x=el.dataset.x;if(/^-?\d+(\.\d+)?$/.test(x))x=Number(x);setP(v,x);save();render();};

ACT['new-tx']=function(){txSheet();};
ACT['new-trf']=function(){txSheet(null,'trf');};
ACT['edit-tx']=function(el,id){txSheet(id);};
ACT['tx-type']=function(el,id,v){
  txType=v;
  document.querySelectorAll('#f-type button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===v));});
  var trf=v==='trf';
  document.getElementById('row-cat').hidden=trf;document.getElementById('row-to').hidden=!trf;
  document.getElementById('lb-acct').textContent=trf?'Çıkış hesabı':'Hesap';
  if(!trf){var c=document.getElementById('f-cat');c.innerHTML=opts(v==='exp'?EXPC():INCC());delete c.dataset.manual;}
};
ACT['save-tx']=function(el,id){
  var amt=num(val('f-amt'));if(amt<=0){ferr('Tutarı sıfırdan büyük gir.');return;}
  var d=val('f-date');if(!d){ferr('Tarih seç.');return;}
  var o={type:txType,amt:amt,acct:val('f-acct'),date:d,note:val('f-note').trim()};
  if(txType==='trf'){var to=val('f-to');if(to===o.acct){ferr('Çıkış ve giriş hesabı farklı olmalı.');return;}o.to=to;o.cat='Transfer';}
  else o.cat=val('f-cat');
  if(id){var t=byId(S.tx,id);if(txType!=='trf')delete t.to;Object.assign(t,o);delete t.sample;}else{o.id=uid();S.tx.push(o);}
  if(pk(d)!==ui.month)ui.month=pk(d);
  save();closeSheet();render();
};
ACT['del-tx']=function(el,id){if(!armed(el))return;S.tx=S.tx.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT['new-h']=function(){hSheet();};ACT['edit-h']=function(el,id){hSheet(id);};
ACT['save-h']=function(el,id){
  var nm=val('h-name').trim();if(!nm){ferr('Bir ad yaz.');return;}var q=num(val('h-qty'));if(q<=0){ferr('Miktarı gir.');return;}
  var h={name:nm,type:val('h-type'),ccy:val('h-ccy'),qty:q,cost:num(val('h-cost')),price:num(val('h-price'))||num(val('h-cost'))};
  if(id){var x=byId(S.holdings,id);Object.assign(x,h);delete x.sample;}else{h.id=uid();S.holdings.push(h);}
  save();closeSheet();render();
};
ACT['del-h']=function(el,id){if(!armed(el))return;S.holdings=S.holdings.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT['new-d']=function(){dSheet();};ACT['edit-d']=function(el,id){dSheet(id);};
ACT['save-d']=function(el,id){
  var n=val('d-name').trim(),a=num(val('d-amt'));if(!n){ferr('Bir ad yaz.');return;}if(a<=0){ferr('Kalan tutarı gir.');return;}
  var o={name:n,type:val('d-type'),amt:a};
  if(id){var d0=byId(S.debts,id);Object.assign(d0,o);delete d0.sample;}else{o.id=uid();S.debts.push(o);}
  save();closeSheet();render();
};
ACT['del-d']=function(el,id){if(!armed(el))return;S.debts=S.debts.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT['new-g']=function(){gSheet();};ACT['edit-g']=function(el,id){gSheet(id);};
ACT['save-g']=function(el,id){
  var gn=val('g-name').trim(),gt=num(val('g-target'));if(!gn){ferr('Bir ad yaz.');return;}if(gt<=0){ferr('Hedef tutarı gir.');return;}
  var go={name:gn,target:gt,saved:num(val('g-saved')),date:val('g-date')};
  if(id){var g0=byId(S.goals,id);Object.assign(g0,go);delete g0.sample;}else{go.id=uid();S.goals.push(go);}
  save();closeSheet();render();
};
ACT['del-g']=function(el,id){if(!armed(el))return;S.goals=S.goals.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT.gadd=function(el,id){var inp=document.querySelector('[data-gadd="'+id+'"]'),ga=num(inp&&inp.value);if(ga<=0){if(inp)inp.focus();return;}var g1=byId(S.goals,id);if(g1){g1.saved+=ga;delete g1.sample;save();render();}};
ACT['new-r']=function(){rSheet();};ACT['edit-r']=function(el,id){rSheet(id);};
ACT['save-r']=function(el,id){
  var rn=val('r-name').trim(),ra=num(val('r-amt')),rd=Math.round(num(val('r-day')));
  if(!rn){ferr('Bir ad yaz.');return;}if(ra<=0){ferr('Tutarı gir.');return;}if(rd<1||rd>31){ferr('Gün 1 ile 31 arasında olmalı.');return;}
  var ro={name:rn,amt:ra,day:rd,cat:val('r-cat'),acct:val('r-acct')};
  if(id){var r0=byId(S.recurring,id);Object.assign(r0,ro);delete r0.sample;}else{ro.id=uid();ro.paid={};S.recurring.push(ro);}
  save();closeSheet();render();
};
ACT['del-r']=function(el,id){if(!armed(el))return;S.recurring=S.recurring.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT.rpay=function(el,id){var r=byId(S.recurring,id);if(!r)return;var tx={id:uid(),type:'exp',amt:r.amt,cat:r.cat,acct:r.acct,note:r.name,date:dueDate(r,ui.month)};S.tx.push(tx);r.paid=r.paid||{};r.paid[ui.month]=tx.id;save();render();};
ACT.rundo=function(el,id){var r=byId(S.recurring,id);if(r&&r.paid){var pid=r.paid[ui.month];S.tx=S.tx.filter(function(x){return x.id!==pid;});delete r.paid[ui.month];save();render();}};

/* notlar */
ACT['new-n']=function(){openPage({k:'note',id:null,draft:{title:'',body:'',pin:false},dirty:false},'not');};
ACT['edit-n']=function(el,id){var n=byId(S.notes,id);if(!n)return;openPage({k:'note',id:id,draft:{title:n.title||'',body:n.body||'',pin:!!n.pin},dirty:false},'not');};
ACT['note-pin']=function(){var p=ui.page;p.draft.pin=!p.draft.pin;p.dirty=true;render();};
ACT['note-save']=function(){var d=ui.page.draft;if(!d.title.trim()&&!d.body.trim()){msg('Başlık ya da not yaz.');return;}saveNote();closePage();};
ACT['note-del']=function(el){if(S.nset.confirmDel&&!armed(el))return;var p=ui.page;S.notes=S.notes.filter(function(x){return x.id!==p.id;});p.dirty=false;save();closePage();};
ACT['notes-copy']=function(){if(!S.notes.length){msg('Kopyalanacak not yok.');return;}copyText(allNotesText(),'f-err','Notlar kopyalandı.');};
ACT['notes-save']=function(){if(!S.notes.length){msg('Kaydedilecek not yok.');return;}saveFile('wallet-notlar.txt',allNotesText(),'Notlar kaydedildi.');};

/* hesaplar ve kategoriler */
ACT['acc-add']=function(){var n=val('na-name').trim();if(!n){msg('Hesaba bir ad yaz.');return;}if(badName(n)||ACCS().indexOf(n)>-1){msg('Bu ad kullanılamaz ya da zaten var.');return;}S.accounts.push(n);S.opening[n]=num(val('na-open'));save();render();};
ACT['acc-del']=function(el,id){if(acctUsed(id)||ACCS().length<2)return;if(!armed(el))return;S.accounts=S.accounts.filter(function(x){return x!==id;});delete S.opening[id];save();render();};
ACT['cat-add']=function(el,id,v){var n=val('nc-'+v).trim();if(!n||badName(n)||S.cats[v].indexOf(n)>-1)return;S.cats[v].push(n);save();render();};
ACT['cat-del']=function(el,id,v){if(S.cats[v].length<2)return;if(!armed(el))return;S.cats[v]=S.cats[v].filter(function(x){return x!==id;});save();render();};
ACT['rule-add']=function(){var kw=val('rl-kw').trim().toLocaleLowerCase('tr-TR');if(!kw){msg('Bir kelime yaz.');return;}S.rules.push({kw:kw,cat:val('rl-cat')});save();render();};
ACT['rule-del']=function(el,id){S.rules.splice(+id,1);save();render();};

/* PIN */
ACT['pin-set']=function(){var a=val('pin1'),b=val('pin2');if(!/^\d{4}$/.test(a)){msg('PIN 4 rakam olmalı.');return;}if(a!==b){msg('İki PIN aynı olmalı.');return;}var salt=uid();pinHash(a,salt).then(function(h){S.pin={h:h,s:salt,auto:1};save();render();});};
ACT['pin-change']=function(){var o=val('pold'),a=val('pnew1'),b=val('pnew2');if(!/^\d{4}$/.test(a)){msg('Yeni PIN 4 rakam olmalı.');return;}if(a!==b){msg('Yeni PIN’ler aynı olmalı.');return;}
  pinHash(o,S.pin.s).then(function(h){if(h!==S.pin.h){msg('Mevcut PIN yanlış.');return;}var salt=uid();return pinHash(a,salt).then(function(h2){S.pin={h:h2,s:salt,auto:S.pin.auto};save();render();msg('PIN değiştirildi.',true);});});};
ACT['pin-remove']=function(){pinHash(val('prem'),S.pin.s).then(function(h){if(h!==S.pin.h){msg('PIN yanlış.',false,'f-err2');return;}S.pin=null;save();render();});};
ACT['lock-now']=function(){ui.locked=true;ui.pinBuf='';ui.lkMsg='';ui.forgot=false;render();};
ACT['lk-forgot']=function(){ui.forgot=true;render();};
ACT['lk-back']=function(){ui.forgot=false;render();};
ACT['lk-reset']=function(el){if(!armed(el))return;S=norm({tx:[]});save();ui.locked=false;ui.forgot=false;ui.page=null;ui.tab='cuzdan';ui.month=curP();render();};
ACT.lk=function(el,id,v){
  if(Date.now()<ui.lockUntil||!S.pin)return;
  if(v==='<')ui.pinBuf=ui.pinBuf.slice(0,-1);else if(ui.pinBuf.length<4)ui.pinBuf+=v;
  ui.lkMsg='';
  if(ui.pinBuf.length===4){
    var buf=ui.pinBuf;
    pinHash(buf,S.pin.s).then(function(h){
      if(h===S.pin.h){ui.locked=false;ui.pinBuf='';ui.fails=0;ui.lkMsg='';render();}
      else{ui.fails++;ui.pinBuf='';ui.lkMsg='Yanlış PIN';
        if(ui.fails>=5){ui.fails=0;ui.lockUntil=Date.now()+30000;ui.lkMsg='Çok fazla deneme. 30 saniye bekle.';setTimeout(function(){if(ui.locked){ui.lkMsg='';render();}},30000);}
        render();}
    });
  }else render();
};

/* yedek */
ACT.csv=function(){saveFile('wallet-islemler.csv',csvAll(),'CSV kaydedildi.');};
ACT['csv-copy']=function(){copyText(csvAll(),'f-err','CSV kopyalandı.');};
ACT['bk-make']=function(){
  var pw=val('bk-pw'),json=exportJson();
  var done=function(text){document.getElementById('bk-out').value=text;document.getElementById('bk-box').hidden=false;msg(pw?'Şifreli yedek hazır.':'Şifresiz yedek hazır.',true,'f-err3');};
  if(pw){if(!(window.crypto&&crypto.subtle)){msg('Bu görünümde şifreleme kullanılamıyor.',false,'f-err3');return;}encText(json,pw).then(done,function(){msg('Yedek şifrelenemedi.',false,'f-err3');});}
  else done(json);
};
ACT['bk-copy']=function(){copyText(val('bk-out'),'f-err3','Yedek kopyalandı.');};
ACT['bk-save']=function(){saveFile(val('bk-pw')?'wallet-yedek-sifreli.json':'wallet-yedek.json',val('bk-out'),'Yedek kaydedildi.','f-err3');};
ACT['rs-go']=function(){
  var raw=val('rs-txt').trim(),pw=val('rs-pw');
  if(!raw){msg('Yedek dosyasını seç ya da metni yapıştır.',false,'f-err2');return;}
  var o;try{o=JSON.parse(raw);}catch(e){msg('Yedek okunamadı. Tüm metni kopyaladığından emin ol.',false,'f-err2');return;}
  var apply=function(d){if(!d||!Array.isArray(d.tx))throw new Error('x');var keep=S.pin;S=norm(d);S.pin=keep||null;ui.month=curP();save();render();msg('Yedek yüklendi.',true,'f-err2');};
  if(o&&o.wallet&&o.d){
    if(!pw){msg('Bu yedek şifreli, şifreyi gir.',false,'f-err2');return;}
    decText(o,pw).then(function(t){try{apply(JSON.parse(t));}catch(e){msg('Yedek okunamadı.',false,'f-err2');}},function(){msg('Şifre yanlış ya da yedek bozuk.',false,'f-err2');});
  }else{try{apply(o);}catch(e){msg('Yedek okunamadı.',false,'f-err2');}}
};

/* demo */
ACT['sample-load']=function(){
  var d=seed(),acc=ACCS();
  d.tx.forEach(function(t){if(acc.indexOf(t.acct)<0)t.acct=acc[0];});
  d.recurring.forEach(function(r){if(acc.indexOf(r.acct)<0)r.acct=acc[0];});
  S.tx=S.tx.concat(d.tx);S.goals=S.goals.concat(d.goals);S.recurring=S.recurring.concat(d.recurring);S.holdings=S.holdings.concat(d.holdings);S.notes=S.notes.concat(d.notes);S.debts=S.debts.concat(d.debts);
  if(!Object.keys(S.budgets).length&&!acc.some(function(a){return S.opening[a];})){S.budgets=d.budgets;acc.forEach(function(a){if(d.opening[a]!=null)S.opening[a]=d.opening[a];});S.sampleExtras=true;}
  if(!S.fx.USD&&!S.fx.EUR&&!S.fx.XAU){S.fx={USD:41.5,EUR:0,XAU:0};S.fxSample=true;}
  save();render();
};
ACT['sample-clear']=function(){
  S.tx=S.tx.filter(function(x){return !x.sample;});S.holdings=S.holdings.filter(function(x){return !x.sample;});S.notes=S.notes.filter(function(x){return !x.sample;});S.goals=S.goals.filter(function(x){return !x.sample;});S.recurring=S.recurring.filter(function(x){return !x.sample;});S.debts=S.debts.filter(function(x){return !x.sample;});
  if(S.sampleExtras){S.budgets={};S.opening={};S.sampleExtras=false;}
  if(S.fxSample){S.fx={USD:0,EUR:0,XAU:0};S.fxSample=false;}
  save();render();
};
ACT['reset-all']=function(el){if(!armed(el))return;S=norm({tx:[]});save();ui.page=null;ui.tab='cuzdan';ui.month=curP();render();try{if(location.hash.length>1)history.back();}catch(e){}};

/* ---------- olaylar ---------- */
/* ---------- canlı kur ---------- */
var RK={USD:['USD'],EUR:['EUR'],XAU:['GRA','GRAM-ALTIN','GRAMALTIN','GA','GRAM_ALTIN'],BIST:['XU100','BIST100','BIST-100','XU-100']};
function findRate(items,names){var keys=Object.keys(items||{});for(var i=0;i<names.length;i++){for(var j=0;j<keys.length;j++){if(keys[j].toUpperCase()===names[i]&&items[keys[j]]&&typeof items[keys[j]]==='object')return items[keys[j]];}}return null;}
function rPrice(o){if(!o)return 0;var v=num(o.Selling!=null?o.Selling:(o.sell!=null?o.sell:(o.price!=null?o.price:(o.Buying!=null?o.Buying:o.buy))));return v>0?v:0;}
function pickRates(j){var it=(j&&j.items)||j||{},o={USD:rPrice(findRate(it,RK.USD)),EUR:rPrice(findRate(it,RK.EUR)),XAU:rPrice(findRate(it,RK.XAU)),BIST:null,prov:(j&&(j.updated||j.Update_Date))||''};
  var b=findRate(it,RK.BIST);if(b&&rPrice(b)>0){var c=b.Change!=null?b.Change:b.change;o.BIST={price:rPrice(b),chg:(c==null||c==='')?null:num(c)};}
  return o;}
function refreshRates(manual){
  if(!S.fxAuto&&!manual)return Promise.resolve();
  return fetch('rates.json?_='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();}).then(function(j){
    var o=pickRates(j),got=[];
    if(o.USD>0){S.fx.USD=o.USD;got.push('USD');}if(o.EUR>0){S.fx.EUR=o.EUR;got.push('EUR');}if(o.XAU>0){S.fx.XAU=o.XAU;got.push('altın');}
    if(o.BIST){S.mkt.BIST=o.BIST;got.push('BIST');}
    if(!got.length){if(manual)msg('Henüz kur verisi yok. Yayın sunucusu ilk güncellemeyi yapınca gelir.',false,'f-rates');return;}
    S.fxTs=Date.now();S.fxProv=String(o.prov||'');S.fxSample=false;save();
    if(manual){render();msg('Güncellendi: '+got.join(', ')+'.',true,'f-rates');}
    else if(!document.getElementById('sheet-root').innerHTML&&!ui.page&&!ui.locked)render();
  }).catch(function(){if(manual)msg('Kurlar alınamadı. İnternet bağlantını kontrol et.',false,'f-rates');});
}
ACT['rates-now']=function(){refreshRates(true);};
/* ---------- bildirim ---------- */
ACT['notif-ask']=function(){try{Notification.requestPermission().then(function(){render();});}catch(e){}};
function notifyDue(){
  if(!S.notif||!('Notification' in window)||Notification.permission!=='granted'||ui.locked)return;
  var day=isoDate(today0());if(S.notifDay===day)return;
  var items=alertItems();if(!items.length)return;
  S.notifDay=day;save();
  var body=items.slice(0,4).map(function(x){return x[1];}).join('\n');
  try{if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(function(reg){reg.showNotification('Wallet',{body:body,icon:'icons/icon-192.png',tag:'wallet-due'});});}else{new Notification('Wallet',{body:body,icon:'icons/icon-192.png'});}}catch(e){}
}
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');if(!el)return;
  var a=el.dataset.act;if(Object.prototype.hasOwnProperty.call(ACT,a))ACT[a](el,el.dataset.id,el.dataset.v);
});
document.addEventListener('change',function(e){
  var t=e.target,d=t.dataset||{};
  if(d.bind){
    var k=d.kind,v=t.value;
    if(k==='num')v=num(v);else if(k==='auto')v=(String(v).trim()==='')?'':num(v);else if(k==='int')v=parseInt(v,10)||1;
    setP(d.bind,v);
    if(d.bind==='payday')ui.month=curP();
    if(d.bind.indexOf('fx.')===0){S.fxTs=Date.now();S.fxSample=false;}
    save();render();return;
  }
  if(d.budget!==undefined){var n=num(t.value);if(n>0)S.budgets[d.budget]=n;else delete S.budgets[d.budget];S.sampleExtras=false;save();render();}
  else if(d.price!==undefined){var h=byId(S.holdings,d.price);if(h){h.price=num(t.value);delete h.sample;save();render();}}
  else if(d.accName!==undefined){
    var old=d.accName,nw=t.value.trim();
    if(!nw||nw===old||badName(nw)||ACCS().indexOf(nw)>-1){render();return;}
    S.accounts=S.accounts.map(function(x){return x===old?nw:x;});
    S.tx.forEach(function(x){if(x.acct===old)x.acct=nw;if(x.to===old)x.to=nw;});
    S.recurring.forEach(function(r){if(r.acct===old)r.acct=nw;});
    if(Object.prototype.hasOwnProperty.call(S.opening,old)){S.opening[nw]=S.opening[old];delete S.opening[old];}
    save();render();
  }
  else if(d.accOpen!==undefined){S.opening[d.accOpen]=num(t.value);S.sampleExtras=false;save();render();}
  else if(t.id==='f-cat'){t.dataset.manual='1';}
  else if(t.id==='rs-file'){var f=t.files&&t.files[0];if(f){var fr=new FileReader();fr.onload=function(){var ta=document.getElementById('rs-txt');if(ta)ta.value=String(fr.result||'');};fr.readAsText(f);}}
});
document.addEventListener('input',function(e){
  var t=e.target,d=t.dataset||{};
  if(t.classList&&t.classList.contains('calc-in')){ui.cv[ui.calc][d.k]=t.value;document.getElementById('calc-out').innerHTML=calcOut();}
  else if(t.id==='nsearch'){ui.nq=t.value;document.getElementById('nlist').innerHTML=notesList();}
  else if(t.id==='sset'){ui.sq=t.value;document.getElementById('setlist').innerHTML=setList();}
  else if(d.nf&&ui.page&&ui.page.k==='note'){ui.page.draft[d.nf]=t.value;ui.page.dirty=true;}
  else if(t.id==='f-note'&&txType!=='trf'){
    var txt=t.value.toLocaleLowerCase('tr-TR'),sel=document.getElementById('f-cat');
    if(sel&&!sel.dataset.manual){var r=S.rules.filter(function(x){return txt.indexOf(x.kw)>-1;})[0];
      if(r&&Array.prototype.some.call(sel.options,function(o){return o.value===r.cat;}))sel.value=r.cat;}
  }
});
document.addEventListener('scroll',function(e){
  var t=e.target;if(!t||t.id!=='slides')return;
  var i=Math.round(t.scrollLeft/Math.max(t.clientWidth,1));
  if(i!==ui.slide){ui.slide=i;Array.prototype.forEach.call(t.parentNode.querySelectorAll('.sdots i'),function(x,j){x.classList.toggle('on',j===i);});}
},true);
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||ui.locked)return;
  if(document.getElementById('sheet-root').innerHTML)closeSheet();else if(ui.page)closePage();
});
document.addEventListener('visibilitychange',function(){
  if(document.hidden){ui.hiddenAt=Date.now();}
  else if(S.pin&&!ui.locked&&ui.hiddenAt&&(Date.now()-ui.hiddenAt)>=(S.pin.auto||0)*60000){ui.locked=true;ui.pinBuf='';ui.lkMsg='';ui.forgot=false;closeSheet();render();}
  if(!document.hidden){if(!S.fxTs||Date.now()-S.fxTs>300000)refreshRates();notifyDue();}
});
window.addEventListener('hashchange',function(){
  if(ui.page&&(!location.hash||location.hash==='#')){finishPage();ui.page=null;render();}
});

document.getElementById('fab').innerHTML=ic('plus');
render();
refreshRates();setTimeout(notifyDue,1500);
})();
