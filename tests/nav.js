// Yönlendirme testi: her düğme doğru yere gidiyor mu, geri tuşu doğru sırayla dönüyor mu
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[],o={};const $=s=>document.querySelector(s),$$q=s=>[...document.querySelectorAll(s)];const chk=(c,m)=>{if(!c)F.push(m);};try{
 const click=s=>{const e=$(s);if(!e){F.push('bulunamadı '+s);return false;}e.click();return true;};
 const sheetT=()=>($('.sheet h2')||{}).innerText||'';const page=()=>T.ui.page&&T.ui.page.k;const back=()=>window.walletBack();const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 // alt menü: 5 sekme, her biri doğru bölüm ve başlık
 chk($$q('#tabbar button[data-act="sub"]').length===3&&!$('#tabbar .tbadd')&&!$('#tabbar').hidden,'4.34: alt menüde 3 sekme, + yok');
 chk(!!$('#wealth [data-act="sv"][data-v="yatirim"]')&&!!$('#wealth .nwchart'),'4.31: Hesaplar ana sayfada (sekmeler ve gelişim grafiği)');
 click('#tabbar [data-v="gelisim"]');chk($$q('#glbar button').length===6&&/Özet/.test($('#glbar').innerText)&&/Koç/.test($('#glbar').innerText),'4.31: Gelişim’de Analiz ve Plan bölümleri tek satırda');click('#tabbar [data-v="ev"]');
 click('#tabbar [data-v="ev"]');click('.linkbtn[data-act="tx-all"]');chk(T.ui.sub==='islem'&&/İşlemler/.test($('header h1').innerText)&&!!$('header [data-act="sub"][data-v="ev"]')&&$('#tabbar [aria-current="page"]').dataset.v==='ev','4.34: İşlemler ana sayfadan açılır, geri oku ve Ana Sayfa seçili');click('header [data-act="sub"][data-v="ev"]');chk(T.ui.sub==='ev','İşlemler’den geri Ana Sayfa');
 for(const [k,t] of [['gelisim','Gelişim'],['ayar','Ayarlar'],['ev','Wallet']]){click('#tabbar [data-v="'+k+'"]');chk(T.ui.sub===k&&$('header h1').innerText.includes(t)&&$('#tabbar [aria-current="page"]').dataset.v===k,'sekme '+k);}
 // hızlı işlemler (pencereler)
 const want={'qa-inc':/Gelir ekle/,'qa-exp':/Gider ekle/,'qa-cash':/Nakit/,'qa-bank':/Banka/,'qa-trf':/Transfer/,'qa-debt':/Borç/,'qa-inv':/Yatırım ekle/,'qa-save':/Birikim/,'qa-asset':/Varlık ekle/};
 for(const k in want){T.ACT[k]();chk(want[k].test(sheetT()),k+' → '+sheetT());if(k==='qa-inc')chk($('#f-type [aria-pressed="true"]').dataset.v==='inc','gelir türü seçili');if(k==='qa-exp')chk($('#f-type [aria-pressed="true"]').dataset.v==='exp','gider türü');back();chk(!$('#sheet-root').innerHTML,k+' geri kapatır');}
 // ana sayfa: kalan kartı, işlem ekle, Koç, piyasa şeridi, notlar ve hesaplayıcılar, ayarlar
 chk(!!$('#left-now'),'bu dönem kalan');
 // 4.12: İşlem ekle kartı kaldırıldı (Gelir/Gider/Transfer düğmeleri yeter); sesle ekleme başlıkta
 chk(!$('.addmain')&&!$('.addcard'),'işlem ekle kartı yok');chk(!$('header [data-act="voice"]')&&!$('header [data-v="notlar"]')&&$$q('header .icon-btn').length===2,'4.30: başlıkta yalnız uyarılar ve ayarlar');
 click('#qa [data-act="qa-exp"]');chk(/Gider ekle/.test(sheetT()),'Gider düğmesi işlem penceresi');back();
 click('.nwbig');chk(T.ui.sub==='ev'&&!!$('.nw .big'),'net servet Hesaplar’a');click('#tabbar [data-v="ev"]');
 // 4.30: Gündem kartı yok; uyarılar zilde, Koç Plan › Koç'ta
 chk(!$('.gundem')&&!$('.cochome'),'4.30: ana sayfada Gündem yok');
 click('#tabbar [data-v="gelisim"]');click('[data-act="plan"][data-v="koc"]');chk(T.ui.sub==='gelisim'&&T.ui.plan==='koc'&&!!$('#view .kocnow'),'Plan › Koç');
 {const tl=$('#view .homelinks'),rm=[...document.querySelectorAll('#view .card h2')].find(e=>/Yol haritan/.test(e.innerText));chk(tl&&rm&&(tl.compareDocumentPosition(rm)&4)&&($('#view .kocnow').compareDocumentPosition(tl)&4),'Koç: Hesaplayıcılar ve Claude’a sor şu anki adımın hemen altında');}
 click('#view .kt[data-act="an-go"][data-v="ozet"]');chk(T.ui.sub==='gelisim'&&T.ui.an==='ozet','Koç › Tasarruf oranı Analiz › Özet’e');
 click('#tabbar [data-v="ev"]');
 click('.mstrip');chk(page()==='piyasa'&&location.hash==='#piyasa','piyasa şeridi Piyasalar sayfasına');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ev','piyasadan geri');
 // 4.2: Notlar ana sayfa başlığındaki simgede (tek dokunuş); Hesaplayıcılar Plan › Koç'ta (ana sayfadaki kutucuklar kaldırıldı)
 chk(!!$('header .bellb')&&!!$('#qa')&&!$('.scg'),'4.29: ana sayfada zil ve hızlı işlemler; kısayol kutucukları kalktı (sekmelerde var)');
 click('#qa [data-act="qa-more"]');click('#qaall [data-act="qa-notes"]');chk(page()==='notlar'&&location.hash==='#notlar','Tümü › Notlar');back();await new Promise(r=>setTimeout(r,50));chk(!page(),'notlardan geri');
 click('#tabbar [data-v="gelisim"]');click('[data-act="plan"][data-v="koc"]');click('#view .homelinks [data-act="qa-calc"]');chk(page()==='araclar','Koç › Hesaplayıcılar');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='gelisim','hesaplayıcılardan geri Plan’a');
 // işlem ekle her sekmeden tek dokunuş: ana sayfada kart, diğerlerinde + düğmesi
 for(const k of ['gelisim','ayar','ev']){click('#tabbar [data-v="'+k+'"]');chk($('#fab').hidden,'4.34: yüzen + yok '+k);}
 act('new-tx');chk(/Yeni işlem/.test(sheetT()),'işlem penceresi');back();chk(!!$('.nwring svg')&&/Net Servetim/.test($('.hero').innerText),'4.34: Net Servetim kartında varlık halkası');
 click('#tabbar [data-v="ev"]');chk(!!$('#wealth .acards .acard')&&!!$('.card .donut'),'4.33: ana sayfada hesap kartları ve harcama halkası');
 click('#tabbar [data-v="ayar"]');chk(!page()&&T.ui.sub==='ayar'&&$$q('#setlist .setcard').length===5&&!$('#setlist .setgrp')&&$('#tabbar [aria-current="page"]').dataset.v==='ayar','4.32: Ayarlar sekmesi, beş başlık, grup yok');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ev','ayarlardan geri');
 // Plan sekmesi: Koç, Bütçe, Düzenli, Hedefler
 click('#tabbar [data-v="gelisim"]');click('[data-act="plan"][data-v="hedef"]');chk(T.ui.plan==='hedef'&&!!$('#view [data-act="new-g"]'),'Plan › Hedefler');
 click('[data-act="plan"][data-v="duzenli"]');chk(!!$('#view [data-act="new-r"]'),'Plan › Düzenli');
 click('[data-act="plan"][data-v="koc"]');click('#view .kt[data-act="open-fire"]');chk(page()==='fire','Koç › FIRE');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='gelisim','FIRE’dan geri Plan’a');
 click('#tabbar [data-v="ev"]');
 chk($$q('.list [data-act="edit-tx"]').length===5,'son 5 işlem');click('.linkbtn[data-v="islem"]');chk(T.ui.sub==='islem','son işlemler Tümü');
 // işlemler: 4.2'de Bugün / Bu hafta kaldırıldı; tek zaman denetimi dönem kartı, liste gün gün (gün toplamlarıyla)
 chk(document.querySelectorAll('[data-act="rng"]').length===5&&!!$('.period .mnav')&&!$('header [data-act="eye"]'),'dönem görünümü ve zaman çipleri');click('[data-act="rng"][data-v="gun"]');chk(T.ui.rng==='gun'&&!$('.period .mnav'),'Bugün görünümü');click('[data-act="rng"][data-v="ay"]');
 const td=T.todayS();T.S.tx.push({id:'tdy',type:'exp',amt:12,cat:'Market',acct:'Nakit',date:td});T.ui.month=T.curP();T.render();
 chk(!!$('#txlist [data-act="edit-tx"][data-id="tdy"]')&&$('#txlist .day').innerText.includes(new Date().getDate()),'bugünün işlemi en üstteki gün başlığında');T.S.tx=T.S.tx.filter(t=>t.id!=='tdy');T.render();
 // 4.4: takvim İşlemler'in ikinci görünümü (başlıktaki düğme); dönem kartı iki görünümde ortak
 chk(!!$('header [data-act="tx-view"][aria-pressed="false"]')&&!$('.cd'),'İşlemler liste görünümünde açılır, başlıkta takvim düğmesi');
 click('header [data-act="tx-view"]');const days=$$q('.cd:not(.out)');chk(T.ui.sub==='islem'&&T.ui.txv==='cal'&&days.length>=28&&days.length<=31,'takvim günleri '+days.length);
 chk(!!$('#secbody .period .mnav')&&$$q('#secbody .mnav').length===1&&!$('#txlist'),'takvimde dönem kartı (tek ay oku), liste yok');
 const hd=$('.cd.has');chk(!!hd,'işlem olan gün işaretli');if(hd){hd.click();chk($$q('.sheet [data-act="edit-tx"]').length>0,'güne dokununca işlemler');click('.sheet [data-act="cal-add"]');chk($('#f-date').value===hd.dataset.v,'o güne işlem ekle tarihli');back();}
 {const m0=T.ui.month;click('#secbody [data-act="mprev"]');chk(T.ui.txv==='cal'&&T.ui.month===T.addMonth(m0,-1)&&!!$('.cd'),'takvimde önceki aya geçilir');T.ui.month=T.curP();T.render();}
 click('header [data-act="tx-view"]');chk(T.ui.txv==='list'&&!!$('#txlist')&&!$('.cd'),'takvimden listeye');
 click('header [data-act="tx-view"]');click('#tabbar [data-v="ev"]');click('.linkbtn[data-act="tx-all"]');chk(T.ui.sub==='islem'&&T.ui.txv==='list'&&!!$('#txlist'),'Son işlemler › Tümü her zaman listeyi açar');
 click('header [data-act="tx-view"]');click('#tabbar [data-v="ev"]');chk(!$('header [data-act="srch"]'),'4.30: başlıkta ara düğmesi yok');click('.linkbtn[data-act="tx-all"]');if(T.ui.txv==='cal')click('header [data-act="tx-view"]');chk(T.ui.txv==='list'&&!!$('#tq'),'arama İşlemler listesinde');click('#tabbar [data-v="ev"]');
 act('an-go',null,'takvim');chk(T.ui.sub==='islem'&&T.ui.txv==='cal'&&!!$('.cd'),'eski Analiz › Takvim bağlantısı İşlemler takvimine gider');T.ui.txv='list';
 click('#tabbar [data-v="gelisim"]');click('[data-act="an"][data-v="harcama"]');chk(!$('#secbody [data-act="plan-go"]')&&!/En büyük harcamalar|Dağılım/.test($('#secbody').innerText),'4.30: Kategoriler’de tekrar eden pasta, Bütçeler kartı ve En büyük harcamalar yok');
 click('#tabbar [data-v="gelisim"]');click('[data-act="plan"][data-v="butce"]');chk(!page()&&T.ui.sub==='gelisim'&&T.ui.plan==='butce','Plan › Bütçe');
 chk(!$('#view .linkbtn[data-act="an-go"]'),'4.30: Bütçe’de Analiz’e dönen bağlantı yok (alt menüde var)');
 click('#tabbar [data-v="gelisim"]');chk($$q('[data-act="an"]').length===2&&!$('[data-act="an"][data-v="takvim"]')&&/Kategoriler/.test($('[data-act="an"][data-v="harcama"]').innerText),'Analiz: Özet, Kategoriler (Takvim İşlemler’de)');
 act('an',null,'servet');chk(T.ui.sub==='ev'&&!!$('#secbody .nwchart'),'eski Analiz › Servet Hesaplar’daki net servet grafiğine gider');
 click('#secbody [data-act="nwr"][data-v="12"]');chk(T.ui.nwr===12&&!!$('#secbody [data-act="nwr"][data-v="12"][aria-pressed="true"]'),'grafik süresi 1 yıl');
 // hesaplar: piyasa kartı → Piyasalar → geri
 click('#tabbar [data-v="ev"]');click('[data-act="sv"][data-v="yatirim"]');click('#secbody .setcard[data-act="open-mkt"]');chk(page()==='piyasa'&&location.hash==='#piyasa','piyasa kartı Piyasalar sayfasına');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ev'&&T.ui.sv==='yatirim','Piyasalar’dan geri yatırımlara');
 // 4.4: Hesaplar alt sekmeleri Hesaplar, Yatırımlar, Borçlar; ev/araba gibi varlıklar Yatırımlar'ın altında ayrı bölüm
 chk($$q('[data-act="sv"]').length===3&&!$('[data-act="sv"][data-v="varlik"]'),'Hesaplar: 3 alt sekme');
 {const hc=$$q('#secbody .hcard'),ab=$('#secbody [data-act="new-h"][data-v="inv"]'),vs=$('#secbody #varliklar'),mk=$('#secbody [data-act="open-mkt"]');
  chk(hc.length>0&&ab&&vs&&mk&&(hc[hc.length-1].compareDocumentPosition(ab)&4)&&(ab.compareDocumentPosition(vs)&4)&&(vs.compareDocumentPosition(mk)&4),'Yatırımlar: elindekiler → Yatırım ekle → varlıklar → Piyasalar');
  chk(!!$('#secbody [data-act="new-h"][data-v="asset"]'),'Yatırımlar’da Varlık ekle');}
 T.S.holdings.push({id:'evx',name:'Ev',type:'Gayrimenkul',kind:'asset',qty:1,cost:3000000,price:3500000});T.ui.sv='hesap';T.render();
 act('sv-go',null,'varlik');await new Promise(r=>setTimeout(r,30));chk(T.ui.sub==='ev'&&T.ui.sv==='yatirim'&&!!$('#varliklar ~ .hcard [data-act="edit-h"][data-id="evx"]'),'eski Varlıklar bağlantısı Yatırımlar’daki varlık bölümüne gider');
 act('sv',null,'varlik');chk(T.ui.sv==='yatirim','eski varlik alt sekme adı');T.S.holdings=T.S.holdings.filter(h=>h.id!=='evx');T.render();
 // liste ekranlarında "… ekle" listenin altında
 for(const [pl,a] of [['hedef','new-g'],['duzenli','new-r']]){T.ui.sub='plan';T.ui.plan=pl;T.render();const items=$$q('#secbody .card'),b=$('#secbody [data-act="'+a+'"]');chk(b&&items.length&&(items[items.length-1].compareDocumentPosition(b)&4),pl+': ekle düğmesi listenin altında');}
 T.ui.sub='servet';T.ui.sv='borc';T.render();{const b=$('#secbody [data-act="new-d"]'),l=$('#secbody [data-act="edit-d"]');chk(b&&l&&(l.compareDocumentPosition(b)&4),'Borçlar: Borç ekle listenin altında');}
 T.ui.sv='yatirim';T.render();
 // hesap → tüm hareketler
 click('[data-act="sv"][data-v="hesap"]');click('#secbody [data-act="acct-open"]');const an=($('.sheet h2')||{}).innerText;chk(!!an,'hesap detayı');click('.sheet [data-act="acct-all"]');
 chk(T.ui.sub==='islem'&&T.ui.acctF===an&&!$('#sheet-root').innerHTML,'tüm hareketler İşlemler’e filtreli: '+T.ui.acctF);
 const rows=[...document.querySelectorAll('#txlist [data-act="edit-tx"]')].map(e=>T.S.tx.find(t=>t.id===e.dataset.id));chk(rows.length&&rows.every(t=>t.acct===an||t.to===an),'filtre doğru hesap');
 click('[data-act="acct-clear"]');chk(!T.ui.acctF,'filtre kaldırıldı');
 T.ui.sub='servet';T.ui.sv='hesap';T.render();click('#secbody [data-act="acct-open"][data-id="Nakit"]');click('.sheet [data-act="acct-exp"]');chk($('#f-acct').value==='Nakit'&&/Yeni|Gider/.test(sheetT()),'hesaptan harcama hesabı seçili');back();
 // ayarlar sekmesi ve alt ayarlar
 click('#tabbar [data-v="ev"]');click('#tabbar [data-v="ayar"]');click('[data-act="open-set"][data-id="bild"]');chk(page()==='set'&&T.ui.page.s==='bild'&&$('#tabbar').hidden,'bildirim ayarı (alt menü gizli)');
 back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ayar','alt ayardan ayarlara');back();await new Promise(r=>setTimeout(r,50));chk(!page()&&T.ui.sub==='ev'&&!$('#tabbar').hidden,'ayarlardan ana sayfaya');
 // not düzenleyici geri ile kaydeder ve notlara döner
 act('sub',null,'notlar');click('[data-act="new-n"]');const ti=$('#n-title');ti.value='Geri ile kayıt';ti.dispatchEvent(new Event('input',{bubbles:true}));back();await new Promise(r=>setTimeout(r,50));
 chk(T.S.notes.some(n=>n.title==='Geri ile kayıt')&&page()==='notlar','geri tuşu notu kaydetti, notlara döndü');back();await new Promise(r=>setTimeout(r,50));chk(!page(),'notlardan ana sayfaya');
 // kurulum bandı
 const keep=JSON.stringify(T.S);T.S=T.norm({tx:[]});T.render();chk(!!$('.banner [data-act="open-bal"]'),'kurulum bandı');click('.banner [data-act="open-bal"]');
 const obs=$$q('.sheet [data-ob]');chk(/Hesaplarındaki para/.test(sheetT())&&obs.length===T.S.accounts.length,'bakiyeler tek pencerede '+obs.length);
 obs[0].value='1.500';obs[1].value='-250';click('.sheet [data-act="save-bal"]');chk(T.S.opening[T.S.accounts[0]]===1500&&T.S.opening[T.S.accounts[1]]===-250&&!$('#sheet-root').innerHTML&&!$('.banner [data-act="open-bal"]'),'başlangıç bakiyeleri kaydedildi '+JSON.stringify(T.S.opening));T.ui.sub='ev';
 T.S=T.norm(JSON.parse(keep));T.save();
 // geri tuşu sırası
 T.ui.sub='gelisim';T.render();o.b=[back(),T.ui.sub,back()];chk(o.b[0]===true&&o.b[1]==='ev'&&o.b[2]===false,'geri tuşu sırası '+o.b);
 // uyarı şeridi → pencere → Ödendi
 // uyarılar Gündem'de düğmeleriyle: Ödendi tek dokunuş, sonra tutar düzeltilebilir (değişken faturalar)
 const rd=new Date();T.S.recurring.push({id:'ra',name:'Uyarı testi',amt:5,day:rd.getDate(),cat:'Fatura',acct:'Banka',paid:{}});T.render();
 click('header [data-act="alerts"]');const pb=$('.sheet [data-act="al-pay"][data-id="ra"]');chk(!!pb,'zildeki uyarılarda Ödendi düğmesi');
 if(pb){const n0=T.S.tx.length;pb.click();chk(T.S.tx.length===n0+1,'zilden tek dokunuşla ödeme');chk(!$('.sheet [data-act="al-pay"][data-id="ra"]'),'ödenen uyarı kalktı');if($('#sheet-root').innerHTML)act('close');
  const tb=$('#toast button');chk(tb&&/Tutarı düzenle/.test(tb.innerText),'ödeme sonrası tutar düzeltme');if(tb){tb.click();chk(/İşlemi düzenle/.test(sheetT())&&$('#f-amt').value==='5','düzeltme penceresi ödeme işlemini açar');back();}}
 T.S.recurring=T.S.recurring.filter(r=>r.id!=='ra');T.render();chk(o.b[0]===true&&o.b[1]==='ev'&&o.b[2]===false,'bölümden geri '+o.b);
 }catch(e){F.push('HATA '+e.message+' @'+String(e.stack||'').split('\n')[1]);}
 return {F,o};});
console.log(r.F.length?'FAIL\n'+r.F.join('\n'):'ALL PASS');
// adres çubuğu ile açılış
for(const h of ['araclar','fire','piyasa','ayar-bild','ayarlar','yok']){await p.goto('http://localhost:8766/index.html#'+h);await p.waitForTimeout(500);const t=await p.evaluate(()=>[document.querySelector('header h1').innerText,location.hash].join(' '));console.log('#'+h,'→',t);}
console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
