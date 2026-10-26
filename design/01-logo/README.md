# Logo — Vitrola Mp3

Chosen concept: **A · Classic vinyl**.

| File | Use |
|---|---|
| `logo.html` | Logo guidelines (open in a browser). Source of truth for the drawings. |
| `concepts.html` | The 4 initial concepts, kept for history. |
| `export/vitrola-symbol.svg` | Detailed symbol, 64px and up |
| `export/vitrola-symbol-small.svg` | Simplified symbol, 48px and below |
| `export/vitrola-symbol-mono.svg` | Single color (`currentColor`) |
| `export/vitrola-app-icon.svg` | Icon on a rounded cream background |
| `export/android/ic_launcher_*.svg` | Adaptive icon layers (108×108): foreground, background and monochrome |
| `export/android/ic_notification.svg` | White notification icon |
| `export/vitrola-mp3-horizontal-{positive,negative}.svg` | Horizontal lockup (symbol + name) |
| `export/vitrola-mp3-vertical-{positive,negative}.svg` | Vertical lockup |
| `export/vitrola-mp3-wordmark-{positive,negative}.svg` | Name only |

"Positive" is for light backgrounds (name in wine) and "negative" for dark backgrounds (name in cream).

Base palette: Cream `#F3E9D2` · Wine `#7A1F2B` · Mustard `#E0A526` · Vinyl `#1B1714` · Groove `#3A322C` · Metal `#CFC8B8`.

Name: **Vitrola** in Fraunces ExtraBold (800) and **Mp3** in Fraunces Medium (500), optical size 144. In the exported lockups the text is already outlined and does not depend on installed fonts.

The SVGs in `export/` are generated from the `<symbol>` elements in `logo.html`. Edit them there and run `scripts/export.sh`.

Full documentation: [docs/design/01-logo.md](../../docs/design/01-logo.md).
