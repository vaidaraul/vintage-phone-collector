# HTC News and handpicked RSS feeds

**Status:** verified working on one HTC Wildfire A3333 on 2026-11-13. Final set: BBC News plus BBC World, Technology, Science, Business, and Sport; Ars Technica; Engadget; ScienceDaily; Universe Today. The local test feed was a diagnostic and has been removed.

This page answers one question: can the stock HTC News app on the Wildfire A3333 load a feed you choose yourself? **Yes.** The app is a real RSS/Atom reader with an "Add from URL" screen and OPML import. The final set below is live on the phone.

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

## Final working set

These channels are live on the phone. The item counts are from the RSS database after the final refresh:

| Channel | URL | Items |
| --- | --- | --- |
| BBC News | `http://news.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml` | 39 |
| BBC World | `http://feeds.bbci.co.uk/news/world/rss.xml` | 13 |
| BBC Technology | `http://feeds.bbci.co.uk/news/technology/rss.xml` | 9 |
| BBC Science | `http://feeds.bbci.co.uk/news/science_and_environment/rss.xml` | 31 |
| BBC Business | `http://feeds.bbci.co.uk/news/business/rss.xml` | 45 |
| BBC Sport | `http://feeds.bbci.co.uk/sport/rss.xml` | 43 |
| Ars Technica | `http://feeds.arstechnica.com/arstechnica/index` | 20 |
| Engadget | `http://feeds.feedburner.com/engadget` | 20 |
| ScienceDaily | `http://www.sciencedaily.com/rss/top/science.xml` | 50 |
| Universe Today | `http://feeds.feedburner.com/Universetoday` | 20 |

All ten are fresh and show headline details. The BBC topic feeds use the same endpoint as the working BBC front page. Ars Technica, Engadget, ScienceDaily, and Universe Today are plain-HTTP feeds.

The preinstalled CNN, Yahoo!, Engadget (old URL), and CNET channels were removed. CNN was stale (April 2023); the other legacy URLs returned no headlines.

## Why Ars Technica works in the app but not over HTTPS

The stock browser failed on `https://feeds.arstechnica.com/arstechnica/index` with **“A secure connection could not be established.”** That is the HTTPS endpoint itself; Froyo could not negotiate TLS with that host. The feed URL used by the app is plain HTTP:

```text
http://feeds.arstechnica.com/arstechnica/index
```

It returns HTTP 200, and NewsReader parses 20 items. The app never needs the HTTPS endpoint. Hackaday’s HTTPS feed genuinely fails on Froyo; it is not in the recommended set. The plain-HTTP feeds (ScienceDaily, Universe Today, Engadget) may still show a secure-subresource dialog in the browser for an HTTPS image or stylesheet, but the XML itself loads.

## How to add a handpicked feed

### One feed by URL

1. Open **News**.
2. Open the menu and choose **Add feeds** (or tap **No feeds found. Tap to add a feed.**).
3. Choose **Add from URL**.
4. Enter a channel name, then the feed URL.
5. Wait for the first refresh. The channel appears in **Subscriptions**.

The URL must be reachable from the phone at the moment you add it.

### Several feeds by OPML

1. Put an OPML file on the SD card, for example `/sdcard/recommended.opml`.
2. Open **News** > menu > **Import**.
3. Pick the file with the HTC file picker.
4. Choose the category and confirm.

The OPML should contain `<outline type="rss" text="Name" title="Name" xmlUrl="http://..." htmlUrl="http://..."/>` entries. A category is an outer `<outline>` with child outlines. See [`news/recommended.opml`](news/recommended.opml) for the final set.

### Remove a feed

The **Delete subscriptions** screen lists every channel. Use it to remove stale or empty feeds. The same screen is reached from the menu on the **Subscriptions** tab.

## Transport: HTTPS works for BBC, not for most others

Froyo’s TLS stack is old. The results depend on the endpoint:

| Feed | URL | Result on 2026-11-13 |
| --- | --- | --- |
| BBC News and topics | `http://feeds.bbci.co.uk/...` | Redirects to HTTPS; **works on the phone** |
| Ars Technica | `http://feeds.arstechnica.com/arstechnica/index` | HTTP 200; **works in the app** |
| Engadget | `http://feeds.feedburner.com/engadget` | HTTP 200; **works in the app** |
| ScienceDaily | `http://www.sciencedaily.com/rss/top/science.xml` | HTTP 200; **works in the app** |
| Universe Today | `http://feeds.feedburner.com/Universetoday` | HTTP 200; **works in the app** |
| Hackaday | `https://hackaday.com/feed/` | TLS fails on the phone |
| CNN Top Stories | `http://rss.cnn.com/rss/cnn_topstories.rss` | HTTP 200, but stale 2023 content |

The practical rule is: **test each feed on the phone**. A redirect to HTTPS is not automatically fatal; BBC proves that. A feed that returns HTTP 200 is not automatically live; CNN proves that.

The following HTTPS feeds were fresh from a desktop client but are not in the recommended set because they are likely to hit the same TLS limit: The Verge, Engadget HTTPS, Phys.org, NASA, New Scientist, Space.com, Polygon, Eurogamer, and Rock Paper Shotgun.

## Recommended options

### Option A: direct feeds (current setup)

Use the ten feeds in the final set. This is the current phone setup:

- No server, no VPS, no port forwarding.
- Works on ordinary Wi-Fi or mobile data, provided DNS works.
- The app fetches each feed directly.
- Article links may be HTTPS; test them.

### Option B: phone-local HTTP bridge

Run a small CGI on the phone's existing BusyBox httpd. The CGI fetches the HTTP feeds, merges them into one RSS 2.0 file, and serves it at `http://127.0.0.1/news/feed.xml`. The app subscribes to that one URL.

- Fully phone-local and live.
- Still limited to upstream feeds that are reachable over HTTP.
- Needs an `awk`/`sed` parser or a small helper binary.
- Can also generate local article pages from the feed summaries.

This is a future option, not needed for the current set.

### Option C: HTTP bridge on a server

Run a small service on a VPS, home server, or Raspberry Pi. It fetches modern HTTPS/JSON sources and serves a clean RSS 2.0 feed over HTTP. The phone subscribes to that HTTP URL.

- Works with any source, including HTTPS-only and JSON APIs.
- Requires a server and, for access outside the home, a public endpoint.

### Option D: static digest

Generate an RSS file on a PC and copy it to the phone. The app reads it from the phone-local server.

- Fully offline.
- No live updates.

### Option E: TLS-capable helper on the phone

Build a static ARMv6 `curl` or `wget` with a modern TLS library, then call it from a CGI.

- Fully phone-local and live, including HTTPS sources.
- Significant engineering effort.

## Test log

| Date | Test | Result | Notes |
| --- | --- | --- | --- |
| 2026-11-13 | APK/ODEX inspection | Pass | `NewsReader.apk` + `RSS.apk`; add-by-URL, OPML, RSS/Atom support confirmed |
| 2026-11-13 | BBC News on the phone | **Pass** | 39 items; HTTPS redirect works |
| 2026-11-13 | BBC World/Technology/Science/Business/Sport | **Pass** | 13 / 9 / 31 / 45 / 43 items |
| 2026-11-13 | Ars Technica | **Pass** | 20 items via the plain-HTTP URL |
| 2026-11-13 | Engadget | **Pass** | 20 items via FeedBurner |
| 2026-11-13 | ScienceDaily | **Pass** | 50 items |
| 2026-11-13 | Universe Today | **Pass** | 20 items |
| 2026-11-13 | CNN Top Stories | **Removed** | 50 items, but from April 2023 |
| 2026-11-13 | Yahoo!/Engadget old/CNET | **Removed** | 0 headlines; legacy URLs |
| 2026-11-13 | Local test feed | **Removed** | Diagnostic only; the public feeds work |

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `This URL is not correct.` | URL is empty, over 255 characters, or the app cannot fetch it | Check the URL in the phone browser; check DNS |
| `It may be not a valid RSS url or can't connect the server!` | The response is HTML, a redirect, or a TLS failure | Use a plain-HTTP feed; test with `busybox wget` on the phone |
| No headlines after adding | Feed is valid but items are not in the parser's expected format | Remove it and try a feed from the final set |
| Headlines look new but the articles are old | The feed itself is stale; the app stamps the fetch time | Check the feed's `<pubDate>` values; replace the source |
| Refresh fails only on mobile data | DNS or carrier proxy issue | Test on Wi-Fi; set `net.dns1`/`net.dns2`; avoid carrier proxies |
| Article page fails | Article link is HTTPS and the page rejects Froyo TLS | Use the summary, a local article page, or an HTTP bridge |
| Widget empty | Widget not configured, or the app has no headlines | Add a channel, refresh it, then add the widget |

## Privacy and safety

- Direct feeds are public HTTP requests. Do not add private feeds or credentials.
- The phone-local server binds `127.0.0.1:80`, so it is not reachable from the LAN.
- Do not publish device identifiers, private network details, or feed URLs that contain tokens.
- The OPML files contain only public feed URLs and are safe to publish.

## Files

- [`news/recommended.opml`](news/recommended.opml) — the nine new feeds; BBC News is already installed, making ten channels in total.
- [`news/handpicked.opml`](news/handpicked.opml) — public-feed example without the local test feed.
- [`news/test-feed.xml`](news/test-feed.xml) — original five-item RSS 2.0 diagnostic feed; not part of the recommended set.
- [`news/item-1.html`](news/item-1.html) … [`news/item-5.html`](news/item-5.html) — local article pages for the diagnostic feed.
- [`news/README.md`](news/README.md) — serving and import notes.
