# HTC Stocks on the Wildfire A3333

The stock HTC Stocks app (`com.htc.android.Stock`, version 2.00) still launches on the restored WWE Froyo build, but its quote feed is dead. It POSTs to:

```text
http://api.htc.go.yahoo.com/dgw?imei=...&apptype=finance&src=HTC01
```

Yahoo no longer serves the legacy DGW endpoint, so the app shows **Connection error** and leaves the price columns `NULL` in `stock.db`.

This document describes a small LAN bridge that restores the four default symbols:

- `^FTSE` — FTSE 100
- `^IXIC` — NASDAQ Composite
- `2498.TW` — HTC Corporation
- `GOOG` — Alphabet Class C

The bridge implements the old Yahoo DGW `getquotes` response and sources quotes from CNBC's public quote JSON. The phone keeps the stock app, widget, and database; only the dead feed is replaced.

## Why a bridge?

The Wildfire cannot fetch the modern quote source directly:

- Its Froyo TLS stack only negotiates TLS 1.0.
- CNBC and most modern quote APIs require TLS 1.2 or newer.
- The stock app hardcodes plain HTTP and port 80, and speaks Yahoo's old DGW XML.

A small Python 3 process on a PC, Raspberry Pi, or VPS does the modern HTTPS fetch and translates the result back to the legacy XML. The phone only talks to it over the local network.

## Architecture

```text
HTC Stocks app
  |
  |  POST http://api.htc.go.yahoo.com/dgw?imei=...&apptype=finance&src=HTC01
  v
/system/etc/hosts  ->  <bridge-host>
  |
  v
iptables DNAT  <bridge-host>:80  ->  <bridge-host>:8090
  |
  v
stock-bridge.py  (Python 3, HTTPS)
  |
  |  https://quote.cnbc.com/quote-html-webservice/restQuote/...
  v
legacy DGW XML
  |
  v
com.htc.dcs.service.stock  ->  stock.db  ->  Stocks UI
```

The bridge listens on `0.0.0.0:8090`. The phone's DNAT rule maps port 80 to 8090 because the app always uses port 80 and the bridge runs as an unprivileged user.

## Files

All files are in the [`stocks/`](stocks/) folder next to this document. They are small scripts; no HTC binaries are included.

| File | Purpose |
| --- | --- |
| `stock-bridge.py` | Python 3 DGW bridge; pre-warmed per-symbol cache, CNBC quotes, legacy XML, optional Yahoo fallback |
| `start-bridge.sh` | Starts the bridge, with `--if-needed` support for a cron watchdog |
| `stock-boot.sh` | Phone boot hook that re-adds the DNAT rule |
| `install-phone.sh` | Phone installer: hosts entry, DNAT rule, boot hook |
| `bootcomplete-wrapper` | Example combined weather + Stocks boot wrapper |

## Host setup

The bridge host must be reachable from the phone over the LAN. A wired Linux host, Raspberry Pi, or small VPS all work. The host needs Python 3 and outbound HTTPS.

1. Copy `stock-bridge.py` and `start-bridge.sh` to a persistent directory:

   ```bash
   mkdir -p ~/stock-bridge
   cp stock-bridge.py start-bridge.sh ~/stock-bridge/
   chmod +x ~/stock-bridge/start-bridge.sh
   ```

2. Start it:

   ```bash
   ~/stock-bridge/start-bridge.sh
   curl -sS http://127.0.0.1:8090/healthz
   ```

   The health check returns `ok`. The first start pre-warms the four default symbols before the bridge begins listening, so the health check can take a second; `start-bridge.sh` waits for it.

3. Test a DGW request:

   ```bash
   curl -sS -H 'Content-Type: text/xml' --data-binary @- \
     'http://127.0.0.1:8090/dgw?imei=TEST&apptype=finance&src=HTC01' <<'EOF'
   <?xml version="1.0" encoding="UTF-8"?>
   <request devtype="HTC_Model" deployver="HTCFinanceWidget 0.1" app="HTCFinanceWidget" appver="0.1.0" api="finance" apiver="1.0.1" acknotification="0000">
   <query id="0" timestamp="0" type="getquotes">
   <list><symbol>^FTSE</symbol><symbol>^IXIC</symbol><symbol>2498.TW</symbol><symbol>GOOG</symbol></list></query>
   </request>
   EOF
   ```

   The response is the legacy `<response><result type="getquotes">...` XML.

4. Optional: start it at boot and keep it alive. A user crontab is enough on a machine that stays logged in:

   ```cron
   @reboot /home/USER/stock-bridge/start-bridge.sh
   * * * * * /home/USER/stock-bridge/start-bridge.sh --if-needed
   ```

   Replace `/home/USER` with the real path. `--if-needed` exits immediately if the bridge is already running. If the host has a systemd user session with lingering enabled, a user service is also fine; cron avoids needing root.

5. Allow TCP 8090 from the phone's address in the host firewall. Do **not** expose 8090 to the internet; the bridge has no authentication and only needs to serve the phone.

## Phone setup

The phone must be rooted with BusyBox and `iptables`. The restore already provides both.

Set the bridge host once:

```sh
BRIDGE_HOST=192.0.2.10
```

`192.0.2.10` is a documentation address; replace it with the real LAN address of the bridge host. Use a DHCP reservation or a static address so it does not change.

### Automatic installer

Push the scripts and run the installer as root:

```sh
adb push stocks/stock-boot.sh /sdcard/stock-boot.sh
adb push stocks/install-phone.sh /sdcard/install-phone.sh
adb shell
su
/system/bin/sh /sdcard/install-phone.sh 192.0.2.10
```

The installer:

1. Backs up `/system/etc/hosts`.
2. Replaces any old `api.htc.go.yahoo.com` entry with `<bridge-host> api.htc.go.yahoo.com`.
3. Installs `/data/local/stock-proxy/stock-boot.sh` with the bridge host.
4. Adds the DNAT rule immediately.
5. Adds a call to `stock-boot.sh` in `/system/bin/bootcomplete` before the original `bootcomplete.orig`, after backing up the wrapper.

### Manual setup

If you prefer to do each step yourself:

```sh
mount -o remount,rw /system
mkdir -p /data/local/stock-proxy
cp /system/etc/hosts /data/local/stock-proxy/hosts.bak
sed -i '/api\.htc\.go\.yahoo\.com/d' /system/etc/hosts
echo '192.0.2.10 api.htc.go.yahoo.com' >> /system/etc/hosts
chmod 644 /system/etc/hosts
```

Install `stock-boot.sh` in `/data/local/stock-proxy/` and run it once:

```sh
/system/bin/sh /data/local/stock-proxy/stock-boot.sh
```

Then add this line to `/system/bin/bootcomplete` **before** `exec /system/bin/bootcomplete.orig`:

```sh
/system/bin/sh /data/local/stock-proxy/stock-boot.sh
```

Do not guard it with `[ -x ... ]`: the stock Android `sh` on this ROM has no `[` or `test` builtin, so that test always fails. Use BusyBox `test`, or call the script directly as above.

### Verify

```sh
iptables -t nat -L OUTPUT -n
```

You should see:

```text
DNAT  tcp  --  0.0.0.0/0  192.0.2.10  tcp dpt:80 to:192.0.2.10:8090
```

Open **Stocks**. The four default symbols should show prices. If the app still shows the old **Connection error** dialog, close it with **Yes** to retry, or close and reopen the app. The app writes quotes to:

```text
/data/data/com.htc.dcs.service.stock/databases/stock.db
```

The `quotes` table should contain non-`NULL` prices.

## Protocol

### Request

```xml
<?xml version="1.0" encoding="UTF-8"?>
<request devtype="HTC_Model" deployver="HTCFinanceWidget 0.1" app="HTCFinanceWidget" appver="0.1.0" api="finance" apiver="1.0.1" acknotification="0000">
<query id="0" timestamp="0" type="getquotes">
<list><symbol>^FTSE</symbol><symbol>^IXIC</symbol><symbol>2498.TW</symbol><symbol>GOOG</symbol></list></query>
</request>
```

### Response

```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <result type="getquotes" timestamp="...">
    <list count="4" total="4">
      <quote>
        <name>FTSE 100</name>
        <symbol>^FTSE</symbol>
        <exchange>FTSE International</exchange>
        <status>1</status>
        <timestamp>...</timestamp>
        <price>10872.5</price>
        <change>9.41</change>
        <changepercent>0.09</changepercent>
        <open>10863.28</open>
        <high>10896.53</high>
        <low>10836.63</low>
        <volume>129420980</volume>
        <marketcap>N/A</marketcap>
        <link>http://m.yahoo.com/s/htcwf/yfinance/quote/%5EFTSE/</link>
      </quote>
      ...
    </list>
  </result>
</response>
```

The parser is case-sensitive. Keep the lowercase tag names and the `result`/`list`/`quote` nesting.

### Symbol mapping

The bridge translates Yahoo-style symbols to CNBC symbols:

| Yahoo/DGW | CNBC |
| --- | --- |
| `^FTSE` | `.FTSE` |
| `^IXIC` | `.IXIC` |
| `2498.TW` | `2498-TW` |
| `GOOG` | `GOOG` |

Indices starting with `^` become `.` plus the rest. Taiwan symbols ending in `.TW` become `-TW`. Other exchanges may need their own mapping; extend `cnbc_symbol()` if you add symbols that CNBC names differently.

### Why `Connection: close` matters

The DCS stock service has a lifecycle race. `StockServiceImpl.onComponentDestroy()` sets `mContext = null`, but a fetch that is still in flight can finish afterwards and call `updateCacheData()`. If the HTTP response is still being read at that point, the app throws:

```text
java.lang.NullPointerException
  at com.htc.dcs.service.stock.StockServiceImpl.updateCacheData(StockServiceImpl.java:427)
  at com.htc.dcs.service.stock.StockServiceImpl.parseResult(StockServiceImpl.java:294)
```

The original Yahoo DGW response used `Connection: close` and closed the socket. The bridge matches that behavior:

- `HTTP/1.1 200 OK`
- `X-YSTATUS: 200`
- `Connection: close`
- `Content-Type: text/plain;charset=UTF-8`
- `Cache-Control: private`
- `Content-Length: ...`

It also pre-warms the four default symbols at startup and refreshes them every 60 seconds in a background thread. A `getquotes` request is answered from that cache immediately; it never waits for CNBC. This narrows the race and fixed the slow-response cases, but it does not eliminate the app's lifecycle bug: if the DCS component is destroyed before the response is parsed, `updateCacheData()` can still see a null `mContext`. In practice, open Stocks with the screen on and unlocked; if the **Connection error** dialog appears, tap **Yes** to retry or close and reopen the app.

If you rewrite the bridge, do not switch to a keep-alive response, and do not make the app wait for a live upstream fetch. Both can lose the race with `onComponentDestroy()`.

### Volume

The bridge formats `volume` as an integer because the app parses it with `Long.valueOf(...)`. On the test phone the stored values were populated correctly, for example FTSE 100 ~155M, HTC Corporation ~3.39M, and Alphabet Class C ~19.3M.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| **Connection error** dialog, no request in the bridge log | `/system/etc/hosts` points `api.htc.go.yahoo.com` at the bridge host; the DNAT rule exists; the bridge listens on `0.0.0.0:8090`; the host firewall allows the phone |
| Bridge log shows a request but the app still errors | The response must be DGW XML with `Connection: close`; check the bridge's traceback and the phone's `logcat` |
| `NullPointerException` in `StockServiceImpl.updateCacheData` | The app was destroyed before it parsed the response; use `Connection: close`, serve from a pre-warmed cache, and open Stocks with the screen on. If the dialog appears, tap **Yes** to retry or reopen the app |
| `stock.db` prices are `NULL` | No successful `getquotes` response has been parsed; check the bridge and the DCS service |
| Quotes are stale | The bridge refreshes the default symbols in the background every 60 seconds; tap the refresh icon in Stocks or reopen the app. Requests are always answered from the cache |
| The bridge host IP changed | Update `/system/etc/hosts` and the DNAT rule; use a DHCP reservation |
| `iptables` prints `FIX ME! implement getprotobyname()` | Harmless on this ROM; the rule is still installed |
| The app opens the browser to a dead Yahoo page | The **Finance** and **Quotes delayed** links are legacy browser links; they are not the quote feed |
| NASDAQ/GOOG change shows `0.00` | CNBC returned an incomplete after-hours quote; the price is still valid. Refresh later or wait for the next session |

## What still does not work

- The **Y! FINANCE — Quotes delayed** and **Finance** links still open dead `m.yahoo.com` mobile URLs. They are browser links, not the quote API.
- Adding arbitrary symbols may require extending the CNBC symbol mapping.
- Fresh quotes require the bridge host to be running. When it is offline, the app keeps the last values in `stock.db`.
- CNBC sometimes returns zero `change`, `open`, `high`, `low`, or `volume` for US symbols outside the regular session. The bridge passes through the fields it receives; the last price is still displayed. Refresh later or wait for the next market session.
- The app has a pre-existing DCS lifecycle race. If it is opened while the screen is off or behind the keyguard, the DCS component can be destroyed before the response is parsed and the app shows **Connection error**. Open Stocks with the screen on and unlocked; tap **Yes** to retry if needed.
- The Stocks widget uses the same database as the app. It should show the cached values after a refresh, but it was not separately verified in this restore.

## Security notes

- The bridge has no authentication. Run it only on a trusted LAN or firewall it to the phone's address. Do not expose port 8090 to the internet.
- The phone-side changes are root-level: `/system/etc/hosts`, an `iptables` NAT rule, and `/system/bin/bootcomplete`. Back up each file before editing.
- The bridge returns public quote data only; it does not proxy general web traffic or decrypt TLS.

## Verification performed

- The bridge returned valid DGW XML for `^FTSE`, `^IXIC`, `2498.TW`, and `GOOG`.
- The phone's Stocks app showed FTSE 100, NASDAQ Composite, HTC Corporation, and Alphabet Class C with live prices and changes.
- `stock.db` contained non-`NULL` prices, update times, and volumes.
- Foreground and cold-cache requests wrote to `stock.db`; the bridge answered from its pre-warmed cache and refreshed the quotes in the background.
- A background refresh after the 60-second cache interval completed and updated the database.
- After a phone reboot, the boot hook restored the DNAT rule, the app launched, fetched fresh quotes, and updated `stock.db`.
- The app can still show **Connection error** if it is paused/backgrounded before parsing the response; this is the app's own DCS lifecycle race, not a bridge failure. Reopening Stocks with the screen on retries successfully.
