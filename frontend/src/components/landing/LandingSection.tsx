import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

export function LandingSection({
  id,
  children,
  className,
  variant = 'default',
}: {
  id?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'narrow' | 'fullBleed'
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24 mx-auto px-6',
        variant === 'default' && 'max-w-[1200px]',
        variant === 'narrow' && 'max-w-3xl',
        variant === 'fullBleed' && 'max-w-none',
        className,
      )}
    >
      {children}
    </section>
  )
}
