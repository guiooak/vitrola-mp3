# D6 · Design before code

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D7](0007-logo-classic-vinyl.md), [D8](0008-fixed-palette-no-dynamic-color.md), [D17](0017-html-mockup-approved.md)

## Context

The maintainer wants to see and approve how the app looks and behaves before any Android code is written.

## Decision

Work order: **logo → style guide → HTML mockup → Android app**. Each step starts only after the previous one is approved, and each one is documented in [`docs/design/`](../design/).

## Consequences

- UI that the approved mockup does not cover (for example, the lyrics view in D21) is designed in the mockup and approved before it is built.
