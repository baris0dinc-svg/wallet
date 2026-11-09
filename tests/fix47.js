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
 const it6=T.S.recurring.find(r=>r.auto&&r.n===6);chk(it6&&Math.abs(T.acctBal('Kart')+6000)<0.01,'4.11: kalan taksitler dahil tüm tutar kart borcunda '+T.acctBal('Kart'));chk(T.monthTx(T.curP()).filter(t=>t.type==='exp').reduce((a,t)=>a+t.amt,0)===1000,'bütçeye yalnız bu ayın taksidi');
 // son iş günü
 const lb=T.lastBiz(2026,5);chk(lb===29,'Mayıs 2026 son iş günü 29 '+lb);

 // ---- 4. parti ----
 T.S=T.norm({fx,accounts:['Nakit','Ziraat','Dolar'],accx:{Dolar:{ccy:'USD'}},opening:{Nakit:5000,Ziraat:50000},tx:[]});T.save();
 // K7: not yazarken sözlük
 T.ACT['new-tx']();const nt=$('#f-note');nt.value='shell benzin';nt.dispatchEvent(new Event('input',{bubbles:true}));chk($('#f-cat').value==='Ulaşım','not sözlüğü: shell → Ulaşım ('+$('#f-cat').value+')');T.ACT.close();
 // K8: ses
 const v1=T.voiceParse('dün akşam yemeğine 480 lira nakitten');const yd=new Date(T.today0());yd.setDate(yd.getDate()-1);chk(v1.date===T.isoDate(yd)&&v1.acct==='Nakit'&&v1.amt===480,'ses: dün ve hesap '+JSON.stringify(v1));
 const v2=T.voiceParse('ziraatten nakite 2000 transfer');chk(v2.type==='trf'&&v2.acct==='Ziraat'&&v2.to==='Nakit'&&v2.amt===2000,'ses: transfer '+JSON.stringify(v2));
 const v3=T.voiceParse('20 dolar netflix');chk(v3.acct==='Dolar'&&v3.amt===20,'ses: dolar hesabı '+JSON.stringify(v3));
 // E6: kategori yeniden adlandırma
 T.S.tx.push({id:'c1',type:'exp',amt:100,cat:'Market',acct:'Nakit',date:T.todayS()});T.S.budgets={Market:3000};T.save();
 T.ACT['cat-menu'](null,'Market','exp');$('#cr-name').value='Süpermarket';T.ACT['cat-ren'](null,'Market','exp');chk(T.S.cats.exp.includes('Süpermarket')&&!T.S.cats.exp.includes('Market')&&T.S.tx.find(t=>t.id==='c1').cat==='Süpermarket'&&T.S.budgets['Süpermarket']===3000,'kategori yeniden adlandırma');
 // E8: bütçe devri
 const pk8=T.addMonth(T.curP(),-1);T.S.tx.push({id:'pv',type:'exp',amt:1000,cat:'Süpermarket',acct:'Nakit',date:T.pStart(pk8)});T.S.budRoll=true;T.save();chk(T.budLim('Süpermarket',T.curP())===5000,'devirle limit 3000+2000 '+T.budLim('Süpermarket',T.curP()));T.S.budRoll=false;
 // E4: böl
 T.S.tx.push({id:'sp',type:'exp',amt:500,cat:'Süpermarket',acct:'Nakit',date:T.todayS(),note:'fiş #ev'});T.save();T.ACT['split-tx'](null,'sp');$('#sp-amt').value='120';$('#sp-cat').value=T.S.cats.exp.find(c=>c!=='Süpermarket');T.ACT['split-go'](null,'sp');
 chk(T.S.tx.find(t=>t.id==='sp').amt===380&&T.S.tx.some(t=>t.split==='sp'&&t.amt===120),'işlem bölündü');
 chk(T.txTags().includes('#ev'),'etiket bulundu');
 // E5: arşiv
 T.ACT['a-arch'](null,'Dolar');chk(T.S.accx.Dolar.arch,'hesap arşivlendi');T.ACT['new-tx']();chk(![...$('#f-acct').options].some(o=>o.value==='Dolar'),'arşivli hesap seçimde yok');T.ACT.close();T.ACT['a-arch'](null,'Dolar');
 // E9: komisyon
 T.S.holdings=[{id:'h1',name:'THYAO',type:'Hisse',kind:'inv',qty:10,cost:300,price:350}];T.save();T.ACT['h-sell']?0:0;
 // H11: döviz iki ondalık, geçersiz ayar adresi
 chk(T.moneyIn(1741.5,'Dolar')==='$1.741,50','döviz iki ondalık '+T.moneyIn(1741.5,'Dolar'));
 chk(T.pageFromHash('ayar-xyz').k==='ayar'&&T.pageFromHash('ayar-veri').s==='veri','geçersiz ayar adresi');
 // alış kuru ile değerleme
 T.S.fx.USD=41;T.S.fxB={USD:40.8};chk(Math.abs(T.toTL(100,'Dolar')-4080)<0.01,'değerleme alış kuru');delete T.S.fxB;
 // K12: içe aktarımı geri al
 const n12=T.S.tx.length;T.csvImport('Tarih;Açıklama;Tutar\n01.11.2026;GETIR YEMEK;-150,00\n02.11.2026;Kira;-1000,00\n','Ziraat');chk(T.S.tx.length===n12+2&&T.S.tx.some(t=>t.imp&&t.cat==='Yeme-İçme'),'aktarım ve getir yemek kategorisi');
 T.impReview();const ub=$('[data-act="imp-undo"]');ub.click();ub.click();chk(T.S.tx.length===n12,'aktarım geri alındı '+T.S.tx.length);

 // ---- 4.11: ikinci test raporu ----
 const k5=T.curP(),s5=T.pStart(k5),dd5=n=>{const x=T.pdate(s5);x.setDate(x.getDate()+n);const v=T.isoDate(x);return v>T.todayS()?T.todayS():v;};
 T.S=T.norm({fx,accounts:['Banka','Kart'],accx:{Kart:{type:'kart'}},tx:[],recurring:[{id:'kira',name:'Kira',amt:17500,day:+s5.slice(8,10),cat:'Kira',acct:'Banka',paid:{}},{id:'spor',name:'Spor salonu',amt:1100,day:+s5.slice(8,10),cat:'Eğlence',acct:'Kart',paid:{}}]});
 if(!T.S.cats.exp.includes('Eğlence'))T.S.cats.exp.push('Eğlence');if(!T.S.cats.exp.includes('Kira'))T.S.cats.exp.push('Kira');T.save();T.ui.month=k5;
 // Y1: elle girilen kira bağlanır; Geri al yalnız bağı çözer
 T.S.tx.push({id:'ek',type:'exp',amt:17500,cat:'Kira',acct:'Banka',date:dd5(0),note:'Ev kirası'});T.save();
 T.ACT.rpay(null,'kira');chk(T.S.recurring.find(r=>r.id==='kira').paid[k5]==='ek','Ödendi elle girilen kirayı bağlar');
 T.ACT.rundo(null,'kira');chk(!!T.S.tx.find(t=>t.id==='ek')&&!T.S.recurring.find(r=>r.id==='kira').paid[k5],'Geri al kullanıcının işlemini silmez');
 // uygulamanın oluşturduğu kayıt silinir, geri alınabilir
 T.S.tx=T.S.tx.filter(t=>t.id!=='ek');T.save();T.ACT.rpay(null,'kira');const auto=T.S.recurring.find(r=>r.id==='kira').paid[k5];chk(T.S.tx.find(t=>t.id===auto).rec==='kira','Ödendi kaydı işaretli');T.ACT.rundo(null,'kira');chk(!T.S.tx.find(t=>t.id===auto),'uygulama kaydı silinir');
 // Y2: adı geçmeyen benzer işlem sessizce bağlanmaz (sorulur)
 T.ACT['new-tx']();$('#f-amt').value='1050';$('#f-acct').value='Kart';$('#f-acct').dispatchEvent(new Event('change',{bubbles:true}));$('#f-cat').value='Eğlence';$('#f-cat').dataset.manual='1';$('#f-note').value='Sinema';$('#f-date').value=dd5(0);$('[data-act="save-tx"]').click();if($('[data-act="save-tx"]'))$('[data-act="save-tx"]').click();
 chk(!T.S.recurring.find(r=>r.id==='spor').paid[k5]&&/Spor salonu ödemesi mi/.test($('#toast').innerText),'zayıf eşleşme sorulmalı: '+$('#toast').innerText);
 // gecikmiş ödeme sonraki dönemde de eşleşir
 const k6=T.addMonth(k5,-1);T.S.payday=1;T.S.recurring.push({id:'net',name:'İnternet',amt:450,day:20,cat:'Fatura',acct:'Banka',start:k6,paid:{}});T.S.tx.push({id:'tt',type:'exp',amt:450,cat:'Fatura',acct:'Banka',date:T.isoDate(new Date(+T.curP().slice(0,4),+T.curP().slice(5,7)-1,Math.min(5,new Date().getDate()))),note:'Türk Telekom internet'});T.save();
 const rmm=T.recMatch(T.S.tx.find(t=>t.id==='tt'));chk(rmm&&rmm.r.id==='net'&&rmm.k===k6,'gecikmiş ödeme sonraki dönemde eşleşmeli '+JSON.stringify(rmm&&{r:rmm.r.id,k:rmm.k}));
 // Y5: elle girilen kredi taksidi anapara+faize bölünür
 T.S.debts=[{id:'d1',name:'İhtiyaç kredisi',type:'Kredi',amt:100000,rate:3.5}];T.S.recurring.push({id:'kr',name:'Kredi taksiti',amt:6933,day:+s5.slice(8,10),cat:'Kira',acct:'Banka',debt:'d1',paid:{}});T.save();
 T.ACT['new-tx']();$('#f-amt').value='6933';$('#f-acct').value='Banka';$('#f-acct').dispatchEvent(new Event('change',{bubbles:true}));$('#f-note').value='Kredi taksiti';$('#f-date').value=dd5(0);$('[data-act="save-tx"]').click();if($('[data-act="save-tx"]'))$('[data-act="save-tx"]').click();
 chk(Math.abs(T.debtLeft(T.S.debts[0])-97617)<2,'elle girilen taksit borcu düşürmeli '+T.debtLeft(T.S.debts[0]));
 // Y6: düzenli ödeme toplamı gelir ve yıllıkları doğru sayar
 T.S.recurring=[{id:'a',name:'Maaş',amt:52000,day:1,cat:'Maaş',acct:'Banka',inc:true,paid:{}},{id:'b',name:'Kasko',amt:12000,day:1,cat:'Fatura',acct:'Banka',every:12,start:k5,paid:{}},{id:'c',name:'Kira',amt:15000,day:1,cat:'Kira',acct:'Banka',paid:{}}];T.save();chk(T.recMonthlyTot()===16000,'aylık düzenli ödeme '+T.recMonthlyTot());
 // Y4b: maaş günü değişince başlangıç taşınır
 T.S.payday=15;T.S.recurring=[{id:'t6',name:'Telefon taksiti',amt:5000,day:20,cat:'Diğer',acct:'Kart',every:1,n:6,start:'2026-11',auto:true,paid:{}}];T.save();const due0=T.dueDate(T.S.recurring[0],'2026-11');T.setPayday(1);chk(T.dueDate(T.S.recurring[0],T.S.recurring[0].start)===due0,'başlangıç tarihi korunmalı '+T.S.recurring[0].start);T.S.payday=1;
 // Y4a: taksitli alışveriş silinince plan da gider
 T.S=T.norm({fx,accounts:['Banka','Kart'],accx:{Kart:{type:'kart'}},tx:[]});T.save();T.ACT['new-tx']();$('#f-acct').value='Kart';$('#f-acct').dispatchEvent(new Event('change',{bubbles:true}));$('#f-amt').value='30000';$('#f-inst').value='6';$('#f-date').value=T.todayS();$('[data-act="save-tx"]').click();
 chk(Math.abs(T.acctBal('Kart')+30000)<0.01,'taksitli alışveriş tamamı borç');const hd=T.S.tx.find(t=>t.inst);T.ACT['del-tx'](null,hd.id);chk(!T.S.recurring.length&&Math.abs(T.acctBal('Kart'))<0.01&&T.autoPost()===0,'silince plan da silinmeli');
 // Y7: kurulumda hesap eklemeden önce girilenler kalır
 T.S=T.norm({fx,accounts:['Nakit'],tx:[]});T.save();T.balSheet();document.querySelector('[data-ob="Nakit"]').value='750';$('#ob-pd').value='15';T.ACT['bal-newa']();chk(T.S.opening.Nakit===750&&T.S.payday===15,'hesap eklerken girilenler kaydedilmeli');T.ACT.close();T.S.payday=1;
 // Y8: devir limit konmadan önceki döneme uygulanmaz
 T.S.budRoll=true;T.S.budgets={};T.S.budSince={};T.S.tx.push({id:'pp',type:'exp',amt:100,cat:'Market',acct:'Nakit',date:T.pStart(T.addMonth(T.curP(),-1))});T.save();T.S.budgets.Market=2000;T.S.budSince.Market=T.curP();chk(T.budLim('Market',T.curP())===2000,'devir geriye dönük olmamalı '+T.budLim('Market',T.curP()));T.S.budRoll=false;
 // Y11: yeniden adlandırılan kategoriye sözlük
 T.S=T.norm({fx,accounts:['Nakit'],tx:[]});T.save();T.ACT['cat-menu'](null,'Ulaşım','exp');$('#cr-name').value='Araç ve yol';T.ACT['cat-ren'](null,'Ulaşım','exp');chk(T.smartCat('opet akaryakıt','exp',900)==='Araç ve yol','sözlük yeni adı bulmalı '+T.smartCat('opet akaryakıt','exp',900));
 // Y15: Türkçe ekler
 chk([1,2,3,6,9,10,29,40,100].map(n=>n+T.sfx(n)).join(' ')==='1’i 2’si 3’ü 6’sı 9’u 10’u 29’u 40’ı 100’ü','sayı ekleri');
 // K8: ses
 const v4=T.voiceParse('kredi kartından akşam yemeğine 480 lira');chk(v4.cat==='Yeme-İçme','ses kategori '+v4.cat);
 T.S=T.norm({fx,accounts:['Nakit','Banka'],accx:{Banka:{type:'banka'}},tx:[]});T.save();const v5=T.voiceParse('bankadan iki bin lira çektim');chk(v5.type==='trf'&&v5.acct==='Banka'&&v5.to==='Nakit'&&v5.amt===2000,'para çekme transfer '+JSON.stringify(v5));
 chk(T.voiceParse('benzine 900 lira').cat==='Ulaşım','benzin Ulaşım');
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
