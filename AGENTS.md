# Agent instructions

## Deployments

### `preview-worker/` — do not deploy from CLI

The preview worker (`polar` on the personal Cloudflare account, e.g. `polar.ankushkun.workers.dev`) is **automatically deployed by CI/CD** when changes land on the connected Git branch.

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

This builds the frontend bundle for worker assets and runs `wrangler deploy --keep-vars` on the **org** Cloudflare account.

### Other pieces

| Piece | How it deploys |
| --- | --- |
| Frontend on Walrus (`polar.wal.app`) | Walrus site-builder / existing Polar Walrus flow — not via preview-worker or agent CLI |
| `preview-worker/` | GitHub → Cloudflare CI/CD only |
| `worker/` | Agent CLI: `cd worker && npm run deploy` |
