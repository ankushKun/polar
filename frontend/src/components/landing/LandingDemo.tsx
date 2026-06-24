import { useCallback, useRef, useState } from 'react'
import { Globe, Lock } from 'lucide-react'
import { LANDING_DEMO } from '../../content/landingContent'
import { useLandingDemoPlayback } from '../../hooks/useLandingDemoPlayback'
import { useVideoColumnHeight } from '../../hooks/useVideoColumnHeight'
import { LANDING_LINKS, youtubeVideoId } from '../../lib/landingLinks'
import { BrowserTrafficLights } from './BrowserTrafficLights'
import { LandingDemoChapterFlash } from './LandingDemoChapterFlash'
import { LandingDemoChapters } from './LandingDemoChapters'
import { LandingDemoControls } from './LandingDemoControls'
import {
  LandingDemoPlayer,
  type LandingDemoPlayerHandle,
  type LandingDemoPlaybackState,
} from './LandingDemoPlayer'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal } from './LandingReveal'

const DEMO_VIDEO_ID = youtubeVideoId(LANDING_LINKS.demo)

type DemoChapter = (typeof LANDING_DEMO.chapters)[number]

const DEFAULT_PLAYBACK_STATE: LandingDemoPlaybackState = {
  playing: true,
  muted: true,
  ready: false,
}

export function LandingDemo() {
  const playerRef = useRef<LandingDemoPlayerHandle>(null)
  const { ref: videoColumnRef, height: videoHeight } = useVideoColumnHeight()
  const { currentTime, duration, progress, activeIndex, chapters } = useLandingDemoPlayback(playerRef)
  const [flash, setFlash] = useState<{ label: string; key: number } | null>(null)
  const [playbackState, setPlaybackState] = useState<LandingDemoPlaybackState>(DEFAULT_PLAYBACK_STATE)

  const handlePlaybackStateChange = useCallback((state: LandingDemoPlaybackState) => {
    setPlaybackState(state)
  }, [])

  const handleChapterSelect = (chapter: DemoChapter) => {
    const player = playerRef.current
    if (!player) return
    player.seekTo(chapter.seconds)
    if (!player.isPlaying()) player.playVideo()
    setFlash({ label: chapter.label, key: Date.now() })
  }

  return (
    <LandingSection id="demo" className="pt-12 md:pt-16 pb-8 md:pb-12">
      <LandingReveal>
        <LandingSectionHeading
          headline={LANDING_DEMO.headline}
          description={LANDING_DEMO.description}
          align="center"
          className="mb-8 md:mb-10"
        />
      </LandingReveal>
      <LandingReveal delay={0.08}>
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface/40 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-3 border-b border-divider bg-landing/80 px-4 py-3">
            <BrowserTrafficLights />
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-divider bg-surface/60 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5 shrink-0 text-textMuted/70" aria-hidden />
              <Globe className="h-3.5 w-3.5 shrink-0 text-textMuted" aria-hidden />
              <span className="truncate font-mono text-xs text-textMuted">
                {LANDING_DEMO.urlBar}
              </span>
            </div>
          </div>
          <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
            <div
              ref={videoColumnRef}
              className="relative aspect-video w-full self-start bg-black"
            >
              {DEMO_VIDEO_ID ? (
                <LandingDemoPlayer
                  ref={playerRef}
                  videoId={DEMO_VIDEO_ID}
                  onPlaybackStateChange={handlePlaybackStateChange}
                />
              ) : null}
              <LandingDemoChapterFlash label={flash?.label} flashKey={flash?.key} />
              <LandingDemoControls
                playing={playbackState.playing}
                muted={playbackState.muted}
                ready={playbackState.ready}
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                chapters={chapters}
                onTogglePlay={() => playerRef.current?.togglePlay()}
                onToggleMute={() => playerRef.current?.toggleMute()}
              />
            </div>
            <LandingDemoChapters
              activeIndex={activeIndex}
              maxHeight={videoHeight}
              onChapterSelect={handleChapterSelect}
            />
          </div>
        </div>
      </LandingReveal>
    </LandingSection>
  )
}
