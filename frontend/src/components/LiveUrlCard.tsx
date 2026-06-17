import { ExternalLink } from 'lucide-react'
import { portalDisplayLabel, portalTechnicalLabel, portalViewUrl } from '../lib/portal'
import { liveUrlBorderClass, liveUrlTextClass } from './WalrusStorageAlert'
import { CopyButton } from './CopyButton'
import type { WalrusStorageStatus } from '../lib/epochs'
import { cn } from '../lib/utils'

export function LiveUrlCard({
  base36Url,
  network,
  viewUrl,
  storageStatus = 'active',
  title,
  projectName,
}: {
  base36Url: string
  network: 'mainnet' | 'testnet'
  viewUrl?: string | null
  storageStatus?: WalrusStorageStatus
  title?: string
  projectName?: string
}) {
  const href = viewUrl ?? portalViewUrl(base36Url, network)
  const displayLabel = portalDisplayLabel(base36Url, network, { projectName })
  const technicalLabel = portalTechnicalLabel(base36Url, network)
  const showTechnical = projectName && displayLabel !== technicalLabel

  const cardTitle =
    title ??
    (storageStatus === 'expired' ? 'Site URL (storage expired)' : 'Live URL')

  return (
    <div className={cn('rounded-xl p-4', liveUrlBorderClass(storageStatus))}>
      <div
        className={cn(
          'text-xs font-medium mb-1',
          liveUrlTextClass(storageStatus),
        )}
      >
        {cardTitle}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group inline-flex items-center gap-2 min-w-0 font-semibold transition-colors hover:opacity-80',
            liveUrlTextClass(storageStatus),
          )}
          title={href}
        >
          <span className="truncate text-lg">{displayLabel}</span>
          <ExternalLink className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
        </a>
        <CopyButton value={href} title="Copy full URL" />
      </div>
      {showTechnical && (
        <p className="mt-1.5 text-xs text-textMuted font-mono truncate" title={portalViewUrl(base36Url, network)}>
          Walrus object URL · {technicalLabel}
        </p>
      )}
    </div>
  )
}
