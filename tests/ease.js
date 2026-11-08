// kullanım kolaylığı: sık eklenenler, not önerisi ve kategori, kaydettikten sonra geri al, kısayollar
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:780},hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const chk=(c,m)=>{if(!c)F.push(m);};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));const fx=JSON.parse(JSON.stringify(T.S.fx));
 const d=k=>{const x=new Date();x.setDate(x.getDate()-k);return T.isoDate(x);};
 T.S=T.norm({fx,accounts:['Nakit','Banka'],opening:{Nakit:1000,Banka:5000},tx:[
  {id:'a1',type:'exp',amt:650,cat:'Ulaşım',acct:'Nakit',date:d(40),note:'Akbil'},{id:'a2',type:'exp',amt:650,cat:'Ulaşım',acct:'Nakit',date:d(10),note:'Akbil'},
  {id:'k1',type:'exp',amt:80,cat:'Yeme-İçme',acct:'Banka',date:d(3),note:'Kahve'},{id:'k2',type:'exp',amt:80,cat:'Yeme-İçme',acct:'Banka',date:d(2),note:'Kahve'},{id:'k3',type:'exp',amt:80,cat:'Yeme-İçme',acct:'Banka',date:d(1),note:'kahve '},
  {id:'o1',type:'exp',amt:300,cat:'Market',acct:'Banka',date:d(200),note:'Eski'},{id:'o2',type:'exp',amt:300,cat:'Market',acct:'Banka',date:d(190),note:'Eski'},
  {id:'t1',type:'trf',amt:100,acct:'Banka',to:'Nakit',cat:'Transfer',date:d(5)},{id:'t2',type:'trf',amt:100,acct:'Banka',to:'Nakit',cat:'Transfer',date:d(4)},
  {id:'m1',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:d(35),note:'Maaş'},{id:'m2',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:d(5),note:'Maaş'}]});T.save();
 T.ui.sub='ev';T.ui.page=null;T.render();
 const fq=T.freqTx(6);chk(fq.length===3&&fq[0].t.note.trim().toLowerCase()==='kahve'&&fq[0].n===3,'sık eklenenler sırası '+fq.map(x=>x.t.note+':'+x.n));
 chk(!fq.some(x=>x.t.note==='Eski')&&!fq.some(x=>x.t.type==='trf'),'eski ve transfer hariç');
 const chips=$$('.favs:not(.insheet) .fav');chk(chips.length===3,'ana sayfada 3 sık eklenen');
 const n0=T.S.tx.length,b0=T.acctBal('Banka');chips[0].click();chk(T.S.tx.length===n0+1&&T.S.tx[n0].date===T.todayS()&&T.S.tx[n0].amt===80&&Math.abs(T.acctBal('Banka')-(b0-80))<0.01,'tek dokunuşla bugüne eklendi');
 chk(/Geri al/.test($('#toast').innerText),'geri al düğmesi');$('#toast [data-act="undo"]').click();chk(T.S.tx.length===n0&&Math.abs(T.acctBal('Banka')-b0)<0.01,'geri alındı');
 // işlem penceresi: sık eklenenler formu doldurur
 T.ACT['new-tx']();chk(!!$('.favs.insheet'),'pencerede sık eklenenler');$('.favs.insheet [data-act="fav-fill"][data-id="1"]').click();
 const f1=T.freqTx(6)[1].t;chk(T.num($('#f-amt').value)===f1.amt&&$('#f-cat').value===f1.cat&&$('#f-acct').value===f1.acct&&$('#f-note').value===f1.note,'form dolduruldu '+[$('#f-amt').value,$('#f-cat').value,$('#f-acct').value]);
 T.ACT.close();
 // gelir sık eklenen türü değiştirir
 T.ACT['new-tx']();const ib=$$('.favs.insheet .fav.inc')[0];chk(!!ib,'gelir sık eklenen');ib&&ib.click();chk($('#f-type [aria-pressed="true"]').dataset.v==='inc'&&$('#f-cat').value==='Maaş','gelire geçti');T.ACT.close();
 // not önerisi ve kategori
 T.ACT['new-tx']();chk([...$('#note-dl').options].some(o=>o.value==='Akbil'),'not önerileri');
 const ne=$('#f-note');ne.value='akbil';ne.dispatchEvent(new Event('input',{bubbles:true}));chk($('#f-cat').value==='Ulaşım','nottan kategori');
 $('#f-type [data-v="inc"]').click();chk([...$('#note-dl').options].some(o=>o.value==='Maaş')&&![...$('#note-dl').options].some(o=>o.value==='Akbil'),'gelir notları');T.ACT.close();
 // kaydettikten sonra geri al
 T.ACT['new-tx']();$('#f-amt').value='55';$('#f-amt').dispatchEvent(new Event('input',{bubbles:true}));const n1=T.S.tx.length;$('.sheet [data-act="save-tx"]').click();
 chk(T.S.tx.length===n1+1&&/Geri al/.test($('#toast').innerText),'kayıt sonrası geri al');$('#toast [data-act="undo"]').click();chk(T.S.tx.length===n1,'kayıt geri alındı');
 // düzenlemede sık eklenenler yok
 T.ACT['edit-tx'](null,'a1');chk(!$('.favs.insheet'),'düzenlemede gösterilmez');T.ACT.close();
 // kısayollar
 T.ui.sub='analiz';T.render();window.walletIntent('exp');await wait(120);chk(T.ui.sub==='ev'&&/Gider|Yeni/.test($('.sheet h2').innerText)&&$('#f-type [aria-pressed="true"]').dataset.v==='exp','kısayol gider');T.ACT.close();
 window.walletIntent('wallet:inc');await wait(120);chk($('#f-type [aria-pressed="true"]').dataset.v==='inc','kısayol gelir');T.ACT.close();
 window.walletIntent('trf');await wait(120);chk(/Transfer/.test($('.sheet h2').innerText),'kısayol transfer');T.ACT.close();
 window.walletIntent('kotu');await wait(120);chk(!$('#sheet-root').innerHTML,'bilinmeyen kısayol yok sayılır');
 T.ui.locked=true;window.walletIntent('exp');await wait(120);chk(!$('#sheet-root').innerHTML&&T.ui.intent==='exp','kilitliyken bekler');T.ui.locked=false;T.runIntent();chk(/Gider|Yeni/.test(($('.sheet h2')||{}).innerText||''),'kilit açılınca açılır');T.ACT.close();
 // sekme kaydırma konumu
 T.S.tx=T.S.tx.concat(Array.from({length:120},(_,i)=>({id:'s'+i,type:'exp',amt:5+i,cat:'Market',acct:'Nakit',date:T.todayS(),note:'kayd '+i})));T.save();
 T.ACT.sub(null,null,'islem');window.scrollTo(0,900);await wait(30);const y1=window.scrollY;
 T.ACT.sub(null,null,'analiz');await wait(30);chk(window.scrollY===0,'yeni sekme baştan '+window.scrollY);
 T.ACT.sub(null,null,'islem');await wait(30);chk(Math.abs(window.scrollY-y1)<5&&y1>100,'İşlemler kaldığı yerden '+window.scrollY+'/'+y1);
 T.ACT.sub(null,null,'islem');await wait(30);chk(window.scrollY===0,'aynı sekmeye dokununca başa');
 // pencereyi aşağı sürükleyerek kapat
 T.ACT['new-tx']();const sh=document.querySelector('.sheet'),top=sh.getBoundingClientRect().top+20;
 const tch=(type,y)=>{const t=new Touch({identifier:1,target:sh,clientX:100,clientY:y});sh.dispatchEvent(new TouchEvent(type,{touches:type==='touchend'?[]:[t],changedTouches:[t],bubbles:true}));};
 tch('touchstart',top);tch('touchmove',top+40);tch('touchend',top+40);await wait(250);chk(!!document.querySelector('.sheet'),'kısa sürükleme kapatmaz');
 tch('touchstart',top);tch('touchmove',top+160);tch('touchend',top+160);await wait(300);chk(!document.querySelector('.sheet'),'aşağı sürükleyince kapandı');
 return F;});
// adres kısayolu (PWA)
await p.goto('http://localhost:8766/index.html#yeni-gelir');await p.reload();await p.waitForTimeout(1500);
const h=await p.evaluate(()=>[location.hash,(document.querySelector('.sheet h2')||{}).innerText,(document.querySelector('#f-type [aria-pressed="true"]')||{dataset:{}}).dataset.v].join('|'));
if(!/^\|.*\|inc$/.test(h))r.push('PWA kısayolu: '+h);
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
