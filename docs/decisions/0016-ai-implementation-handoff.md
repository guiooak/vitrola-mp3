# D16 · Implementation handoff in `.ai/`

- **Status:** Accepted
- **Date:** 2026-10-25
- **Related:** [D22](0022-decision-records.md)

## Context

The Android app will be implemented by another AI agent, on another machine, with no access to the design conversations.

## Decision

Every relevant decision, requirement and spec for that work is consolidated in [`.ai/`](../../.ai/README.md) (context, product requirements, architecture, design system, screens, UI copy, edge cases/QA, open questions and implementation plans).

## Consequences

- The decision records in `docs/decisions/` stay the source of truth: new decisions are recorded there first and `.ai/` is updated to match in the same commit (see D22).
