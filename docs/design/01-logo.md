# Step 1 · Logo

**Status:** approved on 2026-10-25 · files in [`design/01-logo/`](../../design/01-logo/)

<p>
  <img src="../../design/01-logo/export/vitrola-app-icon.svg" alt="App icon" height="96">
  &nbsp;&nbsp;
  <img src="../../design/01-logo/export/vitrola-mp3-horizontal-positive.svg" alt="Vitrola Mp3" height="96">
</p>

## How we got here

Four concepts were explored in [`concepts.html`](../../design/01-logo/concepts.html):

| | Concept | Style | Outcome |
|---|---|---|---|
| **A** | Classic vinyl: record, wine label, tonearm with needle | Literal retro | ✅ Chosen |
| B | Play record: ring with a play button in the center | Minimal | Too generic |
| C | Gramophone "V": the horn forms the letter V | Original retro | Looked like a cocktail glass |
| D | Retro badge: emblem with the name around it | Vintage | Unreadable at small sizes |

**Why A:** it instantly reads as "turntable", fits the name and ties directly into the app's animation (the arm drops and the record spins).

## The symbol

Drawn on a 200×200 grid:

- **Record:** radius 70, shifted left and down to make room for the arm. Alternating groove tones and two highlights add depth without gradients. A light rim (`#6A5B50`) keeps the record from disappearing on dark backgrounds.
- **Label:** radius 25 (about 1/3 of the record, like an LP), wine, with a mustard ring and a cream spindle hole.
- **Tonearm:** from the pivot (top right corner) to the needle on the outer third of the record. It has a counterweight, a mustard base, a mustard headshell and a soft shadow.

## Variations

| Variation | When to use | File |
|---|---|---|
| Detailed | 64px and up | `export/vitrola-symbol.svg` |
| Simplified | 48px and below (fewer grooves, thicker strokes, larger label) | `export/vitrola-symbol-small.svg` |
| Monochrome | Android 13+ themed icon, single-color uses | `export/vitrola-symbol-mono.svg` |
| App icon | Stores, marketing (rounded cream background) | `export/vitrola-app-icon.svg` |
| Adaptive icon | Android: foreground, background and monochrome layers (108×108) | `export/android/ic_launcher_*.svg` |
| Notification | Status bar (white) | `export/android/ic_notification.svg` |

In the adaptive icon, the symbol sits inside the central safe zone (66 of 108 units) and was tested with the circle, squircle, rounded square and teardrop masks.

## Name

The app is called **Vitrola Mp3**.

- **Vitrola** in Fraunces ExtraBold (800), **Mp3** in Fraunces Medium (500), at the same size, optical size 144. The weight contrast creates hierarchy without a second color.
- In the exported files the text is outlined and does not depend on installed fonts.

| Lockup | Files |
|---|---|
| Horizontal | `export/vitrola-mp3-horizontal-{positive,negative}.svg` |
| Vertical | `export/vitrola-mp3-vertical-{positive,negative}.svg` |
| Name only | `export/vitrola-mp3-wordmark-{positive,negative}.svg` |

**Positive** is for light backgrounds (name in wine) and **negative** for dark backgrounds (name in cream).

## Usage rules

- **Clear space:** minimum margin around the logo equal to the label radius.
- **Recommended backgrounds:** cream `#F3E9D2`, vinyl `#1B1714` and wine `#7A1F2B`.
- **Don't:** stretch or rotate the logo, change the record colors, use the detailed version below 48px, or place the positive lockup on a dark background.

## Base palette

| Color | Hex |
|---|---|
| Cream | `#F3E9D2` |
| Wine | `#7A1F2B` |
| Mustard | `#E0A526` |
| Vinyl | `#1B1714` |
| Groove | `#3A322C` |
| Metal | `#CFC8B8` |

## How to edit

The drawings live in the `<symbol>` elements of [`logo.html`](../../design/01-logo/logo.html), the source of truth. To change the logo, edit the HTML and regenerate the SVGs:

```bash
design/01-logo/scripts/export.sh
```

The script needs `python3`, `uv` and `curl`. It downloads the Fraunces font (OFL license) from the Google Fonts repository and outlines the name with `fonttools` + `uharfbuzz`.
