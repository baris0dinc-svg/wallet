
/* ---------- Sesle ekle ----------
   Telefonun ses tanıması metne çevirir ("markete 250 lira", "maaşım 45 bin yattı");
   tutar, tür ve kategori çıkarılır, işlem penceresi dolu açılır. Kullanıcı görmeden hiçbir şey kaydedilmez.
   Uygulamada Android'in ses tanıması (Google), tarayıcıda Web Speech API kullanılır. */
var NUMW={sifir:0,bir:1,iki:2,uc:3,dort:4,bes:5,alti:6,yedi:7,sekiz:8,dokuz:9,on:10,yirmi:20,otuz:30,kirk:40,elli:50,altmis:60,yetmis:70,seksen:80,doksan:90};
var NUMM=['milyon','yetmis','seksen','doksan','altmis','sifir','sekiz','dokuz','yirmi','bucuk','otuz','kirk','elli','yedi','dort','alti','iki','bir','bes','bin','yuz','uc','on'];
/* "ikibinbeşyüz", "elliye", "yüzlük" gibi bitişik ya da ekli sayı sözcüklerini parçalara ayır; sayı değilse null */
function numMorph(t){var out=[],i=0;
  while(i<t.length){var m=NUMM.filter(function(x){return t.substr(i,x.length)===x;})[0];if(!m)break;out.push(m);i+=m.length;}
  if(!out.length)return null;var rest=t.slice(i);
  if(rest&&!/^(lik|luk|ye|ya|e|a|lira|liralik|tl|tllik)$/.test(rest))return null;
  /* tek parça + yönelme eki ('ona', 'bire', 'üçe') sayı değil zamir/ek olabilir: 'ona verdim', 'bire bir' */
  if(out.length===1&&/^(e|a|ye|ya)$/.test(rest)&&/^(on|bir|uc|iki|alti)$/.test(out[0]))return null;
  return out;}
function voiceAmt(text){
  /* sayı öbeklerini bul; "lira/TL/₺" ile birlikte söyleneni, yoksa en büyüğünü al ("bir kahve 80 lira" → 80) */
  var src=fold(text).replace(/₺/g,' tl ').replace(/(\d)['’]?(?=[a-z])/g,'$1 ').replace(/([a-z])(?=\d)/g,'$1 ');
  var w=src.split(/\s+/).filter(Boolean),runs=[],tot=0,cur=0,on=false,dec=false;
  var flush=function(nx){if(on){var v=tot+cur;
      if(/^kurus/.test(nx||'')&&runs.length&&runs[runs.length-1].u&&v<100)runs[runs.length-1].v+=v/100;
      else runs.push({v:v,u:/^(tl|lira)/.test(nx||'')});}
    tot=0;cur=0;on=false;dec=false;};
  var add=function(m){if(m==='yuz'){cur=(cur||1)*100;}else if(m==='bin'){tot+=(cur||1)*1000;cur=0;}else if(m==='milyon'){tot+=(cur||1)*1e6;cur=0;}else if(m==='bucuk'){cur+=0.5;}else cur+=NUMW[m];on=true;};
  for(var i=0;i<w.length;i++){var t=w[i].replace(/[^0-9a-z.,]/g,'').replace(/[.,]$/,'');
    if(dec&&/^\d{1,2}$/.test(t)){cur+=parseInt(t,10)/Math.pow(10,t.length);dec=false;continue;}
    if(t==='virgul'&&on){dec=true;continue;}
    if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(t)){cur+=parseFloat(t.replace(/\./g,'').replace(',','.'));on=true;continue;}
    if(/^\d+([.,]\d{1,2})?$/.test(t)){cur+=parseFloat(t.replace(',','.'));on=true;continue;}
    if(t==='bucuk'&&!on){flush(t);continue;}
    var mm=numMorph(t);if(mm){mm.forEach(add);if(/(lira|tl)/.test(t.slice(mm.join('').length))){flush('tl');}continue;}
    flush(t);}
  flush('');
  var u=runs.filter(function(r){return r.u;})[0];if(u)return r2(u.v);
  return r2(runs.reduce(function(a,r){return Math.max(a,r.v);},0));
}
var VINC=/maas|gelir|kazand|yatti|(para|maas|ucret|odeme|kira|havale|eft|prim)[a-z]* geldi|ikramiye|prim\b|harclik|iade|burs|kira geliri|odeme aldim|alacak/;
/* hesap adı geçiyorsa ("kredi kartından", "ziraatten", "nakite"): en uzun eşleşen ad; ekli hâller de yakalanır */
function voiceAccts(n){var out=[];ACCS().forEach(function(a){var f=fold(a).trim();if(f.length<3)return;var stem=f.length>5?f.slice(0,f.length-1):f,i=n.indexOf(stem);if(i>-1)out.push({a:a,i:i,l:f.length});});
  if(!out.length){var ty={nakit:/nakit|cuzdan|cebimden/,kart:/kredi karti|kartla|karttan|kartimdan/,banka:/bankadan|hesabimdan/};Object.keys(ty).forEach(function(t){var m=n.match(ty[t]);if(m){var a=ACCS().filter(function(x){return acctType(x)===t&&!ax(x).arch;})[0];if(a)out.push({a:a,i:m.index,l:3});}});}
  return out.sort(function(x,y){return x.i-y.i||y.l-x.l;}).filter(function(x,i,arr){return arr.findIndex(function(z){return z.a===x.a;})===i;});}
function voiceParse(text){
  var n=fold(text||''),atm=/\b(para )?cektim\b|atm(den)?\b|bankamatik/.test(n),trf=atm||(/\btransfer|aktar|gonder|yatir(dim|)\b.*\b(hesab|kart)|\b(e|a|ye|ya) (para )?(gecir|at)/.test(n)&&!/maas|gelir/.test(n)),type=trf?'trf':(VINC.test(n)?'inc':'exp'),amt=voiceAmt(text||'');
  /* kategori aranırken hesap sözleri çıkarılır ("kredi kartından" Kredi kategorisi sanılmasın) */
  var nc=n.replace(/kredi kart\w*|kart(tan|la|imdan|ımdan)\b|nakit\w*|banka\w*|hesab\w*|cuzdan\w*/g,' ');voiceAccts(n).forEach(function(x){var f=fold(x.a).trim();if(f.length>=3)nc=nc.split(f.length>5?f.slice(0,f.length-1):f).join(' ');});
  var l=type==='inc'?INCC():EXPC(),cat=type==='trf'?'Transfer':(l.filter(function(c){var f=fold(c);return f.length>2&&nc.indexOf(f.slice(0,Math.max(4,f.length-2)))>-1;})[0]||smsCat(nc,type));
  /* tarih: dün, evvelsi gün / önceki gün */
  var dt=null,d0=today0();if(/\b(evvelsi gun|onceki gun|dunden once)\b/.test(n)){d0.setDate(d0.getDate()-2);dt=isoDate(d0);}else if(/\bdun\b/.test(n)){d0.setDate(d0.getDate()-1);dt=isoDate(d0);}
  else{/* "geçen cuma", "salı günü": en yakın geçmiş gün */var WD=['pazar','pazartesi','sali','carsamba','persembe','cuma','cumartesi'],wm=n.match(/\b(gecen )?(pazartesi|sali|carsamba|persembe|cumartesi|cuma|pazar)\b( gunu)?/);
    if(wm&&(wm[1]||wm[3])){var w=WD.indexOf(wm[2]),back=(d0.getDay()-w+7)%7;if(back===0)back=7;d0.setDate(d0.getDate()-back);dt=isoDate(d0);}}
  /* para birimi: "20 dolar netflix" → dolar hesabı varsa o, yoksa TL karşılığı */
  var cc=/\b(dolar|usd)\b/.test(n)?'USD':(/\b(euro|avro|eur)\b/.test(n)?'EUR':(/\b(sterlin|gbp)\b/.test(n)?'GBP':'')),acs=voiceAccts(n),acct=acs.length?acs[0].a:null,to=null;
  if(type==='trf'){acct=acs[0]?acs[0].a:null;to=acs[1]?acs[1].a:null;
    /* bankadan para çekmek: bankadan nakite transfer */if(atm){var na=ACCS().filter(function(x){return acctType(x)==='nakit'&&!ax(x).arch;})[0];if(!acct||acct===na){var bk=ACCS().filter(function(x){return acctType(x)==='banka'&&!ax(x).arch;})[0];acct=bk||acct;}if(!to&&na&&na!==acct)to=na;}}
  var fxNote='';if(cc&&amt>0){var fa=ACCS().filter(function(a){return ccyOf(a)===cc&&!ax(a).arch;})[0];if(!acct||ccyOf(acct)!==cc){if(fa&&type!=='trf')acct=fa;else if(rateOf(cc)>0){fxNote=' ('+NUM2.format(amt)+' '+CCYS_SHORT[cc]+')';amt=r2(amt*rateOf(cc));}}}
  var note=String(text||'').trim();note=note.charAt(0).toLocaleUpperCase('tr-TR')+note.slice(1);
  return {type:type,amt:amt,cat:cat,note:(note+fxNote).slice(0,80),date:dt,acct:acct,to:to};
}
function voiceOk(){if(nb('voiceOk')){try{return NB.voiceOk()==='ok';}catch(e){return false;}}return !!(window.SpeechRecognition||window.webkitSpeechRecognition)&&!nb('saveData');}
function voiceDone(text){
  if(!text){toast('Ses anlaşılamadı. Tekrar dene ya da elle ekle.');return;}
  var p=voiceParse(text);
  txSheet(null,p.type,{amt:p.amt,cat:p.cat,note:p.note,date:p.date||undefined,acct:p.acct||undefined,to:p.to||undefined,title:'Sesle eklenen işlem'});
  var e=document.getElementById('f-amt');if(e&&!(p.amt>0))e.focus();
  msg('Duyulan: “'+text+'”. Kontrol edip kaydet.',true);
}
window.walletVoice=function(text,err){if(err&&!text){if(err!=='iptal')toast(err==='yok'?'Bu telefonda ses tanıma yok.':'Ses alınamadı.');return;}voiceDone(String(text||''));};
ACT.voice=function(){
  if(nb('voice')){try{NB.voice();}catch(e){toast('Ses tanıma açılamadı.');}return;}
  var R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast('Bu tarayıcı sesle eklemeyi desteklemiyor.');return;}
  try{var r=new R();r.lang='tr-TR';r.interimResults=false;r.maxAlternatives=1;
    r.onresult=function(e){voiceDone(e.results[0][0].transcript);};
    r.onerror=function(e){if(e.error==='aborted')return;toast(e.error==='not-allowed'?'Mikrofon izni verilmedi.':(e.error==='no-speech'?'Ses duyulmadı, tekrar dene.':'Ses alınamadı.'));};
    r.start();toast('Dinliyorum… örn. “markete 250 lira”');}catch(e){toast('Ses tanıma açılamadı.');}
};
