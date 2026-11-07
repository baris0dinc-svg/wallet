const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await p.addInitScript(()=>{try{localStorage.setItem('kumbara-v1',JSON.stringify({tx:[],opening:{'Nakit':0},setupHide:true}));}catch(e){}});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const out=await p.evaluate(async()=>{
 const T=window.__T,F=[],ok=(c,m)=>{if(!c)F.push(m);};
 let seed=777;const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
 // 1 ayarlar: 8 bölüm, hepsi açılır, boş değil, kaldırılanlar yok
 ok(T.SETS.length===9,'ayar sayısı '+T.SETS.length);
 T.SETS.forEach(s=>{let h='';try{h=T.setBody(s.id);}catch(e){F.push('ayar hata '+s.id+' '+e.message);}ok(h&&h.length>50,'ayar boş '+s.id);});
 ok(!T.SETS.some(s=>['notlar','hak','demo'].includes(s.id)),'eski bölüm duruyor');
 // 2 kuruş: float tuzakları
 [[0.1,0.2,0.3],[1.005,2.675,0],[19.99,3,0.01],[0.07,0.01,0.08],[1e6+0.1,0.2,0]].forEach(a=>{const tx=a.map((x,i)=>({id:'f'+i,type:'inc',amt:x,cat:'Maaş',acct:'Nakit',date:T.isoDate(new Date()),note:''}));T.S=T.norm({tx,opening:{Nakit:0}});
  const cents=a.reduce((s,x)=>s+Math.round(x*100),0);const got=T.acctBal('Nakit'),inc=T.sum(T.S.tx,'inc');
  ok(Math.abs(got*100-cents)<1e-6||Math.abs(got*100-Math.round(got*100))<1e-9,'acctBal kuruş '+a+' '+got);
  ok(Math.abs(inc*100-Math.round(inc*100))<1e-9,'sum kuruş '+a+' '+inc);});
 ok(T.r2(1.005)===1.01&&T.r2(-1.005)===-1.01&&T.r2(2.675)===2.68&&T.r2(0.1+0.2)===0.3,'r2 değerleri '+[T.r2(1.005),T.r2(-1.005),T.r2(2.675),T.r2(0.1+0.2)]);
 // 3 rastgele: kuruş-tam oracle (tamsayı kuruş)
 for(let it=0;it<200;it++){
  const accs=['Nakit','Banka','Kredi kartı'];const tx=[];const n=Math.floor(rnd()*50);let incC=0,expC=0;const spC={};const bal={Nakit:0,Banka:0,'Kredi kartı':0};
  const open={};accs.forEach(a=>{const c=Math.round((rnd()-0.3)*500000);open[a]=c/100;bal[a]+=c;});
  const M='2026-06';
  for(let i=0;i<n;i++){const ty=['inc','exp','trf'][Math.floor(rnd()*3)];const a=accs[Math.floor(rnd()*3)];let to=accs[(accs.indexOf(a)+1+Math.floor(rnd()*2))%3];const c=1+Math.floor(rnd()*2000000);
   const day=1+Math.floor(rnd()*27);const o={id:'t'+i,type:ty,amt:c/100,cat:ty==='trf'?'Transfer':['Market','Kira','Fatura'][Math.floor(rnd()*3)],acct:a,date:'2026-06-'+String(day).padStart(2,'0'),note:''};
   if(ty==='trf'){o.to=to;bal[a]-=c;bal[to]+=c;}else if(ty==='inc'){bal[a]+=c;incC+=c;}else{bal[a]-=c;expC+=c;spC[o.cat]=(spC[o.cat]||0)+c;}tx.push(o);}
  T.S=T.norm({tx,opening:open});
  accs.forEach(a=>ok(Math.round(T.acctBal(a)*100)===bal[a],'bakiye kuruş '+a+' it'+it+' '+T.acctBal(a)*100+' vs '+bal[a]));
  const mt=T.monthTx('2026-06');ok(Math.round(T.sum(mt,'inc')*100)===incC,'gelir kuruş it'+it);ok(Math.round(T.sum(mt,'exp')*100)===expC,'gider kuruş it'+it);
  const sp=T.spentByCat('2026-06');Object.keys(spC).forEach(c=>ok(Math.round(sp[c]*100)===spC[c],'kategori kuruş '+c+' it'+it));
  const W=T.wealth();const accSum=accs.reduce((s,a)=>s+bal[a],0);ok(Math.round(W.net*100)===accSum,'net kuruş it'+it+' '+W.net+' vs '+accSum/100);
 }
 // 4 arama
 const d=T.isoDate(new Date());
 T.S=T.norm({tx:[{id:'a',type:'exp',amt:125.5,cat:'Market',acct:'Nakit',date:d,note:'BİM haftalık'},{id:'b',type:'exp',amt:900,cat:'Eğlence',acct:'Banka',date:'2025-01-15',note:'Sinema'},{id:'c',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:'2025-01-02',note:''},{id:'d',type:'exp',amt:12.99,cat:'Fatura',acct:'Nakit',date:d,note:'Netflix'}],opening:{Nakit:0}});
 const cnt=q=>{T.ui.tq=q;T.ui.filter='all';const h=T.txList();return (h.match(/data-act="edit-tx"/g)||[]).length;};
 ok(cnt('')===2,'arama boş (bu dönem) '+cnt(''));ok(cnt('bim')===1,'arama bim');ok(cnt('BİM')===1,'arama BİM');ok(cnt('sinema')===1,'eski dönem not');ok(cnt('eğlence')===1,'kategori');
 ok(cnt('125,5')===1,'tutar virgül');ok(cnt('125.5')===1,'tutar nokta');ok(cnt('banka')===2,'hesap');ok(cnt('zzz')===0,'sonuçsuz');ok(cnt('bim haftalık')===1,'çok kelime');ok(cnt('bim sinema')===0,'çok kelime VE');
 T.ui.tq='';
 // 5 sil + geri al
 const before=JSON.stringify(T.S.tx.find(t=>t.id==='a'));T.ACT['del-tx'](null,'a');ok(!T.S.tx.some(t=>t.id==='a'),'silinmedi');
 const tEl=document.getElementById('toast');ok(tEl&&!tEl.hidden&&/Geri al/.test(tEl.innerText),'toast yok');
 T.ACT.undo();ok(JSON.stringify(T.S.tx.find(t=>t.id==='a'))===before,'geri al aynı değil');ok(T.S.tx.length===4,'geri al sayı '+T.S.tx.length);
 // 6 kopyala
 const n0=T.S.tx.length;T.ACT['dup-tx'](null,'b');ok(T.S.tx.length===n0+1,'kopyalanmadı');const cp=T.S.tx[T.S.tx.length-1];ok(cp.amt===900&&cp.cat==='Eğlence'&&cp.date===d&&cp.id!=='b','kopya alanları');
 // 7 hesaplayıcılar: NaN/Infinity yok
 const bad=h=>/NaN|Infinity|undefined|null/.test(h.replace(/<[^>]*>/g,' '));
 const vals=[0,'',1,12,1000,100000,1e9,-5,0.5,3.5,60,360];
 const specs={kredi:['amt','rate','n','tax'],birikim:['p','c','rate','y'],mevduat:['p','rate','d','tax'],hedef:['t','p','m','rate'],enflasyon:['a','inf','y','nom']};
 let runs=0;Object.keys(specs).forEach(k=>{for(let i=0;i<400;i++){const o={};specs[k].forEach(f=>o[f]=vals[Math.floor(rnd()*vals.length)]);let h='';try{h=T.CALCS[k].run(o);}catch(e){F.push('calc hata '+k+' '+JSON.stringify(o)+' '+e.message);continue;}runs++;if(bad(h))F.push('calc NaN '+k+' '+JSON.stringify(o)+' → '+h.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,120));}});
 return {F:F.slice(0,25),n:F.length,runs};});
console.log('calc runs',out.runs);console.log(out.n?('FAILURES ('+out.n+')\n'+out.F.join('\n')):'ALL PASS');console.log(errs.join('\n')||'no page errors');await b.close();})();
