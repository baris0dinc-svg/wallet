(function(){
'use strict';
var KEY='kumbara-v1',UIKEY='wallet-ui',VER='3.5';
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
/* takip listesinin ilk hali (Piyasalar) */
var WDEF=[{k:'fx:USD',n:'ABD doları',s:'USD'},{k:'fx:EUR',n:'Euro',s:'EUR'},{k:'fx:GRA',n:'Gram altın',s:'GRA'},{k:'fx:XU100',n:'BIST 100 endeksi',s:'XU100'}];
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
  pulse:'M3 12h4l3-7 4 14 3-7h4',
  grid:'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  mic:'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5.5 11a6.5 6.5 0 0 0 13 0 M12 17.5V21 M8.5 21h7',
  flag:'M5 21V4 M5 4h12l-2.5 4L17 12H5',
  repeat:'M17 2l3 3-3 3 M4 11V9a4 4 0 0 1 4-4h12 M7 22l-3-3 3-3 M20 13v2a4 4 0 0 1-4 4H4',
  sparkles:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z'
};
function ic(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICONS[n]+'"/></svg>';}
/* bölümler: kaydırmadan tek satıra sığan 6 sekme; Bütçe, Düzenli ve Hedefler Planlama altında */
/* alt menü: Ana Sayfa, İşlemler, Analiz, Hesaplar, Ayarlar. Planlama ve Notlar ayrı sayfa olarak açılır. */
var SECS=[['ev','Ana Sayfa','home'],['islem','İşlemler','list'],['analiz','Analiz','chart'],['servet','Hesaplar','wallet'],['ayar','Ayarlar','cog']];
/* ana sayfa kısayolları: [eylem, değer, ad, simge, renk] */
var SCUTS=[['sv-go','yatirim','Yatırımlar','trend','var(--blue)'],['sv-go','varlik','Varlıklarım','home','var(--warn)'],['qa-trf','','Transfer','swap','var(--accent)'],['plan-go','hedef','Hedefler','flag','var(--warn)'],['sv-go','borc','Borçlar','card','var(--exp)'],['plan-go','duzenli','Düzenli ödemeler','repeat','var(--blue)']];
/* hızlı araçlar (kullanıcı seçer): [kimlik, ad, simge, renk, eylem, değer] */
var TOOLS=[['piyasa','Piyasalar','pulse','var(--blue)','open-mkt',''],['butce','Bütçe','scale','var(--inc)','plan-go','butce'],['notlar','Notlar','note','var(--warn)','sub','notlar'],
 ['takvim','Takvim','cal','var(--accent)','an-go','takvim'],['calc','Hesaplayıcılar','calc','var(--ink2)','qa-calc',''],['fire','Finansal özgürlük','fire','var(--exp)','open-fire',''],
 ['claude','Claude’a sor','sparkles','var(--accent)','ai-open',''],['ekstre','Ekstre aktar','archive','var(--blue)','open-set','veri'],['oto','Banka mesajları','msg','var(--inc)','open-set','oto']];
var TOOLDEF=['piyasa','butce','notlar'];
/* Servetim: net servet kartındaki kutucuklarla aynı gruplar */
var WEALTH=[['hesap','Hesaplar'],['yatirim','Yatırımlar'],['varlik','Varlıklar'],['borc','Borçlar']];
var ANS=[['ozet','Özet'],['harcama','Kategori'],['takvim','Takvim'],['servet','Servet']];
var PLANS=[['butce','Bütçe'],['duzenli','Düzenli'],['hedef','Hedefler']];
var QA=[['qa-inc','Gelir','inc','var(--inc)'],['qa-exp','Gider','exp','var(--exp)'],['qa-trf','Transfer','swap','var(--accent)'],['qa-mkt','Piyasalar','pulse','var(--blue)'],['qa-cash','Nakit','cash','var(--warn)'],['qa-bank','Banka','bank','var(--blue)'],['qa-inv','Yatırım','trend','var(--inc)'],['qa-debt','Borç','card','var(--exp)'],['qa-save','Birikim','coins','var(--warn)'],['qa-asset','Varlık','home','var(--blue)'],['qa-calc','Hesaplayıcı','calc','var(--ink2)']];
var SETS=[
 {g:'Genel',id:'profil',t:'Profil ve dönem',d:'Adın ve maaş günün',i:'user',c:'var(--inc)'},
 {g:'Genel',id:'gor',t:'Görünüm',d:'Tema, yazı boyutu, tutarları gizleme',i:'palette',c:'var(--blue)'},
 {g:'Genel',id:'kurlar',t:'Para birimi ve kurlar',d:'Görüntüleme para birimi, canlı döviz ve altın',i:'trend',c:'var(--inc)'},
 {g:'Para',id:'hesap',t:'Varsayılan hesap',d:'Yeni işlemde seçili gelen hesap',i:'bank',c:'var(--blue)'},
 {g:'Para',id:'kat',t:'Kategoriler ve kurallar',d:'Gelir ve gider kategorileri, otomatik kurallar',i:'shapes',c:'var(--warn)'},
 {g:'Otomasyon',id:'oto',t:'Otomatik işlemler',d:'Banka SMS’leri ve uygulama bildirimlerinden harcama ve gelirleri yakala',i:'sparkles',c:'var(--accent)'},
 {g:'Otomasyon',id:'bild',t:'Bildirimler ve hatırlatıcılar',d:'Fatura ve ödeme hatırlatıcısı, bütçe uyarıları',i:'bell',c:'var(--warn)'},
 {g:'Güvenlik ve veri',id:'guv',t:'Güvenlik ve gizlilik',d:'PIN kilidi, parmak izi, ekran gizliliği',i:'shield',c:'var(--inc)'},
 {g:'Güvenlik ve veri',id:'veri',t:'Veri ve yedek',d:'Otomatik yedek, yedekten yükleme, CSV, sıfırlama',i:'server',c:'var(--blue)'}
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
/* 100 milyarın üstü kuruş hassasiyetini bozar; bu tür girişler reddedilir */
var MAXAMT=1e11;function tooBig(v){return Math.abs(+v||0)>MAXAMT;}
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
  d.sms=Object.assign({on:false,ntf:false,auto:false,pend:[],seen:[],map:{},recent:[]},d.sms||{});if(!Array.isArray(d.sms.recent))d.sms.recent=[];
  d.watch=Array.isArray(d.watch)?d.watch.filter(function(w){return w&&typeof w.k==='string'&&w.k.indexOf(':')>0;}):WDEF.map(function(w){return Object.assign({},w);});d.quotes=d.quotes&&typeof d.quotes==='object'?d.quotes:{};if(!Array.isArray(d.sms.pend))d.sms.pend=[];if(!Array.isArray(d.sms.seen))d.sms.seen=[];if(!d.sms.map||typeof d.sms.map!=='object')d.sms.map={};d.qaUse=d.qaUse||{};
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

var ui={tab:'cuzdan',sub:'ev',rng:'ay',plan:'butce',sv:'hesap',an:'ozet',nwr:6,trPick:null,wk:null,alAll:false,qaOrd:null,month:curP(),filter:'all',acctF:'',calc:'kredi',cv:{},nq:'',sq:'',tq:'',nv:'act',tr:6,page:null,locked:!!S.pin,pinBuf:'',fails:0,lockUntil:0,forgot:false,hiddenAt:0,mq:'',mlink:null};

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
function hPrice(h){if(h.mk){var p=mTL(h.mk);if(p>0)return p;}var r=h.ccy&&S.fx&&+S.fx[h.ccy];return r>0?r:(+h.price||0);}
function hVal(h){return r2(h.qty*hPrice(h));} function hCost(h){return r2(h.qty*h.cost);}
function pfTotals(kind){var v=0,c=0;S.holdings.forEach(function(h){if(kind&&hKind(h)!==kind)return;v+=hVal(h);c+=hCost(h);});return {v:r2(v),c:r2(c)};}
function hasSample(){return S.tx.some(function(t){return t.sample;})||S.holdings.some(function(h){return h.sample;})||S.notes.some(function(n){return n.sample;})||S.goals.some(function(n){return n.sample;})||S.recurring.some(function(n){return n.sample;})||S.debts.some(function(n){return n.sample;})||!!S.sampleExtras;}
/* borcun kalan tutarı: girilen tutar − bağlı ödemeler (anında güncellenir) */
function debtPaid(d){var p=0;S.tx.forEach(function(t){if(t.type==='dbt'&&t.side==='out'&&t.debt===d.id)p+=txTL(t);});return r2(p);}
function debtLeft(d){return r2(Math.max((+d.amt||0)-debtPaid(d),0));}
function debtManual(){return r2(S.debts.reduce(function(a,d){return a+debtLeft(d);},0));}
/* acil durum fonu: kullanıcı bir hedefi işaretlerse (ya da adı "acil" içeriyorsa) gösterge o hedefin birikimini kullanır */
function isEm(g){return g.em===true||(g.em==null&&/acil|emergency/i.test(g.name||''));}
function emGoal(){return S.goals.filter(isEm)[0]||null;}
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
