import type { Env } from './index'
import { verifyJwt } from './auth'
import { hashAgentApiToken, isAgentApiToken } from './agent-api-token'

export type AuthUser = {
  userAddress: string
  githubLogin: string | null
  via: 'jwt' | 'api_key'
}

export type AuthRequest = {
  env: Env
  req: {
    header: (name: string) => string | undefined
  }
}

function bearerToken(req: AuthRequest['req']): string | null {
  const authHeader = req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  return token || null
}

export async function authenticateRequest(
  c: AuthRequest,
  token?: string | null,
): Promise<AuthUser | null> {
  const value = token ?? bearerToken(c.req)
  if (!value) return null

  if (isAgentApiToken(value)) {
    const tokenHash = await hashAgentApiToken(value)
    const row = await c.env.DB
      .prepare('SELECT user_address FROM agent_api_tokens WHERE token_hash = ?1')
      .bind(tokenHash)
      .first<{ user_address: string }>()
    if (!row) return null

    const github = await c.env.DB
      .prepare('SELECT github_user FROM github_tokens WHERE user_address = ?1')
      .bind(row.user_address)
      .first<{ github_user: string | null }>()

    return {
      userAddress: row.user_address,
      githubLogin: github?.github_user ?? null,
      via: 'api_key',
    }
  }

  const payload = await verifyJwt(value, c.env.JWT_SECRET)
  if (!payload) return null
  const rec = payload as Record<string, unknown>
  return {
    userAddress: rec.address as string,
    githubLogin: (rec.github_login as string | undefined) ?? null,
    via: 'jwt',
  }
}

export async function authenticateSessionJwt(c: AuthRequest): Promise<AuthUser | null> {
  const token = bearerToken(c.req)
  if (!token || isAgentApiToken(token)) return null
  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload) return null
  const rec = payload as Record<string, unknown>
  return {
    userAddress: rec.address as string,
    githubLogin: (rec.github_login as string | undefined) ?? null,
    via: 'jwt',
  }
}

export async function requireAuth(c: AuthRequest): Promise<AuthUser | Response> {
  const auth = await authenticateRequest(c)
  if (!auth) {
    return Response.json({ error: 'missing or invalid authorization' }, { status: 401 })
  }
  return auth
}

export async function requireSessionJwt(c: AuthRequest): Promise<AuthUser | Response> {
  const auth = await authenticateSessionJwt(c)
  if (!auth) {
    return Response.json({ error: 'session JWT required' }, { status: 401 })
  }
  return auth
}
