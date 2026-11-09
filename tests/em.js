// acil durum fonu: göstergeden girilebilir, hedef olarak kaydedilir, göstergeye yansır, silinebilir
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:360,height:780}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[];const $=s=>document.querySelector(s);const chk=(c,m)=>{if(!c)F.push(m);};
 const fx=JSON.parse(JSON.stringify(T.S.fx)),cur=T.curP(),m1=T.addMonth(cur,-1),m2=T.addMonth(cur,-2);
 const sheet=()=>($('#sheet-root')||{}).innerText||'',set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};
 const click=s=>{const e=$(s);if(!e){F.push('yok: '+s);return false;}e.click();return true;};
 const em=()=>T.health().parts.filter(x=>x.k==='Acil durum fonu')[0];
 T.S=T.norm({fx,accounts:['Nakit','Banka'],opening:{Nakit:0,Banka:30000},tx:[
  {id:'a',type:'inc',amt:40000,cat:'Maaş',acct:'Banka',date:m2+'-05'},{id:'b',type:'exp',amt:10000,cat:'Market',acct:'Banka',date:m2+'-10'},
  {id:'c',type:'exp',amt:10000,cat:'Kira',acct:'Banka',date:m1+'-03'}]});T.save();
 T.ui.page=null;T.ui.sub='plan';T.ui.plan='koc';T.render();
 // fon yokken: likit paraya göre (50.000 / 10.000 = 5 ay), dokunulabilir
 let e=em();chk(e.v==='5 ay','fonsuz gösterge 5 ay: '+e.v);chk(/dokun/.test(e.tip),'dokun ipucu');
 chk(!!$('button.kt[data-act="em-open"]'),'gösterge düğme (Koç)');
 click('button.kt[data-act="em-open"]');
 chk(/Yeni hedef/.test(sheet()),'yeni hedef penceresi');chk($('#g-name').value==='Acil durum fonu','ad hazır');chk($('#g-em').checked,'kutu işaretli');
 chk(T.num($('#g-target').value)===60000,'önerilen hedef 6 aylık gider: '+$('#g-target').value);
 set('g-saved','15000');click('[data-act="save-g"]');
 chk(T.S.goals.length===1&&T.S.goals[0].em===true,'hedef kaydedildi');
 e=em();chk(e.v==='1,5 ay','göstergeye yansıdı: '+e.v);chk(/15\.000/.test(e.tip),'ipucunda tutar');
 chk(/1,5 ay/.test($('#view').innerText),'ekranda 1,5 ay');
 // uyarı dokunulabilir ve hedefi açar
 const w=[...document.querySelectorAll('.kocnow [data-act="em-open"]')];chk(w.length===1,'Koç adımında acil durum fonu düğmesi');w[0]&&w[0].click();
 chk(/Hedefi düzenle/.test(sheet())&&$('#g-saved').value.replace(/\D/g,'')==='15000','uyarıdan hedef açıldı');
 // birikim penceresinden düzenle ve sil
 T.ACT['qa-save']();chk(/acil durum fonu/.test(sheet()),'birikimde etiket');
 click('#sheet-root [data-act="edit-g"]');chk(/Hedefi düzenle/.test(sheet()),'birikimden düzenleme');
 const del=$('#sheet-root [data-act="del-g"]');chk(!!del,'sil düğmesi');del.click();del.click();
 chk(T.S.goals.length===0,'hedef silindi');T.render();e=em();chk(e.v==='5 ay','silince eski hesaba döndü: '+e.v);
 // adında "acil" geçen eski hedef de sayılır; işareti kaldırılırsa sayılmaz
 T.S.goals=[{id:'g1',name:'Acil fon',target:50000,saved:20000}];e=em();chk(e.v==='2 ay','eski adlı hedef sayılır: '+e.v);
 T.gSheet('g1');$('#g-em').checked=false;click('[data-act="save-g"]');e=em();chk(e.v==='5 ay','işaret kaldırılınca sayılmaz: '+e.v);
 // tek fon: yenisi işaretlenince eskisinin işareti kalkar
 T.S.goals=[{id:'x',name:'Tatil',target:1,saved:0,em:true}];T.gSheet(null,{em:true});set('g-saved','5000');click('[data-act="save-g"]');
 chk(T.S.goals.filter(T.isEm).length===1&&T.emGoal().name==='Acil durum fonu','tek acil durum fonu');
 // gider kaydı yokken tutar gösterilir
 T.S.tx=[];e=em();chk(/₺5\.000/.test(e.v),'gider yokken tutar: '+e.v);
 return F;});
if(errs.length)r.push('JS hata: '+errs.join(' | '));
console.log(r.length?'HATA:\n - '+r.join('\n - '):'ALL PASS');await b.close();process.exit(r.length?1:0);})();
