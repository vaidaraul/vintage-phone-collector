# Sports on the Lumia 535

This document covers both the original `Microsoft.BingSports` investigation and the
reverse-engineered replacement that now runs on the phone.

## 1. Original app (Microsoft.BingSports 4.25.11762.0)

The original app is installed and still launches, but every Sports backend is dead:

| Endpoint | Status |
| --- | --- |
| `sports.services.appex.bing.com` | no DNS |
| `appexsports-prod-*.cloudapp.net` | no DNS / 0.0.0.0 |
| `personalization.services.msn.com` (PDP) | no DNS |
| `ampconfigprod.blob.core.windows.net` (config update) | 404 |
| `iceprime_msnapp-iceprime-c2s.msedge.net/ab` | JSON 404 |
| `cdn.query.prod.cms.msn.com` | alive (CMS news/search) |
| `cdn.content.prod.cms.msn.com` | alive (ads 503) |
| `site.api.espn.com` | alive (public scoreboards) |

The app was pushed as far as:

- PDP, ad settings, A/B, config update and `AllSportsInfo` served from fixtures.
- `AllSportsInfo` is an `SdiResponse`: `{"Results":[...],"TimeStamp":"..."}`;
  `Results` is `List<object>`. An archived 2015
  `AllLeaguesV1.svc/Roster` capture confirms the format.
- The SDI converter recognizes `League` and `SportMetaInfo` items. A `League`
  item reaches the app's EndOfLife ("Goodbye") screen.
- EOL is config-driven; a global `AppEOLStartDate` (market `NULL`) of
  `2099-01-01` removes Goodbye.
- With EOL bypassed, the app still throws a `NullReferenceException` at
  `Microsoft.Msn.Sports!<BaseAddress>+0xc02917` inside the SDI converter,
  before the MyTeamsData/landing-page requests.

The remaining blocker is the exact `AllSportsInfo` `Results` wrapper (the field
at offset `0x18` of the intermediate schema object). It could not be resolved
because:

- The phone has no debugger/dump tooling (`dbghelp`, `procdump`, `WerFault`,
  `rundll32`, `comsvcs` are absent).
- Device Portal's user-mode dump APIs return 404 on this build.
- Modified DLLs are rejected by Code Integrity.
- Re-signing the appx with a self-signed cert and installing it through
  Device Portal fails with `0x80073CFF` (the SYSTEM deployment context has no
  per-user developer license). Sideload apps is selected, but the WDP
  deployment service still demands the license.
- The .NET Native image does not use the CoreRT/NativeAOT `RTR` metadata
  format, so the public TypeManager parsers do not apply.

The original app, DLL, XBFs and config remain on the phone; nothing was
uninstalled.

### Extracted Sports XBFs

The Sports `resources.pri` was parsed with `chausner/PriTools` and the XBFs
decompiled with `chausner/XbfTools`. The Sports-specific templates are:

- `Views/LandingPageDataTemplates.xbf`
- `Views/LeagueAndTeamTiles.xbf`
- `Views/ListClusterPanel.xbf`
- `Views/MatchupTiles.xbf`
- `Views/ScheduleTiles.xbf`
- `Views/MiscellaneousTiles.xbf`
- `Views/PlayerTiles.xbf`
- `Views/InlinedItemsTemplate.xbf`

The Today page is an `EntityCluster`: groups have a `Header` and `Items`; each
tile has `Data.Data` (the schema entity), `Data.ClickTarget`,
`Data.NavigateCommand`, and a template name (`LandingPageLiveTile`,
`LandingPageNonLiveTile`, `LandingPageScheduleGameTile`, `LeagueTile`,
`MyFavoriteTeamTile`, etc.). The theme is purple:

- `PrimaryColor` `#49409A`
- `PrimaryBrightColor` `#6B69D6`
- `PrimaryDarkThemeColor` `#A1A1F7`
- `Accent1` `#D13438`, `Accent2` `#10893E`, `Accent3` `#8CBD18`,
  `Accent4` `#FFB900`, `Accent5` `#FF8C00`, `Accent6` `#0099BC`
- dark surfaces `#101010` / `#1F1F1F`

## 2. Reverse-engineered replacement (web app)

Because the original app's converter could not be reconstructed and a native
UWP rebuild cannot be sideloaded, the replacement is a **static web app** that
reuses the original Sports theme and layout. It runs in Edge on the phone and
can be pinned to Start, so no deployment/developer-license gate is involved.

**URL:** <https://vaidaraul.github.io/vintage-phone-collector/sports/>

**Status:** live on Pages and pinned to Start on the Lumia 535 (2026-11-15).
The 30-minute workflow refreshes `news.json` and `scores.json` automatically.

### Features

- **Today** — hero story, Top Stories list, horizontal score strip.
- **Scores** — all leagues with match cards (team logos, scores, status).
- **News** — full sports news list.
- **Leagues** — 2-column league grid; tapping a league filters Scores.
- Side drawer with the same sections.
- Pull-to-refresh style refresh button; data cached in `localStorage` so the
  last feed still renders if the network is down.
- Auto-refresh every 5 minutes while the page is visible.

### Data sources

- **News:** Microsoft's public CMS search API
  (`https://cdn.query.prod.cms.msn.com/cms/api/amp/search`) with sports
  queries, filtered to sports articles by title/abstract keywords. The feed is
  normalized to the same `OneServiceArticleDataModel` shape the News app uses:
  `Title`, `Abstract`, `Url`, `PublishedDateTime`, `Provider`, `Images`.
- **Scores:** ESPN's public scoreboard API
  (`https://site.api.espn.com/apis/site/v2/sports/<sport>/<league>/scoreboard`)
  for Premier League, La Liga, Champions League, Liga I, NFL, NBA, MLB and NHL.
- **Images:** MSN image CDN (`img-s-msn-com.akamaized.net`) and ESPN
  (`a.espncdn.com`).
- **Generator:** `scripts/generate-sports-feed.mjs`; runs every 30 minutes in
  `.github/workflows/lumia-feed.yml` and writes
  `docs/sports/data/news.json` and `docs/sports/data/scores.json`.

### Install / pin on the phone

1. Open the URL in Edge on the Lumia.
2. Wait for the page to load.
3. Edge menu (`...`) → **Pin to Start** (or **Add to Start**).
4. The pinned tile uses the original Sports app icon and purple theme color.

No Store, developer license or sideloading is required.

### Limitations

- Article taps open the source site in Edge, not the original native reader.
- The layout is a close approximation of the original XAML, not a byte-for-byte
  port.
- ESPN scoreboards show the current/next fixtures; on a non-match day most
  scores are 0-0 and status is "Scheduled".
- The web app needs a network connection for first load; after that the last
  JSON is cached.
