
/* ---------- Notlar (Google Keep tarzı) ----------
   Liste: üstte arama, "Sabitlenenler" ve "Diğerleri", renkli kartlar iki sütunda; altta "Not alın…" çubuğu.
   Düzenleyici: tam ekran, çerçevesiz başlık ve not; yapılacaklar listesi (onay kutuları); not rengi;
   altta renk, liste ve menü düğmeleri ile "Düzenlendi" zamanı. Kaydet düğmesi yok: geri dönünce kendiliğinden kaydedilir. */
var NCOL=[['','Varsayılan'],['coral','Mercan'],['peach','Şeftali'],['sand','Kum'],['mint','Nane'],['sage','Adaçayı'],['fog','Sis'],['storm','Fırtına'],['dusk','Lavanta'],['blossom','Pembe'],['clay','Kil'],['chalk','Gri']];
function ncls(c){return c&&NCOL.some(function(x){return x[0]===c;})?' nc-'+c:'';}
function noteItems(n){return Array.isArray(n.items)?n.items:[];}
function noteText(n){return n.list?noteItems(n).map(function(i){return i.t;}).join('\n'):String(n.body||'');}

/* ---- liste ---- */
function noteCardK(n){
  var t=(n.title||'').trim(),h='';
  if(n.list){var it=noteItems(n).filter(function(i){return String(i.t).trim();}),un=it.filter(function(i){return !i.c;}),ch=it.length-un.length;
    h=un.slice(0,8).map(function(i){return '<span class="ki"><span class="kb"></span>'+esc(i.t)+'</span>';}).join('')
     +(un.length>8?'<span class="km">+'+(un.length-8)+' öğe</span>':'')+(ch?'<span class="km">+'+ch+' işaretli öğe</span>':'');}
  else{var b=String(n.body||'').trim();if(b)h='<span class="kx">'+esc(b.length>600?b.slice(0,600)+'…':b)+'</span>';}
  if(!t&&!h)h='<span class="km">Boş not</span>';
  return '<button class="kcard'+ncls(n.color)+'" data-act="edit-n" data-id="'+n.id+'">'+(t?'<span class="kt">'+esc(t)+'</span>':'')+h+'</button>';
}
function notesList(){
  var l=noteSorted('act');
  if(!l.length)return '<div class="kempty">'+ic('note')+'<div>'+(ui.nq?'Eşleşen not yok.':'Eklediğin notlar burada görünür')+'</div></div>';
  var pin=l.filter(function(n){return n.pin;}),oth=l.filter(function(n){return !n.pin;}),g=function(a){return '<div class="kgrid">'+a.map(noteCardK).join('')+'</div>';};
  return pin.length?'<div class="klbl">Sabitlenenler</div>'+g(pin)+(oth.length?'<div class="klbl">Diğerleri</div>'+g(oth):''):g(oth);
}
function vNotlar(){
  var c=noteCounts();ui.nv='act';
  return '<div class="kq">'+ic('search')+'<input id="nsearch" type="search" placeholder="Notlarınızda arayın" value="'+esc(ui.nq)+'" aria-label="Notlarda ara"></div>'
   +'<div id="nlist">'+notesList()+'</div>'
   +(c.trash||c.act?'<div class="nfoot">'+(c.trash?'<button class="linkbtn" data-act="n-trashv">Silinenler ('+c.trash+')</button>':'<span></span>')+(c.act?'<button class="linkbtn" data-act="n-export">Dışa aktar</button>':'')+'</div>':'')
   +'<div class="kbar knew"><button class="knewt" data-act="new-n">Not alın…</button><button class="icon-btn" data-act="new-nl" aria-label="Yeni liste" title="Yeni liste">'+ic('check')+'</button></div>';
}

/* ---- düzenleyici ---- */
function noteDraft(n){return {title:n?n.title||'':'',body:n?n.body||'':'',pin:!!(n&&n.pin),color:n&&n.color||'',list:!!(n&&n.list),items:n?noteItems(n).map(function(i){return {t:i.t,c:!!i.c};}):[]};}
ACT['new-n']=function(){ui.nv='act';openPage({k:'note',id:null,draft:noteDraft(null),dirty:false},'not');setTimeout(function(){var e=document.getElementById('n-body');if(e)e.focus();},60);};
ACT['new-nl']=function(){ui.nv='act';var d=noteDraft(null);d.list=true;d.items=[{t:'',c:false}];openPage({k:'note',id:null,draft:d,dirty:false},'not');setTimeout(function(){kFocus(0);},60);};
ACT['edit-n']=function(el,id){var n=byId(S.notes,id);if(!n)return;openPage({k:'note',id:id,draft:noteDraft(n),dirty:false},'not');};
function noteBtns(){var p=ui.page,n=p.id&&byId(S.notes,p.id);if(n&&n.trash)return '';
  return '<button class="icon-btn" data-act="note-pin" aria-pressed="'+!!p.draft.pin+'" aria-label="'+(p.draft.pin?'Sabitlemeyi kaldır':'Sabitle')+'" title="Sabitle">'+ic('pin')+'</button>';}
function kItems(){
  var d=ui.page.draft,un=[],ch=[];d.items.forEach(function(it,i){(it.c?ch:un).push(i);});
  var row=function(i){var it=d.items[i];return '<div class="krow'+(it.c?' done':'')+'"><button class="kcb" data-act="ki-tg" data-v="'+i+'" role="checkbox" aria-checked="'+!!it.c+'" aria-label="İşaretle"></button>'
    +'<input class="kin" data-ki="'+i+'" value="'+esc(it.t)+'" placeholder="Liste öğesi" aria-label="Liste öğesi"><button class="kdel" data-act="ki-del" data-v="'+i+'" aria-label="Öğeyi sil">'+ic('x')+'</button></div>';};
  return un.map(row).join('')+'<button class="kadd" data-act="ki-add">'+ic('plus')+' Liste öğesi</button>'
   +(ch.length?'<div class="kchk">'+ch.length+' işaretli öğe</div>'+ch.map(row).join(''):'');
}
function vNote(){
  var p=ui.page,d=p.draft,n=p.id?byId(S.notes,p.id):null;
  if(n&&n.trash)return '<div class="banner"><span>Bu not silinenler arasında. Düzenlemek için geri al.</span></div><div class="card"><div class="t" style="font-weight:700;font-size:1.125rem">'+esc(n.title||'Başlıksız')+'</div><p style="white-space:pre-wrap;margin:8px 0 0">'+esc(noteText(n))+'</p></div><button class="btn" data-act="note-restore">Geri al</button><button class="btn danger" data-act="note-purge">Kalıcı olarak sil</button>';
  var ed=n?new Date(n.ts):null,t0=today0();
  return '<div class="kp"><input id="n-title" class="ktitle" data-nf="title" value="'+esc(d.title)+'" placeholder="Başlık" aria-label="Başlık" autocomplete="off">'
   +(d.list?'<div id="kl" class="kl">'+kItems()+'</div>':'<textarea id="n-body" class="kbody" data-nf="body" placeholder="Not" aria-label="Not">'+esc(d.body)+'</textarea>')+'</div>'
   +'<div class="kbar kedit"><button class="icon-btn" data-act="note-color" aria-label="Not rengi" title="Renk">'+ic('palette')+'</button><button class="icon-btn" data-act="note-list" aria-pressed="'+d.list+'" aria-label="'+(d.list?'Onay kutularını kaldır':'Onay kutuları ekle')+'" title="Liste">'+ic('check')+'</button>'
   +'<span class="ked">'+(ed?'Düzenlendi '+esc(ed>=t0?ed.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):ed.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})):'')+'</span>'
   +'<button class="icon-btn" data-act="note-more" aria-label="Diğer işlemler" title="Diğer">'+ic('more')+'</button></div>';
}
function kSync(){var d=ui.page.draft;ui.page.dirty=true;var c=document.querySelector('.kp');if(c)c.className='kp';applyNoteColor();}
function applyNoteColor(){var p=ui.page,c=p&&p.k==='note'&&p.draft?p.draft.color:'';
  if(c)document.documentElement.setAttribute('data-nc',c);else document.documentElement.removeAttribute('data-nc');}
function kRender(focus,end){var k=document.getElementById('kl');if(!k)return;k.innerHTML=kItems();if(focus!=null)kFocus(focus,end);}
function kFocus(i,end){var e=document.querySelector('[data-ki="'+i+'"]');if(e){e.focus();if(end!==false)try{e.setSelectionRange(e.value.length,e.value.length);}catch(x){}}}
function kGrow(e){if(!e)return;e.style.height='auto';e.style.height=Math.max(e.scrollHeight,window.innerHeight*0.45)+'px';}
ACT['note-pin']=function(){var p=ui.page;p.draft.pin=!p.draft.pin;p.dirty=true;var b=document.querySelector('[data-act="note-pin"]');if(b)b.setAttribute('aria-pressed',String(p.draft.pin));toast(p.draft.pin?'Not sabitlendi':'Sabitleme kaldırıldı');};
ACT['note-color']=function(){var d=ui.page.draft;
  openSheet('<h2>Renk</h2><div class="kcols">'+NCOL.map(function(x){return '<button class="kcol'+ncls(x[0])+(x[0]?'':' none')+'" data-act="note-col" data-v="'+x[0]+'" aria-pressed="'+(d.color===x[0])+'" aria-label="'+x[1]+'" title="'+x[1]+'">'+(d.color===x[0]?ic('check'):'')+'</button>';}).join('')+'</div>');};
ACT['note-col']=function(el,id,v){var p=ui.page;if(!p||p.k!=='note')return;p.draft.color=v||'';p.dirty=true;closeSheet();applyNoteColor();};
ACT['note-list']=function(){var p=ui.page,d=p.draft;
  if(!d.list){var ls=String(d.body||'').split('\n').map(function(s){return s.replace(/^\s*([-*•]|\[ ?x?\])\s*/i,'').trim();}).filter(Boolean);d.items=ls.length?ls.map(function(s){return {t:s,c:false};}):[{t:'',c:false}];d.list=true;}
  else{d.body=d.items.map(function(i){return i.t;}).filter(function(t){return String(t).trim();}).join('\n');d.list=false;}
  p.dirty=true;render();if(d.list)kFocus(Math.max(0,d.items.length-1));};
ACT['ki-add']=function(){var d=ui.page.draft,un=d.items.filter(function(i){return !i.c;}).length;var at=0,seen=0;
  for(var i=0;i<d.items.length;i++){if(!d.items[i].c){seen++;at=i+1;}}if(!seen)at=0;d.items.splice(at,0,{t:'',c:false});ui.page.dirty=true;kRender(at);};
ACT['ki-tg']=function(el,id,v){var d=ui.page.draft,it=d.items[+v];if(!it)return;it.c=!it.c;ui.page.dirty=true;kRender();};
ACT['ki-del']=function(el,id,v){var d=ui.page.draft;d.items.splice(+v,1);ui.page.dirty=true;kRender();};
ACT['note-more']=function(){var p=ui.page;
  openSheet('<div class="list">'
   +'<button class="item" data-act="note-trash"><span class="sic" style="--c:var(--exp)">'+ic('trash')+'</span><span class="mid"><div class="t">Sil</div></span></button>'
   +'<button class="item" data-act="note-dup"><span class="sic" style="--c:var(--blue)">'+ic('copy')+'</span><span class="mid"><div class="t">Kopya oluştur</div></span></button>'
   +'<button class="item" data-act="note-copytxt"><span class="sic" style="--c:var(--accent)">'+ic('archive')+'</span><span class="mid"><div class="t">Metni kopyala</div></span></button>'
   +(nb('shareText')||navigator.share?'<button class="item" data-act="note-share"><span class="sic" style="--c:var(--inc)">'+ic('share')+'</span><span class="mid"><div class="t">Gönder</div></span></button>':'')
   +'</div>');};
function draftText(){var d=ui.page.draft;return (d.title?d.title+'\n\n':'')+(d.list?d.items.map(function(i){return (i.c?'☑ ':'☐ ')+i.t;}).join('\n'):d.body);}
ACT['note-copytxt']=function(){var t=draftText();closeSheet();copyTxt(t).then(function(ok){toast(ok?'Not kopyalandı':'Kopyalanamadı');});};
ACT['note-share']=function(){var t=draftText();closeSheet();if(nb('shareText')){try{NB.shareText(t,'Not');}catch(e){}return;}try{navigator.share({text:t}).catch(function(){});}catch(e){}};
ACT['note-dup']=function(){var p=ui.page;closeSheet();p.dirty=true;saveNote();var n=byId(S.notes,p.id);if(!n)return;
  var c=JSON.parse(JSON.stringify(n));c.id=uid();c.ts=c.cts=Date.now();c.pin=false;delete c.sample;S.notes.push(c);save();toast('Kopya oluşturuldu');};
ACT['note-trash']=function(){var p=ui.page;closeSheet();if(!p.id){p.dirty=false;closePage();return;}p.dirty=true;saveNote();var id=p.id;p.dirty=false;closePage();noteSet(id,function(x){x.trash=Date.now();},'Not silindi');};
ACT['note-save']=function(){closePage();};
function saveNote(){
  var p=ui.page;if(!p||p.k!=='note'||!p.dirty)return;
  var d=p.draft,ti=String(d.title||'').trim(),items=d.list?d.items.filter(function(i){return String(i.t).trim();}).map(function(i){return {t:String(i.t),c:!!i.c};}):null,bo=d.list?items.map(function(i){return i.t;}).join('\n'):String(d.body||'');
  var empty=!ti&&!bo.trim();
  if(empty){if(p.id){var e=byId(S.notes,p.id);if(e&&!e.trash){e.trash=Date.now();save();toast('Boş not silindi');}}p.dirty=false;return;}
  var o={title:ti,body:bo,pin:!!d.pin,color:d.color||'',list:!!d.list,items:items||[],arch:false,ts:Date.now()};
  if(p.id){var n=byId(S.notes,p.id);if(n){Object.assign(n,o);if(!o.list)delete n.items;if(!o.color)delete n.color;delete n.sample;}}
  else{o.id=uid();o.cts=o.ts;if(!o.list)delete o.items;if(!o.color)delete o.color;S.notes.push(o);p.id=o.id;}
  p.dirty=false;save();
}
/* liste öğeleri: yazınca kaydet, Enter yeni öğe, boş öğede geri silme öncekine geçer; not alanı yazdıkça uzar */
document.addEventListener('input',function(e){var t=e.target;
  if(t.dataset&&t.dataset.ki!=null&&ui.page&&ui.page.k==='note'){var it=ui.page.draft.items[+t.dataset.ki];if(it){it.t=t.value;ui.page.dirty=true;}}
  if(t.classList&&t.classList.contains('kbody'))kGrow(t);});
document.addEventListener('keydown',function(e){var t=e.target;if(!t.dataset||t.dataset.ki==null||!ui.page||ui.page.k!=='note')return;
  var d=ui.page.draft,i=+t.dataset.ki;
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();var pos=t.selectionStart,txt=t.value;d.items[i].t=txt.slice(0,pos);d.items.splice(i+1,0,{t:txt.slice(pos),c:false});ui.page.dirty=true;kRender(i+1,false);}
  else if(e.key==='Backspace'&&!t.value&&d.items.length>1){e.preventDefault();d.items.splice(i,1);ui.page.dirty=true;var prev=i-1;while(prev>=0&&d.items[prev].c)prev--;kRender(prev>=0?prev:null);}
},true);
/* uygulama arka plana geçerse açık not kaydedilir */
document.addEventListener('visibilitychange',function(){if(document.hidden&&ui.page&&ui.page.k==='note'){saveNote();flushNative();}});
