// güvenlik: içerik güvenlik politikası ihlali yok; kullanıcı verisindeki HTML/betik hiçbir ekranda çalışmaz
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780}});
await ctx.addInitScript(()=>{window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+e.blockedURI));window.__pwn=0;});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('dialog '+d.message());d.dismiss();});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1000);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const chk=(c,m)=>{if(!c)F.push(m);};const wait=ms=>new Promise(r=>setTimeout(r,ms));
 chk(!!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),'güvenlik politikası var');
 const X='<img src=x onerror="window.__pwn++">',Y='"><svg onload="window.__pwn++">',fx=JSON.parse(JSON.stringify(T.S.fx));
 T.S=T.norm({fx,name:X,accounts:['Nakit',X],opening:{Nakit:100},cats:{exp:['Market',Y],inc:['Maaş']},tx:[
  {id:'a',type:'exp',amt:10,cat:Y,acct:X,date:T.todayS(),note:X},{id:'b',type:'exp',amt:10,cat:Y,acct:X,date:T.todayS(),note:X},{id:'c',type:'inc',amt:99,cat:'Maaş',acct:'Nakit',date:T.todayS(),note:Y}],
  goals:[{id:'g',name:X,target:100,saved:5}],recurring:[{id:'r',name:X,amt:5,day:new Date().getDate(),cat:Y,acct:X,paid:{}}],debts:[{id:'d',type:X,amt:50,note:Y}],
  holdings:[{id:'h',name:X,type:Y,qty:1,cost:1,price:2}],notes:[{id:'n',title:X,body:Y,ts:Date.now()}],watch:[{k:'bist:THYAO',n:X}]});T.save();
 const visit=async()=>{for(const s of ['ev','islem','plan','analiz','servet']){T.ui.page=null;T.ui.sub=s;T.render();await wait(20);
   if(s==='plan')for(const a of ['koc','butce','duzenli','hedef']){T.ui.plan=a;T.render();await wait(20);}
   if(s==='analiz')for(const a of ['ozet','harcama','takvim','servet']){T.ui.an=a;T.render();await wait(20);}
   if(s==='servet')for(const v of ['hesap','yatirim','varlik','borc']){T.ui.sv=v;T.render();await wait(20);}}
  for(const pg of [{k:'ayar'},{k:'notlar'},{k:'piyasa'},{k:'fire'},{k:'araclar'}]){T.ui.page=pg;T.render();await wait(20);}
  T.ui.page={k:'piyasa'};T.ui.medit=true;T.render();await wait(20);T.ui.medit=false;
  T.ui.page=null;T.ui.sub='ev';T.render();
  for(const a of ['new-tx','alerts','qa-save','em-open','ai-open','qa-debt']){try{T.ACT[a]();}catch(e){}await wait(20);T.ACT.close&&T.ACT.close();}
  T.ACT['edit-tx'](null,'a');await wait(20);T.ACT.close();T.ACT['cal-day'](null,null,T.todayS());await wait(20);T.ACT.close();
  T.ui.sub='islem';T.render();const q=document.getElementById('tq');q.value='img';q.dispatchEvent(new Event('input',{bubbles:true}));await wait(250);};
 await visit();
 chk(window.__pwn===0,'kullanıcı verisinden betik çalıştı: '+window.__pwn);
 chk(!document.querySelector('img[src="x"],svg[onload]'),'zararlı öğe DOM’a girdi');
 chk(window.__csp.length===0,'politika ihlali: '+window.__csp.join(' | '));
 // hata veren bir eylem uygulamayı dondurmaz, kaydedilir
 localStorage.removeItem('wallet-err');T.ACT.__boom=()=>{throw new Error('deneme hatası');};const bt=document.createElement('button');bt.dataset.act='__boom';document.body.appendChild(bt);bt.click();bt.remove();await wait(30);
 const el=JSON.parse(localStorage.getItem('wallet-err')||'[]');chk(el.length===1&&/deneme hatası/.test(el[0].m)&&/eylem __boom/.test(el[0].k),'hata kaydı '+JSON.stringify(el));
 chk(/Bir sorun oldu/.test(document.getElementById('toast').innerText),'kullanıcıya bildirildi');
 T.ui.page={k:'set',s:'veri'};T.render();chk(/Hata kaydı/.test(document.getElementById('view').innerText)&&!!document.querySelector('[data-act="err-copy"]'),'ayarlarda hata kaydı');
 T.ACT['err-clear']();chk(!localStorage.getItem('wallet-err'),'kayıt temizlendi');T.ui.page=null;T.render();
 return F;});
// harici bir betik yüklenemez (politika engeller)
const blocked=await p.evaluate(()=>new Promise(res=>{const s=document.createElement('script');s.src='https://example.com/x.js';s.onerror=()=>res(true);s.onload=()=>res(false);document.head.appendChild(s);setTimeout(()=>res(true),3000);}));
if(!blocked)r.push('harici betik yüklendi');
const v=await p.evaluate(()=>window.__csp.length);if(!v)r.push('harici betik politika ihlali olarak görülmedi');
const real=errs.filter(e=>!/deneme hatası/.test(e));if(real.length)r.push('JS hata: '+real.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
