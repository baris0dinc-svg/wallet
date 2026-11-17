// 4.41: blokeli tutar, yatırım geçmişi, reel getiri, hesap sıralama, ana sayfada takip listesi, saklı özelliklere kısayol
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/favicons|vemetric|flagcdn/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1200);
const F=await p.evaluate(async()=>{const T=window.__T,o=[];const c=(x,m)=>{if(!x)o.push(m);};const W=ms=>new Promise(r=>setTimeout(r,ms));
  const $=s=>document.querySelector(s),set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};
  const fx=JSON.parse(JSON.stringify(T.S.fx));
  T.S=T.norm({fx,accounts:['Nakit','Banka','Kart'],accx:{Nakit:{type:'nakit'},Banka:{type:'banka'},Kart:{type:'kart',limit:50000}},opening:{Nakit:1000,Banka:90000,Kart:-20000},tx:[],
    holdings:[{id:'f1',name:'Endeks fonu',type:'Fon',qty:1000,cost:10,price:15,since:'2025-01-10'}]});T.save();const S=T.S;T.ui.sub='ev';T.render();
  c(Array.isArray(S.hlog),'hlog dizisi');
  // ---- bloke ----
  T.ACT['edit-a'](null,'Kart');await W(100);c(!!$('#a-blk')&&!$('#row-blk').hidden,'kartta blokeli tutar alanı');
  set('a-blk','-5');T.ACT['save-a']($('[data-act="save-a"]'),'Kart');c(!S.accx.Kart.blk,'eksi bloke kabul edilmez');
  set('a-blk','3500');T.ACT['save-a']($('[data-act="save-a"]'),'Kart');await W(100);
  c(S.accx.Kart.blk===3500&&T.acctBlk('Kart')===3500,'bloke kaydedildi '+JSON.stringify(S.accx.Kart));
  c(T.acctBal('Kart')===-20000,'bloke bakiyeyi değiştirmez');
  const kc=[...document.querySelectorAll('.acard')].find(x=>/Kart/.test(x.innerText));c(kc&&/Bloke\s*₺3\.500/.test(kc.innerText)&&/Kullanılabilir\s*₺26\.500/.test(kc.innerText)&&/%47/.test(kc.innerText),'kartta bloke ve kullanılabilir: '+(kc&&kc.innerText.replace(/\n/g,' ')));
  T.ACT['edit-a'](null,'Nakit');await W(100);c($('#row-blk').hidden,'nakitte bloke alanı yok');T.closeSheet();
  S.accx.Nakit.blk=99;c(T.acctBlk('Nakit')===0,'nakitte bloke sayılmaz');
  // ---- 4.42: hesap penceresinde logo (karttaki ile aynı) ----
  T.renameAcct&&0;S.accounts.push('Garanti');S.accx.Garanti={type:'banka'};T.save();T.render();
  {const gc=[...document.querySelectorAll('.acard')].find(x=>/Garanti/.test(x.innerText));const ci=gc&&gc.querySelector('.aic img');T.ACT['acct-open'](null,'Garanti');const hi=$('.sheet .ghead .sic img');c(!!ci&&!!hi&&hi.dataset.d===ci.dataset.d,'hesap penceresinde kartla aynı logo');T.closeSheet();
   T.ACT['acct-open'](null,'Nakit');await W(100);c(!$('.sheet .ghead .sic img'),'logosu olmayan hesapta simge');T.closeSheet();}
  S.accounts.pop();delete S.accx.Garanti;T.save();T.render();
  // ---- sıralama ----
  c(!!$('[data-act="acct-sort"]'),'Sırala düğmesi');T.ACT['acct-sort']();await W(100);c(document.querySelectorAll('.sheet [data-act="as-mv"]').length===6,'sıralama penceresi');
  T.ACT['as-mv'](null,'Kart','-1');T.ACT['as-mv'](null,'Kart','-1');T.ACT['as-mv'](null,'Kart','-1');c(S.accounts.join()==='Kart,Nakit,Banka','kart başa alındı: '+S.accounts.join());
  T.ACT['as-mv'](null,'Banka','1');c(S.accounts.join()==='Kart,Nakit,Banka','sondaki aşağı gitmez');T.closeSheet();await W(50);
  c(/Kart/.test($('.acard').innerText),'ana sayfada ilk kart değişti');c(T.acctBal('Banka')===90000&&T.acctBal('Kart')===-20000,'sıralama bakiyeyi bozmaz');
  // ---- takip listesi ana sayfada ----
  c(!!$('.mstrip')&&/Takip listem/.test($('.mstrip').innerText)&&document.querySelectorAll('.mstrip .rt').length===Math.min(6,S.watch.length),'ana sayfada takip listem');
  // ---- yatırım geçmişi + reel getiri ----
  const h=S.holdings[0];c(T.hSince(h)==='2025-01-10','ilk alış tarihi');
  const r0=T.hReal(h);c(r0&&isFinite(r0.real)&&r0.real<0.5&&r0.real>-1,'reel getiri nominalden (%50) düşük: '+JSON.stringify(r0));
  T.ACT['h-buy'](null,'f1');await W(100);set('tr-qty','100');set('tr-price','16');$('.sheet [data-act="trade"]').click();await W(150);if($('.sheet [data-act="trade"]'))$('.sheet [data-act="trade"]').click();await W(150);
  T.ACT['h-sell'](null,'f1');await W(100);set('tr-qty','50');set('tr-price','17,5');$('.sheet [data-act="trade"]').click();await W(150);if($('.sheet [data-act="trade"]'))$('.sheet [data-act="trade"]').click();await W(150);
  c(S.hlog.length===2,'iki hareket kaydı: '+JSON.stringify(S.hlog));const hh=T.invHist('f1');c(hh.length===2,'fon geçmişi 2 kayıt');c(T.invHist().length===2,'tüm geçmiş');
  const sl=S.hlog.find(x=>x.pl!=null);c(sl&&Math.abs(sl.pl-(50*17.5-50*(11600/1100)))<0.02,'satış kârı: '+JSON.stringify(sl));
  T.ui.sub='portfoy';T.render();await W(100);const sb=$('#secbody').innerText;
  c(/Yatırım geçmişi/.test(sb)&&/Reel getiri/.test(sb)&&/reel/.test($('.hcard').innerText)&&!!$('.hcard [data-act="inv-hist"]'),'Portföyde geçmiş ve reel getiri');
  T.ACT['inv-hist'](null,'f1');await W(100);c(/Alış/.test($('.sheet').innerText)&&/Satış/.test($('.sheet').innerText),'geçmiş penceresi');T.closeSheet();
  const k=T.norm(JSON.parse(JSON.stringify(S)));c(k.hlog.length===2&&k.accx.Kart.blk===3500&&k.holdings[0].since==='2025-01-10','yedekten dönüşte korunur');
  // ---- 4.43: düzenlemede tarih bugüne dönmez ----
  S.holdings.push({id:'m1',name:'Birikim fonu',type:'Fon',kind:'inv',ccy:'',qty:10,cost:100,price:100});T.save();
  T.ACT['edit-h'](null,'m1');await W(100);set('h-yd','2025-03-04');$('.sheet [data-act="save-h"]').click();await W(150);
  T.ACT['edit-h'](null,'m1');await W(100);c($('#h-yd').value==='2025-03-04'&&$('#h-since').value==='2025-03-04','oransız başlangıç tarihi korunur: '+$('#h-yd').value+' '+$('#h-since').value);
  set('h-since','2024-02-01');set('h-yr','30');set('h-yd','2025-05-06');$('.sheet [data-act="save-h"]').click();await W(150);
  T.ACT['edit-h'](null,'m1');await W(100);c($('#h-yd').value==='2025-05-06'&&$('#h-since').value==='2024-02-01','iki tarih ayrı ayrı korunur: '+$('#h-yd').value+' '+$('#h-since').value);
  $('.sheet [data-act="save-h"]').click();await W(150);{const m=S.holdings.find(z=>z.id==='m1');c(m.yd==='2025-05-06'&&m.since==='2024-02-01','dokunmadan kaydetmek tarihi değiştirmez');}
  S.holdings=S.holdings.filter(z=>z.id!=='m1');T.save();
  // ---- 4.44: aylık gider tabanı, acil durum fonu, FIRE ----
  {const keep=JSON.stringify(S);const d0=new Date();const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
   S.tx=[{id:'e1',type:'exp',amt:120,acct:'Nakit',cat:'Market',date:iso(d0),note:''}];S.recurring=[];S.fire.exp='';S.fire.target='';S.goals=[];T.save();
   c(T.expBase().v===0,'yarım dönemdeki tek gider taban sayılmaz: '+JSON.stringify(T.expBase()));
   const em=T.health().parts.find(x=>x.k==='Acil durum fonu');c(em.v==='—'&&em.act==='exp-set','az veride acil durum fonu ay göstermez: '+em.v);
   c(!T.fireModel().ok,'az veride FIRE hedefi uydurulmaz');
   T.ACT['exp-set']();await W(100);set('ex-m','0');$('.sheet [data-act="exp-save"]').click();c(!!$('#ex-m'),'sıfır gider kabul edilmez');
   set('ex-m','30000');$('.sheet [data-act="exp-save"]').click();await W(100);
   c(T.expBase().v===30000&&T.expBase().src==='man','elle girilen gider kullanılır');const em2=T.health().parts.find(x=>x.k==='Acil durum fonu');
   const liq=T.wealth().g.liquid;c(em2.act==='em-open'&&Math.abs(parseFloat(em2.v.replace(',','.'))-liq/30000)<0.06,'acil durum fonu = likit ÷ aylık gider: '+em2.v+' '+liq);
   const fm=T.fireModel();c(fm.ok&&Math.abs(fm.target-30000*12/fm.wr)<1,'FIRE hedefi = yıllık gider ÷ çekim oranı');
   S.fire.exp='';S.recurring=[{id:'r1',name:'Kira',amt:20000,day:5,cat:'Kira',acct:'Banka',every:1,start:T.curP?T.curP():iso(d0).slice(0,7)}];T.save();
   c(T.expBase().src==='rec'&&T.expBase().v===20000,'kayıt azken düzenli ödemeler taban olur: '+JSON.stringify(T.expBase()));
   S.fire.exp=1;T.save();const big=T.health().parts.find(x=>x.k==='Acil durum fonu');c(big.v==='99+ ay','çok büyük değer 99+ gösterilir: '+big.v);
   const k2=JSON.parse(keep);Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,T.norm(k2));T.save();T.render();}
  // ---- 4.44: Portföy ve Gelişim kartları ana sayfada ----
  {T.ui.sub='ev';T.render();const n0=document.querySelectorAll('#secbody > .card').length;
   c(['pf','yat','yhist','saglik','hedef','fire','koc'].every(k=>T.homeOffs()[k]),'yeni kartlar ilk düzende kapalı');
   T.ACT['home-edit']();await W(100);c(document.querySelectorAll('.sheet [data-act="hl-tog"]').length===14,'düzenle penceresinde 14 kart');
   for(const k of ['pf','yat','yhist','saglik','hedef','fire','koc'])T.ACT['hl-tog'](null,k);T.closeSheet();await W(50);
   const tx=$('#secbody').innerText;c(/Portföyüm/.test(tx)&&/Yatırımlarım/.test(tx)&&/Finansal sağlık/.test(tx)&&/Hedeflerim/.test(tx)&&/Finansal özgürlük/.test(tx)&&/Koç/.test(tx),'yeni kartlar ana sayfada');
   c(/Net Servetim/.test($('#secbody > .card').innerText),'ilk kart Net Servetim');
   const kk=T.norm(JSON.parse(JSON.stringify(S)));c(kk.homeOn&&kk.homeOn.pf===1,'açık kartlar yedekte korunur');
   T.ACT['home-edit']();T.ACT['hl-reset']();T.closeSheet();await W(50);c(!S.homeOn&&document.querySelectorAll('#secbody > .card').length===n0,'varsayılan düzen eski hâline döner');}
  // ---- saklı özellikler ----
  T.ui.sub='ev';T.render();T.ACT['qa-more']();await W(100);
  for(const a of ['qa-fire','qa-koc','qa-takvim','qa-hist','qa-ekstre','qa-sms','qa-yedek','qa-duzen'])c(!!$('.sheet [data-act="'+a+'"]')&&typeof T.ACT[a]==='function',"Tümü'nde "+a);
  T.closeSheet();
  for(const a of ['qa-fire','qa-koc','qa-takvim','qa-hist','qa-ekstre','qa-sms','qa-yedek','qa-duzen']){try{T.ACT[a]();await W(120);}catch(e){o.push(a+' hata: '+e.message);}if(T.ui.page&&window.walletBack)window.walletBack();T.closeSheet();T.ui.page=null;T.ui.sub='ev';T.render();await W(40);}
  T.ui.sub='gelisim';T.ACT.plan(null,null,'hedef');await W(100);c(!!$('.firecard')&&/Finansal özgürlük/.test($('.firecard').innerText),'Hedeflerde FIRE kartı');
  return o;});
if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();process.exit(F.length?1:0);})();
