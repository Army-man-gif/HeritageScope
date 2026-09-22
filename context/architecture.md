# Architecture

## High-Level Data Flow

```text
Browser (App/Map.html, loads App/bundle.js built from App/*.js)
    │
    ├── Leaflet map + CDN libraries (Leaflet, markercluster, Routing Machine)
    │
    ├── Static data: App/dataset.geojson (heritage site dataset, ~23MB)
    │
    ├── HTTP calls ──────────────► Spring Boot Backend (Backend/heritagescope)
    │                                  │
    │                                  ├── AreaPolygonController  → AreaPolygonRepository → PostgreSQL
    │                                  ├── SiteStatusController   → SiteStatusRepository   → PostgreSQL
    │                                  ├── UserReportController   → ReportRepository       → PostgreSQL
    │                                  └── RootController (health/root)
    │
    └── HTTP calls ──────────────► External services (ORS, Overpass, Nominatim, AirVisual, API Ninjas)
```

## Frontend (`App/`)
- Entry HTML: `App/Map.html` — loads Leaflet/CDN assets and `App/bundle.js`.
- Source JS modules are hand-written under `App/` and its subfolders;
  `App/bundle.js` (+ `.map`) is the esbuild output — **do not hand-edit
  `bundle.js` directly**, edit source and rebuild (`npm run track` per
  `App/package.json`, which runs `App/changeTrackers/buildandTrack.js`).
- Feature folders:
  - `App/Accessibility/` — TTS, keyboard accessibility, accessible UI
    buttons.
  - `App/AreaHighlighter/` — area highlight UI + API client
    (`resolveAreaApiBase()` controls which backend host is used).
  - `App/Simulation/` — environmental impact simulation UI
    (`simulation.html`, `script.js`).
  - `App/metrics/` — environmental/population metrics UI, calls AirVisual +
    API Ninjas.
  - `App/pathing/` — wheelchair/walking route generation via Leaflet
    Routing Machine / OSRM.
  - `App/userInputs/` — user report submission/display
    (`userReports.js`, `testReports.js`, `userInputs.js`).
  - `App/offline/` — offline/download support (`Download.js`, relates to
    `html2canvas`-based `downloadMap()`).
  - `App/styles/` — CSS, including `colourBlindModes.css`,
    `accessibility.css`.
  - `App/changeTrackers/` — build/watch tooling
    (`buildandTrack.js`, `stopTracker.js`), not shipped app logic.

## Backend (`Backend/heritagescope/`)
Spring Boot app, base package `com.heritagescope.heritagescope`.
Note: `SiteStatus.java`'s *file* lives one directory level up
(`src/main/java/com/heritagescope/SiteStatus.java`), but its `package`
declaration is still `com.heritagescope.heritagescope` — the directory
placement is inconsistent with the rest of the package's file layout,
though not currently a functional bug. See
[known-problems.md](known-problems.md).

Layering follows a standard Spring MVC → Repository → DB pattern per
feature (no separate service layer observed — controllers use
repositories directly):

```text
Controller (REST endpoints)
    ↓
Repository (Spring Data JPA interface)
    ↓
Entity (JPA-mapped class)
    ↓
PostgreSQL (heritagescope database)
```

Feature verticals:
- **Area Polygon**: `AreaPolygonController` → `AreaPolygonRepository` →
  `AreaPolygon`. Endpoints: `GET /api/areas/{id}`,
  `GET /api/areas/by-marker?latitude=...&longitude=...`.
- **Site Status**: `SiteStatusController` → `SiteStatusRepository` →
  `SiteStatus`.
- **User Reporting**: `UserReportController` → `ReportRepository` →
  `Reporting`/`UserReport`, validated via `ReportValidator`, categorized
  via `ReportCategory`/`SeverityLevel`.
- **Comments**: `Comment.java` entity (controller/repository not
  separately confirmed — check source if working on this).
- `DatabaseConnection.java` — datasource/connection configuration.
- `RootController.java` — root/health endpoint.

## Database (`Database/`)
Single dump file `heritagescope_dump.sql` defines schema + seed data for
the `heritagescope` PostgreSQL database. There is no separate migrations
tool (e.g. Flyway/Liquibase) observed. `application.properties` sets
`spring.jpa.hibernate.ddl-auto=update`, so Hibernate auto-updates the
schema from JPA entities at startup — entity changes alone can silently
alter the live schema. See [constraints.md](constraints.md).

## Deployment Topology
- A backend instance is deployed at `http://217.154.38.248:8080/` (API
  only, no frontend hosting).
- Frontend is always run locally (static file server), pointed at either
  the deployed backend or a local one via
  `App/AreaHighlighter/AreaHighlighter.js` → `resolveAreaApiBase()`.

## Architectural Rules
- Controller endpoint contracts (paths/params) must remain compatible when
  pointed at the deployed backend — see
  [constraints.md](constraints.md).
- `App/bundle.js` is generated; never treated as source of truth for
  review/edits.
