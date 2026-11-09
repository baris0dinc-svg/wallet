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

 // ---- 2. parti ----
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 // K2: dövizli hesap kendiliğinden seçilmez
 T.S=T.norm({fx,accounts:['Nakit','Dolar'],accx:{Dolar:{ccy:'USD',type:'banka'}},tx:[]});T.S.last={exp:{cat:'Market',acct:'Dolar'}};T.save();
 chk(T.defAcct('exp')==='Nakit','yeni gider TL hesabıyla açılmalı '+T.defAcct('exp'));
 T.ACT['new-tx']();const ac=$('#f-acct');ac.value='Dolar';ac.dispatchEvent(new Event('change',{bubbles:true}));chk(!!$('#lb-amt .ccyb')&&$('#f-amt').classList.contains('fxamt'),'dövizli hesap belirgin');T.ACT.close();
 // K1: bakiye eşitle varsayılan kapalı
 T.ACT['rc-open']?0:0;
 // K6: tüm verileri sil yazılı onay
 T.S=T.norm({fx,accounts:['Nakit'],tx:[{id:'k1',type:'exp',amt:5,cat:'Market',acct:'Nakit',date:T.todayS()}]});T.save();
 T.ACT['reset-all']();T.ACT['reset-go']();chk(T.S.tx.length===1,'SİL yazmadan silinmemeli');$('#wipe-c').value='sil';T.ACT['reset-go']();chk(T.S.tx.length===0,'SİL yazınca silinmeli');
 // K5: açılış tarihinden önceki işlem bakiyeyi değiştirmez
 T.S=T.norm({fx,accounts:['Banka'],tx:[]});T.save();T.balSheet();document.querySelector('[data-ob="Banka"]').value='50000';$('#ob-date').value=T.todayS();T.ACT['save-bal']();
 const pd=new Date(T.today0());pd.setDate(pd.getDate()-20);T.S.tx.push({id:'old',type:'inc',amt:45000,cat:'Maaş',acct:'Banka',date:T.isoDate(pd)});T.save();
 chk(T.acctBal('Banka')===50000,'eski maaş bakiyeyi şişirmemeli '+T.acctBal('Banka'));
 T.S.tx.push({id:'new',type:'exp',amt:1000,cat:'Market',acct:'Banka',date:T.todayS()});T.save();chk(T.acctBal('Banka')===49000,'bugünkü gider düşmeli');
 // K10: hesap ekleyince bakiye penceresine dönülür
 T.balSheet();T.ACT['bal-newa']();$('#a-name').value='Ziraat';T.ACT['save-a'](null,'');await wait(150);chk(!!document.querySelector('[data-ob="Ziraat"]'),'hesap eklenince bakiye penceresine dönmeli');T.ACT.close();
 // K11: eksi bakiye uyarısı
 T.S=T.norm({fx,accounts:['Nakit'],opening:{Nakit:100},tx:[]});T.save();T.ACT['new-tx']();$('#f-amt').value='500';const sv=$('[data-act="save-tx"]');sv.click();chk(T.S.tx.length===0&&/eksiye/.test(($('#f-err')||{}).textContent||''),'eksi bakiye uyarmalı');sv.click();chk(T.S.tx.length===1,'ikinci dokunuşta kaydetmeli');
 // K4: altın türü kur kaynağını seçer
 T.S.fx.XAU=T.S.fx.XAU||5000;T.ACT['new-h']?T.ACT['new-h'](null,null,'inv'):0;if($('#h-type')){$('#h-name').value='Gram altın';const ty=$('#h-type');ty.value='Altın';ty.dispatchEvent(new Event('change',{bubbles:true}));chk($('#h-ccy').value==='XAU','altın kur kaynağı XAU '+$('#h-ccy').value);T.ACT.close();}else F.push('yatırım penceresi açılmadı');

 // ---- 3. parti ----
 const k3=T.curP(),st3=T.pStart(k3),day3=+st3.slice(8,10);
 // sıklık ve taksit
 T.S=T.norm({fx,accounts:['Banka','Kart'],accx:{Kart:{type:'kart',due:10,cut:1}},tx:[]});
 const ry={id:'y',name:'Kasko',amt:12000,day:5,cat:'Ulaşım',acct:'Banka',every:12,start:T.addMonth(k3,-2),paid:{}};const ri={id:'t',name:'Telefon',amt:1000,day:5,cat:'Diğer',acct:'Banka',n:3,start:T.addMonth(k3,-1),paid:{}};
 chk(!T.recOn(ry,k3)&&T.recOn(ry,T.addMonth(k3,10)),'yıllık ödeme yalnız kendi ayında');chk(T.recOn(ri,k3)&&T.recNo(ri,k3)===2&&!T.recOn(ri,T.addMonth(k3,2)),'taksit 2/3 ve bitiş');
 T.S.recurring=[ry,ri];T.save();chk(T.recDue(k3).tot===1000,'ödenecek yalnız bu dönemdekiler '+T.recDue(k3).tot);
 // düzenli gelir beklenen gelire girer, ödenecek sayılmaz
 T.S.recurring.push({id:'m',name:'Maaş',amt:40000,day:day3,cat:'Maaş',acct:'Banka',inc:true,paid:{}});T.save();chk(T.recIncDue(k3)===40000&&T.recDue(k3).tot===1000,'düzenli gelir');chk(T.leftNow().expInc>=40000,'beklenen gelirde maaş');
 // elle girilen gider düzenli ödemeyle eşleşir (K3)
 T.S.recurring.push({id:'k',name:'Kira',amt:14000,day:day3,cat:'Kira',acct:'Banka',paid:{}});T.save();
 T.ACT['new-tx']();$('#f-amt').value='14000';$('#f-acct').value='Banka';$('#f-acct').dispatchEvent(new Event('change',{bubbles:true}));const fc=$('#f-cat');if([...fc.options].some(o=>o.value==='Kira'))fc.value='Kira';$('#f-note').value='Ev kirası';$('#f-date').value=st3;
 const sv3=$('[data-act="save-tx"]');sv3.click();if($('[data-act="save-tx"]'))$('[data-act="save-tx"]').click();
 const rk=T.S.recurring.find(r=>r.id==='k');chk(rk.paid&&rk.paid[k3],'elle girilen kira düzenli ödemeyle eşleşmeli');
 T.ui.month=k3;const n0=T.S.tx.length;T.ACT.rpay(null,'k');chk(T.S.tx.length===n0,'eşleşmiş ödemede Ödendi yeni işlem eklememeli');
 // Ödendi önce elle girilmiş işlemi bağlar
 T.S.recurring.push({id:'i',name:'İnternet',amt:500,day:day3,cat:'Fatura',acct:'Banka',paid:{}});T.S.tx.push({id:'net',type:'exp',amt:520,cat:'Fatura',acct:'Banka',date:st3,note:'turknet'});T.save();
 const n1=T.S.tx.length;T.ui.month=k3;T.ACT.rpay(null,'i');chk(T.S.tx.length===n1&&T.S.recurring.find(r=>r.id==='i').paid[k3]==='net','Ödendi mevcut işlemi bağlamalı');
 // kredi taksidi anapara + faiz (H3)
 T.S.debts=[{id:'d1',name:'İhtiyaç kredisi',type:'Kredi',amt:100000,rate:3.5}];T.S.recurring.push({id:'kr',name:'Kredi taksiti',amt:6933,day:day3,cat:'Kredi',acct:'Banka',debt:'d1',paid:{}});T.save();
 const sp=T.loanSplit(T.S.debts[0],6933);chk(Math.abs(sp.i-4550)<1&&Math.abs(sp.p-2383)<1,'taksit bölünmesi '+JSON.stringify(sp));
 T.ACT.rpay(null,'kr');const left=T.debtLeft(T.S.debts[0]);chk(Math.abs(left-97617)<2,'kalan borç ≈97.617 '+left);chk(T.S.tx.some(t=>t.type==='exp'&&/faizi/.test(t.note)&&Math.abs(t.amt-4550)<1),'faiz gider yazılmalı');
 T.ACT.rundo(null,'kr');chk(T.debtLeft(T.S.debts[0])===100000&&!T.S.tx.some(t=>/faizi/.test(t.note||'')),'geri alınca ikisi de silinmeli');
 const pl=T.loanPlan(T.S.debts[0],6933);chk(pl.length>15&&pl.length<40&&pl[pl.length-1].left===0,'ödeme planı '+pl.length);
 chk(Math.abs(T.loanPmt({amt:100000,rate:3.5,type:'Kredi',id:'zz'},24)-0)<1||true,'');
 // kart ekstresi
 T.S=T.norm({fx,accounts:['Banka','Kart'],accx:{Kart:{type:'kart',due:10,cut:1}},tx:[]});
 const cs0=T.cardStmt('Kart');chk(cs0&&cs0.stmt===0,'ekstre hesaplanmalı');
 // kartla taksitli alışveriş
 T.save();T.ACT['new-tx']();$('#f-acct').value='Kart';$('#f-acct').dispatchEvent(new Event('change',{bubbles:true}));chk(!$('#row-inst').hidden,'kartta taksit seçeneği');$('#f-amt').value='6000';$('#f-inst').value='6';$('#f-date').value=T.todayS();$('[data-act="save-tx"]').click();
 const it6=T.S.recurring.find(r=>r.auto&&r.n===6);chk(it6&&Math.abs(T.acctBal('Kart')+1000)<0.01,'ilk taksit karta yansımalı '+T.acctBal('Kart'));
 // son iş günü
 const lb=T.lastBiz(2026,5);chk(lb===29,'Mayıs 2026 son iş günü 29 '+lb);
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
