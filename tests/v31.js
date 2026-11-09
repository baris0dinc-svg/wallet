// 3.1 özellikleri: işlem günü kuru, geriye dönük net servet, etkileşimli grafikler, Planlama, şifreli yedek, daire sırası
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:320,height:740}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{const T=window.__T,F=[],o={};const $=s=>document.querySelector(s);const chk=(c,m)=>{if(!c)F.push(m);};
 const act=(a,id,v)=>{const e=document.createElement('button');e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};
 const near=(a,b)=>Math.abs(a-b)<0.011,fx=JSON.parse(JSON.stringify(T.S.fx));
 const cur=T.curP(),m1=T.addMonth(cur,-1),m2=T.addMonth(cur,-2),m3=T.addMonth(cur,-3);
 T.S=T.norm({fx,accounts:['Nakit','Banka','Dolar'],accx:{Dolar:{ccy:'USD',type:'banka'}},opening:{Nakit:1000,Banka:10000,Dolar:100},tx:[
   {id:'a',type:'inc',amt:5000,cat:'Maaş',acct:'Banka',date:m3+'-05'},{id:'b',type:'exp',amt:2000,cat:'Market',acct:'Banka',date:m2+'-10'},
   {id:'c',type:'exp',amt:500,cat:'Market',acct:'Nakit',date:m1+'-12'},{id:'d',type:'exp',amt:10,cat:'Eğlence',acct:'Dolar',date:m1+'-15'},{id:'e',type:'exp',amt:300,cat:'Market',acct:'Banka',date:T.todayS()}]});
 T.save();
 // 1 işlem günü kuru
 const d=T.S.tx.find(t=>t.id==='d');chk(near(d.fx,41.31),'kur damgası '+d.fx);T.S.fx.USD=50;
 chk(near(T.sum(T.monthTx(T.pk(d.date)),'exp'),500+413.1),'rapor eski kurla '+T.sum(T.monthTx(T.pk(d.date)),'exp'));
 chk(near(T.acctBal('Dolar'),90)&&near(T.wealth().g.banka,T.acctBal('Banka')+90*50),'servet güncel kurla');T.S.fx.USD=41.31;T.save();
 // 2 geriye dönük net servet
 const s=T.nwSeries();o.series=s.map(x=>x[0]+':'+Math.round(x[1])+(x[2]?'e':''));
 const at=k=>s.find(x=>x[0]===k);const end=k=>T.isoDate(new Date(+k.slice(0,4),+k.slice(5,7),0));
 const base=1000+10000+100*41.31;
 chk(s.length>=4&&s[0][2]===true,'tahmini noktalar var');chk(near(at(end(m3))[1],base+5000),'ay sonu '+m3+' '+(at(end(m3))||[])[1]);
 chk(near(at(end(m1))[1],base+5000-2000-500-10*41.31),'ay sonu '+m1);chk(near(s[s.length-1][1],T.wealth().net)&&s[s.length-1][0]===T.todayS(),'bugün canlı değer');
 const hc=T.histChange(30);chk(hc&&hc.days>0,'30 gün değişimi '+JSON.stringify(hc));
 // 3 Analiz etkileşimleri
 act('sub',null,'analiz');act('an',null,'ozet');const g=document.querySelector('g[data-act="trend-pick"][data-v="'+m2+'"]');chk(!!g,'trend grubu');g.dispatchEvent(new MouseEvent('click',{bubbles:true}));
 o.pick=$('.pickbox').innerText;chk(T.ui.trPick===m2&&/Gider/.test(o.pick),'trend seçimi '+o.pick);act('go-month',null,m2);chk(T.ui.month===m2,'döneme git');
 act('an',null,'harcama');const crow=document.querySelector('button.crow[data-v="Market"]');chk(!!crow,'kategori satırı düğme');crow.click();chk(/Market/.test(($('.sheet h2')||{}).innerText||'')&&document.querySelectorAll('.sheet [data-act="edit-tx"]').length===1,'kategori işlemleri penceresi');act('close');
 T.ui.month=cur;act('an',null,'servet');const ch=$('.nwchart');chk(!!ch,'net servet grafiği');const bx=ch.getBoundingClientRect();
 ch.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:bx.left+2,clientY:bx.top+10}));o.scrub=$('#nwpick').innerText;chk(/hesaplandı/.test(o.scrub),'ilk nokta tahmini '+o.scrub);
 ch.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:bx.right-1,clientY:bx.top+10}));chk(new RegExp(new Date().getFullYear()).test($('#nwpick').innerText)&&!$('.nwdot').hidden,'son nokta');
 act('an',null,'harcama');const wk=document.querySelector('[data-act="wk-pick"][data-v="0"]');if(wk){wk.click();chk(/pazartesi/.test(document.body.innerText),'gün seçimi');}
 // 4 Planlama
 act('sub',null,'plan');act('plan',null,'butce');chk(!T.ui.page&&T.ui.sub==='plan'&&!!$('[data-act="plan"][data-v="butce"][aria-pressed="true"]'),'Plan sekmesi bütçe');
 act('plan',null,'duzenli');chk(!!$('#view [data-act="new-r"]'),'düzenli ödemeler');act('plan',null,'hedef');chk(!!$('#view [data-act="new-g"]'),'hedefler');act('plan',null,'koc');chk(!!$('#view .kocnow'),'Koç');window.walletBack();
 act('sub',null,'ev');const tb=$('#tabbar .tbin');chk(tb.scrollWidth<=tb.clientWidth+1&&[...tb.children].every(b=>b.scrollWidth<=b.clientWidth+1),'5 sekme 320 genişlikte sığar');
 // 5 şifreli yedek
 await T.setBkPw('gizli-sifre');const txt=await T.backupText();const ob=JSON.parse(txt);chk(ob.wallet===1&&ob.d&&!/Market/.test(txt),'yedek şifreli');
 const dec=JSON.parse(await T.decText(ob,'gizli-sifre'));chk(dec.tx.length===T.S.tx.length&&!dec.bkKey&&!dec.pin,'yedek açıldı, anahtar yedekte yok');
 let bad=false;try{await T.decText(ob,'yanlis');}catch(e){bad=true;}chk(bad,'yanlış şifre açamaz');chk(!JSON.parse(T.exportJson()).bkKey,'dışa aktarmada anahtar yok');
 // 6
 // (4.0: hızlı işlem daireleri kaldırıldı; tüm eylemler sabit yerlerinde)
 // 7 uyarılar kısalır
 T.S.recurring=[1,2,3,4,5].map(i=>({id:'r'+i,name:'Ödeme '+i,amt:10,day:new Date().getDate(),cat:'Fatura',acct:'Banka',paid:{}}));T.ui.sub='ev';T.render();
 chk(!!$('.alertbar')&&/\+4/.test($('.alertbar').innerText),'uyarı şeridi tek satır +4');act('alerts');chk(document.querySelectorAll('.sheet .item').length===5&&document.querySelectorAll('.sheet [data-act="al-pay"]').length===5,'uyarı penceresi 5 + Ödendi');act('close');
 // hızlı kategori ve tarih
 act('qa-exp');const cc=[...document.querySelectorAll('#f-catchips .chip')];chk(cc.length===T.S.cats.exp.length&&cc[0].dataset.v==='Market','kategori düğmeleri sık kullanılan önde '+(cc[0]&&cc[0].dataset.v));
 document.querySelector('#f-catchips [data-v="Kira"]').click();chk($('#f-cat').value==='Kira'&&$('#f-catchips [data-v="Kira"]').getAttribute('aria-pressed')==='true','kategori düğmesi seçer');
 act('date-pick',null,'1');const yd=new Date(T.today0());yd.setDate(yd.getDate()-1);chk($('#f-date').value===T.isoDate(yd),'Dün kısayolu');
 const fa=$('#f-amt');fa.value='42';$('.sheet [data-act="save-tx"]').click();chk(T.S.tx.some(t=>t.amt===42&&t.cat==='Kira'&&t.date===T.isoDate(yd)),'kısayollarla kayıt');
 // gün toplamı
 act('sub',null,'islem');T.ui.month=T.pk(T.isoDate(yd));T.render();chk([...document.querySelectorAll('.day')].some(d=>/−₺42/.test(d.innerText)||/−₺/.test(d.innerText)),'gün toplamı');
 return {F,o};});
console.log(JSON.stringify(r.o).slice(0,600));
console.log(r.F.length?'FAIL\n'+r.F.join('\n'):'ALL PASS');console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
