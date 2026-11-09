// test raporundaki hataların gerileme testleri (4.7)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const chk=(c,m)=>{if(!c)F.push(m);};const $=s=>document.querySelector(s);
 const fx=JSON.parse(JSON.stringify(T.S.fx));const cur=T.curP(),ps=T.pStart(cur);
 const inP=n=>{const x=T.pdate(ps);x.setDate(x.getDate()+n);const s=T.isoDate(x);return s>T.todayS()?T.todayS():s;};
 const prevK=T.addMonth(cur,-1),prevD=T.pStart(prevK);
 // H1: başlangıçtan önceki tek eski işlem göstergeleri bozmasın
 T.S=T.norm({fx,accounts:['Nakit','Banka'],opening:{Banka:20000},tx:[{id:'i1',type:'inc',amt:45000,cat:'Maaş',acct:'Banka',date:inP(0)},{id:'e1',type:'exp',amt:14000,cat:'Kira',acct:'Banka',date:inP(0)},{id:'e2',type:'exp',amt:1500,cat:'Market',acct:'Banka',date:inP(0)}]});T.save();
 const h0=T.health(),f0=T.fireModel();
 T.S.tx.push({id:'old',type:'exp',amt:500,cat:'Fatura',acct:'Banka',date:prevD});T.save();
 const h1=T.health(),f1=T.fireModel();
 chk(T.monthBase().n===0,'eski tek işlem tamamlanmış dönem sayılmamalı');
 chk(h0.score===h1.score,'Koç/sağlık puanı oynamamalı '+h0.score+'→'+h1.score);
 chk(Math.abs(f0.exp-f1.exp)<1,'FIRE gideri oynamamalı '+f0.exp+'→'+f1.exp);
 chk(T.coachData().n===0,'Koç tamamlanmış dönem saymamalı');
 // gerçek tamamlanmış dönem sayılır
 T.S.tx.push({id:'pi',type:'inc',amt:45000,cat:'Maaş',acct:'Banka',date:prevD},{id:'pe',type:'exp',amt:20000,cat:'Market',acct:'Banka',date:prevD});T.save();
 chk(T.monthBase().n===1,'gelirli önceki dönem sayılmalı');
 // H2: gecikmiş ödenmemiş düzenli ödeme kalandan düşer, iki ekran aynı sayı
 T.S=T.norm({fx,accounts:['Banka'],tx:[{id:'i1',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:inP(0)}],recurring:[{id:'r1',name:'İnternet',amt:500,cat:'Fatura',acct:'Banka',day:+inP(0).slice(8,10),paid:{}},{id:'r2',name:'Spor',amt:900,cat:'Diğer',acct:'Banka',day:+T.pEnd(cur).slice(8,10),paid:{}}]});T.save();
 const L=T.leftNow();chk(L.rec===1400,'ödenecek gecikmişi de içermeli '+L.rec);chk(T.recDue(cur).tot===1400,'recDue');
 // H10: erken ödeme bugünün tarihiyle
 const r2=T.S.recurring[1];T.payRec(r2,cur);const pt=T.S.tx[T.S.tx.length-1];chk(pt.date<=T.todayS(),'erken ödeme ileri tarihli olmamalı '+pt.date);
 // H5: gün içinde son eklenen üstte
 T.S=T.norm({fx,accounts:['Nakit'],tx:[]});const d=T.todayS();
 for(let i=0;i<8;i++){T.S.tx.push({id:'zz'+i,type:'exp',amt:10+i,cat:'Market',acct:'Nakit',date:d,ts:1000+i});}
 T.S.tx.push({id:'aa',type:'exp',amt:999,cat:'Market',acct:'Nakit',date:d,ts:5000});T.save();T.ui.sub='ev';T.ui.page=null;T.render();
 chk(T.S.tx.slice().sort(T.txCmp)[0].id==='aa','son eklenen en üstte');
 // H4: kira tahmine yayılmaz
 T.S=T.norm({fx,accounts:['Banka'],tx:[]});
 for(let m=1;m<=3;m++){const k=T.addMonth(cur,-m),s0=T.pStart(k);const dd=n=>{const x=T.pdate(s0);x.setDate(x.getDate()+n);return T.isoDate(x);};T.S.tx.push({id:'pi'+m,type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:dd(0)},{id:'pk'+m,type:'exp',amt:14000,cat:'Kira',acct:'Banka',date:dd(1)});for(let j=0;j<10;j++)T.S.tx.push({id:'pm'+m+j,type:'exp',amt:600,cat:'Market',acct:'Banka',date:dd(2+j*2)});}
 T.S.tx.push({id:'ci',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:inP(0)},{id:'ck',type:'exp',amt:14000,cat:'Kira',acct:'Banka',date:inP(0)});T.save();
 const FC=T.forecast();chk(FC.exp<14000+6000*1.6,"tahmin kirayı yaymamalı "+FC.exp);
 // budgetPace: tek faturadan alarm yok
 T.S.budgets={Fatura:2000};T.S.tx.push({id:'fx1',type:'exp',amt:1200,cat:'Fatura',acct:'Banka',date:inP(0)});T.save();chk(!T.budgetPace().some(x=>x.c==='Fatura'),'fatura bütçesi için hız alarmı yok');
 // K13: aşımlar ayrı
 T.S.budgets={Market:1000,Giyim:5000};T.S.tx.push({id:'m1',type:'exp',amt:2500,cat:'Market',acct:'Banka',date:inP(0)});T.save();T.ui.month=cur;
 const bb=T.budgetBody();chk(/Aşılmayan kategorilerde kalan/.test(bb)&&/Aşıldı: Market/.test(bb),'bütçe aşımı ayrı gösterilmeli');
 // H7: yarım dönem aynı güne kadar
 chk(/aynı gününe/.test(T.flowCard())||T.pDays(cur)===0,'akış kıyası aynı güne kadar');
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
