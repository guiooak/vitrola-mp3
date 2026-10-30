# D1 · Goal: personal use, ready for the Play Store

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D2](0002-name-and-application-id.md), [D5](0005-tech-stack.md)

## Context

The app is built for the maintainer's own use first, but it may be published on the Play Store later. Some choices are hard or impossible to change after a first release (the package name, the signing key), and others would block publication (old `targetSdk`, broad permissions, data collection).

## Decision

Build for personal use, but Play Store–ready from day one:
- the package name is final;
- the target Android version (`targetSdk`) is recent: the latest the Play Store requires at build time;
- the signing key is kept safely with a backup (never committed);
- the app asks for no broad permissions and collects no data.

## Consequences

- Release signing, versioning and store requirements must be planned before the first public build (open question Q9 in `.ai/08-open-questions.md`).
- Any feature that needs a broad permission or sends data off the device needs a new decision.
