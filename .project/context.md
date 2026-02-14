# Project Context — Read This First

**Project:** n8n PDF Form Filler Node
**Package:** `n8n-nodes-pdf-form-filler`
**Last updated:** 2026-02-14

---

## What This File Is

This is the **entry point for any AI coding agent** (including Claude Code) that needs to understand this project. If you have no memory of this project, or only partial context, start here and follow the instructions below.

**Do not start writing code until you have completed the orientation.**

---

## Quick Summary

This project is an **n8n community node** that fills AcroForm PDF fields with JSON data. It has two operations:

1. **Discover Fields** — loads a PDF and returns an inventory of all form fields (name, type, options, etc.).
2. **Fill Form** — takes a PDF template, a field mapping, and a JSON data payload, and produces a filled PDF.

The architecture has **three layers**:
- **Node layer** (`nodes/`) — thin n8n wrapper, handles UI and binary I/O.
- **Engine layer** (`src/engine/`) — pure TypeScript business logic, zero framework dependencies.
- **Adapter layer** (`src/adapter/`) — isolates the pdf-lib library behind a clean interface.

The single runtime dependency is **pdf-lib** (pure JS, zero transitive dependencies).

---

## Orientation — Follow These Steps

### Step 1: Understand Where the Project Is

Check the current project status:

```
Read: .project/project-tracking.md
```

This tells you:
- Which phase the project is currently in.
- What has been completed.
- What the next deliverables are.
- Any active risks or blockers.

**After reading, you should know:** *What phase are we in? What's already built? What's next?*

### Step 2: Understand How to Work on This Project

Read the coding standards and working practices:

```
Read: .project/way-of-working.md
```

This tells you:
- Coding style, naming conventions, and file organisation rules.
- Testing standards (write tests first, 80% coverage minimum).
- Git branch and commit message conventions.
- Error handling philosophy.
- Documentation standards.

**After reading, you should know:** *How should I name files? Where do tests go? What's the commit message format? What are the rules around `any` types, console.log, and error handling?*

### Step 3: Understand What to Build

Read the requirements and technical design:

```
Read: .project/design/01-problem-definition.md
Read: .project/design/02-solution-architecture.md
```

The problem definition covers:
- What the node does and doesn't do (scope boundaries).
- The three-logical, two-physical input model.
- Field type support and value transformation rules.
- Success criteria.

The architecture covers:
- Component structure and dependency direction.
- Data flows for both operations.
- TypeScript interfaces and type definitions.
- Value coercion truth tables.
- n8n node parameter design.
- Error classification (hard errors vs soft warnings).
- Testing strategy and fixture approach.
- Build, packaging, and release process.
- pdf-lib API mapping.

**After reading, you should know:** *What are the interfaces? What types exist? How does the engine orchestrate a fill? What does the n8n node UI look like? How are errors handled?*

### Step 4: Understand How the Project Is Assembled

Read the setup and assembly guide:

```
Read: .project/00-project-setup.md
```

This tells you:
- The full repository layout (what goes where).
- Build commands and what they do.
- The recommended implementation order (8 phases).
- The "what goes where" routing table (need to change coercion? → ValueCoercer.ts).
- What ships in npm vs what stays in git.

**After reading, you should know:** *Where do I create new files? How do I run tests? What's the build command? What's the implementation order?*

### Step 5: Check for Decisions Made During Implementation

```
Read: .project/decisions/README.md
List:  .project/decisions/
```

If any ADR (Architecture Decision Record) files exist beyond the README, read them. These capture design decisions made during implementation that aren't in the original architecture doc. They override or extend the architecture where applicable.

### Step 6: Check Recent Activity

```
List: .project/completed/
List: .project/planning/
```

Scan the completed folder to see what work has been done recently. Scan the planning folder to see what's queued up. This gives you the operational context — not just the design, but the momentum.

---

## Reading Order Summary

| Order | File | Time to Read | What You Learn |
|---|---|---|---|
| 1 | `.project/project-tracking.md` | 2 min | Where we are |
| 2 | `.project/way-of-working.md` | 5 min | How we work |
| 3 | `.project/design/01-problem-definition.md` | 5 min | What we're building and why |
| 4 | `.project/design/02-solution-architecture.md` | 10 min | How it's designed |
| 5 | `.project/00-project-setup.md` | 5 min | How it's assembled |
| 6 | `.project/decisions/*.md` | 1 min per ADR | What changed since design |
| 7 | `.project/planning/` + `.project/completed/` | 2 min | What's in flight |

**Total orientation time: ~30 minutes of reading.**

---

## After Orientation — Confirm Understanding

Before writing any code, briefly confirm you understand:

1. **The project:** An n8n node that fills AcroForm PDFs using pdf-lib.
2. **The architecture:** Three layers — Node (thin wrapper) → Engine (pure logic) → Adapter (pdf-lib isolation).
3. **The current phase:** [Read from project-tracking.md]
4. **The next deliverable:** [Read from project-tracking.md]
5. **The rules:** Tests alongside code, 80% coverage, no n8n imports in `src/`, no `any` types, named exports only.

Then proceed with the current phase's deliverables.

---

## Quick Reference — Key Locations

| Need to... | Look in |
|---|---|
| Find the current status | `.project/project-tracking.md` |
| Find coding standards | `.project/way-of-working.md` |
| Find the architecture | `.project/design/02-solution-architecture.md` |
| Find the requirements | `.project/design/01-problem-definition.md` |
| Find the project structure | `.project/00-project-setup.md` |
| Find past decisions | `.project/decisions/` |
| Find what's planned | `.project/planning/` |
| Find what's done | `.project/completed/` |
| Find debug logs | `.project/logs/` |
| Find end-user docs | `docs/` |

---

## If You Only Have Time to Read One Document

Read **`.project/project-tracking.md`** — it tells you where we are and links to everything else. But do read the full orientation before making structural changes or starting a new phase.

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-02-14 | Initial context document |
