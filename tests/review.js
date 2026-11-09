// bağımsız incelemede bulunan hataların gerileme testleri
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const $=s=>document.querySelector(s);const chk=(c,m)=>{if(!c)F.push(m);};
 const fx=JSON.parse(JSON.stringify(T.S.fx));fx.USD=fx.USD||40;
 const d=k=>{const x=new Date();x.setDate(x.getDate()-k);return T.isoDate(x);};
 // 1. dövizli transfer düzenlenince karşı tutar korunur
 T.S=T.norm({fx,accounts:['Banka','Dolar'],accx:{Dolar:{ccy:'USD'}},tx:[{id:'tr1',type:'trf',amt:4000,amt2:95,acct:'Banka',to:'Dolar',cat:'Transfer',date:d(1)}]});T.save();T.render();
 T.ACT['edit-tx'](null,'tr1');const a2=$('#f-amt2');chk(a2&&a2.dataset.manual==='1','karşı tutar elle işaretli');
 // 2. CSV iki kez içe aktarılınca çoğalmaz
 T.S=T.norm({fx,accounts:['Banka'],tx:[]});T.save();
 const csv='Tarih;Açıklama;Tutar\n01.03.2026;MIGROS  ATASEHIR;-250,00\n02.03.2026;Maaş;45.000,00\n';
 try{T.csvImport(csv,'Banka');T.csvImport(csv,'Banka');}catch(e){F.push('csvImport hata '+e.message);}
 const n=T.S.tx.filter(t=>t.type==='exp'||t.type==='inc').length;chk(n===2,'CSV tekrar aktarımında '+n+' işlem');
 // 9. maaş günü 31 iken ödeme günleri dönem içinde
 T.S=T.norm({fx,payday:31,tx:[]});
 ['2026-01','2026-02','2026-03','2026-04'].forEach(k=>{[29,30,31,5].forEach(day=>{const x=T.dueDate({day},k);chk(x>=T.pStart(k)&&x<=T.pEnd(k),'dueDate '+k+' gün '+day+' → '+x);});});
 chk(T.dueDate({day:29},'2026-03')==='2026-04-29','29 nisanda');
 T.S=T.norm({fx,payday:1,tx:[]});chk(T.dueDate({day:31},'2026-02')==='2026-02-28','şubat son gün');chk(T.dueDate({day:15},'2026-05')==='2026-05-15','normal gün');
 // 3. maaş günü değişince ödenmiş fatura ödenmiş kalır
 const tid='p1';T.S=T.norm({fx,payday:1,tx:[{id:tid,type:'exp',amt:300,cat:'Faturalar',acct:'Banka',date:'2026-03-20',note:'Elektrik'}],recurring:[{id:'r1',name:'Elektrik',amt:300,cat:'Faturalar',acct:'Banka',day:20,type:'exp',paid:{'2026-03':tid}}]});
 T.S.payday=25;T.remapPaid();chk(T.S.recurring[0].paid[T.pk('2026-03-20')]===tid,'ödeme yeni döneme taşındı '+JSON.stringify(T.S.recurring[0].paid));
 // 6. taksit ulaşım sayılmaz
 chk(T.smsCat('Kredi karti taksit odemesi 500 TL','exp')!=='Ulaşım','taksit ulaşım değil');chk(T.smsCat('BiTaksi 120 TL','exp')==='Ulaşım','bitaksi ulaşım');chk(T.smsCat('taksi 120 TL','exp')==='Ulaşım','taksi ulaşım');
 // 7. kapatılan öneri sıradakini gizlemez
 T.S=T.norm({fx,accounts:['Banka'],tx:[]});
 const mk=(nm,amt,day)=>{for(let i=1;i<=4;i++){const x=new Date();x.setDate(1);x.setMonth(x.getMonth()-i);x.setDate(day);T.S.tx.push({id:nm+i,type:'exp',amt,cat:'Faturalar',acct:'Banka',date:T.isoDate(x),note:nm});}};
 mk('Netflix',230,5);mk('Spotify',60,8);mk('Youtube',80,12);T.save();
 const rc=T.recurCands();chk(rc.length===3,'3 düzenli aday '+rc.length);
 T.S.brainDis={};T.S.brainDis[rc[0].key]=1;T.S.brainDis[rc[1].key]=1;const bi=T.brainItems().filter(x=>/^rec:/.test(x.key));chk(bi.length===1&&bi[0].key===rc[2].key,'kapatılınca sıradaki görünür');
 // 8. ses
 // minor: num
 chk(T.num('0.500')===0.5,'0.500 → '+T.num('0.500'));chk(T.num('1.500')===1500,'1.500');chk(T.num('12,50')===12.5,'12,50');
 // 11. hesap adı değişince SMS eşleşmeleri
 T.S=T.norm({fx,accounts:['Banka','Nakit'],tx:[],sms:{map:{'akbank|1234':'Banka'},pend:[{id:'s1',acct:'Banka',amt:10,kind:'exp'}]}});
 T.renameAcct('Banka','Akbank');chk(T.S.sms.map['akbank|1234']==='Akbank'&&T.S.sms.pend[0].acct==='Akbank','SMS eşleşmeleri yeni ad');
 // P1: tehlikeli kimlik
 const bad=T.norm({tx:[{id:'x" onmouseover="alert(1)',type:'exp',amt:5,cat:'Market',acct:'Nakit',date:d(0)}]});chk(/^[\w.:-]+$/.test(bad.tx[0].id),'kimlik temizlendi');
 // 4/5. PIN sıfırlama ve yedek yükleme
 T.S=T.norm({fx,accounts:['Banka'],tx:[{id:'o1',type:'exp',amt:5,cat:'Market',acct:'Banka',date:d(0)}]});T.save();chk(T.bkOk(),'kendi verisi var → otomatik yedek açık');
 T.wipeAll(true);chk(!!T.S.bkHold&&!T.bkOk(),'PIN sıfırlamada otomatik yedek duraklatıldı');
 T.S=T.norm({fx,accounts:['Banka'],tx:[{id:'o1',type:'exp',amt:5,cat:'Market',acct:'Banka',date:d(0)}]});T.save();T.ui.sub='ayar';T.ui.page=null;T.render();
 return F;});
// yedek yükleme: onay ister, geri alınabilir
await p.evaluate(()=>{const T=window.__T;T.ui.sub='ayar';T.render();try{T.ACT['set-open']&&0;}catch(e){}});
const rs=await p.evaluate(async()=>{const T=window.__T,F=[];const chk=(c,m)=>{if(!c)F.push(m);};const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const box=document.createElement('div');box.innerHTML='<textarea id="rs-txt"></textarea><input id="rs-pw"><div id="f-err2"></div><button data-act="rs-go"></button>';document.body.appendChild(box);
 document.getElementById('rs-txt').value=JSON.stringify({tx:[{id:'n1',type:'exp',amt:9,cat:'Market',acct:'Nakit',date:'2026-01-01'},{id:'n2',type:'exp',amt:9,cat:'Market',acct:'Nakit',date:'2026-01-02'}],accounts:['Nakit']});
 const btn=box.querySelector('button');btn.click();await wait(50);chk(T.S.tx.length===1,'ilk dokunuşta yüklenmedi');
 btn.click();await wait(300);chk(T.S.tx.length===2,'ikinci dokunuşta yüklendi '+T.S.tx.length);chk(!!localStorage.getItem('wallet-prerestore'),'önceki veri saklandı');
 const u=document.querySelector('#toast [data-act="undo"]');chk(!!u,'geri al var');u&&u.click();await wait(50);chk(T.S.tx.length===1&&T.S.tx[0].id==='o1','geri alındı');box.remove();return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
const all=r.concat(rs);console.log(all.length?'HATA:\n - '+all.join('\n - '):'ALL PASS');await b.close();process.exit(all.length?1:0);})();
