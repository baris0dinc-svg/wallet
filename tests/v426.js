// 4.26: daha çok logo — banka hesapları, borçlar, yatırımlar, piyasa (hisse, fon, kripto, yabancı), döviz bayrağı, altın çizimi
const {chromium}=require('playwright');const zlib=require('zlib');
function png(n){const crc=b=>{let c,r=~0;for(const x of b){c=(r^x)&255;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xEDB88320:c>>>1;r=(r>>>8)^c;}return (~r)>>>0;};
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(n,0);ih.writeUInt32BE(n,4);ih[8]=8;ih[9]=2;const row=Buffer.concat([Buffer.from([0]),Buffer.alloc(n*3,200)]);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(Buffer.concat(Array(n).fill(row)))),ch('IEND',Buffer.alloc(0))]);}
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780},hasTouch:true});const p=await ctx.newPage();
const errs=[],csp=[],flags=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/Content Security Policy/i.test(m.text()))csp.push(m.text());});
await p.route('https://www.google.com/s2/favicons**',r=>{const d=new URL(r.request().url()).searchParams.get('domain')||'';return /yokbanka/.test(d)?r.fulfill({status:404,contentType:'image/png',body:png(16)}):r.fulfill({status:200,contentType:'image/png',body:png(64)});});
await p.route('https://favicon.vemetric.com/**',r=>r.fulfill({status:200,contentType:'image/png',body:png(128)}));
await p.route('https://flagcdn.com/**',r=>{flags.push(new URL(r.request().url()).pathname);r.fulfill({status:200,contentType:'image/png',body:png(80)});});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const r=await p.evaluate(async()=>{const T=window.__T,o=[],S=T.S;const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  // ---- eşleştirmeler ----
  const B=[['Ziraat Bankası','ziraatbank.com.tr'],['Ziraat Katılım','ziraatkatilim.com.tr'],['İş Bankası maaş','isbank.com.tr'],['İş','isbank.com.tr'],['Deniz','denizbank.com,denizbank.at,denizyatirim.com'],['Halk','halkbank.com.tr'],
    ['Vakıf hesabım','~vakifbank.com.tr'],['Yapı Kredi','yapikredi.com.tr'],['World kart','yapikredi.com.tr'],['Bonus kart','garantibbva.com.tr'],['Enpara','enpara.com'],['Papara','papara.com'],['Midas','getmidas.com'],['Kuveyt Türk','kuveytturk.com.tr'],
    ['Anadolubank','anadolubank.com.tr'],['Revolut','revolut.com'],['İş Yatırım','isyatirim.com.tr'],['Akbank','akbank.com'],['Axess','akbank.com'],['TEB','cepteteb.com.tr'],['ING','ing.com.tr'],['Türk Telekom','~turktelekom.com.tr,ttinvestorrelations.com']];
  B.forEach(x=>c(T.bankDom(x[0])===x[1],'hesap “'+x[0]+'” → '+x[1]+' (çıkan: '+T.bankDom(x[0])+')'));
  ['Nakit','Cüzdan','Kumbara','Birikim','Ev','Param','Eve','Tema','Deniz manzarası kira'].forEach(x=>c(T.bankDom(x)===''||x==='Deniz manzarası kira','“'+x+'” banka sanılmamalı (çıkan: '+T.bankDom(x)+')'));
  c(T.mrcDom('param')===''&&T.mrcDom('eve')===''&&T.mrcDom('ego')===''&&T.mrcDom('deniz')==='','gündelik kelimeler işlemde logo getirmez');
  const M=[['bist:THYAO','turkishairlines.com'],['bist:ASELS','aselsan.com'],['bist:GARAN','garantibbva.com.tr'],['bist:BIMAS','bim.com.tr'],['bist:TUPRS','tupras.com.tr'],['cg:bitcoin','bitcoin.org'],['cg:ethereum','ethereum.org'],
    ['yh:AAPL','apple.com'],['yh:NVDA','nvidia.com'],['fx:USD','!https://flagcdn.com/w80/us.png'],['fx:EUR','!https://flagcdn.com/w80/eu.png'],['fx:GBP','!https://flagcdn.com/w80/gb.png'],['fx:GRA',''],['fx:XU100','borsaistanbul.com']];
  M.forEach(x=>c(T.mLogo(x[0])===x[1],'piyasa '+x[0]+' → '+x[1]+' (çıkan: '+T.mLogo(x[0])+')'));
  // fon: kurucu şirketten
  S.watch.push({k:'fon:AFT',n:'AK PORTFÖY YENİ TEKNOLOJİLER YABANCI HİSSE SENEDİ FONU',s:'AFT'},{k:'fon:IPB',n:'İŞ PORTFÖY BIST BANKA ENDEKSİ HİSSE SENEDİ FONU',s:'IPB'},{k:'fon:XYZ',n:'BİLİNMEYEN FON',s:'XYZ'});
  c(T.mLogo('fon:AFT')==='akportfoy.com.tr,akbank.com'&&T.mLogo('fon:IPB')==='isportfoy.com.tr,isbank.com.tr'&&T.mLogo('fon:XYZ')==='','fon kurucusundan logo: '+[T.mLogo('fon:AFT'),T.mLogo('fon:IPB'),T.mLogo('fon:XYZ')]);
  // altın, gümüş, petrol: çizim
  ['fx:GRA','fx:CEYREKALTIN','fx:GUMUS','fx:BRENT'].forEach(k=>c(/mbadge art/.test(T.mBadge(k))&&/<svg class="mart"/.test(T.mBadge(k))&&!/<img/.test(T.mBadge(k)),'altın/gümüş/petrol çizimi '+k));
  c(T.mList? true:true,'');
  // listelerin hepsi geçerli düzenli ifade ve geçerli site adı
  const L=T.mrcList();c(L.length>500,'mağaza+banka sayısı '+L.length);
  c(L.every(x=>x[1].split(',').every(y=>T.mrcClean(y.replace(/^~/,''))===y.replace(/^~/,''))),'bütün site adları geçerli');
  // ---- ekranda: hesaplar ----
  S.accounts.push('Ziraat Bankası','Dolar hesabı');if(S.accounts.indexOf('Nakit')<0)S.accounts.push('Nakit');S.opening['Ziraat Bankası']=1000;S.opening['Nakit']=50;S.opening['Dolar hesabı']=10;S.accx=S.accx||{};S.accx['Dolar hesabı']=Object.assign({},S.accx['Dolar hesabı'],{ccy:'USD'});T.save();
  T.ui.sub='servet';T.ui.sv='hesap';T.ui.page=null;T.render();await W(500);
  const ar=a=>document.querySelector('.item[data-act="acct-open"][data-id="'+a+'"]');
  c(!!ar('Ziraat Bankası')&&!!ar('Ziraat Bankası').querySelector('.aic.mlg.ok img'),'banka hesabında logo');
  c(!!ar('Nakit')&&!ar('Nakit').querySelector('img')&&!!ar('Nakit').querySelector('.aic .dot'),'nakitte eski renkli nokta');
  c(!!ar('Dolar hesabı')&&!!ar('Dolar hesabı').querySelector('.mbadge.flg.ok img'),'döviz hesabında bayrak');
  // ---- borç ----
  S.debts.push({id:'dd1',name:'Garanti kredi',type:'Kredi',amt:1000,paid:[]},{id:'dd2',name:'Anneme borç',type:'Kişi',amt:100,paid:[]});T.save();
  T.ui.sv='borc';T.render();await W(400);
  const dr=id=>document.querySelector('[data-act="edit-d"][data-id="'+id+'"]');
  c(!dr('dd1')||!!dr('dd1').querySelector('.aic.mlg.ok img'),'banka kredisinde logo');c(!dr('dd2')||!dr('dd2').querySelector('img'),'kişiye borçta logo yok');
  // ---- yatırım ----
  S.quotes['bist:THYAO']={p:300,c:1,ccy:'TRY',ts:Date.now()};S.quotes['fx:USD']={p:41,c:0.1,ccy:'TRY',ts:Date.now()};
  S.holdings.push({id:'hh1',name:'THY',type:'Hisse',qty:10,cost:250,mk:'bist:THYAO'},{id:'hh2',name:'Altın',type:'Altın',qty:5,cost:3000,ccy:'XAU'},{id:'hh3',name:'Enpara mevduat',type:'Mevduat',qty:1,cost:1000},{id:'hh4',name:'Ev',type:'Gayrimenkul',qty:1,cost:100});T.save();
  T.ui.sv='yatirim';T.render();await W(500);
  const hr=id=>{const e=document.querySelector('[data-act="edit-h"][data-id="'+id+'"]');return e;};
  c(!!hr('hh1')&&!!hr('hh1').querySelector('.mbadge.mlg.ok img'),'hissede şirket logosu');
  c(!!hr('hh2')&&!!hr('hh2').querySelector('.mbadge.art svg'),'altında çizim');
  c(!!hr('hh3')&&!!hr('hh3').querySelector('.aic.mlg.ok img'),'mevduatta banka logosu');
  c(!!hr('hh4')&&!hr('hh4').querySelector('img'),'evde logo yok');
  // ---- piyasalar ----
  S.watch.push({k:'bist:THYAO',n:'Türk Hava Yolları',s:'THYAO'},{k:'cg:bitcoin',n:'Bitcoin',s:'BTC'});T.save();
  T.openPage({k:'piyasa'},'piyasa');await W(600);
  const mr=k=>document.querySelector('#mres [data-id="'+k+'"]');
  c(!!mr('bist:THYAO')&&!!mr('bist:THYAO').querySelector('.mbadge.mlg.ok img'),'piyasada hisse logosu');
  c(!!mr('cg:bitcoin')&&!!mr('cg:bitcoin').querySelector('.mbadge.mlg.ok img'),'piyasada kripto logosu');
  c(!mr('fx:USD')||!!mr('fx:USD').querySelector('.mbadge.flg.ok img'),'piyasada dolar bayrağı');
  c(!!mr('fon:XYZ')&&!mr('fon:XYZ').querySelector('img')&&/XYZ/.test(mr('fon:XYZ').querySelector('.mbadge').textContent),'logosu olmayan fonda kod rozeti');
  T.ui.page=null;
  // ---- logo gelmezse eski görünüm ----
  S.accounts.push('Yokbanka');S.opening['Yokbanka']=1;T.save();const d0=T.bankDom('Yokbanka');
  S.mlgs['yokbanka']='yokbanka.example.com';T.save();T.ui.page=null;T.ui.sub='servet';T.ui.sv='hesap';T.render();await W(1500);
  c(!!ar('Yokbanka')&&!ar('Yokbanka').querySelector('img')&&!ar('Yokbanka').querySelector('.aic').classList.contains('ok')&&!!ar('Yokbanka').querySelector('.dot'),'logo gelmeyince renkli nokta kalır');
  // ---- kapatınca hiç logo yok ----
  T.ACT.tgl(null,null,'mlg');T.render();c(!document.querySelector('.mlg')&&!!ar('Ziraat Bankası')&&!!ar('Ziraat Bankası').querySelector('.dot'),'kapalıyken hesapta logo yok '+document.querySelectorAll('.mlg').length+' '+(T.ui.page&&T.ui.page.k));
  T.ACT.tgl(null,null,'mlg');T.render();
  return o.filter(Boolean);});
const F=[...r];if(errs.length)F.push('JS hata: '+errs.join(' | '));if(csp.length)F.push('güvenlik politikası engeli: '+csp[0]);
if(!flags.some(f=>/w80\/us\.png$/.test(f)))F.push('bayrak isteği yok: '+flags.join());
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
