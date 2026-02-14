# n8n-nodes-pdf-form-filler

An n8n community node that fills AcroForm PDF fields with JSON data from your workflow.

## Features

- **Discover Fields** — extract all form field names, types, options, and current values from any AcroForm PDF
- **Fill Form** — write values into text fields, checkboxes, radio groups, and dropdowns
- **Static or dynamic mapping** — define field mappings in the node UI or pass them as JSON at runtime
- **Date formatting** — automatic ISO date conversion with configurable format tokens (DD/MM/YYYY, etc.)
- **Dot-notation data keys** — access nested JSON values like `applicant.address.postcode`
- **Warnings and observability** — execution hints in the n8n UI, structured server-side logging

## Installation

### Self-hosted n8n

Install via the n8n GUI:

1. Go to **Settings → Community Nodes**
2. Enter `n8n-nodes-pdf-form-filler`
3. Click **Install**

Or install via the command line:

```bash
cd ~/.n8n
npm install n8n-nodes-pdf-form-filler
```

Restart n8n after installation. The node appears in the node panel as **PDF Form Filler**.

### n8n Cloud

Not yet available on n8n Cloud. See [docs/deployment.md](docs/deployment.md) for details.

## Quick Start

### 1. Discover your PDF's fields

Create a workflow: **Read Binary File → PDF Form Filler (Discover Fields)**

The output JSON contains an array of all fields with their exact names, types, and available options.

### 2. Build your mapping

Each mapping entry connects a key in your JSON data to a field in the PDF:

```json
{ "dataKey": "firstName", "pdfField": "A1-First name" }
```

Field names must match exactly (case-sensitive, whitespace-sensitive). Use the Discover Fields output to get the correct names.

### 3. Fill the form

Create a workflow: **Read Binary File → Set Data → PDF Form Filler (Fill Form)**

The node reads the PDF binary and your JSON data from the same input item, applies the mapping, and outputs a filled PDF binary.

## Operations

### Discover Fields

Returns metadata for every form field in the PDF.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| PDF Binary Property | string | `data` | Binary property containing the PDF |

**Output:** JSON with `fields` array and `fieldCount`. Each field has `name`, `type`, `options`, `currentValue`, and `readOnly`.

### Fill Form

Fills PDF form fields with data from the input item.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| PDF Binary Property | string | `data` | Binary property containing the PDF |
| Mapping Source | options | `static` | `static` (UI) or `dynamic` (from input JSON) |
| Field Mappings | fixedCollection | — | Mapping entries when using static mode |
| Dynamic Mapping Property | string | `fieldMappings` | JSON property name when using dynamic mode |
| Output Binary Property | string | `data` | Binary property name for the filled PDF |
| Output File Name | string | `filled-form.pdf` | Filename for the output PDF |
| Warn on Missing Values | boolean | `true` | Emit warnings for mapped fields with no data |
| Default Date Format | string | `DD/MM/YYYY` | Format for ISO date strings |

**Output:** JSON summary (`status`, `fieldsFilled`, `fieldsMissing`, `fieldsSkipped`, `fieldsErrored`, `warnings`) plus the filled PDF as binary.

## Supported Field Types

| PDF Field Type | Input Value | Example |
|---------------|-------------|---------|
| Text | string | `"John Smith"` |
| Checkbox | boolean | `true` / `false` |
| Radio Group | string (exact option) | `"Three"` |
| Dropdown | string (exact option) | `"Single"` |

## Date Formatting

ISO date strings (e.g. `2026-06-01`) are automatically formatted using the configured date format. Supported tokens:

| Token | Output | Example |
|-------|--------|---------|
| `DD` | Day, zero-padded | `01` |
| `D` | Day, no padding | `1` |
| `MM` | Month, zero-padded | `06` |
| `M` | Month, no padding | `6` |
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |

Set a per-field format with `dateFormat` on the mapping entry, or use `Default Date Format` for all fields.

## Documentation

- [User Guide](docs/user-guide.md) — detailed usage instructions
- [Field Mapping Guide](docs/field-mapping-guide.md) — how to create and configure mappings
- [Deployment Guide](docs/deployment.md) — installation, upgrading, requirements
- [Operations Guide](docs/operations.md) — troubleshooting, error reference, logging

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests (156 tests)
npm test

# Run tests with coverage
npm test -- --coverage

# Lint
npm run lint

# Generate filled PDFs for manual verification
npm run test:manual
```

### Local n8n testing

See [docs/operations/local_testing.md](docs/operations/local_testing.md) for instructions on linking the node to a local n8n instance.

## Architecture

Three-layer design: Node → Engine → Adapter

```
n8n Node Layer        — UI, binary I/O, n8n lifecycle
Engine Layer          — mapping resolution, type coercion, orchestration (pure TS, no n8n imports)
pdf-lib Adapter       — PDF load/save, field introspection, value writing
```

## License

MIT
