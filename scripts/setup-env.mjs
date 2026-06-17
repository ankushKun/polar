#!/usr/bin/env node
/**
 * Bootstrap local env files from examples. Skips files that already exist.
 * Run: npm run setup:env
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
    `# Local wrangler dev secrets — not committed. See .dev.vars.example for field docs.

JWT_SECRET=${jwt}
SECRETS_ENCRYPTION_KEY=${enc}

# GitHub OAuth — callback http://127.0.0.1:8787/api/github/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

FRONTEND_URL=http://127.0.0.1:3000
API_PUBLIC_URL=http://127.0.0.1:8787

# Uncomment for local build/deploy (copy from Cloudflare worker secrets)
# SUI_KEYSTORE=
# SUI_ADDRESS=
# WEBHOOK_SECRET=
`,
  )
})

ensure(join(root, 'frontend/.env.development'), () => {
  copyFileSync(join(root, 'frontend/.env.development.example'), join(root, 'frontend/.env.development'))
})

ensure(join(root, 'frontend/.env.production'), () => {
  writeFileSync(join(root, 'frontend/.env.production'), 'VITE_API_BASE=/api\n')
})

const devVars = join(root, 'worker/.dev.vars')
if (existsSync(devVars)) {
  const text = readFileSync(devVars, 'utf8')
  if (/^GITHUB_CLIENT_ID=\s*$/m.test(text) || /^GITHUB_CLIENT_ID=$/m.test(text)) {
    console.log('\nNext: add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to worker/.dev.vars for OAuth login.')
  }
}
