# Handoff

## What Was Just Done (2026-09-22, later same day)
**Task:** Migrate remote from university GitLab to owner's personal
GitHub repo (`https://github.com/Army-man-gif/HeritageScope.git`), then
push the repository intelligence system.

**Completed:**
- Repointed `origin` from `git.cs.bham.ac.uk/.../DigitalDreamTeam.git` to
  the new GitHub repo.
- GitHub repo was created with its own skeleton (`.gitignore` +
  one-line `README.md`). Fetched it and merged it into local `main` with
  `git merge origin/main --allow-unrelated-histories` (not a rebase — 275
  pre-existing commits were too many/complex with embedded merge commits
  to safely rewrite). Resolved conflicts by keeping the project's real
  `README.md` and combining both `.gitignore`s (kept `.DS_Store` entries,
  added GitHub's Python-focused template on top).
- Updated `context/gitContext.md` to point at the new GitHub upstream and
  note the migration + preserved history.
- Committed and pushed the context system (`CLAUDE.md`, `context/`,
  `.ai/`) to the new `origin/main`.
- Note: the earlier "initial setup" commit described in the block below
  was made, then explicitly un-committed (`git reset --soft` + unstage)
  at the owner's request before this migration — so that commit hash
  no longer exists; these files were re-committed fresh as part of this
  step.

**Important discoveries:**
- Old GitLab feature branches (`karlie/accessibility-ui`,
  `Esther-feature/path-routing`, `user-inputs`, `TextToSpeech`) were not
  re-pushed to GitHub — they only exist in GitLab history now.

**Next recommended step:** None outstanding from this task. Normal
engineering work can resume from `current-task.md`.

## What Was Just Done (2026-09-22)
**Current task:** Initial setup of the persistent repository intelligence
system for HeritageScope (this repo had no prior CLAUDE.md, context/, or
.ai/ — nothing existed to migrate, so this is a from-scratch build, not a
migration).

**Completed:**
- Inventoried the repo (README, all top-level dirs, backend Java package
  structure, `application.properties`, `Temp-python-backend/README.md`).
- Wrote `context/overview.md`, `architecture.md`, `dependencies.md`,
  `constraints.md`, `known-problems.md`, `decisions.md`,
  `failed-solutions.md`, `current-task.md`, `verification.md`,
  `gitContext.md`, `revert-state.md`.
- Verified two claims directly against source before writing them:
  `SiteStatus.java` package declaration (still
  `com.heritagescope.heritagescope` despite file living one directory up),
  and `spring.jpa.hibernate.ddl-auto=update` in `application.properties`.
- Confirmed `Temp-python-backend/` is a mock area-highlight API backend
  (no DB), not a rival/replacement for the Spring Boot backend.

**Important discoveries:**
- No CI config exists — verification is manual (see `verification.md`).
- No ADRs/decision log existed — `decisions.md` seeded with a template
  plus two unconfirmed-but-observed architectural patterns worth
  double-checking with the team later.
- Deployed backend at `http://217.154.38.248:8080/` is shared — endpoint
  contract changes need care (see `constraints.md` #1).
- `spring.jpa.hibernate.ddl-auto=update` means entity changes can silently
  alter the live schema — flagged as a hard constraint.

**Important files:** see `context/dependencies.md` and
`context/architecture.md` for the full map; nothing unusual about file
locations except `SiteStatus.java` (see `known-problems.md` #1).

**Implementation state:** Remaining setup steps: `.ai/knowledge.db` +
`rebuild_db.py` + `sync_context.py`, `CLAUDE.md`, `realignment.md`,
`savings-log.md` first entry, then commit.

**Remaining work:** None outside finishing this setup task. Next actual
engineering task should start by reading this handoff +
`current-task.md`.

**Known problems:** See `context/known-problems.md` (5 entries, none
urgent).

**Important decisions:** None made this session beyond the setup
structure itself, which follows the operating instructions given verbatim
(context/ + .ai/ + CLAUDE.md, no deviation).

**Next recommended investigation:** Confirm whether `Comment.java` has a
controller/repository (open question in `current-task.md`) the next time
work touches reporting/comments.
