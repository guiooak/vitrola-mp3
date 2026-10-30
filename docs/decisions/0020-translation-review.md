# D20 · Every translation is reviewed by the maintainer

- **Status:** Accepted
- **Date:** 2026-10-26
- **Revised:** 2026-10-26: all-or-nothing languages, stale detection, validation, plural format.
- **Related:** [D15](0015-us-english-repository.md), [D18](0018-three-app-languages.md)

## Context

The app ships in three languages (D18). Machine or unreviewed translations could get the tone wrong or ship mistakes, and Android shows partly translated resource files as a mix of languages.

## Decision

No automatic or unreviewed translation ships. The maintainer reviews and approves **every** Brazilian Portuguese and Spanish string before it goes into the app.

**Review file:** `i18n/translations.csv`
- UTF-8 without BOM, comma-separated, RFC 4180 quoting (fields with commas, quotes or line breaks go in double quotes; a quote inside is doubled). First row is the header.
- Columns: `key, quantity, en, pt-BR, es, status_pt-BR, status_es, en_hash_pt-BR, en_hash_es, notes`.
- Status values: `draft` (proposed, not reviewed), `approved`, `changes` (maintainer asked for changes, see `notes`).
- **Plurals:** one row per plural quantity, same `key`, with `quantity` set to `one`, `many` or `other` (empty for plain strings). Portuguese and Spanish need all three (`many` covers numbers like 1,000,000); English uses `one` and `other`, and its cell in the `many` row repeats the `other` text as a reference only.

**Who does what**
- The implementing agent may **propose** drafts, always as `draft`. Only the maintainer sets `approved`.
- Feature work never waits for a review: until a language is fully approved, the app simply runs in English.

**Generator** (a script or Gradle task that turns the CSV into Android resources)
- **All or nothing per language.** It writes `res/values-pt-rBR/strings.xml` or `res/values-es/strings.xml` only when **every** row of that language is approved and up to date; otherwise it writes nothing for that language and removes any old file. This matters because Android picks `values-pt-rBR/` from the device language even when the language is not in `locales_config`, so a partly approved file would show a mix of Portuguese and English. `res/xml/locales_config.xml` lists exactly the languages that were written.
- **Stale detection.** When the maintainer approves a row, the generator records a short hash of the current English text in `en_hash_<lang>`. If the English text later changes, the hash no longer matches: the generator resets that status to `draft`, and the language drops out of the build until it is reviewed again. Changed keys are listed in the commit message.
- **Validation** (the build fails on any error): every key in `values/strings.xml` has rows and vice versa; placeholders (`%s`, `%d`, `%1$s`…) are the same set in every language; required plural quantities exist; the file is valid UTF-8. The generator escapes text for Android XML itself (`'`, `"`, `\`, `@` or `?` at the start, `<`, `&`), so reviewers write plain text in the CSV.

Runtime machine translation (e.g. a translation API) is never used.

## Consequences

- A language may ship later than English if its review is not finished.
- Who reviews Spanish, and which variant, is open (Q11 in `.ai/08-open-questions.md`).
