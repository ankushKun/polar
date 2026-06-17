export const LANDING_LINKS = {
  github: 'https://github.com/ankushKun/polar',
  walrusDeploy: 'https://github.com/ankushKun/walrus-deploy',
  demo: 'https://youtu.be/abcdwxyz',
  app: 'https://polar.wal.app',
  walrus: 'https://walrus.xyz',
  sui: 'https://sui.io',
  team: [
    { name: 'Ankush', x: 'https://x.com/ankushKun_', handle: 'ankushKun_' },
    { name: 'Vibhansh', x: 'https://x.com/RuffledZest', handle: 'RuffledZest' },
  ],
} as const

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
