# Quickstart — Getting the Project Off the Ground

## Step 1: Create the Project Folder

Under your Projects folder, create one folder:

```
Projects/
└── n8n-nodes-pdf-form-filler/
```

That's it — one folder. Everything lives inside it.

## Step 2: Scaffold the n8n Node Package

Open a terminal, navigate to your Projects folder, and run:

```bash
cd ~/Projects    # or wherever your Projects folder is

# Use the n8n CLI to scaffold the project
npm create @n8n/node

# When prompted:
#   Package name:  n8n-nodes-pdf-form-filler
#   Node name:     PdfFormFiller  
#   Description:   Fill AcroForm PDF fields with JSON data
#   (Accept defaults for everything else)
```

This creates `n8n-nodes-pdf-form-filler/` with the standard n8n starter structure.

> **Alternative** (if the CLI gives trouble):
> ```bash
> git clone https://github.com/n8n-io/n8n-nodes-starter.git n8n-nodes-pdf-form-filler
> cd n8n-nodes-pdf-form-filler
> rm -rf .git
> git init
> ```

## Step 3: Install Dependencies

```bash
cd n8n-nodes-pdf-form-filler
npm install

# Add runtime dependency
npm install pdf-lib

# Add test dependencies  
npm install --save-dev jest ts-jest @types/jest
```

## Step 4: Create the Governance Folders

```bash
# Project governance (not shipped in npm)
mkdir -p .project/design
mkdir -p .project/planning
mkdir -p .project/completed
mkdir -p .project/logs
mkdir -p .project/decisions

# Source code structure
mkdir -p src/engine/__tests__
mkdir -p src/adapter/__tests__
mkdir -p src/types
mkdir -p src/errors

# Test structure
mkdir -p test/fixtures
mkdir -p test/integration

# End-user documentation
mkdir -p docs
```

## Step 5: Unzip and Place the Documents

Extract the zip file you downloaded. Place the files as follows:

```
FROM THE ZIP                          →  PLACE IN
─────────────────────────────────────────────────────────────────
.project/00-project-setup.md          →  .project/00-project-setup.md
.project/way-of-working.md            →  .project/way-of-working.md
.project/project-tracking.md          →  .project/project-tracking.md
.project/design/01-problem-definition.md  →  .project/design/01-problem-definition.md
.project/design/02-solution-architecture.md  →  .project/design/02-solution-architecture.md
.project/planning/README.md           →  .project/planning/README.md
.project/completed/README.md          →  .project/completed/README.md
.project/logs/README.md               →  .project/logs/README.md
.project/decisions/README.md          →  .project/decisions/README.md
docs/user-guide.md                    →  docs/user-guide.md
docs/deployment.md                    →  docs/deployment.md
docs/operations.md                    →  docs/operations.md
docs/field-mapping-guide.md           →  docs/field-mapping-guide.md
docs/changelog.md                     →  docs/changelog.md
```

**The zip structure matches the project structure exactly** — so if your OS supports it, you can simply extract the zip *into* the `n8n-nodes-pdf-form-filler/` folder and everything lands in the right place.

## Step 6: Place the UKPN PDF

Copy the UKPN connections form PDF into the test fixtures folder:

```
test/fixtures/ukpn-sample.pdf
```

## Step 7: Verify the Structure

Your project should now look like this:

```
n8n-nodes-pdf-form-filler/
├── .project/
│   ├── 00-project-setup.md
│   ├── way-of-working.md
│   ├── project-tracking.md
│   ├── design/
│   │   ├── 01-problem-definition.md
│   │   └── 02-solution-architecture.md
│   ├── planning/
│   │   └── README.md
│   ├── completed/
│   │   └── README.md
│   ├── logs/
│   │   └── README.md
│   └── decisions/
│       └── README.md
├── docs/
│   ├── user-guide.md
│   ├── deployment.md
│   ├── operations.md
│   ├── field-mapping-guide.md
│   └── changelog.md
├── nodes/                    ← created by n8n scaffold
│   └── ...
├── src/
│   ├── engine/
│   │   └── __tests__/
│   ├── adapter/
│   │   └── __tests__/
│   ├── types/
│   └── errors/
├── test/
│   ├── fixtures/
│   │   └── ukpn-sample.pdf
│   └── integration/
├── node_modules/             ← created by npm install
├── package.json              ← created by n8n scaffold
├── tsconfig.json             ← created by n8n scaffold
└── ...
```

## Step 8: Quick Sanity Check

```bash
# Should compile without errors (may have starter example code)
npm run build

# Should start n8n with the starter node loaded
npm run dev
# (Ctrl+C to stop)
```

If both work, your project is ready.

## Step 9: Switch to VS Code + Claude Code

Open the project in VS Code:

```bash
code .
```

---

## Instructions for Claude Code

When you open Claude Code (via VS Code chat or terminal), give it the following prompt:

---

**PROMPT TO GIVE CLAUDE CODE:**

```
Read the following project documents in order:

1. .project/00-project-setup.md — This is the project setup and assembly guide.
2. .project/way-of-working.md — This contains all coding standards and preferences.
3. .project/project-tracking.md — This shows what's done and what's next.
4. .project/design/01-problem-definition.md — This is the full requirements document.
5. .project/design/02-solution-architecture.md — This is the technical architecture.

After reading all five documents, confirm you understand:
- What the project is (n8n node for filling AcroForm PDFs)
- The three-layer architecture (Node → Engine → Adapter)
- The current project status (Phase 0 complete, Phase 1 next)
- The way of working (testing, naming, git conventions)

Then begin Phase 1: Create the TypeScript type definitions, 
custom error classes, and MappingResolver with full unit tests,
following the architecture in 02-solution-architecture.md.
```

---

That prompt gives Claude Code everything it needs to orient itself and start productive work immediately.
