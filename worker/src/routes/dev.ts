import { Hono } from 'hono'
import type { Env } from '..'
import { createSessionJwt } from '../auth'

const DEV_USER_ID = 'github:dev-local'
const DEV_GITHUB_LOGIN = 'dev-local'

const LOCAL_ORIGINS = new Set([
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
])

function isDevBypassEnabled(env: Env): boolean {
  return env.DEV_AUTH_BYPASS?.trim().toLowerCase() === 'true'
}

function isAllowedDevOrigin(origin: string | undefined, env: Env): boolean {
  if (!origin) return true
  const normalized = origin.replace(/\/+$/, '')
  if (LOCAL_ORIGINS.has(normalized)) return true
  const frontend = env.FRONTEND_URL?.trim().replace(/\/+$/, '')
  return !!frontend && normalized === frontend
}

const router = new Hono<{ Bindings: Env }>()

router.post('/login', async (c) => {
  if (!isDevBypassEnabled(c.env)) {
    return c.json({ error: 'not found' }, 404)
  }

  const origin = c.req.header('Origin')
  if (!isAllowedDevOrigin(origin, c.env)) {
    return c.json({ error: 'forbidden origin' }, 403)
  }

  const secret = c.env.JWT_SECRET
  if (!secret) {
    return c.json({ error: 'JWT_SECRET not configured' }, 500)
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO github_tokens (user_address, access_token, github_user, updated_at)
       VALUES (?1, ?2, ?3, datetime('now'))
       ON CONFLICT(user_address) DO UPDATE SET
         access_token = excluded.access_token,
         github_user = excluded.github_user,
         updated_at = datetime('now')`,
    )
      .bind(DEV_USER_ID, 'dev-token', DEV_GITHUB_LOGIN)
      .run()
  } catch {
    // Local D1 may not be migrated yet; the session JWT is enough for dev UI preview.
  }

  const token = await createSessionJwt(
    { userId: DEV_USER_ID, githubLogin: DEV_GITHUB_LOGIN },
    secret,
  )

  return c.json({ token })
})

export default router
