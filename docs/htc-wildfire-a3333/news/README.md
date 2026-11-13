# News feeds and test files

The stock HTC NewsReader on this phone is running the final public-feed set. The local test feed was useful for diagnosis but is not needed now.

## Files

| File | Purpose |
| --- | --- |
| `recommended.opml` | Final nine-feed set: BBC World/Technology/Science/Business/Sport, Ars Technica, ScienceDaily, Universe Today, Engadget |
| `handpicked.opml` | Smaller public-feed example: BBC News, Ars Technica, Engadget, ScienceDaily, Universe Today |
| `test-feed.xml` | Original five-item RSS 2.0 diagnostic feed; not part of the recommended set |
| `item-1.html` … `item-5.html` | Local article pages linked from the diagnostic feed |

## Recommended import

`recommended.opml` is the current list for this phone:

- BBC World, Technology, Science, Business, and Sport — same BBC endpoint as the working front page.
- Ars Technica — `http://feeds.arstechnica.com/arstechnica/index`; works in the app.
- ScienceDaily — `http://www.sciencedaily.com/rss/top/science.xml`; plain HTTP.
- Universe Today — `http://feeds.feedburner.com/Universetoday`; plain HTTP.
- Engadget — `http://feeds.feedburner.com/engadget`; plain HTTP.

Push it to `/sdcard/recommended.opml` and use **News > menu > Import**. Delete any feed that shows 0 headlines after a refresh.

The final on-phone counts on 2026-11-13 were: BBC News 39, BBC World 13, BBC Technology 9, BBC Science 31, BBC Business 45, BBC Sport 43, Ars Technica 20, Engadget 20, ScienceDaily 50, Universe Today 20.

Do not use CNN's legacy `rss.cnn.com` feed as a live source. It returns 50 items, but they are from April 2023; the app stamps the fetch time on them, so they look current. See [`../NEWS.md`](../NEWS.md).

Hackaday's HTTPS feed fails on Froyo with “A secure connection could not be established.” Ars Technica's HTTPS URL shows the same browser dialog, but the app uses the plain-HTTP URL and works.

## Diagnostic local feed

The local feed is optional. It is useful only for testing the phone-local httpd and the app's URL input.

The weather setup runs BusyBox httpd with its document root at `/data/local/weather-www` and listens on `127.0.0.1:80`. Add a `news/` directory there:

```bash
adb push test-feed.xml /sdcard/news-test/test-feed.xml
adb shell su -c "/system/bin/busybox mkdir -p /data/local/weather-www/news"
adb shell su -c "/system/bin/busybox cp /sdcard/news-test/test-feed.xml /data/local/weather-www/news/test-feed.xml"
adb shell su -c "/system/bin/busybox cp /sdcard/news-test/item-1.html /data/local/weather-www/news/item-1.html"
# repeat for item-2.html ... item-5.html
```

Verify from the phone:

```bash
adb shell su -c "/system/bin/busybox wget -qO- http://127.0.0.1/news/test-feed.xml | head"
```

If httpd is not running:

```bash
adb shell su -c "/system/bin/busybox httpd -c /data/local/weather-www/httpd.conf -p 127.0.0.1:80 -h /data/local/weather-www"
```

In NewsReader: **Add feeds > Add from URL**, name `Local Test`, URL `http://127.0.0.1/news/test-feed.xml`. Five items should appear. Remove the feed when done.

## Expected results

- The public feeds show current headlines and summary details.
- The News widget can be added after at least one channel has headlines.
- HTTPS-only feeds may fail during the TLS handshake; that is a Froyo transport limit, not an RSS parser limit.

## Safety

- The diagnostic feed is served only on `127.0.0.1`, not on the LAN.
- The OPML files contain public URLs only.
- Do not add private feeds, tokens, or credentials to this folder.
