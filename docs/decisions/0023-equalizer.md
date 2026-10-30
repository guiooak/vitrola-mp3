# D23 · Equalizer with 10 fixed bands (Android DynamicsProcessing)

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D1](0001-personal-use-play-store-ready.md), [D4](0004-background-playback.md), [D5](0005-tech-stack.md), [D6](0006-design-before-code.md)

## Context

The maintainer wants an equalizer in the app. It was in the "Later" list. Android offers three ways to build one:

- **`android.media.audiofx.Equalizer`** (every Android version): the phone decides the bands (usually 5: 60 Hz, 230 Hz, 910 Hz, 3.6 kHz, 14 kHz) and the presets (names come from the system and cannot be translated). Quality and availability depend on the manufacturer.
- **`android.media.audiofx.DynamicsProcessing`** (Android 9+, API 28): Android's own audio processing, but the app chooses the bands, so the equalizer looks and behaves the same on every phone.
- **Own processing inside the player** (a Media3 audio processor): works everywhere, but the app owns the DSP code and its quality, which is the most work.

The app supports Android 8+ (`minSdk 26`, D5). Android 8 is now a small and shrinking share of phones in use.

## Decision

- **Engine:** `DynamicsProcessing` attached to the player's audio session, with **10 fixed bands**: 31, 62, 125, 250, 500 Hz, 1, 2, 4, 8, 16 kHz, each **−12 to +12 dB** in 1 dB steps.
- **Android 8, or when the effect cannot be created** (device without support): the equalizer is **hidden** everywhere (no Settings row, no Now playing button). The app keeps `minSdk 26`; nothing else changes on those phones.
- **Where:** Settings › Playback › **Equalizer** (opens its own screen, the row shows the status: "Off" or "On · Rock · bass boost 40%"), and a **button in the Now playing bottom row** that opens the same controls in a sheet. The button shows the "on" dot while the equalizer is on.
- **Controls:**
  - **On/off switch** ("Use equalizer"). Turning it off keeps every setting; turning it on restores them. Touching any control while off turns it on.
  - **Presets** defined by the app (so they are translated with the rest of the UI): Flat, Bass, Vocal, Treble, Rock, Pop, Jazz, Classical, Electronic, Acoustic, plus **Custom**. Moving any band switches to Custom, and the Custom curve is remembered when another preset is picked.
  - **10 vertical band sliders** over a curve that connects them, with a dB scale; the value shows while dragging.
  - **Bass boost**, 0–100 % (0 = off), applied as extra gain on the lowest bands of the same `DynamicsProcessing` effect (up to +8 dB at 31–62 Hz, tapering by 250 Hz), so it behaves the same on every phone.
- **Scope:** one **global** setting for every song and every output (speaker, wired, Bluetooth), **saved** across app restarts. Default: off, Flat, bass boost 0.

## Consequences

- The app declares `MODIFY_AUDIO_SETTINGS`, a normal permission that Android grants without asking. No broad permission is added (D1, D3).
- The `DynamicsProcessing` limiter stage is enabled so boosted bands do not clip; the app may also lower the input gain by the largest boost.
- The effect lives in the playback service with the player (D4), is recreated when the audio session changes, and is released with the player.
- New saved settings: `eqEnabled`, `eqPreset`, `eqBands` (10 values), `eqCustomBands`, `eqBassBoost`.
- Preset names, labels and snackbars go through string resources and the translation review (D20).
- The equalizer is designed in the mockup and approved before it is built (D6).

## Alternatives considered

- **`Equalizer` (audiofx).** Rejected: bands and presets change from phone to phone, preset names cannot be translated, and some manufacturers' implementations are unreliable.
- **Own DSP in Media3.** Rejected for now: the most work, and the app would own audio quality; `DynamicsProcessing` gives fixed bands without it.
- **Raise `minSdk` to 28.** Not needed: hiding the equalizer on Android 8 keeps the rest of the app available there.
- **Per-output settings** (speaker, wired, each Bluetooth device). Left out: the maintainer chose one global setting.
- **Open the system equalizer** (`ACTION_DISPLAY_AUDIO_EFFECT_CONTROL_PANEL`). Rejected: not present on every phone and outside the app's design.
