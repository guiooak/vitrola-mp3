# D21 · Lyrics from a `.lrc` or `.txt` file next to each song, else from the audio file

- **Status:** Accepted
- **Date:** 2026-10-30
- **Revised:** 2026-10-30: lyrics embedded in the audio file added as the third source. 2026-10-30: example uses placeholder lines (real lyrics are copyrighted); offset direction stated; the lyrics view is in the mockup; auto-scroll toggle added at the maintainer's request, as a global saved setting.
- **Related:** [D6](0006-design-before-code.md), [D19](0019-folder-image-rule.md)

## Context

The maintainer wants the app to show song lyrics. Lyrics were in the "Later" list. The maintainer will download lyrics and keep them as text files next to each song in the library, and also wants lyrics stored inside the audio file to be used when there is no file.

- The app promises to work offline and send nothing off the phone, so it cannot fetch lyrics itself.
- LRC is the most common format for synced lyrics. Free sources such as LRCLIB, and tools such as LRCGET, save a `.lrc` file with the same name next to each audio file.
- Synced lyrics are easy to find for well-known songs and harder for less-known recordings; plain lyrics are much more common.
- The maintainer's library names files `Artist - NN - Title.mp3` (`Artist - d-NN - Title.mp3` on multi-disc albums), for example `Elis Regina & Tom Jobim - 01 - Águas de Março.mp3`.

## Decision

The app shows lyrics read from the song's folder or from the audio file. It never downloads lyrics: it stays offline (no `INTERNET` permission).

**Sources, in order.** In the song's own folder, a file with the **same base name** as the audio file (compared case-insensitively, extension in any case):
1. `<name>.lrc` → **synced** lyrics when it has timestamps;
2. otherwise `<name>.txt` → **plain** lyrics;
3. otherwise lyrics **embedded in the audio file** (see below);
4. otherwise the song has no lyrics.

Example: `Elis Regina & Tom Jobim - 01 - Águas de Março.mp3` → `Elis Regina & Tom Jobim - 01 - Águas de Março.lrc` (or `.txt`).

**`.lrc` format (LRC).**
- Lines start with one or more timestamps `[mm:ss.xx]` (also `[mm:ss]` and `[mm:ss.xxx]`); a line with several timestamps is repeated at each time. Lines are shown in time order.
- Header tags `[ar:]`, `[ti:]`, `[al:]`, `[by:]`, `[length:]` are ignored; `[offset:±ms]` shifts all timestamps (a positive value shows the lyrics earlier, as in the LRC convention).
- Word-level timestamps (`<mm:ss.xx>`, "enhanced LRC") are removed and the line is shown whole.
- A timestamped line with no text is an instrumental gap (shown as a short pause mark).
- A `.lrc` file with no valid timestamp is shown as plain lyrics.

```
[ar:Elis Regina & Tom Jobim]
[ti:Águas de Março]
[offset:+200]
[00:12.40]First line of the song
[00:15.80]Second line of the song
```

**`.txt` format.** Raw lyrics, shown exactly as written (line breaks and blank lines kept), **without automatic scrolling**: the user scrolls by hand.

**Embedded lyrics (third source).** The unsynchronized lyrics tag of the audio file: ID3v2 `USLT` in MP3 (first frame when there are several), `LYRICS` / `UNSYNCEDLYRICS` Vorbis comments in FLAC and OGG/Opus, `©lyr` in M4A. If the embedded text contains LRC timestamps (some taggers store LRC text there), it is parsed with the `.lrc` rules and shown synced; otherwise it is shown as plain lyrics, with no automatic scrolling. The binary synced frame (ID3 `SYLT`) is not read in v1.

**Encoding.** UTF-8 (a BOM is ignored). If a file is not valid UTF-8, it is read as Windows-1252, which covers older files saved on Windows.

**Behavior.**
- Synced lyrics highlight the current line and scroll to keep it in view; tapping a line seeks to it. If the user scrolls by hand, automatic scrolling pauses until they tap "Back to current line" or a few seconds pass.
- An **auto-scroll** toggle (a floating icon at the bottom right of synced lyrics) turns automatic scrolling off so the user can read freely. It is a **global setting, saved** with the other settings: it applies to every song and survives app restarts until the user changes it (default: on). While it is off, the current line is still highlighted and tapping a line still seeks, but nothing scrolls on its own.
- Plain lyrics never scroll on their own.
- Lyrics are proper text and are never translated.

## Consequences

- The scanner records which songs have lyrics and where they come from (the lyrics file's document URI, or "embedded" when the audio file has a lyrics tag) and picks up new, changed or removed lyrics on the incremental scan. The text is read only when the user opens the lyrics, never stored in the database.
- Where and how lyrics appear in "Now playing" is designed in the mockup ("Lyrics" in [03-mockup.md](../design/03-mockup.md)) and approved by the maintainer (D6) before it is built.
- The tools that organize the maintainer's music library (outside this repository) must keep `.lrc` and `.txt` files, rename them together with their audio file, and keep `USLT` tags when rewriting tags.
- Songs whose audio file is renamed without its lyrics file lose their lyrics until the names match again.

## Alternatives considered

- **Download lyrics inside the app** (e.g. from LRCLIB). Rejected: the app is offline and sends nothing off the phone.
- **A separate `lyrics/` folder.** Rejected: harder to keep in sync when files are moved or renamed; the same-name file next to the song is what common tools produce.
- **Embedded lyrics first.** Rejected: files next to the song are easier to add and fix; the maintainer chose them as the first sources.
- **Read ID3 `SYLT` (binary synced lyrics).** Left out of v1: rare, and LRC text covers synced lyrics.
