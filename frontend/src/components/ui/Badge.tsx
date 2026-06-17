import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          {
            'bg-backgroundSubtle text-textMuted': variant === 'default',
            'bg-[#276ce4]/25 text-[#7eb3ff]': variant === 'success',
            'bg-[#d4b896]/20 text-warning': variant === 'warning',
            'bg-[#e8a598]/20 text-danger': variant === 'danger',
            'bg-[#276ce4]/20 text-info': variant === 'info',
            'bg-[#d0c5f4]/20 text-[#c5d4f0]': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'
