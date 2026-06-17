import { describe, expect, it } from 'vitest'
import {
  approxWalStorageEndDate,
  effectiveEpochCount,
  getWalrusStorageStatus,
  storageStatusPriority,
} from './epochs'

const baseDeployment = {
  status: 'deployed' as const,
  createdAt: '2026-01-01T12:00:00.000Z',
  network: 'mainnet' as const,
  epochs: 2,
  objectId: '0xabc',
  base36Url: 'abc123',
}

describe('effectiveEpochCount', () => {
  it('uses stored epochs when present', () => {
    expect(effectiveEpochCount('mainnet', 7)).toBe(7)
  })

  it('defaults mainnet to 2 and testnet to 1', () => {
    expect(effectiveEpochCount('mainnet', null)).toBe(2)
    expect(effectiveEpochCount('testnet', null)).toBe(1)
  })
})

describe('getWalrusStorageStatus', () => {
  it('returns unknown for non-deployed', () => {
    expect(getWalrusStorageStatus({ ...baseDeployment, status: 'failed' }).status).toBe('unknown')
  })

  it('returns active when far from expiry', () => {
    const end = approxWalStorageEndDate(baseDeployment.createdAt, 'mainnet', 2)
    const now = new Date(end.getTime() - 20 * 86_400_000)
    const result = getWalrusStorageStatus(baseDeployment, now)
    expect(result.status).toBe('active')
    expect(result.daysRemaining).toBeGreaterThan(7)
  })

  it('returns expiring_soon within threshold', () => {
    const end = approxWalStorageEndDate(baseDeployment.createdAt, 'mainnet', 2)
    const now = new Date(end.getTime() - 3 * 86_400_000)
    const result = getWalrusStorageStatus(baseDeployment, now)
    expect(result.status).toBe('expiring_soon')
  })

  it('returns expired after end date', () => {
    const end = approxWalStorageEndDate(baseDeployment.createdAt, 'mainnet', 2)
    const now = new Date(end.getTime() + 86_400_000)
    const result = getWalrusStorageStatus(baseDeployment, now)
    expect(result.status).toBe('expired')
    expect(result.daysRemaining).toBeLessThanOrEqual(0)
  })
})

describe('storageStatusPriority', () => {
  it('orders expired before expiring_soon before active', () => {
    expect(storageStatusPriority('expired')).toBeLessThan(storageStatusPriority('expiring_soon'))
    expect(storageStatusPriority('expiring_soon')).toBeLessThan(storageStatusPriority('active'))
  })
})
