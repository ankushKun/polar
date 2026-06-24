import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string
          host?: string
          width?: string | number
          height?: string | number
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (event: { target: YTPlayer }) => void
            onStateChange?: (event: { data: number; target: YTPlayer }) => void
          }
        },
      ) => YTPlayer
      PlayerState: {
        PLAYING: number
        PAUSED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<void> | null = null

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.()
        resolve()
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    })
  }
  return ytApiPromise
}

export type LandingDemoPlayerHandle = {
  seekTo: (seconds: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  playVideo: () => void
  isPlaying: () => boolean
  togglePlay: () => void
  toggleMute: () => void
}

export type LandingDemoPlaybackState = {
  playing: boolean
  muted: boolean
  ready: boolean
}

type LandingDemoPlayerProps = {
  videoId: string
  onPlaybackStateChange?: (state: LandingDemoPlaybackState) => void
}

export const LandingDemoPlayer = forwardRef<LandingDemoPlayerHandle, LandingDemoPlayerProps>(
  function LandingDemoPlayer({ videoId, onPlaybackStateChange }, ref) {
    const mountRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YTPlayer | null>(null)
    const [ready, setReady] = useState(false)
    const [playing, setPlaying] = useState(true)
    const [muted, setMuted] = useState(true)

    useEffect(() => {
      onPlaybackStateChange?.({ playing, muted, ready })
    }, [playing, muted, ready, onPlaybackStateChange])

    useImperativeHandle(ref, () => ({
      seekTo(seconds: number) {
        const player = playerRef.current
        if (!player || !ready) return
        player.seekTo(seconds, true)
      },
      getCurrentTime() {
        const player = playerRef.current
        if (!player || !ready) return 0
        return player.getCurrentTime()
      },
      getDuration() {
        const player = playerRef.current
        if (!player || !ready) return 0
        return player.getDuration()
      },
      playVideo() {
        const player = playerRef.current
        if (!player || !ready) return
        player.playVideo()
      },
      isPlaying() {
        const player = playerRef.current
        if (!player || !ready || !window.YT) return false
        return player.getPlayerState() === window.YT.PlayerState.PLAYING
      },
      togglePlay() {
        const player = playerRef.current
        if (!player || !ready) return
        if (playing) player.pauseVideo()
        else player.playVideo()
      },
      toggleMute() {
        const player = playerRef.current
        if (!player || !ready) return
        if (muted) {
          player.unMute()
          setMuted(false)
        } else {
          player.mute()
          setMuted(true)
        }
      },
    }), [ready, playing, muted])

    useEffect(() => {
      let cancelled = false
      const mount = mountRef.current
      if (!mount) return

      void loadYouTubeIframeApi().then(() => {
        if (cancelled || !mountRef.current || !window.YT) return

        playerRef.current = new window.YT.Player(mountRef.current, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            fs: 0,
            disablekb: 1,
            autohide: 1,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return
              setReady(true)
              event.target.playVideo()
            },
            onStateChange: (event) => {
              if (event.data === window.YT?.PlayerState.PLAYING) setPlaying(true)
              if (event.data === window.YT?.PlayerState.PAUSED) setPlaying(false)
            },
          },
        })
      })

      return () => {
        cancelled = true
        playerRef.current?.destroy()
        playerRef.current = null
      }
    }, [videoId])

    return (
      <div className="relative h-full w-full">
        <div ref={mountRef} className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-20 bg-gradient-to-t from-black/80 to-transparent"
        />
      </div>
    )
  },
)
