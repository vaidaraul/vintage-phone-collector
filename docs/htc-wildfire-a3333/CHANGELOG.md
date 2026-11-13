# Changelog

## 0.9 — 2026-11-13

- Verified HTC Mail Gmail sending as well as receiving: a test message sent from the phone arrived in the same Gmail inbox.
- Updated the modern-web notes and device history to record both directions.

## 0.8 — 2026-11-13

- Verified HTC Mail with Gmail on the phone: App Password, `imap.gmail.com:993` SSL/TLS, `smtp.gmail.com:587` TLS; the Inbox synced.
- Documented the `imap.google.com`/`smtp.google.com` hostname mistake that causes `UnknownHostException`.
- Updated the modern-web notes and device history with the working Gmail setup.

## 0.7 — 2026-11-13

- Added `MODERN-WEB.md`: Google account sign-in is permanently blocked on Android 2.3.7 and lower; Play Store is not usable; modern browsing has workarounds.
- Tested Opera Mini 7.6.4 on the phone: it installs, launches, and loads Google.
- Tested Firefox 31.3.0esr ARMv6: it installs but crashes on launch; not recommended.
- Documented WebOne as the stock-browser proxy option, with security caveats.
- Tested HTC Mail: Gmail IMAP/SMTP still accept TLS 1.0; Outlook, Yahoo, and iCloud require TLS 1.2.
- Recorded the News widget as verified working.

## 0.6 — 2026-11-13

- Added `CASUAL.md`: iBeer FREE 1.28, Lighter 8.0, and Candle 6.2 (versionCode 19) verified working with their tilt, touch, flame and blow-to-extinguish functions.
- Documented the Froyo-compatible builds, APK hashes, BMA150 accelerometer/microphone use, ad-supported status, and the later `minSdk 9` builds that do not install.
- Updated the documentation index, guide overview, and device history.

## 0.5 — 2026-11-13

- Recorded the final on-phone feed set: BBC News plus BBC World/Technology/Science/Business/Sport, Ars Technica, Engadget, ScienceDaily, and Universe Today.
- Confirmed Ars Technica works in NewsReader via its plain-HTTP URL; the browser TLS dialog was a subresource issue, not a feed failure.
- Removed the local test feed from the recommended set; it remains a diagnostic only.
- Updated `recommended.opml` to nine feeds and removed the local test entry from `handpicked.opml`.
- Updated the news notes, README, and device history with the final counts.

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
