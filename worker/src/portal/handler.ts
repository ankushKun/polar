import { base36ToHex } from './object-id'
import { getPortalFetcher } from './portal-fetcher'
import { invalidSiteId } from './errors'
import type { WalrusNetwork } from './types'
import {
  parsePortalRequestPath,
  rewriteLocationHeader,
  rewritePortalCss,
  rewritePortalHtml,
} from './urls'

export async function handlePortalRequest(
  c: { req: { url: string } },
  network: WalrusNetwork,
  networkPrefix: 'm' | 't',
): Promise<Response> {
  const parsed = parsePortalRequestPath(new URL(c.req.url).pathname, networkPrefix)
  if (!parsed) return invalidSiteId()

  const objectId = base36ToHex(parsed.base36)
  if (!objectId) return invalidSiteId()

  const portalPrefix = `/${networkPrefix}/${parsed.base36}`

  try {
    const fetcher = getPortalFetcher(network)
    const response = await fetcher.fetchSiteResource(objectId, parsed.sitePath)

    let finalResponse = response

    const location = finalResponse.headers.get('Location')
    if (location) {
      const headers = new Headers(finalResponse.headers)
      headers.set('Location', rewriteLocationHeader(location, portalPrefix))
      finalResponse = new Response(finalResponse.body, { status: finalResponse.status, headers })
    }

    const contentType = finalResponse.headers.get('Content-Type') ?? ''
    if (contentType.includes('text/html')) {
      const html = await finalResponse.text()
      const rewritten = rewritePortalHtml(html, portalPrefix)
      const headers = new Headers(finalResponse.headers)
      headers.delete('Content-Length')
      return new Response(rewritten, { status: finalResponse.status, headers })
    }

    if (contentType.includes('text/css')) {
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
