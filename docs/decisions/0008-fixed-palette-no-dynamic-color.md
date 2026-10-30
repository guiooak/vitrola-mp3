# D8 · Fixed brand palette, no dynamic color

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D9](0009-design-tokens-source-of-truth.md)

## Context

Android 12+ can recolor apps from the wallpaper (Material You). The app has a strong visual identity built around the record.

## Decision

The app uses the brand palette (cream, wine, mustard) in both light and dark themes, without dynamic color. Only the Android 13+ themed icon follows the wallpaper. Details in [02-style-guide.md](../design/02-style-guide.md).

## Consequences

- The Compose theme maps the brand tokens to Material 3 roles by hand (see `.ai/04-design-system.md`).
