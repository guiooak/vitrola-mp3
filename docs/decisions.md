# Project decisions

A log of product and technical decisions and the reason behind each one. Newest at the bottom.

---

### D1 · Goal: personal use, ready for the Play Store
**2026-10-25**

The app starts for personal use but may go to the Play Store later. So from day one:
- the package name is final;
- the target Android version (`targetSdk`) is recent;
- the signing key is kept with a backup;
- the app asks for no broad permissions and collects no data.

### D2 · Name and identifier
**2026-10-25**

- Name: **Vitrola Mp3**
- Package (`applicationId`): **`com.guioak.vitrolamp3`**. Android does not allow hyphens, so it could not be `vitrola-mp3`.

### D3 · Library only from chosen folders (SAF)
**2026-10-25**

The user picks one or more folders through the system picker (`ACTION_OPEN_DOCUMENT_TREE`), and the app keeps the permission persistently (`takePersistableUriPermission`).

- **Why:** keep unwanted audio (WhatsApp, voice recordings) out of the library. The app also avoids the broad `READ_MEDIA_AUDIO` permission, which is better for privacy and for the Play Store.
- **Consequence:** scanning through SAF is slower than through MediaStore. The index is stored in a local database (Room) and each rescan only checks what changed (`lastModified`). Metadata is read with `MediaMetadataRetriever`.
- **Rejected alternative:** filtering MediaStore by path. Faster, but requires access to every audio file on the device.

### D4 · Continuous background playback
**2026-10-25**

A `MediaSessionService` (Media3) runs as a foreground service of type `mediaPlayback`, and the UI only sends commands to it.

- **Includes:** wake lock, audio focus (pause on calls), pause when headphones disconnect, notification with controls, lock screen, Bluetooth headphones and resume where you left off.
- **Watch out:** manufacturers such as Xiaomi and Samsung may kill background apps. The app should guide users to exempt it from battery optimization.

### D5 · Proposed tech stack
**2026-10-25**

Kotlin · Jetpack Compose · Media3 (ExoPlayer) · Room · Hilt · WorkManager · Android 8+ (`minSdk 26`). The app accepts any format ExoPlayer plays (MP3, FLAC, M4A, OGG, WAV).

### D6 · Design before code
**2026-10-25**

Work order: **logo → style guide → HTML mockup → Android app**. Each step starts only after the previous one is approved, and each one is documented in [`docs/design/`](design/).

### D7 · Logo: classic vinyl
**2026-10-25**

Out of four concepts, the record with a tonearm (concept A) was chosen. Details in [01-logo.md](design/01-logo.md).

### D8 · Fixed identity, no dynamic color
**2026-10-25**

The app uses the brand palette (cream, wine, mustard) in both light and dark themes, without Material You. Only the Android 13+ themed icon follows the wallpaper. Details in [02-style-guide.md](design/02-style-guide.md).

### D9 · Tokens as the source of truth
**2026-10-25**

`design/02-style-guide/tokens.json` defines colors, typography, spacing and motion. The mockup uses the CSS generated from it, and the app will generate its Compose theme from the same file.

### D10 · Git workflow
**2026-10-25**

Personal project: commit and push directly to `main`, no branches or pull requests.

### D11 · App navigation structure
**2026-10-25**

Defined in the mockup ([03-mockup.md](design/03-mockup.md)):
- 4 tabs (Library, Playlists, Search, Settings), with the mini player pinned above them;
- the library is a single screen with Artists / Songs / Albums / Folders filters, and opens on **Artists** (maintainer's request);
- folder management (add and remove) lives in Settings;
- destructive actions always have a confirmation or "Undo";
- search always shows three sections (Artists, Albums, Songs), including items linked to the direct matches (maintainer's request).

**Status:** approved by the maintainer on 2026-10-25 together with the mockup (D17).

### D12 · Artist photos and album covers from the folders
**2026-10-25**

Each artist folder has a photo (`artist.jpg`) and each album folder has a cover (`cover.jpg`). The app uses these images on every screen.
- **Cover:** image in the folder → cover embedded in the MP3 → generated cover.
- **Artist photo:** image in the folder → first album cover in a circle.
- The previous look (generated cover, cover in a circle) becomes the fallback when there is no image, as the maintainer requested.
- Details, accepted file names and where each image appears: [03-mockup.md](design/03-mockup.md#artist-photos-and-album-covers).

### D13 · Favorite songs and albums
**2026-10-25**

Songs and albums can be favorited with the heart, in two independent lists (Playlists › Favorite songs and Favorite albums). Favoriting an album does not favorite its songs. Details in [03-mockup.md](design/03-mockup.md#favorites).

### D14 · Website on GitHub Pages
**2026-10-25**

The `design/` folder becomes a GitHub Pages site (https://guiooak.github.io/vitrola-mp3/), with a landing page at `design/index.html` that links to the logo guidelines, the style guide and the mockup. GitHub Actions (`.github/workflows/pages.yml`) deploys it automatically on every push to `main` that touches `design/`. The generator scripts (`scripts/`, `*.py`) are not published.

### D15 · Everything in the repository is in US English
**2026-10-25**

All documentation, code (identifiers, comments, file names, design tokens), user-facing text in the design pages and the mockup, and commit messages are written in US English, even when the conversation with the maintainer happens in Brazilian Portuguese. The rule lives in [`CLAUDE.md`](../CLAUDE.md).
- Proper names and real titles (artists, albums, songs) are not translated.
- The app's UI copy is written in English first; the shipped languages are defined in D18.

### D16 · Implementation handoff in `.ai/`
**2026-10-25**

The Android app will be implemented by another AI agent. Every relevant decision, requirement and spec for that work is consolidated in [`.ai/`](../.ai/README.md) (context, product requirements, architecture, design system, screens, UI copy, edge cases/QA and open questions). This log stays the source of truth: new decisions go here first and `.ai/` is updated to match.

### D17 · HTML mockup approved
**2026-10-25**

The maintainer approved the HTML mockup (`design/03-mockup/`). It is the reference for the Android app's screens, flows and behavior.

### D18 · Three languages: English (US), Portuguese (Brazil), Spanish
**2026-10-25**

The app ships in **three languages** from the first version: US English, Brazilian Portuguese and Spanish.
- English is the default/fallback (`values/`), with `values-pt-rBR/` and `values-es/` translations.
- The app follows the device language. Per-app language selection (Android 13+ `locales_config`) is supported so users can pick one of the three in system settings.
- The repository rule (D15) still applies: code, docs and the source strings stay in English; the translations live only in the Android string resources.
- No text is hardcoded in the UI; every string, plural and content description goes through resources.
