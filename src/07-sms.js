
/* ---------- banka SMS'lerinden otomatik işlem ----------
   Android uygulaması gelen SMS'leri ham olarak verir; ayrıştırma burada yapılır, böylece yeni banka biçimleri
   APK güncellemeden eklenebilir. Hiçbir SMS cihaz dışına gönderilmez. */
var SMS_SKIP=/(sifre|parola|dogrulama|onay kodu|guvenlik kodu|tek kullanimlik|otp|3d secure|3d sifre|kodunuz|kodu:|code)/;
var SMS_STMT=/(son odeme tarihi|hesap kesim|ekstre|donem borcu|asgari odeme|asgari tutar|borc bilgisi)/;
var SMS_AD=/(kampanya|firsat|kazanma sansi|indirim kodu|basvur|kredi teklif|onayli limit|limitiniz artir|faizsiz|cekilis|hediye|ozel teklif)/;
var SMS_NOTAMT=/(bakiye|limit|kullanilabilir|asgari|toplam borc|bonus|puan|chip|worldpuan|maxipuan|parafpara|kalan)\W{0,3}[^\d]{0,18}$/;
var SMS_STOP={tarihinde:1,tarihli:1,saat:1,saatinde:1,kartinizla:1,kartinizdan:1,kartiniz:1,kartinla:1,kartindan:1,karti:1,kart:1,ile:1,biten:1,sonlanan:1,nolu:1,numarali:1,tl:1,try:1,usd:1,eur:1,tutarinda:1,tutarli:1,tutarindaki:1,islem:1,harcama:1,yapilmistir:1,yaptiniz:1,hesabinizdan:1,hesabiniza:1,taksit:1,taksitli:1,pesin:1,sayin:1,musterimiz:1,de:1,da:1,ve:1,icin:1,olarak:1,bankamatik:1,kredi:1,banka:1,'kartiniz ile':1};
var SMS_CAT=[
 ['Market',/(migros|a101|\bbim\b|sok market|\bsok\b|carrefour|file market|macrocenter|metro grossmarket|hakmar|onur market|kim market|tarim kredi|getir\b|happy center|bizim toptan)/],
 ['Ulaşım',/(opet|shell|\bbp\b|petrol ofisi|total ?energies|aytemiz|akaryakit|istanbulkart|belbim|\buber\b|bitaksi|taksi|otopark|\bthy\b|turk hava|pegasus|ajet|obilet|\bido\b|marti|\bhgs\b|\bogs\b|otoyol)/],
 ['Yeme-İçme',/(yemeksepeti|getir yemek|trendyol yemek|migros yemek|starbucks|kahve|cafe|kafe|restoran|restaurant|burger|pizza|domino|mcdonald|\bkfc\b|simit|doner|lokanta|pastane|baklava|kofteci)/],
 ['Fatura',/(turkcell|vodafone|turk telekom|ttnet|superonline|turknet|igdas|enerjisa|ck enerji|ayedas|bedas|\biski\b|\baski\b|izsu|dogalgaz|elektrik|su idaresi|fatura|d-smart|digiturk)/],
 ['Sağlık',/(eczane|hastane|saglik|klinik|medical|doktor|\bdis\b|optik)/],
 ['Eğlence',/(netflix|spotify|youtube|disney|blutv|exxen|steam|playstation|sinema|cinemaximum|apple\.com|google play|amazon prime|\btod\b|\bgain\b)/],
 ['Giyim',/(lcw|lc waikiki|defacto|koton|zara|h&m|mavi|boyner|\bflo\b|mango|pull ?& ?bear|bershka|ipekyol|network|collezione|kigili)/],
 ['Eğitim',/(kirtasiye|kitap|udemy|okul|universite|dershane|kurs)/],
 ['Kira',/(\bkira\b)/],
 ['Maaş',/(maas|ucret odemesi)/]
];
function smsHash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36);}
/* başlık biçimi: Türkçe büyük harf yoksa (MIGROS gibi ASCII) I→i kuralıyla küçült */
function titleTr(s){s=String(s);var tr=/[İŞĞÇÖÜışğçöü]/.test(s),lo=tr?s.toLocaleLowerCase('tr-TR'):s.toLowerCase();return lo.replace(/(^|[\s\-\/&])(\S)/g,function(m,a,b){return a+(tr?b.toLocaleUpperCase('tr-TR'):b.toUpperCase());});}
function smsAmounts(b){
  var re=/(?:(TL|TRY|₺|USD|EUR|\$|€)\s?)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?:\s?(TL|TRY|₺|USD|EUR|\$|€))?(?![\d])/gi,m,out=[];
  while((m=re.exec(b))){var cur=String(m[1]||m[3]||'').toUpperCase();if(!cur)continue;
    var before=fold(b.slice(Math.max(0,m.index-32),m.index));if(SMS_NOTAMT.test(before))continue;
    var v=num(m[2]);if(!(v>0))continue;out.push({v:r2(v),c:(cur==='USD'||cur==='$')?'USD':((cur==='EUR'||cur==='€')?'EUR':'TRY'),i:m.index});}
  return out;
}
function smsMerchant(b){
  var m,seg=null;
  if((m=b.match(/(?:i̇|i|ı|I|İ)[sş]yer(?:i|ı|İ|I)\s*[:\-]\s*([^,.;\n]{2,40})/)))return titleTr(m[1].trim());
  if((m=b.match(/a[cç][ıi]klama\s*[:\-]\s*([^,.;\n]{2,40})/i)))return titleTr(m[1].trim());
  if((m=b.match(/^(.{1,90}?)\s*(?:üye\s+|uye\s+)?(?:i̇|i|ı|I|İ)[sş]yer(?:i|ı|İ|I)n(?:den|de|e)\b/i)))seg=m[1];
  else if((m=b.match(/^(.{1,90}?)['’](?:den|dan|ten|tan|de|da|te|ta)\b/i)))seg=m[1];
  else if((m=b.match(/^(.{1,90}?)\s+(?:alisverisi|alışverişi|harcamasi|harcaması)/i)))seg=m[1];
  if(!seg)return '';
  var w=seg.trim().split(/\s+/),out=[];
  for(var i=w.length-1;i>=0&&out.length<4;i--){var x=w[i].replace(/^[("'*]+|[)"',:;*]+$/g,''),fx=fold(x);if(!x||/\d{2}[.:\/]\d{2}/.test(x)||/^\d+([.,]\d+)?$/.test(x)||SMS_STOP[fx])break;out.unshift(x);}
  return out.length?titleTr(out.join(' ')).slice(0,40):'';
}
function smsCat(note,type){
  var n=fold(note),l=type==='inc'?INCC():EXPC();
  var r=S.rules.filter(function(x){return x.kw&&n.indexOf(fold(x.kw))>-1&&l.indexOf(x.cat)>=0;})[0];if(r)return r.cat;
  for(var i=0;i<SMS_CAT.length;i++){if(SMS_CAT[i][1].test(n)&&l.indexOf(SMS_CAT[i][0])>=0)return SMS_CAT[i][0];}
  return type==='inc'?(l.indexOf('Diğer gelir')>=0?'Diğer gelir':l[l.length-1]):(l.indexOf('Diğer')>=0?'Diğer':l[l.length-1]);
}
/* tek SMS'i çözümle: null → işlem değil */
function smsParse(body,from,ts){
  var b=String(body||'').replace(/\s+/g,' ').trim(),f=fold(b);if(b.length<12)return null;
  if(SMS_SKIP.test(f))return {skip:'Doğrulama/şifre mesajı'};
  if(SMS_STMT.test(f))return {skip:'Ekstre ya da borç bildirimi'};
  var am=smsAmounts(b);if(!am.length)return {skip:'Tutar bulunamadı'};
  var kind=null,out=/(hesabinizdan|hesabindan|kartinizdan|kartinizla|kartiniz ile|kartinla|kartindan|harcama|alisveris|odeme yap|odemeniz|odemesi|islem yapil|isleminiz|islem gerceklesti|cekil|cekim|para cek|tahsil|satin al|provizyon|harcadin|gonderil|gonderdin|transfer edil|havale yapil|eft yapil|otomatik odeme)/,
      inc=/(hesabiniza|hesabina|kartiniza|yatiril|yatirdi|gelen (eft|havale|fast|para|transfer)|gelmistir|hesabiniza gecti|para girisi|alacak kaydedil|maas|ucret odemesi)/;
  if(/\batm\b/.test(f)&&/cek/.test(f))kind='atm';
  else if(/(kart(i|inizin|in)? borcu(na|nuza|nuz)|kredi karti (borc )?odemesi|kart borc odeme|kartiniza .*odeme)/.test(f))kind='cardpay';
  else if(/iade/.test(f))kind='inc';
  else if(inc.test(f)&&!/(hesabinizdan|kartinizdan|kartinizla|hesabindan)/.test(f))kind='inc';
  else if(out.test(f))kind='exp';
  if(!kind)return {skip:'İşlem türü anlaşılamadı'};
  if(SMS_AD.test(f)&&!/(yapilmistir|gerceklesti|yatirilmistir|cekilmistir|gonderilmistir)/.test(f))return {skip:'Reklam mesajı'};
  var a=am[0],last4=(b.match(/(\d{4})\s*(?:ile biten|ile sonlanan|ile baslayan|nolu|no'lu|no.lu|numaral[ıi]|sonlu)/i)||b.match(/[*xX]{2,}\s?(\d{4})/)||[])[1]||'';
  var d=ts?new Date(+ts):new Date(),date=isoDate(new Date(d.getFullYear(),d.getMonth(),d.getDate())),bm=b.match(/(\d{2})[.\/](\d{2})[.\/](\d{4})/);
  if(bm){var bd=bm[3]+'-'+bm[2]+'-'+bm[1];if(!isNaN(pdate(bd))&&daysBetween(bd,date)>=0&&daysBetween(bd,date)<=31)date=bd;}
  var merch=kind==='atm'||kind==='cardpay'?'':smsMerchant(b),src=String(from||'').trim();
  return {kind:kind,amt:a.v,ccy:a.c,date:date,merchant:merch,last4:last4,from:src,raw:b};
}
function smsMapKey(p,withCard){var s=fold(p.from||'sms');return withCard&&p.last4?s+'|'+p.last4:s;}
function smsGuessAcct(p){
  var m=S.sms.map,acc=ACCS(),k1=smsMapKey(p,1),k2=smsMapKey(p,0),f=fold(p.raw);
  if(p.last4&&m[k1]&&acc.indexOf(m[k1])>=0)return {a:m[k1],sure:true};
  if(!p.last4&&m[k2]&&acc.indexOf(m[k2])>=0)return {a:m[k2],sure:true};
  var kart=acc.filter(function(x){return acctType(x)==='kart';}),bank=acc.filter(function(x){return acctType(x)==='banka';});
  if(/kredi kart|kartiniz|kartinla/.test(f)&&p.kind!=='cardpay'&&p.kind!=='atm'&&kart.length&&!/banka kart|bankamatik/.test(f))return {a:kart[0],sure:false};
  if(m[k2]&&acc.indexOf(m[k2])>=0)return {a:m[k2],sure:false};
  return {a:bank[0]||defAcct('exp'),sure:false};
}
/* gelen ham SMS listesini bekleyenlere ekler; döner: eklenen sayı */
function smsIngest(list,opt){
  opt=opt||{};var added=0,auto=0,seen={};S.sms.seen.forEach(function(k){seen[k]=1;});
  (list||[]).forEach(function(m){
    var body=String(m.body||''),key=fold(m.from||'')+'|'+isoDate(new Date(+m.ts||Date.now()))+'|'+smsHash(body);
    if(seen[key])return;seen[key]=1;S.sms.seen.push(key);
    var p=smsParse(body,m.from,m.ts);if(!p||p.skip)return;
    var g=smsGuessAcct(p),acc=ACCS(),cash=acc.filter(function(x){return acctType(x)==='nakit';})[0],kart=acc.filter(function(x){return acctType(x)==='kart';})[0];
    var it={id:uid(),key:key,kind:p.kind,oamt:p.amt,occy:p.ccy,date:p.date,note:p.merchant,from:p.from,last4:p.last4,raw:p.raw,acct:g.a,sure:g.sure};
    if(p.kind==='atm'){it.to=cash||'';it.acct=g.sure?g.a:(acc.filter(function(x){return acctType(x)==='banka';})[0]||g.a);}
    if(p.kind==='cardpay'){it.to=kart||'';it.acct=acc.filter(function(x){return acctType(x)==='banka';})[0]||g.a;}
    it.cat=it.kind==='exp'||it.kind==='inc'?smsCat(p.merchant+' '+p.raw,it.kind):'Transfer';it.sugCat=it.cat;
    it.dup=S.tx.some(function(t){return t.date===it.date&&Math.abs(txTL(t)-smsTL(it,it.acct))<0.01&&(t.type===it.kind||t.type==='trf'&&(it.kind==='atm'||it.kind==='cardpay'));});
    if(S.sms.auto&&it.sure&&!it.dup&&(it.kind==='exp'||it.kind==='inc')){if(smsCommit(it,{}))auto++;return;}
    S.sms.pend.push(it);added++;});
  if(S.sms.seen.length>1500)S.sms.seen=S.sms.seen.slice(-1200);
  if(added||auto||list&&list.length)save();
  return {added:added,auto:auto};
}
/* SMS tutarını hesabın para birimine çevirir */
function smsTL(it,acct){return it.occy==='TRY'?it.oamt:it.oamt*rateOf(it.occy);}
function smsAmtFor(it,acct){var c=ccyOf(acct);if(c===it.occy)return it.oamt;var tl=smsTL(it),r=rateOf(c);return r>0?r2(tl/r):0;}
/* bekleyen öğeyi işleme dönüştürür; o: kullanıcı seçimleri */
var smsErr='';
function smsCommit(it,o){
  var acct=o.acct||it.acct,to=o.to!=null?o.to:it.to,cat=o.cat||it.cat,note=(o.note!=null?o.note:it.note)||'';
  smsErr='Hesapları kontrol et (transferde iki farklı hesap gerekir).';if(ACCS().indexOf(acct)<0)return false;var amt=smsAmtFor(it,acct);if(!(amt>0)){smsErr='Döviz kuru yok; üstteki yenile düğmesiyle kurları güncelle.';return false;}
  var t={id:uid(),amt:amt,acct:acct,date:it.date,note:note,sms:1};
  if(it.kind==='atm'||it.kind==='cardpay'){if(!to||to===acct||ACCS().indexOf(to)<0)return false;t.type='trf';t.to=to;t.cat='Transfer';if(ccyOf(to)!==ccyOf(acct))t.amt2=smsAmtFor(it,to);if(!t.note)t.note=it.kind==='atm'?'ATM para çekme':'Kart borcu ödemesi';}
  else{t.type=it.kind;t.cat=cat;}
  if(it.occy!==ccyOf(acct)&&it.kind!=='atm')t.note=(t.note?t.note+' ':'')+'('+fmtC(it.oamt,it.occy,1)+')';
  S.tx.push(t);
  S.sms.map[smsMapKey(it,1)]=acct;if(it.last4)S.sms.map[smsMapKey(it,0)]=S.sms.map[smsMapKey(it,0)]||acct;
  var kw=fold(it.note||'').trim();if((t.type==='exp'||t.type==='inc')&&kw.length>=3&&cat!==it.sugCat&&!S.rules.some(function(r){return fold(r.kw)===kw;}))S.rules.push({kw:kw,cat:cat});
  return true;
}
function pullSms(){
  if(!nb('smsQueue'))return;var raw='[]';try{raw=NB.smsQueue()||'[]';}catch(e){return;}
  var l;try{l=JSON.parse(raw);}catch(e){l=[];}if(!l.length)return;
  var r=smsIngest(l);try{NB.smsAck(JSON.stringify(l.map(function(m){return m.id;})));}catch(e){}
  if((r.added||r.auto)&&!busy()&&!ui.page)render();
  if(r.auto)toast(r.auto+' işlem banka SMS’inden eklendi');
}
window.walletSms=function(){pullSms();};
function smsBanner(){var n=S.sms.pend.length;if(!n)return '';return '<button class="banner smsb" data-act="sms-review"><span class="sic sm" style="--c:var(--accent)">'+ic('msg')+'</span><span class="mid"><b>'+n+' işlem</b> banka SMS’lerinden bulundu</span><span class="pill">İncele ›</span></button>';}
function smsItem(it){
  var acc=ACCS(),lbl={exp:'Gider',inc:'Gelir',atm:'ATM’den nakit',cardpay:'Kart borcu ödemesi'}[it.kind],trf=it.kind==='atm'||it.kind==='cardpay',cl=it.kind==='inc'?'inc':(trf?'':'exp');
  var cats=it.kind==='inc'?INCC():EXPC();
  return '<div class="card smsit" data-sid="'+it.id+'"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span class="mid"><span class="pill">'+lbl+'</span> <span class="small muted">'+esc(pdate(it.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long'}))+' · '+esc(it.from||'SMS')+(it.last4?' · *'+esc(it.last4):'')+'</span></span><b class="num '+cl+'">'+(it.kind==='inc'?'+':(trf?'':'−'))+fmtC(it.oamt,it.occy,1)+'</b></div>'
   +(it.dup?'<div class="small" style="color:var(--warn)">Aynı gün aynı tutarda bir işlem zaten var; tekrar olabilir.</div>':'')
   +'<div class="two"><div class="field"><label for="sn-'+it.id+'">Not</label><input id="sn-'+it.id+'" value="'+esc(it.note||'')+'" placeholder="İsteğe bağlı"></div>'
   +(trf?'':'<div class="field"><label for="sc-'+it.id+'">Kategori</label><select id="sc-'+it.id+'">'+optsKeep(cats,it.cat)+'</select></div>')+'</div>'
   +'<div class="two"><div class="field"><label for="sa-'+it.id+'">'+(trf?'Çıkış hesabı':'Hesap')+'</label><select id="sa-'+it.id+'">'+acctOpts(it.acct)+'</select></div>'
   +(trf?'<div class="field"><label for="st-'+it.id+'">Giriş hesabı</label><select id="st-'+it.id+'">'+acctOpts(it.to,'Seç')+'</select></div>':'')+'</div>'
   +'<details><summary class="small muted">SMS metni</summary><p class="small muted" style="margin:4px 0 0;overflow-wrap:anywhere">'+esc(it.raw)+'</p></details>'
   +'<div class="err" id="se-'+it.id+'"></div><div class="two"><button class="btn small" style="width:100%" data-act="sms-add" data-id="'+it.id+'">Ekle</button><button class="btn small ghost" style="width:100%" data-act="sms-skip" data-id="'+it.id+'">Yoksay</button></div></div>';
}
function smsSheet(){
  var l=S.sms.pend;if(!l.length){closeSheet();return;}
  openSheet('<h2>SMS’ten bulunan işlemler</h2><p class="small muted" style="margin:0">Kontrol et, gerekirse hesabı ya da kategoriyi değiştir ve ekle. Seçtiğin hesap bu kart için hatırlanır.</p>'
   +l.slice(0,25).map(smsItem).join('')+(l.length>25?'<div class="small muted">+'+(l.length-25)+' işlem daha</div>':'')
   +'<div class="two"><button class="btn" data-act="sms-all">Hepsini ekle</button><button class="btn ghost" data-act="sms-none">Hepsini yoksay</button></div>');
}
function smsPick(it){var g=function(p){var e=document.getElementById(p+it.id);return e?e.value:null;};return {acct:g('sa-'),to:g('st-'),cat:g('sc-'),note:g('sn-')};}
ACT['sms-review']=function(){smsSheet();};
ACT['sms-add']=function(el,id){var it=byId(S.sms.pend,id);if(!it)return;if(!smsCommit(it,smsPick(it))){var e=document.getElementById('se-'+id);if(e)e.textContent=smsErr;return;}
  S.sms.pend=S.sms.pend.filter(function(x){return x.id!==id;});save();render();if(S.sms.pend.length)smsSheet();else{closeSheet();toast('İşlem eklendi');}};
ACT['sms-skip']=function(el,id){S.sms.pend=S.sms.pend.filter(function(x){return x.id!==id;});save();render();if(S.sms.pend.length)smsSheet();else closeSheet();};
ACT['sms-all']=function(){var n=0,keep=[];S.sms.pend.forEach(function(it){if(smsCommit(it,smsPick(it)))n++;else keep.push(it);});S.sms.pend=keep;save();render();if(keep.length)smsSheet();else closeSheet();toast(n+' işlem eklendi'+(keep.length?', '+keep.length+' tanesi için hesap seç':''));};
ACT['sms-none']=function(el){if(!armed(el))return;S.sms.pend=[];save();render();closeSheet();};
ACT['sms-perm']=function(){if(nb('askSms')){try{NB.askSms();}catch(e){}}};
ACT['sms-scan']=function(){
  if(!nb('smsScan')){msg('Bu özellik Android uygulamasında çalışır.',false,'f-sms');return;}
  if(smsState()!=='granted'){msg('Önce SMS izni ver.',false,'f-sms');return;}
  var l=[];try{l=JSON.parse(NB.smsScan(30)||'[]');}catch(e){}
  var r=smsIngest(l);render();msg(l.length+' SMS tarandı: '+r.added+' işlem onay bekliyor'+(r.auto?', '+r.auto+' işlem eklendi':'')+'.',true,'f-sms');
};
ACT['sms-parse']=function(){
  var t=val('sms-txt').trim();if(!t){msg('SMS metnini yapıştır.',false,'f-sms2');return;}
  var p=smsParse(t,val('sms-from')||'SMS',Date.now());
  if(!p||p.skip){msg('Bu mesaj işlem olarak tanınmadı'+(p&&p.skip?': '+p.skip:'')+'.',false,'f-sms2');return;}
  var n0=S.sms.pend.length,r=smsIngest([{id:'m'+Date.now(),from:val('sms-from')||'SMS',body:t,ts:Date.now()}]);
  if(!r.added&&!r.auto){msg('Bu mesaj daha önce işlendi.',false,'f-sms2');return;}
  msg('Tanındı: '+({exp:'gider',inc:'gelir',atm:'ATM’den nakit',cardpay:'kart borcu ödemesi'})[p.kind]+' · '+fmtC(p.amt,p.ccy,1)+(p.merchant?' · '+p.merchant:'')+'.',true,'f-sms2');
  if(S.sms.pend.length>n0)smsSheet();
};
ACT['sms-map-del']=function(el,id){delete S.sms.map[id];save();render();};
function smsState(){if(nb('smsState')){try{return NB.smsState();}catch(e){}}return 'yok';}
function setOto(){
  var st=smsState(),native=nb('smsQueue'),mk=Object.keys(S.sms.map);
  var main=native?tgl('sms.on','Banka SMS’lerini yakala','Kart harcaması, gelen para, ATM ve kart borcu ödemesi SMS’leri işlem önerisi olur')
      +(st==='granted'?'<div class="small inc">SMS izni verildi.</div>':'<button class="btn ghost" data-act="sms-perm">SMS izni ver</button>'+(st==='denied'?'<div class="small muted">İzin verilemiyorsa: Telefon Ayarları › Uygulamalar › Wallet › sağ üstteki ⋮ › “Kısıtlanmış ayarlara izin ver”, sonra tekrar dene.</div>':''))
      +tgl('sms.auto','Onay beklemeden ekle','Daha önce hesabını eşleştirdiğin kartların harcamaları doğrudan eklenir')
      +'<button class="btn ghost" data-act="sms-scan">Son 30 günün SMS’lerini tara</button><div class="err" id="f-sms"></div>'
    :'<p class="small muted" style="margin:0">Otomatik yakalama Android uygulamasında çalışır. Burada bir banka SMS’ini yapıştırarak tanımayı deneyebilirsin.</p>';
  return sec('Banka SMS’lerinden otomatik işlem',main,'SMS’ler yalnızca telefonunda okunur, hiçbir yere gönderilmez. Şifre ve doğrulama kodu içeren mesajlar yok sayılır.')
   +sec('SMS metnini yapıştır','<div class="field"><label for="sms-from">Gönderen</label><input id="sms-from" placeholder="Örn. AKBANK"></div><div class="field"><label for="sms-txt">Mesaj</label><textarea id="sms-txt" placeholder="Bankadan gelen harcama ya da para girişi SMS’ini buraya yapıştır"></textarea></div><div class="err" id="f-sms2"></div><button class="btn ghost" data-act="sms-parse">Çözümle ve ekle</button>','Tanınmayan bir mesaj olursa bana gönder; biçimi eklenir.')
   +(mk.length?sec('Kart ve hesap eşleşmeleri','<div class="list">'+mk.map(function(k){var p=k.split('|');return '<div class="item"><span class="mid"><div class="t">'+esc(p[0].toLocaleUpperCase('tr-TR'))+(p[1]?' · *'+esc(p[1]):'')+'</div><div class="small muted">'+esc(S.sms.map[k])+'</div></span><button class="btn small ghost" data-act="sms-map-del" data-id="'+esc(k)+'">Sil</button></div>';}).join('')+'</div>','Eklediğin her SMS işleminde seçtiğin hesap bu karta bağlanır.'):'');
}
