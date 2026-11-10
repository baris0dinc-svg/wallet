// 4.21: net servet geçmişi (taksit), liste simgeleri, düzenli satırı, bulut hatırlatması, veri kaynakları (Binance, TEFAS, Yahoo yedeği), aralıklar, kategori eğilimi, CSV alt kategori
const {chromium}=require('playwright');
const BRIDGE=()=>{/* yerel köprü taklidi: yalnız http (TEFAS, İş Yatırım, Yahoo) */
  window.__http=[];window.AndroidBridge={http:function(id,url,method,body,hdrs){window.__http.push([url,method,body]);var r=[0,''];
    if(/tefas\.gov\.tr\/api\/funds\/fonFiyatBilgiGetir/.test(url)&&!window.__tefDown){var b=JSON.parse(body||'{}'),n=b.periyod===1?22:60,l=[];for(var i=n;i>=1;i--){var d=new Date();d.setDate(d.getDate()-i);l.push({fonKodu:b.fonKodu,fonUnvan:'AK PORTFÖY DENEME FONU',tarih:d.toISOString().slice(0,10),fiyat:1+(n-i)*0.01});}r=[200,JSON.stringify({errorCode:null,resultList:l})];}
    else if(/coingecko/.test(url))r=[200,JSON.stringify({bitcoin:{try:3700000,try_24h_change:1,last_updated_at:1793600000},monero:{try:9000,try_24h_change:2,last_updated_at:1793600000}})];
    else if(/isyatirim/.test(url))r=[503,''];
    else if(/finance\.yahoo\.com\/v8\/finance\/chart\/THYAO\.IS/.test(url))r=[200,JSON.stringify({chart:{result:[{meta:{currency:'TRY',regularMarketPrice:310,regularMarketTime:1794236996},timestamp:[1794100000,1794186400],indicators:{quote:[{close:[300,310]}]}}]}})];
    setTimeout(function(){window.walletHttp&&window.walletHttp(id,r[0],r[1]);},20);}};};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780},hasTouch:true});await ctx.addInitScript(BRIDGE);const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));const BN={down:false,calls:[]};
await p.route('https://data-api.binance.vision/**',rt=>{const u=new URL(rt.request().url());BN.calls.push(u.pathname+u.search);const J=(st,o)=>rt.fulfill({status:st,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
  if(BN.down)return J(500,{});const sy=u.searchParams.get('symbol');
  if(/ticker\/24hr/.test(u.pathname)){if(sy==='BTCTRY')return J(200,{symbol:sy,lastPrice:'3765636.00',prevClosePrice:'3767116.00',priceChangePercent:'-0.039',highPrice:'3785479',lowPrice:'3695504',closeTime:1794267000000});
    if(sy==='USDTTRY')return J(200,{symbol:sy,lastPrice:'42.00',prevClosePrice:'41.9',priceChangePercent:'0.2',closeTime:1794267000000});if(sy==='SUIUSDT')return J(200,{symbol:sy,lastPrice:'2.00',prevClosePrice:'1.9',priceChangePercent:'5',highPrice:'2.1',lowPrice:'1.8',closeTime:1794267000000});return J(400,{code:-1121,msg:'Invalid symbol.'});}
  if(/klines/.test(u.pathname))return J(200,[[1794009600000,'1','1','1','3800055.00'],[1794096000000,'1','1','1','3748578.00'],[1794182400000,'1','1','1','3765636.00']]);return J(404,{});});
await p.route('https://api.coingecko.com/**',rt=>rt.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({bitcoin:{try:3700000,try_24h_change:1,last_updated_at:1793600000},monero:{try:9000,try_24h_change:2,last_updated_at:1793600000}})}));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const F=[];const run=async f=>{F.push(...await p.evaluate(f));};
// ---------- hesap tutarlılığı, liste, düzenli, hatırlatma, aralıklar, eğilim, CSV ----------
await run(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const t0=T.todayS(),D=n=>T.addD(t0,n);const fx=JSON.parse(JSON.stringify(T.S.fx));
  T.S=T.norm({fx,accounts:['Banka','Kart'],accx:{Banka:{type:'banka'},Kart:{type:'kart'}},opening:{Banka:50000,Kart:0},openD:{Banka:D(-200),Kart:D(-200)},tx:[],recurring:[],debts:[{id:'d1',name:'Kredi',type:'Kredi',amt:10000}],holdings:[]});T.save();const S=T.S;
  // taksitli alışveriş 40 gün önce, 2 taksit işlenmiş, 4 kaldı
  S.tx.push({id:'i1',type:'exp',amt:1000,cat:'Giyim',acct:'Kart',date:D(-40),note:'Mont (1/6)',inst:'p1',rec:'p1'},{id:'i2',type:'exp',amt:1000,cat:'Giyim',acct:'Kart',date:D(-10),note:'Mont (2/6)',inst:'p1',rec:'p1'},
    {id:'x1',type:'trf',amt:500,cat:'Transfer',acct:'Banka',to:'Kart',date:D(-5)},{id:'x2',type:'dbt',side:'out',debt:'d1',dname:'Kredi',amt:1000,acct:'Banka',date:D(-4)},{id:'x3',type:'exp',amt:300,cat:'Market',acct:'Banka',date:D(-3),sub:'Gıda',note:'Bim'});
  for(let i=1;i<=5;i++)S.tx.push({id:'m'+i,type:'exp',amt:100*i,cat:'Market',acct:'Banka',date:T.addMonth(t0.slice(0,7),-i)+'-10'});
  S.recurring.push({id:'p1',name:'Mont taksiti',amt:1000,day:+D(-40).slice(8),cat:'Giyim',acct:'Kart',every:1,n:6,start:T.pk(D(-40)),auto:true,paid:{[T.pk(D(-40))]:'i1',[T.addMonth(T.pk(D(-40)),1)]:'i2'}});T.save();
  c(T.instLeft(S.recurring[0])===4000,'kalan taksit 4000');c(Math.abs(T.nwAt(t0)-T.wealth().net)<0.01,'nwAt(bugün) = net servet: '+T.nwAt(t0)+' / '+T.wealth().net);
  c(T.instAt(S.recurring[0],D(-41))===0&&T.instAt(S.recurring[0],D(-39))===5000&&T.instAt(S.recurring[0],D(-9))===4000,'taksit borcu tarihe göre '+[T.instAt(S.recurring[0],D(-41)),T.instAt(S.recurring[0],D(-39)),T.instAt(S.recurring[0],D(-9))]);
  c(Math.abs(T.nwAt(D(-39))-(T.nwAt(D(-41))-6000))<0.01,'alışveriş günü net servet 6000 düşer');
  // liste: her satırda simge
  T.ui.sub='islem';T.ui.rng='yil';T.ui.page=null;T.render();const rows=document.querySelectorAll('#txlist [data-act="edit-tx"]');c(rows.length>=5&&[...rows].every(r=>r.querySelector('.cic svg')),'her işlem satırında simge');
  c(document.querySelectorAll('[data-act="rng"]').length===5&&document.querySelector('[data-act="rng"][data-v="yil"]').getAttribute('aria-pressed')==='true','aralık çipleri');
  c(rows.length===S.tx.filter(t=>t.date.slice(0,4)===t0.slice(0,4)).length,'bu yıl işlemleri '+rows.length);
  T.ui.rng='ozel';T.ui.rf=D(-6);T.ui.rt=D(-3);T.render();c(document.querySelectorAll('#txlist [data-act="edit-tx"]').length===3&&!!document.getElementById('rf'),'iki tarih arası');
  const rf=document.getElementById('rf');rf.value=D(-4);rf.dispatchEvent(new Event('change',{bubbles:true}));c(T.ui.rf===D(-4)&&document.querySelectorAll('#txlist [data-act="edit-tx"]').length===2,'tarih değişince liste');T.ui.rng='ay';
  // düzenli satırı
  S.recurring.push({id:'r9',name:'İnternet',amt:500,day:1,cat:'Fatura',acct:'Banka',paid:{}});T.save();T.ui.sub='plan';T.ui.plan='duzenli';T.ui.month=T.curP();T.render();
  c(document.querySelectorAll('.ritem').length===2&&!!document.querySelector('.ritem .rfoot [data-act="rpay"][data-id="r9"]')&&/yılda/.test(document.body.innerText),'düzenli satırı ve yıllık toplam');
  // kategori eğilimi
  T.ui.month=T.curP();T.catSheet('Market');c(document.querySelectorAll('.ctrend .cb').length===6&&!!document.querySelector('.ctrend .cb.on'),'kategori eğilimi');T.closeSheet();
  // bulut hatırlatması
  for(let i=0;i<25;i++)S.tx.push({id:'q'+i,type:'exp',amt:10,cat:'Market',acct:'Banka',date:D(-60-i)});T.save();
  c(T.brainItems().some(x=>/Bulut yedeğini aç/.test(x.btn||'')),'bulut yoksa önerilir');
  S.cloud={tok:'ghp_x',gid:'g',on:true,ts:Date.now()};c(!T.brainItems().some(x=>/[Yy]ede/.test(x.t)),'bulut çalışıyorsa hatırlatma yok');
  S.cloud.ts=Date.now()-9*864e5;c(T.brainItems().some(x=>/7 gündür/.test(x.t)),'bulut 7 gündür yüklenmediyse uyarı');delete S.cloud;
  // CSV alt kategori
  const csv=T.csvAll();c(/Alt kategori/.test(csv.split('\n')[0])&&/Gıda/.test(csv),'CSV’de alt kategori');const keep=S.tx.length;S.tx=S.tx.filter(t=>t.id!=='x3');delete S.subs.Market;const r=T.csvImport(csv,'Banka');
  c(r.added===1&&S.tx.some(t=>t.sub==='Gıda'&&t.cat==='Market')&&T.subsOf('Market').indexOf('Gıda')>=0,'CSV’den alt kategori '+JSON.stringify(r));
  return o;});
// ---------- veri kaynakları ----------
await run(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const S=T.S;S.quotes={};
  let r=await T.refreshMarket({keys:['cg:bitcoin','cg:monero','cg:sui'],force:true});
  c(S.quotes['cg:bitcoin'].p===3765636&&S.quotes['cg:bitcoin'].alt==='Binance'&&Math.abs(S.quotes['cg:bitcoin'].c+0.039)<1e-9,'büyük coin Binance’ten '+JSON.stringify(S.quotes['cg:bitcoin']));
  c(S.quotes['cg:monero']&&S.quotes['cg:monero'].p===9000&&!S.quotes['cg:monero'].alt,'eşlenmeyen coin CoinGecko’dan');
  c(S.quotes['cg:sui']&&S.quotes['cg:sui'].p===84&&S.quotes['cg:sui'].usdt===1,'TL paritesi yoksa USDT üzerinden '+JSON.stringify(S.quotes['cg:sui']));
  const h=await T.mHist('cg:bitcoin','1A');c(h.length===3&&h[2][1]===3765636,'kripto grafiği Binance’ten');
  // fon: TEFAS JSON servisi
  r=await T.refreshMarket({keys:['fon:AFT'],force:true});const q=S.quotes['fon:AFT'];
  c(q&&Math.abs(q.p-1.21)<1e-9&&Math.abs(q.c-(1.21/1.20-1)*100)<1e-6&&/Ak Portföy/.test(q.n)&&q.day&&q.h.length>=20,'fon fiyatı, değişimi, adı ve geçmişi '+JSON.stringify(q).slice(0,200));
  c(window.__http.some(x=>/fonFiyatBilgiGetir/.test(x[0])&&x[1]==='POST'&&JSON.parse(x[2]).fonKodu==='AFT'),'TEFAS isteği');
  const fh=await T.mHist('fon:AFT','3A');c(fh.length===60,'fon grafiği 3 ay '+fh.length);const fw=await T.mHist('fon:AFT','1H');c(fw.length===6,'fon grafiği 1 hafta');
  // hisse: İş Yatırım yoksa Yahoo
  r=await T.refreshMarket({keys:['bist:THYAO'],force:true});const qb=S.quotes['bist:THYAO'];c(qb&&qb.p===310&&qb.alt==='Yahoo Finance'&&qb.ccy==='TRY','hisse yedeği Yahoo '+JSON.stringify(qb||r));
  return o;});
BN.down=true;
await run(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};T.S.quotes={};await T.refreshMarket({keys:['cg:bitcoin'],force:true});
  c(T.S.quotes['cg:bitcoin']&&T.S.quotes['cg:bitcoin'].p===3700000&&!T.S.quotes['cg:bitcoin'].alt,'Binance yoksa CoinGecko '+JSON.stringify(T.S.quotes['cg:bitcoin']));return o;});
if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
