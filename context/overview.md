# HeritageScope — Overview

## Purpose
HeritageScope is an interactive web app promoting protection of cultural and
natural heritage (SDG 11.4) via mapping and environmental impact simulation.
It raises awareness of at-risk sites and encourages responsible visitor
behaviour, and improves accessibility (wheelchair-friendly routing, accessible
facility mapping, inclusive design — SDG 11.2, 11.7).

## Major Subsystems
- **Frontend map app** (`App/`) — Leaflet.js-based interactive map, entry
  point `App/Map.html`, bundled via esbuild into `App/bundle.js`.
- **Backend API** (`Backend/heritagescope/`) — Spring Boot 3.5.11 REST API
  (Java), Spring Data JPA + Hibernate, package
  `com.heritagescope.heritagescope`.
- **Database** (`Database/`) — PostgreSQL 16, schema/data in
  `heritagescope_dump.sql`.
- **Temp Python backend** (`Temp-python-backend/`) — standalone
  `server.py`, appears to be a lightweight/alternate backend used during
  development (see `Temp-python-backend/README.md` for its specific role
  before relying on it).
- **Tests** (`Tests/`) — per-contributor feature test folders (Armaan,
  Arsam, Issac, Jocelyn, Karlie, Yi, yutianWu) — not a single unified test
  suite.
- **LearningLeafletJs/** — scratch/learning scripts for Leaflet.js, not
  part of the shipped app.
- **AI usage/** — per-contributor logs of AI tool usage (project
  requirement/documentation, not code).

## Technology Stack
- Java 17+, Spring Boot 3.5.11, Spring Data JPA, Hibernate
- PostgreSQL 16
- Node.js + esbuild (bundling `App/` JS into `bundle.js`)
- Leaflet.js 1.9.4, Leaflet.markercluster 1.4.1, Leaflet Routing Machine
  (all via CDN)
- html2canvas (map snapshot/download feature)
- Python 3 (only for serving the frontend locally / `Temp-python-backend`)

## External Services (require internet access)
- OpenRouteService (ORS) API — wheelchair routing
- Overpass API — accessible facility markers
- Nominatim — geocoding destination text
- AirVisual API + API Ninjas API — environmental/population metrics
  (`App/metrics/metrics.js`)

## Key Terminology
- **Area Highlighter** — feature/subsystem (`App/AreaHighlighter/`,
  backend `AreaPolygonController`) for highlighting geographic areas on the
  map, backed by `AreaPolygon` entities.
- **Site Status** — heritage site status data (`SiteStatusController`,
  `SiteStatusRepository`, `SiteStatus` entity), consumed by
  `App/siteStatusOverlay.js`.
- **Reporting** — user-submitted reports on sites (`Reporting`,
  `ReportCategory`, `ReportValidator`, `UserReportController`,
  `App/userInputs/userReports.js`).
- **Deployed backend** — a live instance at `http://217.154.38.248:8080/`
  (backend only; frontend must be run locally against it — see
  `App/AreaHighlighter/AreaHighlighter.js` `resolveAreaApiBase()`).

## Where to Start
A new engineer/session should read this file, then
[architecture.md](architecture.md) for how the pieces connect, then
[current-task.md](current-task.md) for what's actively being worked on.
See [realignment.md](realignment.md) for the full context-recovery
procedure.
