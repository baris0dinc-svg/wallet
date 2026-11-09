
/* ---------- Koç: finansal özgürlük yol haritası ve finansal okuryazarlık ----------
   Kurallar:
   - Her öneri kullanıcının kendi verisinden çıkar ve koşulu sağlanmazsa görünmez; sayılar metinde gösterilir.
   - Veri yetmiyorsa öneri yerine hangi verinin eksik olduğu söylenir.
   - Türkiye'ye özgü oranlar aşağıda kaynağı ve tarihiyle durur (uygulama güncellemeleriyle yenilenir);
     ücretsiz ve anahtarsız güvenilir bir canlı kaynak bulunamadığı için ağdan alınmaz. Tarihi eskiyen veri ekranda belirtilir.
   - Ürün adı verilmez; kategoriler ve ödünleşimler anlatılır. Eğitim amaçlıdır, yatırım tavsiyesi değildir.
   Sıra (yerleşik kişisel finans önceliği): gelir ≥ gider → 1 aylık tampon → pahalı borç → 3–6 aylık acil durum fonu
   → enflasyona karşı koruma (reel getiri) → uzun vade (çeşitlendirme, BES) → finansal özgürlük. */
var FACTS={
  /* TÜİK TÜFE, aylık % değişim, 2024-01'den itibaren (TCMB "Tüketici Fiyatları" tablosu, 9 Kasım 2026'da okundu) */
  cpi:{from:'2024-01',m:[6.70,4.53,3.16,3.18,3.37,1.64,3.23,2.47,2.97,2.88,2.24,1.03,5.03,2.27,2.46,3.00,1.53,1.37,2.06,2.04,3.23,2.55,0.87,0.89,4.84,2.96,1.94,4.18,1.71,0.99,1.78,1.84,1.84,2.58]},
  inf:{v:29.77,m:2.58,per:'Ekim 2026',d:'2026-11-03',src:'TÜİK, Tüketici Fiyat Endeksi (TCMB enflasyon verileri sayfası)'},
  pol:{v:36,d:'2026-10-22',src:'TCMB Para Politikası Kurulu, basın duyurusu 2026-45'},
  dep:{t6:17.5,t12:15,t12p:10,d:'Kasım 2026',src:'Cumhurbaşkanı Kararı 10041 (9.7.2025) ve süre uzatımları; banka stopaj tabloları'},
  fund:{mm:17.5,eq:0,d:'Ekim 2026',src:'GVK geçici 67. madde; Cumhurbaşkanı Kararları 10041 ve 11107'},
  dibs:{v:0,until:'31 Aralık 2026',src:'Cumhurbaşkanı Kararı 11444 (Resmî Gazete 20.6.2026)'},
  /* kredi kartı azami aylık akdi faiz: dönem borcuna göre kademeler (TL) ve gecikme faizi */
  card:{t:[[30000,3.25,3.55],[180000,3.75,4.05],[Infinity,4.25,4.55]],cash:4.25,d:'Eylül 2026 (1 Ocak 2026’dan beri aynı)',src:'TCMB, kredi kartı azami faiz oranları (Tebliğ 2020/16)'},
  minpay:{lim:100000,lo:20,hi:40,d:'Ekim 2026',src:'BDDK Kararı 11581 (1.10.2026)'},
  bes:{v:20,cap:79272,vest:[[3,15],[6,35],[10,60]],d:'1 Ocak 2026',src:'Cumhurbaşkanı Kararı 10811 (Resmî Gazete 7.1.2026); Emeklilik Gözetim Merkezi'},
  tmsf:{v:1200000,d:'2026',src:'TMSF (1 Ocak 2026’dan itibaren)'},
  loan:{kkdf:15,bsmv:15,src:'İhtiyaç kredisi: KKDF %15, BSMV %15 (banka ürün bilgi formları)'}
};
var CK={v:-1};
function fPct(x,d){return '%'+(d?NUM2:NUM1).format(x);}
/* yıllık enflasyon verisi kaç günlük */
function infAge(){return daysBetween(FACTS.inf.d,todayS());}
/* iki tarih arasındaki birikimli TÜFE: aylık verilerle, ayın gün oranında; verinin bittiği aylardan sonrası son 12 ayın ortalama aylık
   oranıyla, 2024 öncesi Ocak 2024'teki yıllık oranla tahmin edilir (yaklaşık değer) */
function cpiRate(k){var C=FACTS.cpi,i=(+k.slice(0,4)-+C.from.slice(0,4))*12+(+k.slice(5,7)-+C.from.slice(5,7));
  if(i>=0&&i<C.m.length)return C.m[i]/100;return i<0?Math.pow(1.6486,1/12)-1:Math.pow(1+FACTS.inf.v/100,1/12)-1;}
function cumInf(a,b){
  if(!(b>a))return 0;var f=1,ma=a.slice(0,7),mb=b.slice(0,7),k=ma,g=0;
  while(k<=mb&&g++<600){var dim=new Date(+k.slice(0,4),+k.slice(5,7),0).getDate(),st=k===ma?+a.slice(8,10):0,en=k===mb?+b.slice(8,10):dim;
    f*=Math.pow(1+cpiRate(k),Math.max(0,en-st)/dim);k=addMonth(k,1);}
  return f-1;
}
/* kredi kartı: dönem borcuna göre yasal azami aylık faiz */
function cardRate(d){var t=FACTS.card.t;for(var i=0;i<t.length;i++)if(d<t[i][0])return t[i];return t[t.length-1];}
/* aylık r oranlı B borcu, ayda P ödemeyle kaç ayda biter (P ≤ faiz ise Infinity) */
function payoffMonths(B,r,P){if(B<=0)return 0;if(r<=0)return P>0?Math.ceil(B/P):Infinity;if(P<=B*r)return Infinity;return Math.ceil(-Math.log(1-r*B/P)/Math.log(1+r));}
function payoffInterest(B,r,P){var n=payoffMonths(B,r,P);if(!isFinite(n))return Infinity;var b=B,tot=0;for(var i=0;i<n&&b>0.005;i++){var it=b*r;tot+=it;b=b+it-Math.min(P,b+it);}return tot;}
function annual(rm){return (Math.pow(1+rm/100,12)-1)*100;}
var BUCK=[['tl','TL nakit ve mevduat'],['fx','Döviz'],['gold','Altın ve gümüş'],['eq','Hisse'],['fon','Fon'],['kripto','Kripto'],['bes','BES'],['diger','Diğer']];

/* kullanıcının verisinden ölçümler */
function coachData(){
  var key=TXV+'|'+S.savedAt+'|'+S.fxTs+'|'+todayS();if(CK.k===key)return CK.v;
  var cur=curP(),W=wealth(),ks=prevKs(cur,6).filter(function(k){return monthTx(k).some(function(t){return t.type==='inc'||t.type==='exp';});}).slice(0,3);
  var inc=0,exp=0;ks.forEach(function(k){var m=monthTx(k);inc+=sum(m,'inc');exp+=sum(m,'exp');});
  var n=ks.length;inc=n?r2(inc/n):0;exp=n?r2(exp/n):0;
  var incN=ks.filter(function(k){return sum(monthTx(k),'inc')>0;}).length;
  var surplus=r2(inc-exp),sr=inc>0?surplus/inc*100:null;
  var eg=emGoal(),em=eg?goalSaved(eg):Math.max(W.g.liquid,0),emM=exp>0?em/exp:null;
  /* vadesiz TL: nakit ve banka türü TL hesaplardaki artı bakiyeler (birikim hesapları faizli sayılır) */
  var vad=0,buck={tl:0,fx:0,gold:0,eq:0,fon:0,kripto:0,bes:0,diger:0};
  ACCS().forEach(function(a){var b=acctBal(a),t=acctType(a),c=ccyOf(a);if(b<=0||t==='kart')return;var tl=toTL(b,a);
    if(c==='TRY'){buck.tl+=tl;if(t==='nakit'||t==='banka')vad+=tl;}else if(c==='XAU')buck.gold+=tl;else buck.fx+=tl;});
  var hold=[];
  S.holdings.forEach(function(h){if(hKind(h)!=='inv')return;var v=hVal(h);if(!(v>0))return;
    var b={Hisse:'eq',Fon:'fon',Altın:'gold',Gümüş:'gold',Döviz:'fx',Kripto:'kripto',Mevduat:'tl',BES:'bes'}[h.type]||'diger';buck[b]+=v;
    var first=null;S.tx.forEach(function(t){if(t.type==='inv'&&t.side==='buy'&&t.hold===h.id&&(!first||t.date<first))first=t.date;});
    if(first&&hCost(h)>0)hold.push({h:h,date:first,days:daysBetween(first,todayS()),nom:hVal(h)/hCost(h)-1});});
  hold.forEach(function(x){x.inf=cumInf(x.date,todayS());x.real=(1+x.nom)/(1+x.inf)-1;});
  var fa=0;Object.keys(buck).forEach(function(k){buck[k]=r2(buck[k]);fa+=buck[k];});
  var cards=[];ACCS().forEach(function(a){if(acctType(a)!=='kart')return;var b=acctBal(a);if(!(b<0))return;var d=r2(toTL(-b,a)),x=ax(a),lim=+x.limit>0?toTL(+x.limit,a):0;
    cards.push({a:a,debt:d,lim:lim,rate:cardRate(d),mp:lim>0?(lim>FACTS.minpay.lim?FACTS.minpay.hi:FACTS.minpay.lo):null});});
  var debts=S.debts.filter(function(d){return debtLeft(d)>0;}).map(function(d){var r=+d.rate>0?+d.rate:null,inst=0;
    S.recurring.forEach(function(rc){if(rc.debt===d.id)inst+=toTL(+rc.amt||0,rc.acct);});return {d:d,left:debtLeft(d),rate:r,ann:r!=null?annual(r):null,inst:r2(inst)};});
  var v={cur:cur,n:n,incN:incN,inc:inc,exp:exp,surplus:surplus,sr:sr,W:W,eg:eg,em:r2(em),emM:emM,vad:r2(vad),buck:buck,fa:r2(fa),hold:hold,cards:cards,debts:debts,
    cardDebt:r2(cards.reduce(function(a,c){return a+c.debt;},0)),liquid:Math.max(W.g.liquid,0),fire:fireModel(),sample:hasSample()};
  CK={k:key,v:v};return v;
}

/* yol haritası: her adım {id,t,st:'done'|'now'|'need'|'todo',sum,body,act,why} */
function coachSteps(){
  var D=coachData(),I=FACTS.inf.v,out=[],T=TRY0.format,G=D.exp,S0=D.surplus,
    nextEnd=pdate(pEnd(D.cur)).toLocaleDateString('tr-TR',{day:'numeric',month:'long'});
  var noHist=D.n===0,noInc=D.incN===0;
  /* 1. akış */
  (function(){var s={id:'akis',t:'Gelirin giderini karşılasın'};
    if(noHist){s.st='need';s.sum='Henüz tamamlanmış bir dönemin yok.';s.body='Koç, tamamlanmış dönemlerin ortalamasıyla çalışır. Bu dönem '+esc(nextEnd)+' günü bitince gelir ve giderlerinden hesaplanır.';}
    else if(noInc){s.st='need';s.sum='Son '+D.n+' dönemde gelir kaydı yok.';s.body='Tasarruf oranı ve diğer adımlar gelire göre hesaplanır. Maaşını ve diğer gelirlerini gelir olarak ekle.';s.act=['Gelir ekle','qa-inc'];}
    else if(S0<0){s.st='now';var avg=catAvg(D.cur),top=Object.keys(avg).sort(function(a,b){return avg[b]-avg[a];}).slice(0,3);
      s.sum='Ayda ortalama '+T(-S0)+' açık veriyorsun.';
      s.body='Son '+D.n+' dönemde ortalama gelirin <b>'+T(D.inc)+'</b>, giderin <b>'+T(D.exp)+'</b>: ayda <b class="exp">'+T(-S0)+'</b> açık. '+(top.length?'En büyük kalemlerin: '+top.map(function(c){return esc(c)+' '+T(avg[c]);}).join(', ')+'. ':'')+'Açık kapanmadan borç kapatma ya da birikim planı sürdürülemez; önce bu kalemlere bütçe koy.';
      s.act=Object.keys(S.budgets).length?['Bütçeye git','plan-go',null,'butce']:['Bütçe öner','plan-go',null,'butce'];}
    else{s.st='done';s.sum='Tasarruf oranın '+fPct(D.sr)+' (ayda '+T(S0)+').';
      s.body='Son '+D.n+' dönemde ortalama gelirin '+T(D.inc)+', giderin '+T(D.exp)+'.'+(D.sr<10?' Oran düşük: gelirin en az %10–20’sini ayırabilmek için en büyük harcama kalemlerine bak.':'');}
    s.why='<p>Tasarruf oranı = (gelir − gider) ÷ gelir. Senin için: ('+T(D.inc)+' − '+T(D.exp)+') ÷ '+T(D.inc)+(D.inc>0?' = '+fPct(D.sr||0):'')+'. Gelir giderden azsa aradaki fark ya birikimden ya da borçtan karşılanır; ikisi de sürdürülemez.</p>';
    out.push(s);})();
  /* 2. küçük tampon */
  (function(){var s={id:'tampon',t:'Önce 1 aylık tampon',act:['Acil durum fonu','em-open']};
    if(!(G>0)){s.st='need';s.sum='Aylık gider ortalaman yok.';s.body='Tamponun büyüklüğü aylık giderine göre hesaplanır. Bir dönemin giderleri kaydedilince hesaplanır.';}
    else if(D.em<G){s.st='now';var miss=G-D.em,mo=S0>0?Math.ceil(miss/S0):null;s.sum=T(D.em)+' var, 1 aylık gider '+T(G)+'.';
      s.body=(D.eg?'“'+esc(D.eg.name)+'” fonunda':'Nakit, banka ve birikim hesaplarında')+' <b>'+T(D.em)+'</b> var; bir aylık giderin <b>'+T(G)+'</b>. Eksik: <b>'+T(miss)+'</b>.'+(mo?' Aylık fazlanın ('+T(S0)+') tamamını ayırırsan '+mo+' ayda tamamlanır.':'')+' Beklenmedik bir masraf seni karta ya da krediye itmesin diye borçlara saldırmadan önce bu küçük tamponu kur.';}
    else{s.st='done';s.sum=T(D.em)+': en az 1 aylık gider hazır.';s.body='Ayrılmış paran ('+T(D.em)+') bir aylık giderini ('+T(G)+') karşılıyor.';}
    s.why='<p>Tampon yoksa küçük bir sürpriz (arıza, sağlık) çoğu zaman kredi kartına yazılır. Kartta taşınan borcun yasal azami faizi aylık '+fPct(FACTS.card.t[0][1],1)+'–'+fPct(FACTS.card.t[2][1],1)+' (yıllık bileşik '+fPct(annual(FACTS.card.t[0][1]))+'–'+fPct(annual(FACTS.card.t[2][1]))+').</p>';
    out.push(s);})();
  /* 3. pahalı borç */
  (function(){var s={id:'borc',t:'Pahalı borçları kapat'},lines=[],now=false,need=[];
    D.cards.forEach(function(c){var r=c.rate[1],mpP=c.mp,mpA=mpP!=null?c.debt*mpP/100:null,left=mpA!=null?c.debt-mpA:c.debt*0.8,intr=left*r/100;
      var cover=D.liquid>=c.debt;if(!cover)now=true;
      lines.push('<li><b>'+esc(c.a)+'</b>: borç '+T(c.debt)+'. '+(mpP!=null?'Asgari ödeme dönem borcunun %'+mpP+'’i ('+T(mpA)+'). ':'Kart limiti girilmediği için asgari ödeme %'+FACTS.minpay.lo+' varsayıldı (limit ₺'+NUM1.format(FACTS.minpay.lim/1000)+' binin üstündeyse %'+FACTS.minpay.hi+'). ')+'Yalnızca asgariyi ödersen kalan '+T(left)+' için ayda yaklaşık <b>'+T(intr)+'</b> faiz işler (yasal üst sınır aylık '+fPct(r,1)+').'+(cover?' Nakit ve banka bakiyen ('+T(D.liquid)+') borcun tamamını karşılıyor: son ödeme gününde tamamını öde.':' <b class="exp">Nakit ve banka bakiyen ('+T(D.liquid)+') borcu karşılamıyor.</b>')+'</li>');});
    var hi=D.debts.filter(function(x){return x.rate!=null&&x.ann>I;}).sort(function(a,b){return b.rate-a.rate;}),lo=D.debts.filter(function(x){return x.rate!=null&&x.ann<=I;});
    hi.forEach(function(x,i){now=true;var P=Math.max(S0,0)+x.inst,n=P>0?payoffMonths(x.left,x.rate/100,P):Infinity,it=isFinite(n)?payoffInterest(x.left,x.rate/100,P):null;
      lines.push('<li>'+(i===0&&hi.length>1?'<b>Önce bu:</b> ':'')+'<b>'+esc(x.d.name)+'</b>: kalan '+T(x.left)+', aylık faiz '+fPct(x.rate,1)+' (yıllık bileşik '+fPct(x.ann)+'; enflasyon '+fPct(I,1)+'). '+(isFinite(n)?(x.inst>0?'Taksitin ('+T(x.inst)+') ve aylık fazlan':'Aylık fazlan')+' ('+T(P)+') ile yaklaşık <b>'+n+' ayda</b> kapanır, toplam faiz ~'+T(it)+'.':(P>0?'Ayda '+T(P)+' ödeme faizi ('+T(x.left*x.rate/100)+') bile karşılamıyor.':'Aylık fazlan olmadığı için erken kapatma planı yapılamıyor.'))+'</li>');});
    lo.forEach(function(x){lines.push('<li><b>'+esc(x.d.name)+'</b>: yıllık bileşik maliyeti '+fPct(x.ann)+', enflasyonun ('+fPct(I,1)+') altında; reel maliyeti eksi. Erken kapatmak yerine önce acil durum fonu ve birikim.</li>');});
    D.debts.filter(function(x){return x.rate==null;}).forEach(function(x){need.push(x.d);});
    if(!D.cards.length&&!D.debts.length){s.st='done';s.sum='Kayıtlı borcun ya da kart borcun yok.';s.body='Kredi kartı borcu ya da kredi kaydı görünmüyor.';}
    else if(now){s.st='now';s.sum=hi.length?hi.length+' borcun faizi enflasyonun üstünde.':'Kart borcun nakit bakiyeni aşıyor.';}
    else if(need.length){s.st='need';s.sum=need.length+' borcun faiz oranı girilmemiş.';}
    else{s.st='done';s.sum=D.cards.length?'Kart borcunu nakdinle kapatabiliyorsun.':'Borçlarının faizi enflasyonun altında.';}
    if(!s.body)s.body=(lines.length?'<ul class="cl">'+lines.join('')+'</ul>':'')+(need.length?'<p>'+need.map(function(d){return '“'+esc(d.name)+'”';}).join(', ')+' için aylık faiz oranını gir; hangi borcu önce kapatman gerektiğini buna göre hesaplarım.</p>':'')+(hi.length>1?'<p>Sıralama en yüksek faizliden başlar (çığ yöntemi): diğerlerinin taksitlerini öde, fazlanı en pahalıya yönlendir.</p>':'');
    s.act=need.length?['Faiz oranını gir','edit-d',need[0].id]:(D.debts.length?['Borçlarım','sv-go',null,'borc']:(D.cards.length?['Kartı öde','acct-trf',D.cards[0].a]:null));
    s.why='<p>Yıllık bileşik maliyet = (1 + aylık faiz)<sup>12</sup> − 1. Aylık '+fPct(FACTS.card.t[0][1],1)+' kart faizi yılda '+fPct(annual(FACTS.card.t[0][1]))+' eder. Enflasyonun ('+fPct(I,1)+') üstünde faizli bir borcu erken kapatmak, o faiz kadar risksiz bir getiri gibidir; enflasyonun altında faizli borcun reel maliyeti eksidir.</p><p>Asgari ödeme: kart limiti ₺'+NUM1.format(FACTS.minpay.lim/1000)+' bine kadar olanlarda dönem borcunun %'+FACTS.minpay.lo+'’si, üstünde %'+FACTS.minpay.hi+'’ı. Asgari ödeyip kalanı devretmek, kalan tutara akdi faiz işlemesi demektir.</p>';
    out.push(s);})();
  /* 4. acil durum fonu */
  (function(){var s={id:'acil',t:'Acil durum fonu: 3–6 aylık gider',act:['Acil durum fonu','em-open']};
    if(!(G>0)){s.st='need';s.sum='Aylık gider ortalaman yok.';s.body='Fon hedefi aylık giderine göre hesaplanır.';}
    else{var m=D.emM,t3=3*G,t6=6*G;
      if(m<3){s.st='now';var miss=t3-D.em,mo=S0>0?Math.ceil(miss/S0):null;s.sum=NUM1.format(m)+' aylık gider; hedef 3–6 ay.';
        s.body='Acil durum fonun <b>'+T(D.em)+'</b>, aylık giderinin ('+T(G)+') <b>'+NUM1.format(m)+' katı</b>; hedef 3–6 ay ('+T(t3)+'–'+T(t6)+'). 3 ay için eksik: <b>'+T(miss)+'</b>.'+(mo?' Aylık fazlanın tamamını ('+T(S0)+') ayırırsan '+mo+' ayda, yarısını ayırırsan '+Math.ceil(miss/(S0/2))+' ayda tamamlanır.':' Önce akışı artıya çevirmek gerekiyor.')+(D.eg?'':' Ayrı bir fon işaretlemedin; nakit, banka ve birikim hesapların sayıldı.');}
      else{s.st='done';s.sum=NUM1.format(m)+' aylık gider hazır.';s.body='Fonun '+T(D.em)+', '+NUM1.format(m)+' aylık giderini karşılıyor'+(m<6?'; gelirin düzensizse 6 aya ('+T(t6)+') tamamla.':'.');}}
    s.why='<p>Acil durum fonu hızlı ulaşılabilir ve değeri dalgalanmayan yerde durmalı: vadesiz ya da kısa vadeli mevduat, para piyasası fonu gibi. Hisse ve kripto bu iş için uygun değildir; ihtiyaç anında değer kaybında olabilirler.</p><p>Bankadaki mevduat ve katılım fonları kişi ve banka başına '+T(FACTS.tmsf.v)+'’ye kadar TMSF güvencesindedir ('+FACTS.tmsf.d+'). Yatırım fonları mevduat sigortası kapsamında değildir.</p>';
    out.push(s);})();
  /* 5. enflasyona karşı koru */
  (function(){var s={id:'enf',t:'Parayı enflasyona karşı koru'},lines=[],now=false;
    if(!(D.fa>0)){s.st='need';s.sum='Hesap bakiyelerin ve yatırımların girilmemiş.';s.body='Hesaplarına başlangıç bakiyesi gir ya da yatırımlarını ekle; paranın ne kadarının faizsiz beklediğini hesaplarım.';s.act=['Hesaplarım','sv-go',null,'hesap'];out.push(s);return;}
    var idle=G>0?D.vad-G:0;
    if(G>0&&idle>=G*0.5){now=true;var loss=idle*(1-1/(1+I/100));
      lines.push('<li>Vadesiz TL hesaplarında (nakit ve banka) <b>'+T(D.vad)+'</b> var; bir aylık giderini ('+T(G)+') ayırınca <b>'+T(idle)+'</b> faizsiz bekliyor. Yıllık enflasyon '+fPct(I,1)+' sürerse bu tutarın alım gücü bir yılda yaklaşık <b class="exp">'+T(loss)+'</b> azalır.</li>');}
    D.hold.filter(function(x){return x.days>=60;}).sort(function(a,b){return a.real-b.real;}).slice(0,4).forEach(function(x){if(x.real<-0.02)now=true;
      lines.push('<li><b>'+esc(x.h.name)+'</b>: alıştan bu yana nominal '+(x.nom>=0?'+':'−')+fPct(Math.abs(x.nom*100))+' ('+Math.round(x.days/30.4)+' ay); aynı sürede TÜFE ~'+fPct(x.inf*100)+' → reel <b class="'+(x.real>=0?'inc':'exp')+'">'+(x.real>=0?'+':'−')+fPct(Math.abs(x.real*100))+'</b>.</li>');});
    s.st=now?'now':'done';
    s.sum=now?(G>0&&idle>=G*0.5?T(idle)+' faizsiz bekliyor.':'Bir yatırımının reel getirisi eksi.'):(lines.length?'Yatırımlarının reel getirisi takipte.':'Faizsiz bekleyen fazla TL yok.');
    s.body=(lines.length?'<ul class="cl">'+lines.join('')+'</ul>':'<p>Vadesiz TL hesaplarındaki para ('+T(D.vad)+') bir aylık giderin civarında.</p>')+(G>0&&idle>=G*0.5?'<p>Seçenekler ve ödünleşimleri: vadeli mevduat (TMSF güvencesi, faize vadeye göre %'+NUM1.format(FACTS.dep.t6)+'–%'+NUM1.format(FACTS.dep.t12p)+' stopaj), para piyasası fonları (günlük çıkış, kazanca %'+NUM1.format(FACTS.fund.mm)+' stopaj, güvence yok), Devlet iç borçlanma senetleri (stopaj %'+FACTS.dibs.v+', '+FACTS.dibs.until+'’e kadar; vadeden önce satışta fiyat değişebilir). Karar vermeden önce net getiriyi enflasyonla karşılaştır.</p>':'');
    s.act=G>0&&idle>=G*0.5?['Mevduat hesaplayıcı','calc-go',null,'mevduat']:null;
    s.why='<p>Reel getiri = (1 + nominal getiri) ÷ (1 + enflasyon) − 1. Örnek: yıllık net %'+NUM1.format(I+5)+' getiri, %'+NUM1.format(I)+' enflasyonda reel ~'+fPct(((1+(I+5)/100)/(1+I/100)-1)*100)+'. Vadesiz hesabın nominal getirisi sıfır olduğundan reel getirisi '+fPct(-(1-1/(1+I/100))*100)+'.</p><p>Net getiri = brüt getiri × (1 − stopaj). Politika faizi '+fPct(FACTS.pol.v,1)+', yıllık enflasyon '+fPct(I,1)+' ('+esc(FACTS.inf.per)+').</p>';
    out.push(s);})();
  /* 6. uzun vade: çeşitlendirme ve BES */
  (function(){var s={id:'uzun',t:'Uzun vade: çeşitlendir, BES’i değerlendir'},lines=[],now=false;
    var pre=out.slice(0,4).every(function(x){return x.st==='done';});
    var top=BUCK.map(function(b){return [b[0],b[1],D.buck[b[0]]];}).sort(function(a,b){return b[2]-a[2];})[0];
    if(G>0&&D.fa>=3*G&&top&&top[2]/D.fa>0.8){now=true;lines.push('<li>Finansal varlıklarının (<b>'+T(D.fa)+'</b>) <b>'+fPct(top[2]/D.fa*100,0)+'</b>’i tek türde: '+esc(top[1])+'. Tek varlık türü, o türün riskini (TL’de enflasyon, dövizde kur, altında fiyat dalgalanması, hissede piyasa düşüşü) olduğu gibi taşır.</li>');}
    var hasBes=D.buck.bes>0;
    if(!hasBes&&D.inc>0&&S0>0){now=true;var q=Math.max(Math.round(S0/4/100)*100,100),dk=Math.min(q*12,FACTS.bes.cap/FACTS.bes.v*100)*FACTS.bes.v/100;
      lines.push('<li>Kayıtlı BES görünmüyor. Devlet katkısı yatırdığın katkı payının <b>%'+FACTS.bes.v+'</b>’si ('+FACTS.bes.d+'’ten beri; 2026’da yıllık en çok '+T(FACTS.bes.cap)+'). Örnek: aylık fazlanın dörtte birini (<b>'+T(q)+'</b>) ayırsan yılda ~<b>'+T(dk)+'</b> devlet katkısı eklenir. Ödünleşim: 3 yıldan önce çıkarsan devlet katkısının hiçbiri, 3 yılda %15’i, 6 yılda %35’i, 10 yılda %60’ı senin olur; tamamı 10 yıl ve 56 yaşla emeklilikte.</li>');}
    if(!pre){s.st='todo';s.sum='Önceki adımlar tamamlanınca.';s.body=lines.length?'<ul class="cl">'+lines.join('')+'</ul><p class="small muted">Önce önceki adımları tamamla.</p>':'<p>Önceki adımlar tamamlanınca değerlendirilir.</p>';}
    else if(now){s.st='now';s.sum=lines.length+' konu var.';s.body='<ul class="cl">'+lines.join('')+'</ul>';}
    else{s.st='done';s.sum=hasBes?'BES ve dağılım takipte.':'Varlık dağılımın dengeli görünüyor.';s.body='<p>Finansal varlıkların: '+BUCK.filter(function(b){return D.buck[b[0]]>0;}).map(function(b){return esc(b[1])+' '+fPct(D.buck[b[0]]/D.fa*100,0);}).join(', ')+'.</p>';}
    s.act=['Varlık dağılımı','sv-go',null,'hesap'];
    s.why='<p>Çeşitlendirme: farklı nedenlerle değer kazanıp kaybeden varlıkları bir arada tutmak tek bir riskin seni çok etkilemesini azaltır. Uzun vadede hisse senetlerinin ve hisse yoğun fonların getirisi yüksek ama dalgalıdır; TEFAS’ta işlem gören hisse yoğun fonların kazancında stopaj %'+FACTS.fund.eq+', para piyasası ve borçlanma araçları fonlarında %'+NUM1.format(FACTS.fund.mm)+'.</p><p>Bileşik getiri: getirinin de getiri kazanması. Reel %4 ile 20 yılda para '+NUM2.format(Math.pow(1.04,20))+' katına çıkar.</p>';
    out.push(s);})();
  /* 7. finansal özgürlük */
  (function(){var m=D.fire,s={id:'fire',t:'Finansal özgürlük',act:['FIRE hesabı','open-fire']},pre=out.every(function(x){return x.st==='done';});
    if(!m.ok){s.st='need';s.sum='Aylık harcama verisi yok.';s.body='Hedef, aylık harcamandan hesaplanır.';}
    else{s.st=pre?'now':'todo';s.sum=fPct(m.prog,0)+' · '+fmtYears(m.n);
      s.body='Hedef '+DC0.format(m.target)+(m.custom?' (senin hedefin)':' (yıllık harcamanın '+NUM1.format(1/m.wr)+' katı)')+'; mevcut '+DC0.format(Math.max(m.assets,0))+' (%'+NUM1.format(m.prog)+'). Aylık '+DC0.format(m.sv)+' birikim ve yıllık reel %'+NUM1.format(+S.fire.ret)+' getiriyle tahmini süre: <b>'+esc(fmtYears(m.n))+'</b>.';}
    s.why='<p>%4 kuralı: yıllık harcamanın 25 katı birikime ulaşınca her yıl %4 çekerek yaşayabilmek. ABD verisine dayanır; Türkiye’de enflasyon ve getiriler farklı seyredebilir, bu yüzden hesap reel (enflasyondan arındırılmış) getiriyle yapılır.</p>';
    out.push(s);})();
  return out;
}
function coachCur(l){l=l||coachSteps();for(var i=0;i<l.length;i++)if(l[i].st==='now'||l[i].st==='need')return i;return -1;}
var CSI={done:['check','inc','Tamam'],now:['flag','warn','Şimdi'],need:['search','blue','Veri gerekli'],todo:['r','ink2','Sonra']};
function stepAct(s){var a=s.act;if(!a)return '';return '<button class="btn small" data-act="'+a[1]+'"'+(a[2]!=null?' data-id="'+esc(a[2])+'"':'')+(a[3]!=null?' data-v="'+esc(a[3])+'"':'')+'>'+esc(a[0])+'</button>';}
function vKoc(){
  var D=coachData(),l=coachSteps(),ci=coachCur(l),H=health(),sc=H.score,h='';
  if(D.sample)h+='<div class="banner"><span>Koç şu an örnek verilere bakıyor; kendi kayıtların eklendikçe öneriler sana göre değişir.</span></div>';
  var ring=sc==null?'':'<svg class="ring" viewBox="0 0 42 42" role="img" aria-label="Finansal sağlık puanı '+sc+'"><circle cx="21" cy="21" r="17" fill="none" stroke="var(--soft)" stroke-width="5"/><circle cx="21" cy="21" r="17" fill="none" stroke="'+(sc>=60?'var(--inc)':(sc>=40?'var(--warn)':'var(--exp)'))+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(sc/100*106.8).toFixed(1)+' 106.8" transform="rotate(-90 21 21)"/><text x="21" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">'+sc+'</text></svg>';
  var tile=function(k,v,act,vv){return '<button class="kt" data-act="'+act+'"'+(vv?' data-v="'+vv+'"':'')+'><span class="lbl">'+k+'</span><b class="num">'+v+'</b></button>';};
  h+='<div class="card kochead"><div class="ghead">'+ring+'<span class="mid"><h2 style="margin:0">Finansal durumun</h2><div class="small muted">'+(sc==null?'Puan için gelir-gider kaydı gerekli.':scoreWord(sc)+' · 100 üzerinden '+sc)+'</div></span></div><div class="ktg">'
   +tile('Tasarruf oranı',D.sr==null?'—':(D.sr<0?'−':'')+'%'+Math.round(Math.abs(D.sr)),'plan-go','butce')
   +tile('Acil durum fonu',D.emM==null?'—':NUM1.format(D.emM)+' ay','em-open')
   +tile('Borç',D.cardDebt+D.debts.reduce(function(a,x){return a+x.left;},0)>0?compactT(D.cardDebt+D.debts.reduce(function(a,x){return a+x.left;},0)):'Yok','sv-go','borc')
   +tile('Özgürlük',D.fire.ok?'%'+NUM1.format(D.fire.prog):'—','open-fire')+'</div></div>';
  if(ci>=0){var c=l[ci];
    h+='<div class="card kocnow"><div class="lbl">Adım '+(ci+1)+'/'+l.length+' · '+CSI[c.st][2]+'</div><h2 style="margin:4px 0 4px">'+esc(c.t)+'</h2><p class="small muted" style="margin:0">'+c.sum+'</p>'+(c.act?'<div class="kacts">'+stepAct(c)+'</div>':'')+'<details class="why"><summary>Ayrıntı</summary><div class="kb">'+c.body+'</div></details><details class="why"><summary>Neden? Kısa ders</summary>'+c.why+'</details></div>';}
  else h+='<div class="card kocnow"><div class="lbl">Yol haritası</div><h2 style="margin:4px 0 6px">Tüm adımlar tamam</h2><p class="small muted" style="margin:0">Finansal özgürlük hesabını düzenli kontrol et.</p></div>';
  h+='<div class="card"><h2>Yol haritan</h2><div class="list">'+l.map(function(s,i){var x=CSI[s.st];
    if(i===ci)return '<div class="kstep st-'+s.st+' cur"><div class="item"><span class="sic sm" style="--c:var(--'+x[1]+')">'+ic(x[0])+'</span><span class="mid"><div class="t">'+(i+1)+'. '+esc(s.t)+'</div><div class="small muted">Şu anki adım</div></span></div></div>';
    return '<details class="kstep st-'+s.st+'"><summary class="item"><span class="sic sm" style="--c:var(--'+x[1]+')">'+ic(x[0])+'</span><span class="mid"><div class="t">'+(i+1)+'. '+esc(s.t)+'</div><div class="small muted">'+s.sum+'</div></span></summary><div class="kb">'+s.body+(s.act?'<div class="kacts">'+stepAct(s)+'</div>':'')+'<details class="why"><summary>Neden?</summary>'+s.why+'</details></div></details>';}).join('')+'</div></div>';
  h+=factsCard();
  h+='<div class="two homelinks"><button class="setcard" data-act="qa-calc"><span class="sic" style="--c:var(--blue)">'+ic('calc')+'</span><span class="mid"><div class="t">Hesaplayıcılar</div></span></button><button class="setcard" data-act="ai-open"><span class="sic" style="--c:var(--accent)">'+ic('sparkles')+'</span><span class="mid"><div class="t">Claude’a sor</div></span></button></div>';
  h+='<p class="small muted" style="margin:0 2px">Koç senin kayıtlarından hesaplar; eğitim amaçlıdır, yatırım tavsiyesi değildir.</p>';
  return h;
}
function factsCard(){
  var F=FACTS,old=infAge()>45,row=function(k,v,s){return '<div class="r"><span>'+k+'<div class="small muted">'+esc(s)+'</div></span><span class="num" style="text-align:right">'+v+'</span></div>';};
  return '<details class="card facts"><summary><b>Türkiye’de güncel oranlar</b><span class="small muted"> · kaynaklı</span></summary>'+(old?'<p class="small exp" style="margin:8px 0 0">Enflasyon verisi '+infAge()+' günlük; uygulama güncellenince yenilenir. Güncel değeri TÜİK’ten kontrol et.</p>':'')+'<div class="res">'
   +row('Yıllık enflasyon (TÜFE)',fPct(F.inf.v,1),F.inf.per+' · '+F.inf.src)
   +row('Politika faizi',fPct(F.pol.v,0),pdate(F.pol.d).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})+' · '+F.pol.src)
   +row('TL mevduat stopajı','%'+NUM1.format(F.dep.t6)+' / %'+NUM1.format(F.dep.t12)+' / %'+NUM1.format(F.dep.t12p),'6 aya, 1 yıla kadar ve daha uzun vade · '+F.dep.d+' · '+F.dep.src)
   +row('Fon kazancı stopajı','%'+NUM1.format(F.fund.mm)+' / %'+F.fund.eq,'Para piyasası ve borçlanma araçları / TEFAS’taki hisse yoğun fonlar · '+F.fund.d+' · '+F.fund.src)
   +row('DİBS faiz stopajı','%'+F.dibs.v,F.dibs.until+'’e kadar · '+F.dibs.src)
   +row('Kredi kartı azami faizi',fPct(F.card.t[0][1],1)+'–'+fPct(F.card.t[2][1],1),'Aylık; dönem borcu ₺30 bin altı / ₺180 bin üstü · nakit avans '+fPct(F.card.cash,1)+' · '+F.card.d+' · '+F.card.src)
   +row('Kart asgari ödeme','%'+F.minpay.lo+' / %'+F.minpay.hi,'Limit ₺100 bine kadar / üstü · '+F.minpay.src)
   +row('BES devlet katkısı','%'+F.bes.v,'2026 yıllık üst sınır '+TRY0.format(F.bes.cap)+' · '+F.bes.src)
   +row('Mevduat güvencesi',TRY0.format(F.tmsf.v),'Kişi ve banka başına · '+F.tmsf.src)
   +'</div><p class="small muted" style="margin:8px 0 0">Oranlar Cumhurbaşkanı kararı, TCMB ve BDDK düzenlemeleriyle değişebilir; işlem yapmadan önce bankandan ya da resmî kaynaktan teyit et.</p></details>';
}
/* Ana sayfadaki kısa kart: şu anki adım */
function coachHome(inner){
  var D=coachData();if(!S.tx.length)return '';var l=coachSteps(),ci=coachCur(l);
  if(ci<0)return '';var c=l[ci];
  return '<button class="'+(inner?'item':'card')+' cochome" data-act="plan-go" data-v="koc"><span class="sic" style="--c:var(--'+CSI[c.st][1]+')">'+ic(CSI[c.st][0])+'</span><span class="mid"><div class="lbl">Koç · adım '+(ci+1)+'/'+l.length+'</div><div class="t">'+esc(c.t)+'</div><div class="small muted">'+c.sum+'</div></span>'+ic('r')+'</button>';
}
ACT['calc-go']=function(el,id,v){if(CALCS[v])ui.calc=v;openPage({k:'araclar'},'araclar');};
