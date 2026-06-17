export type WalrusNetwork = 'mainnet' | 'testnet'

/** Set at build time for Walrus-hosted frontend (polar.wal.app). */
const PORTAL_ORIGIN = (import.meta.env.VITE_PORTAL_ORIGIN as string | undefined)?.replace(/\/+$/, '')
const PORTAL_SUBDOMAIN_BASE = (import.meta.env.VITE_PORTAL_SUBDOMAIN_BASE as string | undefined)
  ?.replace(/^\.+/, '')
  ?.replace(/\/+$/, '')

export function portalPathPrefix(network: WalrusNetwork): 'm' | 't' {
  return network === 'mainnet' ? 'm' : 't'
}

/** Relative view path, e.g. /t/abc123/ (legacy path-prefix portal). */
export function portalPath(base36: string, network: WalrusNetwork): string {
  return `/${portalPathPrefix(network)}/${base36}/`
}

/** Full preview URL (subdomain portal preferred when VITE_PORTAL_SUBDOMAIN_BASE is set). */
export function portalViewUrl(
  base36: string,
  network: WalrusNetwork,
  origin?: string,
): string {
  if (PORTAL_SUBDOMAIN_BASE) {
    return `https://${base36}.${PORTAL_SUBDOMAIN_BASE}/`
  }
  const path = portalPath(base36, network)
  const base = (origin ?? PORTAL_ORIGIN)?.replace(/\/+$/, '')
  if (!base) return path
  return `${base}${path}`
}

export function portalViewLabel(base36: string, network: WalrusNetwork): string {
  if (PORTAL_SUBDOMAIN_BASE) return `${base36}.${PORTAL_SUBDOMAIN_BASE}`
  return `${portalPathPrefix(network)}/${base36}`
}
