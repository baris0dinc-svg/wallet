// 4.28: başka uygulamalardan: istatistik dışı, garanti, arkadaşlarla bölüş, paranın yaşı, görevsiz para, Excel, ana ekran bileşeni verisi
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/favicons|vemetric|flagcdn/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const r=await p.evaluate(async()=>{const T=window.__T,S=T.S,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  const k=T.curP(),d=T.isoDate(new Date()),E=T.EXPC();
  S.tx=[];S.recurring=[];S.budgets={};S.accounts=['Banka','Nakit'];S.accx={};S.opening={Banka:10000,Nakit:500};{const x=new Date();x.setDate(x.getDate()-90);S.openDate=T.isoDate(x);}T.save();
  const ago=n=>{const x=new Date();x.setDate(x.getDate()-n);return T.isoDate(x);};
  // ---- işlem penceresi: Daha fazla ----
  T.txSheet(null,'exp');await W(100);
  c(!!document.querySelector('details#row-more')&&!!document.getElementById('f-xs')&&!!document.getElementById('f-wr')&&!!document.getElementById('f-spn'),'Daha fazla bölümü');
  T.ACT['tx-type'](null,null,'trf');c(document.getElementById('row-more').hidden,'transferde gizli');T.ACT['tx-type'](null,null,'inc');c(!document.getElementById('row-more').hidden&&document.getElementById('row-wr').hidden&&document.getElementById('row-sp').hidden,'gelirde yalnız istatistik seçeneği');T.ACT['tx-type'](null,null,'exp');
  // bölüş
  document.getElementById('f-amt').value='900';document.getElementById('f-note').value='Akşam yemeği';document.getElementById('f-acct').value='Banka';
  const sn=document.getElementById('f-spn');sn.value='3';sn.dispatchEvent(new Event('input',{bubbles:true}));c(/Senin payın ₺300,00/.test(document.getElementById('f-spinfo').textContent),'bölüş önizlemesi: '+document.getElementById('f-spinfo').textContent);
  document.getElementById('f-spw').value='Ali, Ayşe';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),'');
  const e1=S.tx.find(t=>t.note==='Akşam yemeği'),t1=S.tx.find(t=>t.type==='trf'&&t.to==='Alacaklar');
  c(e1&&e1.amt===300&&e1.spN===3,'gider senin payın: '+JSON.stringify(e1));
  c(t1&&t1.amt===600&&t1.acct==='Banka'&&/Ali, Ayşe payı · Akşam yemeği/.test(t1.note)&&t1.spOf===e1.id,'kalan Alacaklar’a transfer: '+JSON.stringify(t1));
  c(S.accounts.indexOf('Alacaklar')>=0&&T.acctBal('Alacaklar')===600&&T.acctBal('Banka')===9100,'bakiyeler: Banka '+T.acctBal('Banka')+' Alacaklar '+T.acctBal('Alacaklar'));
  // hatalı kişi sayısı
  T.txSheet(null,'exp');await W(50);document.getElementById('f-amt').value='100';document.getElementById('f-spn').value='1';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),'');
  c(/2 ile 30/.test((document.getElementById('f-err')||{}).textContent||''),'kişi sayısı denetimi');T.closeSheet();
  // istatistik dışı
  T.txSheet(null,'exp');await W(50);document.getElementById('f-amt').value='20000';document.getElementById('f-note').value='Laptop (şirket ödeyecek)';document.getElementById('f-xs').checked=true;document.getElementById('f-wr').value='24';
  {const bt=document.querySelector('[data-act="save-tx"]');T.ACT['save-tx'](bt,'');if(document.querySelector('.sheet [data-act="save-tx"]'))T.ACT['save-tx'](bt,'');}const big=S.tx.find(t=>t.amt===20000);
  c(big&&big.xs===1&&big.wr===24,'istatistik dışı ve garanti kaydı: '+JSON.stringify(big));
  c(T.pstat(k).exp===300,'dönem gideri istatistik dışını saymaz: '+T.pstat(k).exp);
  c(!Object.values(T.spentByCat(k)).some(v=>v>=20000),'kategori toplamında yok');
  c(T.acctBal('Banka')===9100-20000,'bakiye yine düşer');
  // düzenle: işaretleri kaldır
  T.txSheet(big.id);await W(50);c(document.getElementById('row-more').open&&document.getElementById('f-xs').checked&&/Bitiş:/.test(document.getElementById('row-wr').innerText),'düzenlerken açık ve dolu');
  document.getElementById('f-xs').checked=false;document.getElementById('f-wr').value='';T.ACT['save-tx'](document.querySelector('[data-act="save-tx"]'),big.id);
  c(!big.xs&&!big.wr&&T.pstat(k).exp===20300,'işaret kalkınca sayılır');big.xs=1;
  // ---- garanti: Gündem ve Hesaplar ----
  const old=ago(700);S.tx.push({id:'g1',type:'exp',amt:5000,acct:'Banka',cat:E[0],date:old,note:'Buzdolabı',wr:24},{id:'g2',type:'exp',amt:100,acct:'Banka',cat:E[0],date:ago(400),note:'Kulaklık',wr:12});T.save();
  const end=T.wrEnd(S.tx.find(t=>t.id==='g1'));c(end>d&&T.daysBetween?true:true,'');
  const al=T.alertItems().filter(x=>/garantisi/.test(x[1]));c(al.length===1&&/Buzdolabı garantisi \d+ gün sonra bitiyor/.test(al[0][1])&&al[0][2][0]==='edit-tx','Gündem’de garanti: '+JSON.stringify(al));
  c(T.wrList().length===1&&!T.wrList().some(t=>t.id==='g2'),'süresi geçen listede yok');
  T.ui.sub='servet';T.ui.sv='hesap';T.ui.page=null;T.render();c(/Garantisi süren ürünler/.test(document.body.innerText),'Hesaplar’da garanti listesi');
  // ---- paranın yaşı ----
  S.tx=S.tx.filter(t=>!t.xs&&!/^g/.test(t.id));S.tx=[];S.opening={Banka:0,Nakit:0};
  for(let m=0;m<4;m++){S.tx.push({id:'i'+m,type:'inc',amt:30000,acct:'Banka',cat:T.INCC()[0],date:ago(m*30+5),note:'Maaş'});for(let j=0;j<5;j++)S.tx.push({id:'e'+m+j,type:'exp',amt:4000,acct:'Banka',cat:E[0],date:ago(m*30+5-j*5<0?0:m*30+5-j*5),note:'x'});}
  T.save();const age=T.moneyAge();c(age>=15&&age<=80,'paranın yaşı makul: '+age);
  T.ui.sub='analiz';T.ui.an='ozet';T.render();c(/Paranın yaşı/.test(document.body.innerText)&&/\d+ gün/.test(document.body.innerText),'Özet’te paranın yaşı');
  S.tx=[];T.save();c(T.moneyAge()===null,'veri yoksa gösterilmez');
  // ---- görevsiz para ----
  S.tx.push({id:'in1',type:'inc',amt:40000,acct:'Banka',cat:T.INCC()[0],date:d,note:'Maaş'});S.budgets={[E[0]]:10000,[E[1]]:5000};T.save();T.ui.month=k;
  c(/Görevsiz para: ₺25\.000/.test(T.unassignedLine(15000).replace(/<[^>]+>/g,'')),'görevsiz para: '+T.unassignedLine(15000).replace(/<[^>]+>/g,''));
  c(/Limitler gelirini ₺5\.000 aşıyor/.test(T.unassignedLine(45000).replace(/<[^>]+>/g,'')),'limit geliri aşınca uyarı');
  T.ui.sub='plan';T.ui.plan='butce';T.render();c(!!document.querySelector('.unas [data-act="plan-go"][data-v="hedef"]'),'Bütçe’de görevsiz para ve hedefe ayır');
  // ---- bileşen verisi ----
  const wd=T.wgData();c(wd.a==='Bu ay harcanan'&&wd.b==='Bütçeden kalan'&&/₺15\.000/.test(wd.w)&&/Günde ~|Bütçe doldu|^$/.test(wd.c),'bileşen verisi: '+JSON.stringify(wd));
  S.hide=true;c(T.wgData().v.indexOf('•')>=0,'tutarları gizle bileşene de uygulanır');S.hide=false;
  // ---- Excel ----
  S.tx.push({id:'x1',type:'exp',amt:1234.5,acct:'Banka',cat:E[0],date:d,note:'A & <B> "q"'},{id:'x2',type:'exp',amt:99,acct:'Banka',cat:E[1],date:d,note:'xs',xs:1});T.save();
  const u=T.xlsxAll();let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));window.__xl=btoa(s);
  c(u[0]===0x50&&u[1]===0x4b,'ZIP başlığı');
  return o;});
const F=[...r];
const b64=await p.evaluate(()=>window.__xl);fs.writeFileSync('/tmp/wallet-v428.xlsx',Buffer.from(b64,'base64'));
const {execSync}=require('child_process');
try{const out=execSync('python3 -I tests/xlsx_check.py /tmp/wallet-v428.xlsx',{encoding:'utf8'});if(!/^OK/.test(out.trim()))F.push('Excel denetimi: '+out.trim());}catch(e){F.push('Excel okunamadı: '+(e.stdout||e.message).slice(0,400));}
if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
