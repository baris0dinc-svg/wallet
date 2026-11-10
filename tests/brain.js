// akıllı motor: öğrenen kategori, düzenli ödeme / olağandışı / çift kayıt tespiti, bütçe hızı, maaş günü, dönem sonu tahmini
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:360,height:780}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[],o={};const chk=(c,m)=>{if(!c)F.push(m);};const fx=JSON.parse(JSON.stringify(T.S.fx));
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};const pick=a=>a[Math.floor(rnd()*a.length)];
 const dAgo=k=>{const x=T.today0();x.setDate(x.getDate()-k);return T.isoDate(x);};
 const M={Market:['MIGROS','A101 market','BIM','Sok market','CarrefourSA'],'Ulaşım':['Shell','Opet akaryakit','Istanbulkart dolum','Uber','Martı scooter'],
  'Yeme-İçme':['Starbucks','Kahve Dunyasi','Burger King','Yemeksepeti siparis','Getir yemek'],Fatura:['Turkcell fatura','IGDAS dogalgaz','Enerjisa elektrik','ISKI su'],
  'Eğlence':['Cinemaximum','Steam oyun','Biletix konser'],'Giyim':['LC Waikiki','Zara','Koton','DeFacto']};
 const amtR={Market:[150,900],'Ulaşım':[60,1800],'Yeme-İçme':[60,500],Fatura:[300,1600],'Eğlence':[150,900],'Giyim':[400,2500]};
 const tx=[];let id=0;
 for(let i=0;i<400;i++){const c=pick(Object.keys(M)),[lo,hi]=amtR[c];tx.push({id:'h'+(id++),type:'exp',cat:c,acct:'Banka',amt:Math.round(lo+rnd()*(hi-lo)),date:dAgo(15+Math.floor(rnd()*170)),note:pick(M[c])+(rnd()<0.3?' '+Math.floor(rnd()*900):'')});}
 // kullanıcıya özgü: "Bakkal Ahmet" → Market (anahtar kelime tablosunda yok)
 for(let i=0;i<4;i++)tx.push({id:'bk'+i,type:'exp',cat:'Market',acct:'Nakit',amt:120+i*10,date:dAgo(20+i*7),note:'Bakkal Ahmet'});
 // Netflix: 4 aydır ayın ~5'i, 229,99
 for(let i=1;i<=4;i++){const x=new Date(T.today0());x.setDate(5);x.setMonth(x.getMonth()-i);tx.push({id:'nf'+i,type:'exp',cat:'Eğlence',acct:'Kredi Kartı',amt:229.99,date:T.isoDate(x),note:'NETFLIX.COM'});}
 // maaş: 4 aydır ayın 15'i
 for(let i=1;i<=4;i++){const x=new Date(T.today0());x.setDate(15);x.setMonth(x.getMonth()-i);tx.push({id:'ms'+i,type:'inc',cat:'Maaş',acct:'Banka',amt:52000,date:T.isoDate(x),note:'Maaş'});}
 T.S=T.norm({fx,accounts:['Nakit','Banka','Kredi Kartı'],opening:{Nakit:5000,Banka:80000},tx,payday:1,budgets:{}});T.save();
 // 1) kategori tahmini
 const cases=[['MIGROS SANAL MARKET','Market'],["Migros'tan alışveriş",'Market'],['Shell petrol','Ulaşım'],['STARBUCKS COFFEE','Yeme-İçme'],['Turkcell faturası','Fatura'],
  ['Zara giyim','Giyim'],['Bakkal Ahmet','Market'],['bakkal ahmetten ekmek','Market'],['Cinemaximum bilet','Eğlence'],['Kahve Dünyası','Yeme-İçme'],['Opet','Ulaşım'],['Yemeksepeti','Yeme-İçme']];
 let ok=0;o.cat=cases.map(([t,c])=>{const g=T.smartCat(t,'exp',200);if(g===c)ok++;return t+'→'+g;});chk(ok>=11,'kategori tahmini '+ok+'/'+cases.length+' '+o.cat.join(', '));
 chk(T.smartCat('tamamen yeni bir yer','exp',100)==='Diğer','bilinmeyen Diğer');
 const g0=T.catGuess('exp','Çiçekçi Gül',300);chk(!g0||g0.p<0.6,'öğrenmeden emin değil');
 T.S.tx.push({id:'cc1',type:'exp',cat:'Eğlence',acct:'Banka',amt:300,date:dAgo(16),note:'Çiçekçi Gül'},{id:'cc2',type:'exp',cat:'Eğlence',acct:'Banka',amt:280,date:dAgo(30),note:'Çiçekçi Gül'});T.save();
 chk(T.smartCat('ÇİÇEKÇİ GÜL','exp',290)==='Eğlence','düzeltmelerden öğrendi');
 T.S.rules=[{kw:'ahmet',cat:'Giyim'}];chk(T.smartCat('Bakkal Ahmet','exp',100)==='Giyim','kural modelden önce gelir');T.S.rules=[];
 // SMS kategorisi de modeli kullanır
 const sp=T.smsIngest([{text:'Kartinizla BAKKAL AHMET isyerinden 145,00 TL harcama yapilmistir.',from:'BANKA',ts:Date.now()}],{});
 const pend=(T.S.sms.pend||T.S.sms.queue||[]);const it=pend[pend.length-1];chk(!it||it.cat==='Market','SMS kategorisi öğrenilenden '+(it&&it.cat));
 // 2) düzenli ödeme adayı
 let rc=T.recurCands();chk(rc.length===1&&/netflix/i.test(rc[0].name)&&rc[0].day>=4&&rc[0].day<=6&&Math.abs(rc[0].amt-229.99)<0.01,'Netflix adayı '+JSON.stringify(rc.map(x=>[x.name,x.amt,x.day,x.n])));
 T.ui.sub='analiz';T.ui.an='ozet';T.ui.month=T.curP();T.ui.page=null;T.render();const bc=document.querySelector('.brain');chk(bc&&/NETFLIX|Netflix/i.test(bc.innerText),'4.30: Analiz › Özet’te akıllı tespit');
 const rb=[...document.querySelectorAll('.brain [data-act="br-rec"]')][0];rb&&rb.click();chk(T.S.recurring.length===1&&T.S.recurring[0].day===rc[0].day,'düzenli ödemelere eklendi');chk(T.recurCands().length===0,'eklenince tekrar önerilmez');
 // 3) olağandışı harcama
 T.S.tx.push({id:'big',type:'exp',cat:'Yeme-İçme',acct:'Banka',amt:3800,date:dAgo(2),note:'Restoran'});T.save();
 const un=T.unusualTx();chk(un.length>=1&&un[0].t.id==='big','olağandışı tespit '+JSON.stringify(un.map(x=>x.t.id)));
 T.S.tx.push({id:'nb',type:'exp',cat:'Market',acct:'Banka',amt:700,date:dAgo(1),note:'Migros'});T.save();chk(!T.unusualTx().some(x=>x.t.id==='nb'),'olağan tutar işaretlenmez');
 // 4) çift kayıt
 T.S.tx.push({id:'d1',type:'exp',cat:'Fatura',acct:'Banka',amt:450,date:dAgo(3),note:'Turkcell fatura'},{id:'d2',type:'exp',cat:'Fatura',acct:'Banka',amt:450,date:dAgo(3),note:'Turkcell fatura'});T.save();
 const du=T.dupTx();chk(du.length===1&&du[0].b.id==='d2','çift kayıt');T.render();const dbt=document.querySelector('[data-act="br-dup"]');
 if(dbt){const n0=T.S.tx.length;dbt.click();chk(T.S.tx.length===n0-1&&!T.S.tx.some(t=>t.id==='d2'),'çift silindi');document.querySelector('#toast [data-act="undo"]').click();chk(T.S.tx.some(t=>t.id==='d2'),'çift silme geri alındı');}else F.push('çift kayıt düğmesi yok');
 // gizle
 T.render();const k0=T.brainItems()[0].key;T.ACT['br-dis'](null,k0);chk(!T.brainItems().some(x=>x.key===k0),'gizlenen tekrar çıkmaz');
 // 5) maaş günü
 const ph=T.paydayHint();chk(ph&&ph.day===15,'maaş günü önerisi '+JSON.stringify(ph));T.ACT['br-pay'](null,'15');chk(T.S.payday===15&&!T.paydayHint(),'dönem başlangıcı 15');T.S.payday=1;T.save();
 // 6) bütçe hızı (dönemin 3.–son günü arasında anlamlı)
 const k=T.curP(),el=T.daysBetween(T.pStart(k),T.todayS())+1,days=T.pDays(k);
 if(el>=3&&el<days-2){T.S.budgets={Giyim:10000};const spent=T.spentByCat(k).Giyim||0;const need=Math.max(0,10000*0.5-spent);if(need>0)[0,1,2].forEach(i=>T.S.tx.push({id:'gy'+i,type:'exp',cat:'Giyim',acct:'Banka',amt:(need+1)/3,date:T.todayS(),note:'Koton'}));/* 4.7: hız için en az 3 işlem */T.save();
  const bp=T.budgetPace();o.pace=bp;const pace=(10000*0.5+1)/el;const willExceed=el+(10000-(10000*0.5+1))/pace<days;chk(willExceed?bp.some(x=>x.c==='Giyim'):!bp.some(x=>x.c==='Giyim'),'bütçe hızı '+JSON.stringify(bp));T.S.budgets={};}
 // 7) dönem sonu tahmini
 const Fc=T.forecast();o.f=Fc;chk(Fc.exp>=Fc.spent&&Fc.exp<Fc.spent+Fc.rem*20000&&Fc.hist>=1,'tahmin makul '+JSON.stringify(Fc));
 T.S.recurring.push({id:'rx',name:'Kira',amt:15000,day:28,cat:'Kira',acct:'Banka',paid:{}});const F2=T.forecast();
 const due=T.dueDate(T.S.recurring[1],k);if(due>=T.todayS()&&due<=T.pEnd(k))chk(Math.abs(F2.exp-Fc.exp-15000)<1&&F2.recLeft>=15000,'kalan kira tahmine eklendi');
 // performans: 5.000 işlemde model ve tespitler
 for(let i=0;i<4500;i++)T.S.tx.push({id:'p'+i,type:'exp',cat:pick(Object.keys(M)),acct:'Banka',amt:100+i%700,date:dAgo(i%360),note:pick(M.Market)});T.save();
 const t0=performance.now();T.smartCat('Migros','exp',100);T.brainItems();T.forecast();o.ms=Math.round(performance.now()-t0);chk(o.ms<1500,'süre '+o.ms+' ms');
 const t1=performance.now();for(let i=0;i<50;i++)T.smartCat('Shell '+i,'exp',100);o.ms2=Math.round(performance.now()-t1);chk(o.ms2<200,'önbellekli tahmin '+o.ms2+' ms');
 return {F,o};});
console.log(JSON.stringify(r.o.cat||[]).slice(0,400));console.log('süre',r.o.ms,r.o.ms2);
if(errs.length)r.F.push('JS hata: '+errs.join(' | '));
console.log(r.F.length?'HATA:\n - '+r.F.join('\n - '):'ALL PASS');await b.close();process.exit(r.F.length?1:0);})();
