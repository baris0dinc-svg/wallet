
/* ---------- kullanım kolaylığı ----------
   Sık eklenenler: son 120 günde aynı not, kategori, hesap ve tutarla en az iki kez girilen işlemler.
   Ana sayfada tek dokunuşla bugüne eklenir (Geri al ile), işlem penceresinde formu doldurur.
   Not yazarken önceki notlar önerilir; aynı not daha önce hangi kategoriyle girildiyse o seçilir.
   Kısayollar: Android'de simgeye uzun basınca, PWA'da ana ekran menüsünde Gider / Gelir / Transfer. */
function favKey(t){return [t.type,t.cat,t.acct,fold(t.note||'').trim(),r2(t.amt)].join('|');}
var FQC={v:-1};
function freqTx(n){var k=(S.savedAt||0)+'|'+S.tx.length+'|'+todayS()+'|'+ACCS().join('\u0001');if(FQC.k===k&&FQC.s===S.tx)return FQC.r.slice(0,n||6);var r=freqTx0();FQC={k:k,s:S.tx,r:r};return r.slice(0,n||6);}
function freqTx0(){
  var from=new Date(today0());from.setDate(from.getDate()-120);var f=isoDate(from),m={};
  S.tx.forEach(function(t){if((t.type!=='exp'&&t.type!=='inc')||t.date<f||t.sample||!(t.amt>0))return;var k=favKey(t),x=m[k]||(m[k]={k:k,n:0,last:'',t:t});x.n++;if(t.date>=x.last){x.last=t.date;x.t=t;}});
  return Object.keys(m).map(function(k){return m[k];}).filter(function(x){return x.n>=2&&ACCS().indexOf(x.t.acct)>=0;})
    .sort(function(a,b){return (b.n-a.n)||b.last.localeCompare(a.last);}).slice(0,6);
}
function favLabel(t){return (t.note||t.cat)+' · '+moneyIn(t.amt,t.acct,1);}
function favRow(where){
  var l=freqTx(6);if(!l.length)return '';
  return '<div class="favs'+(where==='sheet'?' insheet':'')+'"><div class="lbl">Sık eklenenler'+(where==='sheet'?'':' · dokun, bugüne eklensin')+'</div><div class="favl">'+l.map(function(x,i){var t=x.t;
    return '<button class="chip fav '+t.type+'" data-act="'+(where==='sheet'?'fav-fill':'fav-add')+'" data-id="'+i+'"><span class="dot" style="background:'+color(t.cat)+'"></span>'+esc(favLabel(t))+'</button>';}).join('')+'</div></div>';
}
ACT['fav-add']=function(el,id){
  var x=freqTx(6)[+id];if(!x)return;var t=x.t,o={id:uid(),type:t.type,amt:t.amt,acct:t.acct,cat:t.cat,date:todayS(),note:t.note||''};if(t.sub&&subsOf(t.cat).indexOf(t.sub)>=0)o.sub=t.sub;
  S.tx.push(o);ui.month=curP();save();render();
  toast((t.note||t.cat)+' eklendi · '+o.acct+': '+moneyIn(acctBal(o.acct),o.acct),function(){S.tx=S.tx.filter(function(z){return z.id!==o.id;});save();render();toast('Geri alındı');});
};
ACT['fav-fill']=function(el,id){
  var x=freqTx(6)[+id];if(!x)return;var t=x.t;
  if(txType!==t.type){var b=document.querySelector('#f-type [data-v="'+t.type+'"]');if(b)b.click();}
  var set=function(i,v){var e=document.getElementById(i);if(e){e.value=v;}};
  set('f-amt',nv(t.amt));set('f-note',t.note||'');set('f-acct',t.acct);
  set('f-sub',t.sub||'');var c=document.getElementById('f-cat');if(c){c.value=t.cat;c.dataset.manual='1';syncCatChips();}
  var a=document.getElementById('f-amt');if(a)a.dispatchEvent(new Event('input',{bubbles:true}));
  var ac=document.getElementById('f-acct');if(ac)ac.dispatchEvent(new Event('change',{bubbles:true}));
};
/* not önerileri: o türde en sık kullanılan 40 not */
function noteList(type){var m={};S.tx.forEach(function(t){if(t.type===type&&t.note){var k=t.note.trim();if(k)m[k]=(m[k]||0)+1;}});
  return Object.keys(m).sort(function(a,b){return m[b]-m[a];}).slice(0,40);}
function noteDl(type){return '<datalist id="note-dl">'+noteList(type).map(function(n){return '<option value="'+esc(n)+'">';}).join('')+'</datalist>';}
/* aynı not daha önce hangi kategoriyle girildiyse */
function noteCat(type,txt){if(!txt||txt.length<3)return null;var best=null;
  S.tx.forEach(function(t){if(t.type!==type||!t.note)return;var f=fold(t.note).trim();if(f===txt||(txt.length>=4&&f.indexOf(txt)===0)){if(!best||t.date>best.date)best=t;}});
  return best&&best.cat;}
/* uygulama kısayolları ve adres kısayolları: gider, gelir, transfer (eski "sesle" kısayolu gider penceresini açar) */
var INTENTS={exp:function(){txSheet(null,'exp');},inc:function(){txSheet(null,'inc');},trf:function(){ACT['qa-trf']();},voice:function(){txSheet(null,'exp');}};
function runIntent(){var a=ui.intent;if(!a||ui.locked)return;ui.intent=null;if(!INTENTS[a])return;
  if(ui.page){finishPage();ui.page=null;}if(location.hash){try{history.replaceState(history.state,'',location.pathname+location.search);}catch(e){}}ui.sub='ev';render();INTENTS[a]();}
window.walletIntent=function(a){ui.intent=String(a||'').replace(/^wallet:\/*/,'').replace(/^yeni-/,'');setTimeout(runIntent,50);};
