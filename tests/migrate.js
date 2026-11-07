const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{localStorage.setItem('kumbara-v1',JSON.stringify({tx:[{id:'a',type:'inc',amt:1000,cat:'Maaş',acct:'Banka',date:'2026-10-03'},{id:'b',type:'exp',amt:200,cat:'Market',acct:'Nakit',date:'2026-11-02',note:'x'},{id:'c',type:'trf',amt:100,cat:'Transfer',acct:'Banka',to:'Nakit',date:'2026-11-03'}],
 accounts:['Nakit','Banka','Kredi kartı'],opening:{Nakit:500,Banka:2000},accx:{'Kredi kartı':{type:'kart',due:15}},budgets:{Market:1000},holdings:[{id:'h',name:'Altın',type:'Altın',ccy:'XAU',qty:2,cost:4000,price:4000},{id:'h2',name:'Arsa',type:'Gayrimenkul',qty:1,cost:500000,price:600000}],
 notes:[{id:'n',title:'Eski not',body:'b',ts:1}],goals:[{id:'g',name:'Tatil',target:1000,saved:300}],recurring:[{id:'r',name:'Kira',amt:100,day:5,cat:'Kira',acct:'Banka',paid:{}}],debts:[{id:'d',name:'Kredi',type:'Kredi',amt:5000}],
 fire:{exp:'',save:'',ret:4,wr:4,acc:true,pf:true,extra:0},alerts:{budget:true,rec:true,thr:80,days:3},nset:{sort:'edited',view:'card'},hide:false,theme:'auto',fs:1,payday:1}));localStorage.setItem('wallet-ui',JSON.stringify({sub:'arac'}));});
await p.reload();await p.waitForTimeout(900);
const r=await p.evaluate(()=>{const T=window.__T,S=T.S;const out={sub:T.ui.sub,kinds:S.holdings.map(h=>h.kind),notes:S.notes.map(n=>[n.arch,!!n.trash]),bal:['Nakit','Banka'].map(a=>T.acctBal(a)),goal:T.goalSaved(S.goals[0]),debt:T.debtLeft(S.debts[0]),net:T.wealth().net,dccy:S.dccy,push:S.alerts.push};
 for(const s of ['islem','hesap','analiz','butce','portfoy','duzenli','hedef','notlar']){const e=document.createElement('button');e.dataset.act='sub';e.dataset.v=s;document.body.appendChild(e);e.click();e.remove();}
 out.text=/NaN|undefined/.test(document.body.innerText);return out;});
console.log(JSON.stringify(r));console.log(errs.join('\n')||'no page errors');await b.close();})();
