// Taşma taraması: her bölüm/sayfa/pencerede yatay taşma ve kesilen metin
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const res=[];
for(const W of [320,360,412]){for(const scheme of ['light','dark']){
 const ctx=await b.newContext({viewport:{width:W,height:760},colorScheme:scheme});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
 const r=await p.evaluate(async()=>{const T=window.__T,out=[];
  const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
  // daha zorlu veri: uzun adlar, büyük sayılar
  T.S.accounts.push('Ziraat Bankası Vadesiz Maaş Hesabı');T.S.opening['Ziraat Bankası Vadesiz Maaş Hesabı']=12345678.9;
  T.S.tx.push({id:'big',type:'exp',amt:1234567.89,cat:'Market',acct:'Ziraat Bankası Vadesiz Maaş Hesabı',date:T.todayS(),note:'Çok uzun bir açıklama metni burada yer alıyor ve taşmamalı'});
  T.S.debts.push({id:'dd',name:'Konut kredisi uzun isim',type:'Kredi',amt:4567890});
  T.S.notes.push({id:'nn',title:'Uzun başlıklı bir not başlığı burada tek satırda kalmalı',body:'x',ts:Date.now(),cts:Date.now(),arch:false});
  T.save();T.render();
  const check=(label)=>{const vw=document.documentElement.clientWidth;
    if(document.documentElement.scrollWidth>vw+1)out.push(label+': SAYFA YATAY KAYIYOR '+document.documentElement.scrollWidth);
    document.querySelectorAll('#view *, .sheet *').forEach(el=>{
      if(el.closest('.scroll-x,.qa:not(.grid4),.secin,.calcseg,svg,select,option'))return;
      const cs=getComputedStyle(el);if(cs.display==='none'||el.offsetParent===null&&cs.position!=='fixed')return;
      const r=el.getBoundingClientRect();if(r.width===0)return;
      if(r.right>vw+0.5||r.left<-0.5){if(!el.closest('.qawrap,.secbar'))out.push(label+': dışarı taşıyor <'+el.tagName.toLowerCase()+' class="'+el.className+'"> '+Math.round(r.left)+'-'+Math.round(r.right)+' '+(el.innerText||'').slice(0,40));}
      const txt=el.childNodes.length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
      if(txt&&el.scrollWidth>el.clientWidth+1&&cs.overflow!=='visible'&&!/ell/.test(el.className)&&!el.matches('.item .t,.note-row .t,.note-card .t')&&el.tagName!=='INPUT'&&el.tagName!=='TEXTAREA')out.push(label+': kesik metin <'+el.tagName.toLowerCase()+' class="'+el.className+'"> "'+el.innerText.slice(0,40)+'"');
    });};
  for(const s of ['islem','hesap','analiz','butce','portfoy','duzenli','hedef','notlar']){act('sub',null,s);check('bölüm '+s);}
  for(const q of ['qa-inc','qa-trf','qa-cash','qa-bank','qa-debt','qa-inv','qa-save','qa-asset']){act(q);check('pencere '+q);act('close');}
  act('acct-open','Ziraat Bankası Vadesiz Maaş Hesabı');check('hesap detay');act('close');
  act('edit-d','dd');check('borç');act('close');
  act('acct-rec','Nakit');check('eşitle');act('close');
  act('h-sell',T.S.holdings[0].id);check('sat');act('close');
  act('new-a');check('hesap ekle');act('close');act('new-r');check('düzenli');act('close');act('new-g');check('hedef');act('close');
  act('open-fire');check('fire');act('back');act('qa-calc');check('araçlar');for(const c of Object.keys(T.CALCS)){act('calc',null,c);check('hesaplayıcı '+c);}act('back');
  for(const s of T.SETS){act('open-set',s.id);check('ayar '+s.id);act('back');}
  act('open-settings');check('ayarlar');act('back');
  act('sub',null,'notlar');act('edit-n','nn');check('not');act('back');
  return out;});
 res.push(...r.map(x=>W+' '+scheme+' '+x));if(errs.length)res.push(W+' HATA '+errs.join(' | '));
 await ctx.close();}}
const uniq=[...new Set(res.map(x=>x.replace(/^\d+ \w+ /,'')))];
console.log(res.length?uniq.slice(0,80).join('\n')+'\n('+res.length+' toplam)':'TAŞMA YOK');await b.close();})();
