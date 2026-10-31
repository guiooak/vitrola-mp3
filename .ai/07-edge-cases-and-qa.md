# 07 · Edge cases and QA

## Edge cases to handle

### Folders and scanning
- User picks a folder with **no audio** (e.g. WhatsApp) → scan ends in the "No music here" empty state with "Choose folder".
- User picks a **subfolder of an already chosen folder** → no new folder; snackbar "…is already in the library".
- User picks a **parent of chosen folders** → replace the children with the parent.
- **Include subfolders OFF** and all music is in subfolders → "No songs found" with a shortcut to Settings.
- **Permission lost** (folder moved/renamed/revoked, SD card removed) → lost-access dialog; keep the folder listed as lost until the user re-chooses or removes it; its songs disappear from the library and from the current queue.
- **Removing a folder** that contains the playing song → stop playback and clear the queue.
- **Very large libraries** (10k+ files) → scanning must stay off the main thread, show progress, be cancellable and incremental.
- **Files changing during a scan** → a later incremental scan fixes it; never crash on a vanished document.
- **Duplicate files** across folders → separate tracks (different document URIs); no dedupe in v1.
- **Odd metadata:** empty strings, whitespace, "feat." artists, missing track numbers (sort by file name), multi-disc albums (sort by disc, then track).
- **Unknown album / Unknown artist** always sort last and cannot be favorited (album).
- **Images (D19):** `FOLDER.JPG`/`Folder.png` match regardless of case; `folder.jpg` wins over other images; one image with any name is used; several images and no `folder.*` → no folder image (embedded/generated); huge images → downsample; corrupt images → fall back silently.

### Lyrics (D21)
- Source order: `.lrc` → `.txt` → embedded lyrics. A file next to the song always wins over embedded lyrics.
- `.lrc` and `.txt` both present → `.lrc` wins. `Song.LRC` / `song.Txt` match regardless of case.
- `.lrc` with no valid timestamps → plain lyrics, no auto-scroll.
- Several timestamps on one line, unsorted lines, `[offset:]` positive and negative, word-level `<…>` tags, empty timed lines.
- Embedded `USLT` in UTF-16 and in Latin-1, several `USLT` frames (first one used), embedded text that is LRC (shown synced), FLAC `LYRICS` / `UNSYNCEDLYRICS`, M4A `©lyr`.
- File in Windows-1252 (accents) → still readable; empty or unreadable file → "Couldn't read the lyrics file." and no crash.
- Lyrics file added, changed or deleted after the first scan → the next incremental scan picks it up.
- Seeking, skipping songs and repeat-one with the lyrics open → the highlight follows the new position.
- Auto-scroll toggle off → no automatic scrolling and no "Back to current line"; it stays off for the next songs and after the app is closed and reopened, until turned on again.

### Equalizer (D23)
- Android 8 or a device where `DynamicsProcessing` cannot be created → no Settings row and no Now playing button; playback unaffected.
- Turning it off and on keeps preset, bands and bass boost; touching a control while off turns it on.
- Moving a band selects Custom; picking another preset and then Custom restores the custom curve.
- Settings survive app restart and process death; the effect is reapplied when the audio session changes (e.g. after an error or a new player).
- All bands at +12 dB plus bass boost 100 % → no audible clipping (limiter).

### Driving mode (D24)
- Nothing playing → "Nothing playing" with Shuffle all. Empty favorites / playlist → snackbar "Nothing here yet", stays in the mode.
- Nearby devices permission denied → the automatic start stays off, with the snackbar; permission revoked later → the automatic start stops working silently and Settings shows it off.
- Chosen car connects with the app in the background → nothing visible; opening the app enters driving mode. Car connects while the app is open → enters at once.
- Car disconnects → leaves only if the mode was opened automatically; playback continues (pausing is the headphones/noisy rule, D4).
- Rotation between portrait and landscape keeps the tab and the playlists list; leaving the mode returns to the previous screen.
- Screen does not turn off while the mode is open; it follows the normal timeout after leaving.

### Playback
- **Broken/unsupported file** → skip with a snackbar; if every file in the queue fails, stop and show the snackbar once.
- **Audio focus loss** (call) → pause; transient loss for navigation prompts → duck.
- **Headphones unplugged** with "Pause when headphones disconnect" OFF → keep playing.
- **Process death** while playing in the background → the service keeps playing; after the app is killed, system/headset "play" resumes from the persisted queue.
- **Sleep timer** active when the app is closed → still fires (lives in the service).
- **"At the end of this song"** + repeat one → still pauses at the end of the current play.
- **Shuffle toggled** mid-queue, **queue edited** while shuffled (play next / add to end / remove) → original order updated accordingly.
- **Seek** while paused updates the position without starting playback.
- **Reduce motion** on → no disc spin, no equalizer animation.
- **Record label** (D26): album without an image but with an artist photo → the label shows the artist photo; neither → generated cover; pause at any moment → the record coasts and stops with the label upright (also after reopening the app and with reduce motion).
- **Touching the record** (D27): hold → music stops but play state, notification and play count do not change; turn forward fast/slow → faster/slower with pitch, down to 0.1× for a very slow turn; turn backwards → held; release → 1× and normal spin; not available when paused, with Spinning record off, with reduce motion, in the mini player, lyrics or driving mode; swipe-down-to-close does not trigger from the record.
- **Tonearm** (D27): drops (animated) on play and when opening Now playing while playing; lifts (animated) on manual pause, end of queue, sleep timer, headphones out; stays down between songs and during a phone call that resumes.
- **Fade between songs** (D29): on → the song fades out over its last N s, then the next fades in over N s, no overlap; manual next/previous/choose → instant; next track of the same album in order → gapless, no fade; with shuffle on, the same album still fades; last song with repeat off → no fade; repeat one → fades; pause or seek during a fade → volume matches the position; a song shorter than 4×N → each fade is at most ¼ of it; length and switch survive a restart.
- **Dialogs** (D30): every app dialog shows the close X; X, scrim and back close it without changing anything (a typed playlist name is discarded); only the main action button remains; check in both orientations that no dialog touches the screen edges.
- **Spinning record** off → no record spins anywhere (mini player, Now playing, lyrics, driving mode), while playing or paused; turning it on resumes without a jump; the setting survives a restart (D25).

### UI
- 200% font scale, very long titles (ellipsize); RTL is not required (the three languages are LTR).
- **Landscape (D28):** every screen in both orientations; rotate with a sheet or dialog open, with lyrics scrolled, in driving mode, during the scan and in the middle of the onboarding → same screen and state; the rail replaces the bottom bar; nothing is cut off at 200% font scale in landscape (scroll instead).
- Switch the device (or per-app) language to Portuguese (Brazil) and Spanish: every screen, dialog, snackbar, notification and plural is translated; longer Spanish/Portuguese strings still fit.
- Dark theme on all screens, including the system picker hand-off and dialogs.
- Edge-to-edge insets on gesture and 3-button navigation.
- POST_NOTIFICATIONS denied → playback still works; show nothing intrusive.

## Manual test plan (mirror of the mockup's "Simulate" panel)

1. Fresh install → Welcome → Choose folder → pick `Music` → Allow → Scan completes with a summary → Library opens on **Artists**.
2. Pick `WhatsApp` on a fresh install → empty result → Choose folder again.
3. Library: switch chips; Songs sort options; open album, artist (with and without photo), folder.
4. Play a song from Songs → mini player appears; open Now playing → arm drops, disc spins; pause → arm lifts, disc slows; mini player and Now playing stay in sync.
5. Shuffle / repeat cycles; previous within and after 3 s; seek.
6. Queue: jump, remove + Undo, play next, add to end.
7. Favorites: song heart (Now playing, menu, notification), album heart (page, menu); lists update; Undo works; indicators (row heart, cover badge) update without losing scroll.
8. Playlists: create, add songs, rename, delete + Undo; automatic lists.
9. Search: "aguas", "milton", "esquina", a nonsense query; recent searches; "See all".
10. Settings: add a second folder, remove a folder + Undo, toggle subfolders, toggle folder images (covers switch to generated), rescan, sleep timer (short), theme switch.
11. Lock the phone while playing → lock-screen controls; use the notification controls and heart.
12. Unplug headphones (setting on and off).
13. Force-stop the app while paused → reopen → mini player shows the last song at the saved position, snackbar offers Play.
14. Revoke folder access (Settings → Apps → Vitrola Mp3 → Storage/Files, or move the folder) → lost-access dialog.
15. Put a corrupt `.mp3` in a folder → it is skipped with the snackbar.
16. Change the app language to Português (Brasil) and Español in system settings → all text switches, numbers and plurals are correct. A language appears only if the generator wrote its file, which means every row in `i18n/translations.csv` is `approved` and up to date (D20). Also check that a device set to a not-yet-approved language shows the app fully in English, with no mixed strings.
17. Lyrics: open a song with a `.lrc` (line follows the song, tap a line to seek, manual scroll then "Back to current line", auto-scroll off, then check another song and an app restart keep it off), one with only a `.txt` (static, scrolls by hand), one with only embedded lyrics (plain), and one with nothing.
18. Equalizer: pick presets, drag bands (Custom), bass boost, switch off/on; check the Settings status row, the Now playing dot, and an app restart; on an Android 8 device or emulator the equalizer does not appear.
19. Driving mode: open it from Now playing and from Settings; play from each tile; Playlists list and back; favorite/shuffle; rotate to landscape; screen stays on; turn on the automatic start (permission + pick the car), connect and disconnect the car Bluetooth with the app in the foreground and in the background.
20. Rotate the phone on every main screen (library tabs, album, artist, folder, search, playlists, playlist, settings, equalizer, Now playing, lyrics, queue, driving mode, welcome, scan) and check the landscape layout and that nothing resets.
21. Leave music playing with the screen off for 30+ minutes on a Samsung/Xiaomi device → keeps playing (or the battery tip explains why not).
