/* ---------- 4.28: başka uygulamalardan en iyi fikirler ----------
   İstatistik dışı (Money Flow), garanti takibi (BudgetBakers Wallet), arkadaşlarla bölüş (Buddy, Spendee),
   paranın yaşı (YNAB), görevsiz para (YNAB, EveryDollar), Excel'e aktarma ve aylık özet tablosu (Google E-Tablolar),
   ana ekran bileşeni (Bluecoins, Buddy; yerel tarafı MainActivity ve WalletWidget). */

/* ---- işlem penceresindeki "Daha fazla" bölümü ---- */
var WR_OPT=[['','Yok'],['6','6 ay'],['12','1 yıl'],['24','2 yıl'],['36','3 yıl'],['60','5 yıl']];
function txMore(t){
  var xs=!!(t&&t.xs),wr=t&&+t.wr>0?String(t.wr):'',isNew=!t,typ=t?t.type:txType;
  var wo=WR_OPT.slice();if(wr&&!WR_OPT.some(function(x){return x[0]===wr;}))wo.push([wr,wr+' ay']);
  return '<details class="txmore" id="row-more"'+(xs||wr?' open':'')+(typ==='trf'?' hidden':'')+'><summary>Daha fazla</summary><div class="stack" style="gap:12px;margin-top:10px">'
   +'<label class="chk"><input type="checkbox" id="f-xs"'+(xs?' checked':'')+'><span><b>İstatistiklerde ve bütçede sayma</b><span class="small muted">İade edilecek, iş için yapılan ya da bir defalık büyük harcamalar grafikleri bozmasın. Hesap bakiyesi yine değişir.</span></span></label>'
   +'<div class="field" id="row-wr"'+(typ==='exp'?'':' hidden')+'><label for="f-wr">Garanti süresi</label><select id="f-wr">'+wo.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===wr?' selected':'')+'>'+x[1]+'</option>';}).join('')+'</select><div class="small muted" style="margin-top:4px">'+(t&&wr?'Bitiş: '+esc(fmtD(wrEnd(t)))+'. ':'')+'Bitmeden 30 gün önce Gündem’de hatırlatılır; fişin fotoğrafını da ekleyebilirsin.</div></div>'
   +(isNew?'<div class="field" id="row-sp"'+(typ==='exp'?'':' hidden')+'><span class="flbl">Arkadaşlarla bölüş</span><div class="two"><div class="field" style="margin:0"><label for="f-spn" class="small muted">Kaç kişi (sen dahil)</label><input id="f-spn" inputmode="numeric" maxlength="2" placeholder="Örn. 3"></div><div class="field" style="margin:0"><label for="f-spw" class="small muted">Kimler</label><input id="f-spw" placeholder="Örn. Ali, Ayşe" autocomplete="off"></div></div><div class="small muted" style="margin-top:4px" id="f-spinfo">Hesabı sen ödediysen: senin payın gider olur, diğerlerinin payı “Alacaklar” hesabına geçer. Geri ödediklerinde Alacaklar’dan bankana transfer edersin.</div></div>':'')
   +'</div></details>';
}
function fmtD(s){return s?pdate(s).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}):'';}
function wrEnd(t){if(!t||!(+t.wr>0)||!t.date)return '';var p=t.date.split('-'),d=new Date(+p[0],+p[1]-1+(+t.wr),+p[2]);if(d.getDate()!==+p[2])d.setDate(0);return isoDate(d);}
/* tür değişince yalnızca o türe uyan alanlar */
function txMoreSync(){var m=document.getElementById('row-more');if(m)m.hidden=txType==='trf';
  ['row-wr','row-sp'].forEach(function(i){var e=document.getElementById(i);if(e)e.hidden=txType!=='exp';});}
/* bölüş önizlemesi: kişi başı pay */
document.addEventListener('input',function(e){if(!e.target||(e.target.id!=='f-spn'&&e.target.id!=='f-amt'))return;var inf=document.getElementById('f-spinfo');if(!inf)return;
  var n=parseInt(val('f-spn'),10),a=num(val('f-amt'));if(n>=2&&n<=30&&a>0){var my=r2(a/n);inf.textContent='Senin payın '+TRY2.format(my)+' (gider), diğer '+(n-1)+' kişinin payı '+TRY2.format(r2(a-my))+' Alacaklar hesabına geçer.';}});
/* kaydetmeden önce: ek alanları o'ya yazar; hata varsa metni döner */
function txMoreRead(o,isNew){
  var xs=document.getElementById('f-xs');if(xs&&xs.checked&&o.type!=='trf')o.xs=1;
  var wr=parseInt(val('f-wr'),10);if(o.type==='exp'&&wr>0&&wr<=120)o.wr=wr;
  if(!isNew||o.type!=='exp')return '';
  var sn=val('f-spn').trim();if(!sn)return '';var n=parseInt(sn,10);
  if(!(n>=2&&n<=30))return 'Bölüşmek için kişi sayısını 2 ile 30 arasında yaz (sen dahil).';
  if(ccyOf(o.acct)!=='TRY')return 'Bölüşme yalnızca TL hesaplarda kullanılabilir.';
  o._sp={n:n,who:val('f-spw').trim().replace(/\s+/g,' ').slice(0,80)};return '';
}
/* bölüş: işlem kendi payına iner, kalanı Alacaklar hesabına transfer olur (net servet doğru kalır) */
var SP_ACC='Alacaklar';
function spApply(o){
  var sp=o._sp;delete o._sp;if(!sp)return null;
  var tot=o.amt,my=r2(tot/sp.n),rest=r2(tot-my);if(!(rest>0))return null;
  if(ACCS().indexOf(SP_ACC)<0){S.accounts.push(SP_ACC);S.accx[SP_ACC]={type:'diger'};if(S.opening[SP_ACC]==null)S.opening[SP_ACC]=0;}
  o.amt=my;o.spN=sp.n;
  var tr={id:uid(),type:'trf',amt:rest,acct:o.acct,to:SP_ACC,cat:'Transfer',date:o.date,note:(sp.who?sp.who+' payı':(sp.n-1)+' kişinin payı')+(o.note?' · '+o.note:''),spOf:o.id};
  S.tx.push(tr);return tr;
}
/* ---- garanti: Gündem uyarısı ve Hesaplar'daki liste ---- */
function wrList(){var t0=todayS();return S.tx.filter(function(t){return t.type==='exp'&&+t.wr>0&&wrEnd(t)>=t0;}).sort(function(a,b){return wrEnd(a).localeCompare(wrEnd(b));});}
function wrAlerts(){var t0=todayS(),o=[];wrList().forEach(function(t){var df=daysBetween(t0,wrEnd(t));if(df<=30)o.push(['warn',(t.note||t.sub||t.cat)+' garantisi '+(df===0?'bugün':df+' gün sonra')+' bitiyor ('+fmtD(wrEnd(t))+')',['edit-tx',t.id,null,'Aç']]);});return o;}
function wrCard(){var l=wrList();if(!l.length)return '';
  return '<details class="card"><summary><b>Garantisi süren ürünler</b><span class="small muted"> · '+l.length+'</span></summary><div class="list" style="margin-top:6px">'+l.map(function(t){var df=daysBetween(todayS(),wrEnd(t));
    return '<button class="item" data-act="edit-tx" data-id="'+t.id+'">'+mrcIc([t.note,t.sub],t.cat)+'<span class="mid"><div class="t ell">'+esc(t.note||t.sub||t.cat)+'</div><div class="small '+(df<=30?'warn':'muted')+'">'+(df<=30?df+' gün kaldı · ':'')+'bitiş '+esc(fmtD(wrEnd(t)))+(t.rc?' · fiş var':'')+'</div></span><span class="num">'+moneyIn(t.amt,t.acct,1)+'</span></button>';}).join('')+'</div></details>';}

/* ---- paranın yaşı (YNAB): harcanan paranın ortalama kaç gün önce kazanıldığı ----
   Gelirler ve açılış bakiyeleri sırayla birikir; her gider en eski paradan düşer (ilk giren ilk çıkar).
   Değer, son 10 giderin (tutarla ağırlıklı) yaşının ortalamasıdır. Transferler, yatırım ve borç hareketleri sayılmaz. */
function moneyAge(upto){
  var lim=upto||todayS(),open=0,od=S.openDate||'';ACCS().forEach(function(a){var v=+S.opening[a]||0;if(v>0)open+=toTL(v,a);});
  var ev=S.tx.filter(function(t){return (t.type==='inc'||t.type==='exp')&&t.date<=lim;}).sort(function(a,b){return a.date.localeCompare(b.date)||(a.type==='inc'?-1:1);});
  if(!ev.length)return null;
  var q=[],qi=0,ages=[],first=ev[0].date;if(open>0)q.push({d:od&&od<first?od:first,v:open});
  ev.forEach(function(t){var v=txTL(t);if(!(v>0))return;if(t.type==='inc'){q.push({d:t.date,v:v});return;}
    var need=v,w=0,cov=0;while(need>0.005&&qi<q.length){var b=q[qi],take=Math.min(b.v,need);w+=take*Math.max(daysBetween(b.d,t.date),0);cov+=take;b.v-=take;need-=take;if(b.v<=0.005)qi++;}
    if(cov>0)ages.push({a:w/cov,v:cov,d:t.date});});
  var last=ages.slice(-10);if(last.length<3)return null;
  var sv=last.reduce(function(s,x){return s+x.v;},0);return Math.round(last.reduce(function(s,x){return s+x.a*x.v;},0)/sv);
}
function ageCard(){
  var a=moneyAge();if(a==null)return '';
  var d=new Date(today0());d.setDate(d.getDate()-30);var b=moneyAge(isoDate(d)),ch=b!=null?a-b:null;
  var msg=a>=30?'Harcadığın para bir aydan eski: maaştan maaşa yaşamıyorsun, beklenmedik bir gidere hazırlıklısın.':(a>=14?'İyi gidiyor. 30 günün üstüne çıkınca maaşı beklemeden yaşamaya başlarsın; bunun için gelirin bir kısmını hemen harcama.':'Para kazanılır kazanılmaz harcanıyor. Her ay biraz geride bırakırsan bu sayı yükselir ve maaş gününe bağımlılık azalır.');
  return '<div class="card"><div class="ghead"><span class="sic sm" style="--c:var(--accent)">'+ic('cal')+'</span><h2 style="margin:0;flex:1">Paranın yaşı</h2><span class="num agev">'+a+' gün</span></div>'
   +(ch!=null&&ch!==0?'<div class="small '+(ch>0?'inc':'exp')+'" style="margin-top:4px">30 gün öncesine göre '+(ch>0?'+':'−')+Math.abs(ch)+' gün</div>':'')
   +'<p class="small muted" style="margin:6px 0 0">Son harcamaların ortalama '+a+' gün önce kazandığın parayla yapıldı. '+esc(msg)+'</p></div>';
}

/* ---- görevsiz para (YNAB, EveryDollar): gelirin bütçede yeri olmayan kısmı ---- */
function unassignedLine(limSum){
  var k=ui.month,inc=pstat(k).inc,est=false;if(!(inc>0)){inc=avgMonthly('inc');est=true;}if(!(inc>0)||!(limSum>0))return '';
  var z=r2(inc-limSum);
  if(z<0)return '<div class="unas warn"><b>Limitler gelirini '+TRY0.format(-z)+' aşıyor.</b><span class="small muted">'+(est?'Ortalama gelirin':'Bu dönemin geliri')+' '+TRY0.format(inc)+', limitlerin toplamı '+TRY0.format(limSum)+'. Bazı limitleri düşür.</span></div>';
  return '<div class="unas"><span class="mid"><b>Planlanmamış para: '+TRY0.format(z)+'</b><span class="small muted">'+(est?'Ortalama gelirin':'Bu dönemin geliri')+' '+TRY0.format(inc)+', limitlere '+TRY0.format(limSum)+' ayırdın. Kalanı bir hedefe ya da birikime ayır.</span></span><button class="btn small" data-act="plan-go" data-v="hedef">Hedefe ayır</button></div>';
}

/* ---- Excel (.xlsx) dışa aktarma: işlemler ve aylık özet (kategori × ay, formüllü toplamlar) ---- */
var CRCT=null;
function crc32(u){if(!CRCT){CRCT=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CRCT[n]=c>>>0;}}var r=0xFFFFFFFF;for(var i=0;i<u.length;i++)r=CRCT[(r^u[i])&255]^(r>>>8);return (r^0xFFFFFFFF)>>>0;}
function zipStore(files){/* files: [[ad, metin]] → Uint8Array (sıkıştırmasız ZIP) */
  var enc=new TextEncoder(),parts=[],cen=[],off=0;
  var u16=function(v){return [v&255,(v>>>8)&255];},u32=function(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];};
  files.forEach(function(f){var nm=enc.encode(f[0]),d=enc.encode(f[1]),c=crc32(d);
    var lh=[].concat(u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(c),u32(d.length),u32(d.length),u16(nm.length),u16(0));
    parts.push(new Uint8Array(lh),nm,d);
    cen.push([].concat(u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(c),u32(d.length),u32(d.length),u16(nm.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(off)),nm);
    off+=lh.length+nm.length+d.length;});
  var cs=0,cp=[];cen.forEach(function(x){var a=x instanceof Uint8Array?x:new Uint8Array(x);cp.push(a);cs+=a.length;});
  var end=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cs),u32(off),u16(0)));
  var all=parts.concat(cp,[end]),len=all.reduce(function(s,a){return s+a.length;},0),out=new Uint8Array(len),p=0;all.forEach(function(a){out.set(a,p);p+=a.length;});return out;
}
function xcol(i){var s='';i++;while(i>0){var m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26);}return s;}
function xesc(s){return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function xdate(s){var p=s.split('-');return (Date.UTC(+p[0],+p[1]-1,+p[2])-Date.UTC(1899,11,30))/864e5;}
/* hücre: sayı, {f:formül,s:stil}, {d:tarih}, metin; stiller: 1 kalın başlık, 2 tarih, 3 para, 4 kalın para */
function xsheet(rows,widths){
  var x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" xSplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>'
   +'<cols>'+widths.map(function(w,i){return '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>';}).join('')+'</cols><sheetData>';
  rows.forEach(function(r,ri){x+='<row r="'+(ri+1)+'">';r.forEach(function(v,ci){if(v==null||v==='')return;var ref=xcol(ci)+(ri+1);
    if(typeof v==='number')x+='<c r="'+ref+'" s="'+(ri===0?1:3)+'"><v>'+v+'</v></c>';
    else if(v.f)x+='<c r="'+ref+'" s="'+(v.s||4)+'"><f>'+xesc(v.f)+'</f></c>';
    else if(v.d)x+='<c r="'+ref+'" s="2"><v>'+xdate(v.d)+'</v></c>';
    else if(v.n!=null)x+='<c r="'+ref+'" s="'+(v.s||3)+'"><v>'+v.n+'</v></c>';
    else x+='<c r="'+ref+'" t="inlineStr"'+(ri===0||v.b?' s="1"':'')+'><is><t xml:space="preserve">'+xesc(v.t!=null?v.t:v)+'</t></is></c>';});x+='</row>';});
  return x+'</sheetData></worksheet>';
}
function xlsxAll(){
  var tx=S.tx.slice().sort(function(a,b){return a.date.localeCompare(b.date);});
  var r1=[['Tarih','Tür','Kategori','Alt kategori','Tutar','Para birimi','Tutar (₺)','Hesap','Karşı hesap','Not','İstatistikte']];
  tx.forEach(function(t){var sg=t.type==='exp'?-1:1;r1.push([{d:t.date},txTypeName(t),t.type==='inc'||t.type==='exp'||t.type==='trf'?(t.cat||''):mvLabel(t),t.sub||'',{n:r2(sg*t.amt)},ccyOf(t.acct),{n:r2(sg*txTL(t))},t.acct,t.to||'',t.note||'',t.xs?'Hayır':'Evet']);});
  /* aylık özet: son 12 dönem (veri olanlar), satırlar gider kategorileri */
  var ks=[],k=curP();for(var i=11;i>=0;i--){var p=addMonth(k,-i);if(monthTx(p).length)ks.push(p);}if(!ks.length)ks=[k];
  var cats=[],sp={};ks.forEach(function(p){sp[p]=spentByCat(p);Object.keys(sp[p]).forEach(function(c){if(cats.indexOf(c)<0)cats.push(c);});});
  cats.sort(function(a,b){var sa=0,sb=0;ks.forEach(function(p){sa+=sp[p][a]||0;sb+=sp[p][b]||0;});return sb-sa;});
  var nc=ks.length,L=xcol(nc),r2s=[['Kategori'].concat(ks.map(function(p){return mlabel(p,true)+' '+p.slice(0,4);}),['Toplam','Ortalama'])];
  cats.forEach(function(c,ri){var row=[c];ks.forEach(function(p){row.push({n:r2(sp[p][c]||0)});});var R=ri+2;row.push({f:'SUM(B'+R+':'+L+R+')'},{f:'AVERAGE(B'+R+':'+L+R+')',s:3});r2s.push(row);});
  var e=cats.length+1,G=e+1;
  r2s.push([{t:'Toplam gider',b:1}].concat(ks.map(function(p,ci){var C=xcol(ci+1);return {f:'SUM('+C+'2:'+C+e+')'};}),[{f:'SUM(B'+G+':'+L+G+')'},{f:'AVERAGE(B'+G+':'+L+G+')'}]));
  r2s.push([{t:'Gelir',b:1}].concat(ks.map(function(p){return {n:pstat(p).inc,s:4};}),[{f:'SUM(B'+(G+1)+':'+L+(G+1)+')'},{f:'AVERAGE(B'+(G+1)+':'+L+(G+1)+')'}]));
  r2s.push([{t:'Net (gelir − gider)',b:1}].concat(ks.map(function(p,ci){var C=xcol(ci+1);return {f:C+(G+1)+'-'+C+G};}),[{f:xcol(nc+1)+(G+1)+'-'+xcol(nc+1)+G},{f:xcol(nc+2)+(G+1)+'-'+xcol(nc+2)+G}]));
  r2s.push([{t:'Birikim oranı',b:1}].concat(ks.map(function(p,ci){var C=xcol(ci+1);return {f:'IF('+C+(G+1)+'>0,('+C+(G+1)+'-'+C+G+')/'+C+(G+1)+',"")',s:5};})));
  var W=[18].concat(ks.map(function(){return 12;}),[13,13]);
  var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';
  var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Aylık özet" sheetId="1" r:id="rId1"/><sheet name="İşlemler" sheetId="2" r:id="rId2"/></sheets></workbook>';
  var wbr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  var st='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="dd.mm.yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7EEEA"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
   +'<cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/><xf numFmtId="10" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  return zipStore([['[Content_Types].xml',ct],['_rels/.rels',rels],['xl/workbook.xml',wb],['xl/_rels/workbook.xml.rels',wbr],['xl/styles.xml',st],['xl/worksheets/sheet1.xml',xsheet(r2s,W)],['xl/worksheets/sheet2.xml',xsheet(r1,[12,10,16,14,13,8,13,16,14,28,11])]]);
}
function b64u8(u){var s='',C=0x8000;for(var i=0;i<u.length;i+=C)s+=String.fromCharCode.apply(null,u.subarray(i,i+C));return btoa(s);}
ACT['xlsx']=function(){
  var name='Wallet-'+todayS()+'.xlsx',u;try{u=xlsxAll();}catch(e){msg('Excel dosyası hazırlanamadı.',false,'f-err');return;}
  if(NB&&!nb('saveB64')&&nb('save')){msg('Excel’e aktarmak için uygulamanın yeni sürümü (APK) gerekiyor. Şimdilik CSV’yi kullanabilirsin.',false,'f-err');return;}
  if(NB&&nb('saveB64')){var rr='err';try{rr=NB.saveB64(name,b64u8(u));}catch(e){}msg(rr==='ok'?'Excel dosyası İndirilenler klasörüne kaydedildi.':'Dosya kaydedilemedi.',rr==='ok','f-err');return;}
  if(dl){dl.save({filename:name,data:new Blob([u],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}).then(function(){msg('Excel dosyası kaydedildi.',true,'f-err');},function(){msg('Dosya kaydedilemedi.',false,'f-err');});return;}
  try{var bl=new Blob([u],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(bl),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(url);},1000);msg('Excel dosyası kaydedildi.',true,'f-err');}catch(e){msg('Dosya kaydedilemedi.',false,'f-err');}
};

/* ---- ana ekran bileşeni: özet, kayıttan sonra yerel tarafa gönderilir ---- */
var WGT=null;
function wgData(){
  var k=curP(),st=pstat(k),sp=spentByCat(k),lim=0,ok=0;EXPC().forEach(function(c){var l=budLim(c,k);if(l>0){lim+=l;var d=l-(sp[c]||0);if(d>0)ok+=d;}});
  var days=daysLeft(k),h=!!S.hide,f=function(v){return h?MASK:TRY0.format(v);};
  var o={t:plabel(k),a:'Bu ay harcanan',v:f(st.exp),ts:Date.now()};
  if(lim>0){o.b='Bütçeden kalan';o.w=f(r2(ok));o.c=days>0&&ok>0?'Günde ~'+f(ok/days)+' · '+days+' gün':(ok>0?'':'Bütçe doldu');}
  else{o.b='Gelir';o.w=f(st.inc);o.c=st.inc>0?'Net '+(h?MASK:(st.net>=0?'+':'−')+TRY0.format(Math.abs(st.net))):'';}
  return o;
}
function wgSoon(){if(!nb('widget'))return;clearTimeout(WGT);WGT=setTimeout(function(){try{NB.widget(JSON.stringify(wgData()));}catch(e){}},400);}
