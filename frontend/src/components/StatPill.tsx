import { cn } from '../lib/utils'

type StatPillVariant = 'neutral' | 'live' | 'failed'

const VARIANTS: Record<StatPillVariant, string> = {
  neutral: 'bg-pill-default border-pillBorder-default text-textMuted',
  live: 'bg-pill-primary border-pillBorder-primary text-accentSoft',
  failed: 'bg-pill-danger border-pillBorder-danger text-danger',
}

export function StatPill({
  variant,
  children,
  className,
}: {
  variant: StatPillVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
