# 02 · Product requirements

Priority: **P0** = required for the first usable version · **P1** = expected soon after · **Later** = backlog, do not build without asking.

Each requirement references the decision (D#) in `docs/decisions/` when there is one.

## 1. Library from chosen folders (D3) — P0

- First launch shows the **Welcome** screen with one main action: "Choose music folder".
- Folder selection uses the **system folder picker** (`ACTION_OPEN_DOCUMENT_TREE`). The app never asks for `READ_MEDIA_AUDIO` / `READ_EXTERNAL_STORAGE`.
- The app keeps **persistable read permission** for each chosen folder and restores the library on every launch.
- The user can choose **more than one folder** (internal storage, SD card). Folders are managed in **Settings → Library folders** (add / remove with confirmation and Undo).
- Choosing a folder that is inside an already-chosen folder does nothing except a snackbar ("…is already in the library"). Choosing a parent of existing folders replaces those children.
- **Include subfolders** setting (default ON). When OFF, only files directly inside each chosen folder are read.
- **Scan:** after choosing a folder, a scan screen shows real progress (songs found so far, current file path, progress bar) and ends with a summary ("54 songs in 10 albums", plus covers/photos found). If nothing is found, show the empty state and offer to choose another folder.
- **Rescan** automatically when the app opens (incremental, in the background) and on demand ("Look for new songs" in Settings).
- **Lost access:** if a persisted permission is gone (folder moved/renamed or revoked), show a dialog explaining it and offering "Choose folder".
- Supported formats: everything Media3/ExoPlayer plays from local files — at least MP3, FLAC, M4A/AAC, OGG/Opus, WAV (D5). The name stays "Mp3".

## 2. Library browsing — P0

- Single **Library** tab with filter chips, in this order: **Artists · Songs · Albums · Folders**. **Artists is selected by default when the app opens** (D11, maintainer request).
- **Artists:** grid of circular photos, 3 per row, name + album count. "Unknown artist" always last; others sorted alphabetically (locale-aware).
- **Songs:** count, sort selector (**A–Z** default, **Recently added**, **Most played**), "Play" (accent) and "Shuffle" (tonal) buttons, then the list.
- **Albums:** 2-column grid of covers with title, artist and year.
- **Folders:** the chosen folders and their subfolders, as browsable rows. Artist folders show the artist photo (round), album folders show the cover.
- **Album page:** large cover, title, artist chip (small photo + name → artist page), year · song count · total duration, Play / Shuffle / heart (favorite album), numbered track list, source folder path at the bottom.
- **Artist page:** large photo banner at the top with the name over it; without a photo, the first album cover becomes a blurred background. Then Play / Shuffle, albums (horizontal scroller), songs.
- **Folder page:** breadcrumb path, Play / Shuffle (all songs below, recursive), the image in use highlighted ("folder.jpg · used as the album cover", or "… (only image in the folder)"), or a note when several images and no `folder.*` make it ambiguous, subfolders, then the files directly inside (shown by **file name**, with title · artist below).
- **Files without metadata** are grouped under album "Unknown album" and artist "Unknown artist", and listed by file name.

## 3. Artist photos and album covers (D12) — P0

Folder convention used by the maintainer:

```
Music/<Genre>/<Artist>/folder.jpg
Music/<Genre>/<Artist>/<Album (Year)>/folder.jpg
Music/<Genre>/<Artist>/<Album (Year)>/01 - Track.mp3
```

- **Folder image rule (D19)**, the same for artist and album folders:
  1. a file named `folder.jpg`, `folder.jpeg` or `folder.png` (any letter case) in the folder;
  2. otherwise, if the folder has **exactly one** image (`.jpg`, `.jpeg` or `.png`), that image;
  3. otherwise, no folder image (several images and none named `folder.*` is ambiguous).
- An **album folder** contains audio files; an **artist folder** is the folder right above album folders.
- **Cover fallback chain:** image in the album folder → picture embedded in the audio file → **generated cover** (see 04-design-system).
- **Artist photo fallback chain:** image in the artist folder → the artist's first album cover, shown in a circle → generated cover.
- Settings toggle **"Use folder photos and covers"** (default ON). When OFF, skip folder images (embedded → generated).
- **Record label** (mini player, Now playing, lyrics, driving mode): album image → artist photo → generated cover. Only the label uses the artist photo as a fallback (D26).
- Cropping: covers are square, center crop. Artist photos are circles in lists and a wide banner on the artist page; crop biased to the top (faces).
- Where images appear: see the table in `docs/design/03-mockup.md#artist-photos-and-album-covers`.

## 4. Playback (D4) — P0

- Tapping a song plays the **list it belongs to** (the visible context: all songs with the current sort, an album, an artist, a folder, a playlist, search results) starting at that song.
- "Play" plays the context from the start; "Shuffle" plays it shuffled starting at a random song. Both open "Now playing".
- **Background playback** with a media notification, lock-screen controls, Bluetooth/headset buttons, and audio focus handling (pause on calls, duck for navigation prompts).
- **Pause when headphones disconnect** (`ACTION_AUDIO_BECOMING_NOISY`), setting default ON.
- **Shuffle:** keeps the current song first and shuffles the rest; turning it off restores the original order and keeps the current song.
- **Repeat:** off → all (queue) → one. With repeat off, playback stops after the last song.
- **Previous:** restarts the song if position > 3 s, otherwise goes to the previous song.
- **Queue:** shows played (dimmed), now playing, up next. Tap to jump; remove items (with Undo); **drag to reorder** (proposed P1, see Q5 — the mockup only shows the handle).
- **Play next / Add to end of queue** for a song or a whole album.
- **Resume where you left off** (setting, default ON): persist queue, index, position, shuffle/repeat and source; on next launch the mini player shows the last song paused at the saved position, with a snackbar offering "Play". Playback resumption from the system media controls should also work.
- **Sleep timer:** 15 / 30 / 45 / 60 min or "At the end of this song"; countdown visible in "Now playing" and Settings; turning it off is possible; when it fires, playback pauses and a snackbar says "Sleep timer ended. Good night!".
- **Broken file:** skip to the next song and show "Couldn't play "<file>". Skipped to the next one."
- **Play count** is recorded per song (drives "Most played"). Proposed rule (not yet decided, see Q4 in 08-open-questions): count a play when ≥ 50% or ≥ 30 s was listened.

## 5. Now playing & mini player — P0

- Mini player pinned above the bottom navigation on every main screen: thin progress line on top, small spinning record with the cover as label, title, artist, play/pause, next. Tapping it opens "Now playing".
- "Now playing" (full screen, slides up): source label ("Playing from album · Elis & Tom"), collapse button, ⋮ song menu, **the record** (cover as label, spinning, tonearm), title, artist chip with small photo + album name, heart, seek bar with times, controls (shuffle, previous, play/pause, next, repeat), sleep timer status, bottom row (sleep timer, queue, file details).
- The background takes a light tint of the album's dominant color (mockup: 16% mix with the background color).
- Record animation rules: see 04-design-system → Motion. When the record is still, its label always rests upright (D26).
- **Tonearm (D27):** on the record whenever music plays (including between songs and while the record is touched); back at its rest when playback stops and waits for the user (manual pause, end of queue, sleep timer, headphones out, error, lost folder); a short interruption that Android resumes by itself keeps it down. Every move animated (700 ms).
- **Touching the record (D27):** a playful gesture on the spinning record in Now playing — hold = music stops, turn faster/slower = music faster/slower (pitch follows), release = normal again. Not a control: never changes queue, play state or settings.

## 6. Favorites (D13) — P0

- **Songs:** heart in "Now playing", in the song ⋮ menu and in the media notification. Favorite songs show a small wine heart next to the duration in lists. Automatic playlist **Favorite songs**.
- **Albums:** heart next to Play/Shuffle on the album page and in the album ⋮ menu. Favorite albums show a heart badge on the cover in album cards. Automatic list **Favorite albums** (grid).
- The two lists are **independent**: favoriting an album does not favorite its songs. "Unknown album" cannot be favorited.
- Every toggle shows a snackbar with **Undo**.

## 7. Playlists — P0

- Tab **Playlists** with "Automatic" (Favorite songs, Favorite albums, Most played — top 20, Recently added — newest 20) and "Your playlists" (mosaic of up to 4 album covers).
- Create (name only), rename, delete (confirmation + Undo), add a song from the song menu ("Add to playlist" sheet with "New playlist" first; show a ✓ on playlists that already contain the song).
- Playlist page: art/mosaic, name, "Automatic" label when applicable, count · duration, Play / Shuffle, song list; empty-state copy per type.

## 8. Search — P0

- Instant search across songs, albums and artists, **accent- and case-insensitive** ("aguas" finds "Águas de Março"), also matching file names.
- Results are **always three sections in this order: Artists → Albums → Songs**, each with a count (D11, maintainer request).
- Each section contains direct matches **plus items linked to the other sections' direct matches** (artists of matched albums/songs, albums of matched artists/songs, songs of matched artists/albums). Direct matches first; within them, "starts with" before "contains".
- Songs show the first 6 and a "See all N songs" button (resets when the query changes).
- "Nothing found" only when no layer has a direct match.
- Empty query shows **Recent searches** (saved on submit, max 6, "Clear") and an Artists scroller to explore.
- Exact algorithm: `searchResults()` in `design/03-mockup/mockup.js`.

## 9. Settings — P0

- Library folders (list with location + song count, remove), Add folder, Include subfolders, Use folder photos and covers, Look for new songs.
- Playback: Sleep timer, Equalizer (D23), **Fade between songs** (off by default; when on, a Fade length slider 1–12 s, default 5 s: the ending song fades out, then the next fades in, never overlapping; no fade for manual skips, for the next track of the same album played in order, or after the last song; D29), Resume where you left off, Pause when headphones disconnect.
- Battery tip card: "Music stops on its own?" with a button that opens the system battery optimization settings (do **not** request the exemption directly).
- Appearance: Automatic / Light / Dark theme, and a **Spinning record** switch (default on; off keeps every record still, D25).
- About: logo, version, "No ads. Nothing leaves your phone."

## 10. Languages (D18) — P0

- The app ships in **US English (default), Brazilian Portuguese and Spanish**: `values/`, `values-pt-rBR/`, `values-es/`.
- It follows the device language and supports Android 13+ **per-app language** (`res/xml/locales_config.xml` + `android:localeConfig`), so users can choose any of the three in system settings. An in-app language picker is not required.
- Every string, plural, content description and notification text goes through resources; nothing hardcoded.
- Formatting follows the locale: numbers ("1,032" / "1.032"), dates on the lock screen, plurals.
- Generated-cover initials and proper names (artists, albums, songs, folder and file names) are never translated.
- "Unknown artist" / "Unknown album" are translated labels, but grouping must not depend on the label text (use a flag/key).
- **No automatic translation (D20).** All pt-BR and es strings are reviewed and approved by the maintainer through `i18n/translations.csv`. A language is **all or nothing**: its resource file is generated (and the language listed in `locales_config`) only when every one of its strings is approved and up to date; otherwise the app runs fully in English for that language, never a mix. Details in D20 and 06-copy.

## 11. Lyrics (D21) — P1

- Lyrics come from a file next to the song with the **same base name**: `<name>.lrc` (synced when it has timestamps), else `<name>.txt` (plain), else the **lyrics embedded in the audio file** (ID3 `USLT`, Vorbis `LYRICS`/`UNSYNCEDLYRICS`, M4A `©lyr`; synced if the text has LRC timestamps, otherwise plain). Matching is case-insensitive. No lyrics are downloaded; ID3 `SYLT` is not read in v1.
- **Synced (`.lrc`):** the current line is highlighted and kept in view while the song plays; tapping a line seeks to it; scrolling by hand pauses the automatic scroll until "back to current line" is tapped or a few seconds pass; an auto-scroll icon toggle turns it off; this is a global setting saved across songs and app restarts, default on (highlight and tap-to-seek keep working). `[offset:]` is applied; word-level timestamps are dropped; empty timed lines show a pause mark.
- **Plain (`.txt`, `.lrc` without timestamps, or embedded text without timestamps):** shown as written, **no automatic scroll**.
- Files are UTF-8; invalid UTF-8 is read as Windows-1252.
- The entry point and layout in "Now playing" follow the approved mockup ("Lyrics" shortcuts in the mockup panel; `docs/design/03-mockup.md`). The lyrics button is always shown; songs without lyrics open an empty state that explains how to add them.
- Full rules: [D21](../docs/decisions/0021-lyrics-sources.md).

## 12. Equalizer (D23) — P1

- 10 fixed bands (31 Hz–16 kHz), −12 to +12 dB, through Android `DynamicsProcessing`. **Android 8, or a device where the effect cannot be created: the equalizer is hidden** everywhere.
- Opened from Settings › Playback › Equalizer (own screen; row status "Off" / "On · <preset>[ · bass boost N%]") and from a button in the Now playing bottom row (same controls in a sheet; the button shows the "on" dot while it is on).
- Controls: "Use equalizer" switch (off keeps the settings; touching a control turns it on), app presets (Flat, Bass, Vocal, Treble, Rock, Pop, Jazz, Classical, Electronic, Acoustic, Custom), 10 band sliders over a curve, bass boost 0–100 %.
- Moving a band selects Custom; the Custom curve is remembered when another preset is picked.
- One global setting for every song and output, saved across restarts. Default: off, Flat, bass boost 0.
- Full rules: [D23](../docs/decisions/0023-equalizer.md). Layout: the "Equalizer" shortcut in the mockup.

## 13. Driving mode (D24) — P1

- Full-screen mode with two tabs. **Now playing:** record with the cover, large title (2 lines) and artist, progress bar without seeking, five large controls (favorite, previous, play/pause 104dp, next, shuffle). **Music:** big tiles that play at once and return to Now playing — Shuffle all, Favorite songs, Most played, Recently added, Playlists (one simple list).
- Exit button with a label; system back closes the playlists list, then exits. No search, menus, dialogs, queue editing, lyrics or equalizer inside the mode.
- Screen kept on while open. Own landscape layout (side rail with Exit and tabs). Follows the app theme.
- Entry: car button in the Now playing top bar; Settings › Driving › Driving mode.
- Optional automatic start (off by default): Settings › Driving › Start automatically in the car → Nearby devices permission (Android 12+) → pick the car from paired Bluetooth devices. Opens when that car connects (app in the foreground, or the next time it opens); an automatically opened mode closes when the car disconnects. Never starts playback or brings the app to the front by itself.
- Full rules: [D24](../docs/decisions/0024-driving-mode.md). Layout: the "Driving mode" shortcuts in the mockup.

## 14. Landscape (D28) — P0

- Every screen rotates with the phone and has a landscape layout: navigation rail instead of the bottom bar (mini player at the bottom of the content), compact 48dp top bars, wider grids, two-column album/artist/playlist pages, Now playing with the record on the left, lyrics with a left column, centered sheets, equalizer in two columns, welcome in two columns, driving mode with its side rail.
- Rotating never loses state (screen, scroll, open sheet or dialog, lyrics position, playback, driving mode tab).
- Full rules: [D28](../docs/decisions/0028-landscape.md). Layouts: "Rotate phone" in the mockup's Simulate panel.

## 15. Later (do not build without asking)

Android Auto, home-screen widget, crossfade (overlapping songs; D29 does fade out, then fade in), per-output equalizer settings, "side A / side B", vinyl crackle effect, reverse scratch (turning the record backwards plays backwards, and speeds below 0.1×, D27), Wear OS, Spotify integration (researched: the Spotify APIs cannot play audio inside this app; out of scope), languages beyond the three in D18.
