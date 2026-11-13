# Modern web and Google services on Froyo

**Status:** researched and partly tested on the Wildfire A3333 on 2026-11-13. Some limits are permanent Google policy; the web-browsing limit has practical workarounds.

This page separates the things that cannot be fixed from the things that can.

## Permanently blocked by Google

### Google account sign-in

Google does not allow Google Account sign-in on Android 2.3.7 or lower. This has been the case since 27 September 2021. The error **“invalid pass and user combination”** is expected even with the correct password.

Official source: <https://support.google.com/android/answer/10313246>

This affects:

- Adding or re-adding a Google account in Android Settings.
- Gmail, YouTube, Maps, and other Google apps that use the system account.
- Factory reset and re-sign-in.

It is not a password problem, and an App Password does not fix the system account sign-in. App Passwords are for IMAP/SMTP and some third-party apps, not for the Android account framework.

**Workaround:** use Google services in a browser, not in the system account. Google’s own help page suggests `myaccount.google.com` and the basic HTML Gmail interface at `https://mail.google.com/mail/u/0/h`. On this phone, use Opera Mini or a trusted proxy (below). Do not enter your main Google password through a third-party proxy unless you accept that the proxy can see the traffic.

### Play Store / Android Market

There is no official fix. Google ended Android Market support for Android 2.1 and lower in 2017; the old Market/Play client on Froyo is incompatible with the current store servers and TLS requirements. The official store will not come back for this device.

**Workaround:** install APKs manually.

- Copy the APK to the SD card and open it with a file manager.
- Or use ADB: `adb install app.apk`.
- Use the developer’s official download, APKMirror, Uptodown, or APKPure for old versions. Verify the package name and signature when possible.
- Amazon Appstore is not an option: Amazon discontinued it for non-Fire Android devices in August 2025.
- F-Droid’s current client targets newer Android; old F-Droid versions may install but may fail to fetch the index over modern TLS. Manual APK sideloading is more reliable.

## Web browsing: the stock browser cannot be fixed

The stock Android 2.2 browser supports TLS 1.0 only. Most modern sites require TLS 1.2 or 1.3, so they fail with “A secure connection could not be established” or redirect loops. This is in the OS, not a setting you can toggle.

There is no way to add TLS 1.2 to the stock browser without changing the ROM. The practical fixes are:

### Option A: Opera Mini 7.6.4 (easiest, tested)

Opera Mini uses Opera’s servers to render pages and compresses them for the phone. The phone only needs to reach Opera’s proxy; the modern TLS connection happens on Opera’s side. This bypasses the Froyo TLS limit.

Tested on the Wildfire:

- The official APK installs and launches.
- The Google homepage loads in Opera Mini.
- The package is `com.opera.mini.android`, versionName `7.6.3` (the 7.6.4 archive), minSdk 3.
- APK size: 1,267,302 bytes.
- SHA-256: `86ce9f0d933d72bebed356fa464756b5fd78d396e41236aa4f1aa49e8f145720`.

Official download:

```text
https://us.get.opera.com/ftp/pub/opera/android/mini/7.6.4/operamini.apk
```

Install:

```bash
adb install operamini.apk
```

Or copy the APK to the SD card and open it on the phone.

Caveat: in Opera Mini’s compressed mode, Opera decrypts and re-encrypts HTTPS traffic. Do not use it for banking, your main Google password, or other high-value accounts. Use it for reading, search, and low-risk services.

### Option B: WebOne proxy (stock browser, full pages)

WebOne is an HTTP proxy for old browsers. It fetches modern HTTPS pages, adapts them to old HTTP/TLS, and returns them to the phone. Run it on a trusted PC or VPS, then set the phone’s Wi-Fi proxy to the PC’s IP and port 8080.

- Project: <https://github.com/atauenis/webone>
- Works with the stock browser and other old clients.
- Requires .NET 8 on the server.
- Breaks end-to-end encryption by design. Do not use it for banking or passwords.
- A public VPS proxy works on mobile data; a home PC proxy works only on the same Wi-Fi.

### Option C: simple search and news sites

For lightweight reading, use sites designed for old browsers:

- FrogFind: <https://frogfind.com/>
- 68k.news: <http://68k.news/>
- The Old Net: <https://theoldnet.com/>

These are useful for search and headlines, but they are not a general-purpose modern web browser.

### What about Firefox?

Firefox 31.3.0esr is the last Firefox for Android 2.2 on ARMv6 and it supports TLS 1.2. It was installed on this phone and **crashed on launch** with “Firefox had a problem and crashed.” It is not usable on this unit. Do not recommend it without testing on the specific device.

Official archive (for reference only):

```text
https://archive.mozilla.org/pub/mobile/releases/31.3.0esr/android-armv6/en-US/fennec-31.3.0esr.en-US.android-arm-armv6.apk
```

## What still works natively

- HTC Weather: phone-local HTTP service.
- HTC News: BBC topic feeds and plain-HTTP feeds; widget verified.
- Local HTTP services on `127.0.0.1`.
- APK sideloading and root shell.
- The stock browser for plain HTTP and a few old HTTPS endpoints (BBC works; most others do not).

## Security notes

- Opera Mini and WebOne both break end-to-end encryption. Treat them as compatibility tools, not secure browsers.
- Do not enter banking, government, work, or primary-email credentials through them.
- Use a modern device for account recovery, payments, and anything sensitive.
- Download APKs only from official developer sources or reputable archives, and verify the package/signature when possible.

## Summary

| Problem | Permanent? | Fix |
| --- | --- | --- |
| Google account sign-in | Yes, Google policy | Browser-based Google; modern device for sensitive access |
| Play Store / Android Market | Yes | Sideload APKs manually |
| Modern HTTPS in stock browser | Yes, OS TLS | Opera Mini (tested) or WebOne proxy |
| Google Search in stock browser | Mostly | Opera Mini loaded Google in testing |
| News and weather | No | Already working locally |
