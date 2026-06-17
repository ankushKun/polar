import { ExternalLink } from 'lucide-react'
import { portalDisplayLabel, portalTechnicalLabel, portalViewUrl } from '../lib/portal'
import { CopyButton } from './CopyButton'
import { cn } from '../lib/utils'

export function PreviewUrlLink({
  base36Url,
  network,
  viewUrl,
  className,
  showCopy = true,
  projectName,
  showTechnical = false,
}: {
  base36Url: string
  network: 'mainnet' | 'testnet'
  viewUrl?: string | null
  className?: string
  showCopy?: boolean
  projectName?: string
  showTechnical?: boolean
}) {
  const href = viewUrl ?? portalViewUrl(base36Url, network)
  const displayLabel = portalDisplayLabel(base36Url, network, { projectName })
  const technicalLabel = portalTechnicalLabel(base36Url, network)
  const hasFriendlyName = projectName && displayLabel !== technicalLabel

  return (
    <span className={cn('inline-flex flex-col gap-0.5 min-w-0 max-w-full', className)}>
      <span className="inline-flex items-center gap-2 min-w-0">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-info text-xs hover:text-info/80 transition-colors min-w-0"
          title={href}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </a>
        {showCopy && <CopyButton value={href} title="Copy full URL" onClick={(e) => e.stopPropagation()} />}
      </span>
      {(showTechnical || hasFriendlyName) && (
        <span className="text-[10px] text-textMuted font-mono truncate pl-5" title={href}>
          {technicalLabel}
        </span>
      )}
    </span>
  )
}
