# 08 · Open questions

Ask the maintainer before deciding these. Record the answer as a decision record in `docs/decisions/` and update this file.

| # | Question | Context / current assumption |
|---|---|---|
| Q4 | **Play-count rule** for "Most played". | Proposed: count after ≥ 50% or ≥ 30 s. |
| Q5 | **Drag to reorder the queue** in v1? | Shown as a handle in the mockup but not implemented there. Proposed P1. |
| Q6 | **Swipe down to close "Now playing"** and other gestures. | Not in the mockup; proposed as a natural Android behavior. |
| Q7 | **Android project layout** in the repository. | Proposed: Gradle project at the repository root with an `:app` module, `design/` untouched. |
| Q8 | **CI for the app** (lint, tests, debug build on push). | Optional; would be a new workflow next to `pages.yml`. Includes how test builds reach the maintainer — proposed: CI pre-releases signed with a shared debug key kept as a GitHub secret (plan 001, Phase 0). |
| Q9 | **Signing and release process** (keystore location, Play App Signing, versioning scheme). | D1 requires a backed-up key; nothing else decided. Never commit keys. |
| Q10 | **Minimum feature set for the first build the maintainer installs.** | Suggested order: SAF + scan + library browsing → playback service + mini player/Now playing → queue/shuffle/repeat → favorites/playlists → search → settings, timer, resume → images and polish. |
| Q11 | **Who reviews the Spanish strings, and which Spanish?** | D20 requires the maintainer to approve every string; the maintainer is a native Brazilian Portuguese speaker. Undecided: reviewer (maintainer or a trusted Spanish speaker) and variant (neutral Latin American is the usual default; tú vs. usted; "tocadiscos" vs. "tornamesa"). Until answered, Spanish stays disabled. |

## Resolved

| # | Question | Answer |
|---|---|---|
| Q1 | Is the HTML mockup formally approved? | **Yes** (D17, 2026-10-25). |
| Q2 | UI language(s) at launch | **US English, Brazilian Portuguese and Spanish** (D18). |
| Q2b | Translation process | **Maintainer reviews and approves every pt-BR/es string via `i18n/translations.csv`; a language ships only when fully approved; no automatic translation** (D20). |
| Q12 | Lyrics | **`.lrc` next to the song with the same name (synced), else `.txt` (plain, no auto-scroll), else lyrics embedded in the audio file; offline only** (D21, 2026-10-30). |
| Q13 | Equalizer | **10 fixed bands via `DynamicsProcessing`, hidden on Android 8; Settings + Now playing; global; presets, bass boost, on/off** (D23, 2026-10-30). |
| Q14 | Driving mode | **Manual + automatic for a chosen car (Nearby devices permission); Now playing + Music tiles; screen on; landscape** (D24, 2026-10-30). |
| Q15 | Spinning record and label | **A global switch keeps every record still (D25); the label shows the album image, else the artist photo, else the generated cover, resting upright (D26)** (2026-10-30). |
| Q16 | Touching the record and the tonearm | **Hold = music stops, turn = speed 0.1–3× with pitch, backwards = hold; the tonearm rests only when playback stops and waits for the user, always animated** (D27, 2026-10-30). |
| Q17 | Landscape | **Every screen adapts; navigation rail, two-pane layouts, state kept on rotation** (D28, 2026-10-30). |
| Q18 | Transitions between songs | **Fade out, then fade in (no overlap), global switch with a 1–12 s length; no fade for manual skips or continuous albums** (D29, 2026-10-30). |
| Q19 | Dialog buttons | **Every dialog closes with an X in the corner; no Cancel buttons** (D30, 2026-10-30). |
| Q3 | Image file names | **`folder.(jpg|jpeg|png)` in any case, else the folder's only image** (D19). |

## Explicitly out of scope for now

The same list as "Later" in [02-product-requirements.md §15](02-product-requirements.md), plus what is out of scope:

- **Later (ask before building):** Android Auto, home-screen widget, crossfade (overlapping songs; D29 fades out, then in), per-output equalizer settings, "side A / side B", vinyl crackle effect, reverse scratch and speeds below 0.1× (D27), Wear OS, languages beyond the three in D18.
- **Out of scope:** downloading lyrics from the internet (D21 is offline only), Spotify integration (its APIs cannot play audio inside this app), cloud/streaming features, accounts, analytics, ads.
