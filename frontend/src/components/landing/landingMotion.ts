import type { Transition, Variants } from 'framer-motion'

export const LANDING_EASE = [0.22, 1, 0.36, 1] as const

export const LANDING_VIEWPORT = {
  once: true,
  margin: '-80px',
} as const

export const LANDING_TRANSITION: Transition = {
  duration: 0.45,
  ease: LANDING_EASE,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: LANDING_TRANSITION,
  },
}

export const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

export function getFadeUpVariants(reducedMotion: boolean): Variants {
  return reducedMotion ? fadeUpReduced : fadeUp
}

export function getStaggerItemVariants(reducedMotion: boolean): Variants {
  return reducedMotion ? staggerItemReduced : staggerItem
}
