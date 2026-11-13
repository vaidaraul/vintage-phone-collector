# Artifacts and hashes

The repository does not contain HTC firmware, RUU payloads, HBOOT images, APK/ODEX files, or device identifiers. Keep those in a private working directory. This page lists the files used by the verified process and the hashes we observed.

Use `sha256sum` (Linux) or `Get-FileHash -Algorithm SHA256` (Windows) to verify your copies before flashing.

## Required files

| File | Size | SHA-256 | Where to get it | Notes |
| --- | ---: | --- | --- | --- |
| `RUU_Buzz_Froyo_HTC_WWE_2.22.405.1_Radio_13.55.55.24H_3.35.20.10_release_160191_signed.exe` | 138,817,896 | `89b7d49badeb276e091fd0f426896281cbfa1b79f65c8cf4d60864e1e195af6e` | HTC RUU archive / private copy | WWE Froyo baseline. The RUU may reject a non-matching CID; the recovery flash path avoids that check. |
| `recovery-clockwork-5.0.2.0-buzz.img` | 3,104,768 | `9dac073777c44c19894cc994e7659b53b484ee89abfa181a5a547cf4f248f27f` | ClockworkMod archive / private copy | `buzz` recovery. |
| `unrevoked-3.32/reflash` | 27,554,756 | `519a50ad52bf543936258d68a46cca28ae304ea3493d989a906e51cc9938a9ca` | unrevoked archive / private copy | Linux 32-bit GTK2 tool; flashes ClockworkMod and installs `su`. |
| `psneuter` | 357,080 | `f2a9803ea1d426b79731654e76a89711ed0fa80ad53b539bef813a0ead6cb568` | Revolutionary/unrevoked archive / private copy | Temporary root for Froyo. |
| `flash_image` | 419,822 | `14d5be1990f44ebe63bcbce05a863424ebc199c598e79d1b82037654590375db` | Private copy | Android flash utility used from ClockworkMod for boot/system/splash/misc. |
| `revolutionary-nocheck.exe` | 14,310,912 | `cc8c59d4ff8f189841e96defeec161413f80a2394064086c3cc2daae8b1984f8` | Patched from the public Revolutionary 0.4pre4 archive | Skips the interactive root-prompt check. |
| `caroline-buzz.bin` | 524,472 | `1a4a546c536b266b37db81689eef09ca8dc526f3191cfe414941cad5b435084f` | Extracted from the patched exe | `buzz`-specific. Never use on another model. |
| `busybox-arm` | 1,109,128 | `df4ab816838de40625dfed77e113672538e8c1c54a2a9b75a033a0bcccde25dc` | BusyBox binary / private copy | BusyBox 1.21.1 with `su`, `httpd`, `wget`, `awk`, `tar`, `cp`, `chmod`. |
| `misc-wwe-2.22.405.1.img` | 655,360 | `F9687AAA2467484F76E8FC29648CAC6EA094F4AF7402BD777D8907A6007C60DD` | Private `root-work/` copy | Sets the main version to `2.22.405.1`; keeps the existing CID. |
| `misc-vodap102-1.11.111.2.img` | 655,360 | `DD1BBCF23FA1969DD604BFE3019B6F4CDD661B6F6137F4D8314446F7A0DCBC70` | Private `root-work/` copy | Restores the original Vodafone CID/main-version state; historical. |
| `su` (unrevoked/CM7) | 22,232 | `1D2312911E1F65724E182226FDD2B18B115A6FBAF454F347064F154CDF419A40` | CM 7.2 archive / private copy | Temporary root for Phase 2. Not the final BusyBox `su`. |
| `Superuser.apk` (old) | 760,637 | `D26A50F33985832DAF2AE9F895D91489759CD5051809C6DC0290FA9FD29E196C` | CM 7.2 archive / private copy | Optional; the final root does not use it. |
| `cm-7.2.0-buzz.zip` | 76,300,468 | MD5 `AC47D97D55133DFA7561B5B7FE37BC64` | CyanogenMod archive / private copy | Optional fallback ROM and source of `su`. |

## Scripts in this repository

These are small scripts, not firmware. They are safe to commit.

| File | SHA-256 | Purpose |
| --- | --- | --- |
| `scripts/emulate.js` | `f54cbeec1f3e964b6fa176bdad8a72b793d956e52e8249272e9aaa37f103a237` | Frida `AdbWinApi` emulator that captures the fastboot payload; returns a fake serial |
| `scripts/capture-fastboot.ps1` | `70efa3517095bf97f0baa43772f065ae30a6b16442b10aacd681997f951b9be2` | Windows capture launcher; `-Work` defaults to the sibling `root-work` folder |
| `scripts/fastboot-caroline.py` | `46b88347ac11cd8b5f2d6e4c896f528c31bceda3fb82e034fd0fece60679a7e8` | Linux raw fastboot replay |
| `scripts/extract-targets.py` | `84b8ef1fc209baa6c910c8d3e15278210022be5925c1307091b597c282bbce60` | Extracts the removed stock APK/ODEX from a YAFFS2 image |
| `scripts/install-restored-apps.sh` | `e54625898f4784eb195cb110b03a91514af1a9e8a7a469c3e4e72c7e5d625973` | Installs the restored apps to `/system/app` |
| `weather/weather-cgi.sh` | `d2641b9051cd157967ca9a7422bee0555b409e73babc5eae9ff399888458c755` | Fetches Open-Meteo CSV |
| `weather/om2xml.awk` | `6baf24aea07e9ff17ec444188735375e3580bd9f7e418c3df6a25b5b2add5f14` | Converts CSV to HTC XML |
| `weather/forecast-data_v3.asp` | `d28decefd743cf7db6ffdb3673f56e19ade42f4af324c367ac8d9d1506d57a8e` | City-code CGI |
| `weather/lat-lon-search.asp` | `6bead261180de36d3b82249abead7e2ab5d1a80a3f2c7341ac5ddfae9492fd7b` | GPS CGI |
| `weather/httpd.conf` | `cdfe0967ef644d3d6649d3e60692cf5051fc4c67b8dc9779035c8a4c82746384` | BusyBox httpd CGI mapping |
| `weather/bootcomplete-wrapper` | `7d7816811f90e04a00448bfd6c4f768d49970686807eee7710e1189228c4a143` | Starts httpd at boot |

## Partition backups

These are raw MTD dumps from the verified device. Keep them private.

| Image | Size | SHA-256 | State |
| --- | ---: | --- | --- |
| `rooted-boot.img` | 2,883,584 | `656c1e99f5d1ea51defd629d6e4766062db9b78ab1c252f0d836dff4f14b8037` | Pre-debloat, after root |
| `rooted-recovery.img` | 4,325,376 | `b8b0675428dbdd40d7b95d40a9428d7132854cba07d99c6513417f33dbaaea58` | Pre-debloat, after root |
| `rooted-misc.img` | 655,360 | `0b2b8e4b89d8c1893289b0819e14ef6db34de09b9f265eeba7680ef5796e8424` | Pre-debloat, after root |
| `rooted-system.img` | 262,144,000 | `e73881cdbb17f7da9a1a4de2e1972d5d41c5128e2a85e039eaeabc926863bb3b` | Pre-debloat system (source of the restored apps) |
| `final-boot.img` | 2,883,584 | `656c1e99f5d1ea51defd629d6e4766062db9b78ab1c252f0d836dff4f14b8037` | Final |
| `final-recovery.img` | 4,325,376 | `b8b0675428dbdd40d7b95d40a9428d7132854cba07d99c6513417f33dbaaea58` | Final |
| `final-misc.img` | 655,360 | `0b2b8e4b89d8c1893289b0819e14ef6db34de09b9f265eeba7680ef5796e8424` | Final |
| `final-system.img` | 262,144,000 | `ce13ada803fb0786a7deca7162a9b8e60d1d565bb4a809dae79790ec645a1366` | Post-debloat, pre-restore |
| `restored-system.img` | 262,144,000 | `ea1536b69b6a28721c0535661017107eaafc28c70174e67009369a4d25569f2a` | Current: debloat reverted, stock apps restored |

The boot, recovery, and misc hashes are identical between the rooted and final backups because those partitions were not changed after root. The system hashes differ because the debloat and restore changed `/system/app`.

## Verification examples

Linux:

```bash
sha256sum caroline-buzz.bin busybox-arm recovery-clockwork-5.0.2.0-buzz.img
```

Windows PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 .\caroline-buzz.bin
Get-FileHash -Algorithm SHA256 .\busybox-arm
```

For the Caroline payload, also check the size:

```bash
stat -c '%s' caroline-buzz.bin
# 524472
```

If the size or hash does not match, stop. Do not flash it.
