"""Offline tests for the HTC Weather compatibility adapter.

These never touch the network and never reach Open-Meteo. Run from this
directory with any CPython 3.10+:

    python -m unittest -v test_server
"""

import json
import unittest
import xml.etree.ElementTree as ET
from unittest import mock

import server


class FakeResponse:
    def __init__(self, payload):
        self._body = json.dumps(payload).encode("utf-8")

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        return False


def forecast_payload():
    return {
        "current": {
            "time": "2026-11-10T12:00",
            "temperature_2m": 12.4,
            "weather_code": 3,
            "is_day": 1,
        },
        "daily": {
            "time": [
                "2026-11-10",
                "2026-11-11",
                "2026-11-12",
                "2026-11-13",
                "2026-11-14",
            ],
            "weather_code": [3, 61, 0, 2, 71],
            "temperature_2m_max": [15.0, 14.0, 13.0, 12.0, 11.0],
            "temperature_2m_min": [5.0, 4.0, 3.0, 2.0, 1.0],
        },
    }


class GeocodeTests(unittest.TestCase):
    def setUp(self):
        server._GEOCODE_CACHE.clear()

    def test_uk_maps_to_iso_country_code(self):
        payload = {"results": [{"latitude": 51.5, "longitude": -0.12}]}
        with mock.patch.object(
            server, "urlopen", return_value=FakeResponse(payload)
        ) as call:
            coordinates = server.geocode_city("London", "UK")

        self.assertEqual(coordinates, (51.5, -0.12))
        url = call.call_args.args[0].full_url
        self.assertIn("countryCode=GB", url)
        self.assertNotIn("countryCode=UK", url)

    def test_unfiltered_retry_when_filtered_lookup_is_empty(self):
        empty = FakeResponse({"generationtime_ms": 0.1})
        found = FakeResponse({"results": [{"latitude": 51.5, "longitude": -0.12}]})
        with mock.patch.object(
            server, "urlopen", side_effect=[empty, found]
        ) as call:
            coordinates = server.geocode_city("London", "UK")

        self.assertEqual(coordinates, (51.5, -0.12))
        self.assertEqual(call.call_count, 2)
        self.assertNotIn("countryCode", call.call_args_list[1].args[0].full_url)

    def test_unresolvable_location_raises(self):
        empty = FakeResponse({"generationtime_ms": 0.1})
        with mock.patch.object(server, "urlopen", return_value=empty):
            with self.assertRaises(ValueError):
                server.geocode_city("Nowhereville", "ZZ")


class CacheTests(unittest.TestCase):
    KEY = (44.4268, 26.1025)

    def setUp(self):
        server._CACHE.clear()

    def _seed(self, fresh_until, stale_until, body=b"<weather/>"):
        server._CACHE[self.KEY] = (fresh_until, stale_until, body)

    def test_fresh_entry_is_returned_without_calling_provider(self):
        now = server.time.monotonic()
        self._seed(now + 60, now + 3600)
        with mock.patch.object(server, "urlopen") as call:
            body = server.fetch_weather(*self.KEY)

        self.assertEqual(body, b"<weather/>")
        call.assert_not_called()

    def test_recent_stale_entry_is_served_on_provider_failure(self):
        now = server.time.monotonic()
        self._seed(now - 10, now + 600)
        with mock.patch.object(server, "urlopen", side_effect=OSError("down")):
            body = server.fetch_weather(*self.KEY)

        self.assertEqual(body, b"<weather/>")

    def test_expired_entry_is_not_served(self):
        now = server.time.monotonic()
        self._seed(now - 1000, now - 1)
        with mock.patch.object(server, "urlopen", side_effect=OSError("down")):
            with self.assertRaises(OSError):
                server.fetch_weather(*self.KEY)

    def test_programming_errors_are_not_masked_by_cache(self):
        now = server.time.monotonic()
        self._seed(now - 10, now + 600)
        with mock.patch.object(server, "urlopen", side_effect=RuntimeError("bug")):
            with self.assertRaises(RuntimeError):
                server.fetch_weather(*self.KEY)

    def test_successful_fetch_populates_fresh_and_stale_windows(self):
        with mock.patch.object(
            server, "urlopen", return_value=FakeResponse(forecast_payload())
        ):
            body = server.fetch_weather(*self.KEY)

        fresh_until, stale_until, cached_body = server._CACHE[self.KEY]
        self.assertEqual(body, cached_body)
        self.assertGreater(fresh_until, server.time.monotonic())
        self.assertGreater(stale_until, fresh_until)


class ForecastFormatTests(unittest.TestCase):
    KEY = (51.5085, -0.1257)

    def setUp(self):
        server._CACHE.clear()

    def test_dates_and_labels_match_the_client_format(self):
        with mock.patch.object(
            server, "urlopen", return_value=FakeResponse(forecast_payload())
        ):
            body = server.fetch_weather(*self.KEY)

        root = ET.fromstring(body)
        days = root.findall("./forecast/day")
        self.assertEqual(len(days), 5)

        dates = [day.findtext("date") for day in days]
        for value in dates:
            self.assertRegex(value, r"^\d{2}/\d{2}/\d{2}$")

        labels = [day.findtext("name") for day in days]
        self.assertEqual(labels, ["TUE", "WED", "THU", "FRI", "SAT"])
        self.assertEqual(len(set(labels)), 5)


if __name__ == "__main__":
    unittest.main()
