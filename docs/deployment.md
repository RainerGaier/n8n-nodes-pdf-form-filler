# Deployment Guide

## System Requirements

- **n8n:** version 1.0.0 or later
- **Node.js:** 18 or later (n8n requirement)
- **Dependencies:** None beyond what n8n provides. The node bundles `pdf-lib` as its only runtime dependency.

## Installation

### Self-hosted n8n (GUI)

1. Open your n8n instance
2. Go to **Settings → Community Nodes**
3. Enter `n8n-nodes-pdf-form-filler`
4. Click **Install**
5. The node appears in the node panel as **PDF Form Filler**

No restart required when installing via the GUI.

### Self-hosted n8n (command line)

```bash
cd ~/.n8n
npm install n8n-nodes-pdf-form-filler
```

Restart n8n after installation.

### Docker

Add the package to your Dockerfile or install it in the container's n8n data directory:

```dockerfile
FROM n8nio/n8n:latest
RUN cd /home/node/.n8n && npm install n8n-nodes-pdf-form-filler
```

Or mount a custom nodes directory:

```bash
docker run -it --rm \
  -v ~/.n8n:/home/node/.n8n \
  -p 5678:5678 \
  n8nio/n8n
```

Then install the package inside `~/.n8n/` on the host.

### n8n Cloud

Not currently available. n8n Cloud only supports verified community nodes. The PDF Form Filler node has a runtime dependency (`pdf-lib`) which must be bundled before it can qualify for verification.

See `.project/planning/cloud-deployment-options.md` for the roadmap.

## Upgrading

### GUI

Go to **Settings → Community Nodes**, find **PDF Form Filler**, and click **Update** if a new version is available.

### Command line

```bash
cd ~/.n8n
npm update n8n-nodes-pdf-form-filler
```

Restart n8n after upgrading.

### Docker

Rebuild your image or re-run the npm install command with the updated version.

## Uninstalling

### GUI

Go to **Settings → Community Nodes**, find **PDF Form Filler**, and click **Uninstall**.

### Command line

```bash
cd ~/.n8n
npm uninstall n8n-nodes-pdf-form-filler
```

Restart n8n after uninstalling.

## Local Development Setup

For testing during development, see [operations/local_testing.md](operations/local_testing.md) which covers npm link, environment variables, and the development cycle.
