"""Local mock for the HTC Wildfire Weather XML endpoints.

This returns parser-shaped sample data only. It does not call a weather provider.
"""

from datetime import date, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import argparse
import os
import xml.etree.ElementTree as ET


ENDPOINTS = {
    "/widget/htc/lat-lon-search.asp",
    "/widget/htc/forecast-data_v3.asp",
}


def sample_weather_xml() -> bytes:
    root = ET.Element("weather")

    current = ET.SubElement(root, "current")
    ET.SubElement(current, "temp", {"c": "18", "f": "64"})
    ET.SubElement(current, "condition", {"icon": "1"})

    forecast = ET.SubElement(root, "forecast")
    highs_c = (19, 20, 17, 16)
    lows_c = (11, 12, 10, 9)

    for offset, (high_c, low_c) in enumerate(zip(highs_c, lows_c)):
        forecast_date = date.today() + timedelta(days=offset)
        day = ET.SubElement(forecast, "day")
        ET.SubElement(day, "name").text = forecast_date.strftime("%A")
        ET.SubElement(day, "date").text = forecast_date.isoformat()
        ET.SubElement(day, "condition", {"icon": "1"})
        ET.SubElement(
            day,
            "high",
            {"c": str(high_c), "f": str(round(high_c * 9 / 5 + 32))},
        )
        ET.SubElement(
            day,
            "low",
            {"c": str(low_c), "f": str(round(low_c * 9 / 5 + 32))},
        )

    return ET.tostring(root, encoding="iso-8859-1", xml_declaration=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "HTCWeatherMock/0.1"

    def do_GET(self) -> None:
        path = urlsplit(self.path).path

        if path == "/healthz":
            body = b"ok\n"
            content_type = "text/plain; charset=utf-8"
            status = 200
        elif path in ENDPOINTS:
            body = sample_weather_xml()
            content_type = "application/xml; charset=iso-8859-1"
            status = 200
        else:
            body = b"not found\n"
            content_type = "text/plain; charset=utf-8"
            status = 404

        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, _format: str, *_args: object) -> None:
        # HTC requests include a vendor query parameter and may include location.
        # Keep the mock's default logs empty so those values are not recorded.
        return


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", "8080")),
    )
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"HTC Weather mock listening on {args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
