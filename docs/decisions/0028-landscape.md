# D28 · Every screen adapts to landscape

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D11](0011-navigation-structure.md), [D17](0017-html-mockup-approved.md), [D24](0024-driving-mode.md)

## Context

Until now only driving mode had a landscape layout (D24); the rest of the app was meant to stay in portrait in v1. The maintainer wants the whole app to adapt completely to landscape. A phone in landscape is wide and short (about 390dp tall in the mockup), so the portrait layouts waste width and run out of height.

## Decision

The app follows the phone's rotation on every screen (no orientation lock) and each screen has a landscape layout:

- **Navigation:** the bottom bar becomes a **navigation rail** on the left (same 4 tabs, icon + label, active pill); the **mini player** sits at the bottom of the content area, right of the rail. Screens without navigation (welcome, scan) use the full width.
- **Compact height:** top bars 48dp with the `title-m` style; tighter chips, list header and action buttons (40dp tall).
- **Library grids** fill the width: artists in as many columns as fit at ≥96dp, albums at ≥118dp. Settings, the equalizer page and other forms are centered with a maximum width of 680dp.
- **Album, artist and playlist pages:** two columns. Left (290dp, stays in place while the list scrolls): cover or mosaic beside the title, artist chip and details, then Play / Shuffle (and the heart); for an artist, the photo banner (240dp) with the name and the buttons. Right: the songs (and the artist's albums).
- **Now playing:** the record on the left, sized to the height; title, artist, seek bar, controls (play 68dp) and the bottom row on the right.
- **Lyrics:** a left column with the record (132dp, tap to return), title, seek bar and controls; the lyrics fill the right side.
- **Driving mode:** as in D24 (side rail with Exit and tabs).
- **Welcome:** record, name and tagline on the left; the three promises and "Choose music folder" on the right. **Scan:** a smaller record (150dp).
- **Sheets** are centered, at most 560dp wide (instead of full width). **Dialogs** keep their size.
- **Equalizer:** switch, presets (wrapping) and bass boost on the left, the curve on the right.
- System screens follow Android (folder picker, permission dialogs, notification, lock screen) and are shown adapted in the mockup.
- Rotating keeps the state: the current screen and its scroll, open sheets and dialogs, the lyrics position, playback and the driving mode tab.

## Consequences

- D24 is refined: landscape is no longer special to driving mode.
- Compose: choose layouts by window size (`WindowSizeClass`: compact height → rail and two-pane layouts), use `NavigationRail` for the tabs, and keep state across configuration changes (ViewModels, `rememberSaveable`). The activity declares no `screenOrientation`.
- QA covers every screen in both orientations, rotating in the middle of flows (sheets open, dialogs open, lyrics scrolled, driving mode).
- The mockup shows it with "Rotate phone (portrait / landscape)" in the panel's Simulate section; on a real phone the mockup follows the phone's orientation.
- Tablets and foldables (expanded width) are not designed yet; they get these landscape layouts until a decision says otherwise.
