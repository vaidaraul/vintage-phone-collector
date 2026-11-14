# Lumia 535 local archive and provenance

**Status:** local reference archive; binaries are not committed  
**Last checked:** 2026-11-14

The current game-suite status, package IDs, hashes and launch evidence are in
[GAMES.md](GAMES.md). This page records the local archive contents and provenance.

The working archive is kept outside the repository at `E:\Projects\Lumia` and is about 4.4 GB. It contains SDK installers, the offline update package, reference documents, dependency packages and application packages. Binaries stay out of Git: most are Microsoft or third-party copyrighted material, several are very large, and the project's publication rules exclude redistributing them. This page records what exists, where it came from, and how to identify a local copy.

## Offline update material

| Item | Size (bytes) | SHA-256 | Provenance |
| --- | ---: | --- | --- |
| `w10m_oup-spkg_10586.107.zip` | 972,971 | `a885c49e9996fe3b20b5d66a72eb90fad7b9db4eb24e4272a59ac8814803aa5d` | Windows 10 Mobile Offline Update Project V5.2 package for build 10586.107; [HikariCalyx/w10m_oup](https://github.com/HikariCalyx/w10m_oup) (branch `spkg_10586.107`). Its README lists the Lumia 535 as supported and points to the XDA usage guide. |
| `HCTSW_WXMSOUP_V5.3beta6.update.lzma2.7z` | 5,877,562 | `671426428de552a1d7be86410b15f4ae2e457259773ddf749099c22cf5e9ad6b` | HCTSW WXMSOUP V5.3 beta 6 update payload. Provenance and licensing have not been independently verified. |
| `wpsdkv80_enu1.iso` | 1,721,982,976 | `a33244ddd3dcfc731763f23159d36a77c96a870cea03f0fd88f9ab52d397ce8a` | Windows Phone SDK 8.0 English ISO. Provides XapDeploy; the original ISO source was not recorded. |
| `WP8.1 SDK Tools Lite Setup Av1.00.zip` | 98,721,222 | `d46b04ea6bdc643c20a33392d709eb1e291c71dfece1d5f7b98b1452f7d4057f` | Lite SDK tools installer. Source not recorded. |
| `WPexpress_full.exe` | 1,078,912 | `1c4b9b2d7a1a7b30f9fe9275faed9f82e470022a378a252fb279db63567ddb38` | Windows Phone Express installer. Source not recorded. |
| `Windows Phone 8 Release Notes.htm` | 31,339 | `5b63b072a1d73d30f636cc3d2704ac45716359a5400266164c9bf170dd54dc7e` | Microsoft release notes, kept as a local reference. Not committed. |
| `How to officially upgrade to Windows 10 Mobile.pdf` | 1,805,706 | `a057b73d95131b5ef36b23d2b78d9fccba9c8eadf169d8bd04205190f5859ae2` | Third-party guide by Lasitha Samarasinghe, created 2025-01-22, linking to `t.me/Windows10Phone`. Not committed; licensing unclear. |

The extracted `w10m_oup-spkg_10586.107` directory also contains 436 CAB packages, the `repo/` package list, enterprise provisioning files, and the `Nokia_NDTKSVC` packages. Those are update payloads, not repository material.

## Dependency packages

These are the small framework packages used by the APPX/APPXBUNDLE candidates. The filenames and versions were read from the package manifests where the filename does not include a version.

| Package | Version | Size (bytes) | SHA-256 |
| --- | --- | ---: | --- |
| `Microsoft.Advertising.Xaml_10.1808.3.0.Appx` | 10.1808.3.0 | 1,691,620 | `02f676523a6602fcbdc6349e287c5382ee7bd058c7801212b210c93176a8f575` |
| `Microsoft.Advertising.Xaml_10.1811.1.0.Appx` | 10.1811.1.0 | 1,724,168 | `705e34761e4d263581d6548498270a10b667cfc764acde00ec9b92c5ae771909` |
| `Microsoft.NET.Native.Framework.1.6_1.6.24903.0.Appx` | 1.6.24903.0 | 2,831,849 | `3e70dbf5a3ec961c7cf4509bf5b0b024787a0545d47f27bc93b15c584ac6b920` |
| `Microsoft.NET.Native.Framework.1.7.appx` | 1.7.27413.0 | 2,830,576 | `16fe2bdb38647361844a6d0538444414920f7cbfffcea2993beb3886307ed82a` |
| `Microsoft.NET.Native.Runtime.1.6_1.6.24903.0.Appx` | 1.6.24903.0 | 217,775 | `abb5e584a2dcbeb795c18a0672f4ffd73450fe5dfaf9574cccd3a7634ad92182` |
| `Microsoft.NET.Native.Runtime.1.7.appx` | 1.7.25531.0 | 217,725 | `a4327bb0e6765921cd815111312e7fdf006587c48fb91e36b4b7d2e5bbbebe91` |
| `Microsoft.NET.Native.Runtime.1.7_1.7.27422.0.Appx` | 1.7.27422.0 | 216,789 | `07320d590af4511be4999d829110c11dd742beba6c2f0a063555a45a1088ce8f` |
| `Microsoft.Services.Store.Engagement_10.0.19011.0.Appx` | 10.0.19011.0 | 257,774 | `baf178d63460623ae463e153fa14cabe50d249836edfacd69343c3fbf13ebde0` |
| `Microsoft.VCLibs.140.00_14.0.25426.0.Appx` | 14.0.25426.0 | 681,781 | `b14f8515ad14b2990fada02efed11610d216c03fed43806caf1a6754b924d1f9` |
| `Microsoft.VCLibs.140.00_14.0.27323.0.Appx` | 14.0.27323.0 | 766,480 | `b0f372ecef8a8962867232acbdeff81c05a620675ed3817b758cff1607b6de41` |
| `Microsoft.VCLibs.120.00.Phone_12.0.30113.0_arm__8wekyb3d8bbwe.Appx` | 12.0.30113.0 | 645,282 | `a9472ec802c64baf17161d8e611548df78fd29b8a758bb2e223979110452c892` |

`Microsoft.Services.Store.winmd` (5,120 bytes) is also present; it is a metadata helper, not an installable framework package.

These packages close three previously recorded gaps:

- **Minecraft** declares `Microsoft.Services.Store.Engagement` >= 10.0.1610.0 and `Microsoft.VCLibs.140.00` >= 14.0.25426.0. Both are available locally at compatible versions.
- **Microsoft People** declares .NET Native Framework and Runtime 1.6 >= 1.6.24903.0 and VCLibs >= 14.0.24123.0. Both are available locally.
- **Talking Tom 3.1.0.0** declares `Microsoft.VCLibs.120.00.Phone` >= 12.0.30113.0. The dependency is available locally and was installed on the phone; the APPX still starts with `Unavailable`.

Local availability does not prove those packages are absent from the phone, nor that sideloading will succeed. Device Portal deployment is working for APPX packages on this phone: Minecraft `1.5.201.0` and Talking Tom `3.1.0.0` install, but both return `Unavailable` when started. Dependency availability does not guarantee launch.

## Application packages

The `apk` directory uses the historical folder name; these are Windows Phone packages, not Android APKs. Status refers to testing on this phone, not to package validity. Packages not listed in the device log are marked untested.

| Package | Type | Size (bytes) | Status on this phone |
| --- | --- | ---: | --- |
| `Angry Birds v1.5.3.0.0 [Winphone Iz].xap` | XAP | 21,053,919 | Functional; preferred version. Contains an `AppCracked` marker. |
| `Angry Birds v5.0.2.0 [file.windowsviet.com].xap` | XAP | 32,943,252 | Removed; trial build showed the BUY THE FULL GAME prompt. |
| `Asphalt 5 v1.33.0.0 [file.windowsviet.com].xap` | XAP | 115,669,153 | Functional. |
| `Asphalt 7 Heat v1.0.0.7 [Archive.org].xap` | XAP | 536,253,160 | Not installed; official WP8 XAP verified (SHA-1 `5213F7A260C47E81FC736711F5BE3D8222201BE8`). Needs ~1.3 GB peak versus ~0.9 GB free; XAPs cannot move to SD on this build. |
| `Candy Crush Saga v1.0.0.1 [file.windowsviet.com].xap` | XAP | 16,282,183 | Functional (user-reported). |
| `Candy Crush Saga v1.0.0.1 [WindowsViet].xap` | XAP | 16,282,183 | Duplicate copy of the same version; not separately tested. |
| `Candy Crush Saga v1.95.5.0 [file.windowsviet.com].Appx` | APPX | 72,331,216 | Untested; later APPX build. |
| `Cut The Rope v1.7.0.0 [Winphone Iz].xap` | XAP | 39,367,460 | Functional. |
| `HalfbrickStudiosPtyLtd_FruitNinja_1_8_1_66_arm_w77bc8x1h5kya.Appx` | APPX | 82,070,682 | Dependency-blocked; needs `Microsoft.VCLibs.110.00`, not installed. |
| `Fruit Ninja v1.1.0.0 [Archive.org].xap` | XAP | 25,761,264 | Installed; launch-confirmed. Supersedes the failed 1.0.0.0 attempt. |
| `ImMobile_1.3.7_W10M.appx` | APPX | 38,014,152 | Untested. |
| `Instagram v10.1096.22713 [file.windowsviet.com].AppxBundle` | APPXBUNDLE | 68,085,157 | Installs and reaches sign-in; outdated (user-reported). |
| `METROTUBE (Patched).xap` | XAP | 2,909,312 | Untested; patched build, provenance unverified. |
| `Microsoft News v4.25.11762.0 [file.windowsviet.com].appx` | APPX | 24,765,728 | Installs and launches; feed service dead; public compatibility feed planned. Not functional yet. See [NEWS.md](NEWS.md). |
| `Microsoft People v10.2.2351.0 [file.windowsviet.com].appxbundle` | APPXBUNDLE | 8,114,007 | Deployment failed with `0x80073CFF`. |
| `Minecraft for Windows 10 Mobile v1.5.201.0 [file.windowsviet.com].appx` | APPX | 66,523,269 | Removed; installed through Device Portal but start returned `Unavailable` (`-2143322111`). The investigated 1.5.300.0 package is not in this archive. |
| `MSN Sports v4.25.11762.0 [file.windowsviet.com].appx` | APPX | 23,995,819 | Update path works; API down (user-reported). |
| `MSN Weather v4.26.12153.0 [file.windowsviet.com].appxbundle` | APPXBUNDLE | 25,876,536 | Functional; current data confirmed. |
| `NFS Hot Pursuit v1.0.0.0 [Winphone Iz].xap` | XAP | 118,472,721 | Functional (user-reported). |
| `Plants Zombies v1.0.0.0.xap` | XAP | 87,244,627 | Installed; launch-confirmed. |
| `Subway Surfers Mumbai v1.36.0.0 [Winphone Iz].xap` | XAP | 38,809,013 | Installed; launch-confirmed. |
| `Temple Run v1.5.3.0 [Winphone Iz].xap` | XAP | 23,401,108 | Launch-confirmed in the latest pass; earlier startup instability not re-tested. |
| `Windows Camera v2017.1003.21.2000 [file.windowsviet.com].appxbundle` | APPXBUNDLE | 4,575,292 | Local candidate. A Camera update is confirmed working, but this exact file was not tied to the installed version. |
| `Windows Maps v5.1705.1391.1000 [file.windowsviet.com].AppxBundle` | APPXBUNDLE | 32,558,497 | Untested. |
| `Word Mobile v16002.10730.20050.0 [file.windowsviet.com].appxbundle` | APPXBUNDLE | 173,390,895 | Untested. |
| `Xbox v44.44.7002.0 [file.windowsviet.com].appxbundle` | APPXBUNDLE | 55,739,670 | Rejected with `0x80073D06`; a higher version is already installed. |
| `8aa013601e01fb7cfe59ec5dd53b89ae.appxbundle` | APPXBUNDLE | 15,974,043 | `LiveStore-Ammonium 1.2.0.0`, x86/x64 only; not applicable to the ARM phone. |
| `Ambient Weather v1.4.1.6 [file.windowsviet.com].Appx` | APPX | 10,163,783 | Untested. |
| `Angry Birds Seasons v4.0.1.0 [Wayback vnokia].xap` | XAP | 34,036,549 | Original copy; title “Angry Birds”. Superseded by the title-patched build. |
| `Angry Birds Seasons v4.0.1.0 [Wayback vnokia, title-patched].xap` | XAP | 34,590,280 | Installed; launch-confirmed. Title patched to “Angry Birds Seasons”. |
| `Bad Piggies v1.6.1.0 [Archive.org].xap` | XAP | 34,363,149 | Installed; launch-confirmed. Official Rovio build; SHA-1 verified. |
| `Amazing Alex v1.0.7.0 [Archive.org].xap` | XAP | 21,298,962 | Installed; launch-confirmed. Official Rovio build; SHA-1 verified. |
| `Bubble Blast 2 v1.4.0.0 [Wayback vnokia].xap` | XAP | 8,242,980 | Installed; launch-confirmed. |
| `Doodle Jump v1.8.10 [Archive.org].xap` | XAP | 7,724,376 | Installed; launch-confirmed. |
| `Hill Climb Racing v1.16.0.0 [Archive.org].xap` | XAP | 18,373,763 | Installed; launch-confirmed. |
| `Jetpack Joyride v1.0.1.0 [Archive.org].xap` | XAP | 30,146,295 | Installed; launch-confirmed. |
| `Mou v3.8.2.9 [Archive.org].xap` | XAP | 20,568,682 | Installed; launch-confirmed. Windows Phone clone of Pou. |
| `My Talking Tom v1.2.0.0 [Wayback vnokia].xap` | XAP | 30,129,066 | Installed; launch-confirmed. |
| `Talking Tom 3.1.0.0 [Archive.org].appx` | APPX | 45,567,797 | Installed; Device Portal start returns `Unavailable`. |
| `Where's My Water v1.0.4.0 [Archive.org, title-patched].xap` | XAP | 40,923,064 | Installed; launch-confirmed. Uploader repack; title corrected. |
| `Zuma's Revenge v1.0.0.0 [Archive.org, manifest-patched].xap` | XAP | 207,320,015 | Installed; launch-confirmed. Manifest-patched. |

The root copy of the `8aa013…appxbundle` is identical in size to the copy under `apk`; treat it as a duplicate. Several packages are local copies of archived builds; a filename is provenance evidence only, not proof of authenticity.

## What is not committed

- No XAP, APPX, APPXBUNDLE, CAB, SPKG, ISO, EXE or update payload.
- No provisioning files, package-repository mirrors, or extracted SDK trees.
- No third-party PDF or release-notes HTML.
- No device identifiers, account data, or local paths beyond the archive root.

To reproduce a hash on Windows:

```powershell
Get-FileHash 'E:\Projects\Lumia\apk\Deps\Microsoft.VCLibs.140.00_14.0.25426.0.Appx' -Algorithm SHA256
```
