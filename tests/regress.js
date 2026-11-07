// Bu turdaki düzeltmelerin hedefli testleri
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1000);
const F=[];const chk=(c,m)=>{if(!c)F.push(m);};
const r=await p.evaluate(()=>{const T=window.__T,o={};const $=s=>document.querySelector(s);
 const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 act('sample-clear');const S=T.S;
 // 1) silinmiş kategori korunur
 S.cats.exp.push('Geçici');S.tx.push({id:'k1',type:'exp',amt:50,cat:'Geçici',acct:S.accounts[0],date:T.isoDate(T.today0()),note:'x'});
 S.cats.exp=S.cats.exp.filter(c=>c!=='Geçici');T.render();
 act('edit-tx','k1');o.catSel=$('#f-cat').value;$('.sheet .btn[data-act="save-tx"]').click();o.catAfter=S.tx.find(t=>t.id==='k1').cat;
 // 2) hedef: bu ayın sonraki bir günü
 const d=T.today0();const last=new Date(d.getFullYear(),d.getMonth()+1,0);const later=new Date(d);later.setDate(Math.min(d.getDate()+5,last.getDate()));
 S.goals=[{id:'g1',name:'Kısa hedef',target:1000,saved:100,date:T.isoDate(later)}];act('sub',null,'hedef');o.goal=document.getElementById('view').innerText.match(/Kısa hedef\n([^\n]+)/)[1];
 S.goals=[{id:'g2',name:'Geçmiş',target:1000,saved:100,date:'2020-01-01'}];T.render();o.goalPast=document.getElementById('view').innerText.match(/Geçmiş\n([^\n]+)/)[1];
 // 3) not ayarları
 act('sub',null,'notlar');$('[data-act="open-set"][data-id="notlar"]').click();o.notesTitle=$('header h1').innerText;o.notesBody=document.getElementById('view').innerText.includes('Sıralama');act('back');
 // 4) geri tuşu
 act('sub',null,'portfoy');act('new-h');o.b1=window.walletBack()&&!document.getElementById('sheet-root').innerHTML;
 act('open-set','kurlar');o.b2=window.walletBack()&&!T.ui.page;
 o.b3=window.walletBack()&&T.ui.sub==='islem';o.b4=window.walletBack()===false;
 act('open-settings');document.querySelector('[data-act="open-set"][data-id="hesap"]').click();o.nest1=T.ui.page&&T.ui.page.k==='set';window.walletBack();o.nest2=T.ui.page&&T.ui.page.k==='ayarlar';window.walletBack();o.nest3=T.ui.page===null;
 // 5) banka ekstresi: hedef hesap + kural
 S.rules=[{kw:'migros',cat:'Market'}];
 const r5=T.csvImport('Tarih,Açıklama,Tutar\n05.11.2026,MIGROS KADIKOY,"-250,40"\n06.11.2026,EFT GELEN,"1.000,00"\n','Banka');
 const im=S.tx.slice(-2);o.bank={r5,acct:im.map(t=>t.acct),cat:im.map(t=>t.cat),type:im.map(t=>t.type)};
 // 6) para birimi sütunu: boş kurulumda dolar hesabı açılır
 S.accx['Banka']={ccy:'USD'};S.tx=S.tx.filter(t=>t.acct!=='Banka');S.tx.push({id:'u1',type:'exp',amt:10.5,cat:'Market',acct:'Banka',date:'2026-11-01'});
 const csv=T.csvAll();o.hasCcy=/;Para birimi/.test(csv.split('\r\n')[0])&&/;USD(\r|$)/m.test(csv);
 T.S=T.norm({tx:[]});const r6=T.csvImport(csv.replace(/;Banka;/g,';ABD Hesabı;'),'Nakit');o.newAcctCcy=T.ccyOf('ABD Hesabı');o.r6=r6;
 // 7) eksi sıfır yok, gerçek eksi işareti
 o.neg0=T.TRY2.format(-0.001)+' '+T.TRY2.format(-12.5)+' '+T.moneyIn(-3,'ABD Hesabı');
 // 8) yazı boyutu düğmeleri adlı
 act('open-set','gor');o.fsLabels=[...document.querySelectorAll('[data-v="fs"]')].map(b=>b.getAttribute('aria-label')).join(',');act('back');
 return o;});
console.log(JSON.stringify(r,null,1));
chk(r.catSel==='Geçici'&&r.catAfter==='Geçici','silinmiş kategori korunmalı');
chk(/gün kaldı|Son gün bugün/.test(r.goal)&&!/geçti/.test(r.goal),'hedef bu ay: '+r.goal);chk(/Tarih geçti/.test(r.goalPast),'geçmiş hedef');
chk(r.notesTitle==='Not ayarları'&&r.notesBody,'not ayarları');
chk(r.nest1&&r.nest2&&r.nest3,'ayarlar geri akışı '+[r.nest1,r.nest2,r.nest3]);chk(r.b1&&r.b2&&r.b3&&r.b4,'geri tuşu '+[r.b1,r.b2,r.b3,r.b4]);
chk(r.bank.r5.added===2&&r.bank.acct.join()==='Banka,Banka'&&r.bank.cat.join()==='Market,Diğer gelir'&&r.bank.type.join()==='exp,inc','banka ekstresi');
chk(r.hasCcy&&r.newAcctCcy==='USD','para birimi sütunu');
chk(r.neg0==='₺0,00 −₺12,50 −$3','eksi biçimi: '+r.neg0);
chk(r.fsLabels==='Küçük,Normal,Büyük,Çok büyük','yazı boyutu adları');
console.log(F.length?'FAIL\n'+F.join('\n'):'ALL PASS');console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
