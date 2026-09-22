# Current Task

## Active
(none — awaiting next task; see [audit/AUDIT.md](../audit/AUDIT.md) §9 for
the prioritised list of what to tackle next if augmenting the project)

## Recently Completed
- **2026-09-22 — Full project audit.** Read every backend Java file,
  every frontend JS module, the full DB dump, and build/test tooling.
  Wrote `audit/AUDIT.md` (10 sections: exec summary, system map, backend/
  frontend/database audits, ranked security findings, build/test/tooling
  audit, dead-code inventory, prioritised recommendations, "don't touch"
  list). Folded the concrete findings into `known-problems.md` (#6-13)
  and `constraints.md` (#6-8, including correcting #6 from a
  forward-looking rule to reflect a confirmed live violation: 3 hardcoded
  API keys in committed client JS). Top findings: hardcoded API keys
  (critical), stored XSS in report rendering (critical), hardcoded/
  mismatched DB credentials, no auth on write endpoints, and a
  system-wide inconsistency where only `AreaHighlighter` correctly
  resolves the backend host.

- **2026-09-22 — Stand up persistent repository intelligence system.**
  Created `context/*.md` (overview, architecture, dependencies,
  constraints, known-problems, decisions, failed-solutions, current-task,
  verification, gitContext, handoff, revert-state, realignment,
  savings-log), `.ai/knowledge.db` + `rebuild_db.py` + `sync_context.py`,
  and `CLAUDE.md`. No pre-existing context system found — nothing
  migrated or destroyed, pure from-scratch build. Open question carried
  forward: whether `Comment.java` has a dedicated controller/repository.

