import type { Env } from './index'

export type WalrusNetwork = 'mainnet' | 'testnet'

export function portalPathPrefix(network: WalrusNetwork): 'm' | 't' {
  return network === 'mainnet' ? 'm' : 't'
}

export function deploymentViewUrl(
  base36: string,
  network: WalrusNetwork,
  origin: string,
): string {
  const prefix = portalPathPrefix(network)
  const base = origin.replace(/\/+$/, '')
  return `${base}/${prefix}/${base36}/`
}

export function trimPortalOrigin(url: string | undefined): string | undefined {
  const trimmed = url?.trim().replace(/\/+$/, '')
  return trimmed || undefined
}

/** Base URL for deployment preview links (separate preview worker). */
export function getPortalPublicOrigin(env: Env, requestUrl?: string): string {
  return (
    trimPortalOrigin(env.PORTAL_PUBLIC_ORIGIN) ??
    trimPortalOrigin(env.API_PUBLIC_URL) ??
    (requestUrl ? new URL(requestUrl).origin : 'http://localhost:8787')
  )
}

export function computeViewUrl(
  base36Url: string | null | undefined,
  network: WalrusNetwork,
  origin: string,
): string | null {
  if (!base36Url) return null
  return deploymentViewUrl(base36Url, network, origin)
}

export type DeploymentWithViewUrl<T extends { base36Url?: string | null; network: WalrusNetwork }> =
  T & { viewUrl: string | null }

export function withViewUrl<T extends { base36Url?: string | null; network: WalrusNetwork }>(
  deployment: T,
  origin: string,
): DeploymentWithViewUrl<T> {
  return {
    ...deployment,
    viewUrl: computeViewUrl(deployment.base36Url, deployment.network, origin),
  }
}
