# Helper scripts

These scripts are the working parts of the [restoration process](../PROCESS.md). They are small text files; no firmware or APK binaries are included.

## Capture the Caroline payload (Windows)

Requirements:

- Node.js.
- The Frida Node module installed in this folder:

  ```powershell
  cd <path-to-guide>\scripts
  npm install frida
  ```

- The patched `revolutionary-nocheck.exe` under `<work>\Bravo_Archive\revolutionary-0.4pre4-patched\`.
- The phone in Android with USB debugging on.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\capture-fastboot.ps1 -Work <path-to-work-folder>
```

The script starts `emulate.js` and the patched tool, captures the fastboot payload, and writes `emu-run.log` / `emu-run.err` in this folder. The tool may abort at the product/battery/lemonade check; that is expected. The phone should be on the white FASTBOOT screen.

`emulate.js` is called by the capture script. It fakes the `AdbWinApi` interface and logs every fastboot command and payload chunk.

## Replay the payload (Linux)

Requirements:

- `python3` and `pyusb` (`sudo apt install python3-usb`).
- `caroline-buzz.bin` with size 524,472 and SHA-256 `1a4a546c536b266b37db81689eef09ca8dc526f3191cfe414941cad5b435084f`.
- The phone on the FASTBOOT screen, connected to the Linux host.

Run:

```bash
python3 fastboot-caroline.py --blob /path/to/caroline-buzz.bin
```

The script uploads the payload and sends `getvar:mainver` last. The phone disconnects and returns with HBOOT `6.01.1002`, `security: off`.

## Restore stock apps

`extract-targets.py` scans a pre-debloat YAFFS2 system image and extracts the removed APK/ODEX files. `install-restored-apps.sh` copies them to `/system/app`.

```bash
python3 extract-targets.py rooted-system.img restore-apps
tar -cf restore-apps.tar restore-apps
adb push restore-apps.tar /data/local/restore-apps.tar
adb push install-restored-apps.sh /data/local/install-restored-apps.sh
adb shell "chmod 755 /data/local/install-restored-apps.sh"
adb shell "su -c /data/local/install-restored-apps.sh"
adb reboot
```

The restore covers `/system/app` only. App data is not in the system image.

## Weather files

The weather scripts and configs are in [`../weather/`](../weather/). See [WEATHER.md](../WEATHER.md) for the install and test procedure.
