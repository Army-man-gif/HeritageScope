# Decisions

No explicit architectural decision records were found in the repository
(no ADR folder, no decision log) as of this system's setup. Entries below
will be added as decisions are made or as existing intentional
architecture is investigated and confirmed with the team/owner.

## Template for new entries
```text
Decision:
Reason:
Alternatives:
Tradeoffs:
Relevant context:
Date:
```

## Observed-but-unconfirmed decisions (verify before treating as settled)
- **Controllers call repositories directly, no service layer.** Consistent
  across `AreaPolygonController`, `SiteStatusController`,
  `UserReportController`. Likely a simplicity choice for a small student
  project rather than a documented decision — confirm with the team before
  assuming it must stay that way if a feature needs cross-repository
  business logic.
- **Frontend is a hand-assembled Leaflet app bundled with esbuild, not a
  framework (React/Vue/etc.).** Keeps the stack light and matches the
  "no build step needed to just view the map" quick-start path in the
  README. Introducing a framework would be a substantial change requiring
  the two-confirm rule.
