# Repository Realignment

Use this whenever starting a new session, recovering from context loss,
or feeling uncertain about the project's architecture. Do not guess — do
not immediately scan the whole repository.

## Step 1 — Query SQLite first (mandatory entry point)
```bash
python -c "
import sqlite3
con = sqlite3.connect('.ai/knowledge.db')
for row in con.execute('SELECT key, value FROM realignment'):
    print(row)
"
```
This returns the machine-readable pointer record: which context docs are
foundational, which are task-dependent, and the current task summary.

## Step 2 — Read in this order, stop as soon as you have enough
1. `context/handoff.md` — what was literally just done, most recent first.
2. `context/current-task.md` — the active task and open questions.
3. `context/constraints.md` — hard invariants, read before any edit.
4. Targeted SQLite query for the specific area you're touching, e.g.:
   ```sql
   SELECT path, description FROM files WHERE tags LIKE '%<area>%';
   SELECT title, description FROM constraints WHERE severity = 'hard';
   SELECT title, lesson FROM failed_solutions WHERE area = '<area>';
   ```
5. Only if the task genuinely needs the broader model:
   `context/overview.md`, `context/architecture.md`,
   `context/dependencies.md`, `context/decisions.md`,
   `context/known-problems.md`.

## Step 3 — Targeted source retrieval
Once you know *which* files matter (from step 2's docs or SQLite), read
those specific files. Do not `Glob`/read the whole repo — HeritageScope
has multi-megabyte generated files (`App/bundle.js`,
`App/bundle.js.map`, `App/dataset.geojson`) that must never be loaded in
full into context.

## How to Determine What Is Current
- Source code and passing tests outrank documentation.
- `context/handoff.md`'s topmost block outranks older blocks below it.
- `context/current-task.md`'s "Active" section outranks
  "Recently Completed".
- If context docs and source code disagree, investigate, trust current
  source behavior for implementation, then update the doc.

## Where Historical Knowledge Lives
`context/archive/` — `legacy-context/`, `historical-handoffs/`,
`old-task-notes/`. Nothing has been archived yet (system just
initialized); this will fill up as `handoff.md` and `current-task.md`
rotate content out over time (see root operating instructions §16).

## Recovering From Conflicting Information
Do not silently pick one side. State the conflict, check current source
code, check `git log` on the relevant file, and update whichever context
doc is stale — never delete the losing side without archiving it first if
it has any historical value.

## Rebuilding Working Memory (minimum sufficient model)
For most tasks: `overview.md` (skim) → `current-task.md` →
`constraints.md` → the specific feature vertical in `architecture.md`
and `dependencies.md` → the actual source files for that vertical. That
is normally sufficient; do not load more unless reasoning surfaces a
genuine gap.
