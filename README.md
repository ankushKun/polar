# Polar

Deploy static sites from GitHub to Walrus on Sui — no wallets, no WAL, no CLI.

Sign in with GitHub OAuth, pick a repo, and Polar builds and deploys it to Walrus on Sui. Each deployment gets a preview URL at `https://{siteId}.polar.ankush.one/` (mainnet or testnet — auto-detected). No SuiNS name required. Think Vercel, but for Web3.

**[polar.wal.app](https://polar.wal.app)** (the app itself is deployed via Polar)

---

## How it works

```
GitHub Repo → Cloudflare Container (build) → Walrus Site (deploy) → Polar preview portal ({id}.polar.ankush.one)
                    ↕
           Cloudflare Worker (API)
                    ↕
              D1 Database (SQLite)
                    ↕
           React SPA (Frontend)
```

1. **Sign in** with GitHub OAuth — no passwords, no Sui wallet needed
2. **Pick a repo** — Polar auto-detects framework (Next.js, Vite, Astro, Nuxt, SvelteKit, Remix, Angular, etc.) and package manager (npm, pnpm, yarn, bun)
3. **Configure** — branch, build dir, output dir, secrets (encrypted at rest), storage duration
4. **Deploy** — Polar clones the repo into an ephemeral Cloudflare Container, installs deps, builds, verifies the output, and publishes to Walrus
5. **Live** — preview at `https://{siteId}.polar.ankush.one/` (network auto-detected). Optionally assign SuiNS for `{name}.wal.app`.

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

---

## Project structure

```
├── frontend/                  # React 19 SPA (Vite + Tailwind CSS)
│   ├── src/pages/             # Home, Dashboard, Deploy, DeploymentDetail, ProjectDetail
│   ├── src/hooks/             # useAuth (OAuth + JWT), useSSE (live log streaming)
│   └── src/lib/               # API client, epoch math, ANSI rendering
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
│   ├── walrus-deploy/         # Git submodule: deploy wrapper for Walrus
│   ├── migrations/            # D1 SQL schema (6 migrations)
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
# ...repeat for migrations 0002 through 0006

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
| `FRONTEND_URL` | Yes | Redirect target (e.g. `https://polar.wal.app`) |
| `GITHUB_REDIRECT_URI` | Rec'd | Full callback URL; falls back to `{API_PUBLIC_URL}/api/github/callback` |
| `SUI_KEYSTORE` / `SUI_ADDRESS` | For deploy | Platform wallet for publishing sites |
| `SECRETS_ENCRYPTION_KEY` | For secrets | 32-byte AES key (base64) |
| `WEBHOOK_SECRET` | Optional | GitHub webhook HMAC verification |
| `PORTAL_PUBLIC_ORIGIN` | Yes (prod) | Preview portal apex (e.g. `https://polar.ankush.one`) |
| `PORTAL_SUBDOMAIN_BASE` | Yes (prod) | Preview host for site URLs (e.g. `polar.ankush.one` → `https://{base36}.polar.ankush.one/`) |

### Deployment previews (separate worker)

Polar splits **app/deploy** and **site preview** across two Cloudflare Workers:

| Worker | Account | Role |
|--------|---------|------|
| **glacier** (org) | Org | API, D1, build containers, Walrus deploy |
| **polar** (preview) | Personal | Walrus Sites portal at `{base36}.polar.ankush.one` |

- **UI:** [polar.wal.app](https://polar.wal.app) (Walrus + SuiNS)
- **Preview links:** `https://{base36}.polar.ankush.one/` (from API `viewUrl`; mainnet/testnet auto-detected)

The preview worker deploys via **GitHub → Cloudflare CI/CD** on the personal account (see [`preview-worker/README.md`](preview-worker/README.md)). Do not deploy it from CLI.

The public `wal.app` portal only serves mainnet sites with SuiNS names; Polar's preview worker resolves sites by object ID on both networks.

### Deploy to production

```bash
# Org worker (API + builder + embedded SPA)
cd worker
npm run deploy

# Frontend to Walrus (polar.wal.app)
cd ../frontend
VITE_API_BASE='https://your-org-worker.workers.dev/api' \
VITE_PORTAL_SUBDOMAIN_BASE='polar.ankush.one' \
  npm run build
../worker/walrus-deploy/walrus-deploy --folder dist --network mainnet --epochs max
```

---

## Security

- JWT sessions expire after 24 hours; OAuth state tokens expire after 10 minutes (anti-CSRF)
- Project secrets are AES-256-GCM encrypted in D1, bound per user+project
- Secret values are redacted from build logs (replaced with `[secret:NAME]`)
- Secrets are injected during install/build only — never during clone
- Reserved secret name prefixes blocked (`SUI_`, `CF_`, `POLAR_`, etc.)
- Static site output is verified for dangerous file types and executable permissions

---

## What's next

- **Polar MCP server** — an MCP (Model Context Protocol) integration so AI coding agents (Claude Code, Cursor, Copilot) can deploy directly to Walrus from their IDE. An agent builds your app, and with one tool call it's live on-chain.
- **Custom domains** via SuiNS — any `*.sui` name pointing to a Walrus Site object
- **Preview deployments** — per-PR ephemeral URLs that auto-expire

---

## License

MIT
