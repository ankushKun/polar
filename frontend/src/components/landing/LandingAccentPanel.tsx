import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function LandingAccentPanel({
  children,
  className,
  minHeight = 'min-h-[320px]',
  variant = 'default',
}: {
  children: ReactNode
  className?: string
  minHeight?: string
  variant?: 'default' | 'grid'
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-surface/40',
        minHeight,
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'landing-panel-glow absolute inset-0 pointer-events-none',
          variant === 'grid' && 'landing-panel-glow-strong',
        )}
      />
      {variant === 'grid' && (
        <div aria-hidden className="landing-panel-grid absolute inset-0 pointer-events-none" />
      )}
      <div className="relative h-full">{children}</div>
    </div>
  )
}
