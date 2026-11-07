(function(){
'use strict';
var KEY='kumbara-v1',UIKEY='wallet-ui',VER='3.1';
var D_EXP=['Market','Fatura','Kira','Ulaşım','Yeme-İçme','Sağlık','Eğlence','Giyim','Eğitim','Diğer'];
var D_INC=['Maaş','Ek gelir','Yatırım getirisi','Diğer gelir'];
var D_ACC=['Nakit','Banka','Kredi kartı'];
var INVT=['Hisse','Fon','Altın','Gümüş','Döviz','Kripto','Mevduat','Diğer yatırım'];
var ASTT=['Gayrimenkul','Araç','Diğer varlık'];
var DTYPES=['Kredi','Kredi kartı','Taksit','Kişisel borç','Diğer'];
/* para birimleri: hesaplar ve görüntüleme için; kur kaynakları varlık fiyatı için */
var CCYS=['TRY','USD','EUR','GBP','CHF','XAU'];
var CSYM={TRY:'₺',USD:'$',EUR:'€',GBP:'£',CHF:'CHF',XAU:'gr'};
var CCYN={TRY:'Türk lirası',USD:'Dolar',EUR:'Euro',GBP:'Sterlin',CHF:'İsviçre frangı',XAU:'Gram altın'};
var CCYS_SHORT={TRY:'₺ TL',USD:'$ USD',EUR:'€ EUR',GBP:'£ GBP',CHF:'CHF',XAU:'Altın (gr)'};
var FXK=['USD','EUR','GBP','CHF','XAU','XAG','CEY'];
var FXL={USD:'USD/TL',EUR:'EUR/TL',GBP:'GBP/TL',CHF:'CHF/TL',XAU:'Gram altın',XAG:'Gram gümüş',CEY:'Çeyrek altın'};
var R0=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0});
var R2=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2});
var NUM2=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2});
var NUM1=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:1});
var maskOn=false,MASK='••••';
function clean(n,d){n=+n||0;return Math.abs(n)<(d?0.005:0.5)?0:n;}
var TRY0={format:function(n){return maskOn?'₺ '+MASK:R0.format(clean(n,0)).replace('-','−');}};
var TRY2={format:function(n){return maskOn?'₺ '+MASK:R2.format(clean(n,1)).replace('-','−');}};
var CF={};
function cfmt(c,d){var k=c+d;if(!CF[k])CF[k]=new Intl.NumberFormat('tr-TR',{style:'currency',currency:c,minimumFractionDigits:d,maximumFractionDigits:d});return CF[k];}
/* v: c para biriminde tutar */
function fmtC(v,c,dec){
  if(c==='TRY')return (dec?TRY2:TRY0).format(v);
  if(maskOn)return c==='XAU'?MASK+' gr':CSYM[c]+' '+MASK;
  v=clean(v,1);
  if(c==='XAU')return (v<0?'−':'')+NUM2.format(Math.abs(v))+' gr';
  return cfmt(c,dec?2:0).format(clean(v,dec)).replace('-','−');
}
var ICONS={
  home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  trend:'M3 17l5-5 4 4 8-9M15 7h5v5',
  note:'M5 3h10l4 4v14H5z M15 3v4h4 M8 12h8M8 16h6',
  calc:'M6 3h12v18H6z M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
  gear:'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 3.5v5M9 9.5v5M17 15.5v5',
  cog:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  plus:'M12 5v14M5 12h14', l:'M15 6l-6 6 6 6', r:'M9 6l6 6-6 6', down:'M6 9l6 6 6-6',
  back:'M19 12H5M11 6l-6 6 6 6',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  bank:'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  shapes:'M7 3l4 7H3z M14 14h7v7h-7z M7.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  bell:'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4',
  palette:'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z M7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01',
  shield:'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z M9 12l2 2 4-4',
  server:'M4 5h16v5H4z M4 14h16v5H4z M8 7.5h.01M8 16.5h.01',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeoff:'M3 3l18 18 M10.6 6.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4 M6.6 6.7A17 17 0 0 0 2 12s4 7 10 7c1.7 0 3.2-.4 4.5-1 M9.9 9.9a3 3 0 0 0 4.2 4.2',
  fire:'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-.5-5 1-8z',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
  pin:'M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3z',
  refresh:'M20 11a8 8 0 1 0-2.3 5.7 M20 4v7h-7',
  cash:'M2 7h20v10H2z M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M5.5 12h.01M18.5 12h.01',
  wallet:'M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11v3 M16 13.5h.01',
  swap:'M4 8h15l-4-4 M20 16H5l4 4',
  inc:'M12 4v11M7 10l5 5 5-5M5 20h14',
  exp:'M12 15V4M7 9l5-5 5 5M5 20h14',
  card:'M3 6h18v12H3z M3 10h18 M7 15h4',
  coins:'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3z M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5 M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  chart:'M4 20V11M10 20V5M16 20v-8M21 20H3',
  archive:'M3 4h18v4H3z M5 8v12h14V8 M10 12h4',
  trash:'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6M14 11v6',
  restore:'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5',
  check:'M5 12l5 5 9-10',
  scale:'M12 3v18 M5 21h14 M4 7h16 M7 7l-3 7a3 3 0 0 0 6 0z M17 7l-3 7a3 3 0 0 0 6 0z',
  cal:'M4 5h16v15H4z M4 9h16 M8 3v4M16 3v4 M8 13h3M8 16.5h6',
  msg:'M4 5h16v11H9l-5 4z M8 9h8M8 12h5',
  share:'M12 15V3M8 7l4-4 4 4 M5 12v8h14v-8',
  sparkles:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z'
};
function ic(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICONS[n]+'"/></svg>';}
/* bölümler: kaydırmadan tek satıra sığan 6 sekme; Bütçe, Düzenli ve Hedefler Planlama altında */
var SECS=[['islem','İşlemler','list'],['hesap','Hesaplar','bank'],['plan','Planlama','cal'],['analiz','Analiz','chart'],['portfoy','Portföy','trend'],['notlar','Notlar','note']];
var PLANS=[['butce','Bütçe'],['duzenli','Düzenli'],['hedef','Hedefler']];
var QA=[['qa-inc','Gelir','inc','var(--inc)'],['qa-exp','Gider','exp','var(--exp)'],['qa-cash','Nakit','cash','var(--warn)'],['qa-bank','Banka hesabı','bank','var(--blue)'],['qa-trf','Transfer','swap','var(--accent)'],['qa-debt','Borç','card','var(--exp)'],['qa-inv','Yatırım','trend','var(--inc)'],['qa-save','Birikim','coins','var(--warn)'],['qa-asset','Varlık','home','var(--blue)'],['qa-calc','Hesaplayıcılar','calc','var(--ink2)']];
var SETS=[
 {id:'profil',t:'Profil ve dönem',d:'Adın ve maaş günün',i:'user',c:'var(--inc)'},
 {id:'hesap',t:'Hesaplar',d:'Hesap ekle ve düzenle, varsayılan hesap',i:'bank',c:'var(--blue)'},
 {id:'kurlar',t:'Para birimi ve kurlar',d:'Görüntüleme para birimi, canlı döviz ve altın',i:'trend',c:'var(--inc)'},
 {id:'kat',t:'Kategoriler ve kurallar',d:'Gelir ve gider kategorileri, otomatik kurallar',i:'shapes',c:'var(--warn)'},
 {id:'oto',t:'Otomatik işlemler',d:'Banka SMS’lerinden harcama ve gelirleri yakala',i:'sparkles',c:'var(--accent)'},
 {id:'bild',t:'Bildirimler ve hatırlatıcılar',d:'Fatura ve ödeme hatırlatıcısı, bütçe uyarıları',i:'bell',c:'var(--warn)'},
 {id:'gor',t:'Görünüm',d:'Tema, yazı boyutu, tutarları gizleme',i:'palette',c:'var(--blue)'},
 {id:'guv',t:'Güvenlik ve gizlilik',d:'PIN kilidi, parmak izi, ekran gizliliği',i:'shield',c:'var(--inc)'},
 {id:'veri',t:'Veri ve yedek',d:'Otomatik yedek, yedekten yükleme, CSV, sıfırlama',i:'server',c:'var(--blue)'}
];
var ACT={};
var dl=null;
try{if(window.claude&&window.claude.use){window.claude.use('downloads').then(function(x){dl=x||null;},function(){});}}catch(e){}
/* Android uygulamasının yerel köprüsü (eski APK'da yeni işlevler yoksa sessizce atlanır) */
var NB=window.AndroidBridge||null;
function nb(fn){try{return !!(NB&&typeof NB[fn]==='function');}catch(e){return false;}}

/* ---------- yardımcılar ---------- */
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function num(s){s=String(s==null?'':s).trim().replace(/\s/g,'').replace(/[₺$€£]/g,'').replace(/^−/,'-');
  var c=s.split(',').length-1,d=s.split('.').length-1;
  if(c&&d){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'');}
  else if(c>1)s=s.replace(/,/g,'');
  else if(c)s=s.replace(',','.');
  else if(d>1||/^-?\d{1,3}\.\d{3}$/.test(s))s=s.replace(/\./g,'');
  var n=parseFloat(s);return isNaN(n)||!isFinite(n)?0:n;}
function pad(n){return String(n).padStart(2,'0');}
function isoDate(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function mkey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1);}
function addMonth(k,o){var p=k.split('-');return mkey(new Date(+p[0],+p[1]-1+o,1));}
function mlabel(k,short){var p=k.split('-'),r=new Date(+p[0],+p[1]-1,1).toLocaleDateString('tr-TR',short?{month:'short'}:{month:'long',year:'numeric'});return r.charAt(0).toLocaleUpperCase('tr-TR')+r.slice(1);}
function pdate(s){var p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function color(name){var h=0,s=String(name);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return 'hsl('+(h%360)+' 45% 52%)';}
function sgn(n){return Math.abs(n)<0.5?TRY0.format(0):(n<0?'−':'+')+TRY0.format(Math.abs(n));}
function byId(list,id){for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return undefined;}
var FX2=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
function fx1(n){return n>0?FX2.format(n):'—';}
function clamp(x,a,b){return Math.min(Math.max(x,a),b);}
function pct(x){return '%'+NUM1.format(x);}
/* Türkçe karakterleri sadeleştirerek karşılaştır: "MIGROS" = "migros", "Şişli" = "sisli" */
function fold(x){return String(x==null?'':x).toLocaleLowerCase('tr-TR').replace(/̇/g,'').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/â/g,'a').replace(/î/g,'i').replace(/û/g,'u');}
function nv(x){return (x==null||x==='')?'':String(x).replace('.',',');}
function optsKeep(list,sel){var l=list.slice();if(sel&&l.indexOf(sel)<0)l.push(sel);return opts(l,sel);}
function today0(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function todayS(){return isoDate(today0());}
function daysBetween(a,b){return Math.round((pdate(b)-pdate(a))/864e5);}
function getP(path){return path.split('.').reduce(function(o,k){return o==null?o:o[k];},S);}
function setP(path,val){
  if(!/^[A-Za-z0-9_.]+$/.test(path)||/__proto__|constructor|prototype/.test(path))return;
  var ks=path.split('.'),o=S;
  for(var i=0;i<ks.length-1;i++){if(o[ks[i]]==null||typeof o[ks[i]]!=='object')o[ks[i]]={};o=o[ks[i]];}
  o[ks[ks.length-1]]=val;
}
function dayWord(n){return n===0?'bugün':(n===1?'yarın':n+' gün');}

/* ---------- veri ---------- */
function seed(){
  var now=new Date(),cur=mkey(now),pm=addMonth(cur,-1),pm2=addMonth(cur,-2),today=now.getDate();
  function t(m,day,type,amt,cat,note,acct){var dd=(m===cur)?Math.min(day,today):day;return {id:uid(),type:type,amt:amt,cat:cat,note:note,acct:acct,date:m+'-'+pad(dd),sample:true};}
  var tx=[
    t(cur,1,'inc',42000,'Maaş','Aylık maaş','Banka'), t(cur,2,'exp',14000,'Kira','Ev kirası','Banka'),
    t(cur,3,'exp',1850,'Market','Haftalık alışveriş','Kredi kartı'), t(cur,4,'exp',1340,'Fatura','Elektrik ve internet','Banka'),
    t(cur,5,'exp',650,'Ulaşım','Akbil yükleme','Nakit'), t(cur,6,'exp',780,'Yeme-İçme','Akşam yemeği','Kredi kartı'),
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
    opening:{'Nakit':9000,'Banka':28000,'Kredi kartı':0},sampleExtras:true,
    goals:[{id:uid(),name:'Acil durum fonu',target:120000,saved:45000,date:addMonth(cur,10)+'-01',sample:true},{id:uid(),name:'Yaz tatili',target:60000,saved:12000,date:addMonth(cur,7)+'-01',sample:true}],
    recurring:[{id:uid(),name:'Spor salonu',amt:900,day:5,cat:'Eğlence',acct:'Kredi kartı',paid:{},sample:true},{id:uid(),name:'İnternet',amt:450,day:15,cat:'Fatura',acct:'Banka',paid:{},sample:true},{id:uid(),name:'Dijital abonelik',amt:229,day:22,cat:'Eğlence',acct:'Kredi kartı',paid:{},sample:true}],
    holdings:[
      {id:uid(),name:'Gram altın',type:'Altın',kind:'inv',ccy:'XAU',qty:25,cost:4200,price:5500,sample:true},
      {id:uid(),name:'Dolar',type:'Döviz',kind:'inv',ccy:'USD',qty:1200,cost:34.2,price:41.5,sample:true},
      {id:uid(),name:'Endeks fonu',type:'Fon',kind:'inv',qty:5000,cost:12.4,price:15.1,sample:true}],
    debts:[{id:uid(),name:'Taşıt kredisi',type:'Kredi',amt:85000,sample:true}],
    notes:[{id:uid(),title:'Aylık kontrol listesi',body:'Faturaları kontrol et\nKredi kartı ekstresini öde\nBirikim hesabına aktar',ts:Date.now(),cts:Date.now(),sample:true}]};
}
function norm(d){
  d=d&&typeof d==='object'?d:{};
  d.tx=Array.isArray(d.tx)?d.tx:[];d.budgets=d.budgets||{};d.opening=d.opening||{};d.holdings=Array.isArray(d.holdings)?d.holdings:[];d.notes=Array.isArray(d.notes)?d.notes:[];
  d.fx=d.fx||{};FXK.forEach(function(k){d.fx[k]=+d.fx[k]||0;});d.fxAuto=d.fxAuto!==false;d.mkt=d.mkt||{};d.notif=!!d.notif;d.notifDay=d.notifDay||'';d.last=d.last||{};d.setupHide=!!d.setupHide;
  d.accx=d.accx||{};d.hist=d.hist||{};d.goals=Array.isArray(d.goals)?d.goals:[];d.recurring=Array.isArray(d.recurring)?d.recurring:[];d.debts=Array.isArray(d.debts)?d.debts:[];d.realized=Array.isArray(d.realized)?d.realized:[];
  d.accounts=(Array.isArray(d.accounts)&&d.accounts.length)?d.accounts:D_ACC.slice();
  d.cats=d.cats||{};d.cats.exp=(d.cats.exp&&d.cats.exp.length)?d.cats.exp:D_EXP.slice();d.cats.inc=(d.cats.inc&&d.cats.inc.length)?d.cats.inc:D_INC.slice();
  d.rules=d.rules||[];d.payday=d.payday||1;d.name=d.name||'';d.fs=d.fs||1;d.hide=!!d.hide;d.theme=d.theme||'auto';
  d.dccy=CCYS.indexOf(d.dccy)>=0?d.dccy:'TRY';d.defAcct=d.defAcct||'';
  d.sms=Object.assign({on:false,auto:false,pend:[],seen:[],map:{}},d.sms||{});if(!Array.isArray(d.sms.pend))d.sms.pend=[];if(!Array.isArray(d.sms.seen))d.sms.seen=[];if(!d.sms.map||typeof d.sms.map!=='object')d.sms.map={};d.qaUse=d.qaUse||{};
  d.autoBk=d.autoBk!==false;d.bio=!!d.bio;d.secure=!!d.secure;d.bkTs=+d.bkTs||0;
  d.alerts=Object.assign({budget:true,rec:true,thr:80,days:3,push:true,hour:9},d.alerts||{});
  d.nset=Object.assign({sort:'edited',view:'card',lines:3,date:true,pinFirst:true,confirmDel:true},d.nset||{});
  d.fire=Object.assign({exp:'',save:'',ret:4,wr:4,acc:true,pf:true,ast:false,extra:0,target:'',tccy:'TRY'},d.fire||{});
  if(CCYS.indexOf(d.fire.tccy)<0)d.fire.tccy='TRY';
  d.holdings.forEach(function(h){if(!h.kind)h.kind=ASTT.indexOf(h.type)>=0||h.type==='Gayrimenkul'||h.type==='Araç'?'asset':'inv';if(!h.id)h.id=uid();});
  d.notes.forEach(function(n){if(!n.id)n.id=uid();n.arch=!!n.arch;if(n.trash&&!(+n.trash>0))n.trash=Date.now();});
  d.tx.forEach(function(t){if(!t.id)t.id=uid();t.amt=+t.amt||0;});
  return d;
}
function parseData(raw){try{var d=JSON.parse(raw);return (d&&Array.isArray(d.tx))?d:null;}catch(e){return null;}}
/* tarayıcı deposu ve Android yerel kopyası: hangisi daha yeniyse o kullanılır */
function load(){
  var loc=null,nat=null;
  try{loc=parseData(localStorage.getItem(KEY));}catch(e){}
  if(nb('loadData')){try{nat=parseData(NB.loadData());}catch(e){}}
  var pick=loc;
  if(nat&&(!loc||(+nat.savedAt||0)>(+loc.savedAt||0)))pick=nat;
  if(pick){if(pick===nat){try{localStorage.setItem(KEY,JSON.stringify(nat));}catch(e){}}return norm(pick);}
  return norm(seed());
}
var S=load();
var TXV=0,storeWarned=false,planT=null,bkT=null;
function save(){
  TXV++;S.savedAt=Date.now();
  try{stampFx();}catch(e){}
  var j;try{j=JSON.stringify(S);}catch(e){return;}
  var ok=true;try{localStorage.setItem(KEY,j);}catch(e){ok=false;}
  if(nb('saveData')){try{if(NB.saveData(j)==='ok')ok=true;}catch(e){}}
  if(!ok&&!storeWarned){storeWarned=true;setTimeout(function(){toast('Veriler kaydedilemedi: cihaz deposu dolu olabilir. Yedek al.');},0);}
  clearTimeout(planT);planT=setTimeout(pushPlan,700);
  clearTimeout(bkT);bkT=setTimeout(function(){if(S.autoBk&&!hasSample()&&(S.savedAt||0)>(S.bkTs||0))autoBackup();},20000);
}
var hostTheme=document.documentElement.getAttribute('data-theme');
function applyTheme(){var r=document.documentElement,t=S.theme;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else if(hostTheme)r.setAttribute('data-theme',hostTheme);else r.removeAttribute('data-theme');}
function EXPC(){return S.cats.exp;} function INCC(){return S.cats.inc;} function ACCS(){return S.accounts;}
function ensureCat(type,name){var l=S.cats[type];if(l.indexOf(name)<0)l.push(name);return name;}

/* ---------- dönem (maaş günü) ---------- */
function dimYM(y,m){return new Date(y,m,0).getDate();}
function pStartDay(y,m){return Math.min(S.payday||1,dimYM(y,m));}
function pk(ds){var p=String(ds).split('-'),y=+p[0],m=+p[1],d=+p[2];if(d<pStartDay(y,m)){m--;if(m<1){m=12;y--;}}return y+'-'+pad(m);}
function pStart(k){var p=k.split('-');return k+'-'+pad(pStartDay(+p[0],+p[1]));}
function pEnd(k){var s=pdate(pStart(addMonth(k,1)));s.setDate(s.getDate()-1);return isoDate(s);}
function curP(){return pk(todayS());}
function plabel(k){return (S.payday>1)?mlabel(k)+' dönemi':mlabel(k);}
function prange(k){var f=function(d){return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});};return f(pdate(pStart(k)))+' – '+f(pdate(pEnd(k)));}
function dueDate(r,k){var p=k.split('-'),y=+p[0],m=+p[1],pd=pStartDay(y,m),day=r.day;if(pd>1&&day<pd){m++;if(m>12){m=1;y++;}}var r2=y+'-'+pad(m)+'-'+pad(Math.min(day,dimYM(y,m))),e=pEnd(k),st=pStart(k);return r2>e?e:(r2<st?st:r2);}
function daysLeft(k){return daysBetween(todayS(),pEnd(k))+1;}
function pDays(k){return daysBetween(pStart(k),pEnd(k))+1;}

var ui={tab:'cuzdan',sub:'islem',plan:'butce',nwr:6,trPick:null,wk:null,alAll:false,qaOrd:null,month:curP(),filter:'all',acctF:'',calc:'kredi',cv:{},nq:'',sq:'',tq:'',nv:'act',tr:6,page:null,locked:!!S.pin,pinBuf:'',fails:0,lockUntil:0,forgot:false,hiddenAt:0};

/* ---------- hesap ---------- */
var MC={v:-1};
/* dönem → işlemler dizini; her çizimde ve kayıtta yenilenir */
function monthTx(k){
  if(MC.v!==TXV||MC.p!==S.payday||MC.s!==S.tx||MC.n!==S.tx.length){MC={v:TXV,p:S.payday,s:S.tx,n:S.tx.length,m:{}};S.tx.forEach(function(t){var q=pk(t.date);(MC.m[q]||(MC.m[q]=[])).push(t);});}
  return MC.m[k]||[];
}
function r2(n){n=+n||0;return (n<0?-1:1)*Math.round(Math.abs(n)*100+1e-7)/100;}
function ax(a){return (S.accx&&S.accx[a])||{};}
function ccyOf(a){var c=ax(a).ccy;return CCYS.indexOf(c)>0?c:'TRY';}
function rateOf(c){return (!c||c==='TRY')?1:(+(S.fx&&S.fx[c])||0);}
function toTL(v,a){return v*rateOf(ccyOf(a));}
function fromTL(v,a){var r=rateOf(ccyOf(a));return r>0?v/r:0;}
var ATYPES=[['nakit','Nakit (cüzdan)'],['banka','Banka hesabı'],['kart','Kredi kartı'],['birikim','Birikim hesabı'],['diger','Diğer']];
function acctType(a){var t=ax(a).type;if(ATYPES.some(function(x){return x[0]===t;}))return t;var n=String(a).toLocaleLowerCase('tr-TR');return /kart/.test(n)?'kart':(/nakit|cüzdan/.test(n)?'nakit':(/birikim|tasarruf|vadeli/.test(n)?'birikim':'banka'));}
function typeName(t){var x=ATYPES.filter(function(y){return y[0]===t;})[0];return x?x[1]:'Diğer';}
function moneyIn(v,a,z){var c=ccyOf(a);if(c==='TRY')return (z?TRY0:TRY2).format(v);if(maskOn)return MASK+' '+CSYM[c];v=clean(v,1);return (v<0?'−':'')+(c==='XAU'?NUM2.format(Math.abs(v))+' gr':CSYM[c]+(c==='CHF'?' ':'')+NUM2.format(Math.abs(v)));}
/* görüntüleme para birimi: net servet, analiz ve FIRE güncel kurla bu birimde gösterilir */
function dccy(){var c=S.dccy;return (c&&c!=='TRY'&&rateOf(c)>0)?c:'TRY';}
var DC0={format:function(tl){var c=dccy();return fmtC(tl/rateOf(c),c,0);}};
var DC2={format:function(tl){var c=dccy();return fmtC(tl/rateOf(c),c,1);}};
function sgnD(n){return Math.abs(n)<0.5?DC0.format(0):(n<0?'−':'+')+DC0.format(Math.abs(n));}
/* işlemin TL karşılığı: dövizli işlemde kayıt günündeki kur kullanılır (raporlar geçmişe dönük değişmez) */
function txTL(t){var c=ccyOf(t.acct);if(c==='TRY')return t.amt;var f=+t.fx;return t.amt*(f>0?f:rateOf(c));}
function stampFx(){S.tx.forEach(function(t){if(!(+t.fx>0)){var c=ccyOf(t.acct);if(c!=='TRY'&&rateOf(c)>0)t.fx=rateOf(c);}});}
function sum(list,type){var s=0;for(var i=0;i<list.length;i++){var t=list[i];if(t.type===type)s+=txTL(t);}return r2(s);}
function sumMv(list,type,side){var s=0;list.forEach(function(t){if(t.type===type&&t.side===side)s+=txTL(t);});return r2(s);}
function spentByCat(k){var o={};monthTx(k).forEach(function(t){if(t.type==='exp')o[t.cat]=(o[t.cat]||0)+txTL(t);});Object.keys(o).forEach(function(c){o[c]=r2(o[c]);});return o;}
/* bir işlemin hesap bakiyesine etkisi (hesabın kendi para biriminde) */
function txDelta(t,a){
  if(t.type==='trf'){var d=0;if(t.acct===a)d-=t.amt;if(t.to===a)d+=(t.amt2>0?t.amt2:t.amt);return d;}
  if(t.acct!==a)return 0;
  switch(t.type){
    case 'inc':return t.amt; case 'exp':return -t.amt;
    case 'inv':return t.side==='sell'?t.amt:-t.amt;
    case 'dbt':return t.side==='in'?t.amt:-t.amt;
    case 'adj':return t.amt;
  }
  return 0;
}
function acctBal(a){var b=+S.opening[a]||0;for(var i=0;i<S.tx.length;i++)b+=txDelta(S.tx[i],a);return r2(b);}
function accTotal(){return r2(ACCS().reduce(function(a,x){return a+toTL(acctBal(x),x);},0));}
function acctUsed(a){return S.tx.some(function(t){return t.acct===a||t.to===a;})||S.recurring.some(function(r){return r.acct===a;})||S.goals.some(function(g){return g.acct===a;});}
function hKind(h){return h.kind==='asset'?'asset':'inv';}
function hPrice(h){var r=h.ccy&&S.fx&&+S.fx[h.ccy];return r>0?r:(+h.price||0);}
function hVal(h){return r2(h.qty*hPrice(h));} function hCost(h){return r2(h.qty*h.cost);}
function pfTotals(kind){var v=0,c=0;S.holdings.forEach(function(h){if(kind&&hKind(h)!==kind)return;v+=hVal(h);c+=hCost(h);});return {v:r2(v),c:r2(c)};}
function hasSample(){return S.tx.some(function(t){return t.sample;})||S.holdings.some(function(h){return h.sample;})||S.notes.some(function(n){return n.sample;})||S.goals.some(function(n){return n.sample;})||S.recurring.some(function(n){return n.sample;})||S.debts.some(function(n){return n.sample;})||!!S.sampleExtras;}
/* borcun kalan tutarı: girilen tutar − bağlı ödemeler (anında güncellenir) */
function debtPaid(d){var p=0;S.tx.forEach(function(t){if(t.type==='dbt'&&t.side==='out'&&t.debt===d.id)p+=txTL(t);});return r2(p);}
function debtLeft(d){return r2(Math.max((+d.amt||0)-debtPaid(d),0));}
function debtManual(){return r2(S.debts.reduce(function(a,d){return a+debtLeft(d);},0));}
function goalSaved(g){if(g.acct&&ACCS().indexOf(g.acct)>=0)return r2(Math.max(toTL(acctBal(g.acct),g.acct),0));return +g.saved||0;}
function snap(){if(hasSample())return;var k=todayS(),n=r2(wealth().net);if(S.hist[k]===n)return;S.hist[k]=n;var ks=Object.keys(S.hist).sort();while(ks.length>1100)delete S.hist[ks.shift()];save();}
function wealth(){
  /* kutucuklar türe göre işaretli toplamdır; eksi bakiyeler (kart, KMH) borç dağılımında da görünür */
  var g={nakit:0,banka:0,birikim:0,inv:0,asset:0,cardDebt:0,debts:0,neg:0},items=[],debts=[],by={};
  ACCS().forEach(function(a){var b=r2(toTL(acctBal(a),a)),t=acctType(a);
    if(t==='kart'){if(b<0){g.cardDebt+=-b;debts.push([a,-b]);}else{g.banka+=b;if(b>0)items.push([a,b]);}return;}
    if(t==='nakit')g.nakit+=b;else if(t==='birikim')g.birikim+=b;else g.banka+=b;
    if(b>0)items.push([a,b]);else if(b<0){g.neg+=-b;debts.push([a,-b]);}});
  S.holdings.forEach(function(x){var v=hVal(x);if(v>0){if(hKind(x)==='asset')g.asset+=v;else g.inv+=v;by[x.type]=(by[x.type]||0)+v;}});
  Object.keys(by).forEach(function(k){items.push([k,by[k]]);});
  S.debts.forEach(function(d){var l=debtLeft(d);if(l>0){g.debts+=l;debts.push([d.name,l]);}});
  Object.keys(g).forEach(function(k){g[k]=r2(g[k]);});
  var A=r2(g.nakit+g.banka+g.birikim+g.neg+g.inv+g.asset),D=r2(g.cardDebt+g.debts+g.neg);
  g.liquid=r2(g.nakit+g.banka+g.birikim);
  return {items:items,debts:debts,assets:A,debt:D,net:r2(A-D),g:g};
}
function recPaid(r,k){var id=r.paid&&r.paid[k];return !!id&&S.tx.some(function(t){return t.id===id;});}
/* bir tarihteki net servet: hesaplar o güne kadarki hareketlerden, yatırımlar bugünkü değerinden, borçlar o güne kadarki ödemelerden */
function nwAt(D){
  var tot=0,firstBuy={},inD={};
  ACCS().forEach(function(a){var b=+S.opening[a]||0;S.tx.forEach(function(t){if(t.date<=D)b+=txDelta(t,a);});tot+=toTL(b,a);});
  S.tx.forEach(function(t){if(t.type==='inv'&&t.side==='buy'&&t.hold&&(!firstBuy[t.hold]||t.date<firstBuy[t.hold]))firstBuy[t.hold]=t.date;if(t.type==='dbt'&&t.side==='in'&&t.debt&&(!inD[t.debt]||t.date<inD[t.debt]))inD[t.debt]=t.date;});
  S.holdings.forEach(function(h){if(!(firstBuy[h.id]&&firstBuy[h.id]>D))tot+=hVal(h);});
  S.debts.forEach(function(d){if(inD[d.id]&&inD[d.id]>D)return;var paid=0;S.tx.forEach(function(t){if(t.type==='dbt'&&t.side==='out'&&t.debt===d.id&&t.date<=D)paid+=txTL(t);});tot-=Math.max((+d.amt||0)-paid,0);});
  return r2(tot);
}
/* net servet serisi: günlük kayıtlar + ilk işlemden bu yana ay sonları (işlemlerden hesaplanır) + bugün */
var NWC={k:''};
function nwSeries(){
  var key=S.savedAt+'|'+S.fxTs+'|'+todayS()+'|'+S.tx.length;if(NWC.k===key)return NWC.v;
  var pts={},today=todayS();
  Object.keys(S.hist).forEach(function(k){if(k<=today)pts[k]={v:S.hist[k],e:false};});
  if(S.tx.length){var first=S.tx.reduce(function(m,t){return t.date<m?t.date:m;},'9999');
    if(first<today){var d0=pdate(first);d0.setDate(d0.getDate()-1);var ends=[isoDate(d0)],m=first.slice(0,7),em=today.slice(0,7),guard=0;
      while(m<em&&guard++<240){ends.push(isoDate(new Date(+m.slice(0,4),+m.slice(5,7),0)));m=addMonth(m,1);}
      ends.forEach(function(e){if(!pts[e]&&e<today)pts[e]={v:nwAt(e),e:true};});}}
  pts[today]={v:r2(wealth().net),e:false};
  var v=Object.keys(pts).sort().map(function(k){return [k,pts[k].v,pts[k].e];});
  NWC={k:key,v:v};return v;
}
function histChange(days){
  var s=nwSeries();if(s.length<2)return null;
  var last=s[s.length-1],from=pdate(last[0]);from.setDate(from.getDate()-days);var fk=isoDate(from),base=null;
  for(var i=s.length-2;i>=0;i--){if(s[i][0]<=fk){base=s[i];break;}}
  if(!base)base=s[0];if(base===last)return null;
  var a=base[1],b=last[1];return {d:r2(b-a),p:Math.abs(a)>0.5?(b-a)/Math.abs(a)*100:null,days:daysBetween(base[0],last[0])};
}

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
function fireTargetTL(){var f=S.fire,t=+f.target;return t>0?t*rateOf(f.tccy||'TRY'):0;}
function fireModel(){
  var f=S.fire,autoE=avgMonthly('exp'),autoS=avgSave();
  var exp=(+f.exp>0)?+f.exp:autoE;
  var sv=(f.save!==''&&f.save!=null)?+f.save:Math.max(autoS,0);
  var assets=(f.acc?accTotal()-debtManual():0)+(f.pf?pfTotals('inv').v:0)+(f.ast?pfTotals('asset').v:0)+(+f.extra||0);
  var wr=Math.max(+f.wr,0.1)/100,rm=Math.pow(1+(+f.ret)/100,1/12)-1,custom=fireTargetTL();
  var o={ok:exp>0||custom>0,exp:exp,autoE:autoE,autoS:autoS,sv:sv,assets:assets,wr:wr,rm:rm,custom:custom>0,noRate:+f.target>0&&!(custom>0)};
  if(!o.ok)return o;
  o.target=custom>0?custom:exp*12/wr;o.auto=exp>0?exp*12/wr:0;
  o.n=monthsToFI(Math.max(assets,0),sv,rm,o.target);
  o.prog=clamp(Math.max(assets,0)/o.target*100,0,100);
  o.passive=Math.max(assets,0)*wr/12;
  return o;
}
function fmtYears(n){
  if(n<=0)return 'Hedefe ulaştın';
  if(!isFinite(n)||n>1200)return '100 yıldan fazla';
  var y=Math.floor(n/12),mo=Math.ceil(n-y*12);if(mo===12){y++;mo=0;}
  return ((y?y+' yıl ':'')+(mo?mo+' ay':'')).trim()||'1 ay';
}
function fireDate(n){if(!isFinite(n)||n>1200||n<=0)return '';var d=new Date();d.setMonth(d.getMonth()+Math.ceil(n));return d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'});}

/* ---------- ortak parçalar ---------- */
function needSetup(){if(hasSample()||S.setupHide)return false;var any=ACCS().some(function(a){return (+S.opening[a]||0)!==0;});return !any&&!S.holdings.length&&!S.tx.length;}
ACT['setup-hide']=function(){S.setupHide=true;save();render();};
function bannerHtml(){
  if(needSetup())return '<div class="banner col"><span>Başlamak için hesaplarındaki mevcut parayı gir; böylece bakiyelerin doğru görünür.</span><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn small" data-act="sub" data-v="hesap">Hesaplarım</button><button class="btn small ghost" data-act="sample-load">Örnekle dene</button><button class="btn small ghost" data-act="setup-hide">Sonra</button></span></div>';
  return hasSample()?'<div class="banner"><span>Örnek veriler gösteriliyor.</span><button class="btn small ghost" data-act="sample-clear">Örnekleri sil</button></div>':'';
}
/* yaklaşan ödemeler: düzenli ödemeler ve kredi kartı son ödeme günleri */
function cardDue(a,from){var due=+ax(a).due;if(!(due>0))return null;var y=from.getFullYear(),m=from.getMonth();
  var dt=new Date(y,m,Math.min(due,dimYM(y,m+1)));if(dt<from)dt=new Date(y,m+1,Math.min(due,dimYM(y,m+2)));return isoDate(dt);}
function upcoming(days){
  var out=[],t0=today0(),end=new Date(t0);end.setDate(end.getDate()+days);var e=isoDate(end),s=isoDate(t0),cur=curP(),seen={};
  for(var i=0;i<3;i++){var k=addMonth(cur,i);S.recurring.forEach(function(r){if(recPaid(r,k))return;var d=dueDate(r,k);if(d>e||(i>0&&d<s))return;var key=r.id+d;if(seen[key])return;seen[key]=1;
    out.push({date:d,name:r.name,amt:r.amt,acct:r.acct,kind:'rec',id:r.id,per:k});});}
  ACCS().forEach(function(a){if(acctType(a)!=='kart')return;var b=acctBal(a);if(!(b<0))return;var d=cardDue(a,t0);if(d&&d<=e)out.push({date:d,name:a+' son ödeme',amt:-b,acct:a,kind:'card'});});
  return out.sort(function(x,y){return x.date.localeCompare(y.date);});
}
function alertItems(){
  var A=S.alerts,items=[],cur=curP();
  if(A.budget){var sp=spentByCat(cur);EXPC().forEach(function(c){var lim=+S.budgets[c];if(lim>0){var s=sp[c]||0,r=s/lim*100;
    if(r>=100)items.push(['exp',c+' bütçesi aşıldı, '+TRY0.format(s-lim)+' fazla']);
    else if(r>=A.thr)items.push(['warn',c+': bütçenin %'+Math.round(r)+' kullanıldı']);}});}
  if(A.rec){var t0=todayS();upcoming(+A.days||0).forEach(function(u){var diff=daysBetween(t0,u.date);
    items.push([diff<0?'exp':'warn',u.name+' '+(diff<0?(-diff)+' gün gecikti':(diff===0?'bugün':diff+' gün sonra'))+' · '+moneyIn(u.amt,u.acct,1)]);});}
  return items;
}
function alertsHtml(){
  var items=alertItems();
  if(!items.length)return '';
  var n=ui.alAll?items.length:3;
  return '<div class="card alerts"><h2>Uyarılar</h2><div class="list">'+items.slice(0,n).map(function(x){return '<div class="item"><span class="dot" style="background:var(--'+x[0]+')"></span><span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span></div>';}).join('')+'</div>'+(items.length>3?'<button class="linkbtn" data-act="al-all">'+(ui.alAll?'Daha az göster':(items.length-3)+' uyarı daha')+'</button>':'')+'</div>';
}
function monthNav(flat){return '<div class="mnav'+(flat?' flat':'')+'"><button class="icon-btn" data-act="mprev" aria-label="Önceki dönem">'+ic('l')+'</button><span style="text-align:center">'+esc(plabel(ui.month))+(S.payday>1?'<div class="small muted" style="font-weight:500">'+esc(prange(ui.month))+'</div>':'')+'</span><button class="icon-btn" data-act="mnext" aria-label="Sonraki dönem">'+ic('r')+'</button></div>';}
function mvLabel(t){
  if(t.type==='inv'){var h=byId(S.holdings,t.hold),n=h?h.name:t.hname;return (t.side==='sell'?'Yatırım satışı':'Yatırım alımı')+(n?' · '+n:'');}
  if(t.type==='dbt'){var d=byId(S.debts,t.debt),m=d?d.name:t.dname;return (t.side==='in'?'Borç alındı':'Borç ödemesi')+(m?' · '+m:'');}
  if(t.type==='adj')return 'Bakiye düzeltmesi';
  return t.cat||'';
}
function txRow(t){
  if(t.type==='trf')return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--ink2)"></span><span class="mid"><div class="t">'+(t.note?esc(t.note):'Transfer')+'</div><div class="small muted ell">'+(t.note?'Transfer · ':'')+esc(t.acct)+' → '+esc(t.to)+'</div></span><span class="amt"><span class="num">'+moneyIn(t.amt,t.acct)+'</span>'+(t.amt2>0?'<span class="small muted num">→ '+moneyIn(t.amt2,t.to)+'</span>':'')+'</span></button>';
  if(t.type==='inv'||t.type==='dbt'||t.type==='adj'){var lb=mvLabel(t),up=txDelta(t,t.acct)>0;
    return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--'+(t.type==='dbt'?'warn':(t.type==='inv'?'blue':'ink2'))+')"></span><span class="mid"><div class="t">'+esc(t.note||lb)+'</div><div class="small muted ell">'+esc((t.note?lb+' · ':'')+t.acct)+'</div></span><span class="num'+(up?' inc':'')+'">'+(up?'+':'−')+moneyIn(Math.abs(t.amt),t.acct)+'</span></button>';}
  var inc=t.type==='inc';
  return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:'+color(t.cat)+'"></span><span class="mid"><div class="t">'+esc(t.note||t.cat)+'</div><div class="small muted ell">'+(t.note?esc(t.cat)+' · ':'')+esc(t.acct)+'</div></span><span class="num '+(inc?'inc':'exp')+'">'+(inc?'+':'−')+moneyIn(t.amt,t.acct)+'</span></button>';
}
function fireCard(){
  var m=fireModel();
  if(!m.ok)return '<button class="card firecard" data-act="open-fire"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">Finansal özgürlük (FIRE)</div><div class="small muted">Hedefini belirle ya da aylık harcamanı gir.</div></span>'+ic('r')+'</button>';
  return '<button class="card firecard stack" data-act="open-fire" style="gap:10px"><span style="display:flex;align-items:center;gap:12px"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">Finansal özgürlük (FIRE)</div><div class="small muted">'+(m.custom?'Kendi belirlediğin hedef':'Harcamana göre hesaplanan hedef')+'</div></span>'+ic('r')+'</span>'
   +'<span style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap"><span class="num" style="font-size:1.75rem;font-weight:700">%'+NUM2.format(m.prog)+'</span><span class="small muted num">'+DC0.format(Math.max(m.assets,0))+' / '+DC0.format(m.target)+'</span></span>'
   +'<span class="bar"><i style="width:'+m.prog+'%"></i></span>'
   +'<span class="small muted">'+(m.n<=0?'Hedefe ulaştın':'Tahmini süre: <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</span></button>';
}
function dailyLine(rem){if(ui.month!==curP()||rem<=0)return '';var left=daysLeft(ui.month);return '<div class="small" style="margin-top:8px"><b>Günde ~'+TRY0.format(rem/left)+'</b> harcayabilirsin ('+left+' gün kaldı)</div>';}
function dcol(i){return 'hsl('+((i*67+155)%360)+' 52% 55%)';}
function donut(items,emptyMsg,act){
  var tot=items.reduce(function(a,x){return a+x[1];},0);
  if(!(tot>0))return '<div class="small muted" style="padding:10px 0">'+emptyMsg+'</div>';
  items=items.slice().sort(function(a,b){return b[1]-a[1];});
  var agg=false;if(items.length>5){var rest=items.slice(4).reduce(function(a,x){return a+x[1];},0);items=items.slice(0,4).concat([['Diğer',rest]]);agg=true;}
  var off=25,c='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--soft)" stroke-width="6"></circle>';
  items.forEach(function(x,i){var p=x[1]/tot*100;c+='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="'+dcol(i)+'" stroke-width="6" stroke-dasharray="'+p.toFixed(3)+' '+(100-p).toFixed(3)+'" stroke-dashoffset="'+off.toFixed(3)+'"></circle>';off-=p;});
  return '<div class="dwrap"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Dağılım grafiği">'+c+'</svg><div class="lgs">'+items.map(function(x,i){return (act&&!(agg&&i===items.length-1)?'<button class="lg" data-act="'+act+'" data-v="'+esc(x[0])+'">':'<div class="lg">')+'<span class="dot" style="background:'+dcol(i)+'"></span><span class="mid ell">'+esc(x[0])+'</span><span class="num">'+(x[1]/tot<0.01?'&lt;%1':'%'+Math.round(x[1]/tot*100))+'</span>'+(act&&!(agg&&i===items.length-1)?'</button>':'</div>');}).join('')+'</div></div>';
}
function ccySel(id,val){return '<span class="ccy"><select id="'+id+'" aria-label="Para birimi">'+CCYS.map(function(c){return '<option value="'+c+'"'+(c===val?' selected':'')+'>'+CCYS_SHORT[c]+'</option>';}).join('')+'</select>'+ic('down')+'</span>';}

/* ---------- ana ekran: net servet kartı ---------- */
function histSpark(){
  var s=nwSeries();if(s.length<2)return '';
  var from=pdate(s[s.length-1][0]);from.setDate(from.getDate()-89);var fk=isoDate(from),r=s.filter(function(x){return x[0]>=fk;});if(r.length<3)r=s.slice(-7);
  if(r.length<2)return '';
  var v=r.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=40;
  var t0=pdate(r[0][0]).getTime(),span=(pdate(r[r.length-1][0]).getTime()-t0)||1;
  var pts=r.map(function(x,i){return ((pdate(x[0]).getTime()-t0)/span*W).toFixed(1)+','+(H-3-(v[i]-mn)/rg*(H-6)).toFixed(1);}).join(' ');
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Net servet grafiği"><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
}
/* dar kutucuklar için kısaltılmış tutar: 1,25 Mn */
function compactD(tl){var c=dccy(),v=tl/rateOf(c);if(maskOn||Math.abs(v)<1e6)return DC0.format(tl);var u=Math.abs(v)>=1e9?[1e9,' Mr']:[1e6,' Mn'],n=(v<0?'−':'')+NUM2.format(Math.abs(v)/u[0])+u[1];return c==='XAU'?n+' gr':CSYM[c]+(c==='CHF'?' ':'')+n;}
function compactT(tl){if(maskOn||Math.abs(tl)<1e6)return TRY0.format(tl);return (tl<0?'−':'')+'₺'+NUM2.format(Math.abs(tl)/1e6)+' Mn';}
function nwCard(W){
  var g=W.g,ch=histChange(30),cur=curP(),mt=monthTx(cur),inc=sum(mt,'inc'),exp=sum(mt,'exp'),ae=avgMonthly('exp');
  var h='<div class="card hero nw"><div class="nwtop"><span class="lbl">Net servetim</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button>'+ccySel('dccy',S.dccy)+'</span></div>';
  h+='<p class="big">'+DC0.format(W.net)+'</p>';
  if(S.dccy!=='TRY'&&dccy()==='TRY')h+='<div class="small exp">'+esc(CCYN[S.dccy])+' kuru henüz yok; TL gösteriliyor. Üstteki yenile düğmesine dokun.</div>';
  else if(dccy()!=='TRY')h+='<div class="small muted">1 '+(dccy()==='XAU'?'gr altın':esc(dccy()))+' = '+TRY2.format(rateOf(dccy()))+' · '+TRY0.format(W.net)+'</div>';
  if(ch&&!maskOn)h+='<div class="small"><b class="num '+(ch.d>=0?'inc':'exp')+'">'+sgnD(ch.d)+(ch.p!=null?' ('+(ch.p>=0?'+':'−')+'%'+NUM1.format(Math.abs(ch.p))+')':'')+'</b> <span class="muted">son '+ch.days+' günde</span></div>';
  var tiles=[['Nakit',g.nakit,'qa-cash'],['Banka',g.banka,'qa-bank'],['Birikim',g.birikim,'qa-save'],['Yatırım',g.inv,'qa-inv-view'],['Varlık',g.asset,'qa-asset-view'],['Borç',r2(g.cardDebt+g.debts),'qa-debt',1]];
  h+='<div class="nwgrid">'+tiles.map(function(x){return '<button class="nwt" data-act="'+x[2]+'" aria-label="'+x[0]+': '+DC0.format(x[1])+'"><span class="lbl">'+x[0]+'</span><span class="num'+((x[3]&&x[1]>0.5)||x[1]<-0.5?' exp':'')+'">'+compactD(x[1])+'</span></button>';}).join('')+'</div>';
  var rate=inc>0?(inc-exp)/inc*100:null,em=ae>0?Math.max(g.liquid,0)/ae:null;
  h+='<div class="lbl nwfh">'+esc(plabel(cur))+'</div><div class="nwflow"><div><span class="lbl">Gelir</span><span class="num inc">'+compactD(inc)+'</span></div><div><span class="lbl">Gider</span><span class="num exp">'+compactD(exp)+'</span></div><div><span class="lbl">Tasarruf</span><span class="num">'+(rate==null?'—':(rate<0?'−':'')+'%'+Math.round(Math.abs(rate)))+'</span></div></div>';
  h+='<div class="nwchips">'+(em!=null?'<span class="pill">Acil fon: '+NUM1.format(em)+' ay</span>':'')+(W.assets>0?'<span class="pill">Borç/varlık: %'+Math.round(W.debt/W.assets*100)+'</span>':'')+'<button class="pill linkp" data-act="sub" data-v="analiz">Analiz ›</button></div>';
  return h+histSpark()+'</div>';
}
/* sık kullanılan daireler öne gelir; sıra yalnızca uygulama açılışında değişir */
function qaOrder(){if(!ui.qaOrd){var u=S.qaUse||{},tot=Object.keys(u).reduce(function(a,k){return a+(+u[k]||0);},0);ui.qaOrd=tot<8?QA.slice():QA.map(function(q,i){return [q,i];}).sort(function(a,b){return ((+u[b[0][0]]||0)-(+u[a[0][0]]||0))||a[1]-b[1];}).map(function(x){return x[0];});}return ui.qaOrd;}
function qaRow(){return '<div class="qawrap" id="qawrap"><div class="qa" id="qa" role="toolbar" aria-label="Hızlı işlemler">'+qaOrder().map(function(q){return '<button data-act="'+q[0]+'"><span class="c" style="--c:'+q[3]+'">'+ic(q[2])+'</span><span class="t">'+q[1]+'</span></button>';}).join('')+'</div></div>';}
function periodHead(withSum){
  if(!withSum)return monthNav();
  var mt=monthTx(ui.month),inc=sum(mt,'inc'),exp=sum(mt,'exp'),net=inc-exp,cmp='';
  var isCur=ui.month===curP(),prev=addMonth(ui.month,-1),el=isCur?daysBetween(pStart(ui.month),todayS()):9999;
  var pe=monthTx(prev).filter(function(t){return t.type==='exp'&&daysBetween(pStart(prev),t.date)<=el;}).reduce(function(x,t){return x+txTL(t);},0);
  if(pe>0&&exp>0){var df=(exp-pe)/pe*100;cmp='<p class="small muted" style="margin:10px 0 0">'+(isCur?'Geçen dönemin aynı gününe göre':'Geçen döneme göre')+' giderlerin %'+Math.round(Math.abs(df))+(df>=0?' fazla.':' az.')+'</p>';}
  return '<div class="card period">'+monthNav(true)+'<div class="row3" style="margin-top:6px"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+(net<=-0.5?'−':'+')+compactT(Math.abs(net))+'</span></div></div>'+cmp+'</div>';
}
function vMain(){
  var h=bannerHtml(),W=wealth();
  if(S.name)h+='<p class="small muted" style="margin:0 2px">Merhaba, <b>'+esc(S.name)+'</b></p>';
  h+=nwCard(W)+qaRow()+alertsHtml();
  var cur=SECS.some(function(x){return x[0]===ui.sub;})?ui.sub:'islem';
  h+=smsBanner();
  h+='<div id="secanchor"></div><nav class="secbar tabs6" id="secwrap" aria-label="Bölümler"><div class="secin" id="secbar" role="tablist">'+SECS.map(function(x){return '<button class="tab6" role="tab" data-act="sub" data-v="'+x[0]+'" aria-pressed="'+(cur===x[0])+'" aria-selected="'+(cur===x[0])+'">'+ic(x[2])+'<span>'+x[1]+'</span></button>';}).join('')+'</div></nav>';
  var body={islem:function(){return periodHead(true)+txBody();},hesap:hesapBody,analiz:analizBody,plan:planBody,portfoy:vPortfoy,notlar:vNotlar}[cur];
  return h+'<section id="secbody" class="stack">'+body()+'</section>';
}

/* ---------- İşlemler ---------- */
function txMatch(t,q){
  var h=fold(String(t.note||'')+' '+(t.cat||'')+' '+(t.acct||'')+' '+(t.to||'')+' '+mvLabel(t));
  var amt=String(t.amt).replace('.',','),amt2=String(t.amt);
  var parts=q.split(/\s+/).filter(Boolean);
  return parts.every(function(w){return h.indexOf(w)>=0||amt.indexOf(w.replace('.',','))>=0||amt2.indexOf(w)>=0;});
}
function txFilt(t){if(ui.acctF&&t.acct!==ui.acctF&&t.to!==ui.acctF)return false;if(ui.filter==='all')return true;if(ui.filter==='mv')return t.type==='inv'||t.type==='dbt'||t.type==='adj';return t.type===ui.filter;}
function txList(){
  var q=fold((ui.tq||'').trim());
  var mt=(q?S.tx.filter(function(t){return txFilt(t)&&txMatch(t,q);}):monthTx(ui.month).filter(txFilt)).sort(function(a,b){return b.date.localeCompare(a.date)||(b.id>a.id?1:-1);});
  if(!mt.length)return q?'<div class="empty">“'+esc(ui.tq.trim())+'” için işlem bulunamadı.</div>':'<div class="empty">'+(ui.acctF?esc(ui.acctF)+' hesabında bu dönemde hareket yok.':'Bu dönemde işlem yok. Yukarıdaki Gelir ve Gider düğmeleriyle ya da sağ alttaki + ile ekle.')+'</div>';
  var more=0;if(q&&mt.length>200){more=mt.length-200;mt=mt.slice(0,200);}
  var cur='',out=(q?'<div class="small muted" style="margin:0 2px 6px">'+mt.length+(more?'+':'')+' sonuç · tüm dönemler</div>':'')+'<div class="card" style="padding-top:2px">';
  mt.forEach(function(t){if(t.date!==cur){cur=t.date;out+='<div class="day">'+esc(pdate(t.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:q?'numeric':undefined,weekday:'long'}))+'</div>';}out+='<div class="list">'+txRow(t)+'</div>';});
  return out+'</div>';
}
function txBody(){
  return '<div class="search">'+ic('search')+'<input id="tq" type="search" placeholder="İşlemlerde ara: not, kategori, tutar" aria-label="İşlemlerde ara" value="'+esc(ui.tq||'')+'"></div>'
   +'<div class="chips">'+(ui.acctF?'<button class="chip rm" data-act="acct-clear" aria-pressed="true">'+esc(ui.acctF)+'</button>':'')+[['all','Tümü'],['inc','Gelir'],['exp','Gider'],['trf','Transfer'],['mv','Borç ve yatırım']].map(function(f){return '<button class="chip" data-act="filter" data-v="'+f[0]+'" aria-pressed="'+(ui.filter===f[0])+'">'+f[1]+'</button>';}).join('')+'</div>'
   +'<div id="txlist" class="stack">'+txList()+'</div>';
}

/* ---------- Hesaplar (cüzdan ve banka) ---------- */
var AGROUPS=[['nakit','Cüzdanım','cash','var(--warn)'],['banka','Banka hesapları','bank','var(--blue)'],['kart','Kredi kartları','card','var(--exp)'],['birikim','Birikim hesapları','coins','var(--inc)'],['diger','Diğer hesaplar','wallet','var(--ink2)']];
function acctLine(a){
  var b=acctBal(a),c=ccyOf(a),t=acctType(a),x=ax(a),sub=[];
  if(c!=='TRY')sub.push(CCYN[c]+(rateOf(c)>0?' · ≈ '+TRY0.format(toTL(b,a)):''));
  if(t==='kart'){if(+x.limit>0)sub.push('Kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)sub.push('Son ödeme: ayın '+x.due+'’i');}
  return '<button class="item" data-act="acct-open" data-id="'+esc(a)+'"><span class="dot" style="background:'+color(a)+'"></span><span class="mid"><div class="t">'+esc(a)+'</div>'+(sub.length?'<div class="small muted">'+esc(sub.join(' · '))+'</div>':'')+'</span><span class="num'+(b<0?' exp':'')+'">'+moneyIn(b,a)+'</span></button>';
}
function hesapBody(){
  var tot=accTotal();
  var h='<div class="card"><div class="lbl">Hesaplardaki toplam para</div><p class="big">'+TRY0.format(tot)+'</p><div class="small muted">Nakit, banka ve birikim hesapları; kredi kartı borçları düşülmüş.</div></div>';
  h+='<div class="two"><button class="btn" data-act="new-a">Hesap ekle</button><button class="btn ghost" data-act="qa-trf">Transfer</button></div>';
  AGROUPS.forEach(function(gp){var l=ACCS().filter(function(a){var t=acctType(a);return gp[0]==='banka'?t==='banka':t===gp[0];});if(!l.length&&gp[0]!=='nakit'&&gp[0]!=='banka')return;
    var s=r2(l.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
    h+='<div class="card" style="padding-top:12px"><div class="ghead"><span class="sic sm" style="--c:'+gp[3]+'">'+ic(gp[2])+'</span><h2 style="margin:0;flex:1">'+gp[1]+'</h2><span class="num'+(s<0?' exp':'')+'">'+TRY0.format(s)+'</span></div>'
      +(l.length?'<div class="list">'+l.map(acctLine).join('')+'</div>':'<div class="small muted" style="padding:8px 0">Henüz yok.</div>')
      +'<button class="linkbtn" data-act="new-a" data-v="'+gp[0]+'">+ '+({nakit:'Nakit cüzdanı ekle',banka:'Banka hesabı ekle',kart:'Kart ekle',birikim:'Birikim hesabı ekle',diger:'Hesap ekle'})[gp[0]]+'</button></div>';});
  return h+'<p class="small muted">Bir hesaba dokunarak hareketlerini gör, harcama/gelir ekle ya da gerçek bakiyesiyle eşitle.</p>';
}

/* ---------- Bütçe, Hedefler, Düzenli ---------- */
function planBody(){
  var p=PLANS.some(function(x){return x[0]===ui.plan;})?ui.plan:'butce';
  var seg='<div class="seg" role="tablist" aria-label="Planlama">'+PLANS.map(function(x){return '<button role="tab" data-act="plan" data-v="'+x[0]+'" aria-pressed="'+(p===x[0])+'" aria-selected="'+(p===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>';
  return seg+(p==='butce'?periodHead(false)+budgetBody():(p==='duzenli'?periodHead(false)+duzenliBody():hedefBody()));
}
function budgetBody(){
  var sp=spentByCat(ui.month),limSum=0,spSum=0;
  EXPC().forEach(function(c){if(S.budgets[c]){limSum+=S.budgets[c];spSum+=(sp[c]||0);}});
  var h=limSum>0?'<div class="card"><div class="lbl">Toplam bütçe</div><p class="big">'+TRY0.format(limSum)+'</p><div class="small muted">Limitli kategorilerde harcanan '+TRY0.format(spSum)+' · '+(limSum-spSum>=0?TRY0.format(limSum-spSum)+' kaldı':TRY0.format(spSum-limSum)+' aşıldı')+'</div><div class="bar'+(spSum>limSum?' over':(spSum>limSum*.8?' warn':''))+'" style="margin-top:10px"><i style="width:'+Math.min(spSum/limSum*100,100)+'%"></i></div>'+dailyLine(limSum-spSum)+'</div>'
    :'<div class="card"><div class="lbl">Bütçe</div><p class="small muted" style="margin:6px 0 0">Aşağıdan kategorilere aylık limit gir; kalan bütçen ve günlük harcama sınırın burada görünür.</p></div>';
  h+='<div class="card"><h2>Kategori limitleri</h2><p class="small muted" style="margin:-4px 0 6px">Aylık limit gir. Boş bıraktığın kategori takip edilmez.</p>';
  EXPC().forEach(function(c){
    var lim=S.budgets[c]||0,s=sp[c]||0,ratio=lim?s/lim:0,cls=ratio>1?'over':(ratio>.8?'warn':'');
    var info=lim?TRY0.format(s)+' / '+TRY0.format(lim)+(ratio>1?' · '+TRY0.format(s-lim)+' aşıldı':' · %'+Math.round(ratio*100)):(s?TRY0.format(s)+' harcandı':'');
    h+='<div class="catrow"><div class="top"><button class="cn" data-act="cat-tx" data-v="'+esc(c)+'"><span class="dot" style="background:'+color(c)+'"></span><span class="mid ell">'+esc(c)+'</span></button><input class="lim" inputmode="decimal" data-budget="'+esc(c)+'" placeholder="Limit" value="'+nv(lim||'')+'" aria-label="'+esc(c)+' aylık limit (₺)"></div>'+(info?'<div class="small muted num">'+info+'</div>':'')+(lim?'<div class="bar '+cls+'"><i style="width:'+Math.min(ratio*100,100)+'%"></i></div>':'')+'</div>';
  });
  return h+'</div><button class="linkbtn" data-act="sub" data-v="analiz">Harcama dağılımı ve trendler Analiz bölümünde ›</button>';
}
function goalInfo(g){
  var sv=goalSaved(g),left=Math.max(g.target-sv,0);
  if(sv>=g.target)return 'Hedefe ulaştın';
  if(g.date){var now=today0(),d=pdate(g.date),dd=daysBetween(isoDate(now),g.date),m=(d.getFullYear()-now.getFullYear())*12+d.getMonth()-now.getMonth()-(d.getDate()<now.getDate()?1:0);
    return dd<0?'Tarih geçti, '+TRY0.format(left)+' eksik':(m>=1?m+' ay kaldı · ayda ~'+TRY0.format(left/m)+' ayır':(dd===0?'Son gün bugün':dd+' gün kaldı')+' · '+TRY0.format(left)+' eksik');}
  return TRY0.format(left)+' kaldı';
}
function hedefBody(){
  var h='<button class="btn" data-act="new-g">Hedef ekle</button>';
  if(!S.goals.length)return h+'<div class="empty">Henüz hedef yok. Tatil, acil durum fonu ya da büyük bir alışveriş için hedef koy. Hedefi bir birikim hesabına bağlarsan biriken tutar hesaptan otomatik gelir.</div>';
  var tot=0,sv=0;S.goals.forEach(function(g){tot+=g.target;sv+=goalSaved(g);});
  h+='<div class="card"><div class="lbl">Toplam birikim</div><p class="big">'+TRY0.format(sv)+'</p><div class="small muted">Hedeflerin toplamı '+TRY0.format(tot)+' · %'+Math.round(tot>0?Math.min(sv/tot*100,100):0)+'</div></div>';
  S.goals.forEach(function(g){
    var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;
    h+='<div class="card stack" style="gap:10px"><button class="item" style="padding:0;border:0" data-act="edit-g" data-id="'+g.id+'"><span class="mid"><div class="t" style="font-weight:700">'+esc(g.name)+'</div><div class="small muted">'+esc(goalInfo(g))+'</div></span><span class="num">%'+Math.round(p)+'</span></button><div class="bar"><i style="width:'+p+'%"></i></div><div class="small num muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>'+TRY0.format(s)+' / '+TRY0.format(g.target)+'</span>'+(g.acct&&ACCS().indexOf(g.acct)>=0?'<span>Bağlı hesap: '+esc(g.acct)+'</span>':'')+'</div><button class="btn small ghost" style="align-self:flex-start" data-act="goal-add" data-id="'+g.id+'">Para ekle</button></div>';
  });
  return h;
}
function duzenliBody(){
  var h='<button class="btn" data-act="new-r">Düzenli ödeme ekle</button>';
  if(!S.recurring.length)return h+'<div class="empty">Henüz düzenli ödeme yok. Kira, fatura, kredi taksiti ve abonelikleri ekle; hatırlatıcı ödeme gününü kaçırmamanı sağlar.</div>';
  var tot=0,rem=0,cur=curP(),t0=todayS();
  S.recurring.forEach(function(r){var v=toTL(r.amt,r.acct);tot+=v;if(!recPaid(r,ui.month))rem+=v;});
  h+='<div class="card"><div class="row3" style="margin-top:0;grid-template-columns:1fr 1fr"><div><div class="lbl">Aylık toplam</div><span class="num">'+TRY0.format(tot)+'</span></div><div><div class="lbl">Bu dönem ödenecek</div><span class="num">'+TRY0.format(rem)+'</span></div></div></div>';
  var list=S.recurring.slice().sort(function(a,b){return dueDate(a,ui.month).localeCompare(dueDate(b,ui.month));});
  h+='<div class="card" style="padding-top:4px"><div class="list">'+list.map(function(r){
    var paid=recPaid(r,ui.month),st,dd=dueDate(r,ui.month),dbt=r.debt&&byId(S.debts,r.debt);
    if(paid)st='<span class="pill ok">Ödendi</span>';
    else if(ui.month===cur){var diff=daysBetween(t0,dd);st=diff<0?'<span class="pill late">'+(-diff)+' gün gecikti</span>':(diff===0?'<span class="pill late">Bugün</span>':'<span class="pill">'+diff+' gün sonra</span>');}
    else if(ui.month<cur)st='<span class="pill late">Ödenmedi</span>';
    else st='<span class="pill">Bekliyor</span>';
    return '<div class="item"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-r" data-id="'+r.id+'"><span class="dot" style="background:'+color(r.cat)+'"></span><span class="mid"><div class="t">'+esc(r.name)+'</div><div class="small muted">'+esc(pdate(dd).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' · '+esc(dbt?'Borç: '+dbt.name:r.cat)+' · '+esc(r.acct)+'</div></span></button><div class="rcol"><span class="num">'+moneyIn(r.amt,r.acct,1)+'</span>'+st+'<button class="btn small ghost" data-act="'+(paid?'rundo':'rpay')+'" data-id="'+r.id+'">'+(paid?'Geri al':'Ödendi')+'</button></div></div>';}).join('')+'</div></div>';
  return h+'<p class="small muted">“Ödendi” düğmesi, gösterdiğin dönem için işlemi otomatik ekler ve hesabın bakiyesinden düşer.</p>';
}

/* ---------- Analiz ---------- */
function pstat(k){var m=monthTx(k),inc=sum(m,'inc'),exp=sum(m,'exp');return {k:k,inc:inc,exp:exp,net:r2(inc-exp),rate:inc>0?(inc-exp)/inc*100:null,debt:sumMv(m,'dbt','out'),inv:r2(sumMv(m,'inv','buy')-sumMv(m,'inv','sell'))};}
function prevKs(k,n){var a=[];for(var i=1;i<=n;i++)a.push(addMonth(k,-i));return a;}
function health(){
  var W=wealth(),ae=avgMonthly('exp'),cur=curP(),parts=[];
  var ks=prevKs(cur,3).filter(function(k){return sum(monthTx(k),'inc')>0;});if(!ks.length&&sum(monthTx(cur),'inc')>0)ks=[cur];
  var sr=ks.length?ks.reduce(function(a,k){return a+pstat(k).rate;},0)/ks.length:null;
  parts.push({k:'Tasarruf oranı',v:sr==null?'—':(sr<0?'−':'')+'%'+Math.round(Math.abs(sr)),p:sr==null?null:clamp(sr/20,0,1),tip:sr==null?'Gelir kaydı yok.':(sr>=20?'Gelirinin en az %20’sini biriktiriyorsun.':'Hedef: gelirin en az %20’si.')});
  var em=ae>0?Math.max(W.g.liquid,0)/ae:null;
  parts.push({k:'Acil durum fonu',v:em==null?'—':NUM1.format(em)+' ay',p:em==null?null:clamp(em/6,0,1),tip:em==null?'Gider kaydı yok.':(em>=6?'Likit paran 6 aydan fazla gideri karşılıyor.':'Hedef: 6 aylık gider kadar nakit ve mevduat.')});
  var dr=W.assets>0?W.debt/W.assets:(W.debt>0?1:0);
  parts.push({k:'Borç yükü',v:'%'+Math.round(dr*100),p:clamp(1-dr/0.5,0,1),tip:dr<=0.3?'Borçların varlıklarına göre makul.':'Borçlar varlıklarının %30’unun altında olmalı.'});
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});
  if(lim.length){var sp=spentByCat(cur),okc=lim.filter(function(c){return (sp[c]||0)<=S.budgets[c];}).length;parts.push({k:'Bütçe uyumu',v:okc+'/'+lim.length,p:okc/lim.length,tip:okc===lim.length?'Tüm limitlerin içindesin.':(lim.length-okc)+' kategoride limit aşıldı.'});}
  else parts.push({k:'Bütçe uyumu',v:'Limit yok',p:null,tip:'Bütçe bölümünden kategori limiti belirle.'});
  var val=parts.filter(function(x){return x.p!=null;});
  return {score:val.length>=2?Math.round(val.reduce(function(a,x){return a+x.p;},0)/val.length*100):null,parts:parts};
}
function scoreWord(s){return s>=80?'Çok iyi':(s>=60?'İyi':(s>=40?'Orta':'Geliştirilmeli'));}
function healthCard(){
  var H=health(),s=H.score;
  var ring=s==null?'':'<svg class="ring" viewBox="0 0 42 42" role="img" aria-label="Finansal sağlık puanı '+s+'"><circle cx="21" cy="21" r="17" fill="none" stroke="var(--soft)" stroke-width="5"/><circle cx="21" cy="21" r="17" fill="none" stroke="'+(s>=60?'var(--inc)':(s>=40?'var(--warn)':'var(--exp)'))+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(s/100*106.8).toFixed(1)+' 106.8" transform="rotate(-90 21 21)"/><text x="21" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">'+s+'</text></svg>';
  return '<div class="card"><div class="ghead">'+ring+'<span class="mid"><h2 style="margin:0">Finansal sağlık</h2><div class="small muted">'+(s==null?'Puan için en az iki göstergede veri gerekli: gelir-gider kayıtları ya da bütçe limitleri.':scoreWord(s)+' · 100 üzerinden '+s)+'</div></span></div><div class="hparts">'+H.parts.map(function(x){return '<div class="hp"><div class="hpt"><span>'+esc(x.k)+'</span><b class="num">'+esc(x.v)+'</b></div><div class="bar'+(x.p!=null&&x.p<0.5?' warn':'')+'"><i style="width:'+(x.p==null?0:x.p*100)+'%"></i></div><div class="small muted">'+esc(x.tip)+'</div></div>';}).join('')+'</div></div>';
}
function flowCard(){
  var k=ui.month,s=pstat(k),pv=pstat(addMonth(k,-1)),isCur=k===curP(),days=pDays(k),el=isCur?Math.max(daysBetween(pStart(k),todayS())+1,1):days;
  var rows=[['Gelir',DC0.format(s.inc)+(pv.inc>0?' <span class="small '+(s.inc>=pv.inc?'inc':'exp')+'">'+(s.inc>=pv.inc?'▲':'▼')+'%'+Math.round(Math.abs((s.inc-pv.inc)/pv.inc*100))+'</span>':'')],
    ['Gider',DC0.format(s.exp)+(pv.exp>0?' <span class="small '+(s.exp<=pv.exp?'inc':'exp')+'">'+(s.exp>=pv.exp?'▲':'▼')+'%'+Math.round(Math.abs((s.exp-pv.exp)/pv.exp*100))+'</span>':'')],
    ['Fark (gelir − gider)',sgnD(s.net),1],
    ['Tasarruf oranı',s.rate==null?'—':(s.rate<0?'−':'')+'%'+NUM1.format(Math.abs(s.rate))],
    ['Günlük ortalama gider',DC0.format(s.exp/el)]];
  if(isCur&&s.exp>0)rows.push(['Dönem sonu gider tahmini',DC0.format(s.exp/el*days)]);
  if(s.debt>0)rows.push(['Borç ödemeleri (anapara)',DC0.format(s.debt)]);
  if(Math.abs(s.inv)>=0.5)rows.push([s.inv>0?'Yatırıma aktarılan':'Yatırımdan çekilen',DC0.format(Math.abs(s.inv))]);
  var fixed=0;S.recurring.forEach(function(r){var id=r.paid&&r.paid[k];var t=id&&byId(monthTx(k),id);if(t&&t.type==='exp')fixed+=txTL(t);});
  if(s.exp>0&&fixed>0)rows.push(['Sabit giderler (düzenli ödemeler)','%'+Math.round(fixed/s.exp*100)]);
  return '<div class="card"><h2>Nakit akışı</h2>'+res(rows,1)+'<p class="small muted" style="margin:8px 0 0">Oklar geçen döneme göre değişimi gösterir. Transferler, borç anapara ödemeleri ve yatırım alımları gider sayılmaz; birikim olarak değerlendirilir.</p></div>';
}
function trendSvg(n){
  var ks=[];for(var i=n-1;i>=0;i--)ks.push(addMonth(curP(),-i));
  var rows=ks.map(pstat),mx=Math.max.apply(null,rows.map(function(r){return Math.max(r.inc,r.exp);}));
  if(!(mx>0))return '<div class="small muted">Henüz veri yok.</div>';
  var W=300,H=110,bw=n>6?7:14,gap=(W-rows.length*(bw*2+2))/(rows.length+1),svg='',x=gap,pick=ks.indexOf(ui.trPick)>=0?ui.trPick:null;
  rows.forEach(function(r,i){var hi=Math.round(r.inc/mx*H),he=Math.round(r.exp/mx*H),op=pick&&pick!==r.k?' opacity=".35"':'';
    svg+='<g data-act="trend-pick" data-v="'+r.k+'" class="tg"'+op+'><rect x="'+(x-gap/2).toFixed(1)+'" y="0" width="'+(bw*2+2+gap).toFixed(1)+'" height="'+(H+20)+'" fill="transparent"/>';
    svg+='<rect x="'+x.toFixed(1)+'" y="'+(H-hi)+'" width="'+bw+'" height="'+hi+'" rx="2" fill="var(--inc)"/>';
    svg+='<rect x="'+(x+bw+2).toFixed(1)+'" y="'+(H-he)+'" width="'+bw+'" height="'+he+'" rx="2" fill="var(--exp)"/>';
    if(n<=6||i%2===(n-1)%2)svg+='<text x="'+(x+bw+1).toFixed(1)+'" y="'+(H+15)+'" text-anchor="middle" font-size="10" fill="var(--ink2)">'+esc(mlabel(r.k,1).replace('.',''))+'</text>';
    svg+='</g>';x+=bw*2+2+gap;});
  var done=rows.slice(0,-1).filter(function(r){return r.exp>0;});var av=done.length?done.reduce(function(a,r){return a+r.exp;},0)/done.length:0;
  var ai=done.filter(function(r){return r.inc>0;});var ar=ai.length?ai.reduce(function(a,r){return a+r.rate;},0)/ai.length:null;
  var det='<div class="pickbox small muted">Bir aya dokunarak ayrıntısını gör.</div>';
  if(pick){var p=rows[ks.indexOf(pick)];det='<div class="pickbox"><div class="small"><b>'+esc(plabel(p.k))+'</b></div><div class="small">Gelir <b class="num inc">'+DC0.format(p.inc)+'</b> · Gider <b class="num exp">'+DC0.format(p.exp)+'</b> · Fark <b class="num">'+sgnD(p.net)+'</b>'+(p.rate!=null?' · Tasarruf %'+Math.round(p.rate):'')+'</div>'+(p.k!==ui.month?'<button class="linkbtn" style="padding:4px 0 0" data-act="go-month" data-v="'+p.k+'">Bu döneme git ›</button>':'')+'</div>';}
  return '<svg viewBox="0 0 '+W+' '+(H+20)+'" width="100%" role="img" aria-label="Son '+n+' dönem gelir ve gider grafiği">'+svg+'</svg>'+det+'<div class="small muted" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px"><span><b style="color:var(--inc)">■</b> Gelir</span><span><b style="color:var(--exp)">■</b> Gider</span><span>Ort. gider '+DC0.format(av)+'</span>'+(ar!=null?'<span>Ort. tasarruf %'+Math.round(ar)+'</span>':'')+'</div>';
}
function catAvg(k){var pks=prevKs(k,3),avg={},cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length||1;pks.forEach(function(p){var o=spentByCat(p);Object.keys(o).forEach(function(c){avg[c]=(avg[c]||0)+o[c]/cnt;});});return avg;}
function catChanges(){
  var k=ui.month,cur=spentByCat(k),avg=catAvg(k);
  var cats=Object.keys(cur).concat(Object.keys(avg)).filter(function(c,i,a){return a.indexOf(c)===i;});
  cats.sort(function(a,b){return (cur[b]||0)-(cur[a]||0)||(avg[b]||0)-(avg[a]||0);});
  if(!cats.length)return '<div class="small muted">Bu dönemde ve önceki 3 dönemde harcama yok.</div>';
  var mx=Math.max.apply(null,cats.map(function(c){return Math.max(cur[c]||0,avg[c]||0);}))||1;
  return '<div class="list">'+cats.slice(0,10).map(function(c){var v=cur[c]||0,a=avg[c]||0,d=a>0?(v-a)/a*100:null;
    return '<button class="crow" data-act="cat-tx" data-v="'+esc(c)+'"><div class="crt"><span class="dot" style="background:'+color(c)+'"></span><span class="mid ell">'+esc(c)+'</span><b class="num">'+DC0.format(v)+'</b>'+(d==null?'<span class="small muted cchg">yeni</span>':'<span class="small cchg '+(d>10?'exp':(d<-10?'inc':'muted'))+'">'+(d>=0?'▲':'▼')+'%'+Math.round(Math.abs(d))+'</span>')+'</div><div class="cbar"><i style="width:'+(v/mx*100)+'%;background:'+color(c)+'"></i><s style="left:'+(a/mx*100)+'%"></s></div></button>';}).join('')+'</div><p class="small muted" style="margin:8px 0 0">Çizgi önceki 3 dönemin ortalamasıdır. Bir kategoriye dokunarak işlemlerini gör.</p>';
}
var WDN=['pazartesi','salı','çarşamba','perşembe','cuma','cumartesi','pazar'];
function weekdayCard(){
  var t0=today0(),from=new Date(t0);from.setDate(from.getDate()-83);var fs=isoDate(from),ts=isoDate(t0),tot=[0,0,0,0,0,0,0],cnt=[0,0,0,0,0,0,0],any=false;
  S.tx.forEach(function(t){if(t.type==='exp'&&t.date>=fs&&t.date<=ts){var w=(pdate(t.date).getDay()+6)%7;tot[w]+=txTL(t);cnt[w]++;any=true;}});
  if(!any)return '';
  var mx=Math.max.apply(null,tot)||1,names=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],top=tot.indexOf(Math.max.apply(null,tot)),sel=ui.wk!=null?ui.wk:top;
  return '<div class="card"><h2>Haftanın günleri</h2><div class="wkd">'+tot.map(function(v,i){return '<button data-act="wk-pick" data-v="'+i+'" aria-pressed="'+(i===sel)+'" aria-label="'+WDN[i]+'"><span class="wb"><i style="height:'+Math.max(v/mx*100,2)+'%"></i></span><span class="small muted">'+names[i]+'</span></button>';}).join('')+'</div><p class="small muted" style="margin:8px 0 0">Son 12 haftada <b>'+WDN[sel]+'</b>: haftalık ort. '+DC0.format(tot[sel]/12)+' · '+cnt[sel]+' harcama'+(sel===top?' · en çok harcadığın gün':'')+'.</p></div>';
}
function nwHistCard(){
  var s=nwSeries();
  if(s.length<2)return '<div class="card"><h2>Net servet gelişimi</h2><p class="small muted" style="margin:0">İlk işlemlerini ekledikçe net servetinin geçmişi burada oluşur.</p></div>';
  var from=pdate(s[s.length-1][0]);from.setDate(from.getDate()-(ui.nwr===1?0:(ui.nwr===12?364:182)));var fk=isoDate(from),r=ui.nwr===1?s:s.filter(function(x){return x[0]>=fk;});if(r.length<2)r=s.slice(-2);
  var v=r.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=100;
  var t0=pdate(r[0][0]).getTime(),span=(pdate(r[r.length-1][0]).getTime()-t0)||1;
  var xy=r.map(function(x,i){return [(pdate(x[0]).getTime()-t0)/span*W,H-6-(v[i]-mn)/rg*(H-12)];});
  var pts=xy.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var data=r.map(function(x,i){return [x[0],x[1],xy[i][0]/W,xy[i][1]/H,x[2]?1:0];});
  var mends={};s.forEach(function(x){mends[x[0].slice(0,7)]=x;});var ms=Object.keys(mends).sort().slice(-6),prev=null,rows=[];
  ms.forEach(function(m){var val=mends[m][1];rows.push([mlabel(m)+(mends[m][0]===todayS()?' (bugün)':''),DC0.format(val)+(prev!=null?' <span class="small '+(val>=prev?'inc':'exp')+'">'+sgnD(val-prev)+'</span>':'')]);prev=val;});
  var est=r.some(function(x){return x[2];}),last=r[r.length-1],d=r2(last[1]-r[0][1]);
  return '<div class="card"><div class="ghead" style="margin-bottom:8px"><h2 style="margin:0;flex:1">Net servet gelişimi</h2><div class="seg mini" role="group" aria-label="Süre"><button data-act="nwr" data-v="6" aria-pressed="'+(ui.nwr!==12&&ui.nwr!==1)+'">6 ay</button><button data-act="nwr" data-v="12" aria-pressed="'+(ui.nwr===12)+'">1 yıl</button><button data-act="nwr" data-v="1" aria-pressed="'+(ui.nwr===1)+'">Tümü</button></div></div>'
   +'<div class="nwchart" data-pts="'+esc(JSON.stringify(data))+'"><svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Net servet grafiği"><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><i class="nwdot" hidden></i></div>'
   +'<div class="pickbox small" id="nwpick"><span class="muted">'+esc(pdate(r[0][0]).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'}))+'’den bu yana </span><b class="num '+(d>=0?'inc':'exp')+'">'+sgnD(d)+'</b><span class="muted"> · grafiğe dokun ya da parmağını kaydır</span></div>'
   +'<div class="small muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:4px"><span>En düşük '+DC0.format(mn)+'</span><span>En yüksek '+DC0.format(mx)+'</span></div>'+res(rows.reverse())
   +(est?'<p class="small muted" style="margin:8px 0 0">Kayıt öncesi aylar işlemlerinden hesaplanır; yatırımlar bugünkü fiyatıyla alınır.</p>':'')+'</div>';
}
/* net servet grafiğinde dokunulan noktanın değeri */
function nwScrub(el,clientX){
  var box=el.getBoundingClientRect();if(!box.width)return;var d;try{d=JSON.parse(el.dataset.pts);}catch(e){return;}if(!d.length)return;
  var fx=(clientX-box.left)/box.width,best=d[0];d.forEach(function(p){if(Math.abs(p[2]-fx)<Math.abs(best[2]-fx))best=p;});
  var dot=el.querySelector('.nwdot');if(dot){dot.hidden=false;dot.style.left=(best[2]*100)+'%';dot.style.top=(best[3]*100)+'%';}
  var o=document.getElementById('nwpick'),m=maskOn;maskOn=!!S.hide&&!ui.page;
  try{if(o)o.innerHTML='<b>'+esc(pdate(best[0]).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}))+'</b>: <b class="num">'+DC0.format(best[1])+'</b>'+(best[4]?' <span class="muted">(işlemlerden hesaplandı)</span>':'');}finally{maskOn=m;}
}
function insights(){
  var out=[],k=curP(),s=pstat(k),sp=spentByCat(k),pks=prevKs(k,3),avg={},cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;
  if(cnt){pks.forEach(function(p){var o=spentByCat(p);Object.keys(o).forEach(function(c){avg[c]=(avg[c]||0)+o[c]/cnt;});});
    Object.keys(sp).forEach(function(c){if(avg[c]>0&&sp[c]>avg[c]*1.2&&sp[c]-avg[c]>=100)out.push(['warn',c+' harcaman bu dönem şimdiden ortalamanın %'+Math.round((sp[c]/avg[c]-1)*100)+' üzerinde ('+TRY0.format(sp[c])+' / ort. '+TRY0.format(avg[c])+').']);});
    var ne=Object.keys(sp).filter(function(c){return !(avg[c]>0)&&sp[c]>=500;});if(ne.length)out.push(['muted','Yeni harcama kalemi: '+ne.slice(0,3).join(', ')+'.']);}
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});lim.forEach(function(c){var r=(sp[c]||0)/S.budgets[c];if(r>=1)out.push(['exp',c+' bütçesini '+TRY0.format((sp[c]||0)-S.budgets[c])+' aştın.']);});
  var H=health();H.parts.forEach(function(p){if(p.k==='Acil durum fonu'&&p.p!=null&&p.p<0.5)out.push(['warn','Acil durum fonun '+p.v+'lık gideri karşılıyor; 6 ay hedefle.']);});
  if(s.rate!=null&&s.rate>=20)out.push(['inc','Bu dönem şu ana kadar gelirinin %'+Math.round(s.rate)+'’i harcanmadı.']);else if(s.rate!=null&&s.rate<0)out.push(['exp','Bu dönem giderlerin gelirini '+TRY0.format(-s.net)+' aştı.']);
  var rec=S.recurring.reduce(function(a,r){return a+toTL(r.amt,r.acct);},0),ai=avgMonthly('inc');if(rec>0&&ai>0)out.push(['muted','Düzenli ödemelerin aylık gelirinin %'+Math.round(rec/ai*100)+'’i.']);
  if(!out.length)return '';
  return '<div class="card"><h2>Öne çıkanlar</h2><div class="list">'+out.slice(0,6).map(function(x){return '<div class="item"><span class="dot" style="background:var(--'+(x[0]==='muted'?'ink2':x[0])+')"></span><span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span></div>';}).join('')+'</div></div>';
}
function analizBody(){
  var W=wealth(),k=ui.month,m=monthTx(k);
  var big=m.filter(function(t){return t.type==='exp';}).sort(function(a,b){return txTL(b)-txTL(a);}).slice(0,5);
  var byA={};m.forEach(function(t){if(t.type==='exp')byA[t.acct]=(byA[t.acct]||0)+txTL(t);});
  var h=monthNav()+(k===curP()?insights():'')+healthCard()+flowCard();
  h+='<div class="card"><div class="ghead" style="margin-bottom:8px"><h2 style="margin:0;flex:1">Gelir ve gider trendi</h2><div class="seg mini" role="group" aria-label="Süre"><button data-act="trn" data-v="6" aria-pressed="'+(ui.tr===6)+'">6 ay</button><button data-act="trn" data-v="12" aria-pressed="'+(ui.tr===12)+'">12 ay</button></div></div>'+trendSvg(ui.tr)+'</div>';
  h+='<div class="card"><h2>Kategoriler</h2>'+catChanges()+'</div>';
  var sbc=spentByCat(k);h+='<div class="card"><h2>Harcama dağılımı</h2>'+donut(Object.keys(sbc).map(function(c){return [c,sbc[c]];}),'Bu dönemde harcama yok.','cat-tx')+'</div>';
  if(big.length)h+='<div class="card" style="padding-top:12px"><h2>En büyük harcamalar</h2><div class="list">'+big.map(txRow).join('')+'</div></div>';
  var ak=Object.keys(byA);if(ak.length>1)h+='<div class="card"><h2>Hesaplara göre harcama</h2>'+donut(ak.map(function(a){return [a,byA[a]];}),'')+'</div>';
  h+=weekdayCard()+nwHistCard();
  h+='<div class="card"><h2>Varlık dağılımı</h2>'+donut(W.items,'Henüz varlık yok.')+'<div class="small num muted" style="margin-top:8px">Toplam '+DC0.format(W.assets)+'</div></div>';
  h+='<div class="card"><h2>Borç dağılımı</h2>'+donut(W.debts,'Borç kaydı yok.')+'<div class="small num muted" style="margin-top:8px">Toplam '+DC0.format(W.debt)+'</div></div>';
  if(S.realized.length){var rp=S.realized.reduce(function(a,x){return a+(+x.pl||0);},0);h+='<div class="card"><h2>Gerçekleşen yatırım kâr/zararı</h2><p class="big '+(rp>=0?'inc':'exp')+'" style="font-size:1.5rem">'+sgnD(rp)+'</p><div class="small muted">'+S.realized.length+' satış işleminden</div></div>';}
  return h+fireCard();
}

/* ---------- Portföy ---------- */
function rateTile(l,v,c){return '<span class="rt"><span class="lbl">'+l+'</span><span class="num">'+fx1(v)+'</span>'+(v>0&&c!=null&&isFinite(c)?'<span class="small num '+(c>=0?'inc':'exp')+'">'+(c>=0?'+':'−')+'%'+NUM2.format(Math.abs(c))+'</span>':'')+'</span>';}
function fmtTs(t){return new Date(t).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});}
function qtyTxt(x){var q=NUM2.format(x.qty);return {XAU:q+' gr',XAG:q+' gr',CEY:q+' adet',USD:'$'+q,EUR:'€'+q,GBP:'£'+q,CHF:'CHF '+q}[x.ccy]||q+' adet';}
function debtsCard(){
  var tot=debtManual();
  return '<div class="card stack" style="gap:10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="margin:0">Borçlar</h2><span class="num exp">'+TRY0.format(tot)+'</span></div>'
   +(S.debts.length?'<div class="list">'+S.debts.map(function(d){var l=debtLeft(d),p=d.amt>0?clamp((d.amt-l)/d.amt*100,0,100):0;return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="small muted">'+esc(d.type)+(p>0?' · %'+Math.round(p)+' ödendi':'')+'</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div>':'<div class="small muted">Kredi, taksit ya da kişisel borçlarını ekle.</div>')
   +'<button class="btn ghost" data-act="new-d">Borç ekle</button><p class="small muted" style="margin:0">Borca dokunarak ödeme yapabilirsin; ödeme hesabından düşer, borç azalır. Kredi kartı borçları Hesaplar bölümünde görünür.</p></div>';
}
function holdCard(x){
  var p=hVal(x)-hCost(x),pp=hCost(x)?p/hCost(x)*100:0,linked=x.ccy&&+S.fx[x.ccy]>0,ast=hKind(x)==='asset';
  return '<div class="card hcard"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-h" data-id="'+x.id+'"><span class="dot" style="background:'+color(x.type)+'"></span><span class="mid"><div class="t" style="font-weight:600">'+esc(x.name)+'</div><div class="small muted">'+esc(x.type)+(ast?'':' · '+qtyTxt(x)+' · ort. '+TRY2.format(x.cost))+(linked?' · '+esc(FXL[x.ccy])+' '+TRY2.format(hPrice(x)):'')+'</div></span></button><span class="num" style="font-size:1.0625rem">'+TRY0.format(hVal(x))+'</span></div>'
   +(linked?'':'<label class="pin-in"><span class="small muted">Güncel '+(ast?'değer':'fiyat')+' (₺)</span><input inputmode="decimal" data-price="'+x.id+'" value="'+nv(x.price)+'" aria-label="'+esc(x.name)+' güncel '+(ast?'değer':'fiyat')+' (₺)"></label>')
   +'<div class="hrow"><span class="num small '+(p>=0?'inc':'exp')+'">'+sgn(p)+(hCost(x)?' ('+(pp>=0?'+':'−')+'%'+NUM2.format(Math.abs(pp))+')':'')+'</span><span class="hbtn">'+(ast?'':'<button class="btn small ghost" data-act="h-buy" data-id="'+x.id+'">Al</button>')+'<button class="btn small ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></span></div></div>';
}
function vPortfoy(){
  var pf=pfTotals('inv'),pa=pfTotals('asset'),pl=pf.v-pf.c,plp=pf.c?pl/pf.c*100:0,h='',dist='',inv=S.holdings.filter(function(x){return hKind(x)==='inv';}),ast=S.holdings.filter(function(x){return hKind(x)==='asset';});
  if(pf.v>0){var by={};inv.forEach(function(x){by[x.type]=(by[x.type]||0)+hVal(x);});var ks=Object.keys(by).sort(function(a,b){return by[b]-by[a];});
    dist='<div class="stackbar" style="margin-top:14px">'+ks.map(function(k,i){return '<i style="width:'+(by[k]/pf.v*100)+'%;background:'+dcol(i)+'"></i>';}).join('')+'</div><div class="legend">'+ks.map(function(k,i){return '<span style="--c:'+dcol(i)+'">'+esc(k)+' %'+NUM2.format(by[k]/pf.v*100)+'</span>';}).join('')+'</div>';}
  h+='<div class="card hero"><div class="lbl">Yatırımlarının değeri</div><p class="big">'+TRY0.format(pf.v)+'</p><div class="row3" style="grid-template-columns:1fr 1fr"><div><div class="lbl">Maliyet</div><span class="num">'+TRY0.format(pf.c)+'</span></div><div><div class="lbl">Kâr / zarar</div><span class="num">'+sgn(pl)+'</span><div class="small '+(plp>=0?'inc':'exp')+'">'+(plp>=0?'+':'−')+'%'+NUM2.format(Math.abs(plp))+'</div></div></div>'+dist+'</div>';
  h+='<div class="two"><button class="btn" data-act="new-h" data-v="inv">Yatırım ekle</button><button class="btn ghost" data-act="new-h" data-v="asset">Varlık ekle</button></div>';
  if(!inv.length)h+='<div class="empty">Henüz yatırım yok. Hisse, fon, altın, gümüş, döviz, kripto ya da mevduat ekleyebilirsin.</div>';
  else h+=inv.map(holdCard).join('');
  h+='<h2 style="margin:6px 2px -4px">Diğer varlıklar'+(pa.v>0?' · '+TRY0.format(pa.v):'')+'</h2>';
  h+=ast.length?ast.map(holdCard).join(''):'<div class="small muted" style="padding:0 2px">Ev, araba gibi varlıklarını ekleyerek net servetine kat.</div>';
  var ch=S.fxChg||{},bi=S.mkt&&S.mkt.BIST;
  h+='<button class="card ratecard" data-act="open-set" data-id="kurlar"><span class="rgrid">'+rateTile('USD/TL',S.fx.USD,ch.USD)+rateTile('EUR/TL',S.fx.EUR,ch.EUR)+rateTile('Gram altın',S.fx.XAU,ch.XAU)+rateTile('BIST 100',bi?bi.price:0,bi?bi.chg:null)+'</span><span class="small muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>'+(S.fxTs?'Güncelleme: '+esc(fmtTs(S.fxTs)):'Kur verisi henüz yok')+'</span><span>Tüm kurlar ›</span></span></button>';
  return h+debtsCard()+(S.holdings.length?'<p class="small muted">Kura bağlı varlıklar (döviz, altın, gümüş) kendiliğinden güncellenir. Diğerlerinin güncel fiyatını kutuya yazınca değer ve kâr/zarar yenilenir. Al/Sat ile işlem yaparsan seçtiğin hesabın bakiyesi de değişir.</p>':'');
}

/* ---------- Notlar ---------- */
function noteIn(n,v){return v==='trash'?!!n.trash:(v==='arch'?(!n.trash&&n.arch):(!n.trash&&!n.arch));}
function noteSorted(){
  var q=fold(ui.nq),N=S.nset,v=ui.nv;
  var l=S.notes.filter(function(n){return noteIn(n,v)&&(!q||fold((n.title||'')+' '+n.body).indexOf(q)>-1);});
  l.sort(function(a,b){
    if(v==='trash')return (b.trash||0)-(a.trash||0);
    if(N.pinFirst&&!!a.pin!==!!b.pin)return a.pin?-1:1;
    if(N.sort==='title')return (a.title||'').localeCompare(b.title||'','tr');
    if(N.sort==='created')return (b.cts||b.ts)-(a.cts||a.ts);
    return b.ts-a.ts;});
  return l;
}
function noteActs(n){
  var b=function(act,icn,lb){return '<button class="icon-btn sm" data-act="'+act+'" data-id="'+n.id+'" aria-label="'+lb+'" title="'+lb+'">'+ic(icn)+'</button>';};
  if(n.trash)return b('n-restore','restore','Geri yükle')+b('n-purge','trash','Kalıcı olarak sil');
  if(n.arch)return b('n-unarch','restore','Arşivden çıkar')+b('n-trash','trash','Çöp kutusuna taşı');
  return b('n-pin','pin',n.pin?'Sabitlemeyi kaldır':'Üste sabitle')+b('n-arch','archive','Arşivle')+b('n-trash','trash','Çöp kutusuna taşı');
}
function notesList(){
  var l=noteSorted(),N=S.nset,v=ui.nv;
  if(!l.length)return '<div class="empty">'+(ui.nq?'Eşleşen not yok.':({act:'Henüz not yok. Harcama fikirleri, hedefler, hatırlatmalar yazabilirsin.',arch:'Arşiv boş. Arşivlediğin notlar burada saklanır.',trash:'Çöp kutusu boş.'})[v])+'</div>';
  return l.map(function(n){
    var dt=N.date||v==='trash'?'<span class="small muted">'+esc(v==='trash'?'Silinme: '+new Date(n.trash).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}):new Date(n.ts).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+'</span>':'';
    var pn=n.pin&&v==='act'?'<span class="pinmark" aria-label="Sabit">'+ic('pin')+'</span>':'';
    if(N.view==='list')return '<div class="note-row"><button class="nc-open" data-act="edit-n" data-id="'+n.id+'"><span class="t ell">'+esc(n.title||'Başlıksız')+'</span>'+dt+'</button>'+pn+'<span class="nc-acts">'+noteActs(n)+'</span></div>';
    return '<div class="note-card"><button class="nc-open" data-act="edit-n" data-id="'+n.id+'"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div class="t ell">'+esc(n.title||'Başlıksız')+'</div>'+pn+'</div>'+(N.lines>0&&n.body?'<p style="-webkit-line-clamp:'+N.lines+'">'+esc(n.body)+'</p>':'')+'</button><div class="nc-foot">'+dt+'<span class="nc-acts">'+noteActs(n)+'</span></div></div>';
  }).join('');
}
function noteCounts(){var c={act:0,arch:0,trash:0};S.notes.forEach(function(n){c[n.trash?'trash':(n.arch?'arch':'act')]++;});return c;}
function vNotlar(){
  var c=noteCounts(),v=ui.nv;
  return '<div style="display:flex;gap:8px"><button class="btn" data-act="new-n">Not ekle</button><button class="btn ghost iconly" data-act="open-set" data-id="notlar" aria-label="Not ayarları">'+ic('gear')+'</button></div>'
   +'<div class="seg" role="tablist" aria-label="Not klasörleri">'+[['act','Notlar'],['arch','Arşiv'],['trash','Çöp kutusu']].map(function(x){return '<button role="tab" data-act="nview" data-v="'+x[0]+'" aria-pressed="'+(v===x[0])+'" aria-selected="'+(v===x[0])+'">'+x[1]+(c[x[0]]?' <span class="cnt">'+c[x[0]]+'</span>':'')+'</button>';}).join('')+'</div>'
   +'<input id="nsearch" type="search" placeholder="'+({act:'Notlarda ara',arch:'Arşivde ara',trash:'Çöp kutusunda ara'})[v]+'" value="'+esc(ui.nq)+'" aria-label="Notlarda ara">'
   +(v==='trash'&&c.trash?'<div class="banner"><span>Çöp kutusundaki notlar 30 gün sonra kendiliğinden silinir.</span><button class="btn small ghost" data-act="n-empty">Boşalt</button></div>':'')
   +'<div id="nlist" class="stack" style="gap:10px">'+notesList()+'</div>';
}
function vNote(){
  var p=ui.page,d=p.draft,n=p.id?byId(S.notes,p.id):null;
  if(n&&n.trash)return '<div class="banner"><span>Bu not çöp kutusunda. Düzenlemek için önce geri yükle.</span></div><div class="card"><div class="t" style="font-weight:700;font-size:1.125rem">'+esc(n.title||'Başlıksız')+'</div><p style="white-space:pre-wrap;margin:8px 0 0">'+esc(n.body)+'</p></div><button class="btn" data-act="note-restore">Geri yükle</button><button class="btn danger" data-act="note-purge">Kalıcı olarak sil</button>';
  return (n&&n.arch?'<div class="banner"><span>Bu not arşivde.</span></div>':'')
   +'<div class="field"><label for="n-title">Başlık</label><input id="n-title" data-nf="title" value="'+esc(d.title)+'" placeholder="Başlık"></div>'
   +'<div class="field"><label for="n-body">Not</label><textarea id="n-body" data-nf="body" style="min-height:40vh" placeholder="Notunu yaz">'+esc(d.body)+'</textarea></div>'
   +'<button class="row-tgl" data-act="note-pin" role="switch" aria-checked="'+!!d.pin+'"><span class="mid"><div class="t">Üste sabitle</div><div class="small muted">Sabit notlar listede en üstte durur</div></span><span class="sw"></span></button>'
   +(n?'<div class="small muted">Son düzenleme: '+esc(new Date(n.ts).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))+'</div>':'')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="note-save">Kaydet</button>'
   +'<div class="two"><button class="btn ghost" data-act="note-arch">'+(n&&n.arch?'Arşivden çıkar':'Arşivle')+'</button><button class="btn danger" data-act="note-trash">Çöp kutusuna taşı</button></div>';
}
function saveNote(){
  var p=ui.page;if(!p||p.k!=='note'||!p.dirty)return;
  var d=p.draft,ti=d.title.trim(),bo=d.body;
  if(!ti&&!bo.trim())return;
  if(p.id){var n=byId(S.notes,p.id);if(n){n.title=ti;n.body=bo;n.pin=!!d.pin;n.ts=Date.now();delete n.sample;}}
  else{var n2={id:uid(),title:ti,body:bo,pin:!!d.pin,arch:false,ts:Date.now(),cts:Date.now()};S.notes.push(n2);p.id=n2.id;}
  p.dirty=false;save();
}
function purgeTrash(){var lim=Date.now()-30*864e5,b=S.notes.length;S.notes=S.notes.filter(function(n){return !(n.trash&&n.trash<lim);});if(S.notes.length!==b)save();}

/* ---------- form parçaları ---------- */
function fld(label,id,path,kind,ph){var v=getP(path),s=(v===''||v==null)?'':String(v).replace('.',',');return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" inputmode="decimal" data-bind="'+path+'" data-kind="'+kind+'" placeholder="'+esc(ph||'')+'" value="'+esc(s)+'"></div>';}
function tgl(path,label,desc){var on=!!getP(path);return '<button class="row-tgl" data-act="tgl" data-v="'+path+'" role="switch" aria-checked="'+on+'"><span class="mid"><div class="t">'+label+'</div>'+(desc?'<div class="small muted">'+desc+'</div>':'')+'</span><span class="sw"></span></button>';}
function segv(path,opts,aria){var cur=getP(path);if(cur==null||cur==='')cur=opts[0][0];return '<div class="seg" role="group" aria-label="'+aria+'">'+opts.map(function(o){return '<button data-act="setv" data-v="'+path+'" data-x="'+o[0]+'" aria-pressed="'+(String(cur)===String(o[0]))+'"'+(o[2]?' aria-label="'+o[2]+'" title="'+o[2]+'"':'')+'>'+o[1]+'</button>';}).join('')+'</div>';}
function sec(t,inner,note){return '<div class="card stack" style="gap:12px">'+(t?'<h2 style="margin:0">'+t+'</h2>':'')+inner+(note?'<p class="small muted" style="margin:0">'+note+'</p>':'')+'</div>';}
function msg(text,ok,id){var e=document.getElementById(id||'f-err');if(e){e.textContent=text;e.style.color=ok?'var(--inc)':'var(--exp)';}}
function res(rows){return '<div class="res">'+rows.map(function(r){return '<div class="r'+(r[2]?' strong':'')+'"><span>'+esc(r[0])+'</span><span class="num">'+r[1]+'</span></div>';}).join('')+'</div>';}

/* ---------- FIRE sayfası ---------- */
function vFire(){
  var m=fireModel(),h='',P=Math.max(m.assets,0),f=S.fire;
  var tgt=sec('Hedefin','<div class="two" style="grid-template-columns:1fr auto;align-items:end">'+fld('FIRE hedef tutarı','fi-target','fire.target','auto',m.auto>0&&rateOf(f.tccy)>0?'Otomatik: '+NUM2.format(Math.round(m.auto/rateOf(f.tccy))):'Örn. 10.000.000')+'<div class="field"><label for="fi-tccy">Para birimi</label>'+ccySel('fi-tccy',f.tccy)+'</div></div>'
    +(m.noRate?'<div class="small exp">'+esc(CCYN[f.tccy])+' kuru yok; hedef otomatik hesaplanıyor. Kurları güncelle.</div>':'')
    +(+f.target>0?'<button class="linkbtn" style="align-self:flex-start;padding-left:0" data-act="fire-auto">Otomatik hedefe dön</button>':''),
    'Boş bırakırsan hedef, yıllık harcaman ÷ çekim oranı olarak hesaplanır. Hedefi dolar, euro ya da altın olarak girersen her gün güncel kurla TL’ye çevrilir.');
  var assume=sec('Varsayımlar',
    fld('Aylık harcama (₺)','fi-exp','fire.exp','auto','Otomatik: '+(m.autoE>0?TRY0.format(m.autoE):'veri yok'))
   +fld('Aylık birikim (₺)','fi-save','fire.save','auto','Otomatik: '+TRY0.format(Math.max(m.autoS,0)))
   +'<div class="two">'+fld('Yıllık reel getiri (%)','fi-ret','fire.ret','num','4')+fld('Çekim oranı (%)','fi-wr','fire.wr','num','4')+'</div>'
   +tgl('fire.acc','Hesapları ve borçları say','Nakit, banka ve kart bakiyelerin; kayıtlı borçların düşülür')+tgl('fire.pf','Yatırımları say','Hisse, fon, altın, döviz, kripto ve mevduat')+tgl('fire.ast','Diğer varlıkları say','Ev, araba gibi; genelde oturduğun ev sayılmaz')
   +fld('Ek yatırım varlığı (₺)','fi-extra','fire.extra','num','0'),
   'Boş bıraktığın alanlar geçmiş dönemlerdeki işlemlerinden otomatik hesaplanır. Reel getiri, enflasyondan arındırılmış yıllık getiridir.');
  if(!m.ok)return tgt+sec('','<div class="empty" style="padding:8px">Hedef tutarını ya da aylık harcamanı gir; sonuçlar burada görünür.</div>')+assume;
  h+='<div class="card hero"><div class="nwtop"><span class="lbl">FIRE ilerlemesi</span>'+ccySel('dccy',S.dccy)+'</div><p class="big">%'+NUM2.format(m.prog)+'</p><div class="bar"><i style="width:'+m.prog+'%"></i></div><div class="small muted" style="margin-top:8px">'+(m.n<=0?'Hedefe ulaştın.':'Tahmini süre <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</div></div>';
  h+=tgt;
  h+=sec('Özet',res([['FIRE hedefi'+(m.custom?' (senin)':' (otomatik)'),DC0.format(m.target),1],['Mevcut varlık',DC0.format(P)],['Kalan',DC0.format(Math.max(m.target-P,0))],['Aylık birikim',DC0.format(m.sv)],['Bugünkü varlığın aylık pasif geliri',DC0.format(m.passive)],['Hedefin karşıladığı aylık harcama',DC0.format(m.target*m.wr/12)]]),'Tutarlar seçtiğin para biriminde güncel kurla gösterilir.');
  var sc=[['Sade yaşam (hedefin %70’i)',.7],['Mevcut hedef',1],['Rahat yaşam (%130)',1.3]];
  h+=sec('Senaryolar','<div class="res">'+sc.map(function(s){var T=m.target*s[1];return '<div class="r"><span>'+s[0]+'<div class="small muted">Hedef '+DC0.format(T)+'</div></span><span class="num" style="text-align:right">'+esc(fmtYears(monthsToFI(P,m.sv,m.rm,T)))+'</span></div>';}).join('')+'</div>');
  if(m.n>0){
    var n1=monthsToFI(P,m.sv*1.1,m.rm,m.target),n2=monthsToFI(P,m.sv,m.rm,m.target*.9);
    var dif=function(n){if(!isFinite(n))return 'değişmez';if(!isFinite(m.n))return 'ulaşılır: '+fmtYears(n);var d=Math.round(m.n-n);return d>0?(d>=12?(Math.floor(d/12)+' yıl '+(d%12?d%12+' ay ':'')):d+' ay ')+'erken':'değişmez';};
    h+=sec('Ne işe yarar?',res([['Aylık birikim %10 artarsa',dif(n1)],['Hedef %10 düşerse',dif(n2)]]));
  }
  h+=assume;
  h+='<p class="small muted">Bu bir tahmindir, yatırım tavsiyesi değildir. Getiri ve çekim oranı varsayımdır. %4 çekim oranı ABD tarihsel verilerine dayanan genel bir kuraldır; Türkiye’de enflasyon ve getiriler farklı seyredebilir.</p>';
  return h;
}

/* ---------- ayar sayfaları ---------- */
function setList(){var q=fold(ui.sq);var l=SETS.filter(function(s){return !q||fold(s.t+' '+s.d).indexOf(q)>-1;});
  if(!l.length)return '<div class="empty">Eşleşen ayar yok.</div>';
  return l.map(function(s){return '<button class="setcard" data-act="open-set" data-id="'+s.id+'" data-v="ayarlar"><span class="sic" style="--c:'+s.c+'">'+ic(s.i)+'</span><span class="mid"><div class="t">'+esc(s.t)+'</div><div class="small muted">'+esc(s.d)+'</div></span>'+ic('r')+'</button>';}).join('');}
function vAyarlar(){return '<div class="search">'+ic('search')+'<input id="sset" type="search" placeholder="Ayarlarda ara..." value="'+esc(ui.sq)+'" aria-label="Ayarlarda ara"></div><div id="setlist" class="stack" style="gap:10px">'+setList()+'</div><div class="card stack" style="gap:8px;text-align:center"><div class="small muted">Wallet '+VER+' · Veriler bu cihazda saklanır'+(nb('saveData')?' (uygulama içinde ve yedek dosyasında)':'')+'</div><button class="btn ghost small" style="align-self:center" data-act="check-upd">Güncellemeleri denetle</button><div class="err" id="f-upd" style="text-align:center"></div></div>';}
function setBody(s){return ({profil:setProfil,hesap:setHesap,kat:setKat,kurlar:setKur,oto:setOto,bild:setBild,gor:setGor,guv:setGuv,veri:setVeri}[s]||setVeri)();}
function setProfil(){
  var pd=S.payday||1,o='';for(var i=1;i<=31;i++)o+='<option value="'+i+'"'+(i===pd?' selected':'')+'>'+i+'. gün</option>';
  return sec('Profil','<div class="field"><label for="pf-name">Ad</label><input id="pf-name" data-bind="name" data-kind="text" placeholder="Adın" value="'+esc(S.name)+'"></div>','Adın ana sayfada görünür.')
   +sec('Dönem','<div class="field"><label for="pf-pd">Maaş günü (dönem başlangıcı)</label><select id="pf-pd" data-bind="payday" data-kind="int">'+o+'</select></div><div class="small">Şu anki dönem: <b>'+esc(plabel(curP()))+'</b> ('+esc(prange(curP()))+')</div>','Özetler, bütçe ve düzenli ödemeler bu günden başlayan döneme göre hesaplanır. Ayın 1’i için 1. günü seç.');
}
function setHesap(){
  var rows=ACCS().map(acctLine).join('');
  return sec('Hesaplar','<div class="list">'+rows+'</div><button class="btn" data-act="new-a">Hesap ekle</button>','Düzenlemek için bir hesaba dokun. Dolar, euro, sterlin, frank ve altın hesapları toplamlara güncel kurla çevrilir.')
   +sec('Varsayılan hesap','<div class="field"><label for="st-def">Yeni işlemde seçili gelen hesap</label><select id="st-def" data-bind="defAcct" data-kind="text"><option value="">Son kullandığım hesap</option>'+ACCS().map(function(a){return '<option'+(S.defAcct===a?' selected':'')+'>'+esc(a)+'</option>';}).join('')+'</select></div>')
   +sec('Transfer','<button class="btn ghost" data-act="qa-trf">Hesaplar arası transfer yap</button>','Transfer gelir ya da gider sayılmaz, yalnızca hesap bakiyelerini değiştirir.');
}
function chipRow(type){return '<div class="chips">'+S.cats[type].map(function(c){return '<button class="chip rm" data-act="cat-del" data-v="'+type+'" data-id="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div>';}
function catAdd(type,label){return '<div class="two" style="grid-template-columns:1fr auto"><input id="nc-'+type+'" placeholder="'+label+'" aria-label="'+label+'"><button class="btn small" data-act="cat-add" data-v="'+type+'">Ekle</button></div>';}
function setKat(){
  var all=EXPC().concat(INCC()),rl=S.rules.length?'<div class="list">'+S.rules.map(function(r,i){return '<div class="item"><span class="mid"><div class="t">“'+esc(r.kw)+'” → '+esc(r.cat)+'</div></span><button class="btn small ghost" data-act="rule-del" data-id="'+i+'">Sil</button></div>';}).join('')+'</div>':'<div class="small muted">Henüz kural yok.</div>';
  return sec('Gider kategorileri',chipRow('exp')+catAdd('exp','Yeni gider kategorisi'),'Silmek için bir kategoriye iki kez dokun. Geçmiş işlemler silinmez.')
   +sec('Gelir kategorileri',chipRow('inc')+catAdd('inc','Yeni gelir kategorisi'))
   +sec('Otomatik kurallar',rl+'<div class="two"><div class="field"><label for="rl-kw">İşlem notunda geçen kelime</label><input id="rl-kw" placeholder="Örn. migros"></div><div class="field"><label for="rl-cat">Kategori</label><select id="rl-cat">'+opts(all)+'</select></div></div><div class="err" id="f-err"></div><button class="btn" data-act="rule-add">Kural ekle</button>','İşlem eklerken nota bu kelimeyi yazarsan kategori kendiliğinden seçilir.');
}
function fmtProv(p){var m=String(p).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):String(p);}
function setKur(){
  var when=S.fxTs?'<div class="small muted">Son güncelleme: '+esc(fmtTs(S.fxTs))+(S.fxProv?' · kaynak saati '+esc(fmtProv(S.fxProv)):'')+'</div>':'';
  var ch=S.fxChg||{},bi=S.mkt&&S.mkt.BIST;
  return sec('Görüntüleme para birimi','<div class="field"><label for="dccy2">Net servet, Analiz ve FIRE bu birimde gösterilir</label>'+ccySel('dccy2',S.dccy)+'</div>','Tutarlar güncel kurla çevrilir; işlemler ve bütçeler kendi para biriminde kalır.')
   +sec('Canlı kurlar','<div class="rgrid">'+FXK.map(function(k){return rateTile(FXL[k],S.fx[k],ch[k]);}).join('')+rateTile('BIST 100',bi?bi.price:0,bi?bi.chg:null)+'</div>'+when+tgl('fxAuto','Kurları otomatik güncelle','Uygulama açılınca ve her 5 dakikada bir yenilenir')+'<button class="btn ghost" data-act="rates-now">Şimdi güncelle</button><div class="err" id="f-rates"></div>',nb('fetchRates')?'Uygulama kurları doğrudan kaynaktan alır. Kaynak: Truncgil Finans; anlık borsa verisi değildir.':'Veri yayın sunucusunda düzenli olarak yenilenir; anlık borsa verisi değildir ve gecikmeli olabilir. Kaynak: Truncgil Finans.')
   +sec('Kurları elle gir (₺)','<div class="two">'+FXK.map(function(k){return fld(FXL[k],'fx-'+k,'fx.'+k,'num','0');}).join('')+'</div>','Otomatik güncelleme açıkken elle girdiğin değerler bir sonraki yenilemede değişir.');
}
function notifState(){if(nb('notifState')){try{return NB.notifState();}catch(e){}}return ('Notification' in window)?Notification.permission:'yok';}
function upcomingList(){var u=upcoming(30);if(!u.length)return '<div class="small muted">Önümüzdeki 30 günde ödenmemiş düzenli ödeme ya da kart borcu yok.</div>';
  var t0=todayS();return '<div class="list">'+u.slice(0,8).map(function(x){var d=daysBetween(t0,x.date);return '<div class="item"><span class="dot" style="background:var(--'+(d<0?'exp':(d<=S.alerts.days?'warn':'line'))+')"></span><span class="mid"><div class="t">'+esc(x.name)+'</div><div class="small muted">'+esc(pdate(x.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'short'}))+' · '+(d<0?(-d)+' gün gecikti':dayWord(d)+(d>1?' sonra':''))+'</div></span><span class="num">'+moneyIn(x.amt,x.acct,1)+'</span></div>';}).join('')+'</div>';}
function setBild(){
  var perm=notifState(),hrs=[7,8,9,10,12,18,20],native=nb('schedule');
  var phone;
  if(native){
    phone=tgl('alerts.push','Telefon bildirimi gönder','Uygulama kapalıyken de ödeme gününden önce ve ödeme günü bildirim gelir')
      +'<div class="lbl">Bildirim saati</div>'+segv('alerts.hour',hrs.map(function(x){return [x,pad(x)+':00'];}),'Bildirim saati')
      +(perm==='granted'?'<div class="small inc">Bildirim izni verildi.</div>':'<button class="btn ghost" data-act="notif-ask">Bildirim izni ver</button>'+(perm==='denied'?'<div class="small muted">İzin reddedildi. Telefon Ayarları › Uygulamalar › Wallet › Bildirimler bölümünden açabilirsin.</div>':''))
      +'<button class="btn ghost" data-act="notif-test">Deneme bildirimi gönder</button><div class="err" id="f-ntest"></div>';
  }else{
    phone=tgl('notif','Bildirim gönder','Uygulamayı açtığında, günde bir kez özet bildirim')+(perm==='granted'?'<div class="small muted">Bildirim izni verildi.</div>':perm==='denied'?'<div class="small muted">İzin reddedilmiş. Tarayıcı site ayarlarından açabilirsin.</div>':perm==='yok'?'<div class="small muted">Bu görünüm bildirimi desteklemiyor. Android uygulamasında hatırlatıcı telefon bildirimi olarak gelir.</div>':'<button class="btn ghost" data-act="notif-ask">Bildirim izni ver</button>');
  }
  return sec('Fatura ve ödeme hatırlatıcısı',tgl('alerts.rec','Hatırlatıcı açık','Düzenli ödemeler ve kredi kartı son ödeme günleri')+'<div class="lbl">Kaç gün önceden</div>'+segv('alerts.days',[[1,'1 gün'],[3,'3 gün'],[7,'7 gün']],'Gün')+'<div class="lbl">Yaklaşan ödemeler</div>'+upcomingList(),'Uyarılar ana sayfada da görünür. Ödendi olarak işaretlediğin ödemeler için hatırlatma gelmez.')
   +sec('Telefon bildirimi',phone,native?'Bildirimler telefonun kendi hatırlatıcısıyla planlanır; telefon yeniden başlasa da devam eder.':'Tarayıcıda bildirim yalnızca uygulama açıldığında gelir.')
   +sec('Bütçe uyarıları',tgl('alerts.budget','Bütçe aşımı uyarıları','Limite yaklaşınca ya da aşınca ana sayfada gösterilir')+'<div class="lbl">Uyarı eşiği</div>'+segv('alerts.thr',[[70,'%70'],[80,'%80'],[90,'%90']],'Uyarı eşiği'));
}
function setGor(){
  return sec('Tema',segv('theme',[['auto','Sistem'],['light','Açık'],['dark','Koyu']],'Tema'))
   +sec('Yazı boyutu',segv('fs',[[0.9,'<span style="font-size:13px">A</span>','Küçük'],[1,'<span style="font-size:16px">A</span>','Normal'],[1.15,'<span style="font-size:19px">A</span>','Büyük'],[1.3,'<span style="font-size:22px">A</span>','Çok büyük']],'Yazı boyutu')+'<div class="small muted">Şu an: '+({0.9:'Küçük',1:'Normal',1.15:'Büyük',1.3:'Çok büyük'}[S.fs]||'Normal')+'</div>')
   +sec('Gizlilik',tgl('hide','Tutarları gizle','Ana sayfada tutarlar •••• olur; net servet kartındaki göz düğmesiyle de açıp kapatabilirsin'));
}
function notesExport(){
  var c=noteCounts();
  return sec('Notları dışa aktar','<div class="small muted">'+(c.act+c.arch)+' not (arşiv dahil)</div><button class="btn ghost" data-act="notes-copy">Tüm notları kopyala</button><button class="btn ghost" data-act="notes-save">Metin dosyası olarak kaydet</button><div class="err" id="f-err5"></div>');
}
function setNotlar(){
  return sec('Liste','<div class="lbl">Sıralama</div>'+segv('nset.sort',[['edited','Düzenleme'],['created','Oluşturma'],['title','Başlık']],'Sıralama')
    +'<div class="lbl">Görünüm</div>'+segv('nset.view',[['card','Kart'],['list','Liste']],'Görünüm')
    +'<div class="lbl">Önizleme satırı</div>'+segv('nset.lines',[[0,'Yok'],[2,'2'],[3,'3'],[5,'5']],'Önizleme satırı')
    +tgl('nset.pinFirst','Sabit notlar üstte')+tgl('nset.date','Tarihi göster')+tgl('nset.confirmDel','Kalıcı silmeden önce sor','Kalıcı silme düğmesine iki kez dokunman gerekir'))
   +notesExport();
}
function setGuv(){
  var h='';
  if(!S.pin){
    h+=sec('PIN kilidi','<div class="field"><label for="pin1">Yeni PIN (4 rakam)</label><input id="pin1" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="field"><label for="pin2">PIN tekrar</label><input id="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="err" id="f-err"></div><button class="btn" data-act="pin-set">PIN kilidini etkinleştir</button>','PIN, uygulamayı açarken sorulur.');
  }else{
    h+=sec('PIN kilidi','<span class="pill ok" style="align-self:flex-start">Açık</span><div class="lbl">Otomatik kilit</div>'+segv('pin.auto',[[0,'Hemen'],[1,'1 dk'],[5,'5 dk'],[15,'15 dk']],'Otomatik kilit')+(bioOk()?tgl('bio','Parmak izi ile aç','Kilit ekranında PIN yerine parmak izi ya da yüz tanıma'):'')+'<button class="btn ghost" data-act="lock-now">Şimdi kilitle</button>','Otomatik kilit, uygulamadan çıkıp geri döndüğünde çalışır.')
     +sec('PIN’i değiştir','<div class="field"><label for="pold">Mevcut PIN</label><input id="pold" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="two"><div class="field"><label for="pnew1">Yeni PIN</label><input id="pnew1" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="field"><label for="pnew2">Tekrar</label><input id="pnew2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div></div><div class="err" id="f-err"></div><button class="btn ghost" data-act="pin-change">PIN’i değiştir</button>')
     +sec('PIN’i kaldır','<div class="field"><label for="prem">Mevcut PIN</label><input id="prem" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn danger" data-act="pin-remove">Kilidi kaldır</button>');
  }
  if(nb('setSecure'))h+=sec('Ekran gizliliği',tgl('secure','Ekranı gizle','Son uygulamalar listesinde içerik görünmez, ekran görüntüsü alınamaz'));
  h+='<p class="small muted">PIN ekranı kilitler. Telefonunda ekran kilidi açıksa Android, uygulama verilerini zaten cihaz şifrelemesiyle korur; başka uygulamalar Wallet verisini okuyamaz. PIN unutulursa kilit ancak veriler silinerek kaldırılır, bu yüzden yedek al.</p>';
  return h;
}
function setVeri(){
  var pw=S.bkKey?'<div class="small inc">Yedekler şifreli. Geri yüklerken bu şifre sorulur.</div><button class="btn ghost" data-act="bk-pw-del">Yedek şifresini kaldır</button>'
      :'<div class="two"><div class="field"><label for="bkp1">Yedek şifresi</label><input id="bkp1" type="password" autocomplete="new-password" placeholder="En az 6 karakter"></div><div class="field"><label for="bkp2">Tekrar</label><input id="bkp2" type="password" autocomplete="new-password"></div></div><button class="btn ghost" data-act="bk-pw-set">Yedekleri şifrele</button>';
  var auto=nb('autoBackup')?sec('Otomatik yedek',tgl('autoBk','Otomatik yedekle','Değişiklikten kısa süre sonra ve uygulamadan çıkınca İndirilenler/Wallet klasörüne yazılır')+(S.bkTs?'<div class="small muted">Son otomatik yedek: '+esc(fmtTs(S.bkTs))+(S.bkEnc?' · şifreli':' · şifresiz')+'</div>':'')+pw+'<div class="two"><button class="btn ghost" data-act="bk-auto">Şimdi yedekle</button><button class="btn ghost" data-act="bk-share">Paylaş / Drive’a kaydet</button></div><div class="err" id="f-bka"></div>','Uygulamayı silsen bile bu dosya telefonda kalır; “Yedekten yükle” ile geri alabilirsin. Şifreyi unutursan şifreli yedek açılmaz.')
    +sec('Bulut yedeği','<p class="small" style="margin:0">Telefonunda Google yedekleme açıksa Wallet verileri Google hesabına da kendiliğinden yedeklenir; yeni telefona ya da yeniden kurulumda geri gelir.</p>','Ayarlar › Google › Yedekleme bölümünden açık olduğunu kontrol edebilirsin. Ek olarak yedeği Paylaş ile Google Drive’a kaydedebilirsin.'):'';
  return auto+sec('Yedek','<div class="field"><label for="bk-pw">Yedek şifresi</label><input id="bk-pw" type="password" autocomplete="new-password" placeholder="Boş bırakırsan şifresiz yedek"></div><button class="btn" data-act="bk-make">Yedek hazırla</button><div id="bk-box" class="stack" style="gap:10px" hidden><textarea id="bk-out" readonly aria-label="Yedek metni"></textarea><button class="btn ghost" data-act="bk-copy">Yedeği kopyala</button><button class="btn ghost" data-act="bk-save">Dosya olarak kaydet</button><button class="btn ghost" data-act="bk-share2">Paylaş (Drive, e-posta…)</button></div><div class="err" id="f-err3"></div>','Şifreli yedek AES-256 ile korunur. Şifreyi unutursan yedek açılmaz, şifre hiçbir yerde saklanmaz.')
   +sec('Yedekten yükle','<label class="btn ghost filebtn">Dosya seç<input id="rs-file" type="file" accept=".json,.txt,application/json,text/plain"></label><div class="small muted" id="rs-file-name"></div><div class="field"><label for="rs-txt">Ya da yedek metnini yapıştır</label><textarea id="rs-txt" placeholder="Kopyaladığın yedeği buraya yapıştır"></textarea></div><div class="field"><label for="rs-pw">Şifre (yedek şifreliyse)</label><input id="rs-pw" type="password" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn ghost" data-act="rs-go">Yedeği yükle</button>','Yükleme mevcut verilerin yerine geçer. PIN ayarın korunur.')
   +sec('İşlemleri dışa aktar','<button class="btn ghost" data-act="csv">İşlemleri CSV olarak kaydet</button><button class="btn ghost" data-act="csv-copy">CSV metnini kopyala</button><div class="err" id="f-err"></div>','CSV; Excel ve tablo uygulamalarında açılır. '+S.tx.length+' işlem.')
   +sec('İşlemleri içe aktar','<label class="btn ghost filebtn">Dosya seç<input id="im-file" type="file" accept=".csv,.txt,text/csv,text/plain"></label><div class="small muted" id="im-file-name"></div><div class="field"><label for="im-txt">Ya da CSV metnini yapıştır</label><textarea id="im-txt" placeholder="İlk satır başlık olmalı, örn: Tarih; Açıklama; Tutar"></textarea></div><div class="field"><label for="im-acct">Hesap sütunu yoksa bu hesaba ekle</label><select id="im-acct">'+opts(ACCS(),ACCS().filter(function(a){return acctType(a)==='banka';})[0]||ACCS()[0])+'</select></div><div class="err" id="f-err4"></div><button class="btn ghost" data-act="im-go">İçe aktar</button>','Wallet’ın kendi CSV’si ya da banka ekstresi (Tarih, Tutar, Açıklama sütunları). Eksi tutarlar gider, artılar gelir sayılır; kategori, otomatik kurallarına göre seçilir. Aynı kayıtlar tekrar eklenmez.')
   +sec('Örnek veriler',(hasSample()?'<button class="btn ghost" data-act="sample-clear">Örnek verileri sil</button>':'<button class="btn ghost" data-act="sample-load">Örnek verileri yükle</button>'),'Örnek veriler kendi kayıtlarının yanına eklenir ve işaretlidir, istediğinde silebilirsin.')
   +sec('Tüm verileri sil','<button class="btn danger" data-act="reset-all">Tüm verileri sil</button>','Bu cihazdaki tüm işlemler, hesaplar, notlar, hedefler, ayarlar, PIN'+(nb('wipe')?', otomatik yedek dosyası ve planlanmış hatırlatmalar':'')+' silinir. Geri alınamaz; önce yedek almak isteyebilirsin.');
}

/* ---------- PIN ve kilit ---------- */
function cyrb(str){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(16);}
function pinHash(pin,salt){var str=salt+':'+pin;
  if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return pad(x.toString(16)).slice(-2);}).join('');});
  return Promise.resolve('x'+cyrb(str));}
function bioOk(){if(!nb('bioAvail'))return false;try{return !!NB.bioAvail();}catch(e){return false;}}
function lockHtml(){
  var logo='<span class="logo biglogo" role="img" aria-label="Wallet"></span>';
  if(ui.forgot)return logo+'<h2 style="margin:0">PIN’ini mi unuttun?</h2><p class="small muted" style="max-width:320px;text-align:center;margin:0">PIN kurtarılamaz. Devam edersen bu cihazdaki tüm Wallet verileri silinir ve kilit kalkar. Yedeğin varsa sonra geri yükleyebilirsin.</p><button class="btn danger" style="max-width:320px" data-act="lk-reset">Tüm verileri sil ve kilidi kaldır</button><button class="btn ghost" style="max-width:320px" data-act="lk-back">Vazgeç</button>';
  var dots='';for(var i=0;i<4;i++)dots+='<i class="'+(i<ui.pinBuf.length?'on':'')+'"></i>';
  var wait=Date.now()<ui.lockUntil,keys=['1','2','3','4','5','6','7','8','9',S.bio&&bioOk()?'b':'','0','<'];
  return logo+'<h2 style="margin:0">PIN gir</h2><div class="dots">'+dots+'</div><div class="err" style="min-height:1.3em">'+esc(ui.lkMsg||'')+'</div><div class="keypad">'+keys.map(function(k){if(k==='')return '<span></span>';if(k==='b')return '<button class="key" data-act="lk-bio" aria-label="Parmak izi ile aç">'+ic('shield')+'</button>';return '<button class="key" data-act="lk" data-v="'+k+'"'+(wait?' disabled':'')+' aria-label="'+(k==='<'?'Sil':k)+'">'+(k==='<'?'←':k)+'</button>';}).join('')+'</div><button class="linkbtn" data-act="lk-forgot">PIN’imi unuttum</button>';
}
function lockNow(){ui.locked=true;ui.pinBuf='';ui.lkMsg='';ui.forgot=false;closeSheet();render();askBio();}
function askBio(){if(ui.locked&&S.pin&&S.bio&&bioOk()&&nb('bioAuth')){try{NB.bioAuth();}catch(e){}}}
window.walletBio=function(ok){if(ok&&ui.locked){ui.locked=false;ui.pinBuf='';ui.fails=0;ui.lkMsg='';render();}};

/* ---------- yedek ---------- */
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s);}
function unb64(s){var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
function deriveKey(pw,salt){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']).then(function(k){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);});}
function encText(text,pw){var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  return deriveKey(pw,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(text));}).then(function(ct){return JSON.stringify({wallet:1,s:b64(salt),i:b64(iv),d:b64(ct)});});}
function decText(o,pw){var salt=unb64(o.s),iv=unb64(o.i);return deriveKey(pw,salt).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:iv},k,unb64(o.d));}).then(function(b){return new TextDecoder().decode(b);});}
function exportJson(){var c=JSON.parse(JSON.stringify(S));delete c.pin;delete c.bkKey;return JSON.stringify(c);}
function csvCell(x){x=String(x==null?'':x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}
function txTypeName(t){return ({inc:'Gelir',exp:'Gider',trf:'Transfer',adj:'Bakiye düzeltmesi'})[t.type]||(t.type==='inv'?(t.side==='sell'?'Yatırım satışı':'Yatırım alımı'):(t.type==='dbt'?(t.side==='in'?'Borç alındı':'Borç ödemesi'):t.type));}
function csvAll(){var rows=[['Tarih','Tür','Kategori','Tutar','Hesap','Karşı hesap','Not','Giriş tutarı','Para birimi']];
  S.tx.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).forEach(function(t){rows.push([t.date,txTypeName(t),t.type==='inc'||t.type==='exp'||t.type==='trf'?(t.cat||''):mvLabel(t),nv(t.amt),t.acct,t.to||'',t.note||'',t.amt2?nv(t.amt2):'',ccyOf(t.acct)]);});
  return '﻿'+rows.map(function(r){return r.map(csvCell).join(';');}).join('\r\n');}
function saveFile(name,data,okText,id){
  if(!dl&&NB&&nb('save')){var rr='err';try{rr=NB.save(name,String(data));}catch(e){}msg(rr==='ok'?(okText||'Kaydedildi.')+' İndirilenler klasörüne bakın.':'Dosya kaydedilemedi. Kopyala düğmesini dene.',rr==='ok',id);return;}
  if(!dl){try{var bl=new Blob([data],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u);},1000);msg(okText||'Kaydedildi.',true,id);}catch(e){msg('Dosya kaydedilemedi. Kopyala düğmesini dene.',false,id);}return;}
  dl.save({filename:name,data:data}).then(function(){msg(okText||'Kaydedildi.',true,id);},function(err){msg(err&&err.code==='declined'?'Kaydetme iptal edildi.':'Dosya kaydedilemedi. Kopyala düğmesini dene.',false,id);});
}
function copyText(text,id,okText){
  try{navigator.clipboard.writeText(text).then(function(){msg(okText||'Kopyalandı.',true,id);},function(){msg('Kopyalanamadı. Dosya olarak kaydetmeyi dene.',false,id);});}
  catch(e){msg('Kopyalanamadı. Dosya olarak kaydetmeyi dene.',false,id);}
}
function allNotesText(){return S.notes.filter(function(n){return !n.trash;}).map(function(n){return (n.title||'Başlıksız')+(n.arch?' (arşiv)':'')+'\n\n'+n.body;}).join('\n\n----------\n\n');}
/* yedek metni: yedek şifresi ayarlıysa AES-256 ile şifreli (Yedekten yükle'de aynı şifreyle açılır) */
function backupText(){
  var j=exportJson(),k=S.bkKey;
  if(!k||!(window.crypto&&crypto.subtle))return Promise.resolve(j);
  var iv=crypto.getRandomValues(new Uint8Array(12));
  return crypto.subtle.importKey('raw',unb64(k.k),{name:'AES-GCM'},false,['encrypt']).then(function(key){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(j));}).then(function(ct){return JSON.stringify({wallet:1,s:k.s,i:b64(iv),d:b64(ct)});});
}
/* otomatik yedek: İndirilenler/Wallet klasörüne; döner Promise<bool> */
function autoBackup(force){
  if(!nb('autoBackup')||(!S.autoBk&&!force)||hasSample()&&!force)return Promise.resolve(false);
  return backupText().then(function(text){var r='err';try{r=NB.autoBackup(text);}catch(e){}
    if(r==='ok'){S.bkTs=Date.now();S.bkEnc=!!S.bkKey;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}return true;}return false;},function(){return false;});
}
function setBkPw(pw){var salt=crypto.getRandomValues(new Uint8Array(16));
  return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,256);}).then(function(bits){S.bkKey={s:b64(salt),k:b64(bits)};save();});}

/* ---------- hesaplayıcılar ---------- */
var CALCS={
  kredi:{name:'Kredi',fields:[['amt','Kredi tutarı (₺)',100000],['rate','Aylık faiz (%)',3.5],['n','Vade (ay)',24],['tax','Vergi: KKDF + BSMV (%)',25]],
    run:function(v){var P=v.amt,n=Math.round(v.n),r=v.rate/100*(1+v.tax/100);if(P<=0||n<=0)return '<div class="empty">Tutar ve vadeyi gir.</div>';if(n>600)return '<div class="empty">Vade en fazla 600 ay (50 yıl) olabilir.</div>';if(v.rate<0||v.tax<0)return '<div class="empty">Faiz ve vergi sıfır ya da pozitif olmalı.</div>';
      var pay=r===0?P/n:P*r/(1-Math.pow(1+r,-n)),bal=P,tot=0,rows='';
      for(var i=1;i<=n;i++){var it=bal*r,pr=pay-it;bal-=pr;tot+=it;rows+='<tr><td>'+i+'</td><td>'+TRY2.format(pay)+'</td><td>'+TRY2.format(pr)+'</td><td>'+TRY2.format(it)+'</td><td>'+TRY2.format(Math.max(bal,0))+'</td></tr>';}
      return res([['Aylık taksit',TRY2.format(pay),1],['Toplam geri ödeme',TRY2.format(pay*n)],[v.tax>0?'Toplam faiz ve vergi':'Toplam faiz',TRY2.format(tot)],['Yıllık bileşik maliyet','%'+NUM2.format((Math.pow(1+r,12)-1)*100)]])
       +'<p class="small muted">İhtiyaç ve taşıt kredisinde faize KKDF (%15) ve BSMV (%10) eklenir. Konut kredisinde oranlar farklıdır; bankanın ödeme planıyla karşılaştır.</p>'
       +'<details><summary>Ödeme planı</summary><div class="scroll-x"><table><thead><tr><th>Ay</th><th>Taksit</th><th>Anapara</th><th>Faiz+vergi</th><th>Kalan</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';}},
  birikim:{name:'Birikim',fields:[['p','Başlangıç tutarı (₺)',50000],['c','Aylık katkı (₺)',5000],['rate','Yıllık getiri (%)',40],['y','Süre (yıl)',5]],
    run:function(v){var n=Math.round(v.y*12);if(n<=0)return '<div class="empty">Süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var fv=r===0?v.p+v.c*n:v.p*g+v.c*(g-1)/r,put=v.p+v.c*n;
      return res([['Dönem sonu tutar',TRY0.format(fv),1],['Toplam yatırılan',TRY0.format(put)],['Kazanılan getiri',TRY0.format(fv-put)]])+'<p class="small muted">Aylık bileşik getiri varsayılır. Vergi ve enflasyon dahil değildir.</p>';}},
  mevduat:{name:'Mevduat',fields:[['p','Anapara (₺)',100000],['rate','Yıllık brüt faiz (%)',45],['d','Vade (gün)',32],['tax','Stopaj (%)',17.5]],
    run:function(v){if(v.p<=0||v.d<=0)return '<div class="empty">Anapara ve vadeyi gir.</div>';var g=v.p*v.rate/100*v.d/365,tx=g*v.tax/100,net=g-tx;
      return res([['Net getiri',TRY2.format(net),1],['Brüt faiz',TRY2.format(g)],['Stopaj',TRY2.format(tx)],['Vade sonu toplam',TRY2.format(v.p+net)],['Net yıllık oran','%'+NUM2.format(net/v.p*365/v.d*100)]])+'<p class="small muted">Stopaj oranı vadeye göre değişir; bankanın uyguladığı oranı yaz.</p>';}},
  hedef:{name:'Hedef',fields:[['t','Hedef tutar (₺)',500000],['p','Mevcut birikim (₺)',50000],['m','Süre (ay)',36],['rate','Yıllık getiri (%)',30]],
    run:function(v){var n=Math.round(v.m);if(n<=0||v.t<=0)return '<div class="empty">Hedef tutar ve süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var need=r===0?(v.t-v.p)/n:(v.t-v.p*g)*r/(g-1);if(need<0)need=0;
      return res([['Aylık ayırman gereken',TRY2.format(need),1],['Toplam yatıracağın',TRY0.format(need*n+v.p)],['Getiriden gelen',TRY0.format(Math.max(v.t-need*n-v.p,0))]])+(need===0?'<p class="small muted">Mevcut birikimin getiriyle hedefe ulaşır.</p>':'');}},
  enflasyon:{name:'Enflasyon',fields:[['a','Tutar (₺)',100000],['inf','Yıllık enflasyon (%)',35],['y','Süre (yıl)',3],['nom','Yıllık nominal getiri (%)',40]],
    run:function(v){if(v.y<0)return '<div class="empty">Süreyi gir.</div>';var f=Math.pow(1+v.inf/100,v.y),realRate=((1+v.nom/100)/(1+v.inf/100)-1)*100;
      return res([['Bugünkü alım gücünü korumak için',TRY0.format(v.a*f),1],['Bugünkü tutarın o günkü değeri',TRY0.format(v.a/f)],['Reel getiri (yıllık)',(realRate>=0?'+%':'−%')+NUM2.format(Math.abs(realRate))],['Getiri sonrası reel değer',TRY0.format(v.a*Math.pow(1+v.nom/100,v.y)/f)]]);}},
  doviz:{name:'Döviz çevirici',fields:[['a','Tutar',1000]],ccy:true,
    run:function(v){var from=ui.cfrom||'USD',to=ui.cto||'TRY',rf=rateOf(from),rt=rateOf(to);if(!(rf>0)||!(rt>0))return '<div class="empty">Bu kur için veri yok. Üstteki yenile düğmesine dokun.</div>';
      var out=v.a*rf/rt;return res([[NUM2.format(v.a)+' '+CCYS_SHORT[from],fmtC(out,to,1),1],['1 '+CCYS_SHORT[from],fmtC(rf/rt,to,1)]])+'<p class="small muted">Güncel satış kuru ile hesaplanır'+(S.fxTs?' ('+esc(fmtTs(S.fxTs))+')':'')+'.</p>';}}
};
Object.keys(CALCS).forEach(function(k){var f=CALCS[k].run;CALCS[k].run=function(v){var h='';try{h=f(v);}catch(e){h='';}
  if(!h||/NaN|Infinity|undefined/.test(String(h).replace(/<[^>]*>/g,' ')))return '<div class="empty">Değerleri kontrol et, sonuç hesaplanamadı.</div>';return h;};});
function vArac(){
  var key=CALCS[ui.calc]?ui.calc:'kredi',c=CALCS[key];if(!ui.cv[key]){ui.cv[key]={};c.fields.forEach(function(f){ui.cv[key][f[0]]=nv(f[2]);});}
  var h=fireCard()+'<div class="calcseg">'+Object.keys(CALCS).map(function(k){return '<button class="chip" data-act="calc" data-v="'+k+'" aria-pressed="'+(k===key)+'">'+CALCS[k].name+'</button>';}).join('')+'</div>';
  h+='<div class="card"><div class="two" style="gap:12px">'+c.fields.map(function(f){return '<div class="field"><label for="c-'+f[0]+'">'+esc(f[1])+'</label><input id="c-'+f[0]+'" class="calc-in" data-k="'+f[0]+'" inputmode="decimal" value="'+esc(ui.cv[key][f[0]])+'"></div>';}).join('')
    +(c.ccy?'<div class="field"><label for="c-from">Kaynak</label>'+ccySel('c-from',ui.cfrom||'USD')+'</div><div class="field"><label for="c-to">Hedef</label>'+ccySel('c-to',ui.cto||'TRY')+'</div>':'')+'</div></div>';
  h+='<div class="card" id="calc-out">'+calcOut()+'</div>';return h;
}
function calcOut(){var key=CALCS[ui.calc]?ui.calc:'kredi',c=CALCS[key],v={},m=maskOn;c.fields.forEach(function(f){v[f[0]]=num(ui.cv[key][f[0]]);});maskOn=false;try{return c.run(v);}finally{maskOn=m;}}

/* ---------- render ---------- */
function pageInfo(){
  var p=ui.page;
  if(p.k==='fire')return {title:'Finansal özgürlük',body:vFire};
  if(p.k==='araclar')return {title:'Hesaplayıcılar',body:vArac};
  if(p.k==='ayarlar')return {title:'Ayarlar',body:vAyarlar};
  if(p.k==='set'&&p.s==='notlar')return {title:'Not ayarları',body:setNotlar};
  if(p.k==='set'){var s=SETS.filter(function(x){return x.id===p.s;})[0]||SETS[SETS.length-1];return {title:s.t,body:function(){return setBody(s.id);}};}
  var n=p.id&&byId(S.notes,p.id);
  return {title:p.id?(n&&n.trash?'Çöp kutusundaki not':(n&&n.arch?'Arşivdeki not':'Not')):'Yeni not',body:vNote};
}
function render(){
  TXV++;
  try{snap();}catch(e){}
  var L=document.getElementById('lock');
  document.body.classList.toggle('locked',!!ui.locked);
  if(ui.locked){L.hidden=false;L.innerHTML=lockHtml();return;}
  L.hidden=true;L.innerHTML='';
  applyTheme();
  document.documentElement.style.fontSize=(16*(+S.fs||1))+'px';
  maskOn=!!S.hide&&!ui.page;
  var hd=document.getElementById('hdr'),vw=document.getElementById('view');
  if(ui.page){
    var P=pageInfo();
    hd.innerHTML='<button class="icon-btn" data-act="back" aria-label="Geri">'+ic('back')+'</button><h1>'+esc(P.title)+'</h1>';
    vw.innerHTML=P.body();
  }else{
    hd.innerHTML='<h1><span class="logo" role="img" aria-label="Wallet logosu"></span>Wallet</h1><span class="hbtns"><button class="icon-btn" id="rfb" data-act="refresh" aria-label="Yenile: güncel kurlar ve piyasalar" title="Yenile">'+ic('refresh')+'</button><button class="icon-btn" data-act="open-settings" aria-label="Ayarlar" title="Ayarlar">'+ic('cog')+'</button></span>';
    vw.innerHTML=vMain();
    var sb=document.getElementById('secbar'),on=sb&&sb.querySelector('[aria-pressed="true"]');
    if(on&&(on.offsetLeft<sb.scrollLeft||on.offsetLeft+on.offsetWidth>sb.scrollLeft+sb.clientWidth))sb.scrollLeft=on.offsetLeft-16;
    var qa=document.getElementById('qa');if(qa&&ui.qaX)qa.scrollLeft=ui.qaX;
    edgeFade('secbar','secwrap');edgeFade('qa','qawrap');
  }
  document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px');
  document.getElementById('fab').hidden=!(!ui.page&&(ui.sub==='islem'||ui.sub==='hesap'||(ui.sub==='plan'&&ui.plan==='butce')));
}
function persistUi(){try{localStorage.setItem(UIKEY,JSON.stringify({sub:ui.sub,nv:ui.nv,plan:ui.plan}));}catch(e){}}
/* eski bölüm adları (Bütçe, Düzenli, Hedefler) Planlama'nın alt sekmelerine gider */
function mapSec(s){if(PLANS.some(function(x){return x[0]===s;})){ui.plan=s;return 'plan';}return SECS.some(function(x){return x[0]===s;})?s:'islem';}
function restoreUi(){
  try{var u=JSON.parse(localStorage.getItem(UIKEY)||'{}');
    if(PLANS.some(function(x){return x[0]===u.plan;}))ui.plan=u.plan;
    if(u.sub)ui.sub=mapSec(u.sub);else if(u.tab==='portfoy'||u.tab==='notlar')ui.sub=u.tab;
    if(u.nv==='arch'||u.nv==='trash')ui.nv=u.nv;}catch(e){}
  var h=(location.hash||'').slice(1);
  ui.page=pageFromHash(h);
  if(h&&!ui.page){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
}
/* adres çubuğundaki #… ile sayfa eşleşmesi (tarayıcı/telefon geri tuşu için) */
function pageFromHash(h){if(h==='fire')return {k:'fire'};if(h==='araclar')return {k:'araclar'};if(h==='ayarlar')return {k:'ayarlar'};if(/^ayar-[a-z]+$/.test(h))return {k:'set',s:h.slice(5)};return null;}
function openPage(p,hash){closeSheet();ui.page=p;try{if(hash)location.hash=hash;}catch(e){}render();window.scrollTo(0,0);}
function finishPage(){if(ui.page&&ui.page.k==='note')saveNote();}
function closePage(){finishPage();var p=ui.page;ui.page=(p&&p.k==='set'&&p.from==='ayarlar')?{k:'ayarlar'}:null;render();try{if(location.hash.length>1)history.back();}catch(e){}}
function goSec(s){closeSheet();if(ui.page){finishPage();ui.page=null;try{if(location.hash.length>1)history.back();}catch(e){}}ui.sub=mapSec(s);persistUi();render();scrollToSec();}

/* ---------- alt pencereler (sheet) ---------- */
function openSheet(inner){document.getElementById('sheet-root').innerHTML='<div class="sheet-bg" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in">'+inner+'</div></div>';}
function closeSheet(){var r=document.getElementById('sheet-root');if(r)r.innerHTML='';}
function sheetOpen(){return !!document.getElementById('sheet-root').innerHTML;}
function opts(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}
function acctOpts(sel,none){return (none?'<option value="">'+esc(none)+'</option>':'')+ACCS().map(function(a){return '<option value="'+esc(a)+'"'+(a===sel?' selected':'')+'>'+esc(a)+(ccyOf(a)!=='TRY'?' ('+CSYM[ccyOf(a)]+')':'')+'</option>';}).join('');}
function delBtn(act,id,label){return '<button class="btn danger" data-act="'+act+'" data-id="'+id+'">'+(label||'Sil')+'</button>';}
function armed(btn){if(btn.dataset.armed){return true;}btn.dataset.armed='1';btn.textContent='Emin misin? Tekrar dokun';return false;}
function ferr(m){var e=document.getElementById('f-err');if(e){e.textContent=m;e.style.color='var(--exp)';}}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function badName(n){return /^(__proto__|constructor|prototype)$/.test(n);}
var txType='exp',txOrig=null;
function lastSel(type,k,list){var l=S.last&&S.last[type];var v=l&&l[k];return list.indexOf(v)>=0?v:undefined;}
function defAcct(type){var acc=ACCS();return lastSel(type,'acct',acc)||(acc.indexOf(S.defAcct)>=0?S.defAcct:acc[0]);}
function txSheet(id,force,pre){
  pre=pre||{};
  var t=id?byId(S.tx,id):null;
  if(t&&(t.type==='inv'||t.type==='dbt'||t.type==='adj'))return mvSheet(t);
  txOrig=t;txType=t?t.type:(force||'exp');
  var acc=ACCS(),canTrf=acc.length>1;if(txType==='trf'&&!canTrf){toast('Transfer için en az iki hesap gerekli. Önce hesap ekle.');aSheet(null);return;}
  var cats=txType==='inc'?INCC():EXPC(),trf=txType==='trf';
  var a0=t?t.acct:(pre.acct&&acc.indexOf(pre.acct)>=0?pre.acct:defAcct(txType));
  var to0=(t&&t.to)||(pre.to&&acc.indexOf(pre.to)>=0&&pre.to!==a0?pre.to:acc.filter(function(a){return a!==a0;})[0]);
  openSheet('<h2>'+esc(t?'İşlemi düzenle':(pre.title||'Yeni işlem'))+'</h2><div class="seg" id="f-type"><button data-act="tx-type" data-v="exp" aria-pressed="'+(txType==='exp')+'">Gider</button><button data-act="tx-type" data-v="inc" aria-pressed="'+(txType==='inc')+'">Gelir</button>'+(canTrf?'<button data-act="tx-type" data-v="trf" aria-pressed="'+trf+'">Transfer</button>':'')+'</div>'
   +'<div class="field"><label for="f-amt" id="lb-amt">Tutar (₺)</label><input id="f-amt" inputmode="decimal" placeholder="0,00" value="'+(t?nv(t.amt):'')+'"></div>'
   +'<div class="two"><div class="field" id="row-cat"'+(trf?' hidden':'')+'><label for="f-cat">Kategori</label><select id="f-cat">'+(t&&!trf?optsKeep(cats,t.cat):opts(cats,pre.cat&&cats.indexOf(pre.cat)>=0?pre.cat:lastSel(txType,'cat',cats)))+'</select></div><div class="field"><label for="f-acct" id="lb-acct">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="f-acct">'+acctOpts(a0)+'</select></div><div class="field" id="row-to"'+(trf?'':' hidden')+'><label for="f-to">Giriş hesabı</label><select id="f-to">'+acctOpts(to0)+'</select></div></div>'
   +'<div class="field" id="row-amt2" hidden><label for="f-amt2" id="lb-amt2">Giriş tutarı</label><input id="f-amt2" inputmode="decimal" placeholder="0,00" value="'+(t&&t.amt2?nv(t.amt2):'')+'"></div>'
   +'<div class="two"><div class="field"><label for="f-date">Tarih</label><input id="f-date" type="date" value="'+(t?t.date:todayS())+'"></div><div class="field"><label for="f-note">Not</label><input id="f-note" placeholder="İsteğe bağlı" value="'+esc(t?t.note:'')+'"></div></div>'
   +'<div class="balprev" id="f-bal" aria-live="polite"></div><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-tx" data-id="'+(t?t.id:'')+'">Kaydet</button>'+(t?'<button class="btn ghost" data-act="dup-tx" data-id="'+t.id+'">Bugüne kopyala</button>'+delBtn('del-tx',t.id):''));
  syncCcy();
  if(!t)setTimeout(function(){var e=document.getElementById('f-amt');if(e)e.focus();},60);
}
/* işlem penceresinde bakiye önizlemesi: kaydedince hesabın ne olacağı anında görünür */
function balPreview(){
  var box=document.getElementById('f-bal');if(!box)return;
  var a=val('f-acct'),to=val('f-to'),amt=r2(num(val('f-amt'))),a2=r2(num(val('f-amt2')));
  var nt={type:txType,amt:amt,acct:a};if(txType==='trf'){nt.to=to;if(!document.getElementById('row-amt2').hidden)nt.amt2=a2;}
  var line=function(acc){var cur=acctBal(acc);if(txOrig)cur=r2(cur-txDelta(txOrig,acc));var nw=r2(cur+(amt>0?txDelta(nt,acc):0));
    return '<div><span class="muted">'+esc(acc)+':</span> <span class="num">'+moneyIn(cur,acc)+'</span>'+(amt>0&&nw!==cur?' → <b class="num '+(nw<cur?'exp':'inc')+'">'+moneyIn(nw,acc)+'</b>':'')+'</div>';};
  var m=maskOn;maskOn=false;try{box.innerHTML=line(a)+(txType==='trf'&&to&&to!==a?line(to):'');}finally{maskOn=m;}
}
function syncCcy(){
  var a=document.getElementById('f-acct'),lb=document.getElementById('lb-amt');if(!a||!lb)return;
  var c=ccyOf(a.value);lb.textContent='Tutar ('+CSYM[c]+')';
  var row=document.getElementById('row-amt2'),to=document.getElementById('f-to');
  var cross=txType==='trf'&&to&&ccyOf(to.value)!==c;
  if(row){row.hidden=!cross;if(cross){document.getElementById('lb-amt2').textContent='Giriş tutarı ('+CSYM[ccyOf(to.value)]+')';var i2=document.getElementById('f-amt2'),v1=num(val('f-amt'));if(i2&&!i2.dataset.manual&&v1>0&&rateOf(c)>0&&rateOf(ccyOf(to.value))>0)i2.value=nv(r2(v1*rateOf(c)/rateOf(ccyOf(to.value))));}}
  balPreview();
}
/* borç, yatırım ve düzeltme hareketleri için sade düzenleme penceresi */
function mvSheet(t){
  txOrig=t;txType=t.type;
  var info=t.type==='inv'?'Varlığın adedi ve maliyeti Portföy’den değişir; burada yalnızca hesaba yansıyan tutar düzenlenir.':(t.type==='dbt'?(t.side==='out'?'Bu ödeme borcun kalan tutarından düşülür.':'Borç olarak alınan para hesaba eklenmiştir.'):'Hesap bakiyesini gerçek bakiyeyle eşitlemek için eklenen düzeltme. Artı ya da eksi olabilir.');
  openSheet('<h2>'+esc(mvLabel(t))+'</h2><p class="small muted" style="margin:0">'+esc(info)+'</p>'
   +'<div class="two"><div class="field"><label for="m-amt">Tutar ('+CSYM[ccyOf(t.acct)]+')</label><input id="m-amt" inputmode="decimal" value="'+nv(t.amt)+'"></div><div class="field"><label for="m-acct">Hesap</label><select id="m-acct">'+acctOpts(t.acct)+'</select></div></div>'
   +'<div class="two"><div class="field"><label for="m-date">Tarih</label><input id="m-date" type="date" value="'+t.date+'"></div><div class="field"><label for="m-note">Not</label><input id="m-note" value="'+esc(t.note||'')+'" placeholder="İsteğe bağlı"></div></div>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-mv" data-id="'+t.id+'">Kaydet</button>'+delBtn('del-tx',t.id));
}
/* bir kategorinin bu dönemdeki işlemleri (grafik, bütçe ve kategori satırından açılır) */
function catSheet(c){
  var k=ui.month,l=monthTx(k).filter(function(t){return t.type==='exp'&&t.cat===c||t.type==='inc'&&t.cat===c;}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var tot=r2(l.reduce(function(a,t){return a+(t.type==='exp'?txTL(t):0);},0)),inc=r2(l.reduce(function(a,t){return a+(t.type==='inc'?txTL(t):0);},0)),avg=catAvg(k)[c]||0,lim=+S.budgets[c]||0;
  var info=[];if(avg>0)info.push('3 dönem ort. '+TRY0.format(avg));if(lim>0)info.push('limit '+TRY0.format(lim)+(tot>lim?' · '+TRY0.format(tot-lim)+' aşıldı':' · '+TRY0.format(lim-tot)+' kaldı'));
  openSheet('<div class="ghead"><span class="dot" style="background:'+color(c)+';width:14px;height:14px"></span><h2 style="margin:0;flex:1">'+esc(c)+'</h2></div><div><div class="lbl">'+esc(plabel(k))+'</div><p class="big" style="margin:0">'+TRY0.format(tot||inc)+'</p>'+(info.length?'<div class="small muted">'+esc(info.join(' · '))+'</div>':'')+'</div>'
   +(l.length?'<div class="list">'+l.map(txRow).join('')+'</div>':'<div class="small muted">Bu dönemde bu kategoride işlem yok.</div>')
   +'<button class="btn ghost" data-act="cat-new" data-v="'+esc(c)+'">Bu kategoriye ekle</button>');
}
function grpAccts(kind){return ACCS().filter(function(a){return acctType(a)===kind;});}
/* hesap detayı: bakiye, son hareketler ve hızlı işlemler */
function acctSheet(a){
  if(ACCS().indexOf(a)<0)return;
  var b=acctBal(a),t=acctType(a),c=ccyOf(a),x=ax(a),recent=S.tx.filter(function(q){return q.acct===a||q.to===a;}).sort(function(p,q){return q.date.localeCompare(p.date);}).slice(0,6);
  var extra=[];if(c!=='TRY'&&rateOf(c)>0)extra.push('≈ '+TRY0.format(toTL(b,a)));if(t==='kart'){if(+x.limit>0)extra.push('Limit '+moneyIn(+x.limit,a,1)+' · kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)extra.push('Son ödeme günü: ayın '+x.due+'’i');}
  var ab=function(act,icn,lb){return '<button data-act="'+act+'" data-id="'+esc(a)+'"><span class="c" style="--c:var(--accent)">'+ic(icn)+'</span><span class="t">'+lb+'</span></button>';};
  openSheet('<div class="ghead"><span class="sic" style="--c:'+color(a)+'">'+ic(t==='nakit'?'cash':(t==='kart'?'card':(t==='birikim'?'coins':'bank')))+'</span><span class="mid"><h2 style="margin:0">'+esc(a)+'</h2><div class="small muted">'+esc(typeName(t)+(c!=='TRY'?' · '+CCYN[c]:''))+'</div></span><button class="icon-btn" data-act="edit-a" data-id="'+esc(a)+'" aria-label="Hesabı düzenle">'+ic('gear')+'</button></div>'
   +'<div><div class="lbl">'+(t==='kart'&&b<0?'Kart borcu':'Bakiye')+'</div><p class="big'+(b<0?' exp':'')+'" style="margin:0">'+moneyIn(t==='kart'&&b<0?-b:b,a)+'</p>'+(extra.length?'<div class="small muted">'+esc(extra.join(' · '))+'</div>':'')+'</div>'
   +'<div class="qa grid4">'+ab('acct-exp','exp','Harcama')+ab('acct-inc','inc','Gelir')+ab('acct-trf','swap',t==='kart'?'Borç öde':'Transfer')+ab('acct-rec','scale','Bakiye eşitle')+'</div>'
   +'<div><div class="lbl" style="margin-bottom:2px">Son hareketler</div>'+(recent.length?'<div class="list">'+recent.map(txRow).join('')+'</div>':'<div class="small muted" style="padding:8px 0">Henüz hareket yok.</div>')+'</div>'
   +(recent.length?'<button class="btn ghost" data-act="acct-all" data-id="'+esc(a)+'">Tüm hareketleri göster</button>':''));
}
function grpSheet(kind){
  var l=grpAccts(kind),title=kind==='nakit'?'Cüzdanım':'Banka hesapları';
  if(l.length===1)return acctSheet(l[0]);
  if(!l.length)return aSheet(null,kind);
  var tot=r2(l.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
  openSheet('<h2>'+title+'</h2><div><div class="lbl">Toplam</div><p class="big" style="margin:0">'+TRY0.format(tot)+'</p></div><div class="list">'+l.map(acctLine).join('')+'</div><button class="btn ghost" data-act="new-a" data-v="'+kind+'">'+(kind==='nakit'?'Nakit cüzdanı ekle':'Banka hesabı ekle')+'</button>');
}
/* gerçek bakiye girilince fark işlem olarak eklenir */
function recSheet(a){
  var b=acctBal(a),t=acctType(a);
  openSheet('<h2>Bakiyeyi eşitle · '+esc(a)+'</h2><p class="small muted" style="margin:0">'+(t==='nakit'?'Cüzdanındaki parayı say ve gir.':'Bankadaki ya da ekstredeki güncel bakiyeyi gir.')+(t==='kart'?' Kartta borç varsa eksi yaz (örn. -2500).':'')+'</p>'
   +'<div class="field"><label for="rc-amt">Gerçek bakiye ('+CSYM[ccyOf(a)]+')</label><input id="rc-amt" inputmode="decimal" value="'+nv(b)+'"></div><div class="small muted">Wallet’taki bakiye: <span class="num">'+moneyIn(b,a)+'</span></div><div class="balprev" id="rc-diff"></div>'
   +'<button class="row-tgl" id="rc-mode" data-act="rc-mode" role="switch" aria-checked="true"><span class="mid"><div class="t">Farkı gelir/gider olarak kaydet</div><div class="small muted">Kapalıysa yalnızca bakiye düzeltilir, gelir-gider raporlarına girmez</div></span><span class="sw"></span></button>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="rc-save" data-id="'+esc(a)+'">Eşitle</button>');
}
function debtListSheet(){
  if(!S.debts.length)return dSheet(null);
  var tot=debtManual(),cd=wealth().g.cardDebt;
  openSheet('<h2>Borçlarım</h2><div><div class="lbl">Kalan borç</div><p class="big exp" style="margin:0">'+TRY0.format(tot+cd)+'</p>'+(cd>0?'<div class="small muted">Kredi kartı borçları '+TRY0.format(cd)+' dahil</div>':'')+'</div><div class="list">'+S.debts.map(function(d){var l=debtLeft(d);return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="small muted">'+esc(d.type)+'</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div><button class="btn" data-act="new-d">Borç ekle</button><p class="small muted" style="margin:0">Ödeme yapmak için borca dokun.</p>');
}
function dSheet(id){
  var d=id?byId(S.debts,id):null,left=d?debtLeft(d):0,paid=d?debtPaid(d):0;
  var pay=d&&left>0?'<div class="card stack" style="gap:10px;background:var(--bg)"><h2 style="margin:0">Ödeme yap</h2><div class="two"><div class="field"><label for="dp-amt">Anapara (₺)</label><input id="dp-amt" inputmode="decimal" placeholder="Örn. '+nv(Math.min(left,5000))+'"></div><div class="field"><label for="dp-int">Faiz ve masraf (₺)</label><input id="dp-int" inputmode="decimal" placeholder="Varsa"></div></div><div class="two"><div class="field"><label for="dp-acct">Ödeme hesabı</label><select id="dp-acct">'+acctOpts(grpAccts('banka')[0]||defAcct('exp'))+'</select></div><div class="field"><label for="dp-date">Tarih</label><input id="dp-date" type="date" value="'+todayS()+'"></div></div><div class="err" id="f-err2"></div><button class="btn" data-act="pay-d" data-id="'+d.id+'">Ödemeyi kaydet</button><p class="small muted" style="margin:0">Anapara borçtan düşer; faiz ve masraf gider olarak kaydedilir. İkisi de hesabından çıkar.</p></div>':'';
  openSheet('<h2>'+(d?'Borç: '+esc(d.name):'Borç ekle')+'</h2>'+(d?'<div class="row3" style="margin:0"><div><div class="lbl">Toplam</div><span class="num">'+TRY0.format(d.amt)+'</span></div><div><div class="lbl">Ödenen</div><span class="num inc">'+TRY0.format(paid)+'</span></div><div><div class="lbl">Kalan</div><span class="num exp">'+TRY0.format(left)+'</span></div></div><div class="bar"><i style="width:'+(d.amt>0?clamp(paid/d.amt*100,0,100):0)+'%"></i></div>':'')+pay
   +'<div class="field"><label for="d-name">Ad</label><input id="d-name" placeholder="Örn. Taşıt kredisi" value="'+esc(d?d.name:'')+'"></div><div class="two"><div class="field"><label for="d-type">Tür</label><select id="d-type">'+optsKeep(DTYPES,d&&d.type)+'</select></div><div class="field"><label for="d-amt">'+(d?'Toplam borç (₺)':'Kalan borç (₺)')+'</label><input id="d-amt" inputmode="decimal" value="'+(d?nv(d.amt):'')+'"></div></div>'
   +(d?'':'<div class="field"><label for="d-acct">Para bir hesaba girdi mi?</label><select id="d-acct">'+acctOpts('', 'Hayır, eski borç')+'</select></div><p class="small muted" style="margin:0">Yeni çektiğin kredi ya da aldığın borç para bir hesaba yattıysa seç: o hesabın bakiyesi artar, net servetin değişmez.</p>')
   +'<div class="err" id="f-err"></div><button class="btn'+(d?' ghost':'')+'" data-act="save-d" data-id="'+(d?d.id:'')+'">'+(d?'Bilgileri kaydet':'Kaydet')+'</button>'+(d?delBtn('del-d',d.id,'Borcu sil'):''));
}
function hSheet(id,kind){
  var x=id?byId(S.holdings,id):null;kind=x?hKind(x):(kind==='asset'?'asset':'inv');
  if(kind==='asset'){
    openSheet('<h2>'+(x?'Varlığı düzenle':'Varlık ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Ev, araba" value="'+esc(x?x.name:'')+'"></div>'
     +'<div class="two"><div class="field"><label for="h-type">Tür</label><select id="h-type">'+optsKeep(ASTT,x&&x.type)+'</select></div><div class="field"><label for="h-price">Güncel değer (₺)</label><input id="h-price" inputmode="decimal" value="'+(x?nv(x.price):'')+'"></div></div>'
     +'<div class="field"><label for="h-cost">Alış değeri (₺)</label><input id="h-cost" inputmode="decimal" placeholder="Bilmiyorsan boş bırak" value="'+(x&&x.cost!==x.price?nv(x.cost):'')+'"></div>'
     +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div>')
     +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="asset">Kaydet</button>'+(x?'<button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button>'+delBtn('del-h',x.id):''));
    return;
  }
  var co='<option value=""'+(x&&x.ccy?'':' selected')+'>Elle girilen fiyat</option>'+FXK.map(function(k){return '<option value="'+k+'"'+(x&&x.ccy===k?' selected':'')+'>'+FXL[k]+' kuru</option>';}).join('');
  openSheet('<h2>'+(x?'Yatırımı düzenle':'Yatırım ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Gram altın, THYAO" value="'+esc(x?x.name:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="h-type">Tür</label><select id="h-type">'+optsKeep(INVT,x&&x.type)+'</select></div><div class="field"><label for="h-ccy">Fiyat kaynağı</label><select id="h-ccy">'+co+'</select></div></div>'
   +'<div class="two"><div class="field"><label for="h-qty" id="lb-hqty">Adet / miktar</label><input id="h-qty" inputmode="decimal" value="'+(x?nv(x.qty):'')+'"></div><div class="field"><label for="h-cost">Ortalama maliyet (₺)</label><input id="h-cost" inputmode="decimal" value="'+(x?nv(x.cost):'')+'"></div></div>'
   +'<div class="field" id="row-hprice"><label for="h-price">Güncel fiyat (₺)</label><input id="h-price" inputmode="decimal" placeholder="Boş bırakırsan maliyet kullanılır" value="'+(x?nv(x.price):'')+'"></div>'
   +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div><p class="small muted" style="margin:0" id="h-hint"></p>')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="inv">Kaydet</button>'+(x?'<div class="two"><button class="btn ghost" data-act="h-buy" data-id="'+x.id+'">Al</button><button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></div>'+delBtn('del-h',x.id):''));
  syncH();
}
function syncH(){var c=val('h-ccy'),r=document.getElementById('row-hprice'),q=document.getElementById('lb-hqty');if(r)r.hidden=!!c;if(q)q.textContent=({XAU:'Miktar (gram)',XAG:'Miktar (gram)',CEY:'Adet',USD:'Miktar ($)',EUR:'Miktar (€)',GBP:'Miktar (£)',CHF:'Miktar (CHF)'})[c]||'Adet / miktar';
  var hh=document.getElementById('h-hint');if(hh){var qn=num(val('h-qty')),cs=num(val('h-cost'));hh.textContent=val('h-acct')&&qn>0&&cs>0?'Seçtiğin hesaptan '+TRY2.format(qn*cs)+' düşülecek.':'';}}
function tradeSheet(id,side){
  var x=byId(S.holdings,id);if(!x)return;var ast=hKind(x)==='asset',p=hPrice(x);
  openSheet('<h2>'+esc(x.name)+' · '+(side==='buy'?'Al':'Sat')+'</h2><div class="small muted">Elindeki: '+(ast?'1 adet':qtyTxt(x))+' · ort. maliyet '+TRY2.format(x.cost)+' · güncel '+TRY2.format(p)+'</div>'
   +'<div class="two">'+(ast?'':'<div class="field"><label for="tr-qty">Miktar</label><input id="tr-qty" inputmode="decimal" value="'+(side==='sell'?nv(x.qty):'')+'"></div>')+'<div class="field"><label for="tr-price">'+(ast?'Satış tutarı (₺)':'Birim fiyat (₺)')+'</label><input id="tr-price" inputmode="decimal" value="'+nv(r2(p))+'"></div>'+(ast?'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>':'')+'</div>'
   +'<div class="two"><div class="field"><label for="tr-acct">'+(side==='buy'?'Ödeme hesabı':'Paranın gireceği hesap')+'</label><select id="tr-acct">'+acctOpts(defAcct('exp'),'Hesaba yansıtma')+'</select></div>'+(ast?'':'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>')+'</div>'
   +'<div class="balprev" id="tr-prev"></div><div class="err" id="f-err"></div><button class="btn" data-act="trade" data-id="'+x.id+'" data-v="'+side+'">'+(side==='buy'?'Alımı kaydet':'Satışı kaydet')+'</button>');
  tradePrev();
}
function tradePrev(){var box=document.getElementById('tr-prev');if(!box)return;var btn=document.querySelector('[data-act="trade"]'),x=btn&&byId(S.holdings,btn.dataset.id);if(!x)return;
  var ast=hKind(x)==='asset',q=ast?1:num(val('tr-qty')),p=num(val('tr-price')),side=btn.dataset.v;if(!(q>0&&p>0)){box.textContent='';return;}
  var m=maskOn;maskOn=false;try{box.innerHTML='Tutar: <b class="num">'+TRY2.format(q*p)+'</b>'+(side==='sell'?' · Kâr/zarar: <b class="num '+((p-x.cost)>=0?'inc':'exp')+'">'+sgn((p-x.cost)*q)+'</b>':' · Yeni ort. maliyet: <b class="num">'+TRY2.format((x.qty*x.cost+q*p)/(x.qty+q))+'</b>');}finally{maskOn=m;}}
function gSheet(id){
  var g=id?byId(S.goals,id):null;
  openSheet('<h2>'+(g?'Hedefi düzenle':'Yeni hedef')+'</h2><div class="field"><label for="g-name">Ad</label><input id="g-name" placeholder="Örn. Yaz tatili" value="'+esc(g?g.name:'')+'"></div><div class="two"><div class="field"><label for="g-target">Hedef tutar (₺)</label><input id="g-target" inputmode="decimal" value="'+(g?nv(g.target):'')+'"></div><div class="field" id="row-gsaved"><label for="g-saved">Biriken (₺)</label><input id="g-saved" inputmode="decimal" value="'+(g?nv(g.saved||0):'0')+'"></div></div>'
   +'<div class="two"><div class="field"><label for="g-acct">Bağlı hesap</label><select id="g-acct">'+acctOpts(g?g.acct||'':'','Yok, elle takip et')+'</select></div><div class="field"><label for="g-date">Hedef tarih</label><input id="g-date" type="date" value="'+(g&&g.date?g.date:'')+'"></div></div><p class="small muted" style="margin:0">Bir birikim hesabı bağlarsan biriken tutar o hesabın bakiyesinden gelir; para eklemek hesaplar arası transfer olur.</p><div class="err" id="f-err"></div><button class="btn" data-act="save-g" data-id="'+(g?g.id:'')+'">Kaydet</button>'+(g?delBtn('del-g',g.id):''));
  syncG();
}
function syncG(){var r=document.getElementById('row-gsaved');if(r)r.hidden=!!val('g-acct');}
function gaddSheet(id){
  var g=byId(S.goals,id);if(!g)return;var linked=g.acct&&ACCS().indexOf(g.acct)>=0;
  openSheet('<h2>'+esc(g.name)+' · para ekle</h2><div class="small muted">Biriken '+TRY0.format(goalSaved(g))+' / '+TRY0.format(g.target)+'</div><div class="field"><label for="ga-amt">Tutar (₺)</label><input id="ga-amt" inputmode="decimal" placeholder="0,00"></div>'
   +(linked?'<div class="field"><label for="ga-from">Hangi hesaptan</label><select id="ga-from">'+acctOpts(ACCS().filter(function(a){return a!==g.acct;})[0])+'</select></div><p class="small muted" style="margin:0">'+esc(g.acct)+' hesabına transfer yapılır.</p>':'<p class="small muted" style="margin:0">Bu hedef elle takip ediliyor; hesap bakiyeleri değişmez. Bir birikim hesabına bağlamak için hedefi düzenle.</p>')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="ga-save" data-id="'+g.id+'">Ekle</button>');
  setTimeout(function(){var e=document.getElementById('ga-amt');if(e)e.focus();},60);
}
function birSheet(){
  var sa=grpAccts('birikim'),tot=r2(sa.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
  if(!S.goals.length&&!sa.length)return gSheet(null);
  openSheet('<h2>Birikim</h2>'+(sa.length?'<div><div class="lbl">Birikim hesaplarında</div><p class="big" style="margin:0">'+TRY0.format(tot)+'</p></div><div class="list">'+sa.map(acctLine).join('')+'</div>':'')
   +(S.goals.length?'<div class="lbl">Hedefler</div><div class="list">'+S.goals.map(function(g){var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;return '<div class="item"><span class="mid"><div class="t">'+esc(g.name)+'</div><div class="bar" style="margin:6px 0 2px"><i style="width:'+p+'%"></i></div><div class="small muted num">'+TRY0.format(s)+' / '+TRY0.format(g.target)+'</div></span><button class="btn small ghost" data-act="goal-add" data-id="'+g.id+'">Ekle</button></div>';}).join('')+'</div>':'')
   +'<div class="two"><button class="btn" data-act="new-g">Yeni hedef</button><button class="btn ghost" data-act="new-a" data-v="birikim">Birikim hesabı</button></div>');
}
function rSheet(id){
  var r=id?byId(S.recurring,id):null,a0=r?r.acct:defAcct('exp');
  openSheet('<h2>'+(r?'Ödemeyi düzenle':'Yeni düzenli ödeme')+'</h2><div class="field"><label for="r-name">Ad</label><input id="r-name" placeholder="Örn. İnternet faturası" value="'+esc(r?r.name:'')+'"></div><div class="two"><div class="field"><label for="r-amt" id="lb-ramt">Tutar ('+CSYM[ccyOf(a0)]+')</label><input id="r-amt" inputmode="decimal" value="'+(r?nv(r.amt):'')+'"></div><div class="field"><label for="r-day">Ayın kaçı</label><input id="r-day" inputmode="numeric" maxlength="2" value="'+(r?r.day:'')+'"></div></div><div class="two"><div class="field"><label for="r-cat">Kategori</label><select id="r-cat">'+(r?optsKeep(EXPC(),r.cat):opts(EXPC(),EXPC().indexOf('Fatura')>=0?'Fatura':undefined))+'</select></div><div class="field"><label for="r-acct">Hesap</label><select id="r-acct">'+acctOpts(a0)+'</select></div></div>'
   +(S.debts.length?'<div class="field"><label for="r-debt">Bir borcun taksidi mi?</label><select id="r-debt"><option value="">Hayır</option>'+S.debts.map(function(d){return '<option value="'+d.id+'"'+(r&&r.debt===d.id?' selected':'')+'>'+esc(d.name)+'</option>';}).join('')+'</select></div>':'')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-r" data-id="'+(r?r.id:'')+'">Kaydet</button>'+(r?delBtn('del-r',r.id):''));
}
function aSheet(a,kind){
  var ex=a!=null&&ACCS().indexOf(a)>=0,used=ex&&acctUsed(a),t=ex?acctType(a):(kind||'banka'),c=ex?ccyOf(a):'TRY',x=ex?ax(a):{};
  var cs=used?'<div class="static">'+CCYN[c]+'</div>':'<select id="a-ccy" data-prev="'+c+'">'+CCYS.map(function(k){return '<option value="'+k+'"'+(k===c?' selected':'')+'>'+CCYN[k]+'</option>';}).join('')+'</select>';
  openSheet('<h2>'+(ex?'Hesabı düzenle':'Yeni hesap')+'</h2>'
   +'<div class="field"><label for="a-name">Ad</label><input id="a-name" placeholder="Örn. Maaş hesabı" value="'+esc(ex?a:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="a-type">Tür</label><select id="a-type">'+ATYPES.map(function(y){return '<option value="'+y[0]+'"'+(y[0]===t?' selected':'')+'>'+y[1]+'</option>';}).join('')+'</select></div><div class="field">'+(used?'<span class="flbl">Para birimi</span>':'<label for="a-ccy">Para birimi</label>')+cs+'</div></div>'
   +'<div class="two"><div class="field"><label for="a-open" id="lb-aopen">Başlangıç bakiyesi ('+CSYM[c]+')</label><input id="a-open" inputmode="decimal" placeholder="0" value="'+(ex?nv(+S.opening[a]||0):'')+'"></div><div class="field" id="row-due"'+(t==='kart'?'':' hidden')+'><label for="a-due">Son ödeme günü</label><input id="a-due" inputmode="numeric" maxlength="2" placeholder="Örn. 15" value="'+(x.due||'')+'"></div></div>'
   +'<div class="field" id="row-limit"'+(t==='kart'?'':' hidden')+'><label for="a-limit">Kart limiti</label><input id="a-limit" inputmode="decimal" placeholder="İsteğe bağlı" value="'+(x.limit?nv(x.limit):'')+'"></div>'
   +'<p class="small muted" style="margin:0" id="a-hint"></p><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-a" data-id="'+esc(ex?a:'')+'">Kaydet</button>'
   +(ex?(used||ACCS().length<2?'<p class="small muted" style="margin:0;text-align:center">'+(used?'Hareketi ya da bağlı kaydı olduğu için bu hesap silinemez.':'Son hesap silinemez.')+'</p>':delBtn('del-a',esc(a))):''));
  syncA();
}
function syncA(conv){
  var t=val('a-type'),c=document.getElementById('a-ccy'),h=document.getElementById('a-hint'),l=document.getElementById('lb-aopen');
  ['row-due','row-limit'].forEach(function(id){var r=document.getElementById(id);if(r)r.hidden=t!=='kart';});
  if(c&&l){l.textContent='Başlangıç bakiyesi ('+CSYM[c.value]+')';
    if(conv){var prev=c.dataset.prev||'TRY',o=document.getElementById('a-open'),v=num(o&&o.value),rp=rateOf(prev),rn=rateOf(c.value);
      if(o&&v&&rp>0&&rn>0){o.value=nv(r2(v*rp/rn));if(h){h.textContent='Bakiye güncel kurla çevrildi: '+fmtC(v,prev,1)+' = '+fmtC(v*rp/rn,c.value,1)+'. Hesaptaki gerçek tutar farklıysa düzelt.';}c.dataset.prev=c.value;return;}
      c.dataset.prev=c.value;}}
  if(h)h.textContent=t==='kart'?'Kartta borcun varsa başlangıç bakiyesine eksi yaz (örn. -2500). Son ödeme günü girersen yaklaşınca hatırlatılır.':'Başlangıç bakiyesi, Wallet’ı kullanmaya başladığın andaki paradır.'+(document.getElementById('a-ccy')?'':' Hareketi olan hesabın para birimi değişmez.');
}
function renameAcct(old,nw){
  S.accounts=S.accounts.map(function(x){return x===old?nw:x;});
  S.tx.forEach(function(x){if(x.acct===old)x.acct=nw;if(x.to===old)x.to=nw;});
  S.recurring.forEach(function(r){if(r.acct===old)r.acct=nw;});
  S.goals.forEach(function(g){if(g.acct===old)g.acct=nw;});
  if(S.accx[old]){S.accx[nw]=S.accx[old];delete S.accx[old];}
  if(Object.prototype.hasOwnProperty.call(S.opening,old)){S.opening[nw]=S.opening[old];delete S.opening[old];}
  ['exp','inc','trf'].forEach(function(k){if(S.last&&S.last[k]&&S.last[k].acct===old)S.last[k].acct=nw;});
  if(S.defAcct===old)S.defAcct=nw;if(ui.acctF===old)ui.acctF=nw;
}

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
ACT['open-settings']=function(){openPage({k:'ayarlar'},'ayarlar');};
ACT.tgl=function(el,id,v){setP(v,!getP(v));if(v==='secure')applySecure();if(v==='sms.on'){if(nb('smsSet')){try{NB.smsSet(!!S.sms.on);}catch(e){}}if(S.sms.on&&smsState()!=='granted'&&nb('askSms')){try{NB.askSms();}catch(e){}}}if(v==='alerts.push'&&S.alerts.push&&notifState()!=='granted'&&nb('askNotif')){try{NB.askNotif();}catch(e){}}save();render();};
ACT.setv=function(el,id,v){var x=el.dataset.x;if(/^-?\d+(\.\d+)?$/.test(x))x=Number(x);setP(v,x);save();render();};

/* hızlı işlem daireleri; kullanım sayısı sırayı belirler */
function qaCount(k){S.qaUse=S.qaUse||{};S.qaUse[k]=(+S.qaUse[k]||0)+1;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
ACT['qa-inc']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-inc');txSheet(null,'inc',{title:'Gelir ekle'});};
ACT['qa-exp']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-exp');txSheet(null,'exp',{title:'Gider ekle'});};
ACT['qa-cash']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-cash');grpSheet('nakit');};
ACT['qa-bank']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-bank');grpSheet('banka');};
ACT['qa-trf']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-trf');txSheet(null,'trf',{title:'Transfer'});};
ACT['qa-debt']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-debt');debtListSheet();};
ACT['qa-inv']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-inv');hSheet(null,'inv');};
ACT['qa-save']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-save');birSheet();};
ACT['qa-asset']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-asset');hSheet(null,'asset');};
ACT['qa-calc']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-calc');openPage({k:'araclar'},'araclar');};
ACT['qa-inv-view']=function(){goSec('portfoy');};
ACT['qa-asset-view']=function(){goSec('portfoy');};

/* işlemler */
ACT['new-tx']=function(){txSheet();};
ACT['edit-tx']=function(el,id){txSheet(id);};
ACT['tx-type']=function(el,id,v){
  txType=v;
  document.querySelectorAll('#f-type button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===v));});
  var trf=v==='trf';
  document.getElementById('row-cat').hidden=trf;document.getElementById('row-to').hidden=!trf;
  document.getElementById('lb-acct').textContent=trf?'Çıkış hesabı':'Hesap';
  if(!trf){var c=document.getElementById('f-cat'),cl=v==='exp'?EXPC():INCC(),keep=txOrig&&txOrig.type===v?txOrig.cat:lastSel(v,'cat',cl);c.innerHTML=txOrig&&txOrig.type===v?optsKeep(cl,keep):opts(cl,keep);delete c.dataset.manual;if(!txOrig){var ac=document.getElementById('f-acct'),as=lastSel(v,'acct',ACCS());if(as)ac.value=as;}}
  else{var fa=document.getElementById('f-acct'),ft=document.getElementById('f-to');if(ft&&fa&&ft.value===fa.value){var o=ACCS().filter(function(a){return a!==fa.value;})[0];if(o)ft.value=o;}}
  syncCcy();
};
ACT['save-tx']=function(el,id){
  var amt=r2(num(val('f-amt')));if(amt<=0){ferr('Tutarı sıfırdan büyük gir.');return;}
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
  if(!id)toast((txType==='inc'?'Gelir':(txType==='exp'?'Gider':'Transfer'))+' kaydedildi · '+o.acct+': '+moneyIn(acctBal(o.acct),o.acct));
};
ACT['save-mv']=function(el,id){var t=byId(S.tx,id);if(!t)return;var amt=r2(num(val('m-amt')));
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
ACT['acct-all']=function(el,id){ui.acctF=id;ui.filter='all';ui.tq='';goSec('islem');};
ACT['rc-mode']=function(el){el.setAttribute('aria-checked',String(el.getAttribute('aria-checked')!=='true'));};
ACT['rc-save']=function(el,a){
  if(ACCS().indexOf(a)<0)return;var real=r2(num(val('rc-amt'))),cur=acctBal(a),diff=r2(real-cur);
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
  var op=r2(num(val('a-open'))),cs=document.getElementById('a-ccy');
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
  else{var q=num(val('h-qty'));if(q<=0){ferr('Miktarı gir.');return;}var co=num(val('h-cost')),cc=val('h-ccy');if(co<0||num(val('h-price'))<0){ferr('Maliyet ve fiyat eksi olamaz.');return;}if(co<=0&&!cc&&num(val('h-price'))<=0){ferr('Maliyet ya da güncel fiyat gir.');return;}
    h={name:nm,type:val('h-type'),kind:'inv',ccy:cc,qty:q,cost:co||(cc?rateOf(cc):num(val('h-price'))),price:num(val('h-price'))||co||rateOf(cc)};}
  var acct=val('h-acct');
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
  var tl=q*p;if(acct&&!(r2(fromTL(tl,acct))>0)){ferr('Tutar bu hesabın para biriminde çok küçük.');return;}
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
  var n=val('d-name').trim(),a=r2(num(val('d-amt')));if(!n){ferr('Bir ad yaz.');return;}if(a<=0){ferr('Tutarı gir.');return;}
  var o={name:n,type:val('d-type'),amt:a};
  if(id){var d0=byId(S.debts,id);Object.assign(d0,o);delete d0.sample;}
  else{o.id=uid();S.debts.push(o);var acct=val('d-acct');if(acct&&ACCS().indexOf(acct)>=0&&r2(fromTL(a,acct))>0)S.tx.push({id:uid(),type:'dbt',side:'in',debt:o.id,dname:n,amt:r2(fromTL(a,acct)),acct:acct,date:todayS(),note:''});}
  save();closeSheet();render();toast(id?'Borç güncellendi':n+' eklendi');
};
ACT['pay-d']=function(el,id){
  var d=byId(S.debts,id);if(!d)return;var p=r2(num(val('dp-amt'))),it=r2(num(val('dp-int'))),acct=val('dp-acct'),dt=val('dp-date')||todayS();
  if(p<=0&&it<=0){msg('Ödeme tutarını gir.',false,'f-err2');return;}
  var left=debtLeft(d);if(p>left+0.005){msg('Anapara kalan borçtan ('+TRY0.format(left)+') fazla olamaz.',false,'f-err2');return;}
  if(ACCS().indexOf(acct)<0||!(rateOf(ccyOf(acct))>0)){msg('Ödeme hesabını seç.',false,'f-err2');return;}
  if((p>0&&!(r2(fromTL(p,acct))>0))||(it>0&&!(r2(fromTL(it,acct))>0))){msg('Tutar bu hesabın para biriminde çok küçük.',false,'f-err2');return;}
  if(r2(fromTL(p,acct))>0)S.tx.push({id:uid(),type:'dbt',side:'out',debt:d.id,dname:d.name,amt:r2(fromTL(p,acct)),acct:acct,date:dt,note:''});
  if(r2(fromTL(it,acct))>0)S.tx.push({id:uid(),type:'exp',amt:r2(fromTL(it,acct)),cat:ensureCat('exp','Faiz ve masraf'),acct:acct,date:dt,note:d.name+' faizi'});
  delete d.sample;if(pk(dt)!==ui.month)ui.month=pk(dt);save();render();dSheet(d.id);toast('Ödeme kaydedildi · kalan borç '+TRY0.format(debtLeft(d)));
};
ACT['del-d']=function(el,id){if(!armed(el))return;S.debts=S.debts.filter(function(x){return x.id!==id;});S.recurring.forEach(function(r){if(r.debt===id)delete r.debt;});save();closeSheet();render();};

/* hedefler */
ACT['new-g']=function(){gSheet();};ACT['edit-g']=function(el,id){gSheet(id);};
ACT['save-g']=function(el,id){
  var gn=val('g-name').trim(),gt=num(val('g-target'));if(!gn){ferr('Bir ad yaz.');return;}if(gt<=0){ferr('Hedef tutarı gir.');return;}
  var ga=val('g-acct'),go={name:gn,target:r2(gt),saved:r2(num(val('g-saved'))),date:val('g-date'),acct:ACCS().indexOf(ga)>=0?ga:''};
  if(id){var g0=byId(S.goals,id);Object.assign(g0,go);delete g0.sample;}else{go.id=uid();S.goals.push(go);}
  save();closeSheet();render();
};
ACT['del-g']=function(el,id){if(!armed(el))return;S.goals=S.goals.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT['goal-add']=function(el,id){gaddSheet(id);};
ACT['ga-save']=function(el,id){
  var g=byId(S.goals,id);if(!g)return;var a=r2(num(val('ga-amt')));if(a<=0){ferr('Tutarı gir.');return;}
  if(g.acct&&ACCS().indexOf(g.acct)>=0){var from=val('ga-from');if(ACCS().indexOf(from)<0||from===g.acct){ferr('Başka bir hesap seç.');return;}
    var t={id:uid(),type:'trf',amt:r2(fromTL(a,from)),acct:from,to:g.acct,cat:'Transfer',date:todayS(),note:g.name+' hedefine'};if(ccyOf(from)!==ccyOf(g.acct))t.amt2=r2(fromTL(a,g.acct));if(!(t.amt>0)){ferr('Hesabın kuru yok.');return;}S.tx.push(t);}
  else g.saved=r2((+g.saved||0)+a);
  delete g.sample;save();closeSheet();render();toast(g.name+': '+TRY0.format(goalSaved(g))+' / '+TRY0.format(g.target));
};

/* düzenli ödemeler */
ACT['new-r']=function(){rSheet();};ACT['edit-r']=function(el,id){rSheet(id);};
ACT['save-r']=function(el,id){
  var rn=val('r-name').trim(),ra=r2(num(val('r-amt'))),rd=Math.round(num(val('r-day')));
  if(!rn){ferr('Bir ad yaz.');return;}if(ra<=0){ferr('Tutarı gir.');return;}if(rd<1||rd>31){ferr('Gün 1 ile 31 arasında olmalı.');return;}
  var ro={name:rn,amt:ra,day:rd,cat:val('r-cat'),acct:val('r-acct')},db=val('r-debt');
  if(id){var r0=byId(S.recurring,id);Object.assign(r0,ro);if(db)r0.debt=db;else delete r0.debt;delete r0.sample;}else{ro.id=uid();ro.paid={};if(db)ro.debt=db;S.recurring.push(ro);}
  save();closeSheet();render();
};
ACT['del-r']=function(el,id){if(!armed(el))return;S.recurring=S.recurring.filter(function(x){return x.id!==id;});save();closeSheet();render();};
ACT.rpay=function(el,id){var r=byId(S.recurring,id);if(!r)return;var d=r.debt&&byId(S.debts,r.debt),tx;
  if(d&&debtLeft(d)>0)tx={id:uid(),type:'dbt',side:'out',debt:d.id,dname:d.name,amt:r.amt,acct:r.acct,note:r.name,date:dueDate(r,ui.month)};
  else tx={id:uid(),type:'exp',amt:r.amt,cat:r.cat,acct:r.acct,note:r.name,date:dueDate(r,ui.month)};
  S.tx.push(tx);r.paid=r.paid||{};r.paid[ui.month]=tx.id;save();render();toast(r.name+' ödendi · '+r.acct+': '+moneyIn(acctBal(r.acct),r.acct));};
ACT.rundo=function(el,id){var r=byId(S.recurring,id);if(r&&r.paid){var pid=r.paid[ui.month];S.tx=S.tx.filter(function(x){return x.id!==pid;});delete r.paid[ui.month];save();render();}};

/* notlar */
function noteSet(id,fn,text,undo){var n=byId(S.notes,id);if(!n)return;var before={arch:n.arch,trash:n.trash,pin:n.pin};fn(n);delete n.sample;save();render();if(text)toast(text,undo===false?null:function(){n.arch=before.arch;n.trash=before.trash;n.pin=before.pin;save();render();});}
ACT.nview=function(el,id,v){ui.nv=v;ui.nq='';persistUi();render();};
ACT['new-n']=function(){ui.nv='act';openPage({k:'note',id:null,draft:{title:'',body:'',pin:false},dirty:false},'not');};
ACT['edit-n']=function(el,id){var n=byId(S.notes,id);if(!n)return;openPage({k:'note',id:id,draft:{title:n.title||'',body:n.body||'',pin:!!n.pin},dirty:false},'not');};
ACT['n-pin']=function(el,id){noteSet(id,function(n){n.pin=!n.pin;},'',false);};
ACT['n-arch']=function(el,id){noteSet(id,function(n){n.arch=true;n.pin=false;},'Not arşivlendi');};
ACT['n-unarch']=function(el,id){noteSet(id,function(n){n.arch=false;},'Not arşivden çıkarıldı');};
ACT['n-trash']=function(el,id){noteSet(id,function(n){n.trash=Date.now();},'Not çöp kutusuna taşındı');};
ACT['n-restore']=function(el,id){noteSet(id,function(n){delete n.trash;},'Not geri yüklendi');};
ACT['n-purge']=function(el,id){if(S.nset.confirmDel&&!armed(el)){el.classList.add('armed');toast('Kalıcı silmek için çöp kutusu simgesine tekrar dokun');return;}S.notes=S.notes.filter(function(x){return x.id!==id;});save();render();toast('Not kalıcı olarak silindi');};
ACT['n-empty']=function(el){if(!armed(el))return;S.notes=S.notes.filter(function(n){return !n.trash;});save();render();toast('Çöp kutusu boşaltıldı');};
ACT['note-pin']=function(){var p=ui.page;p.draft.pin=!p.draft.pin;p.dirty=true;var b=document.querySelector('[data-act="note-pin"]');if(b)b.setAttribute('aria-checked',String(p.draft.pin));};
ACT['note-save']=function(){var d=ui.page.draft;if(!d.title.trim()&&!d.body.trim()){msg('Başlık ya da not yaz.');return;}saveNote();closePage();toast('Not kaydedildi');};
ACT['note-arch']=function(){var p=ui.page;if(!p.id){var d=p.draft;if(!d.title.trim()&&!d.body.trim()){msg('Önce bir şey yaz.');return;}p.dirty=true;}saveNote();var n=byId(S.notes,p.id);if(!n)return;var was=n.arch;closePage();noteSet(n.id,function(x){x.arch=!was;if(!was)x.pin=false;},was?'Not arşivden çıkarıldı':'Not arşivlendi');};
ACT['note-trash']=function(){var p=ui.page;if(!p.id){p.dirty=false;closePage();return;}saveNote();var id=p.id;closePage();noteSet(id,function(x){x.trash=Date.now();},'Not çöp kutusuna taşındı');};
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
ACT['lk-reset']=function(el){if(!armed(el))return;wipeAll();};
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
ACT['bk-auto']=function(){msg('Yedekleniyor…',true,'f-bka');autoBackup(true).then(function(ok){if(ok)render();msg(ok?'Yedek İndirilenler/Wallet klasörüne yazıldı'+(S.bkKey?' (şifreli).':'.'):'Yedek yazılamadı.',ok,'f-bka');});};
ACT['bk-pw-set']=function(){var a=val('bkp1'),b=val('bkp2');if(a.length<6){msg('Şifre en az 6 karakter olmalı.',false,'f-bka');return;}if(a!==b){msg('İki şifre aynı olmalı.',false,'f-bka');return;}
  if(!(window.crypto&&crypto.subtle)){msg('Bu görünümde şifreleme kullanılamıyor.',false,'f-bka');return;}
  setBkPw(a).then(function(){return autoBackup(true);}).then(function(){render();msg('Yedekler artık şifreli.',true,'f-bka');});};
ACT['bk-pw-del']=function(el){if(!armed(el))return;delete S.bkKey;save();autoBackup(true).then(function(){render();});};
function shareText(name,text,id){
  if(nb('shareFile')){var r='err';try{r=NB.shareFile(name,text);}catch(e){}if(r!=='ok')msg('Paylaşılamadı.',false,id);return;}
  try{var f=new File([text],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Wallet yedeği'}).catch(function(){});return;}}catch(e){}
  saveFile(name,text,'Yedek kaydedildi.',id);
}
ACT['bk-share']=function(){backupText().then(function(t){shareText(S.bkKey?'wallet-yedek-sifreli.json':'wallet-yedek.json',t,'f-bka');});};
ACT['bk-share2']=function(){var t=val('bk-out');if(!t){msg('Önce yedek hazırla.',false,'f-err3');return;}shareText(val('bk-pw')?'wallet-yedek-sifreli.json':'wallet-yedek.json',t,'f-err3');};
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
  var apply=function(d){if(!d||!Array.isArray(d.tx))throw new Error('x');var keep=S.pin,bio=S.bio,bk=S.bkKey;S=norm(d);S.pin=keep||null;S.bio=!!keep&&bio;if(bk)S.bkKey=bk;ui.month=curP();save();render();msg('Yedek yüklendi: '+S.tx.length+' işlem, '+S.accounts.length+' hesap.',true,'f-err2');};
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
function csvDate(s){s=String(s||'').trim();var m;
  if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);
  if((m=s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/)))return m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);
  return '';}
function csvKey(h){h=fold(h).trim();
  if(/^(giris tutari|amt2)/.test(h))return 'amt2';
  if(/^(para birimi|currency|doviz cinsi)/.test(h))return 'ccy';
  if(/^(islem tarihi|tarih|date)/.test(h))return 'date';
  if(/^(tur|islem turu|type)$/.test(h))return 'type';
  if(/^(kategori|category)/.test(h))return 'cat';
  if(/^(islem tutari|tutar|miktar|amount)/.test(h))return 'amt';
  if(/^(karsi hesap|to)$/.test(h))return 'to';
  if(/^(hesap|account)/.test(h))return 'acct';
  if(/^(not|aciklama|islem aciklamasi|description|note)/.test(h))return 'note';
  return '';}
function txSig(t){return [t.date,t.type,t.side||'',t.type==='inc'||t.type==='exp'?(t.cat||''):'',r2(t.amt).toFixed(2),t.acct,t.to||'',t.note||'',t.amt2?r2(t.amt2).toFixed(2):''].join('|');}
function csvImport(text,defAcct0){
  var rows=csvParse(text);if(rows.length<2)return {err:'Başlık satırı ve en az bir kayıt gerekli.'};
  var map={};rows[0].forEach(function(h,i){var k=csvKey(h);if(k&&map[k]==null)map[k]=i;});
  if(map.date==null||map.amt==null)return {err:'“Tarih” ve “Tutar” sütunları bulunamadı.'};
  var seen={};S.tx.forEach(function(t){var k=txSig(t);seen[k]=(seen[k]||0)+1;});
  var add=[],dup=0,bad=0,newA=[],newC=[],aCcy={},defA=(defAcct0&&ACCS().indexOf(defAcct0)>=0)?defAcct0:ACCS()[0];
  var ruleCat=function(note,type){var n=fold(note),l=type==='inc'?INCC():EXPC();var r=S.rules.filter(function(x){return x.kw&&n.indexOf(fold(x.kw))>-1&&l.indexOf(x.cat)>=0;})[0];return r?r.cat:'';};
  rows.slice(1).forEach(function(r){
    var g=function(k){return map[k]==null?'':String(r[map[k]]==null?'':r[map[k]]).trim();};
    var date=csvDate(g('date')),raw=num(g('amt')),tv=fold(g('type')),type,side;
    if(!date||!raw){bad++;return;}
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
    if(type==='inc'||type==='exp')t.cat=g('cat')||ruleCat(nt,type)||(type==='inc'?'Diğer gelir':'Diğer');else if(type==='trf')t.cat='Transfer';
    if(type==='trf')t.to=to;var a2=r2(num(g('amt2')));if(type==='trf'&&a2>0)t.amt2=a2;if(nt)t.note=nt;
    if(type==='inv')t.hname=(g('cat')||'').replace(/^Yatırım (alımı|satışı) · /,'');if(type==='dbt')t.dname=(g('cat')||'').replace(/^Borç (alındı|ödemesi) · /,'');
    var cc=g('ccy').toUpperCase();if(CCYS.indexOf(cc)>=0&&!aCcy[acct])aCcy[acct]=cc;
    var k=txSig(t);if(seen[k]>0){seen[k]--;dup++;return;}
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
function wipeAll(){
  try{[KEY,UIKEY].forEach(function(k){localStorage.removeItem(k);});}catch(e){}
  try{sessionStorage.clear();}catch(e){}
  if(nb('wipe')){try{NB.wipe();}catch(e){}}
  S=norm({tx:[]});
  ui.locked=false;ui.forgot=false;ui.page=null;ui.sub='islem';ui.month=curP();ui.filter='all';ui.acctF='';ui.tq='';ui.nq='';ui.nv='act';ui.cv={};
  save();applySecure();
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
  var src=nb('fetchRates')?nativeRates().then(function(j){var o=pickRates(j);if(!(o.USD>0))throw new Error('eksik');return j;}).catch(function(){return siteRates();}):siteRates();
  return src.then(function(j){
    var o=pickRates(j),got=[];
    FXK.forEach(function(k){if(o[k]>0){S.fx[k]=o[k];got.push(k);}});
    S.fxChg={};FXK.forEach(function(k){if(o[k]>0&&o.chg[k]!=null)S.fxChg[k]=o.chg[k];});
    if(o.BIST){S.mkt.BIST=o.BIST;got.push('BIST');}
    if(!got.length){var n=Object.keys((j&&j.items)||j||{}).length;return {ok:false,msg:n?'Veri geldi ama kur bulunamadı.':'Henüz kur verisi yok; biraz sonra tekrar dene.'};}
    S.fxTs=Date.now();S.fxProv=String(o.prov||'');save();
    return {ok:true,got:got,msg:'Güncellendi: USD '+fx1(S.fx.USD)+' · EUR '+fx1(S.fx.EUR)+' · gram altın '+fx1(S.fx.XAU)};
  }).catch(function(){return {ok:false,msg:'Kurlar alınamadı. İnternet bağlantını kontrol et.'};});
}
function busy(){var ae=document.activeElement;return sheetOpen()||ui.locked||!!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));}
function bgRates(){refreshRates().then(function(r){if(r.ok&&!busy())render();});}
ACT['rates-now']=function(){msg('Güncelleniyor…',true,'f-rates');refreshRates({force:true}).then(function(r){if(r.ok)render();msg(r.msg,r.ok,'f-rates');});};
var refreshing=false;
ACT.refresh=function(el){
  if(refreshing)return;refreshing=true;el.classList.add('spin');
  Promise.all([refreshRates({force:true}),checkUpdate()]).then(function(r){refreshing=false;var b=document.getElementById('rfb');if(b)b.classList.remove('spin');
    if(r[0].ok){try{snap();}catch(e){}}if(!sheetOpen())render();toast(r[1]?'Yeni sürüm yükleniyor…':(r[0].ok?'Piyasalar güncellendi · '+fmtTs(S.fxTs):r[0].msg));});
};
function checkUpdate(){try{if(!('serviceWorker' in navigator))return Promise.resolve(false);return navigator.serviceWorker.getRegistration().then(function(rg){if(!rg)return false;return rg.update().then(function(){return !!(rg.installing||rg.waiting);});}).catch(function(){return false;});}catch(e){return Promise.resolve(false);}}
ACT['check-upd']=function(){msg('Denetleniyor…',true,'f-upd');checkUpdate().then(function(n){msg(n?'Yeni sürüm bulundu, yükleniyor…':'Uygulama güncel.',true,'f-upd');});};

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
  if(t&&t.tagName==='INPUT'&&t.closest&&t.closest('.sheet')){var b=t.closest('.sheet').querySelector('.btn[data-act^="save"],.btn[data-act="trade"],.btn[data-act="ga-save"],.btn[data-act="rc-save"]');if(b){e.preventDefault();b.click();}}
});
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');if(!el)return;
  var a=el.dataset.act;if(Object.prototype.hasOwnProperty.call(ACT,a))ACT[a](el,el.dataset.id,el.dataset.v);
});
document.addEventListener('change',function(e){
  var t=e.target,d=t.dataset||{};
  if(t.id==='dccy'||t.id==='dccy2'){S.dccy=t.value;save();if(t.value!=='TRY'&&!(rateOf(t.value)>0)){toast(CCYN[t.value]+' kuru alınıyor…');refreshRates({force:true}).then(function(r){render();if(!r.ok)toast(r.msg);});}render();return;}
  if(t.id==='fi-tccy'){var old=S.fire.tccy,nwc=t.value,tv=+S.fire.target;if(tv>0&&rateOf(old)>0&&rateOf(nwc)>0)S.fire.target=r2(tv*rateOf(old)/rateOf(nwc));S.fire.tccy=nwc;save();render();return;}
  if(t.id==='c-from'||t.id==='c-to'){ui[t.id==='c-from'?'cfrom':'cto']=t.value;var co=document.getElementById('calc-out');if(co)co.innerHTML=calcOut();return;}
  if(t.id==='f-acct'||t.id==='f-to'){syncCcy();}
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
    if(d.bind==='payday')ui.month=curP();
    if(d.bind.indexOf('fx.')===0){S.fxTs=Date.now();if(S.fxChg)delete S.fxChg[d.bind.slice(3)];}
    save();render();return;
  }
  if(d.budget!==undefined){var n=r2(num(t.value));if(n>0)S.budgets[d.budget]=n;else delete S.budgets[d.budget];S.sampleExtras=false;save();render();}
  else if(d.price!==undefined){var h=byId(S.holdings,d.price),pv=num(t.value);if(h&&pv>=0){h.price=pv;delete h.sample;save();render();}}
  else if(t.id==='f-cat'){t.dataset.manual='1';}
  else if(t.id==='im-file'||t.id==='rs-file'){var f=t.files&&t.files[0],ta=document.getElementById(t.id==='im-file'?'im-txt':'rs-txt'),nm=document.getElementById(t.id+'-name');
    if(f){if(nm)nm.textContent=f.name;var fr=new FileReader();fr.onload=function(){if(ta)ta.value=String(fr.result||'');};fr.onerror=function(){if(nm)nm.textContent='Dosya okunamadı.';};fr.readAsText(f);}}
});
document.addEventListener('input',function(e){
  var t=e.target,d=t.dataset||{};
  if(t.classList&&t.classList.contains('calc-in')){var k0=CALCS[ui.calc]?ui.calc:'kredi';ui.cv[k0][d.k]=t.value;document.getElementById('calc-out').innerHTML=calcOut();}
  else if(t.id==='nsearch'){ui.nq=t.value;document.getElementById('nlist').innerHTML=notesList();}
  else if(t.id==='tq'){ui.tq=t.value;var tl=document.getElementById('txlist');if(tl)tl.innerHTML=txList();}
  else if(t.id==='sset'){ui.sq=t.value;document.getElementById('setlist').innerHTML=setList();}
  else if(d.nf&&ui.page&&ui.page.k==='note'){ui.page.draft[d.nf]=t.value;ui.page.dirty=true;}
  else if(t.id==='f-amt'||t.id==='f-amt2'){if(t.id==='f-amt2')t.dataset.manual='1';if(t.id==='f-amt')syncCcy();else balPreview();}
  else if(t.id==='h-qty'||t.id==='h-cost')syncH();
  else if(t.id==='tr-qty'||t.id==='tr-price')tradePrev();
  else if(t.id==='rc-amt'){var bt=document.querySelector('[data-act="rc-save"]'),acc=bt&&bt.dataset.id,box=document.getElementById('rc-diff');if(acc&&box){var df=r2(num(t.value)-acctBal(acc));box.innerHTML=Math.abs(df)<0.005?'Fark yok.':'Fark: <b class="num '+(df<0?'exp':'inc')+'">'+(df<0?'−':'+')+moneyIn(Math.abs(df),acc)+'</b>';}}
  else if(t.id==='f-note'&&txType!=='trf'){
    var txt=fold(t.value),sel=document.getElementById('f-cat');
    if(sel&&!sel.dataset.manual){var r=S.rules.filter(function(x){return x.kw&&txt.indexOf(fold(x.kw))>-1;})[0];
      if(r&&Array.prototype.some.call(sel.options,function(o){return o.value===r.cat;}))sel.value=r.cat;}
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
  if(document.hidden){ui.hiddenAt=Date.now();if(ui.page&&ui.page.k==='note')saveNote();if(S.autoBk&&!hasSample()&&(S.savedAt||0)>(S.bkTs||0))autoBackup();}
  else{
    if(S.pin&&!ui.locked&&ui.hiddenAt&&(Date.now()-ui.hiddenAt)>=(S.pin.auto||0)*60000)lockNow();
    if(!S.fxTs||Date.now()-S.fxTs>300000)bgRates();
    if(ui.month!==curP()&&ui.hiddenAt&&Date.now()-ui.hiddenAt>36e5)ui.month=curP();
    notifyDue();pushPlan();pullSms();
  }
});
window.addEventListener('pagehide',function(){if(ui.page&&ui.page.k==='note')saveNote();});
window.addEventListener('hashchange',function(){
  var h=(location.hash||'').slice(1),cur=ui.page;
  if(cur&&cur.k==='note'&&h==='not')return;
  var want=pageFromHash(h);
  if((!want&&!cur)||(want&&cur&&want.k===cur.k&&want.s===cur.s))return;
  finishPage();closeSheet();ui.page=want;render();window.scrollTo(0,0);
});
/* Android geri tuşu: önce açık pencereyi, sonra sayfayı kapatır, sonra İşlemler'e döner */
window.walletBack=function(){
  if(ui.locked)return false;
  if(sheetOpen()){closeSheet();return true;}
  if(ui.page){closePage();return true;}
  if(ui.sub!=='islem'){ui.sub='islem';persistUi();render();window.scrollTo(0,0);return true;}
  return false;
};
/* yeni sürüm: kullanıcı bir şey yazmıyorsa sessizce yenile, yoksa sor */
try{if('serviceWorker' in navigator){var swHad=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',function(){
  if(!swHad)return;swHad=false;
  if(!busy()&&!ui.page)location.reload();else toast('Yeni sürüm hazır',function(){location.reload();},'Yenile');});}}catch(e){}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});}catch(e){}

/* ---------- banka SMS'lerinden otomatik işlem ----------
   Android uygulaması gelen SMS'leri ham olarak verir; ayrıştırma burada yapılır, böylece yeni banka biçimleri
   APK güncellemeden eklenebilir. Hiçbir SMS cihaz dışına gönderilmez. */
var SMS_SKIP=/(sifre|parola|dogrulama|onay kodu|guvenlik kodu|tek kullanimlik|otp|3d secure|3d sifre|kodunuz|kodu:|code)/;
var SMS_STMT=/(son odeme tarihi|hesap kesim|ekstre|donem borcu|asgari odeme|asgari tutar|borc bilgisi)/;
var SMS_AD=/(kampanya|firsat|kazanma sansi|indirim kodu|basvur|kredi teklif|onayli limit|limitiniz artir|faizsiz|cekilis|hediye|ozel teklif)/;
var SMS_NOTAMT=/(bakiye|limit|kullanilabilir|asgari|toplam borc|bonus|puan|chip|worldpuan|maxipuan|parafpara|kalan)\W{0,3}[^\d]{0,18}$/;
var SMS_STOP={tarihinde:1,tarihli:1,saat:1,saatinde:1,kartinizla:1,kartinizdan:1,kartiniz:1,kartinla:1,kartindan:1,karti:1,kart:1,ile:1,biten:1,sonlanan:1,nolu:1,numarali:1,tl:1,try:1,usd:1,eur:1,tutarinda:1,tutarli:1,tutarindaki:1,islem:1,harcama:1,yapilmistir:1,yaptiniz:1,hesabinizdan:1,hesabiniza:1,taksit:1,taksitli:1,pesin:1,sayin:1,musterimiz:1,de:1,da:1,ve:1,icin:1,olarak:1,bankamatik:1,kredi:1,banka:1,'kartiniz ile':1};
var SMS_CAT=[
 ['Market',/(migros|a101|\bbim\b|sok market|\bsok\b|carrefour|file market|macrocenter|metro grossmarket|hakmar|onur market|kim market|tarim kredi|getir\b|happy center|bizim toptan)/],
 ['Ulaşım',/(opet|shell|\bbp\b|petrol ofisi|total ?energies|aytemiz|akaryakit|istanbulkart|belbim|\buber\b|bitaksi|taksi|otopark|\bthy\b|turk hava|pegasus|ajet|obilet|\bido\b|marti|\bhgs\b|\bogs\b|otoyol)/],
 ['Yeme-İçme',/(yemeksepeti|getir yemek|trendyol yemek|migros yemek|starbucks|kahve|cafe|kafe|restoran|restaurant|burger|pizza|domino|mcdonald|\bkfc\b|simit|doner|lokanta|pastane|baklava|kofteci)/],
 ['Fatura',/(turkcell|vodafone|turk telekom|ttnet|superonline|turknet|igdas|enerjisa|ck enerji|ayedas|bedas|\biski\b|\baski\b|izsu|dogalgaz|elektrik|su idaresi|fatura|d-smart|digiturk)/],
 ['Sağlık',/(eczane|hastane|saglik|klinik|medical|doktor|\bdis\b|optik)/],
 ['Eğlence',/(netflix|spotify|youtube|disney|blutv|exxen|steam|playstation|sinema|cinemaximum|apple\.com|google play|amazon prime|\btod\b|\bgain\b)/],
 ['Giyim',/(lcw|lc waikiki|defacto|koton|zara|h&m|mavi|boyner|\bflo\b|mango|pull ?& ?bear|bershka|ipekyol|network|collezione|kigili)/],
 ['Eğitim',/(kirtasiye|kitap|udemy|okul|universite|dershane|kurs)/],
 ['Kira',/(\bkira\b)/],
 ['Maaş',/(maas|ucret odemesi)/]
];
function smsHash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36);}
/* başlık biçimi: Türkçe büyük harf yoksa (MIGROS gibi ASCII) I→i kuralıyla küçült */
function titleTr(s){s=String(s);var tr=/[İŞĞÇÖÜışğçöü]/.test(s),lo=tr?s.toLocaleLowerCase('tr-TR'):s.toLowerCase();return lo.replace(/(^|[\s\-\/&])(\S)/g,function(m,a,b){return a+(tr?b.toLocaleUpperCase('tr-TR'):b.toUpperCase());});}
function smsAmounts(b){
  var re=/(?:(TL|TRY|₺|USD|EUR|\$|€)\s?)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?:\s?(TL|TRY|₺|USD|EUR|\$|€))?(?![\d])/gi,m,out=[];
  while((m=re.exec(b))){var cur=String(m[1]||m[3]||'').toUpperCase();if(!cur)continue;
    var before=fold(b.slice(Math.max(0,m.index-32),m.index));if(SMS_NOTAMT.test(before))continue;
    var v=num(m[2]);if(!(v>0))continue;out.push({v:r2(v),c:(cur==='USD'||cur==='$')?'USD':((cur==='EUR'||cur==='€')?'EUR':'TRY'),i:m.index});}
  return out;
}
function smsMerchant(b){
  var m,seg=null;
  if((m=b.match(/(?:i̇|i|ı|I|İ)[sş]yer(?:i|ı|İ|I)\s*[:\-]\s*([^,.;\n]{2,40})/)))return titleTr(m[1].trim());
  if((m=b.match(/a[cç][ıi]klama\s*[:\-]\s*([^,.;\n]{2,40})/i)))return titleTr(m[1].trim());
  if((m=b.match(/^(.{1,90}?)\s*(?:üye\s+|uye\s+)?(?:i̇|i|ı|I|İ)[sş]yer(?:i|ı|İ|I)n(?:den|de|e)\b/i)))seg=m[1];
  else if((m=b.match(/^(.{1,90}?)['’](?:den|dan|ten|tan|de|da|te|ta)\b/i)))seg=m[1];
  else if((m=b.match(/^(.{1,90}?)\s+(?:alisverisi|alışverişi|harcamasi|harcaması)/i)))seg=m[1];
  if(!seg)return '';
  var w=seg.trim().split(/\s+/),out=[];
  for(var i=w.length-1;i>=0&&out.length<4;i--){var x=w[i].replace(/^[("'*]+|[)"',:;*]+$/g,''),fx=fold(x);if(!x||/\d{2}[.:\/]\d{2}/.test(x)||/^\d+([.,]\d+)?$/.test(x)||SMS_STOP[fx])break;out.unshift(x);}
  return out.length?titleTr(out.join(' ')).slice(0,40):'';
}
function smsCat(note,type){
  var n=fold(note),l=type==='inc'?INCC():EXPC();
  var r=S.rules.filter(function(x){return x.kw&&n.indexOf(fold(x.kw))>-1&&l.indexOf(x.cat)>=0;})[0];if(r)return r.cat;
  for(var i=0;i<SMS_CAT.length;i++){if(SMS_CAT[i][1].test(n)&&l.indexOf(SMS_CAT[i][0])>=0)return SMS_CAT[i][0];}
  return type==='inc'?(l.indexOf('Diğer gelir')>=0?'Diğer gelir':l[l.length-1]):(l.indexOf('Diğer')>=0?'Diğer':l[l.length-1]);
}
/* tek SMS'i çözümle: null → işlem değil */
function smsParse(body,from,ts){
  var b=String(body||'').replace(/\s+/g,' ').trim(),f=fold(b);if(b.length<12)return null;
  if(SMS_SKIP.test(f))return {skip:'Doğrulama/şifre mesajı'};
  if(SMS_STMT.test(f))return {skip:'Ekstre ya da borç bildirimi'};
  var am=smsAmounts(b);if(!am.length)return {skip:'Tutar bulunamadı'};
  var kind=null,out=/(hesabinizdan|hesabindan|kartinizdan|kartinizla|kartiniz ile|kartinla|kartindan|harcama|alisveris|odeme yap|odemeniz|odemesi|islem yapil|isleminiz|islem gerceklesti|cekil|cekim|para cek|tahsil|satin al|provizyon|harcadin|gonderil|gonderdin|transfer edil|havale yapil|eft yapil|otomatik odeme)/,
      inc=/(hesabiniza|hesabina|kartiniza|yatiril|yatirdi|gelen (eft|havale|fast|para|transfer)|gelmistir|hesabiniza gecti|para girisi|alacak kaydedil|maas|ucret odemesi)/;
  if(/\batm\b/.test(f)&&/cek/.test(f))kind='atm';
  else if(/(kart(i|inizin|in)? borcu(na|nuza|nuz)|kredi karti (borc )?odemesi|kart borc odeme|kartiniza .*odeme)/.test(f))kind='cardpay';
  else if(/iade/.test(f))kind='inc';
  else if(inc.test(f)&&!/(hesabinizdan|kartinizdan|kartinizla|hesabindan)/.test(f))kind='inc';
  else if(out.test(f))kind='exp';
  if(!kind)return {skip:'İşlem türü anlaşılamadı'};
  if(SMS_AD.test(f)&&!/(yapilmistir|gerceklesti|yatirilmistir|cekilmistir|gonderilmistir)/.test(f))return {skip:'Reklam mesajı'};
  var a=am[0],last4=(b.match(/(\d{4})\s*(?:ile biten|ile sonlanan|ile baslayan|nolu|no'lu|no.lu|numaral[ıi]|sonlu)/i)||b.match(/[*xX]{2,}\s?(\d{4})/)||[])[1]||'';
  var d=ts?new Date(+ts):new Date(),date=isoDate(new Date(d.getFullYear(),d.getMonth(),d.getDate())),bm=b.match(/(\d{2})[.\/](\d{2})[.\/](\d{4})/);
  if(bm){var bd=bm[3]+'-'+bm[2]+'-'+bm[1];if(!isNaN(pdate(bd))&&daysBetween(bd,date)>=0&&daysBetween(bd,date)<=31)date=bd;}
  var merch=kind==='atm'||kind==='cardpay'?'':smsMerchant(b),src=String(from||'').trim();
  return {kind:kind,amt:a.v,ccy:a.c,date:date,merchant:merch,last4:last4,from:src,raw:b};
}
function smsMapKey(p,withCard){var s=fold(p.from||'sms');return withCard&&p.last4?s+'|'+p.last4:s;}
function smsGuessAcct(p){
  var m=S.sms.map,acc=ACCS(),k1=smsMapKey(p,1),k2=smsMapKey(p,0),f=fold(p.raw);
  if(p.last4&&m[k1]&&acc.indexOf(m[k1])>=0)return {a:m[k1],sure:true};
  if(!p.last4&&m[k2]&&acc.indexOf(m[k2])>=0)return {a:m[k2],sure:true};
  var kart=acc.filter(function(x){return acctType(x)==='kart';}),bank=acc.filter(function(x){return acctType(x)==='banka';});
  if(/kredi kart|kartiniz|kartinla/.test(f)&&p.kind!=='cardpay'&&p.kind!=='atm'&&kart.length&&!/banka kart|bankamatik/.test(f))return {a:kart[0],sure:false};
  if(m[k2]&&acc.indexOf(m[k2])>=0)return {a:m[k2],sure:false};
  return {a:bank[0]||defAcct('exp'),sure:false};
}
/* gelen ham SMS listesini bekleyenlere ekler; döner: eklenen sayı */
function smsIngest(list,opt){
  opt=opt||{};var added=0,auto=0,seen={};S.sms.seen.forEach(function(k){seen[k]=1;});
  (list||[]).forEach(function(m){
    var body=String(m.body||''),key=fold(m.from||'')+'|'+isoDate(new Date(+m.ts||Date.now()))+'|'+smsHash(body);
    if(seen[key])return;seen[key]=1;S.sms.seen.push(key);
    var p=smsParse(body,m.from,m.ts);if(!p||p.skip)return;
    var g=smsGuessAcct(p),acc=ACCS(),cash=acc.filter(function(x){return acctType(x)==='nakit';})[0],kart=acc.filter(function(x){return acctType(x)==='kart';})[0];
    var it={id:uid(),key:key,kind:p.kind,oamt:p.amt,occy:p.ccy,date:p.date,note:p.merchant,from:p.from,last4:p.last4,raw:p.raw,acct:g.a,sure:g.sure};
    if(p.kind==='atm'){it.to=cash||'';it.acct=g.sure?g.a:(acc.filter(function(x){return acctType(x)==='banka';})[0]||g.a);}
    if(p.kind==='cardpay'){it.to=kart||'';it.acct=acc.filter(function(x){return acctType(x)==='banka';})[0]||g.a;}
    it.cat=it.kind==='exp'||it.kind==='inc'?smsCat(p.merchant+' '+p.raw,it.kind):'Transfer';it.sugCat=it.cat;
    it.dup=S.tx.some(function(t){return t.date===it.date&&Math.abs(txTL(t)-smsTL(it,it.acct))<0.01&&(t.type===it.kind||t.type==='trf'&&(it.kind==='atm'||it.kind==='cardpay'));});
    if(S.sms.auto&&it.sure&&!it.dup&&(it.kind==='exp'||it.kind==='inc')){if(smsCommit(it,{}))auto++;return;}
    S.sms.pend.push(it);added++;});
  if(S.sms.seen.length>1500)S.sms.seen=S.sms.seen.slice(-1200);
  if(added||auto||list&&list.length)save();
  return {added:added,auto:auto};
}
/* SMS tutarını hesabın para birimine çevirir */
function smsTL(it,acct){return it.occy==='TRY'?it.oamt:it.oamt*rateOf(it.occy);}
function smsAmtFor(it,acct){var c=ccyOf(acct);if(c===it.occy)return it.oamt;var tl=smsTL(it),r=rateOf(c);return r>0?r2(tl/r):0;}
/* bekleyen öğeyi işleme dönüştürür; o: kullanıcı seçimleri */
var smsErr='';
function smsCommit(it,o){
  var acct=o.acct||it.acct,to=o.to!=null?o.to:it.to,cat=o.cat||it.cat,note=(o.note!=null?o.note:it.note)||'';
  smsErr='Hesapları kontrol et (transferde iki farklı hesap gerekir).';if(ACCS().indexOf(acct)<0)return false;var amt=smsAmtFor(it,acct);if(!(amt>0)){smsErr='Döviz kuru yok; üstteki yenile düğmesiyle kurları güncelle.';return false;}
  var t={id:uid(),amt:amt,acct:acct,date:it.date,note:note,sms:1};
  if(it.kind==='atm'||it.kind==='cardpay'){if(!to||to===acct||ACCS().indexOf(to)<0)return false;t.type='trf';t.to=to;t.cat='Transfer';if(ccyOf(to)!==ccyOf(acct))t.amt2=smsAmtFor(it,to);if(!t.note)t.note=it.kind==='atm'?'ATM para çekme':'Kart borcu ödemesi';}
  else{t.type=it.kind;t.cat=cat;}
  if(it.occy!==ccyOf(acct)&&it.kind!=='atm')t.note=(t.note?t.note+' ':'')+'('+fmtC(it.oamt,it.occy,1)+')';
  S.tx.push(t);
  S.sms.map[smsMapKey(it,1)]=acct;if(it.last4)S.sms.map[smsMapKey(it,0)]=S.sms.map[smsMapKey(it,0)]||acct;
  var kw=fold(it.note||'').trim();if((t.type==='exp'||t.type==='inc')&&kw.length>=3&&cat!==it.sugCat&&!S.rules.some(function(r){return fold(r.kw)===kw;}))S.rules.push({kw:kw,cat:cat});
  return true;
}
function pullSms(){
  if(!nb('smsQueue'))return;var raw='[]';try{raw=NB.smsQueue()||'[]';}catch(e){return;}
  var l;try{l=JSON.parse(raw);}catch(e){l=[];}if(!l.length)return;
  var r=smsIngest(l);try{NB.smsAck(JSON.stringify(l.map(function(m){return m.id;})));}catch(e){}
  if((r.added||r.auto)&&!busy()&&!ui.page)render();
  if(r.auto)toast(r.auto+' işlem banka SMS’inden eklendi');
}
window.walletSms=function(){pullSms();};
function smsBanner(){var n=S.sms.pend.length;if(!n)return '';return '<button class="banner smsb" data-act="sms-review"><span class="sic sm" style="--c:var(--accent)">'+ic('msg')+'</span><span class="mid"><b>'+n+' işlem</b> banka SMS’lerinden bulundu</span><span class="pill">İncele ›</span></button>';}
function smsItem(it){
  var acc=ACCS(),lbl={exp:'Gider',inc:'Gelir',atm:'ATM’den nakit',cardpay:'Kart borcu ödemesi'}[it.kind],trf=it.kind==='atm'||it.kind==='cardpay',cl=it.kind==='inc'?'inc':(trf?'':'exp');
  var cats=it.kind==='inc'?INCC():EXPC();
  return '<div class="card smsit" data-sid="'+it.id+'"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span class="mid"><span class="pill">'+lbl+'</span> <span class="small muted">'+esc(pdate(it.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' · '+esc(it.from||'SMS')+(it.last4?' · *'+esc(it.last4):'')+'</span></span><b class="num '+cl+'">'+(it.kind==='inc'?'+':(trf?'':'−'))+fmtC(it.oamt,it.occy,1)+'</b></div>'
   +(it.dup?'<div class="small" style="color:var(--warn)">Aynı gün aynı tutarda bir işlem zaten var; tekrar olabilir.</div>':'')
   +'<div class="two"><div class="field"><label for="sn-'+it.id+'">Not</label><input id="sn-'+it.id+'" value="'+esc(it.note||'')+'" placeholder="İsteğe bağlı"></div>'
   +(trf?'':'<div class="field"><label for="sc-'+it.id+'">Kategori</label><select id="sc-'+it.id+'">'+optsKeep(cats,it.cat)+'</select></div>')+'</div>'
   +'<div class="two"><div class="field"><label for="sa-'+it.id+'">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="sa-'+it.id+'">'+acctOpts(it.acct)+'</select></div>'
   +(trf?'<div class="field"><label for="st-'+it.id+'">Giriş hesabı</label><select id="st-'+it.id+'">'+acctOpts(it.to,'Seç')+'</select></div>':'')+'</div>'
   +'<details><summary class="small muted">SMS metni</summary><p class="small muted" style="margin:4px 0 0;overflow-wrap:anywhere">'+esc(it.raw)+'</p></details>'
   +'<div class="err" id="se-'+it.id+'"></div><div class="two"><button class="btn small" style="width:100%" data-act="sms-add" data-id="'+it.id+'">Ekle</button><button class="btn small ghost" style="width:100%" data-act="sms-skip" data-id="'+it.id+'">Yoksay</button></div></div>';
}
function smsSheet(){
  var l=S.sms.pend;if(!l.length){closeSheet();return;}
  openSheet('<h2>SMS’ten bulunan işlemler</h2><p class="small muted" style="margin:0">Kontrol et, gerekirse hesabı ya da kategoriyi değiştir ve ekle. Seçtiğin hesap bu kart için hatırlanır.</p>'
   +l.slice(0,25).map(smsItem).join('')+(l.length>25?'<div class="small muted">+'+(l.length-25)+' işlem daha</div>':'')
   +'<div class="two"><button class="btn" data-act="sms-all">Hepsini ekle</button><button class="btn ghost" data-act="sms-none">Hepsini yoksay</button></div>');
}
function smsPick(it){var g=function(p){var e=document.getElementById(p+it.id);return e?e.value:null;};return {acct:g('sa-'),to:g('st-'),cat:g('sc-'),note:g('sn-')};}
ACT['sms-review']=function(){smsSheet();};
ACT['sms-add']=function(el,id){var it=byId(S.sms.pend,id);if(!it)return;if(!smsCommit(it,smsPick(it))){var e=document.getElementById('se-'+id);if(e)e.textContent=smsErr;return;}
  S.sms.pend=S.sms.pend.filter(function(x){return x.id!==id;});save();render();if(S.sms.pend.length)smsSheet();else{closeSheet();toast('İşlem eklendi');}};
ACT['sms-skip']=function(el,id){S.sms.pend=S.sms.pend.filter(function(x){return x.id!==id;});save();render();if(S.sms.pend.length)smsSheet();else closeSheet();};
ACT['sms-all']=function(){var n=0,keep=[];S.sms.pend.forEach(function(it){if(smsCommit(it,smsPick(it)))n++;else keep.push(it);});S.sms.pend=keep;save();render();if(keep.length)smsSheet();else closeSheet();toast(n+' işlem eklendi'+(keep.length?', '+keep.length+' tanesi için hesap seç':''));};
ACT['sms-none']=function(el){if(!armed(el))return;S.sms.pend=[];save();render();closeSheet();};
ACT['sms-perm']=function(){if(nb('askSms')){try{NB.askSms();}catch(e){}}};
ACT['sms-scan']=function(){
  if(!nb('smsScan')){msg('Bu özellik Android uygulamasında çalışır.',false,'f-sms');return;}
  if(smsState()!=='granted'){msg('Önce SMS izni ver.',false,'f-sms');return;}
  var l=[];try{l=JSON.parse(NB.smsScan(30)||'[]');}catch(e){}
  var r=smsIngest(l);render();msg(l.length+' SMS tarandı: '+r.added+' işlem onay bekliyor'+(r.auto?', '+r.auto+' işlem eklendi':'')+'.',true,'f-sms');
};
ACT['sms-parse']=function(){
  var t=val('sms-txt').trim();if(!t){msg('SMS metnini yapıştır.',false,'f-sms2');return;}
  var p=smsParse(t,val('sms-from')||'SMS',Date.now());
  if(!p||p.skip){msg('Bu mesaj işlem olarak tanınmadı'+(p&&p.skip?': '+p.skip:'')+'.',false,'f-sms2');return;}
  var n0=S.sms.pend.length,r=smsIngest([{id:'m'+Date.now(),from:val('sms-from')||'SMS',body:t,ts:Date.now()}]);
  if(!r.added&&!r.auto){msg('Bu mesaj daha önce işlendi.',false,'f-sms2');return;}
  msg('Tanındı: '+({exp:'gider',inc:'gelir',atm:'ATM’den nakit',cardpay:'kart borcu ödemesi'})[p.kind]+' · '+fmtC(p.amt,p.ccy,1)+(p.merchant?' · '+p.merchant:'')+'.',true,'f-sms2');
  if(S.sms.pend.length>n0)smsSheet();
};
ACT['sms-map-del']=function(el,id){delete S.sms.map[id];save();render();};
function smsState(){if(nb('smsState')){try{return NB.smsState();}catch(e){}}return 'yok';}
function setOto(){
  var st=smsState(),native=nb('smsQueue'),mk=Object.keys(S.sms.map);
  var main=native?tgl('sms.on','Banka SMS’lerini yakala','Kart harcaması, gelen para, ATM ve kart borcu ödemesi SMS’leri işlem önerisi olur')
      +(st==='granted'?'<div class="small inc">SMS izni verildi.</div>':'<button class="btn ghost" data-act="sms-perm">SMS izni ver</button>'+(st==='denied'?'<div class="small muted">İzin verilemiyorsa: Telefon Ayarları › Uygulamalar › Wallet › sağ üstteki ⋮ › “Kısıtlanmış ayarlara izin ver”, sonra tekrar dene.</div>':''))
      +tgl('sms.auto','Onay beklemeden ekle','Daha önce hesabını eşleştirdiğin kartların harcamaları doğrudan eklenir')
      +'<button class="btn ghost" data-act="sms-scan">Son 30 günün SMS’lerini tara</button><div class="err" id="f-sms"></div>'
    :'<p class="small muted" style="margin:0">Otomatik yakalama Android uygulamasında çalışır. Burada bir banka SMS’ini yapıştırarak tanımayı deneyebilirsin.</p>';
  return sec('Banka SMS’lerinden otomatik işlem',main,'SMS’ler yalnızca telefonunda okunur, hiçbir yere gönderilmez. Şifre ve doğrulama kodu içeren mesajlar yok sayılır.')
   +sec('SMS metnini yapıştır','<div class="field"><label for="sms-from">Gönderen</label><input id="sms-from" placeholder="Örn. AKBANK"></div><div class="field"><label for="sms-txt">Mesaj</label><textarea id="sms-txt" placeholder="Bankadan gelen harcama ya da para girişi SMS’ini buraya yapıştır"></textarea></div><div class="err" id="f-sms2"></div><button class="btn ghost" data-act="sms-parse">Çözümle ve ekle</button>','Tanınmayan bir mesaj olursa bana gönder; biçimi eklenir.')
   +(mk.length?sec('Kart ve hesap eşleşmeleri','<div class="list">'+mk.map(function(k){var p=k.split('|');return '<div class="item"><span class="mid"><div class="t">'+esc(p[0].toLocaleUpperCase('tr-TR'))+(p[1]?' · *'+esc(p[1]):'')+'</div><div class="small muted">'+esc(S.sms.map[k])+'</div></span><button class="btn small ghost" data-act="sms-map-del" data-id="'+esc(k)+'">Sil</button></div>';}).join('')+'</div>','Eklediğin her SMS işleminde seçtiğin hesap bu karta bağlanır.'):'');
}
/* ---------- başlangıç ---------- */
document.getElementById('fab').innerHTML=ic('plus');
purgeTrash();
restoreUi();
render();
if(ui.locked)setTimeout(askBio,400);
applySecure();
if(nb('smsSet')){try{NB.smsSet(!!S.sms.on);}catch(e){}}
(function(){var sp=document.getElementById('splash');if(sp){setTimeout(function(){sp.style.opacity='0';setTimeout(function(){sp.remove();},350);},500);}})();
bgRates();setTimeout(function(){notifyDue();pushPlan();pullSms();if(S.autoBk&&!hasSample()&&Date.now()-(S.bkTs||0)>864e5)autoBackup();},1500);
})();
