import { base36ToHex } from './object-id'
import { resolveWalrusSiteNetwork } from './network-resolve'
import { getPortalFetcher } from './portal-fetcher'
import { invalidSiteId } from './errors'
import type { WalrusNetwork } from './types'
import {
  parsePortalRequestPath,
  parseSubdomainSiteHost,
  rewriteLocationHeader,
  rewritePortalCss,
  rewritePortalHtml,
} from './urls'

type PortalRequestContext = { req: { url: string } }

/** Path-prefix portal: /m/{id}/ or /t/{id}/ */
export async function handlePortalRequest(
  c: PortalRequestContext,
  network: WalrusNetwork,
  networkPrefix: 'm' | 't',
): Promise<Response> {
  const parsed = parsePortalRequestPath(new URL(c.req.url).pathname, networkPrefix)
  if (!parsed) return invalidSiteId()

  const objectId = base36ToHex(parsed.base36)
  if (!objectId) return invalidSiteId()

  const portalPrefix = `/${networkPrefix}/${parsed.base36}`
  return serveSiteResource(objectId, network, parsed.sitePath, portalPrefix)
}

/** Subdomain portal: {base36}.polar.example.com - network auto-detected from chain. */
export async function handleSubdomainPortalRequest(
  c: PortalRequestContext,
  base36: string,
): Promise<Response> {
  const objectId = base36ToHex(base36)
  if (!objectId) return invalidSiteId()

  const network = await resolveWalrusSiteNetwork(objectId)
  if (!network) return invalidSiteId()

  const sitePath = new URL(c.req.url).pathname || '/'
  return serveSiteResource(objectId, network, sitePath, '')
}

export function tryParseSubdomainSiteRequest(
  host: string,
  portalSubdomainBase: string,
): { base36: string } | null {
  return parseSubdomainSiteHost(host, portalSubdomainBase)
}

async function serveSiteResource(
  objectId: string,
  network: WalrusNetwork,
  sitePath: string,
  portalPrefix: string,
): Promise<Response> {
  try {
    const fetcher = getPortalFetcher(network)
    const response = await fetcher.fetchSiteResource(objectId, sitePath)

    let finalResponse = response

    const location = finalResponse.headers.get('Location')
    if (location) {
      const headers = new Headers(finalResponse.headers)
      headers.set('Location', rewriteLocationHeader(location, portalPrefix))
      finalResponse = new Response(finalResponse.body, { status: finalResponse.status, headers })
    }

    const contentType = finalResponse.headers.get('Content-Type') ?? ''
    if (portalPrefix && contentType.includes('text/html')) {
      const html = await finalResponse.text()
      const rewritten = rewritePortalHtml(html, portalPrefix)
      const headers = new Headers(finalResponse.headers)
      headers.delete('Content-Length')
      return new Response(rewritten, { status: finalResponse.status, headers })
    }

    if (portalPrefix && contentType.includes('text/css')) {
      const css = await finalResponse.text()
      const rewritten = rewritePortalCss(css, portalPrefix)
      const headers = new Headers(finalResponse.headers)
      headers.delete('Content-Length')
      return new Response(rewritten, { status: finalResponse.status, headers })
    }

    return finalResponse
  } catch (err) {
    console.error('Portal fetch error:', err)
    return new Response('Portal error', { status: 500 })
  }
}
