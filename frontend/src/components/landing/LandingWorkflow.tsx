import { LANDING_WORKFLOW } from '../../content/landingContent'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal, LandingRevealList, LandingRevealListItem } from './LandingReveal'
import { LandingWorkflowDiagram } from './LandingWorkflowDiagram'
import { cn } from '../../lib/utils'

export function LandingWorkflow() {
  const steps = LANDING_WORKFLOW.steps

  return (
    <LandingSection id="how-it-works">
      <LandingReveal>
        <LandingSectionHeading
          headline={LANDING_WORKFLOW.headline}
          description={LANDING_WORKFLOW.description}
          align="left"
          className="mb-12 lg:mb-16"
        />
      </LandingReveal>
      <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)] lg:gap-16">
        <LandingWorkflowDiagram className="order-1 lg:order-2" />

        <LandingRevealList className="order-2 lg:order-1 space-y-10 lg:space-y-12">
          {steps.map((step, i) => (
            <LandingRevealListItem
              key={step.title}
              className="flex gap-4 lg:gap-5"
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  'border border-border bg-primary/10',
                  'text-xs font-semibold text-accentSoft mt-0.5',
                )}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-text md:text-lg">{step.title}</h3>
                <p className="mt-1.5 text-sm text-textMuted leading-relaxed">{step.description}</p>
              </div>
            </LandingRevealListItem>
          ))}
        </LandingRevealList>
      </div>
    </LandingSection>
  )
}
