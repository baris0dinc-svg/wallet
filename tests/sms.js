// Banka SMS ayrıştırma ve onay akışı testi
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});
await ctx.addInitScript(()=>{const L=localStorage;window.AndroidBridge={saveData:j=>{L.setItem('__nat',j);return 'ok';},loadData:()=>L.getItem('__nat')||'',
  smsState:()=>'granted',askSms:()=>{},smsSet:v=>L.setItem('__smsOn',String(v)),smsQueue:()=>L.getItem('__q')||'[]',smsAck:ids=>{const r=JSON.parse(ids);L.setItem('__q',JSON.stringify(JSON.parse(L.getItem('__q')||'[]').filter(m=>r.indexOf(m.id)<0)));},
  smsScan:d=>L.getItem('__inbox')||'[]',schedule:()=> 'ok'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[],o={};const chk=(c,m)=>{if(!c)F.push(m);};
 const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 const ts=new Date(2026,10,7,14,30).getTime();
 const C=[
  ['GARANTI BBVA','Sayin musterimiz, 4543 ile biten kartinizla 07.11.2026 tarihinde MIGROS KADIKOY isyerinden 1.250,40 TL tutarinda islem yapilmistir. Kullanilabilir limitiniz 23.749,60 TL.',{kind:'exp',amt:1250.4,merchant:'Migros Kadikoy',last4:'4543',cat:'Market'}],
  ['AKBANK','XXXX1234 nolu kartinizla 07/11/2026 14:22 tarihinde STARBUCKS NISANTASI\'dan 185,00 TL harcama yaptiniz. Bonus: 1,85 TL',{kind:'exp',amt:185,merchant:'Starbucks Nisantasi',last4:'1234',cat:'Yeme-İçme'}],
  ['ISBANK','Hesabiniza 07.11.2026 tarihinde A*** Y*** tarafindan 5.000,00 TL FAST ile gonderilmistir. Bakiyeniz: 12.345,67 TL',{kind:'inc',amt:5000}],
  ['ZIRAAT','Hesabinizdan 07.11.2026 tarihinde 1.500,00 TL EFT gonderilmistir. Aciklama: KIRA KASIM',{kind:'exp',amt:1500,merchant:'Kira Kasim',cat:'Kira'}],
  ['YAPIKREDI','4543 ile biten kartiniza 299,90 TL iade yapilmistir. TRENDYOL',{kind:'inc',amt:299.9}],
  ['VAKIFBANK','Kartinizla ATM\'den 2.000,00 TL para cekilmistir. Kalan bakiye 8.000,00 TL',{kind:'atm',amt:2000}],
  ['QNB','Kredi karti borcunuza 4.500,00 TL odeme yapilmistir. Tesekkur ederiz.',{kind:'cardpay',amt:4500}],
  ['DENIZBANK','Kart ekstreniz kesilmistir. Donem borcu 7.320,45 TL, asgari odeme 2.196,14 TL, son odeme tarihi 25.11.2026',{skip:true}],
  ['GARANTI BBVA','MIGROS isyerinde 250,00 TL tutarindaki isleminiz icin 3D Secure sifreniz: 482913',{skip:true}],
  ['HALKBANK','Ihtiyac kredisinde %2,99 faiz firsati! 100.000 TL\'ye varan kredi icin hemen basvur',{skip:true}],
  ['TEB','1234 ile biten kartinizla NETFLIX.COM isyerinde 12,99 USD tutarinda islem yapilmistir.',{kind:'exp',amt:12.99,ccy:'USD',merchant:'Netflix.com',cat:'Eğlence'}],
  ['ING','Maasiniz hesabiniza yatirilmistir. Tutar: 42.000,00 TL',{kind:'inc',amt:42000,cat:'Maaş'}],
  ['ENPARA','4321 ile biten kartinla 07.11.2026 tarihinde SHELL MASLAK\'tan 1.800,00 TL\'lik alisveris yaptin.',{kind:'exp',amt:1800,merchant:'Shell Maslak',cat:'Ulaşım'}],
  ['KUVEYTTURK','Sayın müşterimiz, 07.11.2026 tarihinde 9876 nolu kartınızdan TURKCELL FATURA işyerine 350,75 TL ödeme yapılmıştır.',{kind:'exp',amt:350.75,merchant:'Turkcell Fatura',last4:'9876',cat:'Fatura'}],
  ['YAPIKREDI','SAYIN MUSTERIMIZ 07.11.2026 TARIHINDE 5678 ILE BITEN KARTINIZLA A101 BEYLIKDUZU ISYERINDE 312,50 TL HARCAMA YAPILMISTIR',{kind:'exp',amt:312.5,merchant:'A101 Beylikduzu',last4:'5678',cat:'Market'}],
  ['AKBANK','4543 ile biten kartınızla ŞOK MARKET isyerinden 89,90 TL tutarında işlem yapılmıştır.',{kind:'exp',amt:89.9,merchant:'Şok Market',cat:'Market'}]
 ];
 const fx=T.S.fx;T.S=T.norm({tx:[],accounts:['Nakit','Banka','Kredi kartı'],accx:{'Kredi kartı':{type:'kart'}},opening:{Nakit:500,Banka:20000},fx:fx});T.save();
 o.parse=C.map(([from,body,exp])=>{const p=T.smsParse(body,from,ts);let ok=true,why='';
   if(exp.skip){ok=!p||!!p.skip;why=p&&p.skip;}
   else{if(!p||p.skip){ok=false;why=p&&p.skip;}else{for(const k of ['kind','amt','merchant','last4','ccy'])if(exp[k]!=null&&p[k]!==exp[k]){ok=false;why+=k+'='+p[k]+' ';}
     if(exp.cat){const c=T.smsCat ? null:null;}}}
   if(!ok)F.push('ayrıştırma: '+from+' → '+why+' | '+body.slice(0,50));return ok;});
 // kategoriler (ingest ile)
 const list=C.map(([from,body],i)=>({id:'q'+i,from,body,ts}));
 localStorage.setItem('__q',JSON.stringify(list));window.walletSms();
 const pend=T.S.sms.pend;o.pend=pend.length;chk(pend.length===13,'bekleyen sayısı '+pend.length);
 C.forEach(([from,body,exp])=>{if(exp.cat){const it=pend.find(x=>x.raw.indexOf(body.replace(/\s+/g,' ').slice(0,30))===0);if(!it||it.cat!==exp.cat)F.push('kategori '+from+': '+(it&&it.cat)+' ≠ '+exp.cat);}});
 chk(localStorage.getItem('__q')==='[]','kuyruk boşaltıldı');
 // tekrar gelen aynı SMS eklenmez
 localStorage.setItem('__q',JSON.stringify(list.slice(0,2)));window.walletSms();chk(T.S.sms.pend.length===13,'tekrar SMS eklendi');
 // ATM ve kart ödemesi transfer önerisi
 const atm=pend.find(x=>x.kind==='atm'),cp=pend.find(x=>x.kind==='cardpay');chk(atm&&atm.acct==='Banka'&&atm.to==='Nakit','ATM önerisi '+(atm&&atm.acct+'→'+atm.to));chk(cp&&cp.acct==='Banka'&&cp.to==='Kredi kartı','kart ödemesi önerisi');
 // kredi kartı harcaması karta önerilir
 const mig=pend.find(x=>x.note==='Migros Kadikoy');chk(mig&&mig.acct==='Kredi kartı','kart harcaması kart hesabına '+(mig&&mig.acct));
 // banner ve onay penceresi
 T.render();chk(!!document.querySelector('[data-act="sms-review"]'),'ana ekran SMS bandı');
 act('sms-review');chk(document.querySelectorAll('.smsit').length===13,'onay penceresi');
 // Migros'u Banka hesabına ekle, kategori değiştir → eşleme ve kural öğrenilir
 const id=mig.id;document.getElementById('sa-'+id).value='Banka';document.getElementById('sc-'+id).value='Eğlence';act('sms-add',id);
 const t=T.S.tx.find(x=>x.note==='Migros Kadikoy');chk(t&&t.acct==='Banka'&&t.amt===1250.4&&t.cat==='Eğlence'&&t.type==='exp','işlem eklendi');
 chk(T.S.sms.map['garanti bbva|4543']==='Banka','kart eşlemesi öğrenildi '+JSON.stringify(T.S.sms.map));chk(T.S.rules.some(r=>r.kw==='migros kadikoy'&&r.cat==='Eğlence'),'kural öğrenildi');
 chk(Math.abs(T.acctBal('Banka')-(20000-1250.4))<0.01,'bakiye düştü');
 // ATM ekle → transfer
 act('sms-add',atm.id);chk(T.S.tx.some(x=>x.type==='trf'&&x.acct==='Banka'&&x.to==='Nakit'&&x.amt===2000),'ATM transferi');chk(Math.abs(T.acctBal('Nakit')-2500)<0.01,'nakit arttı');
 // USD harcaması TL karta çevrilir
 const nf=T.S.sms.pend.find(x=>x.note==='Netflix.com');act('sms-add',nf.id);const nt=T.S.tx.find(x=>/Netflix/.test(x.note));chk(nt&&Math.abs(nt.amt-12.99*41.31)<0.02&&/12,99/.test(nt.note),'USD çevrildi '+(nt&&nt.amt+' '+nt.note));
 // onaysız ekleme: eşleşmiş kart
 T.S.sms.auto=true;T.save();const n0=T.S.tx.length;
 localStorage.setItem('__q',JSON.stringify([{id:'z1',from:'GARANTI BBVA',body:'4543 ile biten kartinizla 08.11.2026 tarihinde BIM ATASEHIR isyerinden 77,50 TL tutarinda islem yapilmistir.',ts:ts+864e5}]));window.walletSms();
 chk(T.S.tx.length===n0+1&&T.S.tx[T.S.tx.length-1].acct==='Banka'&&T.S.tx[T.S.tx.length-1].cat==='Market','onaysız ekleme '+JSON.stringify(T.S.tx[T.S.tx.length-1]));
 // olası tekrar uyarısı
 T.S.sms.auto=false;T.S.tx.push({id:'dupx',type:'exp',amt:55,cat:'Market',acct:'Banka',date:'2026-11-09'});
 localStorage.setItem('__q',JSON.stringify([{id:'z2',from:'GARANTI BBVA',body:'4543 ile biten kartinizla 09.11.2026 tarihinde FILE MARKET isyerinden 55,00 TL tutarinda islem yapilmistir.',ts:new Date(2026,10,9,10).getTime()}]));window.walletSms();
 chk(T.S.sms.pend.some(x=>x.note==='File Market'&&x.dup),'tekrar uyarısı');
 // tarama
 localStorage.setItem('__inbox',JSON.stringify([{id:'i9',from:'ISBANK',body:'Hesabiniza 3.000,00 TL havale gelmistir.',ts}]));act('open-set','oto');document.querySelector('[data-act="sms-scan"]').click();o.scan=document.getElementById('f-sms').innerText;chk(/1 SMS tarandı: 1 işlem/.test(o.scan),'tarama '+o.scan);
 // elle yapıştırma
 document.getElementById('sms-txt').value='1111 ile biten kartinizla 10.11.2026 tarihinde OPET ISTANBUL isyerinde 900,00 TL tutarinda islem yapilmistir.';document.getElementById('sms-from').value='TEB';act('sms-parse');o.paste=document.getElementById('f-sms2').innerText;
 chk(/gider · ₺900,00 · Opet Istanbul/.test(o.paste),'yapıştırma '+o.paste);act('close');
 document.getElementById('sms-txt').value='Merhaba, toplantı 15:00 te';act('sms-parse');chk(/tanınmadı/.test(document.getElementById('f-sms2').innerText),'tanınmayan mesaj');
 act('back');
 // hepsini yoksay
 act('sms-review');const nb=document.querySelector('[data-act="sms-none"]');nb.click();nb.click();chk(T.S.sms.pend.length===0,'hepsini yoksay');
 return {F,o};});
console.log(JSON.stringify(r.o));
console.log(r.F.length?'FAIL\n'+r.F.join('\n'):'ALL PASS');console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
