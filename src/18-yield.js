
/* ---------- 4.12: mevduat, fon ve birikim hesabı getirisi kendiliğinden işlenir ----------
   Yatırım (piyasaya bağlı olmayan): h.yr yıllık oran (%), h.yd başlangıç günü, h.vd vade (gün; 0 = günlük/vadesiz), h.tax stopaj (%), h.roll vade sonunda yenile.
     Mevduat: brüt faizden stopaj düşülür; vadeli mevduatta vade sonunda faiz anaparaya eklenip yenilenir (yenilenmiyorsa ilk vadede durur).
     Fon, BES ve diğer: yazılan yıllık (net, tahmini) getiriyle günlük bileşik büyür. Piyasadan bağlı fonlarda gerçek fiyat kullanılır.
   Değer büyür, maliyet aynı kalır: aradaki fark kâr olarak görünür. Alım/satımda ya da fiyat elle değişince birikim fiyata katılıp o günden yeniden başlar.
   Birikim hesabı: hesaba yıllık faiz yazılırsa her ay sonunda o ayın günlük bakiyelerinden net faiz "Yatırım getirisi › Faiz" geliri olarak işlenir. */
function yOn(h){return hKind(h)==='inv'&&!h.mk&&+h.yr>0&&/^\d{4}-\d{2}-\d{2}$/.test(h.yd||'');}
function isDep(h){return h.type==='Mevduat';}
/* stopaj: vadeye göre (6 aya kadar, 1 yıla kadar, daha uzun); günlük/vadesiz hesap 6 aya kadar oranında */
function depTax(vd){var D=FACTS.dep;return !(vd>0)||vd<=183?D.t6:(vd<=366?D.t12:D.t12p);}
function yTax(h){return h.tax!=null&&h.tax!==''?+h.tax||0:(isDep(h)?depTax(+h.vd||0):0);}
/* bugüne kadarki büyüme çarpanı */
function yFac(h,to){if(!yOn(h))return 1;var d=daysBetween(h.yd,to||todayS());if(!(d>0))return 1;var r=(+h.yr)/100,n=1-yTax(h)/100;
  if(!isDep(h))return Math.pow(1+r,d/365);
  var vd=+h.vd||0;if(!(vd>0))return Math.pow(1+r*n/365,d);
  var k=Math.floor(d/vd),rem=d-k*vd,g=1+r*n*vd/365;
  if(h.roll===false)return k>=1?g:1+r*n*d/365;
  return Math.pow(g,k)*(1+r*n*rem/365);}
/* vadeli mevduatın sıradaki vade sonu (yenilenmiyorsa ilk vade sonu) */
function yMat(h){if(!yOn(h)||!isDep(h)||!(+h.vd>0))return null;var vd=+h.vd,d=Math.max(daysBetween(h.yd,todayS()),0),k=Math.floor(d/vd);if(h.roll===false)return addD(h.yd,vd);return addD(h.yd,(k+1)*vd);}
/* büyümeyi fiyata (ya da kurla değerlenende miktara) kat ve bugünden yeniden başlat */
function yCrys(h){var f=yFac(h);if(f!==1){if(h.ccy)h.qty=+(h.qty*f).toFixed(6);else h.price=+(h.price*f).toFixed(6);}if(yOn(h))h.yd=todayS();}
function yLine(x){if(!yOn(x))return '';var f=yFac(x),base=hVal(x)/f,earn=hVal(x)-base,m=yMat(x),tx=yTax(x);
  return '<div class="small muted ytl">'+ic('percent')+'<span>'+(isDep(x)?'Yıllık brüt %'+NUM2.format(+x.yr)+(tx?' · stopaj %'+NUM1.format(tx):'')+(+x.vd>0?' · '+x.vd+' gün vadeli':' · günlük'):'Tahmini yıllık %'+NUM2.format(+x.yr))
   +' · <b class="num inc">+'+TRY0.format(earn)+'</b> '+(isDep(x)?'net faiz':'getiri')+' ('+pdate(x.yd).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+'’den beri)'
   +(m?' · vade sonu '+pdate(m).toLocaleDateString('tr-TR',{day:'numeric',month:'long'})+(x.roll===false&&m<=todayS()?' (doldu)':''):'')+'</span></div>';}
/* yatırım penceresindeki alanlar */
function yFields(x,type){var dep=type==='Mevduat',on=x&&+x.yr>0;
  return '<div id="row-yield" class="stack" style="gap:10px"'+(yShow(type,x&&x.mk)?'':' hidden')+'>'
   +'<div class="two"><div class="field"><label for="h-yr" id="lb-hyr">'+(dep?'Yıllık brüt faiz (%)':'Tahmini yıllık getiri (%)')+'</label><input id="h-yr" inputmode="decimal" placeholder="İsteğe bağlı, örn. 40" value="'+(on?nv(x.yr):'')+'"></div>'
   +'<div class="field"><label for="h-yd">Başlangıç</label><input id="h-yd" type="date" value="'+esc(on&&x.yd?x.yd:todayS())+'"></div></div>'
   +'<div class="two" id="row-dep"'+(dep?'':' hidden')+'><div class="field"><label for="h-vd">Vade (gün)</label><input id="h-vd" inputmode="numeric" maxlength="4" placeholder="Günlükse boş" value="'+(x&&+x.vd>0?x.vd:'')+'"></div>'
   +'<div class="field"><label for="h-tax">Stopaj (%)</label><input id="h-tax" inputmode="decimal" placeholder="'+NUM1.format(depTax(x&&+x.vd||0))+'" value="'+(x&&x.tax!=null&&x.tax!==''?nv(x.tax):'')+'"></div></div>'
   +'<label class="chk" id="row-roll"'+(dep?'':' hidden')+'><input type="checkbox" id="h-roll"'+(x&&x.roll===false?'':' checked')+'> Vade sonunda faiziyle birlikte yenilensin</label>'
   +'<p class="small muted" style="margin:0" id="h-yhint">'+(dep?'Faiz her gün işlenir; değer ve kâr kendiliğinden artar. Stopaj boşsa vadeye göre güncel oran kullanılır.':'Fon fiyatı piyasadan bağlı değilse değer bu oranla her gün artar (tahmindir). Piyasalar’dan eklenen fonlarda gerçek fiyat kullanılır.')+'</p></div>';}
function yShow(type,mk){return !mk&&['Mevduat','Fon','BES','Diğer yatırım'].indexOf(type)>=0;}
function ySync(){var t=val('h-type'),c=val('h-ccy'),row=document.getElementById('row-yield');if(!row)return;var dep=t==='Mevduat';row.hidden=!yShow(t,c.indexOf('mk:')===0);
  ['row-dep','row-roll'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=!dep;});var l=document.getElementById('lb-hyr');if(l)l.textContent=dep?'Yıllık brüt faiz (%)':'Tahmini yıllık getiri (%)';
  var tx=document.getElementById('h-tax');if(tx)tx.placeholder=NUM1.format(depTax(+num(val('h-vd'))||0));
  var hh=document.getElementById('h-yhint'),yr=num(val('h-yr')),q=num(val('h-qty')),p=num(val('h-price'))||num(val('h-cost'));
  if(hh&&yr>0&&q>0&&p>0&&!c){var v=q*p,tax=val('h-tax')!==''?num(val('h-tax')):(dep?depTax(+num(val('h-vd'))||0):0),vd=Math.round(num(val('h-vd')));
    hh.textContent=dep?('Net günlük faiz ≈ '+TRY2.format(v*yr/100*(1-tax/100)/365)+(vd>0?' · vade sonu net ≈ '+TRY2.format(v*yr/100*(1-tax/100)*vd/365):'')):('Bu oranla bir yılda ≈ '+TRY0.format(v*yr/100)+' getiri (tahmini).');}}
/* kayıtta okunur: geçersizse hata metni döner */
function yRead(h,x){var t=h.type;if(!yShow(t,h.mk)){['yr','yd','vd','tax','roll'].forEach(function(k){delete h[k];});return '';}
  var yr=num(val('h-yr'));if(!(yr>0)){h.yr=0;return '';}if(yr>500)return 'Yıllık oran en fazla %500 olabilir.';
  var yd=val('h-yd');if(!/^\d{4}-\d{2}-\d{2}$/.test(yd))yd=todayS();if(yd>todayS())yd=todayS();h.yr=r2(yr);h.yd=yd;
  if(t==='Mevduat'){var vd=Math.round(num(val('h-vd')));if(vd<0||vd>3650)return 'Vade 0 ile 3650 gün arasında olmalı.';h.vd=vd>0?vd:0;var ts=val('h-tax').trim();if(ts!==''){var tv=num(ts);if(tv<0||tv>100)return 'Stopaj 0 ile 100 arasında olmalı.';h.tax=tv;}else h.tax='';var rc=document.getElementById('h-roll');h.roll=!rc||rc.checked;}
  else{h.vd=0;h.tax='';h.roll=true;}
  /* düzenlemede oran ya da başlangıç değişmediyse birikim korunur */
  return '';}
/* vade sonu hatırlatması (Gündem): yaklaşan ya da dolan, yenilenmeyen vadeli mevduat */
function yAlerts(days){var out=[],t0=todayS();S.holdings.forEach(function(h){var m=yMat(h);if(!m)return;var d=daysBetween(t0,m);
  if(h.roll===false&&d<0&&d>=-14)out.push(['warn',h.name+': vade '+(-d)+' gün önce doldu, faiz işlemiyor',['edit-h',h.id,null,'Gör']]);
  else if(d>=0&&d<=Math.max(days,1))out.push(['warn',h.name+': vade '+(d===0?'bugün':d+' gün sonra')+' doluyor'+(h.roll===false?'':' (yenilenecek)'),['edit-h',h.id,null,'Gör']]);});return out;}

/* ---- birikim hesabı: aylık faiz geliri ---- */
function aRate(a){var x=ax(a);return acctType(a)==='birikim'&&+x.rate>0?+x.rate:0;}
/* ay içindeki günlük bakiyelerden net faiz (hesabın kendi para biriminde); from'dan önceki günler sayılmaz */
function aInt(a,m,from,upto){var x=ax(a),r=aRate(a)/100,tax=(x.tax!=null&&x.tax!==''?+x.tax:FACTS.dep.t6)/100,y=+m.slice(0,4),mo=+m.slice(5,7),dim=dimYM(y,mo),tot=0;if(!(r>0))return 0;
  var st=m+'-01',en=m+'-'+pad(dim),txs=S.tx.filter(function(t){return (t.acct===a||t.to===a)&&t.date<=en;}),od=(S.openD||{})[a];
  var b=+S.opening[a]||0;txs.forEach(function(t){if(t.date<st&&!(od&&t.date<od))b+=txDelta(t,a);});
  var byDay={};txs.forEach(function(t){if(t.date>=st&&!(od&&t.date<od))byDay[t.date]=(byDay[t.date]||0)+txDelta(t,a);});
  for(var d=1;d<=dim;d++){var ds=m+'-'+pad(d);if(byDay[ds])b+=byDay[ds];if(upto&&ds>upto)break;if((from&&ds<from)||(od&&ds<od))continue;if(b>0)tot+=b*r/365;}
  return r2(tot*(1-tax));}
/* biten aylar için faiz geliri işlenir (en çok son 12 ay); x.rateM son işlenen ay */
function yieldPost(){var n=0,cm=mkey(today0());ACCS().forEach(function(a){if(!aRate(a))return;var x=S.accx[a];if(!x||!x.rateFrom)return;
  var m=x.rateM?addMonth(x.rateM,1):x.rateFrom.slice(0,7),g=0;if(mdiff(m,cm)>12)m=addMonth(cm,-12);
  while(m<cm&&g++<13){var v=aInt(a,m,x.rateFrom);if(v>=0.01){var y=+m.slice(0,4),mo=+m.slice(5,7);S.tx.push({id:uid(),type:'inc',amt:v,cat:ensureCat('inc','Yatırım getirisi'),sub:'Faiz',acct:a,date:m+'-'+pad(dimYM(y,mo)),note:a+' faizi · '+mlabel(m),auto:'int'});n++;}x.rateM=m;m=addMonth(m,1);}});
  if(n){S.subs['Yatırım getirisi']=subsOf('Yatırım getirisi');if(S.subs['Yatırım getirisi'].indexOf('Faiz')<0)S.subs['Yatırım getirisi'].push('Faiz');save();}return n;}
/* bu ay şimdiye kadar biriken (henüz işlenmemiş) faiz */
function aIntNow(a){var x=ax(a);if(!aRate(a)||!x.rateFrom)return 0;return aInt(a,mkey(today0()),x.rateFrom,todayS());}
