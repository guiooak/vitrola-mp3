# D27 · Touching the record, and when the tonearm rests

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D4](0004-background-playback.md), [D24](0024-driving-mode.md), [D25](0025-spinning-record-setting.md), [D26](0026-record-label-image.md)

## Context

The maintainer wants the spinning record to react to touch, like a real turntable: a playful interaction, not a real control. The maintainer also wants the tonearm to tell the playback state at a glance: on the record while music plays, back at its rest when music stops and waits for the user. In the mockup the arm already moved, but without its animation (the player was redrawn on every play/pause and the arm appeared already in place).

## Decision

**Touching the record (Now playing only).** Available only while music plays and the record spins (not with "Spinning record" off, D25, not with reduce motion, not in the mini player, the lyrics header or driving mode, D24).
- **Finger on the record → the record holds still and the music stops** (silent, not paused: the app still shows it as playing).
- **Turning it with the finger → the music follows the record:** the speed is the finger's angular speed divided by the normal spin (one turn = 1.8 s of music), from 0 to 3×, with the pitch following the speed like vinyl. Turning backwards counts as holding (no reverse playback). A finger that stops moving brings the music to a stop again.
- **Letting go → normal playback at 1× and the normal spin resume** from where the record was released.
- It never changes the queue, the play/pause state, the notification, the play count or any setting. The gesture works only on the record itself (inside the disc), and it takes priority over any screen gesture on that area (e.g. swipe down to close, Q6).
- No speed readout in the app (you hear it). The mockup shows a small "Held / 1.4×" bubble because it has no sound.

**Tonearm.**
- **On the record whenever music plays**: while a song plays, between songs of a queue, while loading, and while the user holds or turns the record.
- **Back to its rest, off the record, when playback stops and waits for the user**: a manual pause (app, notification, lock screen, headset), the end of the queue with repeat off, the sleep timer, headphones disconnected (D4), an error that stops the queue, a lost folder.
- A short interruption that Android resumes by itself (a phone call or another app briefly taking audio focus) keeps the arm on the record.
- **Rest angle −20°** around the pivot (was −14°), so the head clearly leaves the record.
- **Every arm move is animated**: 700 ms with the tonearm easing (0.4, 0.1, 0.2, 1), dropping and lifting alike, including the first time Now playing opens. A redrawn player starts the arm from the position last shown, so it never jumps.

## Consequences

- Playback: during the gesture the service applies `PlaybackParameters(speed, pitch = speed)` at about 30 Hz with smoothing, clamped to 0.25–3×; when the finger holds still (rate < 0.1 for about 80 ms) the output is silenced and the speed kept at the minimum instead of pausing, so the media session state does not flicker. On release: `PlaybackParameters(1, 1)` and full volume. A custom session command or a direct call from the UI drives it (`setScratch(rate)` / `endScratch()`).
- The record component tracks the touch angle around the disc center, updates the shared rotation angle directly while touched, and restarts the spin from that angle on release (D26 keeps the stop upright).
- The tonearm state comes from "is playing or will resume by itself" (transient focus loss), not from the raw player state.
- Designed in the mockup (Now playing: touch the spinning record; pause, play and end of queue for the arm) and approved before it is built (D6).
