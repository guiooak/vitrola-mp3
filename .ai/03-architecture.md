# 03 · Architecture

Items marked **Decided** come from the decision records in `docs/decisions/`. Items marked **Proposed** are recommendations from the design phase: use them unless you have a good reason not to, and log the final choice as a new decision.

## Stack

| Concern | Choice | Status |
|---|---|---|
| Language | Kotlin | Decided (D5) |
| UI | Jetpack Compose, Material 3, single activity | Decided (D5) |
| Playback | Media3 ExoPlayer + `MediaSessionService` (foreground, `mediaPlayback`) | Decided (D4) |
| Database | Room | Decided (D3, D5) |
| DI | Hilt | Decided (D5) |
| Background work | WorkManager (scans) | Decided (D5) |
| Min SDK | 26 (Android 8.0) | Decided (D5) |
| Target SDK | Latest required by Google Play at build time | Decided (D1) |
| Application ID | `com.guioak.vitrolamp3` | Decided (D2) |
| Dynamic color | **Not used** — fixed brand palette | Decided (D8) |
| Settings storage | Jetpack DataStore (Preferences) | Proposed |
| Image loading | Coil (Compose), with a custom fetcher/keyer for embedded art | Proposed |
| Navigation | Navigation Compose | Proposed |
| Async | Coroutines + Flow | Proposed |
| Architecture | MVVM / UDF: Compose UI ← ViewModel (StateFlow) ← repositories ← Room / SAF / Media3 controller | Proposed |
| Theme generation | Generate Kotlin theme constants from `tokens.json` (Gradle task or script) so it stays the source of truth | Decided in spirit (D9); mechanism proposed |

## Permissions and manifest

- **No** `READ_MEDIA_AUDIO`, `READ_EXTERNAL_STORAGE` or `MANAGE_EXTERNAL_STORAGE` (D3).
- `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (Android 14+ requires the typed permission), `WAKE_LOCK`.
- `POST_NOTIFICATIONS` (Android 13+), requested when playback first starts, not at launch.
- `MODIFY_AUDIO_SETTINGS` (normal permission, granted without a prompt) for the equalizer (D23).
- `BLUETOOTH_CONNECT` (Android 12+, runtime "Nearby devices") requested **only** when the user turns on the driving mode automatic start, plus `BLUETOOTH` with `maxSdkVersion="30"` for Android 8–11 (D24).
- Service declared with `android:foregroundServiceType="mediaPlayback"` and the `androidx.media3.session.MediaSessionService` intent filter.
- No `INTERNET` permission needed. If you add it for any reason, log a decision (the app promises "nothing leaves your phone").
- Battery: do not use `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`; open `Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS` from the Settings tip card.

## Proposed module/package layout

Single Gradle module `:app` is fine for v1. Suggested packages under `com.guioak.vitrolamp3`:

```
ui/theme        generated tokens + VitrolaTheme, VitrolaTokens (CompositionLocal)
ui/components   Record (spinning disc + tonearm), MiniPlayer, SongRow, AlbumCard, ArtistCard, Chips, EmptyState, Snackbar host…
ui/screens      welcome, scan, library, album, artist, folder, search, playlists, playlist, favoritealbums, settings, nowplaying, queue
data/db         Room entities, DAOs, database
data/library    SAF folder access, scanner, metadata reader, image resolver, repositories
data/settings   DataStore
playback        PlaybackService (MediaSessionService), queue/state persistence, sleep timer, play counting
search          search engine (pure Kotlin, unit-tested)
```

## Folder access (SAF) — Decided (D3)

1. `ActivityResultContracts.OpenDocumentTree()` launches the system picker.
2. On result: `contentResolver.takePersistableUriPermission(uri, FLAG_GRANT_READ_URI_PERMISSION)`.
3. Store the tree URI, display name and a location label ("Internal storage" / "SD card") in Room (`folders` table).
4. On every launch, compare stored folders with `contentResolver.persistedUriPermissions`. Missing permission → mark the folder as lost and show the "We lost access…" dialog (see 06-copy).
5. Removing a folder: delete its rows (tracks, derived albums/artists if empty) and call `releasePersistableUriPermission`. Undo restores the rows and re-takes nothing (keep the grant until the snackbar expires, then release).

The system picker blocks the storage root and `Download` on modern Android; the app does not need to handle that, only the user-facing copy.

## Scanning — Decided approach (D3), details proposed

- Run scans in a WorkManager job (unique work per folder, `KEEP`/`REPLACE` policy), exposing progress through `WorkInfo` progress data so the Scan screen can show count, current path and a progress bar.
- Walk the tree with `DocumentsContract.buildChildDocumentsUriUsingTree()` + `contentResolver.query()` (much faster than `DocumentFile.listFiles()`), selecting `COLUMN_DOCUMENT_ID`, `COLUMN_DISPLAY_NAME`, `COLUMN_MIME_TYPE`, `COLUMN_LAST_MODIFIED`, `COLUMN_SIZE`.
- Recurse into subfolders only if "Include subfolders" is ON.
- Audio files: `MIME_TYPE` starts with `audio/` or the extension is in the supported list.
- Image files (`.jpg`, `.jpeg`, `.png`): remember every image per folder, then pick with the D19 rule (`folder.*` any case → the only image → none).
- Lyrics files (`.lrc`, `.txt`, any case): match each audio file to `<same base name>.lrc`, else `.txt`, in the same folder (D21). Store only the document URI and its `lastModified`; a change in either file updates the track on the incremental scan. With no lyrics file, record whether the audio file has an embedded lyrics tag (read with the rest of the metadata, see Lyrics below).
- **Incremental:** a file is re-read only when `lastModified` or `size` changed; files that disappeared are removed. Store `dateAdded` = first time the file was seen (drives "Recently added").
- Metadata via `MediaMetadataRetriever` (`setDataSource(context, uri)`): title, artist, album artist, album, track number, disc number, year, duration, and whether an embedded picture exists (do not store the bitmap in the DB).
- Missing title → file name without extension. Missing artist → "Unknown artist". Missing album → "Unknown album".

## Data model (proposed Room schema)

```
folders(id PK, treeUri UNIQUE, displayName, locationLabel, addedAt, lostAccess BOOL)
tracks(id PK, folderId FK, documentUri UNIQUE, relativeDir, fileName, mimeType,
       title, artist, albumArtist, album, trackNumber, discNumber, year,
       durationMs, sizeBytes, lastModified, dateAdded, hasEmbeddedArt BOOL,
       lyricsDocumentUri NULL, lyricsSource NULL (lrc/txt/embedded),
       albumKey, artistKey)
albums(key PK, title, artistName, year, folderRelativeDir, coverDocumentUri NULL, noMetadata BOOL)
artists(key PK, name, folderRelativeDir NULL, photoDocumentUri NULL)
playlists(id PK, name, createdAt)
playlist_tracks(playlistId FK, trackId FK, position, PK(playlistId, position))
favorite_tracks(trackId PK, addedAt)
favorite_albums(albumKey PK, addedAt)
play_counts(trackId PK, count, lastPlayedAt)
recent_searches(query PK, searchedAt)   -- keep newest 6
```

Grouping rules:
- `albumKey` = normalized(albumArtist ?: artist) + "|" + normalized(album). Files with no album/artist share the key of "Unknown album" / "Unknown artist".
- `artistKey` = normalized(albumArtist ?: artist). Album lists use album artist; song rows show the track artist.
- **Album folder** = the directory that contains the album's tracks (if tracks are spread over several, use the most common one). **Cover** = the D19 pick in that directory.
- **Artist folder** = the parent directory of the album folder when its name matches the artist name (normalized), otherwise the album folder's parent if it contains no audio files of its own. **Photo** = the D19 pick there.
- Normalization for keys and search: Unicode NFD, strip diacritics, lowercase, trim, collapse spaces.

Settings (DataStore): `subfolders`, `useFolderImages`, `resume`, `pauseOnUnplug`, `theme` (auto/light/dark), `lyricsAutoScroll` (default true, D21), `eqEnabled` (false), `eqPreset` (`flat`), `eqBands` / `eqCustomBands` (10 ints, dB), `eqBassBoost` (0–100) (D23), `driveAuto` (false), `driveCarAddress`, `driveCarName` (D24), `librarySort` (az/recent/plays), `libraryTab` (default `artists` on every launch — do not persist a different start tab unless the maintainer asks).

Playback state persistence (DataStore or a small table): queue track IDs, original order, index, position, shuffle, repeat, source (type + name + id).

## Playback — Decided (D4)

- `PlaybackService : MediaSessionService` owns one `ExoPlayer` with `setAudioAttributes(AUDIO_CONTENT_TYPE_MUSIC, handleAudioFocus = true)`, `setHandleAudioBecomingNoisy(settings.pauseOnUnplug)`, `setWakeMode(C.WAKE_MODE_LOCAL)`.
- UI talks to it through a `MediaController` (ViewModel-scoped).
- `MediaItem`s use the document URI and `MediaMetadata` (title, artist, album, artwork URI or data for the notification/lock screen).
- Custom session command + notification button for **favorite** (heart).
- Media3 **playback resumption** (`MediaSession.Callback.onPlaybackResumption`) returns the persisted queue so headset/system "play" works after the app was killed.
- Shuffle/repeat: implement with the app's own queue order (to match the spec: current song stays first; turning shuffle off restores the original order) rather than relying only on ExoPlayer's shuffle order.
- Sleep timer: a coroutine in the service (survives the UI); "end of this song" pauses on the next `onMediaItemTransition`/end of item.
- Broken file: on `onPlayerError` for a source error, skip to next and emit a UI event for the snackbar.
- Play counting: proposed rule — count when ≥ 50% of the duration or ≥ 30 s has been played (whichever comes first).

## Images

- Coil loads `content://` document URIs directly for folder images.
- Embedded art: a custom Coil `Fetcher` that uses `MediaMetadataRetriever.embeddedPicture` (keyed by document URI + lastModified), cached on disk.
- Generated cover: drawn in Compose (Canvas) with the deterministic rule in 04-design-system, keyed by album title. Never store it as a file.
- Respect the "Use folder photos and covers" setting in the resolver.
- Dominant color for the "Now playing" tint and the notification: AndroidX Palette on the resolved cover; for the generated cover use its background color.

## Driving mode (D24)

- UI: a `DrivingModeScreen` shown above the navigation (its own state, two tabs). While it is visible: `FLAG_KEEP_SCREEN_ON`, and the activity allows landscape (`screenOrientation` switched from portrait to sensor/user while the mode is open; portrait elsewhere in v1).
- `DrivingModeController` (app scope): exposes `isOpen`, `openedAutomatically`. Car detection when `driveAuto` is on: a runtime `BroadcastReceiver` for `BluetoothDevice.ACTION_ACL_CONNECTED` / `ACTION_ACL_DISCONNECTED` (filtered by `driveCarAddress`) registered while the app or `PlaybackService` runs, plus a check of the device's connection state (A2DP/headset profile proxy `getConnectedDevices()`) when the activity resumes.
- Connected + activity in the foreground → open the mode (automatic). Connected while in the background → open it on the next resume. Disconnected → close it only if it was opened automatically. Never start an activity from the background and never start playback.
- Car picker: `BluetoothAdapter.bondedDevices` (needs `BLUETOOTH_CONNECT` on Android 12+); store address + name in DataStore.

## Equalizer (D23)

- `PlaybackService` owns an `EqualizerController` next to the `ExoPlayer`. On Android 9+ (API 28) it creates `DynamicsProcessing` on the player's audio session (`player.audioSessionId`; recreate it when the session id changes, release it with the player).
- Config: one stage of **10 EQ bands** (pre-EQ or post-EQ; cutoffs placed between the centers 31, 62, 125, 250, 500, 1k, 2k, 4k, 8k, 16k Hz), **limiter enabled** to prevent clipping; MBC off.
- Gains = preset or custom bands (±12 dB) + bass boost (`bass% × [8, 8, 6, 3, 0…] dB` on the lowest bands), clamped to the range; input gain may be lowered by the largest positive gain.
- `setEnabled(eqEnabled)`; changes from the UI are applied live and saved to DataStore.
- If creation throws (unsupported device) or API < 28, expose `isAvailable = false` and the UI hides every equalizer entry point.
- Presets are app data (a Kotlin table matching `EQ_PRESETS` in `design/03-mockup/mockup.js`), names from string resources.

## Lyrics (D21)

- `LyricsRepository.load(track)` reads lyrics on demand (IO dispatcher), never at scan time and never into the database:
  - `.lrc` / `.txt`: decode UTF-8 (drop BOM), fall back to Windows-1252 when invalid.
  - **Embedded:** `MediaMetadataRetriever` does not expose lyrics. Use Media3 `MetadataRetriever` and look for: ID3 `USLT` (if Media3 returns it only as a raw `BinaryFrame`, decode it: encoding byte, 3-byte language, null-terminated descriptor, then the text in that encoding), `VorbisComment` keys `LYRICS` / `UNSYNCEDLYRICS`, and the M4A `©lyr` entry. If this proves unreliable for a format, log the choice of a small tag-reading library as a decision.
  - Embedded text goes through the same `LrcParser`: timestamps → synced, none → plain.
- At scan time, only detect whether an embedded lyrics tag exists (`lyricsSource = embedded`). If that makes large scans noticeably slower, detect lazily the first time the song plays instead and log the choice.
- `LrcParser` (pure Kotlin, unit-tested): timestamps `[mm:ss]`, `[mm:ss.xx]`, `[mm:ss.xxx]`, several per line; `[offset:]`; ignore other header tags; strip `<mm:ss.xx>` word tags; sort by time; no valid timestamp → plain. Output: `Synced(lines: List<TimedLine>)` or `Plain(text)`.
- The current line comes from the `MediaController` position (binary search over line times), sampled while the lyrics view is visible only.

## Search engine (pure Kotlin, unit-test it)

Port `searchResults()` from `design/03-mockup/mockup.js`:
1. `n = normalize(query)`; direct songs (title or file name contains `n`), direct albums (title), direct artists (name); sort each by "starts with" first.
2. If all three are empty → "Nothing found".
3. Linked: artist names from direct albums/songs; album keys from direct songs and from albums of direct artists; songs of direct albums/artists.
4. Sections: artists = direct + linked (dedupe by key); albums = direct + linked; songs = direct + linked. Songs: show 6 + "See all N songs".
Run against Room data in memory (the library is small, thousands of rows) or with FTS if needed — log the choice.

## Testing expectations

- Unit tests: LRC parser, lyrics source order (`.lrc` → `.txt` → embedded) and USLT frame decoding, search engine, grouping/normalization, cover/photo resolution order, shuffle/repeat/previous logic, sleep timer, play counting.
- Instrumented/manual: SAF flows, lost access, background playback, notification, headset unplug, resume after process death (see 07-edge-cases-and-qa).
- Optional CI: a GitHub Actions workflow running `./gradlew lint test assembleDebug` on push to `main` (log it as a decision if added).
