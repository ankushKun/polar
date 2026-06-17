import { LANDING_INTRO } from '../../content/landingContent'
import { LANDING_LINKS } from '../../lib/landingLinks'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingChip } from './LandingChip'
import { LandingReveal } from './LandingReveal'

const STACK_HREF: Record<'walrus' | 'sui', string> = {
  walrus: LANDING_LINKS.walrus,
  sui: LANDING_LINKS.sui,
}

export function LandingIntro() {
  return (
    <LandingSection variant="narrow" className="-mt-8 md:-mt-12 pt-20 md:pt-28">
      <LandingReveal>
        <LandingSectionHeading headline={LANDING_INTRO.headline} align="center" />
      </LandingReveal>
      <LandingReveal stagger className="mt-8 space-y-4 text-center text-base md:text-lg text-textMuted leading-relaxed max-w-2xl mx-auto">
        {LANDING_INTRO.paragraphs.map((p) => (
          <LandingReveal key={p.slice(0, 32)} item>
            <p>{p}</p>
          </LandingReveal>
        ))}
      </LandingReveal>
      <LandingReveal stagger className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {LANDING_INTRO.chips.map((chip) => (
          <LandingReveal key={chip.label} item>
            <LandingChip label={chip.label} />
          </LandingReveal>
        ))}
      </LandingReveal>
      <LandingReveal delay={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-textMuted/70">
        <span className="text-textMuted/50 uppercase tracking-wider text-[10px] font-medium">
          Powered by
        </span>
        {LANDING_INTRO.stack.map((item, i) => (
          <span key={item.label} className="inline-flex items-center gap-3">
            {i > 0 && <span aria-hidden className="text-divider">·</span>}
            <a
              href={STACK_HREF[item.hrefKey]}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accentSoft transition-colors"
            >
              {item.label}
            </a>
          </span>
        ))}
      </LandingReveal>
    </LandingSection>
  )
}
