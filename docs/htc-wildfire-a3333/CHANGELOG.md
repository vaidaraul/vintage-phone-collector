# Changelog

## 0.4 — 2026-11-13

- Added `NEWS.md`: HTC NewsReader is a real RSS/Atom reader with add-by-URL and OPML import.
- Added `news/test-feed.xml`, five local article pages, and `news/handpicked.opml`.
- Verified on the phone: BBC News loads 36 fresh headlines through an HTTPS redirect; CNN's preinstalled feed loads 50 stale items from April 2023; Yahoo!, Engadget, and CNET's preinstalled URLs are dead.
- Documented that HTTPS is not universally broken on Froyo: BBC works, CNN's HTTPS endpoint failed a TLS handshake.
- Added the on-device test plan; the local-feed UI test is still pending.

## 0.3 — 2026-11-13

- Recorded Skater Boy 1.6 as playable but marginal using a re-signed timing-cap build: about 0.75x at the Wildfire's ~19 FPS, with full speed above ~25 FPS.
- Documented the stock 1/35 s clamp, the rejected raw-delta 1x experiment, the recommended 0.04 s cap, APK/DEX hashes, and the reinstall/data-restore caveat.
- Updated the game summaries in the guide and device history.

## 0.2 — 2026-11-13

- Added MIT code license and CC BY 4.0 documentation license.
- Added `LEGAL.md` with the distribution and copyright boundaries.
- Added `AGENTS.md` with rules and a prompt template for AI assistants.
- Added a GitHub Pages workflow and `docs/_config.yml`.
- Added `docs/PUBLISHING.md`.
- Made the published docs self-contained by using absolute GitHub links for files outside `docs/`.

## 0.1 — 2026-11-13

- First complete draft of the user-facing process documentation.
- Added the overview, end-to-end process, weather design, troubleshooting, artifacts/hashes, checklist, and documentation plan.
- Added the `scripts/` and `weather/` folders so the guide is self-contained.
- Recorded the verified final state: WWE Froyo `2.22.405.1`, HBOOT `6.01.1002`, `security: off`, CWM `5.0.2.0`, BusyBox `su`, full stock app set, phone-local weather.
- Marked the pre-S-OFF and VPS sections in the device history as historical.
- Added the corrected backup hashes, including the pre-debloat `rooted-system.img` and the current `restored-system.img`.
- Added `GAMES.md`: Doodle Jump 1.3.0 verified working; Angry Birds 3.1.0 and the 1.0 KA3D port blocked by missing OpenGL ES 2.0/`hw3dc` support.

## Next

- Second-person test on a clean device.
- Screenshots and expected command outputs.
- `check-artifacts` and `verify-phone` scripts.
- Raw image restore test.
