# HTC Wildfire A3333 — HTC Weather restoration

**Status:** protocol investigation; read-only device inspection completed  
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
- No software or settings on the phone have been changed as part of this investigation.

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

Static string inspection of the original HTC ODEX files found these historical AccuWeather endpoint templates:

- Forecast data: http://htc.accuweather.com/widget/htc/forecast-data_v3.asp with a location-code parameter.
- Latitude/longitude search: http://htc.accuweather.com/widget/htc/lat-lon-search.asp with latitude and longitude parameters.

The original requests also contain a vendor parameter whose value is intentionally omitted from this public document. It is not a key for this project’s backend.

The HTC sync provider contains references to HttpURLConnection, KXmlParser, parseXml, and parsing routines for current conditions, days, and forecasts. This is evidence that the client consumes XML from the legacy HTTP service. It does not yet establish the exact XML schema, request headers, parameter values, current endpoint availability, or the reason the request fails.

### Known and unknown

| Question | Status |
| --- | --- |
| Original Weather package | Identified: com.htc.Weather |
| Legacy service hostname and path | Found in static ODEX strings |
| Transport in the embedded endpoint | HTTP |
| Response family | XML parsing is present; exact schema unconfirmed |
| Runtime request/response capture | Not yet collected |
| Cause of refresh failure | Unknown |
| Backend implementation | Not started |

## Proposed investigation sequence

1. Deodex or inspect the sync-provider code to recover the precise request construction and XML fields.
2. If static analysis is insufficient, capture a refresh attempt and its network exchange without changing the phone.
3. Confirm whether the old service responds and document representative request/response samples with credentials and personal data removed.
4. Only then design a compatibility adapter that maps a modern weather provider into the legacy response format.
5. Test redirection outside the phone first; keep the original APK and system configuration intact.

No modern weather provider has been selected. If a provider requiring credentials is chosen later, keep secrets in deployment environment variables and local .env files; publish only a placeholder .env.example. Do not commit provider keys, captured credentials, private logs, or the legacy vendor parameter.

## Reproduction notes

The read-only package inventory can be repeated with Android Platform Tools:

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
