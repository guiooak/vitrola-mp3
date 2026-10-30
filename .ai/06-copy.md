# 06 · UI copy (US English)

All UI text comes from `design/03-mockup/mockup.js` and the style guide's voice rules. The tables below are the **source strings (US English)** for `res/values/strings.xml` (use `<plurals>` for counts); do not hardcode strings in Compose.

**Translations (D18, D20) — review workflow.** [D20](../docs/decisions/0020-translation-review.md) has the full file format and generator rules.

1. Every English string gets rows in `i18n/translations.csv` (UTF-8, RFC 4180 quoting). Columns: `key, quantity, en, pt-BR, es, status_pt-BR, status_es, en_hash_pt-BR, en_hash_es, notes`.
2. **Plurals:** one row per quantity (`one`, `many`, `other`) with the same `key`; `quantity` is empty for plain strings. pt-BR and es need all three; the English cell of the `many` row repeats the `other` text as a reference.
3. You may propose pt-BR and es drafts, always with status `draft`. Translate the meaning and the tone, not word by word: short, friendly, the voice of a friend who knows music. Keep the turntable metaphor in the welcome and empty states. Write drafts only in the CSV, never in other files (CLAUDE.md).
4. **Ask the maintainer to review, and keep building.** Feature work does not wait for translations: until a language is fully approved, the app runs in English. Only the maintainer sets `approved` (or `changes` with notes). Never mark your own drafts as approved.
5. The generator writes `res/values-pt-rBR/strings.xml` / `res/values-es/strings.xml` **only when every row of that language is approved and up to date**, and lists exactly those languages in `res/xml/locales_config.xml`. A partial file is never written: Android would use it from the device language and show a mix of languages.
6. **Stale rows:** on approval the generator stores a hash of the English text in `en_hash_<lang>`. When the English text changes, the hash stops matching, the status goes back to `draft` and the language leaves the build until it is reviewed again. List the changed keys in the commit message.
7. **Validation fails the build:** missing or extra keys, placeholders that differ from English (`%s`, `%d`, `%1$s`…), missing plural quantities, invalid UTF-8. The CSV holds plain text; the generator escapes it for Android XML (`'`, `"`, `\`, leading `@`/`?`, `<`, `&`).

**Voice:** short sentences, the tone of a friend who knows music. The turntable metaphor only in special moments (welcome, empty states), never on buttons. See the voice table in `docs/design/02-style-guide.md`.

Suggested keys are given; adjust naming to your conventions.

## Global

| Key | Text |
|---|---|
| `app_name` | Vitrola Mp3 |
| `tab_library` / `tab_playlists` / `tab_search` / `tab_settings` | Library / Playlists / Search / Settings |
| `action_back` | Back |
| `action_play` / `action_pause` | Play / Pause |
| `action_shuffle` | Shuffle |
| `action_cancel` / `action_close` / `action_save` / `action_create` / `action_remove` / `action_delete` / `action_undo` / `action_clear` | Cancel / Close / Save / Create / Remove / Delete / Undo / Clear |
| `action_choose_folder` | Choose folder |
| `cd_more_options` | More options |
| `cd_more_options_for` | More options for %1$s |
| `cd_next_song` / `cd_previous_song` | Next song / Previous song |
| `cd_collapse_player` | Collapse player |
| `cd_song_position` | Song position |
| `unknown_artist` / `unknown_album` | Unknown artist / Unknown album |
| plurals `songs` | %d song / %d songs |
| plurals `albums` | %d album / %d albums |
| plurals `artists` | %d artist / %d artists |

## Welcome

| Text |
|---|
| Vitrola **Mp3** (title; "Mp3" in the lighter weight) |
| Your music, your way. No account, no internet, no ads. |
| **Only the folders you choose** — WhatsApp audio and voice recordings stay out. |
| **Plays with the screen off** — Controls in the notification, on the lock screen and on your headphones. |
| **Nothing leaves your phone** — No account and no data collection. |
| Button: Choose music folder |

## Scan

| Text |
|---|
| Looking for songs… |
| %d songs (live count) |
| All set! |
| %1$s in %2$s (e.g. "54 songs in 10 albums") |
| Found %1$s and %2$s (e.g. "Found 8 covers and 7 artist photos") |
| Button: Open library |
| Empty: **No music here** — We couldn't find any music files in "%s". Choose the folder where your music lives. |

## Library

| Text |
|---|
| Title: Library |
| Chips: Artists · Songs · Albums · Folders |
| Sort: A–Z · Recently added · Most played; sheet title "Sort songs" |
| Folders view: group title = location ("Internal storage" / "SD card"); "Chosen folder · %s" |
| Empty (no folder): **No record on the turntable** — Choose the folder where your music lives. Only that folder is read, nothing else on your phone. |
| Empty (no songs, subfolders on): **No songs found** — The chosen folders have no music files. |
| Empty (no songs, subfolders off): **No songs found** — Your music is in subfolders. Turn on "Include subfolders" in Settings. Button: Open Settings |

## Album / Artist / Folder

| Text |
|---|
| Meta: "%1$d · %2$s · %3$s" (year · songs · duration, e.g. "1972 · 8 songs · 27 min"; durations "27 min" or "1 h 12 min") |
| Unknown album note: These files have no album or artist information. The app shows the file name. |
| Favorite album button: Add to favorite albums / Remove from favorite albums |
| Artist sections: Albums · Songs |
| Folder breadcrumb root: Internal storage |
| Folder image row: **%1$s** · used as the %2$s ("artist photo" / "album cover"), plus " (only image in the folder)" when picked by the fallback |
| Ambiguous images: %d images and no **folder.jpg** · using the generated cover |
| Empty folder: **Empty folder** — No songs in this folder. |

## Search

| Text |
|---|
| Title: Search · Placeholder: Song, artist or album |
| Recent searches · Clear |
| Section titles: Artists · Albums · Songs (with counts) |
| Button: See all %d songs |
| Nothing found: **Nothing found** — No song, album or artist matches "%s". Check the spelling or try another word. |

## Playlists

| Text |
|---|
| Title: Playlists · Groups: Automatic · Your playlists · Row: New playlist |
| Automatic lists: Favorite songs · Favorite albums · Most played · Recently added · label "Automatic" |
| New playlist dialog: **New playlist**, placeholder "Playlist name", Cancel / Create |
| Rename dialog: **Rename playlist**, Cancel / Save · snackbar "Playlist renamed" |
| Delete dialog: **Delete "%s"?** — The playlist goes away, but the songs stay in your library and on your phone. Cancel / Delete · snackbar "Playlist "%s" deleted" + Undo |
| Add to playlist sheet: **Add to playlist** · New playlist · snackbars "Added to "%s"" (+ Undo), "Already in "%s"" |
| Empty favorites: **Nothing here yet** — Tap the heart on a song, in the player or in the ⋮ menu, to see it here. |
| Empty user playlist: **Nothing here yet** — Use the ⋮ menu on any song and choose "Add to playlist". |
| Empty favorite albums: **No favorite albums** — Tap the heart on an album page, or use its ⋮ menu, to see it here. |

## Now playing, queue, menus

| Text |
|---|
| Source labels: Playing from · Playing from album · Playing from artist · Playing from folder · Playing from playlist · Playing from search · (source names: "All songs", album/artist/folder/playlist name, `"query"`) |
| Repeat descriptions: Repeat: off · Repeat: all · Repeat: one |
| Snackbars: Shuffle on · Shuffle off · Repeat off · Repeating the queue · Repeating this song |
| Song menu: Play next · Add to end of queue · Add to playlist · Add to favorite songs / Remove from favorite songs · Go to album · Go to artist · File details |
| Snackbars: Will play next · Added to the end of the queue · %s will play next (album) · %s added to the queue (album) |
| Favorites snackbars: Added to favorite songs · Removed from favorite songs · Album added to favorites · Album removed from favorites (all with Undo) |
| Queue: **Queue** · %s up next · Now playing · Up next · Remove from queue · snackbar "Removed from queue" + Undo |
| File details dialog: **File details** — File · Folder · Duration · Format · Cover ("folder.jpg (album folder)" / "Embedded in the file" / "Generated by the app") |

## Lyrics (D21)

| Key | Text |
|---|---|
| `lyrics_title` | Lyrics |
| `cd_show_lyrics` / `cd_hide_lyrics` | Show lyrics / Hide lyrics |
| `lyrics_back_to_current` | Back to current line |
| `cd_lyrics_auto_scroll` | Auto-scroll (content description of the icon toggle) |
| `lyrics_auto_scroll_off` / `lyrics_auto_scroll_on` | Auto-scroll off / Auto-scroll on |
| `lyrics_not_synced` | These lyrics aren't synced with the song. |
| `lyrics_none` | No lyrics for this song |
| `lyrics_none_hint` | Put a .lrc or .txt file with the same name next to the song. |
| `lyrics_read_error` | Couldn't read the lyrics file. |
| `lyrics_from_file` | Lyrics from %s |
| `lyrics_from_audio_file` | Lyrics stored in the audio file |
| `cd_instrumental` | Instrumental |
| File details row | Lyrics: "%s (next to the song)" / "Embedded in the file" / "None", plus " · synced" |

The lyrics themselves are never translated.

## Equalizer (D23)

| Text |
|---|
| Title: Equalizer · Settings row: Equalizer — Off / On · %1$s / On · %1$s · bass boost %2$d%% |
| Switch row: Use equalizer — Applies to every song |
| Presets: Flat · Bass · Vocal · Treble · Rock · Pop · Jazz · Classical · Electronic · Acoustic · Custom |
| Bass boost · Off / %d%% |
| Band content descriptions: "%s Hz" with value text "+3 dB" / "0 dB" / "−3 dB" |
| Snackbars: Equalizer on · %s · Equalizer off |
| Now playing button content description: Equalizer |

## Sleep timer

| Text |
|---|
| Sheet: **Sleep timer** — Music stops on its own after the chosen time. |
| Options: 15 min · 30 min · 45 min · 1 hour · At the end of this song · Turn off timer |
| Status: Pauses in %s · Pauses at the end of this song · Off |
| Snackbars: Music will stop in %d min · Music will stop at the end of this track · Sleep timer off · Sleep timer ended. Good night! |

## Settings

| Text |
|---|
| Title: Settings · Groups: Library folders · Playback · Appearance |
| Folder row: %1$s · %2$s ("Internal storage · 54 songs"); remove button "Remove folder %s" |
| Add folder — Only chosen folders go into the library |
| Include subfolders — Look for songs inside the chosen folders |
| Use folder photos and covers — folder.jpg in each artist and album folder, or the folder's only image |
| Look for new songs — Also happens automatically when you open the app |
| Sleep timer — (status) |
| Resume where you left off — When the app opens, the last song is ready to play |
| Pause when headphones disconnect — Wired or Bluetooth |
| Tip: **Music stops on its own?** Some phones (Xiaomi, Samsung, Motorola…) close background apps to save battery. Exempt Vitrola Mp3 from battery optimization. Button: Open battery settings |
| Theme: Automatic · Light · Dark |
| About: Version %s · No ads. Nothing leaves your phone. |
| Remove folder dialog: **Remove "%s"?** — %s leave(s) the library. The files stay on your phone. Cancel / Remove · snackbar "Folder "%s" removed" + Undo |
| Snackbars: Folder added · %s · Folder added · no songs found · "%s" is already in the library · Subfolders included · Only files directly in the chosen folders · %s · Using folder photos and covers · Using app-generated covers · Looking for new songs… · Library up to date · %s, nothing new |

## Errors and system events

| Situation | Text |
|---|---|
| Broken file | Couldn't play "%s". Skipped to the next one. |
| Lost folder access (dialog) | **We lost access to the "%s" folder** — This happens when the folder is moved or renamed, or when access is revoked in Android settings. Choose the folder again to keep listening. Buttons: Not now / Choose folder |
| Headphones disconnected | Headphones disconnected · music paused (action: Resume) |
| Resume on launch | Picking up where you left off: "%1$s" at %2$s (action: Play) |
