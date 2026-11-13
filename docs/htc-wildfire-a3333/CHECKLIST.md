# HTC Wildfire A3333 restoration checklist

Print this page or keep it open while working. Tick each item only after the expected result is visible.

## Before you start

- [ ] Phone is an HTC Wildfire A3333 (`buzz`, model `PC4910000`).
- [ ] Battery is at least 80% and the phone is on USB power.
- [ ] USB debugging is enabled.
- [ ] The original firmware boots normally.
- [ ] I have the WWE RUU and the extracted `boot.img`, `system.img`, `splash1.nb0`.
- [ ] I have `unrevoked3` 3.32 and a working 32-bit Linux runtime or VM.
- [ ] I have `psneuter`, ClockworkMod `5.0.2.0`, and BusyBox ARM.
- [ ] I have the patched Revolutionary `revolutionary-nocheck.exe`.
- [ ] I have `caroline-buzz.bin` with size 524,472 and SHA-256 `1a4a...084f`.
- [ ] I have a Windows host for the capture and a Linux host for the replay.
- [ ] I have read the warnings and the recovery section.

## Phase 0: Prepare

- [ ] `adb devices -l` shows the phone.
- [ ] `adb shell getprop ro.product.device` returns `buzz`.
- [ ] The phone is charged and USB debugging is on.
- [ ] All artifact hashes match [ARTIFACTS.md](ARTIFACTS.md).

## Phase 1: Root the original firmware

- [ ] unrevoked3 detects the phone.
- [ ] unrevoked3 finishes and installs ClockworkMod and `su`.
- [ ] I made a nandroid backup to the SD card.
- [ ] I pulled the nandroid backup to the PC.
- [ ] `adb shell "su -c id"` returns `uid=0(root)`.

## Phase 2: Flash generic WWE Froyo

- [ ] The phone boots ClockworkMod recovery.
- [ ] `boot.img`, `system.img`, `splash1.nb0`, `misc-wwe` and `flash_image` are on `/sdcard`.
- [ ] `flash_image boot` succeeds.
- [ ] `flash_image system` succeeds.
- [ ] `flash_image splash1` succeeds (or is skipped if the partition does not exist).
- [ ] `flash_image misc` succeeds (or is skipped).
- [ ] `su` is installed into the new system.
- [ ] Data and cache are wiped.
- [ ] The phone boots WWE `2.22.405.1`.
- [ ] `adb shell "su -c id"` returns `uid=0(root)`.

## Phase 3: S-OFF

- [ ] The Windows capture script starts the emulator and `revolutionary-nocheck.exe`.
- [ ] The tool reaches `Waiting for fastboot...`.
- [ ] The emulator log contains `download:000800b8` and the payload chunks.
- [ ] The phone is on the white FASTBOOT screen.
- [ ] The USB cable is moved to the Linux host.
- [ ] `lsusb` shows `0bb4:0fff`.
- [ ] `fastboot devices` shows the phone.
- [ ] `fastboot-caroline.py` uploads the payload.
- [ ] The `getvar:mainver` trigger is sent.
- [ ] The phone returns with HBOOT `6.01.1002`.
- [ ] `fastboot getvar security` returns `off`.

## Phase 4: Recovery and permanent root

- [ ] `fastboot flash recovery recovery-clockwork-5.0.2.0-buzz.img` succeeds.
- [ ] ClockworkMod recovery boots.
- [ ] `psneuter` gives a temporary root shell.
- [ ] BusyBox is installed as `/system/bin/su` and `/system/bin/busybox`.
- [ ] `/system/etc/passwd`, `shadow`, and `group` exist.
- [ ] `su` is `06755`.
- [ ] The phone reboots.
- [ ] `adb shell "su -c id"` returns `uid=0(root)` after the reboot.

## Phase 5: Keep the stock apps

- [ ] `/system/app` has the full WWE set (234 files on our build).
- [ ] `pm list packages` shows the key HTC and Google apps.
- [ ] FriendStream, HTC Facebook, HTC Twitter, Flickr, Stock, YouTube, Gmail, Maps are present.
- [ ] The Sense widgets are present in the widget picker.
- [ ] No general debloat was applied.
- [ ] If apps were restored, they appear in `pm list packages -f`.

## Phase 6: Phone-local weather

- [ ] `/data/local/weather-www/widget/htc/forecast-data_v3.asp` exists.
- [ ] `/data/local/weather-www/widget/htc/lat-lon-search.asp` exists.
- [ ] `/data/local/weather-cgi.sh` exists and is executable.
- [ ] `/data/local/om2xml.awk` exists.
- [ ] `/data/local/weather-www/httpd.conf` contains `*.asp:/system/bin/sh`.
- [ ] `/system/etc/hosts` has the two HTC hostnames and the Open-Meteo IPv4.
- [ ] `/system/bin/bootcomplete` is the wrapper and `bootcomplete.orig` is preserved.
- [ ] `busybox netstat -ltn` shows `127.0.0.1:80`.
- [ ] The CGI returns `<weather>` XML.
- [ ] HTC Weather shows all saved cities and the current location.
- [ ] Weather still works after a reboot.

## Phase 7: Verify and back up

- [ ] `ro.build.description` is `2.22.405.1 CL295397 release-keys`.
- [ ] `ro.build.version.release` is `2.2.1`.
- [ ] `su -c id` returns root.
- [ ] `pm list packages` count matches the build.
- [ ] `ls /system/app` count matches the build.
- [ ] httpd is listening on localhost.
- [ ] Weather XML is returned.
- [ ] A nandroid backup exists on the SD card and on the PC.
- [ ] Raw `misc`, `recovery`, `boot`, and `system` images are pulled and hashed.
- [ ] The hashes match [ARTIFACTS.md](ARTIFACTS.md).

## Final

- [ ] The phone reboots cleanly.
- [ ] Root survives the reboot.
- [ ] Weather survives the reboot.
- [ ] All stock apps are present.
- [ ] No Vodafone apps are present.
- [ ] I have a recovery path (nandroid or raw images).
- [ ] I have not published any serial, IMEI, CID, or private key.
