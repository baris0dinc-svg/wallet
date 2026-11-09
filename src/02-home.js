
/* ---------- ortak parçalar ---------- */
function needSetup(){if(hasSample()||S.setupHide)return false;var any=ACCS().some(function(a){return (+S.opening[a]||0)!==0;});return !any&&!S.holdings.length&&!S.tx.length;}
ACT['setup-hide']=function(){S.setupHide=true;save();render();};
function bannerHtml(){
  if(needSetup())return '<div class="banner col"><span>Başlamak için hesaplarındaki mevcut parayı gir; böylece bakiyelerin doğru görünür.</span><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn small" data-act="sub" data-v="hesap">Hesaplarım</button><button class="btn small ghost" data-act="sample-load">Örnekle dene</button><button class="btn small ghost" data-act="setup-hide">Sonra</button></span></div>';
  return hasSample()?'<div class="banner"><span>Örnek veriler gösteriliyor.</span><button class="btn small ghost" data-act="sample-clear">Örnekleri sil</button></div>':'';
}
/* yaklaşan ödemeler: düzenli ödemeler ve kredi kartı son ödeme günleri */
function cardDue(a,from){var due=+ax(a).due;if(!(due>0))return null;var y=from.getFullYear(),m=from.getMonth();
  var dt=new Date(y,m,Math.min(due,dimYM(y,m+1)));if(dt<from)dt=new Date(y,m+1,Math.min(due,dimYM(y,m+2)));return isoDate(dt);}
function upcoming(days){
  var out=[],t0=today0(),end=new Date(t0);end.setDate(end.getDate()+days);var e=isoDate(end),s=isoDate(t0),cur=curP(),seen={};
  for(var i=0;i<3;i++){var k=addMonth(cur,i);S.recurring.forEach(function(r){if(recPaid(r,k))return;var d=dueDate(r,k);if(d>e||(i>0&&d<s))return;var key=r.id+d;if(seen[key])return;seen[key]=1;
    out.push({date:d,name:r.name,amt:r.amt,acct:r.acct,kind:'rec',id:r.id,per:k});});}
  ACCS().forEach(function(a){if(acctType(a)!=='kart')return;var b=acctBal(a);if(!(b<0))return;var d=cardDue(a,t0);if(d&&d<=e)out.push({date:d,name:a+' son ödeme',amt:-b,acct:a,kind:'card'});});
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
  if(A.budget){var sp=spentByCat(cur);EXPC().forEach(function(c){var lim=+S.budgets[c];if(lim>0){var s=sp[c]||0,r=s/lim*100;
    if(r>=100)items.push(['exp',c+' bütçesi aşıldı, '+TRY0.format(s-lim)+' fazla',['cat-tx',null,c,'Gör']]);
    else if(r>=A.thr)items.push(['warn',c+': bütçenin %'+Math.round(r)+' kullanıldı',['cat-tx',null,c,'Gör']]);}});}
  return items;
}
function alertsHtml(){
  var items=alertItems();if(!items.length)return '';var x=items[0];
  return '<button class="alertbar" data-act="alerts" aria-label="Uyarılar: '+items.length+'"><span class="dot" style="background:var(--'+x[0]+')"></span><span class="mid ell">'+esc(x[1])+'</span>'+(items.length>1?'<span class="pill">+'+(items.length-1)+'</span>':'')+ic('r')+'</button>';
}
function alertSheet(){
  var items=alertItems();if(!items.length){closeSheet();return;}
  openSheet('<h2>Uyarılar</h2><div class="list">'+items.map(function(x){var a=x[2];return '<div class="item"><span class="dot" style="background:var(--'+x[0]+')"></span><span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span>'+(a?'<button class="btn small ghost" data-act="'+a[0]+'"'+(a[1]!=null?' data-id="'+esc(a[1])+'"':'')+(a[2]!=null?' data-v="'+esc(a[2])+'"':'')+'>'+a[3]+'</button>':'')+'</div>';}).join('')+'</div><button class="linkbtn" data-act="open-set" data-id="bild">Hatırlatıcı ayarları ›</button>');
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
function txRow(t){
  if(t.type==='trf')return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--ink2)"></span><span class="mid"><div class="t">'+(t.note?esc(t.note):'Transfer')+'</div><div class="small muted ell">'+(t.note?'Transfer · ':'')+esc(t.acct)+' → '+esc(t.to)+'</div></span><span class="amt"><span class="num">'+moneyIn(t.amt,t.acct)+'</span>'+(t.amt2>0?'<span class="small muted num">→ '+moneyIn(t.amt2,t.to)+'</span>':'')+'</span></button>';
  if(t.type==='inv'||t.type==='dbt'||t.type==='adj'){var lb=mvLabel(t),up=txDelta(t,t.acct)>0;
    return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:var(--'+(t.type==='dbt'?'warn':(t.type==='inv'?'blue':'ink2'))+')"></span><span class="mid"><div class="t">'+esc(t.note||lb)+'</div><div class="small muted ell">'+esc((t.note?lb+' · ':'')+t.acct)+'</div></span><span class="num'+(up?' inc':'')+'">'+(up?'+':'−')+moneyIn(Math.abs(t.amt),t.acct)+'</span></button>';}
  var inc=t.type==='inc';
  return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="dot" style="background:'+color(t.cat)+'"></span><span class="mid"><div class="t">'+esc(t.note||t.cat)+'</div><div class="small muted ell">'+(t.note?esc(t.cat)+' · ':'')+esc(t.acct)+'</div></span><span class="num '+(inc?'inc':'exp')+'">'+(inc?'+':'−')+moneyIn(t.amt,t.acct)+'</span></button>';
}
function dailyLine(rem){if(ui.month!==curP()||rem<=0)return '';var left=daysLeft(ui.month);return '<div class="small" style="margin-top:8px"><b>Günde ~'+TRY0.format(rem/left)+'</b> harcayabilirsin ('+left+' gün kaldı)</div>';}
function dcol(i){return 'hsl('+((i*67+155)%360)+' 52% 55%)';}
function donut(items,emptyMsg,act){
  var tot=items.reduce(function(a,x){return a+x[1];},0);
  if(!(tot>0))return '<div class="small muted" style="padding:10px 0">'+emptyMsg+'</div>';
  items=items.slice().sort(function(a,b){return b[1]-a[1];});
  var agg=false;if(items.length>5){var rest=items.slice(4).reduce(function(a,x){return a+x[1];},0);items=items.slice(0,4).concat([['Diğer',rest]]);agg=true;}
  var off=25,c='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--soft)" stroke-width="6"></circle>';
  items.forEach(function(x,i){var p=x[1]/tot*100;c+='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="'+dcol(i)+'" stroke-width="6" stroke-dasharray="'+p.toFixed(3)+' '+(100-p).toFixed(3)+'" stroke-dashoffset="'+off.toFixed(3)+'"></circle>';off-=p;});
  return '<div class="dwrap"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Dağılım grafiği">'+c+'</svg><div class="lgs">'+items.map(function(x,i){return (act&&!(agg&&i===items.length-1)?'<button class="lg" data-act="'+act+'" data-v="'+esc(x[0])+'">':'<div class="lg">')+'<span class="dot" style="background:'+dcol(i)+'"></span><span class="mid ell">'+esc(x[0])+'</span><span class="num">'+(x[1]/tot<0.01?'&lt;%1':'%'+Math.round(x[1]/tot*100))+'</span>'+(act&&!(agg&&i===items.length-1)?'</button>':'</div>');}).join('')+'</div></div>';
}
function ccySel(id,val){return '<span class="ccy"><select id="'+id+'" aria-label="Para birimi">'+CCYS.map(function(c){return '<option value="'+c+'"'+(c===val?' selected':'')+'>'+CCYS_SHORT[c]+'</option>';}).join('')+'</select>'+ic('down')+'</span>';}

/* ---------- ana ekran ---------- */
function histSpark(){
  var s=nwSeries();if(s.length<2)return '';
  var from=pdate(s[s.length-1][0]);from.setDate(from.getDate()-89);var fk=isoDate(from),r=s.filter(function(x){return x[0]>=fk;});if(r.length<3)r=s.slice(-7);
  if(r.length<2)return '';
  var v=r.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=40;
  var t0=pdate(r[0][0]).getTime(),span=(pdate(r[r.length-1][0]).getTime()-t0)||1;
  var pts=r.map(function(x,i){return ((pdate(x[0]).getTime()-t0)/span*W).toFixed(1)+','+(H-3-(v[i]-mn)/rg*(H-6)).toFixed(1);}).join(' ');
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Net servet grafiği"><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
}
/* dar kutucuklar için kısaltılmış tutar: 1,25 Mn */
function compactD(tl){var c=dccy(),v=tl/rateOf(c);if(maskOn||Math.abs(v)<1e6)return DC0.format(tl);var u=Math.abs(v)>=1e9?[1e9,' Mr']:[1e6,' Mn'],n=(v<0?'−':'')+NUM2.format(Math.abs(v)/u[0])+u[1];return c==='XAU'?n+' gr':CSYM[c]+(c==='CHF'?' ':'')+n;}
function compactT(tl){if(maskOn||Math.abs(tl)<1e6)return TRY0.format(tl);return (tl<0?'−':'')+'₺'+NUM2.format(Math.abs(tl)/1e6)+' Mn';}
/* bu dönem ne kadar kaldı: beklenen gelir − harcanan − dönem sonuna kadar ödenecek düzenli ödemeler */
function leftNow(){
  var k=curP(),mt=monthTx(k),inc=sum(mt,'inc'),spent=sum(mt,'exp'),ai=avgMonthly('inc'),expInc=Math.max(inc,ai||0),t0=todayS(),e=pEnd(k),rec=0;
  S.recurring.forEach(function(r){if(recPaid(r,k))return;var d=dueDate(r,k);if(d>=t0&&d<=e)rec+=toTL(+r.amt||0,r.acct);});
  var left=r2(expInc-spent-rec),days=daysLeft(k);
  return {k:k,inc:inc,expInc:r2(expInc),assumed:expInc>inc+0.5,spent:spent,rec:r2(rec),left:left,days:days,daily:days>0?left/days:0,ok:expInc>0};
}
/* ana kart: bu dönem kalan, günlük harcama sınırı, gelir/gider, net servet satırı */
function heroCard(W){
  var L=leftNow(),ch=histChange(30),h='<div class="card hero nw"><div class="nwtop"><span class="lbl">'+esc(plabel(L.k))+' · kalan</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button></span></div>';
  if(L.ok){
    h+='<p class="big'+(L.left<0?' exp':'')+'" id="left-now">'+TRY0.format(L.left)+'</p>';
    h+='<div class="small">'+(L.left>0&&L.days>0?'<b>Günde ~'+TRY0.format(L.daily)+'</b> harcayabilirsin · '+L.days+' gün kaldı':(L.left<0?'<b class="exp">Bu dönem beklenen gelirini '+TRY0.format(-L.left)+' aştın.</b>':'Dönemin son günü.'))+'</div>';
    var p=L.expInc>0?clamp((L.spent+L.rec)/L.expInc*100,0,100):0;
    h+='<div class="bar'+(p>=100?' over':(p>85?' warn':''))+'" style="margin-top:10px"><i style="width:'+p+'%"></i></div>';
    h+='<div class="small muted" style="margin-top:6px">'+(L.assumed?'Beklenen gelir ':'Gelir ')+compactT(L.expInc)+' − harcanan '+compactT(L.spent)+(L.rec>0?' − ödenecek '+compactT(L.rec):'')+'</div>';
  }else{
    h+='<p class="big" id="left-now">'+TRY0.format(L.spent)+'</p><div class="small muted">Bu dönem harcanan. Gelirini eklersen ne kadar kaldığını gösteririm.</div>';
  }
  var F=forecast();if(F.hist&&F.rem>0&&F.spent>0)h+='<div class="fcst small muted">Dönem sonu tahmini: gider ≈ '+compactT(F.exp)+(F.expInc>0?' · '+(F.net>=0?'artan':'eksik')+' ≈ '+compactT(Math.abs(F.net)):'')+'</div>';
  h+='<button class="nwline" data-act="sub" data-v="servet" aria-label="Net servet: hesaplar ve yatırımlar"><span class="lbl">Net servet</span><b class="num">'+compactD(W.net)+'</b>'+(ch&&!maskOn&&ch.p!=null?'<span class="small num '+(ch.d>=0?'inc':'exp')+'">'+(ch.p>=0?'+':'−')+'%'+NUM1.format(Math.abs(ch.p))+' · 30 gün</span>':'')+ic('r')+'</button>';
  return h+'</div>';
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
  h+=heroCard(W)+alertsHtml()+smsBanner()+addCard()+favRow('home')+coachHome()+brainCard(2)+mStrip();
  return h+recentCard()+'<div class="two homelinks"><button class="setcard" data-act="sub" data-v="notlar"><span class="sic" style="--c:var(--warn)">'+ic('note')+'</span><span class="mid"><div class="t">Notlar</div></span></button><button class="setcard" data-act="qa-calc"><span class="sic" style="--c:var(--blue)">'+ic('calc')+'</span><span class="mid"><div class="t">Hesaplayıcılar</div></span></button></div>';
}
function hello(){var hr=new Date().getHours();return hr<5?'İyi geceler':hr<12?'Günaydın':hr<18?'İyi günler':'İyi akşamlar';}
function addCard(){
  var v=voiceOk();
  return '<div class="card addcard'+(v?'':' nov')+'"><button class="addmain" data-act="new-tx"><span class="addic">'+ic('plus')+'</span><span class="mid"><b>İşlem ekle</b><span class="small muted">Gelir, gider ya da transfer</span></span></button>'
   +(v?'<button class="addvoice" data-act="voice" aria-label="Sesle işlem ekle"><span class="vic">'+ic('mic')+'</span><span>Sesle<br>ekle</span></button>':'')+'</div>';
}
function recentCard(){
  /* tüm listeyi sıralamadan en yeni 5 işlem */
  var cmp=function(a,b){return b.date<a.date?-1:b.date>a.date?1:(b.id>a.id?1:-1);},l=[];
  for(var i=0;i<S.tx.length;i++){var t=S.tx[i];if(l.length<5||cmp(t,l[4])<0){l.push(t);l.sort(cmp);if(l.length>5)l.pop();}}
  if(!l.length)return '';
  return '<div class="card" style="padding-top:12px"><div class="ghead"><h2 style="margin:0;flex:1">Son işlemler</h2><button class="linkbtn" data-act="sub" data-v="islem">Tümü ›</button></div><div class="list">'+l.map(txRow).join('')+'</div></div>';
}

/* ---------- İşlemler: Bugün / Bu hafta / Dönem ---------- */
var RNG=[['gun','Bugün'],['hafta','Bu hafta'],['ay','Dönem']];
function wkStart(){var d=today0(),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return isoDate(d);}
function rangeTx(){var t=todayS();if(ui.rng==='gun')return S.tx.filter(function(x){return x.date===t;});
  if(ui.rng==='hafta'){var s=wkStart(),e=new Date(pdate(s));e.setDate(e.getDate()+6);e=isoDate(e);return S.tx.filter(function(x){return x.date>=s&&x.date<=e;});}
  return monthTx(ui.month);}
function rangeHead(){
  var l=rangeTx(),inc=sum(l,'inc'),exp=sum(l,'exp'),net=inc-exp,lb=ui.rng==='gun'?today0().toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}):(function(){var s=pdate(wkStart()),e=new Date(s);e.setDate(e.getDate()+6);return s.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+' – '+e.toLocaleDateString('tr-TR',{day:'numeric',month:'short'});})();
  return '<div class="card period"><div class="lbl" style="text-align:center">'+esc(lb)+'</div><div class="row3" style="margin-top:6px"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Fark</div><span class="num '+(net<0?'exp':'')+'">'+(net<=-0.5?'−':'+')+compactT(Math.abs(net))+'</span></div></div></div>';
}
function vIslem(){
  var r=RNG.some(function(x){return x[0]===ui.rng;})?ui.rng:'ay';ui.rng=r;
  return '<div class="chips rng" role="group" aria-label="Zaman aralığı">'+RNG.map(function(x){return '<button class="chip" data-act="rng" data-v="'+x[0]+'" aria-pressed="'+(r===x[0])+'">'+x[1]+'</button>';}).join('')+'</div>'
   +(r==='ay'?periodHead(true):rangeHead())+txBody();
}
ACT.rng=function(el,id,v){ui.rng=v;persistUi();render();};

/* ---------- İşlemler ---------- */
var TXH=typeof WeakMap==='function'?new WeakMap():null;
function txHay(t){var raw=String(t.note||'')+'\u0001'+(t.cat||'')+'\u0001'+(t.acct||'')+'\u0001'+(t.to||'')+'\u0001'+t.type+'\u0001'+(t.side||'')+'\u0001'+(t.hold||'')+'\u0001'+(t.debt||'')+'\u0001'+mvLabel(t);
  var c=TXH&&TXH.get(t);if(c&&c.r===raw)return c.h;
  var h=fold(String(t.note||'')+' '+(t.cat||'')+' '+(t.acct||'')+' '+(t.to||'')+' '+mvLabel(t));if(TXH)TXH.set(t,{r:raw,h:h});return h;}
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
  var mt=(q?S.tx.filter(function(t){return txFilt(t)&&txMatch(t,q);}):rangeTx().filter(txFilt)).sort(function(a,b){return b.date.localeCompare(a.date)||(b.id>a.id?1:-1);});
  if(!mt.length)return q?'<div class="empty">“'+esc(ui.tq.trim())+'” için işlem bulunamadı.</div>':'<div class="empty">'+(ui.acctF?esc(ui.acctF)+' hesabında '+({gun:'bugün',hafta:'bu hafta'}[ui.rng]||'bu dönemde')+' hareket yok.':({gun:'Bugün',hafta:'Bu hafta'}[ui.rng]||'Bu dönemde')+' işlem yok. Sağ alttaki + ile ekle.')+'</div>';
  var cap=q?(ui.tqN||100):1e9,more=0;if(mt.length>cap){more=mt.length-cap;mt=mt.slice(0,cap);}
  var cur='',out=(q?'<div class="small muted" style="margin:0 2px 6px">'+mt.length+(more?'+':'')+' sonuç · tüm dönemler</div>':'')+'<div class="card" style="padding-top:2px">';
  var byD={};mt.forEach(function(t){(byD[t.date]||(byD[t.date]=[])).push(t);});
  mt.forEach(function(t){if(t.date!==cur){cur=t.date;var dn=dayNet(byD[cur]);out+='<div class="day"><span>'+esc(dayLabel(t.date,!!q))+'</span>'+(Math.abs(dn)>=0.5?'<span class="num '+(dn<0?'exp':'inc')+'">'+sgn(dn)+'</span>':'')+'</div>';}out+='<div class="list">'+txRow(t)+'</div>';});
  return out+'</div>'+(more?'<button class="btn ghost" data-act="tq-more">'+more+' sonuç daha · göster</button>':'');
}
var DLC={};
function dayLabel(d,y){var k=d+(y?'y':'');return DLC[k]||(DLC[k]=pdate(d).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:y?'numeric':undefined,weekday:'long'}));}
ACT['tq-more']=function(){ui.tqN=(ui.tqN||100)+200;var tl=document.getElementById('txlist');if(tl)tl.innerHTML=txList();};
function txBody(){
  return '<div class="search">'+ic('search')+'<input id="tq" type="search" placeholder="İşlemlerde ara: not, kategori, tutar" aria-label="İşlemlerde ara" value="'+esc(ui.tq||'')+'"></div>'
   +(ui.acctF?'<div class="chips"><button class="chip rm" data-act="acct-clear" aria-pressed="true">'+esc(ui.acctF)+'</button></div>':'')+segTabs([['all','Tümü'],['inc','Gelir'],['exp','Gider'],['mv','Diğer']],ui.filter==='trf'?'mv':ui.filter,'filter','Filtre')
   +'<div id="txlist" class="stack">'+txList()+'</div>';
}

/* ---------- Hesaplar (cüzdan ve banka) ---------- */
var AGROUPS=[['nakit','Cüzdanım','cash','var(--warn)'],['banka','Banka hesapları','bank','var(--blue)'],['kart','Kredi kartları','card','var(--exp)'],['birikim','Birikim hesapları','coins','var(--inc)'],['diger','Diğer hesaplar','wallet','var(--ink2)']];
function acctLine(a){
  var b=acctBal(a),c=ccyOf(a),t=acctType(a),x=ax(a),sub=[];
  if(c!=='TRY')sub.push(CCYN[c]+(rateOf(c)>0?' · ≈ '+TRY0.format(toTL(b,a)):''));
  if(t==='kart'){if(+x.limit>0)sub.push('Kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)sub.push('Son ödeme: ayın '+x.due+'’i');}
  return '<button class="item" data-act="acct-open" data-id="'+esc(a)+'"><span class="dot" style="background:'+color(a)+'"></span><span class="mid"><div class="t">'+esc(a)+'</div>'+(sub.length?'<div class="small muted">'+esc(sub.join(' · '))+'</div>':'')+'</span><span class="num'+(b<0?' exp':'')+'">'+moneyIn(b,a)+'</span></button>';
}
function hesapBody(){
  var tot=accTotal();
  var h='<div class="card"><div class="lbl">Hesaplardaki toplam para</div><p class="big">'+TRY0.format(tot)+'</p><div class="small muted">Kart borçları düşülmüş</div></div>';
  h+='<div class="two"><button class="btn" data-act="new-a">Hesap ekle</button><button class="btn ghost" data-act="qa-trf">Transfer</button></div>';
  AGROUPS.forEach(function(gp){var l=ACCS().filter(function(a){var t=acctType(a);return gp[0]==='banka'?t==='banka':t===gp[0];});if(!l.length&&gp[0]!=='nakit'&&gp[0]!=='banka')return;
    var s=r2(l.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
    h+='<div class="card" style="padding-top:12px"><div class="ghead"><span class="sic sm" style="--c:'+gp[3]+'">'+ic(gp[2])+'</span><h2 style="margin:0;flex:1">'+gp[1]+'</h2><span class="num'+(s<0?' exp':'')+'">'+TRY0.format(s)+'</span></div>'
      +(l.length?'<div class="list">'+l.map(acctLine).join('')+'</div>':'<div class="small muted" style="padding:8px 0">Henüz yok.</div>')
      +'<button class="linkbtn" data-act="new-a" data-v="'+gp[0]+'">+ '+({nakit:'Nakit cüzdanı ekle',banka:'Banka hesabı ekle',kart:'Kart ekle',birikim:'Birikim hesabı ekle',diger:'Hesap ekle'})[gp[0]]+'</button></div>';});
  return h;
}
/* Hesaplar sekmesinin üstü: net servet (görüntüleme para birimiyle), son 30 gün değişimi ve 90 günlük grafik */
function nwTop(){
  var W=wealth(),ch=histChange(30);
  var h='<div class="card hero nw"><div class="nwtop"><span class="lbl">Net servetim</span><span class="nwctl"><button class="icon-btn sm" data-act="eye" aria-pressed="'+!!S.hide+'" aria-label="'+(S.hide?'Tutarları göster':'Tutarları gizle')+'">'+ic(S.hide?'eyeoff':'eye')+'</button>'+ccySel('dccy',S.dccy)+'</span></div>';
  h+='<p class="big">'+DC0.format(W.net)+'</p>';
  if(S.dccy!=='TRY'&&dccy()==='TRY')h+='<div class="small exp">'+esc(CCYN[S.dccy])+' kuru henüz yok; TL gösteriliyor. Yenile düğmesine dokun.</div>';
  else if(dccy()!=='TRY')h+='<div class="small muted">1 '+(dccy()==='XAU'?'gr altın':esc(dccy()))+' = '+TRY2.format(rateOf(dccy()))+' · '+TRY0.format(W.net)+'</div>';
  if(ch&&!maskOn)h+='<div class="small"><b class="num '+(ch.d>=0?'inc':'exp')+'">'+sgnD(ch.d)+(ch.p!=null?' ('+(ch.p>=0?'+':'−')+'%'+NUM1.format(Math.abs(ch.p))+')':'')+'</b> <span class="muted">son '+ch.days+' günde</span></div>';
  if(!maskOn)h+=histSpark();
  h+='<div class="row3" style="grid-template-columns:1fr 1fr;margin-top:8px"><div><div class="lbl">Varlıklar</div><span class="num">'+compactD(W.assets)+'</span></div><div><div class="lbl">Borçlar</div><span class="num'+(W.debt>0?' exp':'')+'">'+compactD(W.debt)+'</span></div></div>';
  return h+'</div>';
}
function servetBody(){var v=WEALTH.some(function(x){return x[0]===ui.sv;})?ui.sv:'hesap';return nwTop()+segTabs(WEALTH,v,'sv','Hesaplar')+({hesap:hesapBody,yatirim:yatirimBody,varlik:varlikBody,borc:borcBody}[v])();}

/* ---------- Bütçe, Hedefler, Düzenli ---------- */
function planBody(){
  var p=PLANS.some(function(x){return x[0]===ui.plan;})?ui.plan:'koc';ui.plan=p;
  var seg=segTabs(PLANS,p,'plan','Plan');
  return seg+(p==='koc'?vKoc():(p==='butce'?periodHead(false)+budgetBody():(p==='duzenli'?periodHead(false)+duzenliBody():hedefBody())));
}
function budgetBody(){
  var sp=spentByCat(ui.month),limSum=0,spSum=0;
  EXPC().forEach(function(c){if(S.budgets[c]){limSum+=S.budgets[c];spSum+=(sp[c]||0);}});
  var h=limSum>0?'<div class="card"><div class="lbl">Toplam bütçe</div><p class="big">'+TRY0.format(limSum)+'</p><div class="small muted">Limitli kategorilerde harcanan '+TRY0.format(spSum)+' · '+(limSum-spSum>=0?TRY0.format(limSum-spSum)+' kaldı':TRY0.format(spSum-limSum)+' aşıldı')+'</div><div class="bar'+(spSum>limSum?' over':(spSum>limSum*.8?' warn':''))+'" style="margin-top:10px"><i style="width:'+Math.min(spSum/limSum*100,100)+'%"></i></div>'+dailyLine(limSum-spSum)+'</div>'
    :'<div class="card"><div class="lbl">Bütçe</div><p class="small muted" style="margin:6px 0 0">Aşağıdan kategorilere aylık limit gir; kalan bütçen ve günlük harcama sınırın burada görünür.</p>'+(budgetSuggest().length?'<button class="btn small" style="margin-top:10px" data-act="bud-sug">Son 3 dönemin ortalamasıyla doldur</button><div class="small muted" style="margin-top:6px">'+esc(budgetSuggest().slice(0,4).map(function(x){return x[0]+' '+TRY0.format(x[1]);}).join(' · '))+'</div>':'')+'</div>';
  h+='<div class="card"><h2>Kategori limitleri</h2><p class="small muted" style="margin:-4px 0 6px">Aylık limit gir. Boş bıraktığın kategori takip edilmez.</p>';
  EXPC().forEach(function(c){
    var lim=S.budgets[c]||0,s=sp[c]||0,ratio=lim?s/lim:0,cls=ratio>1?'over':(ratio>.8?'warn':'');
    var info=lim?TRY0.format(s)+' / '+TRY0.format(lim)+(ratio>1?' · '+TRY0.format(s-lim)+' aşıldı':' · %'+Math.round(ratio*100)):(s?TRY0.format(s)+' harcandı':'');
    h+='<div class="catrow"><div class="top"><button class="cn" data-act="cat-tx" data-v="'+esc(c)+'"><span class="dot" style="background:'+color(c)+'"></span><span class="mid ell">'+esc(c)+'</span></button><input class="lim" inputmode="decimal" data-budget="'+esc(c)+'" placeholder="Limit" value="'+nv(lim||'')+'" aria-label="'+esc(c)+' aylık limit (₺)"></div>'+(info?'<div class="small muted num">'+info+'</div>':'')+(lim?'<div class="bar '+cls+'"><i style="width:'+Math.min(ratio*100,100)+'%"></i></div>':'')+'</div>';
  });
  return h+'</div><button class="linkbtn" data-act="an-go" data-v="harcama">Harcama dağılımı ve trendler ›</button>';
}
/* bütçe önerisi: son 3 tamamlanmış dönemde düzenli harcama yapılan kategorilerin ortalaması (100'e yuvarlanır) */
function budgetSuggest(){var k=curP(),pks=prevKs(k,3),cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;if(!cnt)return [];
  var avg=catAvg(k),out=[];EXPC().forEach(function(c){var a=avg[c]||0;if(a>=100)out.push([c,Math.ceil(a/100)*100]);});return out.sort(function(a,b){return b[1]-a[1];});}
ACT['bud-sug']=function(){var l=budgetSuggest();if(!l.length)return;l.forEach(function(x){if(!(+S.budgets[x[0]]>0))S.budgets[x[0]]=x[1];});S.sampleExtras=false;save();render();toast(l.length+' kategoriye limit kondu; istediğin gibi değiştirebilirsin');};
function goalInfo(g){
  var sv=goalSaved(g),left=Math.max(g.target-sv,0);
  if(sv>=g.target)return 'Hedefe ulaştın';
  if(g.date){var now=today0(),d=pdate(g.date),dd=daysBetween(isoDate(now),g.date),m=(d.getFullYear()-now.getFullYear())*12+d.getMonth()-now.getMonth()-(d.getDate()<now.getDate()?1:0);
    return dd<0?'Tarih geçti, '+TRY0.format(left)+' eksik':(m>=1?m+' ay kaldı · ayda ~'+TRY0.format(left/m)+' ayır':(dd===0?'Son gün bugün':dd+' gün kaldı')+' · '+TRY0.format(left)+' eksik');}
  return TRY0.format(left)+' kaldı';
}
function hedefBody(){
  var h='<button class="btn" data-act="new-g">Hedef ekle</button>';
  if(!S.goals.length)return h+'<div class="empty">Henüz hedef yok. Tatil, acil durum fonu ya da büyük bir alışveriş için hedef koy. Hedefi bir birikim hesabına bağlarsan biriken tutar hesaptan otomatik gelir.</div>';
  var tot=0,sv=0;S.goals.forEach(function(g){tot+=g.target;sv+=goalSaved(g);});
  h+='<div class="card"><div class="lbl">Toplam birikim</div><p class="big">'+TRY0.format(sv)+'</p><div class="small muted">Hedeflerin toplamı '+TRY0.format(tot)+' · %'+Math.round(tot>0?Math.min(sv/tot*100,100):0)+'</div></div>';
  S.goals.forEach(function(g){
    var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;
    h+='<div class="card stack" style="gap:10px"><button class="item" style="padding:0;border:0" data-act="edit-g" data-id="'+g.id+'"><span class="mid"><div class="t" style="font-weight:700">'+esc(g.name)+'</div><div class="small muted">'+esc(goalInfo(g))+'</div></span><span class="num">%'+Math.round(p)+'</span></button><div class="bar"><i style="width:'+p+'%"></i></div><div class="small num muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>'+TRY0.format(s)+' / '+TRY0.format(g.target)+'</span>'+(g.acct&&ACCS().indexOf(g.acct)>=0?'<span>Bağlı hesap: '+esc(g.acct)+'</span>':'')+'</div><button class="btn small ghost" style="align-self:flex-start" data-act="goal-add" data-id="'+g.id+'">Para ekle</button></div>';
  });
  return h;
}
function duzenliBody(){
  var h='<button class="btn" data-act="new-r">Düzenli ödeme ekle</button>';
  if(!S.recurring.length)return h+'<div class="empty">Henüz düzenli ödeme yok. Kira, fatura, kredi taksiti ve abonelikleri ekle; hatırlatıcı ödeme gününü kaçırmamanı sağlar.</div>';
  var tot=0,rem=0,cur=curP(),t0=todayS();
  S.recurring.forEach(function(r){var v=toTL(r.amt,r.acct);tot+=v;if(!recPaid(r,ui.month))rem+=v;});
  h+='<div class="card"><div class="row3" style="margin-top:0;grid-template-columns:1fr 1fr"><div><div class="lbl">Aylık toplam</div><span class="num">'+TRY0.format(tot)+'</span></div><div><div class="lbl">Bu dönem ödenecek</div><span class="num">'+TRY0.format(rem)+'</span></div></div></div>';
  var list=S.recurring.slice().sort(function(a,b){return dueDate(a,ui.month).localeCompare(dueDate(b,ui.month));});
  h+='<div class="card" style="padding-top:4px"><div class="list">'+list.map(function(r){
    var paid=recPaid(r,ui.month),st,dd=dueDate(r,ui.month),dbt=r.debt&&byId(S.debts,r.debt);
    if(paid)st='<span class="pill ok">Ödendi</span>';
    else if(ui.month===cur){var diff=daysBetween(t0,dd);st=diff<0?'<span class="pill late">'+(-diff)+' gün gecikti</span>':(diff===0?'<span class="pill late">Bugün</span>':'<span class="pill">'+diff+' gün sonra</span>');}
    else if(ui.month<cur)st='<span class="pill late">Ödenmedi</span>';
    else st='<span class="pill">Bekliyor</span>';
    return '<div class="item"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-r" data-id="'+r.id+'"><span class="dot" style="background:'+color(r.cat)+'"></span><span class="mid"><div class="t">'+esc(r.name)+'</div><div class="small muted">'+esc(pdate(dd).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' · '+esc(dbt?'Borç: '+dbt.name:r.cat)+' · '+esc(r.acct)+'</div></span></button><div class="rcol"><span class="num">'+moneyIn(r.amt,r.acct,1)+'</span>'+st+'<button class="btn small ghost" data-act="'+(paid?'rundo':'rpay')+'" data-id="'+r.id+'">'+(paid?'Geri al':'Ödendi')+'</button></div></div>';}).join('')+'</div></div>';
  return h;
}
