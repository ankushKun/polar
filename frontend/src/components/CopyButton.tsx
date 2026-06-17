import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '../lib/utils'

export function CopyButton({
  value,
  className,
  title = 'Copy',
  onClick,
}: {
  value: string
  className?: string
  title?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    onClick?.(e)
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'p-1 rounded-md text-textMuted hover:text-text transition-colors shrink-0',
        className,
      )}
      title={title}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}
