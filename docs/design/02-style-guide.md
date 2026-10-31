# Step 2 · Style guide

**Status:** approved on 2026-10-25 · interactive visual guide at [`design/02-style-guide/style-guide.html`](../../design/02-style-guide/style-guide.html)

This document summarizes the rules. The HTML shows everything working: clickable components, live contrast checks, and light and dark themes.

## Source of truth: tokens

Colors, typography, spacing, radii, shadows and motion live in [`tokens.json`](../../design/02-style-guide/tokens.json). The `tokens.css` (for the mockup) and `tokens.js` (for the guide page) files are generated from it:

```bash
python3 design/02-style-guide/generate_tokens.py
```

Never edit `tokens.css` or `tokens.js` by hand. In the app, the same `tokens.json` becomes the Compose theme (see [Mapping to the app](#mapping-to-the-app)).

## Principles

1. **Analog warmth:** cream, wine and mustard instead of cold gray.
2. **Music comes first:** the cover and the record are the stars, and the interface steps back.
3. **As simple as putting on a record:** common tasks take two taps at most.
4. **For everyone:** AA contrast, 48dp touch targets, respect for "reduce motion".

## Colors

### Primitive scales

| Step | Wine | Mustard | Warm neutral |
|---|---|---|---|
| 0 | | | `#FFFDF8` |
| 50 | `#FBEDEF` | `#FDF6E3` | `#FAF6EE` |
| 100 | `#F5D5DA` | `#FAE9B8` | `#F3E9D2` (cream) |
| 200 | `#E9A9B3` | `#F4D27A` | `#E6DAC0` |
| 300 | `#D67887` | `#ECBD48` | `#CFC8B8` (metal) |
| 400 | `#BC4A5D` | `#E0A526` (brand) | `#A89F90` |
| 500 | `#9E2F42` | `#C08A17` | `#7D7468` |
| 600 | `#7A1F2B` (brand) | `#9A6D10` | `#5A5148` |
| 700 | `#631824` | `#74510C` | `#3A322C` (groove) |
| 800 | `#4B121B` | `#4F3708` | `#26201C` |
| 900 | `#330B12` | `#2E2005` | `#1B1714` (vinyl) |
| 950 | | | `#120F0D` |

### Role colors

Components use **only these**, never the primitives directly. In CSS they are `--color-<token>`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#FAF6EE` | `#120F0D` | Screen background |
| `surface` | `#FFFDF8` | `#1B1714` | Cards, lists, sheets |
| `surface-2` | `#F3E9D2` | `#26201C` | Mini player, fields, grouped areas |
| `surface-3` | `#E6DAC0` | `#3A322C` | Tracks, strong dividers |
| `text` | `#1B1714` | `#F3E9D2` | Primary text |
| `text-2` | `#5A5148` | `#CFC8B8` | Secondary text (artist) |
| `text-3` | `#6E655A` | `#A89F90` | Captions, placeholders |
| `border` | `#E6DAC0` | `#3A322C` | Dividers |
| `border-strong` | `#A89F90` | `#5A5148` | Control outlines |
| `primary` | `#7A1F2B` | `#D67887` | Main action, active item |
| `on-primary` | `#FFFDF8` | `#330B12` | Text on primary |
| `primary-container` | `#F5D5DA` | `#631824` | Tonal button, active tab |
| `on-primary-container` | `#4B121B` | `#F5D5DA` | Text on the container |
| `accent` | `#E0A526` | `#ECBD48` | Play, seek thumb, equalizer |
| `on-accent` | `#1B1714` | `#2E2005` | Text on accent |
| `accent-container` | `#FAE9B8` | `#4F3708` | Folder icons, light notices |
| `on-accent-container` | `#4F3708` | `#FAE9B8` | Text on the accent container |
| `error` | `#B3261E` | `#F2B8B5` | Errors, destructive actions |
| `success` | `#2E7D4F` | `#7FD1A0` | Confirmations |
| `snackbar-action` | `#E0A526` | `#7A1F2B` | Action inside a snackbar |
| `record` / `groove` / `metal` | — | — | Drawing of the vinyl and tonearm |
| `scrim` | 45% vinyl | 60% black | Backdrop behind dialogs |

### Rules

- All text passes **AA (4.5:1)** and all icons pass **3:1**, in both themes. The guide page shows the math.
- **Mustard is never a text color** on light backgrounds. It is only a fill, with dark text on top.
- The app **does not use dynamic color** (Material You). The identity is fixed, but the Android 13+ themed icon still follows the wallpaper.

## Typography

| Family | Role | Weights |
|---|---|---|
| **Fraunces** | Brand: titles, album names, "now playing". Only at 22sp and up. | 600–800 |
| **Outfit** | Interface: lists, buttons, times | 400–600 |

| Style | Font | Size/line height | Use |
|---|---|---|---|
| `display` | Fraunces 800 | 40/44 | Welcome |
| `title` | Fraunces 700 | 28/34 | Album name, screen titles |
| `title-m` | Fraunces 600 | 22/28 | Song in the player, dialogs |
| `subtitle` | Outfit 600 | 18/24 | Sections |
| `body` | Outfit 400 | 16/24 | Body text |
| `body-s` | Outfit 400 | 14/20 | Artist, details |
| `label` | Outfit 500 | 14/20 | Buttons, list titles |
| `caption` | Outfit 400 | 12/16 | Times, counts |
| `overline` | Outfit 600 | 11/16, uppercase | Section labels |

Times and counts use tabular figures (`tabular-nums`) so they don't "jump" while the music plays.

## Space and shape

- **Spacing** (4dp grid): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64
- **Radii:** `xs` 6 · `s` 10 · `m` 14 · `l` 20 · `xl` 28 · `full` (pill)
- **Elevation:** 3 levels of warm shadow (brown, not black). In the dark theme, elevation shows more through the surface color.

## Icons

**Material Symbols Rounded**, weight 400, 24dp. Outlined by default and filled for the active item (current tab, favorited item). Playback controls use the filled version.

## Components

All of them are interactive in the guide.

| Component | Key rules |
|---|---|
| **Buttons** | Primary (wine): at most one per screen. Tonal: secondary. Accent (mustard): "play", sparingly. Outline and text: low emphasis. 48dp tall, pill shape. |
| **Player controls** | A 72dp play button that morphs into a rounded square while playing. Active shuffle and repeat turn wine with a dot. Repeat cycles off → all → one. |
| **Seek bar** | 6dp track, wine fill and mustard thumb (like the tonearm headshell). Tabular figures for times. |
| **"Now playing" record** | The album cover becomes the record label, which spins at 33⅓ rpm (1.8s per turn) and slows down when paused. |
| **Filters** | Artists / Songs / Albums / Folders chips. The selected one turns wine and gets a ✓. |
| **Song row** | 48dp cover, title, artist, duration and menu. The current song has a wine title and an animated equalizer over the cover. |
| **Fallback cover** | For MP3s without a cover: generated from the album name, with a palette color, grooves and initials in Fraunces. Deterministic: the same album always gets the same cover. |
| **Artist photo** | Image from the artist folder, as a circle (lists, search) or a wide banner (artist page). Without a photo, the first album cover is used. Details in [03-mockup.md](03-mockup.md#artist-photos-and-album-covers). |
| **Mini player** | Pinned above the navigation, with a spinning record, title, play and next, and a thin progress line at the top. |
| **Bottom navigation** | 4 tabs with a pill indicator. |
| **Search, folders, settings** | Pill-shaped field. 64dp rows with a square icon. Switch for options. |
| **Scan** | Bar with animated stripes and a "412 / 664" count. |
| **Snackbar and dialog** | The snackbar uses the `snackbar-action` color. Destructive dialogs explain the consequence ("the files stay on your phone"). Every dialog closes with an X in its top-right corner; there are no Cancel or Close buttons, only the main action when there is one ([D30](../decisions/0030-dialogs-close-with-x.md)). |
| **Empty state** | Illustrated empty record, a friendly title and the main action. |

## Motion

| Token | Value | Use |
|---|---|---|
| `fast` | 150ms | Taps, hover, state changes |
| `medium` | 300ms | Switches, tabs, play morph |
| `long` | 500ms | Mini player → full screen |
| `tonearm` | 700ms | Tonearm lowering and lifting |
| `record-spin` | 1800ms | One record turn (33⅓ rpm) |

Easing: `standard` (0.2, 0, 0, 1) · `decelerate` (0.05, 0.7, 0.1, 1) · `accelerate` (0.3, 0, 0.8, 0.15) · `tonearm` (0.4, 0.1, 0.2, 1).

Motion mimics the physical: the record has weight and the arm lowers slowly. Nothing blinks or bounces. With **"reduce motion"** turned on, the record stays still and transitions become a quick fade.

## Voice and tone

Short sentences in the tone of a friend who knows music. The turntable metaphor shows up in special moments (empty state, welcome), never on buttons.

| Situation | ✓ Like this | ✕ Not like this |
|---|---|---|
| Folder button | Choose folder | Select media directory |
| Empty library | No record on the turntable | Error: no files found |
| Scanning | Looking for songs… 412 of 664 | Indexing files (62%) |
| Broken file | Couldn't play "track 07.mp3". Skipped to the next one. | Media decoding exception |
| Lost permission | We lost access to the "Music" folder. Choose it again to keep listening. | URI permission revoked |

## Accessibility

- AA contrast for text (4.5:1) and icons (3:1), in both themes.
- Touch targets of at least 48dp.
- Screen reader labels on every icon-only button ("Next song").
- Respect "reduce motion".
- Sizes in sp. The layout handles 200% font size, using ellipsis when needed.
- State never relies on color alone (dot on shuffle and repeat, ✓ on the chip).

## Mapping to the app

| Token | Jetpack Compose (Material 3) |
|---|---|
| `primary` / `on-primary` | `colorScheme.primary` / `onPrimary` |
| `primary-container` | `colorScheme.primaryContainer` |
| `accent` / `accent-container` | `colorScheme.secondary` / `secondaryContainer` |
| `background`, `surface`, `surface-2`, `surface-3` | `background`, `surface`, `surfaceContainer`, `surfaceContainerHigh` |
| `text` / `text-2` | `onSurface` / `onSurfaceVariant` |
| `border` / `border-strong` | `outlineVariant` / `outline` |
| `type-*` | `Typography(...)` with Fraunces and Outfit `FontFamily` |
| `radius-*` | `Shapes(...)` |
| `record`, `groove`, `metal`, `duration-*`, `easing-*` | Custom `VitrolaTokens` object via `CompositionLocal` |
