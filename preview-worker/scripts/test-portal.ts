import { getPortalFetcher } from '../../worker/src/portal/portal-fetcher'
import { base36ToHex } from '../../worker/src/portal/object-id'

async function test(network: 'mainnet' | 'testnet', b36: string) {
  const id = base36ToHex(b36)
  if (!id) throw new Error('invalid b36')
  const fetcher = getPortalFetcher(network)
  const res = await fetcher.fetchSiteResource(id, '/')
  const text = await res.text()
  console.log(network, b36, '→', res.status, text.slice(0, 120).replace(/\n/g, ' '))
}

await test('mainnet', '46f3881sp4r55fc6pcao9t93bieeejl4vr4k2uv8u4wwyx1a93')
await test('testnet', '1p3repujoigwcqrk0w4itsxm7hs7xjl4hwgt3t0szn6evad83q')
