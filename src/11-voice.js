
/* ---------- Sesle ekle ----------
   Telefonun ses tanıması metne çevirir ("markete 250 lira", "maaşım 45 bin yattı");
   tutar, tür ve kategori çıkarılır, işlem penceresi dolu açılır. Kullanıcı görmeden hiçbir şey kaydedilmez.
   Uygulamada Android'in ses tanıması (Google), tarayıcıda Web Speech API kullanılır. */
var NUMW={sifir:0,bir:1,iki:2,uc:3,dort:4,bes:5,alti:6,yedi:7,sekiz:8,dokuz:9,on:10,yirmi:20,otuz:30,kirk:40,elli:50,altmis:60,yetmis:70,seksen:80,doksan:90};
function voiceAmt(text){
  /* sayı öbeklerini bul; "lira/TL/₺" ile birlikte söyleneni, yoksa en büyüğünü al ("bir kahve 80 lira" → 80) */
  var w=fold(text).replace(/₺/g,' tl ').split(/\s+/).filter(Boolean),runs=[],tot=0,cur=0,on=false;
  var flush=function(nx){if(on)runs.push({v:tot+cur,u:/^(tl|lira)/.test(nx||'')});tot=0;cur=0;on=false;};
  for(var i=0;i<w.length;i++){var t=w[i].replace(/[^0-9a-z.,]/g,'').replace(/[.,]$/,'');
    if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(t)){cur+=parseFloat(t.replace(/\./g,'').replace(',','.'));on=true;continue;}
    if(/^\d+([.,]\d{1,2})?$/.test(t)){cur+=parseFloat(t.replace(',','.'));on=true;continue;}
    if(NUMW.hasOwnProperty(t)){cur+=NUMW[t];on=true;continue;}
    if(t==='yuz'){cur=(cur||1)*100;on=true;continue;}
    if(t==='bin'){tot+=(cur||1)*1000;cur=0;on=true;continue;}
    if(t==='milyon'){tot+=(cur||1)*1e6;cur=0;on=true;continue;}
    if(t==='bucuk'&&on){cur+=0.5;continue;}
    flush(t);}
  flush('');
  var u=runs.filter(function(r){return r.u;})[0];if(u)return r2(u.v);
  return r2(runs.reduce(function(a,r){return Math.max(a,r.v);},0));
}
var VINC=/maas|gelir|kazand|yatti|geldi|ikramiye|prim\b|harclik|iade|burs|kira geliri|odeme aldim|alacak/;
function voiceParse(text){
  var n=fold(text||''),type=VINC.test(n)?'inc':'exp',amt=voiceAmt(text||'');
  var l=type==='inc'?INCC():EXPC(),cat=l.filter(function(c){var f=fold(c);return f.length>2&&n.indexOf(f.slice(0,Math.max(4,f.length-2)))>-1;})[0]||smsCat(text||'',type);
  var note=String(text||'').trim();note=note.charAt(0).toLocaleUpperCase('tr-TR')+note.slice(1);
  return {type:type,amt:amt,cat:cat,note:note.slice(0,80)};
}
function voiceOk(){if(nb('voiceOk')){try{return NB.voiceOk()==='ok';}catch(e){return false;}}return !!(window.SpeechRecognition||window.webkitSpeechRecognition)&&!nb('saveData');}
function voiceDone(text){
  if(!text){toast('Ses anlaşılamadı. Tekrar dene ya da elle ekle.');return;}
  var p=voiceParse(text);
  txSheet(null,p.type,{amt:p.amt,cat:p.cat,note:p.note,title:'Sesle eklenen işlem'});
  var e=document.getElementById('f-amt');if(e&&!(p.amt>0))e.focus();
  msg('Duyulan: “'+text+'”. Kontrol edip kaydet.',true);
}
window.walletVoice=function(text,err){if(err&&!text){toast(err==='yok'?'Bu telefonda ses tanıma yok.':'Ses alınamadı.');return;}voiceDone(String(text||''));};
ACT.voice=function(){
  if(nb('voice')){try{NB.voice();}catch(e){toast('Ses tanıma açılamadı.');}return;}
  var R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast('Bu tarayıcı sesle eklemeyi desteklemiyor.');return;}
  try{var r=new R();r.lang='tr-TR';r.interimResults=false;r.maxAlternatives=1;
    r.onresult=function(e){voiceDone(e.results[0][0].transcript);};
    r.onerror=function(e){toast(e.error==='not-allowed'?'Mikrofon izni verilmedi.':'Ses alınamadı.');};
    r.start();toast('Dinliyorum… örn. “markete 250 lira”');}catch(e){toast('Ses tanıma açılamadı.');}
};
