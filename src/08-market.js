
/* ---------- Piyasalar: arama, takip listesi, yatırımları piyasa fiyatına bağlama ----------
   Kaynaklar: Truncgil (döviz, altın, BIST 100), İş Yatırım (Borsa İstanbul hisseleri, ~15 dk gecikmeli),
   CoinGecko (kripto), Yahoo Finance (yabancı borsalar, deneysel), TEFAS (fonlar, deneysel).
   Tarayıcı İş Yatırım, Yahoo ve TEFAS'a doğrudan erişemez; bunlar Android uygulamasının yerel köprüsüyle alınır.
   Anahtar biçimi: kaynak:sembol (fx:USD, bist:THYAO, fon:AFT, cg:bitcoin, yh:AAPL). */
var MSRC={fx:'Döviz ve altın',bist:'Borsa İstanbul',fon:'Yatırım fonu',cg:'Kripto',yh:'Yabancı borsa'};
var MGOLD={GRA:'Gram altın',CEYREKALTIN:'Çeyrek altın',YARIMALTIN:'Yarım altın',TAMALTIN:'Tam altın',CUMHURIYETALTINI:'Cumhuriyet altını',ATAALTIN:'Ata altın','14AYARALTIN':'14 ayar altın','18AYARALTIN':'18 ayar altın',YIA:'22 ayar bilezik',IKIBUCUKALTIN:'İkibuçuk altın',BESLIALTIN:'Beşli altın',GREMSEALTIN:'Gremse altın',RESATALTIN:'Reşat altın',HAMITALTIN:'Hamit altın',GUMUS:'Gram gümüş',ONS:'Ons altın',BRENT:'Brent petrol',XU100:'BIST 100 endeksi'};
var MUNIT={ONS:'USD',BRENT:'USD',XU100:'pt'};
/* uygulamanın kendi kur alanlarıyla eşleşenler (yatırım eklerken mevcut kur bağlantısı kullanılır) */
var MFXK={USD:'USD',EUR:'EUR',GBP:'GBP',CHF:'CHF',GRA:'XAU',GUMUS:'XAG',CEYREKALTIN:'CEY'};
var MSUG=[['fx:USD','Dolar'],['fx:EUR','Euro'],['fx:GRA','Gram altın'],['fx:XU100','BIST 100'],['bist:THYAO','THYAO'],['bist:ASELS','ASELS'],['cg:bitcoin','Bitcoin']];
var FXALL=null,FXALLT=0,BIST=null,BISTM=null,BISTP=null,MCAND={},mAsync={},mTimer=0,mCur=null;
var DNC=null;try{DNC=new Intl.DisplayNames(['tr'],{type:'currency'});}catch(e){}
function mk(k){k=String(k||'');var i=k.indexOf(':');return {src:k.slice(0,i),sym:k.slice(i+1)};}
function fxName(s){if(MGOLD[s])return MGOLD[s];var o=FXALL&&FXALL[s];if(o&&o.Type==='Palladium')return 'Paladyum';if(o&&o.Type==='Platinum')return 'Platin';
  try{var n=DNC&&DNC.of(s);if(n&&n!==s)return n.charAt(0).toLocaleUpperCase('tr-TR')+n.slice(1);}catch(e){}return s;}
function mW(k){return S.watch.filter(function(w){return w.k===k;})[0]||null;}
function mName(k){var w=mW(k),q=S.quotes[k],c=MCAND[k],m=mk(k);return (w&&w.n)||(c&&c.n)||(q&&q.n)||(m.src==='fx'?fxName(m.sym):m.sym);}
function mSym(k){var w=mW(k),c=MCAND[k],m=mk(k);return String((w&&w.s)||(c&&c.s)||m.sym).toUpperCase();}
function mSub(k){var m=mk(k),s=mSym(k);return (m.src==='fx'&&MGOLD[m.sym]?'':s+' · ')+MSRC[m.src];}
/* son fiyat: önce indirilen değer, döviz ve altında uygulamanın kendi kurları yedek olur */
function mQ(k){var q=S.quotes[k];if(q&&q.p>0)return q;var m=mk(k);
  if(m.src==='fx'){var f=MFXK[m.sym];if(f&&+S.fx[f]>0)return {p:+S.fx[f],c:S.fxChg?S.fxChg[f]:null,ccy:'TRY',ts:S.fxTs||0};
    if(m.sym==='XU100'&&S.mkt&&S.mkt.BIST&&S.mkt.BIST.price>0)return {p:S.mkt.BIST.price,c:S.mkt.BIST.chg,ccy:'pt',ts:S.fxTs||0};}
  return q||null;}
function rateAny(c){if(!c||c==='TRY')return 1;var r=rateOf(c);if(r>0)return r;var o=FXALL&&FXALL[c];return o?rPrice(o):0;}
/* yatırım değeri için TL fiyat; endeks (pt) bir fiyat değildir */
function mTL(k){var q=mQ(k);if(!q||!(q.p>0)||q.ccy==='pt')return 0;var r=rateAny(q.ccy||'TRY');return r>0?q.p*r:0;}
var PXF={};function pxf(d){if(!PXF[d])PXF[d]=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d});return PXF[d];}
function fmtPx(p,u,k){if(!(p>0))return '—';var fx=k&&mk(k).src==='fx'&&u!=='pt',d=p>=1e5?0:(p<1?4:(fx&&p<100?4:2));
  var sy={TRY:'₺',USD:'$',EUR:'€',GBP:'£'}[u];return (u==='pt'?'':(sy||''))+pxf(d).format(p)+(sy||u==='pt'?'':' '+u);}
function pctTxt(c){return (c>=0?'+':'−')+'%'+NUM2.format(Math.abs(c));}
function chgSpan(c){return c!=null&&isFinite(c)?'<span class="small num '+(c>0.0049?'inc':(c<-0.0049?'exp':'muted'))+'">'+pctTxt(c)+'</span>':'';}

/* ---------- ağ ---------- */
var hreq={},hseq=0;
window.walletHttp=function(id,code,text){var f=hreq[id];if(f){delete hreq[id];f(+code||0,text);}};
function canNet(){return nb('http');}
/* o.cors: tarayıcı da doğrudan alabilir (CoinGecko gibi) */
function nget(url,o){o=o||{};return new Promise(function(ok,no){
  if(canNet()){var id='h'+(++hseq)+'_'+Date.now(),tm=setTimeout(function(){delete hreq[id];no(new Error('zaman aşımı'));},o.timeout||20000);
    hreq[id]=function(code,text){clearTimeout(tm);if(code>=200&&code<300&&text!=null)ok(text);else no(new Error('http '+code));};
    try{NB.http(id,url,o.method||'GET',o.body||'',JSON.stringify(o.headers||{}));}catch(e){clearTimeout(tm);delete hreq[id];no(e);}return;}
  if(!o.cors){no(new Error('yalnızca uygulamada'));return;}
  fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.text();}).then(ok,no);});}
function njson(url,o){return nget(url,o).then(function(t){return JSON.parse(t);});}
/* tarayıcı doğrulaması isteyen sayfa: görünmez WebView'da açılır, 'need' metni görünene kadar beklenir */
function nweb(url,need,ms){return new Promise(function(ok,no){
  if(!nb('webText')){no(new Error('yalnızca uygulamada'));return;}
  var id='w'+(++hseq)+'_'+Date.now(),tm=setTimeout(function(){delete hreq[id];no(new Error('zaman aşımı'));},(ms||25000)+10000);
  hreq[id]=function(code,text){clearTimeout(tm);var o=null;try{o=JSON.parse(text);}catch(e){}if(code===200&&o)ok(o);else no(new Error('sayfa okunamadı'));};
  try{NB.webText(id,url,need,ms||25000);}catch(e){clearTimeout(tm);delete hreq[id];no(e);}});}
function bistList(){if(BIST)return Promise.resolve(BIST);
  if(!BISTP)BISTP=fetch('bist.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('yok');return r.json();}).then(function(j){BIST=j&&Array.isArray(j.l)?j:{l:[]};BISTM={};BIST.l.forEach(function(x){BISTM[x[0]]=x;});return BIST;}).catch(function(){BISTP=null;return {l:[]};});
  return BISTP;}
function fxAll(force){if(FXALL&&Date.now()-FXALLT<(force?30000:300000))return Promise.resolve(FXALL);return refreshRates({force:true}).then(function(){return FXALL||{};});}

/* ---------- fiyat kaynakları ---------- */
var ISY='https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/',CG='https://api.coingecko.com/api/v3/',YH='https://query1.finance.yahoo.com/';
function isoTs(s){s=String(s||'').replace(/([+-]\d{2})$/,'$1:00');var t=Date.parse(s);return isNaN(t)?Date.now():t;}
function isIdx(s){return /^X[A-Z0-9]{2,5}$/.test(s)&&!(BISTM&&BISTM[s]);}
function qBist(s){
  if(!canNet())return bistList().then(function(j){var x=BISTM&&BISTM[s];if(!x||!(x[3]>0))throw new Error('yalnızca uygulamada');return {p:x[3],c:null,ccy:'TRY',at:isoTs(j.u),site:1};});
  return njson(ISY+'OneEndeks?endeks='+encodeURIComponent(s)).then(function(a){var x=a&&a[0];if(!x||!(+x.last>0))throw new Error('bulunamadı');var pv=+x.dayClose||0;
    return {p:+x.last,prev:pv,c:pv>0?(x.last/pv-1)*100:null,hi:+x.high||0,lo:+x.low||0,ccy:isIdx(s)?'pt':'TRY',at:isoTs(x.updateDate)};});}
function qCg(ids){return njson(CG+'simple/price?ids='+ids.map(encodeURIComponent).join(',')+'&vs_currencies=try&include_24hr_change=true&include_last_updated_at=true',{cors:1}).then(function(j){var o={};
  ids.forEach(function(id){var x=j&&j[id];if(x&&+x['try']>0)o[id]={p:+x['try'],c:x.try_24h_change!=null?+x.try_24h_change:null,ccy:'TRY',at:(+x.last_updated_at||0)*1000||Date.now()};});return o;});}
function yhCcy(c){return c==='GBp'?{c:'GBP',d:100}:(c==='ZAc'?{c:'ZAR',d:100}:(c==='ILA'?{c:'ILS',d:100}:{c:c||'USD',d:1}));}
function yhChart(s,range){return njson(YH+'v8/finance/chart/'+encodeURIComponent(s)+'?range='+range+'&interval=1d').then(function(j){var r=j&&j.chart&&j.chart.result&&j.chart.result[0];if(!r)throw new Error('bulunamadı');return r;});}
function yhCloses(r){var ts=r.timestamp||[],cl=(r.indicators&&r.indicators.quote&&r.indicators.quote[0]&&r.indicators.quote[0].close)||[],d=yhCcy((r.meta||{}).currency).d,out=[];
  ts.forEach(function(t,i){if(cl[i]!=null&&cl[i]>0)out.push([t*1000,cl[i]/d]);});return out;}
function qYh(s){return yhChart(s,'5d').then(function(r){var m=r.meta||{},cc=yhCcy(m.currency),cl=yhCloses(r),p=(+m.regularMarketPrice||0)/cc.d||(cl.length?cl[cl.length-1][1]:0),pv=cl.length>=2?cl[cl.length-2][1]:0;
  if(!(p>0))throw new Error('bulunamadı');return {p:p,prev:pv,c:pv>0?(p/pv-1)*100:null,hi:(+m.regularMarketDayHigh||0)/cc.d,lo:(+m.regularMarketDayLow||0)/cc.d,ccy:cc.c,at:(+m.regularMarketTime||0)*1000||Date.now(),n:m.longName||m.shortName||''};});}
/* TEFAS fon sayfası metninden son fiyat, günlük getiri ve fon adı */
function fonParse(t,s){
  var L=String(t||'').split(/\n+/).map(function(x){return x.replace(/\s+/g,' ').trim();}).filter(Boolean);
  var after=function(re){for(var i=0;i<L.length;i++){if(!re.test(L[i]))continue;var rest=L[i].replace(re,'').match(/%?\s*-?\s*%?\s*\d[\d.]*(?:,\d+)?/);if(rest)return rest[0];
    for(var j=i+1;j<Math.min(L.length,i+4);j++){var m=L[j].match(/^%?\s*-?\s*%?\s*\d[\d.]*(?:,\d+)?/);if(m)return m[0];}}return null;};
  var ps=after(/Son Fiyat\s*(\(TL\))?\s*:?/i),p=ps?num(ps.replace(/[%\s]/g,'')):0;if(!(p>0))throw new Error('fiyat bulunamadı');
  var cs=after(/Günlük Getiri\s*(\(%\))?\s*:?/i),c=cs!=null?num(cs.replace(/[%\s]/g,'')):null,nm='';
  for(var i=0;i<L.length;i++){var x=L[i];if(/\bFON(U|LARI)?\b/.test(x)&&x.length>12&&x.length<160&&x===x.toLocaleUpperCase('tr-TR')){nm=x.replace(new RegExp('^'+s+'\\s*[-–]\\s*'),'');break;}}
  return {p:p,c:c,ccy:'TRY',at:Date.now(),n:nm?titleTr(nm):''};}
function qFon(s){return nweb('https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod='+encodeURIComponent(s),'Son Fiyat',25000).then(function(o){return fonParse(o.t,s);});}

/* ---------- yenileme ---------- */
function mKeys(){var ks=S.watch.map(function(w){return w.k;});S.holdings.forEach(function(h){if(h.mk&&ks.indexOf(h.mk)<0)ks.push(h.mk);});return ks;}
/* takipte ve yatırımda olmayan fiyatları siler (açık ayrıntı penceresindeki hariç) */
function mPrune(){var ks=mKeys();if(mCur&&sheetOpen())ks.push(mCur.k);Object.keys(S.quotes).forEach(function(k){if(ks.indexOf(k)<0)delete S.quotes[k];});}
var mRun=null;
/* opt.keys: yalnızca bunlar; opt.force: yeni olsa da yenile; opt.fon: fonları da (günde bir değiştikleri için normalde 3 saatte bir) */
function refreshMarket(opt){
  opt=opt||{};if(mRun&&!opt.keys)return mRun;
  var now=Date.now(),ks=(opt.keys||mKeys()).filter(function(k){var q=S.quotes[k],age=q?now-(q.ts||0):1e13,src=mk(k).src;
    if(!MSRC[src])return false;if(src==='fon'&&!opt.fon&&!opt.keys&&age<3*36e5)return false;return opt.force||age>60000;});
  if(!ks.length)return Promise.resolve({ok:true,n:0,bad:0});
  var by={},n=0,bad=0,errs={};ks.forEach(function(k){var m=mk(k);(by[m.src]=by[m.src]||[]).push(m.sym);});
  var put=function(k,q){var o=S.quotes[k]||{};q.ts=Date.now();if(!q.n&&o.n)q.n=o.n;delete q.err;S.quotes[k]=q;n++;
    S.holdings.forEach(function(h){if(h.mk===k){var tl=mTL(k);if(tl>0)h.price=r2(tl*1e4)/1e4;}});};
  var fail=function(k,e){var q=S.quotes[k];if(q)q.err=1;errs[k]=String(e&&e.message||e||'hata');bad++;};
  var jobs=[];
  if(by.fx)jobs.push(fxAll(opt.force).then(function(a){by.fx.forEach(function(s){var o=a&&a[s],p=rPrice(o);if(p>0)put('fx:'+s,{p:p,c:rChg(o),ccy:MUNIT[s]||'TRY',at:Date.now()});else fail('fx:'+s,'kur yok');});},function(e){by.fx.forEach(function(s){fail('fx:'+s,e);});}));
  if(by.bist)jobs.push(bistList().then(function(){return Promise.all(by.bist.map(function(s){return qBist(s).then(function(q){put('bist:'+s,q);},function(e){fail('bist:'+s,e);});}));}));
  if(by.cg)jobs.push(qCg(by.cg).then(function(o){by.cg.forEach(function(s){if(o[s])put('cg:'+s,o[s]);else fail('cg:'+s,'bulunamadı');});},function(e){by.cg.forEach(function(s){fail('cg:'+s,e);});}));
  if(by.yh)jobs.push(Promise.all(by.yh.map(function(s){return qYh(s).then(function(q){put('yh:'+s,q);},function(e){fail('yh:'+s,e);});})));
  /* fonlar sırayla: her biri görünmez bir sayfa açar */
  if(by.fon)jobs.push(by.fon.reduce(function(pr,s){return pr.then(function(){return qFon(s).then(function(q){put('fon:'+s,q);},function(e){fail('fon:'+s,e);});});},Promise.resolve()));
  var run=Promise.all(jobs).then(function(){if(!opt.keys)mPrune();save();return {ok:n>0||!bad,n:n,bad:bad,errs:errs};},function(){return {ok:false,n:n,bad:bad,errs:errs};});
  if(!opt.keys){mRun=run;run.then(function(){mRun=null;});}
  return run;
}
function mUpd(){var e=document.getElementById('mres');if(e)e.innerHTML=mBody();}
function mAfter(){if(ui.page&&ui.page.k==='piyasa'){if(!sheetOpen()&&!busy())render();else mUpd();}else if(!ui.page&&!busy()&&ui.sub==='servet')render();}

/* ---------- arama ---------- */
function mLocal(q){
  var f=fold(q).trim(),Q=q.trim().toLocaleUpperCase('tr-TR').replace(/İ/g,'I').replace(/\s+/g,''),out=[];if(!f)return out;
  var fk=Object.keys(MGOLD).concat(FXK.filter(function(k){return k.length===3&&k!=='XAU'&&k!=='XAG'&&k!=='CEY';}));
  if(FXALL)Object.keys(FXALL).forEach(function(k){if(fk.indexOf(k)<0&&/^[A-Z0-9]{3,20}$/.test(k)&&k!=='DBITCOIN')fk.push(k);});
  fk.forEach(function(k){var n=fxName(k);if(fold(n+' '+k+(k==='USD'?' dolar':'')+(k==='EUR'?' avro':'')).indexOf(f)>-1)out.push({k:'fx:'+k,n:n,s:k});});
  out=out.slice(0,8);
  if(BIST){var b=[];BIST.l.forEach(function(x){var fn=fold(x[1]),sc=x[0]===Q?0:(x[0].indexOf(Q)===0?1:(fn.indexOf(f)===0?2:(fn.indexOf(' '+f)>-1?3:(fn.indexOf(f)>-1?4:-1))));if(sc>=0)b.push([sc,x]);});
    b.sort(function(a,c){return a[0]-c[0]||(a[1][0]<c[1][0]?-1:1);});b.slice(0,10).forEach(function(z){out.push({k:'bist:'+z[1][0],n:z[1][1],s:z[1][0]});});}
  if(/^[A-Z0-9]{3}$/.test(Q))out.push({k:'fon:'+Q,n:Q+' fonu',s:Q});
  if(/^X[A-Z0-9]{2,5}$/.test(Q)&&!(BISTM&&BISTM[Q])&&Q!=='XU100')out.push({k:'bist:'+Q,n:Q+' endeksi',s:Q});
  return out;}
function mRemote(q){
  var key=fold(q).trim();if(key.length<2||mAsync[key])return;mAsync[key]={busy:1,l:[]};
  var add=function(l){var a=mAsync[key];a.l=a.l.concat(l);};
  var j1=njson(CG+'search?query='+encodeURIComponent(q.trim()),{cors:1}).then(function(j){add(((j&&j.coins)||[]).slice(0,6).map(function(c){return {k:'cg:'+c.id,n:c.name,s:c.symbol};}));},function(){});
  var j2=canNet()?njson(YH+'v1/finance/search?q='+encodeURIComponent(q.trim())+'&quotesCount=8&newsCount=0&lang=tr-TR').then(function(j){
    add(((j&&j.quotes)||[]).filter(function(x){return x.symbol&&/^(EQUITY|ETF|INDEX|MUTUALFUND)$/.test(x.quoteType)&&!/\.IS$/.test(x.symbol);}).slice(0,6).map(function(x){return {k:'yh:'+x.symbol,n:x.longname||x.shortname||x.symbol,s:x.symbol,x:x.exchDisp||''};}));},function(){}):Promise.resolve();
  Promise.all([j1,j2]).then(function(){mAsync[key].busy=0;if(fold(ui.mq||'').trim()===key)mUpd();});
}
function mResults(){
  var q=ui.mq||'',key=fold(q).trim(),l=mLocal(q),a=mAsync[key],seen={};
  if(a)l=l.concat(a.l);
  l=l.filter(function(x){if(seen[x.k])return false;seen[x.k]=1;return true;});
  l.forEach(function(x){MCAND[x.k]=x;});
  var g={};l.forEach(function(x){var s=mk(x.k).src;(g[s]=g[s]||[]).push(x);});
  var h=['fx','bist','fon','cg','yh'].filter(function(s){return g[s];}).map(function(s){
    return '<div class="lbl" style="margin:4px 2px 0">'+MSRC[s]+(s==='yh'||s==='fon'?' <span class="muted">(deneysel)</span>':'')+'</div><div class="card" style="padding-top:4px;padding-bottom:4px"><div class="list">'+g[s].map(function(x){
      var inW=!!mW(x.k),sub=s==='fon'?'TEFAS fon kodu':(x.s?String(x.s).toUpperCase():'')+(x.x?' · '+x.x:'');
      return '<button class="item" data-act="m-pick" data-id="'+esc(x.k)+'"><span class="mid"><div class="t">'+esc(x.n)+'</div><div class="small muted ell">'+esc(sub)+'</div></span>'+(inW?'<span class="small inc">Takipte</span>':ic('r'))+'</button>';}).join('')+'</div></div>';}).join('');
  if(a&&a.busy)h+='<div class="small muted" style="text-align:center">Kripto ve yabancı borsalarda aranıyor…</div>';
  if(!h)h='<div class="empty">Sonuç yok. Hisse kodu (THYAO), fon kodu (AFT), döviz (dolar) ya da kripto adı (bitcoin) yazabilirsin.</div>';
  if(!canNet())h+='<div class="small muted">Borsa İstanbul’un anlık fiyatı, yabancı borsalar ve fonlar yalnızca Android uygulamasında alınabilir; tarayıcıda hisseler gecikmeli kapanış fiyatıyla görünür.</div>';
  return h;}

/* ---------- takip listesi sayfası ---------- */
function mRow(k){var q=mQ(k),u=q&&q.ccy||'TRY';
  return '<button class="item" data-act="m-open" data-id="'+esc(k)+'"><span class="mid"><div class="t">'+esc(mName(k))+'</div><div class="small muted ell">'+esc(mSub(k))+'</div></span><span class="mq"><span class="num">'+(q&&q.p>0?fmtPx(q.p,u,k):'—')+'</span>'+(q?chgSpan(q.c):'')+(q&&q.err?'<span class="small muted">eski veri</span>':'')+'</span></button>';}
function mLast(){var t=0;S.watch.forEach(function(w){var q=mQ(w.k);if(q&&q.ts>t)t=q.ts;});return t;}
function mWatch(){
  var h='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="lbl">Takip listem</span><button class="btn small ghost" data-act="m-refresh">'+ic('refresh')+' Yenile</button></div>';
  h+=S.watch.length?'<div class="card" style="padding-top:4px;padding-bottom:4px"><div class="list">'+S.watch.map(function(w){return mRow(w.k);}).join('')+'</div></div>':'<div class="empty">Takip listen boş. Yukarıdan arayıp ekleyebilirsin.</div>';
  var sug=MSUG.filter(function(x){return !mW(x[0]);});
  if(sug.length)h+='<div class="lbl" style="margin:4px 2px 0">Hızlı ekle</div><div class="chips">'+sug.map(function(x){return '<button class="chip" data-act="m-sug" data-id="'+x[0]+'">+ '+esc(x[1])+'</button>';}).join('')+'</div>';
  var t=mLast();h+='<div class="small muted" id="m-ts">'+(t?'Son güncelleme: '+esc(fmtTs(t)):'')+'</div>';
  h+='<p class="small muted" style="margin:0">Kaynaklar: döviz ve altın Truncgil; Borsa İstanbul İş Yatırım (yaklaşık 15 dk gecikmeli); kripto CoinGecko; yabancı borsalar Yahoo Finance ve fonlar TEFAS (ikisi de deneysel). Fon fiyatları günde bir kez açıklanır. Bilgi amaçlıdır, yatırım tavsiyesi değildir.</p>';
  return h;}
function mBody(){return (ui.mq||'').trim()?mResults():mWatch();}
function vPiyasa(){
  var lk=ui.mlink&&byId(S.holdings,ui.mlink);
  return (lk?'<div class="banner"><span>“'+esc(lk.name)+'” için fiyat kaynağı seç: ara ve sonuca dokun.</span><button class="btn small ghost" data-act="m-linkoff">Vazgeç</button></div>':'')
   +'<div class="search">'+ic('search')+'<input id="mq" type="search" placeholder="Hisse, fon, döviz, altın, kripto ara" value="'+esc(ui.mq||'')+'" aria-label="Piyasalarda ara" autocomplete="off" autocapitalize="characters"></div>'
   +'<div id="mres" class="stack" style="gap:10px">'+mBody()+'</div>';}
function mTile(k){var q=mQ(k);return '<span class="rt"><span class="lbl ell">'+esc(mk(k).src==='fx'?mName(k).replace(' endeksi',''):mSym(k))+'</span><span class="num">'+(q&&q.p>0?fmtPx(q.p,q.ccy||'TRY',k):'—')+'</span>'+(q?chgSpan(q.c):'')+'</span>';}
/* Yatırımlar sekmesindeki kart: takip listesinin ilk dördü */
function mCard(){var l=S.watch.slice(0,4),t=mLast();
  if(!l.length)return '<button class="card ratecard" data-act="open-mkt"><span><b>Piyasaları takip et</b></span><span class="small muted">Hisse, fon, döviz, altın ve kripto ara; takip listesi oluştur ›</span></button>';
  return '<button class="card ratecard" data-act="open-mkt"><span class="rgrid">'+l.map(function(w){return mTile(w.k);}).join('')+'</span><span class="small muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>'+(t?'Güncelleme: '+esc(fmtTs(t)):'Fiyatlar henüz alınmadı')+'</span><span>Piyasalar ve takip listem ›</span></span></button>';}

/* ---------- ayrıntı penceresi ve grafik ---------- */
function mUrl(k){var m=mk(k),s=encodeURIComponent(m.sym);
  return {bist:isIdx(m.sym)?'':'https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/sirket-karti.aspx?hisse='+s,fon:'https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod='+s,cg:'https://www.coingecko.com/tr/coins/'+s,yh:'https://finance.yahoo.com/quote/'+s}[m.src]||'';}
function mSrcName(k){return {bist:'İş Yatırım',fon:'TEFAS',cg:'CoinGecko',yh:'Yahoo Finance'}[mk(k).src]||'';}
var YHFX={USD:'USDTRY=X',EUR:'EURTRY=X',GBP:'GBPTRY=X',CHF:'CHFTRY=X',XU100:'XU100.IS',ONS:'GC=F',BRENT:'BZ=F'};
function dmy(d){return pad(d.getDate())+'-'+pad(d.getMonth()+1)+'-'+d.getFullYear();}
function mHist(k,r){
  var m=mk(k),days={'1A':31,'3A':92,'1Y':366}[r]||31,yr={'1A':'1mo','3A':'3mo','1Y':'1y'}[r]||'1mo';
  if(m.src==='bist'&&!isIdx(m.sym)){var e=new Date(),s=new Date();s.setDate(s.getDate()-days);
    return njson(ISY+'HisseTekil?hisse='+encodeURIComponent(m.sym)+'&startdate='+dmy(s)+'&enddate='+dmy(e)).then(function(j){return ((j&&j.value)||[]).map(function(x){var p=String(x.HGDG_TARIH||'').split('-');return [new Date(+p[2],+p[1]-1,+p[0]).getTime(),+x.HGDG_KAPANIS];}).filter(function(x){return x[1]>0&&!isNaN(x[0]);});});}
  if(m.src==='cg')return njson(CG+'coins/'+encodeURIComponent(m.sym)+'/market_chart?vs_currency=try&days='+days+'&interval=daily',{cors:1}).then(function(j){return ((j&&j.prices)||[]).filter(function(x){return x[1]>0;});});
  var ys=m.src==='yh'?m.sym:(m.src==='bist'?m.sym+'.IS':(m.src==='fx'?YHFX[m.sym]:''));
  if(ys&&canNet())return yhChart(ys,yr).then(yhCloses);
  return Promise.reject(new Error('grafik yok'));}
function mChart(pts,u,k){
  if(!pts||pts.length<2)return '<div class="small muted">Grafik verisi yok.</div>';
  var v=pts.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=110,t0=pts[0][0],sp=(pts[pts.length-1][0]-t0)||1;
  var xy=pts.map(function(x){return [(x[0]-t0)/sp*W,H-6-(x[1]-mn)/rg*(H-12)];}),line=xy.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var ch=(v[v.length-1]/v[0]-1)*100,col=ch>=0?'var(--inc)':'var(--exp)',df=function(t){return new Date(t).toLocaleDateString('tr-TR',{day:'numeric',month:'short'});};
  return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span class="small muted">Dönem değişimi</span>'+chgSpan(ch)+'</div>'
   +'<svg class="spark" viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Fiyat grafiği"><polygon points="0,'+H+' '+line+' '+W+','+H+'" fill="'+col+'" opacity=".12"/><polyline points="'+line+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'
   +'<div class="small muted num" style="display:flex;justify-content:space-between;gap:8px"><span>'+esc(df(pts[0][0]))+'</span><span>En düşük '+fmtPx(mn,u,k)+' · en yüksek '+fmtPx(mx,u,k)+'</span><span>'+esc(df(pts[pts.length-1][0]))+'</span></div>';}
function mDet(k){
  var q=mQ(k),u=q&&q.ccy||'TRY',m=mk(k);
  if(!q||!(q.p>0))return '<p class="small muted" id="m-st">'+(mCur&&mCur.err?esc(mCur.err):'Fiyat alınıyor…')+'</p>';
  var abs=q.prev>0?q.p-q.prev:null,rows=[];
  if(q.prev>0)rows.push(['Önceki kapanış',fmtPx(q.prev,u,k)]);if(q.lo>0&&q.hi>0)rows.push(['Gün içi aralık',fmtPx(q.lo,u,k)+' – '+fmtPx(q.hi,u,k)]);
  if(u!=='TRY'&&u!=='pt'&&rateAny(u)>0)rows.push(['TL karşılığı',TRY2.format(q.p*rateAny(u))]);
  var when=q.at||q.ts;
  return '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><p class="big num" style="margin:0">'+fmtPx(q.p,u,k)+'</p>'+(q.c!=null&&isFinite(q.c)?'<span class="num '+(q.c>=0?'inc':'exp')+'">'+(abs!=null?(abs>=0?'+':'−')+pxf(Math.abs(abs)<1?4:2).format(Math.abs(abs))+' ':'')+'('+pctTxt(q.c)+')</span>':'')+'</div>'
   +(rows.length?'<div class="list">'+rows.map(function(r){return '<div class="item" style="padding:7px 0"><span class="mid small muted">'+r[0]+'</span><span class="num small">'+r[1]+'</span></div>';}).join('')+'</div>':'')
   +'<div class="small muted" id="m-st">'+(when?esc(fmtTs(when)):'')+(q.site?' · yayın sunucusundan, gecikmeli kapanış':'')+(m.src==='bist'&&!q.site?' · yaklaşık 15 dk gecikmeli':'')+(m.src==='fon'?' · fon fiyatı günde bir açıklanır':'')+(q.err?' · son yenileme başarısız, eski veri':'')+'</div>';}
function mHoldType(k){var m=mk(k);if(m.src==='bist')return 'Hisse';if(m.src==='fon')return 'Fon';if(m.src==='cg')return 'Kripto';if(m.src==='yh')return 'Hisse';
  if(m.sym==='GUMUS')return 'Gümüş';return MGOLD[m.sym]?'Altın':'Döviz';}
function mSheet(k){
  var m=mk(k),url=mUrl(k),inW=!!mW(k),idx=(mQ(k)||{}).ccy==='pt'||isIdx(m.sym)||m.sym==='XU100';mCur={k:k,r:(mCur&&mCur.k===k&&mCur.r)||'1A',err:''};
  openSheet('<h2 data-mk="'+esc(k)+'">'+esc(mName(k))+'</h2><div class="small muted" style="margin-top:-6px">'+esc(mSub(k))+'</div>'
   +'<div id="mdet" class="stack" style="gap:8px">'+mDet(k)+'</div>'
   +'<div class="seg mini" role="tablist" aria-label="Grafik dönemi">'+['1A','3A','1Y'].map(function(r){return '<button data-act="m-range" data-v="'+r+'" aria-pressed="'+(mCur.r===r)+'">'+({'1A':'1 ay','3A':'3 ay','1Y':'1 yıl'})[r]+'</button>';}).join('')+'</div>'
   +'<div id="mchart" class="stack" style="gap:6px"><div class="small muted">Grafik yükleniyor…</div></div>'
   +'<div class="two"><button class="btn'+(inW?' ghost':'')+'" data-act="m-watch" data-id="'+esc(k)+'">'+(inW?'Takipten çıkar':'Takip listesine ekle')+'</button>'+(idx?'':'<button class="btn ghost" data-act="m-hold" data-id="'+esc(k)+'">Yatırımlarıma ekle</button>')+'</div>'
   +(url?'<a class="btn ghost" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(mSrcName(k))+' sayfasını aç</a>':''));
  refreshMarket({keys:[k],force:true}).then(function(r){if(!mCur||mCur.k!==k)return;if(r.errs&&r.errs[k])mCur.err=mErrTxt(k,r.errs[k]);var d=document.getElementById('mdet');if(d&&document.querySelector('[data-mk="'+k+'"]'))d.innerHTML=mDet(k);mAfterQuiet();});
  mDraw();}
function mErrTxt(k,e){var m=mk(k);if(/uygulamada/.test(e))return 'Bu veri yalnızca Android uygulamasında alınabiliyor.';if(m.src==='fon')return 'Fon fiyatı TEFAS’tan alınamadı. Fon kodunu kontrol et ya da TEFAS sayfasını aç.';return 'Fiyat alınamadı ('+e+'). İnternet bağlantını kontrol edip tekrar dene.';}
function mAfterQuiet(){if(ui.page&&ui.page.k==='piyasa')mUpd();}
function mDraw(){var c=mCur;if(!c)return;var k=c.k,r=c.r,box=document.getElementById('mchart');if(!box)return;
  if(mk(k).src==='fon'){box.innerHTML='<div class="small muted">Fon getiri grafiği için TEFAS sayfasını aç.</div>';return;}
  box.innerHTML='<div class="small muted">Grafik yükleniyor…</div>';
  mHist(k,r).then(function(p){var b=document.getElementById('mchart');if(!b||!mCur||mCur.k!==k||mCur.r!==r)return;var q=mQ(k);b.innerHTML=mChart(p,q&&q.ccy||'TRY',k);},
    function(e){var b=document.getElementById('mchart');if(!b||!mCur||mCur.k!==k)return;b.innerHTML='<div class="small muted">'+(/uygulamada|grafik yok/.test(String(e&&e.message))&&!canNet()?'Grafik yalnızca Android uygulamasında görünür.':'Grafik verisi alınamadı.')+'</div>';});}

/* ---------- eylemler ---------- */
function mOpenPage(){openPage({k:'piyasa'},'piyasa');bistList().then(function(){if((ui.mq||'').trim())mUpd();});refreshMarket({}).then(mAfter);}
ACT['open-mkt']=function(){mOpenPage();};
ACT['qa-mkt']=function(el){if(el&&el.closest&&el.closest('#qa'))qaCount('qa-mkt');mOpenPage();};
ACT['m-open']=function(el,k){mSheet(k);};
ACT['m-pick']=function(el,k){
  if(ui.mlink){var x=byId(S.holdings,ui.mlink);if(!x){ui.mlink=null;mUpd();return;}
    if(isIdx(mk(k).sym)||mk(k).sym==='XU100'){toast('Endeks bir yatırım fiyatı değildir');return;}
    var c=MCAND[k];if(c&&!mW(k)&&!S.quotes[k])S.quotes[k]={n:c.n,s:c.s};
    x.mk=k;x.ccy='';x.mks=mSym(k);ui.mlink=null;ui.mq='';save();toast(x.name+' artık '+mSym(k)+' fiyatıyla güncellenecek');
    refreshMarket({keys:[k],force:true}).then(function(){save();if(!busy())render();});closePage();return;}
  mSheet(k);};
ACT['m-sug']=function(el,k){var x=MSUG.filter(function(s){return s[0]===k;})[0],m=mk(k);mAdd(k,m.src==='fx'?fxName(m.sym):(m.src==='cg'?'Bitcoin':((BISTM&&BISTM[m.sym])?BISTM[m.sym][1]:(x?x[1]:m.sym))),m.src==='cg'?'BTC':m.sym);};
function mAdd(k,n,s){if(mW(k))return;if(S.watch.length>=40){toast('Takip listesi en fazla 40 kalem olabilir');return;}
  S.watch.push({k:k,n:n||mName(k),s:s||mSym(k)});save();mUpd();
  refreshMarket({keys:[k],force:true}).then(function(){mUpd();});}
ACT['m-watch']=function(el,k){var w=mW(k);
  if(w){S.watch=S.watch.filter(function(x){return x.k!==k;});save();toast(mName(k)+' takipten çıkarıldı');}
  else{var c=MCAND[k]||{};mAdd(k,c.n||mName(k),c.s||mSym(k));toast(mName(k)+' takip listesine eklendi');}
  closeSheet();ui.mq='';if(ui.page&&ui.page.k==='piyasa')render();else mUpd();};
ACT['m-hold']=function(el,k){var m=mk(k),f=m.src==='fx'&&MFXK[m.sym];
  if(!f&&!(mTL(k)>0)){toast('Önce fiyat alınmalı; biraz bekleyip tekrar dene');return;}
  var c=MCAND[k];if(c&&!S.quotes[k])S.quotes[k]={n:c.n};
  hSheet(null,'inv',{name:mk(k).src==='fx'?mName(k):mSym(k)+(mk(k).src==='fon'?' fonu':''),type:mHoldType(k),ccy:f||'',mk:f?'':k});};
ACT['m-range']=function(el,id,r){if(!mCur)return;mCur.r=r;document.querySelectorAll('[data-act="m-range"]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===r));});mDraw();};
ACT['m-refresh']=function(el){if(el)el.disabled=true;refreshMarket({force:true,fon:true}).then(function(r){if(el)el.disabled=false;mUpd();
  toast(r.bad&&!r.n?'Fiyatlar alınamadı. İnternet bağlantını kontrol et.':(r.bad?r.n+' fiyat güncellendi, '+r.bad+' tanesi alınamadı':'Fiyatlar güncellendi'));});};
ACT['m-linkmode']=function(el,id){ui.mlink=id;ui.mq='';closeSheet();mOpenPage();};
ACT['m-linkoff']=function(){ui.mlink=null;render();};
/* takip sayfası açıkken dakikada bir yenile */
setInterval(function(){if(!document.hidden&&ui.page&&ui.page.k==='piyasa'&&!ui.locked)refreshMarket({}).then(function(r){if(r.n)mAfterQuiet();});},60000);
