# D26 · Record label image and upright resting position

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D12](0012-photos-and-covers-from-folders.md), [D19](0019-folder-image-rule.md), [D25](0025-spinning-record-setting.md)

## Context

The record's label (the center of the vinyl in the mini player, Now playing, the lyrics header and driving mode) showed the album cover, falling back to the generated cover. Many albums have no cover while their artist folder has a photo. Also, when the record stops (pause, or the "Spinning record" setting off, D25), it stopped at any angle, so a real image on the label could rest sideways or upside down.

## Decision

**Label image, in order:**
1. the **album image**: the album folder image (D19) or, in the app, the cover embedded in the audio file (D12);
2. otherwise the **artist image**: the artist folder photo (D19);
3. otherwise the **generated cover**, exactly as in the mockup (and the "Unknown album" design for files without metadata).

The "Use folder photos and covers" setting still applies: when it is off, folder images are skipped (embedded cover → generated).

This order is only for the record label. Album cards, album pages and lists keep the cover rules of D12 (no artist photo as an album cover).

**Upright when still.** Whenever the record is not spinning, the label rests in its normal, upright position:
- On pause, the record coasts to a stop at the next upright angle (a multiple of 360°, at least 30° ahead). The coast starts at the spinning speed and eases out (about 0.7–1.8 s), so it never jumps or speeds up.
- Turning "Spinning record" off while music plays does the same coast; with it off, the record stays upright.
- When the record is shown already stopped (app opened, a new song while paused, reduce motion), it is drawn upright with no animation.

## Consequences

- D25 is refined: the record no longer stays "at the angle where it stopped"; it always rests upright.
- The record component needs the artist photo as a label fallback, so the image resolver exposes a `labelImage(track)` that applies the order above.
- The shared rotation angle (one angle for every record) is reset to an upright value whenever the record stops, so the mini player and Now playing always agree.
- In the mockup, "Expresso 2222" has no album image, so its label shows Gilberto Gil's photo.
