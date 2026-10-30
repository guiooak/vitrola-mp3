# D5 · Tech stack

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D3](0003-library-from-chosen-folders.md), [D4](0004-background-playback.md)

## Context

The app is a native Android music player that reads local files, plays in the background and stores a library index.

## Decision

Kotlin · Jetpack Compose · Media3 (ExoPlayer) · Room · Hilt · WorkManager · Android 8+ (`minSdk 26`). The app accepts any format ExoPlayer plays from local files (MP3, FLAC, M4A, OGG, WAV); the name stays "Mp3".

## Consequences

- Other libraries proposed in `.ai/03-architecture.md` (DataStore, Coil, Navigation Compose) are recommendations; the final choices are recorded as new decisions.
