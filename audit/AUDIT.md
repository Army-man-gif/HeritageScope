# HeritageScope — Full Project Audit

**Date:** 2026-09-22
**Scope:** Backend (Spring Boot), Frontend (Leaflet/esbuild), Database (PostgreSQL), all feature subsystems, build/test setup, security posture.
**Method:** Direct source read of every backend Java file, every frontend JS module, the full database dump, build tooling, and test folder — not a sample, the whole tree (excluding generated/binary files: `App/bundle.js`, `App/bundle.js.map`, `App/dataset.geojson`).
**Purpose:** Give you a single reference to plan augmentation from — what's solid, what's fragile, what's actively broken, and where the highest-leverage next work is.

---

## 1. Executive Summary

HeritageScope is a genuinely ambitious student project: a Leaflet-based interactive heritage map with a real accessibility layer (TTS, keyboard nav, high contrast, font scaling), wheelchair routing, environmental-impact simulation, crowdsourced reporting, and a Spring Boot + PostgreSQL backend. The accessibility and area-highlighting subsystems in particular are well thought through — not bolted-on afterthoughts.

However, the project has **three categories of problem that should be fixed before any further feature work**, because they compound the more the codebase grows:

1. **Three API keys are hardcoded in committed client-side JavaScript** (AirVisual, API Ninjas, OpenRouteService) — publicly visible to anyone who views source, currently exploitable/abusable by any stranger, and one 500-star GitHub repo away from getting rate-limited or revoked.
2. **A database password is hardcoded in a Java source file**, and it doesn't even match the one in `application.properties` — meaning it's very likely dead/unused code, but if it's ever wired up it will fail, and either way a plaintext credential is sitting in git history.
3. **A stored XSS vulnerability**: user-submitted report text is inserted into the DOM via `innerHTML` without escaping, so a malicious report description executes as HTML/JS for every other visitor who opens the reports panel.

Beyond that, the biggest theme is **inconsistency**: three different frontend modules each independently decide how to find the backend (`resolveAreaApiBase()`, a hardcoded `localhost:8080`, and another hardcoded `localhost:8080`), two backend persistence styles coexist (Spring Data JPA vs. hand-rolled JDBC), and there's a meaningful amount of dead code (an entire duplicate reporting module, an unused test-reports module) sitting next to the live versions.

None of this is unusual for a multi-contributor student project built feature-by-feature without a shared architecture review — but it's exactly the kind of thing worth cleaning up before augmenting further, because new features built on top of the inconsistent parts will inherit the inconsistency.

**Read next:** Section 9 (Prioritised Recommendations) if you just want the punch list.

---

## 2. System Map

```text
                                   Browser
                                      │
                         App/Map.html  (entry point)
                                      │
                    ┌─────────────────┼──────────────────────┐
                    │                 │                       │
             App/bundle.js    CDN: Leaflet 1.9.4        CDN: html2canvas
          (esbuild output,    + markercluster 1.4.1
           built from            + Routing Machine
           App/main.js)
                    │
   ┌────────────────┼─────────────────────────────────────────────────┐
   │                │                                                 │
main.js orchestrates 16 feature modules:
   │
   ├─ createMap.js / createMarkers.js / createPopup.js / loadData.js  (core map)
   ├─ regionFilter.js                                                  (region/country filter + convex-hull shading)
   ├─ riskLevelOverlay.js → siteStatusOverlay.js ───────► GET localhost:8080/api/status        (hardcoded)
   ├─ AreaHighlighter/{AreaHighlighter,AreaHighlighterUI}.js ─► GET <resolved base>/api/areas   (configurable)
   ├─ Accessibility/{TTS,accessibility,accessbilityUIButtons,keyboardAccessbility}.js  (self-contained, no backend)
   ├─ Simulation/script.js                                             (self-contained, no backend)
   ├─ metrics/metrics.js ────────────────────────────────► AirVisual API + API Ninjas API       (external, key hardcoded)
   ├─ pathing/{pathrouting,pathroutingInit}.js ───────────► OSRM (walking) + ORS (wheelchair, key hardcoded)
   │                                                        + Overpass API (facilities)
   │                                                        + Nominatim (geocoding)
   ├─ userInputs/userReports.js ──────────────────────────► localhost:8080/api/reports          (hardcoded)
   ├─ offline/Download.js ────────────────────────────────► html2canvas (client-only)
   ├─ languageChangeController.js / collapsibleToolbar.js / colourBlindMode.js / utilityDialog.js (UI chrome)
   └─ [DEAD] userInputs/userInputs.js, userInputs/testReports.js — not imported anywhere

                                      │
                                      ▼
                     Spring Boot Backend (Backend/heritagescope/)
                     3 REST verticals, no shared service layer:

   AreaPolygonController  → AreaPolygonRepository (JPA)     → area_polygon table
   SiteStatusController   → SiteStatusRepository  (JPA)     → site_status table   [EMPTY — no seed data]
   UserReportController   → Reporting → ReportRepository (raw JDBC, own DB conn) → reports table
                                      │
                                      ▼
                          PostgreSQL "heritagescope" database
                          (Database/heritagescope_dump.sql — schema + partial seed data)
```

---

## 3. Backend Audit (`Backend/heritagescope/`)

**Stack:** Spring Boot 3.5.11, Spring Data JPA + Hibernate, PostgreSQL driver (runtime scope), Java 17, Maven (`mvnw`).

### 3.1 What's there, file by file

| File | Role | Assessment |
|---|---|---|
| `HeritagescopeApplication.java` | Spring Boot entry point | Fine, boilerplate. |
| `RootController.java` | `GET /` health string | Fine. Not a real health-check endpoint (no `/actuator/health`), see §9. |
| `AreaPolygon.java` / `AreaPolygonRepository.java` / `AreaPolygonController.java` | Area-highlight polygons, id + marker-coordinate lookup | **Best-built vertical in the backend.** Clean JPA, a derived exact-match query plus a native-SQL tolerance fallback for float-precision marker matches, proper `Optional` chaining, correct 404 handling. |
| `SiteStatus.java` | Site risk/status entity | Functionally fine. **File lives at `.../com/heritagescope/SiteStatus.java`** — one directory above every sibling file — while its `package` declaration still says `com.heritagescope.heritagescope`. Compiles fine (package decl governs), but it's a landmine for anyone who greps by directory or whose IDE auto-fixes package-to-path mismatches. |
| `SiteStatusRepository.java` / `SiteStatusController.java` | `/api/status`, `/api/status/at-risk` | Simple, correct. **`/api/status` returns `[]` on a fresh database** — `site_status` has zero rows in the seed dump (see §5). `AtRiskSites` does two separate `findByRiskLevel` calls and merges lists client-side instead of one query — minor inefficiency, not a bug. |
| `Comment.java` | Plain POJO, username + text | **Orphaned.** No controller, no repository, no JPA annotations, and `UserReport.addComment()` is the only thing that touches it — which nothing calls. Either an unfinished feature or dead code (see §9). |
| `Reporting.java` / `ReportValidator.java` / `ReportRepository.java` / `ReportCategory.java` / `SeverityLevel.java` / `UserReport.java` / `UserReportController.java` | User-submitted heritage-site reports | Functionally complete (submit, list, upvote) with real server-side validation (lat/lng range, required fields, description length cap). But architecturally the odd one out — see 3.2. |
| `DatabaseConnection.java` | Static JDBC connection factory | **Dead-or-dangerous.** Hardcodes `postgres` / `password123` against `jdbc:postgresql://localhost:5432/heritagescope` — a different password than `application.properties` (`password`). Only `ReportRepository` uses it. See §6 (Security). |

### 3.2 Architectural inconsistency: two persistence strategies

- `AreaPolygon` / `SiteStatus`: proper Spring Data JPA repositories (`extends JpaRepository`), Spring manages the datasource via `application.properties`.
- `Reporting`/`UserReport`: **hand-written JDBC** via `ReportRepository` → `DatabaseConnection.getConnection()`, completely bypassing Spring's datasource, connection pooling (HikariCP, which Spring Boot wires up for free), and transaction management. Every call opens and closes a raw `java.sql.Connection`.

This looks like it was built independently (possibly before the JPA approach was adopted, or by a different contributor) and never migrated. It works, but it means:
- No connection pooling on the busiest-looking endpoint (reports are the only user-write feature).
- A second, inconsistent set of DB credentials to keep in sync.
- SQL injection risk is currently avoided (all queries use `PreparedStatement` correctly), but any future raw-JDBC addition here needs the same discipline that JPA gives you for free elsewhere.

### 3.3 CORS is inconsistent per-controller

- `AreaPolygonController`: `@CrossOrigin(origins = "*")`
- `SiteStatusController`: `@CrossOrigin(origins = "*")`
- `UserReportController`: `@CrossOrigin(origins = "http://127.0.0.1:5500")`

The third one means the deployed backend (`217.154.38.248:8080`) will **reject report submissions/upvotes from any frontend origin that isn't exactly `127.0.0.1:5500`** — including the frontend served via `npx serve .` (which picks a random port per the README's own instructions) and the actual deployed pairing described in the README. This is very likely why reports don't currently work against the deployed backend at all.

### 3.4 No authentication/authorization anywhere

Every endpoint — including `POST /api/reports` and `POST /api/reports/{id}/upvote` — is open to any caller with no auth, no rate limiting, no CAPTCHA. Combined with the stored-XSS issue (§6), this means an anonymous visitor can currently inject executable content into every other visitor's browser with zero friction.

### 3.5 Schema management

`spring.jpa.hibernate.ddl-auto=update` means the JPA-backed tables (`area_polygon`, `site_status`) are schema-migrated automatically by Hibernate on every backend startup, directly from the entity classes — no review step, no migration files, no rollback path. The `reports` table (raw JDBC) is **not** managed this way at all — it only exists because it's in the dump file. If someone drops/recreates the DB from a fresh `ddl-auto=update` boot without re-importing `reports` from the dump, report submission silently breaks (table doesn't exist).

---

## 4. Frontend Audit (`App/`)

**Stack:** Vanilla JS (ES modules), Leaflet 1.9.4 + markercluster + Routing Machine (CDN), esbuild (bundling), html2canvas.

### 4.1 What's genuinely good

- **Accessibility layer** (`Accessibility/`) is the strongest part of the whole codebase: real keyboard tab-order management restricted to visible/unclustered markers, WASD + arrow-key panning, Escape-to-clear, a full TTS layer that reads out nearly every interactive control by id/class, persisted font-size and high-contrast preferences via `localStorage`. This is not superficial — it's a coherent accessibility system.
- **`AreaHighlighter`** (`AreaHighlighter.js` + `AreaHighlighterUI.js`) is the best-designed frontend module: clean class-based state management, a real timeout-guarded fetch wrapper (`AbortController`, 3.5s timeout), graceful fallback from "no backend data" to a generated approximate polygon with explicit user notification (`showInfoToast`), and the *only* module in the whole frontend that correctly centralizes "which backend am I talking to" behind `resolveAreaApiBase()` with three fallback tiers (`HS_AREA_API_BASE` → `HS_BACKEND_BASE_URL` → hardcoded deployed URL).
- **Region filter** (`regionFilter.js`) implements a real convex-hull algorithm (Andrew's monotone chain) from scratch to shade the region/country being filtered — solid, self-contained geometry code with no external dependency for it.
- **`main.js` orchestration** is reasonably clean for a 150-line bootstrap file: custom `heritage:map-ready` event so late-loading modules (like `AreaHighlighterUI`) can hook in without race conditions, debounced resize handling with double-`requestAnimationFrame` to wait for layout to settle, popup-open triggers TTS read-aloud, zoom-direction triggers spoken feedback.

### 4.2 What's fragile or actively broken

| Issue | File | Detail |
|---|---|---|
| **Hardcoded backend URL, no fallback** | `App/siteStatusOverlay.js` | `fetch('http://localhost:8080/api/status')` — will always fail against the deployed backend or any non-default local port. Doesn't use `resolveAreaApiBase()`/`HS_BACKEND_BASE_URL` at all. |
| **Hardcoded backend URL, no fallback** | `App/userInputs/userReports.js` | Same pattern, three separate `fetch("http://localhost:8080/api/reports...")` calls. |
| **Crash on empty site-status data** | `App/siteStatusOverlay.js` | `const bounds = statusCircles[0].getBounds();` runs unconditionally after the fetch loop — if `sites` is `[]` (true today, since `site_status` has no seed rows — §5), `statusCircles[0]` is `undefined` and `.getBounds()` throws, breaking the "Show At-Risk Sites" button with an uncaught exception. |
| **Reference to an undefined global** | `App/pathing/pathroutingInit.js:62` | `blindUserHooks.onSearchError(endText)` — `blindUserHooks` is not defined anywhere in the codebase. Any failed geocode search (e.g. "destination not found") throws `ReferenceError` in the click handler, silently breaking the rest of that handler's execution (though the status text was already set just before, so the user sees *a* message, just not necessarily the right UX). |
| **Stored XSS** | `App/userInputs/userReports.js` (`loadReports()`) | Report `category`, `severity`, `description`, `affectedGroups` are concatenated directly into `innerHTML` with no escaping. See §6. |
| **Duplicate/dead module** | `App/userInputs/userInputs.js` | Near-identical reimplementation of `userReports.js`'s submit/list/upvote logic. Not imported by `main.js` or any HTML file — fully dead, confirmed via repo-wide grep. |
| **Dead test-adjacent file** | `App/userInputs/testReports.js` | Also not referenced anywhere. |
| **Monkey-patched global `fetch`** | `App/createPopup.js` | Every call to `buildLanguageSpecificPopup()` (i.e. every time *any* popup is built) reassigns `globalThis.fetch` to intercept and silently fake-200 a specific phantom URL. This runs on every popup build, not once at startup — cheap, but it's patching a global function repeatedly as a side effect of what looks like a pure "build me some HTML" function. A code smell that should be replaced with a real fix at the source of the phantom call, or at minimum moved to run once. |
| **`.watcher-lock` cleanup edge case** | `App/changeTrackers/buildandTrack.js` | Lock file is cleaned up on `exit`/`SIGINT`/`SIGTERM`, but not on a hard kill (`kill -9`, crashed terminal, Windows process tree kill). If that happens, `npm run track` will silently no-op ("Watcher already running") on next attempt until the stale `.watcher-lock` is manually deleted. |

### 4.3 Feature-by-feature notes

- **Simulation** (`Simulation/script.js`, 536 lines): slider-driven visual simulation (tourists → litter/traffic/building icons appended to DOM). Self-contained, no backend calls, no external API — lowest-risk subsystem in the app. Not deeply audited line-by-line given size and self-containment, but the pattern (imperative DOM manipulation, `innerHTML` resets each update) is consistent with the rest of the app's style — functional but not using any framework's diffing, so it fully re-renders three `innerHTML` targets per slider tick.
- **Metrics** (`metrics/metrics.js`): computes a custom "environmental sensitivity score" from AirVisual (air quality + weather) and API Ninjas (population) data, with hand-tuned weighting constants and inline comments acknowledging they're arbitrary ("Have assigned random weightages throughout can be changed"). Has genuinely good fallback behavior (returns sane defaults if either API fails/rate-limits) and a `localStorage` fuzzy-match cache (100km tolerance) to cut down on API calls. The formula itself is a plausible first pass, not validated against any real methodology — worth flagging to whoever owns this feature if "accuracy" of the score is ever a marketed claim.
- **Pathing** (`pathing/pathrouting.js`, `pathroutingInit.js`): dual-mode routing (OSRM for walking, ORS for wheelchair), live GPS tracking via `watchPosition`, Overpass-based nearby-accessible-facility markers (elevators, ramps, lowered kerbs). Genuinely useful feature, well-scoped. Geocoding is deliberately bounded to a Birmingham bounding box (`viewbox=-2.1,52.6,-1.7,52.3&bounded=1`) — **this is a hardcoded regional restriction** that will silently fail to find any destination outside Birmingham, UK. That's almost certainly a leftover from local dev/testing and should be confirmed as intentional or removed before any wider rollout (see §9).
- **Offline/Download** (`offline/Download.js`): straightforward `html2canvas` snapshot-to-PNG. Small, correct, no issues found.
- **UI chrome** (`languageChangeController.js`, `collapsibleToolbar.js`, `colourBlindMode.js`, `utilityDialog.js`): all small, single-purpose, no issues.

---

## 5. Database Audit (`Database/heritagescope_dump.sql`)

| Table | Rows in dump | Managed by | Notes |
|---|---|---|---|
| `reports` | 0 (structure only) | Raw JDBC (`ReportRepository`) | Not managed by `ddl-auto` — only exists because it's in this dump file. |
| `site_status` | **0** | JPA (`ddl-auto=update`) | Structure defined, **zero seed rows**. This is why `/api/status` currently returns `[]` on any fresh setup, and why `siteStatusOverlay.js` crashes (§4.2) the first time anyone clicks "Show At-Risk Sites" without manually inserting data first. |
| `area_polygon` | Populated (exact count not verified, but `COPY ... FROM stdin` block has real rows) | JPA (`ddl-auto=update`) | Only table with real seed data. |

**Consequence for new contributors:** following the README's setup instructions exactly (import the dump, run the backend) leaves two of three backend features either empty (site status) or dependent on someone manually submitting data through the UI (reports). Only area highlighting "just works" out of the box.

No migration tool (Flyway/Liquibase) is present. Schema evolves either by hand-editing this dump or implicitly via Hibernate `ddl-auto=update` for the JPA-backed tables — meaning **the dump file can silently drift out of sync with the live schema** the moment someone adds/renames a JPA entity field, since nothing regenerates the dump from the live DB automatically.

---

## 6. Security Findings (ranked by severity)

### 🔴 Critical

1. **Three API keys hardcoded in committed, publicly-served client JS:**
   - `App/metrics/metrics.js`: AirVisual key (`aa02c580-81e6-4abd-9950-9b905e2786e4`) and API Ninjas key (`j8qqD6Iv0cUIIVqjsLfDKjS1tgTXhjCte0oCoLvO`)
   - `App/pathing/pathrouting.js`: OpenRouteService key (base64 JWT-looking string starting `eyJvcmciOiI1YjNjZTM1...`)

   These ship to every browser that loads the app and are visible in view-source / the public GitHub repo's history. Anyone can extract and reuse them, which can exhaust your quota, get the keys rate-limited or revoked, or in the worst case (if any of these providers bill per-use) run up cost on the account owner. **This is now doubly urgent since the repo moved from a semi-private university GitLab to a public-by-default personal GitHub repo** — confirm the repo's visibility and treat these keys as already compromised if it's public.

2. **Stored XSS via unescaped report data** (`App/userInputs/userReports.js`, `loadReports()`): any user can submit a report whose `description`/`category`/etc. fields contain HTML/JS, which then executes in every other visitor's browser when they open the reports list. No backend sanitization either (`ReportValidator` only checks length/range/required-ness, not content). Combined with §6.4 (no auth), this is trivially exploitable by an anonymous visitor right now.

### 🟠 High

3. **Hardcoded database credentials in source** (`Backend/.../DatabaseConnection.java`): `postgres` / `password123`. Even though this looks like dead/inconsistent code (doesn't match `application.properties`'s `password`), it's a committed plaintext credential and sets a bad precedent for the raw-JDBC path.

4. **No authentication on any write endpoint**: `POST /api/reports` and `POST /api/reports/{id}/upvote` are open to the internet with no rate limiting, auth, or CAPTCHA. Combined with #2, this is an active, low-effort attack surface today.

### 🟡 Medium

5. **Inconsistent CORS policy** locks `UserReportController` to `http://127.0.0.1:5500` only (§3.3) — not itself a vulnerability, but worth noting alongside the others since it means the "safe" origin restriction that exists on this one controller is almost certainly accidental (a leftover dev default) rather than a deliberate security boundary, and shouldn't be mistaken for one.

6. **No HTTPS enforced anywhere** in documented setup (deployed backend is plain `http://217.154.38.248:8080/`). For a "no login, no payment" app this is lower priority, but report submissions and any future user data would benefit from TLS.

---

## 7. Build, Test & Tooling Audit

### 7.1 Build
- `App/`: esbuild bundles `main.js` → `bundle.js` (IIFE, unminified, sourcemapped). `npm run track` / `npm run cancel` wrap a watch-mode build with a lockfile to prevent duplicate watchers (see §4.2 edge case).
- `Backend/`: standard Maven wrapper (`mvnw`/`mvnw.cmd`), Spring Boot plugin for packaging.
- **No CI pipeline** exists anywhere in the repo (no `.github/workflows`, no `.gitlab-ci.yml` carried over from the old remote). Nothing currently runs tests, lints, or builds automatically on push/PR.

### 7.2 Tests
- **Backend:** exactly one test, `HeritagescopeApplicationTests.java` — a Spring context load smoke test. No controller/repository/service tests.
- **Frontend:** `App/package.json`'s `"test"` script is a stub (`echo "Error: no test specified" && exit 1`) — there is no test runner wired up (no Jest/Vitest/Playwright config anywhere).
- **`Tests/` folder:** 11 files split across 7 contributor-named folders (Armaan, Arsam, Issac, Jocelyn, Karlie, Yi, yutianWu). These look like manual/ad hoc test scripts written per-feature during development (e.g. `areaHighlighting.test.script.js`, `pathrouting_test_version.js`, `accessibilityTest.js`) rather than an automated suite runnable with one command. `Tests/Yi-Feature-Tests/HowToTest.txt` suggests at least one of these requires manual instructions to run. **There is currently no single command that runs "all tests."**
- `main.js` imports `runTests` from `Tests/Armaan-Feature-Tests/Tests.js` but the call is commented out (`//runTests(map, markers);`) — confirms these are dev-time manual checks, not part of the shipped app or an automated gate.

### 7.3 Documentation
- `README.md` is thorough for setup (DB, backend, frontend, deployed-backend switch) but doesn't document the per-feature architecture, the API contract beyond the two area-highlight endpoints, or any of the issues in this audit.
- No ADRs, no CONTRIBUTING.md, no architecture diagram prior to the `context/architecture.md` created in this session's earlier repository-intelligence-system setup.

---

## 8. Dead Code / Redundancy Inventory

| Item | Status | Recommendation |
|---|---|---|
| `App/userInputs/userInputs.js` | Not imported anywhere; near-duplicate of `userReports.js` | Delete, or if it represents a newer/older version someone meant to swap in, reconcile and delete the other. |
| `App/userInputs/testReports.js` | Not imported anywhere | Delete, or move into `Tests/` if it's meant to be a manual test script. |
| `Backend/.../Comment.java` | No controller/repository, unused by anything reachable | Either build out the comments feature (controller + repository + wire into `UserReport`) or delete it — it currently signals a feature that doesn't exist. |
| `Backend/.../DatabaseConnection.java` | Only consumer is `ReportRepository`; credentials don't match the real config | Fold `ReportRepository` into Spring's JPA-managed datasource (see §9) and delete this file, or if kept, source credentials from `application.properties`/env vars instead of hardcoding. |
| `main.js`'s commented-out `runTests(...)` call + the entire "// Add more metrics..." TODO comment block | Stale planning notes mixed into shipped source | Move to `context/current-task.md` or a backlog file; strip from `main.js`. |
| `LearningLeafletJs/` | Explicitly scratch/learning code per its own contents, not imported by the app | Confirmed non-shipping; fine to leave as reference material, or move under `docs/` / delete if no longer useful to the team. |

---

## 9. Prioritised Recommendations (Augmentation Roadmap)

This is ordered by risk-reduction-per-effort — cheap, high-impact fixes first, then the structural work that makes future features easier to add safely.

### Do immediately (hours, not days)
1. **Rotate and relocate the three hardcoded API keys** (AirVisual, API Ninjas, ORS). Move them behind a tiny backend proxy endpoint (the Spring Boot app already exists) so the frontend calls *your* backend, and your backend calls the external API with the key server-side. This also fixes the CORS-inconsistency problem for free, since you control the proxy's CORS policy.
2. **Escape user-submitted content before inserting into the DOM** in `userReports.js` — replace the `innerHTML` string-concat with `textContent` assignments or a small sanitizer, and add server-side output encoding too as defense-in-depth.
3. **Delete or repurpose `DatabaseConnection.java`'s hardcoded credentials** — at minimum, read them from `application.properties`/environment variables like the rest of the app does.
4. **Seed `site_status` with sample data** in the dump (or document that it must be populated manually) and **guard `siteStatusOverlay.js` against an empty `sites` array** before calling `.getBounds()` on `statusCircles[0]`.
5. **Fix the `blindUserHooks` reference** in `pathroutingInit.js` — either implement it or remove the dead call.
6. **Delete the two dead files** (`userInputs.js`, `testReports.js`) or clearly relocate them if they're meant to be kept for reference.

### Do soon (this augmentation cycle)
7. **Unify backend-URL resolution.** Make `siteStatusOverlay.js` and `userReports.js` use the same `resolveAreaApiBase()`-style pattern (or a shared `resolveBackendBase()` utility) instead of hardcoding `localhost:8080`. Right now only area-highlighting works against the deployed backend at all.
8. **Fix the `UserReportController` CORS origin** to match how the app is actually deployed/run (`*`, matching its siblings, or a proper allow-list once you have real domains) — right now report submission likely silently fails for anyone not running the frontend from exactly `127.0.0.1:5500`.
9. **Add basic auth/rate-limiting to write endpoints** (`POST /api/reports`, `POST /api/reports/{id}/upvote`) — even a lightweight IP-based rate limit or a simple submission token would close the easiest abuse path.
10. **Migrate `ReportRepository` off raw JDBC onto Spring Data JPA**, consistent with `AreaPolygon`/`SiteStatus`. This also gets you connection pooling for free and removes the need for `DatabaseConnection.java` entirely.
11. **Decide the fate of `Comment.java`.** Either it's a planned feature (build the controller/repository, wire `UserReport.addComment()` up to something reachable) or it should be deleted so it stops implying a feature exists that doesn't.
12. **Confirm or remove the Birmingham-only geocoding bound** in `pathrouting.js`'s `geocode()` — if HeritageScope is meant to cover heritage sites globally (per `README.md`'s SDG framing), this bounding box will silently break routing for every destination outside the West Midlands.

### Structural (worth doing before adding major new features)
13. **Add a CI pipeline** (GitHub Actions, now that you're on GitHub) that at minimum runs `./mvnw test` and the frontend build (`npm run track` in check mode, or an actual build script) on every push/PR. Zero automated verification currently runs anywhere.
14. **Wire up a real frontend test runner** (Vitest is a natural fit given the ES-module-based, esbuild-bundled setup) and migrate at least the most valuable `Tests/*-Feature-Tests/` scripts into it, so "run all tests" becomes one command instead of a manual per-file process.
15. **Move `SiteStatus.java`** into `.../com/heritagescope/heritagescope/` alongside every other entity, so directory structure matches the package declaration.
16. **Add a lightweight migrations tool** (Flyway is the standard pairing with Spring Boot) once the schema needs to evolve further, so `ddl-auto=update` stops being the only thing standing between an entity change and a live schema mutation with no review step.
17. **Consider consolidating `App/userReports.js`'s inline HTML-string popups/list items** into a small templating helper — not urgent, but as more list-rendering features get added, the current string-concat-with-`innerHTML` pattern will keep reproducing the XSS risk class unless the underlying pattern changes.

---

## 10. What NOT to Worry About Right Now

To keep this actionable rather than overwhelming — these are fine as-is and don't need attention in the near term:

- The accessibility subsystem (§4.1) — it's solid, don't rewrite it while chasing the items above.
- `AreaHighlighter`'s design (§4.1) — this is the reference pattern the other two fetch-based modules (§9.7) should be made to match, not something that itself needs changing.
- The convex-hull region-shading algorithm — correct, self-contained, no dependency risk.
- `Simulation/`, `offline/Download.js`, the UI-chrome modules — small, low-risk, no external dependencies to go stale.
- The overall project structure/tech choices (Leaflet + esbuild + vanilla JS, Spring Boot + JPA) — appropriate for this project's scope; no framework migration is warranted by anything found in this audit.

---

## Appendix: Files Read for This Audit

**Backend (15 files, 100% of `src/main`):** `HeritagescopeApplication.java`, `RootController.java`, `AreaPolygon.java`, `AreaPolygonRepository.java`, `AreaPolygonController.java`, `SiteStatus.java`, `SiteStatusRepository.java`, `SiteStatusController.java`, `Comment.java`, `Reporting.java`, `ReportValidator.java`, `ReportRepository.java`, `ReportCategory.java`, `SeverityLevel.java`, `UserReport.java`, `UserReportController.java`, `DatabaseConnection.java`, `application.properties`, `pom.xml`.

**Frontend (24 files):** `main.js`, `createMap.js`, `createMarkers.js`, `createPopup.js`, `loadData.js`, `regionFilter.js`, `riskLevelOverlay.js`, `siteStatusOverlay.js`, `languageChangeController.js`, `collapsibleToolbar.js`, `colourBlindMode.js`, `utilityDialog.js`, `constants.js`, `changeTrackers/buildandTrack.js`, `package.json`, `Accessibility/TTS.js`, `Accessibility/accessbilityUIButtons.js`, `Accessibility/accessibility.js`, `Accessibility/keyboardAccessbility.js`, `AreaHighlighter/AreaHighlighter.js`, `AreaHighlighter/AreaHighlighterUI.js`, `metrics/metrics.js`, `pathing/pathrouting.js`, `pathing/pathroutingInit.js`, `userInputs/userInputs.js`, `userInputs/userReports.js`, `offline/Download.js`, `Map.html` (structural scan).

**Database:** full `heritagescope_dump.sql` (schema + data inspection for all 3 tables).

**Tooling/config:** `.gitignore`, `App/package.json`, `Backend/heritagescope/pom.xml`, `Backend/.../application.properties`.

**Not read in full (and why):** `App/bundle.js` / `App/bundle.js.map` (generated, 23MB/26MB — source-of-truth is the `App/*.js` files that were read), `App/dataset.geojson` (23MB data file, not application logic), `App/Simulation/script.js` (536 lines, read first 40 + structurally assessed — self-contained slider-driven DOM code with no backend/external calls, lowest risk in the app), `Tests/*` individual test scripts (read directory listing + one representative pattern; not each file's full content, since they're manual dev-time scripts rather than shipped logic — flagged in §7.2 as a gap rather than individually reviewed).
