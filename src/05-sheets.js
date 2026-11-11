
/* ---------- render ---------- */
function pageInfo(){
  var p=ui.page;
  if(p.k==='fire')return {title:'Finansal özgürlük',body:vFire};
  if(p.k==='araclar')return {title:'Hesaplayıcılar',body:vArac};
  if(p.k==='piyasa')return {title:'Piyasalar',body:vPiyasa};
  if(p.k==='ayar')return {title:'Ayarlar',body:vAyarlar};
  if(p.k==='notlar')return {title:'Notlar',body:vNotlar};
  if(p.k==='set'&&p.s==='notlar')return {title:'Not ayarları',body:setNotlar};
  if(p.k==='set'){var sid=SETMAP[p.s]||p.s,s=SETS.filter(function(x){return x.id===sid;})[0]||SETS[SETS.length-1];return {title:s.t,body:function(){return setBody(s.id);}};}
  var n=p.id&&byId(S.notes,p.id);
  return {title:n&&n.trash?'Silinen not':'',body:vNote,btns:noteBtns};
}
function render(){RIN=true;try{render0();}finally{RIN=false;}}
function render0(){
  TXV++;
  /* eski Planlama sayfası artık Plan sekmesi */
  if(ui.page&&ui.page.k==='plan'){ui.page=null;ui.sub='gelisim';ui.gl=ui.plan||'butce';}
  /* 4.31: eski sekme adları (plan, analiz, servet) yeni yerlerine */
  if(ui.sub==='plan'||ui.sub==='analiz'||ui.sub==='servet'||ui.sub==='ayarlar')ui.sub=mapSec(ui.sub);
  /* 4.31: Ayarlar sekme oldu; eski Ayarlar sayfası (adres #ayarlar) sekmeye döner */
  if(ui.page&&ui.page.k==='ayar'){ui.page=null;ui.sub='ayar';}
  try{snap();}catch(e){}
  var L=document.getElementById('lock');
  document.body.classList.toggle('locked',!!ui.locked);
  if(ui.locked){L.hidden=false;L.innerHTML=lockHtml();return;}
  L.hidden=true;L.innerHTML='';
  applyTheme();
  document.documentElement.style.fontSize=(16*(+S.fs||1))+'px';
  maskOn=!!S.hide&&!ui.page;
  var hd=document.getElementById('hdr'),vw=document.getElementById('view');
  if(ui.page){
    var P=pageInfo();
    hd.innerHTML='<button class="icon-btn" data-act="back" aria-label="Geri">'+ic('back')+'</button><h1>'+esc(P.title)+'</h1>'+(P.btns?'<span class="hbtns">'+P.btns()+'</span>':'');
    vw.innerHTML=P.body();
    var kb=document.getElementById('n-body');if(kb)kGrow(kb);
  }else{
    hd.innerHTML=tabHead();
    var vk=(ui.page?'p:'+ui.page.k:ui.sub+':'+(ui.sub==='gelisim'?ui.gl:''));vw.innerHTML=vMain();
    /* 4.33: sekme ya da sayfa değişince kartlar sırayla belirir; aynı ekranda yeniden çizimde (yazarken, kur gelince) hareket yok */
    /* 4.33: açılışta net servet sıfırdan sayarak gelir (bir kez; hareket azaltılmışsa yok) */
    if(!CNTD&&!ui.page&&ui.sub==='ev'){CNTD=1;var ce=vw.querySelector('.nwbig .big[data-n]'),cn=ce&&+ce.dataset.n;
      if(ce&&/\d/.test(ce.textContent)&&isFinite(cn)&&cn!==0&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){var c0=performance.now(),fin=ce.textContent;
        (function st(t){var p=Math.min(1,(t-c0)/700),e=1-Math.pow(1-p,3);if(!ce.isConnected)return;ce.textContent=p<1?DC0.format(Math.round(cn*e)):fin;if(p<1)requestAnimationFrame(st);})(c0);}}
    if(vk!==VKEY){VKEY=vk;vw.classList.remove('enter');void vw.offsetWidth;vw.classList.add('enter');clearTimeout(VKT);VKT=setTimeout(function(){vw.classList.remove('enter');},900);}
  }
  applyNoteColor();
  var tb=document.getElementById('tabbar');
  if(tb){tb.hidden=!!ui.page;document.body.classList.toggle('has-tb',!ui.page);
    /* 4.33: + düğmesi alt menünün ortasında (yüzen düğme yok; listelerin üstüne binmez) */
    if(!ui.page){var tbb=function(x){var on=ui.sub===x[0];return '<button data-act="sub" data-v="'+x[0]+'"'+(on?' aria-current="page"':'')+'>'+ic(x[2])+'<span>'+x[1]+'</span></button>';};
      tb.innerHTML='<div class="tbin">'+SECS.slice(0,2).map(tbb).join('')+'<button class="tbadd" data-act="new-tx" aria-label="İşlem ekle" title="İşlem ekle">'+ic('plus')+'</button>'+SECS.slice(2).map(tbb).join('')+'</div>';}}
  document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px');
  /* işlem eklemek her sekmeden tek dokunuş: ana sayfada büyük kart, diğer sekmelerde + düğmesi */
  var fb=document.getElementById('fab');fb.hidden=true;document.body.classList.toggle('has-fab',!fb.hidden);
}
var VKEY='',VKT=0,CNTD=0;
function persistUi(){try{localStorage.setItem(UIKEY,JSON.stringify({nv:ui.nv,plan:ui.plan,sv:ui.sv,an:ui.an,gl:ui.gl}));}catch(e){}}
/* sekme başlığı: Ana Sayfa'da logo, ara ve uyarılar (4.15: sesle ekleme kaldırıldı, Notlar ana sayfadaki kısayolda); Hesaplar'da kur yenileme; ayarlar her sekmede sağdaki çark simgesinde.
   Uyarılar ana sayfadaki Gündem kartında (ayrı zil yok); tutarları gizleme ana sayfa ve Hesaplar kartındaki gözde. */
function tabHead(){
  var gear='<button class="icon-btn" data-act="open-settings" aria-label="Ayarlar" title="Ayarlar">'+ic('cog')+'</button>';
  var rf='<button class="icon-btn" id="rfb" data-act="refresh" aria-label="Yenile: güncel kurlar ve piyasalar" title="Yenile">'+ic('refresh')+'</button>';
  /* 4.31: Ayarlar alt menüde (çark yok); Ana Sayfa'da kur yenileme ve uyarılar */
  if(ui.sub==='ev')return '<h1><span class="logo" role="img" aria-label="Wallet logosu"></span>Wallet</h1><span class="hbtns">'+rf+(function(){var n=alertItems().length;return '<button class="icon-btn bellb" data-act="alerts" aria-label="Uyarılar'+(n?': '+n:'')+'" title="Uyarılar">'+ic('bell')+(n?'<i class="badge">'+(n>9?'9+':n)+'</i>':'')+'</button>';})()+'</span>';
  var t=(SECS.filter(function(x){return x[0]===ui.sub;})[0]||SECS[0])[1],cal=ui.txv==='cal';
  /* İşlemler: liste ↔ takvim (4.4'e kadar Analiz › Takvim) */
  var tv='<button class="icon-btn" id="txv" data-act="tx-view" aria-pressed="'+cal+'" aria-label="'+(cal?'Liste görünümü':'Takvim görünümü')+'" title="'+(cal?'Liste':'Takvim')+'">'+ic(cal?'list':'cal')+'</button>';
  return '<h1 class="tt">'+esc(t)+'</h1><span class="hbtns">'+(ui.sub==='islem'?tv:'')+'</span>';
}
/* eski bölüm adları: Bütçe, Düzenli, Hedefler ve Koç Plan sekmesinin; Yatırımlar, Varlıklar, Borçlar Hesaplar sekmesinin alt sekmeleri */
/* 4.31: eski sekmeler: Hesaplar (servet) → Ana Sayfa'daki Hesaplar bölümü; Plan ve Analiz → Gelişim */
function mapSec(s){if(s==='portfoy'||s==='varlik')s='yatirim';if(WEALTH.some(function(x){return x[0]===s;})){ui.sv=s;return 'ev';}
  if(s==='servet'||s==='hesaplar')return 'ev';
  if(s==='takvim'){ui.txv='cal';return 'islem';}
  if(PLANS.some(function(x){return x[0]===s;})){ui.plan=s;ui.gl=s;return 'gelisim';}if(s==='planlama'||s==='plan'){ui.gl=PLANS.some(function(x){return x[0]===ui.plan;})?ui.plan:'butce';return 'gelisim';}
  if(ANS.some(function(x){return x[0]===s;})){ui.an=s;ui.gl=s;return 'gelisim';}if(s==='analiz'){ui.gl=ANS.some(function(x){return x[0]===ui.an;})?ui.an:'ozet';return 'gelisim';}
  if(s==='ayarlar')return 'ayar';
  return SECS.some(function(x){return x[0]===s;})?s:'ev';}
function restoreUi(){
  try{var u=JSON.parse(localStorage.getItem(UIKEY)||'{}');
    if(GEL.some(function(x){return x[0]===u.gl;}))ui.gl=u.gl;if(PLANS.some(function(x){return x[0]===u.plan;}))ui.plan=u.plan;if(WEALTH.some(function(x){return x[0]===u.sv;}))ui.sv=u.sv;else if(u.sv==='varlik')ui.sv='yatirim';if(ANS.some(function(x){return x[0]===u.an;}))ui.an=u.an;
    if(u.nv==='arch'||u.nv==='trash')ui.nv=u.nv;}catch(e){}
  var h=(location.hash||'').slice(1);
  var IH={'yeni-gider':'exp','yeni-gelir':'inc','yeni-transfer':'trf','yeni-ses':'exp'};if(IH[h])ui.intent=IH[h];
  ui.page=pageFromHash(h);if(h==='planlama'||h==='koc'){ui.sub='gelisim';ui.gl=h==='koc'?'koc':(ui.plan||'butce');}if(h==='koc')ui.plan='koc';
  if(ui.page&&ui.page.k==='ayar'){ui.page=null;ui.sub='ayar';}
  if(h&&!ui.page){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
}
/* adres çubuğundaki #… ile sayfa eşleşmesi (tarayıcı/telefon geri tuşu için) */
function pageFromHash(h){if(h==='fire')return {k:'fire'};if(h==='araclar')return {k:'araclar'};if(h==='piyasa')return {k:'piyasa'};if(h==='ayarlar')return {k:'ayar'};if(h==='notlar')return {k:'notlar'};if(/^ayar-[a-z]+$/.test(h)&&(SETS.some(function(x){return x.id===h.slice(5);})||SETMAP[h.slice(5)]))return {k:'set',s:SETMAP[h.slice(5)]||h.slice(5)};if(/^ayar-/.test(h))return {k:'ayar'};return null;}
var TABH={islemler:'islem',hesaplar:'ev',analiz:'gelisim',plan:'gelisim',gelisim:'gelisim',ayarlar:'ayar',anasayfa:'ev'};
function openPage(p,hash){closeSheet();if(ui.page&&ui.page!==p&&ui.page.k!==p.k){finishPage();p.prev=ui.page;}ui.page=p;try{if(hash)location.hash=hash;}catch(e){}render();window.scrollTo(0,0);}
function finishPage(){if(ui.page&&ui.page.k==='note')saveNote();}
function closePage(){finishPage();var p=ui.page;ui.page=(p&&p.prev)||null;render();try{if(location.hash.length>1)history.back();}catch(e){}}
function goSec(s){closeSheet();
  if(s==='notlar'){openPage({k:'notlar'},'notlar');return;}
  /* sayfadan sekmeye geçerken adresi yerinde temizle (history.back gecikmeli çalışıp sonraki sayfayı kapatmasın) */
  var from=ui.page?null:ui.sub,to=mapSec(s);if(ui.sub==='islem'&&to!=='islem')ui.tq='';
  if(ui.page){finishPage();ui.page=null;try{if(location.hash.length>1)history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  /* sekmeler arası geçişte her sekme kaldığı yerden açılır; aynı sekmeye yeniden dokununca başa döner */
  ui.scr=ui.scr||{};if(from)ui.scr[from]=window.scrollY||0;
  ui.sub=to;persistUi();render();window.scrollTo(0,from===to?0:(ui.scr[to]||0));}

/* ---------- alt pencereler (sheet) ---------- */
function openSheet(inner){document.getElementById('sheet-root').innerHTML='<div class="sheet-bg" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in">'+inner+'</div></div>';}
function closeSheet(){var r=document.getElementById('sheet-root');if(r)r.innerHTML='';}
function sheetOpen(){return !!document.getElementById('sheet-root').innerHTML;}
function opts(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}
function acctOpts(sel,none,skip){return (none?'<option value="">'+esc(none)+'</option>':'')+ACCS().filter(function(a){return a===sel||(!ax(a).arch&&!(skip&&skip(a)));}).map(function(a){return '<option value="'+esc(a)+'"'+(a===sel?' selected':'')+'>'+esc(a)+(ccyOf(a)!=='TRY'?' ('+CSYM[ccyOf(a)]+')':'')+'</option>';}).join('');}
function delBtn(act,id,label){return '<button class="btn danger" data-act="'+act+'" data-id="'+id+'">'+(label||'Sil')+'</button>';}
function armed(btn){if(btn.dataset.armed){return true;}btn.dataset.armed='1';btn.textContent='Emin misin? Tekrar dokun';return false;}
function ferr(m){var e=document.getElementById('f-err');if(e){e.textContent=m;e.style.color='var(--exp)';}}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function badName(n){return /^(__proto__|constructor|prototype)$/.test(n);}
var txType='exp',txOrig=null;
function lastSel(type,k,list){var l=S.last&&S.last[type];var v=l&&l[k];return list.indexOf(v)>=0?v:undefined;}
/* yeni işlemin hesabı: Ayarlar'daki sabit varsayılan; yoksa son kullanılan TL hesabı; dövizli hesap kendiliğinden seçilmez */
function defAcct(type){var acc=ACCS();if(acc.indexOf(S.defAcct)>=0)return S.defAcct;var l=lastSel(type,'acct',acc);if(l&&ccyOf(l)==='TRY')return l;
  var tl=acc.filter(function(a){return ccyOf(a)==='TRY';});return tl[0]||l||acc[0];}
function txSheet(id,force,pre){
  pre=pre||{};
  var t=id?byId(S.tx,id):null;
  if(t&&(t.type==='inv'||t.type==='dbt'||t.type==='adj'))return mvSheet(t);
  txOrig=t;txType=t?t.type:(force||'exp');ui.rcPend=null;ui.rcDel=false;rcFree();
  var acc=ACCS(),canTrf=acc.length>1;if(txType==='trf'&&!canTrf){toast('Transfer için en az iki hesap gerekli. Önce hesap ekle.');aSheet(null);return;}
  var cats=txType==='inc'?INCC():EXPC(),trf=txType==='trf';
  var a0=t?t.acct:(pre.acct&&acc.indexOf(pre.acct)>=0?pre.acct:defAcct(txType));
  var to0=(t&&t.to)||(pre.to&&acc.indexOf(pre.to)>=0&&pre.to!==a0?pre.to:acc.filter(function(a){return a!==a0;})[0]);
  openSheet('<h2>'+esc(t?'İşlemi düzenle':(pre.title||'Yeni işlem'))+'</h2><div class="seg" id="f-type"><button data-act="tx-type" data-v="exp" aria-pressed="'+(txType==='exp')+'">Gider</button><button data-act="tx-type" data-v="inc" aria-pressed="'+(txType==='inc')+'">Gelir</button>'+(canTrf?'<button data-act="tx-type" data-v="trf" aria-pressed="'+trf+'">Transfer</button>':'')+'</div>'+(!t&&!(pre.amt>0)?favRow('sheet'):'')
   +'<div class="field"><label for="f-amt" id="lb-amt">Tutar (₺)</label><input id="f-amt" class="amtin" inputmode="decimal" placeholder="0,00" value="'+(t?nv(t.amt):(pre.amt>0?nv(pre.amt):''))+'"></div>'
   +'<div class="field"><label for="f-note">Not</label><input id="f-note" list="note-dl" autocomplete="off" placeholder="İsteğe bağlı, örn. migros #tatil" value="'+esc(t?t.note:(pre.note||''))+'">'+noteDl(txType==='inc'?'inc':'exp')+'</div>'
   +'<div class="field" id="row-cat"'+(trf?' hidden':'')+'><span class="flbl">Kategori</span><select id="f-cat" hidden aria-hidden="true">'+(t&&!trf?optsKeep(cats,t.cat):opts(cats,pre.cat&&cats.indexOf(pre.cat)>=0?pre.cat:lastSel(txType,'cat',cats)))+'</select><div class="catchips" id="f-catchips" role="group" aria-label="Kategori"></div></div>'
   +'<div class="field" id="row-sub"'+(trf?' hidden':'')+'><span class="flbl">Alt kategori <span class="muted" style="font-weight:400">· isteğe bağlı</span></span><input type="hidden" id="f-sub" value="'+esc(t?(t.sub||''):(pre.sub||''))+'"><div class="catchips subchips" id="f-subchips" role="group" aria-label="Alt kategori"></div></div>'
   +'<div class="two"><div class="field"><label for="f-acct" id="lb-acct">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="f-acct">'+acctOpts(a0)+'</select></div><div class="field" id="row-to"'+(trf?'':' hidden')+'><label for="f-to">Giriş hesabı</label><select id="f-to">'+acctOpts(to0)+'</select></div></div>'
   +(t?'':'<div class="field" id="row-inst" hidden><label for="f-inst">Taksit</label><select id="f-inst"><option value="1">Tek çekim</option>'+[2,3,4,5,6,7,8,9,10,11,12].map(function(n){return '<option value="'+n+'">'+n+' taksit</option>';}).join('')+'</select><div class="small muted" style="margin-top:4px">Her ay bir taksit karta ve bütçeye yansır; kalanlar kendiliğinden işlenir.</div></div>')
   +'<div class="field" id="row-amt2" hidden><label for="f-amt2" id="lb-amt2">Giriş tutarı</label><input id="f-amt2" inputmode="decimal" placeholder="0,00"'+(t&&t.amt2?' data-manual="1"':'')+' value="'+(t&&t.amt2?nv(t.amt2):'')+'"></div>'
   +'<div class="field"><label for="f-date">Tarih</label><div class="datew"><input id="f-date" type="date" value="'+(t?t.date:(pre.date||todayS()))+'"><button class="chip" data-act="date-pick" data-v="0">Bugün</button><button class="chip" data-act="date-pick" data-v="1">Dün</button></div></div>'
   +txMore(t)+rcField(t)
   +'<div class="balprev" id="f-bal" aria-live="polite"></div><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-tx" data-id="'+(t?t.id:'')+'">Kaydet</button>'+(t&&(t.type==='exp'||t.type==='inc')?'<button class="btn ghost" data-act="split-tx" data-id="'+t.id+'">Böl (birden çok kategori)</button>':'')+(t?'<button class="btn ghost" data-act="dup-tx" data-id="'+t.id+'">Bugüne kopyala</button>'+delBtn('del-tx',t.id):''));
  catChips();dateChips();syncCcy();rcFill(t);
  if(!t)setTimeout(function(){var e=document.getElementById('f-amt');if(e)e.focus();},60);
}
/* kategoriler tek dokunuşla: en çok kullanılanlar önde; gizli seçim kutusuyla eşlenir */
function catOrder(type,list){var c={},from=new Date(today0());from.setDate(from.getDate()-120);var fs=isoDate(from);S.tx.forEach(function(t){if(t.type===type&&t.date>=fs)c[t.cat]=(c[t.cat]||0)+1;});
  return list.map(function(x,i){return [x,i];}).sort(function(a,b){return ((c[b[0]]||0)-(c[a[0]]||0))||a[1]-b[1];}).map(function(x){return x[0];});}
function catChips(){var sel=document.getElementById('f-cat'),box=document.getElementById('f-catchips');if(!sel||!box)return;
  var list=Array.prototype.map.call(sel.options,function(o){return o.value;}),ord=catOrder(txType,list);
  box.innerHTML=ord.map(function(c){return '<button class="chip" data-act="cat-pick" data-v="'+esc(c)+'" aria-pressed="'+(sel.value===c)+'">'+cic(c,'xs')+esc(c)+'</button>';}).join('')
   +'<button class="chip catnew" data-act="cat-new-in" aria-label="Yeni kategori ekle">'+ic('plus')+'Yeni</button>';subChips();}
/* alt kategori çipleri: seçili kategorinin alt kategorileri; seçiliye yeniden dokununca kalkar */
function subChips(){var sel=document.getElementById('f-cat'),box=document.getElementById('f-subchips'),inp=document.getElementById('f-sub'),row=document.getElementById('row-sub');if(!sel||!box||!inp)return;
  var c=sel.value,l=subsOf(c).slice();if(inp.value&&l.indexOf(inp.value)<0){if(txOrig&&txOrig.cat===c&&txOrig.sub===inp.value)l.push(inp.value);else inp.value='';}
  if(row)row.hidden=txType==='trf';
  box.innerHTML=l.map(function(x){return '<button class="chip" data-act="sub-pick" data-v="'+esc(x)+'" aria-pressed="'+(inp.value===x)+'">'+esc(x)+'</button>';}).join('')
   +'<button class="chip catnew" data-act="sub-new-in" aria-label="'+esc(c)+' için alt kategori ekle">'+ic('plus')+(l.length?'Yeni':'Alt kategori ekle')+'</button>';}
ACT['sub-pick']=function(el,id,v){var i=document.getElementById('f-sub');if(!i)return;i.value=i.value===v?'':v;subChips();};
ACT['sub-new-in']=function(){var box=document.getElementById('f-subchips'),c=box&&box.querySelector('.catnew');if(!c||document.getElementById('ns-in'))return;
  c.outerHTML='<span class="catin"><input id="ns-in" placeholder="Alt kategori adı" aria-label="Yeni alt kategori adı" maxlength="30" autocomplete="off"><button class="btn small" data-act="sub-new-ok">Ekle</button></span>';
  var i=document.getElementById('ns-in');if(i)i.focus();};
ACT['sub-new-ok']=function(){var i=document.getElementById('ns-in'),n=i?i.value.trim().replace(/\s+/g,' '):'',c=val('f-cat');if(!n||badName(n)||!c){if(i)i.focus();return;}
  S.subs[c]=subsOf(c);if(S.subs[c].indexOf(n)<0){S.subs[c].push(n);save();}var f=document.getElementById('f-sub');if(f)f.value=n;subChips();toast(c+' › '+n+' eklendi');};
/* işlem penceresinden yeni kategori: ayarlara gitmeden */
ACT['cat-new-in']=function(){var box=document.getElementById('f-catchips'),c=box&&box.querySelector('.catnew');if(!c||document.getElementById('nc-in'))return;
  c.outerHTML='<span class="catin"><input id="nc-in" placeholder="Kategori adı" aria-label="Yeni kategori adı" maxlength="30" autocomplete="off"><button class="btn small" data-act="cat-new-ok">Ekle</button></span>';
  var i=document.getElementById('nc-in');if(i)i.focus();};
ACT['cat-new-ok']=function(){var i=document.getElementById('nc-in'),n=i?i.value.trim():'',type=txType==='inc'?'inc':'exp';if(!n||badName(n)){if(i)i.focus();return;}
  if(S.cats[type].indexOf(n)<0){S.cats[type].push(n);save();}
  var sel=document.getElementById('f-cat');if(!sel)return;if(!Array.prototype.some.call(sel.options,function(o){return o.value===n;}))sel.insertAdjacentHTML('beforeend','<option>'+esc(n)+'</option>');
  sel.value=n;sel.dataset.manual='1';catChips();toast(n+' kategorisi eklendi');};
function syncCatChips(){var sel=document.getElementById('f-cat');if(!sel)return;subChips();document.querySelectorAll('#f-catchips .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===sel.value));});}
function dateChips(){var d=val('f-date'),t0=todayS(),y=new Date(today0());y.setDate(y.getDate()-1);var ys=isoDate(y);document.querySelectorAll('[data-act="date-pick"]').forEach(function(b){b.setAttribute('aria-pressed',String((b.dataset.v==='0'&&d===t0)||(b.dataset.v==='1'&&d===ys)));});}
/* işlem penceresinde bakiye önizlemesi: kaydedince hesabın ne olacağı anında görünür */
function balPreview(){
  var box=document.getElementById('f-bal');if(!box)return;
  var a=val('f-acct'),to=val('f-to'),amt=r2(num(val('f-amt'))),a2=r2(num(val('f-amt2')));
  var nt={type:txType,amt:amt,acct:a};if(txType==='trf'){nt.to=to;if(!document.getElementById('row-amt2').hidden)nt.amt2=a2;}
  var line=function(acc){var cur=acctBal(acc);if(txOrig)cur=r2(cur-txDelta(txOrig,acc));var nw=r2(cur+(amt>0?txDelta(nt,acc):0));
    return '<div><span class="muted">'+esc(acc)+':</span> <span class="num">'+moneyIn(cur,acc)+'</span>'+(amt>0&&nw!==cur?' → <b class="num '+(nw<cur?'exp':'inc')+'">'+moneyIn(nw,acc)+'</b>':'')+'</div>';};
  var m=maskOn;maskOn=false;try{box.innerHTML=line(a)+(txType==='trf'&&to&&to!==a?line(to):'');}finally{maskOn=m;}
}
function syncCcy(){
  var a=document.getElementById('f-acct'),lb=document.getElementById('lb-amt');if(!a||!lb)return;
  var c=ccyOf(a.value),ai=document.getElementById('f-amt');lb.textContent='Tutar ('+CSYM[c]+')';
  /* dövizli hesap belirgin: TL alışkanlığıyla yanlış birimde tutar girilmesin */
  if(c!=='TRY'){var bx=document.createElement('span');bx.className='ccyb';bx.textContent=(CCYN[c]||c)+' · '+a.value;lb.appendChild(document.createTextNode(' '));lb.appendChild(bx);}
  if(ai)ai.classList.toggle('fxamt',c!=='TRY');
  var ri=document.getElementById('row-inst');if(ri)ri.hidden=!(txType==='exp'&&acctType(a.value)==='kart');
  var row=document.getElementById('row-amt2'),to=document.getElementById('f-to');
  var cross=txType==='trf'&&to&&ccyOf(to.value)!==c;
  if(row){row.hidden=!cross;if(cross){document.getElementById('lb-amt2').textContent='Giriş tutarı ('+CSYM[ccyOf(to.value)]+')';var i2=document.getElementById('f-amt2'),v1=num(val('f-amt'));if(i2&&!i2.dataset.manual&&v1>0&&rateOf(c)>0&&rateOf(ccyOf(to.value))>0)i2.value=nv(r2(v1*rateOf(c)/rateOf(ccyOf(to.value))));}}
  balPreview();
}
/* borç, yatırım ve düzeltme hareketleri için sade düzenleme penceresi */
function mvSheet(t){
  txOrig=t;txType=t.type;
  var info=t.type==='inv'?'Varlığın adedi ve maliyeti Hesaplar › Yatırımlar’dan değişir; burada yalnızca hesaba yansıyan tutar düzenlenir.':(t.type==='dbt'?(t.side==='out'?'Bu ödeme borcun kalan tutarından düşülür.':'Borç olarak alınan para hesaba eklenmiştir.'):'Hesap bakiyesini gerçek bakiyeyle eşitlemek için eklenen düzeltme. Artı ya da eksi olabilir.');
  openSheet('<h2>'+esc(mvLabel(t))+'</h2><p class="small muted" style="margin:0">'+esc(info)+'</p>'
   +'<div class="two"><div class="field"><label for="m-amt">Tutar ('+CSYM[ccyOf(t.acct)]+')</label><input id="m-amt" inputmode="decimal" value="'+nv(t.amt)+'"></div><div class="field"><label for="m-acct">Hesap</label><select id="m-acct">'+acctOpts(t.acct)+'</select></div></div>'
   +'<div class="two"><div class="field"><label for="m-date">Tarih</label><input id="m-date" type="date" value="'+t.date+'"></div><div class="field"><label for="m-note">Not</label><input id="m-note" value="'+esc(t.note||'')+'" placeholder="İsteğe bağlı"></div></div>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-mv" data-id="'+t.id+'">Kaydet</button>'+delBtn('del-tx',t.id));
}
/* bir kategorinin bu dönemdeki işlemleri (grafik, bütçe ve kategori satırından açılır) */
function catSheet(c){
  var k=ui.month,l=monthTx(k).filter(function(t){return t.type==='exp'&&t.cat===c||t.type==='inc'&&t.cat===c;}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var tot=r2(l.reduce(function(a,t){return a+(t.type==='exp'?txTL(t):0);},0)),inc=r2(l.reduce(function(a,t){return a+(t.type==='inc'?txTL(t):0);},0)),avg=catAvg(k)[c]||0,lim=+S.budgets[c]||0;
  var info=[];if(avg>0)info.push('3 dönem ort. '+TRY0.format(avg));if(lim>0)info.push('limit '+TRY0.format(lim)+(tot>lim?' · '+TRY0.format(tot-lim)+' aşıldı':' · '+TRY0.format(lim-tot)+' kaldı'));
  /* 4.21: son 6 dönemin eğilimi (seçili dönem vurgulu) */
  var isInc=!tot&&inc>0,tr=[],trH='';for(var ti=5;ti>=0;ti--){var pk6=addMonth(k,-ti),sv=0;monthTx(pk6).forEach(function(t){if(t.cat===c&&t.type===(isInc?'inc':'exp'))sv+=txTL(t);});tr.push([pk6,sv]);}
  var trMax=Math.max.apply(null,tr.map(function(x){return x[1];}));
  if(tr.filter(function(x){return x[1]>0;}).length>=2)trH='<div class="lbl" style="margin-top:4px">Son 6 dönem</div><div class="ctrend" role="img" aria-label="Son 6 dönem '+esc(c)+'">'+tr.map(function(x){var hh=trMax>0?Math.max(x[1]/trMax*100,x[1]>0?4:0):0;return '<div class="cb'+(x[0]===k?' on':'')+'"><span class="small num">'+(x[1]>0?compactT(x[1]).replace('₺',''):'')+'</span><i style="height:'+hh.toFixed(0)+'%;background:'+color(c)+'"></i><span class="small muted">'+esc(mlabel(x[0],true))+'</span></div>';}).join('')+'</div>';
  /* alt kategori kırılımı: alt kategorisi olan işlem varsa çubuklarla */
  var bySub={},subH='';l.forEach(function(t){var x=t.sub||'';bySub[x]=(bySub[x]||0)+txTL(t);});var sk=Object.keys(bySub);
  if(sk.length>1||(sk.length===1&&sk[0])){var st=sk.reduce(function(a,x){return a+bySub[x];},0);subH='<div class="subbrk">'+sk.sort(function(a,b){return bySub[b]-bySub[a];}).map(function(x){var p=st>0?bySub[x]/st*100:0;return '<div class="sb"><div class="sbt"><span class="ell">'+esc(x||'Alt kategorisiz')+'</span><span class="num">'+TRY0.format(bySub[x])+' · %'+Math.round(p)+'</span></div><div class="bar"><i style="width:'+p.toFixed(1)+'%;background:'+color(c)+'"></i></div></div>';}).join('')+'</div>';}
  openSheet('<div class="ghead">'+cic(c,'lg')+'<h2 style="margin:0;flex:1">'+esc(c)+'</h2></div><div><div class="lbl">'+esc(plabel(k))+'</div><p class="big" style="margin:0">'+TRY0.format(tot||inc)+'</p>'+(info.length?'<div class="small muted">'+esc(info.join(' · '))+'</div>':'')+'</div>'+trH+subH
   +(l.length?'<div class="list">'+l.map(txRow).join('')+'</div>':'<div class="small muted">Bu dönemde bu kategoride işlem yok.</div>')
   +'<button class="btn ghost" data-act="cat-new" data-v="'+esc(c)+'">Bu kategoriye ekle</button>');
}
function grpAccts(kind){return ACCS().filter(function(a){return acctType(a)===kind;});}
/* hesap detayı: bakiye, son hareketler ve hızlı işlemler */
function acctSheet(a){
  if(ACCS().indexOf(a)<0)return;
  var b=acctBal(a),t=acctType(a),c=ccyOf(a),x=ax(a),recent=S.tx.filter(function(q){return q.acct===a||q.to===a;}).sort(function(p,q){return q.date.localeCompare(p.date);}).slice(0,6);
  var extra=[],cs=null;if(c!=='TRY'&&rateOf(c)>0)extra.push('≈ '+TRY0.format(toTL(b,a)));if(t==='kart'){if(+x.limit>0)extra.push('Limit '+moneyIn(+x.limit,a,1)+' · kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)extra.push('Son ödeme günü: ayın '+x.due+sfx(x.due));cs=cardStmt(a);}if(aRate(a)){var ai=aIntNow(a);extra.push('Yıllık %'+NUM2.format(aRate(a))+' faiz · bu ay ≈ '+moneyIn(ai,a)+' birikti (ay sonunda işlenir)');}
  var ab=function(act,icn,lb){return '<button data-act="'+act+'" data-id="'+esc(a)+'"><span class="c" style="--c:var(--accent)">'+ic(icn)+'</span><span class="t">'+lb+'</span></button>';};
  openSheet('<div class="ghead"><span class="sic" style="--c:'+color(a)+'">'+ic(t==='nakit'?'cash':(t==='kart'?'card':(t==='birikim'?'coins':'bank')))+'</span><span class="mid"><h2 style="margin:0">'+esc(a)+'</h2><div class="small muted">'+esc(typeName(t)+(c!=='TRY'?' · '+CCYN[c]:''))+'</div></span><button class="icon-btn" data-act="edit-a" data-id="'+esc(a)+'" aria-label="Hesabı düzenle">'+ic('gear')+'</button></div>'
   +'<div><div class="lbl">'+(t==='kart'&&b<0?'Kart borcu':'Bakiye')+'</div><p class="big'+(b<0?' exp':'')+'" style="margin:0">'+moneyIn(t==='kart'&&b<0?-b:b,a)+'</p>'+(extra.length?'<div class="small muted">'+esc(extra.join(' · '))+'</div>':'')+(t==='kart'&&cs?'<div class="stmt"><div><span class="small muted">'+(cs.first?'Açılıştaki borç':'Ekstre ('+esc(pdate(cs.cut).toLocaleDateString('tr-TR',{day:'numeric',month:'short'}))+')')+'</span><b class="'+(cs.left>0?'exp':'')+'">'+moneyIn(cs.left,a,1)+'</b>'+(cs.left<cs.stmt?'<span class="small muted">'+moneyIn(cs.stmt,a,1)+' ekstrenin kalanı</span>':'')+'</div><div><span class="small muted">Son ödeme</span><b>'+(cs.due?esc(pdate(cs.due).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})):'—')+'</b></div><div><span class="small muted">Sonraki ekstreye</span><b>'+moneyIn(cs.since,a,1)+'</b></div><div><span class="small muted">Asgari ödeme</span><b>'+moneyIn(r2(cs.left*((+x.limit>0&&+x.limit>FACTS.minpay.lim)?FACTS.minpay.hi:FACTS.minpay.lo)/100),a,1)+'</b></div></div>':'')+'</div>'
   +'<div class="qa grid4">'+ab('acct-exp','exp','Harcama')+ab('acct-inc','inc','Gelir')+ab('acct-trf','swap',t==='kart'?'Borç öde':'Transfer')+ab('acct-rec','scale','Bakiye eşitle')+'</div>'
   +'<div><div class="lbl" style="margin-bottom:2px">Son hareketler</div>'+(recent.length?'<div class="list">'+recent.map(txRow).join('')+'</div>':'<div class="small muted" style="padding:8px 0">Henüz hareket yok.</div>')+'</div>'
   +(recent.length?'<button class="btn ghost" data-act="acct-all" data-id="'+esc(a)+'">Tüm hareketleri göster</button>':''));
}
function grpSheet(kind){
  var l=grpAccts(kind),title=kind==='nakit'?'Cüzdanım':'Banka hesapları';
  if(l.length===1)return acctSheet(l[0]);
  if(!l.length)return aSheet(null,kind);
  var tot=r2(l.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
  openSheet('<h2>'+title+'</h2><div><div class="lbl">Toplam</div><p class="big" style="margin:0">'+TRY0.format(tot)+'</p></div><div class="list">'+l.map(acctLine).join('')+'</div><button class="btn ghost" data-act="new-a" data-v="'+kind+'">'+(kind==='nakit'?'Nakit cüzdanı ekle':'Banka hesabı ekle')+'</button>');
}
/* gerçek bakiye girilince fark işlem olarak eklenir */
function recSheet(a){
  var b=acctBal(a),t=acctType(a);
  openSheet('<h2>Bakiyeyi eşitle · '+esc(a)+'</h2><p class="small muted" style="margin:0">'+(t==='nakit'?'Cüzdanındaki parayı say ve gir.':'Bankadaki ya da ekstredeki güncel bakiyeyi gir.')+(t==='kart'?' Kartta borç varsa eksi yaz (örn. -2500).':'')+'</p>'
   +'<div class="field"><label for="rc-amt">Gerçek bakiye ('+CSYM[ccyOf(a)]+')</label><input id="rc-amt" inputmode="decimal" value="'+nv(b)+'"></div><div class="small muted">Wallet’taki bakiye: <span class="num">'+moneyIn(b,a)+'</span></div><div class="balprev" id="rc-diff"></div>'
   +'<button class="row-tgl" id="rc-mode" data-act="rc-mode" role="switch" aria-checked="false"><span class="mid"><div class="t">Farkı gelir/gider olarak kaydet</div><div class="small muted">Kapalıyken (önerilen) yalnızca bakiye düzeltilir; fark gelir-gider raporlarına ve bütçeye girmez</div></span><span class="sw"></span></button>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="rc-save" data-id="'+esc(a)+'">Eşitle</button>');
}
function debtListSheet(){
  if(!S.debts.length)return dSheet(null);
  var tot=debtManual(),cd=wealth().g.cardDebt;
  openSheet('<h2>Borçlarım</h2><div><div class="lbl">Kalan borç</div><p class="big exp" style="margin:0">'+TRY0.format(tot+cd)+'</p>'+(cd>0?'<div class="small muted">Kredi kartı borçları '+TRY0.format(cd)+' dahil</div>':'')+'</div><div class="list">'+S.debts.map(function(d){var l=debtLeft(d);return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="small muted">'+esc(d.type)+'</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div><button class="btn" data-act="new-d">Borç ekle</button><p class="small muted" style="margin:0">Ödeme yapmak için borca dokun.</p>');
}
function dSheet(id){
  var d=id?byId(S.debts,id):null,left=d?debtLeft(d):0,paid=d?debtPaid(d):0;
  /* faiz oranı biliniyorsa bir taksidin önerilen bölünmesi */
  var rc0=d&&S.recurring.filter(function(r){return r.debt===d.id;})[0],P0=d?(rc0?toTL(+rc0.amt||0,rc0.acct):loanPmt(d,+d.n)):0,sp0=d&&+d.rate>0&&P0>0?loanSplit(d,P0):null;
  var pay=d&&left>0?'<div class="card stack" style="gap:10px;background:var(--bg)"><h2 style="margin:0">Ödeme yap</h2><div class="two"><div class="field"><label for="dp-amt">Anapara (₺)</label><input id="dp-amt" inputmode="decimal" placeholder="'+(sp0?'≈ '+NUM2.format(sp0.p):'Örn. '+nv(Math.min(left,5000)))+'"></div><div class="field"><label for="dp-int">Faiz ve masraf (₺)</label><input id="dp-int" inputmode="decimal" placeholder="'+(sp0?'≈ '+NUM2.format(sp0.i):'Varsa')+'"></div></div><div class="two"><div class="field"><label for="dp-acct">Ödeme hesabı</label><select id="dp-acct">'+acctOpts(grpAccts('banka')[0]||defAcct('exp'))+'</select></div><div class="field"><label for="dp-date">Tarih</label><input id="dp-date" type="date" value="'+todayS()+'"></div></div><div class="err" id="f-err2"></div><button class="btn" data-act="pay-d" data-id="'+d.id+'">Ödemeyi kaydet</button><p class="small muted" style="margin:0">Anapara borçtan düşer; faiz ve masraf gider olarak kaydedilir. İkisi de hesabından çıkar.</p></div>':'';
  openSheet('<h2>'+(d?'Borç: '+esc(d.name):'Borç ekle')+'</h2>'+(d?'<div class="row3" style="margin:0"><div><div class="lbl">Toplam</div><span class="num">'+TRY0.format(d.amt)+'</span></div><div><div class="lbl">Ödenen</div><span class="num inc">'+TRY0.format(paid)+'</span></div><div><div class="lbl">Kalan</div><span class="num exp">'+TRY0.format(left)+'</span></div></div><div class="bar"><i style="width:'+(d.amt>0?clamp(paid/d.amt*100,0,100):0)+'%"></i></div>':'')+pay
   +'<div class="field"><label for="d-name">Ad</label><input id="d-name" placeholder="Örn. Taşıt kredisi" value="'+esc(d?d.name:'')+'"></div><div class="two"><div class="field"><label for="d-type">Tür</label><select id="d-type">'+optsKeep(DTYPES,d&&d.type)+'</select></div><div class="field"><label for="d-amt">'+(d?'Toplam borç (₺)':'Kalan borç (₺)')+'</label><input id="d-amt" inputmode="decimal" value="'+(d?nv(d.amt):'')+'"></div></div>'
   +'<div class="field"><label for="d-rate">Aylık faiz oranı (%)</label><input id="d-rate" inputmode="decimal" placeholder="İsteğe bağlı, örn. 3,5" value="'+(d&&+d.rate>0?nv(d.rate):'')+'"><div class="small muted" style="margin-top:4px">Koç, hangi borcu önce kapatman gerektiğini buna göre hesaplar. Sözleşmedeki aylık akdi faizi yaz.</div></div>'
   +'<div class="two"><div class="field"><label for="d-n">Kalan vade (ay)</label><input id="d-n" inputmode="numeric" maxlength="3" placeholder="İsteğe bağlı" value="'+(d&&+d.n>0?d.n:'')+'"></div><div class="field"><label for="d-tax">KKDF + BSMV (%)</label><input id="d-tax" inputmode="decimal" placeholder="'+(d&&d.type!=='Kredi'?'0':'30')+'" value="'+(d&&d.tax!=null&&d.tax!==''?nv(d.tax):'')+'"></div></div>'
   +(d?loanPlanHtml(d):'')
   +(d?'':'<div class="field"><label for="d-acct">Para bir hesaba girdi mi?</label><select id="d-acct">'+acctOpts('', 'Hayır, eski borç')+'</select></div><p class="small muted" style="margin:0">Yeni çektiğin kredi ya da aldığın borç para bir hesaba yattıysa seç: o hesabın bakiyesi artar, net servetin değişmez.</p>')
   +'<div class="err" id="f-err"></div><button class="btn'+(d?' ghost':'')+'" data-act="save-d" data-id="'+(d?d.id:'')+'">'+(d?'Bilgileri kaydet':'Kaydet')+'</button>'+(d?delBtn('del-d',d.id,'Borcu sil'):''));
}
function hSheet(id,kind,pre){
  var x=id?byId(S.holdings,id):null;kind=x?hKind(x):(kind==='asset'?'asset':'inv');pre=pre||{};
  if(kind==='asset'){
    openSheet('<h2>'+(x?'Varlığı düzenle':'Varlık ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Ev, araba" value="'+esc(x?x.name:'')+'"></div>'
     +'<div class="two"><div class="field"><label for="h-type">Tür</label><select id="h-type">'+optsKeep(ASTT,x&&x.type)+'</select></div><div class="field"><label for="h-price">Güncel değer (₺)</label><input id="h-price" inputmode="decimal" value="'+(x?nv(x.price):'')+'"></div></div>'
     +'<div class="field"><label for="h-cost">Alış değeri (₺)</label><input id="h-cost" inputmode="decimal" placeholder="Bilmiyorsan boş bırak" value="'+(x&&x.cost!==x.price?nv(x.cost):'')+'"></div>'
     +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div>')
     +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="asset">Kaydet</button>'+(x?'<button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button>'+delBtn('del-h',x.id):''));
    return;
  }
  var mkk=x?x.mk:pre.mk,cc0=x?x.ccy:(pre.ccy||''),mkp=mkk?mTL(mkk):0;
  var co='<option value=""'+(cc0||mkk?'':' selected')+'>Elle girilen fiyat</option>'+(mkk?'<option value="mk:'+esc(mkk)+'" selected>Piyasa: '+esc((x&&x.mks)||mSym(mkk))+'</option>':'')+FXK.map(function(k){return '<option value="'+k+'"'+(!mkk&&cc0===k?' selected':'')+'>'+FXL[k]+' kuru</option>';}).join('');
  openSheet('<h2>'+(x?'Yatırımı düzenle':'Yatırım ekle')+'</h2><div class="field"><label for="h-name">Ad</label><input id="h-name" placeholder="Örn. Gram altın, THYAO" value="'+esc(x?x.name:(pre.name||''))+'"></div>'
   +'<div class="two"><div class="field"><label for="h-type">Tür</label><select id="h-type">'+optsKeep(INVT,x?x.type:pre.type)+'</select></div><div class="field"><label for="h-ccy">Fiyat kaynağı</label><select id="h-ccy">'+co+'</select></div></div>'
   +(mkk&&mkp>0?'<div class="small muted" id="h-mkp">Güncel piyasa fiyatı: <b class="num">'+TRY2.format(mkp)+'</b></div>':'')
   +'<div class="two"><div class="field"><label for="h-qty" id="lb-hqty">Adet / miktar</label><input id="h-qty" inputmode="decimal" value="'+(x?nv(x.qty):'')+'"></div><div class="field"><label for="h-cost">Ortalama maliyet (₺)</label><input id="h-cost" inputmode="decimal" placeholder="'+(mkp>0?'Boşsa güncel fiyat':'')+'" value="'+(x?nv(x.cost):'')+'"></div></div>'
   +'<div class="field" id="row-hprice"><label for="h-price">Güncel fiyat (₺)</label><input id="h-price" inputmode="decimal" placeholder="Boş bırakırsan maliyet kullanılır" value="'+(x?nv(x.price):'')+'"></div>'
   +yFields(x,x?x.type:pre.type)
   +(x&&!x.mk?'<button class="btn ghost small" data-act="m-linkmode" data-id="'+x.id+'">'+ic('pulse')+' Fiyatı piyasadan al (hisse, fon, kripto…)</button>':'')
   +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div><p class="small muted" style="margin:0" id="h-hint"></p>'+(mkk?'':'<p class="small muted" style="margin:0">Hisse, fon ya da kripto fiyatının kendiliğinden güncellenmesi için <button class="pill linkp" data-act="open-mkt">Piyasalar’da ara</button> ve oradan ekle.</p>'))
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="inv">Kaydet</button>'+(x?'<div class="two"><button class="btn ghost" data-act="h-buy" data-id="'+x.id+'">Al</button><button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></div>'+delBtn('del-h',x.id):''));
  syncH();
}
function autoSrc(){var t=val('h-type'),s=document.getElementById('h-ccy');if(!s||(s.value&&s.value.indexOf('mk:')!==0&&s.dataset.auto!=='1'))return;if(s.value.indexOf('mk:')===0)return;
  var n=fold(val('h-name')),c='';if(t==='Altın')c=/ceyrek/.test(n)?'CEY':'XAU';else if(t==='Gümüş')c='XAG';else if(t==='Döviz')c=/euro|eur\b|avro/.test(n)?'EUR':(/sterlin|gbp|pound/.test(n)?'GBP':(/frank|chf/.test(n)?'CHF':'USD'));
  if(c){s.value=c;s.dataset.auto='1';syncH();}else if(s.dataset.auto==='1'){s.value='';delete s.dataset.auto;syncH();}}
function syncH(){ySync();var c=val('h-ccy'),r=document.getElementById('row-hprice'),q=document.getElementById('lb-hqty'),mp=document.getElementById('h-mkp');if(r)r.hidden=!!c;if(mp)mp.hidden=c.indexOf('mk:')!==0;if(q)q.textContent=({XAU:'Miktar (gram)',XAG:'Miktar (gram)',CEY:'Adet',USD:'Miktar ($)',EUR:'Miktar (€)',GBP:'Miktar (£)',CHF:'Miktar (CHF)'})[c]||'Adet / miktar';
  var hh=document.getElementById('h-hint');if(hh){var qn=num(val('h-qty')),cs=num(val('h-cost'));hh.textContent=val('h-acct')&&qn>0&&cs>0?'Seçtiğin hesaptan '+TRY2.format(qn*cs)+' düşülecek.':'';}}
function tradeSheet(id,side){
  var x=byId(S.holdings,id);if(!x)return;var ast=hKind(x)==='asset',p=side==='buy'&&x.ccy&&!x.mk&&rateOf(x.ccy)>0?rateOf(x.ccy):hPrice(x),ta=ACCS().filter(function(a){return !ax(a).arch&&acctType(a)!=='kart'&&ccyOf(a)==='TRY';}),ta0=ta.filter(function(a){return acctType(a)==='banka';})[0]||ta[0]||defAcct('exp');
  openSheet('<h2>'+esc(x.name)+' · '+(side==='buy'?'Al':'Sat')+'</h2><div class="small muted">Elindeki: '+(ast?'1 adet':qtyTxt(x))+' · ort. maliyet '+TRY2.format(x.cost)+' · güncel '+TRY2.format(p)+'</div>'
   +'<div class="two">'+(ast?'':'<div class="field"><label for="tr-qty">Miktar</label><input id="tr-qty" inputmode="decimal" value="'+(side==='sell'?nv(x.qty):'')+'"></div>')+'<div class="field"><label for="tr-price">'+(ast?'Satış tutarı (₺)':'Birim fiyat (₺)')+'</label><input id="tr-price" inputmode="decimal" value="'+nv(r2(p))+'"></div>'+(ast?'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>':'')+'</div>'
   +'<div class="two"><div class="field"><label for="tr-acct">'+(side==='buy'?'Ödeme hesabı':'Paranın gireceği hesap')+'</label><select id="tr-acct">'+acctOpts(ta0,'Hesaba yansıtma')+'</select></div>'+(ast?'':'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>')+'</div>'
   +(ast?'':'<div class="field"><label for="tr-fee">Komisyon ve masraf (₺)</label><input id="tr-fee" inputmode="decimal" placeholder="Varsa, örn. 12,50"></div>')
   +'<div class="balprev" id="tr-prev"></div><div class="err" id="f-err"></div><button class="btn" data-act="trade" data-id="'+x.id+'" data-v="'+side+'">'+(side==='buy'?'Alımı kaydet':'Satışı kaydet')+'</button>');
  tradePrev();
}
function tradePrev(){var box=document.getElementById('tr-prev');if(!box)return;var btn=document.querySelector('[data-act="trade"]'),x=btn&&byId(S.holdings,btn.dataset.id);if(!x)return;
  var ast=hKind(x)==='asset',q=ast?1:num(val('tr-qty')),p=num(val('tr-price')),f=Math.max(num(val('tr-fee')),0),side=btn.dataset.v;if(!(q>0&&p>0)){box.textContent='';return;}
  var m=maskOn;maskOn=false;try{var pl=(p-x.cost)*q-f;box.innerHTML=(side==='sell'?'Hesaba girecek':'Hesaptan çıkacak')+': <b class="num">'+TRY2.format(side==='sell'?q*p-f:q*p+f)+'</b>'+(side==='sell'?' · Kâr/zarar: <b class="num '+(pl>=0?'inc':'exp')+'">'+sgn(pl)+'</b>':' · Yeni ort. maliyet: <b class="num">'+TRY2.format((x.qty*x.cost+q*p+f)/(x.qty+q))+'</b>');}finally{maskOn=m;}}
function gSheet(id,pre){
  var g=id?byId(S.goals,id):null,ae=avgMonthly('exp'),em=g?isEm(g):!!(pre&&pre.em),nm=g?g.name:(em?'Acil durum fonu':''),tg=g?nv(g.target):(em&&ae>0?nv(Math.ceil(ae*6/1000)*1000):'');
  openSheet('<h2>'+(g?'Hedefi düzenle':'Yeni hedef')+'</h2><div class="field"><label for="g-name">Ad</label><input id="g-name" placeholder="Örn. Yaz tatili" value="'+esc(nm)+'"></div><div class="two"><div class="field"><label for="g-target">Hedef tutar (₺)</label><input id="g-target" inputmode="decimal" value="'+tg+'"></div><div class="field" id="row-gsaved"><label for="g-saved">Biriken (₺)</label><input id="g-saved" inputmode="decimal" value="'+(g?nv(g.saved||0):'0')+'"></div></div>'
   +'<div class="two"><div class="field"><label for="g-acct">Bağlı hesap</label><select id="g-acct">'+acctOpts(g?g.acct||'':'','Yok, elle takip et',function(a){return acctType(a)==='kart';})+'</select></div><div class="field"><label for="g-date">Hedef tarih</label><input id="g-date" type="date" value="'+(g&&g.date?g.date:'')+'"></div></div><label class="chk"><input type="checkbox" id="g-em"'+(em?' checked':'')+'> Bu benim acil durum fonum</label>'+(ae>0?'<p class="small muted" style="margin:0">Acil durum fonu için önerilen: 6 aylık gider, yaklaşık '+TRY0.format(ae*6)+'. Finansal sağlıktaki gösterge bu hedefin birikimini kullanır.</p>':'')+'<p class="small muted" style="margin:0">Bir birikim hesabı bağlarsan biriken tutar o hesabın bakiyesinden gelir; para eklemek hesaplar arası transfer olur.</p><div class="err" id="f-err"></div><button class="btn" data-act="save-g" data-id="'+(g?g.id:'')+'">Kaydet</button>'+(g?delBtn('del-g',g.id):''));
  syncG();
}
function syncG(){var r=document.getElementById('row-gsaved');if(r)r.hidden=!!val('g-acct');}
function gaddSheet(id){
  var g=byId(S.goals,id);if(!g)return;var linked=g.acct&&ACCS().indexOf(g.acct)>=0;
  openSheet('<h2>'+esc(g.name)+' · para ekle</h2><div class="small muted">Biriken '+TRY0.format(goalSaved(g))+' / '+TRY0.format(g.target)+'</div><div class="field"><label for="ga-amt">Tutar (₺)</label><input id="ga-amt" inputmode="decimal" placeholder="0,00"></div>'
   +(linked?'<div class="field"><label for="ga-from">Hangi hesaptan</label><select id="ga-from">'+acctOpts(ACCS().filter(function(a){return a!==g.acct&&!ax(a).arch;})[0],null,function(a){return a===g.acct;})+'</select></div><p class="small muted" style="margin:0">'+esc(g.acct)+' hesabına transfer yapılır.</p>':'<p class="small muted" style="margin:0">Bu hedef elle takip ediliyor; hesap bakiyeleri değişmez. Bir birikim hesabına bağlamak için hedefi düzenle.</p>')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="ga-save" data-id="'+g.id+'">Ekle</button>');
  setTimeout(function(){var e=document.getElementById('ga-amt');if(e)e.focus();},60);
}
function birSheet(){
  var sa=grpAccts('birikim'),tot=r2(sa.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
  if(!S.goals.length&&!sa.length)return gSheet(null);
  openSheet('<h2>Birikim</h2>'+(sa.length?'<div><div class="lbl">Birikim hesaplarında</div><p class="big" style="margin:0">'+TRY0.format(tot)+'</p></div><div class="list">'+sa.map(acctLine).join('')+'</div>':'')
   +(S.goals.length?'<div class="lbl">Hedefler</div><div class="list">'+S.goals.map(function(g){var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;return '<div class="item"><button class="mid plain" data-act="edit-g" data-id="'+g.id+'" aria-label="'+esc(g.name)+' hedefini düzenle ya da sil"><div class="t">'+esc(g.name)+(isEm(g)?' <span class="small muted">· acil durum fonu</span>':'')+'</div><div class="bar" style="margin:6px 0 2px"><i style="width:'+p+'%"></i></div><div class="small muted num">'+TRY0.format(s)+' / '+TRY0.format(g.target)+' · düzenle</div></button><button class="btn small ghost" data-act="goal-add" data-id="'+g.id+'">Ekle</button></div>';}).join('')+'</div>':'')
   +'<div class="two"><button class="btn" data-act="new-g">Yeni hedef</button><button class="btn ghost" data-act="new-a" data-v="birikim">Birikim hesabı</button></div>');
}
/* kredi ödeme planı: bağlı taksit (ya da vadeden hesaplanan taksit) ile ay ay faiz, anapara, kalan */
function loanPlanHtml(d){if(!(+d.rate>0)||!(debtLeft(d)>0))return '';
  var rc=S.recurring.filter(function(r){return r.debt===d.id;})[0],P=rc?toTL(+rc.amt||0,rc.acct):loanPmt(d,+d.n);if(!(P>0))return '<p class="small muted" style="margin:0">Kalan vadeyi yazarsan aylık taksit ve ödeme planı hesaplanır.</p>';
  var pl=loanPlan(d,P);if(pl.never)return '<p class="small exp" style="margin:0">'+TRY0.format(P)+' taksit bu borcun aylık faizini bile karşılamıyor; borç azalmaz.</p>';
  var ti=pl.reduce(function(a,x){return a+x.i;},0),end=new Date();end.setMonth(end.getMonth()+pl.length);
  return '<details class="card" style="background:var(--bg)"><summary><b>Ödeme planı</b><span class="small muted"> · '+pl.length+' taksit · '+TRY0.format(P)+'</span></summary>'
   +'<div class="small" style="margin:8px 0">Kalan toplam faiz ve vergi ≈ <b>'+TRY0.format(ti)+'</b> · son taksit ≈ '+esc(end.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}))+'</div>'
   +'<div class="tblw"><table class="tbl"><thead><tr><th>#</th><th>Faiz+vergi</th><th>Anapara</th><th>Kalan</th></tr></thead><tbody>'+pl.slice(0,12).map(function(x){return '<tr><td>'+x.n+'</td><td class="num">'+TRY0.format(x.i)+'</td><td class="num">'+TRY0.format(x.p)+'</td><td class="num">'+TRY0.format(x.left)+'</td></tr>';}).join('')+'</tbody></table></div>'
   +(pl.length>12?'<div class="small muted">İlk 12 taksit gösteriliyor.</div>':'')
   +(rc?'<div class="small muted" style="margin-top:6px">“'+esc(rc.name)+'” ödendi işaretlenince taksit bu plana göre anapara ve faiz+vergi olarak ayrılır.</div>':'<button class="btn small" style="margin-top:8px" data-act="loan-rec" data-id="'+d.id+'">Taksiti düzenli ödeme olarak ekle</button>')+'</details>';}
function rSheet(id){
  var r=id?byId(S.recurring,id):null,a0=r?r.acct:defAcct('exp'),inc=!!(r&&r.inc),wk=r&&isWk(r)?(+r.wk===2?2:1):0,ev=wk?'w'+wk:String(r?(+r.every||1):1);
  var evo=[['w1','Her hafta'],['w2','2 haftada bir'],['1','Her ay'],['2','2 ayda bir'],['3','3 ayda bir'],['6','6 ayda bir'],['12','Yılda bir']].map(function(x){return '<option value="'+x[0]+'"'+(x[0]===ev?' selected':'')+'>'+x[1]+'</option>';}).join('');
  openSheet('<h2>'+(r?'Düzenli kalemi düzenle':'Yeni düzenli ödeme ya da gelir')+'</h2>'
   +'<div class="field"><label for="r-kind">Tür</label><select id="r-kind"><option value="exp"'+(inc?'':' selected')+'>Ödeme (fatura, kira, taksit, abonelik)</option><option value="inc"'+(inc?' selected':'')+'>Gelir (maaş, kira geliri)</option></select></div>'
   +'<div class="field"><label for="r-name">Ad</label><input id="r-name" placeholder="'+(inc?'Örn. Maaş':'Örn. İnternet faturası')+'" value="'+esc(r?r.name:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="r-amt" id="lb-ramt">Tutar ('+CSYM[ccyOf(a0)]+')</label><input id="r-amt" inputmode="decimal" value="'+(r?nv(r.amt):'')+'"></div><div class="field" id="row-rday"'+(wk?' hidden':'')+'><label for="r-day">Ayın kaçı</label><input id="r-day" inputmode="numeric" maxlength="2" value="'+(r&&!wk?r.day:'')+'"></div></div>'
   +'<div class="two"><div class="field"><label for="r-cat">Kategori</label><select id="r-cat">'+(r?optsKeep(inc?INCC():EXPC(),r.cat):(inc?opts(INCC()):opts(EXPC(),EXPC().indexOf('Fatura')>=0?'Fatura':undefined)))+'</select></div><div class="field"><label for="r-acct">Hesap</label><select id="r-acct">'+acctOpts(a0)+'</select></div></div>'
   +'<div class="field" id="row-rsub" hidden><label for="r-sub">Alt kategori</label><select id="r-sub" data-v="'+esc(r&&r.sub||'')+'"></select></div>'
   +'<div class="two"><div class="field"><label for="r-every">Sıklık</label><select id="r-every">'+evo+'</select></div><div class="field"><label for="r-n">Taksit sayısı</label><input id="r-n" inputmode="numeric" maxlength="3" placeholder="Bitmiyorsa boş" value="'+(r&&+r.n>0?r.n:'')+'"></div></div>'
   +'<div class="field" id="row-rstart"'+(wk?' hidden':'')+'><label for="r-start">İlk ödeme ayı</label><input id="r-start" type="month" value="'+esc(r&&r.start&&!wk?r.start:curP())+'"><div class="small muted" style="margin-top:4px">Yıllık ödemelerde (kasko, MTV, emlak vergisi) hangi ay ödendiğini, taksitlerde ilk taksitin ayını seç.</div></div>'
   +'<div class="field" id="row-rstartd"'+(wk?'':' hidden')+'><label for="r-startd">İlk ödeme günü</label><input id="r-startd" type="date" value="'+esc(r&&wk&&r.start?r.start:todayS())+'"><div class="small muted" style="margin-top:4px"><b id="r-wd">Her '+WDAY[(wk&&r.start?pdate(r.start):today0()).getDay()].toLocaleLowerCase('tr-TR')+'</b> · haftanın günü bu tarihten alınır.</div></div>'
   +(S.debts.length?'<div class="field" id="row-rdebt"'+(inc?' hidden':'')+'><label for="r-debt">Bir borcun taksidi mi?</label><select id="r-debt"><option value="">Hayır</option>'+S.debts.map(function(d){return '<option value="'+d.id+'"'+(r&&r.debt===d.id?' selected':'')+'>'+esc(d.name)+'</option>';}).join('')+'</select><div class="small muted" style="margin-top:4px">Borca bağlı taksit ödenince faiz oranına göre anapara ve faiz+vergi olarak ayrılır.</div></div>':'')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-r" data-id="'+(r?r.id:'')+'">Kaydet</button>'+(r?delBtn('del-r',r.id):''));
  subSync('r');
}
function syncREvery(){var w=val('r-every').charAt(0)==='w';['row-rday','row-rstart'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=w;});['row-rstartd'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=!w;});syncRWd();
  var l=document.querySelector('label[for="r-n"]');if(l)l.textContent=w?'Kaç kez':'Taksit sayısı';}
function syncRWd(){var d=val('r-startd'),e=document.getElementById('r-wd');if(e&&/^\d{4}-\d{2}-\d{2}$/.test(d))e.textContent=(val('r-every')==='w2'?'2 haftada bir ':'Her ')+WDAY[pdate(d).getDay()].toLocaleLowerCase('tr-TR');}
function syncRKind(){var inc=val('r-kind')==='inc',c=document.getElementById('r-cat'),d=document.getElementById('row-rdebt');if(c)c.innerHTML=inc?opts(INCC()):opts(EXPC(),EXPC().indexOf('Fatura')>=0?'Fatura':undefined);if(d)d.hidden=inc;subSync('r');}
/* düzenli kalem penceresinde alt kategori seçimi (kategorinin alt kategorisi varsa görünür) */
function subSync(p){var s=document.getElementById(p+'-sub'),row=document.getElementById('row-'+p+'sub');if(!s)return;var c=val(p+'-cat'),cur=s.value||s.dataset.v||'',l=subsOf(c).slice();if(cur&&l.indexOf(cur)<0)cur='';
  s.innerHTML='<option value="">Yok</option>'+l.map(function(x){return '<option'+(x===cur?' selected':'')+'>'+esc(x)+'</option>';}).join('');s.dataset.v='';if(row)row.hidden=!l.length;}
function aSheet(a,kind){
  var ex=a!=null&&ACCS().indexOf(a)>=0,used=ex&&acctUsed(a),t=ex?acctType(a):(kind||'banka'),c=ex?ccyOf(a):'TRY',x=ex?ax(a):{};
  var cs=used?'<div class="static">'+CCYN[c]+'</div>':'<select id="a-ccy" data-prev="'+c+'">'+CCYS.map(function(k){return '<option value="'+k+'"'+(k===c?' selected':'')+'>'+CCYN[k]+'</option>';}).join('')+'</select>';
  openSheet('<h2>'+(ex?'Hesabı düzenle':'Yeni hesap')+'</h2>'
   +'<div class="field"><label for="a-name">Ad</label><input id="a-name" placeholder="Örn. Maaş hesabı" value="'+esc(ex?a:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="a-type">Tür</label><select id="a-type">'+ATYPES.map(function(y){return '<option value="'+y[0]+'"'+(y[0]===t?' selected':'')+'>'+y[1]+'</option>';}).join('')+'</select></div><div class="field">'+(used?'<span class="flbl">Para birimi</span>':'<label for="a-ccy">Para birimi</label>')+cs+'</div></div>'
   +'<div class="two"><div class="field"><label for="a-open" id="lb-aopen">Başlangıç bakiyesi ('+CSYM[c]+')</label><input id="a-open" inputmode="decimal" placeholder="0" value="'+(ex?nv(+S.opening[a]||0):'')+'"></div><div class="field" id="row-due"'+(t==='kart'?'':' hidden')+'><label for="a-due">Son ödeme günü</label><input id="a-due" inputmode="numeric" maxlength="2" placeholder="Örn. 15" value="'+(x.due||'')+'"></div></div>'
   +'<div class="two" id="row-limit"'+(t==='kart'?'':' hidden')+'><div class="field"><label for="a-limit">Kart limiti</label><input id="a-limit" inputmode="decimal" placeholder="İsteğe bağlı" value="'+(x.limit?nv(x.limit):'')+'"></div><div class="field"><label for="a-cut">Hesap kesim günü</label><input id="a-cut" inputmode="numeric" maxlength="2" placeholder="Örn. 5" value="'+(x.cut||'')+'"></div></div>'
   +'<div class="two" id="row-arate"'+(t==='birikim'?'':' hidden')+'><div class="field"><label for="a-rate">Yıllık faiz (%)</label><input id="a-rate" inputmode="decimal" placeholder="İsteğe bağlı, örn. 38" value="'+(+x.rate>0?nv(x.rate):'')+'"></div><div class="field"><label for="a-tax">Stopaj (%)</label><input id="a-tax" inputmode="decimal" placeholder="'+NUM1.format(FACTS.dep.t6)+'" value="'+(x.tax!=null&&x.tax!==''?nv(x.tax):'')+'"></div></div>'
   +'<p class="small muted" style="margin:0" id="row-arate-h"'+(t==='birikim'?'':' hidden')+'>Günlük faizli (kazandıran) hesaplar için: faiz her günün bakiyesinden hesaplanır, ay sonunda stopaj düşülerek “Yatırım getirisi › Faiz” geliri olarak bu hesaba kendiliğinden işlenir.</p>'
   +'<p class="small muted" style="margin:0" id="a-hint"></p><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-a" data-id="'+esc(ex?a:'')+'">Kaydet</button>'
   +(ex?(used||ACCS().length<2?'<p class="small muted" style="margin:0;text-align:center">'+(used?'Hareketi ya da bağlı kaydı olduğu için bu hesap silinemez; kapandıysa arşivleyebilirsin.':'Son hesap silinemez.')+'</p>':delBtn('del-a',esc(a))):'')
   +(ex&&ACCS().length>1?'<button class="btn ghost" data-act="a-arch" data-id="'+esc(a)+'">'+(x.arch?'Arşivden çıkar':'Hesabı arşivle')+'</button>'+(x.arch?'':'<p class="small muted" style="margin:0;text-align:center">Arşivlenen hesap listelerde ve seçimlerde görünmez; geçmiş işlemleri ve bakiyesi korunur.</p>'):''));
  syncA();
}
function syncA(conv){
  var t=val('a-type'),c=document.getElementById('a-ccy'),h=document.getElementById('a-hint'),l=document.getElementById('lb-aopen');
  ['row-due','row-limit'].forEach(function(id){var r=document.getElementById(id);if(r)r.hidden=t!=='kart';});['row-arate','row-arate-h'].forEach(function(id){var r=document.getElementById(id);if(r)r.hidden=t!=='birikim';});
  if(c&&l){l.textContent='Başlangıç bakiyesi ('+CSYM[c.value]+')';
    if(conv){var prev=c.dataset.prev||'TRY',o=document.getElementById('a-open'),v=num(o&&o.value),rp=rateOf(prev),rn=rateOf(c.value);
      if(o&&v&&rp>0&&rn>0){o.value=nv(r2(v*rp/rn));if(h){h.textContent='Bakiye güncel kurla çevrildi: '+fmtC(v,prev,1)+' = '+fmtC(v*rp/rn,c.value,1)+'. Hesaptaki gerçek tutar farklıysa düzelt.';}c.dataset.prev=c.value;return;}
      c.dataset.prev=c.value;}}
  if(h)h.textContent=t==='kart'?'Kartta borcun varsa başlangıç bakiyesine eksi yaz (örn. -2500). Son ödeme günü girersen yaklaşınca hatırlatılır.':'Başlangıç bakiyesi, Wallet’ı kullanmaya başladığın andaki paradır.'+(document.getElementById('a-ccy')?'':' Hareketi olan hesabın para birimi değişmez.');
}
function renameAcct(old,nw){
  S.accounts=S.accounts.map(function(x){return x===old?nw:x;});
  S.tx.forEach(function(x){if(x.acct===old)x.acct=nw;if(x.to===old)x.to=nw;});
  S.recurring.forEach(function(r){if(r.acct===old)r.acct=nw;});
  S.goals.forEach(function(g){if(g.acct===old)g.acct=nw;});
  if(S.accx[old]){S.accx[nw]=S.accx[old];delete S.accx[old];}
  if(Object.prototype.hasOwnProperty.call(S.opening,old)){S.opening[nw]=S.opening[old];delete S.opening[old];}
  if(S.openD&&S.openD[old]){S.openD[nw]=S.openD[old];delete S.openD[old];}
  ['exp','inc','trf'].forEach(function(k){if(S.last&&S.last[k]&&S.last[k].acct===old)S.last[k].acct=nw;});
  if(S.defAcct===old)S.defAcct=nw;if(ui.acctF===old)ui.acctF=nw;
  /* SMS eşleştirmeleri ve bekleyen SMS işlemleri de yeni adı kullansın */
  if(S.sms){Object.keys(S.sms.map||{}).forEach(function(k){if(S.sms.map[k]===old)S.sms.map[k]=nw;});(S.sms.pend||[]).forEach(function(it){if(it.acct===old)it.acct=nw;if(it.to===old)it.to=nw;});}
  (S.debts||[]).forEach(function(d){if(d.acct===old)d.acct=nw;});
}
