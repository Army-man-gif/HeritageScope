# CLAUDE.md — Operating Instructions

This repository uses a persistent repository intelligence system. Do not
rely on conversational memory alone — this repo maintains externalized,
searchable engineering memory across sessions. Read this file first, every
session.

## The System
```text
CLAUDE.md (you are here)
    ↓
.ai/knowledge.db       — machine-queryable index, QUERY FIRST
    ↓
context/realignment.md — human-readable map, read SECOND
    ↓
context/*.md            — durable project knowledge (primary source of truth)
```

- `context/*.md` is the primary, human-readable knowledge base. It is not
  disposable — treat it as seriously as source code.
- `.ai/knowledge.db` is a machine-queryable index of that knowledge (files,
  dependencies, constraints, decisions, known problems, failed solutions,
  verification rules, git config, realignment pointers). It can always be
  regenerated from `context/*.md` + source via `python .ai/rebuild_db.py`
  — it is an accelerator, never the sole source of truth.

## Every Session: Start Here
1. Query `.ai/knowledge.db`'s `realignment` table (or just read
   `context/realignment.md` directly — it says the same thing in prose).
2. Read `context/handoff.md` (most recent block first) and
   `context/current-task.md`.
3. Read `context/constraints.md` before touching any code.
4. Pull in `overview.md` / `architecture.md` / `dependencies.md` /
   `decisions.md` / `known-problems.md` only as the task actually needs
   them — not as routine warm-up reading. They're large; load
   selectively.
5. For anything more specific, query SQLite:
   ```bash
   python -c "
   import sqlite3
   con = sqlite3.connect('.ai/knowledge.db')
   for row in con.execute(\"SELECT path, description FROM files WHERE tags LIKE '%<area>%'\"):
       print(row)
   "
   ```

## Context Degradation / Starting From Zero
If you lose track of the architecture, forget why something exists,
contradict earlier established facts, or are picking up another session's
work: do not guess and do not blindly scan the whole repo. Follow
`context/realignment.md` step by step instead.

## Before Any Non-Trivial Code Change
1. Record a safe-point: `git rev-parse HEAD`, log it in
   `context/revert-state.md`.
2. Ghost test: mentally trace the change through every affected file, call
   site, and consumer before touching anything. Mandatory for shared
   utilities, sentinels/constants defined in multiple files, anything in
   `context/known-problems.md` or `context/constraints.md`, or anything
   you're uncertain about.
3. Make the change.
4. Run relevant verification from `context/verification.md`.
5. If durable knowledge was discovered (new constraint, new dependency,
   new bug, failed approach, architectural decision), update the matching
   `context/*.md` file, then sync SQLite:
   - Text-only edit to `context/*.md` → `python .ai/sync_context.py`
   - Structured data changed (files/deps/constraints/decisions/problems/
     failed-solutions/git config) → `python .ai/rebuild_db.py`

## Git Workflow
See `context/gitContext.md` for the upstream, branch prefix, and trigger
word. Default: work on a dedicated `ai/<description>` branch off `main`,
commit, push, open a Merge Request, then **wait for the user to merge** —
never merge automatically, never push straight to `main`.

## Progress Updates
Give short inline progress updates as you work (what was just done, rough
% complete), not just a summary at the end. See root operating
instructions for the exact format if this project's owner has shared
them; otherwise a brief "done with X, moving to Y" per meaningful step is
sufficient.

## End of Session
Before finishing non-trivial work: update `context/revert-state.md`
status, move completed work out of `context/current-task.md`'s Active
section, prepend a new block to `context/handoff.md`, sync SQLite, and
append one line to `context/savings-log.md`. Ship context updates in the
same commit as the code — they are part of the deliverable, not optional
follow-up.

## What NOT to Do
- Don't load the entire repo into context. `App/bundle.js` (~23MB),
  `App/bundle.js.map` (~26MB), and `App/dataset.geojson` (~23MB) must
  never be read in full — see `context/known-problems.md`.
- Don't treat SQLite as the sole source of truth, and don't treat
  `context/*.md` as disposable cache.
- Don't skip the ghost test before a change.
- Don't auto-merge PRs/MRs.
- Don't silently discard conflicting historical information — investigate
  and reconcile, or archive it in `context/archive/`.

## Project Snapshot (see context/overview.md for full detail)
HeritageScope: Leaflet.js frontend (`App/`) + Spring Boot backend
(`Backend/heritagescope/`) + PostgreSQL (`Database/`), promoting cultural/
natural heritage protection and accessible, low-impact tourism.
