# D29 · Fade between songs

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D4](0004-background-playback.md), [D23](0023-equalizer.md), [D25](0025-spinning-record-setting.md), [D27](0027-touch-the-record-and-tonearm.md)

## Context

The maintainer wants a global option for smooth transitions from one song to the next. Two kinds of transition were considered:
- **crossfade:** the end of one song and the start of the next play together;
- **fade out, then fade in:** the songs do not overlap.

The maintainer chose fade out, then fade in. It is much simpler to build (one player, volume changes only) and still avoids abrupt endings and starts. The maintainer also chose an on/off switch with an adjustable length. The fade is skipped for manual song changes and for albums that play continuously.

## Decision

**Setting.** Settings › Playback › **Fade between songs**, **off by default**.
- The subtitle shows "Off", or "Fade out, then fade in · 5 s".
- When the switch is on, a **Fade length** slider appears under it: from 1 to 12 seconds, default 5 s, in steps of 1 s.
- Both the switch and the length are **global** and **saved** across restarts.
- Turning the switch on or off shows a snackbar.

**When a song ends and the next one starts by itself** (the queue advances, repeat all wraps around, or repeat one starts the song again):
1. The ending song **fades out** to silence over its last N seconds, where N is the fade length.
2. The next song starts silent and **fades in** to full volume over its first N seconds.
3. The songs never overlap.
4. The volume follows a smooth curve that sounds even to the ear (a quadratic curve in amplitude), not a straight line.
5. In a short song, each fade lasts at most a quarter of the song's length.

**No fade:**
- **Manual changes** switch at once:
  - next or previous (in the app, the notification, the lock screen, a headset or the car);
  - choosing another song, or jumping within the queue;
  - starting a new list.
  
  If a fade-out is in progress when the user skips, it is cut. The new song starts at full volume. A ramp shorter than 100 ms is still applied to avoid clicks.
- **Albums that play continuously:** no fade when the next song is the next track of the same album, played in order (shuffle off). These tracks play back to back, so live albums and songs that flow into each other stay intact.
- **The last song of the queue** with repeat off ends as recorded.

**During a fade:**
- **Pause:** behaves as usual. On resume, the volume continues from the point on the curve that matches the position.
- **Seeking** into the last N seconds fades from there; seeking out of them returns to full volume.
- **Touching the record (D27):** its silence and speed apply on top of the fade.
- **Equalizer (D23) and system volume:** unchanged.
- **Play counts, the notification and the play/pause state:** unchanged. A fade is never a pause.

## Consequences

- New saved settings: `fadeEnabled` (default false) and `fadeSeconds` (default 5, from 1 to 12).
- Playback service (D4):
  - A small volume controller sets `player.volume` from the position, about every 50 ms, during the last N seconds of a song.
  - On `onMediaItemTransition`, the controller checks the reason. For `AUTO` and `REPEAT` with the fade applicable, it ramps from 0 over N seconds. For any other reason (seek, playlist change, a skip command), it restores full volume with a short ramp.
  - The "same album, next track, shuffle off" check uses the album ID and track number, with gapless playback (Media3 reads the MP3 encoder delay and padding).
- Copy: "Fade between songs", "Fade length", the two subtitles and two snackbars ("Songs will fade out and in" / "Songs change without fading").
- Designed in the mockup (Settings › Playback) and approved before it is built (D6). The mockup has no sound, so it shows only the setting.

## Alternatives considered

- **Crossfade (overlapping songs).** Not chosen by the maintainer. It needs two players playing at the same time and handing over the audio session, notification and equalizer, which adds about a week of work. It stays in the "Later" list.
- **Only fade out, or only fade in.** Rejected. Fading both sides is what makes the change smooth.
- **A fixed length (switch only).** Not chosen. The maintainer wants to adjust it.
- **Fading on manual skips too.** Rejected. A skip should respond at once.
