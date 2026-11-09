(function(){
'use strict';
var KEY='kumbara-v1',UIKEY='wallet-ui',VER='4.17';
var D_EXP=['Market','Fatura','Kira','Ulaşım','Yeme-İçme','Sağlık','Eğlence','Giyim','Eğitim','Diğer'];
var D_INC=['Maaş','Ek gelir','Yatırım getirisi','Diğer gelir'];
var D_ACC=['Nakit','Banka','Kredi kartı'];
/* 4.12: ilk açılışta önerilen alt kategoriler (yalnız listede olan kategoriler için) */
var SUB_DEF={'Fatura':['Elektrik','Su','Doğalgaz','İnternet','Telefon'],'Ulaşım':['Yakıt','Toplu taşıma','Taksi','Otopark'],'Yeme-İçme':['Restoran','Kafe','Paket servis'],'Sağlık':['İlaç','Doktor'],'Eğlence':['Abonelik','Sinema','Etkinlik'],'Eğitim':['Kurs','Kitap'],'Market':['Gıda','Temizlik','Kişisel bakım']};
var INVT=['Hisse','Fon','Altın','Gümüş','Döviz','Kripto','Mevduat','BES','Diğer yatırım'];
var ASTT=['Gayrimenkul','Araç','Diğer varlık'];
var DTYPES=['Kredi','Kredi kartı','Taksit','Kişisel borç','Diğer'];
/* para birimleri: hesaplar ve görüntüleme için; kur kaynakları varlık fiyatı için */
var CCYS=['TRY','USD','EUR','GBP','CHF','XAU'];
var CSYM={TRY:'₺',USD:'$',EUR:'€',GBP:'£',CHF:'CHF',XAU:'gr'};
var CCYN={TRY:'Türk lirası',USD:'Dolar',EUR:'Euro',GBP:'Sterlin',CHF:'İsviçre frangı',XAU:'Gram altın'};
var CCYS_SHORT={TRY:'₺ TL',USD:'$ USD',EUR:'€ EUR',GBP:'£ GBP',CHF:'CHF',XAU:'Altın (gr)'};
/* takip listesinin ilk hali (Piyasalar) */
var WDEF=[{k:'fx:USD',n:'ABD doları',s:'USD'},{k:'fx:EUR',n:'Euro',s:'EUR'},{k:'fx:GRA',n:'Gram altın',s:'GRA'},{k:'fx:CEYREKALTIN',n:'Çeyrek altın',s:'CEYREKALTIN'},{k:'fx:XU100',n:'BIST 100 endeksi',s:'XU100'},{k:'cg:bitcoin',n:'Bitcoin',s:'BTC'}];
var FXK=['USD','EUR','GBP','CHF','XAU','XAG','CEY'];
var FXL={USD:'USD/TL',EUR:'EUR/TL',GBP:'GBP/TL',CHF:'CHF/TL',XAU:'Gram altın',XAG:'Gram gümüş',CEY:'Çeyrek altın'};
var R0=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0});
var R2=new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2});
var NUM2=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}),FIX2=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
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
  more:'M12 5h.01 M12 12h.01 M12 19h.01',
  copy:'M9 9h11v11H9z M5 15H4V4h11v1',
  x:'M6 6l12 12 M18 6L6 18',
  mic:'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5.5 11a6.5 6.5 0 0 0 13 0 M12 17.5V21 M8.5 21h7',
  flag:'M5 21V4 M5 4h12l-2.5 4L17 12H5',
  repeat:'M17 2l3 3-3 3 M4 11V9a4 4 0 0 1 4-4h12 M7 22l-3-3 3-3 M20 13v2a4 4 0 0 1-4 4H4',
  /* 4.12: kategori simgeleri */
  cart:'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 8H6.2 M9 20.5h.01 M17 20.5h.01',
  bolt:'M13 2L4 14h7l-1 8 9-12h-7z',
  car:'M5 17h14v-5l-2-5H7l-2 5z M3 12h18 M7.5 14.5h.01 M16.5 14.5h.01 M6 17v2 M18 17v2',
  bus:'M5 4h14v13H5z M5 11h14 M8 20v-3 M16 20v-3 M8 14h.01 M16 14h.01',
  food:'M7 3v8a2 2 0 0 0 2 2v8 M5 3v6 M9 3v6 M17 21V3c-2 1-3 4-3 7h3',
  coffee:'M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M17 11h1.5a2.5 2.5 0 0 1 0 5H17 M8 3v3 M12 3v3',
  heart:'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  med:'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  ticket:'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z M14 7v10',
  shirt:'M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z',
  book:'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 M8 7h7',
  gift:'M4 11h16v9H4z M3 7h18v4H3z M12 7v13 M12 7c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1',
  plane:'M2 13l20-8-7 16-3-7z M12 14l3-3',
  phone:'M7 2h10v20H7z M11 18h2',
  gym:'M6 7v10 M18 7v10 M3 10v4 M21 10v4 M6 12h12',
  bag:'M6 8h12l1 12H5z M9 8V6a3 3 0 0 1 6 0v2',
  brief:'M3 7h18v12H3z M8 7V4h8v3 M3 12h18',
  percent:'M19 5L5 19 M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  tag:'M3 12V4h8l10 10-8 8z M7.5 8.5h.01',
  paw:'M12 21c-3 0-6-2-6-4.5S9 12 12 12s6 2 6 4.5S15 21 12 21z M5.5 9.5h.01 M9.5 5.5h.01 M14.5 5.5h.01 M18.5 9.5h.01',
  tool:'M14.5 5.5a4 4 0 0 0 5 5L11 19a2.1 2.1 0 0 1-3-3l8.5-8.5a4 4 0 0 1-2-2z',
  baby:'M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M9.5 13h.01 M14.5 13h.01 M10 16.5c1 .8 3 .8 4 0 M12 7c0-2 1-3 3-3',
  music:'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  camera:'M4 7h4l2-3h4l2 3h4v13H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  image:'M4 4h16v16H4z M4 16l5-5 4 4 3-3 4 4 M15.5 8.5h.01',
  cloud:'M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z',
  sparkles:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z'
};
function ic(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICONS[n]+'"/></svg>';}
/* alt menü: Ana Sayfa, İşlemler (liste / takvim), Plan (Bütçe, Düzenli, Hedefler, Koç), Analiz (Özet, Kategoriler), Hesaplar (Hesaplar, Yatırımlar, Borçlar). Ayarlar başlıktaki çark simgesiyle açılır. */
var SECS=[['ev','Ana Sayfa','home'],['islem','İşlemler','list'],['plan','Plan','flag'],['analiz','Analiz','chart'],['servet','Hesaplar','wallet']];
/* 4.4: Varlıklar (ev, araba) Yatırımlar'ın altında ayrı bölüm; eski 'varlik' bağlantıları oraya gider */
var WEALTH=[['hesap','Hesaplar'],['yatirim','Yatırımlar'],['borc','Borçlar']];
/* 4.2: net servet gelişimi ve dağılımı Hesaplar sekmesinde (eski Analiz › Servet oraya gider).
   4.4: Takvim İşlemler'in ikinci görünümü (başlıktaki takvim düğmesi); eski Analiz › Takvim oraya gider */
var ANS=[['ozet','Özet'],['harcama','Kategoriler']];
/* 4.2: her gün kullanılan Bütçe ve Düzenli önde, Koç sonda */
var PLANS=[['butce','Bütçe'],['duzenli','Düzenli'],['hedef','Hedefler'],['koc','Koç']];
var SETS=[
 {g:'Genel',id:'genel',t:'Genel',d:'Adın, maaş günü, varsayılan hesap, tema ve yazı boyutu',i:'user',c:'var(--inc)'},
 {g:'Genel',id:'kurlar',t:'Para birimi ve kurlar',d:'Görüntüleme para birimi, kurların güncellenmesi',i:'trend',c:'var(--blue)'},
 {g:'Genel',id:'kat',t:'Kategoriler ve kurallar',d:'Gelir ve gider kategorileri, otomatik kurallar',i:'shapes',c:'var(--warn)'},
 {g:'Otomasyon',id:'oto',t:'Otomatik işlemler',d:'Banka SMS’leri ve uygulama bildirimlerinden işlem yakala',i:'sparkles',c:'var(--accent)'},
 {g:'Otomasyon',id:'bild',t:'Bildirimler ve hatırlatıcılar',d:'Fatura ve ödeme hatırlatıcısı, bütçe uyarıları',i:'bell',c:'var(--warn)'},
 {g:'Güvenlik ve veri',id:'guv',t:'Güvenlik ve gizlilik',d:'PIN kilidi, parmak izi, ekran gizliliği',i:'shield',c:'var(--inc)'},
 {g:'Güvenlik ve veri',id:'veri',t:'Veri ve yedek',d:'Yedek, geri yükleme, ekstre ve CSV, sıfırlama',i:'server',c:'var(--blue)'}
];
/* eski ayar sayfası adları birleştirilenlere gider */
var SETMAP={profil:'genel',hesap:'genel',gor:'genel'};
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
  else if(d>1||/^-?[1-9]\d{0,2}\.\d{3}$/.test(s))s=s.replace(/\./g,'');
  var n=parseFloat(s);return isNaN(n)||!isFinite(n)?0:n;}
function pad(n){return String(n).padStart(2,'0');}
function isoDate(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function mkey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1);}
function addMonth(k,o){var p=k.split('-');return mkey(new Date(+p[0],+p[1]-1+o,1));}
var MLC={};
function mlabel(k,short){var ck=k+(short?'s':'');if(MLC[ck])return MLC[ck];return (MLC[ck]=mlabel0(k,short));}
function mlabel0(k,short){var p=k.split('-'),r=new Date(+p[0],+p[1]-1,1).toLocaleDateString('tr-TR',short?{month:'short'}:{month:'long',year:'numeric'});return r.charAt(0).toLocaleUpperCase('tr-TR')+r.slice(1);}
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
  if(!d.subs||typeof d.subs!=='object'||Array.isArray(d.subs)){d.subs={};Object.keys(SUB_DEF).forEach(function(c){if(d.cats.exp.indexOf(c)>=0)d.subs[c]=SUB_DEF[c].slice();});}
  Object.keys(d.subs).forEach(function(c){if(!Array.isArray(d.subs[c]))delete d.subs[c];else d.subs[c]=d.subs[c].filter(function(x){return typeof x==='string'&&x;});});
  d.catIc=d.catIc&&typeof d.catIc==='object'?d.catIc:{};
  d.rules=d.rules||[];d.payday=d.payday||1;d.name=d.name||'';d.fs=d.fs||1;d.hide=!!d.hide;d.theme=d.theme||'auto';
  d.dccy=CCYS.indexOf(d.dccy)>=0?d.dccy:'TRY';d.openD=d.openD&&typeof d.openD==='object'?d.openD:{};d.defAcct=d.defAcct||'';
  d.sms=Object.assign({on:false,ntf:false,auto:false,pend:[],seen:[],map:{},recent:[]},d.sms||{});if(!Array.isArray(d.sms.recent))d.sms.recent=[];
  /* 4.15: fiyat hedefleri {id, k: piyasa anahtarı, v: hedef, up: üstüne çıkınca mı, hit: ulaşıldığı an} */
  d.ptgt=Array.isArray(d.ptgt)?d.ptgt.filter(function(x){return x&&typeof x.k==='string'&&+x.v>0;}):[];
  d.watch=Array.isArray(d.watch)?d.watch.filter(function(w){return w&&typeof w.k==='string'&&w.k.indexOf(':')>0;}):WDEF.map(function(w){return Object.assign({},w);});d.quotes=d.quotes&&typeof d.quotes==='object'?d.quotes:{};if(!Array.isArray(d.sms.pend))d.sms.pend=[];if(!Array.isArray(d.sms.seen))d.sms.seen=[];if(!d.sms.map||typeof d.sms.map!=='object')d.sms.map={};d.qaUse=d.qaUse||{};
  /* kimlikler HTML özniteliklerine yazılır: dışarıdan gelen (yedek) bozuk ya da tehlikeli kimlikler yenilenir */
  ['tx','holdings','notes','goals','recurring','debts','realized'].forEach(function(k){d[k]=d[k].filter(function(x){return x&&typeof x==='object';});d[k].forEach(function(x){if(x.id==null||!/^[\w.:-]{1,64}$/.test(String(x.id)))x.id=uid();else x.id=String(x.id);});});
  d.sms.pend=d.sms.pend.filter(function(x){return x&&typeof x==='object';});d.sms.pend.forEach(function(x){if(!/^[\w.:-]{1,64}$/.test(String(x.id)))x.id=uid();});
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
var TXV=0,storeWarned=false,planT=null,bkT=null,NSJ=null,NST=null;
/* Android'deki yedek kopya (WebView deposu silinirse buradan döner): büyük veride köprü yavaş olduğundan
   ekran çizildikten sonra yazılır; uygulama arka plana geçerken bekleyen kayıt hemen yazılır */
function flushNative(){clearTimeout(NST);NST=null;var j=NSJ;NSJ=null;if(j&&nb('saveData')){try{NB.saveData(j);}catch(e){}}}
document.addEventListener('visibilitychange',function(){if(document.hidden)flushNative();});
window.addEventListener('pagehide',flushNative);
function save(){var ts0=Date.now();S.tx.forEach(function(t){if(!t.ts)t.ts=ts0;});
  TXV++;S.savedAt=Date.now();
  try{stampFx();}catch(e){}
  var j;try{j=JSON.stringify(S);}catch(e){return;}
  var ok=true;try{localStorage.setItem(KEY,j);}catch(e){ok=false;}
  if(nb('saveData')){if(!ok){try{if(NB.saveData(j)==='ok')ok=true;}catch(e){}}else{NSJ=j;if(!NST)NST=setTimeout(flushNative,120);}}
  if(!ok&&!storeWarned){storeWarned=true;setTimeout(function(){toast('Veriler kaydedilemedi: cihaz deposu dolu olabilir. Yedek al.');},0);}
  clearTimeout(planT);planT=setTimeout(pushPlan,700);
  clearTimeout(bkT);bkT=setTimeout(function(){if(S.autoBk&&bkOk()&&(S.savedAt||0)>(S.bkTs||0))autoBackup();},20000);
  try{clSoon();}catch(e){}
}
var hostTheme=document.documentElement.getAttribute('data-theme');
function applyTheme(){var r=document.documentElement,t=S.theme;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else if(hostTheme)r.setAttribute('data-theme',hostTheme);else r.removeAttribute('data-theme');}
function EXPC(){return S.cats.exp;} function INCC(){return S.cats.inc;} function ACCS(){return S.accounts;}
function ensureCat(type,name){var l=S.cats[type];if(l.indexOf(name)<0)l.push(name);return name;}
/* ---------- 4.12: kategori simgeleri ve alt kategoriler ----------
   S.catIc: {kategori: simge}; seçilmemişse addan tahmin edilir. S.subs: {kategori: [alt kategoriler]}; işlemde t.sub (isteğe bağlı).
   Bütçe ve kurallar ana kategoride kalır; Analiz'de kategoriye dokununca alt kategori kırılımı görünür. */
var CATIC=['cart','food','coffee','home','bolt','car','bus','heart','med','ticket','music','shirt','bag','book','baby','paw','gym','plane','phone','gift','tool','repeat','bank','card','percent','brief','coins','cash','trend','tag'];
var CATIC_RX=[[/market|bakkal|manav|kasap|alisveris|gida/,'cart'],[/kafe|kahve|cafe/,'coffee'],[/yeme|yemek|restoran|lokanta|icecek/,'food'],[/fatura|elektrik|dogalgaz|enerji/,'bolt'],[/kira|ev |^ev$|konut|aidat/,'home'],
  [/toplu|otobus|metro|akbil|istanbulkart/,'bus'],[/ulasim|yakit|benzin|araba|arac|otopark|taksi|ulas/,'car'],[/ilac|eczane/,'med'],[/saglik|doktor|hastane|dis/,'heart'],[/eglence|sinema|etkinlik|konser|oyun/,'ticket'],[/muzik|spotify/,'music'],
  [/giyim|kiyafet|ayakkabi/,'shirt'],[/kozmetik|kisisel|bakim/,'bag'],[/egitim|okul|kurs|kitap|universite/,'book'],[/cocuk|bebek/,'baby'],[/evcil|kedi|kopek|mama|veteriner/,'paw'],[/spor|gym|fitness/,'gym'],[/tatil|seyahat|ucak|otel|gezi/,'plane'],
  [/telefon|gsm|hat|internet/,'phone'],[/hediye|bagis/,'gift'],[/tamir|tadilat|mobilya|ev esya/,'tool'],[/abonelik|uyelik|dijital/,'repeat'],[/faiz|masraf|komisyon/,'percent'],[/kredi|borc|banka|taksit/,'bank'],
  [/maas|ucret|prim|ikramiye/,'brief'],[/yatirim|getiri|temettu/,'trend'],[/ek gelir|serbest|kira geliri/,'coins'],[/gelir/,'cash']];
function catIcKey(c){var k=S.catIc&&S.catIc[c];if(k&&ICONS[k])return k;var f=fold(c);for(var i=0;i<CATIC_RX.length;i++)if(CATIC_RX[i][0].test(f))return CATIC_RX[i][1];return c==='Transfer'?'swap':'tag';}
function catTint(c){return color(c).replace(')',' / .17)');}
function cic(c,cls){return '<span class="cic'+(cls?' '+cls:'')+'" style="color:'+color(c)+';background:'+catTint(c)+'" aria-hidden="true">'+ic(catIcKey(c))+'</span>';}
function catLabel(c,s){return (c||'')+(s?' › '+s:'');}
function subsOf(c){var l=S.subs&&S.subs[c];return Array.isArray(l)?l:[];}

/* ---------- dönem (maaş günü) ---------- */
function dimYM(y,m){return new Date(y,m,0).getDate();}
/* 32: ayın son iş günü (hafta sonuna denk gelirse önceki cuma) */
function lastBiz(y,m){var d=new Date(y,m-1,dimYM(y,m));while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()-1);return d.getDate();}
function pStartDay(y,m){return S.payday===32?lastBiz(y,m):Math.min(S.payday||1,dimYM(y,m));}
/* tarih → dönem anahtarı; aynı tarihler çok tekrarlandığından maaş gününe göre önbelleklenir */
var PKC={d:null,m:{}};
function pk(ds){if(PKC.d!==S.payday)PKC={d:S.payday,m:{}};var c=PKC.m[ds];if(c)return c;return (PKC.m[ds]=pk0(ds));}
function pk0(ds){var p=String(ds).split('-'),y=+p[0],m=+p[1],d=+p[2];if(d<pStartDay(y,m)){m--;if(m<1){m=12;y--;}}return y+'-'+pad(m);}
function pStart(k){var p=k.split('-');return k+'-'+pad(pStartDay(+p[0],+p[1]));}
function pEnd(k){var s=pdate(pStart(addMonth(k,1)));s.setDate(s.getDate()-1);return isoDate(s);}
function curP(){return pk(todayS());}
function plabel(k){return (S.payday>1)?mlabel(k)+' dönemi':mlabel(k);}
function prange(k){var f=function(d){return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});};return f(pdate(pStart(k)))+' – '+f(pdate(pEnd(k)));}
/* dönem içindeki ödeme günü: dönemin başladığı ay ya da sonraki ay (kısa aylarda ayın son günü); ikisi de dışındaysa döneme sıkıştırılır */
function dueDate(r,k){if(k.length>7)return k;var st=pStart(k),e=pEnd(k),y=+st.slice(0,4),m=+st.slice(5,7),day=r.day,c=null;
  for(var i=0;i<2&&!c;i++){var d=y+'-'+pad(m)+'-'+pad(Math.min(day,dimYM(y,m)));if(d>=st&&d<=e)c=d;m++;if(m>12){m=1;y++;}}
  if(c)return c;var f=st.slice(0,8)+pad(Math.min(day,dimYM(+st.slice(0,4),+st.slice(5,7))));return f>e?e:(f<st?st:f);}
function daysLeft(k){return daysBetween(todayS(),pEnd(k))+1;}
function pDays(k){return daysBetween(pStart(k),pEnd(k))+1;}

var ui={tab:'cuzdan',sub:'ev',rng:'ay',txv:'list',plan:'butce',sv:'hesap',an:'ozet',nwr:3,trPick:null,wk:null,alAll:false,qaOrd:null,month:curP(),filter:'all',acctF:'',calc:'kredi',cv:{},nq:'',sq:'',tq:'',nv:'act',tr:6,page:null,locked:!!S.pin,pinBuf:'',fails:0,lockUntil:0,forgot:false,hiddenAt:0,mq:'',mlink:null};

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
/* değerleme alış kuruyla (elindeki dövizi/altını bugün bozdursan alacağın TL); TL'den dövize çevirme satış kuruyla */
function vRate(c){if(!c||c==='TRY')return 1;var b=S.fxB&&+S.fxB[c];return b>0?b:rateOf(c);}
function toTL(v,a){return v*vRate(ccyOf(a));}
function fromTL(v,a){var r=rateOf(ccyOf(a));return r>0?v/r:0;}
var ATYPES=[['nakit','Nakit (cüzdan)'],['banka','Banka hesabı'],['kart','Kredi kartı'],['birikim','Birikim hesabı'],['diger','Diğer']];
function acctType(a){var t=ax(a).type;if(ATYPES.some(function(x){return x[0]===t;}))return t;var n=String(a).toLocaleLowerCase('tr-TR');return /kart/.test(n)?'kart':(/nakit|cüzdan/.test(n)?'nakit':(/birikim|tasarruf|vadeli/.test(n)?'birikim':'banka'));}
function typeName(t){var x=ATYPES.filter(function(y){return y[0]===t;})[0];return x?x[1]:'Diğer';}
function moneyIn(v,a,z){var c=ccyOf(a);if(c==='TRY')return (z?TRY0:TRY2).format(v);if(maskOn)return MASK+' '+CSYM[c];v=clean(v,1);return (v<0?'−':'')+(c==='XAU'?NUM2.format(Math.abs(v))+' gr':CSYM[c]+(c==='CHF'?' ':'')+(z?NUM2:FIX2).format(Math.abs(v)));}
/* görüntüleme para birimi: net servet, analiz ve FIRE güncel kurla bu birimde gösterilir */
function dccy(){var c=S.dccy;return (c&&c!=='TRY'&&rateOf(c)>0)?c:'TRY';}
var DC0={format:function(tl){var c=dccy();return fmtC(tl/rateOf(c),c,0);}};
var DC2={format:function(tl){var c=dccy();return fmtC(tl/rateOf(c),c,1);}};
function sgnD(n){return Math.abs(n)<0.5?DC0.format(0):(n<0?'−':'+')+DC0.format(Math.abs(n));}
/* işlemin TL karşılığı: dövizli işlemde kayıt günündeki kur kullanılır (raporlar geçmişe dönük değişmez) */
function txTL(t){/* kayıtlı kur yoksa değerleme (alış) kuru: dövizli gider ile hesap bakiyesi aynı kurla TL'ye çevrilir */var c=ccyOf(t.acct);if(c==='TRY')return t.amt;var f=+t.fx;return t.amt*(f>0?f:vRate(c));}
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
/* tüm hesap bakiyeleri tek geçişte; işlem listesi, açılış bakiyeleri ya da çizim sürümü değişince yeniden hesaplanır */
var BALC={v:-1};
function instLeft(r){if(!r.auto||!(+r.n>0))return 0;var done=Object.keys(r.paid||{}).filter(function(k){return byId(S.tx,r.paid[k]);}).length;return r2(Math.max(+r.n-done,0)*(+r.amt||0));}
function instSig(){return S.recurring.filter(function(r){return r.auto;}).map(function(r){return r.id+':'+Object.keys(r.paid||{}).length+':'+r.n+':'+r.amt;}).join(',');}
function balAll(){
  var A=ACCS(),os=JSON.stringify(S.opening)+JSON.stringify(S.openD||{})+instSig();
  if(BALC.v===TXV&&BALC.s===S.tx&&BALC.n===S.tx.length&&BALC.a===A.join('\u0001')&&BALC.o===os)return BALC.m;
  var m={};A.forEach(function(a){m[a]=+S.opening[a]||0;});
  var od=S.openD||{};
  for(var i=0;i<S.tx.length;i++){var t=S.tx[i];
    if(t.type==='trf'){if(t.acct in m&&!(od[t.acct]&&t.date<od[t.acct]))m[t.acct]-=t.amt;if(t.to in m&&!(od[t.to]&&t.date<od[t.to]))m[t.to]+=(t.amt2>0?t.amt2:t.amt);}
    else if(t.acct in m&&!(od[t.acct]&&t.date<od[t.acct]))m[t.acct]+=txDelta(t,t.acct);}
  /* kartla taksitli alışverişin henüz işlenmemiş taksitleri kart borcuna dahil (banka limitten tamamını düşer) */
  S.recurring.forEach(function(r){if(r.auto&&r.acct in m)m[r.acct]-=instLeft(r);});
  BALC={v:TXV,s:S.tx,n:S.tx.length,a:A.join('\u0001'),o:os,m:m};return m;
}
function acctBal(a){var m=balAll();if(a in m)return r2(m[a]);var b=+S.opening[a]||0,o=(S.openD||{})[a];for(var i=0;i<S.tx.length;i++)if(!(o&&S.tx[i].date<o))b+=txDelta(S.tx[i],a);return r2(b);}
function accTotal(){return r2(ACCS().reduce(function(a,x){return a+toTL(acctBal(x),x);},0));}
function acctUsed(a){return S.tx.some(function(t){return t.acct===a||t.to===a;})||S.recurring.some(function(r){return r.acct===a;})||S.goals.some(function(g){return g.acct===a;});}
function hKind(h){return h.kind==='asset'?'asset':'inv';}
function hPrice0(h){if(h.mk){var p=mTL(h.mk);if(p>0)return p;}var r=h.ccy&&vRate(h.ccy);return r>0&&h.ccy!=='TRY'?r:(+h.price||0);}
/* 4.12: mevduat ve tahmini getirili fonlarda bugüne kadarki faiz/getiri fiyata katılır (yFac, 18-yield.js) */
function hPrice(h){var p=hPrice0(h);return +h.yr>0?p*yFac(h):p;}
function hVal(h){return r2(h.qty*hPrice(h));} function hCost(h){return r2(h.qty*h.cost);}
function pfTotals(kind){var v=0,c=0;S.holdings.forEach(function(h){if(kind&&hKind(h)!==kind)return;v+=hVal(h);c+=hCost(h);});return {v:r2(v),c:r2(c)};}
/* otomatik yedek: kendi verin varsa ve (PIN sıfırlamasından sonra) duraklatılmamışsa */
function lsHas(k){try{return !!localStorage.getItem(k);}catch(e){return false;}}
function hasOwn(){var f=function(l){return (l||[]).some(function(x){return !x.sample;});};return f(S.tx)||f(S.holdings)||f(S.notes)||f(S.goals)||f(S.recurring)||f(S.debts);}
function bkOk(){return hasOwn()&&!S.bkHold;}
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
/* maaş günü değişince dönemler kayar: ödendi işaretleri bağlı işlemin yeni dönemine taşınır */
/* maaş günü değişimi: ödendi işaretleri ve düzenli kalemlerin başlangıç dönemleri yeni dönemlere taşınır */
function setPayday(pd){var ds={};S.recurring.forEach(function(r){if(r.start&&!isWk(r))ds[r.id]=dueDate(r,r.start);});S.payday=pd;remapPaid();S.recurring.forEach(function(r){if(ds[r.id])r.start=pk(ds[r.id]);});}
function remapPaid(){S.recurring.forEach(function(r){if(!r.paid)return;var n={};Object.keys(r.paid).forEach(function(k){var t=byId(S.tx,r.paid[k]);if(t)n[k.length>7?k:pk(t.date)]=t.id;});r.paid=n;});}
/* dönemde ödenmemiş düzenli ödemeler (gecikmişler dahil): ana kart, tahmin ve Plan › Düzenli aynı sayıyı kullanır */
/* ---------- düzenli kalemler: sıklık, başlangıç, taksit sayısı ----------
   every: kaç ayda bir (1, 2, 3, 6, 12); start: ilk dönem (YYYY-MM); n: toplam taksit; inc: düzenli gelir (maaş);
   auto: günü gelince kendiliğinden işlenir (kartla taksitli alışveriş). Eski kayıtlar (alan yok) her ay sayılır. */
function mdiff(a,b){return (+b.slice(0,4)-+a.slice(0,4))*12+(+b.slice(5,7)-+a.slice(5,7));}
/* 4.12: haftalık kalemler. wk: kaç haftada bir (1, 2); start: ilk ödeme tarihi (YYYY-MM-DD); since: eklendiği gün (öncesi izlenmez);
   her oluşumun anahtarı kendi tarihidir (paid['2026-11-10']); aylık kalemlerde anahtar dönemdir (paid['2026-11']) */
function isWk(r){return +r.wk>0;}
function addD(ds,n){var d=pdate(ds);d.setDate(d.getDate()+n);return isoDate(d);}
function wkStep(r){return 7*(+r.wk===2?2:1);}
function wkOn(r,q){if(!r.start||q<r.start||(r.since&&r.since.length>7&&q<r.since))return false;var d=daysBetween(r.start,q),st=wkStep(r);if(d%st)return false;return !(+r.n>0&&d/st>=+r.n);}
/* dönemdeki oluşum anahtarları: aylıkta [dönem], haftalıkta dönemin içindeki ödeme tarihleri */
function occs(r,k){if(!isWk(r))return recOn(r,k)?[k]:[];
  var out=[],s=pStart(k),e=pEnd(k);if(!r.start||r.start>e)return out;var st=wkStep(r),d0=daysBetween(r.start,s),i=d0<=0?0:Math.ceil(d0/st);
  for(var g=0;g<40;g++,i++){if(+r.n>0&&i>=+r.n)break;var q=addD(r.start,i*st);if(q>e)break;if(wkOn(r,q))out.push(q);}return out;}
function occsIn(r,ks){var o=[];ks.forEach(function(k){o=o.concat(occs(r,k));});return o;}
var WDAY=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
function recFq(r){if(isWk(r)){var w=r.start?WDAY[pdate(r.start).getDay()].toLocaleLowerCase('tr-TR'):'';return +r.wk===2?'2 haftada bir'+(w?' '+w:''):(w?'her '+w:'her hafta');}var ev=+r.every||1;return ev>1?({2:'2 ayda bir',3:'3 ayda bir',6:'6 ayda bir',12:'yılda bir'}[ev]||ev+' ayda bir'):'';}
function recOn(r,k){if(isWk(r))return k.length>7?wkOn(r,k):occs(r,k).length>0;var ev=+r.every||1;if(!r.start)return ev===1&&!(+r.n>0)&&!(r.since&&k<r.since);var i=mdiff(r.start,k);if(i<0||i%ev)return false;return !(+r.n>0&&Math.floor(i/ev)>=+r.n);}
function recNo(r,k){if(isWk(r)){var q=k.length>7?k:(occs(r,k)[0]||r.start);return r.start?Math.floor(daysBetween(r.start,q)/wkStep(r))+1:0;}return r.start?Math.floor(mdiff(r.start,k)/(+r.every||1))+1:0;}
function recDone(r){if(!(+r.n>0)||!r.start)return false;if(isWk(r))return addD(r.start,(+r.n-1)*wkStep(r))<pStart(curP());return mdiff(r.start,curP())>=(+r.n)*(+r.every||1);}
function recMonthly(r){if(isWk(r))return toTL(+r.amt||0,r.acct)*52/12/(+r.wk===2?2:1);return toTL(+r.amt||0,r.acct)/(+r.every||1);}
/* aylık düzenli ödeme toplamı: gelirler ve biten taksitler hariç, sıklığa bölünmüş (Plan, Analiz, Claude özeti aynı sayı) */
function recMonthlyTot(){return r2(S.recurring.reduce(function(a,r){return a+(r.inc||recDone(r)?0:recMonthly(r));},0));}
/* işlem bu düzenli kalemin bu dönemki ödemesi mi: aynı hesap, aynı kategori ya da notta adı geçiyor, tutar ±%15, vadeye ±10 gün */
/* eşleşme gücü: 2 = notta kalemin adı geçiyor (sessizce bağlanır), 1 = yalnız kategori ve tutar tutuyor (kullanıcıya sorulur), 0 = değil.
   Pencere: vadeden 10 gün önce ile 10 gün sonrası; ödenmemiş gecikmiş kalemde bir sonraki dönemin sonuna kadar */
function recFitN(r,t,k){if((t.type==='inc')!==!!r.inc||(t.type!=='inc'&&t.type!=='exp'))return 0;if(t.acct!==r.acct||!recOn(r,k))return 0;
  var d=dueDate(r,k),dd=daysBetween(d,t.date);if(isWk(r)){if(dd<-3||(dd>3&&(recPaid(r,k)||dd>=wkStep(r))))return 0;}
  else{if(dd<-10)return 0;if(dd>10&&(recPaid(r,k)||t.date>pEnd(addMonth(k,1))))return 0;}
  var nm=fold(r.name||'').trim(),named=nm.length>=3&&fold(t.note||'').indexOf(nm)>=0,a=toTL(+r.amt||0,r.acct),b=txTL(t);if(!(a>0))return 0;
  if(named)return Math.abs(b-a)/a<=0.5?2:0;return t.cat===r.cat&&Math.abs(b-a)/a<=0.1?1:0;}
function recFits(r,t,k){return recFitN(r,t,k)>0;}
function recLinked(){var o={};S.recurring.forEach(function(r){Object.keys(r.paid||{}).forEach(function(k){o[r.paid[k]]=1;});});return o;}
/* dönemde düzenli kalem olarak ödenen borç taksitlerinin anaparası: gider sayılmaz ama para hesaptan çıkmıştır.
   Ödenince "ödenecek"ten düşer; "kalan" ve dönem sonu tahmini artmasın diye ayrıca sayılır */
function recDebtPaid(k){var L=recLinked(),s=0;monthTx(k).forEach(function(t){if(t.type==='dbt'&&t.side==='out'&&(L[t.id]||(t.rec&&byId(S.recurring,t.rec))))s+=txTL(t);});return r2(s);}
/* işlemle birlikte silinip geri gelen bağlı kayıtlar: kredi taksidinin ayrı yazılan faiz gideri */
function txGroup(t){var it=t&&t.intId&&byId(S.tx,t.intId);return it?[t,it]:[t];}
/* grubu siler; dönen işlev geri alır (işlemler eski sıralarına döner) */
function txRemove(grp){var pos=grp.map(function(x){return {x:x,i:S.tx.indexOf(x)};}).sort(function(a,b){return a.i-b.i;});
  S.tx=S.tx.filter(function(x){return grp.indexOf(x)<0;});
  return function(){pos.forEach(function(p){if(S.tx.indexOf(p.x)<0)S.tx.splice(Math.min(Math.max(p.i,0),S.tx.length),0,p.x);});};}
/* kopyalanan ya da bölünen işlem: taksit planı, düzenli ödeme, faiz, içe aktarma ve fiş bağları kopyaya geçmez */
function txCopy(t,extra){var c=Object.assign({},t,extra||{});['inst','rec','intId','conv','rc','auto','sample','ts','imp'].forEach(function(f){delete c[f];});return c;}
/* yeni işlem için eşleşen ödenmemiş düzenli kalem */
/* aynı güçte adaylardan: bu dönemin vadesine 10 günden çok varsa önceki dönemin ödenmemiş gecikmiş kalemi, yoksa vadeye en yakın */
function recMatch(t){var k0=pk(t.date),best=null,bs=0,bd=999;[addMonth(k0,-1),k0].forEach(function(k){S.recurring.forEach(function(r){if(isWk(r)||recPaid(r,k))return;var n=recFitN(r,t,k);if(!n)return;var dd=k<k0&&dueDate(r,k)<=t.date&&!(recOn(r,k0)&&!recPaid(r,k0)&&daysBetween(t.date,dueDate(r,k0))<=10)?-1:Math.abs(daysBetween(dueDate(r,k),t.date));if(n>bs||(n===bs&&dd<bd)){bs=n;bd=dd;best={r:r,k:k,n:n};}});});
  /* haftalık kalemler: işlemin tarihine en yakın ödenmemiş oluşum */
  S.recurring.forEach(function(r){if(!isWk(r))return;occsIn(r,[addMonth(k0,-1),k0,addMonth(k0,1)]).forEach(function(q){if(recPaid(r,q))return;var n=recFitN(r,t,q);if(!n)return;var dd=Math.abs(daysBetween(q,t.date));if(n>bs||(n===bs&&dd<bd)){bs=n;bd=dd;best={r:r,k:q,n:n};}});});return best;}
/* düzenli kalem için bu dönemde girilmiş, henüz bağlanmamış işlem */
function recFind(r,k,strong){var L=recLinked(),best=null,bn=0;S.tx.forEach(function(t){if(L[t.id])return;var n=recFitN(r,t,k);if(!n||(strong&&n<2))return;if(n>bn||(n===bn&&Math.abs(daysBetween(dueDate(r,k),t.date))<Math.abs(daysBetween(dueDate(r,k),best.date)))){bn=n;best=t;}});return best;}
function linkRec(r,k,t){r.paid=r.paid||{};r.paid[k]=t.id;var d=r.debt&&byId(S.debts,r.debt);
  if(d&&t.type==='exp'&&debtLeft(d)>0){var sp=loanSplit(d,txTL(t));t.conv={cat:t.cat,amt:t.amt};t.type='dbt';t.side='out';t.debt=d.id;t.dname=d.name;t.amt=r2(fromTL(sp.p,t.acct));delete t.cat;
    if(sp.i>0.005){var it={id:uid(),type:'exp',amt:r2(fromTL(sp.i,t.acct)),cat:ensureCat('exp','Faiz ve masraf'),acct:t.acct,note:d.name+' faizi',date:t.date,rec:r.id};S.tx.push(it);t.intId=it.id;}}}
function unlinkRec(r,k){var t=byId(S.tx,r.paid&&r.paid[k]);if(r.paid)delete r.paid[k];if(!t)return;
  if(t.conv){if(t.intId)S.tx=S.tx.filter(function(x){return x.id!==t.intId;});t.type='exp';t.cat=t.conv.cat;t.amt=t.conv.amt;['conv','side','debt','dname','intId'].forEach(function(f){delete t[f];});}}
/* kredi taksidinin bölünmesi: faiz = kalan × aylık oran; KKDF+BSMV faize eklenir (ihtiyaç kredisinde %30, konutta 0) */
function loanTax(d){return d.tax!=null&&d.tax!==''?(+d.tax||0)/100:(d.type==='Kredi'?0.3:0);}
function loanSplit(d,amt,left){left=left==null?debtLeft(d):left;var r=(+d.rate||0)/100;if(!(r>0))return {p:r2(Math.min(amt,left)),i:r2(Math.max(amt-left,0))};
  var it=r2(left*r*(1+loanTax(d))),p=r2(Math.min(Math.max(amt-it,0),left));return {p:p,i:r2(amt-p)};}
/* ödeme planı: verilen taksitle kalan borcun ay ay bölünmesi (en çok 600 ay) */
function loanPlan(d,P){var L=debtLeft(d),r=(+d.rate||0)/100*(1+loanTax(d)),out=[],guard=0;if(!(P>0)||!(L>0))return out;
  while(L>0.005&&guard++<600){var it=r2(L*r),p=r2(Math.min(Math.max(P-it,0),L));if(p<=0&&r>0)return {never:true,rows:out};L=r2(L-p);out.push({n:guard,i:it,p:p,left:L,pay:r2(p+it)});}return out;}
function loanPmt(d,n){var L=debtLeft(d),r=(+d.rate||0)/100*(1+loanTax(d));if(!(n>0)||!(L>0))return 0;return r2(r>0?L*r/(1-Math.pow(1+r,-n)):L/n);}
/* kredi kartı ekstresi: hesap kesim gününde kart borcu, sonrasında yapılan ödemeler düşülür */
function balAt(a,D){var b=+S.opening[a]||0,o=(S.openD||{})[a];if(o&&o>D)return null;S.tx.forEach(function(t){if(t.date<=D&&!(o&&t.date<o))b+=txDelta(t,a);});return r2(b);}
function cardStmt(a){var x=ax(a),cut=+x.cut;if(!(cut>=1&&cut<=31))return null;var t0=today0(),y=t0.getFullYear(),m=t0.getMonth();
  var cd=new Date(y,m,Math.min(cut,dimYM(y,m+1)));if(isoDate(cd)>todayS())cd=new Date(y,m-1,Math.min(cut,dimYM(y,m)));var c=isoDate(cd),b=balAt(a,c),first=false;
  /* kesim günü açılış tarihinden önceyse: açılıştaki kart borcu son ekstre sayılır, sonrası yeni harcama */
  if(b==null){var o=(S.openD||{})[a];if(!o)return null;b=+S.opening[a]||0;c=o;first=true;}
  var cr=0,sp=0;S.tx.forEach(function(t){if(t.date>c&&t.date<=todayS()){var v=txDelta(t,a);if(v>0)cr+=v;else sp-=v;}});
  var stmt=r2(Math.max(-b,0)),due=null;if(+x.due>0){var dd=new Date(cd);dd.setDate(dd.getDate()+1);due=cardDue(a,dd);}
  return {cut:c,stmt:stmt,left:r2(Math.max(stmt-cr,0)),since:r2(sp),due:due,first:first};}
/* bütçe devri (isteğe bağlı): geçen dönemden artan limit eklenir, aşım düşülür (yalnız bir önceki dönem; birikmez) */
function budLim(c,k){var b=+S.budgets[c]||0;if(!(b>0)||!S.budRoll)return b;var p=addMonth(k||curP(),-1),st=dataStart(),since=S.budSince&&S.budSince[c];if((since&&p<since)||(st&&p<st)||!monthTx(p).length)return b;var sp=spentByCat(p)[c]||0;return r2(Math.max(b+(b-sp),0));}
/* sayıdan sonra iyelik eki: 1’i 2’si 3’ü 6’sı 9’u 10’u 40’ı 100’ü 1000’i (ayın 2’si, %29’u); +'nde' → 2’sinde */
function sfx(n){n=Math.abs(Math.round(+n||0));if(!n)return '’ı';var l=n%10,t=Math.floor(n%100/10);if(l)return '’'+{1:'i',2:'si',3:'ü',4:'ü',5:'i',6:'sı',7:'si',8:'i',9:'u'}[l];if(t)return '’'+{1:'u',2:'si',3:'u',4:'ı',5:'si',6:'ı',7:'i',8:'i',9:'ı'}[t];return n%1000?'’ü':'’i';}
/* işlem sırası: tarih, sonra aynı gün içinde en son eklenen üstte */
function txCmp(a,b){return b.date<a.date?-1:b.date>a.date?1:((b.ts||0)-(a.ts||0))||(b.id>a.id?1:-1);}
function recIncDue(k){var tot=0;S.recurring.forEach(function(r){if(!r.inc)return;occs(r,k).forEach(function(q){if(!recPaid(r,q))tot+=toTL(+r.amt||0,r.acct);});});return r2(tot);}
function recDue(k,from){var t0=from||'',tot=0,over=0;S.recurring.forEach(function(r){if(r.inc)return;occs(r,k).forEach(function(q){if(recPaid(r,q))return;var d=dueDate(r,q);if(d<t0)return;var v=toTL(+r.amt||0,r.acct);tot+=v;if(d<todayS())over+=v;});});return {tot:r2(tot),over:r2(over)};}
/* listede gösterilecek oluşum: haftalıkta dönemin ilk ödenmemişi (hepsi ödendiyse sonuncusu) */
function recShow(r,k){if(!isWk(r))return k;var q=occs(r,k);if(!q.length)return k;for(var i=0;i<q.length;i++)if(!recPaid(r,q[i]))return q[i];return q[q.length-1];}
function recPaid(r,k){var id=r.paid&&r.paid[k];return !!id&&S.tx.some(function(t){return t.id===id;});}
/* bir tarihteki net servet: hesaplar o güne kadarki hareketlerden, yatırımlar bugünkü değerinden, borçlar o güne kadarki ödemelerden */
function nwAt(D){
  var tot=0,firstBuy={},inD={};
  var od=S.openD||{};ACCS().forEach(function(a){var b=+S.opening[a]||0;S.tx.forEach(function(t){if(t.date<=D&&!(od[a]&&t.date<od[a]))b+=txDelta(t,a);});tot+=toTL(b,a);});
  S.tx.forEach(function(t){if(t.type==='inv'&&t.side==='buy'&&t.hold&&(!firstBuy[t.hold]||t.date<firstBuy[t.hold]))firstBuy[t.hold]=t.date;if(t.type==='dbt'&&t.side==='in'&&t.debt&&(!inD[t.debt]||t.date<inD[t.debt]))inD[t.debt]=t.date;});
  S.holdings.forEach(function(h){if(!(firstBuy[h.id]&&firstBuy[h.id]>D))tot+=hVal(h);});
  S.debts.forEach(function(d){if(inD[d.id]&&inD[d.id]>D)return;var paid=0;S.tx.forEach(function(t){if(t.type==='dbt'&&t.side==='out'&&t.debt===d.id&&t.date<=D)paid+=txTL(t);});tot-=Math.max((+d.amt||0)-paid,0);});
  return r2(tot);
}
/* nwAt'ın birçok tarih için tek taramalı hâli (tarihler artan sırada): işlemler bir kez sıralanır, bakiyeler birikir */
function nwAtMany(ends){
  var out={};if(!ends.length)return out;ends=ends.slice().sort();
  var A=ACCS(),bal={},firstBuy={},inD={},paid={};A.forEach(function(a){bal[a]=+S.opening[a]||0;});
  S.tx.forEach(function(t){if(t.type==='inv'&&t.side==='buy'&&t.hold&&(!firstBuy[t.hold]||t.date<firstBuy[t.hold]))firstBuy[t.hold]=t.date;if(t.type==='dbt'&&t.side==='in'&&t.debt&&(!inD[t.debt]||t.date<inD[t.debt]))inD[t.debt]=t.date;});
  var srt=S.tx.slice().sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0;}),i=0;
  ends.forEach(function(D){
    while(i<srt.length&&srt[i].date<=D){var t=srt[i++];
      var od=S.openD||{};
      if(t.type==='trf'){if(t.acct in bal&&!(od[t.acct]&&t.date<od[t.acct]))bal[t.acct]-=t.amt;if(t.to in bal&&!(od[t.to]&&t.date<od[t.to]))bal[t.to]+=(t.amt2>0?t.amt2:t.amt);}
      else if(t.acct in bal&&!(od[t.acct]&&t.date<od[t.acct]))bal[t.acct]+=txDelta(t,t.acct);
      if(t.type==='dbt'&&t.side==='out'&&t.debt)paid[t.debt]=(paid[t.debt]||0)+txTL(t);}
    var tot=0;A.forEach(function(a){tot+=toTL(bal[a],a);});
    S.holdings.forEach(function(h){if(!(firstBuy[h.id]&&firstBuy[h.id]>D))tot+=hVal(h);});
    S.debts.forEach(function(d){if(inD[d.id]&&inD[d.id]>D)return;tot-=Math.max((+d.amt||0)-(paid[d.id]||0),0);});
    out[D]=r2(tot);});
  return out;
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
      var need=ends.filter(function(e){return !pts[e]&&e<today;}),vals=nwAtMany(need);need.forEach(function(e){pts[e]={v:vals[e],e:true};});}}
  pts[today]={v:r2(wealth().net),e:false};
  var v=Object.keys(pts).sort().map(function(k){return [k,pts[k].v,pts[k].e];});
  NWC={k:key,v:v};return v;
}
/* net servetin tam "days" gün önceki değerine göre değişimi; kayıtlar daha yeniyse ilk kayıttan beri (since) */
function histChange(days){
  var s=nwSeries();if(s.length<2)return null;
  var last=s[s.length-1],from=pdate(last[0]);from.setDate(from.getDate()-days);var fk=isoDate(from),a;
  if(s[0][0]>fk){if(s[0]===last)return null;a=s[0][1];return {d:r2(last[1]-a),p:Math.abs(a)>=1000?(last[1]-a)/Math.abs(a)*100:null,days:daysBetween(s[0][0],last[0]),since:true};}
  a=S.hist[fk]!=null?+S.hist[fk]:nwAtMany([fk])[fk];
  return {d:r2(last[1]-a),p:Math.abs(a)>=1000?(last[1]-a)/Math.abs(a)*100:null,days:days};
}

/* ---------- gösterge tabanı ----------
   Koç, Analiz, FIRE, acil durum fonu ve Claude özeti aynı dönemleri kullanır: kullanım başlangıcından (ilk gelir ya da
   açılış bakiyesi tarihi) sonraki, en çok 6 tamamlanmış dönem. Başlangıçtan önceki tek tük eski işlemler sayılmaz;
   tamamlanmış dönem yoksa bu dönem kullanılır (part:true). */
function dataStart(){var f=S.openDate||'';S.tx.forEach(function(t){if(t.type==='inc'&&(!f||t.date<f))f=t.date;});
  if(!f)S.tx.forEach(function(t){if(t.type==='exp'&&(!f||t.date<f))f=t.date;});return f?pk(f):null;}
var MBC={k:''};
function monthBase(){var key=TXV+'|'+S.savedAt+'|'+todayS();if(MBC.k===key)return MBC.v;
  var cur=curP(),st=dataStart(),ks=[];
  for(var i=1;i<=6;i++){var k=addMonth(cur,-i);if(st&&k<st)break;if(monthTx(k).some(function(t){return t.type==='inc'||t.type==='exp';}))ks.push(k);}
  var v={ks:ks,n:ks.length,part:!ks.length,cur:cur,start:st};MBC={k:key,v:v};return v;}
function avgMonthly(type){var B=monthBase(),v=[];B.ks.forEach(function(k){var s=sum(monthTx(k),type);if(s>0)v.push(s);});
  if(!v.length){var s0=sum(monthTx(B.cur),type);if(s0>0)v.push(s0);}
  return v.length?v.reduce(function(a,b){return a+b;},0)/v.length:0;}
function avgSave(){var B=monthBase(),v=[];B.ks.forEach(function(k){var l=monthTx(k);v.push(sum(l,'inc')-sum(l,'exp'));});
  if(!v.length){var l0=monthTx(B.cur);if(l0.length)v.push(sum(l0,'inc')-sum(l0,'exp'));}
  return v.length?v.reduce(function(a,b){return a+b;},0)/v.length:0;}
/* ---------- FIRE ---------- */
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
