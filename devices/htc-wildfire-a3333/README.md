# HTC Wildfire A3333 — HTC Weather restoration

**Status:** local mock integration verified; real-provider backend not implemented  
**Last updated:** 2026-11-08

This project investigates restoring the original HTC Weather service on an HTC Wildfire A3333 while preserving its stock Android 2.2.1 Froyo firmware, HTC Sense interface, and original applications. The goal is a compatibility backend for the existing client, not a ROM or app replacement.

## Project rules

- Keep the original Android version, HTC Sense, firmware, and HTC applications.
- Do not factory reset, root, unlock, flash, downgrade, or modify system partitions.
- Prefer external compatibility services and read-only investigation.
- Preserve original packages locally; do not publish HTC APKs or ODEX files.
- Do not implement a backend until the original request and response format are understood.
- Record observations separately from hypotheses.

## Device record

| Property | Observed value |
| --- | --- |
| Model | HTC Wildfire A3333 |
| Android release | 2.2.1 Froyo (SDK 8) |
| Software number | 2.24.162.1 |
| Build | FRG83D, CL298713, release-keys |
| Product/device | htc_buzz / buzz |
| Baseband | 13.55.55.24H_3.35.20.10 |
| Kernel | 2.6.32.21-g6c55ee4 (device brief) |

The device properties were read over ADB. The kernel string above comes from the project brief and has not yet been independently checked in this session. Device serial numbers and local network details are intentionally omitted from this public record.

## Current observations

- The stock HTC Weather application launches.
- Refreshing it shows: “Connection error — Sorry, but the connection dropped while your weather information was downloading.”
- The stock browser loaded HTTP sites, including NeverSSL. HTTPS compatibility has not been tested.
- ADB over USB works. The device reports as device in adb devices -l.
- No ROM, APK, system-partition, root, or persistent network configuration changes were made. For the local integration test, the phone was temporarily connected to an isolated Wi-Fi access point.

## Original HTC weather components

The following installed packages and paths were read from the device:

| Package | System APK |
| --- | --- |
| com.htc.Weather | /system/app/Weather.apk |
| com.htc.WeatherWidget | /system/app/com.htc.WeatherWidget.apk |
| com.htc.weather.agent | /system/app/WeatherAgentService.apk |
| com.htc.provider.weather | /system/app/WeatherProvider.apk |
| com.htc.sync.provider.weather | /system/app/WeatherSyncProvider.apk |

The Weather app declares internet and network-state permissions. The local investigation copied the APKs and matching ODEX files to a private working folder for static analysis. Those binaries are not included here.

## Protocol investigation

Deodexing the original `WeatherSyncProvider.odex` recovered the request templates and the forecast parser structure. The endpoint host and paths are:

- Forecast data: `http://htc.accuweather.com/widget/htc/forecast-data_v3.asp`
- Latitude/longitude lookup: `http://htc.accuweather.com/widget/htc/lat-lon-search.asp`

The original requests include a vendor parameter whose value is intentionally omitted here. It is not a key for this project's backend. The forecast request adds a location code URL-encoded with `latin1`; both request forms add a `nocache` value derived from the device's current time. Latitude and longitude are supplied to the lookup endpoint. The helper reads response text as `latin1` and sets 5-second connect and read timeouts.

### Parser-derived XML contract

The sync provider parses a document with `KXmlParser`. It takes the document root without checking its name, then looks for direct `current` and `forecast` children. Under `forecast`, it reads repeated `day` children. The following skeleton represents fields the parser consumes; it is **derived from the code, not captured from the server**:

```xml
<any-root>
  <current>
    <temp c="integer-celsius" f="integer-fahrenheit" />
    <condition icon="condition-id" />
  </current>
  <forecast>
    <day>
      <name>day-name</name>
      <date>date-text</date>
      <condition icon="condition-id" />
      <high c="integer-celsius" f="integer-fahrenheit" />
      <low c="integer-celsius" f="integer-fahrenheit" />
    </day>
  </forecast>
</any-root>
```

The parser reads current temperature from the `temp` attributes; day names and dates from element text; and condition identifiers from the `icon` attribute. It reads each forecast day's `high` and `low` Celsius/Fahrenheit attributes as integers. Condition element text and the root element name are not checked by this parser.

The original service response has still not been captured. However, the original Weather app successfully refreshed against the local mock using this parser-shaped XML. This verifies that the app accepts the mock's forecast response for the exercised refresh path; it does not prove that every field is required, establish the exact original date/icon conventions, or recover the historical location-search response.

### Known and unknown

| Question | Status |
| --- | --- |
| Original Weather package | Identified: com.htc.Weather |
| Legacy service hostname and path | Found in static ODEX strings |
| Transport in the embedded endpoint | HTTP |
| Response family | Parser-derived XML structure recovered; no live response captured |
| Runtime request/response capture | Not yet collected |
| Cause of refresh failure | Unknown |
| Backend implementation | Not started |

## Local mock integration test (2026-11-08)

The original Weather app was tested without changing its APK, firmware, or system files. A Linux host created an isolated 2.4 GHz WPA2 access point; the Wildfire joined it over Wi-Fi while remaining connected to the PC over USB for ADB.

The test network gave the phone a DHCP address and DNS server on a dedicated lab subnet. Local DNS mapped only `htc.accuweather.com` to the Linux host. A Python HTTP server on port 80 served `/healthz` and both legacy paths:

- `/widget/htc/lat-lon-search.asp`
- `/widget/htc/forecast-data_v3.asp`

The response was the static parser-shaped XML generated by the mock server. The user confirmed that HTC Weather refreshed and displayed weather while connected to the test access point. In a later step, temporary IPv4 forwarding and NAT were added from the AP subnet through the host's wired uplink; the user confirmed that `http://example.com` loaded on the phone. The mock values remain synthetic, not live observations. AP, DNS, NAT, and the mock are still running as temporary processes/rules; boot persistence has not yet been configured.

This is an end-to-end compatibility smoke test, not a captured historical API response. In particular, the mock currently returns the same weather XML at both paths, so the original location-search response format remains unknown.

The home-router DHCP DNS override attempt did not take effect: the router UI rejected the write with an access-rights message, and Android continued to receive the previous DNS addresses. The successful test therefore used the separate Linux access point and made no persistent router changes.

See [mock-server setup and cleanup](mock-server/README.md) for the reproducible local procedure and Docker Compose configuration. The HTTP service is being moved into a container; hostapd, DHCP/DNS, and forwarding remain host-managed. Do not publish the temporary Wi-Fi password, raw logcat, HTC vendor parameter, PPPoE credentials, or personal location data.

## Proposed investigation sequence

1. Inspect the original location-search parser to recover its response shape and behavior.
2. Complete the Linux demo's boot-time setup: start the AP/DHCP/DNS and narrowly scoped NAT rules on the host, then start the Dockerized HTTP mock after the AP address exists.
3. Verify internet and the local HTC hostname after a Linux server reboot.
4. Keep the static mock as the current demo; defer a live weather-provider adapter until desired.
5. Preserve the stock phone and its original system configuration.

No modern weather provider has been selected. If a provider requiring credentials is chosen later, keep secrets in deployment environment variables and local .env files; publish only a placeholder .env.example. Do not commit provider keys, captured credentials, private logs, or the legacy vendor parameter.

## Reproduction notes

The read-only package inventory can be repeated with Android Platform Tools. During the isolated AP test, `adb shell netcfg` also confirmed the Wi-Fi interface received a DHCP address in the lab subnet:

```powershell
adb devices -l
adb shell getprop
adb shell pm list packages
```

For a focused package check:

```powershell
adb shell pm path com.htc.Weather
adb shell dumpsys package com.htc.Weather
```

These commands inspect device state. Do not use commands that install, remove, or remount system files as part of this workflow.

## Local-only artifacts

Original HTC APK and ODEX files, raw log captures, packet captures, and device-specific identifiers stay outside the public repository. This folder’s .gitignore excludes common binary, capture, log, and secret-file patterns.
