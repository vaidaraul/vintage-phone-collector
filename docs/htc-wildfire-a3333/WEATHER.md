# Phone-local HTC Weather

This document describes the weather stack used by the HTC Wildfire A3333 after restoration. It keeps the original HTC Weather app and widget but replaces the dead AccuWeather service with a local process on the phone.

## Why this exists

The original app requests:

```text
http://htc.accuweather.com/widget/htc/forecast-data_v3.asp?ac=...&loccode=...
http://htc.accuweather.com/widget/htc/lat-lon-search.asp?ac=...&lat=...&lon=...
```

Those hosts no longer serve the legacy API. The Wildfire parser is also **case-sensitive** and expects the old `<weather>` schema, not the `<adc_database>` schema used by later Sense versions.

The phone-local stack:

1. Redirects the two HTC hostnames to `127.0.0.1` in `/system/etc/hosts`.
2. Runs BusyBox `httpd` on `127.0.0.1:80`.
3. Serves the two legacy `.asp` paths through a CGI handler.
4. Fetches Open-Meteo CSV over plain HTTP.
5. Converts the CSV to the old HTC XML with `awk`.
6. Starts `httpd` at boot through a wrapper around `/system/bin/bootcomplete`.

No VPS, no HTC account, and no home-network service is required.

## Architecture

```text
HTC Weather app
  |
  |  http://htc.accuweather.com/widget/htc/forecast-data_v3.asp
  v
/system/etc/hosts  ->  127.0.0.1
  |
  v
BusyBox httpd  127.0.0.1:80
  |
  |  CGI: /data/local/weather-www/widget/htc/forecast-data_v3.asp
  v
/data/local/weather-cgi.sh
  |
  |  BusyBox wget  http://api.open-meteo.com/v1/forecast?...&format=csv
  v
/data/local/om2xml.awk
  |
  v
<weather> XML  ->  HTC Weather parser
```

The current-location path uses the same CGI from `lat-lon-search.asp`; it passes the GPS latitude and longitude to Open-Meteo.

## Files

All files are in the [`weather/`](weather/) folder next to this document. They are small scripts and config files; no HTC binaries are included.

| File | Installed path | Purpose |
| --- | --- | --- |
| `forecast-data_v3.asp` | `/data/local/weather-www/widget/htc/forecast-data_v3.asp` | Parses `loccode`, maps the city to coordinates, calls the CGI |
| `lat-lon-search.asp` | `/data/local/weather-www/widget/htc/lat-lon-search.asp` | Parses `lat`/`lon`, calls the CGI |
| `weather-cgi.sh` | `/data/local/weather-cgi.sh` | Fetches Open-Meteo CSV and runs the converter |
| `om2xml.awk` | `/data/local/om2xml.awk` | Converts CSV to the old HTC `<weather>` XML |
| `httpd.conf` | `/data/local/weather-www/httpd.conf` | Maps `*.asp` to `/system/bin/sh` |
| `bootcomplete-wrapper` | `/system/bin/bootcomplete` | Starts `httpd`, then execs the original `bootcomplete.orig` |

The original `/system/bin/bootcomplete` is preserved as `/system/bin/bootcomplete.orig`.

## XML contract

The Wildfire parser expects this shape (element names are lowercase and case-sensitive):

```xml
<?xml version='1.0' encoding='iso-8859-1'?>
<weather>
  <current>
    <temp c="14" f="57" />
    <condition icon="7" />
  </current>
  <forecast>
    <day>
      <name>THU</name>
      <date>11/12/26</date>
      <condition icon="18" />
      <high c="18" f="64" />
      <low c="8" f="46" />
    </day>
    <!-- four more days -->
  </forecast>
  <source>Open-Meteo (open-meteo.com)</source>
</weather>
```

Rules:

- `<temp>`, `<high>`, and `<low>` carry both `c` and `f` integer attributes.
- `<condition icon="...">` uses the old AccuWeather icon IDs.
- `<date>` is `MM/DD/YY`.
- `<name>` is a three-letter uppercase weekday.
- The XML is encoded as ISO-8859-1.
- Do not switch to `<adc_database>`; the Wildfire parser will silently store empty values.

## Open-Meteo mapping

The CGI requests:

```text
http://api.open-meteo.com/v1/forecast
  ?latitude=...
  &longitude=...
  &current=temperature_2m,is_day,weather_code
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &timezone=auto
  &forecast_days=6
  &temperature_unit=fahrenheit
  &format=csv
```

Open-Meteo returns a CSV with a current block and a daily block. `om2xml.awk`:

- reads the current temperature, `is_day`, and weather code;
- reads five daily rows;
- converts Fahrenheit to Celsius;
- maps WMO weather codes to the old AccuWeather icon IDs;
- computes the weekday with a small Zeller routine;
- prints the old `<weather>` XML.

The city mapping is in `forecast-data_v3.asp`:

| HTC `loccode` suffix | Coordinates |
| --- | --- |
| `LONDON` | 51.5074, -0.1278 |
| `PARIS` | 48.8566, 2.3522 |
| `BARCELONA` | 41.3874, 2.1686 |
| `ROMA` | 41.9028, 12.4964 |
| `WARSZAWA` | 52.2297, 21.0122 |
| `NEW YORK` | 40.7128, -74.0060 |
| `BUCHAREST` / `BUCURESTI` | 44.4268, 26.1025 |

Unknown codes fall back to Bucharest. Add more cities by adding a `case` line and coordinates.

## Install

### 1. Create the web root

```bash
adb shell "/system/bin/busybox mkdir -p /data/local/weather-www/widget/htc"
```

### 2. Push the files

From the `weather/` folder:

```bash
adb push forecast-data_v3.asp /data/local/weather-www/widget/htc/forecast-data_v3.asp
adb push lat-lon-search.asp /data/local/weather-www/widget/htc/lat-lon-search.asp
adb push weather-cgi.sh /data/local/weather-cgi.sh
adb push om2xml.awk /data/local/om2xml.awk
adb push httpd.conf /data/local/weather-www/httpd.conf
adb push bootcomplete-wrapper /data/local/bootcomplete-wrapper
```

### 3. Set permissions

```bash
adb shell "chmod 755 /data/local/weather-cgi.sh"
adb shell "chmod 755 /data/local/weather-www/widget/htc/forecast-data_v3.asp"
adb shell "chmod 755 /data/local/weather-www/widget/htc/lat-lon-search.asp"
```

### 4. Add the hosts entries

As root, remount `/system` read-write and edit `/system/etc/hosts`:

```text
127.0.0.1 htc.accuweather.com
127.0.0.1 www.accuweather.com
<OPEN_METEO_IPV4> api.open-meteo.com
```

`<OPEN_METEO_IPV4>` is the current IPv4 address of `api.open-meteo.com`. The home DHCP in the original build handed the phone an unreachable Tailscale DNS address, so the phone could not resolve Open-Meteo. The hosts entry bypasses DNS.

To find the current address:

```bash
getent ahostsv4 api.open-meteo.com
```

If Open-Meteo changes its IPv4, update this line. This is the main maintenance point of the design.

### 5. Install the boot hook

```bash
adb shell "su -c 'mount -o remount,rw /system /system'"
adb shell "su -c '/system/bin/busybox test -f /system/bin/bootcomplete.orig || /system/bin/busybox cp /system/bin/bootcomplete /system/bin/bootcomplete.orig'"
adb shell "su -c 'cp /data/local/bootcomplete-wrapper /system/bin/bootcomplete'"
adb shell "su -c 'chmod 755 /system/bin/bootcomplete /system/bin/bootcomplete.orig'"
adb shell "su -c 'sync'"
```

The `test -f ... || cp` guard preserves the original `bootcomplete` if you run the install twice.

The wrapper stops any stale `httpd`, starts a new one on `127.0.0.1:80`, then `exec`s `/system/bin/bootcomplete.orig`.

### 6. Start it manually for testing

```bash
adb shell "su -c '/system/bin/busybox httpd -c /data/local/weather-www/httpd.conf -p 127.0.0.1:80 -h /data/local/weather-www'"
```

BusyBox `httpd` daemonizes itself. Check:

```bash
adb shell "/system/bin/busybox netstat -ltn" | grep ":80 "
adb shell "ps" | grep -i busybox
```

### 7. Test the CGI

```bash
adb shell "/system/bin/busybox wget -q -O - 'http://127.0.0.1/widget/htc/forecast-data_v3.asp?loccode=BUCHAREST'"
```

Expected: an XML document starting with `<?xml version='1.0' encoding='iso-8859-1'?>`.

Test the current-location path:

```bash
adb shell "/system/bin/busybox wget -q -O - 'http://127.0.0.1/widget/htc/lat-lon-search.asp?lat=44.4268&lon=26.1025'"
```

### 8. Refresh the Weather app

Open HTC Weather and refresh. If it still shows old data, reboot the phone and wait for `bootcomplete`, then refresh again.

## Verification

```bash
# httpd is listening only on localhost
adb shell "/system/bin/busybox netstat -ltn" | grep ":80 "

# hosts entries
adb shell "cat /system/etc/hosts"

# weather XML
adb shell "/system/bin/busybox wget -q -O - 'http://127.0.0.1/widget/htc/forecast-data_v3.asp?loccode=BUCHAREST'" | head -12

# saved-city cache (optional; pull with root)
adb shell "su -c '/system/bin/busybox cp /data/data/com.htc.sync.provider.weather/databases/weathersync.db /sdcard/weathersync.db'"
adb pull /sdcard/weathersync.db
```

The `weathersync.db` `data` table should contain non-empty `curTempC`, `curTempF`, `curConditionId`, `fstName`, and forecast columns for each city.

## Caveats

- The Open-Meteo IPv4 is hardcoded. If it changes, Weather stops updating until you update `/system/etc/hosts`.
- `httpd` starts at `bootcomplete`, a little after Android boots. If Weather is opened immediately after a reboot, wait a few seconds and refresh.
- The CGI uses plain HTTP to Open-Meteo. Open-Meteo supports it and no API key is required. This is a deliberate compatibility choice for Froyo; it is not a general recommendation for other services.
- The phone-local server binds to `127.0.0.1` only. It is not exposed to Wi-Fi or mobile data.
- The XML is intentionally ISO-8859-1 and lowercase. Do not "modernize" it to the Sense 4 `<adc_database>` schema.
- The boot hook assumes the stock `/system/bin/bootcomplete` exists. If your ROM does not have it, use an `init.d` script or a different boot service.
- The weather stack is independent of the network type. It works on Wi-Fi or mobile data as long as the phone can reach Open-Meteo on port 80.
