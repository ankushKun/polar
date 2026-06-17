import { LandingHeader } from '../components/landing/LandingHeader'
import { LandingHero } from '../components/landing/LandingHero'
import { LandingFade } from '../components/landing/LandingFade'
import { LandingDemo } from '../components/landing/LandingDemo'
import { LandingIntro } from '../components/landing/LandingIntro'
import { LandingWorkflow } from '../components/landing/LandingWorkflow'
import { LandingFeatures } from '../components/landing/LandingFeatures'
import { LandingFaq } from '../components/landing/LandingFaq'
import { LandingCta } from '../components/landing/LandingCta'
import { LandingFooter } from '../components/landing/LandingFooter'

const HERO_SENTINEL_ID = 'landing-hero-sentinel'

export default function Home() {
  return (
    <div className="relative w-full bg-background">
      <LandingHeader heroSentinelId={HERO_SENTINEL_ID} />
      <LandingHero />
      <div id={HERO_SENTINEL_ID} className="h-px w-full" aria-hidden />

      <div className="relative">
        <div className="app-gradient fixed inset-0 pointer-events-none -z-10" aria-hidden />
        <LandingFade />
        <LandingDemo />
        <LandingIntro />
        <LandingWorkflow />
        <LandingFeatures />
        <LandingFaq />
        <LandingCta />
        <LandingFooter />
      </div>
    </div>
  )
}
