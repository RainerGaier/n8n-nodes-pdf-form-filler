# Deployment to Self-Hosted n8n

**Status:** Ready
**Created:** 2026-02-14
**Updated:** 2026-02-15

---

## Context

The team runs a **self-hosted n8n instance** in the cloud, administered by Rob. This simplifies deployment — self-hosted n8n supports custom community nodes without requiring npm publication or the n8n verified review process.

---

## Recommended Approach: Install from .tgz Package

A pre-built `.tgz` package is generated with `npm pack` and can be installed directly on the server.

### Building the package (developer)

```bash
npm run build
npm pack
```

This produces `n8n-nodes-pdf-form-filler-0.1.0.tgz` (≈24 KB). Send this file to the administrator.

### Installing on the server (administrator)

**1. Ensure the custom nodes directory exists:**

```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm init -y          # only needed once, if no package.json exists
```

**2. Install the package:**

```bash
npm install /path/to/n8n-nodes-pdf-form-filler-0.1.0.tgz
```

This installs the node and its sole dependency (`pdf-lib`).

**3. Restart n8n:**

```bash
# Systemd
sudo systemctl restart n8n

# PM2
pm2 restart n8n

# Docker
docker restart <n8n-container>
```

The **PDF Form Filler** node will appear in the workflow editor under the Action nodes.

### Docker-based n8n

If n8n runs in Docker, there are two approaches:

**Option A — Mount a volume** (no image rebuild):

```bash
# On the host, create the nodes directory and install
mkdir -p /opt/n8n-data/nodes
cd /opt/n8n-data/nodes
npm init -y
npm install /path/to/n8n-nodes-pdf-form-filler-0.1.0.tgz

# Mount it into the container (add to docker run or docker-compose.yml)
# -v /opt/n8n-data/nodes:/home/node/.n8n/nodes
```

**Option B — Custom Dockerfile** (baked into the image):

```dockerfile
FROM n8nio/n8n:latest
COPY n8n-nodes-pdf-form-filler-0.1.0.tgz /tmp/
RUN mkdir -p /home/node/.n8n/nodes && \
    cd /home/node/.n8n/nodes && \
    npm init -y && \
    npm install /tmp/n8n-nodes-pdf-form-filler-0.1.0.tgz && \
    rm /tmp/n8n-nodes-pdf-form-filler-0.1.0.tgz
```

---

## Alternative: Install from GitHub

Since the repository is public, the administrator can install directly without receiving a file:

```bash
cd ~/.n8n/nodes
npm install github:RainerGaier/n8n-nodes-pdf-form-filler
```

This pulls the latest code from GitHub and builds it. Requires `git` on the server.

---

## Upgrading

To install a newer version, repeat the install step with the new `.tgz` file (or re-run the GitHub install) and restart n8n. npm will replace the previous version automatically.

---

## Future Option: npm Publication

If the node needs to be available to a wider audience or via n8n's built-in community node installer (Settings → Community Nodes), it can be published to npm:

```bash
npm publish
```

Once on npm, any self-hosted n8n instance can install it by name through the UI. n8n Cloud would additionally require passing the [verified node review process](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/), which has a zero-runtime-dependency requirement (pdf-lib would need bundling).

This is not needed for the current self-hosted deployment.

---

## References

- [Install private nodes (n8n docs)](https://docs.n8n.io/integrations/creating-nodes/deploy/install-private-nodes/)
- [Submit community nodes (n8n docs)](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- GitHub repo: https://github.com/RainerGaier/n8n-nodes-pdf-form-filler
