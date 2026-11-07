#!/usr/bin/env bash
# Emülatör içinde çalışır: APK'yı kurar, izinleri verir, uygulamayı açar ve e2e.js'i çalıştırır.
set -x
APK=${APK:-android-app/app/build/outputs/apk/debug/app-debug.apk}
adb wait-for-device
adb shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'
adb install -r "$APK"
for p in POST_NOTIFICATIONS RECEIVE_SMS READ_SMS; do adb shell pm grant app.wallet.personal android.permission.$p; done
adb shell am start -n app.wallet.personal/app.wallet.MainActivity
sleep 15
APK="$APK" node tests/android/e2e.js
