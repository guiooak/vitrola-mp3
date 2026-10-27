# 08 · Open questions

Ask the maintainer before deciding these. Record the answer in `docs/decisions.md` and update this file.

| # | Question | Context / current assumption |
|---|---|---|
| Q4 | **Play-count rule** for "Most played". | Proposed: count after ≥ 50% or ≥ 30 s. |
| Q5 | **Drag to reorder the queue** in v1? | Shown as a handle in the mockup but not implemented there. Proposed P1. |
| Q6 | **Swipe down to close "Now playing"** and other gestures. | Not in the mockup; proposed as a natural Android behavior. |
| Q7 | **Android project layout** in the repository. | Proposed: Gradle project at the repository root with an `:app` module, `design/` untouched. |
| Q8 | **CI for the app** (lint, tests, debug build on push). | Optional; would be a new workflow next to `pages.yml`. |
| Q9 | **Signing and release process** (keystore location, Play App Signing, versioning scheme). | D1 requires a backed-up key; nothing else decided. Never commit keys. |
| Q10 | **Minimum feature set for the first build the maintainer installs.** | Suggested order: SAF + scan + library browsing → playback service + mini player/Now playing → queue/shuffle/repeat → favorites/playlists → search → settings, timer, resume → images and polish. |
| Q11 | **Who reviews the Spanish strings, and which Spanish?** | D20 requires the maintainer to approve every string; the maintainer is a native Brazilian Portuguese speaker. Undecided: reviewer (maintainer or a trusted Spanish speaker) and variant (neutral Latin American is the usual default; tú vs. usted; "tocadiscos" vs. "tornamesa"). Until answered, Spanish stays disabled. |

## Resolved

| # | Question | Answer |
|---|---|---|
| Q1 | Is the HTML mockup formally approved? | **Yes** (D17, 2026-10-25). |
| Q2 | UI language(s) at launch | **US English, Brazilian Portuguese and Spanish** (D18). |
| Q2b | Translation process | **Maintainer reviews and approves every pt-BR/es string via `i18n/translations.csv`; a language ships only when fully approved; no automatic translation** (D20). |
| Q3 | Image file names | **`folder.(jpg|jpeg|png)` in any case, else the folder's only image** (D19). |

## Explicitly out of scope for now

Android Auto, widget, equalizer, lyrics, crossfade, Wear OS, Spotify integration (its APIs cannot play audio inside this app), cloud/streaming features, accounts, analytics, ads.
