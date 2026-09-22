#!/usr/bin/env python3
"""Full rebuild of .ai/knowledge.db from context/*.md and the source tree.

Drops and recreates all tables from scratch. Run after changing the file
index, dependencies, constraints, decisions, problems, failed solutions,
or git config. For a plain context/*.md text edit, use sync_context.py
instead (it only re-hashes, it doesn't touch structured tables).
"""
import hashlib
import os
import re
import sqlite3
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONTEXT_DIR = os.path.join(REPO_ROOT, "context")
DB_PATH = os.path.join(os.path.dirname(__file__), "knowledge.db")

SCHEMA = """
CREATE TABLE context_documents (
    name TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    title TEXT,
    content_hash TEXT,
    updated_at TEXT
);

CREATE TABLE files (
    path TEXT PRIMARY KEY,
    subsystem TEXT,
    description TEXT,
    tags TEXT
);

CREATE TABLE dependencies (
    source TEXT NOT NULL,
    relationship TEXT NOT NULL,
    target TEXT NOT NULL
);

CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'hard',
    source_doc TEXT
);

CREATE TABLE decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    source_doc TEXT
);

CREATE TABLE known_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    area TEXT,
    source_doc TEXT
);

CREATE TABLE failed_solutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    lesson TEXT,
    area TEXT,
    source_doc TEXT
);

CREATE TABLE verification_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subsystem TEXT NOT NULL,
    command TEXT,
    description TEXT
);

CREATE TABLE git_configuration (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE realignment (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

# Static, hand-curated index of what's durable and worth indexing.
# Kept intentionally small/explicit rather than auto-crawled, since the
# repo has multi-megabyte generated files that must never be treated as
# "source to index".
FILES = [
    ("App/Map.html", "frontend", "Frontend entry point, loads bundle.js + CDN Leaflet libs", "frontend,entry"),
    ("App/main.js", "frontend", "Frontend bootstrap, wires up map/markers/overlays", "frontend,core"),
    ("App/bundle.js", "frontend-generated", "esbuild output — DO NOT hand-edit", "frontend,generated"),
    ("App/dataset.geojson", "frontend-data", "Heritage site dataset consumed by loadData.js", "frontend,data"),
    ("App/AreaHighlighter/AreaHighlighter.js", "frontend", "Area highlight client, resolveAreaApiBase() selects backend host", "frontend,area-highlighter,api"),
    ("App/AreaHighlighter/AreaHighlighterUI.js", "frontend", "Area highlight UI", "frontend,area-highlighter"),
    ("App/Accessibility/TTS.js", "frontend", "Text-to-speech accessibility feature", "frontend,accessibility"),
    ("App/Accessibility/keyboardAccessbility.js", "frontend", "Keyboard navigation accessibility", "frontend,accessibility"),
    ("App/Simulation/script.js", "frontend", "Environmental impact simulation logic", "frontend,simulation"),
    ("App/metrics/metrics.js", "frontend", "Environmental/population metrics, calls AirVisual + API Ninjas", "frontend,metrics,api"),
    ("App/pathing/pathrouting.js", "frontend", "Wheelchair/walking route generation via ORS/OSRM", "frontend,pathing,api"),
    ("App/userInputs/userReports.js", "frontend", "User report submission, talks to UserReportController", "frontend,reporting,api"),
    ("App/siteStatusOverlay.js", "frontend", "Renders site status overlay, talks to SiteStatusController", "frontend,site-status,api"),
    ("App/changeTrackers/buildandTrack.js", "frontend-tooling", "esbuild watch/build script (npm run track)", "frontend,build"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/AreaPolygonController.java", "backend", "REST endpoints for area polygons", "backend,area-highlighter,api"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/AreaPolygonRepository.java", "backend", "JPA repository for AreaPolygon", "backend,area-highlighter"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/AreaPolygon.java", "backend", "JPA entity for area polygons", "backend,area-highlighter"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/SiteStatusController.java", "backend", "REST endpoints for site status", "backend,site-status,api"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/SiteStatusRepository.java", "backend", "JPA repository for SiteStatus", "backend,site-status"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/SiteStatus.java", "backend", "JPA entity for site status (file dir inconsistent with package — see known-problems.md)", "backend,site-status,known-problem"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/UserReportController.java", "backend", "REST endpoints for user reports", "backend,reporting,api"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/ReportRepository.java", "backend", "JPA repository for reports", "backend,reporting"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/Reporting.java", "backend", "JPA entity for reports", "backend,reporting"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/UserReport.java", "backend", "JPA entity/DTO for user reports", "backend,reporting"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/ReportValidator.java", "backend", "Validation logic for reports", "backend,reporting"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/ReportCategory.java", "backend", "Report category enum/type", "backend,reporting"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/SeverityLevel.java", "backend", "Severity level enum/type", "backend,reporting"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/Comment.java", "backend", "JPA entity for comments (controller/repository not yet confirmed)", "backend,comments,open-question"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/DatabaseConnection.java", "backend", "Datasource/connection configuration", "backend,database"),
    ("Backend/heritagescope/src/main/java/com/heritagescope/heritagescope/RootController.java", "backend", "Root/health endpoint", "backend,api"),
    ("Backend/heritagescope/src/main/resources/application.properties", "backend-config", "Spring datasource + JPA config, ddl-auto=update", "backend,database,constraint"),
    ("Database/heritagescope_dump.sql", "database", "Full schema + seed data for heritagescope PostgreSQL db", "database"),
    ("Temp-python-backend/server.py", "backend-mock", "Mock area-highlight API backend, no DB, for frontend-only dev", "backend,mock,area-highlighter"),
]

DEPENDENCIES = [
    ("App/Map.html", "LOADS", "App/bundle.js"),
    ("App/bundle.js", "BUILT_FROM", "App/main.js"),
    ("App/main.js", "IMPORTS", "App/createMap.js"),
    ("App/main.js", "IMPORTS", "App/createMarkers.js"),
    ("App/main.js", "IMPORTS", "App/loadData.js"),
    ("App/loadData.js", "READS", "App/dataset.geojson"),
    ("App/main.js", "IMPORTS", "App/siteStatusOverlay.js"),
    ("App/siteStatusOverlay.js", "CALLS", "Backend/SiteStatusController"),
    ("App/main.js", "IMPORTS", "App/AreaHighlighter/AreaHighlighter.js"),
    ("App/AreaHighlighter/AreaHighlighter.js", "CALLS", "Backend/AreaPolygonController"),
    ("App/AreaHighlighter/AreaHighlighter.js", "DEFINES", "resolveAreaApiBase()"),
    ("App/main.js", "IMPORTS", "App/userInputs/userReports.js"),
    ("App/userInputs/userReports.js", "CALLS", "Backend/UserReportController"),
    ("App/metrics/metrics.js", "CALLS", "External/AirVisual API"),
    ("App/metrics/metrics.js", "CALLS", "External/API Ninjas API"),
    ("App/pathing/pathrouting.js", "CALLS", "External/OpenRouteService API"),
    ("App/AreaHighlighter/AreaHighlighter.js", "CALLS", "External/Overpass API"),
    ("Backend/AreaPolygonController", "CALLS", "Backend/AreaPolygonRepository"),
    ("Backend/AreaPolygonRepository", "MAPS", "Backend/AreaPolygon"),
    ("Backend/SiteStatusController", "CALLS", "Backend/SiteStatusRepository"),
    ("Backend/SiteStatusRepository", "MAPS", "Backend/SiteStatus"),
    ("Backend/UserReportController", "CALLS", "Backend/ReportRepository"),
    ("Backend/ReportRepository", "MAPS", "Backend/Reporting"),
    ("Backend/UserReportController", "CALLS", "Backend/ReportValidator"),
    ("Backend/DatabaseConnection.java", "DEPENDS_ON", "Database/heritagescope_dump.sql (schema origin)"),
    ("Backend (all repositories)", "DEPENDS_ON", "PostgreSQL heritagescope database"),
]

CONSTRAINTS = [
    ("Backend endpoint contracts must not change without approval", "Deployed backend at http://217.154.38.248:8080/ is shared; changing AreaPolygonController/SiteStatusController/UserReportController paths or params breaks it unless redeployed in lockstep.", "hard", "constraints.md"),
    ("Never hand-edit App/bundle.js or App/bundle.js.map", "Generated by esbuild from App/*.js via npm run track; hand-edits are clobbered on next build.", "hard", "constraints.md"),
    ("resolveAreaApiBase() is the single switch point for backend host", "In App/AreaHighlighter/AreaHighlighter.js; don't hardcode the backend URL elsewhere.", "hard", "constraints.md"),
    ("spring.jpa.hibernate.ddl-auto=update is active", "Entity field changes auto-alter the live PostgreSQL schema on backend startup, no migration review step.", "hard", "constraints.md"),
    ("Windows path separators", "Replace / with \\ in documented paths on Windows when needed; documented environment quirk not a bug.", "soft", "constraints.md"),
    ("External API keys must not be committed", "ORS, Overpass, Nominatim, AirVisual, API Ninjas keys used client-side; verify .gitignore coverage before adding new key-based integrations.", "hard", "constraints.md"),
]

DECISIONS = [
    ("Controllers call repositories directly, no service layer", "Consistent across AreaPolygonController, SiteStatusController, UserReportController. Likely a simplicity choice, not formally documented — confirm before assuming it must stay.", "decisions.md"),
    ("Frontend is hand-assembled Leaflet + esbuild, no JS framework", "Keeps the stack light, matches README's no-build-step quick-start path. Introducing a framework is a substantial change requiring the two-confirm rule.", "decisions.md"),
]

KNOWN_PROBLEMS = [
    ("SiteStatus.java file location inconsistent with sibling files", "File lives one directory above the rest of the package's files but package declaration is still com.heritagescope.heritagescope. Not a functional bug, but a maintenance trap.", "backend", "known-problems.md"),
    ("No unified test suite", "Tests/ is split per-contributor rather than conventional structure; separate Spring Boot smoke test exists. No single 'run all tests' command.", "testing", "known-problems.md"),
    ("Large binary/generated assets committed to git", "App/bundle.js (~23MB), bundle.js.map (~26MB), dataset.geojson (~23MB) all committed, bloating clone size.", "frontend", "known-problems.md"),
    ("App/.watcher-lock file present", "buildandTrack.js's watcher may not always clean up its lock file on exit; check/remove if npm run track refuses to start.", "frontend-tooling", "known-problems.md"),
]

VERIFICATION_RULES = [
    ("backend", "cd Backend/heritagescope && ./mvnw test", "Runs Spring Boot test suite (currently one smoke test)"),
    ("backend", "cd Backend/heritagescope && ./mvnw clean spring-boot:run", "Run backend locally against local PostgreSQL"),
    ("frontend", "cd App && npm install && npm run track", "esbuild bundle + watch"),
    ("frontend", "npx serve . (from repo root), open App/Map.html", "Manual smoke test in browser; no automated frontend test runner configured"),
    ("database", "psql -U <user> -d heritagescope -f Database/heritagescope_dump.sql", "Import schema + seed data"),
]

GIT_CONFIG = [
    ("upstream", "https://git.cs.bham.ac.uk/software-engineering-2025-26/DigitalDreamTeam.git"),
    ("base_branch", "main"),
    ("branch_prefix", "ai/"),
    ("auto_merge", "false"),
    ("trigger_word", "not yet configured"),
    ("workflow", "branch off main -> commit -> push -> open MR -> wait for user merge"),
]


def file_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def extract_title(md_text):
    m = re.search(r"^#\s+(.+)$", md_text, re.MULTILINE)
    return m.group(1).strip() if m else None


def index_context_documents(cur):
    for fname in sorted(os.listdir(CONTEXT_DIR)):
        if not fname.endswith(".md"):
            continue
        full = os.path.join(CONTEXT_DIR, fname)
        if not os.path.isfile(full):
            continue
        with open(full, "r", encoding="utf-8") as f:
            text = f.read()
        name = fname[:-3]
        cur.execute(
            "INSERT INTO context_documents (name, path, title, content_hash, updated_at) VALUES (?, ?, ?, ?, datetime('now'))",
            (name, f"context/{fname}", extract_title(text), file_hash(full)),
        )


def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.executescript(SCHEMA)

    index_context_documents(cur)

    cur.executemany("INSERT INTO files (path, subsystem, description, tags) VALUES (?, ?, ?, ?)", FILES)
    cur.executemany("INSERT INTO dependencies (source, relationship, target) VALUES (?, ?, ?)", DEPENDENCIES)
    cur.executemany("INSERT INTO constraints (title, description, severity, source_doc) VALUES (?, ?, ?, ?)", CONSTRAINTS)
    cur.executemany("INSERT INTO decisions (title, description, source_doc) VALUES (?, ?, ?)", DECISIONS)
    cur.executemany("INSERT INTO known_problems (title, description, area, source_doc) VALUES (?, ?, ?, ?)", KNOWN_PROBLEMS)
    cur.executemany("INSERT INTO verification_rules (subsystem, command, description) VALUES (?, ?, ?)", VERIFICATION_RULES)
    cur.executemany("INSERT INTO git_configuration (key, value) VALUES (?, ?)", GIT_CONFIG)

    realignment = [
        ("entry_point", "context/realignment.md"),
        ("foundational_docs", "context/overview.md,context/architecture.md,context/current-task.md,context/constraints.md"),
        ("current_task_summary", "See context/current-task.md — repository intelligence system setup"),
        ("dependency_entry_points", "App/main.js,Backend/heritagescope/.../RootController.java,Database/heritagescope_dump.sql"),
        ("last_rebuild", "see context_documents.updated_at"),
    ]
    cur.executemany("INSERT INTO realignment (key, value) VALUES (?, ?)", realignment)

    con.commit()
    con.close()
    print(f"Rebuilt {DB_PATH}")


if __name__ == "__main__":
    sys.exit(main())
