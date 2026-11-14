# Lumia 535 game suite

Phone: **Lumia 535 (RM-1089)**, Windows 10 Mobile **10.0.14393.2551 (1607)**  
Deployer: `tools/DeviceTool.exe` (CoreCon 11, per-user COM registration, no admin install)  
Test pass: **2026-11-14**

This file follows the evidence standard in the HTC Wildfire testing process:
[TESTING.md](../../docs/htc-wildfire-a3333/TESTING.md).
That procedure separates *installs*, *launches*, *reaches the menu*, *reaches gameplay*
and *is playable*. A live process on its own is not treated as a working game.

Game packages, screenshots and raw evidence stay outside this repository. Archive
filenames below refer to the local package archive described in [archive.md](archive.md).

## HTC list coverage

The HTC Wildfire docs list 24 titles. **15 have a Lumia build installed**; 14 of those
have a confirmed process launch, and Talking Tom is installed but not startable through
the Device Portal. The other 9 have no usable Windows Phone package in the sources
checked.

| HTC title | Lumia status |
|---|---|
| Abduction! World Attack | Not installed — no Windows Phone package found |
| Angry Birds | Installed — 1.5.3.0 only; 5.0.2.0 trial removed |
| Angry Birds Seasons | Installed — 4.0.1.0 (title-patched) |
| Bonsai Blast | Not installed — no Windows Phone package found |
| Bubble Blast 2 | Installed — 1.4.0.0 (Wayback vnokia copy) |
| Cut the Rope | Installed — 1.7.0.0 |
| Doodle Jump | Installed — 1.8.10.0 |
| Fruit Ninja | Installed — 1.1.0.0 |
| Glow Hockey | Not installed — no Windows Phone package found |
| Glow Hockey 2 | Not installed — no Windows Phone package found |
| Hill Climb Racing | Installed — 1.16.0.0 |
| Jetpack Joyride | Installed — 1.0.1.0 |
| Logo Quiz Ultimate | Not installed — no Windows Phone package found |
| Paper Toss | Not installed — Appx4Fun download generator is blocked; no plain mirror found |
| Peggle | Not installed — no Windows Phone package found |
| Plants vs. Zombies | Installed — 1.0.0.0 |
| Pou | Installed as **Mou 3.8.2.9** — Windows Phone clone; official Pou has no WP build |
| Robo Defense FREE | Not installed — no Windows Phone package found |
| Skater Boy | Not installed — no Windows Phone package found |
| Subway Surfers | Installed — 1.36.0.0 |
| Talking Tom Cat | Installed — Talking Tom 3.1.0.0 APPX; My Talking Tom 1.2.0.0 XAP also installed |
| Temple Run | Installed — 1.5.3.0 |
| Where's My Water? | Installed — 1.0.4.0; uploader repack, title corrected |
| Zuma | Installed as **Zuma's Revenge! 1.0.0.0** — manifest-patched |

## Installed Lumia builds

| Game | Package / version | Runtime | Launch | Frame | Classification |
|---|---|---|---|---|---|
| Angry Birds | `Angry Birds v1.5.3.0.0 [Winphone Iz].xap` / 1.5.3.0 | XNA | PASS | Not captured | Launch-only; repack marker |
| Angry Birds Seasons | `Angry Birds Seasons v4.0.1.0 [Wayback vnokia, title-patched].xap` / 4.0.1.0 | Modern Native | PASS | Not captured | Launch-only; title-patched |
| Bubble Blast 2 | `Bubble Blast 2 v1.4.0.0 [Wayback vnokia].xap` / 1.4.0.0 | Silverlight | PASS | Not captured | Launch-only |
| Cut The Rope | `Cut The Rope v1.7.0.0 [Winphone Iz].xap` / 1.7.0.0 | Silverlight | PASS, 1.5 s | Not captured | Launch-only |
| Doodle Jump | `Doodle Jump v1.8.10 [Archive.org].xap` / 1.8.10.0 | XNA | PASS | Not captured | Launch-only |
| Fruit Ninja | `Fruit Ninja v1.1.0.0 [Archive.org].xap` / 1.1.0.0 | XNA | PASS | Not captured | Launch-only |
| Hill Climb Racing | `Hill Climb Racing v1.16.0.0 [Archive.org].xap` / 1.16.0.0 | Silverlight | PASS | Not captured | Launch-only |
| Jetpack Joyride | `Jetpack Joyride v1.0.1.0 [Archive.org].xap` / 1.0.1.0 | Silverlight | PASS | Not captured | Launch-only |
| Plants vs. Zombies | `Plants Zombies v1.0.0.0.xap` / 1.0.0.0 | XNA | PASS, 1.5 s | Not captured | Launch-only |
| Pou (Mou) | `Mou v3.8.2.9 [Archive.org].xap` / 3.8.2.9 | Silverlight | PASS | Not captured | Launch-only; clone |
| Subway Surfers | `Subway Surfers Mumbai v1.36.0.0 [Winphone Iz].xap` / 1.36.0.0 | Silverlight | PASS, 1.5 s | Not captured | Launch-only |
| Talking Tom Cat | Talking Tom `3.1.0.0` ARM APPX | WinRT | Portal start `Unavailable` | Not captured | Installed; launch unverified |
| Temple Run | `Temple Run v1.5.3.0 [Winphone Iz].xap` / 1.5.3.0 | Silverlight | PASS, 1.6 s | Not captured | Launch-only |
| Where's My Water? | `Where's My Water v1.0.4.0 [Archive.org, title-patched].xap` / 1.0.4.0 | Silverlight | PASS | Not captured | Launch-only; repack |
| Zuma's Revenge! | `Zuma's Revenge v1.0.0.0 [Archive.org, manifest-patched].xap` / 1.0.0.0 | XNA | PASS | Not captured | Launch-only; patched |

Also installed, not part of the HTC list:

| Game | Package / version | Runtime | Launch | Frame | Classification |
|---|---|---|---|---|---|
| Bejeweled Live+ | `Bejeweled Live+ 1.0.0.0 [Archive.org].xap` / 1.0.0.0 | XNA | PASS, 1.5 s | **Menu captured** | **Menu reached** |
| My Talking Tom | `My Talking Tom v1.2.0.0 [Wayback vnokia].xap` / 1.2.0.0 | Silverlight | PASS | Not captured | Launch-only |
| Candy Crush Saga | `Candy Crush Saga v1.0.0.1 [file.windowsviet.com].xap` / 1.0.0.1 | XNA | PASS, 1.5 s | Not captured | Launch-only |
| Asphalt 5 | `Asphalt 5 v1.33.0.0 [file.windowsviet.com].xap` / 1.0.0.0 | XNA | PASS, 1.5 s | Not captured | Launch-only |
| NFS: Hot Pursuit | `NFS Hot Pursuit v1.0.0.0 [Winphone Iz].xap` / 1.0.0.0 | XNA | PASS, 1.5 s | Not captured | Launch-only |
| Bad Piggies | `Bad Piggies v1.6.1.0 [Archive.org].xap` / 1.6.1.0 | Silverlight | PASS | Not captured | Launch-only |
| Amazing Alex | `Amazing Alex v1.0.7.0 [Archive.org].xap` / 1.0.7.0 | Silverlight | PASS | Not captured | Launch-only |

Angry Birds **1.5.3.0** (`e4571a02-0b87-e011-986b-78e7d1fa76f8`) is the remaining full
XNA build. The 5.0.2.0 trial was removed; Angry Birds Seasons now has its own title.

Bad Piggies **1.6.1.0** is an official Rovio Silverlight XAP from Archive.org item
`bad-piggies-windows-phone`; its SHA-1 (`8CEE8C70E6AA616B1C35B48D6620CA2CAB57B171`) was
verified, and its SHA-256 matches the VirusTotal hash in the item metadata.

Amazing Alex **1.0.7.0** is an official Rovio Silverlight XAP from Archive.org item
`amazing-alex-windows-phone`; its SHA-1 (`31D82B674C7EFE561788EC12AA33F9B2994DD03C`) was
verified, and its SHA-256 matches the VirusTotal hash in the item metadata.

Portal-confirmed utilities: **CMD Injector 4.0.6.0**, **Live Store 1.2.0.0**,
**WUT Mini 1.5.1.0**.

## New package IDs

| Game | Product ID / package |
|---|---|
| Angry Birds Seasons | `08c71378-2cc5-48ce-9995-13206cef8e2f` |
| Bubble Blast 2 | `45309caa-6199-4d16-9e2a-39c75d3ee6d2` |
| My Talking Tom | `f71cf54b-d8e3-4d3c-af66-070e6ce57acc` |
| Doodle Jump | `3a1fabb3-4a70-e011-81d2-78e7d1fa76f8` |
| Fruit Ninja | `7826ea3a-a287-413b-9338-0f708ba27963` |
| Hill Climb Racing | `eac80a1b-5db2-49af-9912-d327ab4dcfca` |
| Jetpack Joyride | `d5969251-fef6-451d-a224-0613686188a6` |
| Where's My Water? | `15e6bf4d-b1ea-4b21-9301-fbf27fa00c2a` |
| Zuma's Revenge! | `06da2c13-d8f1-4693-9ef9-11cbfa291e4c` |
| Mou | `c032d62c-7f6a-4538-8150-f77034dcf335` |
| Bad Piggies | `9ccfb504-1e48-4fc4-ba6d-8f0d2400a8f5` |
| Amazing Alex | `fac2552c-25bb-420c-b0b5-bb3059418933` |
| Talking Tom | `OutFit7Limited.TalkingTomCat_3.1.0.0_arm__rmf98d2bjqpyp` |

## HTC titles not installed

- **Abduction! World Attack** — no Windows Phone package found in Archive.org,
  WindowsViet, vnokia or Appx4Fun.
- **Bonsai Blast** — no Windows Phone package found.
- **Cut the Rope 2** — the Store XAP is PlayReady-encrypted; the only unencrypted
  copies found (WindowsViet, Archive.org, eipapa) are a patched build with stale ZIP
  CRCs. Rebuilding the CRCs and restoring the DLL certificate table installs, but the
  game exits after about 4 seconds. The retail/test WP8.1 APPX installs but fails to
  start with `0x803F8001` (no Store entitlement); the Microsoft Store is retired. The
  clean 4PDA attachment requires a 4PDA login and was not retrievable. Removed from the
  phone.
- **Glow Hockey** — no Windows Phone package found.
- **Glow Hockey 2** — no Windows Phone package found.
- **Logo Quiz Ultimate** — no Windows Phone package found.
- **Paper Toss** — Paper Toss Classic `1.0.0.4` exists, but the Appx4Fun download
  generator is Cloudflare-blocked and no plain mirror was found.
- **Peggle** — no Windows Phone package found.
- **Robo Defense FREE** — no Windows Phone package found.
- **Skater Boy** — no Windows Phone package found.

## APPX notes

- **Minecraft 1.5.201.0** installed through Device Portal but started with `Unavailable`
  (`-2143322111`); it was **removed**. The Windows Phone 8.1 `0.14.0.1` APPX was also
  tried, including its signing certificate; registration failed with
  `Package could not be registered`. No working Minecraft build has been found.
- **Fruit Ninja 1.8.1.66 APPX** is blocked by the missing
  `Microsoft.VCLibs.110.00` dependency.
- **Talking Tom 3.1.0.0 APPX** installs, but Device Portal start returns `Unavailable`.
  The **My Talking Tom 1.2.0.0 XAP** launches and is the working Talking Tom build.
- **Cut the Rope 2 1.0.0.46 APPX** installs but start returns `Unavailable`
  (`0x803F8001`, no Store entitlement). The Store is retired, so the license cannot be
  obtained. The retail and test bundles behave the same.

## Patches, repacks and naming notes

- **Angry Birds Seasons 4.0.1.0** — the original manifest title was “Angry Birds”; the
  title was patched to “Angry Birds Seasons” and the patched XAP reinstalled.
- **Zuma's Revenge!** — the original XAP was rejected with
  `Fix the Capabilities in WMAppManifest.xml file`. The legacy
  `ID_FUNCCAP_EXTEND_MEM` block and `ID_REQ_MEMORY_300` requirement were removed from
  `WMAppManifest.xml`; the game content is unchanged. The patched XAP installs and
  launches. Treat the result as provisional because the manifest was edited.
- **Where's My Water?** — the archive copy is an uploader repack. Its root
  `WMAppManifest.xml` was renamed to “Find Water by reker”; the `Properties` manifest and
  game content are the official Disney/Marker Metro build. The root title was corrected
  back to “Where's My Water?” before reinstall. The app now shows the correct name, but
  the package remains a repack.
- **Mou** — a Windows Phone clone of Pou, not the official Zakeh game. It is the only
  working Pou-style package found for Windows Phone.

## Frame evidence

- Local capture `bejeweled-menu-2026-11-13.png` — native Lumia screenshot, 540x960;
  kept outside Git.
- Shows the Bejeweled Live+ main menu: Classic, Lightning, Diamond Mine, Leaderboards,
  Achievements, Help & About, Bonus Games.
- This confirms the XNA build renders a usable menu. It does not prove gameplay works.
- Source filename on the phone: `wp_ss_20261113_0001.png` (SD card, Screenshots folder).

## Artifact hashes

| File | SHA-256 |
|---|---|
| `apk/Bejeweled Live+ 1.0.0.0 [Archive.org].xap` | `5A19EE07D8321BA4EAD972926AAD8D3E066F3A44D19C6555FF049DF022690D80` |
| `apk/Bad Piggies v1.6.1.0 [Archive.org].xap` | `BD0D1B52609C766D0F080D25F3E204E623055DF7276D9D4581C46A567A8DA814` |
| `apk/Amazing Alex v1.0.7.0 [Archive.org].xap` | `7F291A0B7E7B910501A8C10C396B20B658C3FD44A8212E6D559E97CE549BB018` |
| `apk/Cut the Rope 2 v1.0.0.22 [Archive.org].xap` | `34109E51B7BE522A012DA5804EDE1173023E1EACFA93B1AD2A2B5D940861A574` |
| `apk/Cut the Rope 2 v1.0.0.22 [rebuilt original dll].xap` | `46AAA00D0C6366932D4B40E21394423286088384760627757781175DCE3782DC` |
| `apk/Angry Birds Seasons v4.0.1.0 [Wayback vnokia].xap` | `E5FEAA5B7942C2DD6A9235A88ABB86D7E0880C76DBAD09C049EEC9F809EB4134` |
| `apk/Angry Birds Seasons v4.0.1.0 [Wayback vnokia, title-patched].xap` | `4736EFA73922BC94496CC960EDA35CE1A2AD5FCD6EB93B81896682E91C48E39B` |
| `apk/Bubble Blast 2 v1.4.0.0 [Wayback vnokia].xap` | `F750A93F95CA2A34E8FB11A19400E46FBC236CBDDF2210837BE73A71C7F794D7` |
| `apk/My Talking Tom v1.2.0.0 [Wayback vnokia].xap` | `C0AC52EB1B585E5DBC093630A0FC58B9D2FCEF130D90D57B14E37FB99FB9293A` |
| `apk/Doodle Jump v1.8.10 [Archive.org].xap` | `1B9D696B161CC382B130C0D3D357BB7683E16186FB33C7B541194CC58B0BB3A7` |
| `apk/Fruit Ninja v1.1.0.0 [Archive.org].xap` | `E992D61654AC60E889CCF9583D28E3E13CE42470346E6643D18B9599B62ACF7D` |
| `apk/Hill Climb Racing v1.16.0.0 [Archive.org].xap` | `2ED20E43943C5B7CB1420AA06EE746FAF6AEED0D561B156469B3BCD20A878C69` |
| `apk/Jetpack Joyride v1.0.1.0 [Archive.org].xap` | `43487F8C4504F6306D201C08AEC8CF48FCBC75AE7D1EBD848CE074AC722A09AD` |
| `apk/Where's My Water v1.0.4.0 [Archive.org, title-patched].xap` | `1BC7CFA3EBDE8F2FE17C1A0C515C6626F847A77E3CF033E985F27F1BFB9E2A5E` |
| `apk/Zuma's Revenge v1.0.0.0 [Archive.org, manifest-patched].xap` | `B7F8729B7562D7A4C705AF40116A817EB4E2AD75BC8878A1D2B4F5F83793E2EF` |
| `apk/Mou v3.8.2.9 [Archive.org].xap` | `582F554C4FA7919681AA4EC0BB70DD41584B65DF03296C6EAF956F51255BBB2A` |
| Talking Tom `3.1.0.0` ARM APPX | `262A60DB805CD394681FB7384D564AE9376F811829636B8D20559CC060A1F502` |
| `apk/Angry Birds v5.0.2.0 [file.windowsviet.com].xap` | `41497092452F10C743338346D0868EA941EE62DDC0D14F1A41000247EEBA1E9D` |
| `apk/Candy Crush Saga v1.0.0.1 [file.windowsviet.com].xap` | `D836A542A139884712D57BCE9301510612C2157DC61466D1DA872D153FE85D10` |
| `apk/Cut The Rope v1.7.0.0 [Winphone Iz].xap` | `62B1D9423523116B9DA10A114B26687090BEC269398B3D6B0A461746192820F1` |
| `apk/NFS Hot Pursuit v1.0.0.0 [Winphone Iz].xap` | `54E04B16D7E23521A28E09D9D9D1A4729E76D47287806D87102950F0BFF62B96` |
| `apk/Plants Zombies v1.0.0.0.xap` | `4CDF1740DBE9F6DD3C1B6E6E26C4388E6A800DBEA71C53A0C4B2F5D4C56466A8` |
| `apk/Subway Surfers Mumbai v1.36.0.0 [Winphone Iz].xap` | `20B22B5767C625F9415E58B76F669F30CBD0E5F86FDC591125DC16EC388A9CC0` |
| `apk/Temple Run v1.5.3.0 [Winphone Iz].xap` | `2BD8E90CD0ACADF8B50A981FEDC3FDB2D974BF88F0D85DA81E5728B14FAE8A45` |
| `apk/HalfbrickStudiosPtyLtd_FruitNinja_1_8_1_66_arm_w77bc8x1h5kya.Appx` | `8080013EC5FD0F20A8476CEFD3B329B154F343FE4087DA169193D3C3E3277B4F` |
| `apk/Minecraft for Windows 10 Mobile v1.5.201.0 [file.windowsviet.com].appx` | `1D93090F8156431F3671412F87AC3645E4FB65FFD376A4412DC0A057FEDF2E70` |

Raw package inspection and launch-pass JSON are kept with the local archive, outside
Git.

## Test method used here

1. **Inspect the package before installing.** Read `WMAppManifest.xml` or
   `AppxManifest.xml`, record product/identity, version, runtime, architecture,
   capabilities and SHA-256.
2. **Verify installation.** Read the installed package list from the Device Portal
   (`/api/app/packagemanager/packages`) and match the package family/full name.
3. **Launch and check the process.** Stop any existing instance with
   `tools/DeviceTool.exe stop <productId>`, then launch and poll
   `/api/resourcemanager/processes` until the package appears. The portal's `DELETE`
   endpoint returns 200 but does not terminate legacy XAPs, so it cannot be used to
   guarantee a cold start. Record time-to-process, not time-to-menu.
4. **Capture a frame.** The 14393 Device Portal has no screenshot endpoint, and
   Microsoft Project My Screen produced a black video stream on this phone. The working
   method is the phone's native **Volume Up + Power** screenshot, saved to
   `SD card\Pictures\Screenshots`, then copied to a local captures folder.
5. **Exercise input.** Not performed in this pass. The HTC procedure requires at least
   one menu branch and one gameplay action; those fields are marked **not tested**.
6. **Collect evidence.** Portal process list, package inventory, WER/user-dump check and
   any captured frame. No WER reports or user-mode crash dumps were present.
7. **Classify.** `Menu reached`, `Launch-only`, `Not playable`, `Not installed` or
   `Not tested`. "Works" and "playable" are reserved for titles with frame and input
   evidence.

## Limits of this pass

- Frame-level checks were performed for **Bejeweled only**. The other titles are
  launch-only evidence. The screenshot pass was deliberately skipped, so no claim is
  made that their menus or gameplay render.
- Touch/accelerometer/microphone input was not exercised.
- The Device Portal on 14393 exposes no screenshot or foreground-focus API. A process in
  `/api/resourcemanager/processes` proves the package started, not that it is on screen.
- Microsoft Project My Screen 1.2 connected but delivered a black video stream on this
  build. Native **Volume Up + Power** screenshots are the reliable frame-capture method.
- Minecraft 1.5.201.0 was installed and removed after it failed to start with
  `Unavailable` (`-2143322111`); the WP8.1 0.14.0.1 APPX was rejected during registration.
  Talking Tom has the same start error; My Talking Tom is the working XAP alternative.
- Cut the Rope 2 could not be made playable. The unencrypted archive copies are a
  patched build with stale ZIP CRCs; after repair it installs but exits after about
  4 seconds. The WP8.1 APPX installs but fails with `0x803F8001` (no Store entitlement),
  and the Store is retired. The clean 4PDA XAP requires a 4PDA login.
- The Zuma and Where's My Water packages are patched/repacked builds. They are not
  byte-identical to the original publisher packages and should be treated as provisional.
- The phone's sleep timeout was temporarily set to `Never` for the pass and restored to
  **180 seconds** on AC and battery afterward.
- The per-user CoreCon registration lives under `HKCU\Software\Classes`. It can be removed
  later if the deployer is no longer needed.

## Bejeweled source

- Archive.org item: `bejeweled-live-windows-phone-windows-phone`
- Local copy: `apk/Bejeweled Live+ 1.0.0.0 [Archive.org].xap`
- SHA-1: `255BF3E2BCD63ECBA45654CEA50F228C375569DC`
- SHA-256: `5A19EE07D8321BA4EAD972926AAD8D3E066F3A44D19C6555FF049DF022690D80`
- Archive.org scan: VirusTotal link in the item metadata; curation marked checked.

## DeviceTool commands

```powershell
tools\DeviceTool.exe list
tools\DeviceTool.exe apps
tools\DeviceTool.exe check <productId>
tools\DeviceTool.exe install <productId> <instanceId> <genre> <icon> <xap>
tools\DeviceTool.exe launch <productId>
tools\DeviceTool.exe stop <productId>
tools\DeviceTool.exe uninstall <productId>
```

Use `00000000-0000-0000-0000-000000000000` as the instance ID for these XAPs. Install to
the phone while the screen is unlocked.
