// sesle ekleme: konuşma metninden tutar, tür ve kategori; pencere dolu açılır, kendiliğinden kaydetmez
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:360,height:780}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(()=>{const T=window.__T,F=[];const chk=(c,m)=>{if(!c)F.push(m);};
 const A=[['markete 250 lira',250],['250 TL benzin',250],['bir kahve 80 lira',80],['iki bin beş yüz lira kira',2500],['maaşım 45 bin lira yattı',45000],['1.250,50 TL fatura',1250.5],['yüz elli lira',150],
  ['on iki bin',12000],['iki buçuk bin lira',2500],['₺320 restoran',320],['elektrik faturası 1340',1340],['bin lira',1000],['hiç sayı yok',0],['3 milyon',3000000]];
 A.forEach(([t,v])=>{const g=T.voiceAmt(t);chk(Math.abs(g-v)<0.001,'tutar "'+t+'" → '+g+' (beklenen '+v+')');});
 let x=T.voiceParse('markete 250 lira');chk(x.type==='exp'&&x.cat==='Market'&&x.amt===250,'market gideri '+JSON.stringify(x));
 x=T.voiceParse('maaşım 45 bin lira yattı');chk(x.type==='inc'&&x.amt===45000,'maaş geliri '+JSON.stringify(x));
 x=T.voiceParse('ekmek aldım 15 lira');chk(x.type==='exp','"aldım" gider sayılır');
 const n0=T.S.tx.length;T.voiceDone('benzin 1.500 lira');
 const s=document.querySelector('#sheet-root');chk(/Sesle eklenen/.test(s.innerText),'pencere açıldı');chk(document.getElementById('f-amt').value.replace(/\D/g,'')==='1500','tutar dolu: '+document.getElementById('f-amt').value);
 chk(/benzin/i.test(document.getElementById('f-note').value),'not dolu');chk(T.S.tx.length===n0,'kendiliğinden kaydetmedi');
 chk(/Duyulan/.test(document.getElementById('f-err').innerText),'duyulan metin gösterildi');
 window.walletVoice('','iptal');chk(true,'');
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
