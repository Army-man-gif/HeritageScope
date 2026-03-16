#!/usr/bin/env python3
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse


AREAS_BY_ID = {
    1: {
        "id": 1,
        "markerLatitude": 51.575,
        "markerLongitude": -0.252,
        "polyData": [
            [51.589, -0.278],
            [51.592, -0.242],
            [51.567, -0.226],
            [51.553, -0.258],
        ],
    },
    304: {
        "id": 304,
        "markerLatitude": 51.42472222,
        "markerLongitude": -116.4797222,
        "polyData": [
            [51.45, -116.59],
            [51.52, -116.42],
            [51.40, -116.31],
            [51.34, -116.50],
        ],
    },
    1285: {
        "id": 1285,
        "markerLatitude": 45.70972222,
        "markerLongitude": -64.4358333333,
        "polyData": [
            [45.74, -64.49],
            [45.75, -64.40],
            [45.69, -64.36],
            [45.67, -64.44],
        ],
    },
}


AREA_LIST = list(AREAS_BY_ID.values())
MARKER_MATCH_EPSILON = 1e-6


def json_response(handler: BaseHTTPRequestHandler, status: int, data):
    payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Content-Length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


class ApiHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/health":
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/areas/by-marker"):
            return self._get_area_by_marker(parsed.query)

        if path.startswith("/api/areas/"):
            return self._get_area_by_id(path)

        return json_response(self, 404, {"error": "Not found"})

    def _get_area_by_id(self, path: str):
        try:
            lid = int(path.split("/")[-1])
        except ValueError:
            return json_response(self, 400, {"error": "Invalid area id"})

        area = AREAS_BY_ID.get(lid)
        if area is None:
            return json_response(self, 404, {"error": "Area not found"})

        return json_response(self, 200, area)

    def _get_area_by_marker(self, query: str):
        params = parse_qs(query)
        try:
            lat = float(params.get("latitude", [""])[0])
            lng = float(params.get("longitude", [""])[0])
        except ValueError:
            return json_response(self, 400, {"error": "Invalid latitude or longitude"})

        for area in AREA_LIST:
            if (
                abs(area["markerLatitude"] - lat) < MARKER_MATCH_EPSILON
                and abs(area["markerLongitude"] - lng) < MARKER_MATCH_EPSILON
            ):
                return json_response(self, 200, area)

        return json_response(self, 404, {"error": "Area not found for marker"})

    def log_message(self, format, *args):
        # Keep console output clean and short.
        return


def main():
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8080"))
    server = ThreadingHTTPServer((host, port), ApiHandler)
    print(f"Mock API running at http://{host}:{port}")
    print("Endpoints:")
    print("  GET /api/areas/{id}")
    print("  GET /api/areas/by-marker?latitude=...&longitude=...")
    print("  GET /health")
    server.serve_forever()


if __name__ == "__main__":
    main()
