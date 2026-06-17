import { cn } from '../../lib/utils'
import type { SplitHeadline } from '../../content/landingContent'

export function LandingSectionHeading({
  headline,
  description,
  align = 'center',
  className,
}: {
  headline: SplitHeadline
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-xl',
        className,
      )}
    >
      <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight font-semibold tracking-tight text-balance">
        <span className="text-text">{headline.plain}</span>
        <span className="text-accentSoft font-koulen tracking-wide">{headline.accent}</span>
      </h2>
      {description && (
        <p className="mt-4 text-base md:text-lg text-textMuted leading-relaxed">{description}</p>
      )}
    </div>
  )
}
