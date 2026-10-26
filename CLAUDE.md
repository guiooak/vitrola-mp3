# Repository rules

## Language: US English only

Everything committed to this repository must be written in **US English**:

- Documentation (`README.md`, `docs/`, `design/**/README.md`)
- Code: identifiers, comments, file and folder names, design token names
- User-facing text in the design pages and the mockup
- Commit messages

This applies even when the conversation with the maintainer happens in Brazilian Portuguese. Translate the request, write the result in English.

The only exception is proper names and real titles that are not translated (artist names, album and song titles such as "Águas de Março").

## Implementing the app

Start with [`.ai/README.md`](.ai/README.md): it is the handoff for the agent that builds the Android app (context, requirements, architecture, design system, screens, copy, QA and open questions). Keep it in sync with `docs/decisions.md`.

## Workflow

- Design comes before code: logo → style guide → HTML mockup → Android app. Each step waits for the maintainer's approval and is documented in `docs/design/`.
- Product and technical decisions are logged in `docs/decisions.md`.
- Commit and push directly to `main`. No branches or pull requests.
- The `design/` folder is published to GitHub Pages by `.github/workflows/pages.yml`.
