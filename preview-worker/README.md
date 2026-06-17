# Polar preview worker

Walrus Sites portal - serves deployed Polar sites at:

- **Primary:** `https://{base36SiteId}.polar.ankush.one/` (mainnet **or** testnet - auto-detected from chain)
- **MCP (apex only):** `https://polar.ankush.one/mcp` — hosted Polar MCP (Streamable HTTP)
- **Legacy:** `/m/{id}/` and `/t/{id}/` on workers.dev

Deploy via **GitHub → Cloudflare CI/CD** (personal account). Do not deploy from CLI - see [`../AGENTS.md`](../AGENTS.md).

The org worker sets `PORTAL_SUBDOMAIN_BASE=polar.ankush.one` so API `viewUrl` uses subdomain links. MCP tool calls proxy to glacier via `POLAR_API_BASE`.

## Custom domain (ankush.one)

Use a **scoped** wildcard - not `*.ankush.one/*` (that catches every subdomain on your domain).

| Step | Value |
| --- | --- |
| DNS | Proxied `AAAA` record: name `*.polar` → `100::` (creates `*.polar.ankush.one`) |
| Worker route | **Route pattern:** `*.polar.ankush.one/*` (Workers & Pages → your worker → Domains & Routes) |
| Optional apex | Custom domain `polar.ankush.one` for health/info JSON |

**Troubleshooting 404 / “site not found”**

1. **DNS must exist for `*.polar.ankush.one`** - the apex custom domain `polar.ankush.one` alone is not enough. In the **ankush.one** zone add:
   - Type: `AAAA`, Name: `*.polar`, Content: `100::`, Proxy: **Proxied** (orange cloud)
2. **Route pattern** must be `*.polar.ankush.one/*` (not `*polar.ankush.one/*`).
3. Verify: `dig @1.1.1.1 {yourSiteId}.polar.ankush.one A` should return Cloudflare IPs (not empty).
4. Verify worker: `curl -sI https://polar.ankush.one/health` → **200**. With DNS fixed, site URLs → **200** + HTML.

The portal code is working - without wildcard DNS, subdomains never reach the worker (or hit the wrong Cloudflare handler).

```jsonc
"vars": {
  "PORTAL_SUBDOMAIN_BASE": "polar.ankush.one",
  "POLAR_API_BASE": "https://glacier.construct-computer.workers.dev/api"
}
```

### Hosted MCP (`/mcp`)

- **URL:** `https://polar.ankush.one/mcp` (apex custom domain only — site subdomains return 404)
- **Auth:** `Authorization: Bearer polar_live_…` (validated on glacier; keys from `/agents` UI)
- **Implementation:** [`../mcp/`](../mcp/) package imported by this worker

Verify after deploy:

```bash
curl -sI https://polar.ankush.one/mcp
# Expect 401 (missing auth) or MCP response — not 404
```

Local dev: set `POLAR_API_BASE=http://127.0.0.1:8787/api` in `preview-worker/.dev.vars`, run `npm run dev:preview`, MCP at `http://127.0.0.1:8788/mcp`.

### How network detection works

For `{base36}.polar.ankush.one`, the worker:

1. Decodes base36 → Sui object ID
2. Checks mainnet and testnet RPC in parallel for that object
3. Serves from whichever chain has the site (same URL for both networks)

No `/m/` vs `/t/` in the URL - object IDs only exist on one chain.

### CI/CD build settings

**Build command:** `npm ci --prefix preview-worker`

**Deploy command:** `npx wrangler deploy --config preview-worker/wrangler.jsonc`

## Local dev

```bash
npm run dev   # http://localhost:8788 - use /m/ and /t/ paths locally
```

From repo root: `npm run dev:preview`

## Test URLs

| Site | URL |
| --- | --- |
| Polar (mainnet deploy) | `https://1f1itb0yx8w7mjw50qp0oyikwcu9ysgn9xwvm5v21nk3kiu3wj.polar.ankush.one/` |
| Walrus mainnet landing | `https://46f3881sp4r55fc6pcao9t93bieeejl4vr4k2uv8u4wwyx1a93.polar.ankush.one/` |
| Walrus testnet landing | `https://1p3repujoigwcqrk0w4itsxm7hs7xjl4hwgt3t0szn6evad83q.polar.ankush.one/` |
| Health (apex) | `https://polar.ankush.one/health` |
| MCP (apex) | `https://polar.ankush.one/mcp` |

Legacy path-prefix (workers.dev):

```bash
curl -sI "https://polar.ankushkun.workers.dev/m/46f3881sp4r55fc6pcao9t93bieeejl4vr4k2uv8u4wwyx1a93/"
```

### Local tests

```bash
npm run test:portal
npm run test:url-rewrite
```

Portal implementation lives in [`../worker/src/portal/`](../worker/src/portal/) and is shared via source import (no duplicate code).
