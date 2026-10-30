# D14 · Website on GitHub Pages

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** —

## Context

The design work (logo, style guide, mockup) should be viewable online without cloning the repository.

## Decision

The `design/` folder is published as a GitHub Pages site (https://guiooak.github.io/vitrola-mp3/), with a landing page at `design/index.html` that links to the logo guidelines, the style guide and the mockup. GitHub Actions (`.github/workflows/pages.yml`) deploys it automatically on every push to `main` that touches `design/`. The generator scripts (`scripts/`, `*.py`) are not published.

## Consequences

- Files in `design/` are not moved or renamed without updating the links (README, landing page, docs).
