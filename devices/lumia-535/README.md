# Nokia Lumia 535 RM-1089 — Windows Phone restoration

**Status:** Windows 10 Mobile running; 15 of 24 HTC-list game titles installed, 14 launch-confirmed  
**Last updated:** November 14, 2026

Part of the [Vintage Phone Collector](../../README.md) project. This log documents a **Nokia Lumia 535 RM-1089**, upgraded from Windows Phone 8.1 to Windows 10 Mobile and used to test classic Windows Phone and Windows 10 Mobile software on original hardware.

The idea is not simply to make an old phone turn on. It is to recover as much of its original software experience as possible, understand what still works, and publish reproducible notes so other collectors can learn from the process.

The local package and tool archive is catalogued in [archive.md](archive.md); binaries stay outside the repository. The current 24-title game suite and HTC-list coverage are in [GAMES.md](GAMES.md). The Microsoft News revival investigation, including the public-feed decision, is in [NEWS.md](NEWS.md).

## Device status

| Component | Current status |
| --- | --- |
| Device | Nokia Lumia 535 RM-1089 |
| Original OS | Windows Phone 8.1 |
| Current OS | Windows 10 Mobile `10.0.14393.2551` |
| Firmware | `02074.00000.15234.28006` |
| Developer Mode | Enabled |
| USB XAP deployment | Working with Microsoft Windows Phone SDK 8.0 |
| Classic XAP games | 15 of 24 HTC-list titles installed; 14 launch-confirmed |
| Minecraft APPX | Removed; `1.5.201.0` installed but start returned `Unavailable` (`-2143322111`); no working build found |
| Internal storage | About 0.9 GB free (2026-11-14); user data moved to SD |
| SD card | About 7.05 GB free; Downloads, Pictures and Documents moved here |
| XAP/APPX move to SD | Not supported on this build (`0x80073D0B` / `0x80070490`) |
| System modifications | No bootloader unlock, custom ROM, root or firmware replacement |

### Games tested on the Lumia 535

These statuses describe observed behavior on this particular phone. They are not universal compatibility guarantees. The full 24-title HTC-list coverage, package IDs, hashes and launch evidence are in [GAMES.md](GAMES.md).

“Launch-confirmed” means a live process appeared after deployment; it does not prove that the menu, gameplay or input work.

| Game | Version | Result | Notes |
| --- | --- | --- | --- |
| Angry Birds Classic | `5.0.2.0` | **Removed** | Modern trial build showed the BUY THE FULL GAME prompt; uninstalled to remove the duplicate and purchase nag. |
| Angry Birds Classic | `1.5.3.0` | **Functional** | Remaining full XNA build; launches and is playable. Archive contains an `AppCracked` marker, so original distribution has not been independently verified. |
| Angry Birds Seasons | `4.0.1.0` | **Launch-confirmed** | Installed from an archived vnokia copy with the title patched to “Angry Birds Seasons”; menu and gameplay were not captured. |
| Angry Birds Go! | `1.8.7.0` | **Removed** | Installs and launches, but hangs on “Installing update” online and shows “No internet” offline; Rovio update service unavailable. |
| Asphalt 5 | `1.33.0.0` | **Functional** | Installed and runs. |
| Bad Piggies | `1.6.1.0` | **Launch-confirmed** | Official Rovio Silverlight XAP; installed and running. |
| Amazing Alex | `1.0.7.0` | **Launch-confirmed** | Official Rovio Silverlight XAP; installed and running. |
| Bubble Blast 2 | `1.4.0.0` | **Launch-confirmed** | Installed from an archived vnokia copy; menu and gameplay were not captured. |
| Candy Crush Saga | `1.0.0.1` | **Functional (user-reported)** | Original pre-microtransaction XAP per the user; package authenticity not independently verified. |
| Cut the Rope | `1.7.0.0` | **Functional (user-confirmed)** | User confirms it is fully working. |
| Cut the Rope 2 | `1.0.0.22` | **Removed** | Repaired patched XAP installs but exits after about 4 seconds; retail/test WP8.1 APPX installs but start returns `0x803F8001` (no Store entitlement). Clean 4PDA attachment no longer downloads; treated as lost media. |
| Doodle Jump | `1.8.10.0` | **Launch-confirmed** | Installed from Archive.org; menu and gameplay were not captured. |
| FIFA 14 | `1.0.0.0` | **Deployment failed** | Invalid-assembly error during deployment optimization; not installed. |
| Fruit Ninja | `1.0.0.0` | **Deployment failed** | Superseded by the `1.1.0.0` build below. |
| Fruit Ninja | `1.1.0.0` | **Launch-confirmed** | Installed from Archive.org; menu and gameplay were not captured. |
| Hill Climb Racing | `1.16.0.0` | **Launch-confirmed** | Installed from Archive.org; menu and gameplay were not captured. |
| Jetpack Joyride | `1.0.1.0` | **Launch-confirmed** | Installed from Archive.org; menu and gameplay were not captured. |
| Minecraft | `1.5.201.0` | **Removed** | Installed through Device Portal but start returned `Unavailable` (`-2143322111`); uninstalled. |
| Minecraft PE | `0.140.1.0` APPX | **Registration failed** | WP8.1 APPX, developer-signed; attempted with its signing certificate and rejected with “Package could not be registered”. Not installed. |
| Minecraft | `1.5.300.0` | **Under investigation** | Manifest inspected on the PC; not installed. |
| Mou | `3.8.2.9` | **Launch-confirmed** | Windows Phone clone of Pou; not the official Zakeh game. |
| My Talking Tom | `1.2.0.0` | **Launch-confirmed** | Installed from an archived vnokia copy. |
| NFS Hot Pursuit | `1.0.0.0` | **Functional (user-reported)** | User reports it works well and awarded an Xbox achievement. |
| Plants vs. Zombies | `1.0.0.0` | **Launch-confirmed** | Installed; menu and gameplay were not captured. |
| Subway Surfers | `1.36.0.0` | **Launch-confirmed** | Installed; menu and gameplay were not captured. |
| Talking Tom | `3.1.0.0` APPX | **Installed; start fails** | Device Portal start returns `Unavailable`; manual launch not verified. |
| Temple Run | `1.5.3.0` | **Launch-confirmed** | Earlier startup instability was not re-tested in the latest pass. |
| Where's My Water? | `1.0.4.0` | **Launch-confirmed** | Uploader repack; root manifest title was corrected from “Find Water by reker”. |
| Zuma's Revenge! | `1.0.0.0` | **Launch-confirmed** | Manifest-patched to remove the legacy 300 MB capability requirement. |

### Applications and deployment notes

| App | Version | Result | Notes |
| --- | --- | --- | --- |
| Instagram | `10.1096.22713.0` | **Outdated; reaches sign-in page (user-reported)** | User reports it installs and launches, but the app is outdated. It reaches the sign-in page; successful sign-in and other online features are unconfirmed. |
| Free Player for YouTube | `1.1.23.0` | **Uninstalled; nonfunctional (user-confirmed)** | It installed, but the user reports it was worthless and did not work; it has since been uninstalled. |
| MSN Weather | `4.26.12153.0` | **Functional; current data confirmed (user-reported)** | User confirms the app works and displays correct weather data, so its API is active. A separate APPXBUNDLE deployment attempt failed with `0x80073CF3`; that failure did not represent the working app's status. |
| Bing Sports | `3.1.4.486` (observed) | **Update path works; API down (user-reported)** | User reports Sports can be updated, but its online API is down. The version shown here is from the earlier Device Portal inventory; the updated version was not recorded. |
| Microsoft News | `4.25.11762.0` | **Installs and launches; feed service dead** | The original ARM app installs and reaches its shell on this build. Its old composite-stream endpoint returns 503; the live query/document/image APIs still return current articles. A public HTTPS compatibility feed is planned; see [NEWS.md](NEWS.md). Not functional yet. |
| Xbox app (default/preinstalled) | Exact installed version not recorded; higher than `44.44.7002.0` | **Installed but not starting (user-reported)** | User reports that the default Xbox app does not start. An attempt to install the archived `44.44.7002.0` APPXBUNDLE was rejected with `0x80073D06` because a higher version is already installed. |
| Windows Camera | Exact updated version not recorded | **Correct and fully working (user-confirmed)** | User confirms the Camera update is correct and fully working. The exact installed version was not provided. |
| Windows Camera candidate bundle | `2018.426.70.0` | **Deployment failed; package requires newer OS** | Device Portal reported `0x80073CFD`. This specific ARM bundle requires Windows `10.0.15063.0`, above the phone's `10.0.14393.2551`; it is distinct from the working Camera update reported above. |
| Microsoft People | `10.2.2351.0` | **Deployment failed (policy error)** | Device Portal reported `0x80073CFF`. The ARM manifest targets Windows Mobile from `10.0.14393.0`, which matches the phone. The PC has the required .NET Native Framework 1.6 and VCLibs 14.0 package files, and the local archive now also contains Runtime 1.6 (`1.6.24903.0`); no Runtime package was available during the failed attempt. |
| Screen Sketch | `10.1805.1191.0` | **Deployment failed; incompatible OS minimum** | Device Portal reported `0x80073CFD`. The ARM manifest requires Windows `10.0.17636.0`, above the phone's `10.0.14393.2551`. SignTool verified the bundle signature on the PC. |

See [Games and package records](#games-and-package-records) for package sources, manifest facts and further notes. Additional untested packages in the local archive are catalogued in [archive.md](archive.md).

## The test device

| Property | Value |
| --- | --- |
| Device | Nokia Lumia 535 |
| Variant | RM-1089 |
| Processor | Qualcomm 8212 |
| RAM | 1 GB |
| Display | 540 × 960 |
| Original OS | Windows Phone 8.1 |
| Current OS | Windows 10 Mobile `10.0.14393.2551` |
| Firmware | `02074.00000.15234.28006` |
| Baseband | `13.55.55.24H_3.35.20.10` |
| Kernel | `2.6.32.21-g6c55ee4` |

These specifications describe the device used for testing. A package targeting ARM or declaring a minimum Windows version does not automatically guarantee that it will install, launch or perform acceptably on this hardware.

## Storage and SD card

The phone has 8 GB internal storage and an SD card. On **2026-11-14** the movable user data was audited and relocated to the card. Packages, app data and the game suite were left alone.

Moved to SD:

| Category | Size | Destination |
| --- | --- | --- |
| Downloads (CMD Injector and Universal Updater archives) | `197,885,566` bytes (~189 MiB) | `D:\Downloads` |
| Pictures (9 files: Camera Roll, Saved Pictures, Screenshots, Sample Pictures) | `25,903,341` bytes (~24.7 MiB) | `D:\Pictures` |
| Documents (86 files, including diagnostic captures and Sound recordings) | `30,821,639` bytes (~29.4 MiB) | `D:\Documents` |

Music and Videos were empty, and temporary files were negligible. Final reported free space is about **0.9 GB internal** and **7.05 GB on SD**. The internal figure fluctuates with the system cache, so it did not rise by the full moved size.

The transfer used the SYSTEM shell exposed by CMD Injector (`telnetd.exe` on TCP 9999): `xcopy /E /I /Y /Q` to the SD card, file-count/size verification, then `del` / `rd` on the internal copies. A reboot cleared the transient cache.

**What cannot be moved:** Windows 10 Mobile 14393 does not move sideloaded XAP or APPX packages to SD on this device. `MinDeployAppX.exe /MoveToVolume` returns `0x80070490` ("Finding the associated package volume failed"); the SD package-volume record is present but stale/offline (`Flags=0`), and `AddPackageVolume` / `RemovePackageVolume` do not repair it. The XAP move path is also reported to fail with `0x80073D0B`. Store apps installed to SD earlier (Bing News) remain there, but new sideloaded games stay on internal storage. App data (~178 MB) is managed by the apps; some apps (Maps, Groove, WhatsApp) have their own SD settings.

New photos, downloads and documents still save to internal storage by default. To send new files to the card, set the save locations in **Settings > System > Storage**.

**Asphalt 7: Heat** was requested but is **not installed**. The XAP is `536,253,160` bytes (511 MiB) and expands to about 753 MB; the deployment peak is about 1.3 GB, while internal free space is about 0.9 GB. Because XAPs cannot be moved to SD, installing it would require removing archived games (for example Zuma's Revenge and Asphalt 5). The suite was left unchanged.

## Getting started

If you want to follow or reproduce the Lumia 535 work, start with the device and deployment notes:

1. Read the [operating system history](#operating-system-history) to understand the phone's starting point and current build.
2. Review [PC setup and deployment](#pc-and-tools) before attempting to deploy anything.
3. Inspect the package type, architecture, manifest, dependencies, signature and provenance.
4. Compare package requirements with the actual phone model and OS build.
5. Test installation, launch and gameplay separately.
6. Record exact errors and observed behavior rather than assuming that a successful deployment means the application works.

The reusable Codex instructions are in [`codex-skill/vintage-phone-collector/SKILL.md`](../../codex-skill/vintage-phone-collector/SKILL.md). The skill defines a cautious, repeatable workflow; this README is the device-specific project record.

---

The restoration log covers the device as found, the upgrade path, the tooling used, and the compatibility results for each tested package.

## Operating system history

### Original Windows Phone 8.1

The documented starting state was:

- OS `8.10.14234.375`
- firmware `02074.00000.15234.28006`
- Lumia Denim

### Offline upgrade to Windows 10 Mobile

The phone reached build `10.0.10586.107`. The archive contains the Windows 10 Mobile Offline Update Project V5.2 package for 10586.107 and the HCTSW WXMSOUP tool; [archive.md](archive.md) records their versions, sizes and SHA-256 hashes. The exact command sequence has not been recovered.

### Unconfirmed intermediate stage

Build `10.0.14293.1066` was offered or discussed during the upgrade process. We do not yet have enough evidence to confirm that it was fully installed or to establish the exact update sequence.

### Current OS

The currently documented build is `10.0.14393.2551` (Anniversary Update generation / 1607). Firmware remains documented as `02074.00000.15234.28006` and should be tracked separately from the OS version.

## PC and tools

The project PC runs Windows and PowerShell 5.1. Windows Phone SDK 8.0 is installed.

### USB XAP deployment

XAP Deployment executable:

```powershell
$deploy = "C:\Program Files (x86)\Microsoft SDKs\Windows Phone\v8.0\Tools\XAP Deployment\XapDeploy.exe"
Start-Process $deploy
```

This method has successfully installed XAP packages: connect the phone over USB, unlock it, select `Device`, choose the package, and deploy. Installation and functionality are confirmed separately on the phone.

Project notes identify the executable as Microsoft-signed, version `11.0.50727.38`. Windows Phone SDK 8.0 was installed from an ISO; the exact ISO provenance and installation steps are not fully documented.

Developer Mode is enabled. Device Portal and pairing were used during earlier setup, but the exact settings and procedure must be recovered from the original log before documenting them as reproducible instructions.

**XapDeploy is for XAP packages.** Do not assume that it can install APPX packages.

### APPX tools found on the PC

As of the check performed on November 7, 2026, these tools were installed in Windows Kits 8.0 but were not available through PATH:

- `C:\Program Files (x86)\Windows Kits\8.0\bin\x64\MakeAppx.exe`
- `C:\Program Files (x86)\Windows Kits\8.0\bin\x64\SignTool.exe`
- `x86` versions are also present in the same `bin` directory
- `tar.exe`, `certutil.exe`, `Get-AuthenticodeSignature`, and the Appx PowerShell cmdlets are available

The Windows Kits 8.0 version of MakeAppx provides `pack` and `unpack`, but no separate `validate` command. An attempt to unpack the Minecraft package produced no files in the temporary directory, so the result is inconclusive. No SDKs were reinstalled and no components were added.

These findings update the earlier note that `signtool.exe` and `MakeAppx.exe` were not available on the PC: both exist in Windows Kits 8.0, but are not in PATH.

## Games and package records

The statuses below are based on behavior observed on the phone, not package metadata alone. The tables in this section preserve the original November 7 provenance notes; some statuses are superseded by the November 13 suite in [GAMES.md](GAMES.md). The local archive inventory is in [archive.md](archive.md).

### Package provenance

| Package | Source recorded in the project | Notes |
| --- | --- | --- |
| Angry Birds `5.0.2.0` | WindowsViet (`file.windowsviet.com`) | Archived XAP package; purchase prompt observed during testing. |
| Angry Birds `1.5.3.0` | Winphone Iz | XAP package; contains an `AppCracked` marker and may be modified. |
| Angry Birds Go! `1.8.7.0` | Archive.org (`angry-birds-go-windows-phone`) | Official Rovio native XAP; SHA-1/SHA-256 verified; installed but not playable because the update service is dead. Removed. |
| Asphalt 5 `1.33.0.0` | WindowsViet (`file.windowsviet.com`) | XAP package; tested and runs. |
| Bad Piggies `1.6.1.0` | Archive.org (`bad-piggies-windows-phone`) | Official Rovio Silverlight XAP; SHA-1 verified; installed and launch-confirmed. |
| Amazing Alex `1.0.7.0` | Archive.org (`amazing-alex-windows-phone`) | Official Rovio Silverlight XAP; SHA-1 verified; installed and launch-confirmed. |
| Candy Crush Saga `1.0.0.1` | WindowsViet (`file.windowsviet.com`) | XAP downloaded to `E:\Projects\Lumia\Candy Crush Saga v1.0.0.1 [WindowsViet].xap`; user identifies it as the original pre-microtransaction build and reports it fully working. Package authenticity has not been independently verified. |
| Cut the Rope `1.7.0.0` | Winphone Iz | XAP package; user confirms it is fully working on the Lumia 535. |
| Cut the Rope 2 `1.0.0.22` | WindowsViet / Archive.org / eipapa | Unencrypted copies are a patched build with stale ZIP CRCs; repaired copy installs but exits after about 4 seconds. Store XAP is PlayReady-encrypted; retail/test WP8.1 APPX fails with `0x803F8001`. Removed. |
| Fruit Ninja `1.0.0.0` | WindowsViet (`file.windowsviet.com`) | XAP package; deployment failed with an optimization input-file error. |
| Fruit Ninja `1.1.0.0` | WindowsViet (`file.windowsviet.com`) | Separate Windows Phone 7.1/XNA XAP candidate; not yet deployed. |
| FIFA 14 `1.0.0.0` | WindowsViet (`file.windowsviet.com`) | XAP package; deployment optimization failed because of an invalid assembly. |
| NFS Hot Pursuit `1.0.0.0` | Winphone Iz | XAP package; user reports successful play and an Xbox achievement. |
| Instagram `10.1096.22713.0` | WindowsViet (`file.windowsviet.com`) | APPXBUNDLE includes ARM package targeting Windows Mobile; user reports it installs, launches, and reaches the sign-in page, but is outdated. Manifest declares Microsoft.VCLibs.140.00. Signature validity not checked. |
| Free Player for YouTube `1.1.23.0` | WindowsViet (`file.windowsviet.com`) | APPXBUNDLE includes ARM package targeting Windows.Universal; requires .NET Native 1.7, Microsoft.Advertising.Xaml, and Microsoft.VCLibs.140.00. It installed, but the user reports it was nonfunctional and has since uninstalled it. Package signature validity not checked. |
| MSN Weather `4.26.12153.0` | WindowsViet (`file.windowsviet.com`) | APPXBUNDLE identity `Microsoft.BingWeather`; ARM package targets Windows.Universal with minimum `10.0.14393.0`; requires .NET Native 1.6 Framework and Runtime, Microsoft.Advertising.Xaml, and Microsoft.VCLibs.140.00. User confirms MSN Weather works and displays correct current data, so the API is active. A separate Device Portal deployment attempt failed with `0x80073CF3`; SignTool verified the bundle signature on the PC. |
| Windows Camera candidate `2018.426.70.0` | WindowsViet (`file.windowsviet.com`) | APPXBUNDLE identity `Microsoft.WindowsCamera`; ARM package requires Windows `10.0.15063.0` (phone build is `10.0.14393.2551`) and .NET Native 1.7 Framework/Runtime plus Microsoft.VCLibs.140.00. Device Portal reported `0x80073CFD`. SignTool could not validate the certificate chain on the PC because it terminates at an untrusted root. No package authenticity claim is made. User separately confirms a Camera update is correct and fully working; its exact version is not recorded. |
| Microsoft People `10.2.2351.0` | WindowsViet (`file.windowsviet.com`) | APPXBUNDLE identity `Microsoft.People`; ARM package targets Windows Mobile, minimum `10.0.14393.0`; requires Microsoft.VCLibs.140.00 >= `14.0.24123.0` and Microsoft.NET.Native.Framework/Runtime 1.6 >= `1.6.24903.0`. Device Portal reported `0x80073CFF` (sideload/developer-license policy failure). SignTool could not validate the bundle's certificate chain on the PC because it terminates at an untrusted root. Local files include Framework 1.6 and VCLibs 14.0; no Runtime 1.6 package was found in searched folders. Local presence does not establish that a dependency is installed on the phone. |
| Screen Sketch `10.1805.1191.0` | WindowsViet (`file.windowsviet.com`) | APPXBUNDLE identity `Microsoft.ScreenSketch`; ARM package targets Windows.Universal, minimum and max tested `10.0.17636.0`; requires Microsoft.VCLibs.140.00 >= `14.0.25426.0`. Device Portal reported `0x80073CFD`; SignTool verified the bundle signature on the PC. The package OS minimum exceeds the phone build. |
| Temple Run `1.5.3.0` | Winphone Iz | XAP package; most recent report is a startup crash after one successful launch. |
| Minecraft `1.5.300.0` | WindowsViet (`file.windowsviet.com`) | APPX package; signature and provenance of the local file have not been fully validated. |

The source names above are provenance notes, not endorsements or proof that the local packages are authentic. Exact original download URLs should be added only after verification.

### Details from available XAP manifests

| Game | Platform / runtime | Publisher and manifest identifier | Recorded size |
| --- | --- | --- | --- |
| Angry Birds Classic `5.0.2.0` | Windows Phone 8.0 / Modern Native | Rovio Entertainment Ltd; executable `AngryBirdsClassic.exe` | Not recorded in the original notes. |
| Angry Birds Classic `1.5.3.0` | Windows Phone 7.0 / XNA | Microsoft Game Studios; product ID `{e4571a02-0b87-e011-986b-78e7d1fa76f8}` | `21,053,919` bytes |
| Asphalt 5 `1.33.0.0` | Windows Phone 7.1 / XNA | GAMELOFT SA; product ID `{97e360f9-f018-4c39-ae54-139590c9b048}` | `115,669,153` bytes |
| Bad Piggies `1.6.1.0` | Windows Phone 8.0 / Silverlight | Rovio Entertainment Ltd; product ID `{9ccfb504-1e48-4fc4-ba6d-8f0d2400a8f5}` | `34,363,149` bytes |
| Amazing Alex `1.0.7.0` | Windows Phone 7.0 / Silverlight | Rovio Entertainment Ltd; product ID `{fac2552c-25bb-420c-b0b5-bb3059418933}` | `21,298,962` bytes |
| Temple Run `1.5.3.0` | Windows Phone 8.0 / Silverlight; package includes Unity components | Imangi Studios, LLC; product ID `{1a7cb5f8-792a-4992-b07a-83874c0795ae}` | `23,401,108` bytes |
| Candy Crush Saga `1.0.0.1` | Windows Phone 7.1 / XNA | Author `king.com`; manifest publisher `XiaomiCandy`; product ID `{dee79c09-37b8-4143-8d2f-4faabc74b378}` | `16,282,183` bytes |
| Cut the Rope `1.7.0.0` | Windows Phone 7.1 / Silverlight; XNA library present | Zeptolab UK Ltd; product ID `{4c0cf9f4-31f0-444e-9321-0237d04f6a38}` | `39,367,460` bytes |
| Fruit Ninja `1.0.0.0` | Windows Phone 8.0 / Silverlight | Halfbrick Studios Pty Ltd; product ID `{1928d4d7-68c9-4170-b284-a264fde14f1f}` | `34,992,369` bytes |
| Fruit Ninja `1.1.0.0` | Windows Phone 7.1 / XNA | Microsoft Studios™; product ID `{7826ea3a-a287-413b-9338-0f708ba27963}` | `25,881,919` bytes |
| FIFA 14 `1.0.0.0` | Windows Phone 8.0 / Silverlight | Electronic Arts; product ID `{0ed6989b-5cb9-4b70-a58b-536c0dce36b2}` | `947,461,289` bytes |
| NFS Hot Pursuit `1.0.0.0` | Windows Phone 7.1 / XNA | Electronic Arts; product ID `{c2845c3c-102b-4c63-980f-3acc0b058f42}` | `118,472,721` bytes |

### APPXBUNDLE candidates

| App | Version / identity | Target and architecture | Dependencies |
| --- | --- | --- | --- |
| Instagram | `10.1096.22713.0`; `Facebook.InstagramBeta` | Windows Mobile, min `10.0.10240.0`, ARM, max tested `10.0.14393.0` | `Microsoft.VCLibs.140.00` >= `14.0.22929.0` |
| Free Player for YouTube | `1.1.23.0`; `29730Infoside.YTubeforYoutube-FreeVideoPlayerforYo` | Windows Universal, min `10.0.10586.0`, ARM included, max tested `10.0.14393.0` | `Microsoft.NET.Native.Framework.1.7` and Runtime >= `1.7.25531.0`; `Microsoft.Advertising.Xaml` >= `10.1703.1.0`; `Microsoft.VCLibs.140.00` >= `14.0.25426.0` |
| Microsoft People | `10.2.2351.0`; `Microsoft.People` | ARM; Windows Mobile min `10.0.14393.0`, max tested `10.0.16241.0` | `Microsoft.VCLibs.140.00` >= `14.0.24123.0`; .NET Native Framework and Runtime 1.6 >= `1.6.24903.0` |
| Screen Sketch | `10.1805.1191.0`; `Microsoft.ScreenSketch` | ARM; Windows Universal min/max tested `10.0.17636.0` | `Microsoft.VCLibs.140.00` >= `14.0.25426.0` |

Both APPXBUNDLE files contain `AppxSignature.p7x` entries, but the signatures and package-content binding have not been validated. Instagram has since been installed and launched according to the user, reaching its sign-in page despite being outdated. The earlier inventory did not show `Microsoft.VCLibs.140.00`; how Windows resolved that dependency has not been determined. Successful sign-in and other online features remain unconfirmed. Free Player for YouTube installed, but the user reports it was nonfunctional and has since uninstalled it. XapDeploy handles XAP files, not APPXBUNDLE files.

### Recent deployment result

Fruit Ninja was selected in Windows Phone SDK 8.0 XAP Deployment for device deployment. The tool reported:

```text
Error - Deployment Optimization failed with error
"Unable to read input file." Please ensure that input
XAP is not optimized for device already.
```

The XAP opens as a ZIP archive and its Windows Phone manifest was readable on the PC. The same error was reported again in a later attempt; the screenshot still shows the `Fruit Ninja v1.0.0.0` file selected. This deployment-stage message does not prove whether the package is already device-optimized, malformed for this tool, or affected by another issue. No installation was confirmed. A separate Fruit Ninja `1.1.0.0` Windows Phone 7.1/XNA package was later installed and launch-confirmed; see [GAMES.md](GAMES.md).

FIFA 14 was then selected in the same deployment tool. It reported:

```text
Error - Deployment optimization failed due to an
invalid assembly. Rebuild your source projects and try
again.
```

The message points to an assembly problem during optimization, but does not identify which assembly or establish whether the XAP itself is damaged. The available archive is a packaged XAP; no source project is available to rebuild. No installation was confirmed.

The Temple Run archive includes `UnityPlayer.dll`, `UnityEngine.dll`, `Assembly-CSharp.dll`, `UnityEngineProxy.dll`, and `WinRTBridge.dll`. Their presence alone does not explain the current crash.

Local paths and exact file sizes may differ between computers. In the current session, Windows Phone packages are in `C:\Users\vaida\Downloads`, while the Minecraft APPX was found in `E:\Projects\Lumia`. Do not assume these paths apply to other checkouts.

## Minecraft 1.5.300.0 — APPX investigation

### Inspected file

- Name: `Minecraft for Windows 10 Mobile v1.5.300.0 [file.windowsviet.com].appx`
- Location found in the current session: `E:\Projects\Lumia\Minecraft for Windows 10 Mobile v1.5.300.0 [file.windowsviet.com].appx`
- Size: `66,531,493` bytes
- Local SHA-256: `5C4467E6C9B44606BDD9909892B00F1FE6B1731132CB71798A0DF8E59EE0C1EE`
- Status: not installed and not modified

A hash identifies the local file. Without a reference hash from a trusted source, it does not establish authenticity.

### Manifest

| Property | Declared value |
| --- | --- |
| Name | `Microsoft.Minecraft` |
| Version | `1.5.300.0` |
| Architecture | `arm` |
| Publisher | `CN=Microsoft Corporation, O=Microsoft Corporation, L=Redmond, S=Washington, C=US` |
| TargetDeviceFamily | `Windows.Universal` |
| MinVersion | `10.0.10240.0` |
| MaxVersionTested | `10.0.16299.0` |
| Executable / EntryPoint | `Minecraft.Windows.exe` / `Minecraft_Win10.App` |

Declared dependencies:

- `Microsoft.Services.Store.Engagement`, minimum `10.0.1610.0`
- `Microsoft.VCLibs.140.00`, minimum `14.0.25426.0`

### Device Portal deployment attempt

The package was selected in Device Portal and deployment was attempted. No dependency package was selected. Device Portal reported:

```text
Failure reason: Failed to start deployment
Failure text: Package failed updates, dependency or conflict validation. (0x80073cf3)
```

The accompanying installed-package export contained 144 entries and showed no package family/full name for `Microsoft.VCLibs.140.00`, `Microsoft.Services.Store.Engagement`, or `Microsoft.Minecraft`. It did show `Microsoft.WindowsStore` and `Microsoft.StorePurchaseApp`; those are different packages and do not satisfy the two manifest dependencies. This suggests that the declared framework dependencies are missing from the phone, although the deployment log is needed to confirm the exact cause.

A subsequent read-only GET to Device Portal's `/api/app/packagemanager/state` returned `Code: -2147009293` (`0x80073CF3`), `Reason: Failed to start deployment`, and `Success: false`. The response contains no additional inner error or dependency name. At the time of the attempt, a search of the existing Windows Kits 8.0/10 and Microsoft SDK folders found no ARM APPX for either declared dependency, and the known Downloads and project folders had no matches either. The local archive now contains both dependency packages at compatible versions; see [archive.md](archive.md). This makes a retry technically possible, but the supported sideloading path still has to be confirmed first.

The package declares ARM architecture, matching the phone's ARM platform, and a minimum OS version below the phone's build. These matches do not rule out an unresolved dependency or package conflict. Microsoft lists a missing dependency, package conflict, or unsupported processor architecture as possible causes of `0x80073CF3`.

Minecraft does not appear in the installed-package export, consistent with the failed attempt leaving it uninstalled. No package or dependency was removed or changed.

The manifest also contains build metadata `OperatingSystem 10.0.14393.0` and `WindowsMobile 10.0.16299.0`. The phone's `14393.2551` build is above `MinVersion`, and the declared architecture is ARM. These facts make the package eligible for investigation, but **do not prove actual compatibility** with the Lumia 535 or establish that the game will launch on the current build.

The presence of `AppxBlockMap.xml`, `[Content_Types].xml`, and `AppxSignature.p7x` in the archive only shows that these files are present; it does not prove that the signature or package integrity has been validated.

### Signature — local results

1. The archive could be listed without installation; the manifest and relevant entries were read directly from the ZIP.
2. `AppxSignature.p7x` begins with the `PKCX` header. Passing the entire file directly to SignTool failed with ASN.1 error `0x8009310B`, so that attempt did not establish signature validity.
3. After removing the four `PKCX` bytes in a temporary copy, SignTool parsed the PKCS#7 certificate. It displayed the subject `Microsoft Corporation`, issuer `Microsoft Marketplace CA G 007`, and a timestamp of July 28, 2018.
4. SignTool did not validate the trust chain. It reported `CERT_TRUST_REVOCATION_STATUS_UNKNOWN`, `CERT_TRUST_IS_OFFLINE_REVOCATION`, `CERT_TRUST_IS_PARTIAL_CHAIN`, and `CERT_TRUST_IS_NOT_TIME_VALID`.

Limited conclusion: **the signature can be parsed after decoding the header, but local trust validation failed**. We do not declare the package authentic or valid. We have not independently confirmed that the signature binds to the exact contents of the complete APPX, and we do not have a trusted reference hash for comparison.

### Installation and compatibility — knowns and unknowns

Microsoft's Windows 10 documentation says build 14393 introduced App Installer support for `.appx` and `.appxbundle`; the same page says `.appinstaller` files are not supported on that build. This is Windows 10 documentation and does not by itself confirm which sideloading interface is available on this Windows 10 Mobile phone.

Microsoft describes sideloading as installing a package signed by a certificate the device trusts. XapDeploy does not install this APPX package. The exact safe APPX installation method for this Lumia, including the supported Device Portal workflow and dependency handling, must be confirmed before any attempt.

The package export does not list either declared dependency. We have not sourced or installed replacement packages. We will not install the game, dependencies, or certificates, or change settings, without discussing it first.

## Working rules for this device

This restoration does not involve bootloader unlocking, rooting, custom ROM installation or firmware replacement. Existing working applications are preserved, and read-only inspection is preferred before any installation or device modification.

1. Work incrementally; explain each command or operation and its expected result beforehand.
2. Prioritize files and tools already available; do not reinstall SDKs without a concrete requirement.
3. Do not modify the OS, bootloader, firmware, or partitions.
4. Do not remove games already installed; preserve the working state.
5. Inspect package type, architecture, runtime, manifest, dependencies, and provenance before deployment.
6. A declared publisher and the presence of a signature file are not enough to claim authenticity.
7. Track installation, launch, and gameplay as separate results; call a game functional only after it launches and can be played.
8. Record exact errors, instability, and purchase, account, network, or service limitations.
9. Do not redistribute copyrighted game packages unless the applicable rights have been established.

## Unknowns and next steps

- Capture menus and one gameplay action for the launch-confirmed titles; the only frame
  evidence so far is the Bejeweled main menu.
- Nine HTC-list titles remain uninstalled: Abduction! World Attack, Bonsai Blast, Glow
  Hockey, Glow Hockey 2, Logo Quiz Ultimate, Paper Toss, Peggle, Robo Defense FREE and
  Skater Boy. No usable Windows Phone package was found for them.
- Get the AppXDeployment-Server error for Talking Tom `3.1.0.0`; Device Portal returns
  only `Unavailable` (`-2143322111`). My Talking Tom `1.2.0.0` launches, but the original
  Talking Tom APPX is still unverified.
- Re-test Temple Run stability; the latest pass confirmed a process, not gameplay.
- Re-check the patched/repacked builds: Zuma's Revenge (manifest-patched), Where's My
  Water? (uploader repack, title corrected) and Mou (Pou clone).
- Minecraft: no working build found. `1.5.201.0` was removed after start returned
  `Unavailable`, and the WP8.1 `0.14.0.1` APPX was rejected with “Package could not be
  registered”.
- Cut the Rope 2: the clean WP8 XAP is currently unavailable. The 4PDA attachment no
  longer downloads, the unencrypted copies found are a broken patched build, the Store
  XAP is PlayReady-encrypted, and the retail APPX cannot run without a Store
  entitlement. Treat the WP8 build as lost media unless a private copy surfaces.
- Angry Birds Go! 1.8.7.0: not playable. The Rovio update service is gone; the XAP is
  preserved locally but removed from the phone.
- Asphalt 7: Heat is not installed. The official WP8 XAP needs about 1.3 GB at peak;
  internal free space is about 0.9 GB, and XAPs cannot be moved to SD on this build.
  Installing it would require removing archived games. See
  [Storage and SD card](#storage-and-sd-card).
- Storage: Downloads, Pictures and Documents were moved to SD on 2026-11-14; new files
  still default to internal storage until the save locations are changed in
  Settings > System > Storage.
- Bad Piggies and Amazing Alex are installed and launch-confirmed; capture a
  menu/gameplay frame and exercise one level in each.
- Recover the exact Windows 10 Mobile upgrade sequence and OUP details.
- Recover verified original URLs and reference hashes for the packages and procedures.

## Sources

External sources support the claims noted below. Third-party archives are evidence that a package is listed as available, not proof that a local file is authentic.

- [Microsoft Learn — Sideload line-of-business apps](https://learn.microsoft.com/en-us/windows/application-management/sideload-apps-in-windows): sideloading concepts, signed packages, and trusted certificates.
- [Microsoft Learn — Troubleshoot installation issues with App Installer](https://learn.microsoft.com/en-us/windows/msix/app-installer/troubleshoot-appinstaller-issues): installation methods by build; build 14393 and `.appx` / `.appxbundle`.
- [Microsoft Learn — Troubleshooting packaging, deployment, and query of Windows apps](https://learn.microsoft.com/en-us/windows/win32/appxpkg/troubleshooting): `0x80073CF3` causes and the AppXDeployment-Server event log.
- [Microsoft Learn — Windows Device Portal core REST API](https://learn.microsoft.com/en-us/windows/uwp/debug-test-perf/device-portal-api-core): package deployment and state endpoints for Windows Mobile.
- [Microsoft Learn — Sign an MSIX package](https://learn.microsoft.com/en-us/windows/msix/package/signing-package-overview): signatures, certificates, timestamps, and package-content validation through the block map and signature.
- [Microsoft Devices Blog — Minecraft: Pocket Edition now on Windows Phone](https://blogs.windows.com/devices/2014/12/10/minecraft-pocket-edition-now-windows-phone/): Windows Phone 8.1 release announcement and listed phones, including Lumia 535; it does not prove compatibility of this UWP APPX.
- [WindowsViet — Minecraft: Pocket Edition](https://file.windowsviet.com/minecraft-pocket-edition/): archive page listing version 1.5.300.0; not an independent validation of the local package.
- [PocketPC Software Archive — Windows 10 Mobile Apps](https://files.pocketpc-archive.com/Windows%2010%20Mobile%20Apps/): third-party archive listing Minecraft 1.5.300.0; not signature or provenance validation.

Record the source and date consulted for each new fact. Label forum reports and unofficial archives as such; do not present them as Microsoft-confirmed facts.

