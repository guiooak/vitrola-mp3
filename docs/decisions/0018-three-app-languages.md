# D18 · Three languages: English (US), Portuguese (Brazil), Spanish

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D15](0015-us-english-repository.md), [D20](0020-translation-review.md)

## Context

The maintainer wants the app usable by Portuguese and Spanish speakers from the first version.

## Decision

The app ships in **three languages**: US English, Brazilian Portuguese and Spanish.
- English is the default and fallback (`values/`), with `values-pt-rBR/` and `values-es/` translations.
- The app follows the device language. Per-app language selection (Android 13+ `locales_config`) is supported so users can pick one of the three in system settings.
- The repository rule (D15) still applies: code, docs and the source strings stay in English; the translations live only in the translation review file and the generated Android string resources (D20).
- No text is hardcoded in the UI; every string, plural and content description goes through resources.

## Consequences

- Every translation must be approved by the maintainer before it ships (D20).
