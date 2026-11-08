"""HTC Wildfire Weather compatibility server backed by Open-Meteo."""

from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen
import argparse
import json
import os
import threading
import time
import xml.etree.ElementTree as ET


ENDPOINTS = {
    "/widget/htc/lat-lon-search.asp",
    "/widget/htc/forecast-data_v3.asp",
}
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
CACHE_SECONDS = int(os.environ.get("WEATHER_CACHE_SECONDS", "600"))
DEFAULT_LATITUDE = float(os.environ.get("WEATHER_LATITUDE", "44.4268"))
DEFAULT_LONGITUDE = float(os.environ.get("WEATHER_LONGITUDE", "26.1025"))
_CACHE: dict[tuple[float, float], tuple[float, bytes]] = {}
_CACHE_LOCK = threading.Lock()


def location_from_query(query: str) -> tuple[float, float]:
    params = {key.lower(): values[-1] for key, values in parse_qs(query).items() if values}
    latitude = params.get("lat", params.get("latitude", params.get("geo_lat")))
    longitude = params.get(
        "lon",
        params.get("lng", params.get("longitude", params.get("geo_lon"))),
    )
    if latitude is None or longitude is None:
        return DEFAULT_LATITUDE, DEFAULT_LONGITUDE

    lat, lon = float(latitude), float(longitude)
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("coordinates out of range")
    return lat, lon


def legacy_icon(weather_code: int, is_day: bool = True) -> int:
    """Map WMO weather codes to approximate legacy AccuWeather icon IDs."""
    day_night = {
        0: (1, 33),
        1: (2, 34),
        2: (6, 38),
        3: (7, 38),
    }
    if weather_code in day_night:
        return day_night[weather_code][0 if is_day else 1]
    if weather_code in (45, 48):
        return 11
    if weather_code in (51, 53, 55):
        return 12
    if weather_code in (56, 57, 66, 67):
        return 24
    if weather_code in (61, 63, 65):
        return 18
    if weather_code in (71, 73, 75, 77, 85, 86):
        return 22
    if weather_code in (80, 81, 82):
        return 12
    if weather_code in (95, 96, 99):
        return 15
    return 7


def temperature_attributes(celsius: float) -> dict[str, str]:
    c = round(celsius)
    f = round(celsius * 9 / 5 + 32)
    return {"c": str(c), "f": str(f)}


def fetch_weather(latitude: float, longitude: float) -> bytes:
    key = (round(latitude, 4), round(longitude, 4))
    now = time.monotonic()
    with _CACHE_LOCK:
        cached = _CACHE.get(key)
        if cached and cached[0] > now:
            return cached[1]

    params = {
        "latitude": str(latitude),
        "longitude": str(longitude),
        "current": "temperature_2m,weather_code,is_day",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min",
        "temperature_unit": "celsius",
        "timezone": "auto",
        # The API includes today; request one extra day to emit four future days.
        "forecast_days": "5",
    }
    request = Request(
        f"{OPEN_METEO_URL}?{urlencode(params)}",
        headers={"User-Agent": "HTC-Wildfire-Legacy-Weather/0.2"},
    )
    try:
        with urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
        current = payload["current"]
        daily = payload["daily"]

        root = ET.Element("weather")
        current_node = ET.SubElement(root, "current")
        ET.SubElement(
            current_node,
            "temp",
            temperature_attributes(float(current["temperature_2m"])),
        )
        ET.SubElement(
            current_node,
            "condition",
            {
                "icon": str(
                    legacy_icon(
                        int(current["weather_code"]),
                        bool(current.get("is_day", 1)),
                    )
                )
            },
        )

        forecast = ET.SubElement(root, "forecast")
        current_date = str(current["time"])[:10]
        emitted_days = 0
        for index, day_date in enumerate(daily["time"]):
            # Current conditions are a separate XML node, so the forecast list
            # should start tomorrow and contain four complete future days.
            if day_date <= current_date:
                continue
            if emitted_days == 4:
                break
            day = ET.SubElement(forecast, "day")
            parsed_date = datetime.strptime(day_date, "%Y-%m-%d")
            ET.SubElement(day, "name").text = parsed_date.strftime("%A")
            ET.SubElement(day, "date").text = day_date
            ET.SubElement(
                day,
                "condition",
                {"icon": str(legacy_icon(int(daily["weather_code"][index])))},
            )
            ET.SubElement(
                day,
                "high",
                temperature_attributes(float(daily["temperature_2m_max"][index])),
            )
            ET.SubElement(
                day,
                "low",
                temperature_attributes(float(daily["temperature_2m_min"][index])),
            )
            emitted_days += 1

        # Attribution required by Open-Meteo's CC BY 4.0 data licence.
        ET.SubElement(root, "source").text = "Open-Meteo (open-meteo.com)"
        body = ET.tostring(root, encoding="iso-8859-1", xml_declaration=True)
    except Exception:
        # Keep the most recent successful response available during provider outages.
        with _CACHE_LOCK:
            cached = _CACHE.get(key)
            if cached:
                return cached[1]
        raise

    with _CACHE_LOCK:
        _CACHE[key] = (now + CACHE_SECONDS, body)
    return body


class Handler(BaseHTTPRequestHandler):
    server_version = "HTCWeatherMock/0.2"

    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        if parsed.path == "/healthz":
            self.respond(200, b"ok\n", "text/plain; charset=utf-8")
            return
        if parsed.path not in ENDPOINTS:
            self.respond(404, b"not found\n", "text/plain; charset=utf-8")
            return

        try:
            latitude, longitude = location_from_query(parsed.query)
            body = fetch_weather(latitude, longitude)
            self.respond(200, body, "application/xml; charset=iso-8859-1")
        except (ValueError, KeyError, TypeError, OSError, json.JSONDecodeError):
            self.respond(502, b"weather provider unavailable\n", "text/plain; charset=utf-8")

    def respond(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, _format: str, *_args: object) -> None:
        # Requests can contain location coordinates and legacy vendor parameters.
        return


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8080")))
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"HTC Weather live adapter listening on {args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
