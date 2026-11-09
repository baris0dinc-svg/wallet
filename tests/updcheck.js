// "Güncellemeleri denetle": sunucudaki version.json çalışan sürümden yeniyse bulmalı ve yeni sürümü yüklemeli —
// yeni hizmet çalışanı arka planda zaten kurulmuş olsa bile (eski hata: bu durumda "Uygulama güncel" deniyordu)
const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
const SRC=(process.env.SITE||'/tmp/wallet-site').replace(/\/?$/,'/'),SITE='/tmp/wallet-site3/';
fs.rmSync(SITE,{recursive:true,force:true});fs.cpSync(SRC,SITE,{recursive:true});
const srv=spawn('python3',['-m','http.server','8768'],{cwd:SITE,stdio:'ignore'});
(async()=>{await new Promise(r=>setTimeout(r,800));const F=[];const chk=(c,m)=>{if(!c)F.push(m);};
const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8768/index.html');await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForTimeout(800);await p.reload();await p.waitForTimeout(800);
const V=await p.evaluate(()=>window.__T.VER||null);
let r=await p.evaluate(()=>window.__T.checkUpdate());chk(r.v&&!r.newer,'aynı sürümde güncel denmeli '+JSON.stringify(r));
chk(await p.evaluate(()=>window.__T.verNewer('4.10','4.9')&&!window.__T.verNewer('4.6','4.6')&&!window.__T.verNewer('4.5','4.6')),'sürüm karşılaştırma');
// yeni sürüm yayınlandı ama hizmet çalışanı dosyası aynı (arka planda zaten güncellenmiş gibi)
fs.appendFileSync(SITE+'app.js','\n;window.__VER=5;\n');fs.writeFileSync(SITE+'version.json','{"v":"99.0"}\n');
r=await p.evaluate(()=>window.__T.checkUpdate());chk(r.newer&&r.v==='99.0','yeni sürüm bulunmalı '+JSON.stringify(r));
await p.evaluate(()=>window.__T.hardReload());await p.waitForTimeout(2500);
const ver=await p.evaluate(()=>window.__VER||1);chk(ver===5,'yeni sürüm yüklenmeli (önbellekten eski app.js gelmemeli), gelen '+ver);
// sunucuya ulaşılamazsa "güncel" denmemeli
await ctx.route('**/version.json*',rt=>rt.abort());r=await p.evaluate(()=>window.__T.checkUpdate());chk(!r.v&&!r.newer,'ağ yokken sürüm bilinmiyor');
if(errs.length)F.push('JS hata: '+errs.join(' | '));
console.log(F.length?'HATA:\n - '+F.join('\n - '):'ALL PASS');await b.close();srv.kill();process.exit(F.length?1:0);})();
