# Troubleshooting

This page collects the failure modes seen during the verified Wildfire restoration and the fixes that worked. It is not exhaustive. Record the exact command, output, and phone state when something fails.

## Quick triage

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `adb devices` shows nothing | USB debugging off, driver missing, cable/port, ADB server mismatch | Enable USB debugging, replug, restart ADB, try another port |
| `adb devices` shows `offline` | `adbd` wedged after `psneuter` or a USB reset | Replug USB; reboot the phone if needed |
| `fastboot devices` empty on Linux | Phone not on FASTBOOT, USB stack wedged, permissions, hub | Check `lsusb`, use a rear USB 2.0 port, replug, power-cycle |
| Phone stuck on white FASTBOOT screen | Bootloader USB stack frozen after a wrong payload | Power-cycle; use the correct `0x9C...` buzz payload |
| `ABORT: Product mismatch` | Emulator `getvar:product` reply wrong | Return `buzz`; check the emulator's value table |
| `FAILED - Your battery was too low` | Emulator `battery-status` not `good` | Charge the phone; return `good` in the emulator |
| `FAILED - Go have some lemonade!` | Emulator getvar queue mismatch | The payload is already captured; proceed to the Linux replay |
| `getvar:mainver` read error / disconnect | Expected trigger | Wait for the phone to return with the new HBOOT |
| `su: unknown user root` | `/system/etc/passwd` missing or wrong | Recreate passwd/shadow/group |
| `su` asks for a password | Shadow entry not empty | Set `root::0:0:99999:7:::` in `/system/etc/shadow` |
| `su` segfaults or permission denied | Wrong `su` binary for Froyo | Use the BusyBox `su` applet, not a CM7/Gingerbread `su` |
| Weather shows “No weather data” | `httpd` not running, hosts wrong, Open-Meteo IP stale, boot hook not run | Check port 80, hosts, CGI, and wait after boot |
| Weather updates only on home Wi-Fi | DNS is broken on the phone | The hosts entry should bypass DNS; verify `api.open-meteo.com` resolves to the hosts IP |
| Restored app not in the drawer | APK not scanned, ODEX mismatch, permissions, no free space | Check `pm list packages -f`, logcat, `/system` space, file mode 644 |
| `flash_image` fails | NAND lock still active, wrong partition name | Use recovery and the correct `/proc/mtd` names; do not flash from Android on S-ON |

## Windows and the patched Revolutionary tool

### Windows 11 cannot start the `0FFF` driver

The HTC bootloader interface (`VID_0BB4&PID_0FFF`) may show `CM_PROB_FAILED_START` in Device Manager. Windows 11 cannot load a compatible driver. The verified workaround is the Frida `AdbWinApi` emulator in [`scripts/emulate.js`](scripts/emulate.js), which fakes the fastboot interface and captures the payload. Do not waste time reinstalling HTC Sync drivers; the emulator path is the documented workaround.

### The capture script does not attach

- Make sure `revolutionary-nocheck.exe` is running before the emulator attaches, or use `run-capture6.ps1`, which starts both in the right order.
- Check that the Frida Node module is installed in `scripts/node_modules`.
- The script has hardcoded paths. Edit them to your working directory.
- The tool may take 1–2 minutes at “Zerging Root...”. Wait.

### The capture aborts at product/battery/lemonade

That is expected. The emulator is only capturing the payload and the fastboot command sequence. The important log lines are:

```text
W len=17 text="download:000800b8"
W len=4096 ...
```

Once the phone is on FASTBOOT, move the cable to Linux and run `fastboot-caroline.py`.

## Linux fastboot replay

### `device 0bb4:0fff not found`

- The phone must be on the white FASTBOOT screen, not Android or recovery.
- Check `lsusb | grep -i 0bb4`.
- Replug the cable. Use a rear USB 2.0 port, not a hub.
- If `lsusb` shows the device but pyusb does not, check permissions. A udev rule or `sudo` may be needed.

### `usb.core.USBError: [Errno 16] Resource busy`

Another process (fastboot, adb, or a VM) has claimed the interface. Close it, unplug/replug, and retry.

### The phone freezes at FASTBOOT after the upload

You are using the wrong stub. The `buzz` stub uses `0x9C...` addresses. The `0x9D...` stubs from other devices freeze the Wildfire USB stack. Power-cycle the phone (battery pull if necessary), use the correct `caroline-buzz.bin`, and retry.

### The phone does not return after `getvar:mainver`

Wait 10–20 seconds and check `lsusb` and `fastboot devices`. If it does not return, the payload may not have executed. Verify the payload size and SHA-256, then retry. If the USB stack is wedged, power-cycle.

## ADB and root

### `adb devices` shows `offline` after `psneuter`

`psneuter` kills `adbd`. Wait a few seconds, then:

```bash
adb kill-server
adb start-server
adb devices
```

If it stays offline, unplug/replug USB. If that fails, reboot the phone from its power menu.

### `su` fails after a reboot

Check the three files:

```bash
adb shell "cat /system/etc/passwd"
adb shell "cat /system/etc/shadow"
adb shell "cat /system/etc/group"
```

Expected:

```text
root::0:0:root:/data:/system/bin/sh
root::0:0:99999:7:::
root:x:0:
```

Then check permissions:

```bash
adb shell "ls -l /system/bin/su /system/bin/busybox /system/etc/passwd /system/etc/shadow"
```

`su` must be `06755`; the files must be readable. If `su` says `unknown user root`, the passwd entry is missing. If it prompts for a password, the shadow entry is wrong.

### A Superuser app is still installed

The final root is BusyBox `su`, not the old Superuser app. If `Superuser.apk` is present, it is harmless but unnecessary. The verified setup removed it. Do not install a newer Superuser app: its binder ABI may not work on Froyo.

## Weather

### `httpd` is not running

```bash
adb shell "ps" | grep -i busybox
adb shell "/system/bin/busybox netstat -ltn" | grep ":80 "
```

Start it manually:

```bash
adb shell "su -c '/system/bin/busybox httpd -c /data/local/weather-www/httpd.conf -p 127.0.0.1:80 -h /data/local/weather-www'"
```

If it exits immediately, check the config path and the `*.asp` mapping.

### CGI returns the script source instead of XML

The `httpd.conf` mapping is missing or wrong. It must contain:

```text
*.asp:/system/bin/sh
```

and `httpd` must be started with `-c /data/local/weather-www/httpd.conf`.

### CGI returns an empty document

- Check that `/data/local/weather-cgi.sh` is executable.
- Check that `/data/local/om2xml.awk` exists.
- Check that the phone can reach Open-Meteo:

  ```bash
  adb shell "/system/bin/busybox wget -q -O /sdcard/om.csv 'http://api.open-meteo.com/v1/forecast?latitude=44.43&longitude=26.10&current=temperature_2m,is_day,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6&temperature_unit=fahrenheit&format=csv'"
  adb shell "/system/bin/busybox head -5 /sdcard/om.csv"
  ```

- If DNS fails, add the current Open-Meteo IPv4 to `/system/etc/hosts`.
- If the IP changed, update the hosts line.

### Weather still shows old data after a refresh

- Wait until `getprop dev.bootcomplete` is `1` and a few seconds more.
- Kill and restart the Weather app.
- Reboot and refresh again.
- Check `weathersync.db` for non-empty rows.

### Weather works on Wi-Fi but not mobile data

The hosts entry and local `httpd` are network-independent. If mobile data fails, check the APN and whether the phone can reach `api.open-meteo.com` on port 80. The local CGI does not need the carrier's DNS because the hosts entry supplies the IP.

## Stock app restore

### `pm list packages` does not show a restored app

Check:

```bash
adb shell "ls -l /system/app/<name>.apk"
adb shell "pm list packages -f" | grep <name>
adb shell "logcat -d" | grep -i PackageManager | tail -50
```

Common causes:

- File is not `root:root 0644`.
- ODEX does not match the APK (use the pair from the same image).
- `/system` is full.
- The package requires a missing shared library or framework permission (usually just a warning).

### App launches but crashes

Some restored apps expect data or accounts that were wiped. Clear the app data and try again. For Facebook/Twitter/Flickr, remember that the WWE build contains HTC's integrations, not the standalone clients.

### The app drawer is missing an icon

Some packages are widgets, providers, or integrations without a launcher activity. Check `pm list packages -f` and the widget picker. `com.htc.socialnetwork.facebook` and `com.htc.socialnetwork.flickr` are integrations, not standalone apps.

## Recovery

### Bootloop after a flash

1. Boot ClockworkMod recovery.
2. Restore the nandroid backup from Phase 1 or the latest working backup.
3. If recovery is unavailable, reflash the WWE `boot.img` and `system.img` from fastboot or recovery.
4. As a last resort, run the WWE RUU. A CID mismatch may block it; do not force it.

### RUU fails with `42 custom id check fail`

The RUU's CID list does not include your CID. Do not patch the RUU or force the flash. Use the recovery-based WWE image flash from Phase 2, which does not perform the RUU CID check.

### `flash_image` says `Out of memory` or `cannot open for write`

The NAND lock is still active (S-ON). Do not keep retrying. Use ClockworkMod recovery for the WWE flash, and complete Phase 3 (S-OFF) before attempting raw partition writes from Android.

## Getting help

When asking for help, include:

- The phase and exact command.
- The full output, with serial numbers and personal data removed.
- `adb shell getprop ro.build.description`, `ro.bootloader`, and `ro.product.device`.
- Whether the phone is on Android, recovery, or FASTBOOT.
- The last thing that worked.

Do not publish your serial number, IMEI, SD-card CID, or private keys.
