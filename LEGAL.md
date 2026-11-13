# Legal and licensing

This is a hobby preservation project. It is not affiliated with, endorsed by, or sponsored by HTC, Google, Qualcomm, AlphaRev, unrEVOked, ClockworkMod, BusyBox, Open-Meteo, or any carrier.

This page is general information, not legal advice. If you plan to publish, sell, or distribute anything beyond this repository, check the law in your jurisdiction with a lawyer.

## What this repository provides

- Original documentation, checklists, and process notes.
- Original helper scripts for fastboot capture/replay, YAFFS2 extraction, app restoration, and the phone-local weather stack.
- Filenames, sizes, and SHA-256 hashes for artifacts used during the restoration.

The code is licensed under the MIT License; see [LICENSE-CODE](LICENSE-CODE).

The documentation is licensed under CC BY 4.0; see [LICENSE-DOCS](LICENSE-DOCS).

## What this repository does not provide

It does not contain, and should not be used to distribute:

- HTC RUU executables, firmware images, HBOOT images, or radio images.
- The Caroline payload or the patched HBOOT.
- The patched `revolutionary-nocheck.exe` or other modified proprietary tools.
- HTC, Google, or carrier APK/ODEX files.
- ClockworkMod recovery images, BusyBox binaries, `psneuter`, `unrevoked3`, or other third-party binaries unless their licenses clearly allow redistribution.
- MISC images, device serial numbers, IMEI, SD-card CID, GoldCard headers, or private keys.
- Raw logs or captures containing personal or private network data.

Those files remain the property of their respective rights holders. Obtain them from your own device, your own backups, or a source that has the right to distribute them.

## Why the binaries are excluded

- **HTC/Google firmware and apps** are proprietary and copyrighted. Redistributing them is likely copyright infringement.
- **The Caroline payload and patched HBOOT** are derivatives of HTC's bootloader. Distributing them raises copyright concerns and, depending on jurisdiction, anti-circumvention concerns.
- **The patched Revolutionary tool** contains the same payload and is a modified third-party executable. Do not redistribute it without permission.
- **BusyBox** is GPLv2. Distributing a binary requires GPL compliance, including source availability. The repository therefore links to the project rather than shipping a binary.
- **ClockworkMod recovery** is open source, but a compiled recovery image includes a kernel and may carry GPL obligations. Build it from source or obtain it from a source that complies with the license.
- **`psneuter` and `unrevoked3`** are third-party tools with unclear or proprietary licensing. Do not redistribute them without permission.

## Reverse engineering and anti-circumvention

This project documents interoperability work on a device the owner controls: restoring the original HTC Weather client and replacing a dead service. Reverse engineering for interoperability has legal protections in some jurisdictions, but bootloader unlocking and modification can also implicate anti-circumvention rules (for example, the DMCA in the United States and similar laws elsewhere).

Publishing documentation is generally lower risk than publishing the proprietary binaries or circumvention payloads. This repository deliberately takes the lower-risk path: it describes the process and provides original code, not the proprietary files.

## Open-Meteo

The phone-local weather stack uses Open-Meteo data. Open-Meteo requires attribution and has terms for commercial use. See:

- https://open-meteo.com/
- https://open-meteo.com/en/terms

The weather code in this repository is independent and is not endorsed by Open-Meteo.

## Trademarks

HTC, Sense, Wildfire, Android, Google, and other names are trademarks of their respective owners. They are used here only to describe the hardware and software being preserved.

## Takedown and corrections

If you are a rights holder and believe something in this repository should not be here, open an issue or contact the repository owner. The goal is to share knowledge, not to redistribute anyone's proprietary files.

## No warranty

The process can brick a phone, wipe data, or leave it in a non-booting state. There is no warranty. Back up first and use a device you can afford to lose.
