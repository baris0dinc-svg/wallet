// 4.12: haftalık düzenli ödeme, alt kategori ve simge, fiş fotoğrafı, bulut yedeği (GitHub Gist, sahte sunucu), mevduat/fon/birikim getirisi
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780},hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
/* sahte GitHub API: gist bellekte tutulur */
const G={gists:{},calls:[],user:{login:'deneme'}};
await p.route('https://api.github.com/**',async route=>{const req=route.request(),u=new URL(req.url()),m=req.method(),auth=req.headers()['authorization']||'';G.calls.push(m+' '+u.pathname);
  const J=(st,o)=>route.fulfill({status:st,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,POST,PATCH'}});
  if(!/^Bearer gh[p]_[A-Za-z0-9]{20,}/.test(auth))return J(401,{message:'Bad credentials'});
  if(u.pathname==='/user')return J(200,G.user);
  if(u.pathname==='/gists'&&m==='GET')return J(200,Object.values(G.gists));
  if(u.pathname==='/gists'&&m==='POST'){const bd=JSON.parse(req.postData());const id='g'+(Object.keys(G.gists).length+1);G.gists[id]={id,public:bd.public,description:bd.description,files:{'wallet-yedek.json':{content:bd.files['wallet-yedek.json'].content,truncated:false}},updated_at:new Date().toISOString()};return J(201,G.gists[id]);}
  const mm=/^\/gists\/(\w+)$/.exec(u.pathname);if(mm){const g=G.gists[mm[1]];if(!g)return J(404,{message:'Not Found'});
    if(m==='PATCH'){const bd=JSON.parse(req.postData());g.files['wallet-yedek.json'].content=bd.files['wallet-yedek.json'].content;g.updated_at=new Date().toISOString();return J(200,g);}return J(200,g);}
  return J(404,{message:'Not Found'});});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const F=[];const chk=(c,m)=>{if(!c)F.push(m);};
const ev=f=>p.evaluate(f);
const fx=await ev(()=>JSON.parse(JSON.stringify(window.__T.S.fx)));
// ---------- ana sayfa ----------
let r=await ev(()=>{const T=window.__T;T.ui.sub='ev';T.ui.page=null;T.render();return {card:!!document.querySelector('.addcard,.addmain'),mic:!!document.querySelector('header [data-act="voice"]'),qa:!!document.querySelector('#qa [data-act="qa-inc"]')};});
chk(!r.card,'İşlem ekle kartı kalkmalı');chk(!r.mic,'başlıkta mikrofon yok (4.15)');chk(r.qa,'Gelir düğmesi duruyor');
// ---------- haftalık düzenli ödeme ----------
r=await ev(fx=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};
  T.S=T.norm({fx,accounts:['Banka'],opening:{Banka:20000},openD:{Banka:T.addD(T.todayS(),-60)},tx:[],recurring:[]});T.save();
  const k=T.curP(),st=T.pStart(k);
  const r={id:'w1',name:'Harçlık',amt:500,day:+st.slice(8,10),cat:'Diğer',acct:'Banka',every:1,wk:1,start:st,paid:{}};T.S.recurring.push(r);T.save();
  const q=T.occs(r,k);c(q.length>=4&&q.length<=5,'dönemde 4-5 haftalık ödeme '+q.length);c(q.every((d,i)=>i===0||T.daysBetween(q[i-1],d)===7),'7 gün arayla');
  c(Math.abs(T.recMonthly(r)-500*52/12)<0.01,'aylık karşılığı 52/12');c(T.recDue(k).tot===500*q.length,'dönemde ödenecek tüm haftalar '+T.recDue(k).tot);
  c(T.recFq(r).indexOf('her ')===0,'sıklık metni '+T.recFq(r));
  T.payRec(r,q[0]);c(T.recPaid(r,q[0])&&!T.recPaid(r,q[1]||'x'),'yalnız o hafta ödendi');c(T.acctBal('Banka')===19500,'bakiye düştü '+T.acctBal('Banka'));
  c(T.recShow(r,k)===q[1],'listede sıradaki hafta');
  /* adı geçen işlem en yakın haftaya bağlanır */
  if(q[1]){const t={id:'m1',type:'exp',amt:500,cat:'Diğer',acct:'Banka',date:T.addD(q[1],1),note:'harçlık'};T.S.tx.push(t);const m=T.recMatch(t);c(m&&m.r===r&&m.k===q[1]&&m.n===2,'haftalık eşleşme '+JSON.stringify(m&&[m.k,m.n]));}
  /* 2 haftada bir, 3 kez */
  const r2={id:'w2',name:'Temizlik',amt:800,day:1,cat:'Diğer',acct:'Banka',every:1,wk:2,start:T.addD(st,-14),n:3,paid:{}};T.S.recurring.push(r2);
  const q2=T.occs(r2,k);c(q2.length>=1&&q2.length<=2&&T.daysBetween(r2.start,q2[0])===14,'2 haftada bir '+q2.join(','));c(T.recNo(r2,q2[0])===2,'kaçıncı ödeme');
  /* yaklaşanlar ve Gündem: haftalık oluşum anahtarı */
  const up=T.upcoming(40).filter(u=>u.id==='w1');c(up.length>=3&&up.every(u=>u.per===u.date),'yaklaşan haftalık ödemeler '+up.length);
  /* Gündem Ödendi düğmesi o haftayı öder */
  const un=up[0];T.ACT['al-pay'](null,'w1',un.per);c(T.recPaid(r,un.per),'Gündemden ödendi');
  /* takvim işaretleri */
  T.ui.month=k;return o;},fx);F.push(...r);
/* form: haftalık seçilince ay günü ve ilk ay alanları gizlenir */
r=await ev(()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};T.rSheet();const sel=document.getElementById('r-every');sel.value='w1';sel.dispatchEvent(new Event('change',{bubbles:true}));
  c(document.getElementById('row-rday').hidden&&document.getElementById('row-rstart').hidden&&!document.getElementById('row-rstartd').hidden,'haftalık alanları');
  const sd=document.getElementById('r-startd');sd.value=T.todayS();sd.dispatchEvent(new Event('change',{bubbles:true}));c(/^Her (pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar)$/.test(document.getElementById('r-wd').textContent),'gün adı '+document.getElementById('r-wd').textContent);
  document.getElementById('r-name').value='Pazar alışverişi';document.getElementById('r-amt').value='750';T.ACT['save-r'](document.querySelector('[data-act="save-r"]'),'');
  const r=T.S.recurring.filter(x=>x.name==='Pazar alışverişi')[0];c(r&&r.wk===1&&r.start===T.todayS()&&r.every===1,'haftalık kalem kaydı '+JSON.stringify(r));
  /* liste: düğme o haftanın anahtarını taşır */
  T.ui.sub='plan';T.ui.plan='duzenli';T.ui.page=null;T.render();const bt=document.querySelector('[data-act="rpay"][data-id="'+r.id+'"]');c(bt&&bt.dataset.v&&bt.dataset.v.length===10,'listede haftalık ödeme düğmesi');
  c(/her /.test(document.body.innerText),'listede sıklık');
  /* haftalıktan aylığa geçince eski haftalık işaretler temizlenir */
  T.payRec(r,bt.dataset.v);T.rSheet(r.id);const s2=document.getElementById('r-every');s2.value='1';s2.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('r-day').value='5';T.ACT['save-r'](document.querySelector('[data-act="save-r"]'),r.id);
  c(!r.wk&&Object.keys(r.paid).every(x=>x.length===7),'aylığa geçiş '+JSON.stringify(r.paid));return o;});F.push(...r);
// ---------- alt kategori ve simge ----------
r=await ev(fx=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};
  T.S=T.norm({fx,accounts:['Banka'],opening:{Banka:5000},tx:[]});T.save();
  c(T.subsOf('Fatura').indexOf('Elektrik')>=0,'varsayılan alt kategoriler');c(T.catIcKey('Market')==='cart'&&T.catIcKey('Yeme-İçme')==='food'&&T.catIcKey('Kira')==='home','addan simge');
  T.txSheet(null,'exp');T.ACT['cat-pick'](null,null,'Fatura');const sc=document.querySelectorAll('#f-subchips [data-act="sub-pick"]');c(sc.length>=5,'Fatura alt kategori çipleri '+sc.length);
  T.ACT['sub-pick'](null,null,'Elektrik');document.getElementById('f-amt').value='850';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),'');
  const t=T.S.tx[T.S.tx.length-1];c(t.cat==='Fatura'&&t.sub==='Elektrik','işlemde alt kategori '+JSON.stringify(t));
  T.ui.sub='islem';T.ui.page=null;T.render();c(/Elektrik/.test(document.getElementById('txlist').innerText),'listede alt kategori');c(!!document.querySelector('#txlist .cic svg'),'listede kategori simgesi');
  T.ui.tq='elektrik';T.render();c(document.querySelectorAll('#txlist [data-act="edit-tx"]').length===1,'aramada alt kategori');T.ui.tq='';
  /* kategori değişince alt kategori düşer */
  T.txSheet(t.id);T.ACT['cat-pick'](null,null,'Market');c(document.getElementById('f-sub').value==='','başka kategoride alt kategori sıfırlanır');T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),t.id);c(!t.sub&&t.cat==='Market','alt kategori silindi');
  /* yeni alt kategori işlem penceresinden */
  T.txSheet(null,'exp');T.ACT['cat-pick'](null,null,'Eğlence');T.ACT['sub-new-in']();document.getElementById('ns-in').value='Konser';T.ACT['sub-new-ok']();c(T.subsOf('Eğlence').indexOf('Konser')>=0&&document.getElementById('f-sub').value==='Konser','pencereden alt kategori');
  document.getElementById('f-amt').value='600';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),'');
  /* kategori penceresi: simge, alt kategori ekle/sil, yeniden adlandırma taşır */
  T.catMenu('Eğlence','exp');c(document.querySelectorAll('.icpick').length>=20,'simge seçenekleri');T.ACT['cat-ic'](null,'Eğlence','music');c(T.catIcKey('Eğlence')==='music','simge seçildi');
  document.getElementById('ns-add').value='Tiyatro';T.ACT['sub-add'](null,'Eğlence','exp');c(T.subsOf('Eğlence').indexOf('Tiyatro')>=0,'alt kategori eklendi');
  T.ACT['sub-del'](null,'Eğlence','Tiyatro');c(T.subsOf('Eğlence').indexOf('Tiyatro')<0,'alt kategori silindi');
  T.catMenu('Eğlence','exp');document.getElementById('cr-name').value='Hobi';T.ACT['cat-ren'](null,'Eğlence','exp');c(T.subsOf('Hobi').indexOf('Konser')>=0&&T.catIcKey('Hobi')==='music'&&!T.S.subs['Eğlence'],'ad değişince alt kategori ve simge taşınır');
  /* Analiz: kategori penceresinde alt kategori kırılımı */
  T.S.tx.push({id:'x2',type:'exp',amt:400,cat:'Hobi',acct:'Banka',date:T.todayS()});T.save();T.ui.month=T.curP();T.catSheet('Hobi');c(/Konser/.test(document.querySelector('.subbrk').innerText)&&/Alt kategorisiz/.test(document.querySelector('.subbrk').innerText),'alt kategori kırılımı');
  T.closeSheet&&T.closeSheet();return o;},fx);F.push(...r);
// ---------- fiş fotoğrafı ----------
r=await ev(async fx=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  T.S=T.norm({fx,accounts:['Banka'],opening:{Banka:5000},tx:[]});T.save();
  const pick=async()=>{const cv=document.createElement('canvas');cv.width=3000;cv.height=2000;const x=cv.getContext('2d');x.fillStyle='#c33';x.fillRect(0,0,3000,2000);x.fillStyle='#fff';x.fillText('FIŞ',100,100);
    const bl=await new Promise(r=>cv.toBlob(r,'image/png'));const f=new File([bl],'fis.png',{type:'image/png'}),dt=new DataTransfer();dt.items.add(f);const inp=document.getElementById('rc-file');inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));
    for(let i=0;i<40&&!(document.getElementById('rc-img')&&document.getElementById('rc-img').src);i++)await W(100);};
  T.txSheet(null,'exp');c(!!document.getElementById('rc-file'),'fotoğraf ekle düğmesi');await pick();c(!!document.getElementById('rc-img')&&/^blob:/.test(document.getElementById('rc-img').src),'önizleme');
  document.getElementById('f-amt').value='320';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),'');const t=T.S.tx[T.S.tx.length-1];c(t.rc===1,'işlemde fotoğraf işareti');
  await W(300);const db=await new Promise(r=>{const q=indexedDB.open('wallet-media');q.onsuccess=()=>r(q.result);});
  const rec=await new Promise(r=>{const g=db.transaction('rc').objectStore('rc').get(t.id);g.onsuccess=()=>r(g.result);});c(rec&&rec.b&&rec.b.type==='image/jpeg'&&rec.b.size<600000,'küçültülmüş JPEG saklandı '+(rec&&rec.b&&rec.b.size));
  const bmp=await createImageBitmap(rec.b);c(Math.max(bmp.width,bmp.height)===1600,'en uzun kenar 1600 '+bmp.width+'x'+bmp.height);
  c(!/"rc":1.*data:image|blob:/.test(T.exportJson()),'yedekte fotoğraf verisi yok');
  T.ui.sub='islem';T.ui.page=null;T.render();c(!!document.querySelector('#txlist .rcm'),'listede fotoğraf işareti');
  T.txSheet(t.id);for(let i=0;i<30&&!(document.getElementById('rc-img')&&document.getElementById('rc-img').src);i++)await W(100);c(/^blob:/.test(document.getElementById('rc-img').src),'kayıtlı fotoğraf açılır');
  T.ACT['rc-view']();c(!!document.getElementById('rcview'),'büyük görünüm');T.ACT['rc-close']();
  T.ACT['rc-rm']();T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),t.id);await W(300);c(!t.rc,'fotoğraf kaldırıldı');
  const gone=await new Promise(r=>{const g=db.transaction('rc').objectStore('rc').get(t.id);g.onsuccess=()=>r(g.result);});c(!gone,'depodan da silindi');
  /* yetim fotoğraf temizliği ve fotoğraf yedeği içe aktarma */
  T.txSheet(null,'exp');await pick();document.getElementById('f-amt').value='99';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),'');const t2=T.S.tx[T.S.tx.length-1];await W(300);
  const url=await new Promise(r=>{const g=db.transaction('rc').objectStore('rc').get(t2.id);g.onsuccess=()=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(g.result.b);};});
  T.S.tx=T.S.tx.filter(x=>x.id!==t2.id);T.save();const n=await T.rcGc();c(n===1,'yetim fotoğraf temizlendi '+n);
  T.S.tx.push(Object.assign({},t2,{rc:undefined}));T.save();T.rcImport(JSON.stringify({walletMedia:1,items:{[t2.id]:url}}));await W(400);c(T.S.tx.find(x=>x.id===t2.id).rc===1,'fotoğraf yedeği yüklendi');
  T.closeSheet&&T.closeSheet();return o;},fx);F.push(...r);
// ---------- bulut yedeği ----------
r=await ev(async fx=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  T.S=T.norm({fx,accounts:['Banka'],opening:{Banka:5000},tx:[{id:'c1',type:'exp',amt:123,cat:'Market',acct:'Banka',date:T.todayS(),note:'gizli-not-xyz'}]});T.save();
  T.openPage({k:'set',s:'veri'},'ayar-veri');await W(100);c(!!document.querySelector('[data-act="cl-link"]'),'bulut bağlama formu');
  document.getElementById('cl-tok').value='kotu';T.ACT['cl-link'](document.querySelector('[data-act="cl-link"]'));c(/Anahtarı tam/.test(document.getElementById('f-cl').textContent),'geçersiz anahtar uyarısı');
  document.getElementById('cl-tok').value='ghp_'+'a'.repeat(36);document.getElementById('cl-pw1').value='sifre123';document.getElementById('cl-pw2').value='sifre123';
  T.ACT['cl-link'](document.querySelector('[data-act="cl-link"]'));for(let i=0;i<60&&!(T.S.cloud&&T.S.cloud.gid);i++)await W(100);
  c(T.S.cloud&&T.S.cloud.gid==='g1'&&T.S.cloud.login==='deneme'&&T.S.bkKey,'bağlandı ve ilk yedek '+JSON.stringify(T.S.cloud));
  c(T.exportJson().indexOf('ghp_')<0,'anahtar yedeğe yazılmaz');
  return o;},fx);F.push(...r);
let gist=await ev(()=>0);/* sunucudaki içerik şifreli mi */
{const g=G.gists.g1;chk(g&&g.public===false,'gist gizli');const ct=g&&g.files['wallet-yedek.json'].content;chk(ct&&/"wallet":1/.test(ct)&&ct.indexOf('gizli-not-xyz')<0,'buluttaki içerik şifreli');}
r=await ev(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  c(!T.clDue||true,'');T.S.tx.push({id:'c2',type:'exp',amt:55,cat:'Market',acct:'Banka',date:T.todayS(),note:'ikinci'});T.save();
  c(T.clDue(),'değişiklik sonrası yükleme bekliyor');const ok=await T.clPush(true);c(ok&&!T.clDue()&&T.S.cloud.ts>0,'yüklendi');
  /* buluttan geri yükle: yerel veriyi boz, iki dokunuşla geri gelir */
  T.S.tx=T.S.tx.filter(x=>x.id!=='c2');T.save();T.openPage({k:'set',s:'veri'},'ayar-veri');await W(100);
  const bt=()=>document.querySelector('[data-act="cl-pull"]');T.ACT['cl-pull'](bt());for(let i=0;i<50&&!bt().dataset.armed;i++)await W(100);c(!!bt().dataset.armed,'ilk dokunuş özet gösterir '+document.getElementById('f-cl').textContent);
  T.ACT['cl-pull'](bt());await W(100);c(T.S.tx.some(x=>x.id==='c2')&&T.S.cloud&&T.S.cloud.gid==='g1','buluttan geri yüklendi, bağlantı korunur');
  return o;});F.push(...r);
/* yeni cihaz: bulutta yedek varken bağlanınca üzerine yazılmaz (bekler) ve şifreyle geri yüklenir */
r=await ev(async fx=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  T.S=T.norm({fx,accounts:['Nakit'],opening:{Nakit:10},tx:[{id:'n1',type:'exp',amt:1,cat:'Market',acct:'Nakit',date:T.todayS()}]});T.save();
  T.openPage({k:'set',s:'veri'},'ayar-veri');await W(100);
  document.getElementById('cl-tok').value='ghp_'+'b'.repeat(36);document.getElementById('cl-pw1').value='sifre123';document.getElementById('cl-pw2').value='sifre123';
  T.ACT['cl-link'](document.querySelector('[data-act="cl-link"]'));for(let i=0;i<60&&!(T.S.cloud&&T.S.cloud.gid);i++)await W(100);
  c(T.S.cloud&&T.S.cloud.gid==='g1'&&T.S.cloud.hold===true&&!T.clDue(),'var olan yedek beklemede '+JSON.stringify(T.S.cloud));
  const bt=()=>document.querySelector('[data-act="cl-pull"]');T.ACT['cl-pull'](bt());for(let i=0;i<60&&!bt().dataset.armed;i++)await W(100);c(!!bt().dataset.armed,'farklı tuzlu yedek, bağlarken girilen şifreyle açılır '+document.getElementById('f-cl').textContent);
  T.ACT['cl-pull'](bt());await W(100);c(T.S.tx.some(x=>x.id==='c2')&&!T.S.cloud.hold,'yeni cihaza geri yüklendi');
  T.S.cloud.tok='gho_'+'z'.repeat(36);T.S.tx.push({id:'c3',type:'exp',amt:5,cat:'Market',acct:'Banka',date:T.todayS()});T.save();const ok=await T.clPush(true);c(!ok&&/geçersiz/.test(T.S.cloud.err||''),'geçersiz anahtar hatası '+T.S.cloud.err);
  T.ACT['cl-off'](document.createElement('button'));const b2=document.createElement('button');b2.dataset.armed='1';T.ACT['cl-off'](b2);c(!T.S.cloud,'bağlantı kaldırıldı');
  return o;},fx);F.push(...r);
// ---------- mevduat, fon, birikim hesabı ----------
r=await ev(fx=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const near=(a,b,e)=>Math.abs(a-b)<=(e||0.6);
  const t0=T.todayS(),d10=T.addD(t0,-10),d40=T.addD(t0,-40),d365=T.addD(t0,-365);
  T.S=T.norm({fx,accounts:['Banka'],opening:{Banka:5000},tx:[],holdings:[
    {id:'h1',name:'Vadeli',type:'Mevduat',kind:'inv',ccy:'',qty:1,cost:100000,price:100000,yr:40,yd:d10,vd:32,tax:'',roll:true},
    {id:'h2',name:'Vadeli 2',type:'Mevduat',kind:'inv',ccy:'',qty:1,cost:100000,price:100000,yr:40,yd:d40,vd:32,tax:'',roll:true},
    {id:'h3',name:'Vadeli 3',type:'Mevduat',kind:'inv',ccy:'',qty:1,cost:100000,price:100000,yr:40,yd:d40,vd:32,tax:'',roll:false},
    {id:'h4',name:'Para piyasası',type:'Fon',kind:'inv',ccy:'',qty:1000,cost:10,price:10,yr:30,yd:d365},
    {id:'h5',name:'Günlük',type:'Mevduat',kind:'inv',ccy:'',qty:1,cost:50000,price:50000,yr:36.5,yd:d10,vd:0,tax:0}]});T.save();
  const n=1-0.175;
  c(near(T.hVal(T.S.holdings[0]),100000*(1+0.4*n*10/365)),'vadeli 10 gün '+T.hVal(T.S.holdings[0]));
  c(near(T.hVal(T.S.holdings[1]),100000*(1+0.4*n*32/365)*(1+0.4*n*8/365)),'vade yenilendi '+T.hVal(T.S.holdings[1]));
  c(near(T.hVal(T.S.holdings[2]),100000*(1+0.4*n*32/365)),'yenilenmeyen ilk vadede durur '+T.hVal(T.S.holdings[2]));
  c(near(T.hVal(T.S.holdings[3]),13000,1),'fon yıllık %30 '+T.hVal(T.S.holdings[3]));
  c(near(T.hVal(T.S.holdings[4]),50000*Math.pow(1+0.365/365,10)),'günlük faiz bileşik '+T.hVal(T.S.holdings[4]));
  c(T.wealth().g.inv>T.pfTotals('inv').c,'net servete faiz dahil');
  /* stopaj vadeye göre: 6 aya kadar, 1 yıla kadar, daha uzun */
  c(T.depTax(32)===T.FACTS.dep.t6&&T.depTax(270)===T.FACTS.dep.t12&&T.depTax(400)===T.FACTS.dep.t12p,'stopaj kademeleri');
  /* kart ve Gündem */
  T.ui.sub='servet';T.ui.sv='yatirim';T.ui.page=null;T.render();c(/net faiz/.test(document.body.innerText)&&/vade sonu/.test(document.body.innerText),'yatırım kartında faiz satırı');
  c(T.alertItems().some(x=>/Vadeli 3: vade \d+ gün önce doldu/.test(x[1])),'yenilenmeyen vade uyarısı');
  /* satışta birikim fiyata katılır */
  const h2=T.S.holdings[1],v2=T.hVal(h2);T.yCrys(h2);c(near(T.hVal(h2),v2,0.01)&&h2.yd===t0,'birikim fiyata katıldı');
  /* form: mevduat alanları */
  T.hSheet('h1');c(!document.getElementById('row-yield').hidden&&!document.getElementById('row-dep').hidden,'mevduat alanları görünür');
  const ty=document.getElementById('h-type');ty.value='Hisse';ty.dispatchEvent(new Event('change',{bubbles:true}));c(document.getElementById('row-yield').hidden,'hissede gizli');
  ty.value='Mevduat';ty.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('h-yr').value='45';document.getElementById('h-vd').value='92';T.ACT['save-h'](null,'h1','inv');
  const h1=T.S.holdings[0];c(h1.yr===45&&h1.vd===92&&h1.tax==='','form kaydı '+JSON.stringify(h1));
  T.hSheet('h1');document.getElementById('h-yr').value='';T.ACT['save-h'](null,'h1','inv');c(!h1.yr&&!h1.yd,'oran silinince getiri kapanır');
  /* birikim hesabı: ay sonunda faiz geliri */
  const cm=T.curP().slice(0,7),pm=T.addMonth(T.todayS().slice(0,7),-1),pm2=T.addMonth(pm,-1);
  T.S=T.norm({fx,accounts:['Birikim'],accx:{Birikim:{type:'birikim',rate:40,rateFrom:pm2+'-01'}},opening:{Birikim:100000},openD:{Birikim:pm2+'-01'},tx:[]});T.save();
  const k=T.yieldPost();const it=T.S.tx.filter(x=>x.auto==='int');c(k===2&&it.length===2,'iki ayın faizi işlendi '+k);
  const dim=m=>new Date(+m.slice(0,4),+m.slice(5,7),0).getDate();
  c(near(it[0].amt,100000*0.4/365*dim(pm2)*n,0.05),'ilk ay faizi '+it[0].amt);
  c(near(it[1].amt,(100000+it[0].amt)*0.4/365*dim(pm)*n,0.05),'ikinci ay bileşik '+it[1].amt);
  c(it[0].cat==='Yatırım getirisi'&&it[0].sub==='Faiz'&&it[1].date===pm+'-'+String(dim(pm)).padStart(2,'0'),'kategori ve ay sonu tarihi');
  c(T.yieldPost()===0,'aynı ay iki kez işlenmez');
  c(T.aIntNow('Birikim')>0,'bu ay biriken gösterilir');
  T.acctSheet('Birikim');c(/bu ay ≈/.test(document.querySelector('.sheet').innerText),'hesap penceresinde biriken faiz');
  return o;},fx);F.push(...r);
if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
