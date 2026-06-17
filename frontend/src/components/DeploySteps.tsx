import { cn } from '../lib/utils'

const STEPS = ['Repository', 'Configure', 'Deploy'] as const

export function DeploySteps({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mb-8 text-sm">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3
        const isActive = step === activeStep
        const isDone = step < activeStep
        return (
          <span key={label} className="flex items-center gap-2">
            {i > 0 && <span className="text-border">→</span>}
            <span
              className={cn(
                'font-medium',
                isActive && 'text-white',
                isDone && 'text-textMuted',
                !isActive && !isDone && 'text-textMuted/60',
              )}
            >
              {label}
            </span>
          </span>
        )
      })}
    </div>
  )
}
