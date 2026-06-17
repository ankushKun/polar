import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { portalViewLabel, portalViewUrl } from '../lib/portal'
import { cn } from '../lib/utils'

export function PreviewUrlLink({
  base36Url,
  network,
  viewUrl,
  className,
  showCopy = true,
}: {
  base36Url: string
  network: 'mainnet' | 'testnet'
  viewUrl?: string | null
  className?: string
  showCopy?: boolean
}) {
  const href = viewUrl ?? portalViewUrl(base36Url, network)
  const label = portalViewLabel(base36Url, network)
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <span className={cn('inline-flex items-center gap-2 min-w-0', className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 text-info text-xs hover:text-info/80 transition-colors min-w-0"
      >
        <ExternalLink className="w-3 h-3 shrink-0" />
        <span className="font-mono truncate">{label}</span>
      </a>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-textMuted hover:text-white transition-colors shrink-0"
          title="Copy URL"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </span>
  )
}
