/* ---------- gerçek mağaza logosu (4.22) ----------
   İşlemin açıklamasında (ya da alt kategorisinde, düzenli ödemenin adında) tanınan bir mağaza geçiyorsa çizim simge yerine mağazanın
   gerçek logosu gösterilir. Logo, mağazanın kendi sitesindeki simgedir; Google'ın anahtarsız simge servisinden, orada yoksa Vemetric'in
   anahtarsız simge servisinden alınır ve yalnızca mağazanın site adı gönderilir (tutar, açıklama ya da başka veri gitmez). Logo gelmezse ya da
   çevrimdışıysan kategori simgesi kalır. Site adının başındaki "~": logo Google'da yok, doğrudan ikinci kaynaktan alınır.
   Biçim: "site:ad|ad2;…" — adlar fold() edilmiş hâlde; "=" ile başlayan ad yalnızca açıklamanın tamamı o adsa eşleşir (gündelik kelimeler). */
var MRC_T=
 /* market, sanal market, pazaryeri */
 'migros.com.tr:migros;macrocenter.com.tr:macro ?center;bim.com.tr:bim;a101.com.tr:a[ -]?101;sokmarket.com.tr:sok|sok market|cepte sok;carrefoursa.com:carrefour(sa)?;'
+'metro-tr.com:metro market|metro gross|metro toptanci;file.com.tr:file market;hakmarexpress.com.tr:hakmar;onurmarket.com:onur market;happycenter.com.tr:happy center;mopas.com.tr:mopas;'
+'getir.com:getir(yemek|buyuk)?;yemeksepeti.com:yemek ?sepeti|banabi;trendyol.com:trendyol;hepsiburada.com:hepsi ?burada|hepsijet|hepsipay;n11.com:n11;amazon.com.tr:amazon;'
+'ciceksepeti.com:cicek ?sepeti;pazarama.com:pazarama;pttavm.com:ptt ?avm;temu.com:temu;aliexpress.com:ali ?express;shein.com:shein;sahibinden.com:sahibinden;letgo.com:letgo;dolap.com:=dolap;'
+'tiklagelsin.com:tikla ?gelsin;'
 /* giyim, ayakkabı, kozmetik */
+'corporate.lcwaikiki.com:lc ?waikiki|lcw|waikiki;defacto.com.tr:defacto;koton.com:koton;mavi.com:mavi jeans|=mavi;zara.com:zara;hm.com:h ?& ?m|=hm;boyner.com.tr:boyner;beymen.com:beymen;flo.com.tr:flo;'
+'bershka.com:bershka;pullandbear.com:pull ?(and|&) ?bear;stradivarius.com:stradivarius;mango.com:=mango;decathlon.com.tr:decathlon;nike.com:nike;adidas.com.tr:adidas;puma.com:puma;'
+'skechers.com.tr:skechers;newbalance.com.tr:new balance;~colins.com.tr:colin.?s;penti.com:penti;~vakko.com:vakko;~ipekyol.com.tr:ipekyol;kigili.com:kigili;sarar.com.tr:sarar;'
+'altinyildizclassics.com:altinyildiz;tr.uspoloassn.com,uspoloassn.com:u\\.?s\\.? ?polo;lacoste.com.tr:lacoste;levis.com.tr:levi.?s;superstep.com.tr:superstep;instreet.com.tr:instreet;'
+'derimod.com.tr:derimod;hotic.com.tr:hotic;gratis.com:gratis;watsons.com.tr:watsons;rossmann.com.tr:rossmann;sephora.com:sephora;flormar.com.tr:flormar;yvesrocher.com.tr:yves rocher;'
+'atasay.com:atasay;altinbas.com:altinbas;saatvesaat.com.tr:saat ?(ve|&) ?saat;atasunoptik.com.tr:atasun;e-bebek.com:e-?bebek;~civilim.com:civil;'
 /* elektronik, iletişim */
+'teknosa.com:teknosa;mediamarkt.com.tr:media ?markt;vatanbilgisayar.com:vatan bilgisayar|vatan computer|=vatan;apple.com:apple|app store|icloud|itunes;samsung.com:samsung;mi.com:xiaomi;'
+'paycell.com.tr:paycell;~turkcell.com.tr:turkcell|superonline;vodafone.com.tr:vodafone;~turktelekom.com.tr:turk ?telekom|ttnet;turk.net:turknet|turk\\.net;digiturk.com:digiturk;dsmart.com.tr:d-?smart;'
 /* abonelik, yazılım, oyun */
+'netflix.com:netflix;spotify.com:spotify;youtube.com:youtube;disneyplus.com:disney;primevideo.com:prime video;blutv.com:blu ?tv;exxen.com:exxen;gain.tv:gain tv|=gain;todtv.com.tr:tod tv|=tod;'
+'beinconnect.com.tr:bein;tabii.com:=tabii|tabii uyelik;mubi.com:mubi;hbomax.com:hbo;deezer.com:deezer;fizy.com:fizy;google.com:google;microsoft.com:microsoft|office 365;xbox.com:xbox|game pass;'
+'playstation.com:playstation|psn|ps plus|ps store;steampowered.com:steam;epicgames.com:epic games;nintendo.com:nintendo;openai.com:chatgpt|openai;claude.ai:claude|anthropic;github.com:github;'
+'adobe.com:adobe;canva.com:canva;dropbox.com:dropbox;notion.so:notion;duolingo.com:duolingo;linkedin.com:linkedin;x.com:twitter;instagram.com:instagram;facebook.com:facebook;tiktok.com:tiktok;'
+'twitch.tv:twitch;discord.com:discord;tinder.com:tinder;zoom.us:=zoom|zoom pro;udemy.com:udemy;coursera.org:coursera;'
 /* akaryakıt, şarj */
+'shell.com.tr:shell;opet.com.tr:opet;bp.com:bp;petrolofisi.com.tr:petrol ofisi;totalenergies.com.tr:totalenergies|total istasyon|=total;~aytemiz.com.tr:aytemiz;~lukoil.com.tr:lukoil;alpet.com.tr:alpet;'
+'kadoil.com:kadoil;zes.net:=zes|zes sarj;trugo.com.tr:trugo;tesla.com:tesla;togg.com.tr:togg;'
 /* ulaşım, seyahat, bilet */
+'uber.com:uber;bitaksi.com:bitaksi;marti.tech:marti scooter|marti tag|=marti;turkishairlines.com:thy|turk hava yollari|turkish airlines;flypgs.com:pegasus;sunexpress.com:sunexpress|sun express;'
+'ajet.com:ajet|anadolujet;obilet.com:obilet;enuygun.com:enuygun|en uygun;istanbulkart.istanbul:istanbul ?kart;ispark.istanbul:ispark;booking.com:booking;airbnb.com:airbnb;etstur.com:ets ?tur;'
+'jollytur.com:jolly ?tur|=jolly;tatilsepeti.com:tatil ?sepeti;tatilbudur.com:tatil ?budur;avis.com.tr:avis;garenta.com.tr:garenta;yolcu360.com:yolcu360;biletix.com:biletix;passo.com.tr:passo;'
+'paribucineverse.com:cineverse|cinemaximum;'
 /* yeme içme */
+'starbucks.com.tr:starbucks;~kahvedunyasi.com:kahve dunyasi;mcdonalds.com:mc ?donald.?s?;burgerking.com.tr:burger ?king;kfcturkiye.com:kfc;popeyes.com.tr:popeyes;dominos.com.tr:domino.?s;'
+'littlecaesars.com.tr,littlecaesars.com:little caesars;subway.com.tr:subway;simitsarayi.com.tr:simit sarayi;tavukdunyasi.com:tavuk dunyasi;komagene.com:komagene;espressolab.com:espresso ?lab;gloriajeans.com.tr:gloria jean.?s?;'
+'mado.com.tr:mado;bigchefs.com.tr:big ?chefs;hdiskender.com:hd iskender;baydoner.com:baydoner;arbys.com.tr:arby.?s;tchibo.com.tr:tchibo;~nespresso.com:nespresso;~kofteciyusuf.com:kofteci yusuf;~ozsut.com.tr:ozsut;'
 /* ev, yapı market, beyaz eşya, kitap, oyuncak */
+'ikea.com.tr:ikea;koctas.com.tr:koctas;bauhaus.com.tr:bauhaus;tekzen.com.tr:tekzen;englishhome.com:english home;madamecoco.com:madame coco;karaca.com:karaca home|=karaca;bellona.com.tr:bellona;'
+'istikbal.com.tr:istikbal mobilya|=istikbal;dogtas.com:dogtas;vivense.com:vivense;evidea.com:evidea;arcelik.com.tr:arcelik;beko.com.tr:beko;vestel.com:vestel;bosch-home.com.tr:bosch;dyson.com.tr:dyson;'
+'philips.com.tr:philips;mudo.com.tr:mudo;dr.com.tr:d ?& ?r;kitapyurdu.com:kitap ?yurdu;idefix.com:idefix;~bkmkitap.com:bkm ?kitap;toyzzshop.com:toyzz;lego.com:lego;petlebi.com:petlebi;'
 /* sağlık, spor */
+'acibadem.com.tr:acibadem;medicalpark.com.tr:medical ?park;memorial.com.tr:memorial;medicana.com.tr:medicana;livhospital.com:liv hospital;dunyagoz.com:dunyagoz|dunya goz;macfit.com:mac ?fit;'
+'sportive.com.tr:sportive;~intersport.com.tr:intersport;'
 /* fatura, kamu, kargo, sigorta */
+'enerjisa.com.tr:enerjisa;igdas.istanbul:igdas;iski.istanbul:iski;turkiye.gov.tr:e-?devlet;gib.gov.tr:gib|vergi dairesi;sgk.gov.tr:sgk|bagkur|bag-kur;'
+'ptt.gov.tr:ptt;~yurticikargo.com:yurtici kargo;araskargo.com.tr:aras kargo;mngkargo.com.tr:mng;suratkargo.com.tr:surat kargo;ups.com:ups;dhl.de:dhl;fedex.com:fedex;allianz.com.tr:allianz;'
+'axa.com:axa;anadolusigorta.com.tr:anadolu sigorta;aksigorta.com.tr:aksigorta;turkiyesigorta.com.tr:turkiye sigorta;mapfre.com.tr:mapfre;'
 /* banka, ödeme, yatırım */
+'garantibbva.com.tr:garanti bbva|garanti bankasi|garanti kart|bonus kart|=garanti;isbank.com.tr:is bankasi|isbank|is bank|maximum kart;akbank.com:akbank|axess;yapikredi.com.tr:yapi ?kredi|worldcard;'
+'ziraatbank.com.tr:ziraat;halkbank.com.tr:halkbank|halk bankasi;~vakifbank.com.tr:vakifbank|vakif bank;~qnb.com.tr:qnb|finansbank;denizbank.com:denizbank;cepteteb.com.tr:teb;ing.com.tr:ing;enpara.com:enpara;'
+'kuveytturk.com.tr:kuveyt ?turk;hsbc.com.tr:hsbc;~odeabank.com.tr:odeabank|odea;fibabanka.com.tr:fibabanka;~sekerbank.com.tr:sekerbank;albaraka.com.tr:albaraka;~turkiyefinans.com.tr:turkiye finans;'
+'nkolay.com:n ?kolay;papara.com:papara;paypal.com:paypal;iyzico.com:iyzico;wise.com:=wise|wise transfer;tosla.com:tosla;ininal.com:ininal;binance.com:binance;paribu.com:paribu;btcturk.com:btc ?turk;getmidas.com:midas';
var MRC=null,MRC_C={},MRC_OK={},MRC_BAD={};
function mrcList(){
  if(MRC)return MRC;MRC=[];
  MRC_T.split(';').forEach(function(e){var i=e.indexOf(':'),d=e.slice(0,i),n=[],w=[];
    e.slice(i+1).split('|').forEach(function(a){if(a.charAt(0)==='=')w.push(a.slice(1));else n.push(a);});
    /* "pull ?(and|&) ?bear" gibi adların içindeki | ayraçla bölündüğü için parantezi açık kalan parçalar yeniden birleştirilir */
    n=mrcJoin(n);w=mrcJoin(w);
    var rx=[];if(n.length)rx.push('(?:^|[^a-z0-9])(?:'+n.join('|')+')(?![a-z0-9])');if(w.length)rx.push('^(?:'+w.join('|')+')(?![a-z0-9 ])');
    try{MRC.push([new RegExp(rx.join('|')),d]);}catch(x){}});
  return MRC;
}
function mrcJoin(a){var o=[],b='';a.forEach(function(p){b=b?b+'|'+p:p;if((b.match(/\(/g)||[]).length===(b.match(/\)/g)||[]).length){o.push(b);b='';}});if(b)o.push(b);return o;}
/* site adı: "https://www.ornek.com.tr/abc" → "ornek.com.tr"; geçersizse '' */
function mrcClean(d){d=String(d||'').trim().toLowerCase().replace(/^[a-z]+:\/\//,'').replace(/^www\./,'').replace(/[\/?#].*$/,'');return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)&&d.length<=80?d:'';}
/* açıklamadan mağazanın sitesi: önce kendi eklediklerin, sonra bilinen mağazalar */
function mrcDom(txt){
  if(!txt)return '';var k=' '+txt;if(typeof MRC_C[k]==='string')return MRC_C[k];
  var f=fold(txt).replace(/[’`´]/g,"'").trim(),d='',own=S.mlgs||{},ks=Object.keys(own).sort(function(a,b){return b.length-a.length;});
  for(var i=0;i<ks.length&&!d;i++){var p=f.indexOf(ks[i]);if(p>=0&&!/[a-z0-9]/.test(f.charAt(p-1))&&!/[a-z0-9]/.test(f.charAt(p+ks[i].length)))d=own[ks[i]];}
  if(!d){var L=mrcList();for(var j=0;j<L.length;j++)if(L[j][0].test(f)){d=L[j][1];break;}}
  return MRC_C[k]=d;
}
/* denenecek adresler, sırayla: sitenin kendisi, www'li hâli, www'li ve www'siz tam adresi (servis bazı sitelerin logosunu yalnızca bunlardan biriyle verir);
   "site,yedek" biçiminde birden çok site verilmişse sonraki siteler de aynı sırayla denenir; en son ikinci kaynak (Vemetric) denenir */
function mrcUrls(d){var o=[],g='https://www.google.com/s2/favicons?sz=128&',v='https://favicon.vemetric.com/',L=String(d).split(',');L.forEach(function(x){if(x.charAt(0)==='~'){o.push(v+x.slice(1)+'?size=128');return;}o.push(g+'domain='+encodeURIComponent(x),g+'domain=www.'+encodeURIComponent(x),g+'domain_url='+encodeURIComponent('https://www.'+x+'/'),g+'domain_url='+encodeURIComponent('https://'+x+'/'));});
  if(L[0].charAt(0)!=='~')o.push(v+L[0]+'?size=128');return o;}
/* liste satırı simgesi: mağaza tanınırsa logosu (yüklenene kadar ve yüklenemezse kategori simgesi), tanınmazsa kategori simgesi */
function mrcIc(txts,c,cls){
  var d='';if(S.mlg!==false&&navigator.onLine!==false)for(var i=0;i<txts.length&&!d;i++)d=mrcDom(txts[i]);
  if(!d||MRC_BAD[d])return cic(c,cls);
  return '<span class="cic mlg'+(MRC_OK[d]?' ok':'')+(cls?' '+cls:'')+'" style="color:'+color(c)+';background:'+catTint(c)+'" aria-hidden="true">'+ic(catIcKey(c))+'<img src="'+mrcUrls(d)[(MRC_OK[d]||1)-1]+'" data-d="'+esc(d)+'" data-s="'+((MRC_OK[d]||1)-1)+'" alt="""" referrerpolicy="no-referrer"></span>';
}
function mrcFail(g){var d=g.dataset.d,u=mrcUrls(d),n=(+g.dataset.s||0)+1,p=g.parentNode;delete MRC_OK[d];if(p)p.classList.remove('ok');
  if(n<u.length){g.dataset.s=n;g.src=u[n];return;}
  MRC_BAD[d]=1;if(p)p.removeChild(g);}
/* güvenlik politikası satır içi olay işleyicisine izin vermediği için yükleme/hata olayları belgeden yakalanır.
   Google, simgesi olmayan site için 16 piksellik bir dünya resmi, Vemetric 24 piksellik bir çizim döndürür; ikisi de "logo yok" sayılır. */
document.addEventListener('load',function(e){var g=e.target;if(!g||g.tagName!=='IMG'||!g.dataset||!g.dataset.d)return;
  if(g.naturalWidth<=(g.src.indexOf('vemetric')>0?99:16)){mrcFail(g);return;}MRC_OK[g.dataset.d]=(+g.dataset.s||0)+1;if(g.parentNode)g.parentNode.classList.add('ok');},true);
document.addEventListener('error',function(e){var g=e.target;if(g&&g.tagName==='IMG'&&g.dataset&&g.dataset.d)mrcFail(g);},true);
window.addEventListener('online',function(){MRC_BAD={};});
/* Ayarlar › Genel › Görünüm: aç/kapat ve listede olmayan mağaza için kendi eşleştirmen */
function mrcSec(){
  var own=S.mlgs||{},ks=Object.keys(own).sort(),ls=ks.length?'<div class="list">'+ks.map(function(k){return '<div class="item">'+mrcIc([k],'')+'<span class="mid"><div class="t">'+esc(k)+'</div><div class="small muted ell">'+esc(own[k])+'</div></span><button class="btn small ghost" data-act="mlg-del" data-id="'+esc(k)+'">Sil</button></div>';}).join('')+'</div>':'';
  return tgl('mlg','Mağaza logoları','Açıklamada adı geçen mağazanın gerçek logosu gösterilir (Migros, Trendyol, Netflix…). Logo internetten gelir; yalnızca mağazanın site adı gönderilir.')
   +(S.mlg!==false?'<div class="lbl">Listede olmayan mağaza</div>'+ls+'<div class="two"><div class="field"><label for="ml-n">Açıklamada geçen ad</label><input id="ml-n" placeholder="kahveci ali" autocapitalize="off"></div><div class="field"><label for="ml-d">Mağazanın sitesi</label><input id="ml-d" placeholder="kahveciali.com" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false"></div></div><div class="err" id="ml-err"></div><button class="btn" data-act="mlg-add">Logo ekle</button>':'');
}
ACT['mlg-add']=function(){
  var n=fold(val('ml-n')).replace(/[’`´]/g,"'").trim(),d=mrcClean(val('ml-d')),er=document.getElementById('ml-err');
  if(n.length<2){if(er)er.textContent='Açıklamada geçen adı yaz (en az 2 harf).';return;}
  if(!d){if(er)er.textContent='Site adını “ornek.com” biçiminde yaz.';return;}
  S.mlgs=S.mlgs||{};S.mlgs[n]=d;MRC_C={};delete MRC_BAD[d];save();render();
};
ACT['mlg-del']=function(el,id){if(S.mlgs)delete S.mlgs[id];MRC_C={};save();render();};
