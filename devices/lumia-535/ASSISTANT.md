# Lumia 535 — Cortana revival and voice-assistant notes

Phone: **Lumia 535 (RM-1089)**, Windows 10 Mobile **10.0.14393.2551 (1607)**  
Test pass: **2026-11-15**

The original Cortana consumer service is retired. The shell tile and Search key still exist, but they open a dead end. This note records the working replacement and the options for going further.

## What works

**reCortana 2.0.0.1** — a WP8.1 WinRT assistant distributed through Live Store (App ID 812).

| Property | Value |
| --- | --- |
| Package | `62cf5dbd-ec59-49e9-b6c3-5af9a0ee8031_2.0.0.1_neutral__4jz96krh3xb1a` |
| PhoneProductId | `62cf5dbd-ec59-49e9-b6c3-5af9a0ee8031` |
| Publisher | `CN=lukem` (self-signed) |
| Capabilities | `internetClientServer`, `microphone` |
| Account | One Live ID (the same account used for Live Store) |
| Status | Installs, signs in and answers questions (user-confirmed) |

reCortana is third-party software and is not affiliated with Microsoft. It depends on an external AI service and a One Live ID; service availability is outside this project's control.

## Install notes

Live Store downloaded the package to `D:\Downloads\reCortana.appx` (`4,001,958` bytes) but did not install it. Manual deployment:

```cmd
MinDeployAppX.exe /Add /PackagePath:"D:\Downloads\reCortana.appx" /DeploymentOption:32768
```

That installs to the default package volume. On this phone the default is the SD card, and the SD package volume is stale/offline. The app launched once, then crashed after reboot because its data folders were junctions to `D:\WPSystem\AppData\...`.

The working install targets internal storage:

```cmd
MinDeployAppX.exe /Remove /PackageFullName:"62cf5dbd-ec59-49e9-b6c3-5af9a0ee8031_2.0.0.1_neutral__4jz96krh3xb1a"
MinDeployAppX.exe /AddToVolume /PackagePath:"D:\Downloads\reCortana.appx" /Volume:C:\ /DeploymentOption:32768
```

After that, the app data lives under `C:\Data\Users\DefApps\AppData\Local\Packages\62cf5dbd-...` and it launches reliably.

The app may show the One Live ID sign-in screen on a cold start. Sign in once with “Keep me signed in” checked.

## Search key

The hardware Search key (`WEHButton4`) is remapped to reCortana:

| Registry value | Data |
| --- | --- |
| `HKLM\SYSTEM\Input\WEH\Buttons\WEHButton4\Press\AppID` | `{62cf5dbd-ec59-49e9-b6c3-5af9a0ee8031}` |
| `HKLM\SYSTEM\Input\WEH\Buttons\WEHButton4\PressAndHold\AppID` | `{None}` |
| `HKLM\SYSTEM\Features\ButtonRemapping` | `WEHButtonRouter.dll` |

Reboot after changing the values. Press-and-hold is disabled because the original Cortana action is dead.

To revert, set both `AppID` values to empty and delete `HKLM\SYSTEM\Features\ButtonRemapping`, then reboot. To point the key back at UC Browser, use its `PhoneProductId` `{6cda5651-56b9-48b0-8771-91dbc188f873}`.

## Evidence

- Local capture `captures/recortana-answer-2026-11-15.png` — assistant answer and “Ask me anything” UI.
- Local capture `captures/recortana-2026-11-15.png` — One Live ID sign-in confirmation.
- User-confirmed: the Search key opens reCortana; reCortana answers a query.

## Future options

1. **Custom push-to-talk XAP** — a thin WP8.1 client that records a question, sends it to a PC/server running Whisper + an LLM + TTS, and plays the reply. This is the most controllable path and can use any service (OpenAI, a local LLM, Home Assistant, SEPIA/OVOS). The Search key can target it.
2. **CortanaProxy** — OrangeSec's WP8.1 Cortana request interceptor; technically possible but fragile on 14393 (TLS, authentication, shell integration).
3. **Web revival** — the `nexusapplication/cortanarevival.github.io` static reimplementation; its demo host is currently dead, but it can be self-hosted and opened in UC Browser.
4. **Original Cortana client** — not viable; the backend is retired and the client is shell-integrated.

## Constraints

- 1 GB RAM; a thin client is fine, local speech/LLM inference is not.
- No background wake word for sideloaded apps; push-to-talk via the Search key is the practical UX.
- APPX packages install but may need manual deployment; target `C:\` with `MinDeployAppX.exe /AddToVolume /Volume:C:\` because the SD package volume is stale.
- The phone's Microsoft Store is retired; Live Store is the working distribution channel for reCortana.
