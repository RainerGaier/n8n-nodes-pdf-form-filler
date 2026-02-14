# Operations Guide — Startup, Shutdown & Troubleshooting

## Startup

The PDF Form Filler node starts automatically when n8n loads. No separate startup is required.

## Shutdown

The node has no persistent processes or connections. It shuts down with n8n.

## Troubleshooting

### Common Issues

#### Filled PDF appears blank

**Symptom:** The Fill Form node reports `status: success` and `fieldsFilled > 0`, but the downloaded PDF shows empty fields.

**Cause:** n8n cached an older version of the node code. The `updateFieldAppearances()` call (which regenerates the visual layer for filled fields) was added in a later build.

**Fix:** Restart n8n to pick up the latest build. After any `npm run build`, you must restart n8n for changes to take effect.

#### File access denied

**Symptom:** `Access to the file is not allowed. Allowed paths: ~/.n8n-files`

**Cause:** n8n v2+ restricts file node access to `~/.n8n-files` by default.

**Fix:** Set the `N8N_RESTRICT_FILE_ACCESS_TO` environment variable to include your file paths:

```bash
N8N_RESTRICT_FILE_ACCESS_TO="/path/to/your/files;$HOME/.n8n-files" n8n start
```

Use semicolons to separate multiple paths.

#### Field not found warning

**Symptom:** Warning says `PDF field 'X' not found in the document`.

**Cause:** The `pdfField` value in your mapping doesn't exactly match any field name in the PDF. Field matching is case-sensitive and whitespace-sensitive.

**Fix:** Run the **Discover Fields** operation to get the exact field names. Copy them directly from the output. Watch for trailing spaces (e.g. `"F-Postcode "` with a trailing space).

#### Owner setup form hangs on first run

**Symptom:** The n8n owner account setup form spins indefinitely after clicking Next.

**Cause:** n8n tries to make outbound network calls (telemetry, license check) during setup, which may time out on restricted networks.

**Fix:** Start n8n with telemetry disabled:

```bash
N8N_DIAGNOSTICS_ENABLED=false N8N_TEMPLATES_ENABLED=false N8N_VERSION_NOTIFICATIONS_ENABLED=false n8n start
```

#### XFA form not supported

**Symptom:** `This PDF does not contain any form fields (AcroForm). XFA forms are not supported.`

**Cause:** The PDF uses XFA form technology (common in older Adobe LiveCycle Designer forms) rather than AcroForm.

**Fix:** Re-create the form as an AcroForm PDF using Adobe Acrobat, Foxit, or another PDF editor that supports AcroForm.

### Error Messages Reference

| Error | Class | Message | Resolution |
|-------|-------|---------|------------|
| Invalid PDF | `PdfLoadError` | `Failed to load PDF: <detail>` | Check that the input is a valid PDF file. It may be corrupted, password-protected, or not a PDF at all. |
| No form fields | `NoFormError` | `This PDF does not contain any form fields (AcroForm). XFA forms are not supported.` | The PDF has no fillable form fields. Use a PDF with AcroForm fields, or create form fields in the PDF. |
| Bad mapping | `InvalidMappingError` | `Invalid field mapping: <detail>` | Check that the mapping JSON is well-formed. Each entry must have `dataKey` and `pdfField` as non-empty strings. |
| Missing field | `FieldNotFoundError` | `PDF field '<name>' not found in the document` | The `pdfField` name doesn't match any field in the PDF. Run Discover Fields to get exact names. |
| Type mismatch | `CoercionError` | `Cannot coerce value for field '<name>': <detail>` | The value type doesn't match the field type. Check that booleans go to checkboxes, strings to text/radio/dropdown. |
| Wrong option | `OptionMismatchError` | `Value '<value>' not in options for '<name>'. Available: <options>` | The value for a radio or dropdown field doesn't match any available option. Use Discover Fields to see valid options. |

### Error Handling in Workflows

When the node encounters a critical error (invalid PDF, no form), it throws a `NodeOperationError` which stops the workflow.

To handle errors gracefully, enable **Continue on Fail** on the PDF Form Filler node. When enabled, errors are returned as JSON items with an `error` property instead of stopping the workflow:

```json
{ "error": "Failed to load PDF: ..." }
```

Non-critical issues (missing values, field not found for individual mappings) are reported as warnings in the output JSON and don't stop execution.

## Logging

### Execution Hints (n8n UI)

When the Fill Form operation encounters warnings (missing values, field errors), they appear as **execution hints** in the n8n output pane:

- **Orange/yellow badge** for warnings (partial success)
- **Red badge** for errors

These are visible when you click on the node's output in the workflow editor.

### Server-Side Logs

The node logs structured messages to n8n's server-side logger:

| Level | When | Example |
|-------|------|---------|
| `debug` | Operation start | `Discovering fields in PDF` / `Filling form` with item index and mapping count |
| `info` | Operation complete | `Discovered 246 form fields` / `Fill complete: 22 filled, 0 missing, 0 skipped, 0 errored` |
| `warn` | Per-field warnings | Individual warning messages for missing values or field errors |

To see these logs, check the terminal where n8n is running. Set n8n's log level to `debug` for maximum detail:

```bash
N8N_LOG_LEVEL=debug n8n start
```
