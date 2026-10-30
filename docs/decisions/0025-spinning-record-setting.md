# D25 · Setting to keep the record still

- **Status:** Accepted
- **Date:** 2026-10-30
- **Revised:** 2026-10-30: the record rests upright instead of at the angle where it stopped (D26).
- **Related:** [D7](0007-logo-classic-vinyl.md), [D9](0009-design-tokens-source-of-truth.md), [D26](0026-record-label-image.md)

## Context

The record that spins while music plays is the app's signature (mini player, Now playing, lyrics header, driving mode). The maintainer wants a simple way to turn the spinning off without changing anything else. Until now the record only stopped for the system "remove animations" setting.

## Decision

- A single switch, **Settings › Appearance › Spinning record** ("The record turns while music plays"), **on by default**.
- When off, every record in the app stays still, resting upright (see D26), whether music is playing or paused. Nothing else changes: the tonearm still drops and lifts, the equalizer bars in song rows still move, and the other animations keep working.
- The setting is **global** and **saved** across app restarts. Turning it off or on shows a short snackbar.
- The system "remove animations" setting still stops the record too, whatever this switch says.

## Consequences

- New saved setting: `spinRecord` (default true).
- The record component checks `spinRecord` together with reduce motion; the shared rotation angle (one angle for every record) stops advancing while the switch is off and rests upright (D26), so turning it back on resumes from there without a jump.
- Designed in the mockup (Settings › Appearance) and approved before it is built (D6).
