export const AGENT_API_TOKEN_PREFIX = 'polar_live_'

export function isAgentApiToken(value: string): boolean {
  return value.startsWith(AGENT_API_TOKEN_PREFIX)
}

export function agentTokenPrefix(token: string): string {
  return token.slice(0, Math.min(16, token.length))
}

export function generateAgentApiToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  const suffix = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${AGENT_API_TOKEN_PREFIX}${suffix}`
}

export async function hashAgentApiToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
