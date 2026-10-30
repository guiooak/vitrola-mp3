# Decisions

Architecture Decision Records (ADRs) for Vitrola Mp3: one file per product or technical decision, with its context and consequences. The rules for this directory are in [D22](0022-decision-records.md).

## Index

| ID | Decision | Status | Date |
|---|---|---|---|
| D1 | [Goal: personal use, ready for the Play Store](0001-personal-use-play-store-ready.md) | Accepted | 2026-10-25 |
| D2 | [Name and application ID](0002-name-and-application-id.md) | Accepted | 2026-10-25 |
| D3 | [Library only from chosen folders (SAF)](0003-library-from-chosen-folders.md) | Accepted | 2026-10-25 |
| D4 | [Continuous background playback](0004-background-playback.md) | Accepted | 2026-10-25 |
| D5 | [Tech stack](0005-tech-stack.md) | Accepted | 2026-10-25 |
| D6 | [Design before code](0006-design-before-code.md) | Accepted | 2026-10-25 |
| D7 | [Logo: classic vinyl](0007-logo-classic-vinyl.md) | Accepted | 2026-10-25 |
| D8 | [Fixed brand palette, no dynamic color](0008-fixed-palette-no-dynamic-color.md) | Accepted | 2026-10-25 |
| D9 | [Design tokens as the source of truth](0009-design-tokens-source-of-truth.md) | Accepted | 2026-10-25 |
| D10 | [Commit directly to main](0010-commit-directly-to-main.md) | Accepted | 2026-10-25 |
| D11 | [App navigation structure](0011-navigation-structure.md) | Accepted | 2026-10-25 |
| D12 | [Artist photos and album covers from the folders](0012-photos-and-covers-from-folders.md) | Accepted | 2026-10-25 |
| D13 | [Favorite songs and albums](0013-favorite-songs-and-albums.md) | Accepted | 2026-10-25 |
| D14 | [Website on GitHub Pages](0014-github-pages-site.md) | Accepted | 2026-10-25 |
| D15 | [Everything in the repository is in US English](0015-us-english-repository.md) | Accepted | 2026-10-25 |
| D16 | [Implementation handoff in `.ai/`](0016-ai-implementation-handoff.md) | Accepted | 2026-10-25 |
| D17 | [HTML mockup approved](0017-html-mockup-approved.md) | Accepted | 2026-10-25 |
| D18 | [Three languages: English (US), Portuguese (Brazil), Spanish](0018-three-app-languages.md) | Accepted | 2026-10-25 |
| D19 | [Folder image rule: `folder.*`, else the only image](0019-folder-image-rule.md) | Accepted | 2026-10-26 |
| D20 | [Every translation is reviewed by the maintainer](0020-translation-review.md) | Accepted | 2026-10-26 |
| D21 | [Lyrics from a `.lrc` or `.txt` file next to each song, else from the audio file](0021-lyrics-sources.md) | Accepted | 2026-10-30 |
| D22 | [Decisions are recorded as ADR files](0022-decision-records.md) | Accepted | 2026-10-30 |
| D23 | [Equalizer with 10 fixed bands (Android DynamicsProcessing)](0023-equalizer.md) | Accepted | 2026-10-30 |
| D24 | [Driving mode](0024-driving-mode.md) | Accepted | 2026-10-30 |

## Adding a decision

1. Copy [`template.md`](template.md) to `NNNN-short-title.md` with the next number (the ID is `D` + that number, e.g. `0023-…` is D23).
2. Fill in every section in US English. Keep it short: what was decided, why, and what follows from it.
3. Add a row to the index above.
4. Update the matching files in [`.ai/`](../../.ai/README.md) in the same commit.
5. To change an accepted decision substantially, write a new record and mark the old one "Superseded by D*n*". Small clarifications edit the record in place and add a line to **Revised**.
