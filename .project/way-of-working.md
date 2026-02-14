# Way of Working

**Project:** n8n PDF Form Filler Node
**Last updated:** 2026-02-14

---

## 1. Purpose

This document defines the working practices, coding standards, and preferences for this project. It applies to all contributors — human and AI agents (including Claude Code).

**If in doubt, consult this document. If this document doesn't cover it, ask.**

---

## 2. Coding Standards

### 2.1 Language & Style

- **Language:** TypeScript (strict mode enabled).
- **Target:** ES2022, CommonJS modules (required by n8n).
- **Formatting:** Prettier (project config in `.prettierrc.js`). Run `npm run lint:fix` before committing.
- **Linting:** ESLint with `@n8n/node-cli` rules. Zero warnings policy — fix all warnings, don't suppress them.
- **Semicolons:** Required.
- **Quotes:** Single quotes for strings. Double quotes only in JSX or when the string contains single quotes.
- **Trailing commas:** ES5 style (in arrays and objects, not in function parameters).
- **Indentation:** Tabs (n8n convention) in node files. Two spaces in `src/` and `test/` files. Follow whatever the project Prettier config dictates.

### 2.2 Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files (classes) | PascalCase | `PdfFormFillerEngine.ts` |
| Files (utilities) | camelCase | `createTestPdf.ts` |
| Files (tests) | Match source + `.test.ts` | `MappingResolver.test.ts` |
| Classes | PascalCase | `PdfFormFillerEngine` |
| Interfaces | PascalCase, prefixed with `I` only for adapter interfaces | `IPdfAdapter`, `FieldInfo` |
| Types | PascalCase | `PdfFieldType` |
| Functions | camelCase | `resolveMapping()` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_DATE_FORMAT` |
| Variables | camelCase | `fieldMappings` |
| Test descriptions | Sentence case, describe behaviour | `"should resolve nested dot-notation paths"` |

### 2.3 Code Organisation Rules

1. **One class per file.** The filename matches the class name.
2. **Barrel exports** in `src/types/index.ts` — all types are importable from `'../types'`.
3. **No circular imports.** The dependency direction is: `nodes/ → src/engine/ → src/adapter/`. Never the reverse.
4. **No n8n imports in `src/`** — the `src/` directory must have zero dependency on `n8n-workflow` or any n8n package. Only `nodes/` may import n8n types.
5. **No `any` types** unless absolutely unavoidable (and then commented with why).
6. **No `console.log` in production code.** Use structured warnings in the `FillFormResult` instead.
7. **All public methods must have JSDoc comments** — at minimum a one-line description and `@param` / `@returns` tags.

### 2.4 Error Handling Rules

1. **Throw typed errors** — use custom classes from `src/errors/`, not bare `Error`.
2. **Never swallow errors silently.** If you catch, either re-throw, log to warnings, or convert to a typed error.
3. **Per-field errors are warnings, not exceptions.** The engine must continue filling other fields even if one fails.
4. **Structural errors are exceptions.** Bad PDF, bad mapping schema → throw and abort.
5. **All error messages must be user-readable.** No stack traces in user-facing messages. Include: what went wrong, which field (if applicable), and what to do about it.

---

## 3. Testing Standards

### 3.1 General Rules

- **Write tests first or alongside code.** Never commit a module without corresponding tests.
- **Minimum 80% coverage** on branches, functions, lines, and statements.
- **Test behaviour, not implementation.** Test what a function does, not how it does it internally.
- **One assertion per test is preferred** but not mandatory — use judgement.
- **Test names must describe the behaviour** — use the pattern: `"should [expected behaviour] when [condition]"`.

### 3.2 Test File Organisation

| Test type | Location | Naming | Runs in |
|---|---|---|---|
| Unit tests | `src/<module>/__tests__/<File>.test.ts` | `ModuleName.test.ts` | `npm test` |
| Integration tests | `test/integration/<name>.integration.test.ts` | `*.integration.test.ts` | `npm test` |
| Manual tests | n8n dev mode (`npm run dev`) | N/A | Browser |

### 3.3 Test Fixture Rules

- **Prefer programmatic PDF fixtures** — generate test PDFs in `test/fixtures/createTestPdf.ts` using pdf-lib. This keeps the repo small and fixtures self-documenting.
- **Real-world PDFs** (like the UKPN form) go in `test/fixtures/` but should be `.gitignore`'d if they're large or proprietary. Use a setup script or instructions to obtain them.
- **Sample JSON payloads** go in `test/fixtures/sample-data.json`.
- **Never hardcode file paths** in tests. Use `path.join(__dirname, '..', 'fixtures', 'file.pdf')`.

### 3.4 Mocking Rules

- **Mock the adapter in engine tests** — the engine should be testable without loading real PDFs.
- **Don't mock pdf-lib in adapter tests** — adapter tests should exercise the real library against fixture PDFs. That's their purpose.
- **Use `jest.fn()` and typed mocks** — no `as any` casting on mocks.

---

## 4. Git & Version Control

### 4.1 Branch Strategy

- **`main`** — stable, tested, releasable at all times.
- **Feature branches** — named `feature/<short-description>` (e.g. `feature/value-coercer`).
- **Bugfix branches** — named `fix/<short-description>`.
- **All work happens on branches.** Direct commits to `main` only for trivial documentation fixes.

### 4.2 Commit Messages

Use conventional commit format:

```
<type>(<scope>): <short description>

<optional body>
```

| Type | When |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build config, dependencies, tooling |
| `style` | Formatting, whitespace (no logic change) |

Examples:
```
feat(engine): implement MappingResolver with dot-notation support
test(coercer): add checkbox coercion tests for edge cases
fix(adapter): handle empty radio group options gracefully
docs(project): update project tracking for Phase 2 completion
```

### 4.3 What to Commit

- ✅ Source code, tests, documentation, config files.
- ✅ Project governance files (`.project/` — design docs, tracking, planning).
- ❌ `dist/` folder (generated).
- ❌ `node_modules/`.
- ❌ Large binary files (PDFs over 1 MB — use `.gitignore`).
- ❌ Debug logs in `.project/logs/` (gitignored by content).
- ❌ IDE-specific settings (`.idea/`, `.vscode/` — unless shared team config).

---

## 5. Planning & Work Management

### 5.1 Work Items

Work items are Markdown files stored in `.project/planning/` (planned) or `.project/completed/` (done).

Each work item has:
- A filename: `YYYY-MM-DD-short-description.md`
- A template (see `.project/planning/README.md`)
- A clear definition of done

### 5.2 Workflow

```
Identified → .project/planning/  →  In Progress  →  .project/completed/
                                        ↑                    ↓
                                  (update tracking)    (update tracking)
```

1. When work is identified, create a file in `planning/`.
2. When starting work, note it in `project-tracking.md`.
3. When complete, move the file to `completed/` and update `project-tracking.md`.

### 5.3 Phase Completion Records

After each phase is completed, create a summary file in `.project/completed/`:

- **Filename:** `YYYY-MM-DD-phase-N-short-description.md`
- **Contents:** A summary of what was delivered, the full deliverables checklist (with tick marks), test results, and any notable decisions or deviations.
- This serves as a durable record of what was done and when, independent of the tracking document.

### 5.4 Decision Records

When a design decision is made during implementation that isn't already in the architecture doc, log it in `.project/decisions/`:

Filename: `NNNN-short-title.md` (sequential numbering)

---

## 6. Documentation Standards

### 6.1 Project Governance Docs (`.project/`)

- Written in Markdown.
- Use tables for structured data.
- Keep them up to date — stale docs are worse than no docs.
- Design docs are numbered: `01-problem-definition.md`, `02-solution-architecture.md`, etc.

### 6.2 End-User Docs (`docs/`)

- Written for n8n workflow builders who may not be developers.
- Avoid jargon — explain terms like "AcroForm" when first used.
- Include screenshots or examples where helpful.
- Every parameter in the node UI should be documented in `docs/user-guide.md`.

### 6.3 Code Comments

- **JSDoc on all public methods.** Minimum: description, `@param`, `@returns`.
- **Inline comments for "why", not "what".** The code should be readable; comments explain non-obvious reasoning.
- **No commented-out code.** Delete it; git has history.
- **TODO comments** are acceptable during development but must include a name or issue reference: `// TODO(username): handle edge case for empty arrays`.

---

## 7. Preferences & Conventions

These are project-specific preferences that apply throughout:

| Preference | Value | Rationale |
|---|---|---|
| Date format in docs | `YYYY-MM-DD` | ISO 8601 |
| Date format for PDF filling (default) | `DD/MM/YYYY` | UK convention (primary user is UK-based) |
| File encoding | UTF-8 | Standard |
| Line endings | LF | Unix-style (configure git: `git config core.autocrlf input`) |
| Maximum file length | 300 lines | Split if longer — indicates the module is doing too much |
| Maximum function length | 50 lines | Extract helper functions if longer |
| Dependency philosophy | Minimal | One runtime dep (`pdf-lib`). Resist adding more. |
| No default exports | Use named exports | Improves refactoring and discoverability |
| Imports order | 1. Node.js builtins, 2. External packages, 3. Internal modules | Consistent and readable |

---

## 8. Communication

### 8.1 Asking for Clarification

If during implementation a question arises that the design docs don't answer:

1. **Check this document** and the design docs first.
2. **Check `.project/decisions/`** for prior decisions on similar topics.
3. If still unclear, **ask the project owner** before making assumptions.
4. **Log the decision** in `.project/decisions/` once resolved.

### 8.2 Flagging Issues

If you encounter a conflict between the design docs and reality (e.g. pdf-lib doesn't behave as expected):

1. Document the issue in `.project/logs/`.
2. Propose a solution.
3. Don't silently deviate from the architecture — discuss first, then update the design doc.

---

## 9. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-02-14 | Initial way of working |
| 1.1 | 2026-02-14 | Added Section 5.3: Phase completion records in `.project/completed/` |
