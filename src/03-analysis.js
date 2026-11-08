
/* ---------- Analiz ---------- */
function pstat(k){var m=monthTx(k),inc=sum(m,'inc'),exp=sum(m,'exp');return {k:k,inc:inc,exp:exp,net:r2(inc-exp),rate:inc>0?(inc-exp)/inc*100:null,debt:sumMv(m,'dbt','out'),inv:r2(sumMv(m,'inv','buy')-sumMv(m,'inv','sell'))};}
function prevKs(k,n){var a=[];for(var i=1;i<=n;i++)a.push(addMonth(k,-i));return a;}
function health(){
  var W=wealth(),ae=avgMonthly('exp'),cur=curP(),parts=[];
  var ks=prevKs(cur,3).filter(function(k){return sum(monthTx(k),'inc')>0;});if(!ks.length&&sum(monthTx(cur),'inc')>0)ks=[cur];
  var sr=ks.length?ks.reduce(function(a,k){return a+pstat(k).rate;},0)/ks.length:null;
  parts.push({k:'Tasarruf oranı',v:sr==null?'—':(sr<0?'−':'')+'%'+Math.round(Math.abs(sr)),p:sr==null?null:clamp(sr/20,0,1),tip:sr==null?'Gelir kaydı yok.':(sr>=20?'Gelirinin en az %20’sini biriktiriyorsun.':'Hedef: gelirin en az %20’si.')});
  var eg=emGoal(),ef=eg?goalSaved(eg):Math.max(W.g.liquid,0),em=ae>0?ef/ae:null,six=ae>0?' 6 aylık gider: '+TRY0.format(ae*6)+'.':'';
  parts.push({k:'Acil durum fonu',act:'em-open',v:em==null?(eg?TRY0.format(ef):'—'):NUM1.format(em)+' ay',p:em==null?null:clamp(em/6,0,1),
    tip:eg?('“'+eg.name+'” hedefinde '+TRY0.format(ef)+' var.'+(em==null?' Gider kaydı olunca kaç aylık gideri karşıladığı hesaplanır.':six)):
      (em==null?'Gider kaydı yok. Acil durum fonunu girmek için dokun.':'Nakit, banka ve birikim toplamına göre.'+six+' Ayrı bir acil durum fonu girmek için dokun.')});
  var dr=W.assets>0?W.debt/W.assets:(W.debt>0?1:0);
  parts.push({k:'Borç yükü',v:'%'+Math.round(dr*100),p:clamp(1-dr/0.5,0,1),tip:dr<=0.3?'Borçların varlıklarına göre makul.':'Borçlar varlıklarının %30’unun altında olmalı.'});
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});
  if(lim.length){var sp=spentByCat(cur),okc=lim.filter(function(c){return (sp[c]||0)<=S.budgets[c];}).length;parts.push({k:'Bütçe uyumu',v:okc+'/'+lim.length,p:okc/lim.length,tip:okc===lim.length?'Tüm limitlerin içindesin.':(lim.length-okc)+' kategoride limit aşıldı.'});}
  else parts.push({k:'Bütçe uyumu',v:'Limit yok',p:null,tip:'Bütçe bölümünden kategori limiti belirle.'});
  var val=parts.filter(function(x){return x.p!=null;});
  return {score:val.length>=2?Math.round(val.reduce(function(a,x){return a+x.p;},0)/val.length*100):null,parts:parts};
}
function scoreWord(s){return s>=80?'Çok iyi':(s>=60?'İyi':(s>=40?'Orta':'Geliştirilmeli'));}
function healthCard(){
  var H=health(),s=H.score;
  var ring=s==null?'':'<svg class="ring" viewBox="0 0 42 42" role="img" aria-label="Finansal sağlık puanı '+s+'"><circle cx="21" cy="21" r="17" fill="none" stroke="var(--soft)" stroke-width="5"/><circle cx="21" cy="21" r="17" fill="none" stroke="'+(s>=60?'var(--inc)':(s>=40?'var(--warn)':'var(--exp)'))+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(s/100*106.8).toFixed(1)+' 106.8" transform="rotate(-90 21 21)"/><text x="21" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">'+s+'</text></svg>';
  return '<div class="card"><div class="ghead">'+ring+'<span class="mid"><h2 style="margin:0">Finansal sağlık</h2><div class="small muted">'+(s==null?'Puan için en az iki göstergede veri gerekli: gelir-gider kayıtları ya da bütçe limitleri.':scoreWord(s)+' · 100 üzerinden '+s)+'</div></span></div><div class="hparts">'+H.parts.map(function(x){var tag=x.act?'button':'div';return '<'+tag+' class="hp"'+(x.act?' data-act="'+x.act+'"':'')+'><div class="hpt"><span>'+esc(x.k)+'</span><b class="num">'+esc(x.v)+(x.act?' ›':'')+'</b></div><div class="bar'+(x.p!=null&&x.p<0.5?' warn':'')+'"><i style="width:'+(x.p==null?0:x.p*100)+'%"></i></div><div class="small muted">'+esc(x.tip)+'</div></'+tag+'>';}).join('')+'</div></div>';
}
function flowCard(){
  var k=ui.month,s=pstat(k),pv=pstat(addMonth(k,-1)),isCur=k===curP(),days=pDays(k),el=isCur?Math.max(daysBetween(pStart(k),todayS())+1,1):days;
  var rows=[['Gelir',DC0.format(s.inc)+(pv.inc>0?' <span class="small '+(s.inc>=pv.inc?'inc':'exp')+'">'+(s.inc>=pv.inc?'▲':'▼')+'%'+Math.round(Math.abs((s.inc-pv.inc)/pv.inc*100))+'</span>':'')],
    ['Gider',DC0.format(s.exp)+(pv.exp>0?' <span class="small '+(s.exp<=pv.exp?'inc':'exp')+'">'+(s.exp>=pv.exp?'▲':'▼')+'%'+Math.round(Math.abs((s.exp-pv.exp)/pv.exp*100))+'</span>':'')],
    ['Fark (gelir − gider)',sgnD(s.net),1],
    ['Tasarruf oranı',s.rate==null?'—':(s.rate<0?'−':'')+'%'+NUM1.format(Math.abs(s.rate))],
    ['Günlük ortalama gider',DC0.format(s.exp/el)]];
  if(isCur&&s.exp>0)rows.push(['Dönem sonu gider tahmini',DC0.format(s.exp/el*days)]);
  if(s.debt>0)rows.push(['Borç ödemeleri (anapara)',DC0.format(s.debt)]);
  if(Math.abs(s.inv)>=0.5)rows.push([s.inv>0?'Yatırıma aktarılan':'Yatırımdan çekilen',DC0.format(Math.abs(s.inv))]);
  var fixed=0;S.recurring.forEach(function(r){var id=r.paid&&r.paid[k];var t=id&&byId(monthTx(k),id);if(t&&t.type==='exp')fixed+=txTL(t);});
  if(s.exp>0&&fixed>0)rows.push(['Sabit giderler (düzenli ödemeler)','%'+Math.round(fixed/s.exp*100)]);
  return '<div class="card"><h2>Nakit akışı</h2>'+res(rows,1)+'<p class="small muted" style="margin:8px 0 0">Oklar geçen döneme göre değişimi gösterir. Transferler, borç anapara ödemeleri ve yatırım alımları gider sayılmaz; birikim olarak değerlendirilir.</p></div>';
}
function trendSvg(n){
  var ks=[];for(var i=n-1;i>=0;i--)ks.push(addMonth(curP(),-i));
  var rows=ks.map(pstat),mx=Math.max.apply(null,rows.map(function(r){return Math.max(r.inc,r.exp);}));
  if(!(mx>0))return '<div class="small muted">Henüz veri yok.</div>';
  var W=300,H=110,bw=n>6?7:14,gap=(W-rows.length*(bw*2+2))/(rows.length+1),svg='',x=gap,pick=ks.indexOf(ui.trPick)>=0?ui.trPick:null;
  rows.forEach(function(r,i){var hi=Math.round(r.inc/mx*H),he=Math.round(r.exp/mx*H),op=pick&&pick!==r.k?' opacity=".35"':'';
    svg+='<g data-act="trend-pick" data-v="'+r.k+'" class="tg"'+op+'><rect x="'+(x-gap/2).toFixed(1)+'" y="0" width="'+(bw*2+2+gap).toFixed(1)+'" height="'+(H+20)+'" fill="transparent"/>';
    svg+='<rect x="'+x.toFixed(1)+'" y="'+(H-hi)+'" width="'+bw+'" height="'+hi+'" rx="2" fill="var(--inc)"/>';
    svg+='<rect x="'+(x+bw+2).toFixed(1)+'" y="'+(H-he)+'" width="'+bw+'" height="'+he+'" rx="2" fill="var(--exp)"/>';
    if(n<=6||i%2===(n-1)%2)svg+='<text x="'+(x+bw+1).toFixed(1)+'" y="'+(H+15)+'" text-anchor="middle" font-size="10" fill="var(--ink2)">'+esc(mlabel(r.k,1).replace('.',''))+'</text>';
    svg+='</g>';x+=bw*2+2+gap;});
  var done=rows.slice(0,-1).filter(function(r){return r.exp>0;});var av=done.length?done.reduce(function(a,r){return a+r.exp;},0)/done.length:0;
  var ai=done.filter(function(r){return r.inc>0;});var ar=ai.length?ai.reduce(function(a,r){return a+r.rate;},0)/ai.length:null;
  var det='<div class="pickbox small muted">Bir aya dokunarak ayrıntısını gör.</div>';
  if(pick){var p=rows[ks.indexOf(pick)];det='<div class="pickbox"><div class="small"><b>'+esc(plabel(p.k))+'</b></div><div class="small">Gelir <b class="num inc">'+DC0.format(p.inc)+'</b> · Gider <b class="num exp">'+DC0.format(p.exp)+'</b> · Fark <b class="num">'+sgnD(p.net)+'</b>'+(p.rate!=null?' · Tasarruf %'+Math.round(p.rate):'')+'</div>'+(p.k!==ui.month?'<button class="linkbtn" style="padding:4px 0 0" data-act="go-month" data-v="'+p.k+'">Bu döneme git ›</button>':'')+'</div>';}
  return '<svg viewBox="0 0 '+W+' '+(H+20)+'" width="100%" role="img" aria-label="Son '+n+' dönem gelir ve gider grafiği">'+svg+'</svg>'+det+'<div class="small muted" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px"><span><b style="color:var(--inc)">■</b> Gelir</span><span><b style="color:var(--exp)">■</b> Gider</span><span>Ort. gider '+DC0.format(av)+'</span>'+(ar!=null?'<span>Ort. tasarruf %'+Math.round(ar)+'</span>':'')+'</div>';
}
function catAvg(k){var pks=prevKs(k,3),avg={},cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length||1;pks.forEach(function(p){var o=spentByCat(p);Object.keys(o).forEach(function(c){avg[c]=(avg[c]||0)+o[c]/cnt;});});return avg;}
function catChanges(){
  var k=ui.month,cur=spentByCat(k),avg=catAvg(k);
  var cats=Object.keys(cur).concat(Object.keys(avg)).filter(function(c,i,a){return a.indexOf(c)===i;});
  cats.sort(function(a,b){return (cur[b]||0)-(cur[a]||0)||(avg[b]||0)-(avg[a]||0);});
  if(!cats.length)return '<div class="small muted">Bu dönemde ve önceki 3 dönemde harcama yok.</div>';
  var mx=Math.max.apply(null,cats.map(function(c){return Math.max(cur[c]||0,avg[c]||0);}))||1;
  return '<div class="list">'+cats.slice(0,10).map(function(c){var v=cur[c]||0,a=avg[c]||0,d=a>0?(v-a)/a*100:null;
    return '<button class="crow" data-act="cat-tx" data-v="'+esc(c)+'"><div class="crt"><span class="dot" style="background:'+color(c)+'"></span><span class="mid ell">'+esc(c)+'</span><b class="num">'+DC0.format(v)+'</b>'+(d==null?'<span class="small muted cchg">yeni</span>':'<span class="small cchg '+(d>10?'exp':(d<-10?'inc':'muted'))+'">'+(d>=0?'▲':'▼')+'%'+Math.round(Math.abs(d))+'</span>')+'</div><div class="cbar"><i style="width:'+(v/mx*100)+'%;background:'+color(c)+'"></i><s style="left:'+(a/mx*100)+'%"></s></div></button>';}).join('')+'</div><p class="small muted" style="margin:8px 0 0">Çizgi: önceki 3 dönemin ortalaması.</p>';
}
var WDN=['pazartesi','salı','çarşamba','perşembe','cuma','cumartesi','pazar'];
function weekdayCard(){
  var t0=today0(),from=new Date(t0);from.setDate(from.getDate()-83);var fs=isoDate(from),ts=isoDate(t0),tot=[0,0,0,0,0,0,0],cnt=[0,0,0,0,0,0,0],any=false;
  S.tx.forEach(function(t){if(t.type==='exp'&&t.date>=fs&&t.date<=ts){var w=(pdate(t.date).getDay()+6)%7;tot[w]+=txTL(t);cnt[w]++;any=true;}});
  if(!any)return '';
  var mx=Math.max.apply(null,tot)||1,names=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],top=tot.indexOf(Math.max.apply(null,tot)),sel=ui.wk!=null?ui.wk:top;
  return '<div class="card"><h2>Haftanın günleri</h2><div class="wkd">'+tot.map(function(v,i){return '<button data-act="wk-pick" data-v="'+i+'" aria-pressed="'+(i===sel)+'" aria-label="'+WDN[i]+'"><span class="wb"><i style="height:'+Math.max(v/mx*100,2)+'%"></i></span><span class="small muted">'+names[i]+'</span></button>';}).join('')+'</div><p class="small muted" style="margin:8px 0 0">Son 12 haftada <b>'+WDN[sel]+'</b>: haftalık ort. '+DC0.format(tot[sel]/12)+' · '+cnt[sel]+' harcama'+(sel===top?' · en çok harcadığın gün':'')+'.</p></div>';
}
function nwHistCard(){
  var s=nwSeries();
  if(s.length<2)return '<div class="card"><h2>Net servet gelişimi</h2><p class="small muted" style="margin:0">İlk işlemlerini ekledikçe net servetinin geçmişi burada oluşur.</p></div>';
  var from=pdate(s[s.length-1][0]);from.setDate(from.getDate()-(ui.nwr===1?0:(ui.nwr===12?364:182)));var fk=isoDate(from),r=ui.nwr===1?s:s.filter(function(x){return x[0]>=fk;});if(r.length<2)r=s.slice(-2);
  var v=r.map(function(x){return x[1];}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,W=300,H=100;
  var t0=pdate(r[0][0]).getTime(),span=(pdate(r[r.length-1][0]).getTime()-t0)||1;
  var xy=r.map(function(x,i){return [(pdate(x[0]).getTime()-t0)/span*W,H-6-(v[i]-mn)/rg*(H-12)];});
  var pts=xy.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var data=r.map(function(x,i){return [x[0],x[1],xy[i][0]/W,xy[i][1]/H,x[2]?1:0];});
  var mends={};s.forEach(function(x){mends[x[0].slice(0,7)]=x;});var ms=Object.keys(mends).sort().slice(-6),prev=null,rows=[];
  ms.forEach(function(m){var val=mends[m][1];rows.push([mlabel(m)+(mends[m][0]===todayS()?' (bugün)':''),DC0.format(val)+(prev!=null?' <span class="small '+(val>=prev?'inc':'exp')+'">'+sgnD(val-prev)+'</span>':'')]);prev=val;});
  var est=r.some(function(x){return x[2];}),last=r[r.length-1],d=r2(last[1]-r[0][1]);
  return '<div class="card"><div class="ghead" style="margin-bottom:8px"><h2 style="margin:0;flex:1">Net servet gelişimi</h2><div class="seg mini" role="group" aria-label="Süre"><button data-act="nwr" data-v="6" aria-pressed="'+(ui.nwr!==12&&ui.nwr!==1)+'">6 ay</button><button data-act="nwr" data-v="12" aria-pressed="'+(ui.nwr===12)+'">1 yıl</button><button data-act="nwr" data-v="1" aria-pressed="'+(ui.nwr===1)+'">Tümü</button></div></div>'
   +'<div class="nwchart" data-pts="'+esc(JSON.stringify(data))+'"><svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Net servet grafiği"><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><i class="nwdot" hidden></i></div>'
   +'<div class="pickbox small" id="nwpick"><span class="muted">'+esc(pdate(r[0][0]).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'}))+'’den bu yana </span><b class="num '+(d>=0?'inc':'exp')+'">'+sgnD(d)+'</b><span class="muted"> · grafiğe dokun ya da parmağını kaydır</span></div>'
   +'<div class="small muted" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:4px"><span>En düşük '+DC0.format(mn)+'</span><span>En yüksek '+DC0.format(mx)+'</span></div>'+res(rows.reverse())
   +(est?'<p class="small muted" style="margin:8px 0 0">Kayıt öncesi aylar işlemlerinden hesaplanır; yatırımlar bugünkü fiyatıyla alınır.</p>':'')+'</div>';
}
/* net servet grafiğinde dokunulan noktanın değeri */
function nwScrub(el,clientX){
  var box=el.getBoundingClientRect();if(!box.width)return;var d;try{d=JSON.parse(el.dataset.pts);}catch(e){return;}if(!d.length)return;
  var fx=(clientX-box.left)/box.width,best=d[0];d.forEach(function(p){if(Math.abs(p[2]-fx)<Math.abs(best[2]-fx))best=p;});
  var dot=el.querySelector('.nwdot');if(dot){dot.hidden=false;dot.style.left=(best[2]*100)+'%';dot.style.top=(best[3]*100)+'%';}
  var o=document.getElementById('nwpick'),m=maskOn;maskOn=!!S.hide&&!ui.page;
  try{if(o)o.innerHTML='<b>'+esc(pdate(best[0]).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}))+'</b>: <b class="num">'+DC0.format(best[1])+'</b>'+(best[4]?' <span class="muted">(işlemlerden hesaplandı)</span>':'');}finally{maskOn=m;}
}
function insights(){
  var out=[],k=curP(),s=pstat(k),sp=spentByCat(k),pks=prevKs(k,3),avg={},cnt=pks.filter(function(p){return sum(monthTx(p),'exp')>0;}).length;
  if(cnt){pks.forEach(function(p){var o=spentByCat(p);Object.keys(o).forEach(function(c){avg[c]=(avg[c]||0)+o[c]/cnt;});});
    Object.keys(sp).forEach(function(c){if(avg[c]>0&&sp[c]>avg[c]*1.2&&sp[c]-avg[c]>=100)out.push(['warn',c+' harcaman bu dönem şimdiden ortalamanın %'+Math.round((sp[c]/avg[c]-1)*100)+' üzerinde ('+TRY0.format(sp[c])+' / ort. '+TRY0.format(avg[c])+').']);});
    var ne=Object.keys(sp).filter(function(c){return !(avg[c]>0)&&sp[c]>=500;});if(ne.length)out.push(['muted','Yeni harcama kalemi: '+ne.slice(0,3).join(', ')+'.']);}
  var lim=EXPC().filter(function(c){return +S.budgets[c]>0;});lim.forEach(function(c){var r=(sp[c]||0)/S.budgets[c];if(r>=1)out.push(['exp',c+' bütçesini '+TRY0.format((sp[c]||0)-S.budgets[c])+' aştın.']);});
  var H=health();H.parts.forEach(function(p){if(p.k==='Acil durum fonu'&&p.p!=null&&p.p<0.5)out.push(['warn','Acil durum fonun '+p.v+'lık gideri karşılıyor; 6 ay hedefle.','em-open']);});
  if(s.rate!=null&&s.rate>=20)out.push(['inc','Bu dönem şu ana kadar gelirinin %'+Math.round(s.rate)+'’i harcanmadı.']);else if(s.rate!=null&&s.rate<0)out.push(['exp','Bu dönem giderlerin gelirini '+TRY0.format(-s.net)+' aştı.']);
  var rec=S.recurring.reduce(function(a,r){return a+toTL(r.amt,r.acct);},0),ai=avgMonthly('inc');if(rec>0&&ai>0)out.push(['muted','Düzenli ödemelerin aylık gelirinin %'+Math.round(rec/ai*100)+'’i.']);
  if(!out.length)return '';
  return '<div class="card"><h2>Öne çıkanlar</h2><div class="list">'+out.slice(0,6).map(function(x){var tag=x[2]?'button':'div';return '<'+tag+' class="item"'+(x[2]?' data-act="'+x[2]+'"':'')+'><span class="dot" style="background:var(--'+(x[0]==='muted'?'ink2':x[0])+')"></span><span class="mid"><div class="wrap-t">'+esc(x[1])+'</div></span>'+(x[2]?ic('r'):'')+'</'+tag+'>';}).join('')+'</div></div>';
}
/* takvim: dönemin günleri, her günün geliri ve gideri; güne dokununca o günün işlemleri */
function calBody(){
  var k=ui.month,s=pStart(k),e=pEnd(k),t0=todayS(),by={};
  monthTx(k).forEach(function(t){var d=by[t.date]||(by[t.date]={i:0,x:0,n:0});d.n++;if(t.type==='inc')d.i+=txTL(t);else if(t.type==='exp')d.x+=txTL(t);});
  var d=pdate(s);d.setDate(d.getDate()-(d.getDay()+6)%7);var end=pdate(e);end.setDate(end.getDate()+(7-(end.getDay()+6)%7)%7);
  var cells='',sm=function(v){return maskOn?'•':(v>=1e6?NUM1.format(v/1e6)+'Mn':v>=1e4?Math.round(v/1e3)+'B':v>=1000?NUM1.format(v/1e3).replace(/,0$/,'')+'B':Math.round(v));};
  while(d<=end){var iso=isoDate(d),inP=iso>=s&&iso<=e,x=by[iso],cls='cd'+(inP?'':' out')+(iso===t0?' today':'')+(x?' has':'');
    cells+='<button class="'+cls+'"'+(inP?' data-act="cal-day" data-v="'+iso+'"':' disabled')+' aria-label="'+esc(d.toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+(x?': '+x.n+' işlem':'')+'"><span class="dn">'+d.getDate()+(d.getDate()===1?'<small>'+d.toLocaleDateString('tr-TR',{month:'short'})+'</small>':'')+'</span>'
     +(x&&x.i>=0.5?'<span class="ci">+'+sm(x.i)+'</span>':'')+(x&&x.x>=0.5?'<span class="cx">−'+sm(x.x)+'</span>':'')+'</button>';
    d.setDate(d.getDate()+1);}
  var mt=monthTx(k),inc=sum(mt,'inc'),exp=sum(mt,'exp'),days=Object.keys(by),top=days.sort(function(a,b){return by[b].x-by[a].x;})[0];
  return monthNav()+'<div class="card cal"><div class="cw">'+['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].map(function(w){return '<span>'+w+'</span>';}).join('')+'</div><div class="cg">'+cells+'</div></div>'
   +'<div class="card"><h2>Dönem özeti</h2><div class="row3" style="margin-top:0"><div><div class="lbl">Gelir</div><span class="num inc">'+compactT(inc)+'</span></div><div><div class="lbl">Gider</div><span class="num exp">'+compactT(exp)+'</span></div><div><div class="lbl">Net</div><span class="num '+(inc-exp<0?'exp':'inc')+'">'+(inc-exp<=-0.5?'−':'+')+compactT(Math.abs(inc-exp))+'</span></div></div>'
   +(top&&by[top].x>=1?'<p class="small muted" style="margin:10px 0 0">En çok harcama: '+esc(pdate(top).toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'long'}))+', '+TRY0.format(by[top].x)+'.</p>':'')+'</div>';
}
ACT['cal-day']=function(el,id,v){
  var l=S.tx.filter(function(t){return t.date===v;}).sort(function(a,b){return b.id>a.id?1:-1;});
  openSheet('<h2>'+esc(pdate(v).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'}))+'</h2>'+(l.length?'<div class="list">'+l.map(txRow).join('')+'</div>':'<div class="empty">Bu gün işlem yok.</div>')
   +'<button class="btn" data-act="cal-add" data-v="'+v+'">Bu güne işlem ekle</button>');};
ACT['cal-add']=function(el,id,v){txSheet(null,null,{date:v});};
function analizBody(){
  var v=ANS.some(function(x){return x[0]===ui.an;})?ui.an:'ozet',W=wealth(),k=ui.month,m=monthTx(k),h=segTabs(ANS,v,'an','Analiz');
  if(v==='ozet'){
    h+=monthNav()+(k===curP()?insights():'')+healthCard()+aiCard()+flowCard();
    h+='<div class="card"><div class="ghead" style="margin-bottom:8px"><h2 style="margin:0;flex:1">Gelir ve gider</h2><div class="seg mini" role="group" aria-label="Süre"><button data-act="trn" data-v="6" aria-pressed="'+(ui.tr===6)+'">6 ay</button><button data-act="trn" data-v="12" aria-pressed="'+(ui.tr===12)+'">12 ay</button></div></div>'+trendSvg(ui.tr)+'</div>';
    return h;
  }
  if(v==='harcama'){
    var big=m.filter(function(t){return t.type==='exp';}).sort(function(a,b){return txTL(b)-txTL(a);}).slice(0,5);
    var byA={};m.forEach(function(t){if(t.type==='exp')byA[t.acct]=(byA[t.acct]||0)+txTL(t);});
    h+=monthNav()+'<button class="setcard" data-act="plan-go" data-v="butce"><span class="sic" style="--c:var(--inc)">'+ic('scale')+'</span><span class="mid"><div class="t">Bütçeler</div><div class="small muted">Kategori limitlerini belirle ve takip et</div></span>'+ic('r')+'</button><div class="card"><h2>Kategoriler</h2>'+catChanges()+'</div>';
    var sbc=spentByCat(k);h+='<div class="card"><h2>Dağılım</h2>'+donut(Object.keys(sbc).map(function(c){return [c,sbc[c]];}),'Bu dönemde harcama yok.','cat-tx')+'</div>';
    if(big.length)h+='<div class="card" style="padding-top:12px"><h2>En büyük harcamalar</h2><div class="list">'+big.map(txRow).join('')+'</div></div>';
    var ak=Object.keys(byA);if(ak.length>1)h+='<div class="card"><h2>Hesaplara göre</h2>'+donut(ak.map(function(a){return [a,byA[a]];}),'')+'</div>';
    return h+weekdayCard();
  }
  if(v==='takvim')return h+calBody();
  h+=nwHistCard()+fireCard();
  h+='<div class="card"><h2>Varlık dağılımı</h2>'+donut(W.items,'Henüz varlık yok.')+'<div class="small num muted" style="margin-top:8px">Toplam '+DC0.format(W.assets)+'</div></div>';
  if(W.debts.length)h+='<div class="card"><h2>Borç dağılımı</h2>'+donut(W.debts,'Borç kaydı yok.')+'<div class="small num muted" style="margin-top:8px">Toplam '+DC0.format(W.debt)+'</div></div>';
  if(S.realized.length){var rp=S.realized.reduce(function(a,x){return a+(+x.pl||0);},0);h+='<div class="card"><h2>Gerçekleşen yatırım kâr/zararı</h2><p class="big '+(rp>=0?'inc':'exp')+'" style="font-size:1.5rem">'+sgnD(rp)+'</p><div class="small muted">'+S.realized.length+' satıştan</div></div>';}
  return h;
}

/* ---------- Portföy ---------- */
function rateTile(l,v,c){return '<span class="rt"><span class="lbl">'+l+'</span><span class="num">'+fx1(v)+'</span>'+(v>0&&c!=null&&isFinite(c)?'<span class="small num '+(c>=0?'inc':'exp')+'">'+(c>=0?'+':'−')+'%'+NUM2.format(Math.abs(c))+'</span>':'')+'</span>';}
function fmtTs(t){return new Date(t).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});}
function qtyTxt(x){var q=NUM2.format(x.qty);return {XAU:q+' gr',XAG:q+' gr',CEY:q+' adet',USD:'$'+q,EUR:'€'+q,GBP:'£'+q,CHF:'CHF '+q}[x.ccy]||q+' adet';}
function borcBody(){
  var tot=debtManual(),cards=ACCS().filter(function(a){return acctType(a)==='kart'&&acctBal(a)<0;}),cd=r2(cards.reduce(function(x,a){return x+toTL(-acctBal(a),a);},0));
  var h='<div class="card"><div class="lbl">Toplam borç</div><p class="big exp">'+TRY0.format(tot+cd)+'</p>'+(cd>0?'<div class="small muted">Kredi kartları '+TRY0.format(cd)+' · krediler ve diğer '+TRY0.format(tot)+'</div>':'')+'</div>';
  h+='<button class="btn" data-act="new-d">Borç ekle</button>';
  if(S.debts.length)h+='<div class="card" style="padding-top:6px"><div class="list">'+S.debts.map(function(d){var l=debtLeft(d),p=d.amt>0?clamp((d.amt-l)/d.amt*100,0,100):0;return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="bar" style="margin:6px 0 2px"><i style="width:'+p+'%"></i></div><div class="small muted">'+esc(d.type)+' · %'+Math.round(p)+' ödendi</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div></div>';
  else h+='<div class="empty">Kredi, taksit ya da kişisel borç yok. Eklersen ödemeler hesabından düşer, borç azalır.</div>';
  if(cards.length)h+='<div class="card" style="padding-top:12px"><h2>Kredi kartları</h2><div class="list">'+cards.map(acctLine).join('')+'</div></div>';
  return h;
}
function holdCard(x){
  var p=hVal(x)-hCost(x),pp=hCost(x)?p/hCost(x)*100:0,linked=!!x.mk||!!(x.ccy&&+S.fx[x.ccy]>0),ast=hKind(x)==='asset',mq=x.mk&&mQ(x.mk);
  return '<div class="card hcard"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><button class="item" style="padding:0;border:0;flex:1" data-act="edit-h" data-id="'+x.id+'"><span class="dot" style="background:'+color(x.type)+'"></span><span class="mid"><div class="t" style="font-weight:600">'+esc(x.name)+'</div><div class="small muted">'+esc(x.type)+(ast?'':' · '+qtyTxt(x)+' · ort. '+TRY2.format(x.cost))+(linked?' · '+esc(x.mk?(x.mks||mSym(x.mk)):FXL[x.ccy])+' '+TRY2.format(hPrice(x)):'')+(mq&&mq.c!=null?' '+chgSpan(mq.c):'')+'</div></span></button><span class="num" style="font-size:1.0625rem">'+TRY0.format(hVal(x))+'</span></div>'
   +(linked?'':'<label class="pin-in"><span class="small muted">Güncel '+(ast?'değer':'fiyat')+' (₺)</span><input inputmode="decimal" data-price="'+x.id+'" value="'+nv(x.price)+'" aria-label="'+esc(x.name)+' güncel '+(ast?'değer':'fiyat')+' (₺)"></label>')
   +'<div class="hrow"><span class="num small '+(p>=0?'inc':'exp')+'">'+sgn(p)+(hCost(x)?' ('+(pp>=0?'+':'−')+'%'+NUM2.format(Math.abs(pp))+')':'')+'</span><span class="hbtn">'+(ast?'':'<button class="btn small ghost" data-act="h-buy" data-id="'+x.id+'">Al</button>')+'<button class="btn small ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></span></div></div>';
}
function yatirimBody(){
  var pf=pfTotals('inv'),pl=pf.v-pf.c,plp=pf.c?pl/pf.c*100:0,h='',dist='',inv=S.holdings.filter(function(x){return hKind(x)==='inv';});
  if(pf.v>0){var by={};inv.forEach(function(x){by[x.type]=(by[x.type]||0)+hVal(x);});var ks=Object.keys(by).sort(function(a,b){return by[b]-by[a];});
    dist='<div class="stackbar" style="margin-top:14px">'+ks.map(function(k,i){return '<i style="width:'+(by[k]/pf.v*100)+'%;background:'+dcol(i)+'"></i>';}).join('')+'</div><div class="legend">'+ks.map(function(k,i){return '<span style="--c:'+dcol(i)+'">'+esc(k)+' %'+NUM2.format(by[k]/pf.v*100)+'</span>';}).join('')+'</div>';}
  h+='<div class="card"><div class="lbl">Yatırımlarının değeri</div><p class="big">'+TRY0.format(pf.v)+'</p><div class="row3" style="grid-template-columns:1fr 1fr"><div><div class="lbl">Maliyet</div><span class="num">'+TRY0.format(pf.c)+'</span></div><div><div class="lbl">Kâr / zarar</div><span class="num '+(pl>=0.5?'inc':(pl<=-0.5?'exp':''))+'">'+sgn(pl)+'</span>'+(pf.c?'<div class="small '+(plp>=0?'inc':'exp')+'">'+(plp>=0?'+':'−')+'%'+NUM1.format(Math.abs(plp))+'</div>':'')+'</div></div>'+dist+'</div>';
  h+='<button class="btn" data-act="new-h" data-v="inv">Yatırım ekle</button>';
  h+=inv.length?inv.map(holdCard).join(''):'<div class="empty">Hisse, fon, altın, gümüş, döviz, kripto ya da mevduat ekle. Hisse, fon ve kriptoyu aşağıdaki Piyasalar’dan eklersen fiyatları kendiliğinden güncellenir.</div>';
  return h+mCard();
}
function varlikBody(){
  var pa=pfTotals('asset'),ast=S.holdings.filter(function(x){return hKind(x)==='asset';});
  var h='<div class="card"><div class="lbl">Diğer varlıklar</div><p class="big">'+TRY0.format(pa.v)+'</p>'+(pa.c&&Math.abs(pa.v-pa.c)>=0.5?'<div class="small muted">Alış değerine göre '+sgn(pa.v-pa.c)+'</div>':'')+'</div>';
  h+='<button class="btn" data-act="new-h" data-v="asset">Varlık ekle</button>';
  return h+(ast.length?ast.map(holdCard).join(''):'<div class="empty">Ev, araba gibi varlıklarını ekleyerek net servetine kat.</div>');
}

/* ---------- Notlar ---------- */
/* Notlar sade: tek liste (arşivdekiler de burada), sabitler üstte; silinenler 30 gün "Silinenler"de kalır */
function noteIn(n,v){return v==='trash'?!!n.trash:!n.trash;}
function noteSorted(v){
  var q=fold(ui.nq),N=S.nset;v=v||'act';
  var l=S.notes.filter(function(n){return noteIn(n,v)&&(!q||fold((n.title||'')+' '+n.body).indexOf(q)>-1);});
  l.sort(function(a,b){
    if(v!=='trash'&&N.pinFirst!==false&&!!a.pin!==!!b.pin)return a.pin?-1:1;
    if(N.sort==='title')return String(a.title||a.body||'').localeCompare(String(b.title||b.body||''),'tr');
    if(N.sort==='created')return (b.cts||b.ts||0)-(a.cts||a.ts||0);
    return (b.ts||0)-(a.ts||0);});
  return l;
}
function noteHead(n){var t=(n.title||'').trim();if(t)return t;var f=String(n.body||'').trim().split('\n')[0];return f?f.slice(0,60):'Boş not';}
function noteDate(ts){var d=new Date(ts),t=today0();return d>=t?d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:d.getFullYear()!==t.getFullYear()?'numeric':undefined});}
function notesList(){
  var l=noteSorted('act');
  if(!l.length)return '<div class="empty" style="grid-column:1/-1">'+(ui.nq?'Eşleşen not yok.':'Henüz not yok. Alışveriş listesi, harcama fikri, hatırlatma… ne istersen yaz.')+'</div>';
  return l.map(function(n){var hasT=!!(n.title||'').trim(),body=hasT?n.body:String(n.body||'').trim().split('\n').slice(1).join('\n');
    return '<button class="note-card'+(n.pin?' pinned':'')+'" data-act="edit-n" data-id="'+n.id+'"><span class="nt">'+esc(noteHead(n))+(n.pin?'<span class="pinmark" aria-label="Sabit">'+ic('pin')+'</span>':'')+'</span>'
     +(String(body||'').trim()?'<span class="np">'+esc(String(body).trim())+'</span>':'')+'<span class="nd">'+esc(noteDate(n.ts||Date.now()))+'</span></button>';}).join('');
}
function noteCounts(){var c={act:0,arch:0,trash:0};S.notes.forEach(function(n){c[n.trash?'trash':'act']++;});return c;}
function vNotlar(){
  var c=noteCounts();ui.nv='act';
  return '<button class="btn" data-act="new-n">'+ic('plus')+' Yeni not</button>'
   +(c.act>=4||ui.nq?'<input id="nsearch" type="search" placeholder="Notlarda ara" value="'+esc(ui.nq)+'" aria-label="Notlarda ara">':'')
   +'<div id="nlist" class="ngrid">'+notesList()+'</div>'
   +(c.trash||c.act?'<div class="nfoot">'+(c.trash?'<button class="linkbtn" data-act="n-trashv">Silinenler ('+c.trash+')</button>':'<span></span>')+(c.act?'<button class="linkbtn" data-act="n-export">Dışa aktar</button>':'')+'</div>':'');
}
function trashSheet(){
  var l=noteSorted('trash');if(!l.length){closeSheet();render();return;}
  openSheet('<h2>Silinen notlar</h2><p class="small muted" style="margin:0">Silinen notlar 30 gün sonra kendiliğinden kalıcı olarak silinir.</p><div class="list">'
   +l.map(function(n){var left=Math.max(0,30-Math.floor((Date.now()-n.trash)/864e5));return '<div class="item"><span class="mid"><div class="t ell">'+esc(noteHead(n))+'</div><div class="small muted">'+left+' gün sonra silinecek</div></span><button class="btn small ghost" data-act="nt-restore" data-id="'+n.id+'">Geri al</button><button class="icon-btn sm" data-act="nt-purge" data-id="'+n.id+'" aria-label="Kalıcı olarak sil" title="Kalıcı olarak sil">'+ic('trash')+'</button></div>';}).join('')
   +'</div><button class="btn danger" data-act="n-empty">Hepsini kalıcı olarak sil</button>');
}
ACT['n-trashv']=function(){trashSheet();};
ACT['nt-restore']=function(el,id){var n=byId(S.notes,id);if(!n)return;delete n.trash;save();render();toast('Not geri alındı');trashSheet();};
ACT['nt-purge']=function(el,id){if(!armed(el)){toast('Kalıcı silmek için tekrar dokun');return;}S.notes=S.notes.filter(function(x){return x.id!==id;});save();render();toast('Not kalıcı olarak silindi');trashSheet();};
ACT['n-export']=function(){openSheet('<h2>Notları dışa aktar</h2>'+notesExport());};
function vNote(){
  var p=ui.page,d=p.draft,n=p.id?byId(S.notes,p.id):null;
  if(n&&n.trash)return '<div class="banner"><span>Bu not silinenler arasında. Düzenlemek için geri al.</span></div><div class="card"><div class="t" style="font-weight:700;font-size:1.125rem">'+esc(n.title||'Başlıksız')+'</div><p style="white-space:pre-wrap;margin:8px 0 0">'+esc(n.body)+'</p></div><button class="btn" data-act="note-restore">Geri al</button><button class="btn danger" data-act="note-purge">Kalıcı olarak sil</button>';
  return '<input id="n-title" class="ntitle" data-nf="title" value="'+esc(d.title)+'" placeholder="Başlık" aria-label="Başlık">'
   +'<textarea id="n-body" class="nbody" data-nf="body" placeholder="Notunu yaz" aria-label="Not">'+esc(d.body)+'</textarea>'
   +'<div class="nbar"><button class="chip" data-act="note-pin" role="switch" aria-checked="'+!!d.pin+'" aria-pressed="'+!!d.pin+'">'+ic('pin')+' Sabitle</button>'
   +(n?'<span class="small muted">'+esc(new Date(n.ts).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))+'</span>':'<span></span>')+'</div>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="note-save">Kaydet</button>'
   +(n?'<button class="btn ghost dangertxt" data-act="note-trash">'+ic('trash')+' Notu sil</button>':'');
}
function saveNote(){
  var p=ui.page;if(!p||p.k!=='note'||!p.dirty)return;
  var d=p.draft,ti=d.title.trim(),bo=d.body;
  if(!ti&&!bo.trim())return;
  if(p.id){var n=byId(S.notes,p.id);if(n){n.title=ti;n.body=bo;n.pin=!!d.pin;n.arch=false;n.ts=Date.now();delete n.sample;}}
  else{var n2={id:uid(),title:ti,body:bo,pin:!!d.pin,arch:false,ts:Date.now(),cts:Date.now()};S.notes.push(n2);p.id=n2.id;}
  p.dirty=false;save();
}
function purgeTrash(){var lim=Date.now()-30*864e5,b=S.notes.length;S.notes=S.notes.filter(function(n){return !(n.trash&&n.trash<lim);});if(S.notes.length!==b)save();}
