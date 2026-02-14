# Project Genesis — From Concept to Code-Ready

**Project:** n8n PDF Form Filler Node
**Date:** 2026-02-14
**Purpose:** A reflective record of how this project went from a vague idea to a fully documented, scaffold-ready codebase — intended as a repeatable methodology for future projects.

---

## The Journey in One Sentence

Started with *"what tools exist for filling PDF forms?"*, ended three hours later with a complete problem definition, a 16-section technical architecture, a project governance framework, and a step-by-step setup guide ready for Claude Code to build from.

---

## Phase 1: Exploration (Conversation 1, Turns 1–3)

### What Happened

The project started not with a plan, but with a **question**:

> *"I'm looking for capability of auto-filling fields in a PDF form, most likely done in the background as an n8n node. What tools and libraries are available?"*

This was pure exploration — no commitment to a design, no architecture, just "what's possible?" Claude surveyed the landscape: pdf-lib, pdf-fill-form, HummusJS, PDFtk, and others, with trade-offs on each.

Then came the **first concrete action** — uploading the real UKPN connections form and asking:

> *"Take a look at this form and see if it's an XFA form or AcroForm."*

Followed immediately by:

> *"Can you list all the fields in that form and their data types?"*

This was the moment the project became real. The 251-field inventory gave tangible scope and confirmed that pdf-lib could handle the job.

### Why This Matters

**Starting with exploration, not requirements, was deliberate.** The tool landscape shaped the requirements — not the other way around. By understanding what pdf-lib could and couldn't do (e.g. AcroForm yes, XFA no, font embedding limited), the eventual requirements were grounded in reality rather than wishful thinking.

**Using a real-world form as the reference** prevented abstract over-engineering. Every design decision later could be tested against: "does this work for the UKPN form?"

### Technique: Explore → Ground → Scope

1. Ask "what's possible?" broadly.
2. Test against a real artefact.
3. Let the findings constrain the scope naturally.

---

## Phase 2: Problem Definition (Conversation 1, Turns 4–11)

### What Happened

The pivot came with one sentence:

> *"I want to build the methodology and the approach and the SDLC for this so that I can switch into Claude Code and build the project. Let's start. Help me define the problem."*

From this point, the conversation became **structured requirements gathering**. Claude asked a series of scoping questions, presented as choices rather than open-ended questions. The key decisions made:

| Question | Decision |
|---|---|
| One form or generic? | **Generic engine for any PDF form** |
| Where does data come from? | **API/webhook JSON payload** |
| Where does the filled PDF go? | **Cloud storage** (Google Drive, S3, etc.) |
| Deployment model? | **n8n custom node (npm package)** |
| Language? | **Flexible → TypeScript selected later** |
| Field types? | **Text, checkboxes, radio buttons, dropdowns, date pickers** |
| Auto-detect fields? | **Yes — "Discover Fields" operation** |
| Batch mode? | **No — n8n's loop handles that** |
| Open source? | **Proprietary initially** |

Then the user raised an issue proactively — *before* Claude did:

> *"How do we know what incoming data is mapped to which fields? We're going to need some sort of mapping table."*

This led to the critical design conversation about the **three-logical, two-physical input model**: PDF template (binary) + field mapping (static or dynamic JSON) + data payload (JSON), where the mapping and data are logically separate but physically arrive on the same n8n item.

The conversation ended with a written **Problem Definition document** (01-problem-definition.md) covering all 10 sections.

### Why This Matters

**The structured Q&A format prevented scope creep.** Each question was bounded — choose from these options, not "describe your requirements." This kept the conversation focused and produced clear, documented decisions.

**The user's proactive mapping question** was the single most important design insight of the project. Without it, the architecture might have assumed a simpler data-in, PDF-out model that would have been fragile and hard to maintain. The "mapping is the contract" principle became the backbone of the entire design.

### Technique: Decision-Driven Requirements

1. Ask bounded questions with concrete options.
2. Document each decision immediately.
3. Let the human raise concerns — they know their domain.
4. Produce a formal problem definition document as the output.

---

## Phase 3: Architecture Design (Conversation 2, Turns 1–3)

### What Happened

The second conversation opened with confirmation of the last open question from Conversation 1 (the three-logical/two-physical input model), then moved straight into architecture:

> *"Let's proceed to discussing the Solution Architecture & Technical Design."*

Claude asked three framing questions before producing the architecture:

1. **TypeScript or JavaScript?** → TypeScript (ecosystem standard, type safety).
2. **Testing framework?** → Jest (n8n ecosystem default).
3. **How detailed?** → Full detail — data flows, API contracts, file tree, the lot.

With those confirmed, Claude produced the complete **Solution Architecture document** (02-solution-architecture.md) — 16 sections covering:

- Three-layer component architecture (Node → Engine → Adapter)
- Data flows for both operations
- n8n node interface design (parameters, operations, UI)
- Full TypeScript type definitions
- Value coercion rules (truth tables for every type combination)
- Error handling philosophy (hard errors vs soft warnings)
- Testing strategy (pyramid, fixtures, coverage thresholds)
- Build, packaging, and dependency details
- Open questions with recommendations
- Risk register

### Why This Matters

**Asking "how detailed?" was important.** It set expectations and avoided either over-documenting (slowing down the process) or under-documenting (leaving ambiguity for the implementation phase). The answer — "I want to understand the full design before building" — gave Claude the green light to be thorough.

**The three-layer architecture decision** was the key structural choice. By separating the n8n node (untestable without n8n) from the engine (pure TypeScript, fully testable) from the adapter (isolating pdf-lib), the design became testable, maintainable, and future-proof. This wasn't accidental — it was the answer to "how do we unit test business logic that lives inside an n8n node?"

### Technique: Architecture by Constraint

1. Confirm technology choices before designing.
2. Set the level of detail explicitly.
3. Let testability and replaceability drive structural decisions.
4. Produce a comprehensive reference document — not slides, not a summary.

---

## Phase 4: Project Governance (Conversation 2, continued)

### What Happened

With the architecture approved, the user shifted from *what to build* to *how to build it*:

> *"I would like you to create a 'Project Setup' document that will structure the project... We should include the way of working notes... a structure to retain changes that we plan... a folder for logging... a Project Tracking document... a documentation folder... I'm happy for you to add any other project-related value-adds."*

This request was specific about the *kinds* of things needed (planning, tracking, logging, documentation) but left room for Claude to design the structure. The output was:

| Document | Purpose |
|---|---|
| **00-project-setup.md** | Master assembly guide — how to scaffold, build, and develop. Includes the 8-phase implementation order. |
| **way-of-working.md** | Coding standards, naming conventions, testing rules, git practices, preferences. |
| **project-tracking.md** | Phase tracker, deliverable checklists, activity log, coverage tracker. |
| **planning/README.md** | Work item template and workflow. |
| **completed/README.md** | Where done items go. |
| **logs/README.md** | Debug logs, PDF outputs, session notes (gitignored content). |
| **decisions/README.md** | Architecture Decision Record (ADR) template. |
| **docs/*.md** | Five end-user documentation placeholders (user guide, deployment, operations, field mapping guide, changelog). |
| **QUICKSTART.md** | Step-by-step guide from empty folder to Claude Code prompt. |

Claude added two value-adds the user didn't explicitly request:
- **Architecture Decision Records** — for capturing decisions made during implementation.
- **Claude Code instructions** — explicit rules for AI agents working on the codebase (Section 9 of project setup).

### Why This Matters

**Governance isn't overhead — it's the interface between humans and AI agents.** The way-of-working and project-tracking documents aren't just for the developer; they're the *context window* that Claude Code reads to understand where the project is and how to behave. Without them, every Claude Code session starts from zero.

**The planning → completed workflow** creates a paper trail. When something goes wrong six weeks from now, you can look at the completed folder and see exactly what was done and when.

### Technique: Governance as Agent Context

1. Define the structure you need (planning, tracking, logging, docs).
2. Let the AI propose the specific format and templates.
3. Ensure every governance document is useful to both humans and AI agents.
4. Include explicit AI agent instructions alongside human guidelines.

---

## Phase 5: Handoff Preparation (Conversation 2, final turns)

### What Happened

The final exchanges were about the practical transition from design to implementation:

> *"Where should I be placing these files? What folders should I be creating? When can I switch to VS Code – Claude Code and what instructions should I give it?"*

This produced the **QUICKSTART.md** — a step-by-step guide covering:

1. Create one folder under Projects.
2. Scaffold the n8n node package.
3. Install dependencies.
4. Create the governance folder structure.
5. Extract the downloaded zip (structure matches project layout).
6. Place the UKPN test PDF.
7. Verify with `npm run build`.
8. Open VS Code, give Claude Code the 5-document reading list + the Phase 1 instruction.

### Why This Matters

**The handoff prompt is critical.** Claude Code has no memory of this conversation. The five documents — project setup, way of working, project tracking, problem definition, architecture — are the *entire context transfer*. The quality of Claude Code's first implementation session depends entirely on the quality of these documents.

**The prompt structure** — read five docs, confirm understanding, then begin Phase 1 — ensures Claude Code orients itself before writing code. Without the confirmation step, it might start coding based on a partial understanding.

### Technique: Context Transfer via Documents

1. Produce all design and governance documents as files, not chat history.
2. Create an explicit reading order for the receiving agent.
3. Include a "confirm understanding" step before allowing implementation.
4. Make the handoff prompt copy-pasteable.

---

## The Complete Process — Repeatable Template

Here's the methodology distilled into a repeatable sequence:

```
┌─────────────────────────────────────────────────┐
│  STEP 1: EXPLORE                                │
│  "What tools/approaches exist for [problem]?"   │
│  → Understand the landscape before committing    │
│  → Test against a real artefact if possible      │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 2: DEFINE THE PROBLEM                     │
│  Structured Q&A with bounded choices:            │
│  → Scope (generic vs specific)                   │
│  → Inputs and outputs                            │
│  → Technology constraints                        │
│  → What's in and what's out                      │
│  OUTPUT: Problem Definition document             │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 3: DESIGN THE ARCHITECTURE                │
│  Confirm: language, frameworks, detail level     │
│  → Component structure                           │
│  → Data flows                                    │
│  → Type definitions and API contracts            │
│  → Error handling philosophy                     │
│  → Testing strategy                              │
│  → Build and packaging                           │
│  OUTPUT: Solution Architecture document          │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 4: SET UP PROJECT GOVERNANCE              │
│  → Project setup / assembly guide                │
│  → Way of working (standards & preferences)      │
│  → Project tracking (phases & checklists)        │
│  → Planning / completed workflow                 │
│  → Decision records                              │
│  → End-user documentation placeholders           │
│  OUTPUT: Full .project/ and docs/ structure      │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 5: PREPARE THE HANDOFF                    │
│  → Quickstart guide (terminal commands)          │
│  → Claude Code prompt (reading list + Phase 1)   │
│  → Download all files as a package               │
│  OUTPUT: Ready to open VS Code and begin         │
└─────────────────────────────────────────────────┘
```

### Key Principles Throughout

1. **Let the real artefact anchor the design.** Upload the actual PDF, the actual API response, the actual error message. Abstract requirements lead to abstract architectures.

2. **Bounded questions produce better decisions faster.** "Choose A, B, or C" beats "what do you want?" every time. And the human can always say "none of these — here's what I actually need."

3. **Documents are the interface.** Chat history is ephemeral and gets compacted. Documents persist and transfer context between sessions and agents.

4. **Design before code, but not too far before.** Two documents (problem + architecture) plus governance is enough. A third design doc would have been diminishing returns — better to start building and capture emergent decisions in ADRs.

5. **The human adds the insight; the AI adds the structure.** The mapping-as-contract idea came from the human. The three-layer architecture came from the AI. The best outcomes came from both.

6. **Make the handoff explicit.** Don't assume context carries over. Write the reading list. Write the first prompt. Make it copy-pasteable.

---

## Time Invested

| Phase | Approx. Duration | Conversations |
|---|---|---|
| Exploration | 15 min | Conversation 1, early turns |
| Problem Definition | 30 min | Conversation 1, middle–end |
| Architecture Design | 45 min | Conversation 2, first half |
| Project Governance | 30 min | Conversation 2, second half |
| Handoff Preparation | 15 min | Conversation 2, final turns |
| **Total** | **~2.5 hours** | **2 conversations** |

From "what tools exist?" to "give Claude Code this prompt and it'll start building" — roughly the length of a detailed planning meeting, but with every decision documented and every artefact produced.

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-02-14 | Initial retrospective |
