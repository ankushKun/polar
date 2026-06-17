import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import {
  getFadeUpVariants,
  getStaggerItemVariants,
  LANDING_TRANSITION,
  LANDING_VIEWPORT,
  staggerContainer,
} from './landingMotion'

type LandingRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: boolean
  item?: boolean
}

export function LandingReveal({
  children,
  className,
  delay = 0,
  stagger = false,
  item = false,
}: LandingRevealProps) {
  const reducedMotion = useReducedMotion() ?? false

  if (stagger) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={LANDING_VIEWPORT}
        variants={staggerContainer}
      >
        {children}
      </motion.div>
    )
  }

  if (item) {
    return (
      <motion.div
        className={className}
        variants={getStaggerItemVariants(reducedMotion)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_VIEWPORT}
      variants={getFadeUpVariants(reducedMotion)}
      transition={{ ...LANDING_TRANSITION, delay }}
    >
      {children}
    </motion.div>
  )
}

export function LandingRevealList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.ol
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_VIEWPORT}
      variants={staggerContainer}
    >
      {children}
    </motion.ol>
  )
}

export function LandingRevealListItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <motion.li
      className={className}
      variants={getStaggerItemVariants(reducedMotion)}
    >
      {children}
    </motion.li>
  )
}
