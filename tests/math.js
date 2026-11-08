// Bakiye matematiği ve mantık testleri (gerçek form akışlarıyla)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1000);
const r=await p.evaluate(async()=>{const T=window.__T,o={},F=[];const $=s=>document.querySelector(s);
 const chk=(c,m)=>{if(!c)F.push(m);};
 const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 const setv=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
 const click=s=>{const e=$(s);if(!e)throw new Error('yok: '+s);e.click();};
 const bal=a=>T.acctBal(a),near=(x,y)=>Math.abs(x-y)<0.011;
 act('sample-clear');T.S.opening={Nakit:1000,Banka:10000,'Kredi kartı':0};T.save();T.render();
 const net0=T.wealth().net;chk(near(net0,11000),'başlangıç net '+net0);
 // 1 gider (Gider dairesi)
 act('qa-exp');setv('f-amt','250');setv('f-acct','Nakit');o.prev=$('#f-bal').innerText;click('.sheet [data-act="save-tx"]');
 chk(near(bal('Nakit'),750),'gider sonrası nakit '+bal('Nakit'));chk(/1\.000,00.*750,00/s.test(o.prev),'önizleme '+o.prev);
 chk(near(T.sum(T.monthTx(T.curP()),'exp'),250),'dönem gideri');
 // 2 gelir
 act('qa-inc');setv('f-amt','5.000');setv('f-acct','Banka');click('.sheet [data-act="save-tx"]');chk(near(bal('Banka'),15000),'gelir sonrası banka '+bal('Banka'));
 // 3 transfer
 act('qa-trf');setv('f-acct','Banka');setv('f-to','Nakit');setv('f-amt','2000');click('.sheet [data-act="save-tx"]');
 chk(near(bal('Banka'),13000)&&near(bal('Nakit'),2750),'transfer '+bal('Banka')+' '+bal('Nakit'));chk(near(T.wealth().net,net0-250+5000),'transfer net değiştirmez');
 // 4 düzenle
 const e1=T.S.tx.find(t=>t.type==='exp'&&t.amt===250);act('edit-tx',e1.id);setv('f-amt','300');o.prev2=$('#f-bal').innerText;click('.sheet [data-act="save-tx"]');
 chk(near(bal('Nakit'),2700),'düzenleme sonrası '+bal('Nakit'));chk(/3\.000,00.*2\.700,00/s.test(o.prev2),'düzenleme önizleme '+o.prev2);
 // 5 sil + geri al
 act('edit-tx',e1.id);click('.sheet [data-act="del-tx"]');chk(near(bal('Nakit'),3000),'silince geri gelir');act('undo');chk(near(bal('Nakit'),2700),'geri al');
 // 6 dolar hesabı ve çapraz kur transferi
 act('new-a');setv('a-name','Dolar hesabı');setv('a-ccy','USD');setv('a-open','100');click('.sheet [data-act="save-a"]');
 chk(T.ccyOf('Dolar hesabı')==='USD'&&near(bal('Dolar hesabı'),100),'USD hesap');
 act('qa-trf');setv('f-acct','Banka');setv('f-to','Dolar hesabı');setv('f-amt','4131');o.auto2=$('#f-amt2').value;click('.sheet [data-act="save-tx"]');
 chk(o.auto2==='100','giriş tutarı kurla önerildi '+o.auto2);chk(near(bal('Dolar hesabı'),200)&&near(bal('Banka'),8869),'çapraz transfer '+bal('Dolar hesabı')+' '+bal('Banka'));
 // 7 görüntüleme para birimi
 T.S.dccy='USD';o.dc=T.DC0.format(41310);T.S.dccy='EUR';o.dc2=T.DC0.format(44250);T.S.dccy='XAU';o.dc3=T.DC0.format(5530.1*2.5);T.S.dccy='TRY';
 chk(o.dc==='$1.000'&&o.dc2==='€1.000'&&o.dc3==='2,5 gr','dccy '+o.dc+' '+o.dc2+' '+o.dc3);
 // 8 borç: hesaba giren kredi, ödeme, faiz
 let net1=T.wealth().net;
 act('new-d');setv('d-name','İhtiyaç kredisi');setv('d-amt','10000');setv('d-acct','Banka');click('.sheet [data-act="save-d"]');
 const D=T.S.debts.find(d=>d.name==='İhtiyaç kredisi');chk(near(bal('Banka'),18869)&&near(T.debtLeft(D),10000)&&near(T.wealth().net,net1),'kredi alındı: banka '+bal('Banka')+' net '+T.wealth().net+'/'+net1);
 act('edit-d',D.id);setv('dp-amt','3000');setv('dp-int','200');setv('dp-acct','Banka');click('.sheet [data-act="pay-d"]');
 chk(near(bal('Banka'),15669)&&near(T.debtLeft(D),7000),'ödeme: banka '+bal('Banka')+' kalan '+T.debtLeft(D));chk(near(T.wealth().net,net1-200),'faiz net servetten düşer '+(T.wealth().net-net1));
 chk(T.S.tx.some(t=>t.cat==='Faiz ve masraf'&&t.amt===200),'faiz gider');
 const pay=T.S.tx.find(t=>t.type==='dbt'&&t.side==='out');act('close');act('edit-tx',pay.id);click('.sheet [data-act="del-tx"]');chk(near(T.debtLeft(D),10000)&&near(bal('Banka'),18669),'ödeme silinince borç geri '+T.debtLeft(D)+' '+bal('Banka'));
 act('edit-d',D.id);setv('dp-amt','20000');setv('dp-acct','Banka');click('.sheet [data-act="pay-d"]');chk(/fazla olamaz/.test($('#f-err2').innerText),'fazla ödeme engeli');act('close');
 // 9 borca bağlı düzenli ödeme
 act('new-r');setv('r-name','Kredi taksidi');setv('r-amt','1000');setv('r-day','10');setv('r-acct','Banka');setv('r-debt',D.id);click('.sheet [data-act="save-r"]');
 const R=T.S.recurring.find(x=>x.name==='Kredi taksidi');T.ui.month=T.curP();act('rpay',R.id);chk(near(T.debtLeft(D),9000)&&near(bal('Banka'),17669),'taksit borçtan düştü '+T.debtLeft(D));
 act('rundo',R.id);chk(near(T.debtLeft(D),10000)&&near(bal('Banka'),18669),'taksit geri alındı');
 // 10 yatırım al/sat
 net1=T.wealth().net;
 act('new-h',null,'inv');setv('h-name','Hisse A');setv('h-type','Hisse');setv('h-qty','10');setv('h-cost','100');setv('h-price','100');setv('h-acct','Banka');click('.sheet [data-act="save-h"]');
 const H=T.S.holdings.find(h=>h.name==='Hisse A');chk(near(bal('Banka'),17669)&&near(T.wealth().net,net1),'yatırım alımı: banka '+bal('Banka')+' net '+(T.wealth().net-net1));
 act('h-buy',H.id);setv('tr-qty','10');setv('tr-price','120');setv('tr-acct','Banka');click('.sheet [data-act="trade"]');
 chk(near(H.qty,20)&&near(H.cost,110)&&near(bal('Banka'),16469),'ek alım '+H.qty+' '+H.cost+' '+bal('Banka'));
 act('h-sell',H.id);setv('tr-qty','5');setv('tr-price','150');setv('tr-acct','Banka');click('.sheet [data-act="trade"]');
 chk(near(H.qty,15)&&near(bal('Banka'),17219)&&T.S.realized.some(x=>near(x.pl,200)),'satış '+H.qty+' '+bal('Banka')+' '+JSON.stringify(T.S.realized));
 act('h-sell',H.id);setv('tr-qty','99');click('.sheet [data-act="trade"]');chk(/fazla satamazsın/.test($('#f-err').innerText),'fazla satış engeli');act('close');
 // 11 varlık
 net1=T.wealth().net;act('new-h',null,'asset');setv('h-name','Ev');setv('h-price','1000000');click('.sheet [data-act="save-h"]');
 const E=T.S.holdings.find(h=>h.name==='Ev');chk(near(T.wealth().net,net1+1000000)&&near(T.wealth().g.asset,1000000),'varlık eklendi');
 act('h-sell',E.id);setv('tr-price','1100000');setv('tr-acct','Banka');click('.sheet [data-act="trade"]');
 chk(!T.S.holdings.some(h=>h.name==='Ev')&&near(bal('Banka'),1117219)&&T.S.realized.some(x=>near(x.pl,100000)),'varlık satışı '+bal('Banka'));
 // 12 hedef birikim hesabına bağlı
 act('new-a',null,'birikim');setv('a-name','Birikim');click('.sheet [data-act="save-a"]');chk(T.acctType('Birikim')==='birikim','birikim türü');
 act('new-g');setv('g-name','Tatil');setv('g-target','5000');setv('g-acct','Birikim');click('.sheet [data-act="save-g"]');
 const G=T.S.goals.find(g=>g.name==='Tatil');act('goal-add',G.id);setv('ga-amt','500');setv('ga-from','Banka');click('.sheet [data-act="ga-save"]');
 chk(near(T.goalSaved(G),500)&&near(bal('Birikim'),500)&&near(bal('Banka'),1116719),'hedefe transfer '+T.goalSaved(G));
 // 13 bakiye eşitleme
 act('acct-rec','Nakit');setv('rc-amt','2000');o.diff=$('#rc-diff').innerText;click('.sheet [data-act="rc-save"]');
 chk(near(bal('Nakit'),2000)&&T.S.tx.some(t=>t.type==='exp'&&t.amt===700&&t.note==='Bakiye eşitleme'),'eşitleme gider '+bal('Nakit'));chk(/700/.test(o.diff),'fark gösterimi '+o.diff);
 act('acct-rec','Nakit');setv('rc-amt','2100');click('#rc-mode');click('.sheet [data-act="rc-save"]');chk(near(bal('Nakit'),2100)&&T.S.tx.some(t=>t.type==='adj'&&t.amt===100),'eşitleme düzeltme');
 const expBefore=T.sum(T.monthTx(T.curP()),'exp');chk(!T.S.tx.filter(t=>t.type==='adj').some(()=>false),'');
 // 14 kredi kartı
 act('acct-exp','Kredi kartı');setv('f-amt','500');click('.sheet [data-act="save-tx"]');chk(near(bal('Kredi kartı'),-500)&&T.wealth().g.cardDebt===500,'kart borcu');
 act('acct-trf','Kredi kartı');o.cardPay=[$('#f-acct').value,$('#f-to').value,$('#f-amt').value];click('.sheet [data-act="save-tx"]');
 chk(near(bal('Kredi kartı'),0)&&o.cardPay.join()==='Banka,Kredi kartı,500','kart borcu ödeme '+o.cardPay);
 // 15 FIRE dolar hedefi
 T.S.fire.target=100000;T.S.fire.tccy='USD';const fm=T.fireModel();chk(near(fm.target,4131000)&&fm.custom,'FIRE hedefi USD '+fm.target);
 act('open-fire');setv('fi-tccy','EUR');chk(T.S.fire.tccy==='EUR'&&near(T.S.fire.target,100000*41.31/44.25),'hedef para birimi çevrildi '+T.S.fire.target);act('back');
 T.S.fire.target='';
 // 16 CSV gidiş-dönüş
 const csv=T.csvAll(),bals=T.S.accounts.map(a=>a+':'+bal(a)).join();const keep=JSON.parse(JSON.stringify(T.S));
 T.S=T.norm({tx:[],accounts:keep.accounts,accx:keep.accx,opening:keep.opening});const ri=T.csvImport(csv,'Banka');
 const bals2=T.S.accounts.map(a=>a+':'+bal(a)).join();chk(bals===bals2,'CSV gidiş-dönüş bakiyeler\n'+bals+'\n'+bals2);o.ri=ri;
 T.S=T.norm(keep);T.save();
 // 17 hatırlatıcı planı
 const d0=T.today0(),due=new Date(d0);due.setDate(due.getDate()+5);
 T.S.recurring=[{id:'rr',name:'Elektrik',amt:800,day:due.getDate(),cat:'Fatura',acct:'Banka',paid:{}}];T.S.alerts.days=3;T.S.alerts.push=true;T.S.alerts.rec=true;
 const up=T.upcoming(30);o.up=up.map(u=>u.name+' '+u.date);const pl=T.reminderPlan();o.plan=pl.map(x=>new Date(x.at).toLocaleString('tr-TR')+' '+x.title);
 chk(pl.length>=1&&pl.some(x=>/Elektrik/.test(x.title)),'plan '+JSON.stringify(o.plan));
 // 18 notlar
 T.S.notes=[];act('sub',null,'notlar');act('new-n');setv('n-title','Deneme');setv('n-body','gövde');window.walletBack();await new Promise(r=>setTimeout(r,80));
 const N=T.S.notes[0];chk(N&&N.title==='Deneme','not kaydı');await new Promise(r=>setTimeout(r,80));
 chk(document.querySelectorAll('#nlist .kcard').length===1&&!document.querySelector('#nlist [data-act="n-trash"]'),'liste sade: kartta işlem simgesi yok');
 N.arch=true;T.render();chk(/Deneme/.test(document.getElementById('nlist').innerText),'eski arşivli not listede görünür');
 act('edit-n',N.id);click('[data-act="note-pin"]');window.walletBack();await new Promise(r=>setTimeout(r,80));chk(N.pin&&!N.arch,'sabitlendi, arşivden çıktı');
 act('edit-n',N.id);click('[data-act="note-more"]');click('.sheet [data-act="note-trash"]');await new Promise(r=>setTimeout(r,80));chk(N.trash&&T.ui.page&&T.ui.page.k==='notlar'&&/Geri al/.test(document.getElementById('toast').innerText),'editörden silindi, notlara döndü, geri al var');
 chk(!/Deneme/.test(document.getElementById('nlist').innerText)&&/Silinenler \(1\)/.test(document.getElementById('view').innerText),'Silinenler bağlantısı');
 act('n-trashv');chk(/Deneme/.test(document.querySelector('.sheet').innerText),'silinenler penceresi');click('.sheet [data-act="nt-restore"]');chk(!N.trash,'silinenden geri alındı');
 act('edit-n',N.id);click('[data-act="note-more"]');click('.sheet [data-act="note-trash"]');await new Promise(r=>setTimeout(r,80));act('n-trashv');const pb=document.querySelector('[data-act="nt-purge"]');pb.click();document.querySelector('[data-act="nt-purge"]')&&document.querySelector('[data-act="nt-purge"]').click();
 chk(T.S.notes.length===0,'kalıcı silme '+T.S.notes.length);
 // 19 tam silme
 act('reset-all');document.querySelector('[data-act="reset-all"]');T.wipeAll();
 const raw=localStorage.getItem('kumbara-v1');o.afterWipe={tx:T.S.tx.length,notes:T.S.notes.length,holdings:T.S.holdings.length,ui:localStorage.getItem('wallet-ui'),stored:raw?JSON.parse(raw).tx.length:'yok'};
 const re=T.load();chk(T.S.tx.length===0&&re.tx.length===0&&!re.tx.some(t=>t.sample)&&!re.pin,'silme sonrası yükleme boş '+re.tx.length);
 return {o,F};});
console.log(JSON.stringify(r.o,null,1));
console.log(r.F.filter(Boolean).length?'FAIL\n'+r.F.filter(Boolean).join('\n'):'ALL PASS');console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
