import { motion, useReducedMotion } from 'framer-motion'

type LandingDemoChapterFlashProps = {
  label: string | null | undefined
  flashKey: number | undefined
}

export function LandingDemoChapterFlash({ label, flashKey }: LandingDemoChapterFlashProps) {
  const reducedMotion = useReducedMotion() ?? false

  if (!label || flashKey === undefined) return null

  if (reducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
        <p className="rounded-xl bg-black/60 px-5 py-3 text-center text-base font-medium text-white md:text-lg">
          {label}
        </p>
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
      <motion.p
        key={flashKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="max-w-md rounded-xl bg-black/60 px-5 py-3 text-center text-base font-medium text-white md:text-lg"
      >
        {label}
      </motion.p>
    </div>
  )
}
