# HTC Wildfire A3333: end-to-end restoration process

- **Status:** first complete draft, verified on one device on 2026-11-12/13.
- **Audience:** an owner of an HTC Wildfire A3333 (`buzz`, model `PC4910000`) with basic command-line experience.
- **Difficulty:** advanced. Read the whole document before touching the phone.
- **Risk:** high. A wrong bootloader payload or an interrupted flash can brick the phone.

This document is the process. The engineering notes, raw captures, and historical dead ends are kept in a private engineering log outside this repository. The device history is in [`devices/htc-wildfire-a3333/README.md`](https://github.com/vaidaraul/vintage-phone-collector/blob/main/devices/htc-wildfire-a3333/README.md).

## Contents

- [Phase 0: Prepare](#phase-0-prepare)
- [Phase 1: Root the original firmware](#phase-1-root-the-original-firmware)
- [Phase 2: Flash generic WWE Froyo](#phase-2-flash-generic-wwe-froyo)
- [Phase 3: S-OFF](#phase-3-s-off)
- [Phase 4: Recovery and permanent root](#phase-4-recovery-and-permanent-root)
- [Phase 5: Keep the stock apps](#phase-5-keep-the-stock-apps)
- [Phase 6: Phone-local weather](#phase-6-phone-local-weather)
- [Phase 7: Verify and back up](#phase-7-verify-and-back-up)
- [Appendix A: What is verified and what is not](#appendix-a-what-is-verified-and-what-is-not)
- [Appendix B: Command and path conventions](#appendix-b-command-and-path-conventions)
- [Appendix C: Related documents](#appendix-c-related-documents)

---

## Phase 0: Prepare

### 0.1 Confirm the model

The process is only for the **HTC Wildfire A3333**, codename **`buzz`**, model ID **`PC4910000`**. Do not use it on a Wildfire S, Desire, or any other HTC device.

Boot Android, enable **Settings → Applications → Development → USB debugging**, connect USB, and check:

```bash
adb devices -l
adb shell getprop ro.product.device      # buzz
adb shell getprop ro.product.model       # HTC Wildfire A3333 (or similar)
adb shell getprop ro.build.version.release
```

Do not publish the serial number that `adb devices` shows.

### 0.2 Charge the battery

Charge to at least 80%. The patched Revolutionary tool checks `battery-status` and aborts if it is not `good`. Keep the phone on USB power during the process if possible.

### 0.3 Collect the artifacts

You need the files listed in [ARTIFACTS.md](ARTIFACTS.md). Keep them in a private working directory; do not commit them to the repository.

At minimum:

- WWE Froyo RUU `RUU_Buzz_Froyo_HTC_WWE_2.22.405.1_Radio_13.55.55.24H_3.35.20.10_release_160191_signed.exe`, or its extracted `boot.img`, `system.img`, and `splash1.nb0`.
- `unrevoked3` 3.32.
- `psneuter`.
- ClockworkMod `5.0.2.0` recovery for `buzz`.
- A static ARM BusyBox binary with the `su`, `httpd`, `wget`, `awk`, `tar`, `cp`, and `chmod` applets.
- The patched Revolutionary `0.4pre4` executable (`revolutionary-nocheck.exe`).
- The Frida `AdbWinApi` emulator (`scripts/emulate.js`).
- `caroline-buzz.bin` (the device-specific payload) or the patched exe to extract it from.
- The weather files from `weather/` (`weather-cgi.sh`, `om2xml.awk`, `forecast-data_v3.asp`, `lat-lon-search.asp`, `httpd.conf`, `bootcomplete-wrapper`).
- A private pre-debloat system image if you want to restore removed stock apps.

Verify hashes before use. The hashes we used are in [ARTIFACTS.md](ARTIFACTS.md).

### 0.4 Choose your working hosts

The verified path uses:

- **Windows** for the patched Revolutionary capture (the tool is a Windows executable).
- **Linux** for the raw fastboot replay, ADB, and file work.

You can use physical machines or VMs. If you use a VM, USB passthrough must work reliably. A Linux host with `adb`, `fastboot`, `python3`, `pyusb`, `unzip`, and `tar` is enough for everything except the Windows capture.

### 0.5 Understand the recovery net

Before S-OFF, the recovery net is:

1. Reflash the WWE RUU, or
2. Re-flash the WWE `boot.img` and `system.img` from ClockworkMod recovery.

After S-OFF, you can also restore the raw partition images described in [Phase 7](#phase-7-verify-and-back-up). Test your recovery path before making changes.

---

## Phase 1: Root the original firmware

This phase roots the existing firmware and installs ClockworkMod recovery. It does **not** remove Vodafone apps yet. The verified tool is **unrevoked3 3.32**.

> If you only want root on the original Vodafone firmware, you can stop after this phase. If you want the generic WWE build, continue to Phase 2.

### 1.1 Run unrevoked3

The verified path uses the Linux build. A Windows build of unrevoked3 may work on Windows 7/10, but it was not verified here. The Linux build is a 32-bit GTK2 application; on a 64-bit Ubuntu host, install the 32-bit runtime and a virtual display:

```bash
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install -y libgtk2.0-0t64:i386 libstdc++6:i386 xvfb x11vnc xdotool
```

Connect the phone with USB debugging on and USB storage **not** mounted. Then:

```bash
cd ~/htc-root-work
Xvfb :99 -screen 0 1024x768x24 &
DISPLAY=:99 ./unrevoked-3.32/reflash
```

If the GUI needs a click, connect a VNC viewer to the Linux host on port 5900:

```bash
x11vnc -display :99 -localhost -nopw
```

unrevoked flashes its bundled ClockworkMod and installs `su`. The first `su` request may show a Superuser prompt on the phone; allow it.

### 1.2 Take a nandroid backup

Boot recovery:

```bash
adb reboot recovery
```

In ClockworkMod, choose **backup and restore → Backup**. Then pull the backup to the PC:

```bash
adb pull /sdcard/clockworkmod/backup ~/htc-root-work/cwm-nandroid
```

Keep this backup. It is your fastest way back to the original Vodafone firmware.

### 1.3 Verify root

Boot Android and test:

```bash
adb shell "su -c id"
```

Expected:

```text
uid=0(root) gid=0(root)
```

If `su` does not work, stop and fix it before continuing. Do not flash the WWE system on a phone without a working recovery and root.

---

## Phase 2: Flash generic WWE Froyo

This phase replaces the Vodafone system with the unbranded HTC WWE `2.22.405.1` software while keeping the existing HBOOT and radio. It removes the Vodafone apps and branding. It does **not** S-OFF the phone yet.

> The WWE flash wipes data. Make sure the nandroid backup from Phase 1 is on the SD card and pulled to your PC.

### 2.1 Enter ClockworkMod recovery

```bash
adb reboot recovery
```

Verify the recovery is ClockworkMod and that `/sdcard` is mounted.

### 2.2 Push the WWE images and `flash_image`

From the extracted WWE RUU directory:

```bash
adb push boot.img /sdcard/boot-wwe.img
adb push system.img /sdcard/system-wwe.img
adb push splash1.nb0 /sdcard/splash1-wwe.nb0
adb push misc-wwe-2.22.405.1.img /sdcard/misc-wwe.img
adb push flash_image /sdcard/flash_image
adb shell "chmod 755 /sdcard/flash_image"
```

`misc-wwe-2.22.405.1.img` sets the main version to `2.22.405.1` while keeping the existing CID. It is in the private local working folder. If you do not have it, skip the `misc` flash; the system flash does not require it. Do not flash a MISC image from another device.

### 2.3 Flash boot, system, splash, and misc

Use the exact partition names from `/proc/mtd`:

```bash
adb shell "cat /proc/mtd"
adb shell "/sdcard/flash_image boot /sdcard/boot-wwe.img"
adb shell "/sdcard/flash_image system /sdcard/system-wwe.img"
adb shell "/sdcard/flash_image splash1 /sdcard/splash1-wwe.nb0"
adb shell "/sdcard/flash_image misc /sdcard/misc-wwe.img"
```

If your partition table does not have `splash1`, skip the splash command. Do not guess a partition name.

### 2.4 Install `su` into the new system

While still in recovery, mount `/system` and copy the root files:

```bash
adb shell "mount /system"
adb push su /sdcard/su
adb push Superuser.apk /sdcard/Superuser.apk
adb shell "cp /sdcard/su /system/xbin/su"
adb shell "chown 0.0 /system/xbin/su"
adb shell "chmod 06755 /system/xbin/su"
adb shell "cp /sdcard/Superuser.apk /system/app/Superuser.apk"
adb shell "chmod 0644 /system/app/Superuser.apk"
adb shell "sync"
adb shell "umount /system"
```

> This is the temporary root from Phase 1. Phase 4 replaces it with BusyBox `su`. If you stop after Phase 2, keep this `su` and Superuser app.

### 2.5 Wipe and reboot

In ClockworkMod:

1. **wipe data/factory reset**
2. **wipe cache partition**
3. Reboot.

The first boot takes several minutes. Verify:

```bash
adb shell getprop ro.build.description
# 2.22.405.1 CL295397 release-keys
adb shell getprop ro.build.version.release
# 2.2.1
adb shell "su -c id"
# uid=0(root) gid=0(root)
```

At this point the phone is generic WWE Froyo, still S-ON, with the original HBOOT and radio.

---

## Phase 3: S-OFF

This is the most dangerous phase. The goal is to replace the stock HBOOT with the patched Revolutionary HBOOT so the phone reports `security: off` and accepts fastboot writes.

There are two paths:

- **Verified path (recommended):** capture the Caroline payload with the patched Revolutionary tool on Windows, then replay the payload from Linux with `fastboot-caroline.py`.
- **Unverified alternative:** run the patched Revolutionary tool directly on a Windows 7/10 machine with the HTC bootloader driver. This may work, but it was not verified on this device. Do not rely on it for a first run.

### 3.1 What Caroline is

Revolutionary embeds a per-device **Caroline** payload:

- a 0xB8-byte ARM stub,
- followed by a patched `0x80000`-byte HBOOT.

For `buzz`, the complete payload is 524,472 bytes (`0xB8 + 0x80000`). The correct stub uses `0x9C...` HBOOT RAM addresses. Stubs from other devices use `0x9D...` and freeze the Wildfire USB stack until a power cycle.

The verified payload is `caroline-buzz.bin`:

```text
size:   524472
sha256: 1a4a546c536b266b37db81689eef09ca8dc526f3191cfe414941cad5b435084f
```

Do not use any other payload on this phone.

### 3.2 Option A: capture the payload (Windows)

This is the path we used. The patched tool gets temporary root with zergRush, sends the Caroline payload, and reboots the phone to fastboot. Windows 11 cannot start the HTC `0FFF` bootloader driver, so the fastboot stage is emulated at the `AdbWinApi` layer and logged.

On Windows:

1. Install Node.js.
2. Install the Frida Node module in the `scripts/` folder:

   ```powershell
   cd <path-to-guide>\scripts
   npm install frida
   ```

3. Put the phone in Android with USB debugging on.
4. Run the capture script, pointing `-Work` at the folder that contains `Bravo_Archive`:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\capture-fastboot.ps1 -Work <path-to-work-folder>
   ```

   The script starts `emulate.js` and `revolutionary-nocheck.exe`. It writes `scripts/emu-run.log` and `scripts/emu-run.err`.

The tool should report:

```text
Root acquired!
Sending in Caroline...
Cleaning up...
Rebooting to fastboot...
Waiting for fastboot...
```

The emulator log should contain the fastboot upload:

```text
W len=17 text="download:000800b8"
W len=4096 ... (payload chunks)
```

The tool may abort with `ABORT: Product mismatch`, `FAILED - Your battery was too low`, or `FAILED - Go have some lemonade!`. That is expected: the emulator is only capturing the payload and the command sequence, not completing the flash. The phone will be on the white FASTBOOT screen.

If you do not already have `caroline-buzz.bin`, extract it from the patched executable:

```python
data = open("revolutionary-nocheck.exe", "rb").read()
stub = data[0xD9C0C0:0xD9C0C0 + 0xB8]
hboot = data[0x11B5E0:0x11B5E0 + 0x80000]
open("caroline-buzz.bin", "wb").write(stub + hboot)
```

Verify the size and SHA-256 above. The stub's CRC32 word at offset `0xB0` should be `0xCE20DE33`, matching the HBOOT image.

### 3.3 Option A: replay the payload (Linux)

Move the USB cable to the Linux host. Leave the phone on the FASTBOOT screen.

Install pyusb if needed:

```bash
sudo apt install python3-usb
```

Check the device:

```bash
lsusb | grep -i 0bb4
fastboot devices
```

You should see `0bb4:0fff` and the fastboot device.

Run the replay script from the repository root, pointing it at the payload:

```bash
python3 scripts/fastboot-caroline.py --blob <path-to-caroline-buzz.bin>
```

The script:

1. Sends `download:000800b8`.
2. Uploads the 524,472-byte payload in 4096-byte chunks.
3. Sends the fastboot `getvar` sequence.
4. Sends `getvar:mainver` last.

The `mainver` response triggers the stub. The phone disconnects and returns with the patched HBOOT. Verify:

```bash
fastboot getvar version-bootloader
# 6.01.1002
fastboot getvar security
# off
```

If the phone does not come back, wait 10–20 seconds and check `lsusb` again. If the bootloader USB stack is wedged, power-cycle the phone and use the correct `0x9C...` payload. Do not use a `0x9D...` stub.

### 3.4 Option B: direct Windows run (unverified)

If you have a Windows 7/10 machine where the HTC bootloader driver starts correctly, you can try running `revolutionary-nocheck.exe` directly. The tool should perform the same zergRush, Caroline upload, and fastboot flash without the Linux replay. This path was not verified on our device. If it fails, fall back to Option A.

### 3.5 If you already have S-OFF

Skip to Phase 4. You do not need to run the capture or the replay.

---

## Phase 4: Recovery and permanent root

At this point the phone is S-OFF but may still have the temporary root from Phase 1/2. This phase installs ClockworkMod and a permanent BusyBox `su`.

### 4.1 Flash ClockworkMod

With the phone on FASTBOOT:

```bash
fastboot flash recovery recovery-clockwork-5.0.2.0-buzz.img
fastboot reboot
```

Verify the recovery version by booting it:

```bash
adb reboot recovery
```

### 4.2 Get a temporary root shell

Boot Android. If `adb shell id` is not root, use `psneuter`:

```bash
adb push psneuter /data/local/psneuter
adb shell chmod 755 /data/local/psneuter
adb shell /data/local/psneuter
```

`psneuter` kills `adbd`; wait a few seconds, then restart the ADB server:

```bash
adb kill-server
adb start-server
adb shell id
```

Expected: `uid=0(root) gid=0(root)`.

### 4.3 Install BusyBox `su`

Remount `/system` read-write and install the BusyBox binary twice: once as `/system/bin/su`, once as `/system/bin/busybox`.

```bash
adb shell "mount -o remount,rw /system /system"
adb push busybox-arm /data/local/busybox
adb shell "cat /data/local/busybox > /system/bin/su"
adb shell "chmod 6755 /system/bin/su"
adb shell "cat /data/local/busybox > /system/bin/busybox"
adb shell "chmod 755 /system/bin/busybox"
```

Create the password files. The empty password fields make `su` promptless:

```bash
adb shell "echo 'root::0:0:root:/data:/system/bin/sh' > /system/etc/passwd"
adb shell "echo 'root::0:0:99999:7:::' > /system/etc/shadow"
adb shell "echo 'root:x:0:' > /system/etc/group"
adb shell "chmod 644 /system/etc/passwd /system/etc/shadow /system/etc/group"
adb shell "sync"
adb reboot
```

> **Security warning:** promptless root means any local app can become root without a confirmation dialog. This is acceptable for a single-user vintage device, but do not use it as a daily driver with untrusted apps.

### 4.4 Verify across a reboot

After the reboot:

```bash
adb shell id
# uid=2000(shell) ...
adb shell "su -c id"
# uid=0(root) gid=0(root) groups=0(root)
```

If `su` says `unknown user root`, the passwd file is missing or wrong. If it asks for a password, the shadow entry is wrong.

---

## Phase 5: Keep the stock apps

The goal is to keep the full WWE stock app set. The WWE build does **not** contain the Vodafone apps, so there is no Vodafone debloat step. Do not remove Facebook/FriendStream/Twitter/Flickr/Stock/YouTube/Gmail/Maps or the Sense widgets.

### 5.1 Verify the app set

The verified `/system/app` set has 234 files (127 APK + 107 ODEX). The pre-debloat image had one extra file, the old `Superuser.apk`, which is intentionally not restored because root is BusyBox `su`.

Check:

```bash
adb shell "ls /system/app" | wc -l
adb shell "pm list packages" | wc -l
```

The exact package list is device/build-specific, but the key packages should be present:

```bash
adb shell "pm list packages" | grep -E "com.htc.friendstream|com.htc.socialnetwork.facebook|com.htc.htctwitter|com.htc.socialnetwork.flickr|com.google.android.youtube|com.google.android.gm|com.google.android.apps.maps|com.htc.android.Stock"
```

### 5.2 Restore removed stock apps

If you removed apps and want them back, use the pre-debloat raw system image and the extractor:

```bash
python3 scripts/extract-targets.py rooted-system.img restore-apps
tar -cf restore-apps.tar restore-apps
adb push restore-apps.tar /data/local/restore-apps.tar
adb push scripts/install-restored-apps.sh /data/local/install-restored-apps.sh
adb shell "chmod 755 /data/local/install-restored-apps.sh"
adb shell "su -c /data/local/install-restored-apps.sh"
adb reboot
```

The scripts are in `scripts/`:

- `extract-targets.py` scans the YAFFS2 image for the target APK/ODEX files.
- `install-restored-apps.sh` copies them to `/system/app` with `root:root 0644`.

The restore covers `/system/app` only. App data is not in the system image; restored apps start with fresh data and accounts.

The standalone Facebook/Twitter clients were never part of this WWE system image. The WWE build has HTC's Facebook/Twitter/Flickr integrations and FriendStream. If you want the standalone apps, install a Froyo-compatible APK separately.

---

## Phase 6: Phone-local weather

The final design is fully phone-local:

- BusyBox `httpd` listens on `127.0.0.1:80`.
- `/system/etc/hosts` redirects `htc.accuweather.com` and `www.accuweather.com` to localhost.
- A CGI script fetches Open-Meteo CSV over plain HTTP.
- `awk` converts the CSV to the old HTC `<weather>` XML.
- A wrapper around `/system/bin/bootcomplete` starts `httpd` at boot.

No VPS, no HTC account, and no home-network service is required.

See [WEATHER.md](WEATHER.md) for the full design, the XML schema, and the exact files. From the `weather/` folder, the short version is:

```bash
# On the phone, as root:
adb shell "/system/bin/busybox mkdir -p /data/local/weather-www/widget/htc"
adb push weather-cgi.sh /data/local/weather-cgi.sh
adb push om2xml.awk /data/local/om2xml.awk
adb push forecast-data_v3.asp /data/local/weather-www/widget/htc/forecast-data_v3.asp
adb push lat-lon-search.asp /data/local/weather-www/widget/htc/lat-lon-search.asp
adb push httpd.conf /data/local/weather-www/httpd.conf
adb push bootcomplete-wrapper /data/local/bootcomplete-wrapper
adb shell "chmod 755 /data/local/weather-cgi.sh /data/local/weather-www/widget/htc/*.asp"
```

Then install the hosts entries and the boot wrapper as described in [WEATHER.md](WEATHER.md).

Test:

```bash
adb shell "/system/bin/busybox wget -q -O - 'http://127.0.0.1/widget/htc/forecast-data_v3.asp?loccode=BUCHAREST'"
```

Expected: an XML document starting with `<?xml version='1.0' encoding='iso-8859-1'?>` and `<weather>`.

---

## Phase 7: Verify and back up

### 7.1 Final checklist

Run these on the phone:

```bash
adb shell getprop ro.build.description
# 2.22.405.1 CL295397 release-keys
adb shell getprop ro.build.version.release
# 2.2.1
adb shell "su -c id"
# uid=0(root)
adb shell "pm list packages" | wc -l
# 129 (on our build)
adb shell "ls /system/app" | wc -l
# 234 (on our build)
adb shell "/system/bin/busybox netstat -ltn" | grep ":80 "
# tcp 0 0 127.0.0.1:80 ...
adb shell "/system/bin/busybox wget -q -O - 'http://127.0.0.1/widget/htc/forecast-data_v3.asp?loccode=BUCHAREST'" | head
# <weather> ...
```

Then open the Weather app and check all saved cities plus the current location. Reboot once and repeat to prove the boot hook and root survive.

### 7.2 Backups

Preferred backup: ClockworkMod **backup and restore → Backup** to the SD card, then pull it to the PC.

Archival raw backups, as root:

```bash
adb shell "su -c 'dd if=/dev/mtd/mtd0 of=/sdcard/final-misc.img bs=4096'"
adb shell "su -c 'dd if=/dev/mtd/mtd1 of=/sdcard/final-recovery.img bs=4096'"
adb shell "su -c 'dd if=/dev/mtd/mtd2 of=/sdcard/final-boot.img bs=4096'"
adb shell "su -c 'dd if=/dev/mtd/mtd3 of=/sdcard/final-system.img bs=4096'"
adb pull /sdcard/final-misc.img
adb pull /sdcard/final-recovery.img
adb pull /sdcard/final-boot.img
adb pull /sdcard/final-system.img
sha256sum final-*.img
```

The verified hashes are in [ARTIFACTS.md](ARTIFACTS.md).

To restore a raw system image, boot into ClockworkMod recovery and write it to the matching MTD partition. Do not write to `/system` while Android has it mounted. Test the restore path on a spare device or with a nandroid first.

---

## Appendix A: What is verified and what is not

### Verified on our device

- unrevoked3 root and ClockworkMod on the original Vodafone firmware.
- WWE `2.22.405.1` boot/system/splash/misc flash from ClockworkMod.
- Patched Revolutionary capture with the Frida `AdbWinApi` emulator.
- `caroline-buzz.bin` replay from Linux and the `getvar:mainver` trigger.
- HBOOT `6.01.1002`, `security: off`, SuperCID `11111111`.
- ClockworkMod `5.0.2.0` flash.
- BusyBox `su` with empty root password across reboots.
- Full stock app restore and package registration.
- Phone-local weather for saved cities and current location.

### Not verified

- Direct Windows 7/10 Revolutionary run without the Linux replay.
- Other Wildfire HBOOT versions, CIDs, or hardware revisions.
- Other HTC models.
- Raw image restore from ClockworkMod (documented as a recovery plan, not executed as a final restore test).
- Long-term stability of the promptless root and the phone-local httpd.

If you test an unverified path, record the exact device state, commands, and result. Do not present it as verified until it has been reproduced.

## Appendix B: Command and path conventions

- `adb` and `fastboot` mean the platform-tools binaries. Use a version that can see the phone; the old HTC `adb` 1.0.26 works for Froyo but lacks some modern options.
- Windows paths in the examples use `E:\Projects\HTC\...`; replace them with your own working directory.
- Linux paths use `~/htc-root-work`; replace them with your own working directory.
- The phone's serial number is intentionally omitted. Use `adb devices` and `fastboot devices` to identify your device.
- The `caroline-buzz.bin` payload and the WWE images are device-specific and are not committed to the repository.

## Appendix C: Related documents

- [Overview and process map](README.md)
- [Printable checklist](CHECKLIST.md)
- [Phone-local weather](WEATHER.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Artifacts and hashes](ARTIFACTS.md)
- [Documentation plan](PLAN.md)
- [Changelog](CHANGELOG.md)
- [Helper scripts](scripts/)
- [Weather files](weather/)
- [Device history](https://github.com/vaidaraul/vintage-phone-collector/blob/main/devices/htc-wildfire-a3333/README.md)

The detailed engineering log (raw captures, failed attempts, reverse-engineering notes) is kept privately and is not part of this repository.
