import { motion, useReducedMotion } from 'framer-motion'
import { LANDING_FEATURES } from '../../content/landingContent'
import { LANDING_LINKS } from '../../lib/landingLinks'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal } from './LandingReveal'
import { cn } from '../../lib/utils'

const TILE_LINKS: Record<'walrusDeploy', string> = {
  walrusDeploy: LANDING_LINKS.walrusDeploy,
}

function FeatureTile({
  title,
  description,
  className,
  children,
  linkLabel,
  linkKey,
}: {
  title: string
  description: string
  className?: string
  children?: React.ReactNode
  linkLabel?: string
  linkKey?: 'walrusDeploy'
}) {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <motion.article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 md:p-6',
        'transition-colors duration-200 hover:bg-surface/50',
        className,
      )}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div aria-hidden className="landing-panel-glow absolute inset-0 pointer-events-none opacity-60" />
      <div className="relative">
        <h3 className="text-base font-semibold text-text md:text-lg">{title}</h3>
        <p className="mt-2 text-sm text-textMuted leading-relaxed">{description}</p>
        {linkLabel && linkKey && (
          <a
            href={TILE_LINKS[linkKey]}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-accentSoft hover:text-primary transition-colors"
          >
            {linkLabel} →
          </a>
        )}
        {children}
      </div>
    </motion.article>
  )
}

export function LandingFeatures() {
  const wallet = LANDING_FEATURES.tiles.find((t) => t.id === 'wallet')!
  const frameworks = LANDING_FEATURES.tiles.find((t) => t.id === 'frameworks')!
  const bottomTiles = LANDING_FEATURES.tiles.filter(
    (t) => t.id !== 'wallet' && t.id !== 'frameworks',
  )

  return (
    <LandingSection>
      <LandingReveal>
        <LandingSectionHeading
          headline={LANDING_FEATURES.headline}
          description={LANDING_FEATURES.description}
          align="center"
          className="mb-12 md:mb-16"
        />
      </LandingReveal>
      <LandingReveal stagger className="grid gap-4 md:grid-cols-3 md:gap-5">
        <LandingReveal item className="md:col-span-1">
          <FeatureTile
            title={wallet.title}
            description={wallet.description}
            className="min-h-[180px]"
          />
        </LandingReveal>
        <LandingReveal item className="md:col-span-2">
          <FeatureTile
            title={frameworks.title}
            description={frameworks.description}
            className="md:min-h-[220px]"
          >
            <LandingReveal stagger className="mt-4 flex flex-wrap gap-2">
              {LANDING_FEATURES.frameworks.map((fw) => (
                <LandingReveal key={fw} item>
                  <span className="rounded-md border border-divider bg-landing/60 px-2.5 py-1 text-xs font-medium text-textMuted">
                    {fw}
                  </span>
                </LandingReveal>
              ))}
            </LandingReveal>
          </FeatureTile>
        </LandingReveal>
      </LandingReveal>
      <LandingReveal stagger className="mt-4 grid gap-4 md:grid-cols-3 md:gap-5">
        {bottomTiles.map((tile) => (
          <LandingReveal key={tile.id} item>
            <FeatureTile
              title={tile.title}
              description={tile.description}
              linkLabel={'linkLabel' in tile ? tile.linkLabel : undefined}
              linkKey={'linkKey' in tile ? tile.linkKey : undefined}
            />
          </LandingReveal>
        ))}
      </LandingReveal>
    </LandingSection>
  )
}
