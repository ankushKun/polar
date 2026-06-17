export type WalrusNetwork = 'mainnet' | 'testnet'

/** Set at build time for Walrus-hosted frontend (polar.wal.app). */
const PORTAL_ORIGIN = (import.meta.env.VITE_PORTAL_ORIGIN as string | undefined)?.replace(/\/+$/, '')

export function portalPathPrefix(network: WalrusNetwork): 'm' | 't' {
  return network === 'mainnet' ? 'm' : 't'
}

/** Relative view path, e.g. /t/abc123/ */
export function portalPath(base36: string, network: WalrusNetwork): string {
  return `/${portalPathPrefix(network)}/${base36}/`
}

/** Full preview URL on the preview worker (uses VITE_PORTAL_ORIGIN when origin omitted). */
export function portalViewUrl(
  base36: string,
  network: WalrusNetwork,
  origin?: string,
): string {
  const path = portalPath(base36, network)
  const base = (origin ?? PORTAL_ORIGIN)?.replace(/\/+$/, '')
  if (!base) return path
  return `${base}${path}`
}

export function portalViewLabel(base36: string, network: WalrusNetwork): string {
  return `${portalPathPrefix(network)}/${base36}`
}
