const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/rates.json*',r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const F=[];const chk=(c,m)=>{if(!c)F.push(m);};
const r=await p.evaluate(()=>{const T=window.__T,S=T.S;const o={};
 S.auto=false;S.fxAuto=false;S.fx={USD:40,EUR:50,XAU:5000};S.tx=[];S.recurring=[];S.debts=[];S.holdings=[];
 S.accounts=['TL','Dolar','Altın','Kart'];S.opening={TL:1000,Dolar:100,Altın:2,Kart:-500};S.accx={Dolar:{ccy:'USD'},Altın:{ccy:'XAU'},Kart:{due:0}};
 const d=T.isoDate(T.today0());
 const add=(t)=>S.tx.push(Object.assign({id:T.uid(),date:d,cat:'Market',note:''},t));
 add({type:'exp',amt:10.05,acct:'Dolar'});            // 402 TL
 add({type:'exp',amt:100.10,acct:'TL'});
 add({type:'inc',amt:0.5,acct:'Altın',cat:S.cats.inc[0]});  // 2500 TL
 add({type:'trf',amt:400,acct:'TL',to:'Dolar',amt2:9.8,cat:'Transfer'});
 add({type:'trf',amt:50,acct:'TL',to:'Kart',cat:'Transfer'});
 o.bal={TL:T.acctBal('TL'),Dolar:T.acctBal('Dolar'),Altın:T.acctBal('Altın'),Kart:T.acctBal('Kart')};
 o.total=T.accTotal();o.exp=T.sum(S.tx,'exp');o.inc=T.sum(S.tx,'inc');
 o.spent=T.spentByCat(T.curP()).Market;
 const w=T.wealth();o.net=w.net;o.assets=w.assets;o.debt=w.debt;
 // card alert
 const dt=new Date();dt.setDate(dt.getDate()+2);S.accx.Kart.due=dt.getDate();
 o.alert=T.alertItems().map(x=>x[1]);
 S.accx.Kart.due=0;o.alert0=T.alertItems().length;
 // csv round trip amt2
 const csv=T.csvAll();const n=S.tx.length;const im=T.csvImport(csv);o.im=im;o.n=S.tx.length===n;
 const saved=S.tx.slice();S.tx=[];T.csvImport(csv);o.rt=S.tx.filter(t=>t.amt2).map(t=>t.amt2);
 // history
 S.goals=[];S.notes=[];S.sampleExtras=false;S.hist={};for(let i=1;i<=5;i++){S.hist['2026-10-0'+i]=1000*i;}T.snap();o.histN=Object.keys(S.hist).length;o.card=T.nwChart().includes('polyline');
 T.render();return o;});
console.log(JSON.stringify(r));
// expected: TL 1000-100.10-400-50=449.90 ; Dolar 100-10.05+9.8=99.75 ; Altın 2.5 ; Kart -450
chk(r.bal.TL===449.9,'TL '+r.bal.TL);chk(r.bal.Dolar===99.75,'Dolar '+r.bal.Dolar);chk(r.bal.Altın===2.5,'Altın '+r.bal.Altın);chk(r.bal.Kart===-450,'Kart '+r.bal.Kart);
// total = 449.9 + 99.75*40 + 2.5*5000 -450 = 449.9+3990+12500-450=16489.9
chk(r.total===16489.9,'total '+r.total);
chk(r.exp===502.1,'exp '+r.exp);chk(r.inc===2500,'inc '+r.inc);chk(r.spent===502.1,'spent '+r.spent);
chk(r.assets===16939.9&&r.debt===450&&r.net===16489.9,'wealth '+r.assets+' '+r.debt+' '+r.net);
chk(r.alert.some(x=>/Kart son ödeme 2 gün sonra/.test(x)),'alert '+JSON.stringify(r.alert));chk(r.alert0===0,'alert0');
chk(r.im.added===0&&r.n,'reimport');chk(r.rt.length===1&&r.rt[0]===9.8,'rt');chk(r.histN===6&&r.card,'hist');
// UI: transfer sheet shows amt2 field
const ui=await p.evaluate(()=>{const T=window.__T;T.txSheet(null,'trf');const f=document.getElementById('f-acct'),to=document.getElementById('f-to');f.value='TL';to.value='Dolar';f.dispatchEvent(new Event('change',{bubbles:true}));const row=document.getElementById('row-amt2');const vis=!row.hidden;to.value='Kart';to.dispatchEvent(new Event('change',{bubbles:true}));return {vis,hid:row.hidden,lb:document.getElementById('lb-amt').textContent};});
chk(ui.vis&&ui.hid,'amt2 toggle '+JSON.stringify(ui));
const sh=await p.evaluate(()=>{const T=window.__T;return T.setBody?String(T.setBody('hesap')).includes('Hesap ekle'):null;});chk(sh!==false,'settings');
console.log(F.length?'FAIL\n'+F.join('\n'):'ALL PASS');console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
