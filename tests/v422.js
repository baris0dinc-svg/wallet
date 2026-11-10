// 4.22: gerçek mağaza logosu — eşleştirme, liste satırı, yüklenemeyince kategori simgesi, ayar, kendi eşleştirmen, güvenlik politikası
const {chromium}=require('playwright');
const zlib=require('zlib');
// n×n tek renk PNG (gerçek logo yerine; 16 piksel = servisin "simge yok" resmi)
function png(n){const crc=b=>{let c,r=~0;for(const x of b){c=(r^x)&255;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xEDB88320:c>>>1;r=(r>>>8)^c;}return (~r)>>>0;};
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(n,0);ih.writeUInt32BE(n,4);ih[8]=8;ih[9]=2;const row=Buffer.concat([Buffer.from([0]),Buffer.alloc(n*3,200)]);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(Buffer.concat(Array(n).fill(row)))),ch('IEND',Buffer.alloc(0))]);}
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780},hasTouch:true});const p=await ctx.newPage();
const errs=[],req=[],csp=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/Content Security Policy/i.test(m.text()))csp.push(m.text());});
await p.route('https://www.google.com/s2/favicons**',r=>{const u=new URL(r.request().url());const d=u.searchParams.get('domain')||u.searchParams.get('domain_url');req.push(d);
  if(/yok\.example\.com/.test(d))return r.fulfill({status:404,contentType:'image/png',body:png(16)});
  if(/bozuk\.example\.com/.test(d))return r.abort();
  if(d==='sadecewww.example.com'||d==='https://www.sadecewww.example.com/')return r.fulfill({status:200,contentType:'image/png',body:png(16)});
  if(d==='tamadres.example.com')return r.fulfill({status:404,contentType:'image/png',body:png(16)});if(d==='www.tamadres.example.com')return r.abort();
  return r.fulfill({status:200,contentType:'image/png',body:png(64)});});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const F=[];
const r=await p.evaluate(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));const S=T.S;
  // ---- eşleştirme ----
  const M=[['Migros','migros.com.tr'],['migros’tan alışveriş','migros.com.tr'],['BİM','bim.com.tr'],['A101','a101.com.tr'],['a-101 market','a101.com.tr'],['ŞOK','sokmarket.com.tr'],['Şok Market','sokmarket.com.tr'],
    ['CarrefourSA','carrefoursa.com'],['Trendyol Yemek','trendyol.com'],['hepsiburada','hepsiburada.com'],['Getir','getir.com'],['Yemeksepeti','yemeksepeti.com'],['NETFLIX.COM','netflix.com'],['Spotify Premium','spotify.com'],
    ['LC Waikiki','lcwaikiki.com'],['H&M','hm.com'],['Pull&Bear','pullandbear.com'],['Pull and Bear','pullandbear.com'],['Mavi','mavi.com'],['Mavi’den','mavi.com'],['D&R','dr.com.tr'],['Starbucks','starbucks.com.tr'],
    ['McDonald’s','mcdonalds.com.tr'],['Burger King','burgerking.com.tr'],['Shell','shell.com.tr'],['Opet','opet.com.tr'],['Turkcell fatura','turkcell.com.tr'],['Türk Telekom','turktelekom.com.tr'],['THY bilet','turkishairlines.com'],
    ['İş Bankası','isbank.com.tr'],['Garanti','garantibbva.com.tr'],['IKEA','ikea.com.tr'],['Koçtaş','koctas.com.tr'],['PttAVM','pttavm.com'],['PTT','ptt.gov.tr'],['Saat&Saat','saatvesaat.com.tr'],['GetirYemek','getir.com'],['Çiçeksepeti','ciceksepeti.com'],['Kahve Dünyası','kahvedunyasi.com'],['İGDAŞ','igdas.istanbul']];
  M.forEach(m=>c(T.mrcDom(m[0])===m[1],'“'+m[0]+'” → '+m[1]+' (çıkan: '+T.mrcDom(m[0])+')'));
  // gündelik kelimeler yanlış logo getirmez
  ['mavi gömlek','garanti uzatma','metro','su getirdim','sokak simidi','bimeks','kira','market','vatan caddesi','dolap aldım','toplam','hasOwnProperty','','flora','ingilizce kurs','upsss'].forEach(x=>c(T.mrcDom(x)==='','“'+x+'” logo getirmemeli (çıkan: '+T.mrcDom(x)+')'));
  c(T.mrcList().length>250,'mağaza listesi: '+T.mrcList().length);
  c(T.mrcList().every(x=>x[1].split(',').every(y=>T.mrcClean(y)===y)),'bütün site adları geçerli');
  c(T.mrcClean('https://www.Ornek.com.tr/abc?x=1')==='ornek.com.tr'&&T.mrcClean('ornek')===''&&T.mrcClean('a b.com')===''&&T.mrcClean('x.com"><img')==='','site adı temizliği');
  // ---- liste satırı ----
  const cat=T.EXPC()[0],ac=S.tx[0]?S.tx[0].acct:Object.keys(S.opening)[0]||'Nakit';const d=T.isoDate(new Date());
  S.tx.unshift({id:'m1',type:'exp',amt:120,acct:ac,cat:cat,date:d,note:'Migros'},{id:'m2',type:'exp',amt:50,acct:ac,cat:cat,date:d,note:'köşedeki bakkal'},{id:'m3',type:'exp',amt:99,acct:ac,cat:cat,date:d,note:'aylık',sub:'Netflix'});T.save();
  T.ui.sub='islem';T.ui.page=null;T.render();await W(500);
  const row=id=>document.querySelector('.item[data-id="'+id+'"]');
  c(!!row('m1')&&!!row('m1').querySelector('.cic.mlg.ok img'),'Migros satırında logo');
  c(row('m1')&&/s2\/favicons\?sz=128&domain=migros\.com\.tr$/.test(row('m1').querySelector('img').src),'logo adresi: '+(row('m1')&&row('m1').querySelector('img')||{}).src);
  c(row('m1')&&row('m1').querySelector('img').getAttribute('referrerpolicy')==='no-referrer','yönlendiren bilgisi gönderilmez');
  c(row('m1')&&getComputedStyle(row('m1').querySelector('img')).opacity==='1'&&row('m1').querySelector('.cic').getBoundingClientRect().width===36,'logo görünür, 36 piksel kutuda');
  c(!!row('m2')&&!row('m2').querySelector('img')&&!!row('m2').querySelector('.cic svg'),'tanınmayan yerde kategori simgesi');
  c(!!row('m3')&&!!row('m3').querySelector('.cic.mlg.ok img'),'alt kategoriden logo (Netflix)');
  // yeniden çizimde logo beklemeden görünür
  T.render();c(row('m1').querySelector('.cic').classList.contains('ok'),'yeniden çizimde hazır');
  // ---- düzenli ödeme ----
  S.recurring.push({id:'mr1',name:'Spotify',amt:60,cat:cat,acct:ac,type:'exp',day:5,since:T.curP?T.curP():undefined});T.save();
  T.ui.sub='plan';T.ui.plan='duzenli';T.render();await W(400);
  const rr=document.querySelector('.rmain[data-id="mr1"]');c(!rr||!!rr.querySelector('.cic.mlg.ok img'),'düzenli ödemede logo');
  // ---- kendi eşleştirmen ve "simge yok" ----
  T.ACT['open-set'](null,'genel','ayarlar');await W(200);
  c(!!document.querySelector('[data-act="tgl"][data-v="mlg"]')&&document.querySelector('[data-act="tgl"][data-v="mlg"]').getAttribute('aria-checked')==='true','Ayarlar’da Mağaza logoları açık');
  const set=(n,dm)=>{document.getElementById('ml-n').value=n;document.getElementById('ml-d').value=dm;T.ACT['mlg-add']();};
  set('k','x.com');c(/en az 2/.test(document.getElementById('ml-err').textContent),'kısa ad reddedilir');
  set('Köşedeki Bakkal','bakkal');c(/ornek\.com/.test(document.getElementById('ml-err').textContent)&&!S.mlgs['kosedeki bakkal'],'geçersiz site reddedilir');
  set('Köşedeki Bakkal','https://www.bakkal.example.com/');c(S.mlgs['kosedeki bakkal']==='bakkal.example.com','kendi mağazan eklendi '+JSON.stringify(S.mlgs));
  c(T.mrcDom('köşedeki bakkal')==='bakkal.example.com','kendi eşleştirmen çalışır');
  set('yokcu','yok.example.com');set('bozukcu','bozuk.example.com');set('wwwcu','sadecewww.example.com');set('tamci','tamadres.example.com');
  const d2=T.isoDate(new Date());S.tx.unshift({id:'m4',type:'exp',amt:1,acct:ac,cat:cat,date:d2,note:'yokcu'},{id:'m5',type:'exp',amt:1,acct:ac,cat:cat,date:d2,note:'bozukcu'},{id:'m8',type:'exp',amt:1,acct:ac,cat:cat,date:d2,note:'wwwcu'},{id:'m9',type:'exp',amt:1,acct:ac,cat:cat,date:d2,note:'tamci'});T.save();
  T.closeSheet&&T.closeSheet();T.ui.page=null;T.ui.sub='islem';T.render();await W(700);
  c(!!row('m2').querySelector('.cic.mlg.ok img'),'eklenen mağazanın logosu listede');
  c(!!row('m4')&&!row('m4').querySelector('img')&&!row('m4').querySelector('.cic').classList.contains('ok')&&!!row('m4').querySelector('svg'),'simgesi olmayan sitede (16 piksel) kategori simgesi kalır');
  c(!!row('m5')&&!row('m5').querySelector('img')&&!!row('m5').querySelector('svg'),'yüklenemeyen logoda kategori simgesi kalır');
  T.render();c(!row('m4').querySelector('img')&&!row('m5').querySelector('img'),'başarısız logo yeniden denenmez');
  // sıradaki adresler: site → www'li → tam adres; bulunan adım hatırlanır
  const g8=row('m8')&&row('m8').querySelector('img'),g9=row('m9')&&row('m9').querySelector('img');
  c(!!g8&&/[?&]domain=www\.sadecewww\.example\.com$/.test(g8.src)&&g8.dataset.s==='1'&&row('m8').querySelector('.cic').classList.contains('ok'),'logo www’li adresten geldi '+(g8&&g8.src));
  c(!!g9&&/domain_url=https%3A%2F%2Fwww\.tamadres\.example\.com%2F$/.test(g9.src)&&g9.dataset.s==='2'&&row('m9').querySelector('.cic').classList.contains('ok'),'logo tam adresten geldi '+(g9&&g9.src));
  c(T.mrcUrls('a.com,b.com').length===6&&/domain=b\.com$/.test(T.mrcUrls('a.com,b.com')[3]),'yedek site sırası');
  // ---- yedek: ayar ve eşleştirmeler korunur, bozuk veri ayıklanır ----
  const n=T.norm(JSON.parse(JSON.stringify(Object.assign({},S,{mlgs:{'iyi ad':'iyi.com','x':'a.com','kotu':'<script>'}}))));c(n.mlg===true&&JSON.stringify(n.mlgs)==='{"iyi ad":"iyi.com"}','norm ayıklar '+JSON.stringify(n.mlgs));
  c(T.norm({}).mlg===true&&T.norm({mlg:false}).mlg===false,'varsayılan açık, kapalıysa kapalı kalır');
  // ---- sil ve kapat ----
  T.ACT['mlg-del'](null,'kosedeki bakkal');T.render();c(!S.mlgs['kosedeki bakkal']&&!row('m2').querySelector('img'),'eşleştirme silindi');
  T.ACT.tgl(null,null,'mlg');T.render();c(S.mlg===false&&!document.querySelector('.cic.mlg')&&!!row('m1').querySelector('.cic svg'),'kapatınca hiç logo istenmez');
  T.ACT.tgl(null,null,'mlg');T.render();c(!!row('m1').querySelector('.cic.mlg'),'açınca geri gelir');
  // çevrimdışıyken istek yok
  Object.defineProperty(navigator,'onLine',{get:()=>false,configurable:true});T.render();c(!document.querySelector('.cic.mlg'),'çevrimdışıyken logo istenmez');delete navigator.onLine;
  return o;});
F.push(...r);if(errs.length)F.push('JS hata: '+errs.join(' | '));if(csp.length)F.push('güvenlik politikası engeli: '+csp[0]);
if(req.indexOf('migros.com.tr')<0||req.indexOf('netflix.com')<0)F.push('logo istekleri: '+req.join());
if(req.filter(d=>/yok\.example/.test(d)).length!==3||req.filter(d=>/bozuk\.example/.test(d)).length!==3)F.push('başarısız site için 3 deneme bekleniyordu: '+req.filter(d=>/yok\.|bozuk\./.test(d)).join());
if(req.some(d=>!/^(https:\/\/www\.)?[a-z0-9.-]+\/?$/.test(d)))F.push('istekte site adından başka veri: '+req.join());
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
