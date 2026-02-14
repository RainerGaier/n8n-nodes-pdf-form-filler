# 00 — Project Setup & Assembly Guide

**Project:** n8n PDF Form Filler Node
**Package:** `n8n-nodes-pdf-form-filler`
**Last updated:** 2026-02-14

---

## 1. Purpose

This document is the single source of truth for setting up, building, and working on the project. It is written for both **human developers** and **Claude Code** — any agent or person should be able to read this file and understand how to initialise, build, test, and extend the project.

---

## 2. Repository Layout

```
n8n-nodes-pdf-form-filler/
│
├── .project/                          # 🏗  PROJECT GOVERNANCE (not shipped in npm)
│   ├── design/                        #    Architecture & design documents
│   │   ├── 01-problem-definition.md   #    Problem scope, requirements, decisions
│   │   ├── 02-solution-architecture.md#    Technical design, component architecture
│   │   └── ...                        #    Future design docs as needed
│   ├── planning/                      #    Work items planned but not started
│   │   └── README.md                  #    How to use this folder
│   ├── completed/                     #    Work items completed (moved from planning/)
│   │   └── README.md                  #    How to use this folder
│   ├── logs/                          #    Debug logs, traces, session notes
│   │   └── README.md                  #    How to use this folder
│   ├── decisions/                     #    Architecture Decision Records (ADRs)
│   │   └── README.md                  #    How to use this folder
│   ├── way-of-working.md             #    Guidelines, policies, preferences
│   └── project-tracking.md           #    Progress tracker and milestone status
│
├── docs/                              # 📖 END-USER DOCUMENTATION (shipped in npm)
│   ├── user-guide.md                  #    How to use the node in n8n
│   ├── deployment.md                  #    Installation and deployment instructions
│   ├── operations.md                  #    Startup, shutdown, troubleshooting
│   ├── field-mapping-guide.md         #    How to create and manage field mappings
│   └── changelog.md                   #    User-facing change log
│
├── nodes/                             # 🔌 N8N NODE DEFINITION
│   └── PdfFormFiller/
│       ├── PdfFormFiller.node.ts      #    n8n node class (thin wrapper)
│       ├── PdfFormFiller.node.json    #    Node metadata (codex)
│       └── pdf-form-filler.svg        #    Node icon (SVG)
│
├── src/                               # ⚙️  SOURCE CODE
│   ├── engine/                        #    Framework-free business logic
│   │   ├── PdfFormFillerEngine.ts     #    Core orchestrator
│   │   ├── MappingResolver.ts         #    Dot-notation data resolution
│   │   ├── ValueCoercer.ts            #    Type coercion logic
│   │   └── __tests__/                 #    Unit tests (co-located)
│   ├── adapter/                       #    pdf-lib integration layer
│   │   ├── PdfLibAdapter.ts           #    pdf-lib wrapper (implements IPdfAdapter)
│   │   ├── FieldTypeDetector.ts       #    Field type classification
│   │   └── __tests__/                 #    Unit tests (co-located)
│   ├── types/                         #    Shared TypeScript interfaces
│   │   ├── index.ts                   #    Barrel export
│   │   ├── FieldMapping.ts
│   │   ├── FieldInfo.ts
│   │   ├── FillResult.ts
│   │   └── CoercionResult.ts
│   └── errors/                        #    Custom error classes
│       └── PdfFormFillerError.ts
│
├── test/                              # 🧪 INTEGRATION TESTS & FIXTURES
│   ├── fixtures/
│   │   ├── createTestPdf.ts           #    Programmatic test PDF generator
│   │   └── sample-data.json           #    Sample payloads
│   └── integration/
│       └── fillForm.integration.test.ts
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.ts
├── eslint.config.mjs
├── .prettierrc.js
├── .gitignore
├── .npmignore
├── README.md                          #    npm/GitHub README
├── LICENSE.md
└── CHANGELOG.md                       #    Developer-facing changelog
```

### 2.1 What Ships in npm vs What Stays in Git

| Directory | In git? | In npm package? | Purpose |
|---|---|---|---|
| `.project/` | ✅ | ❌ | Project governance — excluded via `files` in package.json |
| `docs/` | ✅ | ✅ | End-user documentation |
| `nodes/` | ✅ | ✅ (compiled) | n8n node definition |
| `src/` | ✅ | ✅ (compiled) | Source code (shipped as `dist/`) |
| `test/` | ✅ | ❌ | Tests — excluded via `files` in package.json |
| `dist/` | ❌ | ✅ | Compiled output — generated by build |

The `files` array in `package.json` controls npm inclusion:

```json
"files": ["dist/", "docs/", "README.md", "LICENSE.md", "CHANGELOG.md"]
```

---

## 3. Prerequisites

| Requirement | Version | Check command |
|---|---|---|
| Node.js | ≥ 22.0.0 | `node --version` |
| npm | ≥ 10.0.0 | `npm --version` |
| git | any recent | `git --version` |
| TypeScript (dev dep) | ^5.x | Installed via `npm install` |

No global tools required beyond Node.js and git. Everything else is a project dependency.

---

## 4. Initial Project Setup (Step by Step)

These steps are for first-time setup. Run them in order.

### 4.1 Scaffold from n8n Starter

```bash
# Option A: Use the n8n CLI scaffold (recommended)
npm create @n8n/node
# Follow prompts:
#   Package name: n8n-nodes-pdf-form-filler
#   Node name: PdfFormFiller
#   Description: Fill AcroForm PDF fields with JSON data

# Option B: Clone starter template
git clone https://github.com/n8n-io/n8n-nodes-starter.git n8n-nodes-pdf-form-filler
cd n8n-nodes-pdf-form-filler
rm -rf .git
git init
```

### 4.2 Install Dependencies

```bash
npm install

# Add runtime dependency
npm install pdf-lib

# Add test dependencies
npm install --save-dev jest ts-jest @types/jest
```

### 4.3 Create Project Governance Folders

```bash
mkdir -p .project/{design,planning,completed,logs,decisions}
mkdir -p docs
mkdir -p src/{engine,adapter,types,errors}
mkdir -p src/engine/__tests__
mkdir -p src/adapter/__tests__
mkdir -p test/{fixtures,integration}
```

### 4.4 Copy Design Documents

```bash
# Copy from wherever the design docs were authored
cp 01-problem-definition.md .project/design/
cp 02-solution-architecture.md .project/design/
cp 00-project-setup.md .project/
```

### 4.5 Configure TypeScript

Create `tsconfig.json` as specified in 02-solution-architecture.md Section 11.2.

Create `tsconfig.build.json` (production build — excludes tests):

```json
{
  "extends": "./tsconfig.json",
  "exclude": [
    "node_modules",
    "dist",
    "test",
    "**/__tests__/**",
    "**/*.test.ts"
  ]
}
```

### 4.6 Configure Jest

Create `jest.config.ts` as specified in 02-solution-architecture.md Section 11.3.

### 4.7 Configure .gitignore

```gitignore
node_modules/
dist/
*.js.map
*.d.ts.map
.DS_Store
.project/logs/*.log
.project/logs/*.txt
coverage/
```

### 4.8 Configure .npmignore

```npmignore
.project/
test/
src/
nodes/
*.ts
!dist/**
tsconfig*.json
jest.config.*
eslint.config.*
.prettierrc*
.github/
coverage/
```

### 4.9 Verify Setup

```bash
# Should compile without errors
npm run build

# Should find zero tests (none written yet) but not error
npm test

# Should lint without errors
npm run lint

# Should start n8n with the node loaded
npm run dev
```

---

## 5. Build Commands Reference

| Command | What it does | When to use |
|---|---|---|
| `npm run dev` | Builds + starts n8n with hot reload | During development |
| `npm run build` | Compiles TS → JS in `dist/` | Before publishing or testing the compiled output |
| `npm run lint` | Checks code style and errors | Before committing |
| `npm run lint:fix` | Auto-fixes lint issues | After writing code |
| `npm test` | Runs all Jest tests | Before committing |
| `npm run test:watch` | Runs tests in watch mode | During development |
| `npm run test:coverage` | Runs tests with coverage report | Before PRs / milestones |
| `npm publish` | Publishes to npm | When a version is ready for release |

---

## 6. Development Workflow

### 6.1 Adding a New Feature

1. Create a work item in `.project/planning/` (see planning/README.md for template).
2. Write failing tests first (unit tests in `src/*/__tests__/`, integration in `test/integration/`).
3. Implement the feature.
4. Run `npm test` — all tests pass.
5. Run `npm run lint:fix` — code is clean.
6. Move the work item from `planning/` to `completed/`.
7. Update `.project/project-tracking.md`.
8. Commit with a descriptive message.

### 6.2 Debugging

- Log files go in `.project/logs/` (gitignored for content, but the folder is tracked).
- Use `console.log` during development; n8n dev mode shows output in the terminal.
- For PDF-specific debugging, save intermediate PDFs to `.project/logs/` and inspect in a viewer.
- The adapter's `discoverFields()` output is your best diagnostic — run the Discover Fields operation to see what pdf-lib sees.

### 6.3 Testing Against Real PDFs

1. Place the PDF in `test/fixtures/` (small test PDFs) or `.project/logs/` (large/sensitive PDFs that shouldn't be in git).
2. Write an integration test in `test/integration/`.
3. For the UKPN form specifically: the fixture file should be `test/fixtures/ukpn-sample.pdf` and is expected by the integration test suite.

---

## 7. Implementation Order (Recommended)

This is the suggested order for building the project from scratch. Each phase is independently testable.

| Phase | Components | Tests | Milestone |
|---|---|---|---|
| **Phase 1: Foundation** | Types, errors, MappingResolver | MappingResolver unit tests | Can resolve dot-notation paths |
| **Phase 2: Coercion** | ValueCoercer | ValueCoercer unit tests | Can coerce all value types |
| **Phase 3: Adapter** | PdfLibAdapter, FieldTypeDetector | Adapter unit tests (with fixture PDFs) | Can load, discover, fill, save PDFs |
| **Phase 4: Engine** | PdfFormFillerEngine | Engine unit tests (mocked adapter) | Can orchestrate full fill operations |
| **Phase 5: Node (Discover)** | PdfFormFiller.node.ts — Discover Fields operation | Manual test via `npm run dev` | Discover Fields works in n8n UI |
| **Phase 6: Node (Fill)** | PdfFormFiller.node.ts — Fill Form operation | Manual test via `npm run dev` | Fill Form works in n8n UI |
| **Phase 7: Integration** | Integration tests, UKPN form test | Integration test suite | Full round-trip verified |
| **Phase 8: Polish** | Error messages, documentation, README | Test coverage report | Ready for first use |

---

## 8. Key Files — What Goes Where

| "I need to..." | File to create/edit |
|---|---|
| Change how values are coerced | `src/engine/ValueCoercer.ts` |
| Change how dot-notation paths are resolved | `src/engine/MappingResolver.ts` |
| Change how the fill operation is orchestrated | `src/engine/PdfFormFillerEngine.ts` |
| Change how pdf-lib is called | `src/adapter/PdfLibAdapter.ts` |
| Change the n8n UI (parameters, labels, operations) | `nodes/PdfFormFiller/PdfFormFiller.node.ts` |
| Add a new field type | `src/adapter/FieldTypeDetector.ts` + `src/types/FieldInfo.ts` + `ValueCoercer` |
| Add a new error type | `src/errors/PdfFormFillerError.ts` |
| Add a new type/interface | `src/types/` + re-export in `src/types/index.ts` |
| Write a unit test | `src/<module>/__tests__/<Module>.test.ts` |
| Write an integration test | `test/integration/` |
| Add a test PDF fixture | `test/fixtures/` (or generate in `test/fixtures/createTestPdf.ts`) |
| Log a design decision | `.project/decisions/` |
| Plan new work | `.project/planning/` |
| Record completed work | `.project/completed/` |
| Track overall progress | `.project/project-tracking.md` |
| Document for end users | `docs/` |

---

## 9. Claude Code Instructions

When working on this project as an AI coding agent, follow these rules:

1. **Read `.project/way-of-working.md` first** — it contains coding standards and preferences.
2. **Read `.project/project-tracking.md`** — it tells you what's done and what's next.
3. **Read the relevant design doc** before implementing — `01-problem-definition.md` for requirements, `02-solution-architecture.md` for technical design.
4. **Write tests before or alongside implementation** — never leave a module untested.
5. **Keep the node layer thin** — business logic goes in `src/engine/`, not in `nodes/`.
6. **Don't modify design documents without discussion** — flag conflicts between design and implementation as questions.
7. **Update `.project/project-tracking.md`** after completing work.
8. **Log decisions** in `.project/decisions/` when making choices not covered by the design docs.
9. **Never introduce native dependencies** — everything must be pure JS/TS.
10. **Run `npm run lint:fix` and `npm test`** before considering any task complete.

---

## 10. Versioning & Release

| Version | Meaning |
|---|---|
| `0.x.y` | Pre-release / development builds |
| `1.0.0` | First production release (all Phase 1–8 complete) |
| `1.x.y` | Patch and minor releases (bug fixes, new field types, etc.) |
| `2.0.0` | Breaking changes (if ever needed) |

**Release process:**
1. All tests pass. Lint clean.
2. Update `CHANGELOG.md` and `docs/changelog.md`.
3. Bump version in `package.json`.
4. `git tag v1.0.0`
5. `npm publish`

---

## 11. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-02-14 | Initial project setup document |
