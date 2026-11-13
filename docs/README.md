# Documentation

This folder is the user-facing documentation for the HTC Wildfire A3333 restoration. It is separate from the private engineering log and the device history in `devices/`.

## Start here

- [HTC Wildfire A3333 overview](htc-wildfire-a3333/README.md)
- [End-to-end process](htc-wildfire-a3333/PROCESS.md)
- [Printable checklist](htc-wildfire-a3333/CHECKLIST.md)
- [Phone-local weather details](htc-wildfire-a3333/WEATHER.md)
- [Game compatibility](htc-wildfire-a3333/GAMES.md)
- [Troubleshooting](htc-wildfire-a3333/TROUBLESHOOTING.md)
- [Artifacts and hashes](htc-wildfire-a3333/ARTIFACTS.md)
- [Documentation plan](htc-wildfire-a3333/PLAN.md)
- [Changelog](htc-wildfire-a3333/CHANGELOG.md)
- [Helper scripts](htc-wildfire-a3333/scripts/)
- [Weather files](htc-wildfire-a3333/weather/)

## What this documentation is

The process is a **verified restoration path for one HTC Wildfire A3333** (codename `buzz`, model `PC4910000`) that was originally Vodafone-branded. It covers:

1. Rooting the original firmware with unrevoked3.
2. Flashing generic HTC WWE Froyo `2.22.405.1`.
3. Achieving S-OFF with the patched Revolutionary Caroline payload.
4. Installing ClockworkMod recovery and permanent BusyBox `su`.
5. Keeping the full stock app set (no general debloat).
6. Making HTC Weather work without HTC/AccuWeather or a server.

It is an advanced guide. It is not a one-click tool and it is not a guarantee for every Wildfire variant.

## Publication rules

The repository must not contain:

- HTC APK/ODEX binaries, RUU payloads, HBOOT images, or patched bootloader blobs.
- Device serial numbers, IMEI, SD-card CID, GoldCard headers, or private keys.
- Raw logs containing personal data or private network details.

Keep those files in a private working directory. The docs refer to them by filename and hash only.

## Status

The process was executed successfully on 2026-11-12/13. The documentation is currently a first complete draft; see [PLAN.md](htc-wildfire-a3333/PLAN.md) for the validation and publishing work that remains.

## Contributing

If you reproduce a step, update the verified/unverified table in [PROCESS.md](htc-wildfire-a3333/PROCESS.md), add the result to the [CHANGELOG.md](htc-wildfire-a3333/CHANGELOG.md), and include the exact device state and command output. Do not add firmware, APK/ODEX files, serials, or private keys.
