/* ---------- Nereye gitti: mağazalara göre harcama (4.27) ----------
   Analiz › Kategoriler'de, seçili dönemin giderleri yere göre toplanır: tanınan mağaza (logo eşleştirmesi) sitesine göre,
   tanınmayan açıklama ise kendi metnine göre ("köşedeki bakkal" hep aynı yer sayılır). Açıklamasız giderler ayrıca yazılır. */
function wKey(t){
  var d=mrcDom(t.note)||mrcDom(t.sub);if(d)return 'd:'+d;
  var n=fold(t.note||'').replace(/[’`´]/g,"'").replace(/\s+/g,' ').trim();return n?'n:'+n:'';
}
/* bir dönemin gruplanmış giderleri: {key:{s:toplam,n:adet,l:[işlemler]}} ve açıklamasızlar */
function wGroups(k){
  var g={},none={s:0,n:0};
  monthTx(k).forEach(function(t){if(t.type!=='exp'||t.xs)return;var v=txTL(t),key=wKey(t);if(!key){none.s+=v;none.n++;return;}
    var x=g[key]||(g[key]={s:0,n:0,l:[]});x.s+=v;x.n++;x.l.push(t);});
  return {g:g,none:none};
}
/* grubun adı: en sık yazılan açıklama (yazıldığı gibi); kategorisi: en çok harcanan kategori */
function wName(x){var c={},b='',bn=0;x.l.forEach(function(t){var n=String(t.note||t.sub||'').trim();if(!n)return;c[n]=(c[n]||0)+1;if(c[n]>bn){bn=c[n];b=n;}});return b||'—';}
function wCat(x){var c={},b='',bv=-1;x.l.forEach(function(t){c[t.cat]=(c[t.cat]||0)+txTL(t);if(c[t.cat]>bv){bv=c[t.cat];b=t.cat;}});return b;}
function wIc(x,cls){var t=x.l[0];return mrcIc([t.note,t.sub],wCat(x),cls);}
function wChg(cur,prev,had){
  if(!had)return '';
  if(!(prev>0))return '<span class="small wnew">yeni</span>';
  var p=Math.round((cur-prev)/prev*100);if(Math.abs(p)<1)return '<span class="small muted">aynı</span>';
  return '<span class="small num '+(p>0?'exp':'inc')+'">'+(p>0?'▲':'▼')+'%'+Math.abs(p)+'</span>';
}
function whereCard(k){
  var W=wGroups(k),g=W.g,ks=Object.keys(g).sort(function(a,b){return g[b].s-g[a].s;}),tot=ks.reduce(function(a,x){return a+g[x].s;},0)+W.none.s;
  if(!(tot>0))return '';
  var h='<div class="card wcard"><div class="ghead" style="margin-bottom:2px"><h2 style="margin:0;flex:1">Nereye gitti</h2></div>';
  if(!ks.length)return h+'<div class="small muted" style="padding:6px 0">Bu dönemdeki harcamalarında açıklama yok. İşlem eklerken nereden aldığını yazarsan (Migros, Trendyol…) burada yer yer görürsün.</div></div>';
  var pk=prevKs(k,1)[0],P=pk?wGroups(pk).g:{},had=!!pk&&Object.keys(P).length>0;
  /* tek cümlelik özet: en büyük 3 yerin payı ve en sık gidilen yer */
  var top=ks.slice(0,Math.min(3,ks.length)),ts=top.reduce(function(a,x){return a+g[x].s;},0),sm=[];
  if(ks.length>=2)sm.push('Harcamanın %'+Math.round(ts/tot*100)+'’i '+top.length+' yere gitti: '+top.map(function(x){return wName(g[x]);}).join(', ')+'.');
  else sm.push('Harcamanın %'+Math.round(ts/tot*100)+'’i '+wName(g[top[0]])+'’a gitti.');
  var fq=ks.slice().sort(function(a,b){return g[b].n-g[a].n||g[b].s-g[a].s;})[0];
  if(g[fq].n>=3)sm.push('En sık: '+wName(g[fq])+' ('+g[fq].n+' kez, ortalama '+TRY0.format(g[fq].s/g[fq].n)+').');
  h+='<p class="small muted wsum">'+esc(sm.join(' '))+'</p>';
  var all=ui.wAll===k,show=all?ks:ks.slice(0,6);
  h+='<div class="wlist">'+show.map(function(key){var x=g[key],p=x.s/tot*100,c=wCat(x);
    return '<button class="wrow" data-act="w-open" data-v="'+esc(key)+'">'+wIc(x)+'<span class="mid"><span class="wt"><span class="t ell">'+esc(wName(x))+'</span><span class="num">'+TRY0.format(x.s)+'</span></span>'
     +'<span class="wt"><span class="small muted ell">'+x.n+' işlem · '+esc(c)+'</span><span class="wr">'+wChg(x.s,P[key]?P[key].s:0,had)+'<span class="small muted num">%'+(p<1?'&lt;1':Math.round(p))+'</span></span></span>'
     +'<span class="bar"><i style="width:'+Math.max(p,1).toFixed(1)+'%;background:'+color(c)+'"></i></span></span></button>';}).join('')+'</div>';
  if(ks.length>6)h+='<button class="btn ghost small" data-act="w-all" data-v="'+k+'">'+(all?'Daha az göster':'Tümünü göster ('+ks.length+' yer)')+'</button>';
  if(W.none.n)h+='<div class="small muted wnone">Açıklamasız '+W.none.n+' işlem · '+TRY0.format(W.none.s)+' (%'+Math.round(W.none.s/tot*100)+'). Açıklama yazarsan nereye gittiği burada görünür.</div>';
  return h+'</div>';
}
ACT['w-all']=function(el,id,v){ui.wAll=ui.wAll===v?'':v;render();};
/* yerin ayrıntısı: dönem toplamı, ortalama, son 6 dönem, işlemler */
function whereSheet(key){
  var k=ui.month,W=wGroups(k),x=W.g[key],tot=Object.keys(W.g).reduce(function(a,q){return a+W.g[q].s;},0)+W.none.s;
  var allL=S.tx.filter(function(t){return t.type==='exp'&&wKey(t)===key;}).sort(function(a,b){return b.date.localeCompare(a.date);});
  if(!allL.length)return;
  var ref={l:allL},nm=wName(ref),c=wCat(ref),cur=x?x.s:0,n=x?x.n:0;
  var tr=[];for(var i=5;i>=0;i--){var pk=addMonth(k,-i),sv=0;monthTx(pk).forEach(function(t){if(t.type==='exp'&&wKey(t)===key)sv+=txTL(t);});tr.push([pk,sv]);}
  var mx=Math.max.apply(null,tr.map(function(q){return q[1];})),trH='';
  if(tr.filter(function(q){return q[1]>0;}).length>=2)trH='<div class="lbl" style="margin-top:4px">Son 6 dönem</div><div class="ctrend" role="img" aria-label="Son 6 dönem '+esc(nm)+'">'+tr.map(function(q){var hh=mx>0?Math.max(q[1]/mx*100,q[1]>0?4:0):0;return '<div class="cb'+(q[0]===k?' on':'')+'"><span class="small num">'+(q[1]>0?compactT(q[1]).replace('₺',''):'')+'</span><i style="height:'+hh.toFixed(0)+'%;background:'+color(c)+'"></i><span class="small muted">'+esc(mlabel(q[0],true))+'</span></div>';}).join('')+'</div>';
  var info=[];if(n)info.push(n+' işlem · ortalama '+TRY0.format(cur/n));if(cur>0&&tot>0)info.push('harcamanın %'+Math.round(cur/tot*100)+'’i');
  var pv=prevKs(k,3).map(function(p){var s=0;monthTx(p).forEach(function(t){if(t.type==='exp'&&wKey(t)===key)s+=txTL(t);});return s;}),pc=pv.length?pv.reduce(function(a,b){return a+b;},0)/pv.length:0;
  if(pc>0)info.push('önceki '+pv.length+' dönem ort. '+TRY0.format(pc));
  var l=x?x.l.slice().sort(function(a,b){return b.date.localeCompare(a.date);}):allL.slice(0,10);
  openSheet('<div class="ghead">'+wIc(ref,'lg')+'<h2 style="margin:0;flex:1">'+esc(nm)+'</h2></div><div><div class="lbl">'+esc(plabel(k))+'</div><p class="big" style="margin:0">'+TRY0.format(cur)+'</p>'+(info.length?'<div class="small muted">'+esc(info.join(' · '))+'</div>':'')+'</div>'+trH
   +(x?'':'<div class="lbl">Son işlemler</div>')+'<div class="list">'+l.map(txRow).join('')+'</div>'
   +(allL.length>l.length?'<button class="btn ghost" data-act="w-search" data-v="'+esc(nm)+'">Tüm işlemleri göster ('+allL.length+')</button>':''));
}
ACT['w-open']=function(el,id,v){whereSheet(v);};
ACT['w-search']=function(el,id,v){closeSheet();ui.page=null;ui.sub='islem';ui.tq=v;render();};
