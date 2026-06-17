import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  createAgentToken,
  getAgentTokenStatus,
  revokeAgentToken,
  type AgentTokenStatus,
} from '../lib/api'
import { MCP_URL, buildMcpJson } from '../lib/mcp'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Copy, KeyRound, RefreshCw, Trash2 } from 'lucide-react'

function maskApiKey(token: string): string {
  if (token.length <= 20) return token
  const edge = Math.max(8, Math.floor(token.length / 4))
  return `${token.slice(0, edge)}*******${token.slice(-edge)}`
}

export default function Agents() {
  const { isAuthenticated, login, devLogin, isConnecting, devAuthAvailable } = useAuth()
  const [status, setStatus] = useState<AgentTokenStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [revealedToken, setRevealedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'key' | 'json' | null>(null)

  const loadStatus = useCallback(async () => {
    setError(null)
    try {
      setStatus(await getAgentTokenStatus())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load API key status')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    loadStatus().finally(() => setLoading(false))
  }, [isAuthenticated, loadStatus])

  const mcpJson = useMemo(
    () => buildMcpJson(revealedToken ?? undefined),
    [revealedToken],
  )

  async function copyText(text: string, kind: 'key' | 'json') {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleGenerate(regenerate = false) {
    if (regenerate) {
      const ok = confirm(
        'Regenerate your API key? The current key will stop working immediately. Copy the new key before leaving this page.',
      )
      if (!ok) return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await createAgentToken()
      setRevealedToken(result.token)
      setStatus({
        configured: true,
        prefix: result.prefix,
        createdAt: result.createdAt,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate API key')
    } finally {
      setBusy(false)
    }
  }

  async function handleRevoke() {
    if (!confirm('Revoke your API key? Agents using it will lose access immediately.')) return
    setBusy(true)
    setError(null)
    try {
      await revokeAgentToken()
      setRevealedToken(null)
      setStatus({ configured: false, prefix: null, createdAt: null })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to revoke API key')
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <KeyRound className="w-12 h-12 mx-auto text-textMuted mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Agents & MCP</h1>
        <p className="text-textMuted mb-6">
          Sign in to generate an API key and connect Cursor or Claude to Polar&apos;s hosted MCP.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {devAuthAvailable && (
            <Button type="button" variant="secondary" onClick={() => void devLogin()} disabled={isConnecting}>
              Dev login
            </Button>
          )}
          <Button type="button" onClick={() => void login()} disabled={isConnecting}>
            Sign in with GitHub
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Agents & MCP"
        description="Connect AI agents to Polar via our hosted MCP — no local install. Manage your long-lived API key here."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface/40 p-6 mb-6">
        <h2 className="text-lg font-semibold text-text">API key</h2>
        <p className="mt-1 text-sm text-textMuted">
          One key per account. Regenerating replaces the previous key. Use{' '}
          <code className="text-xs bg-landing/80 px-1 py-0.5 rounded">Authorization: Bearer polar_live_…</code>{' '}
          for MCP and REST.
        </p>

        {status?.configured ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-textMuted">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-landing/50 px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                Active · {status.prefix}…
              </span>
              {status.createdAt && (
                <span>Created {new Date(status.createdAt).toLocaleString()}</span>
              )}
            </div>

            {revealedToken ? (
              <div className="rounded-lg border border-divider bg-landing/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-textMuted mb-2">
                  Copy now — shown once
                </p>
                <code className="block break-all text-sm text-text font-mono">{maskApiKey(revealedToken)}</code>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void copyText(revealedToken, 'key')}
                  >
                    <Copy className="w-4 h-4 mr-1.5" />
                    {copied === 'key' ? 'Copied' : 'Copy key'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-textMuted">
                Key is configured. Regenerate to get a new token (the old one stops working).
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void handleGenerate(true)} disabled={busy}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                {status.configured ? 'Regenerate key' : 'Generate key'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void handleRevoke()} disabled={busy}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Revoke
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-textMuted mb-4">No API key yet. Generate one to use Polar from Cursor or Claude Desktop.</p>
            <Button type="button" onClick={() => void handleGenerate()} disabled={busy}>
              Generate API key
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface/40 p-6">
        <h2 className="text-lg font-semibold text-text">Cursor / Claude MCP config</h2>
        <p className="mt-1 text-sm text-textMuted">
          Hosted endpoint:{' '}
          <a href={MCP_URL} className="text-accentSoft hover:text-primary transition-colors" target="_blank" rel="noreferrer">
            {MCP_URL}
          </a>
        </p>
        <p className="mt-2 text-sm text-textMuted">
          Add this to your project&apos;s <code className="text-xs bg-landing/80 px-1 py-0.5 rounded">.cursor/mcp.json</code>{' '}
          or Claude Desktop config. Replace the bearer token after generating a key.
        </p>

        <pre className="mt-4 overflow-x-auto rounded-lg border border-divider bg-landing/60 p-4 text-xs text-text font-mono leading-relaxed">
          {mcpJson}
        </pre>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => void copyText(mcpJson, 'json')}>
            <Copy className="w-4 h-4 mr-1.5" />
            {copied === 'json' ? 'Copied' : 'Copy mcp.json'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-textMuted">
          Tip: use <code className="bg-landing/80 px-1 py-0.5 rounded">Bearer ${'${env:POLAR_API_KEY}'}</code> in team repos
          and set <code className="bg-landing/80 px-1 py-0.5 rounded">POLAR_API_KEY</code> in your environment.
        </p>
      </section>

      <p className="mt-6 text-sm text-textMuted">
        Link GitHub first if agents need repo access —{' '}
        <Link to="/deploy" className="text-accentSoft hover:text-primary transition-colors">
          Deploy
        </Link>
        .
      </p>
    </div>
  )
}
