# Problem Definition: PDF Form Filler Engine

**Document:** 01 — Problem Definition
**Status:** Agreed
**Date:** 2025-02-14
**Author:** [Project Owner]

---

## 1. Problem Statement

Organisations routinely need to submit PDF-based application forms to third parties — utilities, regulators, local authorities, and others. These forms are often complex (50–250+ fields), span multiple sections, and include a mix of text inputs, checkboxes, radio buttons, and dropdowns. Today this is a manual, error-prone, and time-consuming process that typically involves a person re-keying data from a source system into a PDF by hand.

There is no lightweight, reusable, automation-friendly solution that can:

1. Accept any standard PDF form template,
2. Automatically discover its fillable fields,
3. Accept structured data via an API,
4. Fill the form programmatically, and
5. Output the completed PDF for downstream storage or distribution.

This gap is especially painful within n8n-based automation workflows, where PDF form-filling is a common requirement but currently requires custom scripting per form with no standardised approach.

---

## 2. Proposed Solution

A **generic PDF form-filling engine**, packaged as a **custom n8n community node** (npm package), that:

- Accepts any AcroForm-based PDF template
- Auto-discovers all fillable fields and their types
- Accepts a JSON payload mapping field names to values
- Fills the form and returns a completed (but still editable) PDF
- Integrates natively into n8n workflows for upstream data sourcing and downstream storage

---

## 3. Scope

### 3.1 In Scope

| Capability | Detail |
|---|---|
| **Form type** | AcroForm (ISO 32000 standard PDF interactive forms) |
| **Text fields** | Fill any `/Tx` field with string values |
| **Checkboxes** | Set `/Btn` checkbox fields to checked/unchecked |
| **Radio buttons** | Select a value from a `/Btn` radio group |
| **Dropdowns** | Select a value from a `/Ch` choice field |
| **Date fields** | Accept date values (ISO 8601) and format them for text-based date fields (configurable format, default `DD/MM/YYYY`) |
| **Value transformation** | Built-in type coercion: booleans → checkbox state, date strings → formatted dates, string matching for radio/dropdown options |
| **Auto-discovery** | Analyse any uploaded PDF and return a full field inventory (name, type, options, current value) — exposed as a dedicated "Discover Fields" node operation |
| **Manual override** | Allow field mappings to be pre-configured or overridden, independent of auto-discovery |
| **Output format** | Filled PDF with form fields kept editable (not flattened) |
| **Deployment** | n8n custom community node, published as an npm package |
| **Input** | Three-logical, two-physical model: (1) PDF template binary, (2) field mapping JSON (static or dynamic), (3) data payload JSON. See Section 9 for detail. |
| **Output destination** | Filled PDF binary passed to downstream n8n nodes (for storage to S3, GDrive, email, etc.) |
| **Unmapped field handling** | PDF fields not in the mapping are silently ignored. Mapped fields with missing data values left blank; optional `warnOnUnmappedFields` toggle to surface warnings. |
| **Dry run mode** | "Discover Fields" operation returns field inventory as structured JSON without filling — for workflow debugging and field mapping |

### 3.2 Out of Scope (v1)

| Exclusion | Rationale |
|---|---|
| **XFA forms** | Legacy Adobe format, rarely used in new forms, requires fundamentally different tooling |
| **Digital signatures** | Complex PKI/certificate handling — separate concern, can be a v2 feature |
| **PDF generation from scratch** | This is a form *filler*, not a form *creator* |
| **Flattening** | User wants forms to remain editable after filling; flattening can be a future option |
| **OCR / scanned PDFs** | Only structured AcroForm PDFs with embedded form fields are supported |
| **Visual / pixel-position filling** | No coordinate-based text overlay — only named form field filling |
| **High-throughput optimisation** | Volume is low (few forms/day); no need for queuing, caching, or concurrency tuning |

---

## 4. Users & Stakeholders

| Role | Interaction |
|---|---|
| **Workflow builder** | Configures the n8n node: uploads a PDF template, maps data fields, wires it into a workflow |
| **End system / API** | Provides the structured data payload (e.g. from a CRM, database, or web form) that feeds the filler |
| **Recipient** | Receives the completed PDF (e.g. UKPN, a regulator, a client) — has no direct interaction with the engine |

---

## 5. Key Assumptions

1. **All target PDFs use AcroForm**, not XFA. The engine will detect and reject XFA forms with a clear error message.
2. **Field names in the PDF are the canonical identifiers.** The mapping JSON bridges between the caller's data model (arbitrary key names with dot-notation) and the PDF's field names. Callers never need to know or use PDF field names directly in their data — only in the mapping.
3. **Data arrives pre-validated.** The engine fills what it receives — it does not validate business rules (e.g. "postcode must be valid" or "MPAN must be 13 digits"). Input validation is the responsibility of upstream workflow nodes.
4. **One PDF template, one fill operation per invocation.** Batch filling (multiple payloads against the same template) is handled by n8n's native looping, not inside the node.
5. **The n8n environment has no special native dependencies.** The engine must work with pure JavaScript/TypeScript libraries (no `pdftk`, no Python, no native binaries).
6. **Cloud storage is handled downstream.** The node outputs a binary PDF buffer; the workflow builder wires a subsequent n8n node (S3, GDrive, etc.) to persist it.
7. **The mapping is the contract.** Only fields explicitly listed in the mapping are considered in scope for a given fill operation. The mapping defines both the data-to-field relationship and the boundary of what counts as "missing".

---

## 6. Constraints

| Constraint | Impact |
|---|---|
| **n8n node runtime** | Must run in Node.js. No native binaries, no Python, no shell commands. Pure JS/TS only. |
| **npm package** | Must be publishable as an n8n community node via npm. Must follow n8n's node development conventions. |
| **No external services** | The engine must be fully self-contained — no calls to third-party PDF APIs (Adobe, DocuSign, etc.) |
| **PDF spec compliance** | Filled PDFs must be valid, openable in Adobe Reader, browser PDF viewers, and Preview (macOS) |
| **Editable output** | Form fields must remain interactive after filling — no flattening |

---

## 7. Success Criteria

The solution is successful when:

1. A workflow builder can drop the node into an n8n workflow, point it at **any** AcroForm PDF, and get a field inventory without writing code.
2. A JSON payload with field-name-to-value mappings produces a correctly filled PDF for all supported field types (text, checkbox, radio, dropdown, date).
3. The filled PDF opens without errors in Adobe Reader, Chrome's PDF viewer, and macOS Preview.
4. The UKPN connections application form (251 fields, the reference form) can be completely filled via a single API payload.
5. The node is installable from npm into any n8n instance with zero additional configuration or dependencies.

---

## 8. Reference Material

| Item | Detail |
|---|---|
| Reference PDF | UKPN Connections Application Form (Jan 2023, v3) — 12 pages, 251 AcroForm fields |
| Field inventory | See `UKPN_Form_Fields_Inventory.xlsx` — full field listing with types, sections, and dropdown options |
| PDF spec | ISO 32000-1:2008 (AcroForm specification) |
| n8n node dev guide | https://docs.n8n.io/integrations/creating-nodes/ |

---

## 9. Input Model

The node operates on a **three-logical, two-physical input** model:

### 9.1 Logical Inputs

| Input | What it is | Source |
|---|---|---|
| **PDF Template** | The blank AcroForm PDF to be filled | Binary input from upstream n8n node (Read File, HTTP Request, S3 Get, etc.) |
| **Field Mapping** | JSON that defines which data keys map to which PDF field names | Static (configured in node settings panel) OR dynamic (passed on the incoming n8n item JSON). Dynamic takes precedence if present. |
| **Data Payload** | JSON containing the actual values to fill | Always dynamic — from the incoming n8n item's JSON properties |

### 9.2 Why Mapping Is Separate from Data

The mapping is typically **stable** — the same form uses the same mapping every time. The data changes per execution. Combining them would force the caller to re-send the full mapping structure with every payload, which is redundant and error-prone. Separating them allows the mapping to be configured once at the node level and reused across executions.

### 9.3 Field Mapping Structure

```json
{
  "fieldMappings": [
    { "dataKey": "applicant.firstName",  "pdfField": "A1-First name" },
    { "dataKey": "applicant.lastName",   "pdfField": "A1-Last name" },
    { "dataKey": "applicant.email",      "pdfField": "A1-Email" },
    { "dataKey": "isNewConnection",      "pdfField": "C-B" },
    { "dataKey": "connectionDate",       "pdfField": "L-Date 2", "dateFormat": "DD/MM/YYYY" }
  ]
}
```

- `dataKey` — dot-notation path into the data payload (supports nested objects, e.g. `applicant.firstName`)
- `pdfField` — exact PDF form field name (as discovered by the "Discover Fields" operation)
- `dateFormat` — optional per-field override for date formatting (default: `DD/MM/YYYY`)

### 9.4 Data Payload Structure

Clean, flat or nested JSON — no awareness of PDF fields required:

```json
{
  "applicant": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "isNewConnection": true,
  "connectionDate": "2025-06-15"
}
```

### 9.5 Resolution Logic

1. Engine loads the mapping (dynamic first, fall back to static node config).
2. For each entry in `fieldMappings`, resolves `dataKey` via dot-notation against the data payload.
3. If a value is found, it is type-coerced (booleans → checkbox, dates → formatted string, strings → matched against radio/dropdown options) and written to the corresponding `pdfField`.
4. If a `dataKey` is present in the mapping but has no corresponding value in the data payload, this is a **missing field**. Behaviour depends on the `warnOnUnmappedFields` toggle.
5. PDF fields that are **not referenced in any mapping entry** are silently ignored — they are out of scope for this fill operation.

### 9.6 Missing Fields Logic

| Scenario | Behaviour |
|---|---|
| PDF field exists, **is in mapping**, value present in data | Filled normally |
| PDF field exists, **is in mapping**, value **missing** from data | Left blank. Warning emitted if `warnOnUnmappedFields` is enabled. |
| PDF field exists, **not in mapping** | Silently ignored — not relevant to this fill operation |
| Mapping references a `pdfField` that **doesn't exist** in the PDF | Error — invalid mapping entry |
| Mapping references a `dataKey` path that **doesn't exist** in the data | Treated as missing value (see row 2) |

---

## 10. Design Decisions (Resolved)

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Should the node have a "dry run" mode that returns the field mapping without filling? | **Yes — include as a node operation.** The node will have two operations: "Discover Fields" (returns field inventory as JSON) and "Fill Form" (fills and returns PDF). | High value for workflow builders — lets them inspect any PDF template's fields before building the data mapping. |
| 2 | How should unmapped fields be handled? | **Skip silently, with optional warnings.** Unmapped fields are left blank. A `warnOnUnmappedFields` toggle (default: off) can be enabled to surface warnings for any fields in the template that were not present in the input payload. | Pragmatic for partial fills (e.g. only filling Section A of a 12-section form). Warnings available when debugging. |
| 3 | Should the engine handle value transformation? | **Yes — built-in type coercion.** `true`/`false` → checkbox checked/unchecked. ISO 8601 date strings → formatted date text (with configurable format, default `DD/MM/YYYY`). String values for radio/dropdown matched against available options. | Reduces burden on upstream workflow nodes. Callers send natural data types, the engine handles PDF-specific formatting. |
| 4 | Should the node support batch mode? | **No — single fill per invocation.** n8n's native looping/splitting handles batch scenarios. The node stays simple: one template + one payload = one filled PDF. | Keeps the node composable and aligned with n8n's data-flow model. No added complexity for a low-volume use case. |
| 5 | Will this be open-sourced or kept proprietary? | **Proprietary / private.** Private npm registry or direct install. Not published to the public n8n community nodes registry. | Business decision. Can be revisited later if needed. |

---

*Next step: Once this problem definition is agreed, proceed to **02 — Solution Architecture & Technical Design**.*
