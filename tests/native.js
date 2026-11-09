// Android köprüsü taklidiyle kalıcılık, hatırlatıcı planı, otomatik yedek ve tam silme testi
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});
await ctx.addInitScript(()=>{const L=localStorage;window.AndroidBridge={
  saveData:j=>{L.setItem('__nat',j);return 'ok';},loadData:()=>L.getItem('__nat')||'',
  schedule:j=>{L.setItem('__plan',j);return 'ok';},autoBackup:j=>{L.setItem('__bk',j);L.setItem('__bkn',String(+(L.getItem('__bkn')||0)+1));return 'ok';},
  wipe:()=>{L.removeItem('__nat');L.removeItem('__bk');L.setItem('__plan','[]');L.setItem('__wiped','1');return 'ok';},
  notifState:()=>'granted',askNotif:()=>{},testNotif:()=>'ok',bioAvail:()=>true,bioAuth:()=>{setTimeout(()=>window.walletBio(true),50);},setSecure:v=>{L.setItem('__secure',String(v));},
  fetchRates:id=>{setTimeout(()=>window.walletNative(id,JSON.stringify({Update_Date:'2026-11-07 06:30:00',USD:{Selling:'42,00',Change:0.5},EUR:{Selling:45.5},GRA:{Selling:5600},GBP:{Selling:56},GUMUS:{Selling:71},XU100:{Selling:10300,Change:1}}).slice(0,-1)),30);},
  save:()=> 'ok'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const F=[];const chk=(c,m)=>{if(!c)F.push(m);};
let r=await p.evaluate(async()=>{const T=window.__T,act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
  const usd=T.S.fx.USD;act('sample-clear');T.S.tx.push({id:'p1',type:'exp',amt:77,cat:'Market',acct:'Nakit',date:T.todayS(),note:'kalıcı'});
  const d=new Date();d.setDate(d.getDate()+4);T.S.recurring=[{id:'r1',name:'Su faturası',amt:300,day:d.getDate(),cat:'Fatura',acct:'Banka',paid:{}}];T.save();
  const n0=localStorage.getItem('__nat');await new Promise(r=>setTimeout(r,300));/* yerel kopya çizimden sonra yazılır */
  return {usd,nat:JSON.parse(localStorage.getItem('__nat')).tx.length,deferred:n0===null||JSON.parse(n0).tx.length!==JSON.parse(localStorage.getItem('__nat')).tx.length};});
chk(Math.abs(r.usd-42)<1e-9,'yerel kaynaktan kur (bozuk JSON onarıldı) '+r.usd);chk(r.nat===1,'yerel kopya yazıldı');
await p.waitForTimeout(900);
r=await p.evaluate(()=>JSON.parse(localStorage.getItem('__plan')||'[]'));chk(r.some(x=>/Su faturası/.test(x.title))&&r.every(x=>x.at>Date.now()),'hatırlatıcı planı '+JSON.stringify(r).slice(0,200));
// WebView deposu silinse de veri yerel kopyadan gelir
await p.evaluate(()=>{localStorage.removeItem('kumbara-v1');});await p.reload();await p.waitForTimeout(900);
r=await p.evaluate(()=>({tx:window.__T.S.tx.map(t=>t.note),loc:!!localStorage.getItem('kumbara-v1')}));chk(r.tx.indexOf('kalıcı')>=0&&r.loc,'yerel kopyadan geri yüklendi '+JSON.stringify(r));
// daha yeni yerel kopya tercih edilir
await p.evaluate(()=>{const n=JSON.parse(localStorage.getItem('__nat'));n.tx.push({id:'p2',type:'inc',amt:5,cat:'Maaş',acct:'Banka',date:'2026-11-01',note:'yeni'});n.savedAt=Date.now()+1e6;localStorage.setItem('__nat',JSON.stringify(n));});
await p.reload();await p.waitForTimeout(900);r=await p.evaluate(()=>window.__T.S.tx.map(t=>t.note));chk(r.indexOf('yeni')>=0,'daha yeni kopya seçildi');
// arka plana geçince otomatik yedek
await p.evaluate(()=>{window.__T.save();Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(300);
r=await p.evaluate(()=>({n:+(localStorage.getItem('__bkn')||0),bk:!!localStorage.getItem('__bk'),pin:JSON.parse(localStorage.getItem('__bk')||'{}').pin}));chk(r.n>=1&&r.bk&&r.pin===undefined,'otomatik yedek '+JSON.stringify(r));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});});
// parmak izi ile kilit açma
r=await p.evaluate(async()=>{const T=window.__T;T.S.pin={h:'x',s:'y',auto:0};T.S.bio=true;T.save();const e=document.createElement('button');e.dataset.act='lock-now';document.body.appendChild(e);e.click();e.remove();const l1=T.ui.locked;await new Promise(r=>setTimeout(r,150));return {l1,l2:T.ui.locked,bioKey:!!document.querySelector('[data-act="lk-bio"]')};});
chk(r.l1&&!r.l2,'parmak izi kilidi açtı '+JSON.stringify(r));
// bildirim ayarları yerel modda
r=await p.evaluate(()=>{const e=document.createElement('button');e.dataset.act='open-set';e.dataset.id='bild';document.body.appendChild(e);e.click();e.remove();return document.getElementById('view').innerText;});
// 4.2: yaklaşan ödemeler listesi burada tekrarlanmıyor (Gündem ve Plan › Düzenli'de); hatırlatıcı planı yukarıda denendi
chk(/Telefon bildirimi gönder/.test(r)&&/Deneme bildirimi/.test(r)&&/Yaklaşan ödemeler/.test(r),'bildirim ayarları yerel (yaklaşan ödemeler listesiyle)');
// tam silme
r=await p.evaluate(()=>{const T=window.__T;T.wipeAll();return {nat:JSON.parse(localStorage.getItem('__nat')).tx.length,bk:localStorage.getItem('__bk'),plan:localStorage.getItem('__plan'),wiped:localStorage.getItem('__wiped'),pin:T.S.pin};});
chk(r.nat===0&&r.bk===null&&r.plan==='[]'&&r.wiped==='1'&&!r.pin,'tam silme '+JSON.stringify(r));
await p.reload();await p.waitForTimeout(800);r=await p.evaluate(()=>({tx:window.__T.S.tx.length,sample:window.__T.S.tx.some(t=>t.sample)}));chk(r.tx===0,'silme sonrası açılış boş '+JSON.stringify(r));
console.log(F.length?'FAIL\n'+F.join('\n'):'ALL PASS');console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
