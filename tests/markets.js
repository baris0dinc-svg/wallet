// 4.0 Piyasalar: ECB yedek kaynağı (Frankfurter), yerel 30 günlük geçmiş ve küçük grafik, güncellik, takip listesi düzenleme, çevrimdışı
const {chromium}=require('playwright');
const MOCK=()=>{const of=window.fetch;window.__frk=[];
  const J=(o,s)=>Promise.resolve(new Response(JSON.stringify(o),{status:s||200,headers:{'Content-Type':'application/json'}}));
  window.fetch=function(u){u=String(u&&u.url||u);
    if(window.__failRates&&/rates\.json/.test(u))return Promise.resolve(new Response('yok',{status:503}));
    if(/frankfurter/.test(u)){window.__frk.push(u);if(window.__failFrk)return Promise.reject(new TypeError('ağ yok'));
      if(/from=/.test(u))return J([{date:'2026-10-10',base:'USD',quote:'TRY',rate:41.0},{date:'2026-10-20',base:'USD',quote:'TRY',rate:41.2},{date:'2026-11-06',base:'USD',quote:'TRY',rate:41.4}]);
      return J([{date:'2026-11-06',base:'TRY',quote:'USD',rate:0.025},{date:'2026-11-06',base:'TRY',quote:'EUR',rate:0.02},{date:'2026-11-06',base:'TRY',quote:'GBP',rate:0.0175},{date:'2026-11-06',base:'TRY',quote:'CHF',rate:0.019}]);}
    if(/coingecko/.test(u))return J({bitcoin:{try:3800000,try_24h_change:1.2,last_updated_at:1793600000}});
    return of.apply(this,arguments);};};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780}});await ctx.addInitScript(MOCK);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const chk=(c,m)=>{if(!c)F.push(m);};const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);
 // 1 yanıt biçimleri
 const v2=T.frkRows([{date:'2026-11-06',base:'TRY',quote:'USD',rate:0.025},{quote:'X',rate:0}]),v1=T.frkRows({base:'TRY',date:'2026-11-06',rates:{USD:0.025,EUR:0.02}}),v1t=T.frkRows({base:'USD',rates:{'2026-11-05':{TRY:41},'2026-11-06':{TRY:41.2}}});
 chk(v2.length===1&&v2[0].quote==='USD'&&v1.length===2&&v1t.length===2&&v1t[1].date==='2026-11-06','yanıt biçimleri '+JSON.stringify([v2,v1,v1t]));
 // 2 Truncgil alınamazsa döviz ECB'den; kaynak ve tarih gösterilir
 window.__failRates=true;const fx0=T.S.fx.XAU;let rr=await T.refreshRates({force:true});
 chk(rr.ok&&rr.ecb&&T.S.fxSrc==='ecb'&&Math.abs(T.S.fx.USD-40)<1e-6&&Math.abs(T.S.fx.EUR-50)<1e-6&&T.S.fx.XAU===fx0,'ECB yedeği: USD 40, EUR 50, altın değişmedi '+JSON.stringify([rr,T.S.fx]));
 chk(/ECB/.test(rr.msg)&&/Altın ve BIST 100 güncellenemedi/.test(rr.msg),'yedek kaynak mesajı: '+rr.msg);
 T.ui.page={k:'set',s:'kurlar'};T.render();chk(/yedek kaynak \(ECB/.test($('#view').innerText),'ayarlarda yedek kaynak yazıyor');T.ui.page=null;
 // takip listesindeki döviz yedek kurla güncellenir, kaynağı bellidir
 const m=await T.refreshMarket({force:true});const qu=T.S.quotes['fx:USD'];chk(qu&&qu.p===40&&qu.src==='ecb','takipte USD yedek kurla: '+JSON.stringify(qu));
 // 3 ikisi de yoksa anlaşılır hata
 window.__failFrk=true;rr=await T.refreshRates({force:true});chk(!rr.ok&&/İnternet bağlantını kontrol et/.test(rr.msg),'ikisi de yoksa hata: '+rr.msg);
 // 4 Truncgil geri gelince ana kaynak
 window.__failRates=false;window.__failFrk=false;rr=await T.refreshRates({force:true});chk(rr.ok&&!rr.ecb&&!T.S.fxSrc&&Math.abs(T.S.fx.USD-41.31)<1e-6,'Truncgil geri geldi: '+JSON.stringify([rr.ok,rr.ecb,T.S.fxSrc,T.S.fx.USD]));
 // 5 yerel geçmiş: aynı gün güncellenir, yeni gün eklenir, en çok 30 gün
 let h=T.qHist([],'2026-11-01',10);h=T.qHist(h,'2026-11-01',11);h=T.qHist(h,'2026-11-02',12);chk(JSON.stringify(h)==='[["2026-11-01",11],["2026-11-02",12]]','geçmiş günlük '+JSON.stringify(h));
 for(let i=3;i<=40;i++)h=T.qHist(h,'2026-11-'+String(i).padStart(2,'0'),i);chk(h.length===30&&h[29][1]===40,'en çok 30 nokta');
 chk(T.qHist(h,'2026-10-01',5).length===30&&T.qHist(h,'2026-12-31',0).length===30,'eski tarih ve sıfır fiyat eklenmez');
 chk(T.sparkSvg([['a',1],['b',2]])===''&&/<svg/.test(T.sparkSvg([['a',1],['b',2],['c',3]])),'küçük grafik en az 3 noktada');
 chk(/var\(--exp\)/.test(T.sparkSvg([['a',3],['b',2],['c',1]]))&&/var\(--inc\)/.test(T.sparkSvg([['a',1],['b',2],['c',3]])),'grafik rengi yöne göre');
 // 6 güncellik
 chk(T.ago(Date.now()-30000)==='az önce'&&T.ago(Date.now()-5*6e4)==='5 dk önce'&&T.ago(Date.now()-3*36e5)==='3 sa önce','göreli zaman');
 chk(T.qStale('fx:USD',{ts:Date.now()-3*36e5})&&!T.qStale('fon:AFT',{ts:Date.now()-3*36e5}),'eski veri eşiği (fon günlük)');
 // 7 satırda küçük grafik ve eski veri etiketi
 T.S.quotes['fx:USD'].h=[['2026-11-01',40],['2026-11-02',41],['2026-11-03',41.3]];T.S.quotes['fx:EUR'].ts=Date.now()-5*36e5;T.save();
 T.ACT['open-mkt']();await wait(50);const rows=[...document.querySelectorAll('#mres .mrow')];
 chk(rows.length===T.S.watch.length&&!!rows[0].querySelector('.msp'),'USD satırında küçük grafik');
 // 8 düzenleme: taşı, çıkar, geri al
 const k0=T.S.watch.map(w=>w.k);T.ACT['m-edit']();chk(!!$('#mres [data-act="m-up"]')&&!$('#mres [data-act="m-open"]'),'düzenleme modu');
 $('#mres [data-act="m-down"][data-id="fx:USD"]').click();chk(T.S.watch[1].k==='fx:USD'&&T.S.watch[0].k===k0[1],'aşağı taşındı');
 $('#mres [data-act="m-up"][data-id="fx:USD"]').click();chk(T.S.watch[0].k==='fx:USD','yukarı taşındı');
 chk($('#mres [data-act="m-up"][data-id="fx:USD"]').disabled,'ilk satırda yukarı kapalı');
 $('#mres [data-act="m-del"][data-id="fx:EUR"]').click();chk(!T.S.watch.some(w=>w.k==='fx:EUR'),'takipten çıkarıldı');
 T.ACT.undo();chk(T.S.watch.map(w=>w.k).join()===k0.join(),'geri alındı '+T.S.watch.map(w=>w.k));
 const st=JSON.parse(localStorage.getItem('kumbara-v1')).watch.map(w=>w.k).join();chk(st===k0.join(),'sıra kaydedildi');
 T.ACT['m-edit']();window.walletBack();
 // 9 döviz grafiği tarayıcıda ECB'den; döviz geçmişi küçük grafiğe karışmaz
 const hb=JSON.stringify(T.S.quotes['fx:USD'].h);T.ACT['m-open'](null,'fx:USD');await wait(400);
 chk(/Avrupa Merkez Bankası/.test(($('#mchart')||{}).innerText||''),'döviz grafiği ECB: '+(($('#mchart')||{}).innerText||''));
 chk(!/2026-10-10|2026-10-20/.test(JSON.stringify(T.S.quotes['fx:USD'].h)),'ECB geçmişi küçük grafiğe eklenmedi '+JSON.stringify(T.S.quotes['fx:USD'].h));T.ACT.close();
 chk(window.__frk.some(u=>/v2\/rates\?base=USD&quotes=TRY&from=/.test(u)),'ECB geçmiş isteği');
 // 10 ana sayfa şeridi ve çevrimdışı
 window.walletBack();T.ui.sub='ev';T.render();chk(document.querySelectorAll('.mstrip .rt').length===4,'ana sayfa şeridi 4 kalem');
 Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});T.render();chk(/Çevrimdışı/.test($('.mstrip').innerText),'şeritte çevrimdışı');
 T.ACT['open-mkt']();await wait(50);chk(/Çevrimdışısın/.test($('#view').innerText),'Piyasalar çevrimdışı bandı');
 Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>true});T.render();chk(!/Çevrimdışısın/.test($('#view').innerText),'çevrimiçi olunca band kalkar');
 window.walletBack();
 // 11 önerilen hızlı eklemeler hisse adı içermez
 chk(!/THYAO|ASELS/.test(JSON.stringify(T.S.watch))&&T.S.watch.length===6,'varsayılan liste hisse önermiyor');
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'FAIL\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
