// Yönlendirme testi: her düğme doğru yere gidiyor mu, geri tuşu doğru sırayla dönüyor mu
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[],o={};const $=s=>document.querySelector(s);const chk=(c,m)=>{if(!c)F.push(m);};
 const click=s=>{const e=$(s);if(!e){F.push('bulunamadı '+s);return false;}e.click();return true;};
 const sheetT=()=>($('.sheet h2')||{}).innerText||'';const page=()=>T.ui.page&&T.ui.page.k;const back=()=>window.walletBack();
 // daireler
 const want={'qa-inc':/Gelir ekle/,'qa-exp':/Gider ekle/,'qa-cash':/Nakit/,'qa-bank':/Banka/,'qa-trf':/Transfer/,'qa-debt':/Borç/,'qa-inv':/Yatırım ekle/,'qa-save':/Birikim/,'qa-asset':/Varlık ekle/};
 for(const k in want){click('#qa [data-act="'+k+'"]');chk(want[k].test(sheetT()),k+' → '+sheetT());if(k==='qa-inc')chk($('#f-type [aria-pressed="true"]').dataset.v==='inc','gelir türü seçili');if(k==='qa-exp')chk($('#f-type [aria-pressed="true"]').dataset.v==='exp','gider türü');back();chk(!$('#sheet-root').innerHTML,k+' geri kapatır');}
 click('#qa [data-act="qa-calc"]');chk(page()==='araclar'&&location.hash==='#araclar','hesaplayıcılar sayfası');back();await new Promise(r=>setTimeout(r,50));chk(!page(),'hesaplayıcılardan geri');
 // kutucuklar
 click('.nwt[data-v="yatirim"]');chk(T.ui.sub==='servet'&&T.ui.sv==='yatirim','yatırım kutucuğu Servetim › Yatırımlar');
 click('.nwt[data-v="borc"]');chk(T.ui.sub==='servet'&&T.ui.sv==='borc'&&!!document.querySelector('#secbody [data-act="new-d"]'),'borç kutucuğu Servetim › Borçlar');
 click('[data-act="sub"][data-v="analiz"]');chk(T.ui.sub==='analiz','Analiz sekmesi');click('[data-act="an"][data-v="servet"]');chk(T.ui.an==='servet','Analiz › Servet');
 // analiz FIRE kartı ve geri
 click('#secbody [data-act="open-fire"]');chk(page()==='fire','FIRE sayfası');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='analiz'&&T.ui.an==='servet','FIRE geri analiz bölümüne');
 // bütçe → analiz bağlantısı
 click('[data-act="sub"][data-v="plan"]');click('[data-act="plan"][data-v="butce"]');chk(T.ui.sub==='plan'&&T.ui.plan==='butce','Planlama › Bütçe');click('#secbody .linkbtn[data-act="an-go"]');chk(T.ui.sub==='analiz'&&T.ui.an==='harcama','bütçeden analize');
 click('[data-act="sub"][data-v="plan"]');click('[data-act="plan"][data-v="hedef"]');chk(!!document.querySelector('#secbody [data-act="new-g"]'),'Planlama › Hedefler');T.ui.sub='islem';T.render();
 // portföy kur kartı → kurlar → geri portföy
 click('[data-act="sub"][data-v="servet"]');click('[data-act="sv"][data-v="yatirim"]');click('.ratecard');chk(page()==='set'&&T.ui.page.s==='kurlar','kur kartı kurlar ayarına');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='servet'&&T.ui.sv==='yatirim','kurlardan geri yatırımlara');
 // hesap → tüm hareketler
 click('[data-act="sub"][data-v="servet"]');click('[data-act="sv"][data-v="hesap"]');click('#secbody [data-act="acct-open"]');const an=$('.sheet h2').innerText;chk(!!an,'hesap detayı');click('.sheet [data-act="acct-all"]');
 chk(T.ui.sub==='islem'&&T.ui.acctF===an&&!$('#sheet-root').innerHTML,'tüm hareketler İşlemler’e filtreli: '+T.ui.acctF);
 const rows=[...document.querySelectorAll('#txlist [data-act="edit-tx"]')].map(e=>T.S.tx.find(t=>t.id===e.dataset.id));chk(rows.length&&rows.every(t=>t.acct===an||t.to===an),'filtre doğru hesap');
 click('[data-act="acct-clear"]');chk(!T.ui.acctF,'filtre kaldırıldı');
 // hesap detayından işlem → hesap seçili
 T.ui.sub='servet';T.ui.sv='hesap';T.render();click('#secbody [data-act="acct-open"][data-id="Nakit"]');click('.sheet [data-act="acct-exp"]');chk($('#f-acct').value==='Nakit'&&/Yeni|Gider/.test(sheetT()),'hesaptan harcama hesabı seçili');back();
 // ayarlar akışı
 click('[data-act="open-settings"]');chk(page()==='ayarlar'&&location.hash==='#ayarlar','ayarlar');click('[data-act="open-set"][data-id="bild"]');chk(page()==='set'&&T.ui.page.s==='bild','bildirim ayarı');
 back();await new Promise(r=>setTimeout(r,50));chk(page()==='ayarlar','alt ayardan ayarlara');back();await new Promise(r=>setTimeout(r,50));chk(!page(),'ayarlardan ana sayfaya');
 // not düzenleyici geri ile kaydeder
 click('[data-act="sub"][data-v="notlar"]');click('[data-act="new-n"]');const ti=$('#n-title');ti.value='Geri ile kayıt';ti.dispatchEvent(new Event('input',{bubbles:true}));back();await new Promise(r=>setTimeout(r,50));
 chk(T.S.notes.some(n=>n.title==='Geri ile kayıt')&&!page(),'geri tuşu notu kaydetti');
 // kurulum bandı
 const keep=JSON.stringify(T.S);T.S=T.norm({tx:[]});T.render();chk(!!$('.banner [data-v="hesap"]'),'kurulum bandı');click('.banner [data-v="hesap"]');chk(T.ui.sub==='servet'&&T.ui.sv==='hesap','bant hesaplara götürür');
 T.S=T.norm(JSON.parse(keep));T.save();
 // geri tuşu sırası
 T.ui.sub='servet';T.render();o.b=[back(),T.ui.sub,back()];
 // uyarı şeridi → pencere → Ödendi
 const rd=new Date();T.S.recurring.push({id:'ra',name:'Uyarı testi',amt:5,day:rd.getDate(),cat:'Fatura',acct:'Banka',paid:{}});T.render();click('.alertbar');chk(/Uyarılar/.test(sheetT()),'uyarı penceresi');const pb=document.querySelector('.sheet [data-act="al-pay"][data-id="ra"]');chk(!!pb,'Ödendi düğmesi');if(pb){const n0=T.S.tx.length;pb.click();chk(T.S.tx.length===n0+1,'uyarıdan ödeme');}back();chk(o.b[0]===true&&o.b[1]==='islem'&&o.b[2]===false,'bölümden geri '+o.b);
 return {F,o};});
console.log(r.F.length?'FAIL\n'+r.F.join('\n'):'ALL PASS');
// adres çubuğu ile açılış
for(const h of ['araclar','fire','ayar-bild','ayarlar','yok']){await p.goto('http://localhost:8766/index.html#'+h);await p.waitForTimeout(500);const t=await p.evaluate(()=>[document.querySelector('header h1').innerText,location.hash].join(' '));console.log('#'+h,'→',t);}
console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
