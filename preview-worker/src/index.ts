import { Hono } from 'hono'
import {
  handlePortalRequest,
  handleSubdomainPortalRequest,
  tryParseSubdomainSiteRequest,
} from '../../worker/src/portal/handler'

export type PreviewWorkerEnv = {
  PORTAL_SUBDOMAIN_BASE?: string
}

/**
 * Polar preview worker - Walrus Sites portal.
 *
 * Primary: {base36}.polar.ankush.one (network auto-detected from chain)
 * Legacy:  /m/{id}/ mainnet, /t/{id}/ testnet on workers.dev
 */
const app = new Hono<{ Bindings: PreviewWorkerEnv }>()

app.get('/health', (c) => c.json({ ok: true, service: 'polar-preview' }))

app.all('*', async (c) => {
  const url = new URL(c.req.url)

  if (url.pathname === '/health') {
    return c.json({ ok: true, service: 'polar-preview' })
  }

  const subdomainBase = c.env.PORTAL_SUBDOMAIN_BASE?.trim()
  if (subdomainBase) {
    const site = tryParseSubdomainSiteRequest(url.hostname, subdomainBase)
    if (site) {
      return handleSubdomainPortalRequest(c, site.base36)
    }

    const host = url.hostname.toLowerCase()
    const base = subdomainBase.toLowerCase()
    if (host === base && (url.pathname === '/' || url.pathname === '')) {
      return c.json({
        service: 'polar-preview',
        sites: `https://{base36SiteId}.${subdomainBase}/`,
        network: 'auto (mainnet or testnet)',
        legacy: { mainnet: '/m/{base36SiteId}/', testnet: '/t/{base36SiteId}/' },
      })
    }
  }

  if (url.pathname === '/' || url.pathname === '') {
    return c.json({
      service: 'polar-preview',
      mainnet: '/m/{base36SiteId}/',
      testnet: '/t/{base36SiteId}/',
      subdomain: subdomainBase ? `{base36SiteId}.${subdomainBase}` : undefined,
    })
  }

  if (url.pathname === '/m' || url.pathname.startsWith('/m/')) {
    return handlePortalRequest(c, 'mainnet', 'm')
  }
  if (url.pathname === '/t' || url.pathname.startsWith('/t/')) {
    return handlePortalRequest(c, 'testnet', 't')
  }

  return c.notFound()
})

export default app
