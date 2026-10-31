# 05 · Screens and navigation

The mockup is the visual reference: https://guiooak.github.io/vitrola-mp3/03-mockup/ (use the side panel to jump to each screen). Copy for every screen is in [06-copy.md](06-copy.md).

## Navigation model (D11)

```
Welcome ──► System folder picker ──► Allow access ──► Scan ──► Library (Artists)
                                                                  │
Bottom navigation (always visible on main screens):               ▼
  Library · Playlists · Search · Settings      + Mini player pinned above it
        │
        ├─ Library ─► Album · Artist · Folder (push)
        ├─ Playlists ─► Playlist · Favorite albums (push)
        ├─ Search ─► Artist · Album (push)
        └─ Settings ─► (system folder picker, dialogs, sheets)

Now playing = full-screen overlay above everything (from the mini player or after Play/Shuffle)
Driving mode = full-screen mode above Now playing (car button in Now playing, Settings › Driving, or automatic)
Sheets: song menu, album menu, playlist menu, add to playlist, sort, queue, sleep timer
Dialogs: file details, new/rename playlist, delete playlist, remove folder, lost access
```

- Each tab keeps its own back stack (Navigation Compose nested graphs). Re-selecting the current tab scrolls to top / pops to the tab root.
- System back: closes sheet/dialog → collapses Now playing → pops the stack → leaves the app.
- Welcome and Scan hide the bottom bar and the mini player.

## Landscape (D28)

Every screen below also has a landscape layout (see 02 §14 and 04 → Landscape). In the mockup, use "Rotate phone (portrait / landscape)" under Simulate and then any shortcut.

## Screen list

| # | Screen | Key behavior | Mockup panel shortcut |
|---|---|---|---|
| 1 | **Welcome** | Record illustration (arm drops after ~500 ms, then spins), "Vitrola Mp3" in display style, tagline, three promises, primary button "Choose music folder". | Welcome |
| 2 | **System folder picker** | Android's own UI (not ours). We only launch it and handle the result. | Folder picker |
| 3 | **Scan** | Spinning record, "Looking for songs…", live count, current file path (ellipsized), striped progress bar. End: "All set!", "54 songs in 10 albums", "Found 8 covers and 7 artist photos", button "Open library". Empty result: empty state + "Choose folder". | Scan |
| 4 | **Library** | Title "Library", chips Artists (default) / Songs / Albums / Folders. See 02-product-requirements §2. Empty states: no folder chosen; no songs found (with a shortcut to Settings when subfolders are off). | Library · … |
| 5 | **Album** | Top bar: back + ⋮ (album menu). Cover 220dp radius l elevation 3, title, artist chip, meta line, Play / Shuffle / heart, numbered rows (row subtitle = artist; for "Unknown album" = file name), folder breadcrumb at the bottom. | Album |
| 6 | **Artist** | Hero photo (320dp) with back button over it, name + "N albums · N songs", Play / Shuffle, "Albums" horizontal scroller (136dp cards), "Songs" list. | Artist |
| 7 | **Folder** | Title = folder name, breadcrumb "Internal storage › Music › MPB", Play / Shuffle, highlighted image files, subfolder rows (with artist photo / album cover thumbnails), then files by file name. | Folder |
| 8 | **Search** | Title "Search", pill field (auto-focus when empty), results in three sections (see 02 §8). | Search |
| 9 | **Playlists** | Title + "+" (new playlist). "Automatic" group and "Your playlists" group (last row "New playlist"). | Playlists |
| 9b | **Favorite albums** | Small title, count, albums grid; empty state. | — |
| 10 | **Playlist** | ⋮ (rename/delete) only for user playlists. Art (icon tile for automatic lists, mosaic for user lists), name, meta, Play / Shuffle, rows; empty states. | Playlist |
| 11 | **Settings** | Groups: Library folders, Playback (incl. Equalizer and Fade between songs with its Fade length slider, D29), Driving (Driving mode, Start automatically in the car, Car), battery tip card, Appearance (theme + Spinning record switch) (segmented Automatic/Light/Dark), About. | Settings |
| 11b | **Equalizer** (D23) | Pushed from Settings › Playback › Equalizer. "Use equalizer" switch, presets, 10 band sliders over a curve, bass boost. Hidden on Android 8 / unsupported devices. | Equalizer |
| 11c | **Driving mode** (D24) | Full-screen mode above everything: Exit, tabs Now playing / Music, big controls and tiles (see 02 §13). Landscape layout with a side rail. Entered from the car button in Now playing, Settings › Driving, or automatically when the chosen car connects. | Driving mode · Driving mode · music · Driving mode · landscape |
| 12 | **Now playing** | See 02 §5 and the record spec in 04. | Now playing |
| 13 | **Queue** (sheet) | Title "Queue" + "N songs up next"; labels "Now playing" / "Up next"; played rows at 50% opacity; drag handle; remove (×) on upcoming rows; opens scrolled to the current song. | Queue |
| 14 | **Song menu** (sheet) | Header (cover, title, artist). Play next · Add to end of queue · Add to playlist · Add to/Remove from favorite songs · Go to album · Go to artist · File details. Album/artist entries hidden for "Unknown album". | Song menu |
| 14b | **Equalizer** (sheet) | Same controls as the Equalizer screen, opened from the `tune` button in the Now playing bottom row (lyrics · equalizer · timer · queue · info); the button shows the "on" dot while the equalizer is on. | — |
| 15 | **Sleep timer** (sheet) | Explanation line, 2×2 grid (15 min, 30 min, 45 min, 1 hour), full-width "At the end of this song" (selected state), "Turn off timer" in error color when active. | Sleep timer |
| 15b | **Lyrics** (D21) | Replaces the record inside Now playing (lyrics button in the bottom row, always visible). Header: collapse, title + artist · album, small spinning record that returns to the record view. Synced: current line in primary color at ~35% height, past lines faded, tap to seek, dots for instrumental gaps, manual scroll pauses following and shows "Back to current line" (tonal pill), resumes after 5 s; auto-scroll icon toggle floating at the bottom right of the lyrics area (`vertical_align_center`, plain icon button with no background, sitting in the faded bottom edge, fixed while the lyrics scroll; on by default, primary color + dot when on) turns following on/off for all songs (global setting, saved), with a snackbar. Plain: "not synced" note + text as written, no auto-scroll. None: empty state with a hint. Source line under the lyrics. Bottom: seek bar, then lyrics (on) · previous · play (60dp) · next · queue. Stays open when the player is collapsed and reopened. | Lyrics · synced / plain text / none |
| 16 | **Empty library** | Empty state with "Choose folder". | Empty library |

Other overlays (no shortcut): album menu, playlist menu, add-to-playlist sheet, sort sheet, new/rename/delete playlist dialogs, remove folder dialog, file details dialog, lost-access dialog, snackbars.

## System surfaces

- **Media notification:** small icon, app name · source name, title, artist, large cover, previous / play-pause / next, progress, heart (custom command). Tinted with the album color where the system allows.
- **Lock screen:** the same media session controls.
- The mockup's "Simulate" panel shows the expected behavior for notification, lock screen, reopening the app, unplugging headphones, a broken file and lost folder access.
