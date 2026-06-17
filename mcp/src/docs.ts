export const MCP_DOCS_URL = 'https://polar.ankush.one/mcp'
export const AGENTS_URL = 'https://polar.wal.app/agents'
export const API_BASE = 'https://glacier.construct-computer.workers.dev/api'

export function mcpDocsMarkdown(): string {
  return `# Polar MCP

Hosted [Model Context Protocol](https://modelcontextprotocol.io) server for deploying sites to Walrus from AI agents (Cursor, Claude Desktop, etc.).

**Endpoint:** \`${MCP_DOCS_URL}\`  
**Transport:** Streamable HTTP (remote \`url\` + \`headers\` in client config)

## Quick start

1. Sign in at [polar.wal.app](https://polar.wal.app) and link GitHub.
2. Open [${AGENTS_URL}](${AGENTS_URL}) and **Generate API key** (\`polar_live_…\`).
3. Add to \`.cursor/mcp.json\` (or Claude Desktop MCP config):

\`\`\`json
{
  "mcpServers": {
    "polar": {
      "url": "${MCP_DOCS_URL}",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
\`\`\`

For team repos, use \`"Authorization": "Bearer \${env:POLAR_API_KEY}"\` and set the env var locally.

## Authentication

All MCP tool calls require:

\`\`\`
Authorization: Bearer polar_live_…
\`\`\`

Keys are long-lived (one per account; regenerate replaces the old key). Manage keys only in the dashboard — not via MCP tools.

REST API base (proxied by tools): \`${API_BASE}\`

## What agents can do

~25 tools with full dashboard parity:

- **Account** — verify key, GitHub link status
- **GitHub** — list repos, branches, commits, detect frameworks/projects, browse contents
- **Projects** — list, get, delete, deploy latest
- **Secrets** — list names, set/import/delete (values never returned)
- **Deployments** — deploy, list, get, retry, redeploy, wait for completion, fetch logs
- **Cost** — estimate WAL/SUI before publish

Typical flow: \`polar_detect_repo_projects\` → \`polar_estimate_cost\` → \`polar_deploy\` → \`polar_wait_for_deployment\`

## Protocol notes

- **POST** to this URL with \`Authorization\` and JSON-RPC body for MCP sessions.
- **GET** without auth (this page) returns human or agent documentation.
- Live build logs use polling (\`polar_get_deployment_logs\`, \`polar_wait_for_deployment\`) — not SSE.

## Links

- Dashboard: [polar.wal.app](https://polar.wal.app)
- API keys: [${AGENTS_URL}](${AGENTS_URL})
- GitHub: [github.com/ankushKun/polar](https://github.com/ankushKun/polar)
`
}

export function wantsMcpDocsHtml(request: Request): boolean {
  const secDest = request.headers.get('Sec-Fetch-Dest')
  const secMode = request.headers.get('Sec-Fetch-Mode')
  if (secDest === 'document' || secMode === 'navigate') return true

  const accept = request.headers.get('Accept') ?? ''
  if (!accept.includes('text/html')) return false

  const htmlQ = acceptQuality(accept, 'text/html')
  const mdQ = Math.max(acceptQuality(accept, 'text/markdown'), acceptQuality(accept, 'text/x-markdown'))
  return htmlQ >= mdQ
}

function acceptQuality(accept: string, media: string): number {
  const parts = accept.split(',').map((p) => p.trim())
  for (const part of parts) {
    const [type, ...params] = part.split(';').map((s) => s.trim())
    if (type === media || type === '*/*') {
      const qParam = params.find((p) => p.startsWith('q='))
      return qParam ? Number.parseFloat(qParam.slice(2)) : 1
    }
  }
  return 0
}

export function shouldServeMcpDocs(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false
  if (request.headers.get('Authorization')) return false
  const accept = request.headers.get('Accept') ?? ''
  if (accept.includes('application/json') && !accept.includes('text/html')) return false
  return true
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function markdownToSimpleHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inCode = false
  let codeLang = ''
  let inList = false

  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) {
        closeList()
        codeLang = line.slice(3).trim()
        inCode = true
        out.push(`<pre><code class="lang-${escapeHtml(codeLang || 'text')}">`)
      } else {
        inCode = false
        out.push('</code></pre>')
      }
      continue
    }
    if (inCode) {
      out.push(`${escapeHtml(line)}\n`)
      continue
    }

    if (line.startsWith('# ')) {
      closeList()
      out.push(`<h1>${inlineMd(line.slice(2))}</h1>`)
    } else if (line.startsWith('## ')) {
      closeList()
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`)
    } else if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inlineMd(line.slice(2))}</li>`)
    } else if (line.trim() === '') {
      closeList()
    } else {
      closeList()
      out.push(`<p>${inlineMd(line)}</p>`)
    }
  }
  closeList()
  if (inCode) out.push('</code></pre>')
  return out.join('\n')
}

function inlineMd(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  return s
}

export function mcpDocsHtml(): string {
  const body = markdownToSimpleHtml(mcpDocsMarkdown())
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Polar MCP — ${MCP_DOCS_URL}</title>
  <meta name="description" content="Hosted Model Context Protocol server for deploying to Walrus from AI agents." />
  <style>
    :root { color-scheme: dark; --bg: #0c0f14; --surface: #151a22; --text: #e8eaed; --muted: #9aa3b2; --accent: #6eb5ff; --border: #2a3140; --code-bg: #1a2030; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .wrap { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
    header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
    .badge { display: inline-block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.5rem; }
    h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
    .endpoint { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85rem; color: var(--muted); word-break: break-all; }
    h2 { font-size: 1.1rem; margin: 2rem 0 0.75rem; color: var(--text); }
    p { margin: 0.75rem 0; color: var(--muted); }
    ul { margin: 0.5rem 0 1rem; padding-left: 1.25rem; color: var(--muted); }
    li { margin: 0.35rem 0; }
    li strong { color: var(--text); }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem 1.1rem; overflow-x: auto; font-size: 0.8rem; line-height: 1.5; margin: 1rem 0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.88em; }
    p code, li code { background: var(--code-bg); padding: 0.12em 0.35em; border-radius: 0.25rem; }
    .cta { display: inline-block; margin-top: 1.5rem; padding: 0.65rem 1.1rem; background: #2563eb; color: #fff !important; border-radius: 0.5rem; font-weight: 500; font-size: 0.9rem; text-decoration: none !important; }
    .cta:hover { background: #1d4ed8; }
    footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.8rem; color: var(--muted); }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="badge">Polar · Model Context Protocol</div>
      <h1>Deploy to Walrus from your agent</h1>
      <div class="endpoint">${escapeHtml(MCP_DOCS_URL)}</div>
      <a class="cta" href="${AGENTS_URL}">Get API key →</a>
    </header>
    <main>${body}</main>
    <footer>Markdown for agents: <code>curl -H 'Accept: text/markdown' ${MCP_DOCS_URL}</code></footer>
  </div>
</body>
</html>`
}

export function serveMcpDocs(request: Request): Response {
  if (wantsMcpDocsHtml(request)) {
    const html = mcpDocsHtml()
    if (request.method === 'HEAD') {
      return new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': String(new TextEncoder().encode(html).length) },
      })
    }
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    })
  }

  const md = mcpDocsMarkdown()
  if (request.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Length': String(new TextEncoder().encode(md).length) },
    })
  }
  return new Response(md, {
    status: 200,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
}
