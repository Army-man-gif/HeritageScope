# Git Context

```yaml
upstream:      https://github.com/Army-man-gif/HeritageScope.git
base_branch:   main
branch_prefix: ai/
auto_merge:    false
trigger_word:  not yet configured — ask the owner what phrase means
               "commit and push now" before performing the git trigger
               workflow automatically
workflow: >
  Create/switch to a dedicated branch (ai/<short-description>) off main,
  stage relevant files, commit with a meaningful message, push, open a
  Pull Request against main, then wait for the user to merge. Never push
  directly to main without explicit instruction. Never auto-merge.
notes: >
  Migrated 2026-09-22 from a university GitLab instance
  (git.cs.bham.ac.uk/software-engineering-2025-26/DigitalDreamTeam) to
  this personal GitHub repo. Full commit history (275 original commits)
  was preserved via `git merge --allow-unrelated-histories` against
  GitHub's auto-generated skeleton (.gitignore + placeholder README),
  not a rebase — so commit hashes from the GitLab era are unchanged.
  Use `gh` CLI for PR/issue operations here, not `glab`.
  Old feature branches (`karlie/accessibility-ui`,
  `Esther-feature/path-routing`, `user-inputs`, `TextToSpeech`) existed on
  the GitLab remote; they have not been re-pushed to GitHub — verify with
  `git branch -a` before assuming they exist here.
```

## Migration Note
The old GitLab remote is no longer used for this project — do not push
there. If a `git remote` entry named `gitlab` or similar exists, treat it
as historical/inactive unless the owner says otherwise.
