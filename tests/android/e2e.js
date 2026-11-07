// Android emülatöründe gerçek APK testi: WebView'a DevTools ile bağlanır, yerel köprüyü ve uygulama akışlarını dener.
// Çalıştırma: tests/android/run-e2e.sh (GitHub Actions android-e2e.yml içinden)
const {execSync}=require('child_process');const http=require('http');const WebSocket=require('ws');
const PKG='app.wallet.personal',ACT=PKG+'/app.wallet.MainActivity';
const sh=c=>{try{return execSync(c,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:120000});}catch(e){return (e.stdout||'')+(e.stderr||'');}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[];const ok=(name,cond,detail)=>{results.push([!!cond,name,detail]);console.log((cond?'✓ ':'✗ ')+name+(detail!=null?' — '+String(detail).slice(0,300):''));};
const getJson=u=>new Promise((res,rej)=>{http.get(u,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d));}catch(e){rej(e);}});}).on('error',rej);});
let ws=null,seq=0;const pend={};
async function connect(){
  for(let i=0;i<40;i++){
    const pid=sh('adb shell pidof '+PKG).trim();
    if(pid){sh('adb forward --remove-all');sh('adb forward tcp:9222 localabstract:webview_devtools_remote_'+pid);
      try{const l=await getJson('http://127.0.0.1:9222/json');const t=l.find(x=>/github\.io\/wallet/.test(x.url)&&x.webSocketDebuggerUrl);
        if(t){ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.on('open',r);ws.on('error',j);});
          ws.on('message',m=>{const o=JSON.parse(m);if(o.id&&pend[o.id]){pend[o.id](o);delete pend[o.id];}});
          ws.on('close',()=>{Object.keys(pend).forEach(k=>{pend[k]({result:{exceptionDetails:'bağlantı kapandı'}});delete pend[k];});ws=null;});
          for(let k=0;k<40;k++){if(await ev('return !!(document.getElementById("hdr")&&document.getElementById("hdr").innerHTML)')===true)return true;await sleep(500);}return true;}}catch(e){}}
    await sleep(1500);}
  return false;
}
/* sayfada async fonksiyon gövdesi çalıştırır; değer 'return' ile döner */
function ev(body){if(!ws)return Promise.resolve({__err:'bağlantı yok'});return new Promise(res=>{const id=++seq;pend[id]=o=>{const r=o.result&&o.result.result;res(o.result&&o.result.exceptionDetails?{__err:JSON.stringify(o.result.exceptionDetails).slice(0,300)}:(r?r.value:undefined));};
  ws.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression:'(async()=>{'+body+'\n})()',awaitPromise:true,returnByValue:true}}));setTimeout(()=>{if(pend[id]){delete pend[id];res({__err:'zaman aşımı'});}},60000);});}
const ACTJS='const act=(a,id,v)=>{const e=document.createElement("button");e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};const setv=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));};';
async function restart(){ws&&ws.close();sh('adb shell am force-stop '+PKG);await sleep(1500);sh('adb shell am start -n '+ACT);await sleep(6000);return connect();}
const data=()=>ev('return JSON.parse(localStorage.getItem("kumbara-v1")||"{}")');

(async()=>{
  ok('uygulamaya bağlanıldı',await connect());
  const br=await ev('return Object.keys(window.AndroidBridge||{}).filter(k=>typeof AndroidBridge[k]==="function").sort().join(",")');
  ok('yerel köprü işlevleri',/saveData/.test(br)&&/schedule/.test(br)&&/smsQueue/.test(br)&&/shareFile/.test(br),br);
  // 1 veri kaydı ve yerel kopya
  await ev(ACTJS+'act("sample-clear");return 1');await sleep(500);
  await ev(ACTJS+'act("qa-exp");setv("f-amt","123,45");document.querySelector(".sheet [data-act=\\"save-tx\\"]").click();return 1');await sleep(800);
  let d=await data();const has=x=>x&&x.tx&&x.tx.some(t=>t.amt===123.45);
  ok('işlem kaydedildi',has(d),d&&d.tx&&d.tx.length);
  const nat=await ev('return AndroidBridge.loadData()');ok('uygulama içi kopya yazıldı',/123\.45/.test(nat||''));
  const files=sh('adb shell run-as '+PKG+' ls files');ok('veri dosyası cihazda',/wallet-data\.json/.test(files),files.trim());
  // 2 kapatıp açma
  ok('yeniden başlatıldı',await restart());d=await data();ok('kapatıp açınca veri duruyor',has(d));
  // 3 WebView deposu silinirse yerel kopyadan döner
  await ev('localStorage.removeItem("kumbara-v1");return 1');ok('yeniden başlatıldı (depo silindi)',await restart());d=await data();ok('depo silinse de veri geri geldi',has(d));
  // 4 güncelleme: aynı APK üstüne kurulum
  const inst=sh('adb install -r '+process.env.APK);ok('APK üstüne güncelleme',/Success/.test(inst),inst.trim().split('\n').pop());
  sh('adb shell am start -n '+ACT);await sleep(7000);ok('güncelleme sonrası bağlantı',await connect());d=await data();ok('güncellemeden sonra veri duruyor',has(d));
  // 5 canlı kur (doğrudan kaynak)
  const fr=await ev('return await new Promise(r=>{const o=window.walletNative;window.walletNative=(id,t)=>{if(id==="e2e"){window.walletNative=o;r(t);}else o&&o(id,t);};AndroidBridge.fetchRates("e2e");setTimeout(()=>r(null),20000);})');
  ok('kurlar doğrudan alındı',fr&&/USD/.test(fr)&&fr.length>500,fr?fr.length+' bayt':'yok');
  // 6 hatırlatıcı: düzenli ödeme → alarm planı
  await ev(ACTJS+'const d=new Date();d.setDate(d.getDate()+4);act("new-r");setv("r-name","E2E Elektrik");setv("r-amt","850");setv("r-day",String(d.getDate()));document.querySelector(".sheet [data-act=\\"save-r\\"]").click();return 1');
  await sleep(2500);const alarms=sh('adb shell dumpsys alarm');const na=(alarms.match(new RegExp(PKG.replace(/\./g,'\\.'),'g'))||[]).length;
  ok('ödeme hatırlatmaları alarm olarak kuruldu',na>0,na+' kayıt');
  const tn=await ev('return AndroidBridge.testNotif()');await sleep(1500);const nd=sh('adb shell dumpsys notification --noredact');
  ok('deneme bildirimi gösterildi',tn==='ok'&&/Wallet hatırlatıcısı çalışıyor/.test(nd),tn);
  await ev('return AndroidBridge.schedule(JSON.stringify([{at:Date.now()+15000,title:"E2E zamanlı hatırlatma",body:"test"}]))');
  let fired=false;for(let i=0;i<30&&!fired;i++){await sleep(3000);fired=/E2E zamanlı hatırlatma/.test(sh('adb shell dumpsys notification --noredact'));}
  ok('planlanan hatırlatma zamanında geldi',fired);
  ok('yeniden başlatıldı (hatırlatma sonrası)',await restart());
  // 7 otomatik yedek
  const ab=await ev(ACTJS+'act("open-set","veri");await new Promise(r=>setTimeout(r,300));document.querySelector("[data-act=\\"bk-auto\\"]").click();await new Promise(r=>setTimeout(r,1500));return document.getElementById("f-bka").innerText');
  const dl=sh('adb shell ls /sdcard/Download/Wallet/');ok('otomatik yedek dosyası yazıldı',/yazıldı/.test(ab||'')&&/Wallet-otomatik-yedek\.json/.test(dl),(ab||'')+' | '+dl.trim());
  await ev(ACTJS+'setv("bkp1","e2e-sifre");setv("bkp2","e2e-sifre");document.querySelector("[data-act=\\"bk-pw-set\\"]").click();await new Promise(r=>setTimeout(r,2500));return 1');
  const enc=sh('adb shell cat /sdcard/Download/Wallet/Wallet-otomatik-yedek.json');ok('şifreli otomatik yedek',/"wallet":1/.test(enc)&&!/E2E Elektrik/.test(enc),enc.slice(0,60));
  await ev(ACTJS+'act("back");return 1');
  // 8 SMS
  await ev('AndroidBridge.smsSet(true);return 1');
  const pid0=sh('adb shell pidof '+PKG).trim();sh('adb logcat -c');
  console.log('ℹ sms gönderimi: '+sh('adb emu sms send 5551234 "4543 ile biten kartinizla 07.11.2026 tarihinde MIGROS KADIKOY isyerinden 250,40 TL tutarinda islem yapilmistir."').trim());
  await sleep(4000);const pid1=sh('adb shell pidof '+PKG).trim();ok('SMS geldiğinde uygulama çalışmaya devam etti',pid1&&pid1===pid0,pid0+' → '+pid1);
  if(!ws||pid1!==pid0){console.log(sh('adb logcat -d -b crash | tail -60'));console.log(sh('adb logcat -d | grep -iE "AndroidRuntime|FATAL|wallet|SmsIn|chromium" | tail -60'));if(pid1!==pid0){sh('adb shell am start -n '+ACT);await sleep(6000);}await connect();}
  let pend=0;for(let i=0;i<20&&!pend;i++){await sleep(1500);d=await data();pend=(d.sms&&d.sms.pend||[]).filter(x=>x.oamt===250.4).length;}
  ok('gelen banka SMS’i işlem önerisi oldu',pend>0,JSON.stringify((d.sms&&d.sms.pend||[]).map(x=>[x.kind,x.oamt,x.note])));
  ok('SMS bildirimi gösterildi',/Banka işlemi algılandı/.test(sh('adb shell dumpsys notification --noredact')));
  const sc=await ev('return JSON.parse(AndroidBridge.smsScan(30)).length');console.log('ℹ gelen kutusu taraması: '+sc+' mesaj (emülatörde varsayılan SMS uygulamasına bağlı)');
  const add=await ev(ACTJS+'act("sms-review");await new Promise(r=>setTimeout(r,300));const b=document.querySelector(".sheet [data-act=\\"sms-add\\"]");if(b)b.click();await new Promise(r=>setTimeout(r,500));return JSON.parse(localStorage.getItem("kumbara-v1")).tx.some(t=>t.amt===250.4&&t.note==="Migros Kadikoy")');
  ok('SMS işlemi onaylanıp eklendi',add===true,add);
  // 9 ekran gizliliği
  await ev('AndroidBridge.setSecure(true);return 1');await sleep(1200);const win=sh('adb shell dumpsys window windows');ok('ekran gizliliği açıldı',/SECURE/.test(win));
  await ev('AndroidBridge.setSecure(false);return 1');
  ok('parmak izi denetimi çalışıyor',typeof (await ev('return AndroidBridge.bioAvail()'))==='boolean');
  // 10 tam silme
  await ev(ACTJS+'act("open-set","veri");await new Promise(r=>setTimeout(r,300));const b=document.querySelector("[data-act=\\"reset-all\\"]");b.click();b.click();await new Promise(r=>setTimeout(r,1500));return 1');
  d=await data();const dl2=sh('adb shell ls /sdcard/Download/Wallet/');const nat2=await ev('return AndroidBridge.loadData()');
  ok('tüm veriler silindi',d.tx&&d.tx.length===0&&!d.pin&&!/123\.45/.test(nat2||''),d.tx&&d.tx.length);
  ok('otomatik yedek dosyası da silindi',!/Wallet-otomatik-yedek\.json/.test(dl2),dl2.trim());
  const na2=(sh('adb shell dumpsys alarm').match(new RegExp(PKG.replace(/\./g,'\\.'),'g'))||[]).length;ok('hatırlatmalar iptal edildi',na2<na,na+' → '+na2);
  ok('yeniden başlatıldı (silme sonrası)',await restart());d=await data();ok('silme sonrası açılış boş',d.tx&&d.tx.length===0&&!d.tx.some(t=>t.sample));
  const fail=results.filter(r=>!r[0]);
  console.log(fail.length?'E2E BAŞARISIZ: '+fail.map(r=>r[1]).join(', '):'E2E ALL PASS ('+results.length+' kontrol)');
  ws&&ws.close();process.exit(fail.length?1:0);
})().catch(e=>{console.log('E2E HATA',e&&e.stack);process.exit(1);});
