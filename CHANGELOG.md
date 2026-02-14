# Changelog

All notable changes to the PDF Form Filler node will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-02-14

Initial release.

### Added

- **Discover Fields** operation — extract all form field metadata (name, type, options, current value, read-only status) from AcroForm PDFs
- **Fill Form** operation — write values into text fields, checkboxes, radio groups, and dropdowns
- **Static mapping** — define field mappings in the node UI using a fixedCollection
- **Dynamic mapping** — read field mappings from a JSON property on the input item
- **Date formatting** — automatic ISO date detection with configurable format tokens (DD, D, MM, M, YYYY, YY)
- **Dot-notation data keys** — access nested JSON values (e.g. `applicant.address.postcode`)
- **Execution hints** — warnings surfaced in the n8n UI output pane for missing values and field errors
- **Structured logging** — debug, info, and warn messages via n8n's server-side logger
- **Continue on Fail** support — errors returned as JSON items instead of stopping the workflow
- Three-layer architecture: Node (n8n wrapper) → Engine (pure TS) → Adapter (pdf-lib)
- 156 tests (unit + integration) with >80% coverage across all metrics
- Example workflows in `test/n8n/` for Discover Fields, static fill, and dynamic fill
- Manual test script (`npm run test:manual`) for generating filled PDFs
- Documentation: user guide, field mapping guide, deployment guide, operations guide
