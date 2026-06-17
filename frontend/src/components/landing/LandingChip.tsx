import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function LandingChip({
  icon,
  label,
  className,
}: {
  icon?: ReactNode
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-divider bg-surface/60 px-3 py-2 text-xs font-medium text-textMuted',
        'transition-all duration-200 hover:border-primary/15 hover:-translate-y-px',
        className,
      )}
    >
      {icon}
      {label}
    </span>
  )
}
