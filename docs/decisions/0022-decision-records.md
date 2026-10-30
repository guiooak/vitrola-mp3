# D22 · Decisions are recorded as ADR files

- **Status:** Accepted
- **Date:** 2026-10-30
- **Related:** [D15](0015-us-english-repository.md), [D16](0016-ai-implementation-handoff.md)

## Context

Decisions D1–D21 lived in a single file, `docs/decisions.md`, which kept growing and made each decision's history hard to follow. The maintainer asked for a decisions directory with one file per decision, versioned in the repository.

## Decision

- Every decision is an Architecture Decision Record (ADR) in [`docs/decisions/`](README.md), one file per decision, named `NNNN-short-title.md` (four digits, lowercase, hyphens).
- Each record has: title with its ID, **Status**, **Date** (and **Revised** when it changed), **Related** decisions, then the sections **Context**, **Decision**, **Consequences**, and **Alternatives considered** when there were any. Use [`template.md`](template.md).
- IDs continue the existing sequence: **D1, D2, …** (file `0001-…` is D1). References elsewhere in the repository keep using the short form (`D19`).
- **Status values:** Proposed, Accepted, Superseded by D*n*, Deprecated.
- Small clarifications edit the record in place and add a line to **Revised**. A reversal or a substantial change is a new record; the old one is marked "Superseded by D*n*" and keeps its text.
- The index in [`docs/decisions/README.md`](README.md) is updated in the same commit as each new or changed record, and so is `.ai/` (D16).
- Records are written in US English (D15).

## Consequences

- `docs/decisions.md` is removed; D1–D21 were moved to their own files without changing their meaning (sections were reorganized into the ADR format).
- Links to the old file in `CLAUDE.md`, `README.md`, `.ai/` and `docs/design/` point to the new directory.
