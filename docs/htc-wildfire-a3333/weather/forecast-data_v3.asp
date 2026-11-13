#!/system/bin/sh
BB=/system/bin/busybox
LOC=""
OLDIFS="$IFS"
IFS='&'
for part in $QUERY_STRING; do
  case "$part" in
    loccode=*) LOC="${part#loccode=}" ;;
    locCode=*) LOC="${part#locCode=}" ;;
  esac
done
IFS="$OLDIFS"
LOC=$($BB echo "$LOC" | $BB sed 's/%7C/|/g; s/%7c/|/g; s/+/ /g')
case "$LOC" in
  *LONDON*) LAT=51.5074; LON=-0.1278 ;;
  *PARIS*) LAT=48.8566; LON=2.3522 ;;
  *BARCELONA*) LAT=41.3874; LON=2.1686 ;;
  *ROMA*) LAT=41.9028; LON=12.4964 ;;
  *WARSZAWA*) LAT=52.2297; LON=21.0122 ;;
  *"NEW YORK"*) LAT=40.7128; LON=-74.0060 ;;
  *BUCHAREST*|*BUCURESTI*) LAT=44.4268; LON=26.1025 ;;
  *) LAT=44.4268; LON=26.1025 ;;
esac
exec /data/local/weather-cgi.sh "$LAT" "$LON"
