import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LANDING_FAQ } from '../../content/landingContent'
import { LANDING_LINKS } from '../../lib/landingLinks'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal } from './LandingReveal'
import { cn } from '../../lib/utils'
import { LANDING_EASE } from './landingMotion'

const FAQ_LINKS: Record<'walrusDeploy', string> = {
  walrusDeploy: LANDING_LINKS.walrusDeploy,
}

function FaqItem({
  question,
  answer,
  linkLabel,
  linkKey,
}: {
  question: string
  answer: string
  linkLabel?: string
  linkKey?: 'walrusDeploy'
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-surface/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-text md:text-base">{question}</span>
        <span
          aria-hidden
          className={cn(
            'shrink-0 text-xl leading-none text-textMuted transition-transform duration-200',
            open && 'rotate-45',
          )}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: LANDING_EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0 md:px-6 md:pb-5">
              <p className="text-sm text-textMuted leading-relaxed">{answer}</p>
              {linkLabel && linkKey && (
                <a
                  href={FAQ_LINKS[linkKey]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-accentSoft hover:text-primary transition-colors"
                >
                  {linkLabel} →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LandingFaq() {
  return (
    <LandingSection id="faq">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
        <LandingReveal>
          <LandingSectionHeading headline={LANDING_FAQ.headline} align="left" />
          <p className="mt-4 text-sm text-textMuted leading-relaxed">{LANDING_FAQ.contact}</p>
          <a
            href={LANDING_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-accentSoft hover:text-primary transition-colors"
          >
            View on GitHub →
          </a>
        </LandingReveal>
        <LandingReveal stagger className="space-y-3">
          {LANDING_FAQ.items.map((item) => (
            <LandingReveal key={item.question} item>
              <FaqItem
                question={item.question}
                answer={item.answer}
                linkLabel={'linkLabel' in item ? item.linkLabel : undefined}
                linkKey={'linkKey' in item ? item.linkKey : undefined}
              />
            </LandingReveal>
          ))}
        </LandingReveal>
      </div>
    </LandingSection>
  )
}
