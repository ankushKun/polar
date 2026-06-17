import type { WalrusNetwork } from './types'

export type PortalNetworkConfig = {
  network: WalrusNetwork
  sitePackageId: string
  rpcUrls: string[]
  aggregatorUrls: string[]
}

const MAINNET: PortalNetworkConfig = {
  network: 'mainnet',
  sitePackageId: '0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27',
  rpcUrls: ['https://fullnode.mainnet.sui.io'],
  aggregatorUrls: ['https://aggregator.walrus-mainnet.walrus.space'],
}

const TESTNET: PortalNetworkConfig = {
  network: 'testnet',
  sitePackageId: '0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799',
  rpcUrls: ['https://fullnode.testnet.sui.io'],
  aggregatorUrls: ['https://aggregator.walrus-testnet.walrus.space'],
}

export function getPortalConfig(network: WalrusNetwork): PortalNetworkConfig {
  return network === 'mainnet' ? MAINNET : TESTNET
}

export const MAX_REDIRECT_DEPTH = 3
export const AGGREGATOR_TIMEOUT_MS = 10_000
export const RPC_TIMEOUT_MS = 7_000
export const QUILT_PATCH_INTERNAL_HEADER = 'x-wal-quilt-patch-internal-id'
