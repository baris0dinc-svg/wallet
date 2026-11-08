#!/usr/bin/env bash
# Tüm testleri çalıştırır. Gerekenler: python3, node, playwright (chromium).
# Kullanım: bash tests/run.sh            → hepsi
#           bash tests/run.sh math sms   → seçilenler
set -u
cd "$(dirname "$0")/.."
python3 tools/build.py --check || exit 1
node --check app.js || exit 1
SITE=${SITE:-/tmp/wallet-site}; SITE2=${SITE2:-/tmp/wallet-site2}
python3 tests/build_site.py "$SITE" >/dev/null
rm -rf "$SITE2"; cp -r "$SITE" "$SITE2"
(cd "$SITE" && exec python3 -m http.server 8766 >/dev/null 2>&1) & S1=$!
(cd "$SITE2" && exec python3 -m http.server 8767 >/dev/null 2>&1) & S2=$!
trap 'kill $S1 $S2 2>/dev/null' EXIT
sleep 1
declare -A PASS=( [math]="ALL PASS" [nav]="ALL PASS" [native]="ALL PASS" [sms]="ALL PASS" [regress]="ALL PASS"
  [multiccy]="ALL PASS" [fire]="ALL PASS" [calc]="ALL PASS" [migrate]="no page errors" [overflow]="TAŞMA YOK"
  [monkey]="HEPSİ TEMİZ" [update]="BUSY PROMPT PASS" [v31]="ALL PASS" [v33]="ALL PASS" [em]="ALL PASS" [voice]="ALL PASS" [ease]="ALL PASS" [security]="ALL PASS" [brain]="ALL PASS" [review]="ALL PASS" )
LIST=("$@"); [ ${#LIST[@]} -eq 0 ] && LIST=(math sms v31 v33 em voice ease security brain review nav native regress multiccy fire calc migrate overflow monkey update)
FAILED=()
for t in "${LIST[@]}"; do
  passed=0
  for try in 1 2; do
    out=$(SITE2="$SITE2" timeout 900 node "tests/$t.js" 2>&1 | grep -v agent-proxy)
    if grep -q "${PASS[$t]}" <<<"$out" && ! grep -qE "^FAIL|BAŞARISIZ|PAGEERR|sayfa hataları" <<<"$out"; then passed=1; break; fi
    [ $try = 1 ] && { echo "! $t ilk denemede geçmedi, tekrar deneniyor:"; echo "$out" | tail -8 | sed 's/^/    /'; }
  done
  if [ $passed = 1 ]; then echo "✓ $t"; else echo "✗ $t"; echo "$out" | tail -25 | sed 's/^/    /'; FAILED+=("$t"); fi
done
[ ${#FAILED[@]} -eq 0 ] && echo "TÜM TESTLER GEÇTİ" || { echo "BAŞARISIZ: ${FAILED[*]}"; exit 1; }
