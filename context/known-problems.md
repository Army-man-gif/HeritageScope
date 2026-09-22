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
