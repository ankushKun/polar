# Agent instructions

## Architecture (deployment surfaces)

Polar splits work across **three deployable pieces**:

| Piece | Cloudflare account | Host / URL | What it runs |
| --- | --- | --- | --- |
| **Org worker** (`worker/`) | Org | `https://glacier.construct-computer.workers.dev` | Hono API, D1, build containers, embedded React SPA, Walrus deploy orchestration |
| **Preview worker** (`preview-worker/`) | Personal | `https://{base36}.polar.ankush.one/` + `https://polar.ankush.one/mcp` | Walrus Sites portal; hosted Polar MCP (Streamable HTTP) |
| **Walrus frontend** (`frontend/` → Walrus) | On-chain | `https://polar.wal.app` | Same React app, built with absolute API URL pointing at the org worker |

User-deployed sites get preview URLs like `https://{base36SiteId}.polar.ankush.one/` (mainnet/testnet auto-detected via RPC). The org worker computes these in API `viewUrl` responses when `PORTAL_SUBDOMAIN_BASE` is set.

Portal code lives in [`worker/src/portal/`](worker/src/portal/) and is imported by the preview worker - no duplicate portal logic.

---

## Agent deploy rules (read first)

### DO deploy from CLI

| Target | Command | When |
| --- | --- | --- |
| Org worker + embedded frontend | `cd worker && npm run deploy` | API, worker, container image, or bundled SPA changes |
| (same, from repo root) | `npm run deploy` | Alias for the above |

### DO NOT deploy from CLI

| Target | Why |
| --- | --- |
| **Preview worker** | Wrong Cloudflare account; must go through CI/CD on the personal account |
| `npm run deploy:preview` | Same - blocked for agents |
| `npx wrangler deploy --config preview-worker/wrangler.jsonc` | Same |
| `cd preview-worker && npm run deploy` | Same |

To ship **preview-worker** changes: **commit and push to `main`**. GitHub → Cloudflare CI/CD deploys to the personal account automatically.

To ship **Walrus frontend** (`polar.wal.app`): build with production env vars, then run `walrus-deploy` - see [Walrus frontend](#walrus-frontend-polarwalapp) below. This is a manual, separate step from the org worker deploy.

---

## Org worker (`worker/`)

### Deploy command

```bash
cd worker && npm run deploy
```

This runs:

1. `build:frontend` - `VITE_API_BASE=/api`, `VITE_PORTAL_SUBDOMAIN_BASE=polar.ankush.one`, and `VITE_MCP_URL=https://polar.ankush.one/mcp` baked into the SPA
2. `wrangler deploy --keep-vars` - uploads worker + `frontend/dist` assets + rebuilds/pushes the build container image

**Use `--keep-vars`** so dashboard secrets and any vars not in `wrangler.jsonc` are preserved. Do not deploy without it unless intentionally replacing all vars.

### What gets deployed

- Worker script (`worker/src/index.ts`)
- Static assets from `frontend/dist` (SPA, `run_worker_first` for `/api/*` and `/health`)
- Docker build container (`worker/Dockerfile`) - clone, install, build, Walrus publish
- D1 binding `glacier-db` (schema changes require separate migration - see below)

### Production URLs

| URL | Purpose |
| --- | --- |
| `https://glacier.construct-computer.workers.dev` | Org worker - API + UI when served from worker |
| `https://glacier.construct-computer.workers.dev/api/*` | REST API |
| `https://glacier.construct-computer.workers.dev/health` | Health check |

### Vars in `worker/wrangler.jsonc` (committed)

These are set in config and deployed with the worker:

| Var | Production value | Purpose |
| --- | --- | --- |
| `PORTAL_SUBDOMAIN_BASE` | `polar.ankush.one` | API `viewUrl` → `https://{base36}.polar.ankush.one/` |
| `PORTAL_PUBLIC_ORIGIN` | `https://polar.ankush.one` | Fallback portal origin |
| `FRONTEND_URL` | `https://polar.wal.app` | OAuth redirect after login (Walrus UI) |
| `API_PUBLIC_URL` | `https://glacier.construct-computer.workers.dev` | Worker public origin; OAuth callback base |
| `GITHUB_REDIRECT_URI` | `https://glacier.construct-computer.workers.dev/api/github/callback` | Must match GitHub OAuth app callback URL |
| `CORS_ORIGINS` | `https://polar.wal.app` | Allow Walrus-hosted frontend to call worker API |
| `WALRUS_NETWORK` | `testnet` | Default network for new deploys (override per project) |
| `WALRUS_EPOCHS` | `1` | Default storage epochs |

### Secrets (Cloudflare dashboard only - never commit)

Set in Workers → glacier → Settings → Variables and Secrets:

- `JWT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `SUI_KEYSTORE`, `SUI_ADDRESS` (platform wallet for Walrus publish)
- `SECRETS_ENCRYPTION_KEY` (32-byte AES for project secrets)
- `WEBHOOK_SECRET` (optional, GitHub push webhooks)

Local dev: copy `worker/.dev.vars.example` → `worker/.dev.vars`, or run `npm run setup:env` from repo root.

### D1 migrations

Schema changes are **not** applied by `npm run deploy`. Apply migrations explicitly:

```bash
cd worker
npx wrangler d1 execute glacier-db --remote --file=migrations/000N_....sql
```

Local: `npm run db:migrate` (runs all migrations against local D1).

---

## Preview worker (`preview-worker/`)

Serves Walrus Sites at subdomain URLs and **hosted MCP** at apex `/mcp`. **CI/CD only** - see [`preview-worker/README.md`](preview-worker/README.md).

### Vars in `preview-worker/wrangler.jsonc`

| Var | Production value | Purpose |
| --- | --- | --- |
| `PORTAL_SUBDOMAIN_BASE` | `polar.ankush.one` | Subdomain site routing + apex MCP gate |
| `POLAR_API_BASE` | `https://glacier.construct-computer.workers.dev/api` | Upstream for MCP tool HTTP calls |

### Production URLs

| URL | Purpose |
| --- | --- |
| `https://{base36}.polar.ankush.one/` | Deployed site (network auto-detected) |
| `https://polar.ankush.one/mcp` | Hosted Polar MCP (apex only; Streamable HTTP) |
| `https://polar.ankush.one/health` | Preview worker health (apex custom domain) |
| Legacy: `/m/{id}/`, `/t/{id}/` on workers.dev | Path-prefix portal (backward compat) |

### CI/CD settings (personal Cloudflare account)

| Setting | Value |
| --- | --- |
| Build command | `npm ci --prefix preview-worker` (also installs `mcp/` via `file:../mcp`) |
| Deploy command | `npx wrangler deploy --config preview-worker/wrangler.jsonc` |

### DNS / routes (ankush.one zone)

Required for subdomain previews to work:

| Step | Value |
| --- | --- |
| DNS | Proxied `AAAA`: name `*.polar` → `100::` |
| Worker route | `*.polar.ankush.one/*` (not `*polar.ankush.one/*`) |
| Optional apex | Custom domain `polar.ankush.one` |

If subdomains 404, check wildcard DNS first - apex alone is not enough. Verify: `curl -sI https://polar.ankush.one/health` → 200.

### Local dev (agents may run)

```bash
npm run dev:preview   # :8788 - use /m/ and /t/ paths locally
```

---

## Walrus frontend (`polar.wal.app`)

The public UI on Walrus is a **separate deploy** from the org worker. The org worker embeds the same SPA for `*.workers.dev`, but `polar.wal.app` must be rebuilt and published to Walrus manually when frontend changes should go live there.

```bash
cd frontend
VITE_API_BASE='https://glacier.construct-computer.workers.dev/api' \
VITE_PORTAL_SUBDOMAIN_BASE='polar.ankush.one' \
VITE_MCP_URL='https://polar.ankush.one/mcp' \
  npm run build

../worker/walrus-deploy/walrus-deploy --folder dist --network mainnet --epochs max
```

Requires platform Sui wallet / WAL balance. Submodule: `worker/walrus-deploy/`.

---

## Local development

From repo root:

| Command | What it starts |
| --- | --- |
| `npm run setup:env` | Create `worker/.dev.vars`, `frontend/.env.*` from examples |
| `npm run install:all` | Install deps in worker, frontend, preview-worker, mcp |
| `npm run dev` | Worker `:8787` + frontend `:3000` (Vite proxies `/api` → worker) |
| `npm run dev:worker` | Worker only |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:preview` | Preview worker `:8788` (MCP at `/mcp` when `POLAR_API_BASE` set) |
| `npm run build:frontend` | Production frontend build (same env as deploy) |

Frontend local dev does **not** set `VITE_PORTAL_SUBDOMAIN_BASE` - preview links fall back to `/m/` `/t/` path-prefix against local preview worker.

### Preview UI locally (no GitHub OAuth)

GitHub login requires a registered OAuth app in `worker/.dev.vars`. For UI work without that setup:

1. Run `npm run setup:env` (creates or patches `DEV_AUTH_BYPASS=true` and frontend dev flags).
2. Ensure `worker/.dev.vars` has `JWT_SECRET` set and `DEV_AUTH_BYPASS=true`.
3. Ensure `frontend/.env.development` has:
   - `VITE_DEV_AUTH_BYPASS=true` - shows **Dev login (local)** on Dashboard / header
   - `VITE_DEV_MOCK_DATA=true` - populates Dashboard and Project detail with mock projects/deployments
4. `npm run dev`, open http://127.0.0.1:3000/dashboard, click **Dev login (local)**.

Worker exposes `POST /api/dev/login` only when `DEV_AUTH_BYPASS=true` (never set in production `wrangler.jsonc`).

---

## URL consistency checklist

When changing preview or portal URLs, keep these aligned:

| Location | Key |
| --- | --- |
| `worker/wrangler.jsonc` | `PORTAL_SUBDOMAIN_BASE`, `PORTAL_PUBLIC_ORIGIN` |
| `preview-worker/wrangler.jsonc` | `PORTAL_SUBDOMAIN_BASE`, `POLAR_API_BASE`, route pattern |
| `worker/package.json` `build:frontend` | `VITE_PORTAL_SUBDOMAIN_BASE`, `VITE_MCP_URL` |
| `frontend/.env.production` | `VITE_PORTAL_SUBDOMAIN_BASE`, `VITE_MCP_URL` |
| Walrus build command | `VITE_PORTAL_SUBDOMAIN_BASE` + `VITE_API_BASE` + `VITE_MCP_URL` |

API adds `viewUrl` on deployment responses via `withViewUrl()` in `worker/src/view-url.ts`. Frontend uses `viewUrl` from API first, then `portalViewUrl()` fallback in `frontend/src/lib/portal.ts`.

---

## Typical agent workflows

### Ship API + UI changes (most common)

```bash
# edit code
cd worker && npm run deploy
git add … && git commit -m "…" && git push
```

Push is for preview-worker CI if portal code under `worker/src/portal/` changed, or MCP code under `mcp/` / `preview-worker/` changed.

### Ship MCP / preview-worker changes

```bash
git add mcp/ preview-worker/ … && git commit -m "…" && git push
# wait for Cloudflare CI on personal account - do NOT wrangler deploy preview-worker
```

### Ship preview-worker-only changes (portal, no MCP)

```bash
git add preview-worker/ … && git commit -m "…" && git push
# wait for Cloudflare CI on personal account - do NOT wrangler deploy preview-worker
```

### Ship frontend to polar.wal.app

Build + `walrus-deploy` as above (manual, on-chain).

---

## Submodule note

`worker/walrus-deploy/` is a git submodule (HTTPS URL). Clone with `--recurse-submodules`. CI must use HTTPS submodule URLs, not SSH.
