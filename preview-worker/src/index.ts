import { Hono } from 'hono'
import { handlePortalRequest } from '../../worker/src/portal/handler'

/**
 * Polar preview worker — Walrus Sites portal only (/m/* mainnet, /t/* testnet).
 * Deploy to a personal Cloudflare account (e.g. polar.ankushkun.workers.dev).
 */
const app = new Hono()

app.get('/', (c) =>
  c.json({
    service: 'polar-preview',
    mainnet: '/m/{base36SiteId}/',
    testnet: '/t/{base36SiteId}/',
  }),
)

app.get('/health', (c) => c.json({ ok: true, service: 'polar-preview' }))

app.all('/m', (c) => handlePortalRequest(c, 'mainnet', 'm'))
app.all('/m/*', (c) => handlePortalRequest(c, 'mainnet', 'm'))
app.all('/t', (c) => handlePortalRequest(c, 'testnet', 't'))
app.all('/t/*', (c) => handlePortalRequest(c, 'testnet', 't'))

export default app
