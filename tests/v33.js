// 3.3: Piyasalar ve takip listesi, ekstre (Excel/CSV) içe aktarma, Claude'a sor, banka uygulaması bildirimleri
const {chromium}=require('playwright');const path=require('path');
const FX=path.join(__dirname,'fixtures');
const MOCK=()=>{
  const L=localStorage;window.__calls=[];
  const R={
    'OneEndeks?endeks=THYAO':()=>[200,JSON.stringify([{updateDate:'2026-11-06T18:09:57.000+03',last:window.__thy||299.25,dayClose:297,low:288,high:299.75,symbol:'THYAO'}])],
    'OneEndeks?endeks=XYZQ':()=>[200,'[]'],
    'HisseTekil?hisse=THYAO':()=>[200,JSON.stringify({ok:true,value:[{HGDG_TARIH:'02-10-2026',HGDG_KAPANIS:250},{HGDG_TARIH:'16-10-2026',HGDG_KAPANIS:270},{HGDG_TARIH:'06-11-2026',HGDG_KAPANIS:299.25}]})],
    'simple/price?ids=':()=>[200,JSON.stringify({bitcoin:{try:3808230,try_24h_change:0.84,last_updated_at:1793600000}})],
    'search?query=bit':()=>[200,JSON.stringify({coins:[{id:'bitcoin',name:'Bitcoin',symbol:'BTC'},{id:'bitcoin-cash',name:'Bitcoin Cash',symbol:'BCH'}]})],
    'search?query=apple':()=>[200,JSON.stringify({coins:[]})],
    'market_chart':()=>[200,JSON.stringify({prices:[[1791504000000,4030923],[1792108800000,3900000],[1793500000000,3808230]]})],
    'v1/finance/search?q=apple':()=>[200,JSON.stringify({quotes:[{symbol:'AAPL',shortname:'Apple Inc.',longname:'Apple Inc.',exchDisp:'NASDAQ',quoteType:'EQUITY'},{symbol:'AAPL.IS',shortname:'Apple',quoteType:'EQUITY'},{symbol:'APLE',shortname:'Apple Hospitality',quoteType:'EQUITY',exchDisp:'NYSE'}]})],
    'v1/finance/search?q=bit':()=>[200,JSON.stringify({quotes:[]})],
    'chart/AAPL?range=5d':()=>[200,JSON.stringify({chart:{result:[{meta:{currency:'USD',regularMarketPrice:270.5,regularMarketDayHigh:272,regularMarketDayLow:266,regularMarketTime:1793563200,longName:'Apple Inc.'},timestamp:[1793131200,1793217600,1793304000,1793390400,1793563200],indicators:{quote:[{close:[260,262,null,268,270.5]}]}}]}})],
    'chart/USDTRY%3DX?range=1mo':()=>[200,JSON.stringify({chart:{result:[{meta:{currency:'TRY'},timestamp:[1791000000,1792000000,1793000000],indicators:{quote:[{close:[40.9,41.1,41.31]}]}}]}})]
  };
  window.__mock=u=>{const k=Object.keys(R).find(x=>u.indexOf(x)>=0);return k?R[k]():[0,null];};
  window.AndroidBridge={
    http:(id,url)=>{window.__calls.push(url);const r=window.__mock(url);setTimeout(()=>window.walletHttp&&window.walletHttp(id,r[0],r[1]),20);},
    webText:(id,url,need)=>{window.__calls.push('web:'+url);const ok=/FonKod=AFT/.test(url);
      const t='TEFAS\nAFT - AK PORTFÖY YENİ TEKNOLOJİLER YABANCI HİSSE SENEDİ FONU\nSon Fiyat (TL)\n0,987654\nGünlük Getiri (%)\n%-0,4521\nPay (Adet)\n1.234.567';
      setTimeout(()=>window.walletHttp(id,ok?200:0,ok?JSON.stringify({u:url,ti:'TEFAS',t:t}):null),30);},
    fetchRates:id=>{setTimeout(()=>window.walletNative(id,JSON.stringify({Update_Date:'2026-11-07 10:00:00',USD:{Selling:41.31,Change:0.12,Type:'Currency'},EUR:{Selling:44.25,Change:-0.2,Type:'Currency'},GRA:{Selling:5530.1,Change:0.5,Type:'Gold'},GUMUS:{Selling:70.3,Change:0.2,Type:'Gold'},CEYREKALTIN:{Selling:9100,Change:-0.4,Type:'Gold'},GBP:{Selling:55.1,Type:'Currency'},CHF:{Selling:50.2,Type:'Currency'},JPY:{Selling:0.2712,Change:0.3,Type:'Currency'},XU100:{Selling:11482.6,Change:1.32,Type:'Currency'},ONS:{Selling:4012.5,Change:0.4,Type:'Gold'}})),20);},
    openUrl:u=>{window.__opened=u;},shareText:t=>{window.__shared=t;},copyText:t=>{window.__copied=t;return 'ok';},
    ntfState:()=>window.__ntf||'default',ntfAsk:()=>{window.__ntfAsked=1;},ntfSet:(on,kw)=>{window.__ntfSet=[on,kw];},
    smsQueue:()=>L.getItem('__q')||'[]',smsAck:()=>L.setItem('__q','[]'),smsState:()=>'granted',smsSet:()=>{},schedule:()=>'ok'};
};
(async()=>{const b=await chromium.launch();const F=[],O={};const chk=(c,m)=>{if(!c)F.push(m);};
const ctx=await b.newContext({viewport:{width:320,height:740}});await ctx.addInitScript(MOCK);/* 4.21: Binance bu testte kapalı; kripto CoinGecko taklidinden gelir (sonuç belirli olsun) */await ctx.route('https://data-api.binance.vision/**',r=>r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const ACT='const act=(a,id,v)=>{const e=document.createElement("button");e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};const $=s=>document.querySelector(s);const wait=ms=>new Promise(r=>setTimeout(r,ms));const typ=(v)=>{const e=$("#mq");e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));};';
const ev=async body=>{try{return await p.evaluate(new Function('return (async()=>{'+ACT+body+'})()'));}catch(e){return {F:['HATA: '+String(e.message).split('\n').slice(0,3).join(' ')]};}};
/* 1 takip listesi ve arama */
let r=await ev(`const T=__T,F=[],chk=(c,m)=>{if(!c)F.push(m);};
 T.S=T.norm({tx:[],accounts:['Nakit','Banka'],opening:{Banka:10000},fx:T.S.fx});T.save();
 chk(T.S.watch.length===6&&T.S.watch[0].k==='fx:USD'&&T.S.watch.some(w=>w.k==='fx:CEYREKALTIN')&&T.S.watch.some(w=>w.k==='cg:bitcoin'),'varsayılan takip listesi '+JSON.stringify(T.S.watch.map(w=>w.k)));
 act('qa-mkt');await wait(600);chk(T.ui.page&&T.ui.page.k==='piyasa'&&location.hash==='#piyasa','Piyasalar sayfası açıldı');
 const rows=[...document.querySelectorAll('#mres [data-act="m-open"]')].map(x=>x.innerText.replace(/\\s+/g,' '));
 chk(rows.length===6&&/41,3100/.test(rows[0])&&/BIST 100/.test(rows[4])&&/11\\.482,60/.test(rows[4]),'takip satırları '+JSON.stringify(rows));
 chk(T.mQ('fx:GRA').p===5530.1&&T.S.quotes['fx:GRA']&&T.S.quotes['fx:GRA'].c===0.5,'altın kotası');
 typ('thy');await wait(50);let res=$('#mres').innerText;chk(/Türk Hava Yolları/.test(res)&&/Borsa İstanbul/.test(res),'BIST yerel arama '+res.slice(0,120));
 typ('dolar');await wait(50);res=$('#mres').innerText;chk(/ABD doları|ABD Doları/i.test(res),'döviz adıyla arama '+res.slice(0,100));
 typ('japon');await wait(50);res=$('#mres').innerText;chk(/Japon/i.test(res),'tüm dövizler aranır '+res.slice(0,80));
 typ('AFT');await wait(50);chk(!!$('[data-act="m-pick"][data-id="fon:AFT"]'),'fon kodu sonucu');
 typ('bit');await wait(900);res=$('#mres').innerText;chk(!!$('[data-act="m-pick"][data-id="cg:bitcoin"]')&&/Kripto/.test(res),'kripto uzaktan arama '+res.slice(0,160));
 typ('apple');await wait(900);chk(!!$('[data-act="m-pick"][data-id="yh:AAPL"]')&&!$('[data-act="m-pick"][data-id="yh:AAPL.IS"]'),'yabancı arama, .IS hariç');
 /* 2 hisse ayrıntısı ve takip */
 typ('thyao');await wait(50);$('[data-act="m-pick"][data-id="bist:THYAO"]').click();await wait(700);
 const sh=$('.sheet').innerText;chk(/299,25/.test(sh)&&/\\+%0,76/.test(sh)&&/15 dk gecikmeli/.test(sh),'hisse ayrıntısı '+sh.replace(/\\s+/g,' ').slice(0,200));
 chk(!!$('#mchart svg polyline')&&/Dönem değişimi/.test($('#mchart').innerText),'hisse grafiği');
 chk(/isyatirim\\.com\\.tr.*THYAO/.test(($('.sheet a.btn')||{}).href||''),'kaynak bağlantısı');
 $('.sheet [data-act="m-watch"]').click();await wait(200);chk(T.S.watch.some(w=>w.k==='bist:THYAO'&&w.n==='Türk Hava Yolları'&&w.s==='THYAO'),'takibe eklendi');
 chk(!document.querySelector('.sheet')&&!T.ui.mq&&[...document.querySelectorAll('#mres [data-act="m-open"]')].some(x=>/Türk Hava/.test(x.innerText)),'liste görünümüne dönüldü');
 /* 3 fon (TEFAS) */
 typ('AFT');await wait(50);$('[data-act="m-pick"][data-id="fon:AFT"]').click();await wait(600);
 const fq=T.S.quotes['fon:AFT'];chk(fq&&fq.p===0.987654&&fq.c===-0.4521&&/Ak Portföy Yeni Teknolojiler/.test(fq.n),'fon fiyatı '+JSON.stringify(fq));
 chk(/0,9877/.test($('.sheet').innerText)&&/günde bir/.test($('.sheet').innerText),'fon ayrıntısı');act('close');
 /* 4 kripto ve yabancı hisse kotası */
 await T.refreshMarket({keys:['cg:bitcoin','yh:AAPL'],force:true});
 chk(T.S.quotes['cg:bitcoin'].p===3808230&&T.S.quotes['yh:AAPL'].p===270.5&&Math.abs(T.S.quotes['yh:AAPL'].c-(270.5/268-1)*100)<1e-9&&T.S.quotes['yh:AAPL'].ccy==='USD','kripto ve yabancı kota');
 chk(Math.abs(T.mTL('yh:AAPL')-270.5*41.31)<1e-6,'yabancı hisse TL karşılığı');
 /* 5 bilinmeyen hisse hatası */
 const rr=await T.refreshMarket({keys:['bist:XYZQ'],force:true});chk(rr.bad===1&&rr.n===0,'bulunamayan hisse hata '+JSON.stringify(rr));
 return {F};`);
F.push(...r.F);
/* 6 yatırıma ekleme ve fiyat bağlantısı */
r=await ev(`const T=__T,F=[],chk=(c,m)=>{if(!c)F.push(m);};
 act('m-open','bist:THYAO');await wait(500);$('.sheet [data-act="m-hold"]').click();await wait(100);
 chk($('#h-ccy').value==='mk:bist:THYAO'&&$('#h-name').value==='THYAO'&&$('#h-type').value==='Hisse','yatırım formu dolu '+$('#h-ccy').value);
 chk($('#row-hprice').hidden&&/299,25/.test(($('#h-mkp')||{}).innerText||''),'fiyat satırı gizli, piyasa fiyatı görünür');
 $('#h-qty').value='10';$('#h-cost').value='250';$('.sheet [data-act="save-h"]').click();await wait(100);
 const h=T.S.holdings.find(x=>x.mk==='bist:THYAO');chk(h&&h.qty===10&&h.cost===250&&h.mks==='THYAO'&&T.hPrice(h)===299.25&&T.hVal(h)===2992.5,'bağlı yatırım '+JSON.stringify(h));
 window.__thy=310;await T.refreshMarket({force:true});chk(T.hPrice(h)===310&&h.price===310,'piyasa değişince yatırım güncellendi '+h.price);
 /* elle girilmiş yatırımı sonradan bağla */
 T.S.holdings.push({id:'m1',name:'Bitcoin cüzdanım',type:'Kripto',kind:'inv',ccy:'',qty:0.01,cost:3000000,price:3000000});T.save();
 T.ui.page=null;T.render();T.hSheet('m1');chk(!!$('.sheet [data-act="m-linkmode"]'),'bağlama düğmesi');$('.sheet [data-act="m-linkmode"]').click();await wait(300);
 chk(T.ui.page.k==='piyasa'&&/Bitcoin cüzdanım/.test($('.banner').innerText),'bağlama modu');
 typ('bit');await wait(900);$('[data-act="m-pick"][data-id="cg:bitcoin"]').click();await wait(400);
 const m1=T.S.holdings.find(x=>x.id==='m1');chk(m1.mk==='cg:bitcoin'&&m1.mks==='BTC'&&T.hPrice(m1)===3808230&&!T.ui.page,'sonradan bağlandı '+JSON.stringify(m1));
 /* servetim > yatırımlar */
 act('sub',null,'servet');act('sv',null,'yatirim');const card=$('#secbody [data-act="open-mkt"]');chk(card&&/Piyasalar ve takip listem/.test(card.innerText),'yatırımlar piyasa bağlantısı');
 chk(!$('.mstrip'),'sade: Piyasalar kartı ilk düzende kapalı');T.S.homeOff={};act('sub',null,'ev');const ms=$('.mstrip');chk(ms&&ms.querySelectorAll('.rt').length===4,'ana sayfa piyasa şeridi 4 kalem');act('sub',null,'servet');
 chk([...document.querySelectorAll('.hcard')].some(c=>/THYAO/.test(c.innerText)&&!c.querySelector('[data-price]')),'bağlı yatırım kartında elle fiyat yok');
 /* elle fiyata geri dön */
 T.hSheet(h.id);$('#h-ccy').value='';$('#h-ccy').dispatchEvent(new Event('change',{bubbles:true}));$('#h-price').value='300';$('.sheet [data-act="save-h"]').click();
 chk(!h.mk&&T.hPrice(h)===300,'bağlantı kaldırıldı');
 /* takipten çıkar, gereksiz kota temizlenir */
 act('open-mkt');await wait(200);act('m-open','bist:THYAO');await wait(300);$('.sheet [data-act="m-watch"]').click();await wait(100);await T.refreshMarket({force:true});
 chk(!T.S.watch.some(w=>w.k==='bist:THYAO')&&!T.S.quotes['bist:THYAO'],'takipten çıkarıldı ve kota silindi');
 const sb=document.scrollingElement;chk(sb.scrollWidth<=sb.clientWidth+1,'piyasa sayfası taşmıyor '+sb.scrollWidth);
 return {F};`);
F.push(...r.F);
/* 7 Claude'a sor */
r=await ev(`const T=__T,F=[],chk=(c,m)=>{if(!c)F.push(m);};T.ui.page=null;
 const fx=T.S.fx,cur=T.curP();T.S=T.norm({fx,accounts:['Ziraat Maaş Hesabım','Nakit'],opening:{'Ziraat Maaş Hesabım':20000,Nakit:1000},tx:[
  {id:'a',type:'inc',amt:40000,cat:'Maaş',acct:'Ziraat Maaş Hesabım',date:T.addMonth(cur,-1)+'-05'},{id:'b',type:'exp',amt:12000,cat:'Kira',acct:'Ziraat Maaş Hesabım',date:T.addMonth(cur,-1)+'-06',note:'Ev sahibi Mehmet Bey'},
  {id:'c',type:'exp',amt:3000,cat:'Market',acct:'Nakit',date:T.addMonth(cur,-1)+'-10'}],debts:[{id:'d1',name:'Taşıt kredisi',type:'Kredi',amt:85000}],goals:[{id:'g1',name:'Tatil',target:30000,saved:5000}],budgets:{Market:4000}});T.save();T.render();
 const s=T.aiSummary();chk(/Net servet/.test(s)&&/gelir ₺40\\.000/.test(s)&&/Kira: ₺12\\.000/.test(s)&&/Kredi: kalan ₺85\\.000/.test(s)&&/Tatil/.test(s)&&/bütçe limiti ₺4\\.000/.test(s),'özet içeriği\\n'+s);
 chk(!/Ziraat|Mehmet/.test(s),'hesap adı ve not gönderilmez');
 act('sub',null,'plan');act('plan',null,'koc');chk(!!$('#secbody [data-act="ai-open"]'),'Koç’ta Claude’a sor');act('ai-open');
 chk(/Claude’a sor/.test($('.sheet h2').innerText)&&$('#ai-s').value===s,'Claude penceresi');
 $('[data-act="ai-q"][data-id="borc"]').click();chk(/Borçlarımı/.test($('#ai-q').value),'hazır soru');
 $('.sheet [data-act="ai-go"]').click();await wait(100);
 chk(/Sorum: Borçlarımı/.test(window.__copied||'')&&/^https:\\/\\/claude\\.ai\\/new\\?q=/.test(window.__opened||'')&&decodeURIComponent(window.__opened.split('q=')[1]).indexOf('Net servet')>0,'kopyalandı ve Claude açıldı');
 $('.sheet [data-act="ai-share"]').click();chk(/Net servet/.test(window.__shared||''),'paylaşım');act('close');
 return {F};`);
F.push(...r.F);
/* 8 banka uygulaması bildirimleri */
r=await ev(`const T=__T,F=[],chk=(c,m)=>{if(!c)F.push(m);};
 T.S.sms.on=false;T.S.sms.ntf=false;T.save();T.ui.page={k:'set',s:'oto'};T.render();
 chk(/Banka uygulaması bildirimlerini yakala/.test(document.body.innerText)&&!!$('[data-act="ntf-perm"]'),'bildirim ayarı ve izin düğmesi');
 const tg=$('[data-act="tgl"][data-v="sms.ntf"]');tg.click();chk(T.S.sms.ntf===true&&window.__ntfSet&&window.__ntfSet[0]===true&&/garanti/.test(window.__ntfSet[1])&&window.__ntfAsked===1,'açınca yerel tarafa iletildi ve izin istendi');
 window.__ntf='granted';window.walletPerm();chk(/Bildirim erişimi verildi/.test(document.body.innerText),'izin sonrası durum');
 T.S.sms.pend=[];T.S.sms.recent=[];T.S.sms.seen=[];const t0=Date.now();
 T.smsIngest([{id:'s1',from:'AKBANK',body:'4543 ile biten kartınızla MIGROS isyerinden 150,00 TL tutarında işlem yapılmıştır.',ts:t0}]);
 T.smsIngest([{id:'a1',src:'app',from:'Akbank',body:'Akbank Kartınızdan MIGROS işyerine 150,00 TL harcama yapıldı',ts:t0+60000}]);
 chk(T.S.sms.pend.length===1,'aynı işlem SMS ve bildirimde tek sayıldı '+T.S.sms.pend.length);
 T.smsIngest([{id:'a2',src:'app',from:'Akbank',body:'Akbank Kartınızdan STARBUCKS işyerine 150,00 TL harcama yapıldı',ts:t0+120000}]);
 chk(T.S.sms.pend.length===2,'aynı kanaldan ikinci işlem ayrı sayıldı');
 T.smsIngest([{id:'a3',src:'app',from:'Garanti BBVA',body:'Garanti BBVA Hesabınıza 2.500,00 TL FAST ile para gelmiştir',ts:t0+180000}]);
 chk(T.S.sms.pend.some(x=>x.kind==='inc'&&x.oamt===2500&&x.from==='Garanti BBVA'),'uygulama bildiriminden gelir');
 return {F};`);
F.push(...r.F);
/* 9 ekstre dosyaları */
const imp=async(file,acct)=>{await p.evaluate(a=>{const T=__T;T.S=T.norm({tx:[],accounts:['Nakit','Banka','Kredi kartı'],accx:{'Kredi kartı':{type:'kart'}},fx:T.S.fx});T.save();T.ui.page={k:'set',s:'veri'};T.render();},acct);
  await p.setInputFiles('#im-file',path.join(FX,file));await p.waitForFunction(()=>/·|:/.test((document.getElementById('im-file-name')||{}).textContent||''),null,{timeout:8000}).catch(()=>{});
  return p.evaluate(a=>{const T=__T,ta=document.getElementById('im-txt').value,info=document.getElementById('im-file-name').textContent;document.getElementById('im-acct').value=a;
    document.querySelector('[data-act="im-go"]').click();return {ta,info,msg:document.getElementById('f-err4').textContent,tx:T.S.tx.map(t=>[t.date,t.type,t.amt,t.cat,t.acct,t.note||''])};},acct);};
let x=await imp('ekstre.xlsx','Banka');O.xlsx=x.msg;
const exp1=[['2026-10-28','exp',150.75,'Market'],['2026-10-30','inc',45000,'Maaş'],['2026-11-01','exp',229.99,'Eğlence'],['2026-11-02','exp',87.5,'Market'],['2026-11-03','exp',18000,'Kira']];
const same=(tx,e)=>tx.length===e.length&&e.every((r,i)=>r.every((v,j)=>tx[i][j]===v));
chk(same(x.tx,exp1)&&x.tx[0][5]==='MİGROS TİCARET A.Ş. İSTANBUL'&&x.msg==='5 işlem eklendi.','xlsx içe aktarma '+JSON.stringify(x.tx)+' '+x.msg);
chk(/Excel tablosu/.test(x.info),'xlsx bilgisi '+x.info);
x=await imp('ekstre-lo.xlsx','Banka');chk(same(x.tx,exp1),'LibreOffice xlsx '+JSON.stringify(x.tx));
x=await imp('ekstre.xls','Banka');chk(same(x.tx,exp1)&&x.tx[3][5]==='ŞOK MARKET KADIKÖY','eski xls '+JSON.stringify(x.tx)+' '+x.info);
x=await imp('kart.xlsx','Kredi kartı');chk(same(x.tx,[['2026-11-05','exp',145,'Yeme-İçme'],['2026-11-06','inc',5000,'Diğer gelir'],['2026-11-06','exp',1299.9,'Diğer']])&&x.tx.every(t=>t[4]==='Kredi kartı'),'kredi kartı ekstresi '+JSON.stringify(x.tx));
x=await imp('ekstre-html.xls','Banka');chk(same(x.tx,[['2026-11-01','exp',312.4,'Market'],['2026-11-02','inc',2500,'Diğer gelir']]),'HTML xls '+JSON.stringify(x.tx));
x=await imp('ekstre-1254.csv','Banka');chk(same(x.tx,[['2026-11-02','exp',87.5,'Market'],['2026-11-03','inc',45,'Diğer gelir']])&&x.tx[0][5]==='ŞOK MARKET ÜSKÜDAR','Windows-1254 CSV '+JSON.stringify(x.tx));
x=await imp('ekstre-utf16.csv','Banka');chk(same(x.tx,[['2026-11-04','exp',1250,'Ulaşım']]),'UTF-16 CSV '+JSON.stringify(x.tx));
x=await imp('buyuk.xls','Banka');const big=x.tx;chk(big.length===700&&big[649][5]==='İŞYERİ ÖDEMESİ ŞÇĞÜÖİ çok uzun açıklama numarası 0649 — Türkçe karakterler ğüşiöç'&&big[0][0]==='2026-01-01'&&big[699][2]===Math.round((10+699*1.37)*100)/100,'büyük xls (paylaşılan metin bölünmesi) '+big.length+' '+JSON.stringify(big[649]));
const dz=await p.evaluate(()=>{const T=__T;return [T.csvDate('02 Kasım 2026'),T.csvDate('2/11/26'),T.csvDate('2026.11.02'),T.csvDate('31.02.2026')===''?'ok':'x',T.csvDate('46000')];});
chk(dz[0]==='2026-11-02'&&dz[1]==='2026-11-02'&&dz[2]==='2026-11-02'&&dz[3]==='ok'&&/^2025-12-/.test(dz[4]),'tarih biçimleri '+JSON.stringify(dz));
await ctx.close();
/* 10 tarayıcı (yerel köprü yok): yalnızca tarayıcının alabildikleri */
const c2=await b.newContext({viewport:{width:390,height:800}});/* 4.21: Binance bu testte kapalı; kripto CoinGecko taklidinden gelir (sonuç belirli olsun) */await c2.route('https://data-api.binance.vision/**',r=>r.abort());const p2=await c2.newPage();p2.on('pageerror',e=>errs.push(e.message));
await p2.route('https://api.coingecko.com/**',rt=>{const u=rt.request().url();rt.fulfill({status:200,headers:{'access-control-allow-origin':'*','content-type':'application/json'},body:/simple\/price/.test(u)?JSON.stringify({bitcoin:{try:3808230,try_24h_change:-1.5}}):JSON.stringify({coins:[{id:'bitcoin',name:'Bitcoin',symbol:'BTC'}]})});});
await p2.route(/yahoo|isyatirim|tefas/,rt=>{F.push('tarayıcıda yasak adrese istek: '+rt.request().url());rt.abort();});
await p2.goto('http://localhost:8767/index.html');await p2.waitForTimeout(1000);
r=await p2.evaluate(new Function('return (async()=>{'+ACT+`const T=__T,F=[],chk=(c,m)=>{if(!c)F.push(m);};
 T.S.watch.push({k:'bist:THYAO',n:'Türk Hava Yolları',s:'THYAO'},{k:'cg:bitcoin',n:'Bitcoin',s:'BTC'},{k:'fon:AFT',n:'AFT fonu',s:'AFT'});T.save();
 act('open-mkt');await wait(1500);const q=T.S.quotes;
 chk(q['bist:THYAO']&&q['bist:THYAO'].p===299.25&&q['bist:THYAO'].site===1,'tarayıcıda hisse yayın sunucusundan '+JSON.stringify(q['bist:THYAO']));
 chk(q['cg:bitcoin']&&q['cg:bitcoin'].p===3808230,'tarayıcıda kripto');chk(!q['fon:AFT']||!(q['fon:AFT'].p>0),'tarayıcıda fon yok');
 act('m-open','fon:AFT');await wait(400);chk(/yalnızca Android uygulamasında/.test($('.sheet').innerText),'fon için uygulama uyarısı');act('close');
 typ('apple');await wait(900);chk(/yalnızca Android uygulamasında/.test($('#mres').innerText),'arama notu');
 return {F};})()`));F.push(...r.F);
console.log(JSON.stringify(O));
console.log(F.length?'FAIL\n'+F.join('\n'):'ALL PASS');console.log(errs.length?'PAGEERR '+errs.join('\n'):'no page errors');await b.close();})();
