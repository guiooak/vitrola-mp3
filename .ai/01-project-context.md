# 01 · Project context

## The app

**Vitrola Mp3** is an Android music player for audio files stored on the user's phone.

- **Offline, no account, no ads, no data collection.**
- **Only the folders the user chooses** are read (via the Storage Access Framework). Everything else on the phone, such as WhatsApp audio and voice notes, stays out of the library.
- **Plays in the background**, with controls in the notification, on the lock screen and on headphones.
- **Turntable personality:** on "now playing", the album cover becomes the label of a vinyl record that spins while music plays, and a tonearm drops onto it.

"Vitrola" is Brazilian Portuguese for "record player / turntable". Keep the name as is.

## Status (2026-10-26)

| Step | Status | Where |
|---|---|---|
| Logo | ✅ Approved | `design/01-logo/`, `docs/design/01-logo.md` |
| Style guide | ✅ Approved | `design/02-style-guide/`, `docs/design/02-style-guide.md` |
| HTML mockup | ✅ Approved (D17) — the reference for the app | `design/03-mockup/`, `docs/design/03-mockup.md` |
| Android app | ⏳ Not started — **your job** | — |

The repository currently has **no Android code**. There is a GitHub Pages site built from `design/` (https://guiooak.github.io/vitrola-mp3/).

## Goal and constraints (D1)

Personal use first, **Play Store–ready** from day one:
- final package name: **`com.guioak.vitrolamp3`** (D2; hyphens are not allowed),
- recent `targetSdk` (the latest the Play Store requires at build time),
- signing key kept safely with a backup (never commit it),
- no broad permissions, no data collection, no ads, no analytics.

## Repository rules (from `CLAUDE.md`)

- **US English only** in everything committed: code, identifiers, comments, file names, docs, commit messages, and the source (default) UI strings — even when the maintainer writes in Brazilian Portuguese. Proper names and real titles (artists, albums, songs) are not translated. (D15)
- The **app ships in three languages** — US English (default), Brazilian Portuguese and Spanish — via Android string resources only (D18). **Every translation must be reviewed and approved by the maintainer; no automatic translation ships** (D20).
- **Commit and push directly to `main`.** No branches, no pull requests. (D10)
- **Log decisions** in `docs/decisions.md` and keep `.ai/` in sync.
- **Design before code** (D6). The design is done; when the app needs UI that the mockup does not cover, follow the style guide and record the decision.
- The `design/` folder is published by `.github/workflows/pages.yml`. Do not move or rename files in `design/` without updating links (README, landing page, docs).

## Maintainer preferences observed so far

- **Converses in Brazilian Portuguese — answer in Brazilian Portuguese in chat**; the repository stays in US English.

- Prefers simple, elegant results; will ask for changes directly.
- Likes the record-label animation and the heart (favorites) interaction.
- Wants the library to open on **Artists**.
- Organizes music as `Music/<Genre>/<Artist>/<Album>/`, with one image per artist and album folder; the naming rule is D19 (`folder.jpg`, else the only image).

## Repository layout today

```
.ai/                 this handoff
.claude/launch.json  local static server for design/ (port 8765)
.github/workflows/   pages.yml (publishes design/)
CLAUDE.md            repository rules
README.md
design/
  01-logo/           logo pages, export/ (SVGs incl. Android icon layers), scripts/
  02-style-guide/    style-guide.html, tokens.json (+ generated tokens.css/js), generate_tokens.py
  03-mockup/         index.html, mockup.css, mockup.js, data.js
  index.html         landing page
docs/
  decisions.md       D1–D20
  design/            01-logo.md, 02-style-guide.md, 03-mockup.md
```

Suggested place for the Android project: an `app/` Gradle module at the repository root (with `settings.gradle.kts`, `build.gradle.kts`, `gradle/`), leaving `design/` untouched. Record the final layout as a decision.
