import { getPortalConfig } from './config'
import { PortalRpcClient } from './rpc-client'
import type { WalrusNetwork } from './types'

/** Which chain hosts this Walrus Site object (mainnet vs testnet). */
export async function resolveWalrusSiteNetwork(objectId: string): Promise<WalrusNetwork | null> {
  const networks: WalrusNetwork[] = ['mainnet', 'testnet']
  const found = await Promise.all(
    networks.map(async (network) => {
      try {
        const config = getPortalConfig(network)
        const rpc = new PortalRpcClient(config.rpcUrls, network)
        const [obj] = await rpc.multiGetObjects([objectId], { showBcs: false, showDisplay: false })
        return obj.data?.objectId ? network : null
      } catch {
        return null
      }
    }),
  )

  return found.find(Boolean) ?? null
}
