import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-pill-default border-pillBorder-default text-textMuted',
  outline: 'bg-pill-default border-pillBorder-default text-textMuted',
  success: 'bg-pill-primary border-pillBorder-primary text-accentSoft',
  info: 'bg-pill-info border-pillBorder-info text-info',
  warning: 'bg-pill-warning border-pillBorder-warning text-warning',
  danger: 'bg-pill-danger border-pillBorder-danger text-danger',
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
          VARIANT_STYLES[variant],
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = 'Badge'
