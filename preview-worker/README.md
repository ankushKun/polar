# Polar preview worker

Walrus Sites portal only — serves deployed Polar sites at:

- **Mainnet:** `https://polar.ankushkun.workers.dev/m/{base36SiteId}/`
- **Testnet:** `https://polar.ankushkun.workers.dev/t/{base36SiteId}/`

Deploy this to your **personal** Cloudflare account. The main Polar worker (org account) sets `PORTAL_PUBLIC_ORIGIN` to this URL so dashboard links point here.

This worker is **not** deployed via the Cloudflare GitHub dashboard. The repo is a monorepo and the dashboard setup flow has no subdirectory picker, so a Git-connected project would try to deploy the repo root and touch the wrong worker.

## Deploy (CLI only — preview worker only)

Log in to your **personal** Cloudflare account (not the org account that runs the main API worker).

From the repo root:

```bash
npm install --prefix preview-worker
npx wrangler login
npx wrangler deploy --config preview-worker/wrangler.jsonc
```

Or use the root script (after `npm run install:all` once):

```bash
npm run deploy:preview
```

From `preview-worker/`:

```bash
cd preview-worker
npm install
npx wrangler login
npm run deploy
```

These commands deploy **only** the worker named `polar` in `preview-worker/wrangler.jsonc`. They do **not** deploy the main API worker, frontend, or Walrus site.

### What stays untouched

| Piece | Deploy separately | Command |
| --- | --- | --- |
| Main API worker (org account) | Yes | `cd worker && npm run deploy` |
| Frontend on Walrus (`polar.wal.app`) | Yes | Walrus site-builder / your existing flow |
| This preview worker | This README | commands above |

### If you still want GitHub → Cloudflare

Skip the default “Deploy” wizard for the repo root. After the project exists, set **Deploy command** to:

```bash
cd preview-worker && npm ci && npx wrangler deploy
```

Leave **Build command** empty. That runs only the preview worker on push; it still does not deploy `worker/` or `frontend/`.

## Local dev

```bash
npm run dev   # http://localhost:8788
```

From repo root: `npm run dev:preview`

## Test site IDs

Use these after deploy to confirm routing and Walrus fetches. Replace the host if your worker URL differs.

| Network | Base36 site ID | What it is | Expected after deploy |
| --- | --- | --- | --- |
| **Mainnet** | `46f3881sp4r55fc6pcao9t93bieeejl4vr4k2uv8u4wwyx1a93` | Walrus Sites mainnet portal landing page ([docs default](https://docs.wal.app/docs/sites/portals/mainnet-testnet)) | **200** — HTML landing page |
| **Testnet** | `1p3repujoigwcqrk0w4itsxm7hs7xjl4hwgt3t0szn6evad83q` | Walrus Sites testnet portal landing page ([docs default](https://docs.wal.app/docs/sites/portals/mainnet-testnet)) | **404** “Content unavailable” if storage expired; still proves `/t/{id}/` routing and on-chain site lookup |

For a **live testnet 200**, deploy any site to testnet via Polar and open `/t/{yourBase36Id}/` from the deployment detail page.

### Browser

- Mainnet: https://polar.ankushkun.workers.dev/m/46f3881sp4r55fc6pcao9t93bieeejl4vr4k2uv8u4wwyx1a93/
- Testnet: https://polar.ankushkun.workers.dev/t/1p3repujoigwcqrk0w4itsxm7hs7xjl4hwgt3t0szn6evad83q/
- Health: https://polar.ankushkun.workers.dev/health

### curl

```bash
curl -sI "https://polar.ankushkun.workers.dev/health"
curl -sI "https://polar.ankushkun.workers.dev/m/46f3881sp4r55fc6pcao9t93bieeejl4vr4k2uv8u4wwyx1a93/"
curl -sI "https://polar.ankushkun.workers.dev/t/1p3repujoigwcqrk0w4itsxm7hs7xjl4hwgt3t0szn6evad83q/"
```

### Local portal logic (no deploy)

```bash
npm run test:portal
```

Portal implementation lives in [`../worker/src/portal/`](../worker/src/portal/) and is shared via source import (no duplicate code).
