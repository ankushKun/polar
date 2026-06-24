import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { LANDING_DEMO } from '../../content/landingContent'
import { formatChapterTime } from '../../lib/landingLinks'

type Chapter = (typeof LANDING_DEMO.chapters)[number]

type LandingDemoControlsProps = {
  playing: boolean
  muted: boolean
  ready: boolean
  progress: number
  currentTime: number
  duration: number
  chapters: readonly Chapter[]
  onTogglePlay: () => void
  onToggleMute: () => void
}

export function LandingDemoControls({
  playing,
  muted,
  ready,
  progress,
  currentTime,
  duration,
  chapters,
  onTogglePlay,
  onToggleMute,
}: LandingDemoControlsProps) {
  const percent = Math.min(100, Math.max(0, progress * 100))

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-8">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!ready}
          aria-label={playing ? 'Pause demo video' : 'Play demo video'}
          className="shrink-0 rounded-md p-1.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          disabled={!ready}
          aria-label={muted ? 'Unmute demo video' : 'Mute demo video'}
          className="shrink-0 rounded-md p-1.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
        </button>

        <div
          className="relative min-w-0 flex-1"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Video playback progress"
        >
          <div className="relative h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-linear"
              style={{ width: `${percent}%` }}
            />
            {duration > 0 &&
              chapters.map((chapter) => {
                const left = (chapter.seconds / duration) * 100
                return (
                  <span
                    key={chapter.seconds}
                    aria-hidden
                    className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35"
                    style={{ left: `${left}%` }}
                  />
                )
              })}
          </div>
        </div>

        <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/70 sm:text-xs">
          {formatChapterTime(Math.floor(currentTime))}
          {duration > 0 ? ` / ${formatChapterTime(Math.floor(duration))}` : ''}
        </span>
      </div>
    </div>
  )
}
