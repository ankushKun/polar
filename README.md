# Polar

Polar is a one-click deployment platform that bridges the Web2 developer experience with Web3 infrastructure.

**Live:** [polar.wal.app](https://polar.wal.app) · **Demo:** [youtu.be/abcdwxyz](https://youtu.be/abcdwxyz) · **Repo:** [github.com/ankushKun/polar](https://github.com/ankushKun/polar)

Sign in with GitHub, pick a repository, and Polar handles everything:

- **Auto-detect** the framework (Next.js, Vite, Astro, Nuxt, SvelteKit, Remix, Angular, 8+ frameworks)
- **Build** the static output with encrypted project secrets injected at runtime
- **Verify** the output is a safe, valid static site (executable detection, size checks)
- **Deploy to Walrus:** auto-calculate gas budget, create the Walrus Site object via [walrus-deploy](https://github.com/ankushKun/walrus-deploy)
- **Return a live preview URL** with the Site ID, complete with SPA routing support

The user never touches a Sui wallet, never buys WAL, never runs a CLI command. Everything is managed by the platform with top-tier developer experience.

Polar removes the single biggest barrier to Walrus adoption: developer experience. By giving every dev a Vercel-like workflow for decentralized deployment, Polar turns Walrus from a protocol into a platform. Any React, Vue, Svelte, or static site can go from GitHub to a permanent URL in under 60 seconds. No Web3 knowledge required.

**Agent-native:** Connect Cursor or Claude to our hosted MCP at [polar.ankush.one/mcp](https://polar.ankush.one/mcp) — full deploy API parity, no local install. Generate an API key at [/agents](https://polar.wal.app/agents).

---

## Key innovations

### [walrus-deploy](https://github.com/ankushKun/walrus-deploy)

Our custom wrapper over `site-builder`, with quality-of-life improvements and better developer experience. It powers every Walrus deploy in Polar (see [`worker/walrus-deploy/`](worker/walrus-deploy/)).

- SPA auto-detection and `ws-resources.json` generation
- MIME-type mapping and cache headers for hashed assets
- CI wallet injection via `SUI_KEYSTORE` + `SUI_ADDRESS`
- Dry-run mode and formatted deploy summaries with Base36 preview URLs

### Cost estimation

Pre-deploy builds run in the container to calculate exact WAL and SUI costs before committing. No surprise costs.

### Dogfooding

Polar itself is deployed via Polar with SuiNS at [polar.wal.app](https://polar.wal.app).

### Hosted agent MCP

Polar exposes a **hosted Model Context Protocol** server for AI agents (Cursor, Claude Desktop, etc.):

| Surface | URL | Role |
|---------|-----|------|
| **MCP endpoint** | `https://polar.ankush.one/mcp` | Streamable HTTP; ~25 tools proxying to REST API |
| **API + keys** | glacier worker `/api/*` | Auth, builds, Walrus deploy; API keys in D1 |
| **Key management** | [polar.wal.app/agents](https://polar.wal.app/agents) | Generate/regenerate `polar_live_…` keys + `mcp.json` |

```
Cursor / Claude  →  polar.ankush.one/mcp  →  glacier.construct-computer.workers.dev/api
                         (preview worker)              (org worker)
```

- **Auth:** `Authorization: Bearer polar_live_…` (long-lived API key, one per account)
- **No install:** remote MCP URL + headers in `.cursor/mcp.json`
- **Deploy split:** MCP changes ship via **git push** (preview-worker CI); API/agents UI via `cd worker && npm run deploy`

See [`mcp/README.md`](mcp/README.md) for tool list and agent workflows.

---

## How it works

```
GitHub Repo → Cloudflare Container (build) → Walrus Site (deploy) → Polar preview portal ({id}.polar.ankush.one)
                    ↕
           Cloudflare Worker (API + agent API keys)
                    ↕
              D1 Database (SQLite)
                    ↕
           React SPA (Frontend + /agents MCP config)

AI agents → polar.ankush.one/mcp (preview worker) → same API
```

1. **Sign in** with GitHub OAuth - no passwords, no Sui wallet needed
2. **Pick a repo** - Polar auto-detects framework (Next.js, Vite, Astro, Nuxt, SvelteKit, Remix, Angular, etc.) and package manager (npm, pnpm, yarn, bun)
3. **Configure** - branch, build dir, output dir, secrets (encrypted at rest), storage duration
4. **Deploy** - Polar clones the repo into an ephemeral Cloudflare Container, installs deps, builds, verifies the output, and publishes to Walrus
5. **Live** - preview at `https://{siteId}.polar.ankush.one/` (network auto-detected). Optionally assign SuiNS for `{name}.wal.app`.

On push to main, webhooks auto-redeploy. Build logs stream in real-time via SSE. Every deployment is pinned to an exact Git commit SHA for verifiable provenance.

---

## Features

| Feature | |
|---------|---|
| **Framework auto-detection** | Next.js, Vite, Astro, Nuxt, Gatsby, SvelteKit, Remix, Angular, + generic React/static |
| **Monorepo support** | Discovers all `package.json` files with build scripts across the repo tree |
| **Commit-pinned deploys** | Deploy any branch or specific commit; full metadata saved per deployment |
| **Project secrets** | AES-256-GCM encrypted env vars, injected during build only, redacted from logs |
| **Cost estimation** | Runs a full build to calculate exact WAL and SUI costs before deploying |
| **Auto WAL management** | On testnet, auto-exchanges SUI→WAL if platform balance is low |
| **GitHub webhooks** | Push to main → auto-redeploy (HMAC-SHA256 verified) |
| **Live log streaming** | Real-time SSE logs from the build container with ANSI color rendering |
| **Retry + redeploy** | Retry failed deploys with same config; redeploy from any completed deployment |
| **Static site verification** | Post-build check for dangerous files (executables, scripts, binaries) |
| **Agent MCP** | Hosted at `polar.ankush.one/mcp` — deploy, secrets, logs, GitHub discovery (~25 tools) |
| **API keys** | Long-lived `polar_live_…` tokens for agents; manage at `/agents` |

---

## Project structure

```
├── frontend/                  # React 19 SPA (Vite + Tailwind CSS)
│   ├── src/pages/             # Home, Dashboard, Deploy, Agents, DeploymentDetail, ProjectDetail
│   ├── src/hooks/             # useAuth (OAuth + JWT), useSSE (live log streaming)
│   └── src/lib/               # API client, epoch math, ANSI rendering, MCP config helper
├── mcp/                       # Shared MCP library (Streamable HTTP + tool registry)
│   └── src/                   # handler, polar-client, tools (~25 REST proxies)
├── worker/
│   ├── src/                   # Cloudflare Worker (Hono API)
│   │   ├── routes/            # deploy, estimate, github, wallet, webhook
│   │   ├── auth.ts            # JWT + OAuth state signing (HS256)
│   │   ├── db.ts              # D1 CRUD (projects, deployments, secrets, tokens)
│   │   ├── secrets.ts         # AES-256-GCM encrypt/decrypt, env file parsing
│   │   └── auto-detect.ts     # GitHub API-based framework detection
│   ├── build-server/          # Runs inside the Cloudflare Container (Hono, port 8080)
│   │   ├── builder.ts         # Clone → install → build → verify
│   │   ├── deployer.ts        # SUI/WAL balance check → exchange → site-builder deploy
│   │   └── detector.ts        # Filesystem-based framework detection
│   ├── walrus-deploy/         # Git submodule: [walrus-deploy](https://github.com/ankushKun/walrus-deploy) deploy wrapper
│   ├── migrations/            # D1 SQL schema (7 migrations incl. agent_api_tokens)
│   └── Dockerfile             # Container image (node:22-slim + git + pnpm/yarn/bun + sui/walrus CLI)
```

---

## Tech stack

| Layer | |
|-------|---|
| Frontend | React 19, Vite 6, Tailwind CSS 3, TypeScript 5, React Router v7, TanStack Query |
| API | Cloudflare Workers (Hono v4, TypeScript) |
| Database | Cloudflare D1 (SQLite at edge) |
| Build sandbox | Cloudflare Containers (Durable Objects + Docker, Node 22) |
| Blockchain | Sui (testnet + mainnet), Walrus, `site-builder`, `walrus` CLI |
| Auth | GitHub OAuth, JWT sessions (24h), CSRF-protected state |

---

## Prerequisites

- **Cloudflare Workers Paid plan** (Containers + Durable Objects require paid tier)
- Node.js 18+ and `npx wrangler` authenticated to Cloudflare
- A GitHub OAuth App with the callback URL set
- A Sui wallet with keystore for the platform deployer
- WAL tokens for mainnet deploys (testnet auto-exchanges SUI→WAL)

---

## Quick start

```bash
git clone --recurse-submodules https://github.com/ankushKun/polar.git
cd polar

# Apply D1 migrations
cd worker
npx wrangler d1 execute glacier-db --local --file=migrations/0001_initial.sql
# ...repeat for migrations 0002 through 0007

# Preview worker local MCP (optional)
# echo 'POLAR_API_BASE=http://127.0.0.1:8787/api' > preview-worker/.dev.vars

# Copy and fill secrets
cp .dev.vars.example .dev.vars

# Start dev servers
npm run dev        # Worker on :8787
cd ../frontend && npm run dev   # Frontend on :5173 with /api proxied to :8787
```

---

## Configuration

### Worker vars

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | Yes | Session signing (HS256) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Yes | OAuth App credentials |
| `FRONTEND_URL` | Yes | Post-login redirect (e.g. `https://polar.wal.app`) |
| `API_PUBLIC_URL` | Yes | Worker origin (e.g. `https://glacier.construct-computer.workers.dev`) |
| `GITHUB_REDIRECT_URI` | Rec'd | `https://glacier.construct-computer.workers.dev/api/github/callback` (match GitHub app) |
| `CORS_ORIGINS` | Yes (Walrus UI) | `https://polar.wal.app` |
| `SUI_KEYSTORE` / `SUI_ADDRESS` | For deploy | Platform wallet for publishing sites |
| `SECRETS_ENCRYPTION_KEY` | For secrets | 32-byte AES key (base64) |
| `WEBHOOK_SECRET` | Optional | GitHub webhook HMAC verification |
| `PORTAL_PUBLIC_ORIGIN` | Yes (prod) | Preview portal apex (e.g. `https://polar.ankush.one`) |
| `PORTAL_SUBDOMAIN_BASE` | Yes (prod) | Preview host for site URLs (e.g. `polar.ankush.one` → `https://{base36}.polar.ankush.one/`) |

### Deployment previews (separate worker)

Polar splits **app/deploy** and **site preview** across two Cloudflare Workers:

| Worker | Account | Role |
|--------|---------|------|
| **glacier** (org) | Org | API, D1, build containers, Walrus deploy, `/agents` UI |
| **polar** (preview) | Personal | Walrus Sites portal + **hosted MCP** at `polar.ankush.one/mcp` |

- **UI:** [polar.wal.app](https://polar.wal.app) (Walrus + SuiNS)
- **Preview links:** `https://{base36}.polar.ankush.one/` (from API `viewUrl`; mainnet/testnet auto-detected)

The preview worker deploys via **GitHub → Cloudflare CI/CD** on the personal account (see [`preview-worker/README.md`](preview-worker/README.md)). Do not deploy it from CLI. MCP endpoint changes require **commit + push to `main`**.

| Change | Deploy path |
|--------|-------------|
| API keys, `/agents`, landing, glacier API | `cd worker && npm run deploy` |
| `/mcp` endpoint, `mcp/` package | **push to `main`** (preview-worker CI) |

The public `wal.app` portal only serves mainnet sites with SuiNS names; Polar's preview worker resolves sites by object ID on both networks.

### Deploy to production

```bash
# Org worker (API + builder + embedded SPA)
cd worker
npm run deploy

# Frontend to Walrus (polar.wal.app)
cd ../frontend
VITE_API_BASE='https://glacier.construct-computer.workers.dev/api' \
VITE_PORTAL_SUBDOMAIN_BASE='polar.ankush.one' \
VITE_MCP_URL='https://polar.ankush.one/mcp' \
  npm run build
../worker/walrus-deploy/walrus-deploy --folder dist --network mainnet --epochs max
```

---

## Security

- JWT sessions expire after 24 hours; OAuth state tokens expire after 10 minutes (anti-CSRF)
- Project secrets are AES-256-GCM encrypted in D1, bound per user+project
- Secret values are redacted from build logs (replaced with `[secret:NAME]`)
- Secrets are injected during install/build only - never during clone
- Reserved secret name prefixes blocked (`SUI_`, `CF_`, `POLAR_`, etc.)
- Static site output is verified for dangerous file types and executable permissions

---

## What's next

- **In-app SuiNS integration** so users can assign a Site ID to their SuiNS names without leaving Polar
- **CI/CD webhooks** for auto-deploy whenever changes are pushed to GitHub

---

## License

MIT
