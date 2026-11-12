// 4.38: derin tarama. Üç ekran genişliği / tema / veri durumunda her sekme, alt sekme, ayar sayfası, pencere ve eski adres açılır;
// NaN/undefined metni, yatay taşma, kesik metin, tanımsız eylem, çift id, adsız düğme, 28 px'ten küçük dokunma alanı ve JS hatası aranır.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ALL=[];
for(const [w,cs,scen] of [[390,'dark','sample'],[320,'light','sample'],[360,'dark','empty']]){
 const ctx=await b.newContext({viewport:{width:w,height:780},colorScheme:cs,reducedMotion:'reduce'});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('JS: '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|ERR_|favicon/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1500);
 const r=await p.evaluate(async(scen)=>{const T=window.__T,W=ms=>new Promise(r=>setTimeout(r,ms)),F=[];const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  if(scen==='empty'){T.ACT['sample-clear']();await W(200);}
  const where=()=>T.ui.sub+'/'+(T.ui.gl||'')+'/'+(T.ui.page?T.ui.page.k+(T.ui.page.s?':'+T.ui.page.s:''):'')+($('.sheet h2')?' ['+$('.sheet h2').innerText.slice(0,30)+']':'');
  const seen={};const add=(m)=>{const k=m;if(!seen[k]){seen[k]=1;F.push(m);}};
  const check=(tag)=>{const at=tag||where();const t=document.body.innerText;const m=t.match(/NaN|undefined|Infinity|\[object|\bnull\b/);if(m){const i=t.indexOf(m[0]);add('METİN '+m[0]+' @'+at+' «'+t.slice(Math.max(0,i-40),i+30).replace(/\n/g,' ')+'»');}
   const vw=document.documentElement.clientWidth;
   if(document.documentElement.scrollWidth>vw+1)add('SAYFA YATAY TAŞIYOR @'+at+' '+document.documentElement.scrollWidth+'>'+vw);
   $$('#view *, .sheet *, header *, #tabbar *').forEach(e=>{if(e.closest('.scroll-x,.acards,.upc,svg,.mstrip,.calcseg,[hidden]'))return;const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')return;
     if(r.right>vw+1||r.left<-1)add('ÖĞE TAŞIYOR @'+at+' <'+e.tagName.toLowerCase()+'.'+(e.className&&e.className.baseVal===undefined?String(e.className).split(' ')[0]:'')+'> «'+(e.innerText||'').slice(0,30).replace(/\n/g,' ')+'» '+Math.round(r.left)+'..'+Math.round(r.right));
     if(e.children.length===0&&e.scrollWidth>e.clientWidth+2&&cs.overflow!=='visible'&&cs.textOverflow!=='ellipsis'&&e.innerText&&e.tagName!=='INPUT'&&e.tagName!=='SELECT'&&e.tagName!=='TEXTAREA')add('METİN KESİK @'+at+' «'+e.innerText.slice(0,40)+'»');});
   $$('[data-act]').forEach(e=>{const a=e.dataset.act;if(!T.ACT[a])add('EYLEM YOK: '+a+' @'+at);});
   const ids={};$$('[id]').forEach(e=>{if(ids[e.id])add('ÇİFT ID #'+e.id+' @'+at);ids[e.id]=1;});
   $$('#view button, .sheet button, header button, #tabbar button').forEach(e=>{if(e.closest('[hidden]'))return;const r=e.getBoundingClientRect();if(!r.width)return;if(!(e.textContent||'').trim()&&!e.getAttribute('aria-label')&&!e.title)add('ADSIZ DÜĞME '+e.outerHTML.slice(0,90));if(r.height<28||r.width<28){const k='KÜÇÜK '+(e.dataset.act||'')+' '+e.className;if(!seen[k]){seen[k]=1;F.push('KÜÇÜK DOKUNMA ALANI @'+at+' '+Math.round(r.width)+'x'+Math.round(r.height)+' act='+e.dataset.act+' «'+((e.textContent||e.getAttribute('aria-label')||'').slice(0,25))+'»');}}});
  };
  const A=async(a,id,v)=>{try{T.ACT[a](null,id,v);}catch(e){add('HATA eylem '+a+'('+id+','+v+'): '+e.message);}await W(70);};
  const closeAll=async()=>{let n=0;while(($('#sheet-root')||{}).innerHTML&&n++<4){T.ACT.close();await W(40);}};
  for(const s of ['ev','gelisim','portfoy','ayar','islem']){await A('sub',null,s);check();}
  for(const g of ['ozet','harcama','butce','duzenli','hedef','koc']){await A('sub',null,'gelisim');await A(['ozet','harcama'].includes(g)?'an':'plan',null,g);check();if(T.ui.gl!==g)add('gl '+g+' açılmadı');}
  await A('sub',null,'ev');for(const sv of ['hesap','borc']){await A('sv',null,sv);check('ev/'+sv);}
  await A('sub',null,'islem');for(const v of ['list','cal']){T.ui.txv=v;T.render();await W(60);check('islem/'+v);}
  for(const s of T.SETS){await A('open-set',s.id);check();window.walletBack();await W(40);}
  // pencereler
  await A('sub',null,'ev');
  for(const q of ['qa-inc','qa-exp','qa-trf','qa-inv','qa-debt','qa-cash','qa-bank','qa-save','qa-asset','qa-more','alerts','home-edit','new-tx','new-a','new-h','new-g','new-r','new-d','open-bal','ai-open']){if(!T.ACT[q]){add('eylem tanımsız '+q);continue;}await A(q);check('pencere '+q);await closeAll();if(T.ui.page){window.walletBack();await W(40);}}
  for(const pg of ['qa-mkt','qa-calc','qa-notes','open-fire']){if(!T.ACT[pg])continue;await A('sub',null,'ev');await A(pg);check('sayfa '+pg);window.walletBack();await W(60);}
  // düzenleme pencereleri
  if(T.S.tx[0]){await A('edit-tx',T.S.tx[0].id);check('edit-tx');await closeAll();}
  const ac=(T.S.accounts||T.S.accts||Object.keys(T.S.opening||{}))[0];if(ac){await A('acct-open',ac);check('acct-open');await closeAll();}
  if(T.S.holdings[0]){await A('edit-h',T.S.holdings[0].id);check('edit-h');await closeAll();}
  if(T.S.goals&&T.S.goals[0]){await A('edit-g',T.S.goals[0].id);check('edit-g');await closeAll();}
  if(T.S.recurring[0]){await A('edit-r',T.S.recurring[0].id);check('edit-r');await closeAll();}
  if(T.S.debts&&T.S.debts[0]){await A('edit-d',T.S.debts[0].id);check('edit-d');await closeAll();}
  // gerçek akış: gider ekle
  await A('sub',null,'ev');const n0=T.S.tx.length;await A('qa-exp');const am=$('.sheet #f-amt, .sheet input[inputmode="decimal"]');if(am){am.value='123,45';am.dispatchEvent(new Event('input',{bubbles:true}));const sv=$('.sheet [data-act="save-tx"]');if(sv){sv.click();await W(150);if(T.S.tx.length!==n0+1){const er=(($('.sheet .err')||{}).innerText||'');if(/tekrar dokun/.test(er)){sv.click();await W(150);}if(T.S.tx.length!==n0+1)add('gider eklenemedi: '+er);}}else add('save-tx düğmesi yok');}else add('tutar kutusu yok');await closeAll();check('gider sonrası ana sayfa');
  // geri tuşu zinciri
  await A('sub',null,'portfoy');const bk=window.walletBack();if(!bk||T.ui.sub!=='ev')add('Portföy’den geri Ana Sayfa değil: '+T.ui.sub);
  await A('tx-all');if(T.ui.sub!=='islem')add('tx-all');window.walletBack();await W(40);if(T.ui.sub!=='ev')add('İşlemler’den geri: '+T.ui.sub);
  for(const h of ['#plan','#analiz','#hesaplar','#ayarlar','#koc','#planlama','#portfoy','#yatirim','#islemler','#butce','#duzenli','#hedef','#piyasa','#notlar','#araclar']){location.hash=h;await W(120);check('adres '+h);}
  location.hash='';await W(80);
  return F;},scen);
 ALL.push({w,cs,scen,F:r,errs});await ctx.close();}
let bad=0;for(const x of ALL){bad+=x.F.length+x.errs.length;console.log('=== '+x.w+'px '+x.cs+' '+x.scen+': '+x.F.length+' bulgu, '+x.errs.length+' konsol');x.F.forEach(f=>console.log('  '+f));x.errs.slice(0,8).forEach(f=>console.log('  '+f));}
console.log(bad?'HATA: '+bad+' bulgu':'ALL PASS');await b.close();process.exit(bad?1:0);})();
