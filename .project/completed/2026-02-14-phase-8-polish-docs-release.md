# Phase 8 — Polish, Documentation & Release Prep

**Completed:** 2026-02-14
**Phase:** 8
**Priority:** High

## Description

Complete all placeholder documentation, create a proper README, update the changelog, and review error messages for clarity.

## Deliverables

- [x] `README.md` — rewritten from planning folder template to full npm/GitHub README
- [x] `docs/user-guide.md` — operations, parameters, examples, workflow patterns
- [x] `docs/field-mapping-guide.md` — step-by-step mapping creation, field types, date formatting, tips
- [x] `docs/deployment.md` — self-hosted, Docker, Cloud status, upgrading, uninstalling
- [x] `docs/operations.md` — troubleshooting (5 common issues), error reference (6 error classes), logging
- [x] `docs/changelog.md` — v0.1.0 release entry
- [x] `CHANGELOG.md` (root) — v0.1.0 release entry (npm convention)
- [x] `docs/operations/local_testing.md` — created earlier during manual testing
- [x] `.project/design/03-matching-and-mapping.md` — created earlier during testing
- [x] Error messages reviewed and documented in operations guide
- [x] All 156 tests pass
- [x] Build succeeds
- [ ] `npm publish` — pending (requires npm account setup and Cloud deployment decision)

## Additional work completed during this phase

- Local n8n testing infrastructure set up and documented
- `updateFieldAppearances()` fix for real-world PDFs with pre-existing appearance streams
- Three test workflows created and verified in local n8n
- Cloud deployment options documented in `.project/planning/cloud-deployment-options.md`

## Notes

The `npm publish` step is deferred pending a decision on whether to bundle `pdf-lib` for n8n Cloud verification. See `.project/planning/cloud-deployment-options.md`.
