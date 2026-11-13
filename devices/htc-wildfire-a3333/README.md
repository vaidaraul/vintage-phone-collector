# HTC Wildfire A3333 — HTC Weather restoration

**Status:** rooted, S-OFF, SuperCID, ClockworkMod recovery, WWE Froyo with all stock apps restored; HTC Weather fully phone-local and working for saved cities plus Bucharest; News skipped

**Last updated:** 2026-11-13

> **Current process documentation:** [HTC Wildfire A3333 process guide](../../docs/htc-wildfire-a3333/PROCESS.md). The sections below are the device history. Some pre-2026-11-12 sections describe the pre-S-OFF state, failed downgrade attempts, or superseded plans; they are marked as historical and are kept for provenance.

Part of the [Vintage Phone Collector](../../README.md) project.

This project started as an investigation into restoring the original HTC Weather service on an HTC Wildfire A3333 while preserving its stock Android 2.2.1 Froyo firmware and HTC Sense interface. It now documents the final restoration: rooted, S-OFF, generic WWE Froyo, the full stock app set, and a phone-local weather stack that needs no HTC service or VPS.

## Project rules

- Preserve the original Android version, HTC Sense look and feel, and original applications wherever practical.
- Prefer reversible, reproducible steps; do not flash or alter system partitions without a verified recovery path.
- Keep observations, hypotheses, and unverified assumptions explicitly separate.
- Do not publish HTC APK/ODEX binaries, device serials, raw logs, credentials, vendor request parameters, or private network secrets.
- A locally hosted lab service is useful for protocol compatibility tests. The final Wildfire design is fully phone-local: it works on ordinary Wi-Fi or mobile data and does not need a home LAN service, a VPS, or a public endpoint.
- Do not weaken TLS by disabling certificate or hostname verification or by silently falling back to plaintext HTTP for a public service.

## Device record

| Property | Observed value |
| --- | --- |
| Model | HTC Wildfire A3333 |
| Codename / product | buzz |
| Android release | 2.2.1 Froyo (SDK 8) |
| Software number before MISC downgrade experiment | 2.24.162.1 |
| Build | FRG83D, CL298713, release-keys |
| Baseband | 3.35.20.10 |
| MID | PC4910000 |
| CID reported by HBOOT | VODAP102 |
| HBOOT | 1.01.0002 |
| Security | S-ON / SHIP |
| Main version reported by fastboot after MISC experiment | 1.11.111.2 |
| Final software | WWE 2.22.405.1 (Froyo 2.2.1) |
| Final build | 2.22.405.1 CL295397 release-keys |
| Final CID | 11111111 (SuperCID) |
| Final HBOOT | 6.01.1002 (Revolutionary, `security: off`) |
| Recovery | ClockworkMod 5.0.2.0 (buzz) |
| Root | BusyBox `su` at `/system/bin/su`, promptless; Superuser app removed |

Serial numbers and private network details are intentionally omitted. Values above were read during ADB/fastboot inspection; the software number and fastboot main-version are from different stages of the investigation and should not be conflated.

## 2026-11-12 result

- Root/S-OFF achieved with the patched Revolutionary Caroline payload, replayed from Linux; the reproducible procedure is in [PROCESS.md](../../docs/htc-wildfire-a3333/PROCESS.md).
- WWE Froyo `2.22.405.1` flashed, ClockworkMod recovery installed, SuperCID set. The initial debloat was reverted on 2026-11-13: all 60 removed stock APK/ODEX files were restored from the pre-debloat image. Only the Vodafone-branded apps from the old Vodafone base are absent, because the WWE build never contained them.
- Weather is now fully phone-local: BusyBox httpd on `127.0.0.1:80`, CGI fetches Open-Meteo CSV over HTTP and emits the old `<weather><current><temp c=".." f=".."/><condition icon=".."/></current><forecast><day>...` schema. No VPS or Linux backend is required.
- `/system/etc/hosts` redirects `htc.accuweather.com` to `127.0.0.1` and `api.open-meteo.com` to its current IPv4 (the home DHCP handed the phone an unreachable Tailscale DNS).
- `/system/bin/bootcomplete` is a wrapper that starts httpd at boot, then execs `/system/bin/bootcomplete.orig`.
- News was skipped per user request; HTC NewsReader remains installed and accepts arbitrary RSS/Atom feeds.
- The restore covers `/system/app` only. The pre-debloat backup was a system image, not a userdata backup; the restored apps start with fresh data/accounts.
- The WWE system image includes HTC's Facebook/Twitter/Flickr integrations and FriendStream, but not the standalone Facebook or Twitter clients. Standalone apps that were installed in `/data/app` before the ROM flash are not in the system backup.

## 2026-11-13: verified games

- **Doodle Jump 1.3.0** (`com.realarcade.DOJ`, RealArcade/RealNetworks 2009 signature) is installed and verified. It launches to the sound prompt, main menu, high-score screen, help overlay and in-game view at 240x320; the optical trackpad/DPAD navigates the menus. It is a self-contained Java/MIDlet port with no network dependency, so it works offline. The APK stays outside Git; SHA-256 `db578b60fb16e2cf17e9968d8541e6cb21f33f3f3615ced26f71842576f60bf2`.
- **Angry Birds:** not playable on this ROM. The Android builds require OpenGL ES 2.0, but the stock kernel exposes no `hw3dc` GPU device; the ES 1.x 1.0 build also crashes in its EGL config chooser. Details, hashes and cleanup are in [GAMES.md](../../docs/htc-wildfire-a3333/GAMES.md).

## Investigation observations (2026-11-08 to 2026-11-10) — historical

> The final verified state is at the top of this page. These notes mix observations from different stages, including the pre-S-OFF and lab-only weather experiments.

- The stock HTC Weather application launches.
- Refreshing it originally showed: “Connection error — Sorry, but the connection dropped while your weather information was downloading.”
- The stock browser loaded HTTP sites. HTTPS compatibility on the original Froyo TLS stack has not yet been tested.
- ADB over USB works.
- The local XML mock was accepted by the original HTC Weather app and displayed weather.
- The live Open-Meteo adapter and city-code resolver are deployed and verified on the phone; London rendered 9 °C on 2026-11-10.
- Forecast display works: four tiles with distinct `MM/dd/yy` dates and three-letter labels. The client consumes the first entry as today, so the adapter sends today plus four future days.
- The "more details" link opens the adapter's script-free details page through the lab DNS redirect. On a network without that redirect, the app follows AccuWeather to HTTPS and Froyo's TLS stack fails.
- Fruit Ninja 1.7.5 launches but reportedly stutters severely during gameplay. Cause has not been measured.
- Jetpack Joyride 1.5 installs but reportedly crashes at startup with native signal 4 (SIGILL) in `libmortargame.so`; the exact instruction/failure has not been decoded.
- A read-only package inventory of the original Vodafone base found four Vodafone packages under `/system/app`: `com.vodafone.shop`, `com.vodafone.vodafone360updates`, `com.vodafone.android.app.music`, and `de.vodafone.meinvodafone`. They are not present on the current WWE build; flashing WWE replaced that base, so no separate Vodafone debloat step is needed.

## Original HTC weather components

| Package | System APK |
| --- | --- |
| com.htc.Weather | /system/app/Weather.apk |
| com.htc.WeatherWidget | /system/app/com.htc.WeatherWidget.apk |
| com.htc.weather.agent | /system/app/WeatherAgentService.apk |
| com.htc.provider.weather | /system/app/WeatherProvider.apk |
| com.htc.sync.provider.weather | /system/app/WeatherSyncProvider.apk |

The local investigation copied the APKs and matching ODEX files to a private working folder for static analysis. Those binaries are not included here.

## Protocol investigation

> **Final implementation:** the phone-local stack documented in [WEATHER.md](../../docs/htc-wildfire-a3333/WEATHER.md) uses this contract. The lab mock described below is historical.

Deodexing the original `WeatherSyncProvider.odex` recovered the request templates and forecast parser structure. The endpoint host and paths are:

- Forecast data: `http://htc.accuweather.com/widget/htc/forecast-data_v3.asp`
- Latitude/longitude lookup: `http://htc.accuweather.com/widget/htc/lat-lon-search.asp`

The original requests include a vendor parameter whose value is intentionally omitted. Forecast requests add a URL-encoded location code and both request forms add a cache-busting value derived from device time. The original helper reads response text as Latin-1 and uses 5-second connect/read timeouts.

### Parser-derived XML contract

The following skeleton represents fields consumed by the deodexed parser; it is derived from code, not captured from the historical service:

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

The parser reads current temperature from `temp` attributes; day names and dates from element text; condition IDs from the `icon` attribute; and forecast high/low temperatures from Celsius/Fahrenheit integer attributes. The historical service response has not been captured. The local mock proves acceptance of this parser-shaped response on the exercised refresh path only.

## Local mock integration test (2026-11-08) — historical

> The final weather stack no longer uses the Linux AP/DNS mock. See [WEATHER.md](../../docs/htc-wildfire-a3333/WEATHER.md) for the phone-local implementation.

The original app was tested without changing its APK, firmware, or system files. A Linux host created an isolated 2.4 GHz WPA2 access point. Local DNS mapped only `htc.accuweather.com` to the Linux host, which served both legacy paths over HTTP. The phone successfully refreshed and displayed synthetic XML weather. Temporary IPv4 forwarding/NAT then allowed the phone to load an ordinary HTTP site over the isolated AP.

This is an end-to-end compatibility smoke test, not a captured historical API response. Both legacy paths returned the same forecast XML, so the old location-search response remains unknown. The home-router DHCP DNS override attempt failed due to access-rights restrictions; the successful test used a separate Linux AP and did not persistently modify the router.

See [mock-server setup and cleanup](mock-server/README.md). The lab setup is intentionally documented as a test harness, not the final internet architecture. AP, DHCP/DNS and NAT boot persistence have not been configured.

## Bootloader, root and downgrade investigation (2026-11-09) — historical

> **Superseded 2026-11-12.** S-OFF was achieved with the patched Revolutionary Caroline payload. The current procedure is in [PROCESS.md](../../docs/htc-wildfire-a3333/PROCESS.md). The text below records the pre-S-OFF state and the failed downgrade attempts; it is not the current procedure.

This section records a separate attempt to understand whether the Vodafone-branded device can be converted to a generic HTC WWE software baseline and whether permanent root/S-OFF is feasible. The phone currently boots Android normally.

### Observed bootloader state

Fastboot reported:

```text
product: buzz
modelid: PC4910000
cidnum: VODAP102
version-bootloader: 1.01.0002
version-baseband: 3.35.20.10
version-main: 1.11.111.2
security: on
build-mode: SHIP
hbootpreupdate: 11
```

At that time the device was S-ON / SHIP, HBOOT 1.01.0002. This is historical; the current state is S-OFF (see the top of this page).

### Temporary root

The legacy `psneuter` exploit was run through ADB and returned `uid=0(root)`. After rebooting the phone, root was gone; running the exploit again restored a root ADB shell. This is temporary, one-session root, not persistent root. No permanent root mechanism or writable `/system` was established.

### MISC experiment and verified backup

The downgrade procedure supplied with the old archive writes a modified MISC image, then uses a GoldCard and an RUU flash attempt. The MISC partition was backed up after the experiment and the current backup was copied to a second file. Both current backup copies have SHA-256:

```text
84e7085dad93497cf22a956e64298daf27288e220502544d9aeb18a5c36457b9
```

The backup is 655,360 bytes (640 KiB). Preserve both local backup copies; do not overwrite them. The MISC edit changed the main-version value used by the experiment and attempted to alter a CID-like field to `11111111`, but HBOOT continued to report CID `VODAP102`. A matching hash between the two copies establishes that the copies are identical; it does not prove the modified MISC image is a valid or accepted GoldCard/CID bypass. MISC is distinct from `/system`; this experiment did modify MISC, even though no `/system` files were changed.

### RUU downgrade attempt — rejected before flashing

The target image was the generic HTC WWE Froyo RUU `2.22.405.1` for model `PC4910000`. Its `android-info.txt` model ID matches the handset, but its allowed-CID list includes generic HTC CID values and does not list `VODAP102`. The image metadata reports `mainver: 2.22.405.1` and `hbootpreupdate: 12`; the handset reported `hbootpreupdate: 11`. These metadata differences are recorded, not established as the cause of the observed rejection. The archive's original batch procedure was written for a Wildfire with HBOOT 1.01.0001, while this handset reports 1.01.0002.

The original two-stage batch procedure was also inspected. Its first stage pushes `dmisc.img`, `flash_image`, and `psneuter` over ADB, obtains temporary root with `psneuter`, writes the MISC image, and invokes the GoldCard utility. Its second stage syncs, reboots to the bootloader, erases cache, enters RUU mode, flashes `rom.zip`, and reboots the bootloader. This documents what the supplied archive attempted; it is not a recommended procedure for this handset.

The RUU attempt passed model-ID validation and then failed at custom-ID validation:

```text
checking model ID...       (passed)
checking custom ID...
FAILED (remote: '42 custom id check fail')
```

Two different SD cards were prepared as GoldCards. On each, the generated 384-byte GoldCard header was written and read back byte-for-byte successfully. The exact SD-card CIDs, generated header bytes, and per-card hashes are deliberately kept out of the public repository. Despite the successful header read-back, both RUU attempts failed at the same custom-ID check. This shows that the SD header write itself was verified; it does not prove HBOOT accepted or acted on the GoldCard. The RUU rejected the image before any firmware partition write was observed. The phone was rebooted and returned to Android normally. Both SD cards were removed and returned to service. Do not repeat this flash attempt or assume the GoldCard was accepted.

### Overall result at that stage

At that stage the handset booted Android normally. No ROM or APK had been flashed, no persistent root had been established, and no `/system` files had been modified. The MISC partition was deliberately modified during the downgrade experiment and then backed up; this is separate from the later RUU attempt, which was rejected before any firmware partition write. At that stage the phone was not in RUU mode or a bootloop, and both SD cards were returned to service.

### S-OFF research status — resolved 2026-11-12

**Superseded:** S-OFF was achieved on 2026-11-12 with the patched Revolutionary 0.4pre4 Caroline payload, replayed from Linux. The phone reports HBOOT `6.01.1002`, `security: off`, and CID `11111111`.

Historical community documentation had indicated that AlphaRev X / Revolutionary instructions commonly targeted HBOOT 1.01.0001 and that support for 1.01.0002 was unclear. The working path did not require a downgrade to 1.01.0001. See [PROCESS.md](../../docs/htc-wildfire-a3333/PROCESS.md) for the current procedure.

### Proposed local HBOOT reverse engineering (not attempted)

The next idea raised for investigation is to acquire a copy of the handset's HBOOT 1.01.0002 binary and analyze it offline on a PC. No HBOOT binary has yet been extracted for this purpose, no disassembly or patch has been made, and no modified bootloader has been written to the phone. The proposed work is limited initially to identifying the bootloader's validation paths and understanding the distinction between CID/MID/version policy checks and image-signature/authenticity checks. Editing an RUU metadata file or patching a validation branch would not by itself establish that S-ON will accept or execute a modified HBOOT. There is currently no verified installation or recovery path for a locally patched HBOOT on this exact handset. Any binary analysis should remain offline until that chain is understood.

## Android 2.2 network compatibility constraints

Android 2.2.1 is API level 8 and uses an old platform TLS implementation and CA store. Android's historical documentation places SNI support in `HttpsURLConnection` starting with Android 2.3, so a modern virtual-hosted HTTPS API may not be directly reachable by the stock Froyo networking stack. The actual Wildfire's TLS capabilities have not yet been measured.

This is a design constraint for any public service. The final Wildfire design avoids it by keeping the weather stack on the phone: the only network request is the phone's plain HTTP fetch to Open-Meteo, and no public service or TLS endpoint is exposed. If you build a public service instead, do not disable certificate or hostname verification; use a compatible edge or a maintained client networking stack, and demonstrate the TLS chain before relying on it.

## Current architecture direction — superseded 2026-11-12

> **Final design:** the weather stack is fully phone-local. BusyBox httpd on `127.0.0.1:80`, a CGI that fetches Open-Meteo CSV over HTTP, and an `awk` converter produce the old HTC XML. No VPS, home server, or public endpoint is used. See [WEATHER.md](../../docs/htc-wildfire-a3333/WEATHER.md). The VPS/TLS plan below was rejected by the owner and is kept as a historical design note.

The local Linux AP/DNS redirect is a useful isolated test harness because it proves the original app can consume the compatibility XML. It is not the intended production design. The target is:

- Keep HTC Sense and the original Weather UI where feasible.
- Remove Vodafone components only after root/write access and a recoverable system backup are established.
- Translate a current weather provider into the legacy XML contract.
- Make the service available over the public internet, independent of the user's home LAN or Wi-Fi.
- Preserve secure transport and strict certificate/hostname validation; no insecure fallback.
- Document every tested step, exact device state, failure mode, backup, and recovery path so the process can be reproduced by another Wildfire owner.

A controlled “Frankenstein” solution may be acceptable if individual components are isolated, documented, reversible, and tested. A reproducible hybrid is preferable to pretending the device can run modern Android infrastructure natively.

## Investigation backlog

Completed:

- [x] Achieve permanent root and S-OFF on HBOOT 1.01.0002 / CID VODAP102.
- [x] Flash generic WWE Froyo and keep the full stock app set.
- [x] Make HTC Weather work without HTC/AccuWeather and without a VPS.
- [x] Restore the apps removed by the earlier debloat.
- [x] Document the verified end-to-end process in `docs/htc-wildfire-a3333/`.

Remaining:

1. Reproduce the full process on a second Wildfire A3333 or after a full restore.
2. Parameterize the capture scripts and remove hardcoded paths.
3. Add screenshots/photos and expected command outputs to the process guide.
4. Test the raw image restore path from ClockworkMod.
5. Re-verify the Open-Meteo IPv4 maintenance procedure.
6. Keep the original HTC UI and document any rebuilt services/apps as separate components.

## Reproduction notes

Read-only inventory commands:

```powershell
adb devices -l
adb shell getprop
adb shell pm list packages
adb shell pm path com.htc.Weather
adb shell dumpsys package com.htc.Weather
```

Do not use commands that install, remove, remount, or flash system files as part of the read-only workflow.

## Local-only artifacts

Original HTC APK/ODEX files, raw log captures, packet captures, SD-card images, modified MISC images, and device-specific identifiers stay outside the public repository. Never publish the GoldCard header, MISC binary, phone serial, local Wi-Fi password, PPPoE credentials, HTC vendor request parameter, private IP-specific credentials, or raw logs containing identifiers.
