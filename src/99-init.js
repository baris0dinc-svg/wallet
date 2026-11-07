/* ---------- başlangıç ---------- */
document.getElementById('fab').innerHTML=ic('plus');
purgeTrash();
restoreUi();
render();
if(ui.locked)setTimeout(askBio,400);
applySecure();
if(nb('smsSet')){try{NB.smsSet(!!S.sms.on);}catch(e){}}
ntfSync();
(function(){var sp=document.getElementById('splash');if(sp){setTimeout(function(){sp.style.opacity='0';setTimeout(function(){sp.remove();},350);},500);}})();
bgRates();setTimeout(function(){notifyDue();pushPlan();pullSms();if(S.autoBk&&!hasSample()&&Date.now()-(S.bkTs||0)>864e5)autoBackup();},1500);
})();
