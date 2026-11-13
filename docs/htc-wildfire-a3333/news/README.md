# News test files

These files prove that the stock HTC NewsReader can load a handpicked RSS feed from the phone itself. They contain original test text only.

## Files

| File | Purpose |
| --- | --- |
| `test-feed.xml` | Five-item RSS 2.0 feed with plain text, CDATA, entities, and dates |
| `item-1.html` … `item-5.html` | Local article pages linked from the test feed |
| `handpicked.opml` | BBC, four fresh public HTTP feeds, and the local test feed, in a `Handpicked` category |

## Serve the test feed from the phone

The weather setup already runs BusyBox httpd with its document root at `/data/local/weather-www` and listens on `127.0.0.1:80`. Add a `news/` directory there.

From a computer with ADB and root:

```bash
adb push test-feed.xml /sdcard/news-test/test-feed.xml
adb shell su -c "mkdir -p /data/local/weather-www/news"
adb shell su -c "cp /sdcard/news-test/test-feed.xml /data/local/weather-www/news/test-feed.xml"
adb shell su -c "cp /sdcard/news-test/item-1.html /data/local/weather-www/news/item-1.html"
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

The existing boot hook starts httpd at boot. The test files are static, so no restart is needed after copying them.

## Add the feed in NewsReader

1. Open **News**.
2. Menu > **Add feeds** > **Add from URL**.
3. Channel name: `Local Test`.
4. URL: `http://127.0.0.1/news/test-feed.xml`.
5. Wait for the refresh. Five items should appear.

If the app asks for the channel name and URL in separate screens, enter the name first and tap **Next**, then enter the URL and tap **Done**.

## Import the handpicked OPML

1. Push `handpicked.opml` to `/sdcard/handpicked.opml`.
2. Open **News** > menu > **Import**.
3. Pick `handpicked.opml` with the HTC file picker.
4. Choose the `Handpicked` category and confirm.

The OPML contains:

- BBC News: `http://news.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml`
- Ars Technica: `http://feeds.arstechnica.com/arstechnica/index`
- Engadget: `http://feeds.feedburner.com/engadget`
- ScienceDaily: `http://www.sciencedaily.com/rss/top/science.xml`
- Universe Today: `http://feeds.feedburner.com/Universetoday`
- Local Test: `http://127.0.0.1/news/test-feed.xml`

BBC was verified working on the phone on 2026-11-13; its HTTP URL redirects to HTTPS and the app follows it. The four other public feeds were checked over plain HTTP, are small (31–71 KB), and are fresh. The local test feed only works while the phone-local httpd is running.

Do not use CNN's legacy `rss.cnn.com` feed as a live source. It returns 50 items, but they are from April 2023; the app stamps the fetch time on them, so they look current. See [`../NEWS.md`](../NEWS.md).

## Expected results

- The local feed shows five headlines and the summary text.
- The public feeds show current headlines.
- The News widget can be added after at least one channel has headlines.
- HTTPS-only feeds may fail during the TLS handshake; that is a Froyo transport limit, not an RSS parser limit.

## Safety

- The test feed is served only on `127.0.0.1`, not on the LAN.
- The OPML contains public URLs only.
- Do not add private feeds, tokens, or credentials to this folder.
