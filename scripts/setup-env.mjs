#!/usr/bin/env node
/**
 * Bootstrap local env files from examples. Skips files that already exist.
 * Run: npm run setup:env
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function ensure(path, create) {
  if (existsSync(path)) {
    console.log(`skip  ${path} (already exists)`)
    return
  }
  mkdirSync(dirname(path), { recursive: true })
  create()
  console.log(`create ${path}`)
}

ensure(join(root, 'worker/.dev.vars'), () => {
  const jwt = randomBytes(32).toString('hex')
  const enc = randomBytes(32).toString('base64')
  writeFileSync(
    join(root, 'worker/.dev.vars'),
    `# Local wrangler dev secrets - not committed. See .dev.vars.example for field docs.

JWT_SECRET=${jwt}
SECRETS_ENCRYPTION_KEY=${enc}

# GitHub OAuth - callback http://127.0.0.1:8787/api/github/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

FRONTEND_URL=http://127.0.0.1:3000
API_PUBLIC_URL=http://127.0.0.1:8787
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8787,https://polar.wal.app

DEV_AUTH_BYPASS=true

# Uncomment for local build/deploy (copy from Cloudflare worker secrets)
# SUI_KEYSTORE=
# SUI_ADDRESS=
# WEBHOOK_SECRET=
`,
  )
})

ensure(join(root, 'frontend/.env.development'), () => {
  writeFileSync(
    join(root, 'frontend/.env.development'),
    `# Vite dev - /api proxied to worker :8787
VITE_DEV_AUTH_BYPASS=true
VITE_DEV_MOCK_DATA=true
`,
  )
})

ensure(join(root, 'frontend/.env.production'), () => {
  writeFileSync(
    join(root, 'frontend/.env.production'),
    'VITE_API_BASE=/api\nVITE_PORTAL_SUBDOMAIN_BASE=polar.ankush.one\nVITE_MCP_URL=https://polar.ankush.one/mcp\n',
  )
})

const devVars = join(root, 'worker/.dev.vars')
if (existsSync(devVars)) {
  let text = readFileSync(devVars, 'utf8')
  if (!/^DEV_AUTH_BYPASS=/m.test(text)) {
    text = `${text.trimEnd()}\nDEV_AUTH_BYPASS=true\n`
    writeFileSync(devVars, text)
    console.log('patch worker/.dev.vars (added DEV_AUTH_BYPASS=true)')
  }
  if (/^GITHUB_CLIENT_ID=\s*$/m.test(text) || /^GITHUB_CLIENT_ID=$/m.test(text)) {
    console.log('\nNext: add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to worker/.dev.vars for OAuth login.')
    console.log('Or use Dev login (local) when DEV_AUTH_BYPASS=true - no GitHub app required.')
  }
}

const feDev = join(root, 'frontend/.env.development')
if (existsSync(feDev)) {
  let text = readFileSync(feDev, 'utf8')
  let patched = false
  if (!/^VITE_DEV_AUTH_BYPASS=/m.test(text)) {
    text = `${text.trimEnd()}\nVITE_DEV_AUTH_BYPASS=true\n`
    patched = true
  }
  if (!/^VITE_DEV_MOCK_DATA=/m.test(text)) {
    text = `${text.trimEnd()}\nVITE_DEV_MOCK_DATA=true\n`
    patched = true
  }
  if (patched) {
    writeFileSync(feDev, text)
    console.log('patch frontend/.env.development (added dev preview flags)')
  }
}
