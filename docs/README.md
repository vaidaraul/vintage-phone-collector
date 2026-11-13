# Documentation

This folder is the user-facing documentation for the HTC Wildfire A3333 restoration. It is separate from the private engineering log and the device history in `devices/`.

## Start here

- [HTC Wildfire A3333 overview](htc-wildfire-a3333/README.md)
- [End-to-end process](htc-wildfire-a3333/PROCESS.md)
- [Printable checklist](htc-wildfire-a3333/CHECKLIST.md)
- [Phone-local weather details](htc-wildfire-a3333/WEATHER.md)
- [News and handpicked RSS feeds](htc-wildfire-a3333/NEWS.md)
- [Modern web and Google services](htc-wildfire-a3333/MODERN-WEB.md)
- [Game compatibility](htc-wildfire-a3333/GAMES.md)
- [Casual sensor apps](htc-wildfire-a3333/CASUAL.md)
- [Troubleshooting](htc-wildfire-a3333/TROUBLESHOOTING.md)
- [Artifacts and hashes](htc-wildfire-a3333/ARTIFACTS.md)
- [Documentation plan](htc-wildfire-a3333/PLAN.md)
- [Changelog](htc-wildfire-a3333/CHANGELOG.md)
- [Helper scripts](htc-wildfire-a3333/scripts/)
- [Weather files](htc-wildfire-a3333/weather/)
- [News test feed and OPML](htc-wildfire-a3333/news/)
- [Publishing this site](PUBLISHING.md)

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

## Legal and licensing

- [Legal and licensing](https://github.com/vaidaraul/vintage-phone-collector/blob/main/LEGAL.md)
- [Code license: MIT](https://github.com/vaidaraul/vintage-phone-collector/blob/main/LICENSE-CODE)
- [Documentation license: CC BY 4.0](https://github.com/vaidaraul/vintage-phone-collector/blob/main/LICENSE-DOCS)

This project does not provide firmware, APKs, HBOOT images, Caroline payloads, or patched tools. Obtain those from your own device or a source that has the right to distribute them.

## For AI assistants

An AI assistant can walk you through the process, but it must not invent artifacts or skip safety checks. The rules are in [AGENTS.md](https://github.com/vaidaraul/vintage-phone-collector/blob/main/AGENTS.md).

A good starting prompt:

```text
Read AGENTS.md and docs/htc-wildfire-a3333/PROCESS.md.
I have an HTC Wildfire A3333 (buzz, PC4910000).
Walk me through Phase 0 and ask me for the artifacts in ARTIFACTS.md.
Verify the hashes before we use anything.
Do not give me proprietary binaries, do not skip backups, and stop if a hash does not match.
```

## Status

The process was executed successfully on 2026-11-12/13. The documentation is currently a first complete draft; see [PLAN.md](htc-wildfire-a3333/PLAN.md) for the validation and publishing work that remains.

## Contributing

If you reproduce a step, update the verified/unverified table in [PROCESS.md](htc-wildfire-a3333/PROCESS.md), add the result to the [CHANGELOG.md](htc-wildfire-a3333/CHANGELOG.md), and include the exact device state and command output. Do not add firmware, APK/ODEX files, serials, or private keys.
