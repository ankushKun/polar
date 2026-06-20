import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Container } from '@cloudflare/containers'
import { BuildContainer } from './container'
import { requireAuth, authenticateRequest } from './request-auth'
import deploy from './routes/deploy'
import webhook from './routes/webhook'
import github from './routes/github'
import wallet from './routes/wallet'
import estimate from './routes/estimate'
import dev from './routes/dev'
import agentToken from './routes/agent-token'

export { BuildContainer }

export interface Env {
  DB: D1Database
  BUILD_CONTAINER: DurableObjectNamespace<Container>
  JWT_SECRET: string
  GITHUB_TOKEN?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  /** Full callback URL registered in the GitHub OAuth app (e.g. https://api.example.com/api/github/callback) */
  GITHUB_REDIRECT_URI?: string
  /** Worker public origin if GITHUB_REDIRECT_URI is omitted (callback becomes {API_PUBLIC_URL}/api/github/callback) */
  API_PUBLIC_URL?: string
  /** Frontend origin for post-login redirect (e.g. https://app.example.com) */
  FRONTEND_URL?: string
  /** Comma-separated extra CORS origins (e.g. Walrus-hosted frontend) */
  CORS_ORIGINS?: string
  WEBHOOK_SECRET?: string
  SECRETS_ENCRYPTION_KEY?: string
  SUI_KEYSTORE?: string
  SUI_ADDRESS?: string
  WALRUS_NETWORK?: string
  WALRUS_EPOCHS?: string
  /** Public origin for deployment preview links (separate preview worker) */
  PORTAL_PUBLIC_ORIGIN?: string
  /** e.g. polar.ankush.one - preview URLs become https://{base36}.{host}/ */
  PORTAL_SUBDOMAIN_BASE?: string
  /** Local only - enables POST /api/dev/login when "true" */
  DEV_AUTH_BYPASS?: string
}

const app = new Hono<{ Bindings: Env }>()

function trimOrigin(url: string | undefined): string | undefined {
  const trimmed = url?.trim().replace(/\/+$/, '')
  return trimmed || undefined
}

function allowedCorsOrigins(env: Env): Set<string> {
  const origins = new Set<string>()
  for (const value of [env.FRONTEND_URL, env.API_PUBLIC_URL]) {
    const origin = trimOrigin(value)
    if (origin) origins.add(origin)
  }
  for (const part of env.CORS_ORIGINS?.split(',') ?? []) {
    const origin = trimOrigin(part)
    if (origin) origins.add(origin)
  }
  return origins
}

app.use('*', cors({
  origin: (origin, c) => {
    if (!origin) return null
    const normalized = origin.replace(/\/+$/, '')
    return allowedCorsOrigins(c.env).has(normalized) ? origin : null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/api/me', async (c) => {
  const auth = await requireAuth(c)
  if (auth instanceof Response) return auth
  return c.json({
    user_id: auth.userAddress,
    github_login: auth.githubLogin,
  })
})

// Mount specific /api/* routers before broad /api deploy routes (deploy's auth middleware
// would otherwise intercept /api/github/login and /api/github/callback).
app.route('/api/github', github)
app.route('/api/webhook', webhook)
app.route('/api/dev', dev)
app.route('/api', agentToken)
app.route('/api', deploy)
app.route('/api', wallet)
app.route('/api', estimate)

app.get('/health', (c) => c.json({ ok: true }))

export default app
