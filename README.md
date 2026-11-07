# Vintage Phone Collector — Lumia 535 Restoration

A hands-on mobile technology preservation project: collecting, restoring and documenting vintage phones, legacy operating systems, and the applications and games that made them memorable.

This repository currently documents one detailed restoration: a **Nokia Lumia 535 RM-1089**, upgraded from Windows Phone 8.1 to Windows 10 Mobile and used to test classic Windows Phone and Windows 10 Mobile software on original hardware.

The idea is not simply to make an old phone turn on. It is to recover as much of its original software experience as possible, understand what still works, and publish reproducible notes so other collectors can learn from the process.

> **Preserve the original experience wherever possible. Restore what can be restored. Document what cannot.**

## What this project is about

Vintage Phone Collector sits at the intersection of hardware collecting and software preservation:

- **Hardware restoration:** identifying devices, understanding their original configuration, and keeping functional examples alive.
- **Operating system preservation:** working with original or historically appropriate mobile operating systems, firmware and update paths.
- **Application preservation:** finding archived packages, inspecting manifests and dependencies, and testing applications on real devices.
- **Classic mobile gaming:** recovering the period versions of games rather than substituting modern remakes.
- **Open documentation:** publishing procedures, package metadata, hashes, compatibility results, limitations and sources.

The wider collection includes devices from the feature-phone and early-smartphone eras, including HTC, Nokia Lumia, iPhone, Samsung, Vodafone and Huawei models. This repository begins with the Lumia 535; additional device-specific restoration logs can be added as the collection develops.

## Current project status

Last updated: November 7, 2026.

| Component | Current status |
| --- | --- |
| Device | Nokia Lumia 535 RM-1089 |
| Original OS | Windows Phone 8.1 |
| Current OS | Windows 10 Mobile `10.0.14393.2551` |
| Firmware | `02074.00000.15234.28006` |
| Developer Mode | Enabled |
| USB XAP deployment | Working with Microsoft Windows Phone SDK 8.0 |
| Classic XAP games | Several packages installed and tested |
| Minecraft APPX | Device Portal install attempted; failed with `0x80073CF3`; not installed |
| System modifications | No bootloader unlock, custom ROM, root or firmware replacement |

### Games tested on the Lumia 535

These statuses describe observed behavior on this particular phone. They are not universal compatibility guarantees.

| Game | Version | Result | Notes |
| --- | --- | --- | --- |
| Angry Birds Classic | `5.0.2.0` | **Partially functional** | Launches, but progression is blocked by a full-version purchase prompt. |
| Angry Birds Classic | `1.5.3.0` | **Functional** | The traditional XNA version launches and is playable. Preferred version in this collection. Its archive contains an `AppCracked` marker, so original distribution has not been independently verified. |
| Asphalt 5 | `1.33.0.0` | **Functional** | Installed and runs. The experience reflects an old game running on limited hardware. |
| Temple Run | `1.5.3.0` | **Unstable** | Launched once; subsequent attempts close during startup. Not classified as functional. |
| Minecraft | `1.5.300.0` | **Under investigation** | ARM APPX manifest and package structure inspected on the PC. Not installed or tested on the phone. |
| Jetpack Joyride | Unknown | **Not obtained / untested** | No verified package in the project yet. |
| Subway Surfers | Unknown | **Planned / untested** | No package installed or tested yet. |
| Fruit Ninja | Unknown | **Planned / untested** | No package installed or tested yet. |

See [Games and package records](#games-and-package-records) for package sources, manifest facts and further notes.

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

These specifications describe the device used for testing. A package targeting ARM or declaring a minimum Windows version does not automatically guarantee that it will install, launch or perform acceptably on this hardware.

## Project principles

1. **Preserve before replacing.** Original hardware and software have historical value.
2. **Understand before modifying.** Identify the device, firmware, OS, package type and dependencies before changing anything.
3. **Prefer authentic experiences.** A period-correct application is preferable to a modern substitute when the goal is preservation.
4. **Keep working installations safe.** Avoid unnecessary OS, firmware, bootloader or partition modifications.
5. **Test on real hardware.** Manifest inspection and emulation are useful, but they do not replace on-device testing.
6. **Document failures as well as successes.** An installation error or a game that launches only once is useful compatibility information.
7. **Preserve provenance.** Record where packages came from and whether their authenticity is known.
8. **Share reproducible knowledge.** Keep procedures and findings useful to other device owners.

This project does not involve bootloader unlocking, rooting, custom ROM installation or firmware replacement. Existing working applications are preserved. Read-only inspection is preferred before any installation or device modification.

## Getting started

If you want to follow or reproduce the Lumia 535 work, start with the device and deployment notes:

1. Read the [operating system history](#operating-system-history) to understand the phone's starting point and current build.
2. Review [PC setup and deployment](#pc-and-tools) before attempting to deploy anything.
3. Inspect the package type, architecture, manifest, dependencies, signature and provenance.
4. Compare package requirements with the actual phone model and OS build.
5. Test installation, launch and gameplay separately.
6. Record exact errors and observed behavior rather than assuming that a successful deployment means the application works.

The reusable Codex instructions are in [`codex-skill/vintage-phone-collector/SKILL.md`](codex-skill/vintage-phone-collector/SKILL.md). The skill defines a cautious, repeatable workflow; this README is the device-specific project record.

---

## Device restoration log

## Operating system history

### Original Windows Phone 8.1

The documented starting state was:

- OS `8.10.14234.375`
- firmware `02074.00000.15234.28006`
- Lumia Denim

### Offline upgrade to Windows 10 Mobile

The phone reached build `10.0.10586.107` using an offline OUP procedure. The exact utility name, package version, and complete command log have not yet been recovered.

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

The statuses below are based on behavior observed on the phone, not package metadata alone.

### Package provenance

| Package | Source recorded in the project | Notes |
| --- | --- | --- |
| Angry Birds `5.0.2.0` | WindowsViet (`file.windowsviet.com`) | Archived XAP package; purchase prompt observed during testing. |
| Angry Birds `1.5.3.0` | Winphone Iz | XAP package; contains an `AppCracked` marker and may be modified. |
| Asphalt 5 `1.33.0.0` | WindowsViet (`file.windowsviet.com`) | XAP package; tested and runs. |
| Temple Run `1.5.3.0` | Winphone Iz | XAP package; most recent report is a startup crash after one successful launch. |
| Minecraft `1.5.300.0` | WindowsViet (`file.windowsviet.com`) | APPX package; signature and provenance of the local file have not been fully validated. |

The source names above are provenance notes, not endorsements or proof that the local packages are authentic. Exact original download URLs should be added only after verification.

### Details from available XAP manifests

| Game | Platform / runtime | Publisher and manifest identifier | Recorded size |
| --- | --- | --- | --- |
| Angry Birds Classic `5.0.2.0` | Windows Phone 8.0 / Modern Native | Rovio Entertainment Ltd; executable `AngryBirdsClassic.exe` | Not recorded in the original notes. |
| Angry Birds Classic `1.5.3.0` | Windows Phone 7.0 / XNA | Microsoft Game Studios; product ID `{e4571a02-0b87-e011-986b-78e7d1fa76f8}` | `21,053,919` bytes |
| Asphalt 5 `1.33.0.0` | Windows Phone 7.1 / XNA | GAMELOFT SA; product ID `{97e360f9-f018-4c39-ae54-139590c9b048}` | `115,669,153` bytes |
| Temple Run `1.5.3.0` | Windows Phone 8.0 / Silverlight; package includes Unity components | Imangi Studios, LLC; product ID `{1a7cb5f8-792a-4992-b07a-83874c0795ae}` | `23,401,108` bytes |

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

The required dependency versions have not yet been checked on the phone. We will not install the package, dependencies, or certificates, or change settings, without discussing it first.

## Other restoration targets

The wider Vintage Phone Collector project is not limited to this Lumia. Other devices in the collection or under consideration include:

- HTC Wildfire and HTC Desire
- Nokia Lumia devices
- Apple iPhone 6 and iPhone 6S
- Samsung Corby
- Vodafone Smart 858
- Huawei P8 Lite and other early Android devices

Each device should receive its own notes covering its identity, original software, restoration state, application compatibility and known limitations. Do not assume that procedures for the Lumia 535 apply to another model.

## Rules for continuing the project

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

- Retrieve the last deployment result from Device Portal (`/api/app/packagemanager/state`) and, if needed, the AppXDeployment-Server event details to identify the exact failing dependency or conflict.
- Find verified ARM packages for the missing dependencies, then inspect their versions and signatures before discussing an installation attempt.
- Verify the complete APPX integrity, including block map validation and the signature's binding to the package.
- Find an independent reference hash for this exact APPX and check whether it matches.
- Confirm the APPX sideloading method supported on Windows 10 Mobile 14393 before using it.
- Research Minecraft 1.5.300 ARM compatibility with the Lumia 535; the result remains unknown until tested on the phone.
- Reproduce the Temple Run crash after relaunch and after a device restart; do not reclassify it as functional based on the single successful launch.
- Recover the exact Windows 10 Mobile upgrade sequence and OUP details.
- Recover verified original URLs for the packages and procedures.
- Find and test packages for Jetpack Joyride, Subway Surfers, and Fruit Ninja.
- Add separate restoration logs for other devices as their work begins.

## Sources

External sources support the claims noted below. Third-party archives are evidence that a package is listed as available, not proof that a local file is authentic.

- [Microsoft Learn — Sideload line-of-business apps](https://learn.microsoft.com/en-us/windows/application-management/sideload-apps-in-windows): sideloading concepts, signed packages, and trusted certificates.
- [Microsoft Learn — Troubleshoot installation issues with App Installer](https://learn.microsoft.com/en-us/windows/msix/app-installer/troubleshoot-appinstaller-issues): installation methods by build; build 14393 and `.appx` / `.appxbundle`.
- [Microsoft Learn — Troubleshooting packaging, deployment, and query of Windows apps](https://learn.microsoft.com/en-us/windows/win32/appxpkg/troubleshooting): `0x80073CF3` causes and the AppXDeployment-Server event log.
- [Microsoft Learn — Sign an MSIX package](https://learn.microsoft.com/en-us/windows/msix/package/signing-package-overview): signatures, certificates, timestamps, and package-content validation through the block map and signature.
- [Microsoft Devices Blog — Minecraft: Pocket Edition now on Windows Phone](https://blogs.windows.com/devices/2014/12/10/minecraft-pocket-edition-now-windows-phone/): Windows Phone 8.1 release announcement and listed phones, including Lumia 535; it does not prove compatibility of this UWP APPX.
- [WindowsViet — Minecraft: Pocket Edition](https://file.windowsviet.com/minecraft-pocket-edition/): archive page listing version 1.5.300.0; not an independent validation of the local package.
- [PocketPC Software Archive — Windows 10 Mobile Apps](https://files.pocketpc-archive.com/Windows%2010%20Mobile%20Apps/): third-party archive listing Minecraft 1.5.300.0; not signature or provenance validation.

Record the source and date consulted for each new fact. Label forum reports and unofficial archives as such; do not present them as Microsoft-confirmed facts.
