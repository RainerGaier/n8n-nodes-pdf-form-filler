# Field Mapping Guide

## What is a Field Mapping?

A field mapping tells the PDF Form Filler which data values go into which PDF form fields. It bridges between your workflow data (JSON) and the PDF's internal field names.

Each mapping entry has two required properties:

```json
{
  "dataKey": "applicantFirstName",
  "pdfField": "A1-First name"
}
```

- **`dataKey`** — the path to the value in your JSON data
- **`pdfField`** — the exact field name inside the PDF form

## Creating a Mapping

### Step 1: Discover Your PDF's Fields

Run the **Discover Fields** operation on your PDF. This returns every field with its exact name, type, and available options.

Example output:

```json
{
  "name": "A1-First name",
  "type": "text",
  "currentValue": null,
  "options": null,
  "readOnly": false
}
```

Copy the `name` values exactly as they appear — these become your `pdfField` values.

### Step 2: Define Your Data Structure

Structure your workflow data as JSON with keys that make sense for your use case:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "company": "Smith Ltd",
  "startDate": "2026-06-01",
  "requiresThreePhase": true
}
```

These keys become your `dataKey` values.

### Step 3: Build the Mapping

Connect each data key to its target PDF field:

```json
[
  { "dataKey": "firstName", "pdfField": "A1-First name" },
  { "dataKey": "lastName", "pdfField": "A1-Last name" },
  { "dataKey": "company", "pdfField": "A1-Company" },
  { "dataKey": "startDate", "pdfField": "J-Start date", "dateFormat": "DD/MM/YYYY" },
  { "dataKey": "requiresThreePhase", "pdfField": "C-C" }
]
```

## Static vs Dynamic Mapping

### Static Mapping

Define mappings directly in the node's UI using the Field Mappings parameter. Each entry has a Data Key, PDF Field, and optional Date Format.

**When to use:** The PDF structure is known and fixed. You're always filling the same form with the same fields.

### Dynamic Mapping

Pass the mapping array as a JSON property on the input item. Set **Mapping Source** to `dynamic` and specify the property name (default: `fieldMappings`).

**When to use:**
- Different PDFs with different field names
- Mappings generated programmatically (e.g. from a database or API)
- The mapping needs to change based on workflow logic

Example input item for dynamic mapping:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "fieldMappings": [
    { "dataKey": "firstName", "pdfField": "A1-First name" },
    { "dataKey": "lastName", "pdfField": "A1-Last name" }
  ]
}
```

## Working with Different Field Types

### Text Fields

Pass a string value. Numbers and booleans are automatically converted to strings.

```json
{ "dataKey": "postcode", "pdfField": "A1-Postcode" }
```

Data: `{ "postcode": "SW1A 2AA" }`

### Checkboxes

Pass a boolean value. Truthy values (`true`, `1`, `"yes"`, `"true"`) check the box. Falsy values (`false`, `0`, `"no"`, `"false"`) uncheck it.

```json
{ "dataKey": "hasGeneration", "pdfField": "H generation" }
```

Data: `{ "hasGeneration": true }`

### Radio Buttons

Pass a string that exactly matches one of the radio group's options. Use Discover Fields to see the available options.

```json
{ "dataKey": "quoteType", "pdfField": "D-Type of quote" }
```

Data: `{ "quoteType": "Formal" }`

Available options (from Discover Fields): `["Budget", "Formal", "Non-contestable"]`

### Dropdowns

Pass a string that exactly matches one of the dropdown's options.

```json
{ "dataKey": "phase", "pdfField": "I-Phase 1" }
```

Data: `{ "phase": "Three" }`

Available options: `["Single", "Three"]`

## Dot-Notation Data Keys

Use dot notation to access nested objects in your JSON data:

```json
{ "dataKey": "applicant.address.postcode", "pdfField": "A1-Postcode" }
```

Data:

```json
{
  "applicant": {
    "address": {
      "postcode": "SW1A 2AA"
    }
  }
}
```

Array indices are also supported:

```json
{ "dataKey": "contacts.0.name", "pdfField": "A1-First name" }
```

## Date Formatting

ISO date strings (e.g. `2026-06-01`, `2026-06-01T12:00:00Z`) are automatically detected and formatted using the configured date format.

### Format Tokens

| Token | Output | Example |
|-------|--------|---------|
| `DD` | Day, zero-padded | `01` |
| `D` | Day, no padding | `1` |
| `MM` | Month, zero-padded | `06` |
| `M` | Month, no padding | `6` |
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |

### Per-Field Override

Add a `dateFormat` property to a mapping entry to override the default format for that field:

```json
{ "dataKey": "startDate", "pdfField": "J-Start date", "dateFormat": "DD/MM/YYYY" }
```

### Default Format

Set the **Default Date Format** parameter on the node (default: `DD/MM/YYYY`). This applies to all date fields that don't have a per-field override.

### Non-Date Strings

If a string looks like an ISO date but you want it written as-is, don't set a date format. Strings that don't match the ISO pattern (`YYYY-MM-DD`) are always written verbatim.

## Tips and Best Practices

1. **Always run Discover Fields first.** Field names in PDFs are often inconsistent — some have trailing spaces, unusual punctuation, or non-obvious naming. Don't guess.

2. **Watch for trailing spaces.** Some PDF authoring tools add trailing spaces to field names (e.g. `"F-Postcode "` instead of `"F-Postcode"`). Copy names directly from the Discover Fields output.

3. **Check radio/dropdown options.** The value you pass must exactly match one of the available options. Use Discover Fields to see what's available.

4. **Use `warnOnMissingValues: true`.** This surfaces warnings in the n8n UI when mapped fields have no corresponding data, helping you catch mapping mistakes early.

5. **Start with static mapping.** Get your mapping working with a fixed set of test data before switching to dynamic mapping for production.

6. **Keep your mapping and data separate.** In dynamic mode, the mapping array and the data values can coexist on the same input item — the engine reads `dataKey` paths from the item's JSON and ignores the `fieldMappings` property itself.
