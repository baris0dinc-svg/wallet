/* Google yazı tipi sayfanın ilk çizimini bekletmeden yüklenir (satır içi onload yerine: güvenlik politikası) */
(function(){var f=document.getElementById('gf');if(!f)return;var on=function(){f.media='all';};try{if(f.sheet)on();else f.addEventListener('load',on);}catch(e){on();}})();
/* hata kaydı: beklenmeyen hatalar ve güvenlik politikası ihlalleri cihazda saklanır (son 20); Ayarlar > Veri ve yedek'ten kopyalanabilir.
   Hiçbir yere gönderilmez. */
var ERRK='wallet-err';
function errLog(kind,msg,where){try{var l=JSON.parse(localStorage.getItem(ERRK)||'[]');l.push({t:Date.now(),k:kind,m:String(msg||'').slice(0,300),w:String(where||'').slice(0,200)});
  localStorage.setItem(ERRK,JSON.stringify(l.slice(-20)));}catch(e){}}
window.addEventListener('error',function(e){if(e.error&&e.error.__logged)return;errLog('hata',e.message,(e.filename||'').split('/').pop()+':'+e.lineno+':'+e.colno);});
window.addEventListener('unhandledrejection',function(e){var r=e.reason;errLog('söz',r&&r.message||r,r&&r.stack&&String(r.stack).split('\n')[1]);});
document.addEventListener('securitypolicyviolation',function(e){errLog('politika',e.violatedDirective,e.blockedURI);});
(function(){
'use strict';
var KEY='kumbara-v1',UIKEY='wallet-ui',VER='4.15';
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

/* ---------- ortak parçalar ---------- */
function needSetup(){if(hasSample()||S.setupHide)return false;var any=ACCS().some(function(a){return (+S.opening[a]||0)!==0;});return !any&&!S.holdings.length&&!S.tx.length;}
ACT['setup-hide']=function(){S.setupHide=true;save();render();};
function bannerHtml(){
  if(needSetup())return '<div class="banner col"><span>Başlamak için hesaplarındaki mevcut parayı gir; böylece bakiyelerin doğru görünür.</span><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn small" data-act="open-bal">Bakiyeleri gir</button><button class="btn small ghost" data-act="sample-load">Örnekle dene</button><button class="btn small ghost" data-act="setup-hide">Sonra</button></span></div>';
  return hasSample()?'<div class="banner"><span>Örnek veriler gösteriliyor.</span><button class="btn small ghost" data-act="sample-clear">Örnekleri sil</button></div>':'';
}
/* yaklaşan ödemeler: düzenli ödemeler ve kredi kartı son ödeme günleri */
function cardDue(a,from){var due=+ax(a).due;if(!(due>0))return null;var y=from.getFullYear(),m=from.getMonth();
  var dt=new Date(y,m,Math.min(due,dimYM(y,m+1)));if(dt<from)dt=new Date(y,m+1,Math.min(due,dimYM(y,m+2)));return isoDate(dt);}
function upcoming(days){
  var out=[],t0=today0(),end=new Date(t0);end.setDate(end.getDate()+days);var e=isoDate(end),s=isoDate(t0),cur=curP(),seen={};
  for(var i=0;i<3;i++){var k=addMonth(cur,i);S.recurring.forEach(function(r){if(r.inc)return;occs(r,k).forEach(function(q){if(recPaid(r,q))return;var d=dueDate(r,q);if(d>e||(i>0&&d<s))return;var key=r.id+d;if(seen[key])return;seen[key]=1;
    out.push({date:d,name:r.name,amt:r.amt,acct:r.acct,kind:'rec',id:r.id,per:q});});});}
  ACCS().forEach(function(a){if(acctType(a)!=='kart')return;var cs=cardStmt(a);if(cs){if(cs.left>0&&cs.due&&cs.due<=e)out.push({date:cs.due,name:a+' ekstre',amt:cs.left,acct:a,kind:'card'});return;}var b=acctBal(a);if(!(b<0))return;var d=cardDue(a,t0);if(d&&d<=e)out.push({date:d,name:a+' son ödeme',amt:-b,acct:a,kind:'card'});});
  return out.sort(function(x,y){return x.date.localeCompare(y.date);});
}
/* uyarılar: [renk, metin, eylem] — eylem: ödeme için 'Ödendi', bütçe için kategori işlemleri */
var ALC={v:-1};
/* bir çizim içinde (başlık + ana sayfa) bir kez hesaplanır; çizim dışında her çağrı tazedir */
var RIN=false;
function alertItems(){if(RIN&&ALC.v===TXV)return ALC.r;var r=alertItems0();if(RIN)ALC={v:TXV,r:r};return r;}
function alertItems0(){
  var A=S.alerts,items=[],cur=curP();
  if(A.rec){var t0=todayS();upcoming(+A.days||0).forEach(function(u){var diff=daysBetween(t0,u.date);
    items.push([diff<0?'exp':'warn',u.name+' '+(diff<0?(-diff)+' gün gecikti':(diff===0?'bugün':diff+' gün sonra'))+' · '+moneyIn(u.amt,u.acct,1),u.kind==='rec'?['al-pay',u.id,u.per,'Ödendi']:['acct-trf',u.acct,null,'Öde']]);});}
  if(A.rec)items=items.concat(yAlerts(+A.days||0));
  items=items.concat(mTgtAlerts());
  if(A.budget){var sp=spentByCat(cur);EXPC().forEach(function(c){var lim=budLim(c,cur);if(lim>0){var s=sp[c]||0,r=s/lim*100;
    if(r>=100)items.push(['exp',c+' bütçesi aşıldı, '+TRY0.format(s-lim)+' fazla',['cat-tx',null,c,'Gör']]);
    else if(r>=A.thr)items.push(['warn',c+': bütçenin %'+Math.round(r)+' kullanıldı',['cat-tx',null,c,'Gör']]);}});}
  return items;
}
function alertRow(x,home){var a=x[2];return '<div class="item al">'+(home?'<span class="sic sm" style="--c:var(--'+x[0]+')">'+ic('bell')+'</span>':'<span class="dot" style="background:var(--'+x[0]+')"></span>')+'<span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span>'+(a?'<button class="btn small ghost" data-act="'+a[0]+'"'+(a[1]!=null?' data-id="'+esc(a[1])+'"':'')+(a[2]!=null?' data-v="'+esc(a[2])+'"':'')+'>'+a[3]+'</button>':'')+'</div>';}
/* ana sayfadaki Gündem satırları: ilk 3 uyarı düğmesiyle; daha fazlası "Tüm uyarılar" penceresinde */
function alertsHtml(){
  var items=alertItems();if(!items.length)return '';
  return items.slice(0,3).map(function(x){return alertRow(x,1);}).join('')+(items.length>3?'<button class="item almore" data-act="alerts"><span class="mid">Tüm uyarılar ('+items.length+')</span>'+ic('r')+'</button>':'');
}
function alertSheet(){
  var items=alertItems();if(!items.length){closeSheet();return;}
  openSheet('<h2>Uyarılar</h2><div class="list">'+items.map(function(x){return alertRow(x);}).join('')+'</div><button class="linkbtn" data-act="open-set" data-id="bild">Hatırlatıcı ayarları ›</button>');
}
/* sekme içi alt sekmeler (Planlama, Servetim, Analiz) */
function segTabs(list,cur,act,aria){return '<div class="seg" role="tablist" aria-label="'+aria+'">'+list.map(function(x){return '<button role="tab" data-act="'+act+'" data-v="'+x[0]+'" aria-pressed="'+(cur===x[0])+'" aria-selected="'+(cur===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>';}
function monthNav(flat){return '<div class="mnav'+(flat?' flat':'')+'"><button class="icon-btn" data-act="mprev" aria-label="Önceki dönem">'+ic('l')+'</button><span style="text-align:center">'+esc(plabel(ui.month))+(S.payday>1?'<div class="small muted" style="font-weight:500">'+esc(prange(ui.month))+'</div>':'')+'</span><button class="icon-btn" data-act="mnext" aria-label="Sonraki dönem">'+ic('r')+'</button></div>';}
function mvLabel(t){
  if(t.type==='inv'){var h=byId(S.holdings,t.hold),n=h?h.name:t.hname;return (t.side==='sell'?'Yatırım satışı':'Yatırım alımı')+(n?' · '+n:'');}
  if(t.type==='dbt'){var d=byId(S.debts,t.debt),m=d?d.name:t.dname;return (t.side==='in'?'Borç alındı':'Borç ödemesi')+(m?' · '+m:'');}
  if(t.type==='adj')return 'Bakiye düzeltmesi';
  return t.cat||'';
}
function txRow(t){
  if(t.type==='trf')return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--ink2)"></span><span class="mid"><div class="t">'+(t.note?esc(t.note):(acctType(t.to)==='kart'?'Kart borcu ödemesi':'Transfer'))+'</div><div class="small muted ell">'+(t.note?(acctType(t.to)==='kart'?'Kart borcu ödemesi · ':'Transfer · '):'')+esc(t.acct)+' → '+esc(t.to)+'</div></span><span class="amt"><span class="num">'+moneyIn(t.amt,t.acct)+'</span>'+(t.amt2>0?'<span class="small muted num">→ '+moneyIn(t.amt2,t.to)+'</span>':'')+'</span></button>';
  if(t.type==='inv'||t.type==='dbt'||t.type==='adj'){var lb=mvLabel(t),up=txDelta(t,t.acct)>0;
    return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--'+(t.type==='dbt'?'warn':(t.type==='inv'?'blue':'ink2'))+')"></span><span class="mid"><div class="t">'+esc(t.note||lb)+'</div><div class="small muted ell">'+esc((t.note?lb+' · ':'')+t.acct)+'</div></span><span class="num'+(up?' inc':'')+'">'+(up?'+':'−')+moneyIn(Math.abs(t.amt),t.acct)+'</span></button>';}
  var inc=t.type==='inc';
  return '<button class="item" data-act="edit-tx" data-id="'+t.id+'">'+cic(t.cat)+'<span class="mid"><div class="t">'+(t.rc?'<span class="rcm" title="Fiş fotoğrafı var">'+ic('camera')+'</span>':'')+esc(t.note||t.sub||t.cat)+'</div><div class="small muted ell">'+(t.note?esc(catLabel(t.cat,t.sub))+' · ':(t.sub?esc(t.cat)+' · ':''))+esc(t.acct)+(t.split?' · bölünmüş':'')+(t.inst?' · taksitli':'')+'</div></span><span class="num '+(inc?'inc':'exp')+'">'+(inc?'+':'−')+moneyIn(t.amt,t.acct)+'</span></button>';
}
function dcol(i){return 'hsl('+((i*67+155)%360)+' 52% 55%)';}
function ccySel(id,val){return '<span class="ccy"><select id="'+id+'" aria-label="Para birimi">'+CCYS.map(function(c){return '<option value="'+c+'"'+(c===val?' selected':'')+'>'+CCYS_SHORT[c]+'</option>';}).join('')+'</select>'+ic('down')+'</span>';}

/* ---------- ana ekran ---------- */
/* dar kutucuklar için kısaltılmış tutar: 1,25 Mn */
function compactD(tl){var c=dccy(),v=tl/rateOf(c);if(maskOn||Math.abs(v)<1e6)return DC0.format(tl);var u=Math.abs(v)>=1e9?[1e9,' Mr']:[1e6,' Mn'],n=(v<0?'−':'')+NUM2.format(Math.abs(v)/u[0])+u[1];return c==='XAU'?n+' gr':CSYM[c]+(c==='CHF'?' ':'')+n;}
function compactT(tl){if(maskOn||Math.abs(tl)<1e6)return TRY0.format(tl);return (tl<0?'−':'')+'₺'+NUM2.format(Math.abs(tl)/1e6)+' Mn';}
/* bu dönem ne kadar kaldı: beklenen gelir − harcanan − dönem sonuna kadar ödenecek düzenli ödemeler */
function leftNow(){
  var k=curP(),mt=monthTx(k),inc=sum(mt,'inc'),spent=sum(mt,'exp'),ai=avgMonthly('inc'),hasRI=S.recurring.some(function(r){return r.inc&&recOn(r,k);}),expInc=hasRI?inc+recIncDue(k):Math.max(inc+recIncDue(k),ai||0),t0=todayS(),e=pEnd(k),rec=0;
  var RD=recDue(k);rec=RD.tot;
  /* düzenli ödeme olarak ödenen kredi taksitlerinin anaparası da dönemden çıkar (yoksa "Ödendi" deyince kalan artardı) */
  var paid=recDebtPaid(k);
  var left=r2(expInc-spent-paid-rec),days=daysLeft(k);
  return {k:k,inc:inc,expInc:r2(expInc),assumed:expInc>inc+0.5,spent:spent,paid:paid,rec:r2(rec),over:RD.over,left:left,days:days,daily:days>0?left/days:0,ok:expInc>0};
}
/* ana kart: önce net servet (büyük), altında bu dönem kalan ve günlük harcama sınırı */
function heroCard(W){
  var L=leftNow(),ch=histChange(30);
  var h='<div class="card hero nw"><div class="nwtop"><span class="lbl">Net servetim</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button>'+ccySel('dccy',S.dccy)+'</span></div>';
  h+='<button class="nwbig" data-act="sub" data-v="servet" aria-label="Net servet: hesaplar ve yatırımlar"><span class="big num">'+DC0.format(W.net)+'</span>'+ic('r')+'</button>';
  if(S.dccy!=='TRY'&&dccy()==='TRY')h+='<div class="small exp">'+esc(CCYN[S.dccy])+' kuru henüz yok; TL gösteriliyor.</div>';
  else if(dccy()!=='TRY')h+='<div class="small muted">1 '+(dccy()==='XAU'?'gr altın':esc(dccy()))+' = '+TRY2.format(rateOf(dccy()))+' · '+TRY0.format(W.net)+'</div>';
  if(ch&&!maskOn)h+='<div class="small"><b class="num '+(ch.d>=0?'inc':'exp')+'">'+sgnD(ch.d)+(ch.p!=null?' ('+(ch.p>=0?'+':'−')+'%'+NUM1.format(Math.abs(ch.p))+')':'')+'</b> <span class="muted">'+(ch.since?'ilk kayıttan beri':'son '+ch.days+' günde')+'</span></div>';
  h+='<div class="leftblk"><div class="lbl">'+esc(plabel(L.k))+' · bu dönem kalan</div>';
  if(L.ok){
    h+='<p class="mid num'+(L.left<0?' exp':'')+'" id="left-now">'+TRY0.format(L.left)+'</p>';
    h+='<div class="small">'+(L.left>0&&L.days>0?'<b>Günde ~'+TRY0.format(L.daily)+'</b> harcayabilirsin · '+L.days+' gün kaldı':(L.left<0?'<b class="exp">Bu dönem beklenen gelirini '+TRY0.format(-L.left)+' aştın.</b>':(L.days>1?'Bu dönem için harcayabileceğin para kalmadı · '+L.days+' gün kaldı':'Dönemin son günü.')))+'</div>';
    var p=L.expInc>0?clamp((L.spent+L.paid+L.rec)/L.expInc*100,0,100):0;
    h+='<div class="bar'+(p>=100?' over':(p>85?' warn':''))+'" style="margin-top:8px"><i style="width:'+p+'%"></i></div>';
    var pe=L.spent;h+='<button class="nwper" data-act="sub" data-v="islem" aria-label="Bu dönemin işlemleri"><span class="pl"><span class="lbl">Gelir</span><b class="num inc">'+compactT(L.inc)+'</b></span><span class="pl"><span class="lbl">Gider</span><b class="num exp">'+compactT(pe)+'</b></span>'+(L.rec>0?'<span class="pl"><span class="lbl">Ödenecek</span><b class="num">'+compactT(L.rec)+'</b></span>':'')+ic('r')+'</button>';
    if(L.over>0)h+='<div class="small exp" style="margin-top:6px">Bunun '+compactT(L.over)+' kadarı gecikmiş ödeme.</div>';
    /* 4.15: varsayım ve tahmin tek satırda */
    var F=forecast(),fo=F.hist&&F.rem>0&&F.spent>0;
    if(fo)h+='<div class="fcst small muted">Dönem sonu tahmini: '+(F.expInc>0?(F.net>=0?'artan':'eksik')+' ≈ <b class="num '+(F.net>=0?'inc':'exp')+'">'+compactT(Math.abs(F.net))+'</b> · ':'')+'gider ≈ '+compactT(F.exp)+(L.assumed||F.incAssumed?' · ortalama gelirine ('+compactT(L.expInc)+') göre':'')+'</div>';
    else if(L.assumed)h+='<div class="small muted" style="margin-top:6px">Kalan, ortalama gelirine ('+compactT(L.expInc)+') göre hesaplandı.</div>';
  }else{
    h+=L.spent>0?'<p class="mid num" id="left-now">'+TRY0.format(L.spent)+'</p><div class="small muted">Bu dönem harcanan. Gelirini eklersen ne kadar kaldığını gösteririm.</div>':'<p class="mid num muted" id="left-now">—</p><div class="small muted">Bu dönem henüz işlem yok. Gelirini ve giderlerini ekledikçe ne kadar kaldığını burada gösteririm.</div>';
  }
  return h+'</div></div>';
}
function periodHead(withSum){
  if(!withSum)return monthNav();
  var mt=monthTx(ui.month),inc=sum(mt,'inc'),exp=sum(mt,'exp'),net=inc-exp,cmp='';
  var isCur=ui.month===curP(),prev=addMonth(ui.month,-1),el=isCur?daysBetween(pStart(ui.month),todayS()):9999;
  var pe=monthTx(prev).filter(function(t){return t.type==='exp'&&daysBetween(pStart(prev),t.date)<=el;}).reduce(function(x,t){return x+txTL(t);},0);
  if(pe>0&&exp>0){var df=(exp-pe)/pe*100;cmp='<p class="small muted" style="margin:10px 0 0">'+(isCur?'Geçen dönemin aynı gününe göre':'Geçen döneme göre')+' giderlerin %'+Math.round(Math.abs(df))+(df>=0?' fazla.':' az.')+'</p>';}
  return '<div class="card period">'+monthNav(true)+'<div class="row3" style="margin-top:6px"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+(net<=-0.5?'−':'+')+compactT(Math.abs(net))+'</span></div></div>'+cmp+'</div>';
}
function vMain(){
  var cur=SECS.some(function(x){return x[0]===ui.sub;})?ui.sub:'ev';ui.sub=cur;
  var body={ev:vHome,islem:vIslem,analiz:analizBody,servet:servetBody,plan:planBody}[cur];
  return '<section id="secbody" class="stack">'+body()+'</section>';
}
/* ---------- Ana Sayfa ---------- */
function vHome(){
  var h=bannerHtml(),W=wealth();
  if(S.name)h+='<p class="small muted" style="margin:0 2px">'+esc(hello())+', <b>'+esc(S.name)+'</b></p>';
  /* sıra: ne kaldı → ekle → yapılacaklar (tek kart) → son işlemler → piyasalar. Notlar başlıktaki simgede, hesaplayıcılar Plan › Koç'ta */
  h+=heroCard(W)+smsBanner()+qaRow()+favRow('home')+gundem()+scutGrid();
  return h+recentCard()+mStrip();
}
/* Gündem: uyarılar, akıllı tespitler ve koçun şu anki adımı tek kartta, kısa satırlar halinde.
   4.4: zamana bağlı olanlar önce (ödeme, bütçe, olağandışı harcama); haftalarca aynı kalan Koç adımı en sonda */
function gundem(){
  var rows=alertsHtml();
  brainItems().slice(0,2).forEach(function(x){
    rows+='<div class="item bi"><span class="sic sm" style="--c:var(--'+x.c+')">'+ic(x.ic)+'</span><span class="mid"><div class="wrap-t">'+x.t+'</div><div class="bacts"><button class="linkbtn" data-act="'+x.act+'" data-id="'+esc(x.id)+'">'+x.btn+' ›</button><button class="linkbtn mute" data-act="br-dis" data-id="'+esc(x.key)+'">Gizle</button></div></span></div>';});
  rows+=coachHome(true);
  if(!rows)return '';
  return '<div class="card gundem brain"><h2>Gündem</h2><div class="list">'+rows+'</div></div>';
}
function hello(){var hr=new Date().getHours();return hr<5?'İyi geceler':hr<12?'Günaydın':hr<18?'İyi günler':'İyi akşamlar';}
/* "Tümü" her zaman listeyi açar (İşlemler takvim görünümünde bırakılmış olsa da) */
ACT['tx-all']=function(){ui.txv='list';goSec('islem');};
function recentCard(){
  /* tüm listeyi sıralamadan en yeni 5 işlem */
  var cmp=txCmp,l=[];
  for(var i=0;i<S.tx.length;i++){var t=S.tx[i];if(l.length<5||cmp(t,l[4])<0){l.push(t);l.sort(cmp);if(l.length>5)l.pop();}}
  if(!l.length)return '';
  return '<div class="card" style="padding-top:12px"><div class="ghead"><h2 style="margin:0;flex:1">Son işlemler</h2><button class="linkbtn" data-act="tx-all" data-v="islem">Tümü ›</button></div><div class="list">'+l.map(txRow).join('')+'</div></div>';
}

/* ---------- İşlemler: dönem kartı (ay oklarıyla), arama, tür süzgeci, gün gün liste ---------- */
/* 4.4: ikinci görünüm takvim (başlıktaki düğme); dönem kartı iki görünümde ortak. Takvim eskiden Analiz'deydi */
function rangeTx(){var t=todayS();if(ui.rng==='gun')return S.tx.filter(function(x){return x.date===t;});
  if(ui.rng==='hafta'){var s=wkStart(),e=new Date(pdate(s));e.setDate(e.getDate()+6);e=isoDate(e);return S.tx.filter(function(x){return x.date>=s&&x.date<=e;});}
  return monthTx(ui.month);}
function vIslem(){
  if(ui.txv==='cal'){ui.rng='ay';return periodHead(true)+calBody();}
  var r=RNG.some(function(x){return x[0]===ui.rng;})?ui.rng:'ay';ui.rng=r;
  return '<div class="chips rng" role="group" aria-label="Zaman aralığı">'+RNG.map(function(x){return '<button class="chip" data-act="rng" data-v="'+x[0]+'" aria-pressed="'+(r===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>'
   +(r==='ay'?periodHead(true):rangeHead())+txBody();
}

/* ---------- İşlemler ---------- */
var TXH=typeof WeakMap==='function'?new WeakMap():null;
function txHay(t){var raw=String(t.note||'')+'\u0001'+(t.cat||'')+'\u0001'+(t.sub||'')+'\u0001'+(t.acct||'')+'\u0001'+(t.to||'')+'\u0001'+t.type+'\u0001'+(t.side||'')+'\u0001'+(t.hold||'')+'\u0001'+(t.debt||'')+'\u0001'+mvLabel(t);
  var c=TXH&&TXH.get(t);if(c&&c.r===raw)return c.h;
  var h=fold(String(t.note||'')+' '+(t.cat||'')+' '+(t.sub||'')+' '+(t.acct||'')+' '+(t.to||'')+' '+mvLabel(t));if(TXH)TXH.set(t,{r:raw,h:h});return h;}
var TQP={q:null,p:[]};
function txMatch(t,q){
  var h=txHay(t);
  var amt=String(t.amt).replace('.',','),amt2=String(t.amt);
  if(TQP.q!==q)TQP={q:q,p:q.split(/\s+/).filter(Boolean)};var parts=TQP.p;
  return parts.every(function(w){return h.indexOf(w)>=0||amt.indexOf(w.replace('.',','))>=0||amt2.indexOf(w)>=0;});
}
function txFilt(t){if(ui.acctF&&t.acct!==ui.acctF&&t.to!==ui.acctF)return false;if(ui.filter==='all')return true;if(ui.filter==='mv'||ui.filter==='trf')return t.type!=='inc'&&t.type!=='exp';return t.type===ui.filter;}
/* gün başlığındaki net tutar: gelir − gider (transferler hariç) */
function dayNet(l){var n=0;l.forEach(function(t){if(t.type==='inc')n+=txTL(t);else if(t.type==='exp')n-=txTL(t);});return r2(n);}
function txList(){
  var q=fold((ui.tq||'').trim());
  var mt=(q?S.tx.filter(function(t){return txFilt(t)&&txMatch(t,q);}):rangeTx().filter(txFilt)).sort(txCmp);
  if(!mt.length)return q?'<div class="empty">“'+esc(ui.tq.trim())+'” için işlem bulunamadı.</div>':'<div class="empty">'+(ui.acctF?esc(ui.acctF)+' hesabında bu dönemde hareket yok.':'Bu dönemde işlem yok. Sağ alttaki + ile ekle.')+'</div>';
  var cap=q?(ui.tqN||100):1e9,more=0;if(mt.length>cap){more=mt.length-cap;mt=mt.slice(0,cap);}
  /* 4.15: aramada bulunanların toplamı (gider, gelir) */
  var qs='';if(q){var ge=0,gi=0;(more?S.tx.filter(function(t){return txFilt(t)&&txMatch(t,q);}):mt).forEach(function(t){if(t.type==='exp')ge+=txTL(t);else if(t.type==='inc')gi+=txTL(t);});
    qs=(mt.length+more)+' sonuç'+(ge>0?' · gider <b class="num exp">'+TRY0.format(ge)+'</b>':'')+(gi>0?' · gelir <b class="num inc">'+TRY0.format(gi)+'</b>':'')+' · tüm dönemler';}
  var cur='',out=(q?'<div class="small muted" style="margin:0 2px 6px">'+qs+'</div>':'')+'<div class="card" style="padding-top:2px">';
  var byD={};mt.forEach(function(t){(byD[t.date]||(byD[t.date]=[])).push(t);});
  mt.forEach(function(t){if(t.date!==cur){cur=t.date;var dn=dayNet(byD[cur]);out+='<div class="day"><span>'+esc(dayLabel(t.date,!!q))+'</span>'+(Math.abs(dn)>=0.5?'<span class="num '+(dn<0?'exp':'inc')+'">'+sgn(dn)+'</span>':'')+'</div>';}out+='<div class="list">'+txRow(t)+'</div>';});
  return out+'</div>'+(more?'<button class="btn ghost" data-act="tq-more">'+more+' sonuç daha · göster</button>':'');
}
var DLC={};
function dayLabel(d,y){var k=d+(y?'y':'');return DLC[k]||(DLC[k]=pdate(d).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:y?'numeric':undefined,weekday:'long'}));}
ACT['tq-more']=function(){ui.tqN=(ui.tqN||100)+200;var tl=document.getElementById('txlist');if(tl)tl.innerHTML=txList();};
/* notlardaki #etiketler (en sık 8): dokununca o etiketle aranır */
ACT['tag-f']=function(el,id,v){ui.tq=fold(ui.tq||'').trim()===fold(v)?'':v;render();};
function txTags(){var m={};S.tx.forEach(function(t){var x=String(t.note||'').match(/#[\wçğıöşüÇĞİÖŞÜ-]{2,30}/g);if(x)x.forEach(function(g){g=g.toLocaleLowerCase('tr-TR');m[g]=(m[g]||0)+1;});});return Object.keys(m).sort(function(a,b){return m[b]-m[a];}).slice(0,8);}
function txBody(){
  var tg=txTags();
  return (tg.length?'<div class="chips tags" role="group" aria-label="Etiketler">'+tg.map(function(g){var on=fold(ui.tq||'').trim()===fold(g);return '<button class="chip" data-act="tag-f" data-v="'+esc(g)+'" aria-pressed="'+on+'">'+esc(g)+'</button>';}).join('')+'</div>':'')+'<div class="search">'+ic('search')+'<input id="tq" type="search" placeholder="İşlemlerde ara: not, kategori, tutar" aria-label="İşlemlerde ara" value="'+esc(ui.tq||'')+'"></div>'
   +(ui.acctF?'<div class="chips"><button class="chip rm" data-act="acct-clear" aria-pressed="true">'+esc(ui.acctF)+'</button></div>':'')+segTabs([['all','Tümü'],['inc','Gelir'],['exp','Gider'],['mv','Diğer']],ui.filter==='trf'?'mv':ui.filter,'filter','Filtre')
   +'<div id="txlist" class="stack">'+txList()+'</div>';
}

/* ---------- Hesaplar (cüzdan ve banka) ---------- */
var AGROUPS=[['nakit','Cüzdanım','cash','var(--warn)'],['banka','Banka hesapları','bank','var(--blue)'],['kart','Kredi kartları','card','var(--exp)'],['birikim','Birikim hesapları','coins','var(--inc)'],['diger','Diğer hesaplar','wallet','var(--ink2)']];
function acctLine(a){
  var b=acctBal(a),c=ccyOf(a),t=acctType(a),x=ax(a),sub=[];
  if(c!=='TRY')sub.push(CCYN[c]+(rateOf(c)>0?' · ≈ '+TRY0.format(toTL(b,a)):''));
  if(t==='kart'){if(+x.limit>0)sub.push('Kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)sub.push('Son ödeme: ayın '+x.due+sfx(x.due));}
  /* 4.15: bu dönemdeki net hareket ve birikim faizi */
  else if(!x.arch){var pf=0;monthTx(curP()).forEach(function(tx){if(tx.acct===a||tx.to===a)pf+=txDelta(tx,a);});if(Math.abs(pf)>=1)sub.push('Bu dönem '+(pf>=0?'+':'−')+moneyIn(Math.abs(pf),a,1));if(aRate(a))sub.push('Yıllık %'+NUM2.format(aRate(a))+' faiz');}
  return '<button class="item" data-act="acct-open" data-id="'+esc(a)+'"><span class="dot" style="background:'+color(a)+'"></span><span class="mid"><div class="t">'+esc(a)+'</div>'+(sub.length?'<div class="small muted">'+esc(sub.join(' · '))+'</div>':'')+'</span><span class="num'+(b<0?' exp':'')+'">'+moneyIn(b,a)+'</span></button>';
}
/* Hesaplar: türe göre gruplar (boş gruplar gizli); hesap eklemek tek düğmede, transfer + düğmesindeki işlem penceresinde */
function hesapBody(){
  var h=needSetup()?'<div class="card hint"><p class="small" style="margin:0">Hesaplarındaki mevcut parayı girersen bakiyeler ve net servetin doğru görünür.</p><button class="btn small" data-act="open-bal">Bakiyeleri gir</button></div>':'';
  h+='<div class="sumline"><span class="muted">Hesaplardaki para</span><b class="num">'+TRY0.format(accTotal())+'</b></div>';
  var arc=ACCS().filter(function(a){return ax(a).arch;});
  AGROUPS.forEach(function(gp){var l=ACCS().filter(function(a){return acctType(a)===gp[0]&&!ax(a).arch;});if(!l.length)return;
    var s=r2(l.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
    h+='<div class="card" style="padding-top:12px"><div class="ghead"><span class="sic sm" style="--c:'+gp[3]+'">'+ic(gp[2])+'</span><h2 style="margin:0;flex:1">'+gp[1]+'</h2><span class="num'+(s<0?' exp':'')+'">'+TRY0.format(s)+'</span></div><div class="list">'+l.map(acctLine).join('')+'</div></div>';});
  if(arc.length){var arcT=arc.reduce(function(s,a){return s+toTL(acctBal(a),a);},0);h+='<details class="card"><summary><b>Arşivlenen hesaplar</b><span class="small muted"> · '+arc.length+(Math.abs(arcT)>0.5?' · '+TRY0.format(arcT)+' (net servete dahil)':'')+'</span></summary>';}if(arc.length)h+='<div class="list">'+arc.map(acctLine).join('')+'</div></details>';
  return h+'<button class="btn ghost" data-act="new-a">'+ic('plus')+' Hesap ekle</button>';
}
/* başlangıç bakiyeleri tek pencerede (ilk kurulum) */
/* kurulum: hesaplar, bakiyelerin tarihi ve maaş günü tek pencerede.
   Bakiye tarihinden önceki işlemler bakiyeyi değiştirmez (raporlarda yine görünür): geçmiş işlem girmek bakiyeyi şişirmez */
function balSheet(){
  var od=S.openD||{},d0=ACCS().map(function(a){return od[a];}).filter(Boolean).sort().pop()||todayS(),pd=S.payday||1,o='';for(var i=1;i<=31;i++)o+='<option value="'+i+'"'+(i===pd?' selected':'')+'>Ayın '+i+sfx(i)+'</option>';o+='<option value="32"'+(pd===32?' selected':'')+'>Ayın son iş günü</option>';
  openSheet('<h2>Hesaplarındaki para</h2><p class="small muted" style="margin:0">Her hesapta o gün ne kadar olduğunu yaz. Kredi kartında borç varsa eksi yaz (örn. -2500).</p>'
   +ACCS().map(function(a,i){return '<div class="field"><label for="ob-'+i+'">'+esc(a)+' ('+CSYM[ccyOf(a)]+')</label><input id="ob-'+i+'" data-ob="'+esc(a)+'" inputmode="decimal" placeholder="0" value="'+nv(+S.opening[a]||'')+'"></div>';}).join('')
   +'<button class="linkbtn" data-act="bal-newa">+ Başka hesap ekle</button>'
   +'<div class="two"><div class="field"><label for="ob-date">Bakiyeler hangi güne ait?</label><input id="ob-date" type="date" value="'+d0+'" max="'+todayS()+'"></div><div class="field"><label for="ob-pd">Maaş günü</label><select id="ob-pd">'+o+'</select></div></div>'
   +'<div class="small muted">Bu tarihten önceki işlemleri sonradan girersen bakiyeyi değiştirmez; gelir-gider raporlarında görünür. Maaş günü dönemlerin başlangıcıdır.</div>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-bal">Kaydet</button>');
}
ACT['bal-newa']=function(){if(!balApply())return;save();ui.balBack=true;aSheet(null);};
ACT['open-bal']=function(){balSheet();};
function balApply(){var o={},bad=false;document.querySelectorAll('[data-ob]').forEach(function(e){var v=r2(num(e.value));if(tooBig(v))bad=true;o[e.dataset.ob]=v;});
  if(bad){ferr('Tutar çok büyük (en fazla 100 milyar).');return false;}
  var dt=val('ob-date'),pd=parseInt(val('ob-pd'),10);if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||dt>todayS())dt=todayS();S.openD=S.openD||{};
  if(pd>=1&&pd<=32&&pd!==S.payday){try{setPayday(pd);}catch(e){S.payday=pd;}ui.month=curP();}
  Object.keys(o).forEach(function(a){if(ACCS().indexOf(a)>=0){S.opening[a]=o[a];S.openD[a]=dt;}});S.sampleExtras=false;return true;}
ACT['save-bal']=function(){if(!balApply())return;S.setupHide=true;save();closeSheet();render();toast('Bakiyeler kaydedildi · net servet '+TRY0.format(wealth().net));};
/* Hesaplar sekmesinin üstü: net servet (görüntüleme para birimiyle), dokunulabilir gelişim grafiği, varlık/borç ve dağılım.
   4.2: eski Analiz › Servet buraya taşındı; net servet tek yerde */
function nwTop(){
  var W=wealth();
  var h='<div class="card hero nw"><div class="nwtop"><span class="lbl">Net servetim</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button>'+ccySel('dccy',S.dccy)+'</span></div>';
  h+='<p class="big">'+DC0.format(W.net)+'</p>';
  if(S.dccy!=='TRY'&&dccy()==='TRY')h+='<div class="small exp">'+esc(CCYN[S.dccy])+' kuru henüz yok; TL gösteriliyor. Yenile düğmesine dokun.</div>';
  else if(dccy()!=='TRY')h+='<div class="small muted">1 '+(dccy()==='XAU'?'gr altın':esc(dccy()))+' = '+TRY2.format(rateOf(dccy()))+' · '+TRY0.format(W.net)+'</div>';
  if(!maskOn)h+=nwChart();
  h+='<div class="row3" style="grid-template-columns:1fr 1fr;margin-top:8px"><div><div class="lbl">Varlıklar</div><span class="num">'+compactD(W.assets)+'</span></div><div><div class="lbl">Borçlar</div><span class="num'+(W.debt>0?' exp':'')+'">'+compactD(W.debt)+'</span></div></div>';
  return h+distBar()+'</div>';
}
/* net servet grafiği: 3 ay / 1 yıl / tümü; dokununca ya da parmak kaydırınca o günün değeri (nwScrub) */
function nwChart(){
  var s=nwSeries();if(s.length<2)return '';
  var R=ui.nwr===12||ui.nwr===1?ui.nwr:3,from=pdate(s[s.length-1][0]);from.setDate(from.getDate()-(R===12?364:91));
  var fk=isoDate(from),r=R===1?s:s.filter(function(x){return x[0]>=fk;});if(r.length<2)r=s.slice(-2);
  var v=r.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=72;
  var t0=pdate(r[0][0]).getTime(),span=(pdate(r[r.length-1][0]).getTime()-t0)||1;
  var xy=r.map(function(x,i){return [(pdate(x[0]).getTime()-t0)/span*W,H-5-(v[i]-mn)/rg*(H-10)];});
  var pts=xy.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var data=r.map(function(x,i){return [x[0],x[1],xy[i][0]/W,xy[i][1]/H,x[2]?1:0];}),d=r2(r[r.length-1][1]-r[0][1]),p0=r[0][1];
  return '<div class="nwhead"><span class="small muted">Gelişim</span><div class="seg mini" role="group" aria-label="Süre"><button data-act="nwr" data-v="3" aria-pressed="'+(R===3)+'">3 ay</button><button data-act="nwr" data-v="12" aria-pressed="'+(R===12)+'">1 yıl</button><button data-act="nwr" data-v="1" aria-pressed="'+(R===1)+'">Tümü</button></div></div>'
   +'<div class="nwchart" data-pts="'+esc(JSON.stringify(data))+'"><svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Net servet grafiği"><polygon points="0,'+H+' '+pts+' '+W+','+H+'" fill="var(--accent)" opacity=".1"/><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><i class="nwdot" hidden></i></div>'
   +'<div class="small" id="nwpick"><b class="num '+(d>=0?'inc':'exp')+'">'+sgnD(d)+(Math.abs(p0)>0.5?' ('+(d>=0?'+':'−')+'%'+NUM1.format(Math.abs(d/Math.abs(p0)*100))+')':'')+'</b> <span class="muted">'+(R===3?'son 3 ayda':(R===12?'son 1 yılda':'ilk kayıttan bu yana'))+' · güne dokun</span></div>';
}
/* varlık dağılımı: artı bakiyeli hesaplar türüne göre, yatırım ve varlıklar cinsine göre */
function distBar(){
  var by={},tot=0;ACCS().forEach(function(a){var b=r2(toTL(acctBal(a),a));if(b<=0)return;var n={nakit:'Nakit',banka:'Banka',kart:'Banka',birikim:'Birikim',diger:'Diğer hesaplar'}[acctType(a)];by[n]=(by[n]||0)+b;});
  S.holdings.forEach(function(x){var v=hVal(x);if(v>0)by[x.type]=(by[x.type]||0)+v;});
  var l=Object.keys(by).map(function(k){tot+=by[k];return [k,by[k]];}).sort(function(a,b){return b[1]-a[1];});if(!(tot>0)||l.length<2)return '';
  if(l.length>5){var rest=l.slice(4).reduce(function(a,x){return a+x[1];},0);l=l.slice(0,4).concat([['Diğer',rest]]);}
  return '<div class="lbl" style="margin-top:10px">Varlık dağılımı</div><div class="stackbar" style="margin-top:6px" role="img" aria-label="Varlık dağılımı">'+l.map(function(x,i){return '<i style="width:'+(x[1]/tot*100)+'%;background:'+dcol(i)+'"></i>';}).join('')+'</div><div class="legend">'+l.map(function(x,i){return '<span style="--c:'+dcol(i)+'">'+esc(x[0])+' %'+(x[1]/tot<0.01?'<1':Math.round(x[1]/tot*100))+'</span>';}).join('')+'</div>';
}
function servetBody(){if(ui.sv==='varlik')ui.sv='yatirim';var v=WEALTH.some(function(x){return x[0]===ui.sv;})?ui.sv:'hesap';return nwTop()+segTabs(WEALTH,v,'sv','Hesaplar')+({hesap:hesapBody,yatirim:yatirimBody,borc:borcBody}[v])();}
/* liste ekranlarında "… ekle" tek biçimde: listenin altında (Hesap ekle gibi); liste boşken asıl eylem olduğundan birincil düğme */
function addBtn(act,label,empty,v){return '<button class="btn'+(empty?'':' ghost')+'" data-act="'+act+'"'+(v?' data-v="'+v+'"':'')+'>'+(empty?'':ic('plus')+' ')+label+'</button>';}

/* ---------- Bütçe, Hedefler, Düzenli ---------- */
function planBody(){
  var p=PLANS.some(function(x){return x[0]===ui.plan;})?ui.plan:'butce';ui.plan=p;
  var seg=segTabs(PLANS,p,'plan','Plan');
  return seg+(p==='koc'?vKoc():(p==='butce'?periodHead(false)+budgetBody():(p==='duzenli'?periodHead(false)+duzenliBody():hedefBody())));
}
/* Bütçe: üstte bütçeden kalan; limitli kategoriler ilerlemeleriyle; limitsizler katlanır "Limit koy" listesinde */
function catRow(c,sp){
  var lim=budLim(c,ui.month),s=sp[c]||0,ratio=lim?s/lim:0,cls=ratio>1?'over':(ratio>.8?'warn':'');
  var info=lim?TRY0.format(s)+' / '+TRY0.format(lim)+(S.budRoll&&lim!==+S.budgets[c]?' (devirle)':'')+(ratio>1?' · '+TRY0.format(s-lim)+' aşıldı':' · '+TRY0.format(lim-s)+' kaldı'):(s?'Bu dönem '+TRY0.format(s)+' harcandı':'');
  return '<div class="catrow"><div class="top"><button class="cn" data-act="cat-tx" data-v="'+esc(c)+'">'+cic(c,'sm')+'<span class="mid ell">'+esc(c)+'</span></button><input class="lim" inputmode="decimal" data-budget="'+esc(c)+'" placeholder="Limit" value="'+nv(+S.budgets[c]||'')+'" aria-label="'+esc(c)+' aylık limit (₺)"></div>'+(info?'<div class="small muted num">'+info+'</div>':'')+(lim?'<div class="bar '+cls+'"><i style="width:'+Math.min(ratio*100,100)+'%"></i></div>':'')+'</div>';
}
function budgetBody(){
  var sp=spentByCat(ui.month),limSum=0,spSum=0,lims=[],rest=[];
  EXPC().forEach(function(c){if(+S.budgets[c]>0){lims.push(c);limSum+=budLim(c,ui.month);spSum+=(sp[c]||0);}else rest.push(c);});
  rest.sort(function(a,b){return (sp[b]||0)-(sp[a]||0);});
  var h,left=r2(limSum-spSum),days=ui.month===curP()?daysLeft(ui.month):0,sug=budgetSuggest();
  if(limSum>0){
    /* aşan kategoriler toplamı gizlemesin: kalan yalnızca aşılmayan kategorilerden, aşımlar ayrı satırda */
    var okLeft=0,over=[];lims.forEach(function(c){var d=budLim(c,ui.month)-(sp[c]||0);if(d>=0)okLeft+=d;else over.push([c,-d]);});okLeft=r2(okLeft);
    h='<div class="card"><div class="lbl">'+(over.length?'Aşılmayan kategorilerde kalan':'Bütçeden kalan')+'</div><p class="big">'+TRY0.format(okLeft)+'</p><div class="small muted">Harcanan '+TRY0.format(spSum)+' / '+TRY0.format(limSum)+' · '+lims.length+' kategoride limit var</div>'
      +(over.length?'<div class="small exp" style="margin-top:6px">Aşıldı: '+over.map(function(x){return esc(x[0])+' '+TRY0.format(x[1]);}).join(' · ')+'</div>':'')+'<div class="bar'+(spSum>limSum?' over':(spSum>limSum*.8?' warn':''))+'" style="margin-top:10px"><i style="width:'+Math.min(spSum/limSum*100,100)+'%"></i></div>'
      +(okLeft>0&&days>0?'<div class="small" style="margin-top:8px">Bütçede kalmak için günde en fazla <b>~'+TRY0.format(okLeft/days)+'</b> · '+days+' gün kaldı</div>':'')+'</div>';
    h+='<div class="card"><h2>Limitler</h2>'+lims.map(function(c){return catRow(c,sp);}).join('')+'<button class="row-tgl" data-act="bud-roll" role="switch" aria-checked="'+!!S.budRoll+'"><span class="mid"><div class="t">Artanı sonraki döneme devret</div><div class="small muted">Geçen dönemden artan limit bu döneme eklenir, aşım düşülür</div></span><span class="sw"></span></button></div>';
  }else{
    h='<div class="card"><div class="lbl">Bütçe</div><p class="small muted" style="margin:6px 0 0">Harcadığın kategorilere aylık limit koy; ne kadar kaldığını ve günde ne kadar harcayabileceğini burada görürsün.</p>'+(sug.length?'<button class="btn small" style="margin-top:10px" data-act="bud-sug">Son 3 dönemin ortalamasıyla doldur</button><div class="small muted" style="margin-top:6px">'+esc(sug.slice(0,4).map(function(x){return x[0]+' '+TRY0.format(x[1]);}).join(' · '))+'</div>':'')+'</div>';
  }
  if(rest.length)h+='<details class="card limadd"'+(limSum>0&&!ui.limOpen?'':' open')+'><summary><b>Limit koy</b><span class="small muted"> · '+rest.length+' kategoride limit yok</span></summary><p class="small muted" style="margin:8px 0 0">Aylık limit yaz. Boş bıraktığın kategori takip edilmez.</p>'+rest.map(function(c){return catRow(c,sp);}).join('')+'</details>';
  return h+'<button class="linkbtn" data-act="an-go" data-v="harcama">Harcama dağılımı ve trendler ›</button>';
}
/* bütçe önerisi: son 3 tamamlanmış dönemde düzenli harcama yapılan kategorilerin ortalaması (100'e yuvarlanır) */
function budgetSuggest(){var k=curP(),pks=prevKs(k,3),cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;if(!cnt)return [];
  var avg=catAvg(k),out=[];EXPC().forEach(function(c){var a=avg[c]||0;if(a>=100)out.push([c,Math.ceil(a/100)*100]);});return out.sort(function(a,b){return b[1]-a[1];});}
ACT['bud-roll']=function(){S.budRoll=!S.budRoll;save();render();};
ACT['bud-sug']=function(){var l=budgetSuggest();if(!l.length)return;l.forEach(function(x){if(!(+S.budgets[x[0]]>0))S.budgets[x[0]]=x[1];});S.sampleExtras=false;save();render();toast(l.length+' kategoriye limit kondu; istediğin gibi değiştirebilirsin');};
function goalInfo(g){
  var sv=goalSaved(g),left=Math.max(g.target-sv,0);
  if(sv>=g.target)return 'Hedefe ulaştın';
  if(g.date){var now=today0(),d=pdate(g.date),dd=daysBetween(isoDate(now),g.date),m=(d.getFullYear()-now.getFullYear())*12+d.getMonth()-now.getMonth()-(d.getDate()<now.getDate()?1:0);
    return dd<0?'Tarih geçti, '+TRY0.format(left)+' eksik':(m>=1?m+' ay kaldı · ayda ~'+TRY0.format(left/m)+' ayır':(dd===0?'Son gün bugün':dd+' gün kaldı')+' · '+TRY0.format(left)+' eksik');}
  return TRY0.format(left)+' kaldı';
}
function hedefBody(){
  if(!S.goals.length)return '<div class="empty">Henüz hedef yok. Tatil, acil durum fonu ya da büyük bir alışveriş için hedef koy. Hedefi bir birikim hesabına bağlarsan biriken tutar hesaptan otomatik gelir.</div>'+addBtn('new-g','Hedef ekle',1);
  var tot=0,sv=0,h='';S.goals.forEach(function(g){tot+=g.target;sv+=goalSaved(g);});
  h+='<div class="card"><div class="lbl">Toplam birikim</div><p class="big">'+TRY0.format(sv)+'</p><div class="small muted">Hedeflerin toplamı '+TRY0.format(tot)+' · %'+Math.round(tot>0?Math.min(sv/tot*100,100):0)+'</div></div>';
  S.goals.forEach(function(g){
    var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;
    h+='<div class="card stack" style="gap:10px"><button class="item" style="padding:0;border:0" data-act="edit-g" data-id="'+g.id+'"><span class="mid"><div class="t" style="font-weight:700">'+esc(g.name)+'</div><div class="small muted">'+esc(goalInfo(g))+'</div></span><span class="num">%'+Math.round(p)+'</span></button><div class="bar"><i style="width:'+p+'%"></i></div><div class="small num muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>'+TRY0.format(s)+' / '+TRY0.format(g.target)+'</span>'+(g.acct&&ACCS().indexOf(g.acct)>=0?'<span>Bağlı hesap: '+esc(g.acct)+'</span>':'')+'</div><button class="btn small ghost" style="align-self:flex-start" data-act="goal-add" data-id="'+g.id+'">Para ekle</button></div>';
  });
  return h+addBtn('new-g','Hedef ekle');
}
function duzenliBody(){
  if(!S.recurring.length)return '<div class="empty">Henüz düzenli ödeme yok. Kira, fatura, kredi taksiti ve abonelikleri ekle; hatırlatıcı ödeme gününü kaçırmamanı sağlar.</div>'+addBtn('new-r','Düzenli ödeme ekle',1);
  var tot=0,rem=0,cur=curP(),t0=todayS(),h='';
  tot=recMonthlyTot();rem=recDue(ui.month).tot;
  h+='<div class="card"><div class="row3" style="margin-top:0;grid-template-columns:1fr 1fr"><div><div class="lbl">Aylık toplam</div><span class="num">'+TRY0.format(tot)+'</span></div><div><div class="lbl">Bu dönem ödenecek</div><span class="num">'+TRY0.format(rem)+'</span></div></div></div>';
  var list=S.recurring.slice().sort(function(a,b){return dueDate(a,recShow(a,ui.month)).localeCompare(dueDate(b,recShow(b,ui.month)));});
  h+='<div class="card" style="padding-top:4px"><div class="list">'+list.map(function(r){
    var q=recShow(r,ui.month),paid=recPaid(r,q),st,dd=dueDate(r,q),dbt=r.debt&&byId(S.debts,r.debt),on=recOn(r,ui.month),inc=!!r.inc,wq=isWk(r)?occs(r,ui.month):null;
    var fq=recFq(r),no=+r.n>0&&on?recNo(r,q)+'/'+r.n:'',wp=wq&&wq.length>1?wq.filter(function(x){return recPaid(r,x);}).length+'/'+wq.length+' '+(inc?'geldi':'ödendi'):'';
    var sub=esc([on?pdate(dd).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}):'',fq,no?(isWk(r)?'':'taksit ')+no:'',wp,dbt?'Borç: '+dbt.name:catLabel(r.cat,r.sub),r.acct].filter(Boolean).join(' · '));
    if(!on){return '<div class="item"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-r" data-id="'+r.id+'">'+cic(r.cat)+'<span class="mid"><div class="t">'+esc(r.name)+'</div><div class="small muted">'+sub+'</div></span></button><div class="rcol"><span class="num">'+moneyIn(r.amt,r.acct,1)+'</span><span class="pill">'+(recDone(r)?'Tamamlandı':'Bu dönem yok')+'</span></div></div>';}
    if(paid)st='<span class="pill ok">'+(inc?'Geldi':'Ödendi')+'</span>';
    else if(ui.month===cur){var diff=daysBetween(t0,dd);st=diff<0?'<span class="pill late">'+(-diff)+' gün gecikti</span>':(diff===0?'<span class="pill late">Bugün</span>':'<span class="pill">'+diff+' gün sonra</span>');}
    else if(ui.month<cur)st='<span class="pill late">Ödenmedi</span>';
    else st='<span class="pill">Bekliyor</span>';
    return '<div class="item"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-r" data-id="'+r.id+'">'+cic(r.cat)+'<span class="mid"><div class="t">'+esc(r.name)+'</div><div class="small muted">'+sub+'</div></span></button><div class="rcol"><span class="num'+(inc?' inc':'')+'">'+(inc?'+':'')+moneyIn(r.amt,r.acct,1)+'</span>'+st+'<button class="btn small ghost" data-act="'+(paid?'rundo':'rpay')+'" data-id="'+r.id+'" data-v="'+q+'">'+(paid?'Geri al':(inc?'Geldi':'Ödendi'))+'</button></div></div>';}).join('')+'</div></div>';
  return h+addBtn('new-r','Düzenli ödeme ya da gelir ekle');
}

/* ---------- 4.5: sadeleştirmede kaldırılan özellikler geri geldi (yerleri düzenlendi) ---------- */
function donut(items,emptyMsg,act){
  var tot=items.reduce(function(a,x){return a+x[1];},0);
  if(!(tot>0))return '<div class="small muted" style="padding:10px 0">'+emptyMsg+'</div>';
  items=items.slice().sort(function(a,b){return b[1]-a[1];});
  var agg=false;if(items.length>5){var rest=items.slice(4).reduce(function(a,x){return a+x[1];},0);items=items.slice(0,4).concat([['Diğer',rest]]);agg=true;}
  var off=25,c='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--soft)" stroke-width="6"></circle>';
  var col=function(x,i){return act==='cat-tx'&&x[0]!=='Diğer'?color(x[0]):dcol(i);};
  items.forEach(function(x,i){var p=x[1]/tot*100;c+='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="'+col(x,i)+'" stroke-width="6" stroke-dasharray="'+p.toFixed(3)+' '+(100-p).toFixed(3)+'" stroke-dashoffset="'+off.toFixed(3)+'"></circle>';off-=p;});
  return '<div class="dwrap"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Dağılım grafiği">'+c+'</svg><div class="lgs">'+items.map(function(x,i){return (act&&!(agg&&i===items.length-1)?'<button class="lg" data-act="'+act+'" data-v="'+esc(x[0])+'">':'<div class="lg">')+'<span class="dot" style="background:'+col(x,i)+'"></span><span class="mid ell">'+esc(x[0])+'</span><span class="num">'+(x[1]/tot<0.01?'&lt;%1':'%'+Math.round(x[1]/tot*100))+'</span>'+(act&&!(agg&&i===items.length-1)?'</button>':'</div>');}).join('')+'</div></div>';
}
function insights(){
  var out=[],k=curP(),s=pstat(k),sp=spentByCat(k),pks=prevKs(k,3),avg={},cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;
  if(cnt){pks.forEach(function(p){var o=spentByCat(p);Object.keys(o).forEach(function(c){avg[c]=(avg[c]||0)+o[c]/cnt;});});
    Object.keys(sp).forEach(function(c){if(avg[c]>0&&sp[c]>avg[c]*1.2&&sp[c]-avg[c]>=100)out.push(['warn',c+' harcaman bu dönem şimdiden ortalamanın %'+Math.round((sp[c]/avg[c]-1)*100)+' üzerinde ('+TRY0.format(sp[c])+' / ort. '+TRY0.format(avg[c])+').']);});
    var ne=Object.keys(sp).filter(function(c){return !(avg[c]>0)&&sp[c]>=500;});if(ne.length)out.push(['muted','Yeni harcama kalemi: '+ne.slice(0,3).join(', ')+'.']);}
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});lim.forEach(function(c){var bl=budLim(c,k),r=(sp[c]||0)/bl;if(r>=1)out.push(['exp',c+' bütçesini '+TRY0.format((sp[c]||0)-bl)+' aştın.']);});
  var H=health();H.parts.forEach(function(p){if(p.k==='Acil durum fonu'&&p.p!=null&&p.p<0.5)out.push(['warn','Acil durum fonun '+p.v+'lık gideri karşılıyor; 6 ay hedefle.','em-open']);});
  if(s.rate!=null&&s.rate>=20)out.push(['inc','Bu dönem şu ana kadar gelirinin %'+Math.round(s.rate)+sfx(Math.round(s.rate))+' harcanmadı.']);else if(s.rate!=null&&s.rate<0)out.push(['exp','Bu dönem giderlerin gelirini '+TRY0.format(-s.net)+' aştı.']);
  var rec=recMonthlyTot(),ai=avgMonthly('inc');if(rec>0&&ai>0)out.push(['muted','Düzenli ödemelerin aylık gelirinin %'+Math.round(rec/ai*100)+sfx(Math.round(rec/ai*100))+'.']);
  if(!out.length)return '';
  return '<div class="card"><h2>Öne çıkanlar</h2><div class="list">'+out.slice(0,6).map(function(x){var tag=x[2]?'button':'div';return '<'+tag+' class="item"'+(x[2]?' data-act="'+x[2]+'"':'')+'><span class="dot" style="background:var(--'+(x[0]==='muted'?'ink2':x[0])+')"></span><span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span>'+(x[2]?ic('r'):'')+'</'+tag+'>';}).join('')+'</div></div>';
}
function fireCard(){
  var m=fireModel();
  if(!m.ok)return '<button class="card firecard" data-act="open-fire"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">Finansal özgürlük (FIRE)</div><div class="small muted">Hedefini belirle ya da aylık harcamanı gir.</div></span>'+ic('r')+'</button>';
  return '<button class="card firecard stack" data-act="open-fire" style="gap:10px"><span style="display:flex;align-items:center;gap:12px"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">Finansal özgürlük (FIRE)</div><div class="small muted">'+(m.custom?'Kendi belirlediğin hedef':'Harcamana göre hesaplanan hedef')+'</div></span>'+ic('r')+'</span>'
   +'<span style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap"><span class="num" style="font-size:1.75rem;font-weight:700">%'+NUM2.format(m.prog)+'</span><span class="small muted num">'+DC0.format(Math.max(m.assets,0))+' / '+DC0.format(m.target)+'</span></span>'
   +'<span class="bar"><i style="width:'+m.prog+'%"></i></span>'
   +'<span class="small muted">'+(m.n<=0?'Hedefe ulaştın':'Tahmini süre: <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</span></button>';
}
var RNG=[['ay','Bu dönem'],['gun','Bugün'],['hafta','Bu hafta']];
function wkStart(){var d=today0(),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return isoDate(d);}
function rangeHead(){
  var l=rangeTx(),inc=sum(l,'inc'),exp=sum(l,'exp'),net=inc-exp,lb=ui.rng==='gun'?today0().toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}):(function(){var s=pdate(wkStart()),e=new Date(s);e.setDate(e.getDate()+6);return s.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+' – '+e.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});})();
  return '<div class="card period"><div class="lbl" style="text-align:center">'+esc(lb)+'</div><div class="row3" style="margin-top:6px"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+(net<=-0.5?'−':'+')+compactT(Math.abs(net))+'</span></div></div></div>';
}
ACT.rng=function(el,id,v){ui.rng=v;persistUi();render();};
/* hızlı işlemler: en çok kullanılan 4 + Tümü */
var QA=[['qa-inc','Gelir','inc','var(--inc)'],['qa-exp','Gider','exp','var(--exp)'],['qa-trf','Transfer','swap','var(--accent)'],['qa-mkt','Piyasalar','pulse','var(--blue)'],['qa-cash','Nakit','cash','var(--warn)'],['qa-bank','Banka','bank','var(--blue)'],['qa-inv','Yatırım','trend','var(--inc)'],['qa-debt','Borç','card','var(--exp)'],['qa-save','Birikim','coins','var(--warn)'],['qa-asset','Varlık','home','var(--blue)'],['qa-calc','Hesaplayıcı','calc','var(--ink2)']];
function qaOrder(){if(!ui.qaOrd){var u=S.qaUse||{},tot=Object.keys(u).reduce(function(a,k){return a+(+u[k]||0);},0);ui.qaOrd=tot<8?QA.slice():QA.map(function(q,i){return [q,i];}).sort(function(a,b){return ((+u[b[0][0]]||0)-(+u[a[0][0]]||0))||a[1]-b[1];}).map(function(x){return x[0];});}return ui.qaOrd;}
/* ana ekranda en çok kullanılan 4 işlem + "Tümü"; geri kalanlar tek dokunuşla açılan pencerede */
function qaBtn(q){return '<button data-act="'+q[0]+'"><span class="c" style="--c:'+q[3]+'">'+ic(q[2])+'</span><span class="t">'+q[1]+'</span></button>';}
function qaRow(){return '<div class="qawrap" id="qawrap"><div class="qa grid5" id="qa" role="toolbar" aria-label="Hızlı işlemler">'+qaOrder().slice(0,4).map(qaBtn).join('')+'<button data-act="qa-more" aria-label="Tüm işlemler"><span class="c" style="--c:var(--ink2)">'+ic('grid')+'</span><span class="t">Tümü</span></button></div></div>';}
ACT['qa-more']=function(){openSheet('<h2>Ne yapmak istersin?</h2><div class="qa grid4" id="qaall">'+QA.map(qaBtn).join('')+'</div>');};
document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('#qa [data-act],#qaall [data-act]');if(!b||b.dataset.act==='qa-more')return;S.qaUse=S.qaUse||{};S.qaUse[b.dataset.act]=(+S.qaUse[b.dataset.act]||0)+1;},true);
/* kısayol kutucukları: planlama, yatırım ve notlara tek dokunuş */
var SCUTS=[['plan-go','butce','Bütçe','scale','var(--inc)'],['plan-go','duzenli','Düzenli ödemeler','repeat','var(--blue)'],['plan-go','hedef','Hedefler','flag','var(--warn)'],['sv-go','yatirim','Yatırımlar','trend','var(--blue)'],['sv-go','borc','Borçlar','card','var(--exp)'],['sub','notlar','Notlar','note','var(--accent)']];
function scutGrid(){return '<div class="scg">'+SCUTS.map(function(x){return '<button class="sc" data-act="'+x[0]+'" data-v="'+x[1]+'"><span class="sic" style="--c:'+x[4]+'">'+ic(x[3])+'</span><span class="t">'+x[2]+'</span></button>';}).join('')+'</div>';}

/* ---------- Analiz ---------- */
function pstat(k){var m=monthTx(k),inc=sum(m,'inc'),exp=sum(m,'exp');return {k:k,inc:inc,exp:exp,net:r2(inc-exp),rate:inc>0?(inc-exp)/inc*100:null,debt:sumMv(m,'dbt','out'),inv:r2(sumMv(m,'inv','buy')-sumMv(m,'inv','sell'))};}
function prevKs(k,n){var a=[],st=dataStart();for(var i=1;i<=n;i++){var p=addMonth(k,-i);if(st&&p<st)break;a.push(p);}return a;}
function health(){
  var W=wealth(),ae=avgMonthly('exp'),cur=curP(),parts=[];
  var ks=monthBase().ks.slice(0,3).filter(function(k){return sum(monthTx(k),'inc')>0;});if(!ks.length&&sum(monthTx(cur),'inc')>0)ks=[cur];
  var sr=ks.length?ks.reduce(function(a,k){return a+pstat(k).rate;},0)/ks.length:null;
  parts.push({k:'Tasarruf oranı',v:sr==null?'—':(sr<0?'−':'')+'%'+Math.round(Math.abs(sr)),p:sr==null?null:clamp(sr/20,0,1),tip:sr==null?'Gelir kaydı yok.':(sr>=20?'Gelirinin en az %20’sini biriktiriyorsun.':'Hedef: gelirin en az %20’si.')});
  var eg=emGoal(),ef=eg?goalSaved(eg):Math.max(W.g.liquid,0),em=ae>0?ef/ae:null,six=ae>0?' 6 aylık gider: '+TRY0.format(ae*6)+'.':'';
  parts.push({k:'Acil durum fonu',act:'em-open',v:em==null?(eg?TRY0.format(ef):'—'):NUM1.format(em)+' ay',p:em==null?null:clamp(em/6,0,1),
    tip:eg?('“'+eg.name+'” hedefinde '+TRY0.format(ef)+' var.'+(em==null?' Gider kaydı olunca kaç aylık gideri karşıladığı hesaplanır.':six)):
      (em==null?'Gider kaydı yok. Acil durum fonunu girmek için dokun.':'Nakit, banka ve birikim toplamına göre.'+six+' Ayrı bir acil durum fonu girmek için dokun.')});
  var dr=W.assets>0?W.debt/W.assets:(W.debt>0?1:0);
  parts.push({k:'Borç yükü',v:'%'+Math.round(dr*100),p:clamp(1-dr/0.5,0,1),tip:dr<=0.3?'Borçların varlıklarına göre makul.':'Borçlar varlıklarının %30’unun altında olmalı.'});
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});
  if(lim.length){var sp=spentByCat(cur),okc=lim.filter(function(c){return (sp[c]||0)<=budLim(c,cur);}).length;parts.push({k:'Bütçe uyumu',v:okc+'/'+lim.length,p:okc/lim.length,tip:okc===lim.length?'Tüm limitlerin içindesin.':(lim.length-okc)+' kategoride limit aşıldı.'});}
  else parts.push({k:'Bütçe uyumu',v:'Limit yok',p:null,tip:'Bütçe bölümünden kategori limiti belirle.'});
  var val=parts.filter(function(x){return x.p!=null;});
  return {score:val.length>=2?Math.round(val.reduce(function(a,x){return a+x.p;},0)/val.length*100):null,parts:parts};
}
function scoreWord(s){return s>=80?'Çok iyi':(s>=60?'İyi':(s>=40?'Orta':'Geliştirilmeli'));}
function flowCard(){
  var k=ui.month,s=pstat(k),isCur=k===curP(),days=pDays(k),el=isCur?Math.max(daysBetween(pStart(k),todayS())+1,1):days;
  /* süren dönem geçen dönemin aynı gününe kadarki kısmıyla kıyaslanır */
  var pk0=addMonth(k,-1),pm=monthTx(pk0).filter(function(t){return !isCur||daysBetween(pStart(pk0),t.date)<el;}),pv={inc:sum(pm,'inc'),exp:sum(pm,'exp')};
  if(!(s.inc>0)&&!(s.exp>0))return '<div class="card"><h2>Nakit akışı</h2><p class="small muted" style="margin:0 0 10px">'+(isCur?'Bu dönemde':'Bu dönemde hiç')+' gelir ya da gider kaydı yok. İşlem ekledikçe gelir, gider, tasarruf oranı ve dönem sonu tahmini burada görünür.</p>'+(isCur?'<button class="btn small" data-act="new-tx">İşlem ekle</button>':'')+'</div>';
  var rows=[['Gelir',DC0.format(s.inc)+(pv.inc>0?' <span class="small '+(s.inc>=pv.inc?'inc':'exp')+'">'+(s.inc>=pv.inc?'▲':'▼')+'%'+Math.round(Math.abs((s.inc-pv.inc)/pv.inc*100))+'</span>':'')],
    ['Gider',DC0.format(s.exp)+(pv.exp>0?' <span class="small '+(s.exp<=pv.exp?'inc':'exp')+'">'+(s.exp>=pv.exp?'▲':'▼')+'%'+Math.round(Math.abs((s.exp-pv.exp)/pv.exp*100))+'</span>':'')],
    ['Fark (gelir − gider)',sgnD(s.net),s.net<0?'neg':1],
    ['Tasarruf oranı',s.rate==null?'—':(s.rate<0?'−':'')+'%'+NUM1.format(Math.abs(s.rate))],
    ['Günlük ortalama gider',DC0.format(s.exp/el)]];
  if(isCur&&s.exp>0){var F=forecast();rows.push(['Dönem sonu gider tahmini',DC0.format(F.exp)]);if(F.recLeft>0)rows.push(['Tahmindeki kalan düzenli ödemeler',DC0.format(F.recLeft)]);}
  if(s.debt>0)rows.push(['Borç ödemeleri (anapara)',DC0.format(s.debt)]);
  if(Math.abs(s.inv)>=0.5)rows.push([s.inv>0?'Yatırıma aktarılan':'Yatırımdan çekilen',DC0.format(Math.abs(s.inv))]);
  var fixed=0,RL=recLinked();monthTx(k).forEach(function(t){if(RL[t.id]&&t.type==='exp')fixed+=txTL(t);});
  if(s.exp>0&&fixed>0)rows.push(['Sabit giderler (düzenli ödemeler)','%'+Math.round(fixed/s.exp*100)]);
  return '<div class="card"><h2>Nakit akışı</h2>'+res(rows,1)+'<p class="small muted" style="margin:8px 0 0">Oklar '+(isCur?'geçen dönemin aynı gününe':'geçen döneme')+' göre değişimi gösterir. Transferler, borç anapara ödemeleri ve yatırım alımları gider sayılmaz; birikim olarak değerlendirilir.</p></div>';
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
    return '<button class="crow" data-act="cat-tx" data-v="'+esc(c)+'"><div class="crt"><span class="dot" style="background:'+color(c)+'"></span><span class="mid ell">'+esc(c)+'</span><b class="num">'+DC0.format(v)+'</b>'+(d==null?'<span class="small muted cchg">yeni</span>':'<span class="small cchg '+(d>10?'exp':(d<-10?'inc':'muted'))+'">'+(d>=0?'▲':'▼')+'%'+Math.round(Math.abs(d))+'</span>')+'</div><div class="cbar"><i style="width:'+(v/mx*100)+'%;background:'+color(c)+'"></i><s style="left:'+(a/mx*100)+'%"></s></div></button>';}).join('')+'</div><p class="small muted" style="margin:8px 0 0">Çizgi: önceki 3 dönemin ortalaması.</p>';
}
var WDN=['pazartesi','salı','çarşamba','perşembe','cuma','cumartesi','pazar'];
function weekdayCard(){
  var t0=today0(),from=new Date(t0);from.setDate(from.getDate()-83);var fs=isoDate(from),ts=isoDate(t0),tot=[0,0,0,0,0,0,0],cnt=[0,0,0,0,0,0,0],any=false;
  S.tx.forEach(function(t){if(t.type==='exp'&&t.date>=fs&&t.date<=ts){var w=(pdate(t.date).getDay()+6)%7;tot[w]+=txTL(t);cnt[w]++;any=true;}});
  if(!any)return '';
  var mx=Math.max.apply(null,tot)||1,names=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],top=tot.indexOf(Math.max.apply(null,tot)),sel=ui.wk!=null?ui.wk:top;
  return '<div class="card"><h2>Haftanın günleri</h2><div class="wkd">'+tot.map(function(v,i){return '<button data-act="wk-pick" data-v="'+i+'" aria-pressed="'+(i===sel)+'" aria-label="'+WDN[i]+'"><span class="wb"><i style="height:'+Math.max(v/mx*100,2)+'%"></i></span><span class="small muted">'+names[i]+'</span></button>';}).join('')+'</div><p class="small muted" style="margin:8px 0 0">Son 12 haftada <b>'+WDN[sel]+'</b>: haftalık ort. '+DC0.format(tot[sel]/12)+' · '+cnt[sel]+' harcama'+(sel===top?' · en çok harcadığın gün':'')+'.</p></div>';
}
/* net servet grafiğinde dokunulan noktanın değeri */
function nwScrub(el,clientX){
  var box=el.getBoundingClientRect();if(!box.width)return;var d;try{d=JSON.parse(el.dataset.pts);}catch(e){return;}if(!d.length)return;
  var fx=(clientX-box.left)/box.width,best=d[0];d.forEach(function(p){if(Math.abs(p[2]-fx)<Math.abs(best[2]-fx))best=p;});
  var dot=el.querySelector('.nwdot');if(dot){dot.hidden=false;dot.style.left=(best[2]*100)+'%';dot.style.top=(best[3]*100)+'%';}
  var o=document.getElementById('nwpick'),m=maskOn;maskOn=!!S.hide&&!ui.page;
  try{if(o)o.innerHTML='<b>'+esc(pdate(best[0]).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}))+'</b>: <b class="num">'+DC0.format(best[1])+'</b>'+(best[4]?' <span class="muted">(işlemlerden hesaplandı)</span>':'');}finally{maskOn=m;}
}
/* takvim: dönemin günleri, her günün geliri ve gideri; güne dokununca o günün işlemleri.
   4.4: İşlemler'in takvim görünümü; ay okları üstteki dönem kartında */
function calBody(){
  var k=ui.month,s=pStart(k),e=pEnd(k),t0=todayS(),by={};
  monthTx(k).forEach(function(t){var d=by[t.date]||(by[t.date]={i:0,x:0,n:0});d.n++;if(t.type==='inc')d.i+=txTL(t);else if(t.type==='exp')d.x+=txTL(t);});
  var due={};S.recurring.forEach(function(r){if(r.inc)return;occs(r,k).forEach(function(o){if(recPaid(r,o))return;var q=dueDate(r,o);(due[q]||(due[q]=[])).push(r.name);});});
  var d=pdate(s);d.setDate(d.getDate()-(d.getDay()+6)%7);var end=pdate(e);end.setDate(end.getDate()+(7-(end.getDay()+6)%7)%7);
  var cells='',sm=function(v){/* gün kutusu 320 px ekranda ~34 px: tek harfli birim (B = bin, M = milyon), 10 milyondan büyükte küsuratsız */return maskOn?'•':(v>=1e9?Math.round(v/1e9)+'Mr':v>=1e7?Math.round(v/1e6)+'M':v>=1e6?NUM1.format(v/1e6).replace(/,0$/,'')+'M':v>=1e4?Math.round(v/1e3)+'B':v>=1000?NUM1.format(v/1e3).replace(/,0$/,'')+'B':Math.round(v));};
  while(d<=end){var iso=isoDate(d),inP=iso>=s&&iso<=e,x=by[iso],cls='cd'+(inP?'':' out')+(iso===t0?' today':'')+(x?' has':'')+(inP&&due[iso]?' due':'');
    cells+='<button class="'+cls+'"'+(inP?' data-act="cal-day" data-v="'+iso+'"':' disabled')+' aria-label="'+esc(d.toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+(x?': '+x.n+' işlem':'')+(inP&&due[iso]?', ödenecek: '+esc(due[iso].join(', ')):'')+'"><span class="dn">'+d.getDate()+(d.getDate()===1?'<small>'+d.toLocaleDateString('tr-TR',{month:'short'})+'</small>':'')+'</span>'
     +(x&&x.i>=0.5?'<span class="ci">+'+sm(x.i)+'</span>':'')+(x&&x.x>=0.5?'<span class="cx">−'+sm(x.x)+'</span>':'')+'</button>';
    d.setDate(d.getDate()+1);}
  var days=Object.keys(by),top=days.sort(function(a,b){return by[b].x-by[a].x;})[0];
  return '<div class="card cal"><div class="cw">'+['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].map(function(w){return '<span>'+w+'</span>';}).join('')+'</div><div class="cg">'+cells+'</div></div>'
   +(top&&by[top].x>=1?'<p class="small muted" style="margin:0 4px">En çok harcadığın gün: '+esc(pdate(top).toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}))+', '+TRY0.format(by[top].x)+'. Güne dokununca o günün işlemleri açılır.</p>':'<p class="small muted" style="margin:0 4px">Güne dokununca o günün işlemleri açılır.</p>');
}
ACT['cal-day']=function(el,id,v){
  var l=S.tx.filter(function(t){return t.date===v;}).sort(txCmp);
  openSheet('<h2>'+esc(pdate(v).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'}))+'</h2>'+(l.length?'<div class="list">'+l.map(txRow).join('')+'</div>':'<div class="empty">Bu gün işlem yok.</div>')
   +'<button class="btn" data-act="cal-add" data-v="'+v+'">Bu güne işlem ekle</button>');};
ACT['cal-add']=function(el,id,v){txSheet(null,null,{date:v});};
function analizBody(){
  var v=ANS.some(function(x){return x[0]===ui.an;})?ui.an:'ozet',k=ui.month,m=monthTx(k),h=segTabs(ANS,v,'an','Analiz');
  if(v==='ozet'){
    h+=monthNav()+(k===curP()?brainCard()+insights():'')+flowCard();
    if(!S.tx.some(function(t){return t.type==='inc'||t.type==='exp';}))return h;
    h+='<div class="card"><div class="ghead" style="margin-bottom:8px"><h2 style="margin:0;flex:1">Gelir ve gider</h2><div class="seg mini" role="group" aria-label="Süre"><button data-act="trn" data-v="6" aria-pressed="'+(ui.tr===6)+'">6 ay</button><button data-act="trn" data-v="12" aria-pressed="'+(ui.tr===12)+'">12 ay</button></div></div>'+trendSvg(ui.tr)+'</div>';
    h+=fireCard();
    return h;
  }
  /* Kategoriler. 4.2: kategori listesinin tekrarı olan pasta grafikleri ve Bütçe'ye dönen bağlantı kartı kaldırıldı */
  var big=m.filter(function(t){return t.type==='exp';}).sort(function(a,b){return txTL(b)-txTL(a);}).slice(0,5);
  var byA={};m.forEach(function(t){if(t.type==='exp')byA[t.acct]=(byA[t.acct]||0)+txTL(t);});var sbc=spentByCat(k),ak=Object.keys(byA);
  h+=monthNav()+'<div class="card"><h2>Dağılım</h2>'+donut(Object.keys(sbc).map(function(c){return [c,sbc[c]];}),'Bu dönemde harcama yok.','cat-tx')+'</div>';
  h+='<div class="card"><h2>Kategoriler</h2>'+catChanges()+'</div>';
  h+='<button class="setcard" data-act="plan-go" data-v="butce"><span class="sic" style="--c:var(--inc)">'+ic('scale')+'</span><span class="mid"><div class="t">Bütçeler</div><div class="small muted">Kategori limitlerini belirle ve takip et</div></span>'+ic('r')+'</button>';
  if(big.length)h+='<div class="card" style="padding-top:12px"><h2>En büyük harcamalar</h2><div class="list">'+big.map(txRow).join('')+'</div></div>';
  if(ak.length>1)h+='<div class="card"><h2>Hesaplara göre</h2>'+donut(ak.map(function(a){return [a,byA[a]];}),'')+'</div>';
  return h+weekdayCard();
}

/* ---------- Portföy ---------- */
function rateTile(l,v,c){return '<span class="rt"><span class="lbl">'+l+'</span><span class="num">'+fx1(v)+'</span>'+(v>0&&c!=null&&isFinite(c)?'<span class="small num '+(c>=0?'inc':'exp')+'">'+(c>=0?'+':'−')+'%'+NUM2.format(Math.abs(c))+'</span>':'')+'</span>';}
function fmtTs(t){return new Date(t).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});}
function qtyTxt(x){var q=NUM2.format(x.qty);return {XAU:q+' gr',XAG:q+' gr',CEY:q+' adet',USD:'$'+q,EUR:'€'+q,GBP:'£'+q,CHF:'CHF '+q}[x.ccy]||q+' adet';}
function borcBody(){
  var tot=debtManual(),cards=ACCS().filter(function(a){return acctType(a)==='kart'&&acctBal(a)<0;}),cd=r2(cards.reduce(function(x,a){return x+toTL(-acctBal(a),a);},0));
  var h='<div class="card"><div class="lbl">Toplam borç</div><p class="big exp">'+TRY0.format(tot+cd)+'</p>'+(cd>0?'<div class="small muted">Kredi kartları '+TRY0.format(cd)+' · krediler ve diğer '+TRY0.format(tot)+'</div>':'')+'</div>';
  /* 4.4: "Borç ekle" listenin altında (diğer liste ekranlarıyla aynı) */
  if(S.debts.length)h+='<div class="card" style="padding-top:6px"><div class="list">'+S.debts.map(function(d){var l=debtLeft(d),p=d.amt>0?clamp((d.amt-l)/d.amt*100,0,100):0;return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="bar" style="margin:6px 0 2px"><i style="width:'+p+'%"></i></div><div class="small muted">'+esc(d.type)+' · %'+Math.round(p)+' ödendi</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div></div>'+addBtn('new-d','Borç ekle');
  else h+='<div class="empty">Kredi, taksit ya da kişisel borç yok. Eklersen ödemeler hesabından düşer, borç azalır.</div>'+addBtn('new-d','Borç ekle',1);
  if(cards.length)h+='<div class="card" style="padding-top:12px"><h2>Kredi kartları</h2><div class="list">'+cards.map(acctLine).join('')+'</div></div>';
  return h;
}
function holdCard(x){
  var p=hVal(x)-hCost(x),pp=hCost(x)?p/hCost(x)*100:0,linked=!!x.mk||!!(x.ccy&&+S.fx[x.ccy]>0),ast=hKind(x)==='asset',mq=x.mk&&mQ(x.mk);
  return '<div class="card hcard"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-h" data-id="'+x.id+'"><span class="dot" style="background:'+color(x.type)+'"></span><span class="mid"><div class="t" style="font-weight:600">'+esc(x.name)+'</div><div class="small muted">'+esc(x.type)+(ast?'':' · '+qtyTxt(x)+' · ort. '+TRY2.format(x.cost))+(linked?' · '+esc(x.mk?(x.mks||mSym(x.mk)):FXL[x.ccy])+' '+TRY2.format(hPrice(x)):'')+(mq&&mq.c!=null?' '+chgSpan(mq.c):'')+'</div></span></button><span class="num" style="font-size:1.0625rem">'+TRY0.format(hVal(x))+'</span></div>'
   +yLine(x)
   +(linked||yOn(x)?'':'<label class="pin-in"><span class="small muted">Güncel '+(ast?'değer':'fiyat')+' (₺)</span><input inputmode="decimal" data-price="'+x.id+'" value="'+nv(x.price)+'" aria-label="'+esc(x.name)+' güncel '+(ast?'değer':'fiyat')+' (₺)"></label>')
   +'<div class="hrow"><span class="num small '+(p>=0?'inc':'exp')+'">'+sgn(p)+(hCost(x)?' ('+(pp>=0?'+':'−')+'%'+NUM2.format(Math.abs(pp))+')':'')+'</span><span class="hbtn">'+(ast?'':'<button class="btn small ghost" data-act="h-buy" data-id="'+x.id+'">Al</button>')+'<button class="btn small ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></span></div></div>';
}
function yatirimBody(){
  var pf=pfTotals('inv'),pl=pf.v-pf.c,plp=pf.c?pl/pf.c*100:0,h='',dist='',inv=S.holdings.filter(function(x){return hKind(x)==='inv';});
  /* yatırım türlerinin dağılımı yukarıdaki net servet kartındaki "Varlık dağılımı"nda */
  h+='<div class="card"><div class="lbl">Yatırımlarının değeri</div><p class="big">'+TRY0.format(pf.v)+'</p><div class="row3" style="grid-template-columns:1fr 1fr"><div><div class="lbl">Maliyet</div><span class="num">'+TRY0.format(pf.c)+'</span></div><div><div class="lbl">Kâr / zarar</div><span class="num '+(pl>=0.5?'inc':(pl<=-0.5?'exp':''))+'">'+sgn(pl)+'</span>'+(pf.c?'<div class="small '+(plp>=0?'inc':'exp')+'">'+(plp>=0?'+':'−')+'%'+NUM1.format(Math.abs(plp))+'</div>':'')+'</div></div>'+(S.realized.length?(function(){var rp=r2(S.realized.reduce(function(a,x){return a+(+x.pl||0);},0));return '<div class="small" style="margin-top:8px"><span class="muted">Satışlardan gerçekleşen kâr/zarar</span> <b class="num '+(rp>=0?'inc':'exp')+'">'+sgn(rp)+'</b> <span class="muted">· '+S.realized.length+' satış</span></div>';})():'')+dist+'</div>';
  /* 4.4: önce elindekiler (Al / Sat satırları), "Yatırım ekle" listenin altında; ev, araba gibi varlıklar ayrı bölümde; en altta Piyasalar */
  h+=inv.length?inv.map(holdCard).join('')+addBtn('new-h','Yatırım ekle',0,'inv'):'<div class="empty">Hisse, fon, altın, gümüş, döviz, kripto ya da mevduat ekle. Hisse, fon ve kriptoyu aşağıdaki Piyasalar’dan eklersen fiyatları kendiliğinden güncellenir.</div>'+addBtn('new-h','Yatırım ekle',1,'inv');
  return h+varlikSec()+mCard();
}
/* ev, araba gibi varlıklar: 4.4'e kadar ayrı "Varlıklar" alt sekmesiydi (üstteki "Varlıklar" toplamıyla karışıyordu); şimdi Yatırımlar'ın altında */
function varlikSec(){
  var pa=pfTotals('asset'),ast=S.holdings.filter(function(x){return hKind(x)==='asset';});
  if(!ast.length)return '<div class="card hint" id="varliklar"><p class="small" style="margin:0"><b>Ev, araba ve diğer varlıklar</b><br><span class="muted">Ev, araba gibi varlıklarını da ekleyerek net servetine katabilirsin; değerini sen güncellersin.</span></p><button class="linkbtn" style="padding:2px 0" data-act="new-h" data-v="asset">+ Varlık ekle</button></div>';
  return '<div class="sumline" id="varliklar" style="margin-top:8px"><span class="muted">Ev, araba ve diğer varlıklar'+(pa.c&&Math.abs(pa.v-pa.c)>=0.5?' · alışa göre '+sgn(pa.v-pa.c):'')+'</span><b class="num">'+TRY0.format(pa.v)+'</b></div>'
   +ast.map(holdCard).join('')+addBtn('new-h','Varlık ekle',0,'asset');
}

/* ---------- Notlar ---------- */
/* Notlar sade: tek liste (arşivdekiler de burada), sabitler üstte; silinenler 30 gün "Silinenler"de kalır */
function noteIn(n,v){return v==='trash'?!!n.trash:!n.trash;}
function noteSorted(v){
  var q=fold(ui.nq),N=S.nset;v=v||'act';
  var l=S.notes.filter(function(n){return noteIn(n,v)&&(!q||fold((n.title||'')+' '+n.body).indexOf(q)>-1);});
  l.sort(function(a,b){
    if(v!=='trash'&&N.pinFirst!==false&&!!a.pin!==!!b.pin)return a.pin?-1:1;
    if(N.sort==='title')return String(a.title||a.body||'').localeCompare(String(b.title||b.body||''),'tr');
    if(N.sort==='created')return (b.cts||b.ts||0)-(a.cts||a.ts||0);
    return (b.ts||0)-(a.ts||0);});
  return l;
}
function noteHead(n){var t=(n.title||'').trim();if(t)return t;var f=String(n.body||'').trim().split('\n')[0];return f?f.slice(0,60):'Boş not';}
function noteDate(ts){var d=new Date(ts),t=today0();return d>=t?d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:d.getFullYear()!==t.getFullYear()?'numeric':undefined});}
function noteCounts(){var c={act:0,arch:0,trash:0};S.notes.forEach(function(n){c[n.trash?'trash':'act']++;});return c;}
function trashSheet(){
  var l=noteSorted('trash');if(!l.length){closeSheet();render();return;}
  openSheet('<h2>Silinen notlar</h2><p class="small muted" style="margin:0">Silinen notlar 30 gün sonra kendiliğinden kalıcı olarak silinir.</p><div class="list">'
   +l.map(function(n){var left=Math.max(0,30-Math.floor((Date.now()-n.trash)/864e5));return '<div class="item"><span class="mid"><div class="t ell">'+esc(noteHead(n))+'</div><div class="small muted">'+left+' gün sonra silinecek</div></span><button class="btn small ghost" data-act="nt-restore" data-id="'+n.id+'">Geri al</button><button class="icon-btn sm" data-act="nt-purge" data-id="'+n.id+'" aria-label="Kalıcı olarak sil" title="Kalıcı olarak sil">'+ic('trash')+'</button></div>';}).join('')
   +'</div><button class="btn danger" data-act="n-empty">Hepsini kalıcı olarak sil</button>');
}
ACT['n-trashv']=function(){trashSheet();};
ACT['nt-restore']=function(el,id){var n=byId(S.notes,id);if(!n)return;delete n.trash;save();render();toast('Not geri alındı');trashSheet();};
ACT['nt-purge']=function(el,id){if(!armed(el)){toast('Kalıcı silmek için tekrar dokun');return;}S.notes=S.notes.filter(function(x){return x.id!==id;});save();render();toast('Not kalıcı olarak silindi');trashSheet();};
ACT['n-export']=function(){openSheet('<h2>Notları dışa aktar</h2>'+notesExport());};
function purgeTrash(){var lim=Date.now()-30*864e5,b=S.notes.length;S.notes=S.notes.filter(function(n){return !(n.trash&&n.trash<lim);});if(S.notes.length!==b)save();}

/* ---------- form parçaları ---------- */
function fld(label,id,path,kind,ph){var v=getP(path),s=(v===''||v==null)?'':String(v).replace('.',',');return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" inputmode="decimal" data-bind="'+path+'" data-kind="'+kind+'" placeholder="'+esc(ph||'')+'" value="'+esc(s)+'"></div>';}
function tgl(path,label,desc){var on=!!getP(path);return '<button class="row-tgl" data-act="tgl" data-v="'+path+'" role="switch" aria-checked="'+on+'"><span class="mid"><div class="t">'+label+'</div>'+(desc?'<div class="small muted">'+desc+'</div>':'')+'</span><span class="sw"></span></button>';}
function segv(path,opts,aria){var cur=getP(path);if(cur==null||cur==='')cur=opts[0][0];return '<div class="seg" role="group" aria-label="'+aria+'">'+opts.map(function(o){return '<button data-act="setv" data-v="'+path+'" data-x="'+o[0]+'" aria-pressed="'+(String(cur)===String(o[0]))+'"'+(o[2]?' aria-label="'+o[2]+'" title="'+o[2]+'"':'')+'>'+o[1]+'</button>';}).join('')+'</div>';}
function sec(t,inner,note){return '<div class="card stack" style="gap:12px">'+(t?'<h2 style="margin:0">'+t+'</h2>':'')+inner+(note?'<p class="small muted" style="margin:0">'+note+'</p>':'')+'</div>';}
function msg(text,ok,id){var e=document.getElementById(id||'f-err');if(e){e.textContent=text;e.style.color=ok?'var(--inc)':'var(--exp)';}}
function res(rows){return '<div class="res">'+rows.map(function(r){return '<div class="r'+(r[2]?' strong':'')+(r[2]==='neg'?' neg':'')+'"><span>'+esc(r[0])+'</span><span class="num">'+r[1]+'</span></div>';}).join('')+'</div>';}

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
  h+='<div class="card hero"><div class="nwtop"><span class="lbl">FIRE ilerlemesi</span></div><p class="big">%'+NUM2.format(m.prog)+'</p><div class="bar"><i style="width:'+m.prog+'%"></i></div><div class="small muted" style="margin-top:8px">'+(m.n<=0?'Hedefe ulaştın.':'Tahmini süre <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</div></div>';
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
function setList(){var g='';return SETS.map(function(s){var hd=s.g!==g?'<div class="setgrp">'+esc(g=s.g)+'</div>':'';return hd+'<button class="setcard" data-act="open-set" data-id="'+s.id+'" data-v="ayarlar"><span class="sic" style="--c:'+s.c+'">'+ic(s.i)+'</span><span class="mid"><div class="t">'+esc(s.t)+'</div><div class="small muted">'+esc(s.d)+'</div></span>'+ic('r')+'</button>';}).join('');}
function vAyarlar(){return '<div id="setlist" class="stack" style="gap:10px">'+setList()+'</div><div class="card stack" style="gap:8px;text-align:center"><div class="small muted">Wallet '+VER+' · Veriler bu cihazda saklanır'+(nb('saveData')?' (uygulama içinde ve yedek dosyasında)':'')+'</div><button class="btn ghost small" style="align-self:center" data-act="check-upd">Güncellemeleri denetle</button><div class="err" id="f-upd" style="text-align:center"></div></div>';}
function setBody(s){s=SETMAP[s]||s;return ({genel:setGenel,kat:setKat,kurlar:setKur,oto:setOto,bild:setBild,guv:setGuv,veri:setVeri}[s]||setVeri)();}
/* Genel: profil, dönem, varsayılan hesap ve görünüm tek sayfada */
function setGenel(){
  var pd=S.payday||1,o='';for(var i=1;i<=31;i++)o+='<option value="'+i+'"'+(i===pd?' selected':'')+'>Ayın '+i+sfx(i)+'</option>';o+='<option value="32"'+(pd===32?' selected':'')+'>Ayın son iş günü</option>';
  return sec('Profil','<div class="field"><label for="pf-name">Ad</label><input id="pf-name" data-bind="name" data-kind="text" placeholder="Adın" value="'+esc(S.name)+'"></div>','Adın ana sayfada görünür.')
   +sec('Dönem','<div class="field"><label for="pf-pd">Maaş günü (dönem başlangıcı)</label><select id="pf-pd" data-bind="payday" data-kind="int">'+o+'</select></div><div class="small">Şu anki dönem: <b>'+esc(plabel(curP()))+'</b> ('+esc(prange(curP()))+')</div>','Özetler, bütçe ve düzenli ödemeler bu günden başlayan döneme göre hesaplanır. Ayın 1’i için 1. günü seç.')
   +sec('Varsayılan hesap','<div class="field"><label for="st-def">Yeni işlemde seçili gelen hesap</label><select id="st-def" data-bind="defAcct" data-kind="text"><option value="">Son kullandığım hesap</option>'+ACCS().map(function(a){return '<option'+(S.defAcct===a?' selected':'')+'>'+esc(a)+'</option>';}).join('')+'</select></div>','Hesap eklemek ve düzenlemek için alt menüdeki Hesaplar sekmesini kullan.')
   +sec('Görünüm','<div class="lbl">Tema</div>'+segv('theme',[['auto','Sistem'],['light','Açık'],['dark','Koyu']],'Tema')
     +'<div class="lbl">Yazı boyutu</div>'+segv('fs',[[0.9,'<span style="font-size:13px">A</span>','Küçük'],[1,'<span style="font-size:16px">A</span>','Normal'],[1.15,'<span style="font-size:19px">A</span>','Büyük'],[1.3,'<span style="font-size:22px">A</span>','Çok büyük']],'Yazı boyutu'),
     '')
   +sec('Gizlilik',tgl('hide','Tutarları gizle','Tutarlar •••• olur; net servet kartındaki göz düğmesiyle de açıp kapatabilirsin'));
}
function chipRow(type){return '<div class="chips catset">'+S.cats[type].map(function(c){var n=subsOf(c).length;return '<button class="chip" data-act="cat-menu" data-v="'+type+'" data-id="'+esc(c)+'">'+cic(c,'xs')+esc(c)+(n?'<span class="small muted"> · '+n+'</span>':'')+'</button>';}).join('')+'</div>';}
function catAdd(type,label){return '<div class="two" style="grid-template-columns:1fr auto"><input id="nc-'+type+'" placeholder="'+label+'" aria-label="'+label+'"><button class="btn small" data-act="cat-add" data-v="'+type+'">Ekle</button></div>';}
function setKat(){
  var all=EXPC().concat(INCC()),rl=S.rules.length?'<div class="list">'+S.rules.map(function(r,i){return '<div class="item"><span class="mid"><div class="t">“'+esc(r.kw)+'” → '+esc(r.cat)+'</div></span><button class="btn small ghost" data-act="rule-del" data-id="'+i+'">Sil</button></div>';}).join('')+'</div>':'<div class="small muted">Henüz kural yok.</div>';
  return sec('Gider kategorileri',chipRow('exp')+catAdd('exp','Yeni gider kategorisi'),'Simgesini, alt kategorilerini ve adını değiştirmek ya da silmek için kategoriye dokun. Yanındaki sayı alt kategori sayısıdır. Silinen kategorinin geçmiş işlemleri silinmez.')
   +sec('Gelir kategorileri',chipRow('inc')+catAdd('inc','Yeni gelir kategorisi'))
   +sec('Otomatik kurallar',rl+'<div class="two"><div class="field"><label for="rl-kw">İşlem notunda geçen kelime</label><input id="rl-kw" placeholder="Örn. migros"></div><div class="field"><label for="rl-cat">Kategori</label><select id="rl-cat">'+opts(all)+'</select></div></div><div class="err" id="f-err"></div><button class="btn" data-act="rule-add">Kural ekle</button>','İşlem eklerken nota bu kelimeyi yazarsan kategori kendiliğinden seçilir.');
}
function fmtProv(p){var m=String(p).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):String(p);}
function setKur(){
  var when=S.fxTs?'Son güncelleme: '+esc(fmtTs(S.fxTs))+(S.fxProv?' · kaynak saati '+esc(fmtProv(S.fxProv)):'')+(S.fxSrc==='ecb'?' · yedek kaynak (ECB günlük referans kuru)':''):'Kurlar henüz alınmadı.';
  return sec('Görüntüleme para birimi','<div class="field"><label for="dccy2">Net servet, Analiz ve FIRE bu birimde gösterilir</label>'+ccySel('dccy2',S.dccy)+'</div>','Tutarlar güncel kurla çevrilir; işlemler ve bütçeler kendi para biriminde kalır.')
   +sec('Kurların güncellenmesi','<div class="small muted">'+when+'</div>'+tgl('fxAuto','Kurları otomatik güncelle','Uygulama açılınca ve her 5 dakikada bir yenilenir')+'<button class="btn ghost" data-act="rates-now">Şimdi güncelle</button><div class="err" id="f-rates"></div>',
     'Kaynak: Truncgil Finans (döviz, altın, BIST 100); alınamazsa döviz için Avrupa Merkez Bankası günlük referans kuru (Frankfurter). Anlık borsa verisi değildir.')
   +'<details class="card"><summary><b>Kurları elle gir (₺)</b></summary><div class="two" style="margin-top:12px">'+FXK.map(function(k){return fld(FXL[k],'fx-'+k,'fx.'+k,'num','0');}).join('')+'</div><p class="small muted" style="margin:8px 0 0">İnternet yokken işine yarar. Otomatik güncelleme açıkken elle girdiğin değerler bir sonraki yenilemede değişir.</p></details>';
}
function notifState(){if(nb('notifState')){try{return NB.notifState();}catch(e){}}return ('Notification' in window)?Notification.permission:'yok';}
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
  return sec('Fatura ve ödeme hatırlatıcısı',tgl('alerts.rec','Hatırlatıcı açık','Düzenli ödemeler ve kredi kartı son ödeme günleri')+'<div class="lbl">Kaç gün önceden</div>'+segv('alerts.days',[[1,'1 gün'],[3,'3 gün'],[7,'7 gün']],'Gün')+'<div class="lbl">Yaklaşan ödemeler</div>'+upcomingList(),'Yaklaşan ödemeler ana sayfadaki Gündem’de “Ödendi” düğmesiyle görünür. Ödendi olarak işaretlediğin ödemeler için hatırlatma gelmez.')
   +sec('Telefon bildirimi',phone,native?'Bildirimler telefonun kendi hatırlatıcısıyla planlanır; telefon yeniden başlasa da devam eder.':'Tarayıcıda bildirim yalnızca uygulama açıldığında gelir.')
   +sec('Bütçe uyarıları',tgl('alerts.budget','Bütçe aşımı uyarıları','Limite yaklaşınca ya da aşınca ana sayfada gösterilir')+'<div class="lbl">Uyarı eşiği</div>'+segv('alerts.thr',[[70,'%70'],[80,'%80'],[90,'%90']],'Uyarı eşiği'));
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
  var nat=nb('autoBackup');
  /* şifre isteğe bağlı: bir kez konur, otomatik yedek, kaydet, paylaş ve kopyala hepsinde kullanılır */
  var pw=S.bkKey?'<div class="small inc">Yedekler şifreli. Geri yüklerken bu şifre sorulur.</div><button class="btn ghost" data-act="bk-pw-del">Yedek şifresini kaldır</button>'
      :'<details class="bkpw"><summary>Yedekleri şifrele (isteğe bağlı)</summary><div class="stack" style="gap:10px;margin-top:8px"><div class="two"><div class="field"><label for="bkp1">Şifre</label><input id="bkp1" type="password" autocomplete="new-password" placeholder="En az 6 karakter"></div><div class="field"><label for="bkp2">Tekrar</label><input id="bkp2" type="password" autocomplete="new-password"></div></div><button class="btn ghost" data-act="bk-pw-set">Şifreyi kaydet</button></div></details>';
  var bk=sec('Yedek',(nat?tgl('autoBk','Otomatik yedekle','Değişiklikten kısa süre sonra ve uygulamadan çıkınca İndirilenler/Wallet klasörüne yazılır')+(S.bkTs?'<div class="small muted">Son otomatik yedek: '+esc(fmtTs(S.bkTs))+(S.bkEnc?' · şifreli':' · şifresiz')+'</div>':'')+(S.bkHold?'<div class="small exp">Otomatik yedek duraklatıldı: eski yedek dosyanın üzerine yazılmasın diye. Önce yedekten yükle ya da devam ettir.</div><button class="btn ghost" data-act="bk-resume">Otomatik yedeği devam ettir</button>':''):'')
    +(nat?'<div class="two"><button class="btn ghost" data-act="bk-auto">Şimdi yedekle</button><button class="btn ghost" data-act="bk-share">Paylaş / Drive’a kaydet</button></div>'
      :'<button class="btn" data-act="bk-save">Yedeği dosya olarak kaydet</button><div class="two"><button class="btn ghost" data-act="bk-share">Paylaş</button><button class="btn ghost" data-act="bk-copy">Kopyala</button></div>')+pw+'<div class="err" id="f-bka"></div>',
    (nat?'Uygulamayı silsen bile yedek dosyası telefonda kalır; “Yedekten yükle” ile geri alabilirsin. Telefonunda Google yedekleme açıksa Wallet verileri Google hesabına da kendiliğinden yedeklenir. ':'')+'Şifreli yedek AES-256 ile korunur; şifreyi unutursan yedek açılmaz, şifre hiçbir yerde saklanmaz.');
  setTimeout(rcStatFill,0);
  return bk+cloudSec()+rcSec()+sec('Yedekten yükle','<label class="btn ghost filebtn">Dosya seç<input id="rs-file" type="file" accept=".json,.txt,application/json,text/plain"></label><div class="small muted" id="rs-file-name"></div><div class="field"><label for="rs-txt">Ya da yedek metnini yapıştır</label><textarea id="rs-txt" placeholder="Kopyaladığın yedeği buraya yapıştır"></textarea></div><div class="field"><label for="rs-pw">Şifre (yedek şifreliyse)</label><input id="rs-pw" type="password" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn ghost" data-act="rs-go">Yedeği yükle</button>'+(lsHas('wallet-prerestore')?'<button class="btn ghost" data-act="rs-undo">Yüklemeden önceki veriye dön</button>':''),'Yükleme mevcut verilerin yerine geçer; önceki verin saklanır, geri dönebilirsin. PIN ayarın korunur.')
   +(S.lastImp&&S.tx.some(function(t){return t.imp===S.lastImp.id;})?sec('Son içe aktarım','<div class="small muted">'+esc(fmtTs(S.lastImp.ts))+' · '+S.lastImp.n+' işlem</div><div class="two"><button class="btn ghost" data-act="imp-review">Gözden geçir</button><button class="btn ghost" data-act="imp-undo">Geri al</button></div>'):'')+sec('Banka ekstresi içe aktar','<label class="btn ghost filebtn">Ekstre dosyası seç<input id="im-file" type="file" accept=".csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label><div class="small muted" id="im-file-name"></div><div class="field"><label for="im-txt">Ya da CSV metnini yapıştır</label><textarea id="im-txt" placeholder="İlk satır başlık olmalı, örn: Tarih; Açıklama; Tutar"></textarea></div><div class="field"><label for="im-acct">Hesap sütunu yoksa bu hesaba ekle</label><select id="im-acct">'+opts(ACCS(),ACCS().filter(function(a){return acctType(a)==='banka';})[0]||ACCS()[0])+'</select></div><div class="err" id="f-err4"></div><button class="btn ghost" data-act="im-go">İçe aktar</button>','İnternet şubesinden ya da mobil uygulamadan indirdiğin hesap hareketleri: Excel (.xlsx, .xls) ya da CSV. Başlık satırı kendiliğinden bulunur; eksi tutarlar gider, artılar gelir sayılır (kredi kartı hesabında artılar harcamadır). Kategori açıklamaya göre seçilir, aynı kayıtlar tekrar eklenmez.')
   +sec('İşlemleri CSV olarak dışa aktar','<div class="two"><button class="btn ghost" data-act="csv">Kaydet</button><button class="btn ghost" data-act="csv-copy">Kopyala</button></div><div class="err" id="f-err"></div>','Excel ve tablo uygulamalarında açılır. '+S.tx.length+' işlem.')
   +'<details class="card more"'+(errList().length?' open':'')+'><summary><b>Örnek veriler ve hata kaydı</b></summary><div class="stack" style="gap:12px;margin-top:12px"><div class="lbl">Örnek veriler</div>'+(hasSample()?'<button class="btn ghost" data-act="sample-clear">Örnek verileri sil</button>':'<button class="btn ghost" data-act="sample-load">Örnek verileri yükle</button>')+'<p class="small muted" style="margin:0">Örnek veriler kendi kayıtlarının yanına eklenir ve işaretlidir, istediğinde silebilirsin.</p><div class="lbl">Hata kaydı</div>'+errInner()+'</div></details>'
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
  if(ui.forgot)return logo+'<h2 style="margin:0">PIN’ini mi unuttun?</h2><p class="small muted" style="max-width:320px;text-align:center;margin:0">PIN kurtarılamaz. Devam edersen bu cihazdaki tüm Wallet verileri silinir ve kilit kalkar. '+(nb('wipeKeep')?'İndirilenler/Wallet klasöründeki otomatik yedek dosyan silinmez; sonra Ayarlar › Veri ve yedek › Yedekten yükle ile geri getirebilirsin.':(nb('wipe')?'Dikkat: otomatik yedek dosyası da silinir; başka bir yedeğin varsa sonra geri yükleyebilirsin.':'Yedeğin varsa sonra geri yükleyebilirsin.'))+'</p><button class="btn danger" style="max-width:320px" data-act="lk-reset">Tüm verileri sil ve kilidi kaldır</button><button class="btn ghost" style="max-width:320px" data-act="lk-back">Vazgeç</button>';
  var dots='';for(var i=0;i<4;i++)dots+='<i class="'+(i<ui.pinBuf.length?'on':'')+'"></i>';
  var wait=Date.now()<ui.lockUntil,keys=['1','2','3','4','5','6','7','8','9',S.bio&&bioOk()?'b':'','0','<'];
  return logo+'<h2 style="margin:0">PIN gir</h2><div class="dots">'+dots+'</div><div class="err" style="min-height:1.3em">'+esc(ui.lkMsg||'')+'</div><div class="keypad">'+keys.map(function(k){if(k==='')return '<span></span>';if(k==='b')return '<button class="key" data-act="lk-bio" aria-label="Parmak izi ile aç">'+ic('shield')+'</button>';return '<button class="key" data-act="lk" data-v="'+k+'"'+(wait?' disabled':'')+' aria-label="'+(k==='<'?'Sil':k)+'">'+(k==='<'?'←':k)+'</button>';}).join('')+'</div><button class="linkbtn" data-act="lk-forgot">PIN’imi unuttum</button>';
}
function lockNow(){ui.locked=true;ui.pinBuf='';ui.lkMsg='';ui.forgot=false;closeSheet();render();askBio();}
function askBio(){if(ui.locked&&S.pin&&S.bio&&bioOk()&&nb('bioAuth')){try{NB.bioAuth();}catch(e){}}}
window.walletBio=function(ok){if(ok&&ui.locked){ui.locked=false;ui.pinBuf='';ui.fails=0;ui.lkMsg='';render();setTimeout(runIntent,50);}};

/* ---------- yedek ---------- */
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s);}
function unb64(s){var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
function deriveKey(pw,salt){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']).then(function(k){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);});}
function encText(text,pw){var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  return deriveKey(pw,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(text));}).then(function(ct){return JSON.stringify({wallet:1,s:b64(salt),i:b64(iv),d:b64(ct)});});}
function decText(o,pw){var salt=unb64(o.s),iv=unb64(o.i);return deriveKey(pw,salt).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:iv},k,unb64(o.d));}).then(function(b){return new TextDecoder().decode(b);});}
function exportJson(){var c=JSON.parse(JSON.stringify(S));delete c.pin;delete c.bkKey;delete c.cloud;return JSON.stringify(c);}
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
  if(!nb('autoBackup')||(!S.autoBk&&!force)||!bkOk()&&!force)return Promise.resolve(false);if(force)delete S.bkHold;
  return backupText().then(function(text){var r='err';try{r=NB.autoBackup(text);}catch(e){}
    if(r==='ok'){S.bkTs=Date.now();S.bkEnc=!!S.bkKey;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}return true;}return false;},function(){return false;});
}
function setBkPw(pw){var salt=crypto.getRandomValues(new Uint8Array(16));
  return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,256);}).then(function(bits){S.bkKey={s:b64(salt),k:b64(bits)};save();});}

/* ---------- hesaplayıcılar ---------- */
var CALCS={
  kredi:{name:'Kredi',fields:[['amt','Kredi tutarı (₺)',100000],['rate','Aylık faiz (%)',3.5],['n','Vade (ay)',24],['tax','Vergi: KKDF + BSMV (%)',30]],
    run:function(v){var P=v.amt,n=Math.round(v.n),r=v.rate/100*(1+v.tax/100);if(P<=0||n<=0)return '<div class="empty">Tutar ve vadeyi gir.</div>';if(n>600)return '<div class="empty">Vade en fazla 600 ay (50 yıl) olabilir.</div>';if(v.rate<0||v.tax<0)return '<div class="empty">Faiz ve vergi sıfır ya da pozitif olmalı.</div>';
      var pay=r===0?P/n:P*r/(1-Math.pow(1+r,-n)),bal=P,tot=0,rows='';
      for(var i=1;i<=n;i++){var it=bal*r,pr=pay-it;bal-=pr;tot+=it;rows+='<tr><td>'+i+'</td><td>'+TRY2.format(pay)+'</td><td>'+TRY2.format(pr)+'</td><td>'+TRY2.format(it)+'</td><td>'+TRY2.format(Math.max(bal,0))+'</td></tr>';}
      return res([['Aylık taksit',TRY2.format(pay),1],['Toplam geri ödeme',TRY2.format(pay*n)],[v.tax>0?'Toplam faiz ve vergi':'Toplam faiz',TRY2.format(tot)],['Yıllık bileşik maliyet','%'+NUM2.format((Math.pow(1+r,12)-1)*100)]])
       +'<p class="small muted">İhtiyaç kredisinde faize KKDF (%15) ve BSMV (%15) eklenir; konut kredisinde ikisi de yoktur (0 yaz). Bankanın ödeme planıyla karşılaştır.</p>'
       +'<details><summary>Ödeme planı</summary><div class="scroll-x"><table><thead><tr><th>Ay</th><th>Taksit</th><th>Anapara</th><th>Faiz+vergi</th><th>Kalan</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';}},
  birikim:{name:'Birikim',fields:[['p','Başlangıç tutarı (₺)',50000],['c','Aylık katkı (₺)',5000],['rate','Yıllık getiri (%)',40],['y','Süre (yıl)',5]],
    run:function(v){var n=Math.round(v.y*12);if(n<=0)return '<div class="empty">Süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var fv=r===0?v.p+v.c*n:v.p*g+v.c*(g-1)/r,put=v.p+v.c*n;
      return res([['Dönem sonu tutar',TRY0.format(fv),1],['Toplam yatırılan',TRY0.format(put)],['Kazanılan getiri',TRY0.format(fv-put)]])+'<p class="small muted">Aylık bileşik getiri varsayılır. Vergi ve enflasyon dahil değildir.</p>';}},
  mevduat:{name:'Mevduat',fields:[['p','Anapara (₺)',100000],['rate','Yıllık brüt faiz (%)',45],['d','Vade (gün)',32],['tax','Stopaj (%)',17.5]],
    run:function(v){if(v.p<=0||v.d<=0)return '<div class="empty">Anapara ve vadeyi gir.</div>';var g=v.p*v.rate/100*v.d/365,tx=g*v.tax/100,net=g-tx;
      return res([['Net getiri',TRY2.format(net),1],['Brüt faiz',TRY2.format(g)],['Stopaj',TRY2.format(tx)],['Vade sonu toplam',TRY2.format(v.p+net)],['Net yıllık oran','%'+NUM2.format(net/v.p*365/v.d*100)]])+'<p class="small muted">TL mevduatta stopaj vadeye göre değişir: 6 aya kadar %'+NUM1.format(FACTS.dep.t6)+', 1 yıla kadar %'+NUM1.format(FACTS.dep.t12)+', daha uzun %'+NUM1.format(FACTS.dep.t12p)+' ('+esc(FACTS.dep.d)+').</p>';}},
  hedef:{name:'Hedef',fields:[['t','Hedef tutar (₺)',500000],['p','Mevcut birikim (₺)',50000],['m','Süre (ay)',36],['rate','Yıllık getiri (%)',30]],
    run:function(v){var n=Math.round(v.m);if(n<=0||v.t<=0)return '<div class="empty">Hedef tutar ve süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var need=r===0?(v.t-v.p)/n:(v.t-v.p*g)*r/(g-1);if(need<0)need=0;
      return res([['Aylık ayırman gereken',TRY2.format(need),1],['Toplam yatıracağın',TRY0.format(need*n+v.p)],['Getiriden gelen',TRY0.format(Math.max(v.t-need*n-v.p,0))]])+(need===0?'<p class="small muted">Mevcut birikimin getiriyle hedefe ulaşır.</p>':'');}},
  enflasyon:{name:'Enflasyon',fields:[['a','Tutar (₺)',100000],['inf','Yıllık enflasyon (%)',35],['y','Süre (yıl)',3],['nom','Yıllık nominal getiri (%)',40]],
    run:function(v){if(v.y<0)return '<div class="empty">Süreyi gir.</div>';var f=Math.pow(1+v.inf/100,v.y),realRate=((1+v.nom/100)/(1+v.inf/100)-1)*100;
      return res([['Bugünkü alım gücünü korumak için',TRY0.format(v.a*f),1],['Bugünkü tutarın o günkü değeri',TRY0.format(v.a/f)],['Reel getiri (yıllık)',(realRate>=0?'+%':'−%')+NUM2.format(Math.abs(realRate))],['Getiri sonrası reel değer',TRY0.format(v.a*Math.pow(1+v.nom/100,v.y)/f)]]);}},
  doviz:{name:'Döviz çevirici',fields:[['a','Tutar',1000]],ccy:true,
    run:function(v){var from=ui.cfrom||'USD',to=ui.cto||'TRY',rf=vRate(from),rt=rateOf(to);/* bozdurulan alış, alınan satış kuruyla */if(!(rf>0)||!(rt>0))return '<div class="empty">Bu kur için veri yok. Üstteki yenile düğmesine dokun.</div>';
      var out=v.a*rf/rt;return res([[NUM2.format(v.a)+' '+CCYS_SHORT[from],fmtC(out,to,1),1],['1 '+CCYS_SHORT[from],fmtC(rf/rt,to,1)]])+'<p class="small muted">Elindeki dövizi bozdururken alış, döviz alırken satış kuru kullanılır'+(S.fxTs?' ('+esc(fmtTs(S.fxTs))+')':'')+'.</p>';}}
};
Object.keys(CALCS).forEach(function(k){var f=CALCS[k].run;CALCS[k].run=function(v){var h='';try{h=f(v);}catch(e){h='';}
  if(!h||/NaN|Infinity|undefined/.test(String(h).replace(/<[^>]*>/g,' ')))return '<div class="empty">Değerleri kontrol et, sonuç hesaplanamadı.</div>';return h;};});
function vArac(){
  var key=CALCS[ui.calc]?ui.calc:'kredi',c=CALCS[key];if(!ui.cv[key]){ui.cv[key]={};c.fields.forEach(function(f){ui.cv[key][f[0]]=nv(f[2]);});}
  var h='<div class="calcseg">'+Object.keys(CALCS).map(function(k){return '<button class="chip" data-act="calc" data-v="'+k+'" aria-pressed="'+(k===key)+'">'+CALCS[k].name+'</button>';}).join('')+'</div>';
  h+='<div class="card"><div class="two" style="gap:12px">'+c.fields.map(function(f){return '<div class="field"><label for="c-'+f[0]+'">'+esc(f[1])+'</label><input id="c-'+f[0]+'" class="calc-in" data-k="'+f[0]+'" inputmode="decimal" value="'+esc(ui.cv[key][f[0]])+'"></div>';}).join('')
    +(c.ccy?'<div class="field"><label for="c-from">Kaynak</label>'+ccySel('c-from',ui.cfrom||'USD')+'</div><div class="field"><label for="c-to">Hedef</label>'+ccySel('c-to',ui.cto||'TRY')+'</div>':'')+'</div></div>';
  h+='<div class="card" id="calc-out">'+calcOut()+'</div>';return h;
}
function calcOut(){var key=CALCS[ui.calc]?ui.calc:'kredi',c=CALCS[key],v={},m=maskOn;c.fields.forEach(function(f){v[f[0]]=num(ui.cv[key][f[0]]);});maskOn=false;try{return c.run(v);}finally{maskOn=m;}}

function errList(){try{return JSON.parse(localStorage.getItem(ERRK)||'[]');}catch(e){return [];}}
function errInner(){var l=errList();
  return (l.length?'<div class="small">Son '+l.length+' kayıt; en yenisi '+esc(new Date(l[l.length-1].t).toLocaleString('tr-TR'))+'.</div><div class="two"><button class="btn ghost" data-act="err-copy">Kopyala</button><button class="btn ghost" data-act="err-clear">Temizle</button></div><div class="err" id="f-errlog"></div>':'<div class="small">Kayıtlı hata yok.</div>')
   +'<p class="small muted" style="margin:0">Uygulamada beklenmeyen bir hata olursa burada saklanır; bir sorun bildirirken kopyalayıp gönderebilirsin. Kayıt hiçbir yere kendiliğinden gönderilmez.</p>';}
ACT['err-copy']=function(){var t='Wallet '+VER+' hata kaydı\n'+errList().map(function(x){return new Date(x.t).toISOString()+' ['+x.k+'] '+x.m+(x.w?' @ '+x.w:'');}).join('\n');
  copyTxt(t).then(function(ok){msg(ok?'Kopyalandı.':'Kopyalanamadı.',ok,'f-errlog');});};
ACT['err-clear']=function(){try{localStorage.removeItem(ERRK);}catch(e){}render();};
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

/* ---------- render ---------- */
function pageInfo(){
  var p=ui.page;
  if(p.k==='fire')return {title:'Finansal özgürlük',body:vFire};
  if(p.k==='araclar')return {title:'Hesaplayıcılar',body:vArac};
  if(p.k==='piyasa')return {title:'Piyasalar',body:vPiyasa};
  if(p.k==='ayar')return {title:'Ayarlar',body:vAyarlar};
  if(p.k==='notlar')return {title:'Notlar',body:vNotlar};
  if(p.k==='set'&&p.s==='notlar')return {title:'Not ayarları',body:setNotlar};
  if(p.k==='set'){var sid=SETMAP[p.s]||p.s,s=SETS.filter(function(x){return x.id===sid;})[0]||SETS[SETS.length-1];return {title:s.t,body:function(){return setBody(s.id);}};}
  var n=p.id&&byId(S.notes,p.id);
  return {title:n&&n.trash?'Silinen not':'',body:vNote,btns:noteBtns};
}
function render(){RIN=true;try{render0();}finally{RIN=false;}}
function render0(){
  TXV++;
  /* eski Planlama sayfası artık Plan sekmesi */
  if(ui.page&&ui.page.k==='plan'){ui.page=null;ui.sub='plan';}
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
    hd.innerHTML='<button class="icon-btn" data-act="back" aria-label="Geri">'+ic('back')+'</button><h1>'+esc(P.title)+'</h1>'+(P.btns?'<span class="hbtns">'+P.btns()+'</span>':'');
    vw.innerHTML=P.body();
    var kb=document.getElementById('n-body');if(kb)kGrow(kb);
  }else{
    hd.innerHTML=tabHead();
    vw.innerHTML=vMain();
  }
  applyNoteColor();
  var tb=document.getElementById('tabbar');
  if(tb){tb.hidden=!!ui.page;document.body.classList.toggle('has-tb',!ui.page);
    if(!ui.page)tb.innerHTML='<div class="tbin">'+SECS.map(function(x){var on=ui.sub===x[0];return '<button data-act="sub" data-v="'+x[0]+'"'+(on?' aria-current="page"':'')+'>'+ic(x[2])+'<span>'+x[1]+'</span></button>';}).join('')+'</div>';}
  document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px');
  /* işlem eklemek her sekmeden tek dokunuş: ana sayfada büyük kart, diğer sekmelerde + düğmesi */
  var fb=document.getElementById('fab');fb.hidden=!!ui.page||ui.sub==='ev';document.body.classList.toggle('has-fab',!fb.hidden);
}
function persistUi(){try{localStorage.setItem(UIKEY,JSON.stringify({nv:ui.nv,plan:ui.plan,sv:ui.sv,an:ui.an}));}catch(e){}}
/* sekme başlığı: Ana Sayfa'da logo, ara ve uyarılar (4.15: sesle ekleme kaldırıldı, Notlar ana sayfadaki kısayolda); Hesaplar'da kur yenileme; ayarlar her sekmede sağdaki çark simgesinde.
   Uyarılar ana sayfadaki Gündem kartında (ayrı zil yok); tutarları gizleme ana sayfa ve Hesaplar kartındaki gözde. */
function tabHead(){
  var gear='<button class="icon-btn" data-act="open-settings" aria-label="Ayarlar" title="Ayarlar">'+ic('cog')+'</button>';
  var rf='<button class="icon-btn" id="rfb" data-act="refresh" aria-label="Yenile: güncel kurlar ve piyasalar" title="Yenile">'+ic('refresh')+'</button>';
  if(ui.sub==='ev')return '<h1><span class="logo" role="img" aria-label="Wallet logosu"></span>Wallet</h1><span class="hbtns"><button class="icon-btn" data-act="srch" aria-label="İşlemlerde ara" title="Ara">'+ic('search')+'</button>'+(function(){var n=alertItems().length;return '<button class="icon-btn bellb" data-act="alerts" aria-label="Uyarılar'+(n?': '+n:'')+'" title="Uyarılar">'+ic('bell')+(n?'<i class="badge">'+(n>9?'9+':n)+'</i>':'')+'</button>';})()+gear+'</span>';
  var t=(SECS.filter(function(x){return x[0]===ui.sub;})[0]||SECS[0])[1],cal=ui.txv==='cal';
  /* İşlemler: liste ↔ takvim (4.4'e kadar Analiz › Takvim) */
  var tv='<button class="icon-btn" id="txv" data-act="tx-view" aria-pressed="'+cal+'" aria-label="'+(cal?'Liste görünümü':'Takvim görünümü')+'" title="'+(cal?'Liste':'Takvim')+'">'+ic(cal?'list':'cal')+'</button>';
  return '<h1 class="tt">'+esc(t)+'</h1><span class="hbtns">'+(ui.sub==='servet'?rf:'')+(ui.sub==='islem'?tv:'')+gear+'</span>';
}
/* eski bölüm adları: Bütçe, Düzenli, Hedefler ve Koç Plan sekmesinin; Yatırımlar, Varlıklar, Borçlar Hesaplar sekmesinin alt sekmeleri */
function mapSec(s){if(s==='portfoy'||s==='varlik')s='yatirim';if(WEALTH.some(function(x){return x[0]===s;})){ui.sv=s;return 'servet';}
  if(s==='takvim'){ui.txv='cal';return 'islem';}
  if(PLANS.some(function(x){return x[0]===s;})){ui.plan=s;return 'plan';}if(s==='planlama')return 'plan';
  return SECS.some(function(x){return x[0]===s;})?s:'ev';}
function restoreUi(){
  try{var u=JSON.parse(localStorage.getItem(UIKEY)||'{}');
    if(PLANS.some(function(x){return x[0]===u.plan;}))ui.plan=u.plan;if(WEALTH.some(function(x){return x[0]===u.sv;}))ui.sv=u.sv;else if(u.sv==='varlik')ui.sv='yatirim';if(ANS.some(function(x){return x[0]===u.an;}))ui.an=u.an;
    if(u.nv==='arch'||u.nv==='trash')ui.nv=u.nv;}catch(e){}
  var h=(location.hash||'').slice(1);
  var IH={'yeni-gider':'exp','yeni-gelir':'inc','yeni-transfer':'trf','yeni-ses':'exp'};if(IH[h])ui.intent=IH[h];
  ui.page=pageFromHash(h);if(h==='planlama'||h==='koc')ui.sub='plan';if(h==='koc')ui.plan='koc';
  if(h&&!ui.page){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
}
/* adres çubuğundaki #… ile sayfa eşleşmesi (tarayıcı/telefon geri tuşu için) */
function pageFromHash(h){if(h==='fire')return {k:'fire'};if(h==='araclar')return {k:'araclar'};if(h==='piyasa')return {k:'piyasa'};if(h==='ayarlar')return {k:'ayar'};if(h==='notlar')return {k:'notlar'};if(/^ayar-[a-z]+$/.test(h)&&SETS.some(function(x){return x.id===h.slice(5);}))return {k:'set',s:h.slice(5)};if(/^ayar-/.test(h))return {k:'ayar'};return null;}
var TABH={islemler:'islem',hesaplar:'servet',analiz:'analiz',plan:'plan',anasayfa:'ev'};
function openPage(p,hash){closeSheet();if(ui.page&&ui.page!==p&&ui.page.k!==p.k){finishPage();p.prev=ui.page;}ui.page=p;try{if(hash)location.hash=hash;}catch(e){}render();window.scrollTo(0,0);}
function finishPage(){if(ui.page&&ui.page.k==='note')saveNote();}
function closePage(){finishPage();var p=ui.page;ui.page=(p&&p.prev)||null;render();try{if(location.hash.length>1)history.back();}catch(e){}}
function goSec(s){closeSheet();
  if(s==='notlar'){openPage({k:'notlar'},'notlar');return;}
  if(s==='ayar'||s==='ayarlar'){openPage({k:'ayar'},'ayarlar');return;}
  /* sayfadan sekmeye geçerken adresi yerinde temizle (history.back gecikmeli çalışıp sonraki sayfayı kapatmasın) */
  var from=ui.page?null:ui.sub,to=mapSec(s);if(ui.sub==='islem'&&to!=='islem')ui.tq='';
  if(ui.page){finishPage();ui.page=null;try{if(location.hash.length>1)history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  /* sekmeler arası geçişte her sekme kaldığı yerden açılır; aynı sekmeye yeniden dokununca başa döner */
  ui.scr=ui.scr||{};if(from)ui.scr[from]=window.scrollY||0;
  ui.sub=to;persistUi();render();window.scrollTo(0,from===to?0:(ui.scr[to]||0));}

/* ---------- alt pencereler (sheet) ---------- */
function openSheet(inner){document.getElementById('sheet-root').innerHTML='<div class="sheet-bg" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in">'+inner+'</div></div>';}
function closeSheet(){var r=document.getElementById('sheet-root');if(r)r.innerHTML='';}
function sheetOpen(){return !!document.getElementById('sheet-root').innerHTML;}
function opts(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}
function acctOpts(sel,none,skip){return (none?'<option value="">'+esc(none)+'</option>':'')+ACCS().filter(function(a){return a===sel||(!ax(a).arch&&!(skip&&skip(a)));}).map(function(a){return '<option value="'+esc(a)+'"'+(a===sel?' selected':'')+'>'+esc(a)+(ccyOf(a)!=='TRY'?' ('+CSYM[ccyOf(a)]+')':'')+'</option>';}).join('');}
function delBtn(act,id,label){return '<button class="btn danger" data-act="'+act+'" data-id="'+id+'">'+(label||'Sil')+'</button>';}
function armed(btn){if(btn.dataset.armed){return true;}btn.dataset.armed='1';btn.textContent='Emin misin? Tekrar dokun';return false;}
function ferr(m){var e=document.getElementById('f-err');if(e){e.textContent=m;e.style.color='var(--exp)';}}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function badName(n){return /^(__proto__|constructor|prototype)$/.test(n);}
var txType='exp',txOrig=null;
function lastSel(type,k,list){var l=S.last&&S.last[type];var v=l&&l[k];return list.indexOf(v)>=0?v:undefined;}
/* yeni işlemin hesabı: Ayarlar'daki sabit varsayılan; yoksa son kullanılan TL hesabı; dövizli hesap kendiliğinden seçilmez */
function defAcct(type){var acc=ACCS();if(acc.indexOf(S.defAcct)>=0)return S.defAcct;var l=lastSel(type,'acct',acc);if(l&&ccyOf(l)==='TRY')return l;
  var tl=acc.filter(function(a){return ccyOf(a)==='TRY';});return tl[0]||l||acc[0];}
function txSheet(id,force,pre){
  pre=pre||{};
  var t=id?byId(S.tx,id):null;
  if(t&&(t.type==='inv'||t.type==='dbt'||t.type==='adj'))return mvSheet(t);
  txOrig=t;txType=t?t.type:(force||'exp');ui.rcPend=null;ui.rcDel=false;rcFree();
  var acc=ACCS(),canTrf=acc.length>1;if(txType==='trf'&&!canTrf){toast('Transfer için en az iki hesap gerekli. Önce hesap ekle.');aSheet(null);return;}
  var cats=txType==='inc'?INCC():EXPC(),trf=txType==='trf';
  var a0=t?t.acct:(pre.acct&&acc.indexOf(pre.acct)>=0?pre.acct:defAcct(txType));
  var to0=(t&&t.to)||(pre.to&&acc.indexOf(pre.to)>=0&&pre.to!==a0?pre.to:acc.filter(function(a){return a!==a0;})[0]);
  openSheet('<h2>'+esc(t?'İşlemi düzenle':(pre.title||'Yeni işlem'))+'</h2><div class="seg" id="f-type"><button data-act="tx-type" data-v="exp" aria-pressed="'+(txType==='exp')+'">Gider</button><button data-act="tx-type" data-v="inc" aria-pressed="'+(txType==='inc')+'">Gelir</button>'+(canTrf?'<button data-act="tx-type" data-v="trf" aria-pressed="'+trf+'">Transfer</button>':'')+'</div>'+(!t&&!(pre.amt>0)?favRow('sheet'):'')
   +'<div class="field"><label for="f-amt" id="lb-amt">Tutar (₺)</label><input id="f-amt" class="amtin" inputmode="decimal" placeholder="0,00" value="'+(t?nv(t.amt):(pre.amt>0?nv(pre.amt):''))+'"></div>'
   +'<div class="field"><label for="f-note">Not</label><input id="f-note" list="note-dl" autocomplete="off" placeholder="İsteğe bağlı, örn. migros #tatil" value="'+esc(t?t.note:(pre.note||''))+'">'+noteDl(txType==='inc'?'inc':'exp')+'</div>'
   +'<div class="field" id="row-cat"'+(trf?' hidden':'')+'><span class="flbl">Kategori</span><select id="f-cat" hidden aria-hidden="true">'+(t&&!trf?optsKeep(cats,t.cat):opts(cats,pre.cat&&cats.indexOf(pre.cat)>=0?pre.cat:lastSel(txType,'cat',cats)))+'</select><div class="catchips" id="f-catchips" role="group" aria-label="Kategori"></div></div>'
   +'<div class="field" id="row-sub"'+(trf?' hidden':'')+'><span class="flbl">Alt kategori <span class="muted" style="font-weight:400">· isteğe bağlı</span></span><input type="hidden" id="f-sub" value="'+esc(t?(t.sub||''):(pre.sub||''))+'"><div class="catchips subchips" id="f-subchips" role="group" aria-label="Alt kategori"></div></div>'
   +'<div class="two"><div class="field"><label for="f-acct" id="lb-acct">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="f-acct">'+acctOpts(a0)+'</select></div><div class="field" id="row-to"'+(trf?'':' hidden')+'><label for="f-to">Giriş hesabı</label><select id="f-to">'+acctOpts(to0)+'</select></div></div>'
   +(t?'':'<div class="field" id="row-inst" hidden><label for="f-inst">Taksit</label><select id="f-inst"><option value="1">Tek çekim</option>'+[2,3,4,5,6,7,8,9,10,11,12].map(function(n){return '<option value="'+n+'">'+n+' taksit</option>';}).join('')+'</select><div class="small muted" style="margin-top:4px">Her ay bir taksit karta ve bütçeye yansır; kalanlar kendiliğinden işlenir.</div></div>')
   +'<div class="field" id="row-amt2" hidden><label for="f-amt2" id="lb-amt2">Giriş tutarı</label><input id="f-amt2" inputmode="decimal" placeholder="0,00"'+(t&&t.amt2?' data-manual="1"':'')+' value="'+(t&&t.amt2?nv(t.amt2):'')+'"></div>'
   +'<div class="field"><label for="f-date">Tarih</label><div class="datew"><input id="f-date" type="date" value="'+(t?t.date:(pre.date||todayS()))+'"><button class="chip" data-act="date-pick" data-v="0">Bugün</button><button class="chip" data-act="date-pick" data-v="1">Dün</button></div></div>'
   +rcField(t)
   +'<div class="balprev" id="f-bal" aria-live="polite"></div><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-tx" data-id="'+(t?t.id:'')+'">Kaydet</button>'+(t&&(t.type==='exp'||t.type==='inc')?'<button class="btn ghost" data-act="split-tx" data-id="'+t.id+'">Böl (birden çok kategori)</button>':'')+(t?'<button class="btn ghost" data-act="dup-tx" data-id="'+t.id+'">Bugüne kopyala</button>'+delBtn('del-tx',t.id):''));
  catChips();dateChips();syncCcy();rcFill(t);
  if(!t)setTimeout(function(){var e=document.getElementById('f-amt');if(e)e.focus();},60);
}
/* kategoriler tek dokunuşla: en çok kullanılanlar önde; gizli seçim kutusuyla eşlenir */
function catOrder(type,list){var c={},from=new Date(today0());from.setDate(from.getDate()-120);var fs=isoDate(from);S.tx.forEach(function(t){if(t.type===type&&t.date>=fs)c[t.cat]=(c[t.cat]||0)+1;});
  return list.map(function(x,i){return [x,i];}).sort(function(a,b){return ((c[b[0]]||0)-(c[a[0]]||0))||a[1]-b[1];}).map(function(x){return x[0];});}
function catChips(){var sel=document.getElementById('f-cat'),box=document.getElementById('f-catchips');if(!sel||!box)return;
  var list=Array.prototype.map.call(sel.options,function(o){return o.value;}),ord=catOrder(txType,list);
  box.innerHTML=ord.map(function(c){return '<button class="chip" data-act="cat-pick" data-v="'+esc(c)+'" aria-pressed="'+(sel.value===c)+'">'+cic(c,'xs')+esc(c)+'</button>';}).join('')
   +'<button class="chip catnew" data-act="cat-new-in" aria-label="Yeni kategori ekle">'+ic('plus')+'Yeni</button>';subChips();}
/* alt kategori çipleri: seçili kategorinin alt kategorileri; seçiliye yeniden dokununca kalkar */
function subChips(){var sel=document.getElementById('f-cat'),box=document.getElementById('f-subchips'),inp=document.getElementById('f-sub'),row=document.getElementById('row-sub');if(!sel||!box||!inp)return;
  var c=sel.value,l=subsOf(c).slice();if(inp.value&&l.indexOf(inp.value)<0){if(txOrig&&txOrig.cat===c&&txOrig.sub===inp.value)l.push(inp.value);else inp.value='';}
  if(row)row.hidden=txType==='trf';
  box.innerHTML=l.map(function(x){return '<button class="chip" data-act="sub-pick" data-v="'+esc(x)+'" aria-pressed="'+(inp.value===x)+'">'+esc(x)+'</button>';}).join('')
   +'<button class="chip catnew" data-act="sub-new-in" aria-label="'+esc(c)+' için alt kategori ekle">'+ic('plus')+(l.length?'Yeni':'Alt kategori ekle')+'</button>';}
ACT['sub-pick']=function(el,id,v){var i=document.getElementById('f-sub');if(!i)return;i.value=i.value===v?'':v;subChips();};
ACT['sub-new-in']=function(){var box=document.getElementById('f-subchips'),c=box&&box.querySelector('.catnew');if(!c||document.getElementById('ns-in'))return;
  c.outerHTML='<span class="catin"><input id="ns-in" placeholder="Alt kategori adı" aria-label="Yeni alt kategori adı" maxlength="30" autocomplete="off"><button class="btn small" data-act="sub-new-ok">Ekle</button></span>';
  var i=document.getElementById('ns-in');if(i)i.focus();};
ACT['sub-new-ok']=function(){var i=document.getElementById('ns-in'),n=i?i.value.trim().replace(/\s+/g,' '):'',c=val('f-cat');if(!n||badName(n)||!c){if(i)i.focus();return;}
  S.subs[c]=subsOf(c);if(S.subs[c].indexOf(n)<0){S.subs[c].push(n);save();}var f=document.getElementById('f-sub');if(f)f.value=n;subChips();toast(c+' › '+n+' eklendi');};
/* işlem penceresinden yeni kategori: ayarlara gitmeden */
ACT['cat-new-in']=function(){var box=document.getElementById('f-catchips'),c=box&&box.querySelector('.catnew');if(!c||document.getElementById('nc-in'))return;
  c.outerHTML='<span class="catin"><input id="nc-in" placeholder="Kategori adı" aria-label="Yeni kategori adı" maxlength="30" autocomplete="off"><button class="btn small" data-act="cat-new-ok">Ekle</button></span>';
  var i=document.getElementById('nc-in');if(i)i.focus();};
ACT['cat-new-ok']=function(){var i=document.getElementById('nc-in'),n=i?i.value.trim():'',type=txType==='inc'?'inc':'exp';if(!n||badName(n)){if(i)i.focus();return;}
  if(S.cats[type].indexOf(n)<0){S.cats[type].push(n);save();}
  var sel=document.getElementById('f-cat');if(!sel)return;if(!Array.prototype.some.call(sel.options,function(o){return o.value===n;}))sel.insertAdjacentHTML('beforeend','<option>'+esc(n)+'</option>');
  sel.value=n;sel.dataset.manual='1';catChips();toast(n+' kategorisi eklendi');};
function syncCatChips(){var sel=document.getElementById('f-cat');if(!sel)return;subChips();document.querySelectorAll('#f-catchips .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===sel.value));});}
function dateChips(){var d=val('f-date'),t0=todayS(),y=new Date(today0());y.setDate(y.getDate()-1);var ys=isoDate(y);document.querySelectorAll('[data-act="date-pick"]').forEach(function(b){b.setAttribute('aria-pressed',String((b.dataset.v==='0'&&d===t0)||(b.dataset.v==='1'&&d===ys)));});}
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
  var c=ccyOf(a.value),ai=document.getElementById('f-amt');lb.textContent='Tutar ('+CSYM[c]+')';
  /* dövizli hesap belirgin: TL alışkanlığıyla yanlış birimde tutar girilmesin */
  if(c!=='TRY'){var bx=document.createElement('span');bx.className='ccyb';bx.textContent=(CCYN[c]||c)+' · '+a.value;lb.appendChild(document.createTextNode(' '));lb.appendChild(bx);}
  if(ai)ai.classList.toggle('fxamt',c!=='TRY');
  var ri=document.getElementById('row-inst');if(ri)ri.hidden=!(txType==='exp'&&acctType(a.value)==='kart');
  var row=document.getElementById('row-amt2'),to=document.getElementById('f-to');
  var cross=txType==='trf'&&to&&ccyOf(to.value)!==c;
  if(row){row.hidden=!cross;if(cross){document.getElementById('lb-amt2').textContent='Giriş tutarı ('+CSYM[ccyOf(to.value)]+')';var i2=document.getElementById('f-amt2'),v1=num(val('f-amt'));if(i2&&!i2.dataset.manual&&v1>0&&rateOf(c)>0&&rateOf(ccyOf(to.value))>0)i2.value=nv(r2(v1*rateOf(c)/rateOf(ccyOf(to.value))));}}
  balPreview();
}
/* borç, yatırım ve düzeltme hareketleri için sade düzenleme penceresi */
function mvSheet(t){
  txOrig=t;txType=t.type;
  var info=t.type==='inv'?'Varlığın adedi ve maliyeti Hesaplar › Yatırımlar’dan değişir; burada yalnızca hesaba yansıyan tutar düzenlenir.':(t.type==='dbt'?(t.side==='out'?'Bu ödeme borcun kalan tutarından düşülür.':'Borç olarak alınan para hesaba eklenmiştir.'):'Hesap bakiyesini gerçek bakiyeyle eşitlemek için eklenen düzeltme. Artı ya da eksi olabilir.');
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
  /* alt kategori kırılımı: alt kategorisi olan işlem varsa çubuklarla */
  var bySub={},subH='';l.forEach(function(t){var x=t.sub||'';bySub[x]=(bySub[x]||0)+txTL(t);});var sk=Object.keys(bySub);
  if(sk.length>1||(sk.length===1&&sk[0])){var st=sk.reduce(function(a,x){return a+bySub[x];},0);subH='<div class="subbrk">'+sk.sort(function(a,b){return bySub[b]-bySub[a];}).map(function(x){var p=st>0?bySub[x]/st*100:0;return '<div class="sb"><div class="sbt"><span class="ell">'+esc(x||'Alt kategorisiz')+'</span><span class="num">'+TRY0.format(bySub[x])+' · %'+Math.round(p)+'</span></div><div class="bar"><i style="width:'+p.toFixed(1)+'%;background:'+color(c)+'"></i></div></div>';}).join('')+'</div>';}
  openSheet('<div class="ghead">'+cic(c,'lg')+'<h2 style="margin:0;flex:1">'+esc(c)+'</h2></div><div><div class="lbl">'+esc(plabel(k))+'</div><p class="big" style="margin:0">'+TRY0.format(tot||inc)+'</p>'+(info.length?'<div class="small muted">'+esc(info.join(' · '))+'</div>':'')+'</div>'+subH
   +(l.length?'<div class="list">'+l.map(txRow).join('')+'</div>':'<div class="small muted">Bu dönemde bu kategoride işlem yok.</div>')
   +'<button class="btn ghost" data-act="cat-new" data-v="'+esc(c)+'">Bu kategoriye ekle</button>');
}
function grpAccts(kind){return ACCS().filter(function(a){return acctType(a)===kind;});}
/* hesap detayı: bakiye, son hareketler ve hızlı işlemler */
function acctSheet(a){
  if(ACCS().indexOf(a)<0)return;
  var b=acctBal(a),t=acctType(a),c=ccyOf(a),x=ax(a),recent=S.tx.filter(function(q){return q.acct===a||q.to===a;}).sort(function(p,q){return q.date.localeCompare(p.date);}).slice(0,6);
  var extra=[],cs=null;if(c!=='TRY'&&rateOf(c)>0)extra.push('≈ '+TRY0.format(toTL(b,a)));if(t==='kart'){if(+x.limit>0)extra.push('Limit '+moneyIn(+x.limit,a,1)+' · kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)extra.push('Son ödeme günü: ayın '+x.due+sfx(x.due));cs=cardStmt(a);}if(aRate(a)){var ai=aIntNow(a);extra.push('Yıllık %'+NUM2.format(aRate(a))+' faiz · bu ay ≈ '+moneyIn(ai,a)+' birikti (ay sonunda işlenir)');}
  var ab=function(act,icn,lb){return '<button data-act="'+act+'" data-id="'+esc(a)+'"><span class="c" style="--c:var(--accent)">'+ic(icn)+'</span><span class="t">'+lb+'</span></button>';};
  openSheet('<div class="ghead"><span class="sic" style="--c:'+color(a)+'">'+ic(t==='nakit'?'cash':(t==='kart'?'card':(t==='birikim'?'coins':'bank')))+'</span><span class="mid"><h2 style="margin:0">'+esc(a)+'</h2><div class="small muted">'+esc(typeName(t)+(c!=='TRY'?' · '+CCYN[c]:''))+'</div></span><button class="icon-btn" data-act="edit-a" data-id="'+esc(a)+'" aria-label="Hesabı düzenle">'+ic('gear')+'</button></div>'
   +'<div><div class="lbl">'+(t==='kart'&&b<0?'Kart borcu':'Bakiye')+'</div><p class="big'+(b<0?' exp':'')+'" style="margin:0">'+moneyIn(t==='kart'&&b<0?-b:b,a)+'</p>'+(extra.length?'<div class="small muted">'+esc(extra.join(' · '))+'</div>':'')+(t==='kart'&&cs?'<div class="stmt"><div><span class="small muted">'+(cs.first?'Açılıştaki borç':'Ekstre ('+esc(pdate(cs.cut).toLocaleDateString('tr-TR',{day:'numeric',month:'short'}))+')')+'</span><b class="'+(cs.left>0?'exp':'')+'">'+moneyIn(cs.left,a,1)+'</b>'+(cs.left<cs.stmt?'<span class="small muted">'+moneyIn(cs.stmt,a,1)+' ekstrenin kalanı</span>':'')+'</div><div><span class="small muted">Son ödeme</span><b>'+(cs.due?esc(pdate(cs.due).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})):'—')+'</b></div><div><span class="small muted">Sonraki ekstreye</span><b>'+moneyIn(cs.since,a,1)+'</b></div><div><span class="small muted">Asgari ödeme</span><b>'+moneyIn(r2(cs.left*((+x.limit>0&&+x.limit>FACTS.minpay.lim)?FACTS.minpay.hi:FACTS.minpay.lo)/100),a,1)+'</b></div></div>':'')+'</div>'
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
   +'<button class="row-tgl" id="rc-mode" data-act="rc-mode" role="switch" aria-checked="false"><span class="mid"><div class="t">Farkı gelir/gider olarak kaydet</div><div class="small muted">Kapalıyken (önerilen) yalnızca bakiye düzeltilir; fark gelir-gider raporlarına ve bütçeye girmez</div></span><span class="sw"></span></button>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="rc-save" data-id="'+esc(a)+'">Eşitle</button>');
}
function debtListSheet(){
  if(!S.debts.length)return dSheet(null);
  var tot=debtManual(),cd=wealth().g.cardDebt;
  openSheet('<h2>Borçlarım</h2><div><div class="lbl">Kalan borç</div><p class="big exp" style="margin:0">'+TRY0.format(tot+cd)+'</p>'+(cd>0?'<div class="small muted">Kredi kartı borçları '+TRY0.format(cd)+' dahil</div>':'')+'</div><div class="list">'+S.debts.map(function(d){var l=debtLeft(d);return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="small muted">'+esc(d.type)+'</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div><button class="btn" data-act="new-d">Borç ekle</button><p class="small muted" style="margin:0">Ödeme yapmak için borca dokun.</p>');
}
function dSheet(id){
  var d=id?byId(S.debts,id):null,left=d?debtLeft(d):0,paid=d?debtPaid(d):0;
  /* faiz oranı biliniyorsa bir taksidin önerilen bölünmesi */
  var rc0=d&&S.recurring.filter(function(r){return r.debt===d.id;})[0],P0=d?(rc0?toTL(+rc0.amt||0,rc0.acct):loanPmt(d,+d.n)):0,sp0=d&&+d.rate>0&&P0>0?loanSplit(d,P0):null;
  var pay=d&&left>0?'<div class="card stack" style="gap:10px;background:var(--bg)"><h2 style="margin:0">Ödeme yap</h2><div class="two"><div class="field"><label for="dp-amt">Anapara (₺)</label><input id="dp-amt" inputmode="decimal" placeholder="'+(sp0?'≈ '+NUM2.format(sp0.p):'Örn. '+nv(Math.min(left,5000)))+'"></div><div class="field"><label for="dp-int">Faiz ve masraf (₺)</label><input id="dp-int" inputmode="decimal" placeholder="'+(sp0?'≈ '+NUM2.format(sp0.i):'Varsa')+'"></div></div><div class="two"><div class="field"><label for="dp-acct">Ödeme hesabı</label><select id="dp-acct">'+acctOpts(grpAccts('banka')[0]||defAcct('exp'))+'</select></div><div class="field"><label for="dp-date">Tarih</label><input id="dp-date" type="date" value="'+todayS()+'"></div></div><div class="err" id="f-err2"></div><button class="btn" data-act="pay-d" data-id="'+d.id+'">Ödemeyi kaydet</button><p class="small muted" style="margin:0">Anapara borçtan düşer; faiz ve masraf gider olarak kaydedilir. İkisi de hesabından çıkar.</p></div>':'';
  openSheet('<h2>'+(d?'Borç: '+esc(d.name):'Borç ekle')+'</h2>'+(d?'<div class="row3" style="margin:0"><div><div class="lbl">Toplam</div><span class="num">'+TRY0.format(d.amt)+'</span></div><div><div class="lbl">Ödenen</div><span class="num inc">'+TRY0.format(paid)+'</span></div><div><div class="lbl">Kalan</div><span class="num exp">'+TRY0.format(left)+'</span></div></div><div class="bar"><i style="width:'+(d.amt>0?clamp(paid/d.amt*100,0,100):0)+'%"></i></div>':'')+pay
   +'<div class="field"><label for="d-name">Ad</label><input id="d-name" placeholder="Örn. Taşıt kredisi" value="'+esc(d?d.name:'')+'"></div><div class="two"><div class="field"><label for="d-type">Tür</label><select id="d-type">'+optsKeep(DTYPES,d&&d.type)+'</select></div><div class="field"><label for="d-amt">'+(d?'Toplam borç (₺)':'Kalan borç (₺)')+'</label><input id="d-amt" inputmode="decimal" value="'+(d?nv(d.amt):'')+'"></div></div>'
   +'<div class="field"><label for="d-rate">Aylık faiz oranı (%)</label><input id="d-rate" inputmode="decimal" placeholder="İsteğe bağlı, örn. 3,5" value="'+(d&&+d.rate>0?nv(d.rate):'')+'"><div class="small muted" style="margin-top:4px">Koç, hangi borcu önce kapatman gerektiğini buna göre hesaplar. Sözleşmedeki aylık akdi faizi yaz.</div></div>'
   +'<div class="two"><div class="field"><label for="d-n">Kalan vade (ay)</label><input id="d-n" inputmode="numeric" maxlength="3" placeholder="İsteğe bağlı" value="'+(d&&+d.n>0?d.n:'')+'"></div><div class="field"><label for="d-tax">KKDF + BSMV (%)</label><input id="d-tax" inputmode="decimal" placeholder="'+(d&&d.type!=='Kredi'?'0':'30')+'" value="'+(d&&d.tax!=null&&d.tax!==''?nv(d.tax):'')+'"></div></div>'
   +(d?loanPlanHtml(d):'')
   +(d?'':'<div class="field"><label for="d-acct">Para bir hesaba girdi mi?</label><select id="d-acct">'+acctOpts('', 'Hayır, eski borç')+'</select></div><p class="small muted" style="margin:0">Yeni çektiğin kredi ya da aldığın borç para bir hesaba yattıysa seç: o hesabın bakiyesi artar, net servetin değişmez.</p>')
   +'<div class="err" id="f-err"></div><button class="btn'+(d?' ghost':'')+'" data-act="save-d" data-id="'+(d?d.id:'')+'">'+(d?'Bilgileri kaydet':'Kaydet')+'</button>'+(d?delBtn('del-d',d.id,'Borcu sil'):''));
}
function hSheet(id,kind,pre){
  var x=id?byId(S.holdings,id):null;kind=x?hKind(x):(kind==='asset'?'asset':'inv');pre=pre||{};
  if(kind==='asset'){
    openSheet('<h2>'+(x?'Varlığı düzenle':'Varlık ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Ev, araba" value="'+esc(x?x.name:'')+'"></div>'
     +'<div class="two"><div class="field"><label for="h-type">Tür</label><select id="h-type">'+optsKeep(ASTT,x&&x.type)+'</select></div><div class="field"><label for="h-price">Güncel değer (₺)</label><input id="h-price" inputmode="decimal" value="'+(x?nv(x.price):'')+'"></div></div>'
     +'<div class="field"><label for="h-cost">Alış değeri (₺)</label><input id="h-cost" inputmode="decimal" placeholder="Bilmiyorsan boş bırak" value="'+(x&&x.cost!==x.price?nv(x.cost):'')+'"></div>'
     +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div>')
     +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="asset">Kaydet</button>'+(x?'<button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button>'+delBtn('del-h',x.id):''));
    return;
  }
  var mkk=x?x.mk:pre.mk,cc0=x?x.ccy:(pre.ccy||''),mkp=mkk?mTL(mkk):0;
  var co='<option value=""'+(cc0||mkk?'':' selected')+'>Elle girilen fiyat</option>'+(mkk?'<option value="mk:'+esc(mkk)+'" selected>Piyasa: '+esc((x&&x.mks)||mSym(mkk))+'</option>':'')+FXK.map(function(k){return '<option value="'+k+'"'+(!mkk&&cc0===k?' selected':'')+'>'+FXL[k]+' kuru</option>';}).join('');
  openSheet('<h2>'+(x?'Yatırımı düzenle':'Yatırım ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Gram altın, THYAO" value="'+esc(x?x.name:(pre.name||''))+'"></div>'
   +'<div class="two"><div class="field"><label for="h-type">Tür</label><select id="h-type">'+optsKeep(INVT,x?x.type:pre.type)+'</select></div><div class="field"><label for="h-ccy">Fiyat kaynağı</label><select id="h-ccy">'+co+'</select></div></div>'
   +(mkk&&mkp>0?'<div class="small muted" id="h-mkp">Güncel piyasa fiyatı: <b class="num">'+TRY2.format(mkp)+'</b></div>':'')
   +'<div class="two"><div class="field"><label for="h-qty" id="lb-hqty">Adet / miktar</label><input id="h-qty" inputmode="decimal" value="'+(x?nv(x.qty):'')+'"></div><div class="field"><label for="h-cost">Ortalama maliyet (₺)</label><input id="h-cost" inputmode="decimal" placeholder="'+(mkp>0?'Boşsa güncel fiyat':'')+'" value="'+(x?nv(x.cost):'')+'"></div></div>'
   +'<div class="field" id="row-hprice"><label for="h-price">Güncel fiyat (₺)</label><input id="h-price" inputmode="decimal" placeholder="Boş bırakırsan maliyet kullanılır" value="'+(x?nv(x.price):'')+'"></div>'
   +yFields(x,x?x.type:pre.type)
   +(x&&!x.mk?'<button class="btn ghost small" data-act="m-linkmode" data-id="'+x.id+'">'+ic('pulse')+' Fiyatı piyasadan al (hisse, fon, kripto…)</button>':'')
   +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div><p class="small muted" style="margin:0" id="h-hint"></p>'+(mkk?'':'<p class="small muted" style="margin:0">Hisse, fon ya da kripto fiyatının kendiliğinden güncellenmesi için <button class="pill linkp" data-act="open-mkt">Piyasalar’da ara</button> ve oradan ekle.</p>'))
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="inv">Kaydet</button>'+(x?'<div class="two"><button class="btn ghost" data-act="h-buy" data-id="'+x.id+'">Al</button><button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></div>'+delBtn('del-h',x.id):''));
  syncH();
}
function autoSrc(){var t=val('h-type'),s=document.getElementById('h-ccy');if(!s||(s.value&&s.value.indexOf('mk:')!==0&&s.dataset.auto!=='1'))return;if(s.value.indexOf('mk:')===0)return;
  var n=fold(val('h-name')),c='';if(t==='Altın')c=/ceyrek/.test(n)?'CEY':'XAU';else if(t==='Gümüş')c='XAG';else if(t==='Döviz')c=/euro|eur\b|avro/.test(n)?'EUR':(/sterlin|gbp|pound/.test(n)?'GBP':(/frank|chf/.test(n)?'CHF':'USD'));
  if(c){s.value=c;s.dataset.auto='1';syncH();}else if(s.dataset.auto==='1'){s.value='';delete s.dataset.auto;syncH();}}
function syncH(){ySync();var c=val('h-ccy'),r=document.getElementById('row-hprice'),q=document.getElementById('lb-hqty'),mp=document.getElementById('h-mkp');if(r)r.hidden=!!c;if(mp)mp.hidden=c.indexOf('mk:')!==0;if(q)q.textContent=({XAU:'Miktar (gram)',XAG:'Miktar (gram)',CEY:'Adet',USD:'Miktar ($)',EUR:'Miktar (€)',GBP:'Miktar (£)',CHF:'Miktar (CHF)'})[c]||'Adet / miktar';
  var hh=document.getElementById('h-hint');if(hh){var qn=num(val('h-qty')),cs=num(val('h-cost'));hh.textContent=val('h-acct')&&qn>0&&cs>0?'Seçtiğin hesaptan '+TRY2.format(qn*cs)+' düşülecek.':'';}}
function tradeSheet(id,side){
  var x=byId(S.holdings,id);if(!x)return;var ast=hKind(x)==='asset',p=side==='buy'&&x.ccy&&!x.mk&&rateOf(x.ccy)>0?rateOf(x.ccy):hPrice(x),ta=ACCS().filter(function(a){return !ax(a).arch&&acctType(a)!=='kart'&&ccyOf(a)==='TRY';}),ta0=ta.filter(function(a){return acctType(a)==='banka';})[0]||ta[0]||defAcct('exp');
  openSheet('<h2>'+esc(x.name)+' · '+(side==='buy'?'Al':'Sat')+'</h2><div class="small muted">Elindeki: '+(ast?'1 adet':qtyTxt(x))+' · ort. maliyet '+TRY2.format(x.cost)+' · güncel '+TRY2.format(p)+'</div>'
   +'<div class="two">'+(ast?'':'<div class="field"><label for="tr-qty">Miktar</label><input id="tr-qty" inputmode="decimal" value="'+(side==='sell'?nv(x.qty):'')+'"></div>')+'<div class="field"><label for="tr-price">'+(ast?'Satış tutarı (₺)':'Birim fiyat (₺)')+'</label><input id="tr-price" inputmode="decimal" value="'+nv(r2(p))+'"></div>'+(ast?'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>':'')+'</div>'
   +'<div class="two"><div class="field"><label for="tr-acct">'+(side==='buy'?'Ödeme hesabı':'Paranın gireceği hesap')+'</label><select id="tr-acct">'+acctOpts(ta0,'Hesaba yansıtma')+'</select></div>'+(ast?'':'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>')+'</div>'
   +(ast?'':'<div class="field"><label for="tr-fee">Komisyon ve masraf (₺)</label><input id="tr-fee" inputmode="decimal" placeholder="Varsa, örn. 12,50"></div>')
   +'<div class="balprev" id="tr-prev"></div><div class="err" id="f-err"></div><button class="btn" data-act="trade" data-id="'+x.id+'" data-v="'+side+'">'+(side==='buy'?'Alımı kaydet':'Satışı kaydet')+'</button>');
  tradePrev();
}
function tradePrev(){var box=document.getElementById('tr-prev');if(!box)return;var btn=document.querySelector('[data-act="trade"]'),x=btn&&byId(S.holdings,btn.dataset.id);if(!x)return;
  var ast=hKind(x)==='asset',q=ast?1:num(val('tr-qty')),p=num(val('tr-price')),f=Math.max(num(val('tr-fee')),0),side=btn.dataset.v;if(!(q>0&&p>0)){box.textContent='';return;}
  var m=maskOn;maskOn=false;try{var pl=(p-x.cost)*q-f;box.innerHTML=(side==='sell'?'Hesaba girecek':'Hesaptan çıkacak')+': <b class="num">'+TRY2.format(side==='sell'?q*p-f:q*p+f)+'</b>'+(side==='sell'?' · Kâr/zarar: <b class="num '+(pl>=0?'inc':'exp')+'">'+sgn(pl)+'</b>':' · Yeni ort. maliyet: <b class="num">'+TRY2.format((x.qty*x.cost+q*p+f)/(x.qty+q))+'</b>');}finally{maskOn=m;}}
function gSheet(id,pre){
  var g=id?byId(S.goals,id):null,ae=avgMonthly('exp'),em=g?isEm(g):!!(pre&&pre.em),nm=g?g.name:(em?'Acil durum fonu':''),tg=g?nv(g.target):(em&&ae>0?nv(Math.ceil(ae*6/1000)*1000):'');
  openSheet('<h2>'+(g?'Hedefi düzenle':'Yeni hedef')+'</h2><div class="field"><label for="g-name">Ad</label><input id="g-name" placeholder="Örn. Yaz tatili" value="'+esc(nm)+'"></div><div class="two"><div class="field"><label for="g-target">Hedef tutar (₺)</label><input id="g-target" inputmode="decimal" value="'+tg+'"></div><div class="field" id="row-gsaved"><label for="g-saved">Biriken (₺)</label><input id="g-saved" inputmode="decimal" value="'+(g?nv(g.saved||0):'0')+'"></div></div>'
   +'<div class="two"><div class="field"><label for="g-acct">Bağlı hesap</label><select id="g-acct">'+acctOpts(g?g.acct||'':'','Yok, elle takip et',function(a){return acctType(a)==='kart';})+'</select></div><div class="field"><label for="g-date">Hedef tarih</label><input id="g-date" type="date" value="'+(g&&g.date?g.date:'')+'"></div></div><label class="chk"><input type="checkbox" id="g-em"'+(em?' checked':'')+'> Bu benim acil durum fonum</label>'+(ae>0?'<p class="small muted" style="margin:0">Acil durum fonu için önerilen: 6 aylık gider, yaklaşık '+TRY0.format(ae*6)+'. Finansal sağlıktaki gösterge bu hedefin birikimini kullanır.</p>':'')+'<p class="small muted" style="margin:0">Bir birikim hesabı bağlarsan biriken tutar o hesabın bakiyesinden gelir; para eklemek hesaplar arası transfer olur.</p><div class="err" id="f-err"></div><button class="btn" data-act="save-g" data-id="'+(g?g.id:'')+'">Kaydet</button>'+(g?delBtn('del-g',g.id):''));
  syncG();
}
function syncG(){var r=document.getElementById('row-gsaved');if(r)r.hidden=!!val('g-acct');}
function gaddSheet(id){
  var g=byId(S.goals,id);if(!g)return;var linked=g.acct&&ACCS().indexOf(g.acct)>=0;
  openSheet('<h2>'+esc(g.name)+' · para ekle</h2><div class="small muted">Biriken '+TRY0.format(goalSaved(g))+' / '+TRY0.format(g.target)+'</div><div class="field"><label for="ga-amt">Tutar (₺)</label><input id="ga-amt" inputmode="decimal" placeholder="0,00"></div>'
   +(linked?'<div class="field"><label for="ga-from">Hangi hesaptan</label><select id="ga-from">'+acctOpts(ACCS().filter(function(a){return a!==g.acct&&!ax(a).arch;})[0],null,function(a){return a===g.acct;})+'</select></div><p class="small muted" style="margin:0">'+esc(g.acct)+' hesabına transfer yapılır.</p>':'<p class="small muted" style="margin:0">Bu hedef elle takip ediliyor; hesap bakiyeleri değişmez. Bir birikim hesabına bağlamak için hedefi düzenle.</p>')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="ga-save" data-id="'+g.id+'">Ekle</button>');
  setTimeout(function(){var e=document.getElementById('ga-amt');if(e)e.focus();},60);
}
function birSheet(){
  var sa=grpAccts('birikim'),tot=r2(sa.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
  if(!S.goals.length&&!sa.length)return gSheet(null);
  openSheet('<h2>Birikim</h2>'+(sa.length?'<div><div class="lbl">Birikim hesaplarında</div><p class="big" style="margin:0">'+TRY0.format(tot)+'</p></div><div class="list">'+sa.map(acctLine).join('')+'</div>':'')
   +(S.goals.length?'<div class="lbl">Hedefler</div><div class="list">'+S.goals.map(function(g){var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;return '<div class="item"><button class="mid plain" data-act="edit-g" data-id="'+g.id+'" aria-label="'+esc(g.name)+' hedefini düzenle ya da sil"><div class="t">'+esc(g.name)+(isEm(g)?' <span class="small muted">· acil durum fonu</span>':'')+'</div><div class="bar" style="margin:6px 0 2px"><i style="width:'+p+'%"></i></div><div class="small muted num">'+TRY0.format(s)+' / '+TRY0.format(g.target)+' · düzenle</div></button><button class="btn small ghost" data-act="goal-add" data-id="'+g.id+'">Ekle</button></div>';}).join('')+'</div>':'')
   +'<div class="two"><button class="btn" data-act="new-g">Yeni hedef</button><button class="btn ghost" data-act="new-a" data-v="birikim">Birikim hesabı</button></div>');
}
/* kredi ödeme planı: bağlı taksit (ya da vadeden hesaplanan taksit) ile ay ay faiz, anapara, kalan */
function loanPlanHtml(d){if(!(+d.rate>0)||!(debtLeft(d)>0))return '';
  var rc=S.recurring.filter(function(r){return r.debt===d.id;})[0],P=rc?toTL(+rc.amt||0,rc.acct):loanPmt(d,+d.n);if(!(P>0))return '<p class="small muted" style="margin:0">Kalan vadeyi yazarsan aylık taksit ve ödeme planı hesaplanır.</p>';
  var pl=loanPlan(d,P);if(pl.never)return '<p class="small exp" style="margin:0">'+TRY0.format(P)+' taksit bu borcun aylık faizini bile karşılamıyor; borç azalmaz.</p>';
  var ti=pl.reduce(function(a,x){return a+x.i;},0),end=new Date();end.setMonth(end.getMonth()+pl.length);
  return '<details class="card" style="background:var(--bg)"><summary><b>Ödeme planı</b><span class="small muted"> · '+pl.length+' taksit · '+TRY0.format(P)+'</span></summary>'
   +'<div class="small" style="margin:8px 0">Kalan toplam faiz ve vergi ≈ <b>'+TRY0.format(ti)+'</b> · son taksit ≈ '+esc(end.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}))+'</div>'
   +'<div class="tblw"><table class="tbl"><thead><tr><th>#</th><th>Faiz+vergi</th><th>Anapara</th><th>Kalan</th></tr></thead><tbody>'+pl.slice(0,12).map(function(x){return '<tr><td>'+x.n+'</td><td class="num">'+TRY0.format(x.i)+'</td><td class="num">'+TRY0.format(x.p)+'</td><td class="num">'+TRY0.format(x.left)+'</td></tr>';}).join('')+'</tbody></table></div>'
   +(pl.length>12?'<div class="small muted">İlk 12 taksit gösteriliyor.</div>':'')
   +(rc?'<div class="small muted" style="margin-top:6px">“'+esc(rc.name)+'” ödendi işaretlenince taksit bu plana göre anapara ve faiz+vergi olarak ayrılır.</div>':'<button class="btn small" style="margin-top:8px" data-act="loan-rec" data-id="'+d.id+'">Taksiti düzenli ödeme olarak ekle</button>')+'</details>';}
function rSheet(id){
  var r=id?byId(S.recurring,id):null,a0=r?r.acct:defAcct('exp'),inc=!!(r&&r.inc),wk=r&&isWk(r)?(+r.wk===2?2:1):0,ev=wk?'w'+wk:String(r?(+r.every||1):1);
  var evo=[['w1','Her hafta'],['w2','2 haftada bir'],['1','Her ay'],['2','2 ayda bir'],['3','3 ayda bir'],['6','6 ayda bir'],['12','Yılda bir']].map(function(x){return '<option value="'+x[0]+'"'+(x[0]===ev?' selected':'')+'>'+x[1]+'</option>';}).join('');
  openSheet('<h2>'+(r?'Düzenli kalemi düzenle':'Yeni düzenli ödeme ya da gelir')+'</h2>'
   +'<div class="field"><label for="r-kind">Tür</label><select id="r-kind"><option value="exp"'+(inc?'':' selected')+'>Ödeme (fatura, kira, taksit, abonelik)</option><option value="inc"'+(inc?' selected':'')+'>Gelir (maaş, kira geliri)</option></select></div>'
   +'<div class="field"><label for="r-name">Ad</label><input id="r-name" placeholder="'+(inc?'Örn. Maaş':'Örn. İnternet faturası')+'" value="'+esc(r?r.name:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="r-amt" id="lb-ramt">Tutar ('+CSYM[ccyOf(a0)]+')</label><input id="r-amt" inputmode="decimal" value="'+(r?nv(r.amt):'')+'"></div><div class="field" id="row-rday"'+(wk?' hidden':'')+'><label for="r-day">Ayın kaçı</label><input id="r-day" inputmode="numeric" maxlength="2" value="'+(r&&!wk?r.day:'')+'"></div></div>'
   +'<div class="two"><div class="field"><label for="r-cat">Kategori</label><select id="r-cat">'+(r?optsKeep(inc?INCC():EXPC(),r.cat):(inc?opts(INCC()):opts(EXPC(),EXPC().indexOf('Fatura')>=0?'Fatura':undefined)))+'</select></div><div class="field"><label for="r-acct">Hesap</label><select id="r-acct">'+acctOpts(a0)+'</select></div></div>'
   +'<div class="field" id="row-rsub" hidden><label for="r-sub">Alt kategori</label><select id="r-sub" data-v="'+esc(r&&r.sub||'')+'"></select></div>'
   +'<div class="two"><div class="field"><label for="r-every">Sıklık</label><select id="r-every">'+evo+'</select></div><div class="field"><label for="r-n">Taksit sayısı</label><input id="r-n" inputmode="numeric" maxlength="3" placeholder="Bitmiyorsa boş" value="'+(r&&+r.n>0?r.n:'')+'"></div></div>'
   +'<div class="field" id="row-rstart"'+(wk?' hidden':'')+'><label for="r-start">İlk ödeme ayı</label><input id="r-start" type="month" value="'+esc(r&&r.start&&!wk?r.start:curP())+'"><div class="small muted" style="margin-top:4px">Yıllık ödemelerde (kasko, MTV, emlak vergisi) hangi ay ödendiğini, taksitlerde ilk taksitin ayını seç.</div></div>'
   +'<div class="field" id="row-rstartd"'+(wk?'':' hidden')+'><label for="r-startd">İlk ödeme günü</label><input id="r-startd" type="date" value="'+esc(r&&wk&&r.start?r.start:todayS())+'"><div class="small muted" style="margin-top:4px"><b id="r-wd">Her '+WDAY[(wk&&r.start?pdate(r.start):today0()).getDay()].toLocaleLowerCase('tr-TR')+'</b> · haftanın günü bu tarihten alınır.</div></div>'
   +(S.debts.length?'<div class="field" id="row-rdebt"'+(inc?' hidden':'')+'><label for="r-debt">Bir borcun taksidi mi?</label><select id="r-debt"><option value="">Hayır</option>'+S.debts.map(function(d){return '<option value="'+d.id+'"'+(r&&r.debt===d.id?' selected':'')+'>'+esc(d.name)+'</option>';}).join('')+'</select><div class="small muted" style="margin-top:4px">Borca bağlı taksit ödenince faiz oranına göre anapara ve faiz+vergi olarak ayrılır.</div></div>':'')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-r" data-id="'+(r?r.id:'')+'">Kaydet</button>'+(r?delBtn('del-r',r.id):''));
  subSync('r');
}
function syncREvery(){var w=val('r-every').charAt(0)==='w';['row-rday','row-rstart'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=w;});['row-rstartd'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=!w;});syncRWd();
  var l=document.querySelector('label[for="r-n"]');if(l)l.textContent=w?'Kaç kez':'Taksit sayısı';}
function syncRWd(){var d=val('r-startd'),e=document.getElementById('r-wd');if(e&&/^\d{4}-\d{2}-\d{2}$/.test(d))e.textContent=(val('r-every')==='w2'?'2 haftada bir ':'Her ')+WDAY[pdate(d).getDay()].toLocaleLowerCase('tr-TR');}
function syncRKind(){var inc=val('r-kind')==='inc',c=document.getElementById('r-cat'),d=document.getElementById('row-rdebt');if(c)c.innerHTML=inc?opts(INCC()):opts(EXPC(),EXPC().indexOf('Fatura')>=0?'Fatura':undefined);if(d)d.hidden=inc;subSync('r');}
/* düzenli kalem penceresinde alt kategori seçimi (kategorinin alt kategorisi varsa görünür) */
function subSync(p){var s=document.getElementById(p+'-sub'),row=document.getElementById('row-'+p+'sub');if(!s)return;var c=val(p+'-cat'),cur=s.value||s.dataset.v||'',l=subsOf(c).slice();if(cur&&l.indexOf(cur)<0)cur='';
  s.innerHTML='<option value="">Yok</option>'+l.map(function(x){return '<option'+(x===cur?' selected':'')+'>'+esc(x)+'</option>';}).join('');s.dataset.v='';if(row)row.hidden=!l.length;}
function aSheet(a,kind){
  var ex=a!=null&&ACCS().indexOf(a)>=0,used=ex&&acctUsed(a),t=ex?acctType(a):(kind||'banka'),c=ex?ccyOf(a):'TRY',x=ex?ax(a):{};
  var cs=used?'<div class="static">'+CCYN[c]+'</div>':'<select id="a-ccy" data-prev="'+c+'">'+CCYS.map(function(k){return '<option value="'+k+'"'+(k===c?' selected':'')+'>'+CCYN[k]+'</option>';}).join('')+'</select>';
  openSheet('<h2>'+(ex?'Hesabı düzenle':'Yeni hesap')+'</h2>'
   +'<div class="field"><label for="a-name">Ad</label><input id="a-name" placeholder="Örn. Maaş hesabı" value="'+esc(ex?a:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="a-type">Tür</label><select id="a-type">'+ATYPES.map(function(y){return '<option value="'+y[0]+'"'+(y[0]===t?' selected':'')+'>'+y[1]+'</option>';}).join('')+'</select></div><div class="field">'+(used?'<span class="flbl">Para birimi</span>':'<label for="a-ccy">Para birimi</label>')+cs+'</div></div>'
   +'<div class="two"><div class="field"><label for="a-open" id="lb-aopen">Başlangıç bakiyesi ('+CSYM[c]+')</label><input id="a-open" inputmode="decimal" placeholder="0" value="'+(ex?nv(+S.opening[a]||0):'')+'"></div><div class="field" id="row-due"'+(t==='kart'?'':' hidden')+'><label for="a-due">Son ödeme günü</label><input id="a-due" inputmode="numeric" maxlength="2" placeholder="Örn. 15" value="'+(x.due||'')+'"></div></div>'
   +'<div class="two" id="row-limit"'+(t==='kart'?'':' hidden')+'><div class="field"><label for="a-limit">Kart limiti</label><input id="a-limit" inputmode="decimal" placeholder="İsteğe bağlı" value="'+(x.limit?nv(x.limit):'')+'"></div><div class="field"><label for="a-cut">Hesap kesim günü</label><input id="a-cut" inputmode="numeric" maxlength="2" placeholder="Örn. 5" value="'+(x.cut||'')+'"></div></div>'
   +'<div class="two" id="row-arate"'+(t==='birikim'?'':' hidden')+'><div class="field"><label for="a-rate">Yıllık faiz (%)</label><input id="a-rate" inputmode="decimal" placeholder="İsteğe bağlı, örn. 38" value="'+(+x.rate>0?nv(x.rate):'')+'"></div><div class="field"><label for="a-tax">Stopaj (%)</label><input id="a-tax" inputmode="decimal" placeholder="'+NUM1.format(FACTS.dep.t6)+'" value="'+(x.tax!=null&&x.tax!==''?nv(x.tax):'')+'"></div></div>'
   +'<p class="small muted" style="margin:0" id="row-arate-h"'+(t==='birikim'?'':' hidden')+'>Günlük faizli (kazandıran) hesaplar için: faiz her günün bakiyesinden hesaplanır, ay sonunda stopaj düşülerek “Yatırım getirisi › Faiz” geliri olarak bu hesaba kendiliğinden işlenir.</p>'
   +'<p class="small muted" style="margin:0" id="a-hint"></p><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-a" data-id="'+esc(ex?a:'')+'">Kaydet</button>'
   +(ex?(used||ACCS().length<2?'<p class="small muted" style="margin:0;text-align:center">'+(used?'Hareketi ya da bağlı kaydı olduğu için bu hesap silinemez; kapandıysa arşivleyebilirsin.':'Son hesap silinemez.')+'</p>':delBtn('del-a',esc(a))):'')
   +(ex&&ACCS().length>1?'<button class="btn ghost" data-act="a-arch" data-id="'+esc(a)+'">'+(x.arch?'Arşivden çıkar':'Hesabı arşivle')+'</button>'+(x.arch?'':'<p class="small muted" style="margin:0;text-align:center">Arşivlenen hesap listelerde ve seçimlerde görünmez; geçmiş işlemleri ve bakiyesi korunur.</p>'):''));
  syncA();
}
function syncA(conv){
  var t=val('a-type'),c=document.getElementById('a-ccy'),h=document.getElementById('a-hint'),l=document.getElementById('lb-aopen');
  ['row-due','row-limit'].forEach(function(id){var r=document.getElementById(id);if(r)r.hidden=t!=='kart';});['row-arate','row-arate-h'].forEach(function(id){var r=document.getElementById(id);if(r)r.hidden=t!=='birikim';});
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
  if(S.openD&&S.openD[old]){S.openD[nw]=S.openD[old];delete S.openD[old];}
  ['exp','inc','trf'].forEach(function(k){if(S.last&&S.last[k]&&S.last[k].acct===old)S.last[k].acct=nw;});
  if(S.defAcct===old)S.defAcct=nw;if(ui.acctF===old)ui.acctF=nw;
  /* SMS eşleştirmeleri ve bekleyen SMS işlemleri de yeni adı kullansın */
  if(S.sms){Object.keys(S.sms.map||{}).forEach(function(k){if(S.sms.map[k]===old)S.sms.map[k]=nw;});(S.sms.pend||[]).forEach(function(it){if(it.acct===old)it.acct=nw;if(it.to===old)it.to=nw;});}
  (S.debts||[]).forEach(function(d){if(d.acct===old)d.acct=nw;});
}
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
  else{o.cat=val('f-cat');var sb=val('f-sub');if(sb&&subsOf(o.cat).concat(txOrig&&txOrig.cat===o.cat&&txOrig.sub?[txOrig.sub]:[]).indexOf(sb)>=0)o.sub=sb;}
  /* nakit ve vadesiz hesap eksiye düşecekse bir kez uyar */
  if(o.type!=='inc'&&acctType(o.acct)!=='kart'&&el&&!el.dataset.negok){var t0=id&&byId(S.tx,id),nb0=acctBal(o.acct)+(t0&&t0.acct===o.acct&&t0.type!=='inc'?t0.amt:0)-(t0&&t0.acct===o.acct&&t0.type==='inc'?t0.amt:0)-o.amt;
    if(nb0<-0.005&&acctBal(o.acct)>=-0.005){el.dataset.negok='1';ferr('Bu işlemle '+o.acct+' bakiyesi eksiye düşecek ('+moneyIn(nb0,o.acct)+'). Doğruysa Kaydet’e tekrar dokun.');return;}}
  var tk=!id&&txType==='exp'&&acctType(o.acct)==='kart'?parseInt(val('f-inst'),10)||1:1,rlink=null,instR=null;
  if(id){var t=byId(S.tx,id);if(!t){closeSheet();return;}if(t.acct!==o.acct)delete t.fx;if(txType!=='trf')delete t.to;delete t.amt2;if(!o.sub)delete t.sub;Object.assign(t,o);delete t.sample;}
  else if(tk>1){/* kartla taksitli alışveriş: ilk taksit bugün, kalanlar her ay kendiliğinden işlenir */
    var per=r2(o.amt/tk),first=r2(o.amt-per*(tk-1));o.id=uid();o.amt=first;o.note=(o.note||o.cat)+' (1/'+tk+')';o.rec='i';S.tx.push(o);
    instR={id:uid(),name:(val('f-note').trim()||o.cat)+' taksiti',amt:per,day:+d.slice(8,10),cat:o.cat,acct:o.acct,every:1,n:tk,start:pk(d),auto:true,paid:{}};if(o.sub)instR.sub=o.sub;instR.paid[pk(d)]=o.id;o.inst=o.rec=instR.id;S.recurring.push(instR);}
  else{o.id=uid();S.tx.push(o);var rm=recMatch(o);if(rm&&rm.n>=2){rlink=rm.r;linkRec(rm.r,rm.k,o);}else if(rm)var rask=rm;}
  if(!id){S.last=S.last||{};S.last[txType]={cat:o.cat,acct:o.acct};}
  /* seçili ay kullanıcının seçimi olarak kalır; başka döneme kaydedilince yalnızca bildirilir */
  var other=pk(d)!==ui.month?' · '+plabel(pk(d))+' dönemine':'';
  rcCommit(id||o.id);save();closeSheet();render();
  if(id&&other)toast('İşlem'+other+' taşındı');
  if(!id&&rask){var rr=rask.r,rk=rask.k;toast((txType==='inc'?'Gelir':'Gider')+' kaydedildi. Bu, '+rr.name+(rr.inc?' geliri':' ödemesi')+' mi?',function(){var tt=byId(S.tx,o.id);if(tt&&!recPaid(rr,rk)){linkRec(rr,rk,tt);save();render();toast(rr.name+(rr.inc?' geldi':' ödendi')+' olarak işaretlendi');}},'Evet');}
  else if(!id)toast((txType==='inc'?'Gelir':(txType==='exp'?'Gider':'Transfer'))+' kaydedildi'+other+(rlink?' · '+rlink.name+(rlink.inc?' geldi':' ödendi')+' olarak işaretlendi':'')+(instR?' · '+tk+' taksit, her ay '+moneyIn(instR.amt,o.acct,1):'')+' · '+o.acct+': '+moneyIn(acctBal(o.acct),o.acct),function(){var it=o.intId;S.tx=S.tx.filter(function(z){return z.id!==o.id&&!(it&&z.id===it);});if(instR)S.recurring=S.recurring.filter(function(z){return z!==instR;});save();render();toast('Geri alındı');});
};
ACT['save-mv']=function(el,id){var t=byId(S.tx,id);if(!t)return;var amt=r2(num(val('m-amt')));
  if(tooBig(amt)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(t.type==='adj'?amt===0:amt<=0){ferr(t.type==='adj'?'Tutar sıfır olamaz.':'Tutarı sıfırdan büyük gir.');return;}var d=val('m-date');if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){ferr('Tarih seç.');return;}
  if(t.acct!==val('m-acct'))delete t.fx;t.amt=amt;t.acct=val('m-acct');t.date=d;t.note=val('m-note').trim();delete t.sample;save();closeSheet();render();};
var toastT=null;
function toast(text,undo,label){
  var e=document.getElementById('toast');if(!e){e=document.createElement('div');e.id='toast';e.setAttribute('role','status');document.body.appendChild(e);}
  ui.undoFn=undo||null;e.innerHTML='<span>'+esc(text)+'</span>'+(undo?'<button data-act="undo">'+esc(label||'Geri al')+'</button>':'');e.hidden=false;
  clearTimeout(toastT);toastT=setTimeout(function(){e.hidden=true;ui.undoFn=null;},undo?6000:3500);
}
ACT.undo=function(){var f=ui.undoFn;ui.undoFn=null;var e=document.getElementById('toast');if(e)e.hidden=true;if(f)f();};
ACT['del-tx']=function(el,id){var t=byId(S.tx,id);if(!t)return;
  /* taksitli alışverişin bir taksidi silinirse alışverişin tamamı (plan ve işlenmiş taksitler) silinir, geri alınabilir */
  var ir=t.inst&&byId(S.recurring,t.inst);if(ir){var its=S.tx.filter(function(x){return x.inst===ir.id;});S.tx=S.tx.filter(function(x){return x.inst!==ir.id;});S.recurring=S.recurring.filter(function(x){return x!==ir;});save();closeSheet();render();
    toast('Taksitli alışveriş silindi ('+ir.n+' taksit)',function(){its.forEach(function(x){S.tx.push(x);});S.recurring.push(ir);save();render();});return;}
  /* kredi taksidi silinince ayrı yazılan faiz gideri de silinir (yoksa bakiye faiz kadar eksik kalır) */
  var grp=txGroup(t),back=txRemove(grp);save();closeSheet();render();toast(grp.length>1?'Ödeme ve faizi silindi, bakiye güncellendi':'İşlem silindi, bakiye güncellendi',function(){back();save();render();});};
/* bölünmüş işlem: tek fişin bir kısmı başka kategoriye ayrılır (aynı gün, hesap ve notla ikinci işlem olur) */
ACT['split-tx']=function(el,id){var t=byId(S.tx,id);if(!t)return;var l=t.type==='inc'?INCC():EXPC();
  openSheet('<h2>İşlemi böl</h2><div class="small muted">'+esc(t.note||t.cat)+' · '+moneyIn(t.amt,t.acct)+' · '+esc(t.cat)+'</div><div class="two"><div class="field"><label for="sp-amt">Ayrılacak tutar</label><input id="sp-amt" inputmode="decimal" placeholder="0,00"></div><div class="field"><label for="sp-cat">Kategorisi</label><select id="sp-cat">'+opts(l.filter(function(c){return c!==t.cat;}))+'</select></div></div><p class="small muted" style="margin:0">Kalan tutar “'+esc(t.cat)+'” olarak kalır. Örn. market fişindeki temizlik ürünlerini ayır.</p><div class="err" id="f-err"></div><button class="btn" data-act="split-go" data-id="'+t.id+'">Böl</button>');
  setTimeout(function(){var e=document.getElementById('sp-amt');if(e)e.focus();},60);};
ACT['split-go']=function(el,id){var t=byId(S.tx,id);if(!t)return;var a=r2(num(val('sp-amt')));if(!(a>0)||a>=t.amt){ferr('Tutar sıfırdan büyük ve işlem tutarından ('+moneyIn(t.amt,t.acct)+') küçük olmalı.');return;}
  var c=txCopy(t,{id:uid(),amt:a,cat:val('sp-cat'),split:t.split||t.id});c.ts=Date.now();delete c.sub;t.amt=r2(t.amt-a);t.split=t.split||t.id;
  S.tx.push(c);save();closeSheet();render();
  toast('Bölündü: '+t.cat+' '+moneyIn(t.amt,t.acct,1)+' + '+c.cat+' '+moneyIn(c.amt,c.acct,1),function(){S.tx=S.tx.filter(function(z){return z.id!==c.id;});t.amt=r2(t.amt+a);save();render();});};
ACT['dup-tx']=function(el,id){var t=byId(S.tx,id);if(!t)return;var c=txCopy(t,{id:uid(),date:todayS()});delete c.fx;delete c.split;c.note=String(c.note||'').replace(/\s*\(\d+\/\d+\)$/,'');S.tx.push(c);ui.month=pk(c.date);save();closeSheet();render();toast('Bugüne kopyalandı');};

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
ACT['new-a']=function(el,id,v){ui.balBack=false;aSheet(null,v);};ACT['edit-a']=function(el,id){ui.balBack=false;aSheet(id);};
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
  var cut=parseInt(val('a-cut'),10);if(type==='kart'&&cut>=1&&cut<=31)x.cut=cut;else delete x.cut;
  /* 4.12: birikim hesabı faizi: oran ilk girildiği günden itibaren işlenir */
  var rt=r2(num(val('a-rate'))),txs=val('a-tax').trim();if(rt<0||rt>500){ferr('Yıllık faiz 0 ile 500 arasında olmalı.');return;}
  if(type==='birikim'&&rt>0){if(!(+x.rate>0)||!x.rateFrom){x.rateFrom=todayS();delete x.rateM;}x.rate=rt;if(txs!==''){var tv=num(txs);if(tv<0||tv>100){ferr('Stopaj 0 ile 100 arasında olmalı.');return;}x.tax=tv;}else delete x.tax;}
  else{delete x.rate;delete x.rateFrom;delete x.rateM;delete x.tax;}
  if(!ex||op!==(+S.opening[nm]||0))S.sampleExtras=false;
  S.opening[nm]=op;S.openD=S.openD||{};if(!ex&&op!==0)S.openD[nm]=todayS();
  save();closeSheet();render();toast(ex?'Hesap güncellendi':nm+' eklendi');
  if(ui.balBack){ui.balBack=false;setTimeout(balSheet,50);}
};
ACT['a-arch']=function(el,id){var x=S.accx[id]=S.accx[id]||{};if(x.arch){delete x.arch;}else{var b=acctBal(id);if(Math.abs(b)>0.005&&!armed(el)){toast('Bakiyesi '+moneyIn(b,id)+'; yine de arşivlemek için tekrar dokun');return;}x.arch=true;if(S.defAcct===id)S.defAcct='';}save();closeSheet();render();toast(x.arch?id+' arşivlendi':id+' arşivden çıkarıldı');};
ACT['del-a']=function(el,id){if(acctUsed(id)||ACCS().length<2)return;if(!armed(el))return;S.accounts=S.accounts.filter(function(x){return x!==id;});delete S.opening[id];delete S.accx[id];if(S.openD)delete S.openD[id];if(S.defAcct===id)S.defAcct='';save();closeSheet();render();};

/* yatırım ve varlık */
ACT['new-h']=function(el,id,v){hSheet(null,v);};ACT['edit-h']=function(el,id){hSheet(id);};
ACT['save-h']=function(el,id,v){
  var nm=val('h-name').trim();if(!nm){ferr('Bir ad yaz.');return;}var x=id?byId(S.holdings,id):null,h;
  if(v==='asset'){var pv=r2(num(val('h-price')));if(pv<=0){ferr('Güncel değeri gir.');return;}var cv=r2(num(val('h-cost')))||pv;if(cv<0){ferr('Alış değeri eksi olamaz.');return;}h={name:nm,type:val('h-type'),kind:'asset',ccy:'',qty:1,cost:cv,price:pv};}
  else{var q=num(val('h-qty'));if(q<=0){ferr('Miktarı gir.');return;}var co=num(val('h-cost')),cc=val('h-ccy'),mkk=cc.indexOf('mk:')===0?cc.slice(3):'',mp=0;if(mkk){cc='';mp=mTL(mkk);}
    if(co<0||num(val('h-price'))<0){ferr('Maliyet ve fiyat eksi olamaz.');return;}if(co<=0&&!cc&&!(mp>0)&&num(val('h-price'))<=0){ferr('Maliyet ya da güncel fiyat gir.');return;}
    h={name:nm,type:val('h-type'),kind:'inv',ccy:cc,qty:q,cost:co||(cc?rateOf(cc):(mp||num(val('h-price')))),price:mp||num(val('h-price'))||co||rateOf(cc),mk:mkk||undefined,mks:mkk?((x&&x.mk===mkk&&x.mks)||mSym(mkk)):undefined};}
  if(v!=='asset'){var ye=yRead(h,x);if(ye){ferr(ye);return;}
    /* düzenlemede oran ve başlangıç aynıysa birikim korunur; fiyat ya da miktar elle değiştiyse başlangıç bugüne alınmaz (kullanıcı tarihini seçer) */
    if(!(+h.yr>0))['yr','yd','vd','tax','roll'].forEach(function(k){delete h[k];if(x)delete x[k];});}
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
  var x=byId(S.holdings,id);if(!x)return;yCrys(x);var ast=hKind(x)==='asset',q=ast?1:num(val('tr-qty')),p=num(val('tr-price')),fee=r2(num(val('tr-fee'))),acct=val('tr-acct'),d=val('tr-date')||todayS();
  if(fee<0){ferr('Komisyon eksi olamaz.');return;}
  if(!(q>0)){ferr('Miktarı gir.');return;}if(!(p>0)){ferr(ast?'Satış tutarını gir.':'Birim fiyatı gir.');return;}
  if(side==='sell'&&q>x.qty+1e-9){ferr('Elindekinden fazla satamazsın ('+NUM2.format(x.qty)+').');return;}
  if(acct&&!(rateOf(ccyOf(acct))>0)){ferr('Hesabın kuru yok; önce kurları güncelle.');return;}
  /* komisyon: alımda maliyete eklenir, satışta eline geçenden düşer */
  var tl=side==='buy'?q*p+fee:q*p-fee;if(side==='sell'&&tl<=0){ferr('Komisyon satış tutarından büyük olamaz.');return;}if(tooBig(tl)||tooBig((x.qty+q)*x.cost)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}if(acct&&!(r2(fromTL(tl,acct))>0)){ferr('Tutar bu hesabın para biriminde çok küçük.');return;}
  if(side==='buy'&&acct&&acctType(acct)!=='kart'&&el&&!el.dataset.negok){var nb1=acctBal(acct)-r2(fromTL(tl,acct));if(nb1<-0.005&&acctBal(acct)>=-0.005){el.dataset.negok='1';ferr('Bu alımla '+acct+' bakiyesi eksiye düşecek ('+moneyIn(nb1,acct)+'). Doğruysa yeniden dokun.');return;}}
  if(side==='buy'){x.cost=(x.qty*x.cost+tl)/(x.qty+q);x.qty=x.qty+q;if(!x.ccy)x.price=p;}
  else{var pl=r2((p-x.cost)*q-fee);S.realized.push({id:uid(),name:x.name,qty:q,pl:pl,date:d});x.qty=x.qty-q;if(!x.ccy)x.price=p;
    if(x.qty<=1e-9)S.holdings=S.holdings.filter(function(h){return h.id!==x.id;});}
  delete x.sample;
  if(acct&&r2(fromTL(tl,acct))>0)S.tx.push({id:uid(),type:'inv',side:side,hold:x.id,hname:x.name,qty:q,amt:r2(fromTL(tl,acct)),acct:acct,date:d,note:fee>0?'Komisyon '+TRY2.format(fee)+' dahil':''});
  save();closeSheet();render();toast((side==='buy'?'Alım':'Satış')+' kaydedildi'+(acct?' · '+acct+': '+moneyIn(acctBal(acct),acct):''));
};

/* borçlar */
ACT['new-d']=function(){dSheet();};ACT['edit-d']=function(el,id){dSheet(id);};
ACT['save-d']=function(el,id){
  var n=val('d-name').trim(),a=r2(num(val('d-amt')));if(!n){ferr('Bir ad yaz.');return;}if(a<=0){ferr('Tutarı gir.');return;}if(tooBig(a)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  var rt=num(val('d-rate'));if(rt<0||rt>30){ferr('Aylık faiz 0 ile 30 arasında olmalı.');return;}
  var dn=Math.round(num(val('d-n'))),tx0=val('d-tax').trim(),tx1=num(tx0);if(dn<0||dn>600){ferr('Vade 0 ile 600 ay arasında olmalı.');return;}if(tx0&&(tx1<0||tx1>100)){ferr('Vergi oranı 0 ile 100 arasında olmalı.');return;}
  var o={name:n,type:val('d-type'),amt:a};if(rt>0)o.rate=r2(rt);if(dn>0)o.n=dn;if(tx0)o.tax=r2(tx1);
  if(id){var d0=byId(S.debts,id);Object.assign(d0,o);if(!(rt>0))delete d0.rate;if(!(dn>0))delete d0.n;if(!tx0)delete d0.tax;delete d0.sample;}
  else{o.id=uid();S.debts.push(o);var acct=val('d-acct');if(acct&&ACCS().indexOf(acct)>=0&&r2(fromTL(a,acct))>0)S.tx.push({id:uid(),type:'dbt',side:'in',debt:o.id,dname:n,amt:r2(fromTL(a,acct)),acct:acct,date:todayS(),note:''});}
  save();closeSheet();render();toast(id?'Borç güncellendi':n+' eklendi');
};
ACT['loan-rec']=function(el,id){var d=byId(S.debts,id);if(!d)return;var P=loanPmt(d,+d.n);if(!(P>0)){toast('Önce kalan vadeyi yaz.');return;}var a=grpAccts('banka')[0]||defAcct('exp');
  /* ödeme planıyla aynı: ilk taksit gelecek dönem; gün sonradan düzenlenebilir */
  var r={id:uid(),name:d.name+' taksiti',amt:r2(fromTL(P,a)),day:new Date().getDate(),cat:ensureCat('exp','Kredi'),acct:a,debt:d.id,every:1,n:+d.n,start:addMonth(curP(),1),paid:{}};S.recurring.push(r);save();closeSheet();render();toast(r.name+' eklendi · ayın '+r.day+sfx(r.day)+', '+TRY0.format(P)+' · günü değiştirmek için dokun',function(){rSheet(r.id);},'Düzenle');};
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
  var rn=val('r-name').trim(),ra=r2(num(val('r-amt'))),rd=Math.round(num(val('r-day'))),evs=val('r-every')||'1',wk=evs.charAt(0)==='w'?(+evs.slice(1)===2?2:1):0,sd=val('r-startd');
  if(!rn){ferr('Bir ad yaz.');return;}if(ra<=0){ferr('Tutarı gir.');return;}if(tooBig(ra)){ferr('Tutar çok büyük (en fazla 100 milyar).');return;}
  if(wk){if(!/^\d{4}-\d{2}-\d{2}$/.test(sd)){ferr('İlk ödeme gününü seç.');return;}rd=+sd.slice(8,10);}else if(rd<1||rd>31){ferr('Gün 1 ile 31 arasında olmalı.');return;}
  var inc=val('r-kind')==='inc',ev=wk?1:(parseInt(evs,10)||1),nn=Math.round(num(val('r-n'))),st=val('r-start');
  if(nn<0||nn>600){ferr((wk?'Tekrar':'Taksit')+' sayısı 0 ile 600 arasında olmalı.');return;}if(st&&!/^\d{4}-\d{2}$/.test(st))st='';
  var ro={name:rn,amt:ra,day:rd,cat:val('r-cat'),acct:val('r-acct'),every:ev,n:nn>0?nn:0,start:wk?sd:(st||((ev>1||nn>0)?curP():''))},db=inc?'':val('r-debt'),rs=val('r-sub');
  if(inc)ro.inc=true;if(wk)ro.wk=wk;if(rs)ro.sub=rs;
  /* sıklık türü değişince (aylık ↔ haftalık) eski ödendi işaretleri yeni anahtarlara uymaz */
  var keepK=function(r){if(!r.paid)return;Object.keys(r.paid).forEach(function(k){if((k.length>7)!==!!wk)delete r.paid[k];});};
  var r0;if(id){r0=byId(S.recurring,id);var wasWk=isWk(r0);Object.assign(r0,ro);if(!inc)delete r0.inc;if(!wk)delete r0.wk;if(!rs)delete r0.sub;if(db)r0.debt=db;else delete r0.debt;if(!ro.start)delete r0.start;delete r0.sample;if(wasWk!==!!wk){keepK(r0);if(wk)delete r0.since;}}
  else{ro.id=uid();ro.paid={};if(db)ro.debt=db;if(!ro.start){delete ro.start;ro.since=curP();}
    /* geçmiş başlangıçlı yeni haftalık kalem: yalnız son ödeme günü sorulur, daha eskiler izlenmez */
    if(wk&&sd<todayS()){var lq=sd;while(addD(lq,wkStep(ro))<=todayS())lq=addD(lq,wkStep(ro));ro.since=lq;}
    S.recurring.push(ro);r0=ro;}
  save();closeSheet();render();
  /* yeni kalemin bu dönemki günü geçtiyse: girilmiş işlem varsa bağlanır, yoksa sorulur */
  if(!id){var k=curP();if(wk){var pq=occs(r0,k).filter(function(q){return q<=todayS();});k=pq.length?pq[pq.length-1]:'';}
    if(k&&recOn(r0,k)&&!recPaid(r0,k)&&dueDate(r0,k)<=todayS()){var ft=recFind(r0,k);
    if(ft){var a1=moneyIn(ft.amt,ft.acct,1);linkRec(r0,k,ft);save();render();toast((wk?'Bu haftaki ':'Bu ayki ')+(inc?'gelir':'ödeme')+' bulundu ve bağlandı: '+(ft.note||ft.cat)+' '+a1,function(){unlinkRec(r0,k);save();render();});}
    else toast(r0.name+': '+(wk?'bu hafta ':'bu dönem ')+(inc?'geldi mi?':'ödendi mi?'),function(){payRec(r0,k);},inc?'Geldi':'Ödendi');}}
};
ACT['del-r']=function(el,id){if(!armed(el))return;S.recurring=S.recurring.filter(function(x){return x.id!==id;});save();closeSheet();render();};
/* düzenli ödemeyi bir dönem için öde: işlem eklenir, bakiye düşer (borca bağlıysa borçtan düşer) */
/* düzenli kalemin bir dönemlik işlemi: borca bağlıysa taksit anapara ve faiz+vergi olarak bölünür */
function recTx(r,k,date){var d=r.debt&&byId(S.debts,r.debt),tx,no=+r.n>0?' ('+recNo(r,k)+'/'+r.n+')':'';
  if(d&&debtLeft(d)>0){var amtTL=toTL(+r.amt||0,r.acct),sp=loanSplit(d,amtTL);
    tx={id:uid(),type:'dbt',side:'out',debt:d.id,dname:d.name,amt:r2(fromTL(sp.p,r.acct)),acct:r.acct,note:r.name+no,date:date,rec:r.id};
    if(sp.i>0.005){var it={id:uid(),type:'exp',amt:r2(fromTL(sp.i,r.acct)),cat:ensureCat('exp','Faiz ve masraf'),acct:r.acct,note:d.name+' faizi'+no,date:date,rec:r.id};S.tx.push(it);tx.intId=it.id;}
    if(!(tx.amt>0)){if(tx.intId){var ii=byId(S.tx,tx.intId);r.paid=r.paid||{};r.paid[k]=ii.id;return ii;}}}
  else{tx={id:uid(),type:r.inc?'inc':'exp',amt:r.amt,cat:r.cat,acct:r.acct,note:r.name+no,date:date,rec:r.id};if(r.sub)tx.sub=r.sub;}
  if(r.auto)tx.inst=r.id;
  S.tx.push(tx);r.paid=r.paid||{};r.paid[k]=tx.id;return tx;}
function payRec(r,k){if(isWk(r)&&k.length===7)k=recShow(r,k);var t0=todayS(),dd=dueDate(r,k),pd=k.length>7?(Math.abs(daysBetween(dd,t0))<wkStep(r)?t0:dd):(dd!==t0&&t0>=pStart(k)?t0:dd);
  if(recPaid(r,k)){toast(r.name+(k.length>7?' '+pdate(k).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})+' için':' bu dönem')+' zaten '+(r.inc?'geldi':'ödendi')+' olarak işaretli');return;}
  /* bu dönem elle girilmiş eşleşen işlem varsa yenisi eklenmez, o bağlanır (çift kayıt olmasın) */
  var ft=recFind(r,k);if(ft){var a0=moneyIn(ft.amt,ft.acct,1);linkRec(r,k,ft);save();render();toast(r.name+': '+pdate(ft.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})+' tarihli '+a0+' işlemiyle eşleştirildi',function(){unlinkRec(r,k);save();render();});return;}
  var tx=recTx(r,k,pd);save();render();
  var it=tx.intId&&byId(S.tx,tx.intId);
  /* fatura tutarı her ay değişebilir (elektrik, doğalgaz): tek dokunuşla gerçek tutar girilir */
  toast(r.name+(r.inc?' geldi':' ödendi')+(it?' · anapara '+moneyIn(tx.amt,tx.acct,1)+', faiz+vergi '+moneyIn(it.amt,it.acct,1):'')+' · '+r.acct+': '+moneyIn(acctBal(r.acct),r.acct),function(){if(byId(S.tx,tx.id))txSheet(tx.id);},'Tutarı düzenle');}
/* kendiliğinden işlenen kalemler (kartla taksitli alışveriş): günü gelen taksitler eklenir */
function autoPost(){var t0=todayS(),n=0,c=curP();S.recurring.forEach(function(r){if(!r.auto)return;occsIn(r,[addMonth(c,-2),addMonth(c,-1),c]).forEach(function(k){if(recPaid(r,k))return;var d=dueDate(r,k);if(d>t0)return;recTx(r,k,d);n++;});});if(n)save();return n;}
ACT.rpay=function(el,id,v){var r=byId(S.recurring,id);if(r)payRec(r,v||ui.month);};
/* Geri al: uygulamanın "Ödendi" ile oluşturduğu işlem silinir (geri alınabilir); senin girdiğin işlem silinmez, yalnız bağı çözülür */
ACT.rundo=function(el,id,v){var r=byId(S.recurring,id),k=v||ui.month;if(!r||!r.paid||!r.paid[k])return;var t=byId(S.tx,r.paid[k]);
  if(t&&t.rec===r.id){var it=t.intId&&byId(S.tx,t.intId),keep=[t,it].filter(Boolean),pid=t.id;S.tx=S.tx.filter(function(x){return keep.indexOf(x)<0;});delete r.paid[k];save();render();
    toast(r.name+': ödeme kaydı silindi',function(){keep.forEach(function(x){S.tx.push(x);});r.paid[k]=pid;save();render();});}
  else{unlinkRec(r,k);save();render();toast(r.name+' ödenmedi olarak işaretlendi · '+(t?'girdiğin işlem duruyor':''),function(){if(t&&byId(S.tx,t.id)){linkRec(r,k,t);save();render();}});}};

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
/* kategori penceresi: simge, alt kategoriler, ad ve silme */
ACT['cat-menu']=function(el,id,v){catMenu(id,v);};
function catMenu(id,v){var n=S.tx.filter(function(t){return t.cat===id;}).length,cur=catIcKey(id),subs=subsOf(id);
  var cnt={};S.tx.forEach(function(t){if(t.cat===id&&t.sub)cnt[t.sub]=(cnt[t.sub]||0)+1;});
  openSheet('<div class="ghead">'+cic(id,'lg')+'<h2 style="margin:0;flex:1">'+esc(id)+'</h2></div><div class="small muted">'+n+' işlemde kullanılıyor</div>'
   +'<div class="field"><span class="flbl">Simge</span><div class="icgrid" role="group" aria-label="Simge seç">'+CATIC.map(function(k){return '<button class="icpick" data-act="cat-ic" data-id="'+esc(id)+'" data-v="'+k+'" aria-pressed="'+(k===cur)+'" aria-label="'+k+'" style="--c:'+color(id)+'">'+ic(k)+'</button>';}).join('')+'</div></div>'
   +'<div class="field"><span class="flbl">Alt kategoriler</span>'+(subs.length?'<div class="chips">'+subs.map(function(x){return '<span class="chip subdel">'+esc(x)+(cnt[x]?'<span class="small muted"> · '+cnt[x]+'</span>':'')+'<button data-act="sub-del" data-id="'+esc(id)+'" data-v="'+esc(x)+'" aria-label="'+esc(x)+' alt kategorisini sil">'+ic('x')+'</button></span>';}).join('')+'</div>':'<div class="small muted">Henüz yok. Örn. Fatura › Elektrik, Ulaşım › Yakıt.</div>')
   +'<div class="two" style="grid-template-columns:1fr auto;margin-top:8px"><input id="ns-add" placeholder="Yeni alt kategori" aria-label="Yeni alt kategori" maxlength="30"><button class="btn small" data-act="sub-add" data-id="'+esc(id)+'" data-v="'+v+'">Ekle</button></div></div>'
   +'<div class="field"><label for="cr-name">Ad</label><input id="cr-name" value="'+esc(id)+'" maxlength="40"></div><div class="err" id="f-err"></div><button class="btn ghost" data-act="cat-ren" data-v="'+v+'" data-id="'+esc(id)+'">Yeniden adlandır</button>'+(S.cats[v].length>1?'<button class="btn danger ghost" data-act="cat-del" data-v="'+v+'" data-id="'+esc(id)+'">Kategoriyi sil</button>':''));}
function catTypeOf(c){return S.cats.inc.indexOf(c)>=0&&S.cats.exp.indexOf(c)<0?'inc':'exp';}
ACT['cat-ic']=function(el,id,v){if(!ICONS[v])return;S.catIc[id]=v;save();render();catMenu(id,catTypeOf(id));};
ACT['sub-add']=function(el,id,v){var n=val('ns-add').trim().replace(/\s+/g,' ');if(!n||badName(n)){var i=document.getElementById('ns-add');if(i)i.focus();return;}S.subs[id]=subsOf(id);if(S.subs[id].indexOf(n)<0)S.subs[id].push(n);save();render();catMenu(id,v);};
/* silinen alt kategorinin işlemleri ana kategoride kalır (alt kategori bilgisi durur, listede görünmeye devam eder) */
ACT['sub-del']=function(el,id,v){S.subs[id]=subsOf(id).filter(function(x){return x!==v;});if(!S.subs[id].length)delete S.subs[id];save();render();catMenu(id,catTypeOf(id));toast(id+' › '+v+' silindi');};
/* yeniden adlandırma bütün kayıtlara uygulanır: işlemler, bütçe, kurallar, düzenli ödemeler, son seçimler */
ACT['cat-ren']=function(el,id,v){var nw=val('cr-name').trim().replace(/\s+/g,' ');if(!nw){ferr('Bir ad yaz.');return;}if(nw===id){closeSheet();return;}if(badName(nw)||S.cats[v].indexOf(nw)>=0){ferr('Bu ad kullanılamaz ya da zaten var.');return;}
  S.cats[v]=S.cats[v].map(function(c){return c===id?nw:c;});S.tx.forEach(function(t){if(t.cat===id&&(v==='inc'?t.type==='inc':t.type==='exp'))t.cat=nw;});
  if(v==='exp'&&S.budgets[id]!=null){S.budgets[nw]=S.budgets[id];delete S.budgets[id];}if(v==='exp'&&S.budSince&&S.budSince[id]){S.budSince[nw]=S.budSince[id];delete S.budSince[id];}S.rules.forEach(function(r){if(r.cat===id)r.cat=nw;});S.recurring.forEach(function(r){if(r.cat===id)r.cat=nw;});
  if(S.subs[id]){S.subs[nw]=S.subs[id];delete S.subs[id];}if(S.catIc[id]){S.catIc[nw]=S.catIc[id];delete S.catIc[id];}
  if(S.last&&S.last[v]&&S.last[v].cat===id)S.last[v].cat=nw;S.catAlias=S.catAlias||{};delete S.catAlias[nw];S.catAlias[id]=nw;save();closeSheet();render();toast('“'+id+'” → “'+nw+'”');};
ACT['cat-del']=function(el,id,v){if(S.cats[v].length<2)return;if(!armed(el))return;S.cats[v]=S.cats[v].filter(function(x){return x!==id;});if(S.cats.exp.indexOf(id)<0&&S.cats.inc.indexOf(id)<0){delete S.subs[id];delete S.catIc[id];}S.rules=S.rules.filter(function(r){return r.cat!==id||S.cats.exp.indexOf(id)>=0||S.cats.inc.indexOf(id)>=0;});if(v==='exp')delete S.budgets[id];save();closeSheet();render();};
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
  if(Date.now()<ui.lockUntil){ui.lkMsg='Çok fazla deneme. '+Math.ceil((ui.lockUntil-Date.now())/1000)+' saniye bekle.';render();return;}if(!S.pin)return;
  if(v==='<')ui.pinBuf=ui.pinBuf.slice(0,-1);else if(ui.pinBuf.length<4)ui.pinBuf+=v;
  ui.lkMsg='';
  if(ui.pinBuf.length===4){
    var buf=ui.pinBuf;
    pinHash(buf,S.pin.s).then(function(h){
      if(h===S.pin.h){ui.locked=false;ui.pinBuf='';ui.fails=0;ui.lkMsg='';render();setTimeout(runIntent,50);}
      else{ui.fails++;ui.pinBuf='';ui.lkMsg='Yanlış PIN';
        if(ui.fails>=5){ui.fails=0;ui.lockUntil=Date.now()+30000;try{localStorage.setItem('wallet-lock',String(ui.lockUntil));}catch(e){}ui.lkMsg='Çok fazla deneme. 30 saniye bekle.';setTimeout(function(){if(ui.locked){ui.lkMsg='';render();}},30000);}
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
ACT['bk-pw-del']=function(el){if(clOn()){msg('Bulut yedeği açıkken yedek şifresi kaldırılamaz: bulut yedeği her zaman şifrelidir.',false,'f-bka');return;}if(!armed(el))return;delete S.bkKey;save();(nb('autoBackup')?autoBackup(true):Promise.resolve()).then(function(){render();});};
function shareText(name,text,id){
  if(nb('shareFile')){var r='err';try{r=NB.shareFile(name,text);}catch(e){}if(r!=='ok')msg('Paylaşılamadı.',false,id);return;}
  try{var f=new File([text],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Wallet yedeği'}).catch(function(){});return;}}catch(e){}
  saveFile(name,text,'Yedek kaydedildi.',id);
}
ACT['bk-share']=function(){backupText().then(function(t){S.bkOutTs=Date.now();save();shareText(bkName(),t,'f-bka');});};
function bkName(){return S.bkKey?'wallet-yedek-sifreli.json':'wallet-yedek.json';}
ACT['bk-save']=function(){backupText().then(function(t){saveFile(bkName(),t,'Yedek kaydedildi'+(S.bkKey?' (şifreli).':'.'),'f-bka');});};
ACT['bk-copy']=function(){backupText().then(function(t){copyText(t,'f-bka','Yedek kopyalandı'+(S.bkKey?' (şifreli).':'.'));});};
/* yedeği uygula (dosya, yapıştırma ya da bulut): PIN, yedek şifresi ve bulut bağlantısı bu cihazdaki gibi kalır; önceki veri saklanır */
function applyBackup(d,mid){if(!d||!Array.isArray(d.tx))throw new Error('x');var old=JSON.stringify(S),keep=S.pin,bio=S.bio,bk=S.bkKey,cl=S.cloud;
  try{localStorage.setItem('wallet-prerestore',old);}catch(e){}
  S=norm(d);S.pin=keep||null;S.bio=!!keep&&bio;if(bk)S.bkKey=bk;else delete S.bkKey;if(cl){S.cloud=cl;delete cl.hold;}else delete S.cloud;delete S.bkHold;ui.month=curP();save();if(S.cloud)S.cloud.sig=S.savedAt;render();
  msg('Yedek yüklendi: '+S.tx.length+' işlem, '+S.accounts.length+' hesap.',true,mid);
  toast('Yedek yüklendi',function(){var c=S.cloud;S=norm(JSON.parse(old));if(c)S.cloud=c;ui.month=curP();save();render();toast('Önceki verine dönüldü');});}
ACT['rs-go']=function(el0){
  var raw=val('rs-txt').trim(),pw=val('rs-pw');
  if(!raw){msg('Yedek dosyasını seç ya da metni yapıştır.',false,'f-err2');return;}
  var o;try{o=JSON.parse(raw);}catch(e){msg('Yedek okunamadı. Tüm metni kopyaladığından emin ol.',false,'f-err2');return;}
  /* yükleme mevcut verilerin yerine geçer: önce onay, sonra eski veri saklanır (Geri al ve Ayarlar'dan dönüş) */
  var el=el0&&el0.nodeType?el0:document.querySelector('[data-act="rs-go"]'),disarm=function(){if(el){delete el.dataset.armed;el.textContent='Yedeği yükle';}};
  if(o&&o.wallet&&o.d&&!pw){msg('Bu yedek şifreli, şifreyi gir.',false,'f-err2');return;}
  if(el&&!armed(el)){msg('Yedek mevcut verilerinin yerine geçecek. Onaylamak için yeniden dokun.',false,'f-err2');return;}
  var apply=function(d){applyBackup(d,'f-err2');};
  if(o&&o.wallet&&o.d){
    if(!pw){msg('Bu yedek şifreli, şifreyi gir.',false,'f-err2');return;}
    decText(o,pw).then(function(t){try{apply(JSON.parse(t));}catch(e){disarm();msg('Yedek okunamadı.',false,'f-err2');}},function(){disarm();msg('Şifre yanlış ya da yedek bozuk. Şifreyi düzeltip yeniden dene.',false,'f-err2');});
  }else{try{apply(o);}catch(e){disarm();msg('Yedek okunamadı.',false,'f-err2');}}
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
  var imp=uid();add.forEach(function(t){t.imp=imp;});S.lastImp={id:imp,n:add.length,accts:newA,cats:newC,ts:Date.now()};
  S.tx=S.tx.concat(add);
  return {imp:imp,added:add.length,dup:dup,bad:bad,accts:newA.length,cats:newC.length};}
ACT['im-go']=function(){
  var raw=val('im-txt').trim();if(!raw){msg('CSV dosyasını seç ya da metni yapıştır.',false,'f-err4');return;}
  var r=csvImport(raw,val('im-acct'));if(r.err){msg(r.err,false,'f-err4');return;}
  save();render();
  msg(r.added+' işlem eklendi'+(r.dup?', '+r.dup+' tekrar atlandı':'')+(r.bad?', '+r.bad+' satır okunamadı':'')+(r.accts?'. '+r.accts+' yeni hesap':'')+(r.cats?'. '+r.cats+' yeni kategori':'')+'.',r.added>0||r.dup>0,'f-err4');
  if(r.added>0)impReview();};
/* içe aktarılanları gözden geçir: kategoriye dokunup düzelt; tek dokunuşla tüm aktarımı geri al */
function impReview(){var L=S.lastImp;if(!L)return;var l=S.tx.filter(function(t){return t.imp===L.id;}).sort(txCmp);if(!l.length)return;
  openSheet('<h2>İçe aktarılanlar · '+l.length+'</h2><p class="small muted" style="margin:0">Kategorisi yanlış olana dokunup düzelt; uygulama düzeltmelerinden öğrenir.</p><div class="list">'+l.slice(0,200).map(txRow).join('')+'</div>'+(l.length>200?'<div class="small muted">İlk 200 işlem gösteriliyor.</div>':'')+'<button class="btn" data-act="close">Tamam</button><button class="btn ghost" data-act="imp-undo">Bu aktarımı geri al</button>');}
ACT['imp-review']=function(){impReview();};
ACT['imp-undo']=function(el){var L=S.lastImp;if(!L)return;if(!armed(el))return;var n=S.tx.length;S.tx=S.tx.filter(function(t){return t.imp!==L.id;});
  (L.accts||[]).forEach(function(a){if(!acctUsed(a)){S.accounts=S.accounts.filter(function(x){return x!==a;});delete S.opening[a];delete S.accx[a];}});
  (L.cats||[]).forEach(function(c){var p=c.split('|'),ty=p[0]==='inc'?'inc':'exp',nm=p.slice(1).join('|');if(!S.tx.some(function(t){return t.cat===nm;})&&S.cats[ty].length>1)S.cats[ty]=S.cats[ty].filter(function(x){return x!==nm;});});
  delete S.lastImp;save();closeSheet();render();toast((n-S.tx.length)+' içe aktarılan işlem geri alındı');};

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
  try{RDB=null;if(window.indexedDB)indexedDB.deleteDatabase('wallet-media');}catch(e){}
  if(keepBk&&nb('wipeKeep')){try{NB.wipeKeep();}catch(e){}}else if(nb('wipe')){try{NB.wipe();}catch(e){}}
  S=norm({tx:[]});if(keepBk)S.bkHold=Date.now();
  ui.locked=false;ui.forgot=false;ui.page=null;ui.sub='ev';ui.month=curP();ui.filter='all';ui.acctF='';ui.tq='';ui.nq='';ui.nv='act';ui.cv={};
  save();flushNative();applySecure();
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  closeSheet();render();window.scrollTo(0,0);toast('Tüm veriler silindi');
  refreshRates({}).then(function(){if(!ui.page&&!sheetOpen())render();});
}
ACT['reset-all']=function(){openSheet('<h2>Tüm verileri sil</h2><p class="small" style="margin:0">Bu cihazdaki bütün işlemler, hesaplar, notlar, hedefler ve ayarlar kalıcı olarak silinir. <b>Geri alınamaz.</b> Önce yedek almak istersen Veri ve yedek › Yedek bölümünü kullan.</p><div class="field"><label for="wipe-c">Onaylamak için <b>SİL</b> yaz</label><input id="wipe-c" autocomplete="off" autocapitalize="characters"></div><div class="err" id="f-err"></div><button class="btn danger" data-act="reset-go">Kalıcı olarak sil</button>');};
ACT['reset-go']=function(){if(val('wipe-c').trim().toLocaleUpperCase('tr-TR')!=='SİL'){ferr('Onaylamak için SİL yaz.');return;}closeSheet();wipeAll();};

/* ---------- canlı kur ---------- */
var RK={USD:['USD'],EUR:['EUR'],GBP:['GBP'],CHF:['CHF'],XAU:['GRA','GRAM-ALTIN','GRAMALTIN','GA','GRAM_ALTIN'],XAG:['GUMUS','GRAM-GUMUS','GRAMGUMUS','GAG'],CEY:['CEYREKALTIN','CEYREK-ALTIN','C'],BIST:['XU100','BIST100','BIST-100','XU-100']};
function findRate(items,names){var keys=Object.keys(items||{});for(var i=0;i<names.length;i++){for(var j=0;j<keys.length;j++){if(keys[j].toUpperCase()===names[i]&&items[keys[j]]&&typeof items[keys[j]]==='object')return items[keys[j]];}}return null;}
function rPrice(o){if(!o)return 0;var v=num(o.Selling!=null?o.Selling:(o.sell!=null?o.sell:(o.price!=null?o.price:(o.Buying!=null?o.Buying:o.buy))));return v>0?v:0;}
function rChg(o){if(!o)return null;var c=o.Change!=null?o.Change:o.change;if(c==null||c==='')return null;c=num(String(c).replace('%',''));return isFinite(c)?c:null;}
function pickRates(j){var it=(j&&j.items)||j||{},o={chg:{},BIST:null,prov:(j&&(j.updated||j.Update_Date))||''};
  o.buy={};FXK.forEach(function(k){var x=findRate(it,RK[k]);o[k]=rPrice(x);o.chg[k]=rChg(x);var bv=x?num(x.Buying!=null?x.Buying:x.buy):0;o.buy[k]=bv>0&&bv<=o[k]*1.001?bv:0;});
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
    S.fxB=S.fxB||{};FXK.forEach(function(k){if(o[k]>0){S.fx[k]=o[k];got.push(k);if(o.buy&&o.buy[k]>0)S.fxB[k]=o.buy[k];else delete S.fxB[k];}});
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
  if(t.id==='h-ccy'){delete t.dataset.auto;syncH();}if(t.id==='h-acct')syncH();if(t.id==='h-type'){autoSrc();ySync();}if(t.id==='h-vd'||t.id==='h-yr'||t.id==='h-tax')ySync();if(t.id==='r-kind')syncRKind();if(t.id==='r-every')syncREvery();if(t.id==='r-startd')syncRWd();if(t.id==='r-cat')subSync('r');
  if(t.id==='g-acct')syncG();
  if(t.id==='a-type')syncA();
  if(t.id==='a-ccy')syncA(true);
  if(t.id==='tr-acct')tradePrev();
  if(d.bind){
    var k=d.kind,v=t.value;
    if(k==='num')v=num(v);else if(k==='auto')v=(String(v).trim()==='')?'':num(v);else if(k==='int')v=parseInt(v,10)||1;
    if(d.bind==='payday'){setPayday(v);ui.month=curP();}else setP(d.bind,v);
    if(d.bind.indexOf('fx.')===0){S.fxTs=Date.now();if(S.fxChg)delete S.fxChg[d.bind.slice(3)];if(S.fxB)delete S.fxB[d.bind.slice(3)];}
    save();render();return;
  }
  if(d.budget!==undefined){if(t.closest&&t.closest('.limadd'))ui.limOpen=true;var n=r2(num(t.value));S.budSince=S.budSince||{};if(n>0&&!(+S.budgets[d.budget]>0))S.budSince[d.budget]=curP();if(tooBig(n))n=0;if(n>0)S.budgets[d.budget]=n;else delete S.budgets[d.budget];S.sampleExtras=false;save();render();}
  else if(d.price!==undefined){var h=byId(S.holdings,d.price),pv=num(t.value);if(h&&pv>=0){h.price=pv;if(yOn(h))h.yd=todayS();delete h.sample;save();render();}}
  else if(t.id==='f-cat'){t.dataset.manual='1';syncCatChips();}
  else if(t.id==='im-file'){var f0=t.files&&t.files[0];if(f0)impFile(f0);}
  else if(t.id==='rc-file'){rcPick(t.files&&t.files[0]);}
  else if(t.id==='rcm-file'){var fm=t.files&&t.files[0];if(fm){var frm=new FileReader();frm.onload=function(){rcImport(String(frm.result||''));};frm.onerror=function(){msg('Dosya okunamadı.',false,'f-rcm');};frm.readAsText(fm);}}
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
  else if(t.id==='tr-qty'||t.id==='tr-price'||t.id==='tr-fee')tradePrev();
  else if(t.id==='rc-amt'){var bt=document.querySelector('[data-act="rc-save"]'),acc=bt&&bt.dataset.id,box=document.getElementById('rc-diff');if(acc&&box){var df=r2(num(t.value)-acctBal(acc));box.innerHTML=Math.abs(df)<0.005?'Fark yok.':'Fark: <b class="num '+(df<0?'exp':'inc')+'">'+(df<0?'−':'+')+moneyIn(Math.abs(df),acc)+'</b>';}}
  else if(t.id==='f-note'&&txType!=='trf'){
    var txt=fold(t.value),sel=document.getElementById('f-cat');
    if(sel&&!sel.dataset.manual){var r=S.rules.filter(function(x){return x.kw&&txt.indexOf(fold(x.kw))>-1;})[0];
      var g=r?null:catGuess(txType,txt,num(val('f-amt'))),rc=r?r.cat:(g&&g.p>=0.5?g.cat:(noteCat(txType,txt.trim())||(txt.trim().length>=3?(function(){var x=smartCat(t.value,txType,num(val('f-amt')));return x==='Diğer'?null:x;})():null)));
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
    try{if(autoPost())render();}catch(e){}
    notifyDue();pushPlan();pullSms();
  }
});
window.addEventListener('pagehide',function(){if(ui.page&&ui.page.k==='note'){saveNote();flushNative();}});
window.addEventListener('hashchange',function(){
  var h=(location.hash||'').slice(1),cur=ui.page;
  if(cur&&cur.k==='note'&&h==='not')return;
  if(h==='planlama'||h==='koc'){if(h==='koc')ui.plan='koc';goSec('plan');return;}
  if(TABH[h]){finishPage();closeSheet();ui.page=null;ui.sub=TABH[h];persistUi();render();window.scrollTo(0,0);return;}
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

/* ---------- banka SMS'lerinden otomatik işlem ----------
   Android uygulaması gelen SMS'leri ham olarak verir; ayrıştırma burada yapılır, böylece yeni banka biçimleri
   APK güncellemeden eklenebilir. Hiçbir SMS cihaz dışına gönderilmez. */
var SMS_SKIP=/(sifre|parola|dogrulama|onay kodu|guvenlik kodu|tek kullanimlik|otp|3d secure|3d sifre|kodunuz|kodu:|code)/;
var SMS_STMT=/(son odeme tarihi|hesap kesim|ekstre|donem borcu|asgari odeme|asgari tutar|borc bilgisi)/;
var SMS_AD=/(kampanya|firsat|kazanma sansi|indirim kodu|basvur|kredi teklif|onayli limit|limitiniz artir|faizsiz|cekilis|hediye|ozel teklif)/;
var SMS_NOTAMT=/(bakiye|limit|kullanilabilir|asgari|toplam borc|bonus|puan|chip|worldpuan|maxipuan|parafpara|kalan)\W{0,3}[^\d]{0,18}$/;
var SMS_STOP={tarihinde:1,tarihli:1,saat:1,saatinde:1,kartinizla:1,kartinizdan:1,kartiniz:1,kartinla:1,kartindan:1,karti:1,kart:1,ile:1,biten:1,sonlanan:1,nolu:1,numarali:1,tl:1,try:1,usd:1,eur:1,tutarinda:1,tutarli:1,tutarindaki:1,islem:1,harcama:1,yapilmistir:1,yaptiniz:1,hesabinizdan:1,hesabiniza:1,taksit:1,taksitli:1,pesin:1,sayin:1,musterimiz:1,de:1,da:1,ve:1,icin:1,olarak:1,bankamatik:1,kredi:1,banka:1,'kartiniz ile':1};
var SMS_CAT=[
 ['Yeme-İçme',/(getir ?yemek|trendyol ?yemek|trendyol ?go|migros ?yemek|yemeksepeti|aksam yemeg|ogle yemeg|yemege|yemek yedi|kahvalti)/],
 ['Ulaşım',/(benzin|mazot|motorin|dizel|\blpg\b|yakit aldim|depoyu doldur)/],
 ['Market',/(migros|a101|\bbim\b|sok market|\bsok\b|carrefour|file market|macrocenter|metro grossmarket|hakmar|onur market|kim market|tarim kredi|getir\b|happy center|bizim toptan)/],
 ['Ulaşım',/(opet|shell|\bbp\b|petrol ofisi|total ?energies|aytemiz|akaryakit|istanbulkart|belbim|\buber\b|bitaksi|\btaksi\b|otopark|\bthy\b|turk hava|pegasus|ajet|obilet|\bido\b|marti|\bhgs\b|\bogs\b|otoyol)/],
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
function smsCat(note,type,amt){return smartCat(note,type,amt);}
function smsCat0(note,type){
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
    /* aynı işlem hem SMS hem uygulama bildirimi olarak gelebilir: 20 dakika içinde aynı tür ve tutar tek sayılır */
    var ts=+m.ts||Date.now(),ch=m.src==='app'?'app':'sms',mf=fold(p.merchant),ti=-1;
    S.sms.recent.some(function(r,i){if(r.k===p.kind&&r.a===p.amt&&r.c===p.ccy&&Math.abs(r.t-ts)<12e5&&r.s!==ch&&(!r.m||!mf||r.m===mf)){ti=i;return true;}return false;});
    if(ti>=0){S.sms.recent.splice(ti,1);return;}
    S.sms.recent.push({k:p.kind,a:p.amt,c:p.ccy,t:ts,s:ch,m:mf});if(S.sms.recent.length>40)S.sms.recent=S.sms.recent.slice(-30);
    var g=smsGuessAcct(p),acc=ACCS(),cash=acc.filter(function(x){return acctType(x)==='nakit';})[0],kart=acc.filter(function(x){return acctType(x)==='kart';})[0];
    var it={id:uid(),key:key,kind:p.kind,oamt:p.amt,occy:p.ccy,date:p.date,note:p.merchant,from:p.from,last4:p.last4,raw:p.raw,acct:g.a,sure:g.sure};
    if(p.kind==='atm'){it.to=cash||'';it.acct=g.sure?g.a:(acc.filter(function(x){return acctType(x)==='banka';})[0]||g.a);}
    if(p.kind==='cardpay'){it.to=kart||'';it.acct=acc.filter(function(x){return acctType(x)==='banka';})[0]||g.a;}
    it.cat=it.kind==='exp'||it.kind==='inc'?smsCat(p.merchant+' '+p.raw,it.kind,it.amt):'Transfer';it.sugCat=it.cat;
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
  if(r.auto)toast(r.auto+' işlem banka mesajından eklendi');
}
window.walletSms=function(){pullSms();};
function smsBanner(){var n=S.sms.pend.length;if(!n)return '';return '<button class="banner smsb" data-act="sms-review"><span class="sic sm" style="--c:var(--accent)">'+ic('msg')+'</span><span class="mid"><b>'+n+' işlem</b> banka mesajlarından bulundu</span><span class="pill">İncele ›</span></button>';}
function smsItem(it){
  var acc=ACCS(),lbl={exp:'Gider',inc:'Gelir',atm:'ATM’den nakit',cardpay:'Kart borcu ödemesi'}[it.kind],trf=it.kind==='atm'||it.kind==='cardpay',cl=it.kind==='inc'?'inc':(trf?'':'exp');
  var cats=it.kind==='inc'?INCC():EXPC();
  return '<div class="card smsit" data-sid="'+it.id+'"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span class="mid"><span class="pill">'+lbl+'</span> <span class="small muted">'+esc(pdate(it.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' · '+esc(it.from||'SMS')+(it.last4?' · *'+esc(it.last4):'')+'</span></span><b class="num '+cl+'">'+(it.kind==='inc'?'+':(trf?'':'−'))+fmtC(it.oamt,it.occy,1)+'</b></div>'
   +(it.dup?'<div class="small" style="color:var(--warn)">Aynı gün aynı tutarda bir işlem zaten var; tekrar olabilir.</div>':'')
   +'<div class="two"><div class="field"><label for="sn-'+it.id+'">Not</label><input id="sn-'+it.id+'" value="'+esc(it.note||'')+'" placeholder="İsteğe bağlı"></div>'
   +(trf?'':'<div class="field"><label for="sc-'+it.id+'">Kategori</label><select id="sc-'+it.id+'">'+optsKeep(cats,it.cat)+'</select></div>')+'</div>'
   +'<div class="two"><div class="field"><label for="sa-'+it.id+'">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="sa-'+it.id+'">'+acctOpts(it.acct)+'</select></div>'
   +(trf?'<div class="field"><label for="st-'+it.id+'">Giriş hesabı</label><select id="st-'+it.id+'">'+acctOpts(it.to,'Seç')+'</select></div>':'')+'</div>'
   +'<details><summary class="small muted">Mesaj metni</summary><p class="small muted" style="margin:4px 0 0;overflow-wrap:anywhere">'+esc(it.raw)+'</p></details>'
   +'<div class="err" id="se-'+it.id+'"></div><div class="two"><button class="btn small" style="width:100%" data-act="sms-add" data-id="'+it.id+'">Ekle</button><button class="btn small ghost" style="width:100%" data-act="sms-skip" data-id="'+it.id+'">Yoksay</button></div></div>';
}
function smsSheet(){
  var l=S.sms.pend;if(!l.length){closeSheet();return;}
  openSheet('<h2>Banka mesajlarından bulunan işlemler</h2><p class="small muted" style="margin:0">Kontrol et, gerekirse hesabı ya da kategoriyi değiştir ve ekle. Seçtiğin hesap bu kart için hatırlanır.</p>'
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
/* banka uygulaması bildirimleri: anahtar kelimeler web tarafında tutulur, yeni banka eklemek için APK güncellemesi gerekmez */
var NTF_KW='bank,banka,garanti,akbank,ykb,yapikredi,iscep,isbank,ziraat,vakif,halkbank,enpara,finansbank,qnb,teb,deniz,ingbank,ingmobil,kuveyt,albaraka,papara,odeabank,fibabanka,sekerbank,anadolubank,hsbc,burgan,aktifbank,emlak,tosla,ininal,walletnfcrel';
function ntfState(){if(nb('ntfState')){try{return NB.ntfState();}catch(e){}}return 'yok';}
function ntfSync(){if(nb('ntfSet')){try{NB.ntfSet(!!S.sms.ntf,NTF_KW+(S.sms.ntfKw?','+S.sms.ntfKw:''));}catch(e){}}}
ACT['ntf-perm']=function(){if(nb('ntfAsk')){try{NB.ntfAsk();}catch(e){}}};
function setOto(){
  var st=smsState(),native=nb('smsQueue'),mk=Object.keys(S.sms.map);
  var main=native?tgl('sms.on','Banka SMS’lerini yakala','Kart harcaması, gelen para, ATM ve kart borcu ödemesi SMS’leri işlem önerisi olur')
      +(st==='granted'?'<div class="small inc">SMS izni verildi.</div>':'<button class="btn ghost" data-act="sms-perm">SMS izni ver</button>'+(st==='denied'?'<div class="small muted">İzin verilemiyorsa: Telefon Ayarları › Uygulamalar › Wallet › sağ üstteki ⋮ › “Kısıtlanmış ayarlara izin ver”, sonra tekrar dene.</div>':''))
      +tgl('sms.auto','Onay beklemeden ekle','Daha önce hesabını eşleştirdiğin kartların harcamaları doğrudan eklenir')
      +'<button class="btn ghost" data-act="sms-scan">Son 30 günün SMS’lerini tara</button><div class="err" id="f-sms"></div>'
    :'<p class="small muted" style="margin:0">Otomatik yakalama Android uygulamasında çalışır. Burada bir banka SMS’ini yapıştırarak tanımayı deneyebilirsin.</p>';
  var nst=ntfState(),ntf=nb('ntfSet')?tgl('sms.ntf','Banka uygulaması bildirimlerini yakala','Garanti, Akbank, İşCep, Ziraat, Enpara, Papara, Google Cüzdan gibi uygulamaların harcama ve para girişi bildirimleri işlem önerisi olur')
      +(nst==='granted'?'<div class="small inc">Bildirim erişimi verildi.</div>':'<button class="btn ghost" data-act="ntf-perm">Bildirim erişimi ver</button><div class="small muted">Açılan ekranda Wallet’ı aç. İzin verilmiyorsa: Telefon Ayarları › Uygulamalar › Wallet › sağ üstteki ⋮ › “Kısıtlanmış ayarlara izin ver”, sonra tekrar dene.</div>')
    :'<p class="small muted" style="margin:0">'+(native?'Bu özellik için Android uygulamasının yeni sürümünü kur.':'Android uygulamasında çalışır.')+'</p>';
  return sec('Banka SMS’lerinden otomatik işlem',main,'SMS’ler yalnızca telefonunda okunur, hiçbir yere gönderilmez. Şifre ve doğrulama kodu içeren mesajlar yok sayılır.')
   +sec('Banka uygulaması bildirimlerinden',ntf,'Yalnızca banka ve ödeme uygulamalarının bildirimlerine bakılır; tutar içermeyenler ve doğrulama kodları yok sayılır. Bulunan işlemler SMS’lerle aynı listede onayını bekler. Aynı işlem hem SMS hem bildirim olarak gelirse bir kez sayılır.')
   +sec('SMS metnini yapıştır','<div class="field"><label for="sms-from">Gönderen</label><input id="sms-from" placeholder="Örn. AKBANK"></div><div class="field"><label for="sms-txt">Mesaj</label><textarea id="sms-txt" placeholder="Bankadan gelen harcama ya da para girişi SMS’ini buraya yapıştır"></textarea></div><div class="err" id="f-sms2"></div><button class="btn ghost" data-act="sms-parse">Çözümle ve ekle</button>','Tanınmayan bir mesaj olursa bana gönder; biçimi eklenir.')
   +(mk.length?sec('Kart ve hesap eşleşmeleri','<div class="list">'+mk.map(function(k){var p=k.split('|');return '<div class="item"><span class="mid"><div class="t">'+esc(p[0].toLocaleUpperCase('tr-TR'))+(p[1]?' · *'+esc(p[1]):'')+'</div><div class="small muted">'+esc(S.sms.map[k])+'</div></span><button class="btn small ghost" data-act="sms-map-del" data-id="'+esc(k)+'">Sil</button></div>';}).join('')+'</div>','Eklediğin her SMS işleminde seçtiğin hesap bu karta bağlanır.'):'');
}

/* ---------- Piyasalar: arama, takip listesi, yatırımları piyasa fiyatına bağlama ----------
   Kaynaklar: Truncgil (döviz, altın, BIST 100), İş Yatırım (Borsa İstanbul hisseleri, ~15 dk gecikmeli),
   CoinGecko (kripto), Yahoo Finance (yabancı borsalar, deneysel), TEFAS (fonlar, deneysel).
   Yedek ve geçmiş: Frankfurter (Avrupa Merkez Bankası günlük referans kurları; anahtarsız, tarayıcıdan erişilebilir):
   Truncgil'e ulaşılamazsa USD/EUR/GBP/CHF kuru buradan alınır; döviz grafiği tarayıcıda da buradan çizilir.
   Takip listesindeki her kalemin son 30 günlük kapanışı cihazda tutulur (küçük grafik).
   Tarayıcı İş Yatırım, Yahoo ve TEFAS'a doğrudan erişemez; bunlar Android uygulamasının yerel köprüsüyle alınır.
   Anahtar biçimi: kaynak:sembol (fx:USD, bist:THYAO, fon:AFT, cg:bitcoin, yh:AAPL). */
var MSRC={fx:'Döviz ve altın',bist:'Borsa İstanbul',fon:'Yatırım fonu',cg:'Kripto',yh:'Yabancı borsa'};
var MGOLD={GRA:'Gram altın',CEYREKALTIN:'Çeyrek altın',YARIMALTIN:'Yarım altın',TAMALTIN:'Tam altın',CUMHURIYETALTINI:'Cumhuriyet altını',ATAALTIN:'Ata altın','14AYARALTIN':'14 ayar altın','18AYARALTIN':'18 ayar altın',YIA:'22 ayar bilezik',IKIBUCUKALTIN:'İkibuçuk altın',BESLIALTIN:'Beşli altın',GREMSEALTIN:'Gremse altın',RESATALTIN:'Reşat altın',HAMITALTIN:'Hamit altın',GUMUS:'Gram gümüş',ONS:'Ons altın',BRENT:'Brent petrol',XU100:'BIST 100 endeksi'};
var MUNIT={ONS:'USD',BRENT:'USD',XU100:'pt'};
/* uygulamanın kendi kur alanlarıyla eşleşenler (yatırım eklerken mevcut kur bağlantısı kullanılır) */
var MFXK={USD:'USD',EUR:'EUR',GBP:'GBP',CHF:'CHF',GRA:'XAU',GUMUS:'XAG',CEYREKALTIN:'CEY'};
var MSUG=[['fx:USD','Dolar'],['fx:EUR','Euro'],['fx:GRA','Gram altın'],['fx:CEYREKALTIN','Çeyrek altın'],['fx:XU100','BIST 100'],['cg:bitcoin','Bitcoin'],['fx:GUMUS','Gram gümüş'],['fx:ONS','Ons altın']];
var FXALL=null,FXALLT=0,BIST=null,BISTM=null,BISTP=null,MCAND={},mAsync={},mTimer=0,mCur=null;
var DNC=null;try{DNC=new Intl.DisplayNames(['tr'],{type:'currency'});}catch(e){}
function mk(k){k=String(k||'');var i=k.indexOf(':');return {src:k.slice(0,i),sym:k.slice(i+1)};}
function fxName(s){if(MGOLD[s])return MGOLD[s];var o=FXALL&&FXALL[s];if(o&&o.Type==='Palladium')return 'Paladyum';if(o&&o.Type==='Platinum')return 'Platin';
  try{var n=DNC&&DNC.of(s);if(n&&n!==s)return n.charAt(0).toLocaleUpperCase('tr-TR')+n.slice(1);}catch(e){}return s;}
function mW(k){return S.watch.filter(function(w){return w.k===k;})[0]||null;}
function mName(k){var w=mW(k),q=S.quotes[k],c=MCAND[k],m=mk(k);
  if(m.src==='fon')return (q&&q.n)||(w&&w.n)||m.sym+' fonu';
  return (w&&w.n)||(c&&c.n)||(q&&q.n)||(m.src==='fx'?fxName(m.sym):m.sym);}
function mSym(k){var w=mW(k),c=MCAND[k],m=mk(k);return String((w&&w.s)||(c&&c.s)||m.sym).toUpperCase();}
function mSub(k){var m=mk(k),s=mSym(k);return (m.src==='fx'&&MGOLD[m.sym]?'':s+' · ')+MSRC[m.src];}
/* son fiyat: önce indirilen değer, döviz ve altında uygulamanın kendi kurları yedek olur */
function mQ(k){var q=S.quotes[k];if(q&&q.p>0)return q;var m=mk(k);
  if(m.src==='fx'){var f=MFXK[m.sym];if(f&&+S.fx[f]>0)return {p:+S.fx[f],c:S.fxChg?S.fxChg[f]:null,ccy:'TRY',ts:S.fxTs||0};
    if(m.sym==='XU100'&&S.mkt&&S.mkt.BIST&&S.mkt.BIST.price>0)return {p:S.mkt.BIST.price,c:S.mkt.BIST.chg,ccy:'pt',ts:S.fxTs||0};}
  return q||null;}
function rateAny(c){if(!c||c==='TRY')return 1;var r=rateOf(c);if(r>0)return r;var o=FXALL&&FXALL[c];return o?rPrice(o):0;}
/* yatırım değeri için TL fiyat; endeks (pt) bir fiyat değildir */
function mTL(k){var q=mQ(k);if(!q||!(q.p>0)||q.ccy==='pt')return 0;var r=rateAny(q.ccy||'TRY');return r>0?q.p*r:0;}
var PXF={};function pxf(d){if(!PXF[d])PXF[d]=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d});return PXF[d];}
function fmtPx(p,u,k){if(!(p>0))return '—';var fx=k&&mk(k).src==='fx'&&u!=='pt',d=p>=1e5?0:(p<1?4:(fx&&p<100?4:2));
  var sy={TRY:'₺',USD:'$',EUR:'€',GBP:'£'}[u];return (u==='pt'?'':(sy||''))+pxf(d).format(p)+(sy||u==='pt'?'':' '+u);}
function pctTxt(c){return (c>=0?'+':'−')+'%'+NUM2.format(Math.abs(c));}
function chgSpan(c){return c!=null&&isFinite(c)?'<span class="small num '+(c>0.0049?'inc':(c<-0.0049?'exp':'muted'))+'">'+pctTxt(c)+'</span>':'';}

/* ---------- ağ ---------- */
var hreq={},hseq=0;
window.walletHttp=function(id,code,text){var f=hreq[id];if(f){delete hreq[id];f(+code||0,text);}};
function canNet(){return nb('http');}
/* o.cors: tarayıcı da doğrudan alabilir (CoinGecko gibi) */
function nget(url,o){o=o||{};return new Promise(function(ok,no){
  if(canNet()&&!o.web){var id='h'+(++hseq)+'_'+Date.now(),tm=setTimeout(function(){delete hreq[id];no(new Error('zaman aşımı'));},o.timeout||20000);
    hreq[id]=function(code,text){clearTimeout(tm);if(code>=200&&code<300&&text!=null)ok(text);else no(new Error('http '+code));};
    try{NB.http(id,url,o.method||'GET',o.body||'',JSON.stringify(o.headers||{}));}catch(e){clearTimeout(tm);delete hreq[id];no(e);}return;}
  if(!o.cors){no(new Error('yalnızca uygulamada'));return;}
  fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.text();}).then(ok,no);});}
function njson(url,o){return nget(url,o).then(function(t){return JSON.parse(t);});}
/* tarayıcı doğrulaması isteyen sayfa: görünmez WebView'da açılır, 'need' metni görünene kadar beklenir */
/* aynı anda tek görünmez sayfa: site, arka arkaya gelen paralel istekleri bot sanabilir */
var webQ=Promise.resolve();
function nweb1(url,need,ms){return new Promise(function(ok,no){
  if(!nb('webText')){no(new Error('yalnızca uygulamada'));return;}
  var id='w'+(++hseq)+'_'+Date.now(),tm=setTimeout(function(){delete hreq[id];no(new Error('zaman aşımı'));},(ms||25000)+10000);
  hreq[id]=function(code,text){clearTimeout(tm);var o=null;try{o=JSON.parse(text);}catch(e){}
    if(o&&(code===200||String(o.t||'').indexOf(need)>-1))ok(o);
    else no(new Error(!o?'sayfa açılamadı':(/Request Rejected|rejected/i.test(o.t||'')?'site isteği reddetti':'sayfada fiyat yok')));};
  try{NB.webText(id,url,need,ms||25000);}catch(e){clearTimeout(tm);delete hreq[id];no(e);}});}
function nweb(url,need,ms){var run=webQ.then(function(){return nweb1(url,need,ms).catch(function(e){
    if(/yalnızca|reddetti/.test(e.message))throw e;return new Promise(function(r){setTimeout(r,2500);}).then(function(){return nweb1(url,need,ms);});});});
  webQ=run.catch(function(){});return run;}
function bistList(){if(BIST)return Promise.resolve(BIST);
  if(!BISTP)BISTP=fetch('bist.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('yok');return r.json();}).then(function(j){BIST=j&&Array.isArray(j.l)?j:{l:[]};BISTM={};BIST.l.forEach(function(x){BISTM[x[0]]=x;});return BIST;}).catch(function(){BISTP=null;return {l:[]};});
  return BISTP;}
function fxAll(force){if(FXALL&&Date.now()-FXALLT<(force?30000:300000))return Promise.resolve(FXALL);return refreshRates({force:true}).then(function(){return FXALL||{};});}

/* ---------- fiyat kaynakları ---------- */
var ISY='https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/',CG='https://api.coingecko.com/api/v3/',YH='https://query1.finance.yahoo.com/';
function isoTs(s){s=String(s||'').replace(/([+-]\d{2})$/,'$1:00');var t=Date.parse(s);return isNaN(t)?Date.now():t;}
function isIdx(s){return /^X[A-Z0-9]{2,5}$/.test(s)&&!(BISTM&&BISTM[s]);}
function qBist(s){
  if(!canNet())return bistList().then(function(j){var x=BISTM&&BISTM[s];if(!x||!(x[3]>0))throw new Error('yalnızca uygulamada');return {p:x[3],c:null,ccy:'TRY',at:isoTs(j.u),site:1};});
  return njson(ISY+'OneEndeks?endeks='+encodeURIComponent(s)).then(function(a){var x=a&&a[0];if(!x||!(+x.last>0))throw new Error('bulunamadı');var pv=+x.dayClose||0;
    return {p:+x.last,prev:pv,c:pv>0?(x.last/pv-1)*100:null,hi:+x.high||0,lo:+x.low||0,ccy:isIdx(s)?'pt':'TRY',at:isoTs(x.updateDate)};});}
function qCg(ids){return njson(CG+'simple/price?ids='+ids.map(encodeURIComponent).join(',')+'&vs_currencies=try&include_24hr_change=true&include_last_updated_at=true',{cors:1}).then(function(j){var o={};
  ids.forEach(function(id){var x=j&&j[id];if(x&&+x['try']>0)o[id]={p:+x['try'],c:x.try_24h_change!=null?+x.try_24h_change:null,ccy:'TRY',at:(+x.last_updated_at||0)*1000||Date.now()};});return o;});}
function yhCcy(c){return c==='GBp'?{c:'GBP',d:100}:(c==='ZAc'?{c:'ZAR',d:100}:(c==='ILA'?{c:'ILS',d:100}:{c:c||'USD',d:1}));}
function yhChart(s,range){return njson(YH+'v8/finance/chart/'+encodeURIComponent(s)+'?range='+range+'&interval=1d').then(function(j){var r=j&&j.chart&&j.chart.result&&j.chart.result[0];if(!r)throw new Error('bulunamadı');return r;});}
function yhCloses(r){var ts=r.timestamp||[],cl=(r.indicators&&r.indicators.quote&&r.indicators.quote[0]&&r.indicators.quote[0].close)||[],d=yhCcy((r.meta||{}).currency).d,out=[];
  ts.forEach(function(t,i){if(cl[i]!=null&&cl[i]>0)out.push([t*1000,cl[i]/d]);});return out;}
function qYh(s){return yhChart(s,'5d').then(function(r){var m=r.meta||{},cc=yhCcy(m.currency),cl=yhCloses(r),p=(+m.regularMarketPrice||0)/cc.d||(cl.length?cl[cl.length-1][1]:0),pv=cl.length>=2?cl[cl.length-2][1]:0;
  if(!(p>0))throw new Error('bulunamadı');return {p:p,prev:pv,c:pv>0?(p/pv-1)*100:null,hi:(+m.regularMarketDayHigh||0)/cc.d,lo:(+m.regularMarketDayLow||0)/cc.d,ccy:cc.c,at:(+m.regularMarketTime||0)*1000||Date.now(),n:m.longName||m.shortName||''};});}
/* Frankfurter (ECB): v2 yanıtı satır dizisidir [{date,base,quote,rate}]; eski v1 biçimi {rates:{..}} de okunur */
var FRK='https://api.frankfurter.dev/v2/',FRKC=['USD','EUR','GBP','CHF'];
function frkRows(j){if(Array.isArray(j))return j.filter(function(x){return x&&x.quote&&+x.rate>0;});
  if(j&&j.rates&&typeof j.rates==='object'){var out=[];Object.keys(j.rates).forEach(function(k){var v=j.rates[k];if(v&&typeof v==='object')Object.keys(v).forEach(function(q){out.push({date:k,base:j.base,quote:q,rate:+v[q]});});else out.push({date:j.date,base:j.base,quote:k,rate:+v});});return out.filter(function(x){return x.rate>0;});}
  return [];}
/* 1 birim döviz kaç TL: taban TRY ile alınıp çevrilir */
function frkLatest(){return njson(FRK+'rates?base=TRY&quotes='+FRKC.join(','),{cors:1,web:1,timeout:12000}).then(function(j){var o={date:''};
  frkRows(j).forEach(function(x){var q=String(x.quote).toUpperCase();if(FRKC.indexOf(q)>=0&&x.rate>0){o[q]=r2(1/x.rate*1e4)/1e4;if(x.date>o.date)o.date=x.date;}});if(!(o.USD>0))throw new Error('kur yok');return o;});}
function frkHist(c,days){var d=new Date();d.setDate(d.getDate()-days);
  return njson(FRK+'rates?base='+c+'&quotes=TRY&from='+isoDate(d),{cors:1,web:1}).then(function(j){return frkRows(j).filter(function(x){return String(x.quote).toUpperCase()==='TRY';}).map(function(x){return [pdate(x.date).getTime(),+x.rate];}).sort(function(a,b){return a[0]-b[0];});});}
/* TEFAS fon sayfası metninden son fiyat, günlük getiri ve fon adı */
function fonParse(t,s){
  var L=String(t||'').split(/\n+/).map(function(x){return x.replace(/\s+/g,' ').trim();}).filter(Boolean);
  var after=function(re){for(var i=0;i<L.length;i++){if(!re.test(L[i]))continue;var rest=L[i].replace(re,'').match(/%?\s*-?\s*%?\s*\d[\d.]*(?:,\d+)?/);if(rest)return rest[0];
    for(var j=i+1;j<Math.min(L.length,i+4);j++){var m=L[j].match(/^%?\s*-?\s*%?\s*\d[\d.]*(?:,\d+)?/);if(m)return m[0];}}return null;};
  var ps=after(/Son Fiyat\s*(\(TL\))?\s*:?/i),p=ps?num(ps.replace(/[%\s]/g,'')):0;if(!(p>0))throw new Error('fiyat bulunamadı');
  var cs=after(/Günlük Getiri\s*(\(%\))?\s*:?/i),c=cs!=null?num(cs.replace(/[%\s]/g,'')):null,nm='';
  for(var i=0;i<L.length;i++){var x=L[i];if(/\bFON(U|LARI)?\b/.test(x)&&x.length>12&&x.length<160&&x===x.toLocaleUpperCase('tr-TR')){nm=x.replace(new RegExp('^'+s+'\\s*[-–]\\s*'),'');break;}}
  return {p:p,c:c,ccy:'TRY',at:Date.now(),n:nm?titleTr(nm):''};}
function qFon(s){return nweb('https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod='+encodeURIComponent(s),'Son Fiyat',25000).then(function(o){return fonParse(o.t,s);});}

/* ---------- küçük grafik için yerel geçmiş: gün başına son fiyat, en çok 30 gün ---------- */
function qHist(h,day,p){h=Array.isArray(h)?h.filter(function(x){return Array.isArray(x)&&x[1]>0;}):[];if(!(p>0))return h;
  if(h.length&&h[h.length-1][0]===day)h[h.length-1]=[day,p];else if(!h.length||h[h.length-1][0]<day)h.push([day,p]);
  return h.slice(-30);}
/* ayrıntı grafiği geldiğinde son 30 günün kapanışları yerel geçmişe eklenir */
function qSeed(k,pts){var q=S.quotes[k];if(!q||!pts||!pts.length)return;var m={};(q.h||[]).forEach(function(x){m[x[0]]=x[1];});
  var from=new Date();from.setDate(from.getDate()-31);var fs=isoDate(from);pts.forEach(function(x){var d=isoDate(new Date(x[0]));if(d>=fs&&!(d in m))m[d]=x[1];});
  q.h=Object.keys(m).sort().map(function(d){return [d,m[d]];}).slice(-30);}
function sparkSvg(h,w,hh){if(!h||h.length<3)return '';var v=h.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=w||60,H=hh||22;
  var pts=v.map(function(y,i){return (i/(v.length-1)*W).toFixed(1)+','+(H-2-(y-mn)/rg*(H-4)).toFixed(1);}).join(' '),col=v[v.length-1]>=v[0]?'var(--inc)':'var(--exp)';
  return '<svg class="msp" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';}
/* ne kadar önce: "az önce", "12 dk önce", "3 sa önce", "dün", tarih */
function ago(t){if(!t)return '';var d=(Date.now()-t)/6e4;if(d<1.5)return 'az önce';if(d<60)return Math.round(d)+' dk önce';if(d<24*60)return Math.round(d/60)+' sa önce';
  var a=today0(),b=new Date(t);b=new Date(b.getFullYear(),b.getMonth(),b.getDate());var dd=Math.round((a-b)/864e5);return dd===1?'dün':new Date(t).toLocaleDateString('tr-TR',{day:'numeric',month:'short'});}
/* eski veri: fon günde bir açıklandığından 30 saat, diğerleri 2 saat */
function qStale(k,q){if(!q||!q.ts)return true;return Date.now()-q.ts>(mk(k).src==='fon'?30:2)*36e5;}
function offline(){try{return navigator.onLine===false;}catch(e){return false;}}
/* ---------- yenileme ---------- */
function mKeys(){var ks=S.watch.map(function(w){return w.k;});S.holdings.forEach(function(h){if(h.mk&&ks.indexOf(h.mk)<0)ks.push(h.mk);});(S.ptgt||[]).forEach(function(x){if(!x.hit&&ks.indexOf(x.k)<0)ks.push(x.k);});return ks;}
/* takipte ve yatırımda olmayan fiyatları siler (açık ayrıntı penceresindeki hariç) */
function mPrune(){var ks=mKeys();if(mCur&&sheetOpen())ks.push(mCur.k);Object.keys(S.quotes).forEach(function(k){if(ks.indexOf(k)<0)delete S.quotes[k];});}
var mRun=null;
/* opt.keys: yalnızca bunlar; opt.force: yeni olsa da yenile; opt.fon: fonları da (günde bir değiştikleri için normalde 3 saatte bir) */
function refreshMarket(opt){
  opt=opt||{};if(mRun&&!opt.keys)return mRun;
  var now=Date.now(),ks=(opt.keys||mKeys()).filter(function(k){var q=S.quotes[k],age=q?now-(q.ts||0):1e13,src=mk(k).src;
    if(!MSRC[src])return false;if(src==='fon'&&!opt.fon&&!opt.keys&&age<3*36e5)return false;return opt.force||age>60000;});
  if(!ks.length)return Promise.resolve({ok:true,n:0,bad:0});
  var by={},n=0,bad=0,errs={};ks.forEach(function(k){var m=mk(k);(by[m.src]=by[m.src]||[]).push(m.sym);});
  var put=function(k,q){var o=S.quotes[k]||{};q.ts=Date.now();if(!q.n&&o.n)q.n=o.n;q.h=qHist(o.h,isoDate(new Date(q.at||q.ts)),q.p);delete q.err;S.quotes[k]=q;n++;
    S.holdings.forEach(function(h){if(h.mk===k){var tl=mTL(k);if(tl>0)h.price=r2(tl*1e4)/1e4;}});};
  var fail=function(k,e){var q=S.quotes[k];if(q)q.err=1;errs[k]=String(e&&e.message||e||'hata');bad++;};
  var jobs=[];
  /* Truncgil'e ulaşılamadıysa uygulamanın (yedek kaynaktan alınmış) güncel kuru kullanılır */
  var fxBack=function(s){var f=MFXK[s];if(f&&+S.fx[f]>0&&S.fxTs&&Date.now()-S.fxTs<36e5){put('fx:'+s,{p:+S.fx[f],c:S.fxChg?S.fxChg[f]:null,ccy:'TRY',at:S.fxTs,src:S.fxSrc||''});return true;}return false;};
  if(by.fx)jobs.push(fxAll(opt.force).then(function(a){by.fx.forEach(function(s){var o=a&&a[s],p=rPrice(o);if(p>0)put('fx:'+s,{p:p,c:rChg(o),ccy:MUNIT[s]||'TRY',at:FXALLT||Date.now()});else if(!fxBack(s))fail('fx:'+s,'kur yok');});},function(e){by.fx.forEach(function(s){if(!fxBack(s))fail('fx:'+s,e);});}));
  if(by.bist)jobs.push(bistList().then(function(){return Promise.all(by.bist.map(function(s){return qBist(s).then(function(q){put('bist:'+s,q);},function(e){fail('bist:'+s,e);});}));}));
  if(by.cg)jobs.push(qCg(by.cg).then(function(o){by.cg.forEach(function(s){if(o[s])put('cg:'+s,o[s]);else fail('cg:'+s,'bulunamadı');});},function(e){by.cg.forEach(function(s){fail('cg:'+s,e);});}));
  if(by.yh)jobs.push(Promise.all(by.yh.map(function(s){return qYh(s).then(function(q){put('yh:'+s,q);},function(e){fail('yh:'+s,e);});})));
  /* fonlar sırayla: her biri görünmez bir sayfa açar */
  if(by.fon)jobs.push(by.fon.reduce(function(pr,s){return pr.then(function(){return qFon(s).then(function(q){put('fon:'+s,q);},function(e){fail('fon:'+s,e);});});},Promise.resolve()));
  /* her kaynak bitince kaydedilir: yavaş bir kaynak (ör. kripto) diğerlerinin yeni fiyatlarını bekletmesin */
  jobs=jobs.map(function(j){return j.then(function(){if(n)save();});});
  var run=Promise.all(jobs).then(function(){if(!opt.keys)mPrune();save();try{mTgtCheck();}catch(e){}return {ok:n>0||!bad,n:n,bad:bad,errs:errs};},function(){return {ok:false,n:n,bad:bad,errs:errs};});
  if(!opt.keys){mRun=run;run.then(function(){mRun=null;});}
  return run;
}
function mUpd(){var e=document.getElementById('mres');if(e)e.innerHTML=mBody();}
function mAfter(){if(ui.page&&ui.page.k==='piyasa'){if(!sheetOpen()&&!busy())render();else mUpd();}else if(!ui.page&&!busy()&&ui.sub==='servet')render();}

/* ---------- arama ---------- */
function mLocal(q){
  var f=fold(q).trim(),Q=q.trim().toLocaleUpperCase('tr-TR').replace(/İ/g,'I').replace(/\s+/g,''),out=[];if(!f)return out;
  var fk=Object.keys(MGOLD).concat(FXK.filter(function(k){return k.length===3&&k!=='XAU'&&k!=='XAG'&&k!=='CEY';}));
  if(FXALL)Object.keys(FXALL).forEach(function(k){if(fk.indexOf(k)<0&&/^[A-Z0-9]{3,20}$/.test(k)&&k!=='DBITCOIN')fk.push(k);});
  fk.forEach(function(k){var n=fxName(k);if(fold(n+' '+k+(k==='USD'?' dolar':'')+(k==='EUR'?' avro':'')).indexOf(f)>-1)out.push({k:'fx:'+k,n:n,s:k});});
  out=out.slice(0,8);
  if(BIST){var b=[];BIST.l.forEach(function(x){var fn=fold(x[1]),sc=x[0]===Q?0:(x[0].indexOf(Q)===0?1:(fn.indexOf(f)===0?2:(fn.indexOf(' '+f)>-1?3:(fn.indexOf(f)>-1?4:-1))));if(sc>=0)b.push([sc,x]);});
    b.sort(function(a,c){return a[0]-c[0]||(a[1][0]<c[1][0]?-1:1);});b.slice(0,10).forEach(function(z){out.push({k:'bist:'+z[1][0],n:z[1][1],s:z[1][0]});});}
  if(/^[A-Z0-9]{3}$/.test(Q))out.push({k:'fon:'+Q,n:Q+' fonu',s:Q});
  if(/^X[A-Z0-9]{2,5}$/.test(Q)&&!(BISTM&&BISTM[Q])&&Q!=='XU100')out.push({k:'bist:'+Q,n:Q+' endeksi',s:Q});
  return out;}
function mRemote(q){
  var key=fold(q).trim();if(key.length<2||mAsync[key])return;mAsync[key]={busy:1,l:[]};
  var add=function(l){var a=mAsync[key];a.l=a.l.concat(l);};
  var j1=njson(CG+'search?query='+encodeURIComponent(q.trim()),{cors:1}).then(function(j){add(((j&&j.coins)||[]).slice(0,6).map(function(c){return {k:'cg:'+c.id,n:c.name,s:c.symbol};}));},function(){});
  var j2=canNet()?njson(YH+'v1/finance/search?q='+encodeURIComponent(q.trim())+'&quotesCount=8&newsCount=0&lang=tr-TR').then(function(j){
    add(((j&&j.quotes)||[]).filter(function(x){return x.symbol&&/^(EQUITY|ETF|INDEX|MUTUALFUND)$/.test(x.quoteType)&&!/\.IS$/.test(x.symbol);}).slice(0,6).map(function(x){return {k:'yh:'+x.symbol,n:x.longname||x.shortname||x.symbol,s:x.symbol,x:x.exchDisp||''};}));},function(){}):Promise.resolve();
  Promise.all([j1,j2]).then(function(){mAsync[key].busy=0;if(fold(ui.mq||'').trim()===key)mUpd();});
}
function mResults(){
  var q=ui.mq||'',key=fold(q).trim(),l=mLocal(q),a=mAsync[key],seen={};
  if(a)l=l.concat(a.l);
  l=l.filter(function(x){if(seen[x.k])return false;seen[x.k]=1;return true;});
  l.forEach(function(x){MCAND[x.k]=x;});
  var g={};l.forEach(function(x){var s=mk(x.k).src;(g[s]=g[s]||[]).push(x);});
  var h=['fx','bist','fon','cg','yh'].filter(function(s){return g[s];}).map(function(s){
    return '<div class="lbl" style="margin:4px 2px 0">'+MSRC[s]+'</div><div class="card" style="padding-top:4px;padding-bottom:4px"><div class="list">'+g[s].map(function(x){
      var inW=!!mW(x.k),sub=s==='fon'?'TEFAS fon kodu':(x.s?String(x.s).toUpperCase():'')+(x.x?' · '+x.x:'');
      return '<button class="item" data-act="m-pick" data-id="'+esc(x.k)+'"><span class="mid"><div class="t">'+esc(x.n)+'</div><div class="small muted ell">'+esc(sub)+'</div></span>'+(inW?'<span class="small inc">Takipte</span>':ic('r'))+'</button>';}).join('')+'</div></div>';}).join('');
  if(a&&a.busy)h+='<div class="small muted" style="text-align:center">Kripto ve yabancı borsalarda aranıyor…</div>';
  if(!h)h='<div class="empty">Sonuç yok. Hisse kodu (THYAO), fon kodu (AFT), döviz (dolar) ya da kripto adı (bitcoin) yazabilirsin.</div>';
  if(!canNet())h+='<div class="small muted">Borsa İstanbul’un anlık fiyatı, yabancı borsalar ve fonlar yalnızca Android uygulamasında alınabilir; tarayıcıda hisseler gecikmeli kapanış fiyatıyla görünür.</div>';
  return h;}

/* ---------- takip listesi sayfası ---------- */
function mRow(k,i,n){var q=mQ(k),u=q&&q.ccy||'TRY',st=q&&q.p>0&&qStale(k,q),hd=mHeld(k);
  if(ui.medit)return '<div class="item mrow">'+mBadge(k)+'<span class="mid"><div class="t">'+esc(mName(k))+'</div><div class="small muted ell">'+esc(mSub(k))+'</div></span><span class="medit"><button class="icon-btn sm" data-act="m-up" data-id="'+esc(k)+'" aria-label="Yukarı taşı"'+(i===0?' disabled':'')+'>'+ic('l')+'</button><button class="icon-btn sm" data-act="m-down" data-id="'+esc(k)+'" aria-label="Aşağı taşı"'+(i===n-1?' disabled':'')+'>'+ic('r')+'</button><button class="icon-btn sm" data-act="m-del" data-id="'+esc(k)+'" aria-label="Takipten çıkar">'+ic('x')+'</button></span></div>';
  return '<button class="item mrow" data-act="m-open" data-id="'+esc(k)+'">'+mBadge(k)+'<span class="mid"><div class="t ell">'+esc(mName(k))+(mTargets(k).length?' <span class="mtg" title="Fiyat hedefi var">'+ic('flag')+'</span>':'')+'</div><div class="small muted ell">'+(hd?'<span class="mheld">Sende '+esc(hd.q)+'</span> · ':'')+esc(mSub(k))+'</div></span>'
   +'<span class="msp">'+sparkSvg(q&&q.h,52,22)+'</span><span class="mq"><span class="num">'+(q&&q.p>0?fmtPx(q.p,u,k):'—')+'</span>'+(q?chgPill(q.c):'')+(q&&q.p>0&&(q.err||st)?'<span class="small muted">'+esc(ago(q.ts))+'</span>':'')+'</span></button>';}
/* verinin kaynaktaki zamanı (at); yoksa alındığı an. "az önce" yalnız gerçekten yeni veri için */
function mLast(){var t=0;S.watch.forEach(function(w){var q=mQ(w.k),v=q&&(q.at||q.ts);if(v>t)t=v;});return t;}
function mWatch(){
  var n=S.watch.length,cats=mCats(),cf=cats.indexOf(ui.mcat)>=0?ui.mcat:'',list=S.watch.filter(function(w){return !cf||mk(w.k).src===cf;});
  var h=ui.medit?'':mConv()+mMovers();
  h+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="lbl">Takip listem</span><span style="display:flex;gap:6px">'+(n?'<button class="btn small ghost" data-act="m-edit" aria-pressed="'+!!ui.medit+'">'+(ui.medit?'Bitti':'Düzenle')+'</button>':'')+(ui.medit?'':'<button class="btn small ghost" data-act="m-refresh">'+ic('refresh')+' Yenile</button>')+'</span></div>';
  if(cats.length>1&&!ui.medit)h+='<div class="chips mcats" role="group" aria-label="Takip listesini süz">'+[['','Tümü']].concat(cats.map(function(c){return [c,MCATN[c]];})).map(function(x){return '<button class="chip" data-act="m-cat" data-v="'+x[0]+'" aria-pressed="'+(cf===x[0])+'">'+esc(x[1])+'</button>';}).join('')+'</div>';
  var all=ui.medit?S.watch:list;
  h+=n?'<div class="card" style="padding-top:4px;padding-bottom:4px"><div class="list">'+all.map(function(w,i){return mRow(w.k,i,all.length);}).join('')+'</div></div>':'<div class="empty">Takip listen boş. Yukarıdan arayıp ekleyebilirsin.</div>';
  var sug=MSUG.filter(function(x){return !mW(x[0]);});
  if(sug.length&&!ui.medit)h+='<div class="lbl" style="margin:4px 2px 0">Hızlı ekle</div><div class="chips">'+sug.map(function(x){return '<button class="chip" data-act="m-sug" data-id="'+x[0]+'">+ '+esc(x[1])+'</button>';}).join('')+'</div>';
  var t=mLast();h+='<div class="small muted" id="m-ts">'+(t?'Veri zamanı: '+esc(fmtTs(t))+' ('+esc(ago(t))+')':'')+(S.fxSrc==='ecb'?' · döviz yedek kaynaktan (ECB günlük referans kuru)':'')+'</div>';
  h+='<details class="msrc"><summary class="small">Kaynaklar ve gecikmeler</summary><p class="small muted" style="margin:6px 0 0">Döviz, altın ve BIST 100: Truncgil (ulaşılamazsa döviz Avrupa Merkez Bankası günlük kuru, Frankfurter üzerinden). Borsa İstanbul hisseleri: İş Yatırım (yaklaşık 15 dk gecikmeli). Kripto: CoinGecko. Yabancı borsalar: Yahoo Finance. Fonlar: TEFAS (fon fiyatı günde bir açıklanır). Küçük grafikler son 30 günün cihazda tutulan kapanışlarıdır. Bilgi amaçlıdır, yatırım tavsiyesi değildir.</p></details>';
  return h;}
function mBody(){return (ui.mq||'').trim()?mResults():mWatch();}
function offBanner(){if(!offline())return '';var t=mLast();return '<div class="banner"><span>Çevrimdışısın. '+(t?'Gösterilen fiyatlar '+esc(fmtTs(t))+' tarihli.':'Fiyatlar internet gelince alınır.')+'</span></div>';}
function vPiyasa(){
  var lk=ui.mlink&&byId(S.holdings,ui.mlink);
  return offBanner()+(lk?'<div class="banner"><span>“'+esc(lk.name)+'” için fiyat kaynağı seç: ara ve sonuca dokun.</span><button class="btn small ghost" data-act="m-linkoff">Vazgeç</button></div>':'')
   +'<div class="search">'+ic('search')+'<input id="mq" type="search" placeholder="Hisse, fon, döviz, altın, kripto ara" value="'+esc(ui.mq||'')+'" aria-label="Piyasalarda ara" autocomplete="off" autocapitalize="characters"></div>'
   +'<div id="mres" class="stack" style="gap:10px">'+mBody()+'</div>';}
function mTile(k){var q=mQ(k);return '<span class="rt"><span class="lbl ell">'+esc(mk(k).src==='fx'?mName(k).replace(' endeksi',''):mSym(k))+'</span><span class="num">'+(q&&q.p>0?fmtPx(q.p,q.ccy||'TRY',k):'—')+'</span>'+(q?chgSpan(q.c):'')+'</span>';}
/* Ana sayfa şeridi: takip listesinin ilk dördü, değişim yüzdesi ve küçük grafik */
function mStrip(){var l=S.watch.slice(0,4),t=mLast();if(!l.length)return '';
  return '<button class="card mstrip" data-act="open-mkt" aria-label="Piyasalar"><span class="mhead"><b>Piyasalar</b><span class="small muted">'+(offline()?'Çevrimdışı · ':'')+(t?esc(ago(t)):'fiyatlar alınıyor')+' ›</span></span><span class="rgrid">'+l.map(function(w){var q=mQ(w.k);return '<span class="rt"><span class="lbl ell">'+esc(mk(w.k).src==='fx'?mName(w.k).replace(' endeksi',''):mSym(w.k))+'</span><span class="num">'+(q&&q.p>0?fmtPx(q.p,q.ccy||'TRY',w.k):'—')+'</span><span class="rtb">'+(q?chgSpan(q.c):'')+sparkSvg(q&&q.h,44,16)+'</span></span>';}).join('')+'</span></button>';}
/* Yatırımlar sekmesindeki bağlantı */
function mCard(){var t=mLast();
  return '<button class="setcard" data-act="open-mkt"><span class="sic" style="--c:var(--blue)">'+ic('pulse')+'</span><span class="mid"><div class="t">Piyasalar ve takip listem</div><div class="small muted">'+(t?'Son güncelleme '+esc(ago(t)):'Hisse, fon, döviz, altın ve kripto ara')+'</div></span>'+ic('r')+'</button>';}

/* ---------- ayrıntı penceresi ve grafik ---------- */
function mUrl(k){var m=mk(k),s=encodeURIComponent(m.sym);
  return {bist:isIdx(m.sym)?'':'https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/sirket-karti.aspx?hisse='+s,fon:'https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod='+s,cg:'https://www.coingecko.com/tr/coins/'+s,yh:'https://finance.yahoo.com/quote/'+s}[m.src]||'';}
function mSrcName(k){return {bist:'İş Yatırım',fon:'TEFAS',cg:'CoinGecko',yh:'Yahoo Finance'}[mk(k).src]||'';}
var YHFX={USD:'USDTRY=X',EUR:'EURTRY=X',GBP:'GBPTRY=X',CHF:'CHFTRY=X',XU100:'XU100.IS',ONS:'GC=F',BRENT:'BZ=F'};
function dmy(d){return pad(d.getDate())+'-'+pad(d.getMonth()+1)+'-'+d.getFullYear();}
function mHist(k,r){
  var m=mk(k),days={'1H':8,'1A':31,'3A':92,'1Y':366}[r]||31,yr={'1H':'5d','1A':'1mo','3A':'3mo','1Y':'1y'}[r]||'1mo';
  if(m.src==='bist'&&!isIdx(m.sym)){var e=new Date(),s=new Date();s.setDate(s.getDate()-days);
    return njson(ISY+'HisseTekil?hisse='+encodeURIComponent(m.sym)+'&startdate='+dmy(s)+'&enddate='+dmy(e)).then(function(j){return ((j&&j.value)||[]).map(function(x){var p=String(x.HGDG_TARIH||'').split('-');return [new Date(+p[2],+p[1]-1,+p[0]).getTime(),+x.HGDG_KAPANIS];}).filter(function(x){return x[1]>0&&!isNaN(x[0]);});});}
  if(m.src==='cg')return njson(CG+'coins/'+encodeURIComponent(m.sym)+'/market_chart?vs_currency=try&days='+days+'&interval=daily',{cors:1}).then(function(j){return ((j&&j.prices)||[]).filter(function(x){return x[1]>0;});});
  if(m.src==='fx'&&FRKC.indexOf(m.sym)>=0)return frkHist(m.sym,days).then(function(p){if(p.length<2)throw new Error('grafik yok');return p;});
  var ys=m.src==='yh'?m.sym:(m.src==='bist'?m.sym+'.IS':(m.src==='fx'?YHFX[m.sym]:''));
  if(ys&&canNet())return yhChart(ys,yr).then(yhCloses);
  return Promise.reject(new Error('grafik yok'));}
function mChart(pts,u,k){
  if(!pts||pts.length<2)return '<div class="small muted">Grafik verisi yok.</div>';
  var v=pts.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=110,t0=pts[0][0],sp=(pts[pts.length-1][0]-t0)||1;
  var xy=pts.map(function(x){return [(x[0]-t0)/sp*W,H-6-(x[1]-mn)/rg*(H-12)];}),line=xy.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var ch=(v[v.length-1]/v[0]-1)*100,col=ch>=0?'var(--inc)':'var(--exp)',df=function(t){return new Date(t).toLocaleDateString('tr-TR',{day:'numeric',month:'short'});};
  return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span class="small muted">Dönem değişimi</span>'+chgSpan(ch)+'</div>'
   +'<div class="mscr small num" id="mscr" aria-live="polite">Grafiğe dokunup kaydırarak günlük fiyatı gör</div>'
   +'<div class="mcw" id="mcw"><svg class="spark" viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Fiyat grafiği"><polygon points="0,'+H+' '+line+' '+W+','+H+'" fill="'+col+'" opacity=".12"/><polyline points="'+line+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><line id="mcl" x1="0" x2="0" y1="0" y2="'+H+'" stroke="var(--ink2)" stroke-width="1" vector-effect="non-scaling-stroke" visibility="hidden"/></svg></div>'
   +'<div class="small muted num" style="display:flex;justify-content:space-between;gap:8px"><span>'+esc(df(pts[0][0]))+'</span><span>En düşük '+fmtPx(mn,u,k)+' · en yüksek '+fmtPx(mx,u,k)+'</span><span>'+esc(df(pts[pts.length-1][0]))+'</span></div>';}
function mDet(k){
  var q=mQ(k),u=q&&q.ccy||'TRY',m=mk(k);
  if(!q||!(q.p>0))return '<p class="small muted" id="m-st">'+(mCur&&mCur.err?esc(mCur.err):'Fiyat alınıyor…')+'</p>';
  var abs=q.prev>0?q.p-q.prev:null,rows=[];
  if(q.prev>0)rows.push(['Önceki kapanış',fmtPx(q.prev,u,k)]);if(q.lo>0&&q.hi>0)rows.push(['Gün içi aralık',fmtPx(q.lo,u,k)+' – '+fmtPx(q.hi,u,k)]);
  if(u!=='TRY'&&u!=='pt'&&rateAny(u)>0)rows.push(['TL karşılığı',TRY2.format(q.p*rateAny(u))]);
  var when=q.at||q.ts;
  return '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><p class="big num" style="margin:0">'+fmtPx(q.p,u,k)+'</p>'+(q.c!=null&&isFinite(q.c)?'<span class="num '+(q.c>=0?'inc':'exp')+'">'+(abs!=null?(abs>=0?'+':'−')+pxf(Math.abs(abs)<1?4:2).format(Math.abs(abs))+' ':'')+'('+pctTxt(q.c)+')</span>':'')+'</div>'
   +(rows.length?'<div class="list">'+rows.map(function(r){return '<div class="item" style="padding:7px 0"><span class="mid small muted">'+r[0]+'</span><span class="num small">'+r[1]+'</span></div>';}).join('')+'</div>':'')
   +'<div class="small muted" id="m-st">'+(when?'Veri zamanı '+esc(fmtTs(when))+' ('+esc(ago(when))+')'+(q.ts&&q.at&&q.ts-q.at>36e5?' · '+esc(ago(q.ts))+' denetlendi':''):'')+(q.src==='ecb'?' · ECB günlük referans kuru':'')+(q.site?' · yayın sunucusundan, gecikmeli kapanış':'')+(m.src==='bist'&&!q.site?' · yaklaşık 15 dk gecikmeli':'')+(m.src==='fon'?' · fon fiyatı günde bir açıklanır':'')+(q.err?' · son yenileme başarısız, eski veri':'')+'</div>';}
function mHoldType(k){var m=mk(k);if(m.src==='bist')return 'Hisse';if(m.src==='fon')return 'Fon';if(m.src==='cg')return 'Kripto';if(m.src==='yh')return 'Hisse';
  if(m.sym==='GUMUS')return 'Gümüş';return MGOLD[m.sym]?'Altın':'Döviz';}
function mSheet(k){
  var m=mk(k),url=mUrl(k),inW=!!mW(k),idx=(mQ(k)||{}).ccy==='pt'||isIdx(m.sym)||m.sym==='XU100';mCur={k:k,r:(mCur&&mCur.k===k&&mCur.r)||'1A',err:''};
  openSheet('<h2 data-mk="'+esc(k)+'">'+esc(mName(k))+'</h2><div class="small muted" style="margin-top:-6px">'+esc(mSub(k))+'</div>'
   +'<div id="mdet" class="stack" style="gap:8px">'+mDet(k)+'</div>'
   +'<div class="seg mini" role="tablist" aria-label="Grafik dönemi">'+['1H','1A','3A','1Y'].map(function(r){return '<button data-act="m-range" data-v="'+r+'" aria-pressed="'+(mCur.r===r)+'">'+({'1H':'1 hafta','1A':'1 ay','3A':'3 ay','1Y':'1 yıl'})[r]+'</button>';}).join('')+'</div>'
   +'<div id="mchart" class="stack" style="gap:6px"><div class="small muted">Grafik yükleniyor…</div></div>'
   +mHeldBox(k)+'<div id="mtgt">'+mTgtBox(k)+'</div>'
   +'<div class="two"><button class="btn'+(inW?' ghost':'')+'" data-act="m-watch" data-id="'+esc(k)+'">'+(inW?'Takipten çıkar':'Takip listesine ekle')+'</button>'+(idx?'':'<button class="btn ghost" data-act="m-hold" data-id="'+esc(k)+'">Yatırımlarıma ekle</button>')+'</div>'
   +(url?'<a class="btn ghost" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(mSrcName(k))+' sayfasını aç</a>':''));
  refreshMarket({keys:[k],force:true}).then(function(r){if(!mCur||mCur.k!==k)return;if(r.errs&&r.errs[k])mCur.err=mErrTxt(k,r.errs[k]);var hd=document.querySelector('[data-mk="'+k+'"]'),d=document.getElementById('mdet');if(hd){hd.textContent=mName(k);if(d)d.innerHTML=mDet(k);}mAfterQuiet();});
  mDraw();}
function mErrTxt(k,e){var m=mk(k);if(/uygulamada/.test(e))return 'Bu veri yalnızca Android uygulamasında alınabiliyor.';if(m.src==='fon')return 'Fon fiyatı TEFAS’tan alınamadı ('+e+'). Fon kodunu kontrol et ya da TEFAS sayfasını aç.';return 'Fiyat alınamadı ('+e+'). İnternet bağlantını kontrol edip tekrar dene.';}
function mAfterQuiet(){if(ui.page&&ui.page.k==='piyasa')mUpd();}
function mDraw(){var c=mCur;if(!c)return;var k=c.k,r=c.r,box=document.getElementById('mchart');if(!box)return;
  if(mk(k).src==='fon'){box.innerHTML='<div class="small muted">Fon getiri grafiği için TEFAS sayfasını aç.</div>';return;}
  box.innerHTML='<div class="small muted">Grafik yükleniyor…</div>';
  mHist(k,r).then(function(p){/* aynı kaynaktan gelen geçmiş küçük grafiğe eklenir (döviz grafiği ECB'den geldiğinden eklenmez: kaynaklar karışmasın) */if(mW(k)&&!(mk(k).src==='fx')){qSeed(k,p);save();}var b=document.getElementById('mchart');if(!b||!mCur||mCur.k!==k||mCur.r!==r)return;var q=mQ(k);mCur.pts=p;b.innerHTML=mChart(p,q&&q.ccy||'TRY',k)+(mk(k).src==='fx'&&FRKC.indexOf(mk(k).sym)>=0?'<div class="small muted">Grafik: Avrupa Merkez Bankası günlük referans kuru (Frankfurter).</div>':'');mScrubOn();},
    function(e){var b=document.getElementById('mchart');if(!b||!mCur||mCur.k!==k)return;
      /* kaynaktan geçmiş alınamazsa cihazda tutulan son 30 günün kapanışları gösterilir */
      var qh=(mQ(k)||{}).h;if(qh&&qh.length>=3){var lp=qh.map(function(x){return [typeof x[0]==='number'?x[0]:pdate(x[0]).getTime(),x[1]];});mCur.pts=lp;b.innerHTML=mChart(lp,(mQ(k)||{}).ccy||'TRY',k)+'<div class="small muted">Grafik: bu cihazda tutulan son '+lp.length+' günün kapanışları.</div>';mScrubOn();return;}
      b.innerHTML='<div class="small muted">'+(/uygulamada|grafik yok/.test(String(e&&e.message))&&!canNet()?'Grafik yalnızca Android uygulamasında görünür.':'Grafik verisi alınamadı.')+'</div>';});}

/* ---------- eylemler ---------- */
function mOpenPage(){ui.medit=false;openPage({k:'piyasa'},'piyasa');bistList().then(function(){if((ui.mq||'').trim())mUpd();});refreshMarket({}).then(mAfter);}
ACT['open-mkt']=function(){mOpenPage();};
ACT['qa-mkt']=function(){mOpenPage();};
ACT['m-edit']=function(){ui.medit=!ui.medit;mUpd();};
function mMove(k,d){var i=S.watch.findIndex(function(w){return w.k===k;}),j=i+d;if(i<0||j<0||j>=S.watch.length)return;var t=S.watch[i];S.watch[i]=S.watch[j];S.watch[j]=t;save();mUpd();}
ACT['m-up']=function(el,k){mMove(k,-1);};ACT['m-down']=function(el,k){mMove(k,1);};
ACT['m-del']=function(el,k){var i=S.watch.findIndex(function(w){return w.k===k;});if(i<0)return;var w=S.watch[i];S.watch.splice(i,1);save();mUpd();toast(mName(k)+' takipten çıkarıldı',function(){S.watch.splice(Math.min(i,S.watch.length),0,w);save();mUpd();});};
ACT['m-open']=function(el,k){mSheet(k);};
ACT['m-pick']=function(el,k){
  if(ui.mlink){var x=byId(S.holdings,ui.mlink);if(!x){ui.mlink=null;mUpd();return;}
    if(isIdx(mk(k).sym)||mk(k).sym==='XU100'){toast('Endeks bir yatırım fiyatı değildir');return;}
    var c=MCAND[k];if(c&&!mW(k)&&!S.quotes[k])S.quotes[k]={n:c.n,s:c.s};
    x.mk=k;x.ccy='';x.mks=mSym(k);ui.mlink=null;ui.mq='';save();toast(x.name+' artık '+mSym(k)+' fiyatıyla güncellenecek');
    refreshMarket({keys:[k],force:true}).then(function(){save();if(!busy())render();});closePage();return;}
  mSheet(k);};
ACT['m-sug']=function(el,k){var x=MSUG.filter(function(s){return s[0]===k;})[0],m=mk(k);mAdd(k,m.src==='fx'?fxName(m.sym):(m.src==='cg'?'Bitcoin':((BISTM&&BISTM[m.sym])?BISTM[m.sym][1]:(x?x[1]:m.sym))),m.src==='cg'?'BTC':m.sym);};
function mAdd(k,n,s){if(mW(k))return;if(S.watch.length>=40){toast('Takip listesi en fazla 40 kalem olabilir');return;}
  S.watch.push({k:k,n:n||mName(k),s:s||mSym(k)});save();mUpd();
  refreshMarket({keys:[k],force:true}).then(function(){mUpd();});}
ACT['m-watch']=function(el,k){var w=mW(k);
  if(w){S.watch=S.watch.filter(function(x){return x.k!==k;});save();toast(mName(k)+' takipten çıkarıldı');}
  else{var c=MCAND[k]||{};mAdd(k,mk(k).src==='fon'?mName(k):(c.n||mName(k)),c.s||mSym(k));toast(mName(k)+' takip listesine eklendi');}
  closeSheet();ui.mq='';if(ui.page&&ui.page.k==='piyasa')render();else mUpd();};
ACT['m-hold']=function(el,k){var m=mk(k),f=m.src==='fx'&&MFXK[m.sym];
  if(!f&&!(mTL(k)>0)){toast('Önce fiyat alınmalı; biraz bekleyip tekrar dene');return;}
  var c=MCAND[k];if(c&&!S.quotes[k])S.quotes[k]={n:c.n};
  hSheet(null,'inv',{name:mk(k).src==='fx'?mName(k):mSym(k)+(mk(k).src==='fon'?' fonu':''),type:mHoldType(k),ccy:f||'',mk:f?'':k});};
ACT['m-range']=function(el,id,r){if(!mCur)return;mCur.r=r;document.querySelectorAll('[data-act="m-range"]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===r));});mDraw();};
ACT['m-refresh']=function(el){if(el)el.disabled=true;refreshMarket({force:true,fon:true}).then(function(r){if(el)el.disabled=false;mUpd();
  toast(r.bad&&!r.n?'Fiyatlar alınamadı. İnternet bağlantını kontrol et.':(r.bad?r.n+' fiyat güncellendi, '+r.bad+' tanesi alınamadı':'Fiyatlar güncellendi'));});};
ACT['m-linkmode']=function(el,id){ui.mlink=id;ui.mq='';closeSheet();mOpenPage();};
ACT['m-linkoff']=function(){ui.mlink=null;render();};
/* takip sayfası açıkken dakikada bir yenile */
setInterval(function(){if(!document.hidden&&ui.page&&ui.page.k==='piyasa'&&!ui.locked)refreshMarket({}).then(function(r){if(r.n)mAfterQuiet();});},60000);

/* ---------- banka ekstresi dosyaları: CSV (UTF-8, UTF-16, Windows-1254), Excel .xlsx, eski Excel .xls, HTML biçimli .xls ----------
   Dosya tabloya çevrilir, CSV metni olarak kutuya yazılır; içe aktarma csvImport ile yapılır (başlık satırı kendiliğinden bulunur). */
function decodeText(u){
  if(u[0]===0xFF&&u[1]===0xFE)return new TextDecoder('utf-16le').decode(u.subarray(2));
  if(u[0]===0xFE&&u[1]===0xFF)return new TextDecoder('utf-16be').decode(u.subarray(2));
  try{return new TextDecoder('utf-8',{fatal:true}).decode(u).replace(/^﻿/,'');}
  catch(e){try{return new TextDecoder('windows-1254').decode(u);}catch(e2){return new TextDecoder().decode(u);}}}
function csvCell(v){if(typeof v==='number'){v=String(+v.toFixed(6)).replace('.',',');}v=String(v==null?'':v);return /[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function rowsCsv(rows){return rows.map(function(r){return r.map(csvCell).join(';');}).join('\n');}
function serialDate(v){if(!(v>59&&v<2958466))return v;var d=new Date(Math.round((v-25569)*864e5));return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());}
function isDateFmt(id,code){
  if((id>=14&&id<=22)||(id>=45&&id<=47)||(id>=27&&id<=36)||(id>=50&&id<=58))return true;
  if(!code)return false;var c=String(code).replace(/"[^"]*"/g,'').replace(/\[[^\]]*\]/g,'').replace(/\\./g,'');
  return /[dy]/i.test(c)||(/m/i.test(c)&&/[\/.\-]/.test(c)&&!/h/i.test(c));}
/* --- .xlsx: ZIP + XML --- */
function unzip(buf){
  var dv=new DataView(buf),u=new Uint8Array(buf),e=-1,files={},td=new TextDecoder();
  for(var i=u.length-22;i>=Math.max(0,u.length-65558);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break;}}
  if(e<0)throw new Error('Dosya bozuk görünüyor.');
  var n=dv.getUint16(e+10,true),p=dv.getUint32(e+16,true);
  for(var k=0;k<n&&p+46<=u.length;k++){if(dv.getUint32(p,true)!==0x02014b50)break;
    var meth=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
    var name=td.decode(u.subarray(p+46,p+46+nl)),st=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true);
    files[name]={m:meth,d:u.subarray(st,st+cs)};p+=46+nl+xl+cl;}
  return files;}
function unz(f){
  if(!f)return Promise.resolve(null);if(f.m===0)return Promise.resolve(new TextDecoder().decode(f.d));
  if(f.m!==8)return Promise.reject(new Error('Desteklenmeyen sıkıştırma.'));
  if(typeof DecompressionStream==='undefined')return Promise.reject(new Error('Bu cihaz Excel dosyasını açamıyor; dosyayı CSV olarak kaydedip dene.'));
  return new Response(new Blob([f.d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();}
function xdoc(t){return new DOMParser().parseFromString(t,'application/xml');}
function xtags(n,name){return Array.prototype.slice.call(n.getElementsByTagNameNS('*',name));}
function colIdx(ref){var m=/^([A-Z]+)/.exec(ref||''),c=0;if(!m)return -1;for(var i=0;i<m[1].length;i++)c=c*26+m[1].charCodeAt(i)-64;return c-1;}
function xlsxRows(buf){
  var z=unzip(buf),names=Object.keys(z);
  return Promise.all([unz(z['xl/workbook.xml']),unz(z['xl/_rels/workbook.xml.rels']),unz(z['xl/sharedStrings.xml']),unz(z['xl/styles.xml'])]).then(function(a){
    var path=null,d1904=a[0]&&/date1904="(1|true)"/.test(a[0]);
    if(a[0]&&a[1]){var sh=xtags(xdoc(a[0]),'sheet')[0],rid=sh&&(sh.getAttribute('r:id')||sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'));
      if(rid){var rel=xtags(xdoc(a[1]),'Relationship').filter(function(r){return r.getAttribute('Id')===rid;})[0];
        if(rel){var tg=rel.getAttribute('Target')||'';path=tg.charAt(0)==='/'?tg.slice(1):'xl/'+tg.replace(/^\.\//,'');}}}
    if(!path||!z[path])path=names.filter(function(n){return /^xl\/worksheets\/sheet\d+\.xml$/.test(n);}).sort()[0];
    if(!path)throw new Error('Excel’de sayfa bulunamadı.');
    var sst=a[2]?xtags(xdoc(a[2]),'si').map(function(si){return xtags(si,'t').filter(function(t){return !(t.parentNode&&t.parentNode.localName==='rPh');}).map(function(t){return t.textContent;}).join('');}):[];
    var dst={};if(a[3]){var sd=xdoc(a[3]),fm={};xtags(sd,'numFmt').forEach(function(n){fm[n.getAttribute('numFmtId')]=n.getAttribute('formatCode')||'';});
      var cx=xtags(sd,'cellXfs')[0];if(cx)xtags(cx,'xf').forEach(function(x,i){var id=+x.getAttribute('numFmtId')||0;dst[i]=isDateFmt(id,fm[id]);});}
    return unz(z[path]).then(function(t){
      var rows=[];
      xtags(xdoc(t),'row').forEach(function(r){var ri=(+r.getAttribute('r')||rows.length+1)-1,row=[];
        xtags(r,'c').forEach(function(c,ci){var ix=colIdx(c.getAttribute('r'));if(ix<0)ix=ci;var ty=c.getAttribute('t'),v=xtags(c,'v')[0],val;
          if(ty==='s')val=sst[+(v&&v.textContent)]||'';
          else if(ty==='inlineStr')val=xtags(c,'t').map(function(x){return x.textContent;}).join('');
          else if(ty==='str'||ty==='e')val=v?v.textContent:'';
          else if(ty==='b')val=v&&v.textContent==='1'?'DOĞRU':'YANLIŞ';
          else if(!v)val='';
          else{val=+v.textContent;if(isNaN(val))val=v.textContent;else if(dst[+c.getAttribute('s')||0])val=serialDate(d1904?val+1462:val);}
          row[ix]=val;});
        rows[ri]=row;});
      return tidy(rows);});});}
function tidy(rows){return rows.filter(Boolean).map(function(r){var o=[];for(var i=0;i<r.length;i++)o.push(r[i]==null?'':r[i]);return o;}).filter(function(r){return r.some(function(x){return String(x).trim()!=='';});});}
/* --- eski .xls (BIFF8): bileşik dosya içindeki Workbook akışı --- */
function cfbStream(u,want){
  var dv=new DataView(u.buffer,u.byteOffset,u.byteLength),ssz=1<<dv.getUint16(0x1E,true),mss=1<<dv.getUint16(0x20,true),nFat=dv.getUint32(0x2C,true),
      dir0=dv.getInt32(0x30,true),cut=dv.getUint32(0x38,true),mf0=dv.getInt32(0x3C,true),ds=dv.getInt32(0x44,true);
  var off=function(s){return (s+1)*ssz;},i32=function(o){return o+4<=u.length?dv.getInt32(o,true):-2;},fs=[],g=0,j;
  for(j=0;j<109&&fs.length<nFat;j++){var s0=i32(0x4C+j*4);if(s0>=0)fs.push(s0);}
  while(ds>=0&&fs.length<nFat&&g++<1e4){for(j=0;j<ssz/4-1&&fs.length<nFat;j++){var s1=i32(off(ds)+j*4);if(s1>=0)fs.push(s1);}ds=i32(off(ds)+ssz-4);}
  var fat=[];fs.forEach(function(s){for(var k=0;k<ssz/4;k++)fat.push(i32(off(s)+k*4));});
  var chain=function(s,t){var o=[],n=0;while(s>=0&&n++<2e6){o.push(s);s=t[s];if(s===undefined)break;}return o;};
  var read=function(s){var c=chain(s,fat),b=new Uint8Array(c.length*ssz);c.forEach(function(x,i){b.set(u.subarray(off(x),Math.min(u.length,off(x)+ssz)),i*ssz);});return b;};
  var dir=read(dir0),dd=new DataView(dir.buffer),ents=[];
  for(var p=0;p+128<=dir.length;p+=128){var nl=dd.getUint16(p+64,true),nm='';for(var q=0;q<Math.max(0,nl/2-1);q++)nm+=String.fromCharCode(dd.getUint16(p+q*2,true));ents.push({n:nm,t:dir[p+66],s:dd.getInt32(p+116,true),z:dd.getUint32(p+120,true)});}
  var root=ents.filter(function(e){return e.t===5;})[0],e=ents.filter(function(x){return x.t===2&&want.indexOf(x.n)>=0;})[0];
  if(!e)throw new Error('Excel çalışma kitabı bulunamadı.');
  if(e.z<cut&&root){var ms=read(root.s),mfat=[];chain(mf0,fat).forEach(function(s){for(var k=0;k<ssz/4;k++)mfat.push(i32(off(s)+k*4));});
    var mc=chain(e.s,mfat),b=new Uint8Array(mc.length*mss);mc.forEach(function(x,i){b.set(ms.subarray(x*mss,x*mss+mss),i*mss);});return b.subarray(0,e.z);}
  return read(e.s).subarray(0,e.z);}
function xlStr(d,o){var cch=d[o]|d[o+1]<<8,fl=d[o+2],p=o+3,s='',i;if(fl&0x08)p+=2;if(fl&0x04)p+=4;
  if(fl&1){for(i=0;i<cch&&p+1<d.length;i++,p+=2)s+=String.fromCharCode(d[p]|d[p+1]<<8);}else{for(i=0;i<cch&&p<d.length;i++,p++)s+=String.fromCharCode(d[p]);}return s;}
function xlRk(n){var v;if(n&2)v=n>>2;else{var b=new DataView(new ArrayBuffer(8));b.setUint32(4,(n&0xFFFFFFFC)>>>0,true);v=b.getFloat64(0,true);}return n&1?v/100:v;}
/* paylaşılan metin tablosu; metinler CONTINUE kayıtlarına bölünebilir */
function xlSst(segs){
  var si=0,cur=segs[0],p=8,out=[],tot=new DataView(cur.buffer,cur.byteOffset,cur.byteLength).getUint32(4,true);
  var next=function(){if(p>=cur.length&&si+1<segs.length){cur=segs[++si];p=0;}};
  var b8=function(){next();return p<cur.length?cur[p++]:0;},b16=function(){var a=b8();return a|(b8()<<8);};
  var skip=function(n){while(n>0){next();if(p>=cur.length)return;var t=Math.min(n,cur.length-p);p+=t;n-=t;}};
  for(var k=0;k<tot;k++){next();if(p>=cur.length)break;
    var cch=b16(),fl=b8(),rt=0,ex=0,hi=fl&1,s='';if(fl&0x08)rt=b16();if(fl&0x04){ex=b16();ex+=b16()*65536;}
    while(cch>0){if(p>=cur.length){if(si+1>=segs.length)break;cur=segs[++si];p=0;hi=cur[p++]&1;}
      var av=cur.length-p,n=hi?Math.min(cch,av>>1):Math.min(cch,av);
      if(!n){if(si+1>=segs.length)break;cur=segs[++si];p=0;hi=cur[p++]&1;continue;}
      for(var i=0;i<n;i++){s+=String.fromCharCode(hi?(cur[p]|cur[p+1]<<8):cur[p]);p+=hi?2:1;}cch-=n;}
    skip(rt*4+ex);out.push(s);}
  return out;}
function xlsRows(u){
  var w=cfbStream(u,['Workbook','Book']),dv=new DataView(w.buffer,w.byteOffset,w.byteLength),p=0,recs=[];
  while(p+4<=w.length){var ty=dv.getUint16(p,true),ln=dv.getUint16(p+2,true);recs.push([ty,w.subarray(p+4,Math.min(w.length,p+4+ln))]);p+=4+ln;}
  var sst=[],xf=[],fmt={},rows=[],bof=0,inS=false,lastF=null,d1904=false;
  var setc=function(r,c,v){(rows[r]=rows[r]||[])[c]=v;};
  var numc=function(n,x){var f=xf[x];return isDateFmt(f,fmt[f])?serialDate(d1904?n+1462:n):n;};
  for(var i=0;i<recs.length;i++){
    var ty=recs[i][0],d=recs[i][1],v=new DataView(d.buffer,d.byteOffset,d.byteLength);
    if(ty===0x0809){bof++;if(bof===2)inS=true;continue;}
    if(ty===0x000A){if(inS)break;continue;}
    if(!inS){
      if(ty===0x00FC){var segs=[d];while(i+1<recs.length&&recs[i+1][0]===0x003C)segs.push(recs[++i][1]);sst=xlSst(segs);}
      else if(ty===0x00E0&&d.length>=4)xf.push(v.getUint16(2,true));
      else if(ty===0x041E&&d.length>=5)fmt[v.getUint16(0,true)]=xlStr(d,2);
      else if(ty===0x0022&&d.length>=2)d1904=v.getUint16(0,true)===1;
      continue;}
    if(ty===0x0207){if(lastF){var f=lastF;lastF=null;setc(f[0],f[1],xlStr(d,0));}continue;}
    if(d.length<6)continue;
    var r=v.getUint16(0,true),c=v.getUint16(2,true);
    if(ty===0x00FD&&d.length>=10)setc(r,c,sst[v.getUint32(6,true)]||'');
    else if(ty===0x0203&&d.length>=14)setc(r,c,numc(v.getFloat64(6,true),v.getUint16(4,true)));
    else if(ty===0x027E&&d.length>=10)setc(r,c,numc(xlRk(v.getUint32(6,true)),v.getUint16(4,true)));
    else if(ty===0x00BD){var nn=Math.floor((d.length-6)/6);for(var k=0;k<nn;k++)setc(r,c+k,numc(xlRk(v.getUint32(4+k*6+2,true)),v.getUint16(4+k*6,true)));}
    else if(ty===0x0204||ty===0x00D6)setc(r,c,xlStr(d,6));
    else if(ty===0x0006&&d.length>=14){if(v.getUint16(12,true)===0xFFFF){if(d[6]===0)lastF=[r,c];else setc(r,c,d[6]===1?(d[8]?'DOĞRU':'YANLIŞ'):'');}else setc(r,c,numc(v.getFloat64(6,true),v.getUint16(4,true)));}
    else if(ty===0x0205)setc(r,c,d[7]?'':(d[6]?'DOĞRU':'YANLIŞ'));}
  return tidy(rows);}
function htmlRows(t){var d=new DOMParser().parseFromString(t,'text/html'),rows=[];
  Array.prototype.forEach.call(d.querySelectorAll('tr'),function(tr){if(tr.querySelector('tr'))return;var r=Array.prototype.map.call(tr.querySelectorAll('th,td'),function(c){return (c.textContent||'').replace(/\s+/g,' ').trim();});if(r.some(Boolean))rows.push(r);});
  return rows;}
/* dosya → {text, info} */
function sheetText(buf){
  var u=new Uint8Array(buf);
  if(u[0]===0x50&&u[1]===0x4B)return xlsxRows(buf).then(function(r){return {text:rowsCsv(r),info:'Excel tablosu, '+r.length+' satır'};});
  if(u[0]===0xD0&&u[1]===0xCF&&u[2]===0x11&&u[3]===0xE0){try{var r=xlsRows(u);return Promise.resolve({text:rowsCsv(r),info:'Excel tablosu (.xls), '+r.length+' satır'});}catch(e){return Promise.reject(e);}}
  var t=decodeText(u);
  if(/<table[\s>]/i.test(t)){var h=htmlRows(t);return Promise.resolve({text:rowsCsv(h),info:'Excel tablosu, '+h.length+' satır'});}
  return Promise.resolve({text:t.replace(/^﻿/,''),info:'metin dosyası'});}
function impFile(f){
  var nm=document.getElementById('im-file-name'),ta=document.getElementById('im-txt'),fr=new FileReader();
  if(nm)nm.textContent=f.name+' okunuyor…';
  fr.onload=function(){sheetText(fr.result).then(function(r){if(ta)ta.value=r.text;if(nm)nm.textContent=f.name+' · '+r.info+'. Kontrol edip “İçe aktar”a dokun.';},
    function(e){if(ta)ta.value='';if(nm)nm.textContent=f.name+': '+((e&&e.message)||'okunamadı');});};
  fr.onerror=function(){if(nm)nm.textContent='Dosya okunamadı.';};
  fr.readAsArrayBuffer(f);}

/* ---------- Claude'a sor ----------
   Finansal durumun kısa bir özeti hazırlanır; kullanıcı görüp düzenledikten sonra Claude'a kendisi gönderir.
   Uygulama hiçbir yere veri göndermez: metin panoya kopyalanır, Claude açılır ya da paylaşım menüsü kullanılır.
   Hesap adları, işlem notları ve kişisel bilgiler özete girmez. */
var AIQ=[['genel','Genel değerlendirme','Finansal durumumu değerlendir; güçlü ve zayıf yönlerimi, önceliklerimi sırayla yaz.'],
 ['butce','Bütçe','Harcamalarımı ve bütçemi değerlendir; nerede, ne kadar kısabileceğimi somut önerilerle söyle.'],
 ['borc','Borç planı','Borçlarımı en az faiz ödeyerek ve en hızlı nasıl kapatırım? Adım adım bir plan öner.'],
 ['birikim','Birikim','Gelirime göre gerçekçi bir aylık birikim planı ve acil durum fonu hedefi öner.'],
 ['yatirim','Yatırım','Yatırım dağılımımı risk ve çeşitlendirme açısından değerlendir; nelere dikkat etmeliyim?']];
function aiSummary(){
  var m=maskOn;maskOn=false;
  try{
    var L=[],cur=curP(),W=wealth(),g=W.g,T0=function(v){return R0.format(Math.round(v)).replace('-','−');};
    L.push('Kişisel finans özetim ('+new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})+'). Tutarlar Türk lirası.');
    var ks=prevKs(cur,3).reverse().concat([cur]),fl=[];
    ks.forEach(function(k){var p=pstat(k);if(p.inc||p.exp)fl.push('- '+plabel(k)+(k===cur?' (dönem sürüyor)':'')+': gelir '+T0(p.inc)+', gider '+T0(p.exp)+(p.rate!=null?', tasarruf oranı %'+Math.round(p.rate):''));});
    if(fl.length){L.push('','Aylık gelir ve gider:');L.push.apply(L,fl);}
    var avg=catAvg(cur),ca=Object.keys(avg).filter(function(c){return avg[c]>=1;}).sort(function(a,b){return avg[b]-avg[a];}).slice(0,8);
    if(ca.length){L.push('','Kategorilere göre aylık ortalama gider (son 3 ay):');ca.forEach(function(c){L.push('- '+c+': '+T0(avg[c])+(+S.budgets[c]>0?' (bütçe limiti '+T0(S.budgets[c])+')':''));});}
    L.push('','Net servet: '+T0(W.net));
    [['Nakit',g.nakit],['Banka hesapları',g.banka],['Birikim hesapları',g.birikim],['Yatırımlar',g.inv],['Diğer varlıklar (ev, araç vb.)',g.asset],['Kredi kartı borcu',-Math.abs(g.cardDebt||0)],['Kredi ve diğer borçlar',-Math.abs(g.debts||0)]].forEach(function(x){if(Math.abs(+x[1]||0)>=1)L.push('- '+x[0]+': '+T0(x[1]));});
    var inv=S.holdings.filter(function(h){return hKind(h)==='inv';}),by={},tot=0;
    inv.forEach(function(h){var v=hVal(h);by[h.type]=(by[h.type]||0)+v;tot+=v;});
    if(tot>0){L.push('','Yatırım dağılımı:');Object.keys(by).sort(function(a,b){return by[b]-by[a];}).forEach(function(k){L.push('- '+k+': %'+Math.round(by[k]/tot*100)+' ('+T0(by[k])+')');});}
    var ds=S.debts.filter(function(d){return debtLeft(d)>0;});
    if(ds.length){L.push('','Borçlar:');ds.forEach(function(d){L.push('- '+d.type+': kalan '+T0(debtLeft(d))+' (toplam '+T0(d.amt)+')');});}
    if(S.recurring.length){var rt=recMonthlyTot(),ri=S.recurring.filter(function(r){return r.inc;}).reduce(function(a,r){return a+recMonthly(r);},0);L.push('','Düzenli ödemeler: '+S.recurring.filter(function(r){return !r.inc;}).length+' kalem, aylık yaklaşık '+T0(rt)+(ri>0?'; düzenli gelir aylık '+T0(ri):''));}
    if(S.goals.length){L.push('','Hedefler:');S.goals.forEach(function(x){L.push('- '+x.name+': '+T0(goalSaved(x))+' / '+T0(x.target)+(x.date?' (hedef tarih '+x.date+')':''));});}
    var H=health(),hp=H.parts.filter(function(p){return p.p!=null;});if(hp.length)L.push('','Göstergeler: '+hp.map(function(p){return p.k.toLocaleLowerCase('tr-TR')+' '+p.v;}).join(', ')+'.');
    try{var cl=coachSteps(),ci=coachCur(cl);if(ci>=0)L.push('','Wallet koçunun sıradaki adımı: '+cl[ci].t+' ('+String(cl[ci].sum).replace(/<[^>]*>/g,'')+')');}catch(e){}
    return L.join('\n');
  }finally{maskOn=m;}
}
function aiText(){var q=(val('ai-q')||'').trim(),e=document.getElementById('ai-s'),s=e?e.value:aiSummary();
  return 'Deneyimli ve tarafsız bir kişisel finans danışmanı gibi yanıt ver. Aşağıdaki verilere dayanarak Türkçe, sade ve uygulanabilir öneriler sun; varsayımlarını belirt, eksik bilgi varsa sor.\n\nSorum: '+(q||AIQ[0][2])+'\n\n'+s;}
function aiSheet(){
  openSheet('<h2>Claude’a sor</h2><p class="small muted" style="margin:0">Finansal durumunun özeti hazır. Bir konu seç ya da sorunu yaz; Claude’a gönderilecek metni aşağıda görüp düzenleyebilirsin. Hesap adların ve işlem notların gönderilmez.</p>'
   +'<div class="chips">'+AIQ.map(function(x,i){return '<button class="chip" data-act="ai-q" data-id="'+x[0]+'" aria-pressed="'+(i===0)+'">'+x[1]+'</button>';}).join('')+'</div>'
   +'<div class="field"><label for="ai-q">Sorun</label><textarea id="ai-q" rows="3" placeholder="Örn. 3 yılda ev peşinatı için ayda ne kadar biriktirmeliyim?">'+esc(AIQ[0][2])+'</textarea></div>'
   +'<details><summary class="small">Gönderilecek özet</summary><textarea id="ai-s" aria-label="Gönderilecek özet" style="min-height:42vh;margin-top:8px">'+esc(aiSummary())+'</textarea></details>'
   +'<div class="err" id="f-ai"></div>'
   +'<button class="btn" data-act="ai-go">Kopyala ve Claude’u aç</button>'
   +(nb('shareText')||navigator.share?'<button class="btn ghost" data-act="ai-share">Claude uygulamasıyla paylaş</button>':'')
   +'<button class="btn ghost" data-act="ai-copy">Yalnızca kopyala</button>'
   +'<p class="small muted" style="margin:0">Claude açılınca soru kutusu boşsa uzun basıp yapıştır. Yanıtlar genel bilgi amaçlıdır; yatırım, vergi ve hukuk kararlarında bir uzmana da danış.</p>');}
function copyTxt(t){
  if(nb('copyText')){try{if(NB.copyText(t)==='ok')return Promise.resolve(true);}catch(e){}}
  var fb=function(){var a=document.createElement('textarea'),ok=false;a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(a);a.select();try{ok=document.execCommand('copy');}catch(e){}a.remove();return ok;};
  try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(function(){return true;},fb);}catch(e){}
  return Promise.resolve(fb());}
function openExt(url){if(nb('openUrl')){try{NB.openUrl(url);return;}catch(e){}}try{window.open(url,'_blank','noopener');}catch(e){location.href=url;}}
ACT['ai-open']=function(){aiSheet();};
ACT['ai-q']=function(el,id){var x=AIQ.filter(function(a){return a[0]===id;})[0],e=document.getElementById('ai-q');if(x&&e)e.value=x[2];
  document.querySelectorAll('[data-act="ai-q"]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.id===id));});};
ACT['ai-go']=function(){var t=aiText();copyTxt(t).then(function(ok){
  var u='https://claude.ai/new?q='+encodeURIComponent(t);if(u.length>6000)u='https://claude.ai/new';
  msg(ok?'Metin kopyalandı, Claude açılıyor.':'Claude açılıyor; metni “Yalnızca kopyala” ile kopyalayabilirsin.',ok,'f-ai');openExt(u);});};
ACT['ai-share']=function(){var t=aiText();if(nb('shareText')){try{NB.shareText(t,'Claude’a gönder');}catch(e){}return;}try{navigator.share({text:t}).catch(function(){});}catch(e){}};
ACT['ai-copy']=function(){copyTxt(aiText()).then(function(ok){msg(ok?'Kopyalandı. Claude’a yapıştırabilirsin.':'Kopyalanamadı; özet metnini elle seçip kopyala.',ok,'f-ai');});};

/* ---------- kullanım kolaylığı ----------
   Sık eklenenler: son 120 günde aynı not, kategori, hesap ve tutarla en az iki kez girilen işlemler.
   Ana sayfada tek dokunuşla bugüne eklenir (Geri al ile), işlem penceresinde formu doldurur.
   Not yazarken önceki notlar önerilir; aynı not daha önce hangi kategoriyle girildiyse o seçilir.
   Kısayollar: Android'de simgeye uzun basınca, PWA'da ana ekran menüsünde Gider / Gelir / Transfer. */
function favKey(t){return [t.type,t.cat,t.acct,fold(t.note||'').trim(),r2(t.amt)].join('|');}
var FQC={v:-1};
function freqTx(n){var k=(S.savedAt||0)+'|'+S.tx.length+'|'+todayS()+'|'+ACCS().join('\u0001');if(FQC.k===k&&FQC.s===S.tx)return FQC.r.slice(0,n||6);var r=freqTx0();FQC={k:k,s:S.tx,r:r};return r.slice(0,n||6);}
function freqTx0(){
  var from=new Date(today0());from.setDate(from.getDate()-120);var f=isoDate(from),m={};
  S.tx.forEach(function(t){if((t.type!=='exp'&&t.type!=='inc')||t.date<f||t.sample||!(t.amt>0))return;var k=favKey(t),x=m[k]||(m[k]={k:k,n:0,last:'',t:t});x.n++;if(t.date>=x.last){x.last=t.date;x.t=t;}});
  return Object.keys(m).map(function(k){return m[k];}).filter(function(x){return x.n>=2&&ACCS().indexOf(x.t.acct)>=0;})
    .sort(function(a,b){return (b.n-a.n)||b.last.localeCompare(a.last);}).slice(0,6);
}
function favLabel(t){return (t.note||t.cat)+' · '+moneyIn(t.amt,t.acct,1);}
function favRow(where){
  var l=freqTx(6);if(!l.length)return '';
  return '<div class="favs'+(where==='sheet'?' insheet':'')+'"><div class="lbl">Sık eklenenler'+(where==='sheet'?'':' · dokun, bugüne eklensin')+'</div><div class="favl">'+l.map(function(x,i){var t=x.t;
    return '<button class="chip fav '+t.type+'" data-act="'+(where==='sheet'?'fav-fill':'fav-add')+'" data-id="'+i+'"><span class="dot" style="background:'+color(t.cat)+'"></span>'+esc(favLabel(t))+'</button>';}).join('')+'</div></div>';
}
ACT['fav-add']=function(el,id){
  var x=freqTx(6)[+id];if(!x)return;var t=x.t,o={id:uid(),type:t.type,amt:t.amt,acct:t.acct,cat:t.cat,date:todayS(),note:t.note||''};if(t.sub&&subsOf(t.cat).indexOf(t.sub)>=0)o.sub=t.sub;
  S.tx.push(o);ui.month=curP();save();render();
  toast((t.note||t.cat)+' eklendi · '+o.acct+': '+moneyIn(acctBal(o.acct),o.acct),function(){S.tx=S.tx.filter(function(z){return z.id!==o.id;});save();render();toast('Geri alındı');});
};
ACT['fav-fill']=function(el,id){
  var x=freqTx(6)[+id];if(!x)return;var t=x.t;
  if(txType!==t.type){var b=document.querySelector('#f-type [data-v="'+t.type+'"]');if(b)b.click();}
  var set=function(i,v){var e=document.getElementById(i);if(e){e.value=v;}};
  set('f-amt',nv(t.amt));set('f-note',t.note||'');set('f-acct',t.acct);
  set('f-sub',t.sub||'');var c=document.getElementById('f-cat');if(c){c.value=t.cat;c.dataset.manual='1';syncCatChips();}
  var a=document.getElementById('f-amt');if(a)a.dispatchEvent(new Event('input',{bubbles:true}));
  var ac=document.getElementById('f-acct');if(ac)ac.dispatchEvent(new Event('change',{bubbles:true}));
};
/* not önerileri: o türde en sık kullanılan 40 not */
function noteList(type){var m={};S.tx.forEach(function(t){if(t.type===type&&t.note){var k=t.note.trim();if(k)m[k]=(m[k]||0)+1;}});
  return Object.keys(m).sort(function(a,b){return m[b]-m[a];}).slice(0,40);}
function noteDl(type){return '<datalist id="note-dl">'+noteList(type).map(function(n){return '<option value="'+esc(n)+'">';}).join('')+'</datalist>';}
/* aynı not daha önce hangi kategoriyle girildiyse */
function noteCat(type,txt){if(!txt||txt.length<3)return null;var best=null;
  S.tx.forEach(function(t){if(t.type!==type||!t.note)return;var f=fold(t.note).trim();if(f===txt||(txt.length>=4&&f.indexOf(txt)===0)){if(!best||t.date>best.date)best=t;}});
  return best&&best.cat;}
/* uygulama kısayolları ve adres kısayolları: gider, gelir, transfer (eski "sesle" kısayolu gider penceresini açar) */
var INTENTS={exp:function(){txSheet(null,'exp');},inc:function(){txSheet(null,'inc');},trf:function(){ACT['qa-trf']();},voice:function(){txSheet(null,'exp');}};
function runIntent(){var a=ui.intent;if(!a||ui.locked)return;ui.intent=null;if(!INTENTS[a])return;
  if(ui.page){finishPage();ui.page=null;}if(location.hash){try{history.replaceState(history.state,'',location.pathname+location.search);}catch(e){}}ui.sub='ev';render();INTENTS[a]();}
window.walletIntent=function(a){ui.intent=String(a||'').replace(/^wallet:\/*/,'').replace(/^yeni-/,'');setTimeout(runIntent,50);};

/* ---------- Notlar (Google Keep tarzı) ----------
   Liste: üstte arama, "Sabitlenenler" ve "Diğerleri", renkli kartlar iki sütunda; altta "Not alın…" çubuğu.
   Düzenleyici: tam ekran, çerçevesiz başlık ve not; yapılacaklar listesi (onay kutuları); not rengi;
   altta renk, liste ve menü düğmeleri ile "Düzenlendi" zamanı. Kaydet düğmesi yok: geri dönünce kendiliğinden kaydedilir. */
var NCOL=[['','Varsayılan'],['coral','Mercan'],['peach','Şeftali'],['sand','Kum'],['mint','Nane'],['sage','Adaçayı'],['fog','Sis'],['storm','Fırtına'],['dusk','Lavanta'],['blossom','Pembe'],['clay','Kil'],['chalk','Gri']];
function ncls(c){return c&&NCOL.some(function(x){return x[0]===c;})?' nc-'+c:'';}
function noteItems(n){return Array.isArray(n.items)?n.items:[];}
function noteText(n){return n.list?noteItems(n).map(function(i){return i.t;}).join('\n'):String(n.body||'');}

/* ---- liste ---- */
function noteCardK(n){
  var t=(n.title||'').trim(),h='';
  if(n.list){var it=noteItems(n).filter(function(i){return String(i.t).trim();}),un=it.filter(function(i){return !i.c;}),ch=it.length-un.length;
    h=un.slice(0,8).map(function(i){return '<span class="ki"><span class="kb"></span>'+esc(i.t)+'</span>';}).join('')
     +(un.length>8?'<span class="km">+'+(un.length-8)+' öğe</span>':'')+(ch?'<span class="km">+'+ch+' işaretli öğe</span>':'');}
  else{var b=String(n.body||'').trim();if(b)h='<span class="kx">'+esc(b.length>600?b.slice(0,600)+'…':b)+'</span>';}
  if(!t&&!h)h='<span class="km">Boş not</span>';
  return '<button class="kcard'+ncls(n.color)+'" data-act="edit-n" data-id="'+n.id+'">'+(t?'<span class="kt">'+esc(t)+'</span>':'')+h+'</button>';
}
function notesList(){
  var l=noteSorted('act');
  if(!l.length)return '<div class="kempty">'+ic('note')+'<div>'+(ui.nq?'Eşleşen not yok.':'Eklediğin notlar burada görünür')+'</div></div>';
  var pin=l.filter(function(n){return n.pin;}),oth=l.filter(function(n){return !n.pin;}),g=function(a){return '<div class="kgrid">'+a.map(noteCardK).join('')+'</div>';};
  return pin.length?'<div class="klbl">Sabitlenenler</div>'+g(pin)+(oth.length?'<div class="klbl">Diğerleri</div>'+g(oth):''):g(oth);
}
function vNotlar(){
  var c=noteCounts();ui.nv='act';
  return '<div class="kq">'+ic('search')+'<input id="nsearch" type="search" placeholder="Notlarınızda arayın" value="'+esc(ui.nq)+'" aria-label="Notlarda ara"></div>'
   +'<div id="nlist">'+notesList()+'</div>'
   +(c.trash||c.act?'<div class="nfoot">'+(c.trash?'<button class="linkbtn" data-act="n-trashv">Silinenler ('+c.trash+')</button>':'<span></span>')+(c.act?'<button class="linkbtn" data-act="n-export">Dışa aktar</button>':'')+'</div>':'')
   +'<div class="kbar knew"><button class="knewt" data-act="new-n">Not alın…</button><button class="icon-btn" data-act="new-nl" aria-label="Yeni liste" title="Yeni liste">'+ic('check')+'</button></div>';
}

/* ---- düzenleyici ---- */
function noteDraft(n){return {title:n?n.title||'':'',body:n?n.body||'':'',pin:!!(n&&n.pin),color:n&&n.color||'',list:!!(n&&n.list),items:n?noteItems(n).map(function(i){return {t:i.t,c:!!i.c};}):[]};}
ACT['new-n']=function(){ui.nv='act';openPage({k:'note',id:null,draft:noteDraft(null),dirty:false},'not');setTimeout(function(){var e=document.getElementById('n-body');if(e)e.focus();},60);};
ACT['new-nl']=function(){ui.nv='act';var d=noteDraft(null);d.list=true;d.items=[{t:'',c:false}];openPage({k:'note',id:null,draft:d,dirty:false},'not');setTimeout(function(){kFocus(0);},60);};
ACT['edit-n']=function(el,id){var n=byId(S.notes,id);if(!n)return;openPage({k:'note',id:id,draft:noteDraft(n),dirty:false},'not');};
function noteBtns(){var p=ui.page,n=p.id&&byId(S.notes,p.id);if(n&&n.trash)return '';
  return '<button class="icon-btn" data-act="note-pin" aria-pressed="'+!!p.draft.pin+'" aria-label="'+(p.draft.pin?'Sabitlemeyi kaldır':'Sabitle')+'" title="Sabitle">'+ic('pin')+'</button>';}
function kItems(){
  var d=ui.page.draft,un=[],ch=[];d.items.forEach(function(it,i){(it.c?ch:un).push(i);});
  var row=function(i){var it=d.items[i];return '<div class="krow'+(it.c?' done':'')+'"><button class="kcb" data-act="ki-tg" data-v="'+i+'" role="checkbox" aria-checked="'+!!it.c+'" aria-label="İşaretle"></button>'
    +'<input class="kin" data-ki="'+i+'" value="'+esc(it.t)+'" placeholder="Liste öğesi" aria-label="Liste öğesi"><button class="kdel" data-act="ki-del" data-v="'+i+'" aria-label="Öğeyi sil">'+ic('x')+'</button></div>';};
  return un.map(row).join('')+'<button class="kadd" data-act="ki-add">'+ic('plus')+' Liste öğesi</button>'
   +(ch.length?'<div class="kchk">'+ch.length+' işaretli öğe</div>'+ch.map(row).join(''):'');
}
function vNote(){
  var p=ui.page,d=p.draft,n=p.id?byId(S.notes,p.id):null;
  if(n&&n.trash)return '<div class="banner"><span>Bu not silinenler arasında. Düzenlemek için geri al.</span></div><div class="card"><div class="t" style="font-weight:700;font-size:1.125rem">'+esc(n.title||'Başlıksız')+'</div><p style="white-space:pre-wrap;margin:8px 0 0">'+esc(noteText(n))+'</p></div><button class="btn" data-act="note-restore">Geri al</button><button class="btn danger" data-act="note-purge">Kalıcı olarak sil</button>';
  var ed=n?new Date(n.ts):null,t0=today0();
  return '<div class="kp"><input id="n-title" class="ktitle" data-nf="title" value="'+esc(d.title)+'" placeholder="Başlık" aria-label="Başlık" autocomplete="off">'
   +(d.list?'<div id="kl" class="kl">'+kItems()+'</div>':'<textarea id="n-body" class="kbody" data-nf="body" placeholder="Not" aria-label="Not">'+esc(d.body)+'</textarea>')+'</div>'
   +'<div class="kbar kedit"><button class="icon-btn" data-act="note-color" aria-label="Not rengi" title="Renk">'+ic('palette')+'</button><button class="icon-btn" data-act="note-list" aria-pressed="'+d.list+'" aria-label="'+(d.list?'Onay kutularını kaldır':'Onay kutuları ekle')+'" title="Liste">'+ic('check')+'</button>'
   +'<span class="ked">'+(ed?'Düzenlendi '+esc(ed>=t0?ed.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):ed.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})):'')+'</span>'
   +'<button class="icon-btn" data-act="note-more" aria-label="Diğer işlemler" title="Diğer">'+ic('more')+'</button></div>';
}
function kSync(){var d=ui.page.draft;ui.page.dirty=true;var c=document.querySelector('.kp');if(c)c.className='kp';applyNoteColor();}
function applyNoteColor(){var p=ui.page,c=p&&p.k==='note'&&p.draft?p.draft.color:'';
  if(c)document.documentElement.setAttribute('data-nc',c);else document.documentElement.removeAttribute('data-nc');}
function kRender(focus,end){var k=document.getElementById('kl');if(!k)return;k.innerHTML=kItems();if(focus!=null)kFocus(focus,end);}
function kFocus(i,end){var e=document.querySelector('[data-ki="'+i+'"]');if(e){e.focus();if(end!==false)try{e.setSelectionRange(e.value.length,e.value.length);}catch(x){}}}
function kGrow(e){if(!e)return;e.style.height='auto';e.style.height=Math.max(e.scrollHeight,window.innerHeight*0.45)+'px';}
ACT['note-pin']=function(){var p=ui.page;p.draft.pin=!p.draft.pin;p.dirty=true;var b=document.querySelector('[data-act="note-pin"]');if(b)b.setAttribute('aria-pressed',String(p.draft.pin));toast(p.draft.pin?'Not sabitlendi':'Sabitleme kaldırıldı');};
ACT['note-color']=function(){var d=ui.page.draft;
  openSheet('<h2>Renk</h2><div class="kcols">'+NCOL.map(function(x){return '<button class="kcol'+ncls(x[0])+(x[0]?'':' none')+'" data-act="note-col" data-v="'+x[0]+'" aria-pressed="'+(d.color===x[0])+'" aria-label="'+x[1]+'" title="'+x[1]+'">'+(d.color===x[0]?ic('check'):'')+'</button>';}).join('')+'</div>');};
ACT['note-col']=function(el,id,v){var p=ui.page;if(!p||p.k!=='note')return;p.draft.color=v||'';p.dirty=true;closeSheet();applyNoteColor();};
ACT['note-list']=function(){var p=ui.page,d=p.draft;
  if(!d.list){var ls=String(d.body||'').split('\n').map(function(s){return s.replace(/^\s*([-*•]|\[ ?x?\])\s*/i,'').trim();}).filter(Boolean);d.items=ls.length?ls.map(function(s){return {t:s,c:false};}):[{t:'',c:false}];d.list=true;}
  else{d.body=d.items.map(function(i){return i.t;}).filter(function(t){return String(t).trim();}).join('\n');d.list=false;}
  p.dirty=true;render();if(d.list)kFocus(Math.max(0,d.items.length-1));};
ACT['ki-add']=function(){var d=ui.page.draft,un=d.items.filter(function(i){return !i.c;}).length;var at=0,seen=0;
  for(var i=0;i<d.items.length;i++){if(!d.items[i].c){seen++;at=i+1;}}if(!seen)at=0;d.items.splice(at,0,{t:'',c:false});ui.page.dirty=true;kRender(at);};
ACT['ki-tg']=function(el,id,v){var d=ui.page.draft,it=d.items[+v];if(!it)return;it.c=!it.c;ui.page.dirty=true;kRender();};
ACT['ki-del']=function(el,id,v){var d=ui.page.draft;d.items.splice(+v,1);ui.page.dirty=true;kRender();};
ACT['note-more']=function(){var p=ui.page;
  openSheet('<div class="list">'
   +'<button class="item" data-act="note-trash"><span class="sic" style="--c:var(--exp)">'+ic('trash')+'</span><span class="mid"><div class="t">Sil</div></span></button>'
   +'<button class="item" data-act="note-dup"><span class="sic" style="--c:var(--blue)">'+ic('copy')+'</span><span class="mid"><div class="t">Kopya oluştur</div></span></button>'
   +'<button class="item" data-act="note-copytxt"><span class="sic" style="--c:var(--accent)">'+ic('archive')+'</span><span class="mid"><div class="t">Metni kopyala</div></span></button>'
   +(nb('shareText')||navigator.share?'<button class="item" data-act="note-share"><span class="sic" style="--c:var(--inc)">'+ic('share')+'</span><span class="mid"><div class="t">Gönder</div></span></button>':'')
   +'</div>');};
function draftText(){var d=ui.page.draft;return (d.title?d.title+'\n\n':'')+(d.list?d.items.map(function(i){return (i.c?'☑ ':'☐ ')+i.t;}).join('\n'):d.body);}
ACT['note-copytxt']=function(){var t=draftText();closeSheet();copyTxt(t).then(function(ok){toast(ok?'Not kopyalandı':'Kopyalanamadı');});};
ACT['note-share']=function(){var t=draftText();closeSheet();if(nb('shareText')){try{NB.shareText(t,'Not');}catch(e){}return;}try{navigator.share({text:t}).catch(function(){});}catch(e){}};
ACT['note-dup']=function(){var p=ui.page;closeSheet();p.dirty=true;saveNote();var n=byId(S.notes,p.id);if(!n)return;
  var c=JSON.parse(JSON.stringify(n));c.id=uid();c.ts=c.cts=Date.now();c.pin=false;delete c.sample;S.notes.push(c);save();toast('Kopya oluşturuldu');};
ACT['note-trash']=function(){var p=ui.page;closeSheet();if(!p.id){p.dirty=false;closePage();return;}p.dirty=true;saveNote();var id=p.id;p.dirty=false;closePage();noteSet(id,function(x){x.trash=Date.now();},'Not silindi');};
ACT['note-save']=function(){closePage();};
function saveNote(){
  var p=ui.page;if(!p||p.k!=='note'||!p.dirty)return;
  var d=p.draft,ti=String(d.title||'').trim(),items=d.list?d.items.filter(function(i){return String(i.t).trim();}).map(function(i){return {t:String(i.t),c:!!i.c};}):null,bo=d.list?items.map(function(i){return i.t;}).join('\n'):String(d.body||'');
  var empty=!ti&&!bo.trim();
  if(empty){if(p.id){var e=byId(S.notes,p.id);if(e&&!e.trash){e.trash=Date.now();save();toast('Boş not silindi');}}p.dirty=false;return;}
  var o={title:ti,body:bo,pin:!!d.pin,color:d.color||'',list:!!d.list,items:items||[],arch:false,ts:Date.now()};
  if(p.id){var n=byId(S.notes,p.id);if(n){Object.assign(n,o);if(!o.list)delete n.items;if(!o.color)delete n.color;delete n.sample;}}
  else{o.id=uid();o.cts=o.ts;if(!o.list)delete o.items;if(!o.color)delete o.color;S.notes.push(o);p.id=o.id;}
  p.dirty=false;save();
}
/* liste öğeleri: yazınca kaydet, Enter yeni öğe, boş öğede geri silme öncekine geçer; not alanı yazdıkça uzar */
document.addEventListener('input',function(e){var t=e.target;
  if(t.dataset&&t.dataset.ki!=null&&ui.page&&ui.page.k==='note'){var it=ui.page.draft.items[+t.dataset.ki];if(it){it.t=t.value;ui.page.dirty=true;}}
  if(t.classList&&t.classList.contains('kbody'))kGrow(t);});
document.addEventListener('keydown',function(e){var t=e.target;if(!t.dataset||t.dataset.ki==null||!ui.page||ui.page.k!=='note')return;
  var d=ui.page.draft,i=+t.dataset.ki;
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();var pos=t.selectionStart,txt=t.value;d.items[i].t=txt.slice(0,pos);d.items.splice(i+1,0,{t:txt.slice(pos),c:false});ui.page.dirty=true;kRender(i+1,false);}
  else if(e.key==='Backspace'&&!t.value&&d.items.length>1){e.preventDefault();d.items.splice(i,1);ui.page.dirty=true;var prev=i-1;while(prev>=0&&d.items[prev].c)prev--;kRender(prev>=0?prev:null);}
},true);
/* uygulama arka plana geçerse açık not kaydedilir */
document.addEventListener('visibilitychange',function(){if(document.hidden&&ui.page&&ui.page.k==='note'){saveNote();flushNative();}});

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
/* sözlükteki yerleşik ad yeniden adlandırıldıysa yeni ada (Ulaşım → Araç ve yol) */
function catRes(c){var g=0;while(S.catAlias&&S.catAlias[c]&&g++<8)c=S.catAlias[c];return c;}
function smartCat(text,type,amt){
  var n=fold(text||''),l=type==='inc'?INCC():EXPC();
  var r=S.rules.filter(function(x){return x.kw&&n.indexOf(fold(x.kw))>-1&&l.indexOf(x.cat)>=0;})[0];if(r)return r.cat;
  var g=catGuess(type,text,amt);if(g&&g.p>=0.6&&g.n>=2)return g.cat;
  for(var i=0;i<SMS_CAT.length;i++){var sc=catRes(SMS_CAT[i][0]);if(SMS_CAT[i][1].test(n)&&l.indexOf(sc)>=0)return sc;}
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
  /* ödenmiş kredi taksidinin anaparası tahminden düşmesin (ödenince dönem sonu "artan" büyümesin) */
  var recLeft=recDue(k).tot,debtPaid=recDebtPaid(k);
  var exp=r2(spent+rate*rem+recLeft+debtPaid),ai=avgMonthly('inc'),expInc=S.recurring.some(function(r){return r.inc&&recOn(r,k);})?inc+recIncDue(k):Math.max(inc+recIncDue(k),ai||0);
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
  top(recurCands()).forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'blue',ic:'repeat',t:esc(x.name)+' her ay yaklaşık '+esc(moneyIn(x.amt,x.acct,1))+' ('+x.n+' aydır, ayın '+x.day+sfx(x.day)+' civarı). Düzenli ödemelere eklersen hatırlatılır ve tahminlere girer.',btn:'Düzenli ödemelere ekle',act:'br-rec',id:x.key});});
  budgetPace().forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'exp',ic:'scale',t:'Bu hızla '+esc(x.c)+' bütçesi '+esc(pdate(x.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' civarında biter (kalan '+TRY0.format(x.left)+').',btn:'İşlemleri gör',act:'br-cat',id:x.c});});
  top(unusualTx()).forEach(function(x){if(!D[x.key])out.push({key:x.key,c:'warn',ic:'bell',t:'Olağandışı harcama: '+esc(x.t.note||x.t.cat)+' '+TRY0.format(txTL(x.t))+'. '+esc(x.t.cat)+' harcamaların genelde '+TRY0.format(x.md)+' civarı.',btn:'İşlemi aç',act:'edit-tx',id:x.t.id});});
  /* telefon kaybolursa veri de gider: 30 günde bir yedeği Drive'a ya da e-postaya paylaşmayı hatırlat */
  var bo=S.bkOutTs||0,ownN=S.tx.filter(function(t){return !t.sample;}).length;if(ownN>=20&&Date.now()-bo>30*864e5){var bk='bkout:'+todayS().slice(0,7);if(!D[bk])out.push({key:bk,c:'blue',ic:'share',t:bo?'Yedeğini telefon dışına '+Math.floor((Date.now()-bo)/864e5)+' gündür kaydetmedin. Telefon kaybolursa veriler de gider.':'Yedeğin yalnızca bu telefonda. Bir kopyasını Google Drive’a ya da e-postana kaydet.',btn:'Yedeği paylaş',act:'bk-share',id:''});}
  var ph=paydayHint();if(ph&&!D[ph.key])out.push({key:ph.key,c:'inc',ic:'cal',t:'Maaşın genelde ayın '+ph.day+sfx(ph.day)+'nde yatıyor. Dönemleri '+ph.day+sfx(ph.day)+'nden başlatırsan bütçe ve analizler maaş döngüne göre hesaplanır.',btn:'Dönemi '+ph.day+'’inden başlat',act:'br-pay',id:String(ph.day)});
  return out;
}
function brainCard(max){
  var l=brainItems();if(!l.length)return '';
  return '<div class="card brain"><h2>'+ic('sparkles')+' Akıllı tespitler</h2><div class="list">'+l.slice(0,max||6).map(function(x){
    return '<div class="item bi"><span class="sic" style="--c:var(--'+x.c+')">'+ic(x.ic)+'</span><span class="mid"><div class="wrap-t">'+x.t+'</div><div class="bacts"><button class="btn small" data-act="'+x.act+'" data-id="'+esc(x.id)+'">'+x.btn+'</button><button class="linkbtn" data-act="br-dis" data-id="'+esc(x.key)+'">Gizle</button></div></span></div>';}).join('')+'</div></div>';
}
ACT['br-dis']=function(el,id){S.brainDis=S.brainDis||{};S.brainDis[id]=Date.now();save();render();};
ACT['br-dup']=function(el,id){var t=byId(S.tx,id);if(!t)return;var back=txRemove(txGroup(t));save();render();toast('Çift kayıt silindi',function(){back();save();render();toast('Geri alındı');});};
ACT['br-rec']=function(el,id){var x=recurCands().filter(function(c){return c.key===id;})[0];if(!x)return;
  var r={id:uid(),name:x.name,amt:x.amt,day:x.day,cat:x.cat,acct:x.acct,paid:{}};var k=pk(x.last.date);if(k===curP())r.paid[k]=x.last.id;
  S.recurring.push(r);save();render();toast(x.name+' düzenli ödemelere eklendi');};
ACT['br-cat']=function(el,id){ui.month=curP();ui.tq='';ui.rng='ay';ui.filter='exp';ui.txv='list';goSec('islem');var q=document.getElementById('tq');if(q){q.value=id;q.dispatchEvent(new Event('input',{bubbles:true}));}};
ACT['br-pay']=function(el,id){var d=+id;if(!(d>=1&&d<=31))return;setPayday(d);ui.month=curP();save();render();toast('Dönemler artık ayın '+d+sfx(d)+'nden başlıyor');};

/* ---------- Koç: finansal özgürlük yol haritası ve finansal okuryazarlık ----------
   Kurallar:
   - Her öneri kullanıcının kendi verisinden çıkar ve koşulu sağlanmazsa görünmez; sayılar metinde gösterilir.
   - Veri yetmiyorsa öneri yerine hangi verinin eksik olduğu söylenir.
   - Türkiye'ye özgü oranlar aşağıda kaynağı ve tarihiyle durur (uygulama güncellemeleriyle yenilenir);
     ücretsiz ve anahtarsız güvenilir bir canlı kaynak bulunamadığı için ağdan alınmaz. Tarihi eskiyen veri ekranda belirtilir.
   - Ürün adı verilmez; kategoriler ve ödünleşimler anlatılır. Eğitim amaçlıdır, yatırım tavsiyesi değildir.
   Sıra (yerleşik kişisel finans önceliği): gelir ≥ gider → 1 aylık tampon → pahalı borç → 3–6 aylık acil durum fonu
   → enflasyona karşı koruma (reel getiri) → uzun vade (çeşitlendirme, BES) → finansal özgürlük. */
var FACTS={
  /* TÜİK TÜFE, aylık % değişim, 2024-01'den itibaren (TCMB "Tüketici Fiyatları" tablosu, 9 Kasım 2026'da okundu) */
  cpi:{from:'2024-01',m:[6.70,4.53,3.16,3.18,3.37,1.64,3.23,2.47,2.97,2.88,2.24,1.03,5.03,2.27,2.46,3.00,1.53,1.37,2.06,2.04,3.23,2.55,0.87,0.89,4.84,2.96,1.94,4.18,1.71,0.99,1.78,1.84,1.84,2.58]},
  inf:{v:29.77,m:2.58,per:'Ekim 2026',d:'2026-11-03',src:'TÜİK, Tüketici Fiyat Endeksi (TCMB enflasyon verileri sayfası)'},
  pol:{v:36,d:'2026-10-22',src:'TCMB Para Politikası Kurulu, basın duyurusu 2026-45'},
  dep:{t6:17.5,t12:15,t12p:10,d:'Kasım 2026',src:'Cumhurbaşkanı Kararı 10041 (9.7.2025) ve süre uzatımları; banka stopaj tabloları'},
  fund:{mm:17.5,eq:0,d:'Ekim 2026',src:'GVK geçici 67. madde; Cumhurbaşkanı Kararları 10041 ve 11107'},
  dibs:{v:0,until:'31 Aralık 2026',src:'Cumhurbaşkanı Kararı 11444 (Resmî Gazete 20.6.2026)'},
  /* kredi kartı azami aylık akdi faiz: dönem borcuna göre kademeler (TL) ve gecikme faizi */
  card:{t:[[30000,3.25,3.55],[180000,3.75,4.05],[Infinity,4.25,4.55]],cash:4.25,d:'Eylül 2026 (1 Ocak 2026’dan beri aynı)',src:'TCMB, kredi kartı azami faiz oranları (Tebliğ 2020/16)'},
  minpay:{lim:100000,lo:20,hi:40,d:'Ekim 2026',src:'BDDK Kararı 11581 (1.10.2026)'},
  bes:{v:20,cap:79272,vest:[[3,15],[6,35],[10,60]],d:'1 Ocak 2026',src:'Cumhurbaşkanı Kararı 10811 (Resmî Gazete 7.1.2026); Emeklilik Gözetim Merkezi'},
  tmsf:{v:1200000,d:'2026',src:'TMSF (1 Ocak 2026’dan itibaren)'},
  loan:{kkdf:15,bsmv:15,src:'İhtiyaç kredisi: KKDF %15, BSMV %15 (banka ürün bilgi formları)'}
};
var CK={v:-1};
function fPct(x,d){return '%'+(d?NUM2:NUM1).format(x);}
/* yıllık enflasyon verisi kaç günlük */
function infAge(){return daysBetween(FACTS.inf.d,todayS());}
/* iki tarih arasındaki birikimli TÜFE: aylık verilerle, ayın gün oranında; verinin bittiği aylardan sonrası son 12 ayın ortalama aylık
   oranıyla, 2024 öncesi Ocak 2024'teki yıllık oranla tahmin edilir (yaklaşık değer) */
function cpiRate(k){var C=FACTS.cpi,i=(+k.slice(0,4)-+C.from.slice(0,4))*12+(+k.slice(5,7)-+C.from.slice(5,7));
  if(i>=0&&i<C.m.length)return C.m[i]/100;return i<0?Math.pow(1.6486,1/12)-1:Math.pow(1+FACTS.inf.v/100,1/12)-1;}
function cumInf(a,b){
  if(!(b>a))return 0;var f=1,ma=a.slice(0,7),mb=b.slice(0,7),k=ma,g=0;
  while(k<=mb&&g++<600){var dim=new Date(+k.slice(0,4),+k.slice(5,7),0).getDate(),st=k===ma?+a.slice(8,10):0,en=k===mb?+b.slice(8,10):dim;
    f*=Math.pow(1+cpiRate(k),Math.max(0,en-st)/dim);k=addMonth(k,1);}
  return f-1;
}
/* kredi kartı: dönem borcuna göre yasal azami aylık faiz */
function cardRate(d){var t=FACTS.card.t;for(var i=0;i<t.length;i++)if(d<t[i][0])return t[i];return t[t.length-1];}
/* aylık r oranlı B borcu, ayda P ödemeyle kaç ayda biter (P ≤ faiz ise Infinity) */
function payoffMonths(B,r,P){if(B<=0)return 0;if(r<=0)return P>0?Math.ceil(B/P):Infinity;if(P<=B*r)return Infinity;return Math.ceil(-Math.log(1-r*B/P)/Math.log(1+r));}
function payoffInterest(B,r,P){var n=payoffMonths(B,r,P);if(!isFinite(n))return Infinity;var b=B,tot=0;for(var i=0;i<n&&b>0.005;i++){var it=b*r;tot+=it;b=b+it-Math.min(P,b+it);}return tot;}
function annual(rm){return (Math.pow(1+rm/100,12)-1)*100;}
var BUCK=[['tl','TL nakit ve mevduat'],['fx','Döviz'],['gold','Altın ve gümüş'],['eq','Hisse'],['fon','Fon'],['kripto','Kripto'],['bes','BES'],['diger','Diğer']];

/* kullanıcının verisinden ölçümler */
function coachData(){
  var key=TXV+'|'+S.savedAt+'|'+S.fxTs+'|'+todayS();if(CK.k===key)return CK.v;
  var cur=curP(),W=wealth(),ks=monthBase().ks.slice(0,3);
  var inc=0,exp=0;ks.forEach(function(k){var m=monthTx(k);inc+=sum(m,'inc');exp+=sum(m,'exp');});
  var n=ks.length;inc=n?r2(inc/n):0;exp=n?r2(exp/n):0;
  var incN=ks.filter(function(k){return sum(monthTx(k),'inc')>0;}).length;
  var surplus=r2(inc-exp),sr=inc>0?surplus/inc*100:null;
  var eg=emGoal(),em=eg?goalSaved(eg):Math.max(W.g.liquid,0),aex=avgMonthly('exp'),emM=aex>0?em/aex:null;
  /* vadesiz TL: nakit ve banka türü TL hesaplardaki artı bakiyeler (birikim hesapları faizli sayılır) */
  var vad=0,buck={tl:0,fx:0,gold:0,eq:0,fon:0,kripto:0,bes:0,diger:0};
  ACCS().forEach(function(a){var b=acctBal(a),t=acctType(a),c=ccyOf(a);if(b<=0||t==='kart')return;var tl=toTL(b,a);
    if(c==='TRY'){buck.tl+=tl;if(t==='nakit'||t==='banka')vad+=tl;}else if(c==='XAU')buck.gold+=tl;else buck.fx+=tl;});
  var hold=[];
  S.holdings.forEach(function(h){if(hKind(h)!=='inv')return;var v=hVal(h);if(!(v>0))return;
    var b={Hisse:'eq',Fon:'fon',Altın:'gold',Gümüş:'gold',Döviz:'fx',Kripto:'kripto',Mevduat:'tl',BES:'bes'}[h.type]||'diger';buck[b]+=v;
    var first=null;S.tx.forEach(function(t){if(t.type==='inv'&&t.side==='buy'&&t.hold===h.id&&(!first||t.date<first))first=t.date;});
    if(first&&hCost(h)>0)hold.push({h:h,date:first,days:daysBetween(first,todayS()),nom:hVal(h)/hCost(h)-1});});
  hold.forEach(function(x){x.inf=cumInf(x.date,todayS());x.real=(1+x.nom)/(1+x.inf)-1;});
  var fa=0;Object.keys(buck).forEach(function(k){buck[k]=r2(buck[k]);fa+=buck[k];});
  var cards=[];ACCS().forEach(function(a){if(acctType(a)!=='kart')return;var b=acctBal(a);if(!(b<0))return;var d=r2(toTL(-b,a)),x=ax(a),lim=+x.limit>0?toTL(+x.limit,a):0;
    cards.push({a:a,debt:d,lim:lim,rate:cardRate(d),mp:lim>0?(lim>FACTS.minpay.lim?FACTS.minpay.hi:FACTS.minpay.lo):null});});
  var debts=S.debts.filter(function(d){return debtLeft(d)>0;}).map(function(d){var r=+d.rate>0?+d.rate:null,inst=0;
    S.recurring.forEach(function(rc){if(rc.debt===d.id)inst+=isWk(rc)?recMonthly(rc):toTL(+rc.amt||0,rc.acct);});return {d:d,left:debtLeft(d),rate:r,ann:r!=null?annual(r):null,inst:r2(inst)};});
  var v={cur:cur,n:n,incN:incN,inc:inc,exp:exp,surplus:surplus,sr:sr,W:W,eg:eg,em:r2(em),emM:emM,vad:r2(vad),buck:buck,fa:r2(fa),hold:hold,cards:cards,debts:debts,
    cardDebt:r2(cards.reduce(function(a,c){return a+c.debt;},0)),liquid:Math.max(W.g.liquid,0),fire:fireModel(),sample:hasSample()};
  CK={k:key,v:v};return v;
}

/* yol haritası: her adım {id,t,st:'done'|'now'|'need'|'todo',sum,body,act,why} */
function coachSteps(){
  var D=coachData(),I=FACTS.inf.v,out=[],T=TRY0.format,G=D.exp,S0=D.surplus,
    nextEnd=pdate(pEnd(D.cur)).toLocaleDateString('tr-TR',{day:'numeric',month:'long'});
  var noHist=D.n===0,noInc=D.incN===0;
  /* 1. akış */
  (function(){var s={id:'akis',t:'Gelirin giderini karşılasın'};
    if(noHist){s.st='need';s.sum='Henüz tamamlanmış bir dönemin yok.';s.body='Koç, tamamlanmış dönemlerin ortalamasıyla çalışır. Bu dönem '+esc(nextEnd)+' günü bitince gelir ve giderlerinden hesaplanır.';}
    else if(noInc){s.st='need';s.sum='Son '+D.n+' dönemde gelir kaydı yok.';s.body='Tasarruf oranı ve diğer adımlar gelire göre hesaplanır. Maaşını ve diğer gelirlerini gelir olarak ekle.';s.act=['Gelir ekle','qa-inc'];}
    else if(S0<0){s.st='now';var avg=catAvg(D.cur),top=Object.keys(avg).sort(function(a,b){return avg[b]-avg[a];}).slice(0,3);
      s.sum='Ayda ortalama '+T(-S0)+' açık veriyorsun.';
      s.body='Son '+D.n+' dönemde ortalama gelirin <b>'+T(D.inc)+'</b>, giderin <b>'+T(D.exp)+'</b>: ayda <b class="exp">'+T(-S0)+'</b> açık. '+(top.length?'En büyük kalemlerin: '+top.map(function(c){return esc(c)+' '+T(avg[c]);}).join(', ')+'. ':'')+'Açık kapanmadan borç kapatma ya da birikim planı sürdürülemez; önce bu kalemlere bütçe koy.';
      s.act=Object.keys(S.budgets).length?['Bütçeye git','plan-go',null,'butce']:['Bütçe öner','plan-go',null,'butce'];}
    else{s.st='done';s.sum='Tasarruf oranın '+fPct(D.sr)+' (ayda '+T(S0)+').';
      s.body='Son '+D.n+' dönemde ortalama gelirin '+T(D.inc)+', giderin '+T(D.exp)+'.'+(D.sr<10?' Oran düşük: gelirin en az %10–20’sini ayırabilmek için en büyük harcama kalemlerine bak.':'');}
    s.why='<p>Tasarruf oranı = (gelir − gider) ÷ gelir. Senin için: ('+T(D.inc)+' − '+T(D.exp)+') ÷ '+T(D.inc)+(D.inc>0?' = '+fPct(D.sr||0):'')+'. Gelir giderden azsa aradaki fark ya birikimden ya da borçtan karşılanır; ikisi de sürdürülemez.</p>';
    out.push(s);})();
  /* 2. küçük tampon */
  (function(){var s={id:'tampon',t:'Önce 1 aylık tampon',act:['Acil durum fonu','em-open']};
    if(!(G>0)){s.st='need';s.sum='Aylık gider ortalaman yok.';s.body='Tamponun büyüklüğü aylık giderine göre hesaplanır. Bir dönemin giderleri kaydedilince hesaplanır.';}
    else if(D.em<G){s.st='now';var miss=G-D.em,mo=S0>0?Math.ceil(miss/S0):null;s.sum=T(D.em)+' var, 1 aylık gider '+T(G)+'.';
      s.body=(D.eg?'“'+esc(D.eg.name)+'” fonunda':'Nakit, banka ve birikim hesaplarında')+' <b>'+T(D.em)+'</b> var; bir aylık giderin <b>'+T(G)+'</b>. Eksik: <b>'+T(miss)+'</b>.'+(mo?' Aylık fazlanın ('+T(S0)+') tamamını ayırırsan '+mo+' ayda tamamlanır.':'')+' Beklenmedik bir masraf seni karta ya da krediye itmesin diye borçlara saldırmadan önce bu küçük tamponu kur.';}
    else{s.st='done';s.sum=T(D.em)+': en az 1 aylık gider hazır.';s.body='Ayrılmış paran ('+T(D.em)+') bir aylık giderini ('+T(G)+') karşılıyor.';}
    s.why='<p>Tampon yoksa küçük bir sürpriz (arıza, sağlık) çoğu zaman kredi kartına yazılır. Kartta taşınan borcun yasal azami faizi aylık '+fPct(FACTS.card.t[0][1],1)+'–'+fPct(FACTS.card.t[2][1],1)+' (yıllık bileşik '+fPct(annual(FACTS.card.t[0][1]))+'–'+fPct(annual(FACTS.card.t[2][1]))+').</p>';
    out.push(s);})();
  /* 3. pahalı borç */
  (function(){var s={id:'borc',t:'Pahalı borçları kapat'},lines=[],now=false,need=[];
    D.cards.forEach(function(c){var r=c.rate[1],mpP=c.mp,mpA=mpP!=null?c.debt*mpP/100:null,left=mpA!=null?c.debt-mpA:c.debt*0.8,intr=left*r/100;
      var cover=D.liquid>=c.debt;if(!cover)now=true;
      lines.push('<li><b>'+esc(c.a)+'</b>: borç '+T(c.debt)+'. '+(mpP!=null?'Asgari ödeme dönem borcunun %'+mpP+sfx(mpP)+' ('+T(mpA)+'). ':'Kart limiti girilmediği için asgari ödeme %'+FACTS.minpay.lo+' varsayıldı (limit ₺'+NUM1.format(FACTS.minpay.lim/1000)+' binin üstündeyse %'+FACTS.minpay.hi+'). ')+'Yalnızca asgariyi ödersen kalan '+T(left)+' için ayda yaklaşık <b>'+T(intr)+'</b> faiz işler (yasal üst sınır aylık '+fPct(r,1)+').'+(cover?' Nakit ve banka bakiyen ('+T(D.liquid)+') borcun tamamını karşılıyor: son ödeme gününde tamamını öde.':' <b class="exp">Nakit ve banka bakiyen ('+T(D.liquid)+') borcu karşılamıyor.</b>')+'</li>');});
    var hi=D.debts.filter(function(x){return x.rate!=null&&x.ann>I;}).sort(function(a,b){return b.rate-a.rate;}),lo=D.debts.filter(function(x){return x.rate!=null&&x.ann<=I;});
    hi.forEach(function(x,i){now=true;var P=Math.max(S0,0)+x.inst,n=P>0?payoffMonths(x.left,x.rate/100,P):Infinity,it=isFinite(n)?payoffInterest(x.left,x.rate/100,P):null;
      lines.push('<li>'+(i===0&&hi.length>1?'<b>Önce bu:</b> ':'')+'<b>'+esc(x.d.name)+'</b>: kalan '+T(x.left)+', aylık faiz '+fPct(x.rate,1)+' (yıllık bileşik '+fPct(x.ann)+'; enflasyon '+fPct(I,1)+'). '+(isFinite(n)?(x.inst>0?'Taksitin ('+T(x.inst)+') ve aylık fazlan':'Aylık fazlan')+' ('+T(P)+') ile yaklaşık <b>'+n+' ayda</b> kapanır, toplam faiz ~'+T(it)+'.':(P>0?'Ayda '+T(P)+' ödeme faizi ('+T(x.left*x.rate/100)+') bile karşılamıyor.':'Aylık fazlan olmadığı için erken kapatma planı yapılamıyor.'))+'</li>');});
    lo.forEach(function(x){lines.push('<li><b>'+esc(x.d.name)+'</b>: yıllık bileşik maliyeti '+fPct(x.ann)+', enflasyonun ('+fPct(I,1)+') altında; reel maliyeti eksi. Erken kapatmak yerine önce acil durum fonu ve birikim.</li>');});
    D.debts.filter(function(x){return x.rate==null;}).forEach(function(x){need.push(x.d);});
    if(!D.cards.length&&!D.debts.length){s.st='done';s.sum='Kayıtlı borcun ya da kart borcun yok.';s.body='Kredi kartı borcu ya da kredi kaydı görünmüyor.';}
    else if(now){s.st='now';s.sum=hi.length?hi.length+' borcun faizi enflasyonun üstünde.':'Kart borcun nakit bakiyeni aşıyor.';}
    else if(need.length){s.st='need';s.sum=need.length+' borcun faiz oranı girilmemiş.';}
    else{s.st='done';s.sum=D.cards.length?'Kart borcunu nakdinle kapatabiliyorsun.':'Borçlarının faizi enflasyonun altında.';}
    if(!s.body)s.body=(lines.length?'<ul class="cl">'+lines.join('')+'</ul>':'')+(need.length?'<p>'+need.map(function(d){return '“'+esc(d.name)+'”';}).join(', ')+' için aylık faiz oranını gir; hangi borcu önce kapatman gerektiğini buna göre hesaplarım.</p>':'')+(hi.length>1?'<p>Sıralama en yüksek faizliden başlar (çığ yöntemi): diğerlerinin taksitlerini öde, fazlanı en pahalıya yönlendir.</p>':'');
    s.act=need.length?['Faiz oranını gir','edit-d',need[0].id]:(D.debts.length?['Borçlarım','sv-go',null,'borc']:(D.cards.length?['Kartı öde','acct-trf',D.cards[0].a]:null));
    s.why='<p>Yıllık bileşik maliyet = (1 + aylık faiz)<sup>12</sup> − 1. Aylık '+fPct(FACTS.card.t[0][1],1)+' kart faizi yılda '+fPct(annual(FACTS.card.t[0][1]))+' eder. Enflasyonun ('+fPct(I,1)+') üstünde faizli bir borcu erken kapatmak, o faiz kadar risksiz bir getiri gibidir; enflasyonun altında faizli borcun reel maliyeti eksidir.</p><p>Asgari ödeme: kart limiti ₺'+NUM1.format(FACTS.minpay.lim/1000)+' bine kadar olanlarda dönem borcunun %'+FACTS.minpay.lo+'’si, üstünde %'+FACTS.minpay.hi+'’ı. Asgari ödeyip kalanı devretmek, kalan tutara akdi faiz işlemesi demektir.</p>';
    out.push(s);})();
  /* 4. acil durum fonu */
  (function(){var s={id:'acil',t:'Acil durum fonu: 3–6 aylık gider',act:['Acil durum fonu','em-open']};
    if(!(G>0)){s.st='need';s.sum='Aylık gider ortalaman yok.';s.body='Fon hedefi aylık giderine göre hesaplanır.';}
    else{var m=D.emM,t3=3*G,t6=6*G;
      if(m<3){s.st='now';var miss=t3-D.em,mo=S0>0?Math.ceil(miss/S0):null;s.sum=NUM1.format(m)+' aylık gider; hedef 3–6 ay.';
        s.body='Acil durum fonun <b>'+T(D.em)+'</b>, aylık giderinin ('+T(G)+') <b>'+NUM1.format(m)+' katı</b>; hedef 3–6 ay ('+T(t3)+'–'+T(t6)+'). 3 ay için eksik: <b>'+T(miss)+'</b>.'+(mo?' Aylık fazlanın tamamını ('+T(S0)+') ayırırsan '+mo+' ayda, yarısını ayırırsan '+Math.ceil(miss/(S0/2))+' ayda tamamlanır.':' Önce akışı artıya çevirmek gerekiyor.')+(D.eg?'':' Ayrı bir fon işaretlemedin; nakit, banka ve birikim hesapların sayıldı.');}
      else{s.st='done';s.sum=NUM1.format(m)+' aylık gider hazır.';s.body='Fonun '+T(D.em)+', '+NUM1.format(m)+' aylık giderini karşılıyor'+(m<6?'; gelirin düzensizse 6 aya ('+T(t6)+') tamamla.':'.');}}
    s.why='<p>Acil durum fonu hızlı ulaşılabilir ve değeri dalgalanmayan yerde durmalı: vadesiz ya da kısa vadeli mevduat, para piyasası fonu gibi. Hisse ve kripto bu iş için uygun değildir; ihtiyaç anında değer kaybında olabilirler.</p><p>Bankadaki mevduat ve katılım fonları kişi ve banka başına '+T(FACTS.tmsf.v)+'’ye kadar TMSF güvencesindedir ('+FACTS.tmsf.d+'). Yatırım fonları mevduat sigortası kapsamında değildir.</p>';
    out.push(s);})();
  /* 5. enflasyona karşı koru */
  (function(){var s={id:'enf',t:'Parayı enflasyona karşı koru'},lines=[],now=false;
    if(!(D.fa>0)){s.st='need';s.sum='Hesap bakiyelerin ve yatırımların girilmemiş.';s.body='Hesaplarına başlangıç bakiyesi gir ya da yatırımlarını ekle; paranın ne kadarının faizsiz beklediğini hesaplarım.';s.act=['Hesaplarım','sv-go',null,'hesap'];out.push(s);return;}
    var idle=G>0?D.vad-G:0;
    if(G>0&&idle>=G*0.5){now=true;var loss=idle*(1-1/(1+I/100));
      lines.push('<li>Vadesiz TL hesaplarında (nakit ve banka) <b>'+T(D.vad)+'</b> var; bir aylık giderini ('+T(G)+') ayırınca <b>'+T(idle)+'</b> faizsiz bekliyor. Yıllık enflasyon '+fPct(I,1)+' sürerse bu tutarın alım gücü bir yılda yaklaşık <b class="exp">'+T(loss)+'</b> azalır.</li>');}
    D.hold.filter(function(x){return x.days>=60;}).sort(function(a,b){return a.real-b.real;}).slice(0,4).forEach(function(x){if(x.real<-0.02)now=true;
      lines.push('<li><b>'+esc(x.h.name)+'</b>: alıştan bu yana nominal '+(x.nom>=0?'+':'−')+fPct(Math.abs(x.nom*100))+' ('+Math.round(x.days/30.4)+' ay); aynı sürede TÜFE ~'+fPct(x.inf*100)+' → reel <b class="'+(x.real>=0?'inc':'exp')+'">'+(x.real>=0?'+':'−')+fPct(Math.abs(x.real*100))+'</b>.</li>');});
    s.st=now?'now':'done';
    s.sum=now?(G>0&&idle>=G*0.5?T(idle)+' faizsiz bekliyor.':'Bir yatırımının reel getirisi eksi.'):(lines.length?'Yatırımlarının reel getirisi takipte.':'Faizsiz bekleyen fazla TL yok.');
    s.body=(lines.length?'<ul class="cl">'+lines.join('')+'</ul>':'<p>Vadesiz TL hesaplarındaki para ('+T(D.vad)+') bir aylık giderin civarında.</p>')+(G>0&&idle>=G*0.5?'<p>Seçenekler ve ödünleşimleri: vadeli mevduat (TMSF güvencesi, faize vadeye göre %'+NUM1.format(FACTS.dep.t6)+'–%'+NUM1.format(FACTS.dep.t12p)+' stopaj), para piyasası fonları (günlük çıkış, kazanca %'+NUM1.format(FACTS.fund.mm)+' stopaj, güvence yok), Devlet iç borçlanma senetleri (stopaj %'+FACTS.dibs.v+', '+FACTS.dibs.until+'’e kadar; vadeden önce satışta fiyat değişebilir). Karar vermeden önce net getiriyi enflasyonla karşılaştır.</p>':'');
    s.act=G>0&&idle>=G*0.5?['Mevduat hesaplayıcı','calc-go',null,'mevduat']:null;
    s.why='<p>Reel getiri = (1 + nominal getiri) ÷ (1 + enflasyon) − 1. Örnek: yıllık net %'+NUM1.format(I+5)+' getiri, %'+NUM1.format(I)+' enflasyonda reel ~'+fPct(((1+(I+5)/100)/(1+I/100)-1)*100)+'. Vadesiz hesabın nominal getirisi sıfır olduğundan reel getirisi '+fPct(-(1-1/(1+I/100))*100)+'.</p><p>Net getiri = brüt getiri × (1 − stopaj). Politika faizi '+fPct(FACTS.pol.v,1)+', yıllık enflasyon '+fPct(I,1)+' ('+esc(FACTS.inf.per)+').</p>';
    out.push(s);})();
  /* 6. uzun vade: çeşitlendirme ve BES */
  (function(){var s={id:'uzun',t:'Uzun vade: çeşitlendir, BES’i değerlendir'},lines=[],now=false;
    var pre=out.slice(0,4).every(function(x){return x.st==='done';});
    var top=BUCK.map(function(b){return [b[0],b[1],D.buck[b[0]]];}).sort(function(a,b){return b[2]-a[2];})[0];
    if(G>0&&D.fa>=3*G&&top&&top[2]/D.fa>0.8){now=true;lines.push('<li>Finansal varlıklarının (<b>'+T(D.fa)+'</b>) <b>'+fPct(top[2]/D.fa*100,0)+'</b>’i tek türde: '+esc(top[1])+'. Tek varlık türü, o türün riskini (TL’de enflasyon, dövizde kur, altında fiyat dalgalanması, hissede piyasa düşüşü) olduğu gibi taşır.</li>');}
    var hasBes=D.buck.bes>0;
    if(!hasBes&&D.inc>0&&S0>0){now=true;var q=Math.max(Math.round(S0/4/100)*100,100),dk=Math.min(q*12,FACTS.bes.cap/FACTS.bes.v*100)*FACTS.bes.v/100;
      lines.push('<li>Kayıtlı BES görünmüyor. Devlet katkısı yatırdığın katkı payının <b>%'+FACTS.bes.v+'</b>’si ('+FACTS.bes.d+'’ten beri; 2026’da yıllık en çok '+T(FACTS.bes.cap)+'). Örnek: aylık fazlanın dörtte birini (<b>'+T(q)+'</b>) ayırsan yılda ~<b>'+T(dk)+'</b> devlet katkısı eklenir. Ödünleşim: 3 yıldan önce çıkarsan devlet katkısının hiçbiri, 3 yılda %15’i, 6 yılda %35’i, 10 yılda %60’ı senin olur; tamamı 10 yıl ve 56 yaşla emeklilikte.</li>');}
    if(!pre){s.st='todo';s.sum='Önceki adımlar tamamlanınca.';s.body=lines.length?'<ul class="cl">'+lines.join('')+'</ul><p class="small muted">Önce önceki adımları tamamla.</p>':'<p>Önceki adımlar tamamlanınca değerlendirilir.</p>';}
    else if(now){s.st='now';s.sum=lines.length+' konu var.';s.body='<ul class="cl">'+lines.join('')+'</ul>';}
    else{s.st='done';s.sum=hasBes?'BES ve dağılım takipte.':'Varlık dağılımın dengeli görünüyor.';s.body='<p>Finansal varlıkların: '+BUCK.filter(function(b){return D.buck[b[0]]>0;}).map(function(b){return esc(b[1])+' '+fPct(D.buck[b[0]]/D.fa*100,0);}).join(', ')+'.</p>';}
    s.act=['Varlık dağılımı','sv-go',null,'hesap'];
    s.why='<p>Çeşitlendirme: farklı nedenlerle değer kazanıp kaybeden varlıkları bir arada tutmak tek bir riskin seni çok etkilemesini azaltır. Uzun vadede hisse senetlerinin ve hisse yoğun fonların getirisi yüksek ama dalgalıdır; TEFAS’ta işlem gören hisse yoğun fonların kazancında stopaj %'+FACTS.fund.eq+', para piyasası ve borçlanma araçları fonlarında %'+NUM1.format(FACTS.fund.mm)+'.</p><p>Bileşik getiri: getirinin de getiri kazanması. Reel %4 ile 20 yılda para '+NUM2.format(Math.pow(1.04,20))+' katına çıkar.</p>';
    out.push(s);})();
  /* 7. finansal özgürlük */
  (function(){var m=D.fire,s={id:'fire',t:'Finansal özgürlük',act:['FIRE hesabı','open-fire']},pre=out.every(function(x){return x.st==='done';});
    if(!m.ok){s.st='need';s.sum='Aylık harcama verisi yok.';s.body='Hedef, aylık harcamandan hesaplanır.';}
    else{s.st=pre?'now':'todo';s.sum=fPct(m.prog,0)+' · '+fmtYears(m.n);
      s.body='Hedef '+DC0.format(m.target)+(m.custom?' (senin hedefin)':' (yıllık harcamanın '+NUM1.format(1/m.wr)+' katı)')+'; mevcut '+DC0.format(Math.max(m.assets,0))+' (%'+NUM1.format(m.prog)+'). Aylık '+DC0.format(m.sv)+' birikim ve yıllık reel %'+NUM1.format(+S.fire.ret)+' getiriyle tahmini süre: <b>'+esc(fmtYears(m.n))+'</b>.';}
    s.why='<p>%4 kuralı: yıllık harcamanın 25 katı birikime ulaşınca her yıl %4 çekerek yaşayabilmek. ABD verisine dayanır; Türkiye’de enflasyon ve getiriler farklı seyredebilir, bu yüzden hesap reel (enflasyondan arındırılmış) getiriyle yapılır.</p>';
    out.push(s);})();
  return out;
}
function coachCur(l){l=l||coachSteps();for(var i=0;i<l.length;i++)if(l[i].st==='now'||l[i].st==='need')return i;return -1;}
var CSI={done:['check','inc','Tamam'],now:['flag','warn','Şimdi'],need:['search','blue','Veri gerekli'],todo:['r','ink2','Sonra']};
function stepAct(s){var a=s.act;if(!a)return '';return '<button class="btn small" data-act="'+a[1]+'"'+(a[2]!=null?' data-id="'+esc(a[2])+'"':'')+(a[3]!=null?' data-v="'+esc(a[3])+'"':'')+'>'+esc(a[0])+'</button>';}
function vKoc(){
  var D=coachData(),l=coachSteps(),ci=coachCur(l),H=health(),sc=H.score,h='';
  if(D.sample)h+='<div class="banner"><span>Koç şu an örnek verilere bakıyor; kendi kayıtların eklendikçe öneriler sana göre değişir.</span></div>';
  var ring=sc==null?'':'<svg class="ring" viewBox="0 0 42 42" role="img" aria-label="Finansal sağlık puanı '+sc+'"><circle cx="21" cy="21" r="17" fill="none" stroke="var(--soft)" stroke-width="5"/><circle cx="21" cy="21" r="17" fill="none" stroke="'+(sc>=60?'var(--inc)':(sc>=40?'var(--warn)':'var(--exp)'))+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(sc/100*106.8).toFixed(1)+' 106.8" transform="rotate(-90 21 21)"/><text x="21" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">'+sc+'</text></svg>';
  var tile=function(k,v,act,vv){return '<button class="kt" data-act="'+act+'"'+(vv?' data-v="'+vv+'"':'')+'><span class="lbl">'+k+'</span><b class="num">'+v+'</b></button>';};
  h+='<div class="card kochead"><div class="ghead">'+ring+'<span class="mid"><h2 style="margin:0">Finansal durumun</h2><div class="small muted">'+(sc==null?'Puan için gelir-gider kaydı gerekli.':scoreWord(sc)+' · 100 üzerinden '+sc)+'</div></span></div><div class="ktg">'
   +tile('Tasarruf oranı',D.sr==null?'—':(D.sr<0?'−':'')+'%'+Math.round(Math.abs(D.sr)),'an-go','ozet')
   +tile('Acil durum fonu',D.emM==null?'—':NUM1.format(D.emM)+' ay','em-open')
   +tile('Borç',D.cardDebt+D.debts.reduce(function(a,x){return a+x.left;},0)>0?compactT(D.cardDebt+D.debts.reduce(function(a,x){return a+x.left;},0)):'Yok','sv-go','borc')
   +tile('Özgürlük',D.fire.ok?'%'+NUM1.format(D.fire.prog):'—','open-fire')+'</div></div>';
  if(ci>=0){var c=l[ci];
    h+='<div class="card kocnow"><div class="lbl">Adım '+(ci+1)+'/'+l.length+' · '+CSI[c.st][2]+'</div><h2 style="margin:4px 0 4px">'+esc(c.t)+'</h2><p class="small muted" style="margin:0">'+c.sum+'</p>'+(c.act?'<div class="kacts">'+stepAct(c)+'</div>':'')+'<details class="why"><summary>Ayrıntı</summary><div class="kb">'+c.body+'</div></details><details class="why"><summary>Neden? Kısa ders</summary>'+c.why+'</details></div>';}
  else h+='<div class="card kocnow"><div class="lbl">Yol haritası</div><h2 style="margin:4px 0 6px">Tüm adımlar tamam</h2><p class="small muted" style="margin:0">Finansal özgürlük hesabını düzenli kontrol et.</p></div>';
  /* 4.4: araçlar uzun yol haritası ve oranlar kartının altında kalıyordu; şu anki adımın hemen altında */
  h+='<div class="two homelinks"><button class="setcard" data-act="qa-calc"><span class="sic" style="--c:var(--blue)">'+ic('calc')+'</span><span class="mid"><div class="t">Hesaplayıcılar</div></span></button><button class="setcard" data-act="ai-open"><span class="sic" style="--c:var(--accent)">'+ic('sparkles')+'</span><span class="mid"><div class="t">Claude’a sor</div></span></button></div>';
  h+='<div class="card"><h2>Yol haritan</h2><div class="list">'+l.map(function(s,i){var x=CSI[s.st];
    if(i===ci)return '<div class="kstep st-'+s.st+' cur"><div class="item"><span class="sic sm" style="--c:var(--'+x[1]+')">'+ic(x[0])+'</span><span class="mid"><div class="t">'+(i+1)+'. '+esc(s.t)+'</div><div class="small muted">Şu anki adım</div></span></div></div>';
    return '<details class="kstep st-'+s.st+'"><summary class="item"><span class="sic sm" style="--c:var(--'+x[1]+')">'+ic(x[0])+'</span><span class="mid"><div class="t">'+(i+1)+'. '+esc(s.t)+'</div><div class="small muted">'+s.sum+'</div></span></summary><div class="kb">'+s.body+(s.act?'<div class="kacts">'+stepAct(s)+'</div>':'')+'<details class="why"><summary>Neden?</summary>'+s.why+'</details></div></details>';}).join('')+'</div></div>';
  h+=factsCard();
  h+='<p class="small muted" style="margin:0 2px">Koç senin kayıtlarından hesaplar; eğitim amaçlıdır, yatırım tavsiyesi değildir.</p>';
  return h;
}
function factsCard(){
  var F=FACTS,old=infAge()>45,row=function(k,v,s){return '<div class="r"><span>'+k+'<div class="small muted">'+esc(s)+'</div></span><span class="num" style="text-align:right">'+v+'</span></div>';};
  return '<details class="card facts"><summary><b>Türkiye’de güncel oranlar</b><span class="small muted"> · kaynaklı</span></summary>'+(old?'<p class="small exp" style="margin:8px 0 0">Enflasyon verisi '+infAge()+' günlük; uygulama güncellenince yenilenir. Güncel değeri TÜİK’ten kontrol et.</p>':'')+'<div class="res">'
   +row('Yıllık enflasyon (TÜFE)',fPct(F.inf.v,1),F.inf.per+' · '+F.inf.src)
   +row('Politika faizi',fPct(F.pol.v,0),pdate(F.pol.d).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})+' · '+F.pol.src)
   +row('TL mevduat stopajı','%'+NUM1.format(F.dep.t6)+' / %'+NUM1.format(F.dep.t12)+' / %'+NUM1.format(F.dep.t12p),'6 aya, 1 yıla kadar ve daha uzun vade · '+F.dep.d+' · '+F.dep.src)
   +row('Fon kazancı stopajı','%'+NUM1.format(F.fund.mm)+' / %'+F.fund.eq,'Para piyasası ve borçlanma araçları / TEFAS’taki hisse yoğun fonlar · '+F.fund.d+' · '+F.fund.src)
   +row('DİBS faiz stopajı','%'+F.dibs.v,F.dibs.until+'’e kadar · '+F.dibs.src)
   +row('Kredi kartı azami faizi',fPct(F.card.t[0][1],1)+'–'+fPct(F.card.t[2][1],1),'Aylık; dönem borcu ₺30 bin altı / ₺180 bin üstü · nakit avans '+fPct(F.card.cash,1)+' · '+F.card.d+' · '+F.card.src)
   +row('Kart asgari ödeme','%'+F.minpay.lo+' / %'+F.minpay.hi,'Limit ₺100 bine kadar / üstü · '+F.minpay.src)
   +row('BES devlet katkısı','%'+F.bes.v,'2026 yıllık üst sınır '+TRY0.format(F.bes.cap)+' · '+F.bes.src)
   +row('Mevduat güvencesi',TRY0.format(F.tmsf.v),'Kişi ve banka başına · '+F.tmsf.src)
   +'</div><p class="small muted" style="margin:8px 0 0">Oranlar Cumhurbaşkanı kararı, TCMB ve BDDK düzenlemeleriyle değişebilir; işlem yapmadan önce bankandan ya da resmî kaynaktan teyit et.</p></details>';
}
/* Ana sayfadaki kısa kart: şu anki adım */
function coachHome(inner){
  var D=coachData();if(!S.tx.length)return '';var l=coachSteps(),ci=coachCur(l);
  if(ci<0)return '';var c=l[ci];
  return '<button class="'+(inner?'item':'card')+' cochome" data-act="plan-go" data-v="koc"><span class="sic" style="--c:var(--'+CSI[c.st][1]+')">'+ic(CSI[c.st][0])+'</span><span class="mid"><div class="lbl">Koç · adım '+(ci+1)+'/'+l.length+'</div><div class="t">'+esc(c.t)+'</div><div class="small muted">'+c.sum+'</div></span>'+ic('r')+'</button>';
}
ACT['calc-go']=function(el,id,v){if(CALCS[v])ui.calc=v;openPage({k:'araclar'},'araclar');};

/* ---------- 4.12: fiş fotoğrafı ----------
   Fotoğraf küçültülür (en uzun kenar 1600 px, JPEG) ve cihazdaki IndexedDB'de tutulur; işlemde yalnız t.rc=1 işareti olur.
   Normal yedeğe girmez (yedek küçük ve hızlı kalsın); Veri ve yedek › Fiş fotoğrafları ayrı bir yedek dosyası üretir.
   Silinen işlemlerin fotoğrafları açılıştan biraz sonra temizlenir. */
var RDB=null;
function rcDb(){if(RDB)return RDB;
  RDB=new Promise(function(res,rej){if(!window.indexedDB){rej(new Error('idb'));return;}var q;try{q=indexedDB.open('wallet-media',1);}catch(e){rej(e);return;}
    q.onupgradeneeded=function(){q.result.createObjectStore('rc');};q.onsuccess=function(){res(q.result);};q.onerror=function(){rej(q.error);};q.onblocked=function(){rej(new Error('blocked'));};});
  RDB.catch(function(){RDB=null;});return RDB;}
function rcReq(mode,fn){return rcDb().then(function(db){return new Promise(function(res,rej){var tr=db.transaction('rc',mode),rq=fn(tr.objectStore('rc'));
  tr.oncomplete=function(){res(rq?rq.result:undefined);};tr.onerror=function(){rej(tr.error);};tr.onabort=function(){rej(tr.error);};});});}
function rcPut(id,blob){return rcReq('readwrite',function(st){return st.put({b:blob,ts:Date.now()},String(id));});}
function rcGet(id){return rcReq('readonly',function(st){return st.get(String(id));}).then(function(v){return v&&v.b||null;});}
function rcDel(id){return rcReq('readwrite',function(st){return st.delete(String(id));});}
function rcKeys(){return rcReq('readonly',function(st){return st.getAllKeys();});}
function rcAll(){return rcReq('readonly',function(st){return st.getAll();}).then(function(vals){return rcKeys().then(function(ks){var o={};ks.forEach(function(k,i){if(vals[i]&&vals[i].b)o[k]=vals[i].b;});return o;});});}
/* fotoğrafı küçült: EXIF yönü tarayıcıca uygulanır; şeffaf alan beyaz olur */
function rcShrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();
  im.onload=function(){var w=im.naturalWidth,h=im.naturalHeight,s=Math.min(1,1600/Math.max(w,h,1)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));
    var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
    c.toBlob(function(b){if(b)res(b);else rej(new Error('blob'));},'image/jpeg',0.72);};
  im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('img'));};im.src=u;});}
/* işlem penceresindeki fotoğraf alanı: ui.rcPend yeni seçilen (henüz kaydedilmedi), ui.rcDel kaldırılacak */
var RCURL=null;
function rcFree(){if(RCURL){try{URL.revokeObjectURL(RCURL);}catch(e){}RCURL=null;}}
function rcHas(t){return !!ui.rcPend||(!!(t&&t.rc)&&!ui.rcDel);}
function rcField(t){return '<div class="field" id="row-rc"><span class="flbl">Fiş fotoğrafı</span><div id="rc-box" class="rcbox">'+rcBox(t)+'</div></div>';}
function rcBox(t){
  if(!rcHas(t))return '<label class="btn ghost filebtn rcadd">'+ic('camera')+'<span>Fotoğraf ekle</span><input type="file" id="rc-file" accept="image/*"></label>';
  return '<button class="rcthumb" data-act="rc-view" aria-label="Fiş fotoğrafını büyüt"><img id="rc-img" alt="Fiş fotoğrafı"><span class="small muted" id="rc-msg">Yükleniyor…</span></button>'
   +'<div class="rcacts"><label class="btn small ghost filebtn">Değiştir<input type="file" id="rc-file" accept="image/*"></label><button class="btn small ghost" data-act="rc-rm">Kaldır</button></div>';}
function rcFill(t){var img=document.getElementById('rc-img'),m=document.getElementById('rc-msg');if(!img)return;rcFree();
  var show=function(b){if(!b){if(m)m.textContent='Fotoğraf bu cihazda yok (yedekten yüklenmiş olabilir).';img.hidden=true;return;}RCURL=URL.createObjectURL(b);img.src=RCURL;img.hidden=false;if(m)m.hidden=true;};
  if(ui.rcPend){show(ui.rcPend);return;}if(t&&t.rc)rcGet(t.id).then(show,function(){show(null);});}
function rcRedraw(){var box=document.getElementById('rc-box');if(!box)return;box.innerHTML=rcBox(txOrig);rcFill(txOrig);}
function rcPick(f){if(!f)return;var box=document.getElementById('rc-box');if(box)box.insertAdjacentHTML('beforeend','<div class="small muted" id="rc-wait">Fotoğraf hazırlanıyor…</div>');
  rcShrink(f).then(function(b){ui.rcPend=b;ui.rcDel=false;rcRedraw();},function(){var w=document.getElementById('rc-wait');if(w)w.remove();toast('Bu fotoğraf açılamadı. JPEG ya da PNG olarak seçmeyi dene.');});}
ACT['rc-rm']=function(){ui.rcPend=null;ui.rcDel=!!(txOrig&&txOrig.rc);rcRedraw();};
ACT['rc-view']=function(){if(!RCURL)return;var v=document.createElement('div');v.id='rcview';v.className='rcview';v.setAttribute('role','dialog');v.setAttribute('aria-label','Fiş fotoğrafı');
  v.innerHTML='<img src="'+RCURL+'" alt="Fiş fotoğrafı"><button class="icon-btn" data-act="rc-close" aria-label="Kapat">'+ic('x')+'</button>';v.addEventListener('click',function(e){if(e.target===v||e.target.tagName==='IMG')v.remove();});document.body.appendChild(v);};
ACT['rc-close']=function(){var v=document.getElementById('rcview');if(v)v.remove();};
/* kayıt: işlem kaydedilince bekleyen fotoğraf yazılır ya da kaldırılır */
function rcCommit(id){var t=byId(S.tx,id),p=ui.rcPend,d=ui.rcDel;ui.rcPend=null;ui.rcDel=false;if(!t)return;
  if(p){t.rc=1;S.rcUsed=1;rcPut(id,p).catch(function(){var x=byId(S.tx,id);if(x){delete x.rc;save();}toast('Fiş fotoğrafı kaydedilemedi: cihaz deposu dolu olabilir.');});}
  else if(d){delete t.rc;rcDel(id).catch(function(){});}}
/* artık olmayan işlemlerin fotoğrafları temizlenir */
function rcGc(){if(!S.rcUsed)return Promise.resolve(0);
  return rcKeys().then(function(ks){var ids={};S.tx.forEach(function(t){ids[t.id]=1;});var old=ks.filter(function(k){return !ids[k];});return Promise.all(old.map(rcDel)).then(function(){return old.length;});},function(){return 0;});}
/* fotoğraf yedeği: {walletMedia:1, items:{işlemKimliği: dataURL}} */
function blobUrl(b){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(String(fr.result));};fr.onerror=function(){rej(fr.error);};fr.readAsDataURL(b);});}
function urlBlob(u){var m=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(u||''));if(!m)return null;var a=unb64(m[2]);return new Blob([a],{type:m[1]});}
ACT['rc-bk']=function(){rcAll().then(function(o){var ids={};S.tx.forEach(function(t){ids[t.id]=1;});var ks=Object.keys(o).filter(function(k){return ids[k];});
  if(!ks.length){msg('Yedeklenecek fiş fotoğrafı yok.',false,'f-rcm');return;}
  return Promise.all(ks.map(function(k){return blobUrl(o[k]);})).then(function(us){var it={};ks.forEach(function(k,i){it[k]=us[i];});
    saveFile('wallet-fisler-'+todayS()+'.json',JSON.stringify({walletMedia:1,ts:Date.now(),items:it}),ks.length+' fiş fotoğrafı kaydedildi.','f-rcm');});},
  function(){msg('Fotoğraflar okunamadı.',false,'f-rcm');});};
function rcImport(txt){var o;try{o=JSON.parse(txt);}catch(e){o=null;}if(!o||!o.walletMedia||!o.items||typeof o.items!=='object'){msg('Bu bir fiş fotoğrafı yedeği değil.',false,'f-rcm');return;}
  var ks=Object.keys(o.items).filter(function(k){return /^[\w.:-]{1,64}$/.test(k);}),n=0,jobs=[];
  if(ks.length)S.rcUsed=1;ks.forEach(function(k){var b=urlBlob(o.items[k]);if(!b)return;n++;jobs.push(rcPut(k,b));var t=byId(S.tx,k);if(t)t.rc=1;});
  Promise.all(jobs).then(function(){save();render();msg(n+' fiş fotoğrafı yüklendi.',true,'f-rcm');},function(){msg('Fotoğraflar yazılamadı: cihaz deposu dolu olabilir.',false,'f-rcm');});}
function rcStats(){return rcAll().then(function(o){var n=0,sz=0;Object.keys(o).forEach(function(k){if(byId(S.tx,k)){n++;sz+=o[k].size||0;}});return {n:n,sz:sz};});}
function rcSec(){var n=S.tx.filter(function(t){return t.rc;}).length;
  return sec('Fiş fotoğrafları','<div class="small muted" id="rc-stat">'+(n?n+' işlemde fotoğraf var.':'Henüz fiş fotoğrafı yok. İşlem penceresindeki “Fotoğraf ekle” ile eklenir.')+'</div>'
    +(n?'<button class="btn ghost" data-act="rc-bk">Fotoğrafları yedekle</button>':'')+'<label class="btn ghost filebtn">Fotoğraf yedeğini yükle<input id="rcm-file" type="file" accept=".json,application/json,text/plain"></label><div class="err" id="f-rcm"></div>',
    'Fotoğraflar bu cihazda tutulur ve normal yedeğe girmez (yedek küçük kalsın diye). Telefon değiştirirken fotoğraf yedeğini de al; önce normal yedeği, sonra fotoğraf yedeğini yükle.');}
function rcStatFill(){var e=document.getElementById('rc-stat');if(!e)return;rcStats().then(function(s){if(s.n)e.textContent=s.n+' fotoğraf · '+NUM1.format(s.sz/1048576)+' MB';},function(){});}

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

/* ---------- 4.12: mevduat, fon ve birikim hesabı getirisi kendiliğinden işlenir ----------
   Yatırım (piyasaya bağlı olmayan): h.yr yıllık oran (%), h.yd başlangıç günü, h.vd vade (gün; 0 = günlük/vadesiz), h.tax stopaj (%), h.roll vade sonunda yenile.
     Mevduat: brüt faizden stopaj düşülür; vadeli mevduatta vade sonunda faiz anaparaya eklenip yenilenir (yenilenmiyorsa ilk vadede durur).
     Fon, BES ve diğer: yazılan yıllık (net, tahmini) getiriyle günlük bileşik büyür. Piyasadan bağlı fonlarda gerçek fiyat kullanılır.
   Değer büyür, maliyet aynı kalır: aradaki fark kâr olarak görünür. Alım/satımda ya da fiyat elle değişince birikim fiyata katılıp o günden yeniden başlar.
   Birikim hesabı: hesaba yıllık faiz yazılırsa her ay sonunda o ayın günlük bakiyelerinden net faiz "Yatırım getirisi › Faiz" geliri olarak işlenir. */
function yOn(h){return hKind(h)==='inv'&&!h.mk&&+h.yr>0&&/^\d{4}-\d{2}-\d{2}$/.test(h.yd||'');}
function isDep(h){return h.type==='Mevduat';}
/* stopaj: vadeye göre (6 aya kadar, 1 yıla kadar, daha uzun); günlük/vadesiz hesap 6 aya kadar oranında */
function depTax(vd){var D=FACTS.dep;return !(vd>0)||vd<=183?D.t6:(vd<=366?D.t12:D.t12p);}
function yTax(h){return h.tax!=null&&h.tax!==''?+h.tax||0:(isDep(h)?depTax(+h.vd||0):0);}
/* bugüne kadarki büyüme çarpanı */
function yFac(h,to){if(!yOn(h))return 1;var d=daysBetween(h.yd,to||todayS());if(!(d>0))return 1;var r=(+h.yr)/100,n=1-yTax(h)/100;
  if(!isDep(h))return Math.pow(1+r,d/365);
  var vd=+h.vd||0;if(!(vd>0))return Math.pow(1+r*n/365,d);
  var k=Math.floor(d/vd),rem=d-k*vd,g=1+r*n*vd/365;
  if(h.roll===false)return k>=1?g:1+r*n*d/365;
  return Math.pow(g,k)*(1+r*n*rem/365);}
/* vadeli mevduatın sıradaki vade sonu (yenilenmiyorsa ilk vade sonu) */
function yMat(h){if(!yOn(h)||!isDep(h)||!(+h.vd>0))return null;var vd=+h.vd,d=Math.max(daysBetween(h.yd,todayS()),0),k=Math.floor(d/vd);if(h.roll===false)return addD(h.yd,vd);return addD(h.yd,(k+1)*vd);}
/* büyümeyi fiyata (ya da kurla değerlenende miktara) kat ve bugünden yeniden başlat */
function yCrys(h){var f=yFac(h);if(f!==1){if(h.ccy)h.qty=+(h.qty*f).toFixed(6);else h.price=+(h.price*f).toFixed(6);}if(yOn(h))h.yd=todayS();}
function yLine(x){if(!yOn(x))return '';var f=yFac(x),base=hVal(x)/f,earn=hVal(x)-base,m=yMat(x),tx=yTax(x);
  return '<div class="small muted ytl">'+ic('percent')+'<span>'+(isDep(x)?'Yıllık brüt %'+NUM2.format(+x.yr)+(tx?' · stopaj %'+NUM1.format(tx):'')+(+x.vd>0?' · '+x.vd+' gün vadeli':' · günlük'):'Tahmini yıllık %'+NUM2.format(+x.yr))
   +' · <b class="num inc">+'+TRY0.format(earn)+'</b> '+(isDep(x)?'net faiz':'getiri')+' ('+pdate(x.yd).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+'’den beri)'
   +(m?' · vade sonu '+pdate(m).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})+(x.roll===false&&m<=todayS()?' (doldu)':''):'')+'</span></div>';}
/* yatırım penceresindeki alanlar */
function yFields(x,type){var dep=type==='Mevduat',on=x&&+x.yr>0;
  return '<div id="row-yield" class="stack" style="gap:10px"'+(yShow(type,x&&x.mk)?'':' hidden')+'>'
   +'<div class="two"><div class="field"><label for="h-yr" id="lb-hyr">'+(dep?'Yıllık brüt faiz (%)':'Tahmini yıllık getiri (%)')+'</label><input id="h-yr" inputmode="decimal" placeholder="İsteğe bağlı, örn. 40" value="'+(on?nv(x.yr):'')+'"></div>'
   +'<div class="field"><label for="h-yd">Başlangıç</label><input id="h-yd" type="date" value="'+esc(on&&x.yd?x.yd:todayS())+'"></div></div>'
   +'<div class="two" id="row-dep"'+(dep?'':' hidden')+'><div class="field"><label for="h-vd">Vade (gün)</label><input id="h-vd" inputmode="numeric" maxlength="4" placeholder="Günlükse boş" value="'+(x&&+x.vd>0?x.vd:'')+'"></div>'
   +'<div class="field"><label for="h-tax">Stopaj (%)</label><input id="h-tax" inputmode="decimal" placeholder="'+NUM1.format(depTax(x&&+x.vd||0))+'" value="'+(x&&x.tax!=null&&x.tax!==''?nv(x.tax):'')+'"></div></div>'
   +'<label class="chk" id="row-roll"'+(dep?'':' hidden')+'><input type="checkbox" id="h-roll"'+(x&&x.roll===false?'':' checked')+'> Vade sonunda faiziyle birlikte yenilensin</label>'
   +'<p class="small muted" style="margin:0" id="h-yhint">'+(dep?'Faiz her gün işlenir; değer ve kâr kendiliğinden artar. Stopaj boşsa vadeye göre güncel oran kullanılır.':'Fon fiyatı piyasadan bağlı değilse değer bu oranla her gün artar (tahmindir). Piyasalar’dan eklenen fonlarda gerçek fiyat kullanılır.')+'</p></div>';}
function yShow(type,mk){return !mk&&['Mevduat','Fon','BES','Diğer yatırım'].indexOf(type)>=0;}
function ySync(){var t=val('h-type'),c=val('h-ccy'),row=document.getElementById('row-yield');if(!row)return;var dep=t==='Mevduat';row.hidden=!yShow(t,c.indexOf('mk:')===0);
  ['row-dep','row-roll'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=!dep;});var l=document.getElementById('lb-hyr');if(l)l.textContent=dep?'Yıllık brüt faiz (%)':'Tahmini yıllık getiri (%)';
  var tx=document.getElementById('h-tax');if(tx)tx.placeholder=NUM1.format(depTax(+num(val('h-vd'))||0));
  var hh=document.getElementById('h-yhint'),yr=num(val('h-yr')),q=num(val('h-qty')),p=num(val('h-price'))||num(val('h-cost'));
  if(hh&&yr>0&&q>0&&p>0&&!c){var v=q*p,tax=val('h-tax')!==''?num(val('h-tax')):(dep?depTax(+num(val('h-vd'))||0):0),vd=Math.round(num(val('h-vd')));
    hh.textContent=dep?('Net günlük faiz ≈ '+TRY2.format(v*yr/100*(1-tax/100)/365)+(vd>0?' · vade sonu net ≈ '+TRY2.format(v*yr/100*(1-tax/100)*vd/365):'')):('Bu oranla bir yılda ≈ '+TRY0.format(v*yr/100)+' getiri (tahmini).');}}
/* kayıtta okunur: geçersizse hata metni döner */
function yRead(h,x){var t=h.type;if(!yShow(t,h.mk)){['yr','yd','vd','tax','roll'].forEach(function(k){delete h[k];});return '';}
  var yr=num(val('h-yr'));if(!(yr>0)){h.yr=0;return '';}if(yr>500)return 'Yıllık oran en fazla %500 olabilir.';
  var yd=val('h-yd');if(!/^\d{4}-\d{2}-\d{2}$/.test(yd))yd=todayS();if(yd>todayS())yd=todayS();h.yr=r2(yr);h.yd=yd;
  if(t==='Mevduat'){var vd=Math.round(num(val('h-vd')));if(vd<0||vd>3650)return 'Vade 0 ile 3650 gün arasında olmalı.';h.vd=vd>0?vd:0;var ts=val('h-tax').trim();if(ts!==''){var tv=num(ts);if(tv<0||tv>100)return 'Stopaj 0 ile 100 arasında olmalı.';h.tax=tv;}else h.tax='';var rc=document.getElementById('h-roll');h.roll=!rc||rc.checked;}
  else{h.vd=0;h.tax='';h.roll=true;}
  /* düzenlemede oran ya da başlangıç değişmediyse birikim korunur */
  return '';}
/* vade sonu hatırlatması (Gündem): yaklaşan ya da dolan, yenilenmeyen vadeli mevduat */
function yAlerts(days){var out=[],t0=todayS();S.holdings.forEach(function(h){var m=yMat(h);if(!m)return;var d=daysBetween(t0,m);
  if(h.roll===false&&d<0&&d>=-14)out.push(['warn',h.name+': vade '+(-d)+' gün önce doldu, faiz işlemiyor',['edit-h',h.id,null,'Gör']]);
  else if(d>=0&&d<=Math.max(days,1))out.push(['warn',h.name+': vade '+(d===0?'bugün':d+' gün sonra')+' doluyor'+(h.roll===false?'':' (yenilenecek)'),['edit-h',h.id,null,'Gör']]);});return out;}

/* ---- birikim hesabı: aylık faiz geliri ---- */
function aRate(a){var x=ax(a);return acctType(a)==='birikim'&&+x.rate>0?+x.rate:0;}
/* ay içindeki günlük bakiyelerden net faiz (hesabın kendi para biriminde); from'dan önceki günler sayılmaz */
function aInt(a,m,from,upto){var x=ax(a),r=aRate(a)/100,tax=(x.tax!=null&&x.tax!==''?+x.tax:FACTS.dep.t6)/100,y=+m.slice(0,4),mo=+m.slice(5,7),dim=dimYM(y,mo),tot=0;if(!(r>0))return 0;
  var st=m+'-01',en=m+'-'+pad(dim),txs=S.tx.filter(function(t){return (t.acct===a||t.to===a)&&t.date<=en;}),od=(S.openD||{})[a];
  var b=+S.opening[a]||0;txs.forEach(function(t){if(t.date<st&&!(od&&t.date<od))b+=txDelta(t,a);});
  var byDay={};txs.forEach(function(t){if(t.date>=st&&!(od&&t.date<od))byDay[t.date]=(byDay[t.date]||0)+txDelta(t,a);});
  for(var d=1;d<=dim;d++){var ds=m+'-'+pad(d);if(byDay[ds])b+=byDay[ds];if(upto&&ds>upto)break;if((from&&ds<from)||(od&&ds<od))continue;if(b>0)tot+=b*r/365;}
  return r2(tot*(1-tax));}
/* biten aylar için faiz geliri işlenir (en çok son 12 ay); x.rateM son işlenen ay */
function yieldPost(){var n=0,cm=mkey(today0());ACCS().forEach(function(a){if(!aRate(a))return;var x=S.accx[a];if(!x||!x.rateFrom)return;
  var m=x.rateM?addMonth(x.rateM,1):x.rateFrom.slice(0,7),g=0;if(mdiff(m,cm)>12)m=addMonth(cm,-12);
  while(m<cm&&g++<13){var v=aInt(a,m,x.rateFrom);if(v>=0.01){var y=+m.slice(0,4),mo=+m.slice(5,7);S.tx.push({id:uid(),type:'inc',amt:v,cat:ensureCat('inc','Yatırım getirisi'),sub:'Faiz',acct:a,date:m+'-'+pad(dimYM(y,mo)),note:a+' faizi · '+mlabel(m),auto:'int'});n++;}x.rateM=m;m=addMonth(m,1);}});
  if(n){S.subs['Yatırım getirisi']=subsOf('Yatırım getirisi');if(S.subs['Yatırım getirisi'].indexOf('Faiz')<0)S.subs['Yatırım getirisi'].push('Faiz');save();}return n;}
/* bu ay şimdiye kadar biriken (henüz işlenmemiş) faiz */
function aIntNow(a){var x=ax(a);if(!aRate(a)||!x.rateFrom)return 0;return aInt(a,mkey(today0()),x.rateFrom,todayS());}

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
/* ---------- başlangıç ---------- */
document.getElementById('fab').innerHTML=ic('plus');
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}
purgeTrash();
try{autoPost();}catch(e){}
try{yieldPost();}catch(e){}
var H0=(location.hash||'').slice(1);
restoreUi();
try{if(TABH[H0]){ui.page=null;ui.sub=TABH[H0];persistUi();}}catch(e){}
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
/* 4.12: silinmiş işlemlerin fiş fotoğrafları temizlenir; bekleyen bulut yedeği yüklenir; mevduat ve birikim getirileri işlenir */
setTimeout(function(){try{rcGc();}catch(e){}try{if(clDue())clPush();}catch(e){}},6000);
bgRates();setTimeout(function(){notifyDue();pushPlan();pullSms();if(S.autoBk&&bkOk()&&Date.now()-(S.bkTs||0)>864e5)autoBackup();},1500);
})();
