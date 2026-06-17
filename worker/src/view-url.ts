import type { Env } from './index'
import { deploymentViewUrl } from './portal/urls'
import type { WalrusNetwork } from './portal/types'

export type { WalrusNetwork } from './portal/types'

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

export function getPortalSubdomainBase(env: Env): string | undefined {
  return trimPortalOrigin(env.PORTAL_SUBDOMAIN_BASE)
}

export function computeViewUrl(
  base36Url: string | null | undefined,
  network: WalrusNetwork,
  origin: string,
  subdomainBase?: string | null,
): string | null {
  if (!base36Url) return null
  return deploymentViewUrl(base36Url, network, origin, subdomainBase)
}

export type DeploymentWithViewUrl<T extends { base36Url?: string | null; network: WalrusNetwork }> =
  T & { viewUrl: string | null }

export function withViewUrl<T extends { base36Url?: string | null; network: WalrusNetwork }>(
  deployment: T,
  origin: string,
  subdomainBase?: string | null,
): DeploymentWithViewUrl<T> {
  return {
    ...deployment,
    viewUrl: computeViewUrl(deployment.base36Url, deployment.network, origin, subdomainBase),
  }
}
