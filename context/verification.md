# Verification

No CI config was found in the repo (no `.github/workflows`, no CI badge in
README). Verification today is manual/local. Use these per subsystem:

## Backend (Spring Boot, `Backend/heritagescope/`)
```bash
cd Backend/heritagescope
./mvnw test              # bash/macOS/Linux
mvnw.cmd test             # Windows cmd
./mvnw clean spring-boot:run   # run locally against local PostgreSQL
```
Only one test file currently exists:
`src/test/java/com/heritagescope/heritagescope/HeritagescopeApplicationTests.java`
(Spring context load smoke test).

## Frontend (`App/`)
```bash
cd App
npm install
npm run track   # esbuild bundle + watch, via changeTrackers/buildandTrack.js
```
`App/package.json`'s `test` script is a placeholder (`echo "Error: no test
specified" && exit 1`) — there is no automated frontend test runner
configured. Manual verification = open `App/Map.html` via a static server
(`npx serve .` from repo root) and exercise the feature in-browser.

## Manual/Contributor Tests (`Tests/`)
Per-contributor folders under `Tests/` (e.g. `Armaan-Feature-Tests/`) —
inspect the relevant folder for ad hoc test scripts/notes tied to that
contributor's feature before assuming coverage exists for an area.

## Database
```bash
psql -U <user> -c "CREATE DATABASE heritagescope;"
psql -U <user> -d heritagescope -f Database/heritagescope_dump.sql
```
No migration/rollback tooling — schema changes via Hibernate
`ddl-auto=update` on backend startup (see
[constraints.md](constraints.md) #4) or by editing the dump directly.

## Manual Smoke Checklist (until automated coverage improves)
- Map loads at `App/Map.html`, markers render from `dataset.geojson`.
- Area highlight: click a marker → polygon loads from configured backend
  (`resolveAreaApiBase()`).
- Accessibility: keyboard navigation and colour-blind mode toggle work.
- Wheelchair routing: a route renders via ORS/OSRM for a sample
  origin/destination.
- User report submission round-trips to `UserReportController` and
  persists (check via `psql` or a follow-up GET if available).
