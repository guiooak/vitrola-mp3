# D2 · Name and application ID

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D1](0001-personal-use-play-store-ready.md)

## Context

The app needs a name and a final package name (see D1). Android does not allow hyphens in package names.

## Decision

- Name: **Vitrola Mp3** ("vitrola" is Brazilian Portuguese for record player; the name is not translated).
- Package (`applicationId`): **`com.guioak.vitrolamp3`**. It could not be `vitrola-mp3` because of the hyphen.

## Consequences

- The application ID never changes once the app is installed or published.
