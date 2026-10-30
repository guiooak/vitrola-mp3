# .ai — Handoff for the implementing agent

This folder is the starting point for any AI agent that builds the **Vitrola Mp3** Android app. The implementing agent works on a different machine than the design phase did: this repository is the only shared context. It collects every relevant decision made during discovery and design, written so you can implement without re-reading the whole design history.

## Reading order

| # | File | What it covers |
|---|---|---|
| 1 | [01-project-context.md](01-project-context.md) | What the app is, current status, repository rules and workflow. **Read first.** |
| 2 | [02-product-requirements.md](02-product-requirements.md) | Features, behaviors and acceptance criteria. |
| 3 | [03-architecture.md](03-architecture.md) | Tech stack, permissions, modules, data model, scanning, playback, search. |
| 4 | [04-design-system.md](04-design-system.md) | Tokens, Compose theme mapping, fonts, icons, components, motion, assets. |
| 5 | [05-screens.md](05-screens.md) | Navigation and a screen-by-screen spec matching the mockup. |
| 6 | [06-copy.md](06-copy.md) | UI string catalog (US English) for `strings.xml`. |
| 7 | [07-edge-cases-and-qa.md](07-edge-cases-and-qa.md) | Edge cases, error handling and a manual test plan. |
| 8 | [08-open-questions.md](08-open-questions.md) | What is still undecided and needs the maintainer. |
| 9 | [plans/](plans/README.md) | Implementation plans. **Start with [plans/001-android-app-v1.md](plans/001-android-app-v1.md).** |

## Sources of truth (in priority order)

1. **The maintainer's latest instruction** in the conversation.
2. [`CLAUDE.md`](../CLAUDE.md) — repository rules.
3. [`docs/decisions/`](../docs/decisions/README.md) — the decision records (ADRs D1–D23, one file each). This folder expands on them; if they ever disagree, the decision records win and this folder must be fixed.
4. [`design/02-style-guide/tokens.json`](../design/02-style-guide/tokens.json) — colors, type, spacing, motion.
5. The mockup ([`design/03-mockup/`](../design/03-mockup/), live at https://guiooak.github.io/vitrola-mp3/03-mockup/) — the reference for layout, flows and behavior. `mockup.js` contains the exact behavior of search, queue, favorites and the record animation.
6. Design docs: [`docs/design/`](../docs/design/).

## Keeping this folder current

When you make a new decision during implementation:
- add a decision record to `docs/decisions/` from `template.md` (next ID) and a row to its index,
- update the matching file here,
- commit and push to `main` in English.
