# Plan 001 · Android app v1

**Status:** ready to start · **Created:** 2026-10-26 · **Owner:** implementing agent · **Reviewer:** maintainer

Build the first complete version of the Vitrola Mp3 Android app, matching the approved mockup (D17) and every decision up to D20.

## Working on a new machine

The implementing agent runs on **a different machine** from the one used during design. Nothing from that session exists there except what is in this repository: no chat history, no local memory, no scratch files. Everything you need is in `CLAUDE.md`, `.ai/` and `docs/`. If something seems missing, ask the maintainer instead of guessing.

Setup:
- Clone `https://github.com/guiooak/vitrola-mp3` (`main`). You need your own GitHub credentials with push access to `main`; the Pages workflow keeps publishing `design/` on its own.
- Install JDK 17 and the Android SDK (command-line tools or Android Studio), plus `python3`. `uv` and `curl` are only needed to re-export logo SVGs (`design/01-logo/scripts/export.sh`).
- Preview the design locally with `python3 -m http.server 8765 --directory design` (also defined in `.claude/launch.json`), or use the live site https://guiooak.github.io/vitrola-mp3/.
- You don't have the maintainer's music library. Build a small test folder that mirrors `design/03-mockup/data.js`: `Music/<Genre>/<Artist>/<Album (Year)>/NN - Title.mp3`, with `folder.jpg` in some folders, an "only image" case, an ambiguous two-image case, files without tags and a corrupt `.mp3`. Push it to an emulator with `adb push` and pick it through the system picker. Do not commit audio files.
- Real-device checks (Samsung/Xiaomi battery behavior, Bluetooth headsets, the maintainer's own folders) are done by the maintainer with the debug APKs you hand over at the checkpoints.

## Talking to the maintainer

- The maintainer writes in **Brazilian Portuguese**; reply in Brazilian Portuguese in the conversation. Everything committed stays in US English (`CLAUDE.md`).
- Bring decisions to the maintainer at the checkpoints in the phase table, one clear question at a time, with a recommendation.

## Before you start

1. Read `.ai/README.md` and files 01–08 in order, plus `CLAUDE.md`.
2. Open the mockup (https://guiooak.github.io/vitrola-mp3/03-mockup/) and walk through every panel shortcut and simulation.
3. Ask the maintainer the open questions that block early phases (`.ai/08-open-questions.md`): **Q7** (project layout), **Q8** (CI), **Q10** (delivery order — this plan proposes one). Q4, Q5, Q6 and Q9 can wait for their phases. Record each answer in `docs/decisions.md` and update `08-open-questions.md`.

## Ground rules for every phase

- Everything in **US English** (code, comments, files, source strings, docs, commits). Translations only via `i18n/translations.csv` with maintainer approval (D15, D18, D20).
- **Commit and push directly to `main`** in small, working steps; the app must build on every commit (D10).
- No hardcoded UI strings: every string, plural and content description in `res/values/strings.xml` from day one.
- Use only design tokens (generated from `tokens.json`) for colors, type, spacing, radii and motion (D9).
- New decisions → `docs/decisions.md` (next ID) + matching `.ai/` file in the same commit.
- Each phase ends with: unit tests passing, a short entry in `docs/` or `.ai/` if behavior changed, and the phase checklist below ticked in this file.

## Phase overview

| # | Phase | Outcome | Maintainer checkpoint |
|---|---|---|---|
| 0 | Project setup and foundations | Empty app with theme, fonts, icons, navigation shell, string/translation tooling | Approve project layout and CI (Q7, Q8) |
| 1 | Library engine | Folders via SAF, scanning, Room library, image rule (D19) | — |
| 2 | Browsing UI | Welcome, scan, library (Artists default), album, artist, folder screens | Screenshots review |
| 3 | Playback core | Background playback, mini player, Now playing with the record, notification, queue | **First installable build (debug APK)** |
| 4 | Personal features | Resume, sleep timer, play counts, favorites, playlists | Answer Q4 (play count), Q5 (drag reorder) |
| 5 | Search | Three-section linked search | — |
| 6 | Settings and polish | Settings screen, theme, battery tip, motion, accessibility, gestures | Answer Q6 (gestures); second build |
| 7 | Localization | pt-BR and es drafts → maintainer review → approved resources → languages enabled | **Review every translation (D20)**; answer Q11 (Spanish reviewer and variant) |
| 8 | QA and release prep | Full test pass, performance, signing and Play Store readiness | Answer Q9; release-candidate build |

Phases 4–6 can be reordered if the maintainer prefers; 0 → 1 → 2 → 3 is a hard sequence.

---

## Phase 0 · Project setup and foundations

**Goal:** a buildable, themed, empty app with the navigation shell and the tooling everything else depends on.

Tasks:
- [ ] Gradle project per Q7 (proposed: root project + `:app` module), Kotlin, Compose, Material 3, Hilt, Room, Media3, WorkManager, DataStore, Coil, Navigation Compose. `applicationId = com.guioak.vitrolamp3`, `minSdk 26`, latest required `targetSdk` (D1, D2, D5).
- [ ] `.gitignore` for Android (never commit `local.properties`, keystores, `build/`).
- [ ] **Token codegen** from `design/02-style-guide/tokens.json` → Kotlin (`ui/theme`): colors (light/dark), typography scale, spacing, radii, elevations, motion. Gradle task or script; document how to rerun it (D9).
- [ ] `VitrolaTheme` with the M3 mapping in `.ai/04-design-system.md`, `VitrolaTokens` `CompositionLocal`, theme setting stub (auto/light/dark), **no dynamic color** (D8), edge-to-edge.
- [ ] Bundle Fraunces and Outfit fonts (OFL) in `res/font`.
- [ ] Icons: vector drawables for the Material Symbols Rounded set listed in 04-design-system.
- [ ] Launcher icon from `design/01-logo/export/android/` (adaptive + monochrome), notification icon.
- [ ] Navigation shell: bottom navigation (Library, Playlists, Search, Settings) with per-tab back stacks, placeholder screens, mini player slot.
- [ ] Strings infrastructure: `strings.xml` with the catalog from `.ai/06-copy.md`; create `i18n/translations.csv` in the D20 format (columns incl. `quantity` and `en_hash_*`, English filled, pt-BR/es empty) and the generator: it validates keys, placeholders and plural quantities, escapes XML, detects stale rows by hash, and writes `values-pt-rBR`/`values-es` plus `locales_config` **only for languages whose rows are all approved** (D20). At this point it writes none.
- [ ] CI per Q8 (proposed: GitHub Actions running `./gradlew lint testDebugUnitTest assembleDebug` on pushes that touch the app).
- [ ] Update `README.md` (how to build) and log the layout/CI decisions.

Done when: `./gradlew assembleDebug` succeeds, the app opens to a themed shell in light and dark, and CI is green.

---

## Phase 1 · Library engine

**Goal:** the app can read the chosen folders and build the library in Room. No polished UI needed yet.

Tasks:
- [ ] Room schema from `.ai/03-architecture.md` (folders, tracks, albums, artists, playlists, playlist_tracks, favorite_tracks, favorite_albums, play_counts, recent_searches) with migrations enabled from v1.
- [ ] SAF: `OpenDocumentTree`, `takePersistableUriPermission`, location label (internal / SD card), duplicate/parent/child folder rules (02 §1), release permission on removal.
- [ ] Lost-access detection on launch (compare with `persistedUriPermissions`).
- [ ] Scanner (WorkManager): fast `DocumentsContract` traversal, subfolders setting, audio filtering, **incremental** by `lastModified` + size, `dateAdded`, progress reporting (count, current path, total when known), cancellation.
- [ ] Metadata reader (`MediaMetadataRetriever`) with fallbacks: file name as title, "Unknown artist"/"Unknown album" as **flags/keys**, not label text.
- [ ] Grouping: album key, artist key, album folder, artist folder (02 §3, 03 grouping rules).
- [ ] **Image rule D19:** per folder, `folder.(jpg|jpeg|png)` any case → only image (`jpg/jpeg/png`) → none; store the picked document URI; respect "Use folder photos and covers".
- [ ] Repositories exposing `Flow`s for artists, albums, songs, folders.

Tests: unit tests for normalization, grouping, D19 picking (all four mockup cases: name match, case-insensitive, only image, ambiguous), incremental diff logic.

Done when: choosing a real music folder fills the database correctly and a rescan after adding/removing files only touches the changed files.

---

## Phase 2 · Browsing UI

**Goal:** every library screen from the mockup, without playback.

Tasks:
- [ ] Components: song row (with favorite mini-heart slot and equalizer slot), album card (with favorite badge slot), artist card, chips, group rows, empty state, top bar (incl. over-photo variant), snackbar host.
- [ ] **Generated cover** (Compose Canvas) with the exact deterministic rule in 04-design-system; "Unknown album" variant.
- [ ] Image loading with Coil: folder images by URI, embedded art fetcher, fallbacks (cover → embedded → generated; artist → first album cover in a circle).
- [ ] Welcome screen (record illustration with arm drop), scan screen (live progress, summary, empty result), first-launch flow → Library.
- [ ] Library: chips **Artists (default)** / Songs / Albums / Folders, sorts, counts, empty states (02 §2).
- [ ] Album, Artist (hero photo / blurred fallback), Folder (breadcrumb, image-in-use row, ambiguous note) screens.
- [ ] Lost-access dialog wired to the picker.

Done when: the whole library can be browsed on a device with the maintainer's folder layout, matching the mockup in light and dark. Send screenshots to the maintainer.

---

## Phase 3 · Playback core → first installable build

**Goal:** music plays reliably in the background with the signature "Now playing".

Tasks:
- [ ] `PlaybackService` (`MediaSessionService`, foreground `mediaPlayback`), ExoPlayer with audio focus, becoming-noisy (setting), wake mode (D4); `POST_NOTIFICATIONS` request on first play.
- [ ] App-owned queue: play a context from a song, Play / Shuffle buttons, shuffle (current first, restore order), repeat off/all/one, previous (> 3 s restarts), play next / add to end (song and album), remove with Undo.
- [ ] `MediaController` in ViewModels; mini player (progress line, small record, title, play/pause, next).
- [ ] **Record component**: geometry, cover as label, tonearm −14° when paused, 1800 ms per turn, global angle continuity between mini player and Now playing, 800 ms slowdown, reduce-motion support (04-design-system).
- [ ] Now playing screen: source label, record, title, artist chip, heart slot, seek bar, controls, timer row placeholder, queue button, file details dialog; album-color background tint (Palette).
- [ ] Queue sheet (jump, remove + Undo; drag handle visual only until Q5 is answered).
- [ ] Media notification and lock screen with artwork; custom heart command (wired in Phase 4).
- [ ] Broken file: skip + snackbar.
- [ ] Build a **debug APK** and hand it to the maintainer with a short "what to try" list.

Tests: unit tests for queue/shuffle/repeat/previous logic; manual checks from `.ai/07-edge-cases-and-qa.md` items 4–6, 11, 12, 15.

Done when: the maintainer can install the APK, pick their folder, browse and listen with the screen off.

---

## Phase 4 · Personal features

Tasks:
- [ ] **Resume where you left off**: persist queue/order/index/position/shuffle/repeat/source; restore paused on launch with the snackbar; Media3 playback resumption after process death.
- [ ] **Sleep timer** in the service: 15/30/45/60 min, end of song, turn off; countdown in Now playing and Settings; snackbars.
- [ ] **Play counts** per Q4 (proposed ≥ 50% or ≥ 30 s) → "Most played".
- [ ] **Favorites** (D13): song heart (Now playing, menu, notification), album heart (page, menu), row mini-heart and cover badge, independent lists, Undo, "Unknown album" not favoritable.
- [ ] **Playlists**: automatic (Favorite songs, Favorite albums, Most played, Recently added) and user playlists (create, rename, delete + Undo, add from song menu with ✓, mosaic art, empty states).
- [ ] Song menu and album menu sheets complete.
- [ ] Drag-to-reorder queue if Q5 = yes.

Done when: QA items 7, 8, 13 pass.

---

## Phase 5 · Search

Tasks:
- [ ] Pure-Kotlin search engine ported from `searchResults()` in `design/03-mockup/mockup.js`: accent/case-insensitive, file names, direct + linked results, "starts with" first, Artists → Albums → Songs, counts, 6 songs + "See all N songs", "Nothing found" only without direct matches.
- [ ] Search screen: auto-focus, clear, recent searches (max 6, saved on submit, clear), artists explorer when empty.
- [ ] Highlight of the matched text.

Tests: unit tests with the mockup examples ("aguas", "milton", "esquina", no match). Done when: QA item 9 passes.

---

## Phase 6 · Settings and polish

Tasks:
- [ ] Settings screen: library folders (add/remove + Undo), include subfolders, use folder photos and covers, look for new songs, sleep timer, resume, pause on headphones disconnect, battery tip (opens `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`), theme, about.
- [ ] Automatic rescan on app open (incremental, background).
- [ ] Motion pass: screen transitions, Now playing open/close, play-button morph, heart pulse, reduce motion everywhere.
- [ ] Accessibility pass: content descriptions, 48dp targets, 200% font scale, TalkBack walkthrough, contrast check in both themes.
- [ ] Gestures per Q6 (e.g. swipe down to close Now playing).
- [ ] Second build to the maintainer.

Done when: QA items 10, 14, 16-equivalent for English pass and the maintainer's feedback from the first build is addressed.

---

## Phase 7 · Localization (D18, D20)

Tasks:
- [ ] Fill `i18n/translations.csv` with **draft** pt-BR and es proposals for every key (meaning and tone, not word by word; plurals per language).
- [ ] Ask the maintainer to review (and Q11 for Spanish). Iterate on rows marked `changes` until every row is `approved`. Never approve on the maintainer's behalf. Other work may continue meanwhile; the app stays in English.
- [ ] Run the generator: each language appears (resources + `locales_config`) only once all its rows are approved and up to date — never a partial file. Verify locale formatting (numbers, dates, plurals incl. `many`).
- [ ] Check layouts with the longer Portuguese/Spanish strings.

Done when: both languages are 100% approved and enabled, and QA item 16 passes. If Q11 leaves Spanish without a reviewer, ship pt-BR alone and log it as a decision.

---

## Phase 8 · QA and release prep

Tasks:
- [ ] Run the full manual test plan in `.ai/07-edge-cases-and-qa.md` on at least one Pixel/AOSP device and one Samsung or Xiaomi device; fix findings.
- [ ] Performance: scan of a large library (10k files), cold start, scroll smoothness, memory with many covers.
- [ ] Release signing per Q9 (keystore outside the repo with backup, Play App Signing), versioning scheme, release build with R8.
- [ ] Play Store readiness: privacy policy page (can live on the GitHub Pages site), Data safety form ("no data collected"), foreground service type declaration (media playback), store listing assets from the logo files.
- [ ] Update `README.md`, `docs/` and `.ai/` with the final state; tag the release.

Done when: the maintainer approves the release candidate.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| SAF scanning is slow on large libraries | `DocumentsContract` queries instead of `DocumentFile`, incremental scans, background work with progress |
| OEM battery killers stop playback | Proper foreground service, battery tip card, test on Samsung/Xiaomi |
| Embedded-art extraction is expensive | Extract lazily through a Coil fetcher with disk cache; never store bitmaps in Room |
| Record animation jank | Single global angle, `graphicsLayer` rotation, no recomposition per frame |
| Translations block release | Start Phase 7 drafts early (after Phase 2 copy stabilizes) so review runs in parallel |
| Lost folder permissions | Check on every launch, clear dialog, never crash on missing documents |

## Progress log

Add one line per completed phase: date, commit, notes.

| Date | Phase | Commit | Notes |
|---|---|---|---|
| 2026-10-26 | — | — | Plan edited: D20 revised (all-or-nothing languages, stale-row hashes, validation, plural rows); Phase 0 generator and Phase 7 updated; Q11 added. |
