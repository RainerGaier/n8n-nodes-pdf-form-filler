# Phase 2 — ValueCoercer

**Completed:** 2026-02-14

## Summary

Implemented the ValueCoercer class with full type coercion logic for all supported PDF field types, including a built-in lightweight date formatter with no external dependencies.

## Deliverables

### ValueCoercer (`src/engine/ValueCoercer.ts`)

Static `coerce()` method that converts raw JavaScript values to the format expected by each PDF field type:

- **Text fields:** Pass-through via `String(value)`. ISO 8601 dates formatted when `dateFormat` is specified.
- **Checkboxes:** Coerces `true`/`false`, `"yes"`/`"no"`, `"1"`/`"0"`, `1`/`0` to boolean checked/unchecked state. Non-boolean values produce a warning.
- **Radio/Dropdown/OptionList:** Case-insensitive matching against available options, returning the original-case option from the PDF. Unmatched values produce a warning.
- **Null/undefined:** Treated as missing (returns `success: false`).
- **Unsupported types** (signature, button, unknown): Warning with skip.

### Date Formatting (built-in, no external dependency)

Lightweight formatter supporting 6 tokens: `DD`, `D`, `MM`, `M`, `YYYY`, `YY`. Handles ISO 8601 dates (`YYYY-MM-DD` and `YYYY-MM-DDTHH:mm:ss...`). Only triggered when `dateFormat` option is set — otherwise ISO date strings pass through as plain text.

### Tests (`src/engine/__tests__/ValueCoercer.test.ts`)

51 unit tests covering all coercion paths:
- 7 text field tests (string, number, boolean, empty, ISO passthrough)
- 11 date formatting tests (DD/MM/YYYY, MM/DD/YYYY, YY, D/M, dot/dash separators, datetime, non-ISO passthrough)
- 14 checkbox tests (boolean, string variants, number 0/1, case-insensitivity, invalid values)
- 7 dropdown tests (exact match, case-insensitive, no match, empty options, number stringify)
- 3 radio tests (match, case-insensitive, no match)
- 2 optionList tests
- 4 null/undefined tests
- 3 unsupported type tests

### Coverage

| Metric | ValueCoercer | Engine (combined) |
|---|---|---|
| Statements | 96.36% | 96.92% |
| Branches | 90% | 91.66% |
| Functions | 100% | 100% |
| Lines | 96.07% | 96.72% |

Uncovered lines (156, 167) are defensive branches in the private `formatDate` method that are unreachable via the public API (the ISO regex guard prevents malformed dates from reaching them).

## Checklist

- [x] `src/engine/ValueCoercer.ts` — Implementation
- [x] `src/engine/__tests__/ValueCoercer.test.ts` — Unit tests (51 tests)
- [x] Date formatting logic (built-in, no external dependency)
- [x] All tests pass (77 total across both engine modules)
