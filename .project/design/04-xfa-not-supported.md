# Design Decision: XFA Forms Not Supported

**Created:** 2026-02-15
**Status:** Decided — no implementation required

---

## Decision

XFA (XML Forms Architecture) PDF forms are explicitly out of scope for this project. The existing `NoFormError` message already states that XFA is not supported, which is sufficient handling. No additional detection logic is needed.

---

## What Is XFA?

XFA is a proprietary Adobe XML specification for PDF forms, originally developed by JetForm and acquired by Adobe in the early 2000s. Unlike AcroForms — which store field data within the standard PDF page structure — XFA replaces the PDF content model entirely: the PDF file becomes a shell around XML documents that define the form's layout, data, configuration, and scripting.

### Key Facts

| Aspect | Detail |
|---|---|
| **Origin** | JetForm (later Accelio), acquired by Adobe. Introduced in PDF 1.5 (Acrobat 6, ~2003). |
| **Standardisation** | Never standardised as an ISO standard. Referenced as an optional external spec in PDF 1.7 (ISO 32000-1). The ISO committee asked Adobe to submit it for standardisation in 2011; Adobe never did. |
| **Current status** | Deprecated in PDF 2.0 (ISO 32000-2, published 2017). Removed from the PDF specification. |
| **Creation tooling** | Adobe LiveCycle Designer — core support ended March 2018. Successor (Adobe Experience Manager Forms) converts XFA to HTML5, not PDF. |
| **Viewer support** | Only Adobe Acrobat on desktop. Chrome, Edge, Firefox, macOS Preview, and most third-party viewers either fail or render incorrectly. |
| **Prevalence** | Legacy government forms (US, UK, Australia). No new XFA development. Organisations are actively migrating to AcroForms or HTML. |
| **Specification size** | 1,500+ pages, 10 revisions. |
| **Incompatibilities** | Cannot be used with PDF/A (archival), PDF/UA (accessibility), PDF/E, PDF/X, or PDF/VT. |

### Why XFA Had Value

XFA addressed genuine limitations of AcroForms: dynamic layouts that adapt to data (sections appear/disappear based on answers), XML data binding to external sources, richer scripting (FormCalc + JavaScript), locale-aware formatting, barcode generation, and web service connectivity. For complex enterprise data capture — multi-page insurance applications, government benefit forms — it was more capable than AcroForms.

---

## Why We Do Not Support It

1. **Officially deprecated.** Removed from the PDF 2.0 standard. No future development from Adobe or the standards body.
2. **No viable library.** pdf-lib cannot read or write XFA. Libraries that can (Apryse/PDFTron, iText) are commercial, expensive, and heavy — incompatible with our single-lightweight-dependency architecture.
3. **Shrinking user base.** Government agencies that still use XFA are actively converting away from it. Building XFA support targets a declining audience.
4. **Disproportionate complexity.** A 1,500-page proprietary spec with dynamic rendering and XML data binding versus AcroForms' straightforward field name/value model. The implementation effort would exceed the entire rest of the project.

---

## Current Handling

When a user loads an XFA-only PDF, pdf-lib parses the PDF container successfully but finds no AcroForm fields. The engine throws `NoFormError` with the message:

> *"This PDF does not contain any form fields (AcroForm). XFA forms are not supported."*

This is adequate — the message names the technology and states it is unsupported.

For hybrid PDFs (XFA + AcroForm compatibility layer), pdf-lib finds and processes the AcroForm fields normally. This is the correct behaviour — the AcroForm layer in these hybrids is often functional, and rejecting it would unnecessarily block users whose PDFs would otherwise work.

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-02-15 | Initial research and change request |
| 1.1 | 2026-02-15 | Reclassified as design decision record; implementation deemed unnecessary |
