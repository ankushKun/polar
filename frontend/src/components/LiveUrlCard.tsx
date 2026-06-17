import { ExternalLink } from 'lucide-react'
import { portalViewLabel, portalViewUrl } from '../lib/portal'
import { liveUrlBorderClass, liveUrlTextClass } from './WalrusStorageAlert'
import type { WalrusStorageStatus } from '../lib/epochs'
import { cn } from '../lib/utils'

export function LiveUrlCard({
  base36Url,
  network,
  viewUrl,
  storageStatus = 'active',
  title,
}: {
  base36Url: string
  network: 'mainnet' | 'testnet'
  viewUrl?: string | null
  storageStatus?: WalrusStorageStatus
  title?: string
}) {
  const label =
    title ??
    (storageStatus === 'expired' ? 'Site URL (storage expired)' : 'Live URL')

  return (
    <div className={cn('rounded-xl p-4 border', liveUrlBorderClass(storageStatus))}>
      <div
        className={cn(
          'text-xs font-semibold uppercase tracking-wider mb-1',
          liveUrlTextClass(storageStatus),
        )}
      >
        {label}
      </div>
      <a
        href={viewUrl ?? portalViewUrl(base36Url, network)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group inline-flex items-center gap-2 text-lg font-bold transition-colors break-all',
          liveUrlTextClass(storageStatus),
          'hover:opacity-80',
        )}
      >
        {portalViewLabel(base36Url, network)}
        <ExternalLink className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
      </a>
    </div>
  )
}
