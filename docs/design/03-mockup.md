# Step 3 · HTML mockup

**Status:** approved on 2026-10-25 (D17) · files in [`design/03-mockup/`](../../design/03-mockup/)

A clickable app in the browser for validating screens, flows and interactions before writing Android code. It is "dry": HTML, CSS and a little JavaScript for navigation, animations and a simulated player (time passes, but there is no sound).

## How to open it

```bash
python3 -m http.server 8765 --directory design
```

Open http://localhost:8765/03-mockup/. Opening `design/03-mockup/index.html` directly in a browser also works.

- **On a computer:** the app sits in a phone frame, with a **panel** next to it to jump to any screen, simulate situations, switch the theme and read a note about the current screen.
- **On a phone:** the app fills the screen. The panel opens from the tab on the left edge.

## Screens

| # | Screen | What to validate |
|---|---|---|
| 1 | **Welcome** | The three promises (only chosen folders, plays with the screen off, nothing leaves the phone) and the "Choose music folder" button. |
| 2 | **Folder picker** | This is **Android's** screen (SAF), not the app's, and is styled like the system on purpose. The root and "Download" are blocked, as on real Android. Then comes the "Allow access" prompt. |
| 3 | **Scan** | File-by-file progress and a final summary ("54 songs in 10 albums"). Choosing "WhatsApp" shows the no-music case. |
| 4 | **Library** | **Artists** / Songs / Albums / Folders filters. **Artists** comes first and is selected when the app opens (photo grid). In Songs: Play, Shuffle and sorting by A–Z, recently added and most played. "Unknown artist" always goes last. |
| 5 | **Album** | Large cover, numbered tracks, source folder at the bottom. The "Unknown album" shows how files without metadata look. |
| 6 | **Artist** | Large artist photo at the top with the name over it, then albums and songs. Without a photo, the album cover becomes a blurred background. |
| 7 | **Folder** | Browsing the folder structure. Artist folders show the photo, album folders show the cover, and the image in use is highlighted (or a note when several images make it ambiguous). |
| 8 | **Search** | Results always in three separate sections: **Artists**, **Albums** and **Songs**. Each layer brings what matches the text and what is linked to it (see [search rules](#search-rules)). Ignores accents ("aguas" finds "Águas de Março"). Shows recent searches and artists to explore. |
| 9 | **Playlists** | Automatic ones (Favorite songs, Favorite albums, Most played, Recently added) and the user's own, with a mosaic cover. |
| 10 | **Playlist** | Play, Shuffle, rename and delete (with undo). |
| 11 | **Settings** | Add and remove folders (with undo), include subfolders, use folder images, look for new songs, sleep timer, resume where you left off, pause when headphones disconnect, battery tip and theme. |
| 11b | **Equalizer** | Settings › Playback › Equalizer, or the `tune` button in Now playing (same controls in a sheet). "Use equalizer" switch, presets (Flat, Bass, Vocal, Treble, Rock, Pop, Jazz, Classical, Electronic, Acoustic, Custom), 10 band sliders over a curve (drag them; the value shows while dragging; moving one selects Custom), bass boost. Off dims the controls and keeps the settings ([D23](../decisions/0023-equalizer.md)). Hidden on Android 8. |
| 12 | **Now playing** | The cover becomes the record label. The arm drops when playing and lifts when paused, and the record slows down. The background takes a hint of the cover color. Favorite, shuffle, repeat (all / one) and a draggable seek bar. |
| 12b | **Lyrics** | Opened with the lyrics button in Now playing ([D21](../decisions/0021-lyrics-sources.md)). It replaces the record: a header with the song and a small spinning record (tap it to go back), the lyrics, then the seek bar and compact controls. **Synced** (`.lrc`, or LRC text inside the MP3): the current line is highlighted in wine and kept about a third of the way down; past lines fade; tapping a line jumps there; dots mark instrumental gaps. Scrolling by hand shows "Back to current line", and following resumes after 5 seconds. An **auto-scroll icon** floating at the bottom right of the lyrics (it stays in place while the lyrics scroll; a dot shows it is on) turns following off to read freely; the choice is global and saved, so it applies to every song until changed; the current line is still highlighted. **Plain** (`.txt`, `.lrc` without timestamps, or plain text inside the MP3): shown as written with a "not synced" note, no automatic scrolling. **None:** an empty state that says how to add lyrics. The source is shown under the lyrics and in "File details". Sample lyrics are invented placeholders. |
| 13 | **Queue** | What already played, what's playing and what's up next. Jump to a song or remove it from the queue. |
| 14 | **Song menu** | Play next, add to queue, add to playlist, favorite, go to album or artist, and file details. |
| 15 | **Sleep timer** | 15 / 30 / 45 / 60 min or "at the end of this song", with a countdown in the player and in Settings. |
| 16 | **Empty library** | State with no folder chosen. |

## Artist photos and album covers

The user organizes music like this, with one image per folder:

```
Music/
  MPB/
    Gilberto Gil/
      folder.jpg               ← artist photo
      Refavela (1977)/
        folder.jpg             ← album cover
        01 - Ilê Ayê.mp3
```

**Which image is used (D19)** — the same rule for artist and album folders:

1. a file named `folder.jpg`, `folder.jpeg` or `folder.png` (any letter case) in the folder;
2. otherwise, if the folder has **exactly one** image (`.jpg`, `.jpeg` or `.png`), that image;
3. otherwise, no folder image (several images and none named `folder.*` is ambiguous).

An album folder is one that contains audio files; an artist folder is the one right above the album folders. In the mockup, Tim Maia (artist) and Transa (album) use their only image, Elis & Tom uses `Folder.PNG` even though it also has `back.jpg`, and Cabeça Dinossauro has two images without `folder.*`, so it falls back to the generated cover.

**When there is no image** (the earlier look becomes the fallback):

| | 1st | 2nd | 3rd |
|---|---|---|---|
| **Album cover** | image in the album folder | cover embedded in the MP3 | app-generated cover (palette color + initials) |
| **Artist photo** | image in the artist folder | the artist's first album cover, in a circle | generated cover |

**Where the images appear:**

| Place | Artist photo | Album cover |
|---|---|---|
| Library › Artists | Grid of circles (3 per row) | — |
| Library › Albums, lists, queue, menus | — | Square, rounded corners |
| Artist page | Large at the top (full width, 320dp tall), with the name over it and a gradient into the background. Without a photo, the cover becomes a blurred background | Albums in a horizontal scroller |
| Album page | Chip with a small photo (28dp) and name | Large (220dp) |
| Now playing | Small photo (24dp) next to the name | Record label and background tint |
| Search | Circles in the Artists section | Albums section |
| Folders | Artist folder with a round photo | Album folder with the cover |
| Notification and lock screen | — | Thumbnail |

**Cropping:** the cover is always square with a center crop. The artist photo appears as a circle and as a wide banner, and the crop favors the top, where the face usually is. Recommended size: covers at least 600×600px and photos at least 1000px wide.

**Setting:** in Settings, "Use folder photos and covers" turns these images on and off. When off, the app uses embedded or generated covers.

**In the mockup** the images are simulated. "Photographic" photos and covers mean there is an image in the folder, and the earlier look means the fallback. Titãs and "Cabeça Dinossauro" have no image, to show the fallback. To try real images, put the files in `design/03-mockup/images/` and set `url` on the artist or album in `data.js`.

## Favorites

Songs and albums can be favorited with the **heart**.

| | Song | Album |
|---|---|---|
| **Where to favorite** | Heart on "now playing", song ⋮ menu, notification | Heart next to Play/Shuffle on the album page, album ⋮ menu |
| **Indicator** | Small wine heart next to the duration, in lists | Heart badge in the corner of the cover, on album cards |
| **Where they show up** | Playlists › Favorite songs | Playlists › Favorite albums (cover grid) |
| **Snackbar** | "Added to favorite songs", with Undo | "Album added to favorites", with Undo |

Favoriting an album does **not** favorite its songs: they are two independent lists. The "Unknown album" (files without metadata) cannot be favorited.

## Search rules

Search always shows the three layers, each in its own section and in this order: **Artists → Albums → Songs**.

1. **Direct matches:** artists by name, albums by title, songs by title or file name. Ignores accents and case. Results that **start** with the text rank above those that only **contain** it.
2. **Linked results:** each layer also brings what is linked to the other layers' direct matches:
   - Artists: those of the albums and songs found.
   - Albums: those of the artists and songs found.
   - Songs: those of the artists and albums found.
3. **Order:** direct matches come before linked ones.
4. **Songs:** shows the first 6 and a "See all N songs" button. The button resets when the text changes.
5. **Counts:** each section shows how many items it has.
6. **Nothing found:** only shown when no layer has a direct match.

Example: searching "águas" brings Elis Regina (artist), Elis & Tom (album) and Águas de Março (song).

## Simulations (panel)

| Simulation | What it shows |
|---|---|
| Media notification | Controls in the Android notification, in sync with the player |
| Lock screen | Controls with the phone locked |
| Close and reopen the app | "Resume where you left off": the last song is ready, with a snackbar and a "Play" button |
| Disconnect headphones | Automatic pause (or not, if the option is off) |
| Broken file | Skips to the next song with the "Couldn't play…" snackbar |
| Lose folder access | Dialog asking to choose the folder again |
| Start over | Back to the welcome screen |

## Decisions made in the mockup

- **Navigation:** 4 tabs (Library, Playlists, Search, Settings), with the mini player pinned above them.
- **Library:** a single tab with chip filters (Artists, Songs, Albums, Folders) instead of four separate tabs. Opens on **Artists**.
- **Folder management lives in Settings:** the library's "Folders" filter is for browsing only.
- **Layered search:** artists, albums and songs always in separate sections, with linked items.
- **Destructive actions** (remove folder, delete playlist, remove from queue) ask for confirmation when they can't be undone, or show "Undo" in the snackbar.
- **Files without metadata** show up by file name, grouped under "Unknown album" and "Unknown artist".
- **Transparency:** the app always shows where each song comes from (folder at the bottom of the album, "File details").
- **Lyrics** replace the record inside Now playing instead of opening a new screen, so the controls stay at hand. The lyrics button is always visible, even for songs without lyrics, so the feature is easy to discover; the view stays open when the player is collapsed and reopened.
- **Language:** the mockup copy is in English; the app ships in English, Brazilian Portuguese and Spanish ([D18](../decisions/0018-three-app-languages.md)).

## Left for the app

- Drag to reorder the queue (the handle is shown but does not work)
- Real sound, real metadata reading, embedded covers and embedded lyrics
- Swipe gestures (e.g. dragging the player down to close it)
- Android Auto and widget
- Real audio effect for the equalizer (the mockup only shows the controls)

## Files

| File | What it is |
|---|---|
| `index.html` | Structure: panel, phone frame, bars and overlay areas |
| `mockup.css` | Styles, using only the style guide tokens (`../02-style-guide/tokens.css`) |
| `mockup.js` | Navigation, screens, simulated player, sheets, dialogs, snackbars and simulations |
| `data.js` | Sample library (10 albums, 54 songs), folders and playlists |
