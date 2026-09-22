# Known Problems

1. **`SiteStatus.java` file location inconsistent with sibling files.**
   Lives at `Backend/heritagescope/src/main/java/com/heritagescope/SiteStatus.java`
   (one directory level above the rest of the entities/controllers, which
   are under `.../com/heritagescope/heritagescope/`), but its `package`
   declaration is still `com.heritagescope.heritagescope`. Compiles fine
   (package declaration governs, not directory), but is a maintenance trap
   — easy to miss when searching by directory, and Maven/IDE tooling that
   assumes directory-matches-package can flag it. Not urgent to fix; note
   it before creating new entities so it isn't copied as a pattern.

2. **No unified test suite.**
   `Tests/` is split into one folder per contributor
   (`Armaan-Feature-Tests/`, `Arsam-Feature-Tests/`, etc.) rather than a
   conventional `src/test` structure per subsystem. There is a
   `Backend/heritagescope/src/test/java/.../HeritagescopeApplicationTests.java`
   (Spring Boot default test) separately. No single command runs "all
   tests" across both — see [verification.md](verification.md) for what
   can currently be run.

3. **`Temp-python-backend/` is a mock backend, confirmed non-blocking.**
   Per its README: a minimal mock for the area-highlight API only
   (no database), serving `GET /api/areas/{id}`,
   `GET /api/areas/by-marker`, `GET /health` on `http://127.0.0.1:8080` by
   default. It exists so the frontend can be developed without running
   PostgreSQL + Spring Boot. It is not a replacement for the real backend
   and doesn't need a `resolveAreaApiBase()` change to use — it instead
   expects `globalThis.HS_BACKEND_BASE_URL` to be set before app scripts
   run. Safe to ignore unless working specifically on frontend-only
   area-highlight development.

4. **Large binary/generated assets committed to git.**
   `App/bundle.js` (~23MB), `App/bundle.js.map` (~26MB), and
   `App/dataset.geojson` (~23MB) are all committed. This is not
   necessarily wrong (dataset may need to ship with the static site), but
   it bloats clone size and diffs on every bundle rebuild. Flag if repo
   size/clone time becomes a complaint.

5. **`App/.watcher-lock` file present.**
   Suggests `buildandTrack.js`'s watcher may not always clean up its lock
   file on exit. If `npm run track` ever refuses to start claiming another
   instance is running, check/remove this file — not yet confirmed as an
   active bug, just a fragility flag.

## Found in full audit (2026-09-22, see [audit/AUDIT.md](../audit/AUDIT.md))

6. **`siteStatusOverlay.js` crashes when `site_status` is empty.**
   `App/siteStatusOverlay.js`'s `toggleStatusOverlay()` calls
   `statusCircles[0].getBounds()` unconditionally after building circles
   from the fetch response. `Database/heritagescope_dump.sql` seeds zero
   rows into `site_status`, so on any fresh setup this throws
   immediately the first time "Show At-Risk Sites" is clicked. Fix:
   guard on `statusCircles.length > 0` before calling `.getBounds()`, and
   seed `site_status` with sample data in the dump.

7. **`blindUserHooks` is referenced but never defined.**
   `App/pathing/pathroutingInit.js:62` calls
   `blindUserHooks.onSearchError(endText)` on a failed geocode search.
   No file in the repo defines `blindUserHooks` (confirmed via
   repo-wide grep). Throws `ReferenceError` inside the async click
   handler whenever a destination search fails.

8. **Two backend persistence strategies coexist.**
   `AreaPolygon`/`SiteStatus` use Spring Data JPA (pooled, Spring-managed
   datasource). `Reporting`/`UserReport` use hand-written JDBC via
   `ReportRepository` → `DatabaseConnection.getConnection()`, which opens
   a fresh unpooled connection per call and duplicates DB credentials
   (see [constraints.md](constraints.md) — credentials also don't match
   `application.properties`). Migrate `ReportRepository` onto JPA to
   remove this split and delete `DatabaseConnection.java`.

9. **Backend-URL resolution is inconsistent across frontend modules.**
   Only `App/AreaHighlighter/AreaHighlighter.js`'s `resolveAreaApiBase()`
   correctly resolves which backend host to call (with fallback tiers).
   `App/siteStatusOverlay.js` and `App/userInputs/userReports.js` both
   hardcode `http://localhost:8080/...` directly, so they cannot work
   against the deployed backend (`217.154.38.248:8080`) at all without a
   code edit. See [constraints.md](constraints.md) #3.

10. **`UserReportController`'s CORS origin likely blocks real usage.**
    `@CrossOrigin(origins = "http://127.0.0.1:5500")` — the only
    controller not using `origins = "*"` like its siblings. Blocks
    report submission from any frontend not served from exactly that
    origin, including `npx serve .` (which the README itself says picks
    a random port) and the documented deployed-backend pairing.

11. **`Comment.java` is orphaned.**
    Plain POJO with no controller, no repository, no JPA annotations.
    Only touched by `UserReport.addComment()`, which nothing calls.
    Either an unfinished feature or dead code — decide and either build
    it out or delete it.

12. **Dead duplicate frontend modules.**
    `App/userInputs/userInputs.js` (near-duplicate of the live
    `userReports.js`) and `App/userInputs/testReports.js` are not
    imported by any HTML or JS file in the repo (confirmed via
    repo-wide grep). Safe to delete or explicitly relocate.

13. **Geocoding is hardcoded to a Birmingham, UK bounding box.**
    `App/pathing/pathrouting.js`'s `geocode()` passes
    `countrycodes=gb&viewbox=-2.1,52.6,-1.7,52.3&bounded=1` to Nominatim.
    Any destination outside that box will not be found. Confirm this is
    intentional (dev/testing scope) before treating pathing as
    production-ready for non-Birmingham heritage sites.
