# @polar/mcp

Hosted Polar MCP server library — Streamable HTTP transport and tool registry that proxies to the glacier REST API.

Production endpoint: **https://polar.ankush.one/mcp** (preview-worker apex only).

Unauthenticated **GET** returns documentation: HTML in a browser, Markdown for `curl`/agents (`Accept: text/markdown` or default fetch).

## Architecture

```
Cursor / Claude  →  polar.ankush.one/mcp  →  glacier /api/*  →  D1 + builds
                         (preview-worker)        (org worker)
```

The preview worker forwards the client's `Authorization: Bearer polar_live_…` header unchanged. API keys are validated on glacier.

## Tools (~25)

Full dashboard API parity via declarative registry in `src/tools.ts`:

| Category | Tools |
|----------|-------|
| Account | `polar_get_me`, `polar_get_github_status` |
| GitHub | `polar_list_repos`, branches, commits, detect, frameworks, contents |
| Projects | list, get, delete, deploy-latest |
| Secrets | list, set, import, delete |
| Deployments | deploy, list, get, delete, retry, redeploy, wait, logs |
| Cost | `polar_estimate_cost` |
| Platform | `polar_get_platform_wallet` |

## Agent workflows

1. **Deploy:** `polar_detect_repo_projects` → `polar_estimate_cost` → `polar_deploy` → `polar_wait_for_deployment`
2. **Rollback:** `polar_list_deployments` → `polar_redeploy_deployment`
3. **Secrets:** `polar_set_project_secret` / `polar_import_project_secrets` before deploy

## Local dev

```bash
# Terminal 1 — glacier API
npm run dev:worker   # :8787

# Terminal 2 — preview + MCP
# Set POLAR_API_BASE=http://127.0.0.1:8787/api in preview-worker/.dev.vars
npm run dev:preview  # :8788/mcp
```

Generate an API key from http://127.0.0.1:3000/agents (with `DEV_AUTH_BYPASS=true`) or use session JWT against glacier directly for `/api/agent-token`.

## Cursor config

```json
{
  "mcpServers": {
    "polar": {
      "url": "https://polar.ankush.one/mcp",
      "headers": {
        "Authorization": "Bearer polar_live_YOUR_KEY"
      }
    }
  }
}
```

Manage keys at [polar.wal.app/agents](https://polar.wal.app/agents) — never exposed via MCP tools.

## Deploy

MCP ships with **preview-worker** via GitHub → Cloudflare CI/CD (`git push main`). Glacier API changes use `cd worker && npm run deploy`.
