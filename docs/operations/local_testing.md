# Local Testing with n8n

How to run a local n8n instance and load the PDF Form Filler community node for development testing.

## Prerequisites

- Node.js 18+ (tested with v22)
- npm
- The community node project built (`npm run build`)

## 1. Install n8n globally

```bash
npm install -g n8n
```

Verify with:

```bash
n8n --version
```

## 2. Build the community node

```bash
cd /path/to/n8n-nodes-pdf-form-filler
npm run build
```

This runs `n8n-node build` followed by `copy:codex` to copy the `.node.json` metadata file into `dist/`.

## 3. Link the community node into n8n

Create a global npm link from the project:

```bash
cd /path/to/n8n-nodes-pdf-form-filler
npm link
```

Then create the n8n custom nodes directory and link the package into it:

```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm init -y
npm link n8n-nodes-pdf-form-filler
```

This creates a symlink at `~/.n8n/nodes/node_modules/n8n-nodes-pdf-form-filler` pointing to your project directory.

## 4. Start n8n

The recommended startup command includes environment variables to disable outbound network calls (which can cause the owner setup form to hang) and to allow file access to the project directory:

```bash
N8N_DIAGNOSTICS_ENABLED=false \
N8N_TEMPLATES_ENABLED=false \
N8N_VERSION_NOTIFICATIONS_ENABLED=false \
N8N_RESTRICT_FILE_ACCESS_TO="/path/to/n8n-nodes-pdf-form-filler;$HOME/.n8n-files" \
N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/nodes/node_modules/n8n-nodes-pdf-form-filler" \
n8n start
```

n8n will be available at **http://localhost:5678**.

On first run you'll be prompted to create an owner account (local only).

### Environment variables explained

| Variable | Purpose |
|----------|---------|
| `N8N_DIAGNOSTICS_ENABLED=false` | Disables telemetry. Prevents the owner setup form from hanging on first run. |
| `N8N_TEMPLATES_ENABLED=false` | Disables workflow template fetching from n8n servers. |
| `N8N_VERSION_NOTIFICATIONS_ENABLED=false` | Disables update check calls to n8n servers. |
| `N8N_RESTRICT_FILE_ACCESS_TO` | n8n v2+ restricts file nodes to `~/.n8n-files` by default. Set this to a semicolon-separated list of allowed directories so the `Read Binary File` node can access test PDFs. |
| `N8N_CUSTOM_EXTENSIONS` | Explicitly points n8n to the linked community node (optional if `~/.n8n/nodes` linking is done). |

## 5. Import test workflows

Three test workflows are available in `test/n8n/`:

| File | Description |
|------|-------------|
| `01-discover-fields.json` | Discovers all form fields in a PDF |
| `02-fill-form-static.json` | Fills a PDF using static field mappings defined in the node UI |
| `03-fill-ukpn-dynamic.json` | Fills the UKPN connections form using a dynamic mapping array from input data |

To import: click the `...` menu (top-right of the canvas) → **Import from File** → select the JSON file.

### Fix file paths after import

The `Read Binary File` nodes use relative paths. Update them to absolute paths on your machine, e.g.:

```
C:\Users\gaierr\Energy_Projects\projects\n8n-nodes-pdf-form-filler\test\fixtures\ukpn14421-connections-applications-form_jan-2023_03.pdf
```

## 6. Execute and verify

1. Click **Test Workflow** (or `Ctrl+Enter`) to run the workflow
2. Click any node's output panel to inspect results:
   - **Discover Fields**: JSON output with `fields` array and `fieldCount`
   - **Fill Form**: JSON with `status`, `fieldsFilled`, `fieldsSkipped`, `warnings`, plus a binary PDF attachment
3. For Fill Form output, click the binary data entry to download and open the filled PDF

### What to look for

- **Execution hints**: Orange/yellow badges on the Fill Form node output if there are warnings (e.g., missing field values)
- **Server logs**: Check the terminal running n8n for `debug` and `info` log messages from the node
- **Filled PDFs**: Download and verify in Adobe Reader, Chrome's built-in viewer, or macOS Preview

## 7. Development cycle

After making code changes:

```bash
# 1. Rebuild
npm run build

# 2. Restart n8n (Ctrl+C the running instance, then start again)
n8n start
```

The npm link is a symlink, so `dist/` is always read from the project directory — no need to re-link after rebuilding.

## 8. Stopping n8n

Press `Ctrl+C` in the terminal where n8n is running.

## Cloud vs Local

- **Cloud n8n**: Cannot load unpublished community nodes. Use for production workflows.
- **Local n8n**: Required for testing custom nodes during development.
- Workflows can be transferred between cloud and local via JSON export/import.

## n8n data locations

| Item | Path |
|------|------|
| Config | `~/.n8n/config` |
| Database | `~/.n8n/database.sqlite` |
| Custom nodes | `~/.n8n/nodes/` |
| Encryption key | Stored in config, auto-generated on first run |
