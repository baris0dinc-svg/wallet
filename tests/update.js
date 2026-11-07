// Yeni sürüm akışı: servis çalışanı güncellenince sayfa kendiliğinden yeni sürüme geçmeli
const {chromium}=require('playwright');const fs=require('fs');
const SITE=(process.env.SITE2||'/tmp/wallet-site2').replace(/\/?$/,'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();
await p.goto('http://localhost:8767/index.html');
await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForTimeout(800);
await p.reload();await p.waitForTimeout(800);
const ctl=await p.evaluate(()=>!!navigator.serviceWorker.controller);
// yeni sürümü yayınla
fs.appendFileSync(SITE+'app.js','\n;window.__VER=2;\n');
fs.writeFileSync(SITE+'sw.js',fs.readFileSync(SITE+'sw.js','utf8').replace(/wallet-v\d+/,'wallet-vTEST'));
let navs=0;p.on('framenavigated',f=>{if(f===p.mainFrame())navs++;});
await p.reload();
const first=await p.evaluate(()=>window.__VER||1);
let ver=first;for(let i=0;i<40&&ver!==2;i++){await p.waitForTimeout(250);try{ver=await p.evaluate(()=>window.__VER||1);}catch(e){}}
console.log(JSON.stringify({controlled:ctl,firstLoadVersion:first,finalVersion:ver,navigations:navs}));
console.log(ctl&&ver===2?'UPDATE FLOW PASS':'UPDATE FLOW FAIL');
// meşgulken (pencere açık) sormalı, yenilememeli
fs.appendFileSync(SITE+'app.js','\n;window.__VER=3;\n');
fs.writeFileSync(SITE+'sw.js',fs.readFileSync(SITE+'sw.js','utf8').replace(/wallet-vTEST\d*/,'wallet-vTEST3'));
await p.reload();await p.waitForTimeout(300);
await p.evaluate(()=>{const e=document.createElement('button');e.dataset.act='new-tx';document.body.appendChild(e);e.click();e.remove();});
navs=0;await p.waitForTimeout(4000);
const r=await p.evaluate(()=>({ver:window.__VER||1,toast:(document.getElementById('toast')||{}).innerText||'',sheet:!!document.getElementById('sheet-root').innerHTML}));
console.log(JSON.stringify(r),'navs',navs);
console.log(r.sheet&&/Yeni sürüm hazır/.test(r.toast)&&navs===0?'BUSY PROMPT PASS':'BUSY PROMPT FAIL');
await b.close();})();
