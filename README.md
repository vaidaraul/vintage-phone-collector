# Vintage Phone Collector

A hands-on mobile technology preservation project: collecting, restoring and documenting vintage phones, legacy operating systems, and the applications and games that made them memorable.

> **Preserve the original experience wherever possible. Restore what can be restored. Document what cannot.**

## Devices

Each device has its own restoration log. This page is only the project index; identity details, compatibility results, limitations and sources live with the device.

| Device | Platform | Current state | Log |
| --- | --- | --- | --- |
| Nokia Lumia 535 (RM-1089) | Windows 10 Mobile `10.0.14393.2551` | Running; 15 of 24 HTC-list games installed, 14 launch-confirmed; Minecraft APPX installs but does not start | [Lumia 535](devices/lumia-535/README.md); [Game suite](devices/lumia-535/GAMES.md) |
| HTC Wildfire A3333 | Android 2.2.1 Froyo with HTC Sense | Rooted, S-OFF, WWE Froyo, full stock app set restored; HTC Weather phone-local; News working with BBC topics, Ars Technica, Engadget, ScienceDaily, and Universe Today | [Wildfire A3333](devices/htc-wildfire-a3333/README.md) · [Process guide](docs/htc-wildfire-a3333/PROCESS.md) · [News notes](docs/htc-wildfire-a3333/NEWS.md) |

Other devices in the collection, not yet documented: HTC Desire, Apple iPhone 6 and 6S, Samsung Corby, Vodafone Smart 858, Huawei P8 Lite, and other early Android and feature phones.

## Repository layout

```text
README.md                     project index (this file)
AGENTS.md                     instructions for AI assistants
LEGAL.md                      copyright, licensing, and distribution notes
LICENSE-CODE                  MIT license for the original code
LICENSE-DOCS                  CC BY 4.0 license for the documentation
.github/workflows/pages.yml   GitHub Pages deployment
.githooks/pre-push            local secret and binary guard
.opencode/skills/             reusable OpenCode workflows
codex-skill/                  reusable Codex workflow instructions
docs/                         user-facing process documentation
scripts/                      pre-push guard and its tests
devices/
  lumia-535/                  Windows Phone / Windows 10 Mobile log
  htc-wildfire-a3333/         Android Froyo log
    mock-server/              compatibility backend and tests
```

## Documentation

The user-facing process docs live in [`docs/`](docs/README.md). The HTC Wildfire A3333 guide starts at [`docs/htc-wildfire-a3333/README.md`](docs/htc-wildfire-a3333/README.md), with the end-to-end procedure in [`PROCESS.md`](docs/htc-wildfire-a3333/PROCESS.md).

The device logs under `devices/` remain the historical record. They may contain pre-restoration observations and superseded plans; the process docs are the current, tested procedure.

The docs are also published as a static site by [`.github/workflows/pages.yml`](.github/workflows/pages.yml); see [docs/PUBLISHING.md](docs/PUBLISHING.md).

## Legal and licensing

- [Legal and licensing](LEGAL.md)
- Code: [MIT](LICENSE-CODE)
- Documentation: [CC BY 4.0](LICENSE-DOCS)

This repository does not provide firmware, RUU payloads, HBOOT images, APK/ODEX files, Caroline payloads, or patched proprietary tools. Obtain those from your own device or a source that has the right to distribute them.

## For AI assistants

[`AGENTS.md`](AGENTS.md) defines the rules an AI assistant should follow: read the process, ask the user for private artifacts, verify hashes, do not invent files, and do not skip backups or safety checks. The documentation index includes a ready-to-use starting prompt.

## Project principles

1. **Preserve before replacing.** Original hardware and software have historical value.
2. **Understand before modifying.** Identify the device, firmware, OS, package type and dependencies before changing anything.
3. **Prefer authentic experiences.** A period-correct application is preferable to a modern substitute when the goal is preservation.
4. **Keep working installations safe.** Avoid unnecessary OS, firmware, bootloader or partition modifications.
5. **Test on real hardware.** Manifest inspection and emulation are useful, but they do not replace on-device testing.
6. **Document failures as well as successes.** An installation error or a game that launches only once is useful compatibility information.
7. **Preserve provenance.** Record where packages came from and whether their authenticity is known.
8. **Share reproducible knowledge.** Keep procedures and findings useful to other device owners.

Across the project, inspection is read-only until a verified recovery path exists. Bootloader unlocks, firmware replacements and partition edits are never assumed to be reversible; each requires an explicit, device-specific decision.

## Publication rules

- Do not commit copyrighted application or game packages, firmware images, ROMs, or APK/ODEX/APPX binaries.
- Do not publish device serials, SD-card CIDs, GoldCard headers, raw captures, credentials, or vendor parameters.
- Keep private network details and private location data out of the repository.
- Separate observed behavior from hypotheses, and record the date and source for each new fact.
- A local DNS override or network redirect is a lab harness; do not present it as a production architecture.

## Adding a device

1. Create `devices/<device-slug>/README.md`.
2. Record identity, original software, current state, restoration steps, compatibility results, limitations, and sources.
3. Add a row to the device table above.
4. Put any compatibility service under `devices/<device-slug>/` with its own README, tests and deployment notes.
5. Do not assume that a procedure verified on one model applies to another.

## Local development guard

Every clone should enable the repository's pre-push hook once:

```sh
git config core.hooksPath .githooks
```

Before each push, the hook scans the commits being pushed for credentials, device identifiers, private keys, and phone packages. Run the same check manually with:

```sh
node scripts/pre-push-guard.mjs --range origin/main..HEAD
```

`main` is also protected on GitHub: force pushes and branch deletion are blocked for everyone, including administrators. The full checklist is in [`.opencode/skills/pre-push-guard/SKILL.md`](.opencode/skills/pre-push-guard/SKILL.md).

## Codex workflow

The reusable instructions are in [`codex-skill/vintage-phone-collector/SKILL.md`](codex-skill/vintage-phone-collector/SKILL.md). They define a cautious, repeatable workflow for inspection, package analysis, device testing and documentation.

**Last updated:** November 13, 2026.
