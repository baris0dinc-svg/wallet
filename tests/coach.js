// 4.0 Koç: her öneri kullanıcının verisinden tetiklenir, koşul yoksa görünmez, veri eksikse eksik veri söylenir; sayılar doğru
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:360,height:780}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const chk=(c,m)=>{if(!c)F.push(m);};
 const fx=JSON.parse(JSON.stringify(T.S.fx)),cur=T.curP(),ks=[1,2,3].map(i=>T.addMonth(cur,-i)),Tf=v=>T.TRY0.format(v);
 /* senaryo kurucu: son 3 tamamlanmış dönemde aylık gelir/gider; Banka hesabının son bakiyesi "liquid" olur */
 const mk=o=>{o=Object.assign({inc:40000,exp:30000,liquid:0,cats:{Market:1},extra:{}},o);const tx=[];
   ks.forEach((k,i)=>{if(o.inc)tx.push({id:'i'+i,type:'inc',amt:o.inc,cat:'Maaş',acct:'Banka',date:T.pStart(k)});
     Object.keys(o.cats).forEach((c,j)=>{if(o.exp)tx.push({id:'e'+i+'_'+j,type:'exp',amt:o.exp*o.cats[c],cat:c,acct:'Banka',date:T.pStart(k)});});});
   (o.tx||[]).forEach(t=>tx.push(t));
   const d=Object.assign({fx,accounts:['Nakit','Banka'],opening:{Nakit:0,Banka:0},tx},o.extra);T.S=T.norm(d);
   const bal=T.acctBal('Banka');T.S.opening.Banka=T.r2(o.liquid-bal);T.save();return T.coachSteps();};
 const st=(l,id)=>l.filter(s=>s.id===id)[0];
 const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.innerText||d.textContent;};

 // A. hiç veri yok: öneri yok, eksik veri söylenir
 T.S=T.norm({fx,accounts:['Nakit','Banka'],tx:[]});T.save();let l=T.coachSteps();
 chk(st(l,'akis').st==='need'&&/tamamlanmış bir dönemin yok/.test(st(l,'akis').sum),'A: veri yokken akış eksik veri');
 chk(st(l,'tampon').st==='need'&&st(l,'acil').st==='need','A: gider yokken fon adımları eksik veri');
 chk(!/açık veriyorsun/.test(l.map(s=>s.sum+s.body).join(' ')),'A: veri yokken açık uyarısı yok');
 chk(T.coachHome()==='','A: ana sayfada Koç kartı yok');
 // B. gelir kaydı yok
 l=mk({inc:0,exp:20000,liquid:5000});chk(st(l,'akis').st==='need'&&/gelir kaydı yok/.test(st(l,'akis').sum),'B: gelir yoksa eksik veri');
 chk(st(l,'akis').act&&st(l,'akis').act[1]==='qa-inc','B: gelir ekle düğmesi');
 // C. açık veren bütçe: sayılar ve en büyük kalemler
 l=mk({inc:30000,exp:36000,liquid:50000,cats:{Kira:0.5,Market:0.3,Eğlence:0.2}});const ak=st(l,'akis');
 chk(ak.st==='now'&&/6\.000/.test(ak.sum),'C: açık 6.000 '+ak.sum);
 chk(/Kira/.test(ak.body)&&/18\.000/.test(txt(ak.body))&&/30\.000/.test(txt(ak.body))&&/36\.000/.test(txt(ak.body)),'C: gelir, gider ve en büyük kalem gösterilir: '+txt(ak.body));
 chk(T.coachCur(l)===0,'C: ilk adım şimdiki adım');
 T.ui.sub='plan';T.ui.plan='koc';T.ui.page=null;T.render();chk(/Gelirin giderini karşılasın/.test((document.querySelector('.kocnow')||{}).innerText||''),'C: Plan › Koç şu anki adım');
 // C2. fazla veren bütçe: açık uyarısı yok, tasarruf oranı doğru
 l=mk({inc:40000,exp:30000,liquid:200000});chk(st(l,'akis').st==='done'&&/%25/.test(st(l,'akis').sum)&&!/açık/.test(st(l,'akis').body),'C2: tasarruf oranı %25 '+st(l,'akis').sum);
 // D. 1 aylık tampon eksik
 l=mk({inc:40000,exp:30000,liquid:10000});let tp=st(l,'tampon');
 chk(tp.st==='now'&&/20\.000/.test(txt(tp.body))&&/2 ayda/.test(txt(tp.body)),'D: tampon eksik 20.000, 2 ayda: '+txt(tp.body));
 l=mk({inc:40000,exp:30000,liquid:30000});chk(st(l,'tampon').st==='done','D: 1 aylık varsa tampon tamam');
 // E. kredi kartı: asgari ödeme ve faiz yasal üst sınırla; nakit yeterliyse "şimdi" değil
 const card=(lim,bal,liq)=>mk({inc:40000,exp:30000,liquid:liq,extra:{accounts:['Nakit','Banka','Kart'],accx:{Kart:{type:'kart',limit:lim}},opening:{Kart:-bal}}});
 l=card(50000,20000,200000);let bo=st(l,'borc'),bt=txt(bo.body);
 chk(bo.st==='done'&&/%20/.test(bt)&&/4\.000/.test(bt)&&/520/.test(bt)&&/tamamını öde/.test(bt),'E: kart 20.000, asgari %20=4.000, kalan için 520 faiz, nakit yeter: '+bo.st+' '+bt);
 l=card(150000,50000,200000);bt=txt(st(l,'borc').body);chk(/%40/.test(bt)&&/%3,75/.test(bt)&&/1\.125/.test(bt),'E: limit 150 bin → asgari %40; borç 50 bin → %3,75; faiz 30.000×%3,75=1.125: '+bt);
 l=card(50000,20000,5000);chk(st(l,'borc').st==='now'&&/karşılamıyor/.test(txt(st(l,'borc').body)),'E: nakit yetmezse şimdiki adım');
 // F. faizli borçlar: çığ yöntemi, kapanış süresi; düşük faizli borç önceliklenmez; faizsiz kayıt için veri istenir
 const debt=(ds,liq,inc,exp)=>mk({inc:inc||40000,exp:exp||30000,liquid:liq==null?200000:liq,extra:{debts:ds}});
 l=debt([{id:'d1',name:'İhtiyaç kredisi',type:'Kredi',amt:100000,rate:4}]);bo=st(l,'borc');bt=txt(bo.body);
 chk(bo.st==='now'&&/14 ayda/.test(bt)&&/%60,1/.test(bt),'F: %4 aylık → yıllık %60,1, 10.000 fazla ile 14 ayda: '+bt);
 chk(T.payoffMonths(100000,0.04,10000)===14&&T.payoffMonths(100000,0.04,4000)===Infinity,'F: kapanış formülü');
 l=debt([{id:'d1',name:'A kredisi',type:'Kredi',amt:50000,rate:2.5},{id:'d2',name:'B kredisi',type:'Kredi',amt:50000,rate:4.5}]);bt=txt(st(l,'borc').body);
 chk(bt.indexOf('B kredisi')<bt.indexOf('A kredisi')&&/Önce bu/.test(bt),'F: en yüksek faizli önce');
 l=debt([{id:'d1',name:'Konut',type:'Kredi',amt:500000,rate:1}]);bo=st(l,'borc');
 chk(bo.st==='done'&&/enflasyonun/.test(txt(bo.body))&&!/ayda\b.*kapanır/.test(txt(bo.body)),'F: enflasyon altı faizli borç önceliklenmez: '+bo.st);
 l=debt([{id:'d9',name:'Taşıt',type:'Kredi',amt:80000}]);bo=st(l,'borc');
 chk(bo.st==='need'&&bo.act[1]==='edit-d'&&bo.act[2]==='d9','F: faiz oranı yoksa veri istenir');
 l=mk({inc:40000,exp:30000,liquid:200000});chk(st(l,'borc').st==='done'&&/borcun ya da kart borcun yok/.test(st(l,'borc').sum),'F: borç yoksa tamam');
 // G. acil durum fonu: ay sayısı, eksik tutar, süre
 const em=(saved,liq)=>mk({inc:40000,exp:30000,liquid:liq==null?36000:liq,extra:{goals:[{id:'g',name:'Acil durum fonu',target:180000,saved:saved,em:true}]}});
 l=em(36000);let ac=st(l,'acil'),at=txt(ac.body);
 chk(ac.st==='now'&&/1,2 katı/.test(at)&&/54\.000/.test(at)&&/6 ayda/.test(at)&&/11 ayda/.test(at),'G: 1,2 ay, 54.000 eksik, 6 / 11 ayda: '+at);
 l=em(120000);chk(st(l,'acil').st==='done'&&/4 aylık/.test(st(l,'acil').sum),'G: 4 ay → tamam');
 // H. faizsiz bekleyen TL: kayıp tutarı enflasyonla; birikim hesabı ve küçük tutar tetiklemez
 const I=T.FACTS.inf.v;
 l=mk({inc:40000,exp:30000,liquid:200000});let en=st(l,'enf'),et=txt(en.body);
 chk(en.st==='now'&&et.indexOf(Tf(170000))>=0&&et.indexOf(Tf(170000*(1-1/(1+I/100))))>=0,'H: 170.000 faizsiz, kayıp '+Tf(170000*(1-1/(1+I/100)))+': '+et);
 l=mk({inc:40000,exp:30000,liquid:35000});chk(st(l,'enf').st==='done'&&!/faizsiz bekliyor/.test(st(l,'enf').body),'H: 5.000 fazla tetiklemez');
 l=mk({inc:40000,exp:30000,liquid:30000,extra:{accounts:['Nakit','Banka','Birikim'],accx:{Birikim:{type:'birikim'}},opening:{Birikim:200000}}});chk(st(l,'enf').st==='done','H: birikim hesabı faizsiz sayılmaz');
 // I. reel getiri: TÜFE serisinden birikimli enflasyon
 const ci=T.cumInf('2025-10-31','2026-10-31');chk(Math.abs(ci*100-I)<0.15,'I: 12 aylık birikimli TÜFE ≈ yıllık '+(ci*100).toFixed(2));
 chk(T.cumInf('2026-10-01','2026-10-31')>0.024&&T.cumInf('2026-10-01','2026-10-31')<0.026,'I: ekim ayı ~%2,5');
 const ago=new Date(T.today0());ago.setFullYear(ago.getFullYear()-1);const ad=T.isoDate(ago);
 l=mk({inc:40000,exp:30000,liquid:35000,extra:{holdings:[{id:'h1',name:'Endeks fonu',type:'Fon',kind:'inv',qty:100,cost:100,price:120}]},tx:[{id:'b1',type:'inv',side:'buy',hold:'h1',qty:100,amt:10000,acct:'Banka',date:ad}]});
 en=st(l,'enf');et=txt(en.body);chk(en.st==='now'&&/Endeks fonu/.test(et)&&/reel −/.test(et),'I: %20 nominal, 1 yılda reel eksi: '+et);
 l=mk({inc:40000,exp:30000,liquid:35000,extra:{holdings:[{id:'h1',name:'Endeks fonu',type:'Fon',kind:'inv',qty:100,cost:100,price:150}]},tx:[{id:'b1',type:'inv',side:'buy',hold:'h1',qty:100,amt:10000,acct:'Banka',date:ad}]});
 en=st(l,'enf');chk(en.st==='done'&&/reel \+/.test(txt(en.body)),'I: %50 nominal → reel artı, uyarı yok');
 // J. uzun vade: önceki adımlar bitmeden bekler; yoğunlaşma ve BES koşula bağlı
 l=mk({inc:40000,exp:30000,liquid:10000});chk(st(l,'uzun').st==='todo','J: önceki adımlar bitmeden bekler');
 const good={inc:40000,exp:30000,liquid:35000,extra:{goals:[{id:'g',name:'Acil durum fonu',target:120000,saved:120000,em:true}]}};
 l=mk(good);let uz=st(l,'uzun'),ut=txt(uz.body);
 chk(uz.st==='now'&&/BES/.test(ut)&&/%20/.test(ut)&&/2\.500/.test(ut)&&/6\.000/.test(ut)&&/79\.272/.test(ut),'J: BES yokken devlet katkısı örneği (fazla 10.000 → 2.500/ay → yılda 6.000): '+ut);
 good.extra.holdings=[{id:'b',name:'BES',type:'BES',kind:'inv',qty:1,cost:10000,price:10000}];l=mk(good);uz=st(l,'uzun');
 chk(!/Kayıtlı BES görünmüyor/.test(uz.body),'J: BES varsa BES önerisi yok');
 chk(uz.st==='done'||/tek türde/.test(uz.body),'J: BES varken yalnızca yoğunlaşma tetikleyebilir');
 const conc=JSON.parse(JSON.stringify(good));conc.liquid=300000;l=mk(conc);uz=st(l,'uzun');
 chk(/tek türde/.test(uz.body)&&/TL nakit ve mevduat/.test(uz.body),'J: varlıkların %80+ tek türde → yoğunlaşma');
 // K. FIRE ve sayfa: kaynaklar, uyarı satırı, kaçış
 l=mk(good);chk(st(l,'fire').st==='todo'||st(l,'fire').st==='now','K: FIRE adımı');
 T.S.debts=[{id:'x',name:'<img src=x onerror="window.__p=1">',type:'Kredi',amt:1000}];T.save();T.ui.page=null;T.ui.sub='plan';T.ui.plan='koc';T.render();
 const v=document.getElementById('view').innerText;
 chk(/yatırım tavsiyesi değildir/.test(v),'K: eğitim amaçlı uyarı');chk(!document.querySelector('#view img[src="x"]')&&!window.__p,'K: kullanıcı metni kaçışlı');
 document.querySelector('.facts').open=true;const fv=document.querySelector('.facts').innerText;
 chk(/TÜİK/.test(fv)&&/TCMB/.test(fv)&&/BDDK/.test(fv)&&/%29,77/.test(fv)&&/%36/.test(fv)&&/79\.272/.test(fv),'K: oranlar kaynaklı: '+fv.slice(0,200));
 chk(!!document.querySelector('.kocnow .why'),'K: şimdiki adımda kısa ders');
 // L. ana sayfa "kalan": beklenen gelir − harcanan − kalan düzenli ödemeler
 T.S=T.norm({fx,accounts:['Nakit','Banka'],tx:[{id:'i0',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:T.pStart(cur)},{id:'e0',type:'exp',amt:10000,cat:'Market',acct:'Banka',date:T.pStart(cur)}],
   recurring:[{id:'r',name:'İnternet',amt:2000,day:+T.pEnd(cur).slice(8),cat:'Fatura',acct:'Banka',paid:{}}]});T.save();
 const L=T.leftNow();chk(L.left===28000&&L.rec===2000&&L.spent===10000&&!L.assumed,'L: kalan 40.000−10.000−2.000=28.000 '+JSON.stringify(L));
 T.ui.sub='ev';T.render();chk(document.getElementById('left-now').innerText.indexOf(Tf(28000))>=0,'L: ana sayfada kalan');
 T.S.tx=T.S.tx.filter(t=>t.type!=='inc');T.save();T.render();chk(/Gelirini eklersen/.test(document.querySelector('.pcard').innerText),'L: gelir yoksa yalnızca harcanan (4.35: Bu dönem kartı)');
 // M. bütçe önerisi: son 3 dönem ortalaması, 100'e yuvarlanır, var olan limit değişmez
 mk({inc:40000,exp:3000,liquid:0,cats:{Market:1}});T.S.tx.forEach(t=>{if(t.cat==='Market'&&t.id==='e0_0')t.amt=1050;});T.S.budgets={};T.save();
 const sg=T.budgetSuggest();chk(sg.length===1&&sg[0][0]==='Market'&&sg[0][1]===2400,'M: öneri (1050+3000+3000)/3=2350 → 2400: '+JSON.stringify(sg));
 T.S.budgets={};T.ACT['bud-sug']();chk(T.S.budgets.Market===2400,'M: öneri uygulandı');
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'FAIL\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
