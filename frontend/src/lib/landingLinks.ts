export const LANDING_LINKS = {
  github: 'https://github.com/ankushKun/polar',
  walrusDeploy: 'https://github.com/ankushKun/walrus-deploy',
  demo: 'https://www.youtube.com/watch?v=E7KGeuMDf9k',
  app: 'https://polar.wal.app',
  walrus: 'https://walrus.xyz',
  sui: 'https://sui.io',
  team: [
    { name: 'Ankush', x: 'https://x.com/ankushKun_', handle: 'ankushKun_' },
    { name: 'Vibhansh', x: 'https://x.com/RuffledZest', handle: 'RuffledZest' },
  ],
} as const

/** Extract YouTube video ID from watch or youtu.be URL */
export function youtubeVideoId(watchUrl: string): string | null {
  try {
    const url = new URL(watchUrl)
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }
    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v')
    }
  } catch {
    // fall through
  }
  return null
}

/** YouTube watch URL → privacy-friendly embed URL */
export function youtubeEmbedUrl(watchUrl: string): string {
  try {
    const url = new URL(watchUrl)
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '')
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v')
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
  } catch {
    // fall through
  }
  return watchUrl
}

export function teamAvatarUrl(handle: string) {
  return `https://unavatar.io/twitter/${handle}`
}

/** Format seconds as M:SS for video chapter timestamps */
export function formatChapterTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Index of the chapter currently playing based on elapsed time */
export function activeChapterIndex(
  chapters: readonly { seconds: number }[],
  currentTime: number,
): number {
  let active = 0
  for (let i = 0; i < chapters.length; i++) {
    if (chapters[i].seconds <= currentTime) active = i
    else break
  }
  return active
}
