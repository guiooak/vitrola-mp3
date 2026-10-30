# 04 · Design system for the app

Full rules: [`docs/design/02-style-guide.md`](../docs/design/02-style-guide.md). Interactive reference: https://guiooak.github.io/vitrola-mp3/02-style-guide/style-guide.html. Values: [`design/02-style-guide/tokens.json`](../design/02-style-guide/tokens.json) — **source of truth (D9)**; generate Kotlin from it instead of retyping values.

## Theme (D8)

- Light and dark color schemes from `colors.light` / `colors.dark`. **No dynamic color.**
- User setting: Automatic (follow system) / Light / Dark.
- Edge-to-edge with transparent system bars; status bar icons follow the theme.

### Token → Compose mapping

| Token | Material 3 |
|---|---|
| `primary` / `on-primary` | `primary` / `onPrimary` |
| `primary-container` / `on-primary-container` | `primaryContainer` / `onPrimaryContainer` |
| `accent` / `on-accent` | `secondary` / `onSecondary` |
| `accent-container` / `on-accent-container` | `secondaryContainer` / `onSecondaryContainer` |
| `background` | `background` |
| `surface` | `surface` |
| `surface-2` | `surfaceContainer` |
| `surface-3` | `surfaceContainerHigh` |
| `text` / `text-2` | `onSurface` / `onSurfaceVariant` (also `onBackground`) |
| `text-3` | custom (`VitrolaTokens.colors.text3`) |
| `border` / `border-strong` | `outlineVariant` / `outline` |
| `error` | `error` (`onError` = `surface`) |
| `success`, `snackbar-action`, `record`, `groove`, `metal`, `scrim` | custom `VitrolaTokens` via `CompositionLocal` |

Typography (`typography.scale`, sizes in **sp**): `display` → `displaySmall`, `title` → `headlineSmall`, `title-m` → `titleLarge`, `subtitle` → `titleMedium`, `body` → `bodyLarge`, `body-s` → `bodyMedium`, `label` → `labelLarge`, `caption` → `bodySmall`, `overline` → `labelSmall` (uppercase, letter spacing ~0.08em). Use tabular figures for times and counts (`fontFeatureSettings = "tnum"`).

Shapes: `radius.s` 10 → small, `radius.m` 14 → medium, `radius.l` 20 → large, `radius.xl` 28 → extraLarge; pills use `CircleShape`/50%.

Motion durations/easings go into `VitrolaTokens.motion` (see below).

## Fonts

- **Fraunces** (brand): titles, album/song name in "Now playing", welcome. Weights 600–800, optical size high (144) for large text. Only at 22sp and up.
- **Outfit** (UI): everything else. Weights 400–600.
- Both are OFL (Google Fonts). Bundle them in `res/font` (static instances or variable fonts with `FontVariation` settings). Do not depend on downloadable fonts at runtime (offline app).

## Icons

**Material Symbols Rounded**, weight 400, 24dp; outlined by default, **filled** for the active tab, favorited hearts and playback controls. Use vector drawables exported from Material Symbols (or `material-icons-extended` Rounded where the glyph matches). Icons used in the mockup: `library_music, queue_music, search, settings, play_arrow, pause, skip_previous, skip_next, shuffle, repeat, repeat_one, favorite, more_vert, expand_more, arrow_back, album, mic, folder, folder_open, folder_special, folder_off, create_new_folder, sd_card, smartphone, image, audio_file, playlist_play, playlist_add, add_to_queue, add, edit, delete, info, description, bedtime, history, headset_off, photo_library, refresh, subdirectory_arrow_right, battery_alert, swap_vert, check, close, chevron_right, drag_indicator, radio_button_checked, radio_button_unchecked, trending_up, schedule, search_off, headphones, lock, lyrics, notes, vertical_align_center, tune, directions_car, bluetooth, music_off`.

## App icon and logo assets

- Adaptive launcher icon from `design/01-logo/export/android/`: `ic_launcher_foreground.svg`, `ic_launcher_background.svg` (cream `#F3E9D2`), `ic_launcher_monochrome.svg` (Android 13 themed icon). Convert to VectorDrawables (Android Studio → Vector Asset) and wire `mipmap-anydpi-v26/ic_launcher.xml` with `<monochrome>`.
- Notification small icon: `ic_notification.svg` (white, single color).
- In-app logo (Settings → About): `vitrola-mp3-horizontal-positive.svg` (light) / `-negative.svg` (dark).
- Do not redraw or recolor the logo (see `docs/design/01-logo.md` usage rules).

## Component specs (from the mockup)

| Component | Spec |
|---|---|
| Button | 48dp tall, pill shape, label style, 20dp leading icon. Variants: **primary** (wine, main action, max one per screen), **tonal** (primary-container), **accent** (mustard — "Play"), **outline** (1.5dp border-strong), **text**, **danger** (error). Press: scale 0.97. |
| Icon button | 48dp circular touch target. "On" state (shuffle/repeat active): primary color + 4dp dot below the icon. |
| Play button (Now playing) | 76dp circle, primary, 42dp icon, elevation 2; morphs to a 26dp-radius rounded square while playing. |
| Filter chip | 36dp tall pill, 1.5dp outline; selected = primary fill + ✓ icon. |
| Song row | min 64dp, 16dp start padding, 48dp cover (radius s) or track number, title (label 15sp) + artist (body-s, text-2), duration (caption, text-3, tabular) with a 14dp wine heart before it when favorited, ⋮ button. Current song: title in primary + animated equalizer (3 mustard bars) over the cover/number; bars freeze when paused. |
| Album card | square cover radius m, elevation 1; title (label) + "artist · year" (caption). Favorite: 28dp surface circle with a 16dp filled heart in the bottom-right corner of the cover. |
| Artist card | circular photo, elevation 1; name (label) + album count (caption). 3 per row. |
| Mini player | 8dp margin, surface-2, radius l, elevation 2; 3dp progress line on top (primary on surface-3); 44dp record; title/artist; play/pause; next. |
| Bottom navigation | 4 items; 56×30dp pill indicator in primary-container behind the active icon (filled). |
| Top bar | 60dp, title in `title` style (Fraunces) at the start; becomes translucent with a hairline when scrolled. Over the artist photo: transparent with 38%-dark circular icon buttons. |
| Group / list rows | surface, 1dp border, radius l; rows min 68dp with a 44dp icon square (accent-container, or primary-container "tinted") and a chevron. |
| Switch | 52×32dp, primary when on. |
| Search field | 52dp pill, surface-2; focused = surface + 2dp primary border; clear button. |
| Sheet | top radius xl, grab handle 36×4dp, scrim behind; slides up with decelerate easing. |
| Dialog | radius xl, 24dp padding, leading 28dp icon (error color for destructive), text buttons. |
| Snackbar | inverted (text color background), radius m, action in `snackbar-action`; 3 s, or 5 s when it has an action; sits above the mini player/nav, or 40dp from the bottom on "Now playing". |
| Empty state | dashed-ring record illustration (140dp), title-m heading, body-s text, primary action. |
| Scan progress | 6dp bar with moving diagonal mustard stripes. |
| Equalizer | "Use equalizer" switch row, preset filter chips (horizontal scroller), a 200dp plot with a dB scale (+12 / 0 / −12), a dashed zero line, a wine curve with a 10% fill through 10 band thumbs (16dp mustard, like the seek thumb; value bubble while dragging), frequency labels below, then a "Bass boost" slider styled like the seek bar. Off: controls at 45% opacity. |
| Driving mode | Full screen on the background color. Exit pill 52dp (surface-2, label 17sp + close icon). Tabs: two 72dp blocks (radius l, surface-2; active = primary-container), icon 30dp + label 17sp. Now playing: record 240dp, title Fraunces 700 30sp (2 lines), artist 20sp, 6dp progress bar (no thumb) with times, controls 56/76/104/76/56dp (play is primary, morphs to a 34dp-radius square while playing). Music: 2-column tiles ≥120dp (radius l, surface-2, 36dp primary icon, label 19sp); "Shuffle all" spans both columns in mustard. Playlist rows ≥76dp. Landscape: 132dp side rail with Exit and stacked tabs, record 200dp left (36dp gap), info and controls right, tiles in 3 columns. |
| Landscape (D28) | Navigation rail 88dp (4 items stacked, centered, 14dp gap, active pill as in the bottom bar) with a hairline on the right; mini player at the bottom of the content (12dp side margins). Top bar 48dp, `title-m`. Detail side column 290dp (cover 104dp beside the title; artist banner 240dp). Now playing: record column ≈ 46% of the width; play button 68dp. Lyrics left column 300dp (record 132dp). Sheets max 560dp, centered. Forms max 680dp, centered. |
| Artist hero | 320dp tall full-width photo (top-biased crop), gradient to background, name in `display`; without a photo: first album cover blurred (~18dp), scaled 1.2, 70% opacity. |

## The record (signature component)

Geometry from `record()` in `design/03-mockup/mockup.js` (SVG units):

- **Now playing:** viewBox 320×300. Disc center (150, 160), radius 130, rim stroke 3 `#6A5B50`, grooves every 9 units between r=120 and the label (alternating opacity 1 / 0.55, color `groove`), two highlight arcs (white 17% and 8%), **label radius 50 = the label image clipped to a circle: album image → artist photo → generated cover (D26)**, mustard ring on the label edge, spindle hole r=5 in the background color.
- **Tonearm:** pivot (296, 24); path (296,24) → (282,150) → (240,190), stroke 8 `metal` with a soft shadow; mustard headshell at the end; counterweight above the pivot.
- **Mini player:** viewBox 200×200, center (100,100), radius 96, label radius 38, no arm.
- States: playing → arm down (rotation 0°) and disc spinning; paused → arm back at its rest, **−20° around the pivot** (off the record), and disc coasting to a stop **upright** (label in its normal position, D26).

Generated cover (fallback) — deterministic, from the album title:
- `h` = 32-bit unsigned hash: for each code point `h = (h * 31 + code) mod 2^32`.
- Palette combos `[background, foreground, accent]` from primitives: `[wine600, neutral100, mustard400]`, `[mustard400, neutral900, wine600]`, `[neutral900, mustard300, wine400]`, `[neutral100, wine600, mustard500]`, `[neutral700, neutral100, mustard400]`, `[wine800, mustard300, neutral100]`; pick `combos[h % 6]`.
- Ring center `cx = 30 + (h >> 3) % 140`, `cy = 30 + (h >> 7) % 140` (200-unit square); rings r = 150, 120, 90, 60, stroke 10, foreground at opacity 0.08 + i·0.04; accent dot r=14 at the center.
- Initials: up to 2 words that are longer than 2 letters or start with an uppercase letter/digit, first letter of each, uppercase; Fraunces 800, 60/200 of the size, centered at y = 122/200.
- "Unknown album": neutral300 background, three neutral500 rings at 35%, a neutral600 music note.

## Motion

| Token | Value | Use |
|---|---|---|
| `fast` | 150 ms | Taps, state changes, press scale |
| `medium` | 300 ms | Screen push/pop, tab fade, switches, play morph |
| `long` | 500 ms | Mini player → Now playing |
| `tonearm` | 700 ms, easing `tonearm` (0.4, 0.1, 0.2, 1) | Arm lowering/lifting — every move is animated, starting from the position last shown (D27) |
| `record-spin` | 1800 ms per turn (33⅓ rpm), linear | Disc rotation |

- Easings: `standard` (0.2, 0, 0, 1), `decelerate` (0.05, 0.7, 0.1, 1) for things entering, `accelerate` (0.3, 0, 0.8, 0.15) for things leaving.
- **Rotation continuity:** keep one global angle for the current song's disc so the mini player and Now playing spin in sync and never jump when recomposed. On pause (or when "Spinning record" is turned off while playing), coast to the next upright angle: `to = ceil((angle + 30) / 360) × 360`, duration `600 + 3 × (to − angle)` ms, easing `cubic-bezier(.25, y1, .4, 1)` with `y1 = min(1, 0.25 × spinSpeed × duration / distance)` so it starts at the spinning speed (spinSpeed = 360° / 1800 ms). A record shown already stopped is drawn upright (D26).
- Screen transitions: push = new screen slides in from the right, old one shifts 25% left and dims; pop = reverse; tab switch = fade + 8dp rise.
- Now playing opens with a slide up (500 ms, decelerate) and closes with 300 ms accelerate.
- Favorite heart on the album page pulses (scale 1.25) when turned on.
- **Touching the record** (D27, Now playing only, while it spins): the finger holds the record (music stops) or turns it (music speed = finger angular speed / normal spin, 0.1–3×, stopped below 0.05×; backwards = hold); release → normal spin and 1× from the release angle. No speed readout in the app.
- **Spinning record setting** (D25): when `spinRecord` is off, every record stays still, upright (the shared angle stops advancing, D26); the tonearm and other animations are unchanged.
- **Reduce motion** (system "remove animations" / animator scale 0): disc does not spin, equalizer bars stop, transitions become short fades.

## Accessibility

- AA contrast for text (4.5:1) and icons (3:1) in both themes (already verified for the token pairs).
- 48dp minimum touch targets.
- `contentDescription` on every icon-only button ("Next song", "Remove folder Music"…).
- All text in sp; layouts must survive 200% font scale (ellipsize titles).
- State never relies on color alone (dot for shuffle/repeat, ✓ on chips, heart fill).
