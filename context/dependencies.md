# Dependencies

## Frontend Build Dependency Chain
```text
App/*.js (source modules)
    ↓ (esbuild, via App/changeTrackers/buildandTrack.js, `npm run track`)
App/bundle.js + App/bundle.js.map
    ↓ (script tag)
App/Map.html
```
`App/Map.html` also loads, via CDN, in this order of relevance:
Leaflet.js 1.9.4 → Leaflet.markercluster 1.4.1 → Leaflet Routing Machine.

## Frontend Module Relationships (by feature)
```text
main.js
    ├── createMap.js
    ├── createMarkers.js  → createPopup.js
    ├── loadData.js       → dataset.geojson
    ├── regionFilter.js
    ├── riskLevelOverlay.js
    ├── siteStatusOverlay.js   → Backend SiteStatusController
    ├── languageChangeController.js
    ├── collapsibleToolbar.js
    ├── colourBlindMode.js     → styles/colourBlindModes.css
    ├── utilityDialog.js
    ├── Accessibility/*        (TTS.js, keyboardAccessbility.js, accessbilityUIButtons.js)
    ├── AreaHighlighter/AreaHighlighter.js → resolveAreaApiBase() → Backend AreaPolygonController
    │       └── AreaHighlighterUI.js
    ├── Simulation/script.js   → Simulation/simulation.html
    ├── metrics/metrics.js     → AirVisual API, API Ninjas API
    ├── pathing/pathroutingInit.js → pathing/pathrouting.js → OpenRouteService / OSRM
    ├── userInputs/userInputs.js → userReports.js → Backend UserReportController
    └── offline/Download.js    → html2canvas
```

## Backend Dependency Chain (per feature vertical)
```text
Controller → Repository → Entity → PostgreSQL (heritagescope db)

AreaPolygonController   → AreaPolygonRepository → AreaPolygon
SiteStatusController    → SiteStatusRepository   → SiteStatus
UserReportController    → ReportRepository        → Reporting / UserReport
                                                       ↑ validated by ReportValidator
                                                       ↑ categorized by ReportCategory, SeverityLevel
DatabaseConnection.java → spring datasource config (application.properties)
```

## Upstream/Downstream: Deployed Backend Host
```text
App/AreaHighlighter/AreaHighlighter.js
    resolveAreaApiBase()
        ↓ fallback
    http://217.154.38.248:8080/api/areas   (deployed)
        — OR —
    http://localhost:8080/api/areas        (local, manual edit required)
```
Changing this value is the *only* supported way to switch which backend
the frontend talks to — see [constraints.md](constraints.md).

## External Service Dependencies
```text
App/pathing/*         → OpenRouteService (ORS) API   (wheelchair routing)
App/AreaHighlighter/*  → Overpass API                 (accessible facility markers)
App/pathing/*, others  → Nominatim                    (geocoding)
App/metrics/metrics.js → AirVisual API, API Ninjas API (environmental/population metrics)
```

## Database Dependency
```text
Database/heritagescope_dump.sql
    ↓ (psql import)
PostgreSQL "heritagescope" database
    ↓ (JDBC, via Backend/heritagescope/src/main/resources/application.properties)
Spring Boot Backend (DatabaseConnection.java + JPA repositories)
```
