// 4.27: Analiz › Kategoriler › Nereye gitti — mağazalara göre gruplama, özet, değişim, ayrıntı, açıklamasızlar
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/favicons|vemetric|flagcdn/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const r=await p.evaluate(async()=>{const T=window.__T,S=T.S,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  const k=T.curP(),pk=T.addMonth(k,-1),d=T.isoDate(new Date()),ac=S.accounts[0],E=T.EXPC(),mk=T.monthTx;
  const inP=key=>{const l=mk(key);return l.length?l[0].date:null;};
  // bu dönemin ve önceki dönemin içinden tarih
  const dk=(T.monthTx(k).find(t=>1)||{}).date||d;
  const pd=(()=>{for(let i=20;i<70;i++){const x=new Date();x.setDate(x.getDate()-i);const s=T.isoDate(x);if(T.pkey?T.pkey(s)===pk:s.slice(0,7)===pk)return s;}return null;})();
  S.tx=[];S.recurring=[];{const x=new Date();x.setDate(x.getDate()-100);S.openDate=T.isoDate(x);}
  const add=(id,amt,note,date,cat,type)=>S.tx.push({id,type:type||'exp',amt,acct:ac,cat:cat||E[0],date:date||d,note});
  add('w1',1425.4,'Trendyol');add('w2',1,'trendyol');add('w3',800,'Trendyol siparişi');add('w4',3536.25,'Getir');add('w5',300,'Getir',null,E[1]);
  add('w6',120,'köşedeki bakkal');add('w7',80,'Köşedeki  bakkal');add('w8',50,'');add('w9',1,'Trendyol',null,null,'inc');
  for(let i=0;i<8;i++)add('wx'+i,10+i,'yer '+i);
  if(pd){add('wp1',1000,'Getir',pd);add('wp2',100,'Migros',pd);}
  T.save();T.ui.month=k;T.ui.sub='analiz';T.ui.an='harcama';T.ui.page=null;T.render();await W(200);
  const card=document.querySelector('.wcard');c(!!card,'Nereye gitti kartı');if(!card)return o;
  const rows=[...card.querySelectorAll('.wrow')];c(rows.length===6,'ilk 6 yer: '+rows.length);
  c(/Getir/.test(rows[0].innerText)&&/2 işlem/.test(rows[0].innerText),'en çok Getir, 2 işlem: '+rows[0].innerText.replace(/\n/g,' '));
  c(/Trendyol/.test(rows[1].innerText)&&/3 işlem/.test(rows[1].innerText),'Trendyol yazımları birleşti, gelir sayılmadı: '+rows[1].innerText.replace(/\n/g,' '));
  c(rows.some(x=>/köşedeki bakkal/i.test(x.innerText)&&/2 işlem/.test(x.innerText)),'tanınmayan açıklama da gruplanır');
  c(/Harcamanın %\d+’i 3 yere gitti: Getir, Trendyol, köşedeki bakkal\./.test(card.querySelector('.wsum').innerText),'özet: '+card.querySelector('.wsum').innerText);
  c(/Açıklamasız 1 işlem/.test(card.innerText),'açıklamasızlar ayrı yazılır');
  if(pd){c(/▲%\d+/.test(rows[0].innerText),'Getir geçen döneme göre arttı: '+rows[0].innerText.replace(/\n/g,' '));c(/yeni/.test(rows[1].innerText),'Trendyol yeni');}
  const btn=card.querySelector('[data-act="w-all"]');c(!!btn&&/Tümünü göster \(\d+ yer\)/.test(btn.innerText),'tümünü göster');
  T.ACT['w-all'](null,null,k);c(document.querySelectorAll('.wcard .wrow').length>6,'hepsi açıldı');T.ACT['w-all'](null,null,k);
  // ayrıntı
  T.ACT['w-open'](null,null,'d:getir.com');await W(200);const sh=document.querySelector('.sheet');
  c(!!sh&&/Getir/.test(sh.innerText)&&/2 işlem · ortalama/.test(sh.innerText)&&sh.querySelectorAll('.list .item').length===2,'Getir ayrıntısı: '+(sh&&sh.innerText.slice(0,160)));
  if(pd)c(!!sh.querySelector('.ctrend'),'son 6 dönem');
  T.closeSheet();
  // yalnızca önceki dönemde olan yer: son işlemler ve arama
  if(pd){T.ACT['w-open'](null,null,'d:migros.com.tr');await W(150);c(/Son işlemler/.test(document.querySelector('.sheet').innerText),'bu dönemde yoksa son işlemler');T.closeSheet();}
  T.ACT['w-search'](null,null,'Getir');c(T.ui.sub==='islem'&&T.ui.tq==='Getir','tüm işlemler aramaya gider');
  // açıklamasız dönem
  S.tx=S.tx.filter(t=>!/^w/.test(t.id));add('wn',50,'');T.save();T.ui.sub='analiz';T.ui.tq='';T.render();
  c(/açıklama yok/.test((document.querySelector('.wcard')||{}).innerText||''),'hepsi açıklamasızsa ipucu');
  S.tx=S.tx.filter(t=>!/^w/.test(t.id));T.save();T.render();
  return o;});
const F=[...r];if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
