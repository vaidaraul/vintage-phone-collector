#!/system/bin/sh
BB=/system/bin/busybox
LAT="$1"
LON="$2"
TMP=/data/local/om.csv

echo "Content-Type: text/xml"
echo

$BB wget -q -T 15 -O $TMP "http://api.open-meteo.com/v1/forecast?latitude=$LAT&longitude=$LON&current=temperature_2m,is_day,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6&temperature_unit=fahrenheit&format=csv"

if ! $BB test -s $TMP; then
    echo "<?xml version='1.0' encoding='iso-8859-1'?>"
    echo "<weather><current><temp c=\"0\" f=\"32\" /><condition icon=\"1\" /></current><forecast></forecast></weather>"
    exit 0
fi

$BB awk -f /data/local/om2xml.awk $TMP
