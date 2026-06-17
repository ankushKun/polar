import { useState } from 'react'
import { LANDING_LINKS, teamAvatarUrl } from '../../lib/landingLinks'

function TeamMember({
  name,
  x,
  handle,
}: {
  name: string
  x: string
  handle: string
}) {
  const [avatarFailed, setAvatarFailed] = useState(false)

  return (
    <a
      href={x}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 hover:text-accentSoft transition-colors"
    >
      {avatarFailed ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface/80 text-xs font-semibold text-textMuted">
          {name[0]}
        </span>
      ) : (
        <img
          src={teamAvatarUrl(handle)}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full object-cover bg-surface/80"
          onError={() => setAvatarFailed(true)}
        />
      )}
      <span>{name}</span>
    </a>
  )
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-divider bg-backgroundSubtle overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div
            aria-hidden
            className="absolute inset-0 -m-8 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          />
          <div className="relative flex flex-col items-center gap-3">
            <img src="/PolarSvg.svg" alt="" className="w-10 h-10" draggable={false} />
            <span className="font-koulen text-4xl md:text-5xl tracking-wide text-text">
              Polar
            </span>
            <a
              href={LANDING_LINKS.app}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-textMuted hover:text-accentSoft transition-colors"
            >
              polar.wal.app
            </a>
          </div>
        </div>

        <p className="text-sm text-textMuted">
          Powered by{' '}
          <a
            href={LANDING_LINKS.walrusDeploy}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accentSoft hover:text-primary transition-colors"
          >
            walrus-deploy
          </a>
          <span aria-hidden className="mx-2 text-divider">·</span>
          <a
            href={LANDING_LINKS.walrus}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accentSoft transition-colors"
          >
            Walrus
          </a>
          <span aria-hidden className="mx-2 text-divider">·</span>
          <a
            href={LANDING_LINKS.sui}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accentSoft transition-colors"
          >
            Sui
          </a>
        </p>

        <div className="mt-8">
          <p className="mb-4 text-xs uppercase tracking-wider text-textMuted/60">Built by</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {LANDING_LINKS.team.map((member) => (
              <TeamMember
                key={member.name}
                name={member.name}
                x={member.x}
                handle={member.handle}
              />
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-textMuted/70">
          MIT License · {new Date().getFullYear()} Polar
        </p>
      </div>
    </footer>
  )
}
