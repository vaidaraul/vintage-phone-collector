# Lumia 535 news app investigation

**Date:** 2026-11-13, updated 2026-11-14  
**Device:** Nokia Lumia 535 (RM-1089), Windows 10 Mobile `10.0.14393.2551`  
**Subject:** Microsoft News / MSN News UWP app (`Microsoft.BingNews` 4.25.11762.0)  
**Status:** The original app installs and launches. The UI shell is intact. Its content
feed does not load because the old stream service is gone. The recommended deployment is
the original app plus a **public HTTPS compatibility feed**, not a PC or local-WiFi
server. A PC-local shim is explicitly rejected.

This is an investigation record, not a completed restoration. The app was installed and
launched for testing, then removed again; the phone's OS, bootloader, firmware and
partitions were not changed.

## Executive summary

- The W10M News app is **not** blocked by Windows version or a certificate. It is a
  `Windows.Universal` ARM package with minimum version exactly `10.0.14393.0`, and it
  installs and starts on this phone.
- The app's shell, navigation, error handling and article reader are intact. The home
  screen fails on a **dead server endpoint**, not on the app binary.
- The old content stream host (`cdn.content.prod.cms.msn.com`) returns Akamai `503`
  "DNS failure". The old query/document APIs on `cdn.query.prod.cms.msn.com` are still
  live and still return **current** articles (verified 2026-11-13).
- The app loads its endpoint templates from an embedded SQLite config and accepted a
  modified `configuration.sqlite` without a signature failure. The local HTTP server used
  in this investigation was only a **development bench**; it is not the deployment plan.
  The production target is a public HTTPS static feed or edge function, so the app works
  on any network.
- The remaining blocker is the **composite stream JSON schema**. The app receives the
  local fixture but does not render it yet, so it falls back to its generic error
  screen. This is a schema-mapping problem, not a service-death problem.
- The app can skip its edition picker by setting `Platform_LanguageAndMarketString` in
  its `settings.dat` to `en-GB;GB;EN-GB`. With the feed endpoint pointed at
  `cdn.query.prod.cms.msn.com`, the app reached `Today` rather than the error screen at
  startup. That proves the live Microsoft query service is reachable; the live search
  array is simply not the composite-stream envelope the feed expects.

## What was tested

### Package facts

| Property | Value |
| --- | --- |
| File | `apk/Microsoft News v4.25.11762.0 [file.windowsviet.com].appx` |
| Size / SHA-256 | 24,765,728 bytes / `62CEE6993F11CF92348085C84DBD33455C0A3E9A52CDA78869EE5C615442216E` |
| Identity | `Microsoft.BingNews` |
| Version | `4.25.11762.0` |
| Architecture | ARM (bundle also contains x64 and x86) |
| Target | `Windows.Universal`, min `10.0.14393.0`, max tested `10.0.17134.0` |
| Entry point | `Microsoft.Msn.News.exe`, `Microsoft.Msn.News.App` |
| Package family | `Microsoft.BingNews_8wekyb3d8bbwe` |
| Installed full name | `Microsoft.BingNews_4.25.11762.0_arm__8wekyb3d8bbwe` |
| Runtime | .NET Native 1.6, VCLibs 140.00, Microsoft.Advertising.Xaml |
| Languages | EN-US, EN-GB, EN-AU, EN-CA, EN-IN, ES, AR, FR, ZH-HANS and others |

The local `apk/Deps` folder already contained the ARM dependency set used for the test:

- `Microsoft.NET.Native.Framework.1.6_1.6.24903.0.Appx`
- `Microsoft.NET.Native.Runtime.1.6_1.6.24903.0.Appx`
- `Microsoft.Advertising.Xaml_10.1808.3.0.Appx`
- `Microsoft.VCLibs.140.00_14.0.25426.0.Appx`

### Install and launch

- Installed with the Device Portal `POST /api/app/packagemanager/package` endpoint,
  uploading the signed Microsoft appx and the four ARM dependencies in one request.
- Deployment state returned `Success: true`.
- Launched with `POST /api/taskmanager/app` using the base64 `PackageRelativeId`
  (`Microsoft.BingNews_8wekyb3d8bbwe!AppexNews`) and the full package name.
- `Microsoft.Msn.News.exe` appeared in `/api/resourcemanager/processes` as user
  `DefApps`, using roughly 42-69 MB working set depending on state.

### First observed failure

The app opened its real shell (`Today`, hamburger, search) and then showed:

> **An error has occurred**  
> Try refreshing?  
> Refresh this page

Evidence:

- `captures/news-error-2026-11-13.jpg` (portrait)
- `captures/news-error-landscape-2026-11-13.jpg` (landscape; shows the app's real
  command bar and nav icons, so the failure is in content loading, not XAML startup)

### Network trace (Device Portal ETW)

The phone's ETW WinINet/WinHttp providers captured the News app's exact requests:

| Request | Result |
| --- | --- |
| `https://ampconfigprod.blob.core.windows.net/configcontainer/full/Microsoft.BingNews/4.25/11762.0/configuration.sqlite` | `404` |
| `https://cdn.content.prod.cms.msn.com/none/sources/alias/compositestreambyname/today?market=en-gb&tenant=amp&vertical=news` | `503` (Akamai "DNS failure") |
| `https://api.msn.com/data/news/interests/categories?...` | `503` |
| `https://cdn.appex-rf.msn.com/ecd/v1/en-gb/news/Sources.js?...` | certificate hostname mismatch / `400` |
| `https://cdn.appex-rf.msn.com/pd/v2/en-gb/news/partner.js?...` | certificate hostname mismatch / `400` |
| `https://cdn.content.prod.cms.msn.com/none/detail/alias/adsettingsbyname/...` | `503` |
| `https://notification.services.msn.com/registrations/news?...` | `404` |
| `https://iceprime_msnapp-iceprime-c2s.msedge.net/ab?...` | `404` |

The `cdn.appex-rf.msn.com` certificate mismatch is also reproducible from a PC, so it is
a server-side/CDN configuration problem, not a phone TLS problem.

## What still works

These were verified directly from the PC on 2026-11-13. They are the raw material for a
local replacement feed.

| Service | Test | Result |
| --- | --- | --- |
| Old CMS search | `cdn.query.prod.cms.msn.com/cms/api/amp/search?$filter='$type'eq'article'...` | `200`, current articles from 2026-11-13 |
| Old CMS document | `cdn.query.prod.cms.msn.com/cms/api/amp/document/AA2hnJaj` | `200`, full current article body |
| Image CDN | `img-s-msn-com.akamaized.net/tenant/amp/entityid/AA2houJh.img` | `200`, 1.28 MB JPEG |
| Old live tile | `cdn.content.prod.cms.msn.com/singletile/...` | `301` to `assets.msn.com/service/msn/livetile/singletile`, then `200` XML |
| Modern MSN feed | `assets.msn.com/service/news/feed/pages/channelfeed?...` | `200`, current articles |

The main stream endpoint is dead; the query/document/image pipeline behind it is not.
That is the key to a shim: synthesize the old stream envelope and let the original app
fetch documents and images from the still-live query service.

## How the app is configured

The package contains `Configuration/configuration.sqlite`, a single `Config` table with
1,495 rows. The app builds all requests from this table. Relevant defaults:

| Key | Default |
| --- | --- |
| `ContentServiceDomain` | `cdn.content.prod.cms.msn.com` |
| `QueryServiceDomain` | `cdn.query.prod.cms.msn.com` |
| `NewsDataServiceDomain` | `api.msn.com` |
| `BingNewsSaveNRefreshDomain` | `appex.bing.com` |
| `ImageUrlFormat` | `https://img-s-msn-com.akamaized.net/tenant/amp/entityid/{0}.img` |
| `ConfigurationUpdate` | `https://{TargetEnvironment}.blob.core.windows.net/.../configuration.sqlite` |
| `DefaultCategoriesEndpoint` | `/none/sources/alias/compositestreambyname/today` |
| `DefaultStreamEndpoint` | `/common/abstract/alias/compositestreambyname/today` |
| `DynamicStreamEndpoint` | `/common/abstract/alias/compositestreambyname/today_dynamic` |
| `CategoryStreamEndpoint` | `/common/abstract/id/{CategoryContentId}` |
| `InterestsCategories` | `https://{NewsDataServiceDomain}/data/news/interests/categories` |

There is **no global end-of-life date** in the packaged config. The only `AppEOL*`
entries are for `zh-cn` (2016). The generic error is the app's content-loading error,
not the `EndOfLife` screen.

## Lab shim experiment (development only)

A temporary local HTTP service was run on the project PC at `192.168.1.137:8080`. This
was a reverse-engineering bench, not the intended product. The installed
`configuration.sqlite` was edited (with a backup) to point the config update, stream,
category, `Sources.js`, `partner.js` and ad-settings templates at that server, changing
only those templates from `https://` to `http://`.

Result:

- The app launched with the modified config. Windows did not reject the package or
  trigger a signature/integrity failure in this build.
- The app requested the local server:
  - `/config/configuration.sqlite`
  - `/none/sources/alias/compositestreambyname/today`
  - `/data/news/interests/categories`
  - `/ecd/v1/en-gb/news/Sources.js`
  - `/pd/v2/en-gb/news/partner.js`
  - `/none/detail/alias/adsettingsbyname/...`
- The app still ends on the same error screen when the local stream fixture is not in
  the exact expected shape. This confirms the shim path is wired correctly; only the
  stream schema is unresolved.

Attempted stream shapes that did **not** render (kept here to avoid repeating them):

- empty array;
- array of `NewsCategory`-style objects;
- object with `Categories` / `NewsCategories` / `Sources` / `StreamSources`;
- object with `streamBody` + `streamElements` + `entityList` + article fields;
- array of cluster objects with `entityList` / `items` / `clusterItems`;
- array of `StreamSource` objects with `streamDocument`;
- object with `sourceMetadata` + `feedItems`.

The app's own data model strings point at the remaining names to try: `StreamBodyDetails`,
`StreamEntityClusterData`, `EntityClusterData`, `StreamElements`, `StreamNextList`,
`StreamLinks`, `StreamDetails`, `EntityList`, `ClusterItems`, `FeedItems`,
`SourceMetadata`, and `CategoryContentId`. The next step is to obtain a real historical
`streamBody` response or recover the model contract from the native metadata, then map
current `cdn.query` documents into it.

## Deployment decision: no PC, no local WiFi

The final design must not depend on the project PC or on the phone being on the same
network. The HTC precedent is the reason: a compatibility service tied to a local
machine is not a usable restoration.

Chosen deployment:

```text
phone app -> public HTTPS static feed (GitHub Pages, Azure Static Web Apps, or an
          edge function)
          -> feed generated by a scheduled job from Microsoft's live query API
          -> article documents and images still fetched from Microsoft's live CDN
```

Why this is the best option:

- The original app remains the exact UI and reader.
- It works on WiFi or cellular anywhere; there is no PC and no LAN dependency.
- A static feed has no always-on server process to keep alive. A scheduled GitHub
  Action or equivalent refreshes the JSON; if the job fails, the last feed remains
  available instead of breaking the app.
- Only the feed envelope is custom; article pages, images and metadata come from
  Microsoft's live services.
- If hosting is ever lost, the app degrades to its current error screen, not to a
  "works only at home" state. The feed can be republished anywhere.

The local server in `tools/news-shim` is therefore a **test bench only**. It is useful
for recovering the schema, but it must not be the shipped solution.

## Options for an exact news app

### A. Revive the original binary with a public compatibility feed (recommended)

**Fidelity:** exact UI, exact article reader, exact navigation.  
**Work:** medium; blocked only on the stream schema.  
**How:** keep the Microsoft-signed app and point only the dead feed endpoints at a
public HTTPS URL. A scheduled job generates the old-schema stream from `cdn.query`
current articles and publishes it as a static file (or a small edge function). Article
documents and images continue to come directly from Microsoft's live CDN, and the dead
`Sources.js` / `partner.js` / ad-settings responses are replaced with static fixtures.

Advantages:

- No need to rebuild XAML, styles, animations, reader, slideshow or video player.
- The app already runs on the phone and its shell is proven.
- Works on any WiFi or cellular network; no PC, Raspberry Pi or local DNS.
- The live query API still returns current articles, so the feed can stay current.
- A static feed can be re-hosted cheaply or moved to another provider.

Risks / open questions:

- Need the exact `streamBody` / `entityCluster` contract.
- Need a deployment method for the config: a modified package config (worked in
  testing) or a one-time post-install config patch. No local proxy is required.
- Ads and telemetry endpoints are dead or misconfigured; stub them or disable them.
- A static feed has a refresh interval (for example 15-30 minutes). That is acceptable
  for a news home screen; article links still go to live content.
- The feed host needs a TLS certificate the phone trusts. Test the phone's root store
  before choosing GitHub Pages (Let's Encrypt) versus Azure (DigiCert), or install the
  CA once if necessary.

### B. Rebuild the app with the original UI assets

**Fidelity:** can be made close, not guaranteed exact.  
**Work:** high.  
**How:** use the 56 XBF files in the package (already decompiled successfully with
`chausner/XbfTools` to XAML in a temporary folder), reuse the styles/templates/assets,
and write a new data layer against the modern MSN feed.

Advantages:

- No dependence on the old binary or its schema.
- Can use the modern `assets.msn.com` feed and the live query API.

Risks:

- The main pages (`ShellPage`, navigation, view models) are code-generated; the XBF
  files are mostly controls/templates. The app's logic is .NET Native, not
  decompilable to C#.
- Rebuilding the interaction model (pivot, hamburger, continuous reading, live tile)
  is a substantial UWP project.
- "Exactly" would be an approximation, not the original app.

### C. Web wrapper or RSS reader

**Fidelity:** low.  
**Work:** low.  
**How:** point a WebView at `www.msn.com`, or write a simple RSS reader.

This is not recommended if the goal is the original News experience.

## Recommended next step

Continue with **Option A**, but build for a public host from the start. The
highest-value task is still to recover one real `streamBody` response, then use it as a
contract fixture. Possible sources:

1. Internet Archive / Common Crawl captures of the old stream URL (the archive was
   temporarily offline during this investigation).
2. A cached response from a device that used the app before the shutdown (the app's
   `Cache/cachedb.sqlite` uses an `original_uri` column).
3. The app's native metadata: `StreamBodyDetails`, `StreamEntityClusterData`,
   `EntityClusterData`, `StreamElements`, `StreamNextList`, `StreamLinks` and
   `StreamDetails` are the likely contract names.
4. Iterate against the **development bench** using the phone screenshot loop and the
   app's error state; once a fixture renders, freeze it as the schema. Do not ship the
   bench.

After a fixture works, publish it and leave the PC out of the path:

```text
phone app -> public HTTPS /none/sources alias (static JSON or edge function)
          -> scheduled job queries cdn.query.prod.cms.msn.com
          -> job wraps current documents in the recovered stream envelope
          -> app fetches /cms/api/amp/document/{id} and images from the live CDN
```

The edition picker can be skipped without touch by setting
`Platform_LanguageAndMarketString` in the app's `settings.dat` to `en-GB;GB;EN-GB`.
That is a one-time setup step in the config-patcher, not a local server dependency.

## Bonus: screenshot capture on this phone

The 14393 Device Portal still has no screenshot endpoint, but the phone's own
`C:\Windows\System32\ScreenCapture.exe` works from an elevated telnet shell:

```text
ScreenCapture.exe C:\Data\Temp\shot.jpg
copy C:\Data\Temp\shot.jpg C:\Data\Users\Public\Documents\shot.jpg
```

The file can then be downloaded from the Device Portal `Documents` known folder:

```text
GET /api/filesystem/apps/file?knownfolderid=Documents&filename=shot.jpg
```

This is more reliable than Project My Screen on this build and is useful for future
app testing, not just News.

## Artifacts

| Artifact | Purpose |
| --- | --- |
| `captures/news-audit.json` | Machine-readable summary of package facts, endpoint checks and shim results |
| `captures/news-error-2026-11-13.jpg` | Portrait error screen |
| `captures/news-error-landscape-2026-11-13.jpg` | Landscape error screen showing the intact shell/nav |
| `tools/news-shim/server.js` | Development-only fixture server; not the deployment target |
| `tools/news-shim/make-config.js` | Rewrites a copy of the app's `configuration.sqlite` for testing |
| `tools/news-shim/README.md` | How to repeat the lab experiment |

## Limits of this pass

- The feed was not made to render. The report documents the blocker and the working
  parts; it does not claim a finished restoration.
- The app was installed with Microsoft's signature plus the local dependencies; the
  modified config was a test-only change. The app was removed after the test.
- No exhaustive search for a historical stream capture was completed; the Internet
  Archive was unavailable during the session.
- The `Sources.js` / `partner.js` / ad-settings payloads were stubbed with empty
  fixtures; their real schemas were not recovered.
- No OS, firmware, bootloader or partition changes were made.

## 2026-11-14 follow-up: error-detail breakthrough and contract findings

The app was reinstalled and kept on the phone. The hardcoded PDP URL in
`Microsoft.Msn.News.dll` was redirected to a public fixture, and the app's hidden
error detail was surfaced. This produced the first exact deserialization errors and
several contract facts.

### Surfacing the hidden error detail

The `Microsoft.Msn.Shell.Controls.Error` control uses a custom
`local:AutomationStackPanel` and compiled `x:Bind` against its own `ViewModel`
(`ViewModel.ErrorText`, `ViewModel.ErrorSource`, `ViewModel.ErrorDetailText`,
`ViewModel.ShowErrorDetail`). The `ErrorViewModel` is not the control's DataContext
(the DataContext is `Microsoft.Msn.Shell.Controls.Chrome`).

Recompiling the whole control with XbfKit broke `{ThemeResource}` /
`{StaticResource}` markup extensions, so the original XBF was patched at the
instruction level instead:

- Read the original `Error.xbf` with `XbfDocumentReader`.
- Insert four instructions before the TextBox `EndInitPopScope`:
  `PushScopeCreateTypeBeginInit` (Binding, stable id 564),
  `SetValueConstant` (Binding.Path, id 493, shared string `ErrorDetailText`),
  `EndInitPopScope`,
  `SetValueFromMarkupExtension` (TextBox.Text, id 981).
- Add a top-aligned `TextBlock` bound with
  `<Binding ElementName="RootError" Path="ViewModel.ErrorDetailText" />`; the root
  control gets an `x:Name` via the `SetName` opcode.
- Write the document back with `XbfDocumentWriter`. The original custom panel type
  and all resource markup extensions are preserved.

This revealed, in order:

```text
Newtonsoft.Json.JsonSerializationException: Cannot deserialize the current JSON object
(e.g. {"name":"value"}) into type
'Microsoft.Msn.News.DataModels.Explore.ExploreSectionCollectionDataModel' because the
type requires a JSON array (e.g. [1,2,3]) to deserialize correctly.
Path 'ViewType', line 1, position 12.
```

The categories endpoint (`ExploreSections`, config id 170) must return a **JSON
array**. An empty array is accepted; the app then proceeds to the stream endpoints.

```text
Newtonsoft.Json.JsonSerializationException: Cannot deserialize the current JSON array
(e.g. [1,2,3]) into type
'Microsoft.Msn.News.DataModels.Streams.StreamCollection' because the type requires a
JSON object (e.g. {"name":"value"}) to deserialize correctly.
Path '', line 1, position 1.
```

The default stream/categories endpoint (config id 108, `compositestreambyname/today`)
must return a **JSON object** of type `StreamCollection`.

### Configuration facts

| Id | Name | Role |
| --- | --- | --- |
| 108 | `DefaultCategoriesEndpoint` / `URLTemplate` | Today stream; `compositestreambyname/today` |
| 114 | `DefaultStreamEndpoint` / `URLTemplate` | default stream; `compositestreambyname/today?count=...` |
| 170 | `ExploreSections` / `URLTemplate` | categories list; `data/news/interests/categories` |
| 173 | `ExploreSectionContents` / `URLTemplate` | category details; `.../categories/{CategoryId}` |

The PDP response is normalized by the app into this shape (observed in
`Cache/cachedb.sqlite`):

```json
{
  "TopicList": [],
  "PerMarketCategories": [{ "Market": "EN-GB", "CategoryList": [] }],
  "SourceDefinitionList": [],
  "IsPersonalizationEnabled": true,
  "PersonalizedInterests": [ ... ]
}
```

Supplying `PerMarketCategories` directly in the PDP response did not populate
`CategoryList`; the app appears to build that list from the categories endpoint. The
exact `ExploreSectionDataModel` item schema is still unresolved. PascalCase,
camelCase, `Category`, `CategoryList`, `BingNewsCategory`, and Adaptive Card
(`type`/`body`/`actions`) item shapes were all accepted without error but produced no
category.

### The Top Stories tab

With the original DLL, `categories-array2.json`, and a stream whose `summary` was
`"Top Stories"`, the Today Pivot rendered **My News / My Sources / Top Stories**.
The tab could not be selected without touch input and was not consistently
reproducible after switching the stream fixture. It confirms the category pipeline
can reach the Pivot, but the stream body still renders empty.

### Live CMS findings

- `cdn.content.prod.cms.msn.com` (the configured `ContentServiceDomain`) is dead
  (503 DNS failure).
- `cdn.query.prod.cms.msn.com` is alive. It serves:
  - `cms/api/amp/compositeStream/{id}` — a compositeStream definition with
    `_links.sources` pointing at `topicStream` / `list` documents.
  - `cms/api/amp/topicStream/{id}` and `cms/api/amp/list/{id}` — definitions, not
    resolved article lists.
  - `cms/api/amp/search?$filter=...` — live article documents (real content works).
- The modern web feed is live and returns real articles:
  `https://assets.msn.com/service/news/feed?$top=5&market=en-gb&query=topstories`
  (the public web feed also requires a public API-key query parameter, omitted here)
  → `value[0].subCards[]` with id, type, title, abstract, url, images, provider,
  publishedDateTime. This can be the content source for a generated feed.

### Current phone state

- Installed DLL: original unpatched `Microsoft.Msn.News.dll` (restored after a
  patched build temporarily failed to start during an OS update).
- Installed config: a test config pointing at public `lumia-news-feed-test3`
  fixtures; the original config is preserved on the PC.
- Installed `Error.xbf`: the diagnostic version with the visible
  `ViewModel.ErrorDetailText` TextBlock. The original 1,820-byte file is in
  `D:\Pictures\Camera Roll\Error.xbf`.
- Sleep timeout: restored to 180 seconds. Display timeout: still 10 seconds at the
  last check; the phone went offline during the restore.
- The phone was intermittently offline/rebooting (Windows Update components ran);
  the Device Portal file upload often returns 500 "Access is denied" but the file
  still lands in `Documents`. The portal's upload to `CameraRoll` is less reliable.

### Next moves

1. When the phone is back online, restore the display timeout to 180 and either
   restore the original `Error.xbf`/config or continue with the diagnostic build.
2. Recover the `StreamCollection` envelope. The strongest remaining candidates are
   a PascalCase `StreamBody`/`StreamEntities` object and a `Streams` dictionary keyed
   by stream name (`today`, `topStories`). The app metadata names are `StreamBody`,
   `StreamEntities`, `StreamElements`, `EntityList`, `TemplateClass`, `StreamNext`,
   `StreamNextList`, `StreamLinks`, `StreamDetails`, `MainStreamLinks`,
   `TopicStreams`, and `TopicStreamsByTerm`.
3. Generate real content from the live `assets.msn.com` feed and wrap it in the
   recovered stream envelope. Keep the production path public HTTPS only.
4. Clean up the phone: restore the original `Error.xbf`, restore the original
   config, remove test fixtures, and restore the display timeout.
