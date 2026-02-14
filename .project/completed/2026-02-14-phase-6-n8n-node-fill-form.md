# Phase 6 — n8n Node (Fill Form)

**Completed:** 2026-02-14

## Summary

Implemented the Fill Form operation in the `PdfFormFiller` n8n node. This completes the n8n node layer — both operations (Discover Fields and Fill Form) are now fully functional. The Fill Form handler supports both static (fixedCollection UI) and dynamic (JSON from input) mapping sources, configurable output binary property and filename, and engine options (warnOnMissingValues, defaultDateFormat).

## Deliverables

### Fill Form Operation Handler

Added to `nodes/PdfFormFiller/PdfFormFiller.node.ts`:

**Mapping resolution:**
- **Static mode**: Reads from fixedCollection parameter `fieldMappings.entries[]`. Each entry has `dataKey`, `pdfField`, and optional `dateFormat`. Empty dateFormat strings are normalised to `undefined`.
- **Dynamic mode**: Reads from `items[itemIndex].json[dynamicMappingProperty]`. Validates the property is an array; throws `NodeOperationError` with helpful description if not.

**Fill pipeline:**
1. Read engine options (warnOnMissingValues, defaultDateFormat) from node parameters
2. Resolve mapping from static or dynamic source
3. Use item JSON as the data payload
4. Create PdfLibAdapter + PdfFormFillerEngine with options
5. Call `engine.fillForm(pdfBytes, mapping, data)`
6. Convert result bytes to Buffer → `this.helpers.prepareBinaryData()` with configurable filename and `application/pdf` MIME type
7. Return JSON summary (status, counts, warnings, fileName) + binary (filled PDF on configurable output property)

**Error handling:**
- `PdfLoadError` → `NodeOperationError` with "Check that the input is a valid AcroForm PDF"
- `NoFormError` → `NodeOperationError` with "Only AcroForm PDFs are supported"
- `InvalidMappingError` → `NodeOperationError` with "Check that the field mapping is correctly configured"
- `continueOnFail()` → returns `{ error: message }` JSON instead of throwing

**JSON output schema (per architecture doc section 4.2):**
```json
{
  "status": "success | partial | error",
  "fieldsFilled": 42,
  "fieldsMissing": 3,
  "fieldsSkipped": 0,
  "fieldsErrored": 0,
  "warnings": [],
  "fileName": "filled-form.pdf"
}
```

### Import Changes

Added `InvalidMappingError` to error imports and `FieldMappingEntry` type import.

## Verification

- `tsc --noEmit`: Zero type errors
- `npm run build`: Successful — all artifacts in dist
- `npx jest`: 128 tests passing
- Coverage unchanged (no new test files in this phase — node layer tested via integration in Phase 7)

## Checklist

- [x] Fill Form operation handler implemented
- [x] Static mapping mode (fixedCollection → FieldMappingEntry[])
- [x] Dynamic mapping mode (JSON property → FieldMappingEntry[])
- [x] Output: filled PDF binary + JSON summary
- [x] Configurable output binary property and filename
- [x] warnOnMissingValues toggle
- [x] defaultDateFormat option
- [x] InvalidMappingError → NodeOperationError mapping
- [x] Type check passes
- [x] Build succeeds
- [x] All 128 tests pass
- [ ] Manual test in n8n dev mode (deferred — requires n8n runtime)

## Notes

- The node layer is intentionally thin — all business logic lives in the engine. The node only handles parameter extraction, mapping resolution, binary I/O, and error translation.
- No new unit tests were added in this phase. The node's execute function depends on n8n's `IExecuteFunctions` context, which requires mocking the entire n8n runtime. Integration-level testing of the full flow will be done in Phase 7.
