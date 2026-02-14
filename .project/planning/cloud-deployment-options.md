# Cloud Deployment Options

Status: **Under consideration**
Created: 2026-02-14

## Problem

The PDF Form Filler community node works on self-hosted n8n (local or Docker) but cannot run on **n8n Cloud** without going through the verified node submission process.

Colleagues are using n8n Cloud for their workflows.

## Options

### Option 1: Verified Community Node (Cloud-eligible)

Publish to npm and submit for n8n's verified review process.

**Requirements:**
- Package published to npm (name already compliant: `n8n-nodes-pdf-form-filler`)
- **Zero runtime dependencies** — verified nodes must not have external `node_modules` deps
- Pass n8n's automated checks and technical guidelines
- MIT license (already in place)

**Blocker:** We depend on `pdf-lib` as a runtime dependency. To qualify, we would need to **bundle pdf-lib into the dist output** (e.g., via esbuild or webpack) so it ships as part of our code rather than as a separate npm dependency.

**Action items:**
1. Investigate bundling pdf-lib into dist (esbuild recommended)
2. Verify bundled output still works with n8n's node loader
3. Confirm n8n considers bundled code acceptable (vs. listed dependency)
4. Publish to npm
5. Submit for verified review via https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/

**Timeline:** Depends on n8n review queue after submission.

### Option 2: Unverified npm Package (self-hosted only)

Publish to npm without verified review.

- Anyone on **self-hosted n8n** can install via Settings → Community Nodes → enter package name
- **Not available on n8n Cloud**
- No dependency restrictions

**Action items:**
1. Publish to npm
2. Colleagues would need to move to self-hosted n8n

### Option 3: Private Deployment (self-hosted only)

Don't publish to npm. Deploy directly to a self-hosted n8n instance.

**Methods:**
- `npm link` (development)
- Copy `dist/` into `~/.n8n/custom/` on the server
- Bake into a custom Docker image
- Use a private npm registry (e.g., Verdaccio)

**Action items:**
1. Set up self-hosted n8n (Docker recommended)
2. Choose deployment method
3. Document for team

## References

- [Install verified community nodes](https://docs.n8n.io/integrations/community-nodes/installation/verified-install/)
- [Submit community nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- [Install private nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/install-private-nodes/)
- [Community nodes on n8n Cloud (blog)](https://blog.n8n.io/community-nodes-available-on-n8n-cloud/)

## Decision

TBD — pending review of bundling feasibility and team requirements.
