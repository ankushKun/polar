import { useMemo, useState } from 'react'
import {
  activeRetentionDays,
  formatStorageEndLabel,
  mainnetTierIndexForEpochs,
  mainnetTierIndexToEpochs,
  mainnetTierLabel,
  type WalrusStorageStatus,
  type WalrusStorageStatusResult,
} from '../lib/epochs'
import type { Deployment } from '../lib/api'
import { portalViewLabel } from '../lib/portal'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'
import { RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react'

export function WalrusRenewActions({
  deployment,
  disabled,
  renewing,
  onRenew,
}: {
  deployment: Deployment
  disabled?: boolean
  renewing?: boolean
  onRenew: (epochs?: number | 'max') => void | Promise<void>
}) {
  const [showDuration, setShowDuration] = useState(false)
  const effEpochs = deployment.epochs ?? (deployment.network === 'mainnet' ? 2 : 1)
  const [mainnetTierIndex, setMainnetTierIndex] = useState(() =>
    deployment.network === 'mainnet' ? mainnetTierIndexForEpochs(effEpochs) : 0,
  )
  const [testnetDays, setTestnetDays] = useState(() =>
    deployment.network === 'testnet' ? Math.max(1, Math.min(7, effEpochs)) : 1,
  )

  const selectedEpochs = useMemo(() => {
    if (deployment.network === 'mainnet') return mainnetTierIndexToEpochs(mainnetTierIndex)
    return testnetDays
  }, [deployment.network, mainnetTierIndex, testnetDays])

  const durationLabel =
    deployment.network === 'mainnet'
      ? mainnetTierLabel(mainnetTierIndex)
      : `${testnetDays} ${testnetDays === 1 ? 'day' : 'days'}`

  const approxDays = activeRetentionDays(
    deployment.network,
    mainnetTierIndex,
    testnetDays,
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={disabled || renewing}
          onClick={() => void onRenew()}
          className="shrink-0"
        >
          {renewing ? <Spinner className="mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
          {renewing ? 'Renewing...' : 'Renew site'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || renewing}
          onClick={() => setShowDuration((v) => !v)}
          className="shrink-0"
        >
          {showDuration ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          Renew with duration
        </Button>
      </div>

      {showDuration && (
        <div className="rounded-lg border border-border bg-surface/50 p-4 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Storage duration</span>
            <span className="text-sm font-bold text-info">{durationLabel}</span>
          </div>
          {deployment.network === 'mainnet' ? (
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={mainnetTierIndex}
              onChange={(e) => setMainnetTierIndex(Number(e.target.value))}
              className="w-full accent-info"
              disabled={disabled || renewing}
            />
          ) : (
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={testnetDays}
              onChange={(e) => setTestnetDays(Number(e.target.value))}
              className="w-full accent-info"
              disabled={disabled || renewing}
            />
          )}
          <p className="text-xs text-textMuted">
            Approximately {approxDays} calendar days of storage from renew time.
          </p>
          <Button
            variant="primary"
            size="sm"
            disabled={disabled || renewing}
            onClick={() => void onRenew(selectedEpochs)}
          >
            {renewing ? <Spinner className="mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
            Renew for {durationLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export function WalrusStorageAlert({
  storage,
  base36Url,
  network,
  disabled,
  renewing,
  onRenew,
  deployment,
}: {
  storage: WalrusStorageStatusResult
  base36Url?: string | null
  network?: 'mainnet' | 'testnet'
  disabled?: boolean
  renewing?: boolean
  onRenew: (epochs?: number | 'max') => void | Promise<void>
  deployment: Deployment
}) {
  if (storage.status !== 'expired' && storage.status !== 'expiring_soon') return null
  if (!storage.endDate) return null

  const endLabel = formatStorageEndLabel(storage.endDate)
  const urlLabel =
    base36Url && network ? portalViewLabel(base36Url, network) : 'your Polar site URL'
  const daysLeft =
    storage.daysRemaining != null && storage.daysRemaining > 0
      ? Math.ceil(storage.daysRemaining)
      : null

  const isExpired = storage.status === 'expired'

  return (
    <div
      className={
        isExpired
          ? 'rounded-xl border border-danger/30 bg-danger/10 p-4'
          : 'rounded-xl border border-warning/30 bg-warning/10 p-4'
      }
    >
      <div className={`text-sm font-semibold ${isExpired ? 'text-danger' : 'text-warning'}`}>
        {isExpired ? 'Walrus storage has likely expired' : 'Walrus storage expiring soon'}
      </div>
      <p className="mt-2 text-sm text-textMuted leading-relaxed">
        {isExpired ? (
          <>
            The <span className="font-mono text-white/90">{urlLabel}</span> site may be unreachable.
            Renewing will rebuild and re-upload to the{' '}
            <span className="font-medium text-white/90">same Walrus Site object</span>, so your URL should stay the same.
          </>
        ) : (
          <>
            Storage expires around <span className="text-white font-medium">{endLabel}</span>
            {daysLeft != null ? ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)` : ''}.
            Renew before then to avoid downtime.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-textMuted/80">
        Dates are approximate — Walrus uses Sui epochs, not calendar time.
      </p>
      <div className="mt-4">
        <WalrusRenewActions
          deployment={deployment}
          disabled={disabled}
          renewing={renewing}
          onRenew={onRenew}
        />
      </div>
    </div>
  )
}

export function liveUrlBorderClass(status: WalrusStorageStatus): string {
  switch (status) {
    case 'expired':
      return 'bg-danger/10 border-danger/30'
    case 'expiring_soon':
      return 'bg-warning/10 border-warning/30'
    default:
      return 'bg-success/10 border-success/30'
  }
}

export function liveUrlTextClass(status: WalrusStorageStatus): string {
  switch (status) {
    case 'expired':
      return 'text-danger'
    case 'expiring_soon':
      return 'text-warning'
    default:
      return 'text-success'
  }
}
