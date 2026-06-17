/** Keep in sync with worker/src/epochs.ts */
export const MAINNET_DAYS_PER_EPOCH = 14
export const TESTNET_DAYS_PER_EPOCH = 1

export const MAINNET_EPOCH_TIERS = [
  { epochs: 2, label: 'About 1 month' },
  { epochs: 7, label: 'About 3 months' },
  { epochs: 13, label: 'About 6 months' },
  { epochs: 26, label: 'About 1 year' },
] as const

export function mainnetTierIndexToEpochs(index: number): number {
  const i = Math.max(0, Math.min(MAINNET_EPOCH_TIERS.length - 1, Math.floor(index)))
  return MAINNET_EPOCH_TIERS[i].epochs
}

export function mainnetTierLabel(index: number): string {
  const i = Math.max(0, Math.min(MAINNET_EPOCH_TIERS.length - 1, Math.floor(index)))
  return MAINNET_EPOCH_TIERS[i].label
}

/** Calendar date ~duration from today (local), for UX only */
export function formatApproxActiveUntilDate(daysFromNow: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + daysFromNow)
  return d.toLocaleDateString(undefined, { dateStyle: 'long' })
}

export function activeRetentionDays(network: 'mainnet' | 'testnet', mainnetTierIndex: number, testnetDays: number): number {
  if (network === 'mainnet') {
    return mainnetTierIndexToEpochs(mainnetTierIndex) * MAINNET_DAYS_PER_EPOCH
  }
  return Math.max(1, Math.min(7, testnetDays)) * TESTNET_DAYS_PER_EPOCH
}

/** Calendar days from epoch count (same model as cost/deploy). */
export function walrusRetentionCalendarDays(network: 'mainnet' | 'testnet', epochs: number): number {
  if (network === 'mainnet') return epochs * MAINNET_DAYS_PER_EPOCH
  return Math.max(1, Math.min(7, epochs)) * TESTNET_DAYS_PER_EPOCH
}

/** End-of-retention instant = deploy time + calendar-day estimate (Walrus uses chain epochs; this is UX-only). */
export function approxWalStorageEndDate(
  deployedAtIso: string,
  network: 'mainnet' | 'testnet',
  epochs: number | null | undefined,
): Date {
  const e = effectiveEpochCount(network, epochs)
  const days = walrusRetentionCalendarDays(network, e)
  return new Date(new Date(deployedAtIso).getTime() + days * 86_400_000)
}

export function effectiveEpochCount(
  network: 'mainnet' | 'testnet',
  epochs: number | null | undefined,
): number {
  if (epochs != null && Number.isFinite(epochs) && epochs > 0) return epochs
  return network === 'mainnet' ? 2 : 1
}

export type WalrusStorageStatus = 'active' | 'expiring_soon' | 'expired' | 'unknown'

export interface WalrusStorageStatusInput {
  status: string
  createdAt: string
  network: 'mainnet' | 'testnet'
  epochs: number | null | undefined
  objectId?: string | null
  base36Url?: string | null
}

export interface WalrusStorageStatusResult {
  status: WalrusStorageStatus
  endDate: Date | null
  daysRemaining: number | null
  effectiveEpochs: number | null
}

export const EXPIRING_SOON_DAYS_MAINNET = 7
export const EXPIRING_SOON_DAYS_TESTNET = 1

export function getWalrusStorageStatus(
  deployment: WalrusStorageStatusInput,
  now: Date = new Date(),
  options?: { expiringSoonDaysMainnet?: number; expiringSoonDaysTestnet?: number },
): WalrusStorageStatusResult {
  const unknown: WalrusStorageStatusResult = {
    status: 'unknown',
    endDate: null,
    daysRemaining: null,
    effectiveEpochs: null,
  }

  if (deployment.status !== 'deployed') return unknown
  if (!deployment.objectId && !deployment.base36Url) return unknown

  const effectiveEpochs = effectiveEpochCount(deployment.network, deployment.epochs)
  const endDate = approxWalStorageEndDate(deployment.createdAt, deployment.network, deployment.epochs)
  const msRemaining = endDate.getTime() - now.getTime()
  const daysRemaining = msRemaining / 86_400_000

  if (msRemaining <= 0) {
    return { status: 'expired', endDate, daysRemaining, effectiveEpochs }
  }

  const expiringSoonThreshold =
    deployment.network === 'mainnet'
      ? (options?.expiringSoonDaysMainnet ?? EXPIRING_SOON_DAYS_MAINNET)
      : (options?.expiringSoonDaysTestnet ?? EXPIRING_SOON_DAYS_TESTNET)

  if (daysRemaining <= expiringSoonThreshold) {
    return { status: 'expiring_soon', endDate, daysRemaining, effectiveEpochs }
  }

  return { status: 'active', endDate, daysRemaining, effectiveEpochs }
}

export function storageStatusPriority(status: WalrusStorageStatus): number {
  switch (status) {
    case 'expired':
      return 0
    case 'expiring_soon':
      return 1
    case 'active':
      return 2
    default:
      return 3
  }
}

export function formatStorageEndLabel(endDate: Date): string {
  return endDate.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })
}

export function mainnetTierIndexForEpochs(epochs: number): number {
  const idx = MAINNET_EPOCH_TIERS.findIndex((t) => t.epochs === epochs)
  return idx >= 0 ? idx : 0
}
