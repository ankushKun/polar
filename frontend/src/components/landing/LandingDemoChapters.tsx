import { useEffect, useRef, type CSSProperties } from 'react'
import { LANDING_DEMO } from '../../content/landingContent'
import { cn } from '../../lib/utils'

type DemoChapter = (typeof LANDING_DEMO.chapters)[number]

type LandingDemoChaptersProps = {
  activeIndex: number
  maxHeight?: number
  onChapterSelect: (chapter: DemoChapter) => void
}

export function LandingDemoChapters({
  activeIndex,
  maxHeight,
  onChapterSelect,
}: LandingDemoChaptersProps) {
  const chapters = LANDING_DEMO.chapters
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex])

  return (
    <aside
      className={cn(
        'relative flex w-full flex-col self-start border-divider bg-landing/60',
        'border-t lg:border-t-0 lg:border-l',
        'max-h-56 lg:max-h-[var(--video-h)]',
      )}
      style={maxHeight ? ({ '--video-h': `${maxHeight}px` } as CSSProperties) : undefined}
    >
      <div aria-hidden className="landing-panel-glow pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-textMuted/70">
            Chapters
          </p>
        </div>
        <div
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          role="list"
          aria-label="Demo video chapters"
        >
          {chapters.map((chapter, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={chapter.seconds}
                ref={isActive ? activeRef : undefined}
                type="button"
                role="listitem"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onChapterSelect(chapter)}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-all duration-200',
                  isActive
                    ? 'border border-white/[0.07] bg-white/[0.04]'
                    : 'border border-transparent hover:bg-white/[0.02]',
                )}
              >
                <span
                  className={cn(
                    'w-4 shrink-0 pt-px text-right font-mono text-xs tabular-nums transition-colors',
                    isActive ? 'font-medium text-accentSoft' : 'text-textMuted/45',
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    'min-w-0 line-clamp-2 transition-colors',
                    isActive ? 'text-text' : 'text-textMuted/80',
                  )}
                >
                  {chapter.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
