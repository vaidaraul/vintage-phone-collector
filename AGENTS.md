# Instructions for AI assistants

This file tells an AI assistant how to help with this repository without inventing artifacts, leaking identifiers, or skipping safety steps.

## Read first

For the HTC Wildfire A3333 restoration, read:

1. [`docs/htc-wildfire-a3333/README.md`](docs/htc-wildfire-a3333/README.md)
2. [`docs/htc-wildfire-a3333/PROCESS.md`](docs/htc-wildfire-a3333/PROCESS.md)
3. [`docs/htc-wildfire-a3333/CHECKLIST.md`](docs/htc-wildfire-a3333/CHECKLIST.md)
4. [`docs/htc-wildfire-a3333/ARTIFACTS.md`](docs/htc-wildfire-a3333/ARTIFACTS.md)
5. [`docs/htc-wildfire-a3333/TROUBLESHOOTING.md`](docs/htc-wildfire-a3333/TROUBLESHOOTING.md)
6. [`LEGAL.md`](LEGAL.md)

For the Nokia Lumia 535, use [`devices/lumia-535/README.md`](devices/lumia-535/README.md).

## Hard rules

- Do not invent filenames, hashes, commands, or success claims.
- Do not provide HTC RUU, firmware, HBOOT, Caroline, APK/ODEX, patched tools, MISC images, or device identifiers. They are not in this repository and may not be redistributed.
- Do not ask for or publish serial numbers, IMEI, SD-card CID, GoldCard data, private keys, or private network details.
- Do not skip backups, recovery checks, or battery checks.
- Do not suggest `git push --no-verify` or bypass the pre-push guard.
- Do not run destructive phone commands without explicit user confirmation.
- If a hash or size does not match, stop. Do not “try it anyway.”
- Read `LEGAL.md` before giving publication or distribution advice. You are not a lawyer; say so when relevant.

## How to run the Wildfire process

1. Ask the user to confirm the device is an HTC Wildfire A3333 (`buzz`, model `PC4910000`).
2. Ask the user to supply the private artifacts listed in `ARTIFACTS.md`. Do not generate or download them.
3. Verify the size and SHA-256 of every artifact before use.
4. Follow `PROCESS.md` phase by phase. At each phase, ask for the expected output before moving on.
5. Use `CHECKLIST.md` as the progress tracker.
6. If something fails, use `TROUBLESHOOTING.md` and ask for the exact error text.
7. Remind the user that the S-OFF phase can brick the phone and that the Caroline payload is device-specific.

## What to say when asked for a missing file

Use a response like:

> That file is not in this repository because it is proprietary or device-specific. You need to obtain it from your own device or a source that has the right to distribute it. Here is the filename, size, and SHA-256 to verify: …

Do not offer to “find a download” for firmware, APKs, or patched bootloaders.

## Prompt template for a user

A user can start a session with:

```text
Read AGENTS.md and docs/htc-wildfire-a3333/PROCESS.md.
I have an HTC Wildfire A3333 (buzz, PC4910000).
Walk me through Phase 0 and ask me for the artifacts in ARTIFACTS.md.
Verify the hashes before we use anything.
Do not give me proprietary binaries, do not skip backups, and stop if a hash does not match.
```

## Publishing the docs

The site is built from `docs/` by `.github/workflows/pages.yml`. If you change the docs:

- Keep links relative inside `docs/`.
- Use absolute GitHub URLs for files outside `docs/` (for example, the device history).
- Do not add binaries, logs, serials, or private paths.
- Run the repository's pre-push guard before pushing.

## Useful checks

```bash
# Node syntax
node --check docs/htc-wildfire-a3333/scripts/emulate.js

# Python syntax
python3 -m py_compile docs/htc-wildfire-a3333/scripts/fastboot-caroline.py
python3 -m py_compile docs/htc-wildfire-a3333/scripts/extract-targets.py

# Shell syntax
sh -n docs/htc-wildfire-a3333/scripts/install-restored-apps.sh
sh -n docs/htc-wildfire-a3333/weather/weather-cgi.sh
sh -n docs/htc-wildfire-a3333/weather/forecast-data_v3.asp
sh -n docs/htc-wildfire-a3333/weather/lat-lon-search.asp

# Repository guard
node scripts/pre-push-guard.mjs --range origin/main..HEAD
```
