import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LANDING_CTA } from '../../content/landingContent'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal } from './LandingReveal'

export function LandingCta() {
  const { isAuthenticated, isCheckingProfile, login, isConnecting } = useAuth()

  return (
    <LandingSection variant="narrow" className="text-center pb-20 md:pb-28">
      <LandingReveal delay={0.05}>
        <LandingSectionHeading
          headline={LANDING_CTA.headline}
          description={LANDING_CTA.description}
          align="center"
        />
      </LandingReveal>
      <LandingReveal delay={0.1} className="mt-8 flex flex-col items-center gap-4">
        {isAuthenticated ? (
          <Link to="/dashboard">
            <Button size="lg" disabled={isCheckingProfile} className="px-10">
              {isCheckingProfile ? (
                <>
                  <Spinner className="mr-2" />
                  Loading…
                </>
              ) : (
                'Go to Dashboard'
              )}
            </Button>
          </Link>
        ) : (
          <Button size="lg" onClick={() => void login()} disabled={isConnecting} className="px-10">
            {isConnecting ? (
              <>
                <Spinner className="mr-2" />
                Redirecting…
              </>
            ) : (
              'Connect GitHub'
            )}
          </Button>
        )}
      </LandingReveal>
    </LandingSection>
  )
}
