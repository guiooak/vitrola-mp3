# Plan 001 · Android app v1

**Status:** ready to start · **Created:** 2026-10-26 · **Owner:** implementing agent · **Reviewer:** maintainer

Build the first complete version of the Vitrola Mp3 Android app, matching the approved mockup (D17) and every decision up to D30.

## Working on the maintainer's computer

The app is built on **the maintainer's own computer**, in this checkout (`~/Documents/Repositories/vitrola-mp3`), with the maintainer's phone connected by USB. The design sessions ran here too, but none of their chat history carries over: everything you need is in `CLAUDE.md`, `.ai/` and `docs/`. If something seems missing, ask the maintainer instead of guessing.

The machine: Ubuntu 24.04, 4 cores, about 15 GB of RAM and about 40 GB of free disk, with KVM available for the emulator. Git already has push access to `main`; the Pages workflow keeps publishing `design/` on its own.

Setup (the maintainer installs these; installing needs `sudo`, which you don't have):
- **JDK 17:** `sudo apt install -y openjdk-17-jdk`. Java 21 is also installed, but only as a runtime; point Gradle at 17 (`org.gradle.java.home` in `~/.gradle/gradle.properties`, or a Gradle toolchain).
- **Android Studio**, which brings the Android SDK, `adb` and the emulator: `sudo snap install android-studio --classic`, then open it once and run the Standard setup. The SDK lands in `~/Android/Sdk`; write `sdk.dir` in `local.properties`, which is never committed.
- **ffmpeg**, for the test library script: `sudo apt install -y ffmpeg`. `python3` and `curl` are already installed; `uv` is only needed to re-export logo SVGs (`design/01-logo/scripts/export.sh`).
- Before Phase 0, check `javac -version`, `adb version` and `~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager --version`. If any is missing, tell the maintainer the exact command above instead of working around it.
- Preview the design with `python3 -m http.server 8765 --directory design` (also defined in `.claude/launch.json`), or use the live site https://guiooak.github.io/vitrola-mp3/.

Testing:
- **Prefer the maintainer's phone over USB** (`adb devices`; the maintainer enables USB debugging). Sound, Bluetooth, notifications, the lock screen and battery behavior are only trustworthy on a real device.
- The emulator works (KVM), but RAM is limited: with Android Studio, Gradle and an emulator running together the machine gets tight. Start it only when needed (for example for Android 8 or a second screen size), and close it afterwards.
- The maintainer's real music is on the phone. Phase 0 adds a script that **generates** a test library mirroring `design/03-mockup/data.js` (see Phase 0). Push it with `adb push` to a separate folder (for example `/sdcard/Music/Vitrola test/`) and pick that folder through the system picker. Never touch the maintainer's own music folders. Never commit audio or image files from the test library.

## Talking to the maintainer

- The maintainer writes in **Brazilian Portuguese**; reply in Brazilian Portuguese in the conversation. Everything committed stays in US English (`CLAUDE.md`).
- Bring decisions to the maintainer at the checkpoints in the phase table, one clear question at a time, with a recommendation.

## Before you start

1. Read `.ai/README.md` and files 01–08 in order, plus `CLAUDE.md`.
2. Open the mockup (https://guiooak.github.io/vitrola-mp3/03-mockup/) and walk through every panel shortcut and simulation.
3. Ask the maintainer the open questions that block early phases (`.ai/08-open-questions.md`): **Q7** (project layout), **Q8** (CI), **Q10** (delivery order — this plan proposes one). Q4, Q5, Q6 and Q9 can wait for their phases. Record each answer as a decision record in `docs/decisions/` and update `08-open-questions.md`.

## Ground rules for every phase

- Everything in **US English** (code, comments, files, source strings, docs, commits). Translations only via `i18n/translations.csv` with maintainer approval (D15, D18, D20).
- **Commit and push directly to `main`** in small, working steps; the app must build on every commit (D10).
- **Landscape from day one (D28):** every screen gets its portrait and landscape layouts in the same task, and is checked in both orientations.
- No hardcoded UI strings: every string, plural and content description in `res/values/strings.xml` from day one.
- Use only design tokens (generated from `tokens.json`) for colors, type, spacing, radii and motion (D9).
- New decisions → a new record in `docs/decisions/` (next ID, from `template.md`, plus an index row) + matching `.ai/` file in the same commit (D22).
- Each phase ends with: unit tests passing, a short entry in `docs/` or `.ai/` if behavior changed, and the phase checklist below ticked in this file.

## Phase overview

| # | Phase | Outcome | Maintainer checkpoint |
|---|---|---|---|
| 0 | Project setup and foundations | Empty app with theme, fonts, icons, navigation shell, string/translation tooling | Approve project layout and CI (Q7, Q8) |
| 1 | Library engine | Folders via SAF, scanning, Room library, image rule (D19) | — |
| 2 | Browsing UI | Welcome, scan, library (Artists default), album, artist, folder screens | Screenshots review |
| 3 | Playback core | Background playback, mini player, Now playing with the record, notification, queue | **First installable build (debug APK)** |
| 4 | Personal features | Resume, sleep timer, play counts, favorites, playlists | Answer Q4 (play count), Q5 (drag reorder) |
| 5 | Search and lyrics | Three-section linked search; lyrics from `.lrc`/`.txt` files (D21) | **Approve the lyrics design in the mockup** (before the lyrics UI is built) |
| 6 | Settings and polish | Settings screen, equalizer (D23), driving mode (D24), theme, battery tip, motion, accessibility, gestures | Answer Q6 (gestures); second build |
| 7 | Localization | pt-BR and es drafts → maintainer review → approved resources → languages enabled | **Review every translation (D20)**; answer Q11 (Spanish reviewer and variant) |
| 8 | QA and release prep | Full test pass, performance, signing and Play Store readiness | Answer Q9; release-candidate build |

Phases 4–6 can be reordered if the maintainer prefers; 0 → 1 → 2 → 3 is a hard sequence.

**Translations run in parallel.** Phase 7 is where languages get enabled, but drafting starts right after Phase 2 (when most copy is in place) so the maintainer can review while Phases 3–6 are built. Strings added later go through the same CSV as they appear. Feature work never waits for a review: until a language is fully approved, the app runs in English (D20).

---

## Phase 0 · Project setup and foundations

**Goal:** a buildable, themed, empty app with the navigation shell and the tooling everything else depends on.

Tasks:
- [ ] Gradle project per Q7 (proposed: root project + `:app` module), Kotlin, Compose, Material 3, Hilt, Room, Media3, WorkManager, DataStore, Coil, Navigation Compose. `applicationId = com.guioak.vitrolamp3`, `minSdk 26`, latest required `targetSdk` (D1, D2, D5).
- [ ] `.gitignore` for Android (never commit `local.properties`, keystores, `build/`).
- [ ] **Token codegen** from `design/02-style-guide/tokens.json` → Kotlin (`ui/theme`): colors (light/dark), typography scale, spacing, radii, elevations, motion. Gradle task or script; document how to rerun it (D9).
- [ ] `VitrolaTheme` with the M3 mapping in `.ai/04-design-system.md`, `VitrolaTokens` `CompositionLocal`, theme setting stub (auto/light/dark), **no dynamic color** (D8), edge-to-edge. Shared `VitrolaDialog` (close X in the corner, optional main action, no Cancel; D30) and bottom sheet components.
- [ ] Bundle Fraunces and Outfit fonts (OFL) in `res/font`.
- [ ] Icons: vector drawables for the Material Symbols Rounded set listed in 04-design-system.
- [ ] Launcher icon from `design/01-logo/export/android/` (adaptive + monochrome), notification icon.
- [ ] Navigation shell: bottom navigation (Library, Playlists, Search, Settings) with per-tab back stacks, placeholder screens, mini player slot; in landscape a navigation rail with the mini player at the bottom of the content (D28).
- [ ] Strings infrastructure: `strings.xml` with the catalog from `.ai/06-copy.md`; create `i18n/translations.csv` in the D20 format (columns incl. `quantity` and `en_hash_*`, English filled, pt-BR/es empty) and the generator: it validates keys, placeholders and plural quantities, escapes XML, detects stale rows by hash, and writes `values-pt-rBR`/`values-es` plus `locales_config` **only for languages whose rows are all approved** (D20). At this point it writes none.
- [ ] CI per Q8 (optional; proposed: GitHub Actions running `./gradlew lint testDebugUnitTest assembleDebug` on pushes that touch the app). It only checks the code; it does not deliver builds.
- [ ] **Delivering builds** (proposed; log it as a decision with Q8). Builds for the maintainer are made **on this computer** and installed on the phone over USB:
  - `./gradlew installDebug`, with the phone connected. Every build uses the same debug keystore (`~/.android/debug.keystore`), so a new APK installs over the old one and the maintainer keeps their library, favorites and playlists.
  - **Never delete or regenerate that keystore.** Ask the maintainer to back it up. An APK signed with any other key, such as a CI build, would force an uninstall and lose that data, so APKs from CI are never installed on the maintainer's phone.
  - At each checkpoint, tag the commit `v0.N-debug` and give the maintainer a short "what to try" list in the conversation.
  - `versionCode` increases at every checkpoint.
  - The release key (Phase 8, Q9) is separate and never used for these builds.
- [ ] **Test library generator:** `tools/make_test_library.py` (python3 + ffmpeg, no other dependencies) writes a library mirroring `design/03-mockup/data.js` into a folder given as an argument (default `build/test-library/`, ignored by git): `Music/<Genre>/<Artist>/<Album (Year)>/NN - Title.mp3` as short tagged MP3s (a few seconds of tone, title/artist/album/track/year tags, some with embedded art), plus `folder.jpg`, a `Folder.PNG` case, an "only image" case, an ambiguous two-image case, untagged files, a corrupt `.mp3`, and lyrics cases (a synced `.lrc`, a `.lrc` without timestamps, a `.txt` only, both `.lrc` and `.txt`, an upper-case `.LRC`, a Windows-1252 `.txt`, an MP3 with an embedded `USLT` and one whose `USLT` holds LRC text; D21). Same input → same output, so tests are repeatable. Document it in `README.md` with the `adb push` command.
- [ ] Update `README.md` (how to build) and log the layout/CI decisions.

Done when: `./gradlew assembleDebug` succeeds, the app installs on the maintainer's phone and opens to a themed shell in light and dark, and CI (if added) is green.

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
- [ ] **Lyrics matching (D21):** per audio file, `<same base name>.lrc` else `.txt` in the same folder, case-insensitive, else an embedded lyrics tag; store `lyricsDocumentUri` + `lyricsSource` (lrc/txt/embedded); incremental updates when a lyrics file is added, changed or removed.
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

After this phase: add every string to `i18n/translations.csv` and propose pt-BR/es drafts so the review can start (see "Translations run in parallel").

---

## Phase 3 · Playback core → first installable build

**Goal:** music plays reliably in the background with the signature "Now playing".

Tasks:
- [ ] `PlaybackService` (`MediaSessionService`, foreground `mediaPlayback`), ExoPlayer with audio focus, becoming-noisy (setting), wake mode (D4); `POST_NOTIFICATIONS` request on first play.
- [ ] App-owned queue: play a context from a song, Play / Shuffle buttons, shuffle (current first, restore order), repeat off/all/one, previous (> 3 s restarts), play next / add to end (song and album), remove with Undo.
- [ ] `MediaController` in ViewModels; mini player (progress line, small record, title, play/pause, next).
- [ ] **Record component**: geometry, label image (album → artist → generated, D26), tonearm −20° at rest, 1800 ms per turn, global angle continuity between mini player and Now playing, coast to an upright stop (D26), Spinning record setting (D25), animated tonearm with the D27 rest rules, touch-the-record gesture with live playback speed 0.1–3× (D27), reduce-motion support (04-design-system).
- [ ] Now playing screen: source label, record, title, artist chip, heart slot, seek bar, controls, timer row placeholder, queue button, file details dialog; album-color background tint (Palette).
- [ ] Queue sheet (jump, remove + Undo; drag handle visual only until Q5 is answered).
- [ ] Media notification and lock screen with artwork; custom heart command (wired in Phase 4).
- [ ] Broken file: skip + snackbar.
- [ ] Install the first **debug build** on the maintainer's phone (see "Delivering builds" in Phase 0), tag it `v0.1-debug` and give a short "what to try" list.

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

## Phase 5 · Search and lyrics

Tasks:
- [ ] Pure-Kotlin search engine ported from `searchResults()` in `design/03-mockup/mockup.js`: accent/case-insensitive, file names, direct + linked results, "starts with" first, Artists → Albums → Songs, counts, 6 songs + "See all N songs", "Nothing found" only without direct matches.
- [ ] Search screen: auto-focus, clear, recent searches (max 6, saved on submit, clear), artists explorer when empty.
- [ ] Highlight of the matched text.

- [x] **Design first (D6):** add the lyrics view to the HTML mockup (entry point in Now playing, synced and plain states, no-lyrics state, "Back to current line"), update `docs/design/03-mockup.md`, and get the maintainer's approval. Can be done any time before the lyrics UI tasks below.
- [ ] `LrcParser` (pure Kotlin), lyrics file reading with the UTF-8 → Windows-1252 fallback, and embedded lyrics reading (ID3 `USLT`, Vorbis `LYRICS`/`UNSYNCEDLYRICS`, M4A `©lyr`) (D21, `.ai/03-architecture.md`).
- [ ] Lyrics view as approved in the mockup: synced (highlight, auto-scroll, tap to seek, pause auto-scroll on manual scroll, back to current line) and plain (static, no auto-scroll); reduce motion → no animated scroll.

Tests: unit tests with the mockup examples ("aguas", "milton", "esquina", no match); `LrcParser` cases from `.ai/07-edge-cases-and-qa.md` (Lyrics). Done when: QA items 9 and 17 pass.

---

## Phase 6 · Settings and polish

Tasks:
- [ ] Settings screen: library folders (add/remove + Undo), include subfolders, use folder photos and covers, look for new songs, sleep timer, resume, pause on headphones disconnect, fade between songs with its length slider (D29), battery tip (opens `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`), theme, Spinning record switch (D25), about.
- [ ] Automatic rescan on app open (incremental, background).
- [ ] Motion pass: screen transitions, Now playing open/close, play-button morph, heart pulse, reduce motion everywhere.
- [ ] Accessibility pass: content descriptions, 48dp targets, 200% font scale, TalkBack walkthrough, contrast check in both themes.
- [ ] Gestures per Q6 (e.g. swipe down to close Now playing).
- [ ] **Driving mode (D24):** screen with Now playing and Music tabs, portrait and landscape layouts, keep screen on; car button in Now playing and the Settings › Driving group; automatic start (Nearby devices permission, paired-device picker, connect/disconnect handling as in `.ai/03-architecture.md`).
- [ ] **Fade between songs (D29):** `FadeController` in the playback service (position-driven `player.volume`, fade in on automatic transitions, instant on manual ones, gapless for the next track of the same album in order); unit tests for the curve and the skip rules.
- [ ] **Equalizer (D23):** `EqualizerController` with `DynamicsProcessing` (10 bands, limiter, bass boost) in the playback service; availability check (API 28+ and effect creation) that hides every entry point; Equalizer screen and Now playing sheet as in the mockup; settings in DataStore.
- [ ] Second build installed on the maintainer's phone (`v0.2-debug`).

Done when: QA items 10 and 14 pass, every screen works in English at 200% font scale and in dark theme, and the maintainer's feedback from the first build is addressed. (QA item 16, languages, belongs to Phase 7.)

---

## Phase 7 · Localization (D18, D20)

Tasks:
- [ ] Make sure `i18n/translations.csv` has **draft** pt-BR and es proposals for every key, including strings added after Phase 2 (meaning and tone, not word by word; plurals per language).
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
| A new APK will not install over the old one | All maintainer builds are made on this computer with the same debug keystore (backed up, never regenerated) and an increasing `versionCode` |
| The computer runs short of memory | Test on the phone over USB; start the emulator only when needed; close Android Studio during long command-line builds if necessary |
| Record animation jank | Single global angle, `graphicsLayer` rotation, no recomposition per frame |
| Translations block release | Drafts start after Phase 2 and are reviewed in parallel; if a language is not approved in time, ship without it (English fallback) |
| Lost folder permissions | Check on every launch, clear dialog, never crash on missing documents |

## Progress log

Add one line per completed phase: date, commit, notes.

| Date | Phase | Commit | Notes |
|---|---|---|---|
| 2026-10-26 | — | — | Plan edited: D20 revised (all-or-nothing languages, stale-row hashes, validation, plural rows); Phase 0 generator and Phase 7 updated; Q11 added. |
| 2026-10-26 | — | — | Plan edited: builds delivered through CI pre-releases with a shared debug key; test library generator script; translations drafted after Phase 2 in parallel; Phase 6 done criteria clarified. |
| 2026-10-30 | — | — | Plan edited: lyrics (D21) added to Phase 1 (file matching) and Phase 5 (parser, mockup design, lyrics view); test library gets lyrics cases. |
| 2026-10-30 | — | — | Plan edited: embedded lyrics become the third fallback after `.lrc` and `.txt` (D21 revised). |
| 2026-10-30 | 5 (design) | — | Lyrics view designed in the mockup and approved by the maintainer (synced, plain, none; global auto-scroll toggle). |
| 2026-10-30 | — | — | Plan edited: equalizer (D23) added to Phase 6; its design was approved in the mockup the same day. |
| 2026-10-30 | — | — | Plan edited: driving mode (D24) added to Phase 6; its design was approved in the mockup the same day. |
| 2026-10-30 | — | — | Plan edited: Spinning record setting (D25) added to the Phase 6 Settings task. |
| 2026-10-30 | — | — | Plan edited: record label image order and upright stop (D26) added to the Phase 3 record component task. |
| 2026-10-30 | — | — | Plan edited: tonearm rules and touch-the-record gesture (D27) added to the Phase 3 record component task. |
| 2026-10-30 | — | — | Plan edited: landscape for every screen (D28) is a ground rule; navigation shell gets the rail. |
| 2026-10-30 | — | — | Plan edited: touch-the-record speed range is 0.1–3× (D27 revised); tonearm rest angle corrected to −20°. |
| 2026-10-30 | — | — | Plan edited: fade between songs (D29) added to the Phase 6 Settings task; the fade itself belongs to the playback service. |
| 2026-10-30 | — | — | Plan edited: shared dialog component with the close X (D30) added to the Phase 0 theme task. |
| 2026-10-31 | — | — | Plan edited: the app is built on the maintainer's computer; setup, testing and build delivery changed to local builds installed on the phone over USB; CI becomes optional checks only. |
