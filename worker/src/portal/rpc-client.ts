import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import type { WalrusNetwork } from './types'
import { RPC_TIMEOUT_MS } from './config'

export class PortalRpcClient {
  private clients: SuiJsonRpcClient[]

  constructor(rpcUrls: string[], network: WalrusNetwork) {
    this.clients = rpcUrls.map((url) => new SuiJsonRpcClient({ url, network }))
  }

  async multiGetObjects(
    ids: string[],
    options: { showBcs?: boolean; showDisplay?: boolean },
  ) {
    let lastError: unknown
    for (const client of this.clients) {
      try {
        const result = await Promise.race([
          client.multiGetObjects({ ids, options }),
          abortAfter(RPC_TIMEOUT_MS),
        ])
        return result
      } catch (err) {
        lastError = err
      }
    }
    throw lastError ?? new Error('RPC request failed')
  }
}

function abortAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('RPC request timed out')), ms)
  })
}
