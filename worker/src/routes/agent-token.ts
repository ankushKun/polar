import { Hono } from 'hono'
import type { Env } from '..'
import { requireSessionJwt } from '../request-auth'
import {
  agentTokenPrefix,
  generateAgentApiToken,
  hashAgentApiToken,
} from '../agent-api-token'

const router = new Hono<{ Bindings: Env }>()

router.get('/agent-token', async (c) => {
  const auth = await requireSessionJwt(c)
  if (auth instanceof Response) return auth

  const row = await c.env.DB
    .prepare('SELECT token_prefix, created_at FROM agent_api_tokens WHERE user_address = ?1')
    .bind(auth.userAddress)
    .first<{ token_prefix: string; created_at: string }>()

  if (!row) {
    return c.json({ configured: false, prefix: null, createdAt: null })
  }

  return c.json({
    configured: true,
    prefix: row.token_prefix,
    createdAt: row.created_at,
  })
})

router.post('/agent-token', async (c) => {
  const auth = await requireSessionJwt(c)
  if (auth instanceof Response) return auth

  const token = generateAgentApiToken()
  const tokenHash = await hashAgentApiToken(token)
  const prefix = agentTokenPrefix(token)

  await c.env.DB
    .prepare(
      `INSERT INTO agent_api_tokens (user_address, token_hash, token_prefix, created_at)
       VALUES (?1, ?2, ?3, datetime('now'))
       ON CONFLICT(user_address) DO UPDATE SET
         token_hash = excluded.token_hash,
         token_prefix = excluded.token_prefix,
         created_at = datetime('now')`,
    )
    .bind(auth.userAddress, tokenHash, prefix)
    .run()

  const row = await c.env.DB
    .prepare('SELECT created_at FROM agent_api_tokens WHERE user_address = ?1')
    .bind(auth.userAddress)
    .first<{ created_at: string }>()

  return c.json({
    token,
    prefix,
    createdAt: row?.created_at ?? new Date().toISOString(),
  })
})

router.delete('/agent-token', async (c) => {
  const auth = await requireSessionJwt(c)
  if (auth instanceof Response) return auth

  await c.env.DB
    .prepare('DELETE FROM agent_api_tokens WHERE user_address = ?1')
    .bind(auth.userAddress)
    .run()

  return c.json({ ok: true })
})

export default router
