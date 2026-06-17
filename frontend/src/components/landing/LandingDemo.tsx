import { Globe, Lock } from 'lucide-react'
import { LANDING_DEMO } from '../../content/landingContent'
import { LANDING_LINKS, youtubeEmbedUrl } from '../../lib/landingLinks'
import { BrowserTrafficLights } from './BrowserTrafficLights'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal } from './LandingReveal'

const DEMO_EMBED_URL = youtubeEmbedUrl(LANDING_LINKS.demo)

export function LandingDemo() {
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
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface/40 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]">
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
          <div className="relative aspect-video bg-black">
            <iframe
              src={DEMO_EMBED_URL}
              title="Polar demo video"
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </LandingReveal>
    </LandingSection>
  )
}
