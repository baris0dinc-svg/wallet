# Test sitesini kurar (kullanım: python3 tests/build_site.py /tmp/wallet-site): repo dosyalarını kopyalar, sahte kur verisi yazar, app.js sonuna test kancası ekler.
import shutil, os, json, sys
SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
site=(sys.argv[1] if len(sys.argv)>1 else '/tmp/wallet-site').rstrip('/')+'/'
os.makedirs(site,exist_ok=True)
for n in os.listdir(site):
    q=os.path.join(site,n)
    shutil.rmtree(q) if os.path.isdir(q) else os.remove(q)
for f in ['index.html','style.css','app.js','sw.js','manifest.webmanifest','bist.json','version.json']:
    shutil.copy(SRC+f, site+f)
shutil.copytree(SRC+'icons', site+'icons')
# test kopyası: iç işlevleri açan __T eval kullandığından yalnızca testte 'unsafe-eval' eklenir (politikanın geri kalanı aynen denenir)
_ix=open(site+'index.html',encoding='utf-8').read()
open(site+'index.html','w',encoding='utf-8').write(_ix.replace("script-src 'self' ","script-src 'self' 'unsafe-eval' ",1))
json.dump({"updated":"2026-11-06 18:00:00","items":{
  "USD":{"Buying":41.25,"Selling":41.31,"Change":0.12},
  "EUR":{"Buying":44.1,"Selling":44.25,"Change":-0.2},
  "GRA":{"Buying":5520.4,"Selling":5530.1,"Change":0.5},
  "GBP":{"Buying":55.0,"Selling":55.1,"Change":-0.3},
  "CHF":{"Buying":50.0,"Selling":50.2,"Change":0.1},
  "GUMUS":{"Buying":70.1,"Selling":70.3,"Change":0.2},
  "CEYREKALTIN":{"Buying":9000,"Selling":9100,"Change":-0.4},
  "XU100":{"Buying":10250.5,"Selling":10250.5,"Change":1.25}}}, open(site+'rates.json','w'))
s=open(site+'app.js',encoding='utf-8').read()
names='''mLogo bankDom acctIc holdIc mBadge mrcUrls mrcDom mrcIc mrcClean mrcList txRow mHist refreshMarket csvAll csvImport brainItems instAt nwAt renameAcct pk undo byId EXPC INCC debtLeft loanSplit instAt xferSheet txType mTgtCheck rateOf mHeld cvCalc rcGc rcImport clDue clPush clOn openPage depTax yCrys yFac yMat yieldPost aIntNow aInt closeSheet catSheet occs occsIn isWk wkOn recShow recFq addD subsOf catIcKey catLabel cic recMonthly recDone recPaid subChips catMenu sfx setPayday recMonthlyTot linkRec unlinkRec instLeft catRes smartCat budLim vRate txTags impReview voiceAccts pageFromHash moneyIn recOn recNo recFits recMatch recFind loanSplit loanPlan loanPmt cardStmt balAt autoPost recTx lastBiz recIncDue rSheet dSheet defAcct balSheet autoSrc acctBal monthBase dataStart recDue txCmp leftNow payRec coachData fireModel avgMonthly budgetBody flowCard health checkUpdate hardReload verNewer latestVer nwChart distBar balSheet alertRow catRow dueDate remapPaid num bkOk hasOwn txHay smsCat pStart pEnd lsHas pDays spentByCat daysBetween catGuess smartCat recurCands unusualTx dupTx forecast budgetPace paydayHint brainItems freqTx noteCat noteList runIntent voiceParse voiceAmt voiceDone isEm emGoal coachData coachSteps coachCur cumInf cpiRate payoffMonths payoffInterest cardRate FACTS vKoc coachHome leftNow heroCard budgetSuggest qHist qSeed sparkSvg ago qStale frkRows frkLatest mStrip mCard nwTop setGenel histChange decText exportJson smsParse smsIngest smsCommit nwSeries nwAt txTL catSheet planBody backupText setBkPw autoBackup ui num monthsToFI fireModel wealth acctBal accTotal pk pStart pEnd dueDate monthTx CALCS fmtYears norm seed csvAll exportJson encText decText render
spentByCat hVal pfTotals sum daysLeft ACT uid addMonth curP avgMonthly avgSave noteSorted debtManual debtLeft debtPaid save TRY2 TRY0 DC0 setList alertsHtml txSheet rSheet
daysBetween isoDate today0 pdate txList SETS setBody csvImport csvParse ccyOf toTL snap alertItems r2 txMatch toast hSheet gSheet dSheet goalSaved
budgetBody hedefBody duzenliBody analizBody hesapBody vPortfoy vFire pickRates refreshRates notifyDue moneyIn acctType aSheet renameAcct setNotlar nv optsKeep csvKey txSig vMain scrollToSec pageFromHash periodHead
upcoming reminderPlan health pstat wipeAll refreshMarket mLocal mResults mWatch fonParse sheetText xlsxRows xlsRows htmlRows rowsCsv decodeText csvDate aiSummary aiText mQ mTL mName mSym fmtPx hPrice bistList ntfSync ntfState txDelta fmtC rateOf dccy acctSheet recSheet tradeSheet birSheet grpSheet debtListSheet mvSheet gaddSheet notesList noteCounts vNotlar fireTargetTL todayS load'''.split()
hook="window.__T={get S(){return S},set S(v){S=v}};["+",".join("'%s'"%n for n in names)+"].forEach(function(n){try{Object.defineProperty(window.__T,n,{get:function(){return eval(n);},configurable:true,enumerable:true});}catch(e){}});\n"
i=s.rindex("})();")
open(site+'app.js','w',encoding='utf-8').write(s[:i]+hook+s[i:])
print('site built')
