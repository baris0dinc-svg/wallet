// 4.15: sade üst çubuk (ses ve Notlar simgesi yok), Piyasalar (çevirici, süzgeç, rozet, Sende, gün özeti, fiyat hedefi, grafik), yerleşim
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780},hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const F=[];
const r=await p.evaluate(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  // ---- üst çubuk ve ana sayfa ----
  T.ui.sub='ev';T.ui.page=null;T.render();
  const hb=[...document.querySelectorAll('header .icon-btn')].map(b=>b.dataset.act);c(hb.length===2&&hb.join()==='alerts,open-settings','4.30: başlıkta uyarılar ve ayarlar: '+hb.join());
  c(!document.querySelector('[data-act="voice"]'),'sesle ekleme yok');c(!T.ACT.voice,'ses eylemi kaldırıldı');
  c(!document.querySelector('.scg')&&T.ACT['qa-notes'],'4.29: Notlar Tümü penceresinde');
  c(!/Dönem sonu tahmini/.test(document.querySelector('.hero').innerText),'4.29: ana kartta tahmin yok (Analiz › Nakit akışı)');
  window.walletIntent('wallet:voice');await W(150);c(!!document.querySelector('.sheet')&&T.txType==='exp','eski sesle kısayolu gider penceresini açar');T.closeSheet();
  // ---- işlemler: arama toplamı, hesaplarda dönem hareketi ----
  T.ui.sub='islem';T.ui.tq='market';T.render();c(/sonuç · gider/.test(document.body.innerText),'arama toplamı');T.ui.tq='';
  T.ui.sub='servet';T.ui.sv='hesap';T.render();c(/Bu dönem [+−]/.test(document.body.innerText),'hesapta bu dönem hareketi');
  // ---- piyasalar ----
  const S=T.S;S.watch.push({k:'bist:THYAO',n:'Türk Hava Yolları',s:'THYAO'});S.quotes['bist:THYAO']={p:300,c:2.5,ccy:'TRY',ts:Date.now()};
  S.quotes['fx:USD']={p:41.31,c:0.12,ccy:'TRY',ts:Date.now()};S.quotes['fx:EUR']={p:44.25,c:-0.2,ccy:'TRY',ts:Date.now()};T.save();
  T.openPage({k:'piyasa'},'piyasa');await W(200);
  c(!!document.querySelector('.mconv #mc-a'),'çevirici');const a=document.getElementById('mc-a');a.value='100';a.dispatchEvent(new Event('input',{bubbles:true}));
  const exp=100*T.rateOf('USD');c(document.getElementById('mc-out').innerText.replace(/\./g,'').indexOf(new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(exp).replace(/\./g,''))>=0,'100 USD → TL '+document.getElementById('mc-out').innerText);
  T.ACT['mc-swap']();c(T.ui.mcv.f==='TRY'&&T.ui.mcv.t==='USD','birimler yer değişti');T.ACT['mc-swap']();
  c(document.querySelectorAll('.mcats .chip').length>=3,'kategori süzgeci');T.ACT['m-cat'](null,null,'bist');c(document.querySelectorAll('#mres .mrow').length===1,'yalnız hisseler');T.ACT['m-cat'](null,null,'');
  c(document.querySelectorAll('#mres .mbadge').length===document.querySelectorAll('#mres .mrow').length,'her satırda rozet');
  c(/Sende /.test(document.getElementById('mres').innerText),'elindeki miktar görünür');
  c(!!document.querySelector('.mmovers')&&/THYAO/.test(document.querySelector('.mmovers').innerText),'günün yükseleni');
  c(!!document.querySelector('.msrc')&&!document.querySelector('.msrc').open,'kaynaklar katlanır');
  // ayrıntı: portföy, 1 hafta, hedef
  T.ACT['m-open'](null,'fx:USD');await W(300);c(!!document.querySelector('.mheldbox'),'ayrıntıda portföy');c(!!document.querySelector('[data-act="m-range"][data-v="1H"]'),'1 hafta grafiği');
  document.getElementById('mt-v').value='42';T.ACT['mt-add'](null,'fx:USD');c(S.ptgt.length===1&&S.ptgt[0].up===true&&S.ptgt[0].v===42,'hedef eklendi '+JSON.stringify(S.ptgt));
  c(T.mTgtCheck()===0,'henüz ulaşılmadı');S.quotes['fx:USD'].p=42.1;c(T.mTgtCheck()===1&&S.ptgt[0].hit>0,'hedefe ulaşıldı');
  c(T.alertItems().some(x=>/hedefinin üstüne çıktı/.test(x[1])),'Gündem’de hedef');T.ACT['mt-done'](null,S.ptgt[0].id);c(S.ptgt.length===0,'hedef kapatıldı');
  document.getElementById('mt-v')&&(document.getElementById('mt-v').value='41.31');
  // grafik: kaynak yoksa cihazdaki kapanışlar, dokununca fiyat
  T.closeSheet();const days=[];for(let i=10;i>=1;i--){const d=new Date();d.setDate(d.getDate()-i);days.push([T.isoDate(d),40+i/10]);}S.quotes['fx:GRA']={p:5530,c:0.5,ccy:'TRY',ts:Date.now(),h:days};
  T.ACT['m-open'](null,'fx:GRA');for(let i=0;i<30&&!document.getElementById('mcw');i++)await W(100);
  const w=document.getElementById('mcw');c(!!w&&/cihazda tutulan/.test(document.getElementById('mchart').innerText),'yerel geçmiş grafiği');
  if(w){const rc=w.getBoundingClientRect();w.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:rc.left+rc.width/2,clientY:rc.top+10,pointerId:1}));c(/·/.test(document.getElementById('mscr').innerText)&&document.getElementById('mcl').getAttribute('visibility')==='visible','grafiğe dokununca fiyat');}
  T.closeSheet();return o;});
F.push(...r);if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
