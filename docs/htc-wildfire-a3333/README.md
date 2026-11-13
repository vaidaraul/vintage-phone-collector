# HTC Wildfire A3333 restoration

- **Device:** HTC Wildfire A3333 (`buzz`, model `PC4910000`)
- **Final OS:** Android 2.2.1 Froyo, HTC WWE `2.22.405.1`
- **Final bootloader:** HBOOT `6.01.1002` (Revolutionary), `security: off`, SuperCID
- **Recovery:** ClockworkMod `5.0.2.0`
- **Root:** BusyBox `su` at `/system/bin/su` (promptless)
- **Weather:** phone-local, no VPS or HTC/AccuWeather dependency
- **Stock apps:** restored; no general debloat
- **Games:** Doodle Jump verified working; Skater Boy 1.6 playable but marginal with a 0.75x timing-cap build; Fruit Ninja 1.3 playable with a 160x120 half-res patch (~25–50 FPS, softer image); Logo Quiz Ultimate 2.2 verified working; Angry Birds, Angry Birds Seasons, Temple Run and Hill Climb Racing not playable due GPU/API limits — see [GAMES.md](GAMES.md)
- **Casual apps:** iBeer, Lighter and Candle verified working, including tilt, touch and blow interactions — see [CASUAL.md](CASUAL.md)
- **Last verified:** 2026-11-13

## What this guide does

This is the complete restoration path for a Wildfire A3333 that should keep the vintage HTC Sense experience but be fully open and usable:

- Unbranded WWE Froyo instead of Vodafone firmware.
- S-OFF, SuperCID, custom recovery, permanent root.
- All stock HTC apps kept, including FriendStream, HTC Facebook/Twitter, Flickr, Stock, YouTube, Gmail, Maps, and the Sense widgets.
- HTC Weather working on ordinary Wi-Fi or mobile data without HTC services.

## Glossary

- **ADB** — Android Debug Bridge, the host tool used to run commands on Android.
- **Fastboot** — the bootloader protocol used to flash recovery or read bootloader variables.
- **HBOOT** — the HTC bootloader. It checks the device ID, CID, and image signatures.
- **S-ON / S-OFF** — the bootloader security flag. S-OFF allows fastboot writes to protected partitions.
- **CID** — carrier/region ID stored in the bootloader. `VODAP102` is a Vodafone CID; `11111111` is SuperCID.
- **RUU** — ROM Update Utility, HTC's Windows flashing tool.
- **Recovery** — a small bootable environment used for backups, wipes, and flashing images.
- **Nandroid** — a full backup made from a custom recovery.
- **ODEX** — a pre-optimized Dalvik executable that sits next to an APK on Froyo.
- **YAFFS2** — the NAND filesystem used by the Wildfire's system and data partitions.
- **zergRush** — the Froyo-era temporary-root exploit used by Revolutionary.
- **Caroline** — Revolutionary's per-device payload: a small ARM stub plus a patched HBOOT.
- **MISC** — a small partition that stores bootloader settings such as the main version and CID-related values.

## Difficulty and risk

| Item | Value |
| --- | --- |
| Difficulty | Advanced |
| Time | 2–4 hours for a first run |
| Risk | High: wrong bootloader payloads, interrupted flashes, or driver problems can brick the phone |
| Reversible? | Mostly, if you have the backups described here; S-OFF itself is a bootloader modification |
| Tested on | One HTC Wildfire A3333, originally CID `VODAP102`, HBOOT `1.01.0002`, later WWE `2.22.405.1` |

Do not start until you have read [PROCESS.md](PROCESS.md) completely. Do not use the Caroline payload on any other phone model.

## Process at a glance

| Phase | Goal | Stop here if… |
| --- | --- | --- |
| [0. Prepare](PROCESS.md#phase-0-prepare) | Verify the device, charge it, collect artifacts | — |
| [1. Root the original firmware](PROCESS.md#phase-1-root-the-original-firmware) | unrevoked3 + ClockworkMod + temporary root | You only want root on the Vodafone base |
| [2. Flash generic WWE Froyo](PROCESS.md#phase-2-flash-generic-wwe-froyo) | Remove Vodafone branding and apps, keep HBOOT/radio | You only want an unbranded ROM |
| [3. S-OFF](PROCESS.md#phase-3-s-off) | Permanent bootloader unlock with the patched Revolutionary payload | You do not need permanent root or future fastboot flashing |
| [4. Recovery and permanent root](PROCESS.md#phase-4-recovery-and-permanent-root) | ClockworkMod + BusyBox `su` | — |
| [5. Keep the stock apps](PROCESS.md#phase-5-keep-the-stock-apps) | Verify/restore the full WWE app set | — |
| [6. Phone-local weather](PROCESS.md#phase-6-phone-local-weather) | HTC Weather without HTC services | You do not need Weather |
| [7. Verify and back up](PROCESS.md#phase-7-verify-and-back-up) | Final checklist and raw images | — |

## Final verified state

- WWE Froyo `2.22.405.1` (`ro.build.description` = `2.22.405.1 CL295397 release-keys`).
- HBOOT `6.01.1002`, `security: off`, CID `11111111`.
- ClockworkMod `5.0.2.0`.
- `su -c id` returns `uid=0(root)` after a clean reboot.
- All pre-debloat `/system/app` files present except the old `Superuser.apk` (intentionally replaced by BusyBox `su`).
- Weather CGI returns the legacy `<weather>` XML for all saved cities and the current location.
- BusyBox httpd listens on `127.0.0.1:80` and starts at boot.
- News works with BBC News plus BBC World/Technology/Science/Business/Sport, Ars Technica, Engadget, ScienceDaily, and Universe Today.

## Related documents

- [PROCESS.md](PROCESS.md) — the step-by-step procedure.
- [CHECKLIST.md](CHECKLIST.md) — a printable progress checklist.
- [WEATHER.md](WEATHER.md) — the phone-local weather design, XML schema, and files.
- [NEWS.md](NEWS.md) — HTC NewsReader, handpicked RSS/Atom feeds, and the HTTP/HTTPS constraint.
- [MODERN-WEB.md](MODERN-WEB.md) — Google account limits, Play Store, and modern browsing workarounds.
- [GAMES.md](GAMES.md) — game compatibility notes.
- [CASUAL.md](CASUAL.md) — classic accelerometer/microphone novelty apps.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — known failure modes and fixes.
- [ARTIFACTS.md](ARTIFACTS.md) — files, sizes, hashes, and provenance.
- [PLAN.md](PLAN.md) — how this documentation will be tested and finished.
- [CHANGELOG.md](CHANGELOG.md) — document versions and changes.

## Important warnings

- **Back up first.** The WWE flash wipes data. The S-OFF path can leave the phone at a fastboot screen or with a wedged USB stack.
- **Use the correct payload.** The `buzz` Caroline stub uses `0x9C...` addresses. Stubs from other devices use `0x9D...` and freeze the Wildfire USB stack.
- **Do not publish identifiers.** Serials, IMEI, SD-card CID, and private keys stay out of the repository.
- **This is a vintage device.** A failed flash may be recoverable with fastboot or a RUU, but not every failure is reversible.
