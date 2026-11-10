
/* ---------- ortak parçalar ---------- */
function needSetup(){if(hasSample()||S.setupHide)return false;var any=ACCS().some(function(a){return (+S.opening[a]||0)!==0;});return !any&&!S.holdings.length&&!S.tx.length;}
ACT['setup-hide']=function(){S.setupHide=true;save();render();};
function bannerHtml(){
  if(needSetup())return '<div class="banner col"><span>Başlamak için hesaplarındaki mevcut parayı gir; böylece bakiyelerin doğru görünür.</span><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn small" data-act="open-bal">Bakiyeleri gir</button><button class="btn small ghost" data-act="sample-load">Örnekle dene</button><button class="btn small ghost" data-act="setup-hide">Sonra</button></span></div>';
  return hasSample()?'<div class="banner"><span>Örnek veriler gösteriliyor.</span><button class="btn small ghost" data-act="sample-clear">Örnekleri sil</button></div>':'';
}
/* yaklaşan ödemeler: düzenli ödemeler ve kredi kartı son ödeme günleri */
function cardDue(a,from){var due=+ax(a).due;if(!(due>0))return null;var y=from.getFullYear(),m=from.getMonth();
  var dt=new Date(y,m,Math.min(due,dimYM(y,m+1)));if(dt<from)dt=new Date(y,m+1,Math.min(due,dimYM(y,m+2)));return isoDate(dt);}
function upcoming(days){
  var out=[],t0=today0(),end=new Date(t0);end.setDate(end.getDate()+days);var e=isoDate(end),s=isoDate(t0),cur=curP(),seen={};
  for(var i=0;i<3;i++){var k=addMonth(cur,i);S.recurring.forEach(function(r){if(r.inc)return;occs(r,k).forEach(function(q){if(recPaid(r,q))return;var d=dueDate(r,q);if(d>e||(i>0&&d<s))return;var key=r.id+d;if(seen[key])return;seen[key]=1;
    out.push({date:d,name:r.name,amt:r.amt,acct:r.acct,kind:'rec',id:r.id,per:q});});});}
  ACCS().forEach(function(a){if(acctType(a)!=='kart')return;var cs=cardStmt(a);if(cs){if(cs.left>0&&cs.due&&cs.due<=e)out.push({date:cs.due,name:a+' ekstre',amt:cs.left,acct:a,kind:'card'});return;}var b=acctBal(a);if(!(b<0))return;var d=cardDue(a,t0);if(d&&d<=e)out.push({date:d,name:a+' son ödeme',amt:-b,acct:a,kind:'card'});});
  return out.sort(function(x,y){return x.date.localeCompare(y.date);});
}
/* uyarılar: [renk, metin, eylem] — eylem: ödeme için 'Ödendi', bütçe için kategori işlemleri */
var ALC={v:-1};
/* bir çizim içinde (başlık + ana sayfa) bir kez hesaplanır; çizim dışında her çağrı tazedir */
var RIN=false;
function alertItems(){if(RIN&&ALC.v===TXV)return ALC.r;var r=alertItems0();if(RIN)ALC={v:TXV,r:r};return r;}
function alertItems0(){
  var A=S.alerts,items=[],cur=curP();
  if(A.rec){var t0=todayS();upcoming(+A.days||0).forEach(function(u){var diff=daysBetween(t0,u.date);
    items.push([diff<0?'exp':'warn',u.name+' '+(diff<0?(-diff)+' gün gecikti':(diff===0?'bugün':diff+' gün sonra'))+' · '+moneyIn(u.amt,u.acct,1),u.kind==='rec'?['al-pay',u.id,u.per,'Ödendi']:['acct-trf',u.acct,null,'Öde']]);});}
  if(A.rec)items=items.concat(yAlerts(+A.days||0));
  items=items.concat(mTgtAlerts());
  if(A.budget){var sp=spentByCat(cur);EXPC().forEach(function(c){var lim=budLim(c,cur);if(lim>0){var s=sp[c]||0,r=s/lim*100;
    if(r>=100)items.push(['exp',c+' bütçesi aşıldı, '+TRY0.format(s-lim)+' fazla',['cat-tx',null,c,'Gör']]);
    else if(r>=A.thr)items.push(['warn',c+': bütçenin %'+Math.round(r)+' kullanıldı',['cat-tx',null,c,'Gör']]);}});}
  return items;
}
function alertRow(x,home){var a=x[2];return '<div class="item al">'+(home?'<span class="sic sm" style="--c:var(--'+x[0]+')">'+ic('bell')+'</span>':'<span class="dot" style="background:var(--'+x[0]+')"></span>')+'<span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span>'+(a?'<button class="btn small ghost" data-act="'+a[0]+'"'+(a[1]!=null?' data-id="'+esc(a[1])+'"':'')+(a[2]!=null?' data-v="'+esc(a[2])+'"':'')+'>'+a[3]+'</button>':'')+'</div>';}
/* ana sayfadaki Gündem satırları: ilk 3 uyarı düğmesiyle; daha fazlası "Tüm uyarılar" penceresinde */
function alertsHtml(){
  var items=alertItems();if(!items.length)return '';
  return items.slice(0,3).map(function(x){return alertRow(x,1);}).join('')+(items.length>3?'<button class="item almore" data-act="alerts"><span class="mid">Tüm uyarılar ('+items.length+')</span>'+ic('r')+'</button>':'');
}
function alertSheet(){
  var items=alertItems();if(!items.length){closeSheet();return;}
  openSheet('<h2>Uyarılar</h2><div class="list">'+items.map(function(x){return alertRow(x);}).join('')+'</div><button class="linkbtn" data-act="open-set" data-id="bild">Hatırlatıcı ayarları ›</button>');
}
/* sekme içi alt sekmeler (Planlama, Servetim, Analiz) */
function segTabs(list,cur,act,aria){return '<div class="seg" role="tablist" aria-label="'+aria+'">'+list.map(function(x){return '<button role="tab" data-act="'+act+'" data-v="'+x[0]+'" aria-pressed="'+(cur===x[0])+'" aria-selected="'+(cur===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>';}
function monthNav(flat){return '<div class="mnav'+(flat?' flat':'')+'"><button class="icon-btn" data-act="mprev" aria-label="Önceki dönem">'+ic('l')+'</button><span style="text-align:center">'+esc(plabel(ui.month))+(S.payday>1?'<div class="small muted" style="font-weight:500">'+esc(prange(ui.month))+'</div>':'')+'</span><button class="icon-btn" data-act="mnext" aria-label="Sonraki dönem">'+ic('r')+'</button></div>';}
function mvLabel(t){
  if(t.type==='inv'){var h=byId(S.holdings,t.hold),n=h?h.name:t.hname;return (t.side==='sell'?'Yatırım satışı':'Yatırım alımı')+(n?' · '+n:'');}
  if(t.type==='dbt'){var d=byId(S.debts,t.debt),m=d?d.name:t.dname;return (t.side==='in'?'Borç alındı':'Borç ödemesi')+(m?' · '+m:'');}
  if(t.type==='adj')return 'Bakiye düzeltmesi';
  return t.cat||'';
}
/* 4.21: transfer, borç, yatırım ve düzeltme satırlarında da simge (liste hizası aynı olsun) */
function mvIc(k,c){return '<span class="cic" style="color:var(--'+c+');background:color-mix(in srgb,var(--'+c+') 15%,transparent)" aria-hidden="true">'+ic(k)+'</span>';}
function txRow(t){
  if(t.type==='trf')return '<button class="item" data-act="edit-tx" data-id="'+t.id+'">'+mvIc(acctType(t.to)==='kart'?'card':'swap','ink2')+'<span class="mid"><div class="t">'+(t.note?esc(t.note):(acctType(t.to)==='kart'?'Kart borcu ödemesi':'Transfer'))+'</div><div class="small muted ell">'+(t.note?(acctType(t.to)==='kart'?'Kart borcu ödemesi · ':'Transfer · '):'')+esc(t.acct)+' → '+esc(t.to)+'</div></span><span class="amt"><span class="num">'+moneyIn(t.amt,t.acct)+'</span>'+(t.amt2>0?'<span class="small muted num">→ '+moneyIn(t.amt2,t.to)+'</span>':'')+'</span></button>';
  if(t.type==='inv'||t.type==='dbt'||t.type==='adj'){var lb=mvLabel(t),up=txDelta(t,t.acct)>0;
    return '<button class="item" data-act="edit-tx" data-id="'+t.id+'">'+(t.type==='dbt'?mvIc('bank','warn'):(t.type==='inv'?mvIc('trend','blue'):mvIc('scale','ink2')))+'<span class="mid"><div class="t">'+esc(t.note||lb)+'</div><div class="small muted ell">'+esc((t.note?lb+' · ':'')+t.acct)+'</div></span><span class="num'+(up?' inc':'')+'">'+(up?'+':'−')+moneyIn(Math.abs(t.amt),t.acct)+'</span></button>';}
  var inc=t.type==='inc';
  return '<button class="item" data-act="edit-tx" data-id="'+t.id+'">'+mrcIc([t.note,t.sub],t.cat)+'<span class="mid"><div class="t">'+(t.rc?'<span class="rcm" title="Fiş fotoğrafı var">'+ic('camera')+'</span>':'')+esc(t.note||t.sub||t.cat)+'</div><div class="small muted ell">'+(t.note?esc(catLabel(t.cat,t.sub))+' · ':(t.sub?esc(t.cat)+' · ':''))+esc(t.acct)+(t.split?' · bölünmüş':'')+(t.inst?' · taksitli':'')+'</div></span><span class="num '+(inc?'inc':'exp')+'">'+(inc?'+':'−')+moneyIn(t.amt,t.acct)+'</span></button>';
}
function dcol(i){return 'hsl('+((i*67+155)%360)+' 52% 55%)';}
function ccySel(id,val){return '<span class="ccy"><select id="'+id+'" aria-label="Para birimi">'+CCYS.map(function(c){return '<option value="'+c+'"'+(c===val?' selected':'')+'>'+CCYS_SHORT[c]+'</option>';}).join('')+'</select>'+ic('down')+'</span>';}

/* ---------- ana ekran ---------- */
/* dar kutucuklar için kısaltılmış tutar: 1,25 Mn */
function compactD(tl){var c=dccy(),v=tl/rateOf(c);if(maskOn||Math.abs(v)<1e6)return DC0.format(tl);var u=Math.abs(v)>=1e9?[1e9,' Mr']:[1e6,' Mn'],n=(v<0?'−':'')+NUM2.format(Math.abs(v)/u[0])+u[1];return c==='XAU'?n+' gr':CSYM[c]+(c==='CHF'?' ':'')+n;}
function compactT(tl){if(maskOn||Math.abs(tl)<1e6)return TRY0.format(tl);return (tl<0?'−':'')+'₺'+NUM2.format(Math.abs(tl)/1e6)+' Mn';}
/* bu dönem ne kadar kaldı: beklenen gelir − harcanan − dönem sonuna kadar ödenecek düzenli ödemeler */
function leftNow(){
  var k=curP(),mt=monthTx(k),inc=sum(mt,'inc'),spent=sum(mt,'exp'),ai=avgMonthly('inc'),hasRI=S.recurring.some(function(r){return r.inc&&recOn(r,k);}),expInc=hasRI?inc+recIncDue(k):Math.max(inc+recIncDue(k),ai||0),t0=todayS(),e=pEnd(k),rec=0;
  var RD=recDue(k);rec=RD.tot;
  /* düzenli ödeme olarak ödenen kredi taksitlerinin anaparası da dönemden çıkar (yoksa "Ödendi" deyince kalan artardı) */
  var paid=recDebtPaid(k);
  var left=r2(expInc-spent-paid-rec),days=daysLeft(k);
  return {k:k,inc:inc,expInc:r2(expInc),assumed:expInc>inc+0.5,spent:spent,paid:paid,rec:r2(rec),over:RD.over,left:left,days:days,daily:days>0?left/days:0,ok:expInc>0};
}
/* ana kart: önce net servet (büyük), altında bu dönem kalan ve günlük harcama sınırı */
function heroCard(W){
  var L=leftNow(),ch=histChange(30);
  var h='<div class="card hero nw"><div class="nwtop"><span class="lbl">Net servetim</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button>'+ccySel('dccy',S.dccy)+'</span></div>';
  h+='<button class="nwbig" data-act="sub" data-v="servet" aria-label="Net servet: hesaplar ve yatırımlar"><span class="big num">'+DC0.format(W.net)+'</span>'+ic('r')+'</button>';
  if(S.dccy!=='TRY'&&dccy()==='TRY')h+='<div class="small exp">'+esc(CCYN[S.dccy])+' kuru henüz yok; TL gösteriliyor.</div>';
  else if(dccy()!=='TRY')h+='<div class="small muted">1 '+(dccy()==='XAU'?'gr altın':esc(dccy()))+' = '+TRY2.format(rateOf(dccy()))+' · '+TRY0.format(W.net)+'</div>';
  if(ch&&!maskOn)h+='<div class="small"><b class="num '+(ch.d>=0?'inc':'exp')+'">'+sgnD(ch.d)+(ch.p!=null?' ('+(ch.p>=0?'+':'−')+'%'+NUM1.format(Math.abs(ch.p))+')':'')+'</b> <span class="muted">'+(ch.since?'ilk kayıttan beri':'son '+ch.days+' günde')+'</span></div>';
  h+='<div class="leftblk"><div class="lbl">'+esc(plabel(L.k))+' · bu dönem kalan</div>';
  if(L.ok){
    h+='<p class="mid num'+(L.left<0?' exp':'')+'" id="left-now">'+TRY0.format(L.left)+'</p>';
    h+='<div class="small">'+(L.left>0&&L.days>0?'<b>Günde ~'+TRY0.format(L.daily)+'</b> harcayabilirsin · '+L.days+' gün kaldı':(L.left<0?'<b class="exp">Bu dönem beklenen gelirini '+TRY0.format(-L.left)+' aştın.</b>':(L.days>1?'Bu dönem için harcayabileceğin para kalmadı · '+L.days+' gün kaldı':'Dönemin son günü.')))+'</div>';
    var p=L.expInc>0?clamp((L.spent+L.paid+L.rec)/L.expInc*100,0,100):0;
    h+='<div class="bar'+(p>=100?' over':(p>85?' warn':''))+'" style="margin-top:8px"><i style="width:'+p+'%"></i></div>';
    var pe=L.spent;h+='<button class="nwper" data-act="sub" data-v="islem" aria-label="Bu dönemin işlemleri"><span class="pl"><span class="lbl">Gelir</span><b class="num inc">'+compactT(L.inc)+'</b></span><span class="pl"><span class="lbl">Gider</span><b class="num exp">'+compactT(pe)+'</b></span>'+(L.rec>0?'<span class="pl"><span class="lbl">Ödenecek</span><b class="num">'+compactT(L.rec)+'</b></span>':'')+ic('r')+'</button>';
    if(L.over>0)h+='<div class="small exp" style="margin-top:6px">Bunun '+compactT(L.over)+' kadarı gecikmiş ödeme.</div>';
    /* 4.15: varsayım ve tahmin tek satırda */
    var F=forecast(),fo=F.hist&&F.rem>0&&F.spent>0;
    if(fo)h+='<div class="fcst small muted">Dönem sonu tahmini: '+(F.expInc>0?(F.net>=0?'artan':'eksik')+' ≈ <b class="num '+(F.net>=0?'inc':'exp')+'">'+compactT(Math.abs(F.net))+'</b> · ':'')+'gider ≈ '+compactT(F.exp)+(L.assumed||F.incAssumed?' · ortalama gelirine ('+compactT(L.expInc)+') göre':'')+'</div>';
    else if(L.assumed)h+='<div class="small muted" style="margin-top:6px">Kalan, ortalama gelirine ('+compactT(L.expInc)+') göre hesaplandı.</div>';
  }else{
    h+=L.spent>0?'<p class="mid num" id="left-now">'+TRY0.format(L.spent)+'</p><div class="small muted">Bu dönem harcanan. Gelirini eklersen ne kadar kaldığını gösteririm.</div>':'<p class="mid num muted" id="left-now">—</p><div class="small muted">Bu dönem henüz işlem yok. Gelirini ve giderlerini ekledikçe ne kadar kaldığını burada gösteririm.</div>';
  }
  return h+'</div></div>';
}
function periodHead(withSum){
  if(!withSum)return monthNav();
  var mt=monthTx(ui.month),inc=sum(mt,'inc'),exp=sum(mt,'exp'),net=inc-exp,cmp='';
  var isCur=ui.month===curP(),prev=addMonth(ui.month,-1),el=isCur?daysBetween(pStart(ui.month),todayS()):9999;
  var pe=monthTx(prev).filter(function(t){return t.type==='exp'&&daysBetween(pStart(prev),t.date)<=el;}).reduce(function(x,t){return x+txTL(t);},0);
  if(pe>0&&exp>0){var df=(exp-pe)/pe*100;cmp='<p class="small muted" style="margin:10px 0 0">'+(isCur?'Geçen dönemin aynı gününe göre':'Geçen döneme göre')+' giderlerin %'+Math.round(Math.abs(df))+(df>=0?' fazla.':' az.')+'</p>';}
  return '<div class="card period">'+monthNav(true)+'<div class="row3" style="margin-top:6px"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+(net<=-0.5?'−':'+')+compactT(Math.abs(net))+'</span></div></div>'+cmp+'</div>';
}
function vMain(){
  var cur=SECS.some(function(x){return x[0]===ui.sub;})?ui.sub:'ev';ui.sub=cur;
  var body={ev:vHome,islem:vIslem,analiz:analizBody,servet:servetBody,plan:planBody}[cur];
  return '<section id="secbody" class="stack">'+body()+'</section>';
}
/* ---------- Ana Sayfa ---------- */
function vHome(){
  var h=bannerHtml(),W=wealth();
  if(S.name)h+='<p class="small muted" style="margin:0 2px">'+esc(hello())+', <b>'+esc(S.name)+'</b></p>';
  /* sıra: ne kaldı → ekle → yapılacaklar (tek kart) → son işlemler → piyasalar. Notlar başlıktaki simgede, hesaplayıcılar Plan › Koç'ta */
  h+=heroCard(W)+smsBanner()+qaRow()+favRow('home')+gundem()+scutGrid();
  return h+recentCard()+mStrip();
}
/* Gündem: uyarılar, akıllı tespitler ve koçun şu anki adımı tek kartta, kısa satırlar halinde.
   4.4: zamana bağlı olanlar önce (ödeme, bütçe, olağandışı harcama); haftalarca aynı kalan Koç adımı en sonda */
function gundem(){
  var rows=alertsHtml();
  brainItems().slice(0,2).forEach(function(x){
    rows+='<div class="item bi"><span class="sic sm" style="--c:var(--'+x.c+')">'+ic(x.ic)+'</span><span class="mid"><div class="wrap-t">'+x.t+'</div><div class="bacts"><button class="linkbtn" data-act="'+x.act+'" data-id="'+esc(x.id)+'">'+x.btn+' ›</button><button class="linkbtn mute" data-act="br-dis" data-id="'+esc(x.key)+'">Gizle</button></div></span></div>';});
  rows+=coachHome(true);
  if(!rows)return '';
  return '<div class="card gundem brain"><h2>Gündem</h2><div class="list">'+rows+'</div></div>';
}
function hello(){var hr=new Date().getHours();return hr<5?'İyi geceler':hr<12?'Günaydın':hr<18?'İyi günler':'İyi akşamlar';}
/* "Tümü" her zaman listeyi açar (İşlemler takvim görünümünde bırakılmış olsa da) */
ACT['tx-all']=function(){ui.txv='list';goSec('islem');};
function recentCard(){
  /* tüm listeyi sıralamadan en yeni 5 işlem */
  var cmp=txCmp,l=[];
  for(var i=0;i<S.tx.length;i++){var t=S.tx[i];if(l.length<5||cmp(t,l[4])<0){l.push(t);l.sort(cmp);if(l.length>5)l.pop();}}
  if(!l.length)return '';
  return '<div class="card" style="padding-top:12px"><div class="ghead"><h2 style="margin:0;flex:1">Son işlemler</h2><button class="linkbtn" data-act="tx-all" data-v="islem">Tümü ›</button></div><div class="list">'+l.map(txRow).join('')+'</div></div>';
}

/* ---------- İşlemler: dönem kartı (ay oklarıyla), arama, tür süzgeci, gün gün liste ---------- */
/* 4.4: ikinci görünüm takvim (başlıktaki düğme); dönem kartı iki görünümde ortak. Takvim eskiden Analiz'deydi */
function rangeTx(){var t=todayS();if(ui.rng==='gun')return S.tx.filter(function(x){return x.date===t;});
  if(ui.rng==='hafta'){var s=wkStart(),e=new Date(pdate(s));e.setDate(e.getDate()+6);e=isoDate(e);return S.tx.filter(function(x){return x.date>=s&&x.date<=e;});}
  /* 4.21: bu yıl ve iki tarih arası */
  if(ui.rng==='yil'){var y=t.slice(0,4);return S.tx.filter(function(x){return x.date.slice(0,4)===y;});}
  if(ui.rng==='ozel'){var rf=rngFrom(),rt=rngTo();return S.tx.filter(function(x){return x.date>=rf&&x.date<=rt;});}
  return monthTx(ui.month);}
function rngFrom(){return /^\d{4}-\d{2}-\d{2}$/.test(ui.rf||'')?ui.rf:addD(todayS(),-30);}
function rngTo(){var v=/^\d{4}-\d{2}-\d{2}$/.test(ui.rt||'')?ui.rt:todayS();return v<rngFrom()?rngFrom():v;}
function vIslem(){
  if(ui.txv==='cal'){ui.rng='ay';return periodHead(true)+calBody();}
  var r=RNG.some(function(x){return x[0]===ui.rng;})?ui.rng:'ay';ui.rng=r;
  return '<div class="chips rng" role="group" aria-label="Zaman aralığı">'+RNG.map(function(x){return '<button class="chip" data-act="rng" data-v="'+x[0]+'" aria-pressed="'+(r===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>'
   +(r==='ay'?periodHead(true):rangeHead())+txBody();
}

/* ---------- İşlemler ---------- */
var TXH=typeof WeakMap==='function'?new WeakMap():null;
function txHay(t){var raw=String(t.note||'')+'\u0001'+(t.cat||'')+'\u0001'+(t.sub||'')+'\u0001'+(t.acct||'')+'\u0001'+(t.to||'')+'\u0001'+t.type+'\u0001'+(t.side||'')+'\u0001'+(t.hold||'')+'\u0001'+(t.debt||'')+'\u0001'+mvLabel(t);
  var c=TXH&&TXH.get(t);if(c&&c.r===raw)return c.h;
  var h=fold(String(t.note||'')+' '+(t.cat||'')+' '+(t.sub||'')+' '+(t.acct||'')+' '+(t.to||'')+' '+mvLabel(t));if(TXH)TXH.set(t,{r:raw,h:h});return h;}
var TQP={q:null,p:[]};
function txMatch(t,q){
  var h=txHay(t);
  var amt=String(t.amt).replace('.',','),amt2=String(t.amt);
  if(TQP.q!==q)TQP={q:q,p:q.split(/\s+/).filter(Boolean)};var parts=TQP.p;
  return parts.every(function(w){return h.indexOf(w)>=0||amt.indexOf(w.replace('.',','))>=0||amt2.indexOf(w)>=0;});
}
function txFilt(t){if(ui.acctF&&t.acct!==ui.acctF&&t.to!==ui.acctF)return false;if(ui.filter==='all')return true;if(ui.filter==='mv'||ui.filter==='trf')return t.type!=='inc'&&t.type!=='exp';return t.type===ui.filter;}
/* gün başlığındaki net tutar: gelir − gider (transferler hariç) */
function dayNet(l){var n=0;l.forEach(function(t){if(t.type==='inc')n+=txTL(t);else if(t.type==='exp')n-=txTL(t);});return r2(n);}
function txList(){
  var q=fold((ui.tq||'').trim());
  var mt=(q?S.tx.filter(function(t){return txFilt(t)&&txMatch(t,q);}):rangeTx().filter(txFilt)).sort(txCmp);
  if(!mt.length)return q?'<div class="empty">“'+esc(ui.tq.trim())+'” için işlem bulunamadı.</div>':'<div class="empty">'+(ui.acctF?esc(ui.acctF)+' hesabında bu dönemde hareket yok.':'Bu dönemde işlem yok. Sağ alttaki + ile ekle.')+'</div>';
  var cap=q?(ui.tqN||100):1e9,more=0;if(mt.length>cap){more=mt.length-cap;mt=mt.slice(0,cap);}
  /* 4.15: aramada bulunanların toplamı (gider, gelir) */
  var qs='';if(q){var ge=0,gi=0;(more?S.tx.filter(function(t){return txFilt(t)&&txMatch(t,q);}):mt).forEach(function(t){if(t.type==='exp')ge+=txTL(t);else if(t.type==='inc')gi+=txTL(t);});
    qs=(mt.length+more)+' sonuç'+(ge>0?' · gider <b class="num exp">'+TRY0.format(ge)+'</b>':'')+(gi>0?' · gelir <b class="num inc">'+TRY0.format(gi)+'</b>':'')+' · tüm dönemler';}
  var cur='',out=(q?'<div class="small muted" style="margin:0 2px 6px">'+qs+'</div>':'')+'<div class="card" style="padding-top:2px">';
  var byD={};mt.forEach(function(t){(byD[t.date]||(byD[t.date]=[])).push(t);});
  mt.forEach(function(t){if(t.date!==cur){cur=t.date;var dn=dayNet(byD[cur]);out+='<div class="day"><span>'+esc(dayLabel(t.date,!!q))+'</span>'+(Math.abs(dn)>=0.5?'<span class="num '+(dn<0?'exp':'inc')+'">'+sgn(dn)+'</span>':'')+'</div>';}out+='<div class="list">'+txRow(t)+'</div>';});
  return out+'</div>'+(more?'<button class="btn ghost" data-act="tq-more">'+more+' sonuç daha · göster</button>':'');
}
var DLC={};
function dayLabel(d,y){var k=d+(y?'y':'');return DLC[k]||(DLC[k]=pdate(d).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:y?'numeric':undefined,weekday:'long'}));}
ACT['tq-more']=function(){ui.tqN=(ui.tqN||100)+200;var tl=document.getElementById('txlist');if(tl)tl.innerHTML=txList();};
/* notlardaki #etiketler (en sık 8): dokununca o etiketle aranır */
ACT['tag-f']=function(el,id,v){ui.tq=fold(ui.tq||'').trim()===fold(v)?'':v;render();};
function txTags(){var m={};S.tx.forEach(function(t){var x=String(t.note||'').match(/#[\wçğıöşüÇĞİÖŞÜ-]{2,30}/g);if(x)x.forEach(function(g){g=g.toLocaleLowerCase('tr-TR');m[g]=(m[g]||0)+1;});});return Object.keys(m).sort(function(a,b){return m[b]-m[a];}).slice(0,8);}
function txBody(){
  var tg=txTags();
  return (tg.length?'<div class="chips tags" role="group" aria-label="Etiketler">'+tg.map(function(g){var on=fold(ui.tq||'').trim()===fold(g);return '<button class="chip" data-act="tag-f" data-v="'+esc(g)+'" aria-pressed="'+on+'">'+esc(g)+'</button>';}).join('')+'</div>':'')+'<div class="search">'+ic('search')+'<input id="tq" type="search" placeholder="İşlemlerde ara: not, kategori, tutar" aria-label="İşlemlerde ara" value="'+esc(ui.tq||'')+'"></div>'
   +(ui.acctF?'<div class="chips"><button class="chip rm" data-act="acct-clear" aria-pressed="true">'+esc(ui.acctF)+'</button></div>':'')+segTabs([['all','Tümü'],['inc','Gelir'],['exp','Gider'],['mv','Diğer']],ui.filter==='trf'?'mv':ui.filter,'filter','Filtre')
   +'<div id="txlist" class="stack">'+txList()+'</div>';
}

/* ---------- Hesaplar (cüzdan ve banka) ---------- */
var AGROUPS=[['nakit','Cüzdanım','cash','var(--warn)'],['banka','Banka hesapları','bank','var(--blue)'],['kart','Kredi kartları','card','var(--exp)'],['birikim','Birikim hesapları','coins','var(--inc)'],['diger','Diğer hesaplar','wallet','var(--ink2)']];
function acctLine(a){
  var b=acctBal(a),c=ccyOf(a),t=acctType(a),x=ax(a),sub=[];
  if(c!=='TRY')sub.push(CCYN[c]+(rateOf(c)>0?' · ≈ '+TRY0.format(toTL(b,a)):''));
  if(t==='kart'){if(+x.limit>0)sub.push('Kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)sub.push('Son ödeme: ayın '+x.due+sfx(x.due));}
  /* 4.15: bu dönemdeki net hareket ve birikim faizi */
  else if(!x.arch){var pf=0;monthTx(curP()).forEach(function(tx){if(tx.acct===a||tx.to===a)pf+=txDelta(tx,a);});if(Math.abs(pf)>=1)sub.push('Bu dönem '+(pf>=0?'+':'−')+moneyIn(Math.abs(pf),a,1));if(aRate(a))sub.push('Yıllık %'+NUM2.format(aRate(a))+' faiz');}
  return '<button class="item" data-act="acct-open" data-id="'+esc(a)+'">'+acctIc(a)+'<span class="mid"><div class="t">'+esc(a)+'</div>'+(sub.length?'<div class="small muted">'+esc(sub.join(' · '))+'</div>':'')+'</span><span class="num'+(b<0?' exp':'')+'">'+moneyIn(b,a)+'</span></button>';
}
/* Hesaplar: türe göre gruplar (boş gruplar gizli); hesap eklemek tek düğmede, transfer + düğmesindeki işlem penceresinde */
function hesapBody(){
  var h=needSetup()?'<div class="card hint"><p class="small" style="margin:0">Hesaplarındaki mevcut parayı girersen bakiyeler ve net servetin doğru görünür.</p><button class="btn small" data-act="open-bal">Bakiyeleri gir</button></div>':'';
  h+='<div class="sumline"><span class="muted">Hesaplardaki para</span><b class="num">'+TRY0.format(accTotal())+'</b></div>';
  var arc=ACCS().filter(function(a){return ax(a).arch;});
  AGROUPS.forEach(function(gp){var l=ACCS().filter(function(a){return acctType(a)===gp[0]&&!ax(a).arch;});if(!l.length)return;
    var s=r2(l.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
    h+='<div class="card" style="padding-top:12px"><div class="ghead"><span class="sic sm" style="--c:'+gp[3]+'">'+ic(gp[2])+'</span><h2 style="margin:0;flex:1">'+gp[1]+'</h2><span class="num'+(s<0?' exp':'')+'">'+TRY0.format(s)+'</span></div><div class="list">'+l.map(acctLine).join('')+'</div></div>';});
  if(arc.length){var arcT=arc.reduce(function(s,a){return s+toTL(acctBal(a),a);},0);h+='<details class="card"><summary><b>Arşivlenen hesaplar</b><span class="small muted"> · '+arc.length+(Math.abs(arcT)>0.5?' · '+TRY0.format(arcT)+' (net servete dahil)':'')+'</span></summary>';}if(arc.length)h+='<div class="list">'+arc.map(acctLine).join('')+'</div></details>';
  return h+'<button class="btn ghost" data-act="new-a">'+ic('plus')+' Hesap ekle</button>';
}
/* başlangıç bakiyeleri tek pencerede (ilk kurulum) */
/* kurulum: hesaplar, bakiyelerin tarihi ve maaş günü tek pencerede.
   Bakiye tarihinden önceki işlemler bakiyeyi değiştirmez (raporlarda yine görünür): geçmiş işlem girmek bakiyeyi şişirmez */
function balSheet(){
  var od=S.openD||{},d0=ACCS().map(function(a){return od[a];}).filter(Boolean).sort().pop()||todayS(),pd=S.payday||1,o='';for(var i=1;i<=31;i++)o+='<option value="'+i+'"'+(i===pd?' selected':'')+'>Ayın '+i+sfx(i)+'</option>';o+='<option value="32"'+(pd===32?' selected':'')+'>Ayın son iş günü</option>';
  openSheet('<h2>Hesaplarındaki para</h2><p class="small muted" style="margin:0">Her hesapta o gün ne kadar olduğunu yaz. Kredi kartında borç varsa eksi yaz (örn. -2500).</p>'
   +ACCS().map(function(a,i){return '<div class="field"><label for="ob-'+i+'">'+esc(a)+' ('+CSYM[ccyOf(a)]+')</label><input id="ob-'+i+'" data-ob="'+esc(a)+'" inputmode="decimal" placeholder="0" value="'+nv(+S.opening[a]||'')+'"></div>';}).join('')
   +'<button class="linkbtn" data-act="bal-newa">+ Başka hesap ekle</button>'
   +'<div class="two"><div class="field"><label for="ob-date">Bakiyeler hangi güne ait?</label><input id="ob-date" type="date" value="'+d0+'" max="'+todayS()+'"></div><div class="field"><label for="ob-pd">Maaş günü</label><select id="ob-pd">'+o+'</select></div></div>'
   +'<div class="small muted">Bu tarihten önceki işlemleri sonradan girersen bakiyeyi değiştirmez; gelir-gider raporlarında görünür. Maaş günü dönemlerin başlangıcıdır.</div>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-bal">Kaydet</button>');
}
ACT['bal-newa']=function(){if(!balApply())return;save();ui.balBack=true;aSheet(null);};
ACT['open-bal']=function(){balSheet();};
function balApply(){var o={},bad=false;document.querySelectorAll('[data-ob]').forEach(function(e){var v=r2(num(e.value));if(tooBig(v))bad=true;o[e.dataset.ob]=v;});
  if(bad){ferr('Tutar çok büyük (en fazla 100 milyar).');return false;}
  var dt=val('ob-date'),pd=parseInt(val('ob-pd'),10);if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||dt>todayS())dt=todayS();S.openD=S.openD||{};
  if(pd>=1&&pd<=32&&pd!==S.payday){try{setPayday(pd);}catch(e){S.payday=pd;}ui.month=curP();}
  Object.keys(o).forEach(function(a){if(ACCS().indexOf(a)>=0){S.opening[a]=o[a];S.openD[a]=dt;}});S.sampleExtras=false;return true;}
ACT['save-bal']=function(){if(!balApply())return;S.setupHide=true;save();closeSheet();render();toast('Bakiyeler kaydedildi · net servet '+TRY0.format(wealth().net));};
/* Hesaplar sekmesinin üstü: net servet (görüntüleme para birimiyle), dokunulabilir gelişim grafiği, varlık/borç ve dağılım.
   4.2: eski Analiz › Servet buraya taşındı; net servet tek yerde */
function nwTop(){
  var W=wealth();
  var h='<div class="card hero nw"><div class="nwtop"><span class="lbl">Net servetim</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button>'+ccySel('dccy',S.dccy)+'</span></div>';
  h+='<p class="big">'+DC0.format(W.net)+'</p>';
  if(S.dccy!=='TRY'&&dccy()==='TRY')h+='<div class="small exp">'+esc(CCYN[S.dccy])+' kuru henüz yok; TL gösteriliyor. Yenile düğmesine dokun.</div>';
  else if(dccy()!=='TRY')h+='<div class="small muted">1 '+(dccy()==='XAU'?'gr altın':esc(dccy()))+' = '+TRY2.format(rateOf(dccy()))+' · '+TRY0.format(W.net)+'</div>';
  if(!maskOn)h+=nwChart();
  h+='<div class="row3" style="grid-template-columns:1fr 1fr;margin-top:8px"><div><div class="lbl">Varlıklar</div><span class="num">'+compactD(W.assets)+'</span></div><div><div class="lbl">Borçlar</div><span class="num'+(W.debt>0?' exp':'')+'">'+compactD(W.debt)+'</span></div></div>';
  return h+distBar()+'</div>';
}
/* net servet grafiği: 3 ay / 1 yıl / tümü; dokununca ya da parmak kaydırınca o günün değeri (nwScrub) */
function nwChart(){
  var s=nwSeries();if(s.length<2)return '';
  var R=ui.nwr===12||ui.nwr===1?ui.nwr:3,from=pdate(s[s.length-1][0]);from.setDate(from.getDate()-(R===12?364:91));
  var fk=isoDate(from),r=R===1?s:s.filter(function(x){return x[0]>=fk;});if(r.length<2)r=s.slice(-2);
  var v=r.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=72;
  var t0=pdate(r[0][0]).getTime(),span=(pdate(r[r.length-1][0]).getTime()-t0)||1;
  var xy=r.map(function(x,i){return [(pdate(x[0]).getTime()-t0)/span*W,H-5-(v[i]-mn)/rg*(H-10)];});
  var pts=xy.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var data=r.map(function(x,i){return [x[0],x[1],xy[i][0]/W,xy[i][1]/H,x[2]?1:0];}),d=r2(r[r.length-1][1]-r[0][1]),p0=r[0][1];
  return '<div class="nwhead"><span class="small muted">Gelişim</span><div class="seg mini" role="group" aria-label="Süre"><button data-act="nwr" data-v="3" aria-pressed="'+(R===3)+'">3 ay</button><button data-act="nwr" data-v="12" aria-pressed="'+(R===12)+'">1 yıl</button><button data-act="nwr" data-v="1" aria-pressed="'+(R===1)+'">Tümü</button></div></div>'
   +'<div class="nwchart" data-pts="'+esc(JSON.stringify(data))+'"><svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Net servet grafiği"><polygon points="0,'+H+' '+pts+' '+W+','+H+'" fill="var(--accent)" opacity=".1"/><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><i class="nwdot" hidden></i></div>'
   +'<div class="small" id="nwpick"><b class="num '+(d>=0?'inc':'exp')+'">'+sgnD(d)+(Math.abs(p0)>0.5?' ('+(d>=0?'+':'−')+'%'+NUM1.format(Math.abs(d/Math.abs(p0)*100))+')':'')+'</b> <span class="muted">'+(R===3?'son 3 ayda':(R===12?'son 1 yılda':'ilk kayıttan bu yana'))+' · güne dokun</span></div>';
}
/* varlık dağılımı: artı bakiyeli hesaplar türüne göre, yatırım ve varlıklar cinsine göre */
function distBar(){
  var by={},tot=0;ACCS().forEach(function(a){var b=r2(toTL(acctBal(a),a));if(b<=0)return;var n={nakit:'Nakit',banka:'Banka',kart:'Banka',birikim:'Birikim',diger:'Diğer hesaplar'}[acctType(a)];by[n]=(by[n]||0)+b;});
  S.holdings.forEach(function(x){var v=hVal(x);if(v>0)by[x.type]=(by[x.type]||0)+v;});
  var l=Object.keys(by).map(function(k){tot+=by[k];return [k,by[k]];}).sort(function(a,b){return b[1]-a[1];});if(!(tot>0)||l.length<2)return '';
  if(l.length>5){var rest=l.slice(4).reduce(function(a,x){return a+x[1];},0);l=l.slice(0,4).concat([['Diğer',rest]]);}
  return '<div class="lbl" style="margin-top:10px">Varlık dağılımı</div><div class="stackbar" style="margin-top:6px" role="img" aria-label="Varlık dağılımı">'+l.map(function(x,i){return '<i style="width:'+(x[1]/tot*100)+'%;background:'+dcol(i)+'"></i>';}).join('')+'</div><div class="legend">'+l.map(function(x,i){return '<span style="--c:'+dcol(i)+'">'+esc(x[0])+' %'+(x[1]/tot<0.01?'<1':Math.round(x[1]/tot*100))+'</span>';}).join('')+'</div>';
}
function servetBody(){if(ui.sv==='varlik')ui.sv='yatirim';var v=WEALTH.some(function(x){return x[0]===ui.sv;})?ui.sv:'hesap';return nwTop()+segTabs(WEALTH,v,'sv','Hesaplar')+({hesap:hesapBody,yatirim:yatirimBody,borc:borcBody}[v])();}
/* liste ekranlarında "… ekle" tek biçimde: listenin altında (Hesap ekle gibi); liste boşken asıl eylem olduğundan birincil düğme */
function addBtn(act,label,empty,v){return '<button class="btn'+(empty?'':' ghost')+'" data-act="'+act+'"'+(v?' data-v="'+v+'"':'')+'>'+(empty?'':ic('plus')+' ')+label+'</button>';}

/* ---------- Bütçe, Hedefler, Düzenli ---------- */
function planBody(){
  var p=PLANS.some(function(x){return x[0]===ui.plan;})?ui.plan:'butce';ui.plan=p;
  var seg=segTabs(PLANS,p,'plan','Plan');
  return seg+(p==='koc'?vKoc():(p==='butce'?periodHead(false)+budgetBody():(p==='duzenli'?periodHead(false)+duzenliBody():hedefBody())));
}
/* Bütçe: üstte bütçeden kalan; limitli kategoriler ilerlemeleriyle; limitsizler katlanır "Limit koy" listesinde */
function catRow(c,sp){
  var lim=budLim(c,ui.month),s=sp[c]||0,ratio=lim?s/lim:0,cls=ratio>1?'over':(ratio>.8?'warn':'');
  var info=lim?TRY0.format(s)+' / '+TRY0.format(lim)+(S.budRoll&&lim!==+S.budgets[c]?' (devirle)':'')+(ratio>1?' · '+TRY0.format(s-lim)+' aşıldı':' · '+TRY0.format(lim-s)+' kaldı'):(s?'Bu dönem '+TRY0.format(s)+' harcandı':'');
  return '<div class="catrow"><div class="top"><button class="cn" data-act="cat-tx" data-v="'+esc(c)+'">'+cic(c,'sm')+'<span class="mid ell">'+esc(c)+'</span></button><input class="lim" inputmode="decimal" data-budget="'+esc(c)+'" placeholder="Limit" value="'+nv(+S.budgets[c]||'')+'" aria-label="'+esc(c)+' aylık limit (₺)"></div>'+(info?'<div class="small muted num">'+info+'</div>':'')+(lim?'<div class="bar '+cls+'"><i style="width:'+Math.min(ratio*100,100)+'%"></i></div>':'')+'</div>';
}
function budgetBody(){
  var sp=spentByCat(ui.month),limSum=0,spSum=0,lims=[],rest=[];
  EXPC().forEach(function(c){if(+S.budgets[c]>0){lims.push(c);limSum+=budLim(c,ui.month);spSum+=(sp[c]||0);}else rest.push(c);});
  rest.sort(function(a,b){return (sp[b]||0)-(sp[a]||0);});
  var h,left=r2(limSum-spSum),days=ui.month===curP()?daysLeft(ui.month):0,sug=budgetSuggest();
  if(limSum>0){
    /* aşan kategoriler toplamı gizlemesin: kalan yalnızca aşılmayan kategorilerden, aşımlar ayrı satırda */
    var okLeft=0,over=[];lims.forEach(function(c){var d=budLim(c,ui.month)-(sp[c]||0);if(d>=0)okLeft+=d;else over.push([c,-d]);});okLeft=r2(okLeft);
    h='<div class="card"><div class="lbl">'+(over.length?'Aşılmayan kategorilerde kalan':'Bütçeden kalan')+'</div><p class="big">'+TRY0.format(okLeft)+'</p><div class="small muted">Harcanan '+TRY0.format(spSum)+' / '+TRY0.format(limSum)+' · '+lims.length+' kategoride limit var</div>'
      +(over.length?'<div class="small exp" style="margin-top:6px">Aşıldı: '+over.map(function(x){return esc(x[0])+' '+TRY0.format(x[1]);}).join(' · ')+'</div>':'')+'<div class="bar'+(spSum>limSum?' over':(spSum>limSum*.8?' warn':''))+'" style="margin-top:10px"><i style="width:'+Math.min(spSum/limSum*100,100)+'%"></i></div>'
      +(okLeft>0&&days>0?'<div class="small" style="margin-top:8px">Bütçede kalmak için günde en fazla <b>~'+TRY0.format(okLeft/days)+'</b> · '+days+' gün kaldı</div>':'')+'</div>';
    h+='<div class="card"><h2>Limitler</h2>'+lims.map(function(c){return catRow(c,sp);}).join('')+'<button class="row-tgl" data-act="bud-roll" role="switch" aria-checked="'+!!S.budRoll+'"><span class="mid"><div class="t">Artanı sonraki döneme devret</div><div class="small muted">Geçen dönemden artan limit bu döneme eklenir, aşım düşülür</div></span><span class="sw"></span></button></div>';
  }else{
    h='<div class="card"><div class="lbl">Bütçe</div><p class="small muted" style="margin:6px 0 0">Harcadığın kategorilere aylık limit koy; ne kadar kaldığını ve günde ne kadar harcayabileceğini burada görürsün.</p>'+(sug.length?'<button class="btn small" style="margin-top:10px" data-act="bud-sug">Son 3 dönemin ortalamasıyla doldur</button><div class="small muted" style="margin-top:6px">'+esc(sug.slice(0,4).map(function(x){return x[0]+' '+TRY0.format(x[1]);}).join(' · '))+'</div>':'')+'</div>';
  }
  if(rest.length)h+='<details class="card limadd"'+(limSum>0&&!ui.limOpen?'':' open')+'><summary><b>Limit koy</b><span class="small muted"> · '+rest.length+' kategoride limit yok</span></summary><p class="small muted" style="margin:8px 0 0">Aylık limit yaz. Boş bıraktığın kategori takip edilmez.</p>'+rest.map(function(c){return catRow(c,sp);}).join('')+'</details>';
  return h+'<button class="linkbtn" data-act="an-go" data-v="harcama">Harcama dağılımı ve trendler ›</button>';
}
/* bütçe önerisi: son 3 tamamlanmış dönemde düzenli harcama yapılan kategorilerin ortalaması (100'e yuvarlanır) */
function budgetSuggest(){var k=curP(),pks=prevKs(k,3),cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;if(!cnt)return [];
  var avg=catAvg(k),out=[];EXPC().forEach(function(c){var a=avg[c]||0;if(a>=100)out.push([c,Math.ceil(a/100)*100]);});return out.sort(function(a,b){return b[1]-a[1];});}
ACT['bud-roll']=function(){S.budRoll=!S.budRoll;save();render();};
ACT['bud-sug']=function(){var l=budgetSuggest();if(!l.length)return;l.forEach(function(x){if(!(+S.budgets[x[0]]>0))S.budgets[x[0]]=x[1];});S.sampleExtras=false;save();render();toast(l.length+' kategoriye limit kondu; istediğin gibi değiştirebilirsin');};
function goalInfo(g){
  var sv=goalSaved(g),left=Math.max(g.target-sv,0);
  if(sv>=g.target)return 'Hedefe ulaştın';
  if(g.date){var now=today0(),d=pdate(g.date),dd=daysBetween(isoDate(now),g.date),m=(d.getFullYear()-now.getFullYear())*12+d.getMonth()-now.getMonth()-(d.getDate()<now.getDate()?1:0);
    return dd<0?'Tarih geçti, '+TRY0.format(left)+' eksik':(m>=1?m+' ay kaldı · ayda ~'+TRY0.format(left/m)+' ayır':(dd===0?'Son gün bugün':dd+' gün kaldı')+' · '+TRY0.format(left)+' eksik');}
  return TRY0.format(left)+' kaldı';
}
function hedefBody(){
  if(!S.goals.length)return '<div class="empty">Henüz hedef yok. Tatil, acil durum fonu ya da büyük bir alışveriş için hedef koy. Hedefi bir birikim hesabına bağlarsan biriken tutar hesaptan otomatik gelir.</div>'+addBtn('new-g','Hedef ekle',1);
  var tot=0,sv=0,h='';S.goals.forEach(function(g){tot+=g.target;sv+=goalSaved(g);});
  h+='<div class="card"><div class="lbl">Toplam birikim</div><p class="big">'+TRY0.format(sv)+'</p><div class="small muted">Hedeflerin toplamı '+TRY0.format(tot)+' · %'+Math.round(tot>0?Math.min(sv/tot*100,100):0)+'</div></div>';
  S.goals.forEach(function(g){
    var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;
    h+='<div class="card stack" style="gap:10px"><button class="item" style="padding:0;border:0" data-act="edit-g" data-id="'+g.id+'"><span class="mid"><div class="t" style="font-weight:700">'+esc(g.name)+'</div><div class="small muted">'+esc(goalInfo(g))+'</div></span><span class="num">%'+Math.round(p)+'</span></button><div class="bar"><i style="width:'+p+'%"></i></div><div class="small num muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>'+TRY0.format(s)+' / '+TRY0.format(g.target)+'</span>'+(g.acct&&ACCS().indexOf(g.acct)>=0?'<span>Bağlı hesap: '+esc(g.acct)+'</span>':'')+'</div><button class="btn small ghost" style="align-self:flex-start" data-act="goal-add" data-id="'+g.id+'">Para ekle</button></div>';
  });
  return h+addBtn('new-g','Hedef ekle');
}
function duzenliBody(){
  if(!S.recurring.length)return '<div class="empty">Henüz düzenli ödeme yok. Kira, fatura, kredi taksiti ve abonelikleri ekle; hatırlatıcı ödeme gününü kaçırmamanı sağlar.</div>'+addBtn('new-r','Düzenli ödeme ekle',1);
  var tot=0,rem=0,cur=curP(),t0=todayS(),h='';
  tot=recMonthlyTot();rem=recDue(ui.month).tot;
  h+='<div class="card"><div class="row3" style="margin-top:0;grid-template-columns:1fr 1fr"><div><div class="lbl">Aylık toplam</div><span class="num">'+TRY0.format(tot)+'</span><div class="small muted">yılda '+compactT(tot*12)+'</div></div><div><div class="lbl">Bu dönem ödenecek</div><span class="num">'+TRY0.format(rem)+'</span></div></div></div>';
  var list=S.recurring.slice().sort(function(a,b){return dueDate(a,recShow(a,ui.month)).localeCompare(dueDate(b,recShow(b,ui.month)));});
  h+='<div class="card" style="padding-top:4px"><div class="list">'+list.map(function(r){
    var q=recShow(r,ui.month),paid=recPaid(r,q),st,dd=dueDate(r,q),dbt=r.debt&&byId(S.debts,r.debt),on=recOn(r,ui.month),inc=!!r.inc,wq=isWk(r)?occs(r,ui.month):null;
    var fq=recFq(r),no=+r.n>0&&on?recNo(r,q)+'/'+r.n:'',wp=wq&&wq.length>1?wq.filter(function(x){return recPaid(r,x);}).length+'/'+wq.length+' '+(inc?'geldi':'ödendi'):'';
    var sub=esc([on?pdate(dd).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}):'',fq,no?(isWk(r)?'':'taksit ')+no:'',wp,dbt?'Borç: '+dbt.name:catLabel(r.cat,r.sub),r.acct].filter(Boolean).join(' · '));
    var head=function(am){return '<button class="rmain" data-act="edit-r" data-id="'+r.id+'">'+mrcIc([r.name,r.sub],r.cat)+'<span class="mid"><span class="rtop"><span class="t ell">'+esc(r.name)+'</span>'+am+'</span><span class="small muted rsub">'+sub+'</span></span></button>';};
    if(!on){return '<div class="ritem">'+head('<span class="num">'+moneyIn(r.amt,r.acct,1)+'</span>')+'<div class="rfoot"><span class="pill">'+(recDone(r)?'Tamamlandı':'Bu dönem yok')+'</span></div></div>';}
    if(paid)st='<span class="pill ok">'+(inc?'Geldi':'Ödendi')+'</span>';
    else if(ui.month===cur){var diff=daysBetween(t0,dd);st=diff<0?'<span class="pill late">'+(-diff)+' gün gecikti</span>':(diff===0?'<span class="pill late">Bugün</span>':'<span class="pill">'+diff+' gün sonra</span>');}
    else if(ui.month<cur)st='<span class="pill late">Ödenmedi</span>';
    else st='<span class="pill">Bekliyor</span>';
    return '<div class="ritem">'+head('<span class="num'+(inc?' inc':'')+'">'+(inc?'+':'')+moneyIn(r.amt,r.acct,1)+'</span>')+'<div class="rfoot">'+st+'<button class="btn small '+(paid?'ghost':'')+'" data-act="'+(paid?'rundo':'rpay')+'" data-id="'+r.id+'" data-v="'+q+'">'+(paid?'Geri al':(inc?'Geldi':'Ödendi'))+'</button></div></div>';}).join('')+'</div></div>';
  return h+addBtn('new-r','Düzenli ödeme ya da gelir ekle');
}

/* ---------- 4.5: sadeleştirmede kaldırılan özellikler geri geldi (yerleri düzenlendi) ---------- */
function donut(items,emptyMsg,act){
  var tot=items.reduce(function(a,x){return a+x[1];},0);
  if(!(tot>0))return '<div class="small muted" style="padding:10px 0">'+emptyMsg+'</div>';
  items=items.slice().sort(function(a,b){return b[1]-a[1];});
  var agg=false;if(items.length>5){var rest=items.slice(4).reduce(function(a,x){return a+x[1];},0);items=items.slice(0,4).concat([['Diğer',rest]]);agg=true;}
  var off=25,c='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--soft)" stroke-width="6"></circle>';
  var col=function(x,i){return act==='cat-tx'&&x[0]!=='Diğer'?color(x[0]):dcol(i);};
  items.forEach(function(x,i){var p=x[1]/tot*100;c+='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="'+col(x,i)+'" stroke-width="6" stroke-dasharray="'+p.toFixed(3)+' '+(100-p).toFixed(3)+'" stroke-dashoffset="'+off.toFixed(3)+'"></circle>';off-=p;});
  return '<div class="dwrap"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Dağılım grafiği">'+c+'</svg><div class="lgs">'+items.map(function(x,i){return (act&&!(agg&&i===items.length-1)?'<button class="lg" data-act="'+act+'" data-v="'+esc(x[0])+'">':'<div class="lg">')+'<span class="dot" style="background:'+col(x,i)+'"></span><span class="mid ell">'+esc(x[0])+'</span><span class="num">'+(x[1]/tot<0.01?'&lt;%1':'%'+Math.round(x[1]/tot*100))+'</span>'+(act&&!(agg&&i===items.length-1)?'</button>':'</div>');}).join('')+'</div></div>';
}
function insights(){
  var out=[],k=curP(),s=pstat(k),sp=spentByCat(k),pks=prevKs(k,3),avg={},cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;
  if(cnt){pks.forEach(function(p){var o=spentByCat(p);Object.keys(o).forEach(function(c){avg[c]=(avg[c]||0)+o[c]/cnt;});});
    Object.keys(sp).forEach(function(c){if(avg[c]>0&&sp[c]>avg[c]*1.2&&sp[c]-avg[c]>=100)out.push(['warn',c+' harcaman bu dönem şimdiden ortalamanın %'+Math.round((sp[c]/avg[c]-1)*100)+' üzerinde ('+TRY0.format(sp[c])+' / ort. '+TRY0.format(avg[c])+').']);});
    var ne=Object.keys(sp).filter(function(c){return !(avg[c]>0)&&sp[c]>=500;});if(ne.length)out.push(['muted','Yeni harcama kalemi: '+ne.slice(0,3).join(', ')+'.']);}
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});lim.forEach(function(c){var bl=budLim(c,k),r=(sp[c]||0)/bl;if(r>=1)out.push(['exp',c+' bütçesini '+TRY0.format((sp[c]||0)-bl)+' aştın.']);});
  var H=health();H.parts.forEach(function(p){if(p.k==='Acil durum fonu'&&p.p!=null&&p.p<0.5)out.push(['warn','Acil durum fonun '+p.v+'lık gideri karşılıyor; 6 ay hedefle.','em-open']);});
  if(s.rate!=null&&s.rate>=20)out.push(['inc','Bu dönem şu ana kadar gelirinin %'+Math.round(s.rate)+sfx(Math.round(s.rate))+' harcanmadı.']);else if(s.rate!=null&&s.rate<0)out.push(['exp','Bu dönem giderlerin gelirini '+TRY0.format(-s.net)+' aştı.']);
  var rec=recMonthlyTot(),ai=avgMonthly('inc');if(rec>0&&ai>0)out.push(['muted','Düzenli ödemelerin aylık gelirinin %'+Math.round(rec/ai*100)+sfx(Math.round(rec/ai*100))+'.']);
  if(!out.length)return '';
  return '<div class="card"><h2>Öne çıkanlar</h2><div class="list">'+out.slice(0,6).map(function(x){var tag=x[2]?'button':'div';return '<'+tag+' class="item"'+(x[2]?' data-act="'+x[2]+'"':'')+'><span class="dot" style="background:var(--'+(x[0]==='muted'?'ink2':x[0])+')"></span><span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span>'+(x[2]?ic('r'):'')+'</'+tag+'>';}).join('')+'</div></div>';
}
function fireCard(){
  var m=fireModel();
  if(!m.ok)return '<button class="card firecard" data-act="open-fire"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">Finansal özgürlük (FIRE)</div><div class="small muted">Hedefini belirle ya da aylık harcamanı gir.</div></span>'+ic('r')+'</button>';
  return '<button class="card firecard stack" data-act="open-fire" style="gap:10px"><span style="display:flex;align-items:center;gap:12px"><span class="sic" style="--c:var(--exp)">'+ic('fire')+'</span><span class="mid"><div class="t">Finansal özgürlük (FIRE)</div><div class="small muted">'+(m.custom?'Kendi belirlediğin hedef':'Harcamana göre hesaplanan hedef')+'</div></span>'+ic('r')+'</span>'
   +'<span style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap"><span class="num" style="font-size:1.75rem;font-weight:700">%'+NUM2.format(m.prog)+'</span><span class="small muted num">'+DC0.format(Math.max(m.assets,0))+' / '+DC0.format(m.target)+'</span></span>'
   +'<span class="bar"><i style="width:'+m.prog+'%"></i></span>'
   +'<span class="small muted">'+(m.n<=0?'Hedefe ulaştın':'Tahmini süre: <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</span></button>';
}
var RNG=[['ay','Dönem'],['gun','Bugün'],['hafta','Hafta'],['yil','Yıl'],['ozel','Tarih']];
function wkStart(){var d=today0(),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return isoDate(d);}
function rangeHead(){
  var l=rangeTx(),inc=sum(l,'inc'),exp=sum(l,'exp'),net=inc-exp,lb=ui.rng==='yil'?todayS().slice(0,4)+' yılı':ui.rng==='ozel'?'':ui.rng==='gun'?today0().toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}):(function(){var s=pdate(wkStart()),e=new Date(s);e.setDate(e.getDate()+6);return s.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+' – '+e.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});})();
  var hd=ui.rng==='ozel'?'<div class="two rngd"><div class="field"><label for="rf">Başlangıç</label><input id="rf" type="date" value="'+rngFrom()+'" max="'+rngTo()+'"></div><div class="field"><label for="rt">Bitiş</label><input id="rt" type="date" value="'+rngTo()+'" min="'+rngFrom()+'"></div></div>':'<div class="lbl" style="text-align:center">'+esc(lb)+'</div>';
  return '<div class="card period">'+hd+'<div class="row3" style="margin-top:6px"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+(net<=-0.5?'−':'+')+compactT(Math.abs(net))+'</span></div></div></div>';
}
ACT.rng=function(el,id,v){ui.rng=v;persistUi();render();};
/* hızlı işlemler: en çok kullanılan 4 + Tümü */
var QA=[['qa-inc','Gelir','inc','var(--inc)'],['qa-exp','Gider','exp','var(--exp)'],['qa-trf','Transfer','swap','var(--accent)'],['qa-mkt','Piyasalar','pulse','var(--blue)'],['qa-cash','Nakit','cash','var(--warn)'],['qa-bank','Banka','bank','var(--blue)'],['qa-inv','Yatırım','trend','var(--inc)'],['qa-debt','Borç','card','var(--exp)'],['qa-save','Birikim','coins','var(--warn)'],['qa-asset','Varlık','home','var(--blue)'],['qa-calc','Hesaplayıcı','calc','var(--ink2)']];
function qaOrder(){if(!ui.qaOrd){var u=S.qaUse||{},tot=Object.keys(u).reduce(function(a,k){return a+(+u[k]||0);},0);ui.qaOrd=tot<8?QA.slice():QA.map(function(q,i){return [q,i];}).sort(function(a,b){return ((+u[b[0][0]]||0)-(+u[a[0][0]]||0))||a[1]-b[1];}).map(function(x){return x[0];});}return ui.qaOrd;}
/* ana ekranda en çok kullanılan 4 işlem + "Tümü"; geri kalanlar tek dokunuşla açılan pencerede */
function qaBtn(q){return '<button data-act="'+q[0]+'"><span class="c" style="--c:'+q[3]+'">'+ic(q[2])+'</span><span class="t">'+q[1]+'</span></button>';}
function qaRow(){return '<div class="qawrap" id="qawrap"><div class="qa grid5" id="qa" role="toolbar" aria-label="Hızlı işlemler">'+qaOrder().slice(0,4).map(qaBtn).join('')+'<button data-act="qa-more" aria-label="Tüm işlemler"><span class="c" style="--c:var(--ink2)">'+ic('grid')+'</span><span class="t">Tümü</span></button></div></div>';}
ACT['qa-more']=function(){openSheet('<h2>Ne yapmak istersin?</h2><div class="qa grid4" id="qaall">'+QA.map(qaBtn).join('')+'</div>');};
document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('#qa [data-act],#qaall [data-act]');if(!b||b.dataset.act==='qa-more')return;S.qaUse=S.qaUse||{};S.qaUse[b.dataset.act]=(+S.qaUse[b.dataset.act]||0)+1;},true);
/* kısayol kutucukları: planlama, yatırım ve notlara tek dokunuş */
var SCUTS=[['plan-go','butce','Bütçe','scale','var(--inc)'],['plan-go','duzenli','Düzenli ödemeler','repeat','var(--blue)'],['plan-go','hedef','Hedefler','flag','var(--warn)'],['sv-go','yatirim','Yatırımlar','trend','var(--blue)'],['sv-go','borc','Borçlar','card','var(--exp)'],['sub','notlar','Notlar','note','var(--accent)']];
function scutGrid(){return '<div class="scg">'+SCUTS.map(function(x){return '<button class="sc" data-act="'+x[0]+'" data-v="'+x[1]+'"><span class="sic" style="--c:'+x[4]+'">'+ic(x[3])+'</span><span class="t">'+x[2]+'</span></button>';}).join('')+'</div>';}
