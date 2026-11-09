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
  let last='';
  for(let i=0;i<60;i++){
    /* uygulama açılmadıysa ya da sayfa takıldıysa (emülatörde ara sıra) yeniden öne getir */
    if(i===20||i===40){console.log('ℹ bağlantı kurulamadı, uygulama yeniden öne getiriliyor ('+i+'): '+last);sh('adb shell am start -n '+ACT);}
    const pid=sh('adb shell pidof '+PKG).trim();last='pid='+pid;
    if(pid){sh('adb forward --remove-all');sh('adb forward tcp:9222 localabstract:webview_devtools_remote_'+pid);
      try{const l=await getJson('http://127.0.0.1:9222/json');last+=' hedefler='+JSON.stringify(l.map(x=>[x.type,x.url.slice(0,60)]));const t=l.find(x=>x.type==='page'&&/github\.io\/wallet\/(index\.html)?([#?].*)?$/.test(x.url)&&x.webSocketDebuggerUrl);
        if(t){ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.on('open',r);ws.on('error',j);});
          ws.on('message',m=>{const o=JSON.parse(m);if(o.id&&pend[o.id]){pend[o.id](o);delete pend[o.id];}});
          /* eski bağlantının gecikmeli kapanışı yeni bağlantıyı silmesin */
          const me=ws;me.on('close',()=>{if(ws!==me)return;Object.keys(pend).forEach(k=>{pend[k]({result:{exceptionDetails:'bağlantı kapandı'}});delete pend[k];});ws=null;});
          for(let k=0;k<40;k++){if(await ev('return !!(document.getElementById("hdr")&&document.getElementById("hdr").innerHTML)')===true)return true;await sleep(500);}
          /* tanı: sayfa yüklendi ama uygulama çizilmediyse nedenini yaz (bir kez) */
          if(!connect.diag){connect.diag=1;const dg=await ev('return JSON.stringify({rs:document.readyState,url:location.href,app:typeof window.walletBack,nb:!!window.AndroidBridge,hdr:!!document.getElementById("hdr"),body:(document.body&&document.body.innerText||"").slice(0,160),err:localStorage.getItem("wallet-err"),scripts:[...document.scripts].map(x=>x.src||"inline").join(",")})');console.log('ℹ tanı: '+JSON.stringify(dg));}
          ws&&ws.close();}}catch(e){}}
    await sleep(1500);}
  return false;
}
/* sayfada async fonksiyon gövdesi çalıştırır; değer 'return' ile döner */
function ev(body){if(!ws)return Promise.resolve({__err:'bağlantı yok'});return new Promise(res=>{const id=++seq;pend[id]=o=>{const r=o.result&&o.result.result;res(o.result&&o.result.exceptionDetails?{__err:JSON.stringify(o.result.exceptionDetails).slice(0,300)}:(r?r.value:undefined));};
  ws.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression:'(async()=>{'+body+'\n})()',awaitPromise:true,returnByValue:true}}));setTimeout(()=>{if(pend[id]){delete pend[id];res({__err:'zaman aşımı'});}},60000);});}
const ACTJS='const act=(a,id,v)=>{const e=document.createElement("button");e.dataset.act=a;if(id!=null)e.dataset.id=id;if(v!=null)e.dataset.v=v;document.body.appendChild(e);e.click();e.remove();};const setv=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));};';
async function restart(){ws&&ws.close();sh('adb shell am force-stop '+PKG);await sleep(1500);sh('adb shell am start -n '+ACT);await sleep(6000);return connect();}

/* küçük PNG okuyucu (8 bit RGB/RGBA, satır süzgeçleri): ekran görüntüsünden piksel rengi almak için */
function png(buf){const zlib=require('zlib');let o=8,w,h,ct,idat=[];while(o<buf.length){const n=buf.readUInt32BE(o),t=buf.toString('ascii',o+4,o+8),d=buf.slice(o+8,o+8+n);if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];}else if(t==='IDAT')idat.push(d);o+=12+n;}
  const bpp=ct===6?4:3,raw=zlib.inflateSync(Buffer.concat(idat)),st=w*bpp,px=Buffer.alloc(h*st);
  for(let y=0;y<h;y++){const f=raw[y*(st+1)],r=raw.slice(y*(st+1)+1,(y+1)*(st+1));for(let x=0;x<st;x++){const a=x>=bpp?px[y*st+x-bpp]:0,b=y?px[(y-1)*st+x]:0,c=(x>=bpp&&y)?px[(y-1)*st+x-bpp]:0;let v=r[x];
    if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;else if(f===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);}px[y*st+x]=v&255;}}
  return {w,h,at:(x,y)=>{const i=(Math.round(y)*w+Math.round(x))*bpp;return [px[i],px[i+1],px[i+2]];}};}
const data=()=>ev('return JSON.parse(localStorage.getItem("kumbara-v1")||"{}")');

(async()=>{
  ok('uygulamaya bağlanıldı',await connect());
  const br=await ev('return Object.keys(window.AndroidBridge||{}).filter(k=>typeof AndroidBridge[k]==="function").sort().join(",")');
  ok('yerel köprü işlevleri',/saveData/.test(br)&&/schedule/.test(br)&&/smsQueue/.test(br)&&/shareFile/.test(br)&&/http/.test(br)&&/webText/.test(br)&&/ntfState/.test(br)&&/shareText/.test(br)&&/copyText/.test(br)&&/openUrl/.test(br)&&/splashDone/.test(br)&&/voiceOk/.test(br),br);
  // 1 veri kaydı ve yerel kopya
  await ev(ACTJS+'act("sample-clear");return 1');await sleep(500);
  await ev(ACTJS+'act("qa-exp");setv("f-amt","123,45");const sb=()=>document.querySelector(".sheet [data-act=\\"save-tx\\"]");sb().click();await new Promise(r=>setTimeout(r,300));if(sb())sb().click();return 1');await sleep(800);
  let d=await data();const has=x=>x&&x.tx&&x.tx.some(t=>t.amt===123.45);
  ok('işlem kaydedildi',has(d),d&&d.tx&&d.tx.length);
  const nat=await ev('return AndroidBridge.loadData()');ok('uygulama içi kopya yazıldı',/123\.45/.test(nat||''));
  const files=sh('adb shell run-as '+PKG+' ls files');ok('veri dosyası cihazda',/wallet-data\.json/.test(files),files.trim());
  // 2 kapatıp açma
  ok('yeniden başlatıldı',await restart());d=await data();ok('kapatıp açınca veri duruyor',has(d));
  // açılış ekranı: soğuk açılışta beyaz/gri yanıp sönme yok, logo lacivert zeminde, sonra uygulama renkleri
  {ws&&ws.close();sh('adb shell am force-stop '+PKG);await sleep(1500);
   sh('adb shell "rm -f /sdcard/sp*.png; am start -n '+ACT+'; sleep 0.5; screencap -p /sdcard/sp1.png; sleep 0.3; screencap -p /sdcard/sp2.png; sleep 0.3; screencap -p /sdcard/sp3.png; sleep 4; screencap -p /sdcard/sp4.png"');
   const shots=[1,2,3,4].map(i=>{sh('adb pull /sdcard/sp'+i+'.png /tmp/sp'+i+'.png');try{return png(require('fs').readFileSync('/tmp/sp'+i+'.png'));}catch(e){return null;}});
   const navy=c=>c&&c[0]<45&&c[1]<55&&c[2]<80&&c[2]>=c[0],light=c=>c&&c[0]>200&&c[1]>200&&c[2]>200,gold=c=>c&&c[0]+c[1]+c[2]>420;
   const desc=im=>im?JSON.stringify({ust:im.at(im.w/2,8),orta:im.at(20,im.h/2),alt:im.at(im.w/2,im.h-8)}):'yok';
   shots.forEach((im,i)=>console.log('ℹ açılış '+(i+1)+': '+desc(im)));
   // emülatörde ekran görüntüsü bazen saniyeler sürer; ilk kare açılışı yakalar, sonrakiler uygulamayı gösterebilir
   const early=shots.slice(0,1).filter(Boolean);
   ok('açılışta beyaz/gri ekran yanıp sönmedi',early.length===1&&early.every(im=>navy(im.at(20,im.h/2))&&navy(im.at(im.w/2,8))),early.map(desc).join(' | '));
   const hasGold=im=>{if(!im)return false;for(let y=im.h*0.35;y<im.h*0.6;y+=3)for(let x=im.w*0.25;x<im.w*0.75;x+=3)if(gold(im.at(x,y)))return true;return false;};
   ok('açılışta platin logo görünüyor',hasGold(shots[0])||hasGold(shots[1]));
   ok('açılıştan sonra uygulama ve açık renk çubuklar',shots[3]&&light(shots[3].at(shots[3].w/2,8))&&light(shots[3].at(20,shots[3].h/2)),desc(shots[3]));
   for(const i of [1,2,3,4])console.log('ℹ AÇILIŞ'+i+'PNG '+require('zlib').gzipSync(require('fs').readFileSync('/tmp/sp'+i+'.png')).toString('base64'));
   ok('açılıştan sonra bağlanıldı',await connect());}
  // yeni yapı: alt menü, ana sayfa kartları, sesle ekleme düğmesi (telefonda ses tanıma varsa)
  {const h=await ev('return JSON.stringify({tb:document.querySelectorAll("#tabbar button").length,left:!!document.querySelector("#left-now"),gear:!!document.querySelector("header [data-act=open-settings]"),add:!!document.querySelector("#qa [data-act=qa-exp]"),voice:!!document.querySelector("header [data-act=voice]"),vok:window.AndroidBridge&&AndroidBridge.voiceOk&&AndroidBridge.voiceOk()})');
   console.log('ℹ ana sayfa: '+h);const j=JSON.parse(h||'{}');ok('alt menü ve ana sayfa kartları',j.tb===5&&j.left&&j.gear&&j.add,h);ok('başlıkta sesle ekle yok (4.15)',!j.voice,h);
   sh('adb shell screencap -p /sdcard/home.png');sh('adb pull /sdcard/home.png /tmp/home.png');try{console.log('ℹ ANASAYFAPNG '+require('zlib').gzipSync(require('fs').readFileSync('/tmp/home.png')).toString('base64'));}catch(e){}}
  // 3 WebView deposu silinirse yerel kopyadan döner
  await ev('localStorage.removeItem("kumbara-v1");return 1');ok('yeniden başlatıldı (depo silindi)',await restart());d=await data();ok('depo silinse de veri geri geldi',has(d));
  // 4 güncelleme: aynı APK üstüne kurulum
  const inst=sh('adb install -r '+process.env.APK);ok('APK üstüne güncelleme',/Success/.test(inst),inst.trim().split('\n').pop());
  sh('adb shell am start -n '+ACT);await sleep(7000);ok('güncelleme sonrası bağlantı',await connect());d=await data();ok('güncellemeden sonra veri duruyor',has(d));
  // 5 canlı kur (doğrudan kaynak)
  let fr=null;for(let a=0;a<3&&!(fr&&fr.length>500);a++){if(a)await sleep(3000);fr=await ev('return await new Promise(r=>{const o=window.walletNative;window.walletNative=(id,t)=>{if(id==="e2e"){window.walletNative=o;r(t);}else o&&o(id,t);};AndroidBridge.fetchRates("e2e");setTimeout(()=>r(null),20000);})');}
  ok('kurlar doğrudan alındı',fr&&/USD/.test(fr)&&fr.length>500,fr?fr.length+' bayt':'yok');
  // 6 hatırlatıcı: düzenli ödeme → alarm planı
  await ev(ACTJS+'const d=new Date();d.setDate(d.getDate()+4);act("new-r");setv("r-name","E2E Elektrik");setv("r-amt","850");setv("r-day",String(d.getDate()));document.querySelector(".sheet [data-act=\\"save-r\\"]").click();return 1');
  await sleep(2500);const alarms=sh('adb shell dumpsys alarm');const na=(alarms.match(new RegExp(PKG.replace(/\./g,'\\.'),'g'))||[]).length;
  ok('ödeme hatırlatmaları alarm olarak kuruldu',na>0,na+' kayıt');
  const tn=await ev('return AndroidBridge.testNotif()');await sleep(1500);const nd=sh('adb shell dumpsys notification --noredact');
  ok('deneme bildirimi gösterildi',tn==='ok'&&/Wallet hatırlatıcısı çalışıyor/.test(nd),JSON.stringify(tn)+' | '+(nd.match(/pkg=app\.wallet[^\n]{0,200}/g)||[]).slice(0,3).join(' / ')+' | '+sh('adb shell cmd appops get '+PKG+' POST_NOTIFICATION').trim()+' | '+sh('adb shell dumpsys package '+PKG+' | grep -i notif').replace(/\s+/g,' ').slice(0,300));
  await ev('return AndroidBridge.schedule(JSON.stringify([{at:Date.now()+15000,title:"E2E zamanlı hatırlatma",body:"test"}]))');
  let fired=false;for(let i=0;i<30&&!fired;i++){await sleep(3000);fired=/E2E zamanlı hatırlatma/.test(sh('adb shell dumpsys notification --noredact'));}
  ok('planlanan hatırlatma zamanında geldi',fired);
  ok('yeniden başlatıldı (hatırlatma sonrası)',await restart());
  // 7 otomatik yedek
  const ab=await ev(ACTJS+'act("open-set","veri");await new Promise(r=>setTimeout(r,300));document.querySelector("[data-act=\\"bk-auto\\"]").click();await new Promise(r=>setTimeout(r,1500));return document.getElementById("f-bka").innerText');
  const dl=sh('adb shell ls /sdcard/Download/Wallet/');ok('otomatik yedek dosyası yazıldı',/yazıldı/.test(ab||'')&&/Wallet-otomatik-yedek\.json/.test(dl),JSON.stringify(ab)+' | '+dl.trim());
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
  // 8b banka uygulaması bildirimi (bildirim dinleyicisi)
  console.log('ℹ dinleyici izni: '+sh('adb shell cmd notification allow_listener '+PKG+'/app.wallet.NotifIn').trim());await sleep(2500);
  ok('bildirim erişimi verildi',(await ev('return AndroidBridge.ntfState()'))==='granted');
  console.log('ℹ dinleyiciler: '+sh('adb shell dumpsys notification').split('\n').filter(l=>/NotifIn|listener/i.test(l)).slice(0,12).join(' | '));
  await ev(ACTJS+'AndroidBridge.ntfSet(true,"shell");return 1');
  console.log('ℹ bildirim: '+sh(`adb shell "cmd notification post -S bigtext -t Akbank e2etag 'Kartinizdan MIGROS ATASEHIR isyerine 175,25 TL harcama yapilmistir'"`).trim());
  let np=0;for(let i=0;i<20&&!np;i++){await sleep(1500);d=await data();np=(d.sms&&d.sms.pend||[]).filter(x=>x.oamt===175.25).length;}
  console.log('ℹ bildirim kayıtları: '+sh('adb logcat -d -s WalletNotif').split('\n').slice(-12).join(' | '));console.log('ℹ kuyruk: '+(await ev('return AndroidBridge.smsQueue()')));
  ok('banka uygulaması bildirimi işlem önerisi oldu',np===1,JSON.stringify((d.sms&&d.sms.pend||[]).map(x=>[x.kind,x.oamt,x.from,x.note])));
  console.log('ℹ aynı bildirim tekrar: '+sh(`adb shell "cmd notification post -S bigtext -t Akbank e2etag2 'Kartinizdan MIGROS ATASEHIR isyerine 175,25 TL harcama yapilmistir'"`).trim());
  await sleep(4000);d=await data();ok('aynı bildirim iki kez sayılmadı',(d.sms&&d.sms.pend||[]).filter(x=>x.oamt===175.25).length===1);
  await ev('AndroidBridge.ntfSet(false,"");return 1');
  console.log('ℹ kapalıyken bildirim: '+sh(`adb shell "cmd notification post -S bigtext -t Akbank e2etag3 'Kartinizdan A101 isyerine 33,10 TL harcama yapilmistir'"`).trim());
  await sleep(4000);d=await data();ok('kapalıyken bildirim okunmadı',!(d.sms&&d.sms.pend||[]).some(x=>x.oamt===33.1));
  // 8c piyasa verisi (doğrudan istek)
  const hx=(u,m,b)=>ev('return await new Promise(r=>{const id="e"+Math.random();const o=window.walletHttp;window.walletHttp=(i,c,t)=>{if(i===id){window.walletHttp=o;r([c,(t||"").slice(0,400)]);}else o&&o(i,c,t);};AndroidBridge.http(id,'+JSON.stringify(u)+',"GET","","{}");setTimeout(()=>r(["süre",""]),25000);})');
  const isy=await hx('https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/OneEndeks?endeks=THYAO');
  ok('Borsa İstanbul fiyatı alındı (İş Yatırım)',isy&&isy[0]===200&&/"last"/.test(isy[1]),JSON.stringify(isy).slice(0,200));
  const cg=await hx('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try');ok('kripto fiyatı alındı (CoinGecko)',cg&&cg[0]===200&&/bitcoin/.test(cg[1]),JSON.stringify(cg).slice(0,120));
  const yh=await hx('https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=5d&interval=1d');ok('yabancı hisse fiyatı alındı (Yahoo)',yh&&yh[0]===200&&/"currency"/.test(yh[1]||''),JSON.stringify(yh).slice(0,160));
  const ys=await hx('https://query1.finance.yahoo.com/v1/finance/search?q=apple&quotesCount=6&newsCount=0&lang=tr-TR');ok('yabancı borsada arama (Yahoo)',ys&&ys[0]===200&&/AAPL/.test(ys[1]||''),JSON.stringify(ys).slice(0,160));
  const bad=await hx('https://example.com/');ok('izin listesi dışındaki adrese istek gönderilmedi',bad&&bad[0]===0,JSON.stringify(bad));
  const tf=await ev('return await new Promise(r=>{const id="t"+Math.random();const o=window.walletHttp;window.walletHttp=(i,c,t)=>{if(i===id){window.walletHttp=o;r([c,(t||"").slice(0,6000)]);}else o&&o(i,c,t);};AndroidBridge.webText(id,"https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=AFT","Son Fiyat",20000);setTimeout(()=>r(["süre",""]),40000);})');
  console.log('ℹ TEFAS metni: '+JSON.stringify(tf).slice(0,700));ok('TEFAS okuyucusu zamanında döndü, uygulama çökmedi',tf&&tf[0]!=='süre'&&!!sh('adb shell pidof '+PKG).trim(),tf&&tf[0]);
  const wbad=await ev('return await new Promise(r=>{const id="t2";const o=window.walletHttp;window.walletHttp=(i,c,t)=>{if(i===id){window.walletHttp=o;r(c);}else o&&o(i,c,t);};AndroidBridge.webText(id,"https://example.com/","x",5000);setTimeout(()=>r("süre"),9000);})');
  ok('görünmez sayfa yalnızca izinli sitelerde açılır',wbad===0,wbad);
  const mk=await ev(ACTJS+'act("open-mkt");await new Promise(r=>setTimeout(r,500));const b=document.createElement("button");b.dataset.act="m-sug";b.dataset.id="bist:THYAO";document.body.appendChild(b);b.click();b.remove();for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,500));const q=JSON.parse(localStorage.getItem("kumbara-v1")).quotes||{};if(q["bist:THYAO"]&&q["bist:THYAO"].p>0&&q["fx:USD"]&&q["fx:USD"].p>0)break;}const q=JSON.parse(localStorage.getItem("kumbara-v1")).quotes||{};return [q["fx:USD"]&&q["fx:USD"].p,q["bist:THYAO"]&&q["bist:THYAO"].p,document.getElementById("mres").innerText.slice(0,200)]');
  ok('Piyasalar: takip listesi canlı fiyatlarla doldu',mk&&mk[0]>0&&mk[1]>0,JSON.stringify(mk));
  const fon=await ev(ACTJS+'const e=document.getElementById("mq");e.value="AFT";e.dispatchEvent(new Event("input",{bubbles:true}));await new Promise(r=>setTimeout(r,300));document.querySelector("[data-act=\\"m-pick\\"][data-id=\\"fon:AFT\\"]").click();for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,500));const q=(JSON.parse(localStorage.getItem("kumbara-v1")).quotes||{})["fon:AFT"];if(q&&q.p>0)break;}const q=(JSON.parse(localStorage.getItem("kumbara-v1")).quotes||{})["fon:AFT"];const t=document.querySelector(".sheet")?document.querySelector(".sheet").innerText.slice(0,300):"";act("close");return [q||null,t]');
  /* TEFAS yurt dışındaki sunuculardan (GitHub) gelen istekleri sık sık reddediyor; bu denetim bilgi amaçlı, testi düşürmez.
     Uygulamanın hata mesajı göstermesi (çökmeden) yine denetlenir. */
  {const okF=fon&&fon[0]&&fon[0].p>0&&/Fon/i.test(fon[0].n||'');console.log((okF?'ℹ TEFAS fon fiyatı okundu: ':'⚠ TEFAS fon fiyatı bu sunucudan okunamadı (bilgi): ')+JSON.stringify(fon).slice(0,300));
   ok('TEFAS sonucu ya da anlaşılır hata gösterildi',okF||(fon&&/TEFAS’tan alınamadı/.test(fon[1]||'')),JSON.stringify(fon).slice(0,300));}
  const yq=await ev(ACTJS+'const b=document.createElement("button");b.dataset.act="m-open";b.dataset.id="yh:AAPL";document.body.appendChild(b);b.click();b.remove();for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,500));const q=(JSON.parse(localStorage.getItem("kumbara-v1")).quotes||{})["yh:AAPL"];if(q&&q.p>0)break;}const q=(JSON.parse(localStorage.getItem("kumbara-v1")).quotes||{})["yh:AAPL"];act("close");return q||null');
  ok('Yahoo fiyatı uygulamada okundu',yq&&yq.p>0&&yq.ccy==='USD',JSON.stringify(yq));
  await ev(ACTJS+'act("back");return 1');
  // 8d Claude'a sor: kopyalama
  const cp=await ev('return AndroidBridge.copyText("Wallet E2E pano")');ok('panoya kopyalama',cp==='ok',cp);
  // 9 ekran gizliliği
  await ev('AndroidBridge.setSecure(true);return 1');await sleep(1200);const win=sh('adb shell dumpsys window windows');ok('ekran gizliliği açıldı',/SECURE/.test(win));
  await ev('AndroidBridge.setSecure(false);return 1');
  ok('parmak izi denetimi çalışıyor',typeof (await ev('return AndroidBridge.bioAvail()'))==='boolean');
  // 10 tam silme
  // altyapı: uygulamanın kendi hata kaydı; güvenlik politikası (CSP) WebView'da hiçbir şeyi engellememeli
  {const el=await ev('return localStorage.getItem("wallet-err")||"[]"');console.log('ℹ hata kaydı: '+String(el).slice(0,600));let l=[];try{l=JSON.parse(el);}catch(e){}
   ok('güvenlik politikası ihlali yok',Array.isArray(l)&&!l.some(x=>x.k==='politika'),String(el).slice(0,300));
   ok('beklenmeyen eylem hatası yok',Array.isArray(l)&&!l.some(x=>/^eylem/.test(x.k)),String(el).slice(0,300));}
  // uygulama kısayolları (simgeye uzun basınca): açıkken ve soğuk açılışta işlem penceresi açılır
  {const sheet=async()=>{for(let i=0;i<20;i++){const v=await ev('const t=document.querySelector("#f-type [aria-pressed=\\"true\\"]");return t?t.dataset.v:""').catch(()=>'');if(v)return v;await sleep(500);}return '';};
   const sc=sh('adb shell dumpsys shortcut').split(/\n(?=\s*Package: )/).filter(x=>x.indexOf('Package: '+PKG)>=0).join('\n');console.log('ℹ kısayollar: '+String(sc).replace(/\s+/g,' ').slice(0,300));
   ok('kısayollar tanımlı',/id=exp/.test(sc)&&/id=trf/.test(sc)&&!/id=voice/.test(sc),String(sc).replace(/\s+/g,' ').slice(0,300));
   await ev(ACTJS+'act("close");return 1');
   sh('adb shell am start -f 0x20000000 -a android.intent.action.VIEW -d wallet:exp -n '+ACT);ok('açıkken Gider kısayolu',await sheet()==='exp');
   await ev(ACTJS+'act("close");return 1');
   ws&&ws.close();sh('adb shell am force-stop '+PKG);await sleep(1000);sh('adb shell am start -a android.intent.action.VIEW -d wallet:inc -n '+ACT);await sleep(5000);
   ok('kısayoldan açılışta bağlanıldı',await connect());ok('soğuk açılışta Gelir kısayolu',await sheet()==='inc');await ev(ACTJS+'act("close");return 1');}
  await ev(ACTJS+'act("open-set","veri");await new Promise(r=>setTimeout(r,300));document.querySelector("[data-act=\\"reset-all\\"]").click();await new Promise(r=>setTimeout(r,300));document.getElementById("wipe-c").value="SİL";document.querySelector("[data-act=\\"reset-go\\"]").click();await new Promise(r=>setTimeout(r,1500));return 1');
  d=await data();const dl2=sh('adb shell ls /sdcard/Download/Wallet/');const nat2=await ev('return AndroidBridge.loadData()');
  ok('tüm veriler silindi',d.tx&&d.tx.length===0&&!d.pin&&!/123\.45/.test(nat2||''),d.tx&&d.tx.length);
  ok('otomatik yedek dosyası da silindi',!/Wallet-otomatik-yedek\.json/.test(dl2),dl2.trim());
  const na2=(sh('adb shell dumpsys alarm').match(new RegExp(PKG.replace(/\./g,'\\.'),'g'))||[]).length;ok('hatırlatmalar iptal edildi',na2<na,na+' → '+na2);
  ok('yeniden başlatıldı (silme sonrası)',await restart());d=await data();ok('silme sonrası açılış boş',d.tx&&d.tx.length===0&&!d.tx.some(t=>t.sample));
  const fail=results.filter(r=>!r[0]);
  console.log(fail.length?'E2E BAŞARISIZ: '+fail.map(r=>r[1]).join(', '):'E2E ALL PASS ('+results.length+' kontrol)');
  ws&&ws.close();process.exit(fail.length?1:0);
})().catch(e=>{console.log('E2E HATA',e&&e.stack);process.exit(1);});
