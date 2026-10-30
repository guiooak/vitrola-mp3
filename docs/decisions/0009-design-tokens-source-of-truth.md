# D9 · Design tokens as the source of truth

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D8](0008-fixed-palette-no-dynamic-color.md)

## Context

The style guide, the mockup and the app must use the same colors, type, spacing and motion values.

## Decision

`design/02-style-guide/tokens.json` defines colors, typography, spacing and motion. The mockup uses the CSS generated from it, and the app generates its Compose theme from the same file.

## Consequences

- Values are never retyped by hand in the app; a generator (script or Gradle task) produces the Kotlin theme constants.
