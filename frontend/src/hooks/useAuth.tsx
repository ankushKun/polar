import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { devLogin as apiDevLogin, getToken, setToken, clearToken, getGithubLoginUrl, fetchMe } from '../lib/api'
import { isDevAuthBypassEnabled } from '../lib/devFlags'
import posthog from 'posthog-js'

type AuthContextValue = {
  isAuthenticated: boolean
  githubLogin: string | null
  isCheckingProfile: boolean
  isConnecting: boolean
  error: string | null
  devAuthAvailable: boolean
  login: () => Promise<void>
  devLogin: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(() => getToken())
  const [githubLogin, setGithubLogin] = useState<string | null>(null)
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(() => !!getToken())
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setGithubLogin(null)
      setIsCheckingProfile(false)
      return
    }
    setIsCheckingProfile(true)
    try {
      const me = await fetchMe()
      setGithubLogin(me.github_login)
      if (me.github_login) {
        posthog.identify(me.github_login)
        posthog.capture('user_logged_in', { github_login: me.github_login })
      }
    } catch {
      clearToken()
      setTok(null)
      setGithubLogin(null)
    } finally {
      setIsCheckingProfile(false)
    }
  }, [])

  useEffect(() => {
    const raw = window.location.hash.slice(1)
    if (!raw) return
    const params = new URLSearchParams(raw)
    const tokenFromHash = params.get('token')
    const err = params.get('error')
    if (tokenFromHash) {
      setIsCheckingProfile(true)
      setToken(tokenFromHash)
      setTok(tokenFromHash)
      setError(null)
    }
    if (err) {
      setError(decodeURIComponent(err))
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

  useEffect(() => {
    if (token) void refreshProfile()
    else setGithubLogin(null)
  }, [token, refreshProfile])

  const login = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const url = await getGithubLoginUrl()
      window.location.href = url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
      setIsConnecting(false)
    }
  }, [])

  const devLogin = useCallback(async () => {
    if (!isDevAuthBypassEnabled) return
    setIsConnecting(true)
    setError(null)
    try {
      const sessionToken = await apiDevLogin()
      setToken(sessionToken)
      setTok(sessionToken)
      setIsCheckingProfile(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dev login failed')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const logout = useCallback(() => {
    posthog.capture('user_logged_out')
    posthog.reset()
    clearToken()
    setTok(null)
    setGithubLogin(null)
    setIsCheckingProfile(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!token,
      githubLogin,
      isCheckingProfile,
      isConnecting,
      error,
      devAuthAvailable: isDevAuthBypassEnabled,
      login,
      devLogin,
      logout,
    }),
    [token, githubLogin, isCheckingProfile, isConnecting, error, login, devLogin, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
