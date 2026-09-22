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

6. **External API keys/credentials are not committed.**
   ORS, Overpass, Nominatim, AirVisual, and API Ninjas are called from
   client-side JS (`App/metrics/metrics.js`, `App/pathing/*`,
   `App/AreaHighlighter/*`). Any API key used must not be committed to the
   repo; check `.gitignore` coverage before adding new client-side
   integrations that require a key.

## Not Yet Established
No CSS/layout invariants have been discovered as load-bearing yet (no bug
history to derive them from). Add here immediately if a fix reveals one
(see root operating instructions §10).
