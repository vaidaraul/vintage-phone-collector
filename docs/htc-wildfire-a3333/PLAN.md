# Documentation plan

**Goal:** any owner of an HTC Wildfire A3333 should be able to follow one document from a stock phone to the final rooted, S-OFF, WWE Froyo device with working HTC Weather — without asking the original author for help.

This plan turns the current engineering notes into a tested, reproducible process.

## Current state

- A first complete draft exists:
  - [README.md](README.md) — overview and process map.
  - [PROCESS.md](PROCESS.md) — end-to-end procedure.
  - [WEATHER.md](WEATHER.md) — phone-local weather design.
  - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — known failure modes.
  - [ARTIFACTS.md](ARTIFACTS.md) — files and hashes.
- The process was executed successfully on one device on 2026-11-12/13.
- The capture script is parameterized; some example paths remain in the prose.
- The guide has not been followed by a second person.
- The direct Windows-only S-OFF path is unverified.
- There are no screenshots or expected-output captures yet.

## Audience

Assume the reader:

- owns the correct phone model;
- can open a terminal and copy commands;
- can install drivers and basic tools;
- has never used fastboot, a custom recovery, or a bootloader exploit;
- does not know what S-OFF, CID, ODEX, or a nandroid backup means.

The guide must explain those terms the first time they appear.

## Definition of done

The documentation is done when:

1. A second person with basic command-line experience completes the process on a clean Wildfire A3333 using only the docs.
2. Every command is copy-pasteable after replacing clearly marked placeholders.
3. Every risky step has a checkpoint, expected output, and a recovery action.
4. The guide has been tested on at least two clean installs, or one clean install plus a full restore-and-repeat cycle.
5. All hashes and file sizes match the artifacts used in the test.
6. No serial numbers, IMEI, SD-card CID, private keys, or copyrighted binaries are in the repository.
7. The troubleshooting section covers every failure the testers hit.
8. The final checklist passes after a reboot.

## Work breakdown

### P0 — Content and structure (mostly done)

- [x] Write the overview and process map.
- [x] Write the end-to-end process.
- [x] Write the weather design.
- [x] Write the troubleshooting draft.
- [x] Write the artifact/hash table.
- [ ] Review the draft for contradictions with the engineering log.
- [x] Mark the outdated claims in the device README as historical or superseded.

### P1 — Make the process runnable

- [x] Parameterize `capture-fastboot.ps1` and `emulate.js` so they do not hardcode `E:\Projects\HTC`.
- [x] Add a single `scripts/` folder with the helper scripts used by the guide.
- [ ] Add a `check-artifacts.sh` / `check-artifacts.ps1` that verifies sizes and SHA-256 values.
- [ ] Add a `verify-phone.sh` that runs the final checklist and prints pass/fail.
- [ ] Replace every absolute path in the docs with `$WORK` / `%WORK%` placeholders.
- [x] Add a one-page printable checklist.
- [x] Add a "stop here" decision table for readers who only want root or only want an unbranded ROM.

### P2 — Test and harden

- [ ] Dry-run the guide on a second Wildfire A3333, or on the same phone after a full restore to the Vodafone baseline.
- [ ] Record every command output and compare it with the expected output in the guide.
- [ ] Test the recovery path: nandroid restore, raw image restore, RUU fallback.
- [ ] Test the weather stack after a clean reboot, on Wi-Fi and mobile data.
- [ ] Test with DNS broken (the original home-DHCP case).
- [ ] Test the app restore from the pre-debloat image.
- [ ] Record the time each phase takes.
- [ ] Add screenshots or photos for:
  - USB debugging;
  - the FASTBOOT screen;
  - ClockworkMod backup/restore;
  - the Weather app after a successful refresh;
  - the final `su -c id` output.
- [ ] Have a second person follow the guide without help; log every question and fix the doc.

### P3 — Publish and maintain

- [ ] Add a version number and changelog to the docs.
- [ ] Add a "last verified" date and device state to each page.
- [ ] Add a link checker to the repository checks.
- [ ] Add an issue template for "the guide did not work" with the required diagnostics.
- [ ] Decide whether to publish a PDF or a static site.
- [ ] Add a short video walkthrough if the audience needs it.
- [ ] Re-verify the Open-Meteo IPv4 note every few months.

## Test matrix

| Dimension | Cases |
| --- | --- |
| Device | Wildfire A3333 `buzz`, HBOOT 1.01.0001, HBOOT 1.01.0002 |
| Original firmware | Vodafone 2.24.162.1, generic WWE 2.22.405.1 |
| CID | `VODAP102`, generic HTC CID, SuperCID after S-OFF |
| Host | Windows 10/11 + Linux, Linux-only (if a direct S-OFF path is found) |
| USB | Rear USB 2.0 port, USB 3 port, powered hub, direct cable |
| Network | Home Wi-Fi with working DNS, home Wi-Fi with broken DNS, mobile data, no network |
| Recovery | Nandroid restore, raw image restore, RUU fallback |

The verified column is currently one device. Mark every other case as "not tested" until someone reproduces it.

## Documentation style

- Use phases with a clear goal and a "stop if" box.
- Put the expected output after every command.
- Use checklists for destructive steps.
- Use placeholders: `$WORK`, `$ADB`, `$FASTBOOT`, `<DEVICE_SERIAL>`, `<OPEN_METEO_IPV4>`.
- Never use a real serial, IMEI, CID, or private path in an example.
- Keep long logs in collapsible sections or separate files.
- Explain a term the first time it appears.
- Prefer one command per line; avoid long compound commands that hide failures.
- State whether a step is verified, unverified, or historical.
- Keep the engineering log and the user guide separate. The guide should not send the reader into a 300-line historical investigation unless they want the background.

## Maintenance

- **Versioning:** `docs/htc-wildfire-a3333/CHANGELOG.md` with dates and changes.
- **Verification date:** update the "last verified" line when the full process is repeated.
- **Open-Meteo IP:** the only expected external change. Add a note to the troubleshooting page and a check script.
- **Link checks:** run before each release.
- **Hash checks:** re-run `check-artifacts` against the private artifact folder.
- **Review cadence:** once a year, or when a tool/driver/OS change breaks a step.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| A reader bricks the phone | Prominent warnings, backup-first checklist, recovery drill, correct-payload warning |
| A reader uses another device's Caroline stub | Model check at the start, payload size/hash check, explicit "do not use on other models" |
| Windows driver problems block the process | Document the Frida capture path; provide a Linux-only alternative if possible |
| The reader cannot run unrevoked3 (32-bit GTK) | Document the 32-bit dependencies and a VM option; test a Windows build |
| The guide drifts from the engineering log | Keep a single source of truth for hashes and update both docs together |
| Copyrighted binaries leak into the repo | Keep artifacts private; pre-push guard; docs refer to filenames and hashes only |
| Open-Meteo changes its IP or CSV format | Add a check script and a troubleshooting entry; document the update procedure |
| A restored app crashes because its data is gone | Explain that the system backup is not a userdata backup; add "clear data" steps |

## Open questions

1. Should the guide be published as Markdown only, a printable PDF, or a small static site?
2. Do you want screenshots/photos, or is text enough?
3. Do you have a second Wildfire A3333 (or a spare) for a clean test?
4. Should the direct Windows 7/10 Revolutionary path be tested, or is the Linux replay the only supported path?
5. Should the guide include a video walkthrough?
6. Do you want the private artifacts mirrored somewhere with hashes, or kept only on the build machine?

## Immediate next actions

1. Review `PROCESS.md` against the private engineering log and fix any contradiction.
2. Parameterize the capture scripts and add the artifact check script.
3. Run the full guide on a clean device or after a full restore.
4. Add screenshots and expected outputs.
5. Have a second person follow it and log every question.
