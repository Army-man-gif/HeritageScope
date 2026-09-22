#!/usr/bin/env python3
"""Incremental sync: re-hash context/*.md and update content_hash/updated_at
for any that changed. Does NOT touch files/dependencies/constraints/etc —
use rebuild_db.py for structured-data changes.
"""
import hashlib
import os
import re
import sqlite3
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONTEXT_DIR = os.path.join(REPO_ROOT, "context")
DB_PATH = os.path.join(os.path.dirname(__file__), "knowledge.db")


def file_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def extract_title(md_text):
    m = re.search(r"^#\s+(.+)$", md_text, re.MULTILINE)
    return m.group(1).strip() if m else None


def main():
    if not os.path.exists(DB_PATH):
        print("knowledge.db not found — run rebuild_db.py first", file=sys.stderr)
        return 1

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    known = {row[0] for row in cur.execute("SELECT name FROM context_documents")}
    on_disk = set()
    changed = 0
    added = 0

    for fname in sorted(os.listdir(CONTEXT_DIR)):
        if not fname.endswith(".md"):
            continue
        full = os.path.join(CONTEXT_DIR, fname)
        if not os.path.isfile(full):
            continue
        name = fname[:-3]
        on_disk.add(name)
        new_hash = file_hash(full)
        with open(full, "r", encoding="utf-8") as f:
            title = extract_title(f.read())

        cur.execute("SELECT content_hash FROM context_documents WHERE name = ?", (name,))
        row = cur.fetchone()
        if row is None:
            cur.execute(
                "INSERT INTO context_documents (name, path, title, content_hash, updated_at) VALUES (?, ?, ?, ?, datetime('now'))",
                (name, f"context/{fname}", title, new_hash),
            )
            added += 1
        elif row[0] != new_hash:
            cur.execute(
                "UPDATE context_documents SET title = ?, content_hash = ?, updated_at = datetime('now') WHERE name = ?",
                (title, new_hash, name),
            )
            changed += 1

    missing = known - on_disk
    for name in missing:
        print(f"warning: {name} is indexed but no longer on disk (not auto-removed; run rebuild_db.py to reconcile)")

    con.commit()
    con.close()
    print(f"Sync complete: {added} added, {changed} updated, {len(missing)} missing-on-disk")


if __name__ == "__main__":
    sys.exit(main())
