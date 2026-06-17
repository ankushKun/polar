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

export function teamAvatarUrl(handle: string) {
  return `https://unavatar.io/twitter/${handle}`
}
