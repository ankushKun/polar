import { cn } from '../lib/utils'

type StatPillVariant = 'neutral' | 'live' | 'failed'

const VARIANTS: Record<StatPillVariant, string> = {
  neutral: 'bg-[#d0c5f4]/20 text-[#c5d4f0]',
  live: 'bg-[#276ce4]/25 text-[#7eb3ff]',
  failed: 'bg-[#e8a598]/20 text-[#e8a598]',
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
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
