// 4.13 düzeltmeleri: kredi taksidinin faiz kaydı, "bu dönem kalan", kopyalanan/bölünen işlemin bağları
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1000);
const r=await p.evaluate(()=>{const T=window.__T,F=[];const $=s=>document.querySelector(s);
 const chk=(c,m)=>{if(!c)F.push(m);};const near=(x,y)=>Math.abs(x-y)<0.011;
 const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 const setv=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
 const bal=a=>T.acctBal(a);
 const reset=()=>{T.S.tx=[];T.S.recurring=[];T.S.debts=[];T.S.opening={Nakit:1000,Banka:100000,'Kredi kartı':0};T.save();T.render();};
 const loan=()=>{T.S.debts.push({id:'dd1',name:'Konut',type:'Kredi',amt:50000,rate:3});
   const r={id:'rr1',name:'Kredi taksiti',amt:5000,day:+T.todayS().slice(8),cat:'Fatura',acct:'Banka',debt:'dd1',paid:{}};T.S.recurring.push(r);T.save();T.render();return r;};
 act('sample-clear');
 // 1 "Ödendi" ile oluşan kredi ödemesi silinince faizi de silinir; geri alınca ikisi döner
 reset();let r=loan();T.payRec(r,T.curP());chk(near(bal('Banka'),95000),'ödeme sonrası '+bal('Banka'));
 const pay=T.S.tx.find(t=>t.type==='dbt');chk(pay&&pay.intId,'faiz ayrı yazıldı');
 act('del-tx',pay.id);chk(near(bal('Banka'),100000)&&T.S.tx.length===0,'silince faiz kaldı: '+bal('Banka')+' '+T.S.tx.length);
 act('undo');chk(near(bal('Banka'),95000)&&T.S.tx.length===2,'geri al: '+bal('Banka')+' '+T.S.tx.length);
 // 2 notunda adı geçen gider krediye bağlanıp bölünür; "Geri al" faizi de kaldırır
 reset();loan();act('qa-exp');setv('f-amt','5000');setv('f-acct','Banka');setv('f-note','Kredi taksiti');$('.sheet [data-act="save-tx"]').click();
 chk(T.S.tx.some(t=>t.type==='dbt')&&near(bal('Banka'),95000),'gider krediye bağlandı');
 act('undo');chk(near(bal('Banka'),100000)&&T.S.tx.length===0,'kaydı geri al: '+bal('Banka')+' '+T.S.tx.length);
 // 3 çift kayıt silme de faizi götürür
 reset();r=loan();T.payRec(r,T.curP());const p2=T.S.tx.find(t=>t.type==='dbt');act('br-dup',p2.id);chk(T.S.tx.length===0,'çift kayıt silme '+T.S.tx.length);
 // 4 kredi taksidi "Ödendi" deyince bu dönem kalan artmaz
 reset();T.S.tx.push({id:'i1',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:T.pStart(T.curP())});r=loan();
 const L0=T.leftNow().left,F0=T.forecast();T.payRec(r,T.curP());const L1=T.leftNow();
 chk(near(L0,L1.left),'kalan değişti: '+L0+' → '+L1.left);chk(near(L1.paid,3050),'ödenen anapara '+L1.paid);
 chk(near(F0.exp,T.forecast().exp),'tahmin değişti '+F0.exp+' → '+T.forecast().exp);
 // 5 taksitli alışverişin kopyası bağımsızdır: kopya silinince plan durur
 reset();act('qa-exp');setv('f-amt','6000');setv('f-acct','Kredi kartı');setv('f-inst','6');$('.sheet [data-act="save-tx"]').click();
 const first=T.S.tx[0];act('dup-tx',first.id);const cp=T.S.tx.find(t=>t.id!==first.id);
 chk(cp&&!cp.inst&&!cp.rec&&!/\(\d+\/\d+\)$/.test(cp.note),'kopyada taksit bağı '+JSON.stringify(cp));
 act('del-tx',cp.id);chk(T.S.tx.length===1&&T.S.recurring.length===1&&near(bal('Kredi kartı'),-6000),'kopyayı sil: '+T.S.tx.length+' '+T.S.recurring.length+' '+bal('Kredi kartı'));
 // 6 bölünen parça taksit planına, fişe ve alt kategoriye bağlanmaz
 act('split-tx',first.id);setv('sp-amt','100');$('.sheet [data-act="split-go"]').click();const sp=T.S.tx.find(t=>t.split&&t.id!==first.id);
 chk(sp&&!sp.inst&&!sp.rc&&!sp.sub,'bölünen parçada bağ '+JSON.stringify(sp));
 // 7 kategori adı değişince bütçe devrinin başlangıcı da taşınır
 T.S.budSince={'Market':'2026-01'};act('cat-menu','Market','exp');setv('cr-name','Gıda');$('.sheet [data-act="cat-ren"]').click();
 chk(T.S.budSince['Gıda']==='2026-01'&&!T.S.budSince['Market'],'budSince '+JSON.stringify(T.S.budSince));
 return F;});
console.log(r.length?r.map(x=>'FAIL '+x).join('\n'):'ALL PASS');if(errs.length)console.log('PAGEERR',errs);await b.close();})();
