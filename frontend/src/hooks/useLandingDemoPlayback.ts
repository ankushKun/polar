import { useEffect, useState, type RefObject } from 'react'
import { LANDING_DEMO } from '../content/landingContent'
import { activeChapterIndex } from '../lib/landingLinks'
import type { LandingDemoPlayerHandle } from '../components/landing/LandingDemoPlayer'

const POLL_MS = 400

export function useLandingDemoPlayback(playerRef: RefObject<LandingDemoPlayerHandle | null>) {
  const chapters = LANDING_DEMO.chapters
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const player = playerRef.current
      if (!player) return
      setCurrentTime(player.getCurrentTime())
      const d = player.getDuration()
      if (d > 0) setDuration(d)
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [playerRef])

  const progress = duration > 0 ? currentTime / duration : 0
  const activeIndex = activeChapterIndex(chapters, currentTime)

  return { currentTime, duration, progress, activeIndex, chapters }
}
