# Agent instructions

## Deployments

### `preview-worker/` — do not deploy from CLI

The preview worker (`polar` on the personal Cloudflare account) is **automatically deployed by CI/CD** when changes land on the connected Git branch. Production portal: `https://{base36SiteId}.polar.ankush.one/` (mainnet/testnet auto-detected).

**Never run** any of these as an agent:

- `npm run deploy:preview`
- `npx wrangler deploy --config preview-worker/wrangler.jsonc`
- `cd preview-worker && npm run deploy`

To ship preview-worker changes: commit and push to the repo; the GitHub → Cloudflare pipeline deploys to the correct account.

See [`preview-worker/README.md`](preview-worker/README.md) for CI build/deploy command configuration only — not for manual agent deploys.

### `worker/` — the only CLI deploy agents should run

The org backend worker (API, D1, build containers, Walrus deploy) is deployed manually from CLI:

```bash
cd worker && npm run deploy
```

This builds the frontend bundle (with `VITE_API_BASE=/api` and `VITE_PORTAL_SUBDOMAIN_BASE=polar.ankush.one`) and runs `wrangler deploy --keep-vars` on the **org** Cloudflare account.

Org worker vars for preview URLs:

- `PORTAL_SUBDOMAIN_BASE=polar.ankush.one` — API `viewUrl` becomes `https://{base36}.polar.ankush.one/`
- `PORTAL_PUBLIC_ORIGIN=https://polar.ankush.one` — fallback origin

### Other pieces

| Piece | How it deploys |
| --- | --- |
| Frontend on Walrus (`polar.wal.app`) | Walrus site-builder; build with `VITE_PORTAL_SUBDOMAIN_BASE=polar.ankush.one` |
| `preview-worker/` | GitHub → Cloudflare CI/CD only |
| `worker/` | Agent CLI: `cd worker && npm run deploy` |
