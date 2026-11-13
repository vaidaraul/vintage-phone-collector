#!/system/bin/sh
BB=/system/bin/busybox

mount -o remount,rw /system /system || exit 1

$BB rm -rf /data/local/restore-apps
$BB mkdir -p /data/local/restore-apps
$BB tar -xf /data/local/restore-apps.tar -C /data/local || exit 1

cd /data/local/restore-apps || exit 1
n=0
for f in *; do
  $BB cp -f "$f" /system/app/"$f" || { echo "copy failed: $f"; continue; }
  $BB chmod 644 /system/app/"$f"
  $BB chown root:root /system/app/"$f"
  n=$((n+1))
done

sync
echo "restored $n files"
echo "--- sample ---"
$BB ls -l /system/app/AdobeReader.apk /system/app/HtcFacebook.apk /system/app/FriendStream.apk /system/app/Gmail.apk /system/app/YouTube.apk 2>&1
echo "--- system space ---"
$BB df /system
