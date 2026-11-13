#!/system/bin/sh
LAT=44.4268
LON=26.1025
OLDIFS="$IFS"
IFS='&'
for part in $QUERY_STRING; do
  case "$part" in
    lat=*) LAT="${part#lat=}" ;;
    lon=*) LON="${part#lon=}" ;;
  esac
done
IFS="$OLDIFS"
exec /data/local/weather-cgi.sh "$LAT" "$LON"
