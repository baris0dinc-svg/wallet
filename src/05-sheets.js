
/* ---------- render ---------- */
function pageInfo(){
  var p=ui.page;
  if(p.k==='fire')return {title:'Finansal özgürlük',body:vFire};
  if(p.k==='araclar')return {title:'Hesaplayıcılar',body:vArac};
  if(p.k==='piyasa')return {title:'Piyasalar',body:vPiyasa};
  if(p.k==='ayarlar')return {title:'Ayarlar',body:vAyarlar};
  if(p.k==='set'&&p.s==='notlar')return {title:'Not ayarları',body:setNotlar};
  if(p.k==='set'){var s=SETS.filter(function(x){return x.id===p.s;})[0]||SETS[SETS.length-1];return {title:s.t,body:function(){return setBody(s.id);}};}
  var n=p.id&&byId(S.notes,p.id);
  return {title:p.id?(n&&n.trash?'Çöp kutusundaki not':(n&&n.arch?'Arşivdeki not':'Not')):'Yeni not',body:vNote};
}
function render(){
  TXV++;
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
    hd.innerHTML='<button class="icon-btn" data-act="back" aria-label="Geri">'+ic('back')+'</button><h1>'+esc(P.title)+'</h1>';
    vw.innerHTML=P.body();
  }else{
    hd.innerHTML='<h1><span class="logo" role="img" aria-label="Wallet logosu"></span>Wallet</h1><span class="hbtns"><button class="icon-btn" id="rfb" data-act="refresh" aria-label="Yenile: güncel kurlar ve piyasalar" title="Yenile">'+ic('refresh')+'</button><button class="icon-btn" data-act="open-settings" aria-label="Ayarlar" title="Ayarlar">'+ic('cog')+'</button></span>';
    vw.innerHTML=vMain();
    var sb=document.getElementById('secbar'),on=sb&&sb.querySelector('[aria-pressed="true"]');
    if(on&&(on.offsetLeft<sb.scrollLeft||on.offsetLeft+on.offsetWidth>sb.scrollLeft+sb.clientWidth))sb.scrollLeft=on.offsetLeft-16;
    var qa=document.getElementById('qa');if(qa&&ui.qaX)qa.scrollLeft=ui.qaX;
    edgeFade('secbar','secwrap');edgeFade('qa','qawrap');
  }
  document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px');
  document.getElementById('fab').hidden=!(!ui.page&&ui.sub==='islem');
}
function persistUi(){try{localStorage.setItem(UIKEY,JSON.stringify({sub:ui.sub,nv:ui.nv,plan:ui.plan,sv:ui.sv,an:ui.an}));}catch(e){}}
/* eski bölüm adları (Bütçe, Düzenli, Hedefler) Planlama'nın alt sekmelerine gider */
function mapSec(s){if(PLANS.some(function(x){return x[0]===s;})){ui.plan=s;return 'plan';}
  if(s==='portfoy')s='yatirim';if(WEALTH.some(function(x){return x[0]===s;})){ui.sv=s;return 'servet';}
  return SECS.some(function(x){return x[0]===s;})?s:'islem';}
function restoreUi(){
  try{var u=JSON.parse(localStorage.getItem(UIKEY)||'{}');
    if(PLANS.some(function(x){return x[0]===u.plan;}))ui.plan=u.plan;if(WEALTH.some(function(x){return x[0]===u.sv;}))ui.sv=u.sv;if(ANS.some(function(x){return x[0]===u.an;}))ui.an=u.an;
    if(u.sub)ui.sub=mapSec(u.sub);else if(u.tab)ui.sub=mapSec(u.tab);
    if(u.nv==='arch'||u.nv==='trash')ui.nv=u.nv;}catch(e){}
  var h=(location.hash||'').slice(1);
  ui.page=pageFromHash(h);
  if(h&&!ui.page){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
}
/* adres çubuğundaki #… ile sayfa eşleşmesi (tarayıcı/telefon geri tuşu için) */
function pageFromHash(h){if(h==='fire')return {k:'fire'};if(h==='araclar')return {k:'araclar'};if(h==='piyasa')return {k:'piyasa'};if(h==='ayarlar')return {k:'ayarlar'};if(/^ayar-[a-z]+$/.test(h))return {k:'set',s:h.slice(5)};return null;}
function openPage(p,hash){closeSheet();ui.page=p;try{if(hash)location.hash=hash;}catch(e){}render();window.scrollTo(0,0);}
function finishPage(){if(ui.page&&ui.page.k==='note')saveNote();}
function closePage(){finishPage();var p=ui.page;ui.page=(p&&p.k==='set'&&p.from==='ayarlar')?{k:'ayarlar'}:null;render();try{if(location.hash.length>1)history.back();}catch(e){}}
function goSec(s){closeSheet();if(ui.page){finishPage();ui.page=null;try{if(location.hash.length>1)history.back();}catch(e){}}ui.sub=mapSec(s);persistUi();render();scrollToSec();}

/* ---------- alt pencereler (sheet) ---------- */
function openSheet(inner){document.getElementById('sheet-root').innerHTML='<div class="sheet-bg" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in">'+inner+'</div></div>';}
function closeSheet(){var r=document.getElementById('sheet-root');if(r)r.innerHTML='';}
function sheetOpen(){return !!document.getElementById('sheet-root').innerHTML;}
function opts(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}
function acctOpts(sel,none){return (none?'<option value="">'+esc(none)+'</option>':'')+ACCS().map(function(a){return '<option value="'+esc(a)+'"'+(a===sel?' selected':'')+'>'+esc(a)+(ccyOf(a)!=='TRY'?' ('+CSYM[ccyOf(a)]+')':'')+'</option>';}).join('');}
function delBtn(act,id,label){return '<button class="btn danger" data-act="'+act+'" data-id="'+id+'">'+(label||'Sil')+'</button>';}
function armed(btn){if(btn.dataset.armed){return true;}btn.dataset.armed='1';btn.textContent='Emin misin? Tekrar dokun';return false;}
function ferr(m){var e=document.getElementById('f-err');if(e){e.textContent=m;e.style.color='var(--exp)';}}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function badName(n){return /^(__proto__|constructor|prototype)$/.test(n);}
var txType='exp',txOrig=null;
function lastSel(type,k,list){var l=S.last&&S.last[type];var v=l&&l[k];return list.indexOf(v)>=0?v:undefined;}
function defAcct(type){var acc=ACCS();return lastSel(type,'acct',acc)||(acc.indexOf(S.defAcct)>=0?S.defAcct:acc[0]);}
function txSheet(id,force,pre){
  pre=pre||{};
  var t=id?byId(S.tx,id):null;
  if(t&&(t.type==='inv'||t.type==='dbt'||t.type==='adj'))return mvSheet(t);
  txOrig=t;txType=t?t.type:(force||'exp');
  var acc=ACCS(),canTrf=acc.length>1;if(txType==='trf'&&!canTrf){toast('Transfer için en az iki hesap gerekli. Önce hesap ekle.');aSheet(null);return;}
  var cats=txType==='inc'?INCC():EXPC(),trf=txType==='trf';
  var a0=t?t.acct:(pre.acct&&acc.indexOf(pre.acct)>=0?pre.acct:defAcct(txType));
  var to0=(t&&t.to)||(pre.to&&acc.indexOf(pre.to)>=0&&pre.to!==a0?pre.to:acc.filter(function(a){return a!==a0;})[0]);
  openSheet('<h2>'+esc(t?'İşlemi düzenle':(pre.title||'Yeni işlem'))+'</h2><div class="seg" id="f-type"><button data-act="tx-type" data-v="exp" aria-pressed="'+(txType==='exp')+'">Gider</button><button data-act="tx-type" data-v="inc" aria-pressed="'+(txType==='inc')+'">Gelir</button>'+(canTrf?'<button data-act="tx-type" data-v="trf" aria-pressed="'+trf+'">Transfer</button>':'')+'</div>'
   +'<div class="field"><label for="f-amt" id="lb-amt">Tutar (₺)</label><input id="f-amt" class="amtin" inputmode="decimal" placeholder="0,00" value="'+(t?nv(t.amt):'')+'"></div>'
   +'<div class="field" id="row-cat"'+(trf?' hidden':'')+'><span class="flbl">Kategori</span><select id="f-cat" hidden aria-hidden="true">'+(t&&!trf?optsKeep(cats,t.cat):opts(cats,pre.cat&&cats.indexOf(pre.cat)>=0?pre.cat:lastSel(txType,'cat',cats)))+'</select><div class="catchips" id="f-catchips" role="group" aria-label="Kategori"></div></div>'
   +'<div class="two"><div class="field"><label for="f-acct" id="lb-acct">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="f-acct">'+acctOpts(a0)+'</select></div><div class="field" id="row-to"'+(trf?'':' hidden')+'><label for="f-to">Giriş hesabı</label><select id="f-to">'+acctOpts(to0)+'</select></div></div>'
   +'<div class="field" id="row-amt2" hidden><label for="f-amt2" id="lb-amt2">Giriş tutarı</label><input id="f-amt2" inputmode="decimal" placeholder="0,00" value="'+(t&&t.amt2?nv(t.amt2):'')+'"></div>'
   +'<div class="field"><label for="f-date">Tarih</label><div class="datew"><input id="f-date" type="date" value="'+(t?t.date:todayS())+'"><button class="chip" data-act="date-pick" data-v="0">Bugün</button><button class="chip" data-act="date-pick" data-v="1">Dün</button></div></div>'
   +'<div class="field"><label for="f-note">Not</label><input id="f-note" placeholder="İsteğe bağlı, örn. market alışverişi" value="'+esc(t?t.note:'')+'"></div>'
   +'<div class="balprev" id="f-bal" aria-live="polite"></div><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-tx" data-id="'+(t?t.id:'')+'">Kaydet</button>'+(t?'<button class="btn ghost" data-act="dup-tx" data-id="'+t.id+'">Bugüne kopyala</button>'+delBtn('del-tx',t.id):''));
  catChips();dateChips();syncCcy();
  if(!t)setTimeout(function(){var e=document.getElementById('f-amt');if(e)e.focus();},60);
}
/* kategoriler tek dokunuşla: en çok kullanılanlar önde; gizli seçim kutusuyla eşlenir */
function catOrder(type,list){var c={},from=new Date(today0());from.setDate(from.getDate()-120);var fs=isoDate(from);S.tx.forEach(function(t){if(t.type===type&&t.date>=fs)c[t.cat]=(c[t.cat]||0)+1;});
  return list.map(function(x,i){return [x,i];}).sort(function(a,b){return ((c[b[0]]||0)-(c[a[0]]||0))||a[1]-b[1];}).map(function(x){return x[0];});}
function catChips(){var sel=document.getElementById('f-cat'),box=document.getElementById('f-catchips');if(!sel||!box)return;
  var list=Array.prototype.map.call(sel.options,function(o){return o.value;}),ord=catOrder(txType,list);
  box.innerHTML=ord.map(function(c){return '<button class="chip" data-act="cat-pick" data-v="'+esc(c)+'" aria-pressed="'+(sel.value===c)+'"><span class="dot" style="background:'+color(c)+'"></span>'+esc(c)+'</button>';}).join('');}
function syncCatChips(){var sel=document.getElementById('f-cat');if(!sel)return;document.querySelectorAll('#f-catchips .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===sel.value));});}
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
  var c=ccyOf(a.value);lb.textContent='Tutar ('+CSYM[c]+')';
  var row=document.getElementById('row-amt2'),to=document.getElementById('f-to');
  var cross=txType==='trf'&&to&&ccyOf(to.value)!==c;
  if(row){row.hidden=!cross;if(cross){document.getElementById('lb-amt2').textContent='Giriş tutarı ('+CSYM[ccyOf(to.value)]+')';var i2=document.getElementById('f-amt2'),v1=num(val('f-amt'));if(i2&&!i2.dataset.manual&&v1>0&&rateOf(c)>0&&rateOf(ccyOf(to.value))>0)i2.value=nv(r2(v1*rateOf(c)/rateOf(ccyOf(to.value))));}}
  balPreview();
}
/* borç, yatırım ve düzeltme hareketleri için sade düzenleme penceresi */
function mvSheet(t){
  txOrig=t;txType=t.type;
  var info=t.type==='inv'?'Varlığın adedi ve maliyeti Portföy’den değişir; burada yalnızca hesaba yansıyan tutar düzenlenir.':(t.type==='dbt'?(t.side==='out'?'Bu ödeme borcun kalan tutarından düşülür.':'Borç olarak alınan para hesaba eklenmiştir.'):'Hesap bakiyesini gerçek bakiyeyle eşitlemek için eklenen düzeltme. Artı ya da eksi olabilir.');
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
  openSheet('<div class="ghead"><span class="dot" style="background:'+color(c)+';width:14px;height:14px"></span><h2 style="margin:0;flex:1">'+esc(c)+'</h2></div><div><div class="lbl">'+esc(plabel(k))+'</div><p class="big" style="margin:0">'+TRY0.format(tot||inc)+'</p>'+(info.length?'<div class="small muted">'+esc(info.join(' · '))+'</div>':'')+'</div>'
   +(l.length?'<div class="list">'+l.map(txRow).join('')+'</div>':'<div class="small muted">Bu dönemde bu kategoride işlem yok.</div>')
   +'<button class="btn ghost" data-act="cat-new" data-v="'+esc(c)+'">Bu kategoriye ekle</button>');
}
function grpAccts(kind){return ACCS().filter(function(a){return acctType(a)===kind;});}
/* hesap detayı: bakiye, son hareketler ve hızlı işlemler */
function acctSheet(a){
  if(ACCS().indexOf(a)<0)return;
  var b=acctBal(a),t=acctType(a),c=ccyOf(a),x=ax(a),recent=S.tx.filter(function(q){return q.acct===a||q.to===a;}).sort(function(p,q){return q.date.localeCompare(p.date);}).slice(0,6);
  var extra=[];if(c!=='TRY'&&rateOf(c)>0)extra.push('≈ '+TRY0.format(toTL(b,a)));if(t==='kart'){if(+x.limit>0)extra.push('Limit '+moneyIn(+x.limit,a,1)+' · kullanılabilir '+moneyIn(Math.max(+x.limit+b,0),a,1));if(x.due)extra.push('Son ödeme günü: ayın '+x.due+'’i');}
  var ab=function(act,icn,lb){return '<button data-act="'+act+'" data-id="'+esc(a)+'"><span class="c" style="--c:var(--accent)">'+ic(icn)+'</span><span class="t">'+lb+'</span></button>';};
  openSheet('<div class="ghead"><span class="sic" style="--c:'+color(a)+'">'+ic(t==='nakit'?'cash':(t==='kart'?'card':(t==='birikim'?'coins':'bank')))+'</span><span class="mid"><h2 style="margin:0">'+esc(a)+'</h2><div class="small muted">'+esc(typeName(t)+(c!=='TRY'?' · '+CCYN[c]:''))+'</div></span><button class="icon-btn" data-act="edit-a" data-id="'+esc(a)+'" aria-label="Hesabı düzenle">'+ic('gear')+'</button></div>'
   +'<div><div class="lbl">'+(t==='kart'&&b<0?'Kart borcu':'Bakiye')+'</div><p class="big'+(b<0?' exp':'')+'" style="margin:0">'+moneyIn(t==='kart'&&b<0?-b:b,a)+'</p>'+(extra.length?'<div class="small muted">'+esc(extra.join(' · '))+'</div>':'')+'</div>'
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
   +'<button class="row-tgl" id="rc-mode" data-act="rc-mode" role="switch" aria-checked="true"><span class="mid"><div class="t">Farkı gelir/gider olarak kaydet</div><div class="small muted">Kapalıysa yalnızca bakiye düzeltilir, gelir-gider raporlarına girmez</div></span><span class="sw"></span></button>'
   +'<div class="err" id="f-err"></div><button class="btn" data-act="rc-save" data-id="'+esc(a)+'">Eşitle</button>');
}
function debtListSheet(){
  if(!S.debts.length)return dSheet(null);
  var tot=debtManual(),cd=wealth().g.cardDebt;
  openSheet('<h2>Borçlarım</h2><div><div class="lbl">Kalan borç</div><p class="big exp" style="margin:0">'+TRY0.format(tot+cd)+'</p>'+(cd>0?'<div class="small muted">Kredi kartı borçları '+TRY0.format(cd)+' dahil</div>':'')+'</div><div class="list">'+S.debts.map(function(d){var l=debtLeft(d);return '<button class="item" data-act="edit-d" data-id="'+d.id+'"><span class="dot" style="background:'+color(d.name)+'"></span><span class="mid"><div class="t">'+esc(d.name)+'</div><div class="small muted">'+esc(d.type)+'</div></span>'+(l>0?'<span class="num exp">'+TRY0.format(l)+'</span>':'<span class="pill ok">Bitti</span>')+'</button>';}).join('')+'</div><button class="btn" data-act="new-d">Borç ekle</button><p class="small muted" style="margin:0">Ödeme yapmak için borca dokun.</p>');
}
function dSheet(id){
  var d=id?byId(S.debts,id):null,left=d?debtLeft(d):0,paid=d?debtPaid(d):0;
  var pay=d&&left>0?'<div class="card stack" style="gap:10px;background:var(--bg)"><h2 style="margin:0">Ödeme yap</h2><div class="two"><div class="field"><label for="dp-amt">Anapara (₺)</label><input id="dp-amt" inputmode="decimal" placeholder="Örn. '+nv(Math.min(left,5000))+'"></div><div class="field"><label for="dp-int">Faiz ve masraf (₺)</label><input id="dp-int" inputmode="decimal" placeholder="Varsa"></div></div><div class="two"><div class="field"><label for="dp-acct">Ödeme hesabı</label><select id="dp-acct">'+acctOpts(grpAccts('banka')[0]||defAcct('exp'))+'</select></div><div class="field"><label for="dp-date">Tarih</label><input id="dp-date" type="date" value="'+todayS()+'"></div></div><div class="err" id="f-err2"></div><button class="btn" data-act="pay-d" data-id="'+d.id+'">Ödemeyi kaydet</button><p class="small muted" style="margin:0">Anapara borçtan düşer; faiz ve masraf gider olarak kaydedilir. İkisi de hesabından çıkar.</p></div>':'';
  openSheet('<h2>'+(d?'Borç: '+esc(d.name):'Borç ekle')+'</h2>'+(d?'<div class="row3" style="margin:0"><div><div class="lbl">Toplam</div><span class="num">'+TRY0.format(d.amt)+'</span></div><div><div class="lbl">Ödenen</div><span class="num inc">'+TRY0.format(paid)+'</span></div><div><div class="lbl">Kalan</div><span class="num exp">'+TRY0.format(left)+'</span></div></div><div class="bar"><i style="width:'+(d.amt>0?clamp(paid/d.amt*100,0,100):0)+'%"></i></div>':'')+pay
   +'<div class="field"><label for="d-name">Ad</label><input id="d-name" placeholder="Örn. Taşıt kredisi" value="'+esc(d?d.name:'')+'"></div><div class="two"><div class="field"><label for="d-type">Tür</label><select id="d-type">'+optsKeep(DTYPES,d&&d.type)+'</select></div><div class="field"><label for="d-amt">'+(d?'Toplam borç (₺)':'Kalan borç (₺)')+'</label><input id="d-amt" inputmode="decimal" value="'+(d?nv(d.amt):'')+'"></div></div>'
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
   +(x&&!x.mk?'<button class="btn ghost small" data-act="m-linkmode" data-id="'+x.id+'">'+ic('pulse')+' Fiyatı piyasadan al (hisse, fon, kripto…)</button>':'')
   +(x?'':'<div class="field"><label for="h-acct">Ödeme hesabı</label><select id="h-acct">'+acctOpts('','Hesaptan düşme (zaten sahibim)')+'</select></div><p class="small muted" style="margin:0" id="h-hint"></p>'+(mkk?'':'<p class="small muted" style="margin:0">Hisse, fon ya da kripto fiyatının kendiliğinden güncellenmesi için <button class="pill linkp" data-act="open-mkt">Piyasalar’da ara</button> ve oradan ekle.</p>'))
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-h" data-id="'+(x?x.id:'')+'" data-v="inv">Kaydet</button>'+(x?'<div class="two"><button class="btn ghost" data-act="h-buy" data-id="'+x.id+'">Al</button><button class="btn ghost" data-act="h-sell" data-id="'+x.id+'">Sat</button></div>'+delBtn('del-h',x.id):''));
  syncH();
}
function syncH(){var c=val('h-ccy'),r=document.getElementById('row-hprice'),q=document.getElementById('lb-hqty'),mp=document.getElementById('h-mkp');if(r)r.hidden=!!c;if(mp)mp.hidden=c.indexOf('mk:')!==0;if(q)q.textContent=({XAU:'Miktar (gram)',XAG:'Miktar (gram)',CEY:'Adet',USD:'Miktar ($)',EUR:'Miktar (€)',GBP:'Miktar (£)',CHF:'Miktar (CHF)'})[c]||'Adet / miktar';
  var hh=document.getElementById('h-hint');if(hh){var qn=num(val('h-qty')),cs=num(val('h-cost'));hh.textContent=val('h-acct')&&qn>0&&cs>0?'Seçtiğin hesaptan '+TRY2.format(qn*cs)+' düşülecek.':'';}}
function tradeSheet(id,side){
  var x=byId(S.holdings,id);if(!x)return;var ast=hKind(x)==='asset',p=hPrice(x);
  openSheet('<h2>'+esc(x.name)+' · '+(side==='buy'?'Al':'Sat')+'</h2><div class="small muted">Elindeki: '+(ast?'1 adet':qtyTxt(x))+' · ort. maliyet '+TRY2.format(x.cost)+' · güncel '+TRY2.format(p)+'</div>'
   +'<div class="two">'+(ast?'':'<div class="field"><label for="tr-qty">Miktar</label><input id="tr-qty" inputmode="decimal" value="'+(side==='sell'?nv(x.qty):'')+'"></div>')+'<div class="field"><label for="tr-price">'+(ast?'Satış tutarı (₺)':'Birim fiyat (₺)')+'</label><input id="tr-price" inputmode="decimal" value="'+nv(r2(p))+'"></div>'+(ast?'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>':'')+'</div>'
   +'<div class="two"><div class="field"><label for="tr-acct">'+(side==='buy'?'Ödeme hesabı':'Paranın gireceği hesap')+'</label><select id="tr-acct">'+acctOpts(defAcct('exp'),'Hesaba yansıtma')+'</select></div>'+(ast?'':'<div class="field"><label for="tr-date">Tarih</label><input id="tr-date" type="date" value="'+todayS()+'"></div>')+'</div>'
   +'<div class="balprev" id="tr-prev"></div><div class="err" id="f-err"></div><button class="btn" data-act="trade" data-id="'+x.id+'" data-v="'+side+'">'+(side==='buy'?'Alımı kaydet':'Satışı kaydet')+'</button>');
  tradePrev();
}
function tradePrev(){var box=document.getElementById('tr-prev');if(!box)return;var btn=document.querySelector('[data-act="trade"]'),x=btn&&byId(S.holdings,btn.dataset.id);if(!x)return;
  var ast=hKind(x)==='asset',q=ast?1:num(val('tr-qty')),p=num(val('tr-price')),side=btn.dataset.v;if(!(q>0&&p>0)){box.textContent='';return;}
  var m=maskOn;maskOn=false;try{box.innerHTML='Tutar: <b class="num">'+TRY2.format(q*p)+'</b>'+(side==='sell'?' · Kâr/zarar: <b class="num '+((p-x.cost)>=0?'inc':'exp')+'">'+sgn((p-x.cost)*q)+'</b>':' · Yeni ort. maliyet: <b class="num">'+TRY2.format((x.qty*x.cost+q*p)/(x.qty+q))+'</b>');}finally{maskOn=m;}}
function gSheet(id){
  var g=id?byId(S.goals,id):null;
  openSheet('<h2>'+(g?'Hedefi düzenle':'Yeni hedef')+'</h2><div class="field"><label for="g-name">Ad</label><input id="g-name" placeholder="Örn. Yaz tatili" value="'+esc(g?g.name:'')+'"></div><div class="two"><div class="field"><label for="g-target">Hedef tutar (₺)</label><input id="g-target" inputmode="decimal" value="'+(g?nv(g.target):'')+'"></div><div class="field" id="row-gsaved"><label for="g-saved">Biriken (₺)</label><input id="g-saved" inputmode="decimal" value="'+(g?nv(g.saved||0):'0')+'"></div></div>'
   +'<div class="two"><div class="field"><label for="g-acct">Bağlı hesap</label><select id="g-acct">'+acctOpts(g?g.acct||'':'','Yok, elle takip et')+'</select></div><div class="field"><label for="g-date">Hedef tarih</label><input id="g-date" type="date" value="'+(g&&g.date?g.date:'')+'"></div></div><p class="small muted" style="margin:0">Bir birikim hesabı bağlarsan biriken tutar o hesabın bakiyesinden gelir; para eklemek hesaplar arası transfer olur.</p><div class="err" id="f-err"></div><button class="btn" data-act="save-g" data-id="'+(g?g.id:'')+'">Kaydet</button>'+(g?delBtn('del-g',g.id):''));
  syncG();
}
function syncG(){var r=document.getElementById('row-gsaved');if(r)r.hidden=!!val('g-acct');}
function gaddSheet(id){
  var g=byId(S.goals,id);if(!g)return;var linked=g.acct&&ACCS().indexOf(g.acct)>=0;
  openSheet('<h2>'+esc(g.name)+' · para ekle</h2><div class="small muted">Biriken '+TRY0.format(goalSaved(g))+' / '+TRY0.format(g.target)+'</div><div class="field"><label for="ga-amt">Tutar (₺)</label><input id="ga-amt" inputmode="decimal" placeholder="0,00"></div>'
   +(linked?'<div class="field"><label for="ga-from">Hangi hesaptan</label><select id="ga-from">'+acctOpts(ACCS().filter(function(a){return a!==g.acct;})[0])+'</select></div><p class="small muted" style="margin:0">'+esc(g.acct)+' hesabına transfer yapılır.</p>':'<p class="small muted" style="margin:0">Bu hedef elle takip ediliyor; hesap bakiyeleri değişmez. Bir birikim hesabına bağlamak için hedefi düzenle.</p>')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="ga-save" data-id="'+g.id+'">Ekle</button>');
  setTimeout(function(){var e=document.getElementById('ga-amt');if(e)e.focus();},60);
}
function birSheet(){
  var sa=grpAccts('birikim'),tot=r2(sa.reduce(function(x,a){return x+toTL(acctBal(a),a);},0));
  if(!S.goals.length&&!sa.length)return gSheet(null);
  openSheet('<h2>Birikim</h2>'+(sa.length?'<div><div class="lbl">Birikim hesaplarında</div><p class="big" style="margin:0">'+TRY0.format(tot)+'</p></div><div class="list">'+sa.map(acctLine).join('')+'</div>':'')
   +(S.goals.length?'<div class="lbl">Hedefler</div><div class="list">'+S.goals.map(function(g){var s=goalSaved(g),p=g.target>0?Math.min(s/g.target*100,100):0;return '<div class="item"><span class="mid"><div class="t">'+esc(g.name)+'</div><div class="bar" style="margin:6px 0 2px"><i style="width:'+p+'%"></i></div><div class="small muted num">'+TRY0.format(s)+' / '+TRY0.format(g.target)+'</div></span><button class="btn small ghost" data-act="goal-add" data-id="'+g.id+'">Ekle</button></div>';}).join('')+'</div>':'')
   +'<div class="two"><button class="btn" data-act="new-g">Yeni hedef</button><button class="btn ghost" data-act="new-a" data-v="birikim">Birikim hesabı</button></div>');
}
function rSheet(id){
  var r=id?byId(S.recurring,id):null,a0=r?r.acct:defAcct('exp');
  openSheet('<h2>'+(r?'Ödemeyi düzenle':'Yeni düzenli ödeme')+'</h2><div class="field"><label for="r-name">Ad</label><input id="r-name" placeholder="Örn. İnternet faturası" value="'+esc(r?r.name:'')+'"></div><div class="two"><div class="field"><label for="r-amt" id="lb-ramt">Tutar ('+CSYM[ccyOf(a0)]+')</label><input id="r-amt" inputmode="decimal" value="'+(r?nv(r.amt):'')+'"></div><div class="field"><label for="r-day">Ayın kaçı</label><input id="r-day" inputmode="numeric" maxlength="2" value="'+(r?r.day:'')+'"></div></div><div class="two"><div class="field"><label for="r-cat">Kategori</label><select id="r-cat">'+(r?optsKeep(EXPC(),r.cat):opts(EXPC(),EXPC().indexOf('Fatura')>=0?'Fatura':undefined))+'</select></div><div class="field"><label for="r-acct">Hesap</label><select id="r-acct">'+acctOpts(a0)+'</select></div></div>'
   +(S.debts.length?'<div class="field"><label for="r-debt">Bir borcun taksidi mi?</label><select id="r-debt"><option value="">Hayır</option>'+S.debts.map(function(d){return '<option value="'+d.id+'"'+(r&&r.debt===d.id?' selected':'')+'>'+esc(d.name)+'</option>';}).join('')+'</select></div>':'')
   +'<div class="err" id="f-err"></div><button class="btn" data-act="save-r" data-id="'+(r?r.id:'')+'">Kaydet</button>'+(r?delBtn('del-r',r.id):''));
}
function aSheet(a,kind){
  var ex=a!=null&&ACCS().indexOf(a)>=0,used=ex&&acctUsed(a),t=ex?acctType(a):(kind||'banka'),c=ex?ccyOf(a):'TRY',x=ex?ax(a):{};
  var cs=used?'<div class="static">'+CCYN[c]+'</div>':'<select id="a-ccy" data-prev="'+c+'">'+CCYS.map(function(k){return '<option value="'+k+'"'+(k===c?' selected':'')+'>'+CCYN[k]+'</option>';}).join('')+'</select>';
  openSheet('<h2>'+(ex?'Hesabı düzenle':'Yeni hesap')+'</h2>'
   +'<div class="field"><label for="a-name">Ad</label><input id="a-name" placeholder="Örn. Maaş hesabı" value="'+esc(ex?a:'')+'"></div>'
   +'<div class="two"><div class="field"><label for="a-type">Tür</label><select id="a-type">'+ATYPES.map(function(y){return '<option value="'+y[0]+'"'+(y[0]===t?' selected':'')+'>'+y[1]+'</option>';}).join('')+'</select></div><div class="field">'+(used?'<span class="flbl">Para birimi</span>':'<label for="a-ccy">Para birimi</label>')+cs+'</div></div>'
   +'<div class="two"><div class="field"><label for="a-open" id="lb-aopen">Başlangıç bakiyesi ('+CSYM[c]+')</label><input id="a-open" inputmode="decimal" placeholder="0" value="'+(ex?nv(+S.opening[a]||0):'')+'"></div><div class="field" id="row-due"'+(t==='kart'?'':' hidden')+'><label for="a-due">Son ödeme günü</label><input id="a-due" inputmode="numeric" maxlength="2" placeholder="Örn. 15" value="'+(x.due||'')+'"></div></div>'
   +'<div class="field" id="row-limit"'+(t==='kart'?'':' hidden')+'><label for="a-limit">Kart limiti</label><input id="a-limit" inputmode="decimal" placeholder="İsteğe bağlı" value="'+(x.limit?nv(x.limit):'')+'"></div>'
   +'<p class="small muted" style="margin:0" id="a-hint"></p><div class="err" id="f-err"></div>'
   +'<button class="btn" data-act="save-a" data-id="'+esc(ex?a:'')+'">Kaydet</button>'
   +(ex?(used||ACCS().length<2?'<p class="small muted" style="margin:0;text-align:center">'+(used?'Hareketi ya da bağlı kaydı olduğu için bu hesap silinemez.':'Son hesap silinemez.')+'</p>':delBtn('del-a',esc(a))):''));
  syncA();
}
function syncA(conv){
  var t=val('a-type'),c=document.getElementById('a-ccy'),h=document.getElementById('a-hint'),l=document.getElementById('lb-aopen');
  ['row-due','row-limit'].forEach(function(id){var r=document.getElementById(id);if(r)r.hidden=t!=='kart';});
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
  ['exp','inc','trf'].forEach(function(k){if(S.last&&S.last[k]&&S.last[k].acct===old)S.last[k].acct=nw;});
  if(S.defAcct===old)S.defAcct=nw;if(ui.acctF===old)ui.acctF=nw;
}
