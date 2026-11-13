#!/usr/bin/env python3
"""HTC DGW stock bridge using the CNBC quote API.

The HTC Stocks app POSTs an XML request to:
  http://api.htc.go.yahoo.com/dgw?imei=...&apptype=finance&src=HTC01

This bridge implements the old Yahoo DGW response for getquotes. It runs on a
PC/VPS with HTTPS access and uses CNBC's public quote JSON, which still covers
the app's default symbols (^FTSE, ^IXIC, 2498.TW, GOOG).

The default symbols are pre-warmed at startup and refreshed in the background.
Requests are answered from the cache so the phone's DCS service does not wait
for a live upstream fetch; that wait can race its onDestroy path and produce a
NullPointerException in StockServiceImpl.updateCacheData().
"""

import json
import os
import re
import threading
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

CACHE = {}  # symbol -> (fetched_at, quote)
CACHE_REFRESH = 60
CACHE_LOCK = threading.Lock()
REFRESHING = set()
DEFAULT_SYMBOLS = ["^FTSE", "^IXIC", "2498.TW", "GOOG"]
SEARCH_CACHE = {}
SEARCH_TTL = 300
NASDAQ_SEARCH_URL = "https://api.nasdaq.com/api/autocomplete/slookup/10"
CNBC_CHART_URL = "https://ts-api.cnbc.com/harmony/app/charts/{}.json"
CHART_CACHE = {}
CHART_TTL = 300
MAX_CHART_POINTS = 180
CHART_RANGES = {
    "1d": "1D",
    "5d": "5D",
    "1m": "1M",
    "3m": "3M",
    "6m": "6M",
    "1y": "1Y",
    "2y": "1Y",
}
SEARCH_ALIASES = {
    "apple": "AAPL",
    "alphabet": "GOOG",
    "google": "GOOG",
    "microsoft": "MSFT",
    "amazon": "AMZN",
    "tesla": "TSLA",
    "meta": "META",
    "facebook": "META",
    "nvidia": "NVDA",
    "netflix": "NFLX",
    "intel": "INTC",
    "amd": "AMD",
}
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120 Safari/537.36"
)
CNBC_URL = (
    "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol"
)


def cnbc_symbol(symbol):
    """Map Yahoo-style symbols to CNBC symbols for the common cases."""
    if symbol.startswith("^"):
        return "." + symbol[1:]
    if symbol.endswith(".TW"):
        return symbol[:-3] + "-TW"
    return symbol


def parse_number(value):
    if value is None:
        return None
    text = str(value).strip().replace(",", "").replace("%", "").replace("+", "")
    if text in ("", "N/A", "--", "NA"):
        return None
    try:
        return float(text)
    except ValueError:
        return None


def parse_timestamp(value):
    if not value:
        return int(time.time())
    text = str(value)
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d"):
        try:
            import datetime

            return int(datetime.datetime.strptime(text, fmt).timestamp())
        except Exception:
            pass
    return int(time.time())


def cnbc_quotes(symbols):
    original = {cnbc_symbol(s): s for s in symbols}
    query = urllib.parse.urlencode(
        {
            "symbols": "|".join(original.keys()),
            "requestMethod": "itv",
            "noform": "1",
            "partnerId": "2",
            "fund": "1",
            "exthrs": "1",
            "output": "json",
            "events": "1",
        }
    )
    url = CNBC_URL + "?" + query
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as response:
        data = json.load(response)
    rows = (
        data.get("FormattedQuoteResult", {}).get("FormattedQuote", [])
        if isinstance(data, dict)
        else []
    )
    result = {}
    for row in rows:
        cnbc_sym = row.get("symbol")
        orig = original.get(cnbc_sym, cnbc_sym)
        price = parse_number(row.get("last"))
        change = parse_number(row.get("change"))
        percent = parse_number(row.get("change_pct"))
        previous = parse_number(row.get("previous_day_closing"))
        if change is None and price is not None and previous is not None:
            change = price - previous
        if percent is None and change is not None and previous:
            percent = change / previous * 100.0
        status = 1 if "REG_MKT" in str(row.get("curmktstatus", "")) else 0
        volume = parse_number(row.get("volume"))
        if volume is not None:
            volume = int(volume)
        result[orig] = {
            "name": row.get("name") or row.get("shortName") or orig,
            "symbol": orig,
            "exchange": row.get("exchange") or "",
            "status": status,
            "timestamp": parse_timestamp(row.get("last_time")),
            "price": price,
            "change": change,
            "changepercent": percent,
            "open": parse_number(row.get("open")),
            "high": parse_number(row.get("high")),
            "low": parse_number(row.get("low")),
            "volume": volume,
            "marketcap": row.get("mktcapView") or "N/A",
            "link": "http://m.yahoo.com/s/htcwf/yfinance/quote/"
            + urllib.parse.quote(orig)
            + "/",
        }
    return result


def yahoo_quote(symbol):
    """Fallback for symbols CNBC does not return."""
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        + urllib.parse.quote(symbol, safe="")
        + "?range=1d&interval=1m"
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as response:
        data = json.load(response)
    meta = data["chart"]["result"][0]["meta"]
    price = meta.get("regularMarketPrice")
    previous = meta.get("previousClose") or meta.get("chartPreviousClose")
    change = price - previous if price is not None and previous else None
    percent = change / previous * 100.0 if change is not None and previous else None
    regular = (meta.get("currentTradingPeriod") or {}).get("regular") or {}
    now = int(time.time())
    status = 1 if regular.get("start", 0) <= now <= regular.get("end", 0) else 0
    volume = meta.get("regularMarketVolume")
    if volume is not None:
        volume = int(volume)
    return {
        "name": meta.get("longName") or meta.get("shortName") or symbol,
        "symbol": symbol,
        "exchange": meta.get("fullExchangeName") or meta.get("exchangeName") or "",
        "status": status,
        "timestamp": meta.get("regularMarketTime") or now,
        "price": price,
        "change": change,
        "changepercent": percent,
        "open": meta.get("regularMarketOpen"),
        "high": meta.get("regularMarketDayHigh"),
        "low": meta.get("regularMarketDayLow"),
        "volume": volume,
        "marketcap": "N/A",
        "link": "http://m.yahoo.com/s/htcwf/yfinance/quote/"
        + urllib.parse.quote(symbol)
        + "/",
    }


def fetch_quotes(symbols):
    quotes = {}
    try:
        quotes.update(cnbc_quotes(symbols))
    except Exception as exc:
        print(f"{time.strftime('%H:%M:%S')} CNBC error: {exc}", flush=True)
    for symbol in symbols:
        if symbol not in quotes:
            try:
                quotes[symbol] = yahoo_quote(symbol)
            except Exception as exc:
                print(
                    f"{time.strftime('%H:%M:%S')} Yahoo fallback error for {symbol}: {exc}",
                    flush=True,
                )
    return quotes


def store_quotes(quotes):
    now = time.time()
    with CACHE_LOCK:
        for symbol, quote in quotes.items():
            CACHE[symbol] = (now, quote)


def refresh_worker(symbols):
    with CACHE_LOCK:
        symbols = [s for s in symbols if s not in REFRESHING]
        REFRESHING.update(symbols)
    if not symbols:
        return
    try:
        store_quotes(fetch_quotes(symbols))
    finally:
        with CACHE_LOCK:
            for symbol in symbols:
                REFRESHING.discard(symbol)


def get_quotes(symbols):
    now = time.time()
    with CACHE_LOCK:
        quotes = {s: CACHE[s][1] for s in symbols if s in CACHE}
        missing = [s for s in symbols if s not in CACHE]

    # First request for a symbol: fetch it synchronously so the response is
    # complete. The default symbols are pre-warmed at startup.
    if missing:
        fetched = fetch_quotes(missing)
        store_quotes(fetched)
        quotes.update(fetched)

    # Stale symbols are refreshed in the background. The app gets the cached
    # response immediately, which avoids the DCS service's onDestroy race.
    with CACHE_LOCK:
        stale = [
            s
            for s in symbols
            if s in CACHE
            and now - CACHE[s][0] > CACHE_REFRESH
            and s not in REFRESHING
        ]
    if stale:
        threading.Thread(target=refresh_worker, args=(stale,), daemon=True).start()
    return quotes


def periodic_refresh():
    while True:
        time.sleep(CACHE_REFRESH)
        threading.Thread(
            target=refresh_worker, args=(list(DEFAULT_SYMBOLS),), daemon=True
        ).start()


def xml_escape(value):
    if value is None:
        return ""
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def quote_stub(symbol, name=None, exchange=""):
    return {
        "name": name or symbol,
        "symbol": symbol,
        "exchange": exchange,
        "status": 0,
        "timestamp": int(time.time()),
        "price": 0,
        "change": 0,
        "changepercent": 0,
        "open": 0,
        "high": 0,
        "low": 0,
        "volume": 0,
        "marketcap": "N/A",
        "link": "http://m.yahoo.com/s/htcwf/yfinance/quote/"
        + urllib.parse.quote(symbol)
        + "/",
    }


def nasdaq_search(phrase):
    key = phrase.strip().lower()
    now = time.time()
    if key in SEARCH_CACHE and now - SEARCH_CACHE[key][0] < SEARCH_TTL:
        return SEARCH_CACHE[key][1]
    query = urllib.parse.urlencode({"search": phrase.strip()})
    req = urllib.request.Request(
        NASDAQ_SEARCH_URL + "?" + query,
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.load(response)
    rows = data.get("data") or []
    phrase_upper = phrase.strip().upper()

    def rank(row):
        symbol = (row.get("symbol") or "").upper()
        asset = (row.get("asset") or "").upper()
        return (
            0 if symbol == phrase_upper else 1,
            0 if asset == "STOCKS" else 1,
        )

    results = []
    for row in sorted(rows, key=rank)[:10]:
        symbol = (row.get("symbol") or "").strip()
        if not symbol:
            continue
        results.append(
            quote_stub(
                symbol,
                (row.get("name") or "").strip() or symbol,
                row.get("exchange") or "",
            )
        )
    SEARCH_CACHE[key] = (now, results)
    return results


def fallback_search(phrase):
    key = phrase.strip().lower()
    symbol = SEARCH_ALIASES.get(key)
    if not symbol:
        candidate = phrase.strip().upper()
        if re.match(r"^[\^A-Z0-9.\-]{1,12}$", candidate):
            symbol = candidate
    if not symbol:
        return []
    return [quote_stub(symbol)]


def cnbc_chart(symbol, range_):
    key = (symbol, range_)
    now = time.time()
    if key in CHART_CACHE and now - CHART_CACHE[key][0] < CHART_TTL:
        return CHART_CACHE[key][1]
    endpoint = CHART_RANGES.get(range_.strip().lower(), "1D")
    cnbc_sym = cnbc_symbol(symbol)
    url = (
        CNBC_CHART_URL.format(endpoint)
        + "?"
        + urllib.parse.urlencode({"symbol": cnbc_sym})
    )
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        data = json.load(response)
    bars = (data.get("barData") or {}).get("priceBars") or []
    points = []
    for bar in bars:
        try:
            points.append(
                {
                    "close": float(bar["close"]),
                    "open": float(bar["open"]),
                    "high": float(bar["high"]),
                    "low": float(bar["low"]),
                    "timestamp": int(bar["tradeTimeinMills"]) // 1000,
                    "volume": int(bar.get("volume") or 0),
                }
            )
        except (KeyError, TypeError, ValueError):
            continue
    if len(points) > MAX_CHART_POINTS:
        step = (len(points) + MAX_CHART_POINTS - 1) // MAX_CHART_POINTS
        sampled = points[::step]
        if sampled[-1] != points[-1]:
            sampled.append(points[-1])
        points = sampled
    CHART_CACHE[key] = (now, points)
    return points


def build_chart_response(symbol, range_):
    points = []
    try:
        points = cnbc_chart(symbol, range_)
    except Exception as exc:
        print(
            f"{time.strftime('%H:%M:%S')} CNBC chart error: {exc}",
            flush=True,
        )
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<response>",
        f'<result type="getchart" timestamp="{int(time.time())}">',
    ]
    parts.append(
        "<meta>"
        f"<symbol>{xml_escape(symbol)}</symbol>"
        "<marketopen>0</marketopen>"
        "<marketclose>0</marketclose>"
        "<gmtoffset>0</gmtoffset>"
        "</meta>"
    )
    parts.append(f'<list count="{len(points)}" total="{len(points)}">')
    for point in points:
        parts.append("<point>")
        for tag in ("close", "open", "high", "low", "timestamp", "volume"):
            parts.append(f"<{tag}>{xml_escape(point.get(tag))}</{tag}>")
        parts.append("</point>")
    parts.append("</list></result></response>")
    return "".join(parts).encode("utf-8")


def build_response(result_type, quotes):
    now = int(time.time())
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', "<response>"]
    parts.append(
        f'<result type="{xml_escape(result_type)}" timestamp="{now}">'
    )
    parts.append(f'<list count="{len(quotes)}" total="{len(quotes)}">')
    for q in quotes:
        parts.append("<quote>")
        for tag in (
            "name", "symbol", "exchange", "status", "timestamp", "price",
            "change", "changepercent", "open", "high", "low", "volume",
            "marketcap", "link",
        ):
            parts.append(f"<{tag}>{xml_escape(q.get(tag))}</{tag}>")
        parts.append("</quote>")
    parts.append("</list></result></response>")
    return "".join(parts).encode("utf-8")


def build_quotes_response(symbols):
    quotes = get_quotes(symbols)
    ordered = [quotes[s] for s in symbols if s in quotes]
    return build_response("getquotes", ordered)


def build_search_response(phrase):
    quotes = []
    try:
        quotes = nasdaq_search(phrase)
    except Exception as exc:
        print(
            f"{time.strftime('%H:%M:%S')} Nasdaq search error: {exc}",
            flush=True,
        )
    if not quotes:
        quotes = fallback_search(phrase)
    return build_response("getsymbol", quotes)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        print("%s %s - %s" % (time.strftime("%H:%M:%S"), self.address_string(), fmt % args), flush=True)

    def handle_expect_100(self):
        self.send_response_only(100)
        self.end_headers()
        return True

    def do_GET(self):
        if self.path.startswith("/healthz"):
            body = b"ok\n"
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        try:
            root = ET.fromstring(body)
            query = root.find("query")
            qtype = query.get("type") if query is not None else ""
            symbols = [e.text for e in root.findall(".//symbol") if e.text]
            phrase = (root.findtext(".//phrase") or "").strip()
            range_ = (
                root.findtext(".//range")
                or root.findtext(".//interval")
                or "1d"
            ).strip()
            print(
                f"{time.strftime('%H:%M:%S')} request type={qtype!r} "
                f"symbols={symbols} phrase={phrase!r} range={range_!r}",
                flush=True,
            )
            if qtype in ("getquotes", "getsymbolquote"):
                response = build_quotes_response(symbols)
            elif qtype == "getsymbol":
                response = build_search_response(phrase)
            elif qtype == "getchart":
                response = build_chart_response(
                    symbols[0] if symbols else "", range_
                )
            else:
                response = (
                    '<?xml version="1.0" encoding="UTF-8"?>'
                    f'<response><result type="{xml_escape(qtype)}" '
                    f'timestamp="{int(time.time())}">'
                    '<list count="0" total="0"></list></result></response>'
                ).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain;charset=UTF-8")
            self.send_header("X-YSTATUS", "200")
            self.send_header("Cache-Control", "private")
            self.send_header("Connection", "close")
            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            self.close_connection = True
        except Exception as exc:
            print(f"{time.strftime('%H:%M:%S')} request error: {exc}", flush=True)
            self.send_error(500, str(exc))


if __name__ == "__main__":
    print(
        f"{time.strftime('%H:%M:%S')} pre-warming {DEFAULT_SYMBOLS}",
        flush=True,
    )
    store_quotes(fetch_quotes(DEFAULT_SYMBOLS))
    threading.Thread(target=periodic_refresh, daemon=True).start()
    port = int(os.environ.get("PORT", "8090"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"stock bridge listening on 0.0.0.0:{port}", flush=True)
    server.serve_forever()
