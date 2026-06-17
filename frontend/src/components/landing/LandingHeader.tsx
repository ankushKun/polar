import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LANDING_LINKS } from '../../lib/landingLinks'
import { cn } from '../../lib/utils'

export function LandingHeader({ heroSentinelId }: { heroSentinelId: string }) {
  const { isAuthenticated, login, isConnecting } = useAuth()
  const [scrolledPastHero, setScrolledPastHero] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById(heroSentinelId)
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastHero(!entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: '-60px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [heroSentinelId])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        aria-hidden
        className={cn(
          'landing-header-blur absolute inset-x-0 top-0 h-28 transition-opacity duration-500 ease-out',
          scrolledPastHero ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div className="relative pointer-events-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <img src="/PolarSvg.svg" alt="" className="w-7 h-7" draggable={false} />
          <span className="font-semibold tracking-tight">Polar</span>
        </Link>
        <div className="flex items-center gap-5">
          <a
            href={LANDING_LINKS.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Demo
          </a>
          {isAuthenticated ? (
            <Link to="/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void login()}
              disabled={isConnecting}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors disabled:opacity-60"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
