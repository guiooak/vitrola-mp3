# D15 · Everything in the repository is in US English

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D18](0018-three-app-languages.md), [D20](0020-translation-review.md)

## Context

The maintainer talks in Brazilian Portuguese, but wants the repository readable by anyone and consistent.

## Decision

All documentation (including these decision records), code (identifiers, comments, file names, design tokens), user-facing text in the design pages and the mockup, and commit messages are written in US English, even when the conversation with the maintainer happens in Brazilian Portuguese. The rule lives in [`CLAUDE.md`](../../CLAUDE.md).
- Proper names and real titles (artists, albums, songs) are not translated.
- The app's UI copy is written in English first; the shipped languages are defined in D18, and their translations follow D20.

## Consequences

- Requests made in Portuguese are translated before anything is written to the repository.
