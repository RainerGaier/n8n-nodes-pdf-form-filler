# 03 — Field Matching and Mapping

## Overview

The PDF Form Filler uses **exact string matching** on PDF field names. There is no fuzzy matching, case-insensitive lookup, or pattern matching.

## How it works

A field mapping entry has two sides:

| Side | Property | Example | Purpose |
|------|----------|---------|---------|
| Data | `dataKey` | `applicantFirstName` | Dot-notation path into the input JSON payload |
| PDF | `pdfField` | `A1-First name` | Exact field name inside the PDF form |

The mapping bridges between arbitrarily named JSON properties and the actual field names embedded in the PDF.

## Matching flow

```
Input JSON                    Field Mapping                   PDF Form
──────────                    ─────────────                   ────────

item.json                     dataKey → pdfField              AcroForm fields
  .applicantFirstName  ──→  "applicantFirstName" → "A1-First name"  ──→  form.getTextField("A1-First name")
  .applicantLastName   ──→  "applicantLastName"  → "A1-Last name"   ──→  form.getTextField("A1-Last name")
  .street              ──→  "street"             → "A1-Street"      ──→  form.getTextField("A1-Street")
```

### Step by step

1. **Resolve the data value**: The `dataKey` is looked up in `item.json` using dot-notation (e.g. `applicant.firstName` traverses nested objects).
2. **Find the PDF field**: The `pdfField` string is passed to pdf-lib's `form.getField(name)` which performs an exact, case-sensitive lookup against the field names stored in the PDF's AcroForm dictionary.
3. **Detect field type**: The adapter inspects the matched field to determine its type (text, checkbox, radio, dropdown).
4. **Coerce and set**: The value is coerced to the appropriate type (string for text, boolean for checkbox, option string for radio/dropdown) and written to the field.

## Key characteristics

- **Case-sensitive**: `"A1-First name"` and `"a1-first name"` are different fields.
- **Whitespace-sensitive**: Trailing spaces matter (e.g. the UKPN PDF has `"F-Postcode "` with a trailing space).
- **Character-exact**: Hyphens, dots, and special characters must match precisely.
- **No wildcards**: You cannot use `*` or `?` patterns.

## Discovering field names

Use the **Discover Fields** operation to extract the exact field names from a PDF. This returns every field with its:

- `name` — the exact string to use in `pdfField`
- `type` — text, checkbox, radio, dropdown, optionList, signature, button, unknown
- `options` — available choices for radio/dropdown fields
- `currentValue` — any pre-filled value
- `readOnly` — whether the field is marked read-only

## Error handling

| Scenario | Behaviour |
|----------|-----------|
| `pdfField` doesn't match any field in the PDF | Warning emitted, field counted as `fieldsErrored` |
| `dataKey` not found in `item.json` | Warning emitted (if `warnOnMissingValues` enabled), field counted as `fieldsMissing` |
| Value type incompatible with field type | Warning emitted, field counted as `fieldsErrored` |
| Radio/dropdown value not in available options | pdf-lib may throw; caught and reported as warning |

## Example mapping configurations

### Static mapping (defined in node UI)

```json
{
  "dataKey": "applicantFirstName",
  "pdfField": "A1-First name"
}
```

### With date formatting

```json
{
  "dataKey": "startDate",
  "pdfField": "J-Start date",
  "dateFormat": "DD/MM/YYYY"
}
```

### Dynamic mapping (from input JSON)

The mapping array is read from a JSON property on the input item, allowing programmatic generation of mappings at runtime.
