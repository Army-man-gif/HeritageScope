# Constraints

## Hard Requirements / Invariants

1. **Backend endpoint contracts must not change without explicit approval.**
   The deployed backend at `http://217.154.38.248:8080/` is a live
   instance other contributors point their local frontend at. Changing
   `AreaPolygonController` / `SiteStatusController` / `UserReportController`
   paths or param names breaks that shared deployment unless it's
   redeployed in lockstep.
   Endpoints currently documented as stable:
   - `GET /api/areas/{id}`
   - `GET /api/areas/by-marker?latitude=...&longitude=...`

2. **Never hand-edit `App/bundle.js` or `App/bundle.js.map`.**
   They are esbuild output generated from `App/*.js` source via
   `npm run track` (`App/changeTrackers/buildandTrack.js`). Edit the
   source modules and rebuild; a hand-edit will be silently clobbered on
   next build and desyncs the sourcemap.

3. **`resolveAreaApiBase()` is the single switch point for backend host.**
   In `App/AreaHighlighter/AreaHighlighter.js`, the final fallback return
   value selects deployed vs. local backend. Don't hardcode the backend
   URL anywhere else in the frontend — new code that needs the API base
   should call this function rather than duplicating the host string.

4. **`spring.jpa.hibernate.ddl-auto=update` is active.**
   (`Backend/heritagescope/src/main/resources/application.properties`)
   Adding/renaming/removing JPA entity fields will auto-alter the live
   PostgreSQL schema on next backend startup — there is no migration
   review step. Treat entity changes as schema changes; verify against
   `Database/heritagescope_dump.sql` staying representative, and update
   the dump if it should remain the canonical seed reference.

5. **Windows path separators.**
   Per README: on Windows, replace `/` with `\` in documented file paths
   when they don't work as-is (e.g. `Backend/heritagescope/src/main/resources/`
   → backslash form). This is a documented environment quirk, not a code
   bug.

6. **External API keys/credentials must not be committed — currently VIOLATED, treat as urgent.**
   Full audit (2026-09-22, [audit/AUDIT.md](../audit/AUDIT.md)) confirmed
   three live API keys hardcoded in committed, publicly-served client JS:
   AirVisual + API Ninjas keys in `App/metrics/metrics.js`, and an
   OpenRouteService key in `App/pathing/pathrouting.js`. These are
   visible to anyone viewing source on the now-public GitHub repo and
   must be treated as already compromised. Do not add further keys this
   way — proxy external API calls through the Spring Boot backend
   instead, reading the key from `application.properties`/env vars
   server-side. Rotating the existing three keys and building the proxy
   is tracked as priority #1 in the audit's recommendations (§9).

7. **Never insert user-submitted content into the DOM via `innerHTML` without escaping.**
   Audit confirmed a stored-XSS vulnerability: `App/userInputs/userReports.js`'s
   `loadReports()` concatenates report `category`/`severity`/`description`/
   `affectedGroups` (all user-submitted, no server-side content
   sanitization beyond length/range checks in `ReportValidator`) directly
   into `innerHTML`. Any new code that renders user-submitted or
   backend-sourced report/comment data must use `textContent` or an
   explicit sanitizer — never raw `innerHTML` string concatenation.

8. **Database credentials must come from `application.properties`/env vars, never hardcoded in Java source.**
   `Backend/.../DatabaseConnection.java` currently hardcodes
   `postgres`/`password123` (and doesn't even match
   `application.properties`'s `password` — see
   [known-problems.md](known-problems.md) #8). Any new raw-JDBC code
   (or its replacement, once `ReportRepository` is migrated to JPA) must
   source credentials the same way Spring's JPA datasource does.

## Not Yet Established
No CSS/layout invariants have been discovered as load-bearing yet (no bug
history to derive them from). Add here immediately if a fix reveals one
(see root operating instructions §10).
