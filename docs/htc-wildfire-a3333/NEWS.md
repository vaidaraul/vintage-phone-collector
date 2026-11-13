# HTC News and handpicked RSS feeds

**Status:** verified on one HTC Wildfire A3333 on 2026-11-13. BBC News loads current headlines; CNN's legacy feed loads 2023 articles; Yahoo!, Engadget, and CNET's preinstalled URLs are dead. The app accepts handpicked feeds by URL and OPML.

This page answers one question: can the stock HTC News app on the Wildfire A3333 load a feed you choose yourself? **Yes.** The app is a real RSS/Atom reader with an "Add from URL" screen and OPML import. The preinstalled BBC feed proves the fetch-and-parse path works on the phone.

The surprise is CNN. It looks alive because the app shows 50 headlines, but the articles are from April 2023. The legacy CNN RSS URL still returns XML; it just stopped being updated. The app stamps the fetch time on each headline, so stale items look new.

## What the stock app is

The Wildfire WWE build contains three relevant packages:

| Package | APK | Role |
| --- | --- | --- |
| `com.htc.newsreader` | `NewsReader.apk` | HTC front end: tabs, subscriptions, headlines, widget settings |
| `com.rosedata.android.rss` | `RSS.apk` | Rosedata RSS engine, database, fetcher, OPML parser |
| `com.htc.NewsReaderWidget` | `com.htc.NewsReaderWidget.apk` | Home-screen widget |

`NewsReader.apk` is version 1.0, `minSdkVersion 8`, `targetSdkVersion 8`. `RSS.apk` is version 2.2.1 and exposes the `com.rosedata.provider.AndroidRSSReader.database` provider. The HTC app is a front end over that engine; it is not a thin client for a dead HTC service.

The Google Reader code is still present in `RSS.apk` (`GoogleReader.java`, `https://www.google.com/reader/...`). It is optional. Direct subscriptions are stored and fetched by the local RSS engine. The dead Google Reader login is not required for a handpicked feed.

## What it supports

From `RSS.apk`'s own help assets and layouts:

- RSS 0.90, 0.91 (Netscape and Userland), 0.92, 0.93, 0.94, 1.0, and 2.0.
- Atom 0.3 and Atom 1.0.
- Add a channel by URL.
- Add channels in bulk from an OPML file on the SD card.
- Export subscriptions to OPML.
- Categories, per-channel refresh, auto-refresh interval, roaming control, font size, and a widget.
- A URL length limit of 255 characters.

The HTC front end has the matching strings and screens: `Add feeds`, `Add from URL`, `Channel name:`, `URL:`, `This URL is not correct.`, `Import`, `Export to OPML`, and `No feeds found. Tap to add a feed.`

A useful detail from `RSS.apk`'s resources is its own example URL: `http://192.168.2.36:8080/feed.xml`. The engine was built to accept a feed from a local network address, not only from a public service.

## What the phone already has

The WWE build ships a preinstalled feed list. On this phone, the app imported five of them and fetched two:

| Channel | Feed URL | Items | State |
| --- | --- | --- | --- |
| BBC News | `http://news.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml` | 36 | **Working and fresh.** Latest item 2026-11-13 09:34. |
| CNN.com - Top Stories | `http://rss.cnn.com/rss/cnn_topstories.rss` | 50 | **Loads, but stale.** Items are from 2023-04-18/19. |
| Yahoo! News - Top Stories | `http://rss.news.yahoo.com/rss/topstories` | 0 | Dead URL. |
| Engadget | `http://www.engadget.com/rss.xml` | 0 | Dead URL. |
| CNET News.com - The Net | `http://news.com.com/2547-1023_3-0-5.xml` | 0 | Dead URL. |

The BBC URL redirects to `http://feeds.bbci.co.uk/news/rss.xml?edition=int`, which then redirects to HTTPS. The app follows the chain and parses the result. That is direct evidence that **HTTPS is not universally broken on this phone**. Some endpoints work; some do not.

CNN's URL returns HTTP 200, so the app accepts it and parses 50 items. The XML itself is from April 2023. CNN's HTTPS endpoint failed a TLS handshake from a modern Windows client during this test, so it is not a reliable replacement. Treat CNN as stale until a current feed is found.

## How to add a handpicked feed

There are two paths.

### One feed by URL

1. Open **News**.
2. Open the menu and choose **Add feeds** (or tap **No feeds found. Tap to add a feed.**).
3. Choose **Add from URL**.
4. Enter a channel name, then the feed URL.
5. Wait for the first refresh. The channel appears in **Subscriptions**.

The URL must be reachable from the phone at the moment you add it. A local URL such as `http://127.0.0.1/news/test-feed.xml` is fine if the phone-local HTTP server is running.

### Several feeds by OPML

1. Put an OPML file on the SD card, for example `/sdcard/handpicked.opml`.
2. Open **News** > menu > **Import**.
3. Pick the file with the HTC file picker.
4. Choose the category and confirm.

The OPML should contain `<outline type="rss" text="Name" title="Name" xmlUrl="http://..." htmlUrl="http://..."/>` entries. A category is an outer `<outline>` with child outlines. See [`news/handpicked.opml`](news/handpicked.opml) for a working example.

### Remove the dead preinstalled feeds

The app's **Delete subscriptions** screen lists every channel. Remove CNN, Yahoo!, Engadget, and CNET if you do not want the stale or empty entries. Keep BBC. The same screen can be reached from the menu on the **Subscriptions** tab.

## Transport: HTTPS works for some feeds

Froyo's TLS stack is old, but it is not useless. The results depend on the endpoint:

| Feed | URL | Result on 2026-11-13 |
| --- | --- | --- |
| BBC News | `http://news.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml` | Redirects to HTTPS; **works on the phone**, fresh headlines |
| CNN Top Stories | `http://rss.cnn.com/rss/cnn_topstories.rss` | HTTP 200, **stale 2023 content** |
| CNN HTTPS | `https://rss.cnn.com/rss/cnn_topstories.rss` | TLS handshake failed from a modern Windows client |
| Ars Technica | `http://feeds.arstechnica.com/arstechnica/index` | HTTP 200, fresh, about 71 KB |
| Engadget | `http://feeds.feedburner.com/engadget` | HTTP 200, fresh, about 35 KB |
| ScienceDaily | `http://www.sciencedaily.com/rss/top/science.xml` | HTTP 200, fresh, about 46 KB |
| Universe Today | `http://feeds.feedburner.com/Universetoday` | HTTP 200, fresh, about 31 KB |

The practical rule is: **test each feed on the phone**. A redirect to HTTPS is not automatically fatal; BBC proves that. A feed that returns HTTP 200 is not automatically live; CNN proves that.

This has two consequences:

- **Headlines and summaries work** when the feed is reachable and fresh.
- **"Read full article" may not work** when the article link is HTTPS. The list and summary are still readable, but the full page may fail in the stock browser. BBC article links are HTTPS; the phone browser loaded BBC's HTTPS feed, so some article pages may work too.

## Recommended options

### Option A: direct feeds, including BBC

Use BBC for world news and the four fresh HTTP feeds above for tech and science. This is the simplest path:

- No server, no VPS, no port forwarding.
- Works on ordinary Wi-Fi or mobile data, provided DNS works.
- The app fetches each feed directly.
- Article links may be HTTPS; test them.

This is the best first step and the easiest to document. BBC is the strongest single feed because it is already preinstalled and verified.

### Option B: phone-local HTTP bridge

Run a small CGI on the phone's existing BusyBox httpd. The CGI fetches the HTTP feeds, merges them into one RSS 2.0 file, and serves it at `http://127.0.0.1/news/feed.xml`. The app subscribes to that one URL.

- Fully phone-local and live.
- Still limited to upstream feeds that are reachable over HTTP.
- Needs an `awk`/`sed` parser or a small helper binary.
- Can also generate local article pages from the feed summaries, so "read full article" opens a local HTTP page instead of a failing HTTPS page.

This is the natural extension of the weather design. It is more work than Option A, but it keeps the "no VPS" property.

### Option C: HTTP bridge on a server

Run a small service on a VPS, home server, or Raspberry Pi. It fetches modern HTTPS/JSON sources and serves a clean RSS 2.0 feed over HTTP. The phone subscribes to that HTTP URL.

- Works with any source, including HTTPS-only and JSON APIs.
- Can include full article text, images, and local article pages.
- Requires a server and, for access outside the home, a public endpoint.
- This was the earlier plan in the engineering log. It is the most flexible, but it is not phone-local.

### Option D: static digest

Generate an RSS file on a PC and copy it to the phone. The app reads it from the phone-local server.

- Fully offline.
- No live updates.
- Good for a handpicked digest that you refresh manually.

### Option E: TLS-capable helper on the phone

Build a static ARMv6 `curl` or `wget` with a modern TLS library, then call it from a CGI.

- Fully phone-local and live, including HTTPS sources.
- Significant engineering effort: cross-compile for ARMv6, provide a CA bundle, handle TLS 1.2, and test on Froyo.
- A future project, not the first step.

## On-device test plan

The core path is verified. The remaining test is the local feed through the app UI, which is useful for a fully offline demo.

1. Push [`news/test-feed.xml`](news/test-feed.xml) and the item pages to `/data/local/weather-www/news/`.
2. Confirm `http://127.0.0.1/news/test-feed.xml` returns the feed from the phone shell. **Done:** BusyBox `wget` returns the XML.
3. Add it in **News** > **Add feeds** > **Add from URL**.
4. Confirm five headlines, the summary text, and a refresh.
5. Add one public HTTP feed (Ars Technica or Engadget) and confirm it refreshes.
6. Try an HTTPS feed (BBC) and record the result. **Done:** BBC is preinstalled and fresh.
7. Import [`news/handpicked.opml`](news/handpicked.opml) and confirm the channels and category.
8. Check the News widget.
9. Record the results in this page and in the device history.

## Test log

| Date | Test | Result | Notes |
| --- | --- | --- | --- |
| 2026-11-13 | APK/ODEX inspection | Pass | `NewsReader.apk` + `RSS.apk`; add-by-URL, OPML, RSS/Atom support confirmed |
| 2026-11-13 | Public HTTP feed availability | Pass | Ars Technica, Engadget, ScienceDaily, Universe Today return fresh RSS over HTTP |
| 2026-11-13 | BBC News on the phone | **Pass** | 36 items; latest 2026-11-13 09:34; HTTPS redirect works |
| 2026-11-13 | CNN Top Stories on the phone | **Stale** | 50 items; content from 2023-04-18/19; HTTP 200 but not live |
| 2026-11-13 | Preinstalled Yahoo!/Engadget/CNET | Dead | 0 headlines each; legacy URLs |
| 2026-11-13 | Local feed served by phone httpd | Pass | BusyBox `wget` returns `http://127.0.0.1/news/test-feed.xml` |
| 2026-11-13 | Local feed added through the app UI | Pending | UI automation is unreliable on the resistive touchscreen; manual test is next |
| 2026-11-13 | OPML import on the phone | Pending | Manual test is next |
| 2026-11-13 | News widget | Pending | — |

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `This URL is not correct.` | URL is empty, over 255 characters, or the app cannot fetch it | Check the URL in the phone browser; check the local httpd; check DNS |
| `It may be not a valid RSS url or can't connect the server!` | The response is HTML, a redirect, or a TLS failure | Use a direct HTTP feed; test with `busybox wget` on the phone |
| No headlines after adding | Feed is valid but items are not in the parser's expected format | Test with the local feed; check the feed's XML and dates |
| Headlines look new but the articles are old | The feed itself is stale; the app stamps the fetch time | Check the feed's `<pubDate>` values; replace the source |
| Refresh fails only on mobile data | DNS or carrier proxy issue | Test on Wi-Fi; set `net.dns1`/`net.dns2`; avoid carrier proxies |
| Article page fails | Article link is HTTPS and the page rejects Froyo TLS | Use the summary, a local article page, or an HTTP bridge |
| Widget empty | Widget not configured, or the app has no headlines | Add a channel, refresh it, then add the widget |

## Privacy and safety

- Direct feeds are public HTTP requests. Do not add private feeds or credentials.
- The phone-local server binds `127.0.0.1:80`, so it is not reachable from the LAN.
- Do not publish device identifiers, private network details, or feed URLs that contain tokens.
- The OPML file contains only public feed URLs and is safe to publish.

## Files

- [`news/test-feed.xml`](news/test-feed.xml) — original five-item RSS 2.0 test feed.
- [`news/handpicked.opml`](news/handpicked.opml) — BBC, four fresh public feeds, and the local test feed.
- [`news/item-1.html`](news/item-1.html) … [`news/item-5.html`](news/item-5.html) — local article pages for the test feed.
- [`news/README.md`](news/README.md) — how to serve and import the test files.
