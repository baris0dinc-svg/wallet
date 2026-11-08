
/* ---------- form parçaları ---------- */
function fld(label,id,path,kind,ph){var v=getP(path),s=(v===''||v==null)?'':String(v).replace('.',',');return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" inputmode="decimal" data-bind="'+path+'" data-kind="'+kind+'" placeholder="'+esc(ph||'')+'" value="'+esc(s)+'"></div>';}
function tgl(path,label,desc){var on=!!getP(path);return '<button class="row-tgl" data-act="tgl" data-v="'+path+'" role="switch" aria-checked="'+on+'"><span class="mid"><div class="t">'+label+'</div>'+(desc?'<div class="small muted">'+desc+'</div>':'')+'</span><span class="sw"></span></button>';}
function segv(path,opts,aria){var cur=getP(path);if(cur==null||cur==='')cur=opts[0][0];return '<div class="seg" role="group" aria-label="'+aria+'">'+opts.map(function(o){return '<button data-act="setv" data-v="'+path+'" data-x="'+o[0]+'" aria-pressed="'+(String(cur)===String(o[0]))+'"'+(o[2]?' aria-label="'+o[2]+'" title="'+o[2]+'"':'')+'>'+o[1]+'</button>';}).join('')+'</div>';}
function sec(t,inner,note){return '<div class="card stack" style="gap:12px">'+(t?'<h2 style="margin:0">'+t+'</h2>':'')+inner+(note?'<p class="small muted" style="margin:0">'+note+'</p>':'')+'</div>';}
function msg(text,ok,id){var e=document.getElementById(id||'f-err');if(e){e.textContent=text;e.style.color=ok?'var(--inc)':'var(--exp)';}}
function res(rows){return '<div class="res">'+rows.map(function(r){return '<div class="r'+(r[2]?' strong':'')+'"><span>'+esc(r[0])+'</span><span class="num">'+r[1]+'</span></div>';}).join('')+'</div>';}

/* ---------- FIRE sayfası ---------- */
function vFire(){
  var m=fireModel(),h='',P=Math.max(m.assets,0),f=S.fire;
  var tgt=sec('Hedefin','<div class="two" style="grid-template-columns:1fr auto;align-items:end">'+fld('FIRE hedef tutarı','fi-target','fire.target','auto',m.auto>0&&rateOf(f.tccy)>0?'Otomatik: '+NUM2.format(Math.round(m.auto/rateOf(f.tccy))):'Örn. 10.000.000')+'<div class="field"><label for="fi-tccy">Para birimi</label>'+ccySel('fi-tccy',f.tccy)+'</div></div>'
    +(m.noRate?'<div class="small exp">'+esc(CCYN[f.tccy])+' kuru yok; hedef otomatik hesaplanıyor. Kurları güncelle.</div>':'')
    +(+f.target>0?'<button class="linkbtn" style="align-self:flex-start;padding-left:0" data-act="fire-auto">Otomatik hedefe dön</button>':''),
    'Boş bırakırsan hedef, yıllık harcaman ÷ çekim oranı olarak hesaplanır. Hedefi dolar, euro ya da altın olarak girersen her gün güncel kurla TL’ye çevrilir.');
  var assume=sec('Varsayımlar',
    fld('Aylık harcama (₺)','fi-exp','fire.exp','auto','Otomatik: '+(m.autoE>0?TRY0.format(m.autoE):'veri yok'))
   +fld('Aylık birikim (₺)','fi-save','fire.save','auto','Otomatik: '+TRY0.format(Math.max(m.autoS,0)))
   +'<div class="two">'+fld('Yıllık reel getiri (%)','fi-ret','fire.ret','num','4')+fld('Çekim oranı (%)','fi-wr','fire.wr','num','4')+'</div>'
   +tgl('fire.acc','Hesapları ve borçları say','Nakit, banka ve kart bakiyelerin; kayıtlı borçların düşülür')+tgl('fire.pf','Yatırımları say','Hisse, fon, altın, döviz, kripto ve mevduat')+tgl('fire.ast','Diğer varlıkları say','Ev, araba gibi; genelde oturduğun ev sayılmaz')
   +fld('Ek yatırım varlığı (₺)','fi-extra','fire.extra','num','0'),
   'Boş bıraktığın alanlar geçmiş dönemlerdeki işlemlerinden otomatik hesaplanır. Reel getiri, enflasyondan arındırılmış yıllık getiridir.');
  if(!m.ok)return tgt+sec('','<div class="empty" style="padding:8px">Hedef tutarını ya da aylık harcamanı gir; sonuçlar burada görünür.</div>')+assume;
  h+='<div class="card hero"><div class="nwtop"><span class="lbl">FIRE ilerlemesi</span>'+ccySel('dccy',S.dccy)+'</div><p class="big">%'+NUM2.format(m.prog)+'</p><div class="bar"><i style="width:'+m.prog+'%"></i></div><div class="small muted" style="margin-top:8px">'+(m.n<=0?'Hedefe ulaştın.':'Tahmini süre <b>'+esc(fmtYears(m.n))+'</b>'+(fireDate(m.n)?' · '+esc(fireDate(m.n)):''))+'</div></div>';
  h+=tgt;
  h+=sec('Özet',res([['FIRE hedefi'+(m.custom?' (senin)':' (otomatik)'),DC0.format(m.target),1],['Mevcut varlık',DC0.format(P)],['Kalan',DC0.format(Math.max(m.target-P,0))],['Aylık birikim',DC0.format(m.sv)],['Bugünkü varlığın aylık pasif geliri',DC0.format(m.passive)],['Hedefin karşıladığı aylık harcama',DC0.format(m.target*m.wr/12)]]),'Tutarlar seçtiğin para biriminde güncel kurla gösterilir.');
  var sc=[['Sade yaşam (hedefin %70’i)',.7],['Mevcut hedef',1],['Rahat yaşam (%130)',1.3]];
  h+=sec('Senaryolar','<div class="res">'+sc.map(function(s){var T=m.target*s[1];return '<div class="r"><span>'+s[0]+'<div class="small muted">Hedef '+DC0.format(T)+'</div></span><span class="num" style="text-align:right">'+esc(fmtYears(monthsToFI(P,m.sv,m.rm,T)))+'</span></div>';}).join('')+'</div>');
  if(m.n>0){
    var n1=monthsToFI(P,m.sv*1.1,m.rm,m.target),n2=monthsToFI(P,m.sv,m.rm,m.target*.9);
    var dif=function(n){if(!isFinite(n))return 'değişmez';if(!isFinite(m.n))return 'ulaşılır: '+fmtYears(n);var d=Math.round(m.n-n);return d>0?(d>=12?(Math.floor(d/12)+' yıl '+(d%12?d%12+' ay ':'')):d+' ay ')+'erken':'değişmez';};
    h+=sec('Ne işe yarar?',res([['Aylık birikim %10 artarsa',dif(n1)],['Hedef %10 düşerse',dif(n2)]]));
  }
  h+=assume;
  h+='<p class="small muted">Bu bir tahmindir, yatırım tavsiyesi değildir. Getiri ve çekim oranı varsayımdır. %4 çekim oranı ABD tarihsel verilerine dayanan genel bir kuraldır; Türkiye’de enflasyon ve getiriler farklı seyredebilir.</p>';
  return h;
}

/* ---------- ayar sayfaları ---------- */
function setList(){var q=fold(ui.sq);var l=SETS.filter(function(s){return !q||fold(s.t+' '+s.d).indexOf(q)>-1;});
  if(!l.length)return '<div class="empty">Eşleşen ayar yok.</div>';
  var g='';return l.map(function(s){var hd=!q&&s.g!==g?'<div class="setgrp">'+esc(g=s.g)+'</div>':'';return hd+'<button class="setcard" data-act="open-set" data-id="'+s.id+'" data-v="ayarlar"><span class="sic" style="--c:'+s.c+'">'+ic(s.i)+'</span><span class="mid"><div class="t">'+esc(s.t)+'</div><div class="small muted">'+esc(s.d)+'</div></span>'+ic('r')+'</button>';}).join('');}
function vAyarlar(){return '<div class="search">'+ic('search')+'<input id="sset" type="search" placeholder="Ayarlarda ara..." value="'+esc(ui.sq)+'" aria-label="Ayarlarda ara"></div><div id="setlist" class="stack" style="gap:10px">'+setList()+'</div><div class="card stack" style="gap:8px;text-align:center"><div class="small muted">Wallet '+VER+' · Veriler bu cihazda saklanır'+(nb('saveData')?' (uygulama içinde ve yedek dosyasında)':'')+'</div><button class="btn ghost small" style="align-self:center" data-act="check-upd">Güncellemeleri denetle</button><div class="err" id="f-upd" style="text-align:center"></div></div>';}
function setBody(s){return ({profil:setProfil,hesap:setHesap,kat:setKat,kurlar:setKur,oto:setOto,bild:setBild,gor:setGor,guv:setGuv,veri:setVeri}[s]||setVeri)();}
function setProfil(){
  var pd=S.payday||1,o='';for(var i=1;i<=31;i++)o+='<option value="'+i+'"'+(i===pd?' selected':'')+'>'+i+'. gün</option>';
  return sec('Profil','<div class="field"><label for="pf-name">Ad</label><input id="pf-name" data-bind="name" data-kind="text" placeholder="Adın" value="'+esc(S.name)+'"></div>','Adın ana sayfada görünür.')
   +sec('Dönem','<div class="field"><label for="pf-pd">Maaş günü (dönem başlangıcı)</label><select id="pf-pd" data-bind="payday" data-kind="int">'+o+'</select></div><div class="small">Şu anki dönem: <b>'+esc(plabel(curP()))+'</b> ('+esc(prange(curP()))+')</div>','Özetler, bütçe ve düzenli ödemeler bu günden başlayan döneme göre hesaplanır. Ayın 1’i için 1. günü seç.');
}
function setHesap(){
  return sec('Varsayılan hesap','<div class="field"><label for="st-def">Yeni işlemde seçili gelen hesap</label><select id="st-def" data-bind="defAcct" data-kind="text"><option value="">Son kullandığım hesap</option>'+ACCS().map(function(a){return '<option'+(S.defAcct===a?' selected':'')+'>'+esc(a)+'</option>';}).join('')+'</select></div>')
   +sec('Hesaplar','<button class="btn ghost" data-act="sv-go" data-v="hesap">Hesaplar sekmesine git</button>','Hesap eklemek, düzenlemek ve transfer yapmak için alt menüdeki Hesaplar sekmesini kullan.');
}
function chipRow(type){return '<div class="chips">'+S.cats[type].map(function(c){return '<button class="chip rm" data-act="cat-del" data-v="'+type+'" data-id="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div>';}
function catAdd(type,label){return '<div class="two" style="grid-template-columns:1fr auto"><input id="nc-'+type+'" placeholder="'+label+'" aria-label="'+label+'"><button class="btn small" data-act="cat-add" data-v="'+type+'">Ekle</button></div>';}
function setKat(){
  var all=EXPC().concat(INCC()),rl=S.rules.length?'<div class="list">'+S.rules.map(function(r,i){return '<div class="item"><span class="mid"><div class="t">“'+esc(r.kw)+'” → '+esc(r.cat)+'</div></span><button class="btn small ghost" data-act="rule-del" data-id="'+i+'">Sil</button></div>';}).join('')+'</div>':'<div class="small muted">Henüz kural yok.</div>';
  return sec('Gider kategorileri',chipRow('exp')+catAdd('exp','Yeni gider kategorisi'),'Silmek için bir kategoriye iki kez dokun. Geçmiş işlemler silinmez.')
   +sec('Gelir kategorileri',chipRow('inc')+catAdd('inc','Yeni gelir kategorisi'))
   +sec('Otomatik kurallar',rl+'<div class="two"><div class="field"><label for="rl-kw">İşlem notunda geçen kelime</label><input id="rl-kw" placeholder="Örn. migros"></div><div class="field"><label for="rl-cat">Kategori</label><select id="rl-cat">'+opts(all)+'</select></div></div><div class="err" id="f-err"></div><button class="btn" data-act="rule-add">Kural ekle</button>','İşlem eklerken nota bu kelimeyi yazarsan kategori kendiliğinden seçilir.');
}
function fmtProv(p){var m=String(p).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):String(p);}
function setKur(){
  var when=S.fxTs?'<div class="small muted">Son güncelleme: '+esc(fmtTs(S.fxTs))+(S.fxProv?' · kaynak saati '+esc(fmtProv(S.fxProv)):'')+'</div>':'';
  var ch=S.fxChg||{},bi=S.mkt&&S.mkt.BIST;
  return sec('Görüntüleme para birimi','<div class="field"><label for="dccy2">Net servet, Analiz ve FIRE bu birimde gösterilir</label>'+ccySel('dccy2',S.dccy)+'</div>','Tutarlar güncel kurla çevrilir; işlemler ve bütçeler kendi para biriminde kalır.')
   +sec('Canlı kurlar','<div class="rgrid">'+FXK.map(function(k){return rateTile(FXL[k],S.fx[k],ch[k]);}).join('')+rateTile('BIST 100',bi?bi.price:0,bi?bi.chg:null)+'</div>'+when+tgl('fxAuto','Kurları otomatik güncelle','Uygulama açılınca ve her 5 dakikada bir yenilenir')+'<button class="btn ghost" data-act="rates-now">Şimdi güncelle</button><div class="err" id="f-rates"></div>',nb('fetchRates')?'Uygulama kurları doğrudan kaynaktan alır. Kaynak: Truncgil Finans; anlık borsa verisi değildir.':'Veri yayın sunucusunda düzenli olarak yenilenir; anlık borsa verisi değildir ve gecikmeli olabilir. Kaynak: Truncgil Finans.')
   +sec('Kurları elle gir (₺)','<div class="two">'+FXK.map(function(k){return fld(FXL[k],'fx-'+k,'fx.'+k,'num','0');}).join('')+'</div>','Otomatik güncelleme açıkken elle girdiğin değerler bir sonraki yenilemede değişir.');
}
function notifState(){if(nb('notifState')){try{return NB.notifState();}catch(e){}}return ('Notification' in window)?Notification.permission:'yok';}
function upcomingList(){var u=upcoming(30);if(!u.length)return '<div class="small muted">Önümüzdeki 30 günde ödenmemiş düzenli ödeme ya da kart borcu yok.</div>';
  var t0=todayS();return '<div class="list">'+u.slice(0,8).map(function(x){var d=daysBetween(t0,x.date);return '<div class="item"><span class="dot" style="background:var(--'+(d<0?'exp':(d<=S.alerts.days?'warn':'line'))+')"></span><span class="mid"><div class="t">'+esc(x.name)+'</div><div class="small muted">'+esc(pdate(x.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'short'}))+' · '+(d<0?(-d)+' gün gecikti':dayWord(d)+(d>1?' sonra':''))+'</div></span><span class="num">'+moneyIn(x.amt,x.acct,1)+'</span></div>';}).join('')+'</div>';}
function setBild(){
  var perm=notifState(),hrs=[7,8,9,10,12,18,20],native=nb('schedule');
  var phone;
  if(native){
    phone=tgl('alerts.push','Telefon bildirimi gönder','Uygulama kapalıyken de ödeme gününden önce ve ödeme günü bildirim gelir')
      +'<div class="lbl">Bildirim saati</div>'+segv('alerts.hour',hrs.map(function(x){return [x,pad(x)+':00'];}),'Bildirim saati')
      +(perm==='granted'?'<div class="small inc">Bildirim izni verildi.</div>':'<button class="btn ghost" data-act="notif-ask">Bildirim izni ver</button>'+(perm==='denied'?'<div class="small muted">İzin reddedildi. Telefon Ayarları › Uygulamalar › Wallet › Bildirimler bölümünden açabilirsin.</div>':''))
      +'<button class="btn ghost" data-act="notif-test">Deneme bildirimi gönder</button><div class="err" id="f-ntest"></div>';
  }else{
    phone=tgl('notif','Bildirim gönder','Uygulamayı açtığında, günde bir kez özet bildirim')+(perm==='granted'?'<div class="small muted">Bildirim izni verildi.</div>':perm==='denied'?'<div class="small muted">İzin reddedilmiş. Tarayıcı site ayarlarından açabilirsin.</div>':perm==='yok'?'<div class="small muted">Bu görünüm bildirimi desteklemiyor. Android uygulamasında hatırlatıcı telefon bildirimi olarak gelir.</div>':'<button class="btn ghost" data-act="notif-ask">Bildirim izni ver</button>');
  }
  return sec('Fatura ve ödeme hatırlatıcısı',tgl('alerts.rec','Hatırlatıcı açık','Düzenli ödemeler ve kredi kartı son ödeme günleri')+'<div class="lbl">Kaç gün önceden</div>'+segv('alerts.days',[[1,'1 gün'],[3,'3 gün'],[7,'7 gün']],'Gün')+'<div class="lbl">Yaklaşan ödemeler</div>'+upcomingList(),'Uyarılar ana sayfada da görünür. Ödendi olarak işaretlediğin ödemeler için hatırlatma gelmez.')
   +sec('Telefon bildirimi',phone,native?'Bildirimler telefonun kendi hatırlatıcısıyla planlanır; telefon yeniden başlasa da devam eder.':'Tarayıcıda bildirim yalnızca uygulama açıldığında gelir.')
   +sec('Bütçe uyarıları',tgl('alerts.budget','Bütçe aşımı uyarıları','Limite yaklaşınca ya da aşınca ana sayfada gösterilir')+'<div class="lbl">Uyarı eşiği</div>'+segv('alerts.thr',[[70,'%70'],[80,'%80'],[90,'%90']],'Uyarı eşiği'));
}
function setGor(){
  return sec('Tema',segv('theme',[['auto','Sistem'],['light','Açık'],['dark','Koyu']],'Tema'))
   +sec('Yazı boyutu',segv('fs',[[0.9,'<span style="font-size:13px">A</span>','Küçük'],[1,'<span style="font-size:16px">A</span>','Normal'],[1.15,'<span style="font-size:19px">A</span>','Büyük'],[1.3,'<span style="font-size:22px">A</span>','Çok büyük']],'Yazı boyutu')+'<div class="small muted">Şu an: '+({0.9:'Küçük',1:'Normal',1.15:'Büyük',1.3:'Çok büyük'}[S.fs]||'Normal')+'</div>')
   +sec('Gizlilik',tgl('hide','Tutarları gizle','Ana sayfada tutarlar •••• olur; net servet kartındaki göz düğmesiyle de açıp kapatabilirsin'));
}
function notesExport(){
  var c=noteCounts();
  return sec('Notları dışa aktar','<div class="small muted">'+(c.act+c.arch)+' not (arşiv dahil)</div><button class="btn ghost" data-act="notes-copy">Tüm notları kopyala</button><button class="btn ghost" data-act="notes-save">Metin dosyası olarak kaydet</button><div class="err" id="f-err5"></div>');
}
function setNotlar(){
  return sec('Liste','<div class="lbl">Sıralama</div>'+segv('nset.sort',[['edited','Düzenleme'],['created','Oluşturma'],['title','Başlık']],'Sıralama')
    +'<div class="lbl">Görünüm</div>'+segv('nset.view',[['card','Kart'],['list','Liste']],'Görünüm')
    +'<div class="lbl">Önizleme satırı</div>'+segv('nset.lines',[[0,'Yok'],[2,'2'],[3,'3'],[5,'5']],'Önizleme satırı')
    +tgl('nset.pinFirst','Sabit notlar üstte')+tgl('nset.date','Tarihi göster')+tgl('nset.confirmDel','Kalıcı silmeden önce sor','Kalıcı silme düğmesine iki kez dokunman gerekir'))
   +notesExport();
}
function setGuv(){
  var h='';
  if(!S.pin){
    h+=sec('PIN kilidi','<div class="field"><label for="pin1">Yeni PIN (4 rakam)</label><input id="pin1" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="field"><label for="pin2">PIN tekrar</label><input id="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="err" id="f-err"></div><button class="btn" data-act="pin-set">PIN kilidini etkinleştir</button>','PIN, uygulamayı açarken sorulur.');
  }else{
    h+=sec('PIN kilidi','<span class="pill ok" style="align-self:flex-start">Açık</span><div class="lbl">Otomatik kilit</div>'+segv('pin.auto',[[0,'Hemen'],[1,'1 dk'],[5,'5 dk'],[15,'15 dk']],'Otomatik kilit')+(bioOk()?tgl('bio','Parmak izi ile aç','Kilit ekranında PIN yerine parmak izi ya da yüz tanıma'):'')+'<button class="btn ghost" data-act="lock-now">Şimdi kilitle</button>','Otomatik kilit, uygulamadan çıkıp geri döndüğünde çalışır.')
     +sec('PIN’i değiştir','<div class="field"><label for="pold">Mevcut PIN</label><input id="pold" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="two"><div class="field"><label for="pnew1">Yeni PIN</label><input id="pnew1" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="field"><label for="pnew2">Tekrar</label><input id="pnew2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div></div><div class="err" id="f-err"></div><button class="btn ghost" data-act="pin-change">PIN’i değiştir</button>')
     +sec('PIN’i kaldır','<div class="field"><label for="prem">Mevcut PIN</label><input id="prem" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn danger" data-act="pin-remove">Kilidi kaldır</button>');
  }
  if(nb('setSecure'))h+=sec('Ekran gizliliği',tgl('secure','Ekranı gizle','Son uygulamalar listesinde içerik görünmez, ekran görüntüsü alınamaz'));
  h+='<p class="small muted">PIN ekranı kilitler. Telefonunda ekran kilidi açıksa Android, uygulama verilerini zaten cihaz şifrelemesiyle korur; başka uygulamalar Wallet verisini okuyamaz. PIN unutulursa kilit ancak veriler silinerek kaldırılır, bu yüzden yedek al.</p>';
  return h;
}
function setVeri(){
  var pw=S.bkKey?'<div class="small inc">Yedekler şifreli. Geri yüklerken bu şifre sorulur.</div><button class="btn ghost" data-act="bk-pw-del">Yedek şifresini kaldır</button>'
      :'<div class="two"><div class="field"><label for="bkp1">Yedek şifresi</label><input id="bkp1" type="password" autocomplete="new-password" placeholder="En az 6 karakter"></div><div class="field"><label for="bkp2">Tekrar</label><input id="bkp2" type="password" autocomplete="new-password"></div></div><button class="btn ghost" data-act="bk-pw-set">Yedekleri şifrele</button>';
  var auto=nb('autoBackup')?sec('Otomatik yedek',tgl('autoBk','Otomatik yedekle','Değişiklikten kısa süre sonra ve uygulamadan çıkınca İndirilenler/Wallet klasörüne yazılır')+(S.bkTs?'<div class="small muted">Son otomatik yedek: '+esc(fmtTs(S.bkTs))+(S.bkEnc?' · şifreli':' · şifresiz')+'</div>':'')+pw+'<div class="two"><button class="btn ghost" data-act="bk-auto">Şimdi yedekle</button><button class="btn ghost" data-act="bk-share">Paylaş / Drive’a kaydet</button></div><div class="err" id="f-bka"></div>','Uygulamayı silsen bile bu dosya telefonda kalır; “Yedekten yükle” ile geri alabilirsin. Şifreyi unutursan şifreli yedek açılmaz.')
    +sec('Bulut yedeği','<p class="small" style="margin:0">Telefonunda Google yedekleme açıksa Wallet verileri Google hesabına da kendiliğinden yedeklenir; yeni telefona ya da yeniden kurulumda geri gelir.</p>','Ayarlar › Google › Yedekleme bölümünden açık olduğunu kontrol edebilirsin. Ek olarak yedeği Paylaş ile Google Drive’a kaydedebilirsin.'):'';
  return auto+sec('Yedek','<div class="field"><label for="bk-pw">Yedek şifresi</label><input id="bk-pw" type="password" autocomplete="new-password" placeholder="Boş bırakırsan şifresiz yedek"></div><button class="btn" data-act="bk-make">Yedek hazırla</button><div id="bk-box" class="stack" style="gap:10px" hidden><textarea id="bk-out" readonly aria-label="Yedek metni"></textarea><button class="btn ghost" data-act="bk-copy">Yedeği kopyala</button><button class="btn ghost" data-act="bk-save">Dosya olarak kaydet</button><button class="btn ghost" data-act="bk-share2">Paylaş (Drive, e-posta…)</button></div><div class="err" id="f-err3"></div>','Şifreli yedek AES-256 ile korunur. Şifreyi unutursan yedek açılmaz, şifre hiçbir yerde saklanmaz.')
   +sec('Yedekten yükle','<label class="btn ghost filebtn">Dosya seç<input id="rs-file" type="file" accept=".json,.txt,application/json,text/plain"></label><div class="small muted" id="rs-file-name"></div><div class="field"><label for="rs-txt">Ya da yedek metnini yapıştır</label><textarea id="rs-txt" placeholder="Kopyaladığın yedeği buraya yapıştır"></textarea></div><div class="field"><label for="rs-pw">Şifre (yedek şifreliyse)</label><input id="rs-pw" type="password" autocomplete="off"></div><div class="err" id="f-err2"></div><button class="btn ghost" data-act="rs-go">Yedeği yükle</button>','Yükleme mevcut verilerin yerine geçer. PIN ayarın korunur.')
   +sec('İşlemleri dışa aktar','<button class="btn ghost" data-act="csv">İşlemleri CSV olarak kaydet</button><button class="btn ghost" data-act="csv-copy">CSV metnini kopyala</button><div class="err" id="f-err"></div>','CSV; Excel ve tablo uygulamalarında açılır. '+S.tx.length+' işlem.')
   +sec('İşlemleri içe aktar','<label class="btn ghost filebtn">Ekstre dosyası seç<input id="im-file" type="file" accept=".csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label><div class="small muted" id="im-file-name"></div><div class="field"><label for="im-txt">Ya da CSV metnini yapıştır</label><textarea id="im-txt" placeholder="İlk satır başlık olmalı, örn: Tarih; Açıklama; Tutar"></textarea></div><div class="field"><label for="im-acct">Hesap sütunu yoksa bu hesaba ekle</label><select id="im-acct">'+opts(ACCS(),ACCS().filter(function(a){return acctType(a)==='banka';})[0]||ACCS()[0])+'</select></div><div class="err" id="f-err4"></div><button class="btn ghost" data-act="im-go">İçe aktar</button>','Bankanın internet şubesinden ya da mobil uygulamasından indirdiğin hesap hareketleri: Excel (.xlsx, .xls) ya da CSV. Tablonun başlık satırı (Tarih, Açıklama, Tutar ya da Borç/Alacak) kendiliğinden bulunur. Eksi tutarlar ve Borç sütunu gider, artılar ve Alacak gelir sayılır; kredi kartı hesabına aktarırken artı tutarlar harcamadır. Kategori açıklamaya göre seçilir, aynı kayıtlar tekrar eklenmez.')
   +sec('Örnek veriler',(hasSample()?'<button class="btn ghost" data-act="sample-clear">Örnek verileri sil</button>':'<button class="btn ghost" data-act="sample-load">Örnek verileri yükle</button>'),'Örnek veriler kendi kayıtlarının yanına eklenir ve işaretlidir, istediğinde silebilirsin.')
   +sec('Tüm verileri sil','<button class="btn danger" data-act="reset-all">Tüm verileri sil</button>','Bu cihazdaki tüm işlemler, hesaplar, notlar, hedefler, ayarlar, PIN'+(nb('wipe')?', otomatik yedek dosyası ve planlanmış hatırlatmalar':'')+' silinir. Geri alınamaz; önce yedek almak isteyebilirsin.');
}

/* ---------- PIN ve kilit ---------- */
function cyrb(str){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(16);}
function pinHash(pin,salt){var str=salt+':'+pin;
  if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return pad(x.toString(16)).slice(-2);}).join('');});
  return Promise.resolve('x'+cyrb(str));}
function bioOk(){if(!nb('bioAvail'))return false;try{return !!NB.bioAvail();}catch(e){return false;}}
function lockHtml(){
  var logo='<span class="logo biglogo" role="img" aria-label="Wallet"></span>';
  if(ui.forgot)return logo+'<h2 style="margin:0">PIN’ini mi unuttun?</h2><p class="small muted" style="max-width:320px;text-align:center;margin:0">PIN kurtarılamaz. Devam edersen bu cihazdaki tüm Wallet verileri silinir ve kilit kalkar. Yedeğin varsa sonra geri yükleyebilirsin.</p><button class="btn danger" style="max-width:320px" data-act="lk-reset">Tüm verileri sil ve kilidi kaldır</button><button class="btn ghost" style="max-width:320px" data-act="lk-back">Vazgeç</button>';
  var dots='';for(var i=0;i<4;i++)dots+='<i class="'+(i<ui.pinBuf.length?'on':'')+'"></i>';
  var wait=Date.now()<ui.lockUntil,keys=['1','2','3','4','5','6','7','8','9',S.bio&&bioOk()?'b':'','0','<'];
  return logo+'<h2 style="margin:0">PIN gir</h2><div class="dots">'+dots+'</div><div class="err" style="min-height:1.3em">'+esc(ui.lkMsg||'')+'</div><div class="keypad">'+keys.map(function(k){if(k==='')return '<span></span>';if(k==='b')return '<button class="key" data-act="lk-bio" aria-label="Parmak izi ile aç">'+ic('shield')+'</button>';return '<button class="key" data-act="lk" data-v="'+k+'"'+(wait?' disabled':'')+' aria-label="'+(k==='<'?'Sil':k)+'">'+(k==='<'?'←':k)+'</button>';}).join('')+'</div><button class="linkbtn" data-act="lk-forgot">PIN’imi unuttum</button>';
}
function lockNow(){ui.locked=true;ui.pinBuf='';ui.lkMsg='';ui.forgot=false;closeSheet();render();askBio();}
function askBio(){if(ui.locked&&S.pin&&S.bio&&bioOk()&&nb('bioAuth')){try{NB.bioAuth();}catch(e){}}}
window.walletBio=function(ok){if(ok&&ui.locked){ui.locked=false;ui.pinBuf='';ui.fails=0;ui.lkMsg='';render();setTimeout(runIntent,50);}};

/* ---------- yedek ---------- */
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s);}
function unb64(s){var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
function deriveKey(pw,salt){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']).then(function(k){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);});}
function encText(text,pw){var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  return deriveKey(pw,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(text));}).then(function(ct){return JSON.stringify({wallet:1,s:b64(salt),i:b64(iv),d:b64(ct)});});}
function decText(o,pw){var salt=unb64(o.s),iv=unb64(o.i);return deriveKey(pw,salt).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:iv},k,unb64(o.d));}).then(function(b){return new TextDecoder().decode(b);});}
function exportJson(){var c=JSON.parse(JSON.stringify(S));delete c.pin;delete c.bkKey;return JSON.stringify(c);}
function csvCell(x){x=String(x==null?'':x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}
function txTypeName(t){return ({inc:'Gelir',exp:'Gider',trf:'Transfer',adj:'Bakiye düzeltmesi'})[t.type]||(t.type==='inv'?(t.side==='sell'?'Yatırım satışı':'Yatırım alımı'):(t.type==='dbt'?(t.side==='in'?'Borç alındı':'Borç ödemesi'):t.type));}
function csvAll(){var rows=[['Tarih','Tür','Kategori','Tutar','Hesap','Karşı hesap','Not','Giriş tutarı','Para birimi']];
  S.tx.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).forEach(function(t){rows.push([t.date,txTypeName(t),t.type==='inc'||t.type==='exp'||t.type==='trf'?(t.cat||''):mvLabel(t),nv(t.amt),t.acct,t.to||'',t.note||'',t.amt2?nv(t.amt2):'',ccyOf(t.acct)]);});
  return '﻿'+rows.map(function(r){return r.map(csvCell).join(';');}).join('\r\n');}
function saveFile(name,data,okText,id){
  if(!dl&&NB&&nb('save')){var rr='err';try{rr=NB.save(name,String(data));}catch(e){}msg(rr==='ok'?(okText||'Kaydedildi.')+' İndirilenler klasörüne bakın.':'Dosya kaydedilemedi. Kopyala düğmesini dene.',rr==='ok',id);return;}
  if(!dl){try{var bl=new Blob([data],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u);},1000);msg(okText||'Kaydedildi.',true,id);}catch(e){msg('Dosya kaydedilemedi. Kopyala düğmesini dene.',false,id);}return;}
  dl.save({filename:name,data:data}).then(function(){msg(okText||'Kaydedildi.',true,id);},function(err){msg(err&&err.code==='declined'?'Kaydetme iptal edildi.':'Dosya kaydedilemedi. Kopyala düğmesini dene.',false,id);});
}
function copyText(text,id,okText){
  try{navigator.clipboard.writeText(text).then(function(){msg(okText||'Kopyalandı.',true,id);},function(){msg('Kopyalanamadı. Dosya olarak kaydetmeyi dene.',false,id);});}
  catch(e){msg('Kopyalanamadı. Dosya olarak kaydetmeyi dene.',false,id);}
}
function allNotesText(){return S.notes.filter(function(n){return !n.trash;}).map(function(n){return (n.title||'Başlıksız')+(n.arch?' (arşiv)':'')+'\n\n'+n.body;}).join('\n\n----------\n\n');}
/* yedek metni: yedek şifresi ayarlıysa AES-256 ile şifreli (Yedekten yükle'de aynı şifreyle açılır) */
function backupText(){
  var j=exportJson(),k=S.bkKey;
  if(!k||!(window.crypto&&crypto.subtle))return Promise.resolve(j);
  var iv=crypto.getRandomValues(new Uint8Array(12));
  return crypto.subtle.importKey('raw',unb64(k.k),{name:'AES-GCM'},false,['encrypt']).then(function(key){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(j));}).then(function(ct){return JSON.stringify({wallet:1,s:k.s,i:b64(iv),d:b64(ct)});});
}
/* otomatik yedek: İndirilenler/Wallet klasörüne; döner Promise<bool> */
function autoBackup(force){
  if(!nb('autoBackup')||(!S.autoBk&&!force)||hasSample()&&!force)return Promise.resolve(false);
  return backupText().then(function(text){var r='err';try{r=NB.autoBackup(text);}catch(e){}
    if(r==='ok'){S.bkTs=Date.now();S.bkEnc=!!S.bkKey;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}return true;}return false;},function(){return false;});
}
function setBkPw(pw){var salt=crypto.getRandomValues(new Uint8Array(16));
  return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,256);}).then(function(bits){S.bkKey={s:b64(salt),k:b64(bits)};save();});}

/* ---------- hesaplayıcılar ---------- */
var CALCS={
  kredi:{name:'Kredi',fields:[['amt','Kredi tutarı (₺)',100000],['rate','Aylık faiz (%)',3.5],['n','Vade (ay)',24],['tax','Vergi: KKDF + BSMV (%)',25]],
    run:function(v){var P=v.amt,n=Math.round(v.n),r=v.rate/100*(1+v.tax/100);if(P<=0||n<=0)return '<div class="empty">Tutar ve vadeyi gir.</div>';if(n>600)return '<div class="empty">Vade en fazla 600 ay (50 yıl) olabilir.</div>';if(v.rate<0||v.tax<0)return '<div class="empty">Faiz ve vergi sıfır ya da pozitif olmalı.</div>';
      var pay=r===0?P/n:P*r/(1-Math.pow(1+r,-n)),bal=P,tot=0,rows='';
      for(var i=1;i<=n;i++){var it=bal*r,pr=pay-it;bal-=pr;tot+=it;rows+='<tr><td>'+i+'</td><td>'+TRY2.format(pay)+'</td><td>'+TRY2.format(pr)+'</td><td>'+TRY2.format(it)+'</td><td>'+TRY2.format(Math.max(bal,0))+'</td></tr>';}
      return res([['Aylık taksit',TRY2.format(pay),1],['Toplam geri ödeme',TRY2.format(pay*n)],[v.tax>0?'Toplam faiz ve vergi':'Toplam faiz',TRY2.format(tot)],['Yıllık bileşik maliyet','%'+NUM2.format((Math.pow(1+r,12)-1)*100)]])
       +'<p class="small muted">İhtiyaç ve taşıt kredisinde faize KKDF (%15) ve BSMV (%10) eklenir. Konut kredisinde oranlar farklıdır; bankanın ödeme planıyla karşılaştır.</p>'
       +'<details><summary>Ödeme planı</summary><div class="scroll-x"><table><thead><tr><th>Ay</th><th>Taksit</th><th>Anapara</th><th>Faiz+vergi</th><th>Kalan</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';}},
  birikim:{name:'Birikim',fields:[['p','Başlangıç tutarı (₺)',50000],['c','Aylık katkı (₺)',5000],['rate','Yıllık getiri (%)',40],['y','Süre (yıl)',5]],
    run:function(v){var n=Math.round(v.y*12);if(n<=0)return '<div class="empty">Süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var fv=r===0?v.p+v.c*n:v.p*g+v.c*(g-1)/r,put=v.p+v.c*n;
      return res([['Dönem sonu tutar',TRY0.format(fv),1],['Toplam yatırılan',TRY0.format(put)],['Kazanılan getiri',TRY0.format(fv-put)]])+'<p class="small muted">Aylık bileşik getiri varsayılır. Vergi ve enflasyon dahil değildir.</p>';}},
  mevduat:{name:'Mevduat',fields:[['p','Anapara (₺)',100000],['rate','Yıllık brüt faiz (%)',45],['d','Vade (gün)',32],['tax','Stopaj (%)',17.5]],
    run:function(v){if(v.p<=0||v.d<=0)return '<div class="empty">Anapara ve vadeyi gir.</div>';var g=v.p*v.rate/100*v.d/365,tx=g*v.tax/100,net=g-tx;
      return res([['Net getiri',TRY2.format(net),1],['Brüt faiz',TRY2.format(g)],['Stopaj',TRY2.format(tx)],['Vade sonu toplam',TRY2.format(v.p+net)],['Net yıllık oran','%'+NUM2.format(net/v.p*365/v.d*100)]])+'<p class="small muted">Stopaj oranı vadeye göre değişir; bankanın uyguladığı oranı yaz.</p>';}},
  hedef:{name:'Hedef',fields:[['t','Hedef tutar (₺)',500000],['p','Mevcut birikim (₺)',50000],['m','Süre (ay)',36],['rate','Yıllık getiri (%)',30]],
    run:function(v){var n=Math.round(v.m);if(n<=0||v.t<=0)return '<div class="empty">Hedef tutar ve süreyi gir.</div>';var r=v.rate/100/12,g=Math.pow(1+r,n);
      var need=r===0?(v.t-v.p)/n:(v.t-v.p*g)*r/(g-1);if(need<0)need=0;
      return res([['Aylık ayırman gereken',TRY2.format(need),1],['Toplam yatıracağın',TRY0.format(need*n+v.p)],['Getiriden gelen',TRY0.format(Math.max(v.t-need*n-v.p,0))]])+(need===0?'<p class="small muted">Mevcut birikimin getiriyle hedefe ulaşır.</p>':'');}},
  enflasyon:{name:'Enflasyon',fields:[['a','Tutar (₺)',100000],['inf','Yıllık enflasyon (%)',35],['y','Süre (yıl)',3],['nom','Yıllık nominal getiri (%)',40]],
    run:function(v){if(v.y<0)return '<div class="empty">Süreyi gir.</div>';var f=Math.pow(1+v.inf/100,v.y),realRate=((1+v.nom/100)/(1+v.inf/100)-1)*100;
      return res([['Bugünkü alım gücünü korumak için',TRY0.format(v.a*f),1],['Bugünkü tutarın o günkü değeri',TRY0.format(v.a/f)],['Reel getiri (yıllık)',(realRate>=0?'+%':'−%')+NUM2.format(Math.abs(realRate))],['Getiri sonrası reel değer',TRY0.format(v.a*Math.pow(1+v.nom/100,v.y)/f)]]);}},
  doviz:{name:'Döviz çevirici',fields:[['a','Tutar',1000]],ccy:true,
    run:function(v){var from=ui.cfrom||'USD',to=ui.cto||'TRY',rf=rateOf(from),rt=rateOf(to);if(!(rf>0)||!(rt>0))return '<div class="empty">Bu kur için veri yok. Üstteki yenile düğmesine dokun.</div>';
      var out=v.a*rf/rt;return res([[NUM2.format(v.a)+' '+CCYS_SHORT[from],fmtC(out,to,1),1],['1 '+CCYS_SHORT[from],fmtC(rf/rt,to,1)]])+'<p class="small muted">Güncel satış kuru ile hesaplanır'+(S.fxTs?' ('+esc(fmtTs(S.fxTs))+')':'')+'.</p>';}}
};
Object.keys(CALCS).forEach(function(k){var f=CALCS[k].run;CALCS[k].run=function(v){var h='';try{h=f(v);}catch(e){h='';}
  if(!h||/NaN|Infinity|undefined/.test(String(h).replace(/<[^>]*>/g,' ')))return '<div class="empty">Değerleri kontrol et, sonuç hesaplanamadı.</div>';return h;};});
function vArac(){
  var key=CALCS[ui.calc]?ui.calc:'kredi',c=CALCS[key];if(!ui.cv[key]){ui.cv[key]={};c.fields.forEach(function(f){ui.cv[key][f[0]]=nv(f[2]);});}
  var h=fireCard()+'<div class="calcseg">'+Object.keys(CALCS).map(function(k){return '<button class="chip" data-act="calc" data-v="'+k+'" aria-pressed="'+(k===key)+'">'+CALCS[k].name+'</button>';}).join('')+'</div>';
  h+='<div class="card"><div class="two" style="gap:12px">'+c.fields.map(function(f){return '<div class="field"><label for="c-'+f[0]+'">'+esc(f[1])+'</label><input id="c-'+f[0]+'" class="calc-in" data-k="'+f[0]+'" inputmode="decimal" value="'+esc(ui.cv[key][f[0]])+'"></div>';}).join('')
    +(c.ccy?'<div class="field"><label for="c-from">Kaynak</label>'+ccySel('c-from',ui.cfrom||'USD')+'</div><div class="field"><label for="c-to">Hedef</label>'+ccySel('c-to',ui.cto||'TRY')+'</div>':'')+'</div></div>';
  h+='<div class="card" id="calc-out">'+calcOut()+'</div>';return h;
}
function calcOut(){var key=CALCS[ui.calc]?ui.calc:'kredi',c=CALCS[key],v={},m=maskOn;c.fields.forEach(function(f){v[f[0]]=num(ui.cv[key][f[0]]);});maskOn=false;try{return c.run(v);}finally{maskOn=m;}}
