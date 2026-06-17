import { CheckCircle2, FolderGit2, Globe } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { LANDING_WORKFLOW } from '../../content/landingContent'
import { cn } from '../../lib/utils'
import { LandingAccentPanel } from './LandingAccentPanel'
import { BrowserTrafficLights } from './BrowserTrafficLights'
import {
  getStaggerItemVariants,
  LANDING_TRANSITION,
  LANDING_VIEWPORT,
  staggerContainer,
} from './landingMotion'

const stageCardClass =
  'rounded-xl border border-border bg-landing/50 p-4 backdrop-blur-sm'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function PipelineConnector({ showTravel }: { showTravel: boolean }) {
  return (
    <div className="relative flex h-8 w-px shrink-0 self-start ml-[1.65rem]">
      <div aria-hidden className="landing-pipeline-connector absolute inset-0 w-px" />
      {showTravel && (
        <span
          aria-hidden
          className="landing-pipeline-travel absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary/80 blur-[2px]"
        />
      )}
    </div>
  )
}

function ConnectStage({
  stage,
}: {
  stage: (typeof LANDING_WORKFLOW.pipelineStages)[number]
}) {
  return (
    <div className={stageCardClass}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-textMuted/70">
        {stage.label}
      </p>
      <div className="mt-2.5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface/60">
          <GitHubIcon className="h-4 w-4 text-text" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">{stage.title}</p>
          <p className="mt-0.5 text-xs text-textMuted">{stage.detail}</p>
        </div>
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
      </div>
    </div>
  )
}

function RepoStage({
  stage,
}: {
  stage: (typeof LANDING_WORKFLOW.pipelineStages)[number]
}) {
  const framework = 'framework' in stage ? stage.framework : stage.detail

  return (
    <div className={stageCardClass}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-textMuted/70">
        {stage.label}
      </p>
      <div className="mt-2.5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface/60">
          <FolderGit2 className="h-4 w-4 text-accentSoft" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium text-text">{stage.title}</p>
          <p className="mt-0.5 text-xs text-textMuted">Framework auto-detected</p>
        </div>
        {framework && (
          <span className="shrink-0 rounded-md border border-divider bg-surface/80 px-2 py-0.5 text-[10px] font-medium text-textMuted">
            {framework}
          </span>
        )}
      </div>
    </div>
  )
}

function LiveStage({
  stage,
}: {
  stage: (typeof LANDING_WORKFLOW.pipelineStages)[number]
}) {
  return (
    <div className={stageCardClass}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-textMuted/70">
        {stage.label}
      </p>
      <div className="mt-2.5 overflow-hidden rounded-lg border border-border bg-surface/40">
        <div className="flex items-center gap-2 border-b border-divider px-3 py-2">
          <BrowserTrafficLights size="sm" />
          <div className="landing-live-pulse min-w-0 flex-1 rounded-md border border-divider bg-landing/80 px-2.5 py-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <Globe className="h-3 w-3 shrink-0 text-textMuted" aria-hidden />
              <span className="truncate font-mono text-[11px] text-text">{stage.title}</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-xs font-medium text-success">{stage.detail}</p>
          <p className="mt-0.5 text-[10px] text-textMuted">Share your preview URL instantly</p>
        </div>
      </div>
    </div>
  )
}

function PipelineStage({
  stage,
}: {
  stage: (typeof LANDING_WORKFLOW.pipelineStages)[number]
}) {
  switch (stage.id) {
    case 'connect':
      return <ConnectStage stage={stage} />
    case 'repo':
      return <RepoStage stage={stage} />
    case 'live':
      return <LiveStage stage={stage} />
    default:
      return null
  }
}

export function LandingWorkflowDiagram({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion() ?? false
  const stages = LANDING_WORKFLOW.pipelineStages

  return (
    <LandingAccentPanel
      className={cn(className)}
      minHeight="min-h-[320px]"
      variant="grid"
    >
      <motion.div
        className="flex h-full flex-col p-5 md:p-7"
        initial="hidden"
        whileInView="visible"
        viewport={LANDING_VIEWPORT}
        variants={staggerContainer}
      >
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex flex-col">
            <motion.div variants={getStaggerItemVariants(reducedMotion)} transition={LANDING_TRANSITION}>
              <PipelineStage stage={stage} />
            </motion.div>
            {i < stages.length - 1 && (
              <PipelineConnector showTravel={!reducedMotion} />
            )}
          </div>
        ))}
      </motion.div>
    </LandingAccentPanel>
  )
}
