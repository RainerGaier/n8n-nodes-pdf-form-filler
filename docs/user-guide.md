# User Guide — PDF Form Filler Node

## Overview

The PDF Form Filler is an n8n community node that fills AcroForm PDF fields with data from your workflow. It supports text fields, checkboxes, radio groups, and dropdowns.

**Use it when you need to:**
- Auto-fill PDF application forms, invoices, or reports from workflow data
- Discover what fields a PDF form contains before building a mapping
- Generate pre-filled PDFs for downstream steps (email, upload, archive)

**Limitations:**
- Only AcroForm PDFs are supported. XFA forms (common in older Adobe LiveCycle forms) are not.
- Signature fields cannot be filled programmatically.
- The node does not flatten the form — filled fields remain editable.

## Operations

### Discover Fields

Extracts metadata for every form field in a PDF. Use this as the first step when working with a new PDF to learn the exact field names.

**Input:** A binary item containing a PDF file.

**Output:** A JSON item with:

```json
{
  "fields": [
    {
      "name": "A1-First name",
      "type": "text",
      "currentValue": null,
      "options": null,
      "readOnly": false
    },
    {
      "name": "C-C Phase",
      "type": "radio",
      "currentValue": null,
      "options": ["Single", "Three"],
      "readOnly": false
    }
  ],
  "fieldCount": 246
}
```

The original PDF binary is passed through alongside the JSON output.

**Field types returned:** `text`, `checkbox`, `radio`, `dropdown`, `optionList`, `signature`, `button`, `unknown`.

### Fill Form

Fills PDF form fields with values from the input item's JSON data, guided by a field mapping.

**Input:** A single item containing:
1. A binary property with the PDF file (default: `data`)
2. JSON properties with the values to fill in

**Output:** A JSON summary plus the filled PDF as a binary attachment.

```json
{
  "status": "success",
  "fieldsFilled": 22,
  "fieldsMissing": 0,
  "fieldsSkipped": 0,
  "fieldsErrored": 0,
  "warnings": [],
  "fileName": "filled-form.pdf"
}
```

**Status values:**
- `success` — all mapped fields were filled without errors
- `partial` — some fields were filled but there were warnings or missing values
- `error` — a critical error prevented filling

## Parameters

### Common

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Operation | options | `discoverFields` | Which operation to perform |
| PDF Binary Property | string | `data` | Name of the binary property containing the PDF |

### Fill Form

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Mapping Source | options | `static` | Where to read the field mapping from |
| Field Mappings | fixedCollection | — | Mapping entries (static mode only) |
| Dynamic Mapping Property | string | `fieldMappings` | JSON property containing the mapping array (dynamic mode only) |
| Output Binary Property | string | `data` | Binary property name for the filled PDF |
| Output File Name | string | `filled-form.pdf` | Filename for the output |
| Warn on Missing Values | boolean | `true` | Emit warnings when mapped fields have no data |
| Default Date Format | string | `DD/MM/YYYY` | Format for auto-detected ISO date strings |

### Field Mapping Entry

Each entry in the field mapping has:

| Property | Required | Description |
|----------|----------|-------------|
| `dataKey` | Yes | Dot-notation path into the input JSON (e.g. `applicant.firstName`) |
| `pdfField` | Yes | Exact PDF form field name (e.g. `A1-First name`) |
| `dateFormat` | No | Per-field date format override (e.g. `MM/DD/YYYY`) |

## Examples

Three example workflows are included in `test/n8n/`:

| File | Description |
|------|-------------|
| `01-discover-fields.json` | Read a PDF and list all form fields |
| `02-fill-form-static.json` | Fill a PDF using static mappings defined in the node |
| `03-fill-ukpn-dynamic.json` | Fill a real UKPN connections form using dynamic mappings from a Code node |

Import these into n8n via the canvas menu (**... → Import from File**). Update the file path in the Read Binary File node to match your local system.

## Typical Workflow Pattern

```
Read Binary File → Edit Fields (add JSON data) → PDF Form Filler (Fill Form) → Send Email / Upload
```

The Edit Fields (Set) node should use **Include Other Fields = true** so the binary PDF passes through alongside the JSON data. The Fill Form node reads both the binary and the JSON from the same input item.
