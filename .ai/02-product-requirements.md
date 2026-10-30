# 02 · Product requirements

Priority: **P0** = required for the first usable version · **P1** = expected soon after · **Later** = backlog, do not build without asking.

Each requirement references the decision (D#) in `docs/decisions.md` when there is one.

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
- Record animation rules: see 04-design-system → Motion.

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
- Playback: Sleep timer, Resume where you left off, Pause when headphones disconnect.
- Battery tip card: "Music stops on its own?" with a button that opens the system battery optimization settings (do **not** request the exemption directly).
- Appearance: Automatic / Light / Dark theme.
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
- **Synced (`.lrc`):** the current line is highlighted and kept in view while the song plays; tapping a line seeks to it; scrolling by hand pauses the automatic scroll until "back to current line" is tapped or a few seconds pass. `[offset:]` is applied; word-level timestamps are dropped; empty timed lines show a pause mark.
- **Plain (`.txt`, `.lrc` without timestamps, or embedded text without timestamps):** shown as written, **no automatic scroll**.
- Files are UTF-8; invalid UTF-8 is read as Windows-1252.
- The entry point and layout in "Now playing" come from the mockup, which must be updated and approved first (D6). Songs without lyrics show no lyrics view (exact treatment decided in the mockup).
- Full rules: D21 in `docs/decisions.md`.

## 12. Later (do not build without asking)

Android Auto, home-screen widget, equalizer, crossfade, "side A / side B", vinyl crackle effect, Wear OS, Spotify integration (researched: the Spotify APIs cannot play audio inside this app; out of scope), languages beyond the three in D18.
