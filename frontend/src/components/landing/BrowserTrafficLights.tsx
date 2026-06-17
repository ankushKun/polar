import { cn } from '../../lib/utils'

const LIGHTS = [
  { color: '#ff5f57', label: 'Close' },
  { color: '#febc2e', label: 'Minimize' },
  { color: '#28c840', label: 'Maximize' },
] as const

export function BrowserTrafficLights({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5'

  return (
    <span className={cn('flex shrink-0', gap, className)} aria-hidden>
      {LIGHTS.map((light) => (
        <span
          key={light.label}
          title={light.label}
          className={cn(
            dotSize,
            'rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]',
          )}
          style={{ backgroundColor: light.color }}
        />
      ))}
    </span>
  )
}
