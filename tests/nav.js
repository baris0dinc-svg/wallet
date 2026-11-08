// Yönlendirme testi: her düğme doğru yere gidiyor mu, geri tuşu doğru sırayla dönüyor mu
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[],o={};const $=s=>document.querySelector(s),$$q=s=>[...document.querySelectorAll(s)];const chk=(c,m)=>{if(!c)F.push(m);};try{
 const click=s=>{const e=$(s);if(!e){F.push('bulunamadı '+s);return false;}e.click();return true;};
 const sheetT=()=>($('.sheet h2')||{}).innerText||'';const page=()=>T.ui.page&&T.ui.page.k;const back=()=>window.walletBack();const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 // alt menü: 5 sekme, her biri doğru bölüm ve başlık
 chk($$q('#tabbar button').length===5&&!$('#tabbar').hidden,'alt menüde 5 sekme');
 for(const [k,t] of [['islem','İşlemler'],['analiz','Analiz'],['servet','Hesaplar'],['ayar','Ayarlar'],['ev','Wallet']]){click('#tabbar [data-v="'+k+'"]');chk(T.ui.sub===k&&$('header h1').innerText.includes(t)&&$('#tabbar [aria-current="page"]').dataset.v===k,'sekme '+k);}
 // hızlı işlemler (pencereler)
 const want={'qa-inc':/Gelir ekle/,'qa-exp':/Gider ekle/,'qa-cash':/Nakit/,'qa-bank':/Banka/,'qa-trf':/Transfer/,'qa-debt':/Borç/,'qa-inv':/Yatırım ekle/,'qa-save':/Birikim/,'qa-asset':/Varlık ekle/};
 for(const k in want){T.ACT[k]();chk(want[k].test(sheetT()),k+' → '+sheetT());if(k==='qa-inc')chk($('#f-type [aria-pressed="true"]').dataset.v==='inc','gelir türü seçili');if(k==='qa-exp')chk($('#f-type [aria-pressed="true"]').dataset.v==='exp','gider türü');back();chk(!$('#sheet-root').innerHTML,k+' geri kapatır');}
 // ana sayfa: işlem ekle kartı, kısayollar, son işlemler
 click('.addmain');chk(/Yeni işlem|Gider/.test(sheetT()),'işlem ekle kartı');back();
 click('.sc[data-v="yatirim"]');chk(T.ui.sub==='servet'&&T.ui.sv==='yatirim','kısayol Yatırımlar');click('#tabbar [data-v="ev"]');
 click('.sc[data-v="varlik"]');chk(T.ui.sub==='servet'&&T.ui.sv==='varlik','kısayol Varlıklarım');click('#tabbar [data-v="ev"]');
 click('.sc[data-v="borc"]');chk(T.ui.sub==='servet'&&T.ui.sv==='borc'&&!!document.querySelector('#secbody [data-act="new-d"]'),'kısayol Borçlar');click('#tabbar [data-v="ev"]');
 click('.sc[data-act="qa-trf"]');chk(/Transfer/.test(sheetT()),'kısayol Transfer');back();
 click('.sc[data-v="hedef"]');chk(page()==='plan'&&T.ui.plan==='hedef'&&location.hash==='#planlama'&&!!$('#view [data-act="new-g"]'),'kısayol Hedefler sayfası');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ev','hedeflerden geri ana sayfa');
 click('.sc[data-v="duzenli"]');chk(page()==='plan'&&T.ui.plan==='duzenli'&&!!$('#view [data-act="new-r"]'),'kısayol Düzenli ödemeler');back();await new Promise(r=>setTimeout(r,50));
 chk($$q('.toolg .tool').length===3,'varsayılan 3 hızlı araç');
 click('.tool[data-act="open-mkt"]');chk(page()==='piyasa','araç Piyasalar');back();await new Promise(r=>setTimeout(r,50));
 click('.tool[data-v="butce"]');chk(page()==='plan'&&T.ui.plan==='butce','araç Bütçe');back();await new Promise(r=>setTimeout(r,50));
 click('.tool[data-v="notlar"]');chk(page()==='notlar'&&location.hash==='#notlar','araç Notlar');back();await new Promise(r=>setTimeout(r,50));chk(!page(),'notlardan geri');
 click('[data-act="tools-edit"]');chk(/Hızlı araçlar/.test(sheetT()),'düzenle penceresi');click('#tools-l [data-id="claude"]');click('#tools-l [data-id="piyasa"]');
 chk(JSON.stringify(T.S.tools)==='["butce","notlar","claude"]','araç seçimi kaydedildi '+JSON.stringify(T.S.tools));back();
 chk($$q('.toolg .tool').length===3&&!!$('.tool[data-act="ai-open"]')&&!$('.tool[data-act="open-mkt"]'),'ana sayfada yeni araçlar');
 click('[data-act="tools-edit"]');['piyasa','takvim','calc','fire'].forEach(id=>click('#tools-l [data-id="'+id+'"]'));chk(T.S.tools.length===6&&/En fazla 6/.test($('#f-err').innerText),'en fazla 6 araç');back();T.S.tools=null;T.render();
 chk($$q('.list [data-act="edit-tx"]').length===5,'son 5 işlem');click('.linkbtn[data-v="islem"]');chk(T.ui.sub==='islem','son işlemler Tümü');
 // işlemler: bugün / bu hafta / dönem
 const td=T.todayS();T.S.tx.push({id:'tdy',type:'exp',amt:12,cat:'Market',acct:'Nakit',date:td});
 click('[data-act="rng"][data-v="gun"]');const dl=$$q('#txlist [data-act="edit-tx"]').map(e=>T.S.tx.find(t=>t.id===e.dataset.id));chk(dl.length>0&&dl.every(t=>t.date===td),'bugün filtresi');
 click('[data-act="rng"][data-v="hafta"]');const wl=$$q('#txlist [data-act="edit-tx"]').map(e=>T.S.tx.find(t=>t.id===e.dataset.id));chk(wl.some(t=>t.id==='tdy')&&wl.every(t=>T.daysBetween(t.date,td)<7&&t.date<=td||t.date>td),'bu hafta filtresi');
 click('[data-act="rng"][data-v="ay"]');chk(!!$('.period .mnav'),'dönem görünümü');T.S.tx=T.S.tx.filter(t=>t.id!=='tdy');
 // analiz: takvim
 click('#tabbar [data-v="analiz"]');click('[data-act="an"][data-v="takvim"]');const days=$$q('.cd:not(.out)');chk(days.length>=28&&days.length<=31,'takvim günleri '+days.length);
 const hd=$('.cd.has');chk(!!hd,'işlem olan gün işaretli');if(hd){hd.click();chk($$q('.sheet [data-act="edit-tx"]').length>0,'güne dokununca işlemler');click('.sheet [data-act="cal-add"]');chk($('#f-date').value===hd.dataset.v,'o güne işlem ekle tarihli');back();}
 click('[data-act="an"][data-v="harcama"]');click('#secbody [data-act="plan-go"][data-v="butce"]');chk(page()==='plan'&&T.ui.plan==='butce','kategoriden bütçeler');
 click('#view .linkbtn[data-act="an-go"]');chk(!page()&&T.ui.sub==='analiz'&&T.ui.an==='harcama','bütçeden analize');
 click('[data-act="an"][data-v="servet"]');click('#secbody [data-act="open-fire"]');chk(page()==='fire','FIRE sayfası');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='analiz'&&T.ui.an==='servet','FIRE geri analize');
 // hesaplar: piyasa kartı → Piyasalar → geri
 click('#tabbar [data-v="servet"]');click('[data-act="sv"][data-v="yatirim"]');click('.ratecard');chk(page()==='piyasa'&&location.hash==='#piyasa','piyasa kartı Piyasalar sayfasına');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='servet'&&T.ui.sv==='yatirim','Piyasalar’dan geri yatırımlara');
 // hesap → tüm hareketler
 click('[data-act="sv"][data-v="hesap"]');click('#secbody [data-act="acct-open"]');const an=($('.sheet h2')||{}).innerText;chk(!!an,'hesap detayı');click('.sheet [data-act="acct-all"]');
 chk(T.ui.sub==='islem'&&T.ui.acctF===an&&!$('#sheet-root').innerHTML,'tüm hareketler İşlemler’e filtreli: '+T.ui.acctF);
 const rows=[...document.querySelectorAll('#txlist [data-act="edit-tx"]')].map(e=>T.S.tx.find(t=>t.id===e.dataset.id));chk(rows.length&&rows.every(t=>t.acct===an||t.to===an),'filtre doğru hesap');
 click('[data-act="acct-clear"]');chk(!T.ui.acctF,'filtre kaldırıldı');
 T.ui.sub='servet';T.ui.sv='hesap';T.render();click('#secbody [data-act="acct-open"][data-id="Nakit"]');click('.sheet [data-act="acct-exp"]');chk($('#f-acct').value==='Nakit'&&/Yeni|Gider/.test(sheetT()),'hesaptan harcama hesabı seçili');back();
 // ayarlar sekmesi ve alt ayarlar
 click('#tabbar [data-v="ayar"]');click('[data-act="open-set"][data-id="bild"]');chk(page()==='set'&&T.ui.page.s==='bild'&&$('#tabbar').hidden,'bildirim ayarı (alt menü gizli)');
 back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ayar'&&!$('#tabbar').hidden,'alt ayardan ayarlara');back();chk(T.ui.sub==='ev','ayarlardan ana sayfaya');
 // not düzenleyici geri ile kaydeder ve notlara döner
 act('sub',null,'notlar');click('[data-act="new-n"]');const ti=$('#n-title');ti.value='Geri ile kayıt';ti.dispatchEvent(new Event('input',{bubbles:true}));back();await new Promise(r=>setTimeout(r,50));
 chk(T.S.notes.some(n=>n.title==='Geri ile kayıt')&&page()==='notlar','geri tuşu notu kaydetti, notlara döndü');back();await new Promise(r=>setTimeout(r,50));chk(!page(),'notlardan ana sayfaya');
 // kurulum bandı
 const keep=JSON.stringify(T.S);T.S=T.norm({tx:[]});T.render();chk(!!$('.banner [data-v="hesap"]'),'kurulum bandı');click('.banner [data-v="hesap"]');chk(T.ui.sub==='servet'&&T.ui.sv==='hesap','bant hesaplara götürür');T.ui.sub='ev';
 T.S=T.norm(JSON.parse(keep));T.save();
 // geri tuşu sırası
 T.ui.sub='servet';T.render();o.b=[back(),T.ui.sub,back()];chk(o.b[0]===true&&o.b[1]==='ev'&&o.b[2]===false,'geri tuşu sırası '+o.b);
 // uyarı şeridi → pencere → Ödendi
 const rd=new Date();T.S.recurring.push({id:'ra',name:'Uyarı testi',amt:5,day:rd.getDate(),cat:'Fatura',acct:'Banka',paid:{}});T.render();click('.alertbar');chk(/Uyarılar/.test(sheetT()),'uyarı penceresi');const pb=document.querySelector('.sheet [data-act="al-pay"][data-id="ra"]');chk(!!pb,'Ödendi düğmesi');if(pb){const n0=T.S.tx.length;pb.click();chk(T.S.tx.length===n0+1,'uyarıdan ödeme');}back();chk(o.b[0]===true&&o.b[1]==='ev'&&o.b[2]===false,'bölümden geri '+o.b);
 }catch(e){F.push('HATA '+e.message+' @'+String(e.stack||'').split('\n')[1]);}
 return {F,o};});
console.log(r.F.length?'FAIL\n'+r.F.join('\n'):'ALL PASS');
// adres çubuğu ile açılış
for(const h of ['araclar','fire','piyasa','ayar-bild','ayarlar','yok']){await p.goto('http://localhost:8766/index.html#'+h);await p.waitForTimeout(500);const t=await p.evaluate(()=>[document.querySelector('header h1').innerText,location.hash].join(' '));console.log('#'+h,'→',t);}
console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
