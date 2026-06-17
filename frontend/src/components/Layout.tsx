import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import WalletFooter from './WalletFooter'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Button } from './ui/Button'

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, githubLogin, logout, login, isConnecting } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="app-gradient fixed inset-0 pointer-events-none -z-10" aria-hidden />
      <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <header className="flex items-center justify-between py-6 border-b border-border mb-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-text hover:text-white transition-colors">
              <img src="/PolarSvg.svg" alt="" className="w-7 h-7" draggable={false} />
              <span className="tracking-tight">Polar</span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex gap-1">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/deploy">Deploy</NavLink>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 bg-surface px-3 py-1.5 rounded-full border border-border">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm font-medium text-textMuted">
                  {githubLogin ?? 'GitHub'}
                </span>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="text-sm font-medium text-textMuted hover:text-text transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Button type="button" onClick={() => void login()} disabled={isConnecting} size="sm">
                {isConnecting ? 'Redirecting…' : 'Sign in with GitHub'}
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        <WalletFooter />
      </div>
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-[25px] pb-[23px]',
        isActive
          ? 'text-white border-primary'
          : 'text-textMuted border-transparent hover:text-white',
      )}
    >
      {children}
    </Link>
  )
}
