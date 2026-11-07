const {chromium}=require('playwright');
(async()=>{
 const SP='/tmp/claude-0/-home-claude/e68b84dc-2f61-5838-9230-ec494aca5a33/scratchpad/';
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:400,height:800}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(300);
 const res=await p.evaluate(async()=>{
  const T=window.__T,F=[],ok=(c,m)=>{if(!c)F.push(m);};
  const near=(a,b,t=0.011)=>Math.abs(a-b)<=t;
  const pt=s=>parseFloat(String(s).replace(/−/g,'-').replace(/[₺\s.]/g,'').replace(',','.'));
  let seedv=12345;const rnd=()=>{seedv=(seedv*1664525+1013904223)%4294967296;return seedv/4294967296;};
  const grab=(html,label)=>{const re=new RegExp(label+'</span><span class="num"[^>]*>([^<]+)<');const m=html.match(re);return m?pt(m[1]):NaN;};
  // 1 num()
  const nums=[['1.234,56',1234.56],['1234.5',1234.5],['12.500',12500],['3,5',3.5],['',0],['abc',0],['1.5',1.5],['1.234.567',1234567],['-5',-5],['1 000',1000],['0,05',0.05],['1,234.56',1234.56],['1,234,567',1234567],['1.234,5',1234.5],['2,5%',2.5]];
  nums.forEach(([i,e])=>ok(near(T.num(i),e,1e-9),'num('+JSON.stringify(i)+')='+T.num(i)+' beklenen '+e));
  // 2 kredi
  [[100000,3.5,24,0],[250000,2.99,36,25],[50000,0,12,0],[10000,5,1,0],[1000000,4.2,120,15]].forEach(([P,rate,n,tax])=>{
    const h=T.CALCS.kredi.run({amt:P,rate,n,tax});const r=rate/100*(1+tax/100);
    const pay=r===0?P/n:P*r/(1-Math.pow(1+r,-n));let bal=P,ti=0;for(let i=0;i<n;i++){const it=bal*r;ti+=it;bal-=(pay-it);}
    ok(near(grab(h,'Aylık taksit'),pay),'kredi taksit '+[P,rate,n,tax]+' '+grab(h,'Aylık taksit')+' vs '+pay);
    ok(near(grab(h,'Toplam geri ödeme'),pay*n,0.02),'kredi toplam '+[P,rate,n,tax]);
    const gf=grab(h,tax>0?'Toplam faiz ve vergi':'Toplam faiz');ok(near(gf,ti,0.02),'kredi faiz '+[P,rate,n,tax]+' '+gf+' vs '+ti);
    ok(Math.abs(bal)<0.01,'kredi bakiye sıfırlanmıyor '+bal);
    ok(near(pay*n-P,ti,0.01),'kredi faiz toplamı tutarsız');
    ok(near(grab(h,'Yıllık bileşik maliyet'.replace(/ /g,' ')),NaN)||true,'');
  });
  // 3 birikim
  [[50000,5000,40,5],[0,1000,0,3],[100000,0,25,10],[1000,100,12,1]].forEach(([p0,c,rate,y])=>{
    const h=T.CALCS.birikim.run({p:p0,c,rate,y});let bal=p0;const rm=rate/100/12;for(let i=0;i<y*12;i++)bal=bal*(1+rm)+c;
    ok(near(grab(h,'Dönem sonu tutar'),bal,0.6),'birikim '+[p0,c,rate,y]+' '+grab(h,'Dönem sonu tutar')+' vs '+bal);
    ok(near(grab(h,'Toplam yatırılan'),p0+c*y*12,0.6),'birikim yatırılan');
  });
  // 4 mevduat
  [[100000,45,32,15],[250000,38.5,91,17.5],[1000,0,32,15]].forEach(([p0,rate,d,tax])=>{
    const h=T.CALCS.mevduat.run({p:p0,rate,d,tax});const g=p0*rate/100*d/365,net=g*(1-tax/100);
    ok(near(grab(h,'Net getiri'),net),'mevduat net '+[p0,rate,d,tax]+' '+grab(h,'Net getiri')+' vs '+net);
    ok(near(grab(h,'Vade sonu toplam'),p0+net,0.02),'mevduat toplam');
  });
  // 5 hedef
  [[500000,50000,36,30],[100000,0,12,0],[100000,200000,12,10],[1000000,10000,60,25]].forEach(([t,p0,m,rate])=>{
    const h=T.CALCS.hedef.run({t,p:p0,m,rate});const need=grab(h,'Aylık ayırman gereken');let bal=p0;const rm=rate/100/12;for(let i=0;i<m;i++)bal=bal*(1+rm)+need;
    if(p0*Math.pow(1+rm,m)>=t)ok(need===0||isNaN(need)||need<0.01,'hedef zaten ulaşılmış ama need='+need);
    else ok(near(bal,t,Math.max(1,m*0.006)),'hedef simülasyon '+[t,p0,m,rate]+' bal='+bal+' need='+need);
  });
  // 6 enflasyon
  { const h=T.CALCS.enflasyon.run({a:100000,inf:35,y:3,nom:40});const f=Math.pow(1.35,3);
    ok(near(grab(h,'Bugünkü alım gücünü korumak için'),100000*f,1),'enflasyon alım gücü');
    ok(near(grab(h,'Bugünkü tutarın o günkü değeri'),100000/f,1),'enflasyon değer');
    ok(near(grab(h,'Getiri sonrası reel değer'),100000*Math.pow(1.4,3)/f,1),'enflasyon reel değer'); }
  // 7 monthsToFI vs simülasyon
  let cnt=0;
  for(const P of [0,1e5,5e5,2e6])for(const C of [0,1000,5000,-500,20000])for(const ra of [0,0.02,0.04,0.1])for(const Tt of [1e6,5e6]){
    const rm=Math.pow(1+ra,1/12)-1;let ref=Infinity,bal=P;if(bal>=Tt)ref=0;else for(let m=1;m<=3000;m++){bal=bal*(1+rm)+C;if(bal>=Tt){ref=m;break;}}
    const n=T.monthsToFI(P,C,rm,Tt);cnt++;
    if(ref===Infinity)ok(n===Infinity||n>3000,'FIRE ulaşılamaz beklenirken n='+n+' '+[P,C,ra,Tt]);
    else ok(Math.ceil(n-1e-7)===ref,'FIRE ay '+[P,C,ra,Tt]+' n='+n+' ref='+ref);
  }
  // 8 dönem testleri
  const oldPd=T.S.payday;const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  for(const pd of [1,2,5,15,27,28,29,30,31]){
    T.S.payday=pd;
    for(let d=new Date(2023,0,1);d<=new Date(2028,11,31);d.setDate(d.getDate()+1)){const ds=iso(d),k=T.pk(ds);
      if(!(T.pStart(k)<=ds&&ds<=T.pEnd(k))){ok(false,'dönem kapsamıyor pd='+pd+' '+ds+' k='+k+' '+T.pStart(k)+'..'+T.pEnd(k));break;}}
    for(let k='2023-01';k<='2028-11';k=T.addMonth(k,1)){
      const e=T.pdate(T.pEnd(k));e.setDate(e.getDate()+1);const nx=T.pStart(T.addMonth(k,1));
      if(iso(e)!==nx){ok(false,'dönem boşluk/çakışma pd='+pd+' k='+k+' son+1='+iso(e)+' sonraki='+nx);break;}
      let bad=null;for(let day=1;day<=31&&!bad;day++){const dd=T.dueDate({day},k);if(dd<T.pStart(k)||dd>T.pEnd(k)||T.pk(dd)!==k)bad='pd='+pd+' k='+k+' gün='+day+' due='+dd+' aralık '+T.pStart(k)+'..'+T.pEnd(k);}
      if(bad){ok(false,'dueDate dönem dışı '+bad);break;}
    }
  }
  T.S.payday=oldPd;
  // 9 float / yuvarlama
  { const S0=JSON.parse(JSON.stringify(T.S));
    T.S=T.norm({tx:[{id:'a',type:'inc',amt:0.3,cat:'Maaş',acct:'Nakit',date:'2026-11-01',note:''},{id:'b',type:'exp',amt:0.1,cat:'Market',acct:'Nakit',date:'2026-11-02',note:''},{id:'c',type:'exp',amt:0.2,cat:'Market',acct:'Nakit',date:'2026-11-03',note:''}]});
    const W=T.wealth();ok(W.debts.length===0&&W.debt===0,'float: 0 bakiye borç gibi görünüyor '+JSON.stringify(W.debts)+' bal='+T.acctBal('Nakit'));
    ok(T.acctBal('Nakit')===0,'float: acctBal sıfır değil '+T.acctBal('Nakit'));
    T.S=S0; }
  // 10 rastgele durum değişmezleri
  for(let it=0;it<150;it++){
    const accs=['Nakit','Banka','Kredi kartı'];const tx=[];const n=Math.floor(rnd()*40);
    for(let i=0;i<n;i++){const ty=['inc','exp','trf'][Math.floor(rnd()*3)];const a=accs[Math.floor(rnd()*3)];let to=accs[Math.floor(rnd()*3)];const amt=Math.round(rnd()*100000)/100;
      const o={id:'t'+i,type:ty,amt,cat:ty==='trf'?'Transfer':'Market',acct:a,date:'2026-'+String(1+Math.floor(rnd()*11)).padStart(2,'0')+'-'+String(1+Math.floor(rnd()*28)).padStart(2,'0'),note:''};if(ty==='trf'){if(to===a)to=accs[(accs.indexOf(a)+1)%3];o.to=to;}tx.push(o);}
    const open={};accs.forEach(a=>open[a]=Math.round((rnd()-0.3)*5000)/100);
    const holdings=[];for(let i=0;i<Math.floor(rnd()*4);i++)holdings.push({id:'h'+i,name:'x'+i,type:['Hisse','Fon','Altın'][i%3],qty:Math.round(rnd()*1000)/10,cost:rnd()*50,price:rnd()*60});
    const debts=[];for(let i=0;i<Math.floor(rnd()*3);i++)debts.push({id:'d'+i,name:'d'+i,type:'Kredi',amt:Math.round(rnd()*50000)});
    const S0=T.S;T.S=T.norm({tx,opening:open,holdings,debts});
    const sumAcc=accs.reduce((s,a)=>s+T.acctBal(a),0);
    const inc=tx.filter(t=>t.type==='inc').reduce((s,t)=>s+t.amt,0),exp=tx.filter(t=>t.type==='exp').reduce((s,t)=>s+t.amt,0);
    const op=accs.reduce((s,a)=>s+open[a],0);
    ok(near(sumAcc,op+inc-exp,1e-6),'transfer toplamı bozuyor it='+it+' '+sumAcc+' vs '+(op+inc-exp));
    const W=T.wealth();const rr=x=>Math.round(x*100+1e-7)/100;const hv=holdings.reduce((s,h)=>s+(h.qty*h.price>0?rr(h.qty*h.price):0),0),dm=debts.reduce((s,d)=>s+d.amt,0);
    ok(near(W.net,sumAcc+hv-dm,0.006),'net varlık tutarsız it='+it+' '+W.net+' vs '+(sumAcc+hv-dm));
    ok(near(W.items.reduce((s,x)=>s+x[1],0),W.assets,0.02)&&near(W.debts.reduce((s,x)=>s+x[1],0),W.debt,0.02),'dilim toplamı tutarsız it='+it);
    ok(W.items.every(x=>x[1]>0)&&W.debts.every(x=>x[1]>0),'sıfır/negatif dilim it='+it);
    // bütçe: spentByCat toplamı = dönemdeki giderler
    const k='2026-06';const sp=T.spentByCat(k);const tot=Object.values(sp).reduce((a,b)=>a+b,0);const ref=tx.filter(t=>t.type==='exp'&&t.date.slice(0,7)===k).reduce((s,t)=>s+t.amt,0);
    ok(near(tot,ref,1e-6),'bütçe harcama toplamı tutarsız');
    T.S=S0;
  }
  // 11 yedek gidiş-dönüş
  { const json=T.exportJson();const enc=await T.encText(json,'sifre');const dec=await T.decText(JSON.parse(enc),'sifre');ok(dec===json,'şifreli yedek geri dönüşmüyor');
    let wrong=false;try{await T.decText(JSON.parse(enc),'yanlis');}catch(e){wrong=true;}ok(wrong,'yanlış şifre reddedilmiyor'); }
  // 12 CSV
  { const S0=T.S;T.S=T.norm({tx:[{id:'1',type:'exp',amt:12.5,cat:'Market',acct:'Nakit',date:'2026-11-01',note:'a;b "c"\nd'},{id:'2',type:'trf',amt:100,cat:'Transfer',acct:'Nakit',to:'Banka',date:'2026-11-02',note:''}]});
    const csv=T.csvAll().replace(/^﻿/,'');
    // basit CSV ayrıştırıcı
    const rows=[];let cur=[],f='',q=false;for(let i=0;i<csv.length;i++){const c=csv[i];if(q){if(c==='"'){if(csv[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else if(c==='"')q=true;else if(c===';'){cur.push(f);f='';}else if(c==='\r'){}else if(c==='\n'){cur.push(f);rows.push(cur);cur=[];f='';}else f+=c;}cur.push(f);rows.push(cur);
    ok(rows.length===3,'CSV satır sayısı '+rows.length);ok(rows[1][6]==='a;b "c"\nd','CSV not alanı bozuldu: '+JSON.stringify(rows[1]));ok(rows[1][3]==='12,5','CSV tutar '+rows[1][3]);ok(rows[2][1]==='Transfer'&&rows[2][5]==='Banka','CSV transfer');
    T.S=S0; }
  return {F,cnt};
 });
 console.log('FIRE grid cases:',res.cnt);
 console.log(res.F.length?('FAILURES ('+res.F.length+'):\n'+res.F.slice(0,40).join('\n')):'ALL PASS');
 console.log(errs.length?errs.join('\n'):'no page errors');
 await b.close();})();
