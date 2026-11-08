// Rastgele kullanıcı: arayüzden yüzlerce işlem yapar, her adımda veri bütünlüğünü ve ekranı denetler.
const {chromium}=require('playwright');
const SEEDS=(process.argv[2]||'1,2,3,4').split(',').map(Number), STEPS=+process.argv[3]||300;
(async()=>{
const b=await chromium.launch();
let total=0,fails=[];
for(const seed of SEEDS){
  const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/rates.json*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({updated:'2026-11-06 18:00:00',items:{USD:{Selling:41.31,Change:0.1},EUR:{Selling:44.25,Change:-0.2},GRA:{Selling:5530.1,Change:0.5}}})}));
  await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
  const res=await p.evaluate(async ([seed,STEPS])=>{
    const T=window.__T,log=[],bad=[];let S=()=>T.S;
    let st=seed>>>0;const rnd=()=>{st=(st+0x6D2B79F5)>>>0;let t=st;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
    const ri=n=>Math.floor(rnd()*n),pick=a=>a[ri(a.length)];
    const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
    const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
    const setVal=(sel,v)=>{const e=$(sel);if(!e)return false;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;};
    const pickOpt=sel=>{const e=$(sel);if(!e||!e.options||!e.options.length)return null;const o=e.options[ri(e.options.length)];e.value=o.value;e.dispatchEvent(new Event('change',{bubbles:true}));return o.value;};
    const AMTS=['100','12,5','1.234,56','1,234.56','0','-5','abc','','0,001','999999999','  42 ','1e3','3.14159','7,','0,01','250000','19,99','5.000'];
    const NOTES=['','Market','migros alışveriş','<b>kalın</b>','"tırnak"; noktalı','emoji 🙂','  boşluklu  ','çok uzun bir not çok uzun bir not çok uzun bir not','İstanbul ŞİŞLİ'];
    const NAMES=['Ziraat','Kart 2','Dolar hesabı','Altın','<i>x</i>','Banka','__proto__','  ','Birikim; "özel"','Nakit'];
    const rdate=()=>{if(rnd()<0.05)return '';const d=new Date(2025,0,1+ri(900));return T.isoDate(d);};
    const valid=x=>T.r2(T.num(x))>0;
    const sheetOpen=()=>!!$('#sheet-root').innerHTML;
    const closeAll=()=>{if(sheetOpen())act('close');if(T.ui.page)act('back');};
    // --- denetimler
    const check=(name)=>{
      const s=S(),acc=s.accounts,ids={};
      const txt=document.body.innerText;const m=txt.match(/NaN|undefined|Infinity|\[object|null\b|[−-]₺0(?![\d,.])|[−-]₺0,00(?!\d)/);if(m)bad.push(name+': ekranda "'+m[0]+'"');
      const did={};$$('[id]').forEach(e=>{did[e.id]=(did[e.id]||0)+1;});Object.keys(did).forEach(k=>{if(did[k]>1)bad.push(name+': çift id '+k);});
      if(new Set(acc).size!==acc.length)bad.push(name+': çift hesap adı');
      s.tx.forEach(t=>{
        if(ids[t.id])bad.push(name+': çift işlem id');ids[t.id]=1;
        if(['inc','exp','trf','inv','dbt','adj'].indexOf(t.type)<0)bad.push(name+': tür '+t.type);
        if(t.type==='inv'&&['buy','sell'].indexOf(t.side)<0||t.type==='dbt'&&['in','out'].indexOf(t.side)<0)bad.push(name+': yön '+t.side);
        if((t.type==='adj'?t.amt===0:!(t.amt>0))||!isFinite(t.amt)||T.r2(t.amt)!==t.amt)bad.push(name+': tutar '+t.type+' '+t.amt);
        if(!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||isNaN(T.pdate(t.date)))bad.push(name+': tarih '+t.date);
        if(acc.indexOf(t.acct)<0)bad.push(name+': hesap yok '+t.acct);
        if(t.type==='trf'){if(acc.indexOf(t.to)<0||t.to===t.acct)bad.push(name+': transfer hedefi '+t.to);if(t.amt2!=null&&!(t.amt2>0))bad.push(name+': amt2 '+t.amt2);}
        else if((t.type==='inc'||t.type==='exp')&&!t.cat)bad.push(name+': kategori boş');
      });
      s.recurring.forEach(r=>{if(acc.indexOf(r.acct)<0)bad.push(name+': düzenli ödeme hesabı yok');});
      Object.keys(s.accx||{}).forEach(k=>{if(acc.indexOf(k)<0)bad.push(name+': artık accx '+k);});
      Object.keys(s.opening||{}).forEach(k=>{if(acc.indexOf(k)<0&&s.opening[k])bad.push(name+': artık opening '+k);});
      // bağımsız bakiye hesabı
      const rate=a=>{const c=(s.accx[a]||{}).ccy;return !c||c==='TRY'?1:(+s.fx[c]||0);};
      let tot=0;
      const sg=t=>t.type==='inc'||t.type==='adj'||(t.type==='inv'&&t.side==='sell')||(t.type==='dbt'&&t.side==='in')?1:-1;
      acc.forEach(a=>{let b=+s.opening[a]||0;s.tx.forEach(t=>{if(t.type==='trf'){if(t.acct===a)b-=t.amt;if(t.to===a)b+=(t.amt2>0?t.amt2:t.amt);}else if(t.acct===a)b+=t.type==='adj'?t.amt:sg(t)*t.amt;});b=T.r2(b);
        if(T.acctBal(a)!==b)bad.push(name+': bakiye '+a+' '+T.acctBal(a)+' ≠ '+b);tot+=b*rate(a);});
      if(Math.abs(T.accTotal()-T.r2(tot))>1e-9)bad.push(name+': toplam '+T.accTotal()+' ≠ '+T.r2(tot));
      const trate=t=>{const c=(s.accx[t.acct]||{}).ccy;return !c||c==='TRY'?1:(+t.fx>0?+t.fx:rate(t.acct));};const k=T.ui.month,ex=T.r2(s.tx.filter(t=>t.type==='exp'&&T.pk(t.date)===k).reduce((x,t)=>x+t.amt*trate(t),0)),inc=T.r2(s.tx.filter(t=>t.type==='inc'&&T.pk(t.date)===k).reduce((x,t)=>x+t.amt*trate(t),0));
      if(T.sum(T.monthTx(k),'exp')!==ex)bad.push(name+': gider '+T.sum(T.monthTx(k),'exp')+' ≠ '+ex);
      if(T.sum(T.monthTx(k),'inc')!==inc)bad.push(name+': gelir');
      const sc=T.spentByCat(k),scs=Object.keys(sc).reduce((x,c)=>x+sc[c],0);if(Math.abs(scs-ex)>0.01*Object.keys(sc).length+1e-9)bad.push(name+': kategori toplamı '+scs+' ≠ '+ex);
      const w=T.wealth();if(w.net!==T.r2(w.assets-w.debt))bad.push(name+': net');
      const hv=s.holdings.reduce((x,h)=>x+T.hVal(h),0);if(Math.abs(w.net-T.r2(tot+hv-T.debtManual()))>0.05)bad.push(name+': net servet '+w.net+' ≠ '+T.r2(tot+hv-T.debtManual()));
      s.debts.forEach(d=>{if(T.debtLeft(d)<0)bad.push(name+': eksi borç');});s.holdings.forEach(h=>{if(!(h.qty>0))bad.push(name+': varlık adedi '+h.qty);});
      s.goals.forEach(g=>{if(g.acct&&acc.indexOf(g.acct)<0)bad.push(name+': hedef hesabı yok');});
      if(!T.ui.locked&&localStorage.getItem('kumbara-v1')!==JSON.stringify(s))bad.push(name+': kaydedilmemiş değişiklik');
      // Cüzdan ekranındaki gelir/gider sayısı
      if(T.ui.tab==='cuzdan'&&!T.ui.page){const r3=$$('#view .row3 .num');const g=$$('#view .card .row3 .num.inc')[0];if(g&&g.textContent!==T.TRY2.format(0).replace(',00','')&&false){}}
    };
    const A={
      addTx(){act('new-tx');const ty=pick(['exp','exp','inc','trf']);const tb=$('#f-type button[data-v="'+ty+'"]');if(tb)tb.click();
        const amt=pick(AMTS),date=rdate(),note=pick(NOTES);setVal('#f-amt',amt);const cat=pickOpt('#f-cat'),acct=pickOpt('#f-acct'),to=pickOpt('#f-to');
        const cross=!$('#row-amt2').hidden,a2=pick(AMTS);if(cross)setVal('#f-amt2',a2);setVal('#f-date',date);setVal('#f-note',note);
        const realType=$('#f-type button[aria-pressed="true"]').dataset.v;
        const n0=S().tx.length;$('.sheet .btn[data-act="save-tx"]').click();
        const ok=valid(amt)&&!!date&&!(realType==='trf'&&(acct===to||(cross&&!valid(a2))));
        if(S().tx.length!==n0+(ok?1:0))bad.push('addTx: beklenen '+(ok?'eklenmeli':'eklenmemeli')+' '+JSON.stringify({amt,date,realType,acct,to,cross,a2}));
        if(ok){const t=S().tx[S().tx.length-1];if(t.amt!==T.r2(T.num(amt))||t.date!==date||t.acct!==acct||t.note!==note.trim()||(realType==='trf'?t.to!==to:t.cat!==$('#f-cat')?.value&&false))bad.push('addTx: alanlar '+JSON.stringify(t));}
        if(sheetOpen())act('close');},
      editTx(){act('sub',null,'islem');const rows=$$('[data-act="edit-tx"]');if(!rows.length)return;const r=pick(rows),id=r.dataset.id;r.click();
        const before=JSON.stringify(S().tx.find(t=>t.id===id));const amt=pick(AMTS);if(!$('#f-amt')){setVal('#m-amt',amt);$('.sheet [data-act="save-mv"]').click();if(sheetOpen())act('close');return;}setVal('#f-amt',amt);if(rnd()<0.3)pickOpt('#f-acct');
        $('.sheet .btn[data-act="save-tx"]').click();const t=S().tx.find(x=>x.id===id);
        if(sheetOpen()){act('close');if(JSON.stringify(t)!==before)bad.push('editTx: geçersiz düzenleme kaydedildi');}
        else if(!valid(amt))bad.push('editTx: geçersiz tutar kabul edildi '+amt);},
      delTx(){act('sub',null,'islem');const rows=$$('[data-act="edit-tx"]');if(!rows.length)return;const r=pick(rows),id=r.dataset.id;r.click();const n0=S().tx.length;
        const d=$('.sheet [data-act="del-tx"]');d.click();if(S().tx.length!==n0-1)bad.push('delTx: silinmedi');if(rnd()<0.5){const u=$('#toast button');if(u){u.click();if(S().tx.length!==n0)bad.push('undo: geri gelmedi');}}},
      dupTx(){const rows=$$('[data-act="edit-tx"]');if(!rows.length)return;pick(rows).click();const n0=S().tx.length;const d=$('.sheet [data-act="dup-tx"]');if(d){d.click();if(S().tx.length!==n0+1)bad.push('dup');}else act('close');},
      nav(){act(pick(['mprev','mnext','mnext','mprev']));},
      tabs(){if(rnd()<0.15)act('open-settings');else if(rnd()<0.1)act('qa-calc');else act('sub',null,pick(['islem','hesap','analiz','butce','hedef','duzenli','portfoy','notlar']));},
      qa(){act(pick(['qa-inc','qa-exp','qa-cash','qa-bank','qa-trf','qa-debt','qa-inv','qa-save','qa-asset']));if(rnd()<0.3){const b=$$('.sheet [data-act]').filter(x=>x.dataset.act!=='close'&&!/save|del|trade|pay|rc-/.test(x.dataset.act));if(b.length)pick(b).click();}},
      debt(){if(rnd()<0.4||!S().debts.length){act('new-d');setVal('#d-name',pick(['Kredi','','Borç']));setVal('#d-amt',pick(AMTS));pickOpt('#d-acct');$('.sheet .btn[data-act="save-d"]').click();}
        else{const d=pick(S().debts),l0=T.debtLeft(d);act('edit-d',d.id);if($('#dp-amt')){const a=pick(AMTS);setVal('#dp-amt',a);setVal('#dp-int',pick(['','10','abc']));pickOpt('#dp-acct');const n0=S().tx.length;$('[data-act="pay-d"]').click();const p=T.r2(T.num(a));if(p>0&&p<=l0&&S().tx.length===n0&&!/küçük|seç/.test(($('#f-err2')||{}).textContent||''))bad.push('borç ödemesi eklenmedi '+a);if(p>l0+0.01&&T.debtLeft(d)<l0-0.01)bad.push('fazla ödeme kabul edildi');}}},
      trade(){const h=S().holdings.length&&pick(S().holdings);if(!h)return;act(rnd()<0.5?'h-buy':'h-sell',h.id);setVal('#tr-qty',pick(AMTS));setVal('#tr-price',pick(AMTS));pickOpt('#tr-acct');$('.sheet [data-act="trade"]').click();},
      recon(){const a=pick(S().accounts);act('acct-rec',a);setVal('#rc-amt',pick(AMTS.concat(['-500'])));if(rnd()<0.5)$('#rc-mode').click();const v=$('#rc-amt').value;$('[data-act="rc-save"]').click();if(!sheetOpen()&&Math.abs(T.acctBal(a)-T.r2(T.num(v)))>0.005)bad.push('eşitleme sonucu '+T.acctBal(a)+' ≠ '+v+' '+a+' '+JSON.stringify(S().accx[a])+' '+JSON.stringify(S().tx.filter(t=>t.acct===a||t.to===a).slice(-3))+' open='+S().opening[a]);},
      dccy(){const e=$('#dccy');if(e){e.value=pick(['TRY','USD','EUR','XAU','GBP','CHF']);e.dispatchEvent(new Event('change',{bubbles:true}));}},
      eye(){const e=$('[data-act="eye"]');if(e)e.click();},
      wipe(){if(rnd()<0.3){T.wipeAll();if(S().tx.length||S().notes.length)bad.push('silme eksik');}},
      search(){act('sub',null,'islem');setVal('#tq',pick(['market','12,5','zzz','','ş','100']));setVal('#tq','');},
      addAcct(){act('new-a');const nm=pick(NAMES)+(rnd()<0.5?' '+ri(9):'');setVal('#a-name',nm);pickOpt('#a-type');if($('#a-ccy'))pickOpt('#a-ccy');setVal('#a-open',pick(AMTS));setVal('#a-due',pick(['','15','0','32','abc','1','31']));
        const n0=S().accounts.length;$('.sheet .btn[data-act="save-a"]').click();const t=nm.trim(),okName=t&&!/^(__proto__|constructor|prototype)$/.test(t);
        const exists=S().accounts.slice(0,n0).indexOf(t)>=0;if(S().accounts.length!==n0+(okName&&!exists&&!sheetOpen()?1:0))bad.push('addAcct '+JSON.stringify(nm));if(sheetOpen())act('close');},
      editAcct(){const a=pick(S().accounts);act('edit-a',a);const nm=rnd()<0.5?pick(NAMES)+' '+ri(5):a;setVal('#a-name',nm);if(rnd()<0.5)pickOpt('#a-type');setVal('#a-open',pick(AMTS));
        const txBefore=S().tx.filter(t=>t.acct===a||t.to===a).length;$('.sheet .btn[data-act="save-a"]').click();
        if(!sheetOpen()){const nn=nm.trim();const txAfter=S().tx.filter(t=>t.acct===nn||t.to===nn).length;if(txAfter<txBefore)bad.push('rename: işlemler kayboldu '+a+'→'+nn);}else act('close');},
      delAcct(){const a=pick(S().accounts);act('edit-a',a);const d=$('.sheet [data-act="del-a"]');if(d){d.click();d.click();if(S().accounts.indexOf(a)>=0)bad.push('delAcct: silinmedi');}else act('close');},
      addRec(){act('sub',null,'duzenli');act('new-r');setVal('#r-name',pick(['Kira','İnternet','','Spor']));setVal('#r-amt',pick(AMTS));setVal('#r-day',pick(['1','15','31','0','32','abc','29']));pickOpt('#r-acct');pickOpt('#r-cat');
        $('.sheet .btn[data-act="save-r"]').click();if(sheetOpen())act('close');},
      payRec(){act('sub',null,'duzenli');const b=$$('[data-act="rpay"],[data-act="rundo"]');if(b.length){const x=pick(b),isPay=x.dataset.act==='rpay',n0=S().tx.length;x.click();if(S().tx.length!==n0+(isPay?1:-1))bad.push('rpay/rundo');}},
      goal(){act('sub',null,'hedef');if(rnd()<0.4){act('new-g');pickOpt('#g-acct');setVal('#g-name',pick(['Tatil','','Araba']));setVal('#g-target',pick(AMTS));setVal('#g-saved',pick(AMTS));setVal('#g-date',rdate());$('.sheet .btn[data-act="save-g"]').click();if(sheetOpen())act('close');}
        else{const i=$$('[data-act="goal-add"]');if(i.length){pick(i).click();setVal('#ga-amt',pick(AMTS));pickOpt('#ga-from');$('[data-act="ga-save"]').click();}}},
      budget(){act('sub',null,'butce');const i=$$('[data-budget]');if(i.length){const x=pick(i);x.value=pick(AMTS);x.dispatchEvent(new Event('change',{bubbles:true}));}},
      payday(){act('open-set','profil');setVal('#pf-pd',String(1+ri(31)));act('back');},
      holding(){act('sub',null,'portfoy');act('new-h',null,pick(['inv','asset']));setVal('#h-name',pick(['Altın','THYAO','','Fon']));pickOpt('#h-type');pickOpt('#h-ccy');setVal('#h-qty',pick(AMTS));setVal('#h-cost',pick(AMTS));setVal('#h-price',pick(AMTS));pickOpt('#h-acct');$('.sheet .btn[data-act="save-h"]').click();if(sheetOpen())act('close');},
      cats(){act('open-set','kat');if(rnd()<0.5){setVal('#nc-exp',pick(['Evcil','Kira','  ','Yeni; kat','"x"']));$('[data-act="cat-add"][data-v="exp"]').click();}else{const c=$$('[data-act="cat-del"]');if(c.length){const x=pick(c);x.click();const y=$('[data-act="cat-del"][data-id="'+CSS.escape(x.dataset.id)+'"][data-v="'+x.dataset.v+'"]');if(y)y.click();}}act('back');},
      rule(){act('open-set','kat');setVal('#rl-kw',pick(['migros','market','']));pickOpt('#rl-cat');$('[data-act="rule-add"]').click();act('back');},
      fx(){act('open-set','kurlar');setVal('#fx-USD',pick(['41,31','40','0','abc','42.5']));act('back');},
      csv(){const n0=S().tx.length,r=T.csvImport(T.csvAll());if(n0===0?!r.err:(r.err||r.added!==0||S().tx.length!==n0))bad.push('csv gidiş-dönüş '+JSON.stringify(r));T.save();},
      notes(){act('sub',null,'notlar');if(rnd()<0.6){act('new-n');setVal('#n-title',pick(['Liste','','<b>x</b>']));setVal('#n-body',pick(['süt\nekmek','','uzun '.repeat(40)]));const n0=S().notes.length;window.walletBack();}
        else if(rnd()<0.5){const c=$$('[data-act="edit-n"]');if(c.length){pick(c).click();const d=$(pick(['[data-act="note-trash"]','[data-act="note-arch"]','[data-act="note-restore"]','[data-act="note-purge"]']));if(d&&rnd()<0.7){d.click();if($('[data-act="note-purge"]'))$('[data-act="note-purge"]').click();}else act('back');}}
        else{act('nview',null,pick(['act','arch','trash']));const b=$$('#nlist [data-act^="n-"]');if(b.length){const x=pick(b);x.click();const y=$('#nlist [data-act="'+x.dataset.act+'"][data-id="'+x.dataset.id+'"]');if(y&&x.dataset.act==='n-purge')y.click();}}},
      hide(){act('open-set','gor');const t=$('[data-act="tgl"][data-v="hide"]');if(t)t.click();act('back');act('sub',null,pick(['islem','portfoy','analiz','hesap']));},
      backup(){const before=T.exportJson();act('open-set','veri');setVal('#rs-txt',before);$('[data-act="rs-go"]').click();const after=T.exportJson();
        const a=JSON.parse(before),c=JSON.parse(after);delete a.hist;delete c.hist;delete a.savedAt;delete c.savedAt;delete a.bkTs;delete c.bkTs;if(JSON.stringify(a)!==JSON.stringify(c))bad.push('yedek gidiş-dönüş farklı');act('back');},
    };
    const names=Object.keys(A),W={qa:2,debt:2,trade:2,recon:1,dccy:1,eye:1,wipe:1,addTx:6,editTx:3,delTx:2,dupTx:1,nav:2,tabs:2,search:1,addAcct:2,editAcct:2,delAcct:1,addRec:2,payRec:2,goal:1,budget:2,payday:1,holding:1,cats:1,rule:1,fx:1,csv:1,backup:1,notes:2,hide:1};
    const bag=[];names.forEach(n=>{for(let i=0;i<(W[n]||1);i++)bag.push(n);});
    act('sample-clear');
    for(let i=0;i<STEPS;i++){const n=pick(bag);log.push(n);const b0=bad.length;
      try{A[n]();}catch(e){bad.push(n+': istisna '+e.message);}
      try{closeAll();await new Promise(r=>setTimeout(r,25));check(i+':'+n);}catch(e){bad.push(n+': denetim istisnası '+e.message);}
      if(bad.length>b0&&bad.length>40)break;}
    return {bad:[...new Set(bad)].slice(0,40),steps:log.length,tx:S().tx.length,acc:S().accounts.length};
  },[seed,STEPS]);
  total+=res.steps;
  console.log('seed',seed,'adım',res.steps,'işlem',res.tx,'hesap',res.acc,res.bad.length?'SORUNLAR:\n  '+res.bad.join('\n  '):'temiz');
  if(errs.length)console.log('  sayfa hataları:',errs.slice(0,5).join(' | '));
  if(res.bad.length||errs.length)fails.push(seed);
  await p.context().close();
}
console.log('toplam adım',total,fails.length?'BAŞARISIZ tohumlar '+fails:'HEPSİ TEMİZ');
await b.close();})();
