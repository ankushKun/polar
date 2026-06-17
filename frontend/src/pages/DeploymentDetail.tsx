import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDeployment, deleteDeployment, retryDeployment, redeployDeployment, getToken, type Deployment, type Project, listProjects } from '../lib/api'
import { encodeRepoUrl, repoName } from '../lib/repos'
import { portalViewUrl } from '../lib/portal'
import { renderAnsiLogs } from '../lib/ansi'
import { useSSE } from '../hooks/useSSE'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DetailRow } from '../components/DetailRow'
import { DeploymentStatusBadge } from '../components/DeploymentStatusBadge'
import { Badge } from '../components/ui/Badge'
import { LiveUrlCard } from '../components/LiveUrlCard'
import { GithubIcon } from '../components/icons/GithubIcon'
import {
  ArrowLeft, ExternalLink, GitBranch, Globe, Terminal, Trash2, RotateCcw,
  XCircle, AlertCircle, Calendar, Hash, FolderOutput, Code2, Database, Clock
} from 'lucide-react'
import {
  getWalrusStorageStatus,
  formatStorageEndLabel,
  shouldShowPipelineStatusBadge,
  walrusRetentionCalendarDays,
} from '../lib/epochs'
import { WalrusStorageStatusBadge } from '../components/WalrusStorageStatusBadge'
import {
  WalrusStorageAlert,
  WalrusRenewActions,
} from '../components/WalrusStorageAlert'

const ACTIVE_DEPLOYMENT_STATUSES = new Set(['queued', 'building', 'built', 'deploying'])

function shortSha(sha: string | null | undefined): string {
  return sha ? sha.slice(0, 7) : 'unknown'
}

function commitTitle(message: string | null | undefined): string {
  return (message || 'Unknown commit').split('\n')[0]
}

export default function DeploymentDetail() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [d, setD] = useState<Deployment | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [redeploying, setRedeploying] = useState(false)
  const [liveLogs, setLiveLogs] = useState('')
  const [sseDone, setSseDone] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const isLive = !!(d && ['building', 'deploying'].includes(d.status))
  const hasError = !!(d && d.status === 'failed')

  // Reset local state when switching deployments
  useEffect(() => {
    setLiveLogs('')
    setSseDone(false)
    setLoading(true)
  }, [id])

  // SSE only during active build
  useSSE({
    url: isLive ? `${import.meta.env.VITE_API_BASE || '/api'}/deployments/${id}/logs` : '',
    token: getToken() || '',
    onMessage: (text) => {
      setLiveLogs((prev) => {
        const next = prev + text
        // Keep only last 100K chars to prevent memory issues
        return next.length > 100_000 ? next.slice(-100_000) : next
      })
    },
    onDone: () => {
      setSseDone(true)
      // Refresh final state from D1 with retries — worker may still be writing logs
      if (id) {
        let attempts = 0
        const fetchWithRetry = async () => {
          try {
            const dep = await getDeployment(id)
            setD(dep)
            // If worker hasn't finished writing final logs yet, retry
            if (['building', 'built', 'deploying'].includes(dep.status) && attempts < 5) {
              attempts++
              setTimeout(fetchWithRetry, 1500)
            }
          } catch {}
        }
        fetchWithRetry()
      }
    },
  })

  // Auto-scroll logs
  useEffect(() => {
    if (liveLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [liveLogs])

  // Status polling during all active phases
  useEffect(() => {
    if (!id || !isAuthenticated) return
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        const dep = await getDeployment(id)
        setD(dep)
        // Fetch project config
        if (dep.repoUrl) {
          const projects = await listProjects()
          const p = projects.find((pr) => pr.repoUrl === dep.repoUrl)
          if (p) setProject(p)
        }
        setError(null)
        if (['queued', 'building', 'built', 'deploying'].includes(dep.status)) {
          timer = setTimeout(poll, 3000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    poll()
    return () => clearTimeout(timer)
  }, [id, isAuthenticated])

  async function handleDelete() {
    if (!id || !confirm('Delete this deployment? This cannot be undone.')) return
    setDeleting(true)
    try { await deleteDeployment(id); navigate('/dashboard') }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); setDeleting(false) }
  }

  async function handleRetry() {
    if (!id) return
    setRetrying(true)
    try {
      const { id: newId } = await retryDeployment(id)
      navigate(`/deployments/${newId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Retry failed')
      setRetrying(false)
    }
  }

  async function handleRedeploy(epochs?: number | 'max') {
    if (!id) return
    setRedeploying(true)
    try {
      const { id: newId } = await redeployDeployment(
        id,
        epochs !== undefined ? { epochs } : undefined,
      )
      navigate(`/deployments/${newId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Redeploy failed')
      setRedeploying(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-textMuted mb-6">Please sign in to view this deployment.</p>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner className="w-8 h-8 text-primary mb-4" />
        <p className="text-textMuted font-medium">Loading deployment details...</p>
      </div>
    )
  }

  if (error || !d) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="w-12 h-12 text-danger mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-danger">Deployment Not Found</h2>
        <p className="text-textMuted mb-6">{error || 'The deployment you are looking for does not exist.'}</p>
        <Link to="/dashboard">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const storage = d.status === 'deployed' ? getWalrusStorageStatus(d) : null
  const showPipelineBadge = shouldShowPipelineStatusBadge(d.status, storage?.status)
  const needsStorageRenew = storage?.status === 'expired' || storage?.status === 'expiring_soon'
  const redeployLabel = needsStorageRenew ? 'Renew site' : 'Redeploy'
  const redeployingLabel = needsStorageRenew ? 'Renewing...' : 'Redeploying...'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="p-2 -ml-2 rounded-lg hover:bg-surface text-textMuted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Breadcrumbs
          className="mb-0"
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: repoName(d.repoUrl), to: `/projects/${encodeRepoUrl(d.repoUrl)}` },
            { label: d.id.slice(0, 8) },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <Card className="border-border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-text mb-2 flex items-center gap-3">
                    <GithubIcon className="w-6 h-6" />
                    {repoName(d.repoUrl)}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-textMuted">
                    <span className="flex items-center gap-1.5"><GitBranch className="w-4 h-4" /> {d.branch}</span>
                    <span className="flex items-center gap-1.5" title={d.commitMessage || undefined}><Hash className="w-4 h-4" /> {shortSha(d.commitSha)}</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {d.network === 'testnet' ? 'Testnet' : 'Mainnet'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {showPipelineBadge && (
                    <DeploymentStatusBadge status={d.status} className="text-sm py-1 px-3" />
                  )}
                  {storage && <WalrusStorageStatusBadge status={storage.status} className="text-sm py-1 px-3" />}
                </div>
              </div>

              {needsStorageRenew && storage && (
                <div className="mt-6">
                  <WalrusStorageAlert
                    storage={storage}
                    base36Url={d.base36Url}
                    network={d.network}
                    disabled={ACTIVE_DEPLOYMENT_STATUSES.has(d.status)}
                    renewing={redeploying}
                    deployment={d}
                    onRenew={(epochs) => handleRedeploy(epochs)}
                  />
                </div>
              )}

              {d.status === 'deployed' && d.base36Url && (
                <div className="mt-6">
                  <LiveUrlCard
                    base36Url={d.base36Url}
                    network={d.network}
                    viewUrl={d.viewUrl}
                    storageStatus={storage?.status ?? 'active'}
                    title={needsStorageRenew ? 'Site URL' : undefined}
                    projectName={repoName(d.repoUrl)}
                  />
                </div>
              )}

              {/* Error Box */}
              {d.error && (
                <div className="mt-6 bg-danger/10 border border-danger/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-danger font-semibold mb-2">
                    <XCircle className="w-5 h-5" /> Build Failed
                  </div>
                  <pre className="text-sm text-danger/90 font-mono whitespace-pre-wrap break-words">{d.error}</pre>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-surface/50 border-t border-divider px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl flex-wrap">
              {d.status === 'deployed' && d.base36Url && (
                <a
                  href={d.viewUrl ?? portalViewUrl(d.base36Url, d.network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-auto"
                >
                  <Button variant="primary" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View live site
                  </Button>
                </a>
              )}
              {d.status === 'failed' && (
                <Button variant="primary" onClick={handleRetry} disabled={retrying}>
                  {retrying ? <Spinner className="mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  {retrying ? 'Retrying...' : 'Retry Build'}
                </Button>
              )}
              {!ACTIVE_DEPLOYMENT_STATUSES.has(d.status) && d.status !== 'deleted' && !needsStorageRenew && (
                <Button variant="secondary" onClick={() => void handleRedeploy()} disabled={redeploying}>
                  {redeploying ? <Spinner className="mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  {redeploying ? redeployingLabel : redeployLabel}
                </Button>
              )}
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Spinner className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>

          {/* Terminal / Logs */}
          <Card className="border-border overflow-hidden bg-black flex flex-col min-h-[400px]">
            <div className="bg-surface border-b border-divider px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-textMuted">
                <Terminal className="w-4 h-4" /> Build Logs
              </div>
              {isLive && (
                <Badge variant="warning" className="gap-1.5 normal-case">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              {d.status === 'building' && (
                <div className="mx-4 mt-4 mb-0 rounded-lg border border-border bg-surface/80 px-3 py-2 text-xs text-textMuted leading-relaxed">
                  Vite may print a green “modules transformed” line before chunking and minify finish — that is not the end of the build.
                  Logs can pause for a while; <span className="text-white/90">Updated at</span> should still advance while the worker is polling.
                </div>
              )}
              {d.status === 'deploying' && (
                <div className="mx-4 mt-4 mb-0 rounded-lg border border-border bg-surface/80 px-3 py-2 text-xs text-textMuted leading-relaxed">
                  Publishing to Walrus can take several minutes. <span className="text-white/90">Updated at</span> should advance periodically while the deploy runs.
                </div>
              )}
              <div className="flex-1 p-4 overflow-x-auto overflow-y-auto max-h-[600px] font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <LogPre liveLogs={liveLogs} storedLogs={d.logs} />
                <div ref={logsEndRef} className="h-4" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Metadata) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-divider">
              <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
                <Database className="w-4 h-4" /> Deployment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              
              <div className="space-y-4">
                <DetailRow icon={<Hash className="w-4 h-4" />} label="Deployment ID" value={d.id.slice(0, 8) + '...'} />
                <DetailRow icon={<Calendar className="w-4 h-4" />} label="Created At" value={new Date(d.createdAt).toLocaleString()} />
                <DetailRow icon={<Clock className="w-4 h-4" />} label="Updated At" value={new Date(d.updatedAt).toLocaleString()} />
              </div>

              <div className="h-px bg-border/50 w-full" />

              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-2">Source Commit</h4>
                <DetailRow icon={<GitBranch className="w-4 h-4" />} label="Branch" value={d.branch} />
                <DetailRow icon={<Hash className="w-4 h-4" />} label="Commit" value={shortSha(d.commitSha)} />
                <div className="rounded-lg border border-border bg-surface/50 p-3 text-sm">
                  <div className="text-white break-words">{commitTitle(d.commitMessage)}</div>
                  <div className="mt-1 text-xs text-textMuted">
                    {d.commitAuthorName || 'Unknown author'}
                    {d.commitAuthorDate ? ` • ${new Date(d.commitAuthorDate).toLocaleString()}` : ''}
                  </div>
                  {d.commitUrl && (
                    <a
                      href={d.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-info hover:text-info/80"
                    >
                      View commit <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="h-px bg-border/50 w-full" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-2">Project Config</h4>
                  {project && (
                    <Link to={`/projects/${encodeRepoUrl(project.repoUrl)}`} className="text-xs text-info hover:text-info/80 transition-colors">
                      Edit in Project
                    </Link>
                  )}
                </div>
                <DetailRow icon={<Code2 className="w-4 h-4" />} label="Install Cmd" value={project?.installCommand || d.installCommand || 'auto'} />
                <DetailRow icon={<Terminal className="w-4 h-4" />} label="Build Cmd" value={project?.buildCommand || d.buildCommand || 'auto'} />
                <DetailRow icon={<FolderOutput className="w-4 h-4" />} label="Output Dir" value={project?.outputDir || d.outputDir || 'auto'} />
                <DetailRow icon={<FolderOutput className="w-4 h-4" />} label="Base Dir" value={project?.baseDir || d.baseDir || '.'} />
              </div>

              {d.objectId && (
                <>
                  <div className="h-px bg-border/50 w-full" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-textMuted">Storage Details</h4>
                      {storage && <WalrusStorageStatusBadge status={storage.status} />}
                    </div>
                    <div className="text-xs font-mono text-info break-all bg-info/10 p-2 rounded border border-info/20">
                      ID: {d.objectId}
                    </div>
                    {storage && storage.endDate && d.status === 'deployed' && (
                      <div className="text-xs text-textMuted space-y-1">
                        {storage.status === 'expired' ? (
                          <p className="text-danger">Likely expired around {formatStorageEndLabel(storage.endDate)}</p>
                        ) : storage.status === 'expiring_soon' ? (
                          <p className="text-warning">
                            Expires around {formatStorageEndLabel(storage.endDate)}
                            {storage.daysRemaining != null
                              ? ` (~${Math.ceil(storage.daysRemaining)} days left)`
                              : ''}
                          </p>
                        ) : (
                          <p>
                            Active until ~{formatStorageEndLabel(storage.endDate)}
                            {storage.effectiveEpochs != null && (
                              <> ({walrusRetentionCalendarDays(d.network, storage.effectiveEpochs)} days / {storage.effectiveEpochs} epochs)</>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                    {needsStorageRenew && (
                      <WalrusRenewActions
                        deployment={d}
                        disabled={ACTIVE_DEPLOYMENT_STATUSES.has(d.status)}
                        renewing={redeploying}
                        onRenew={(epochs) => void handleRedeploy(epochs)}
                      />
                    )}
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LogPre({ liveLogs, storedLogs }: { liveLogs: string; storedLogs: unknown }) {
  let html: string
  try {
    let source: string
    if (typeof liveLogs === 'string' && liveLogs.length > 0) {
      source = liveLogs
    } else if (typeof storedLogs === 'string') {
      source = storedLogs
    } else if (storedLogs == null) {
      source = 'Waiting for logs...'
    } else {
      try {
        source = String(storedLogs)
      } catch (e) {
        console.error('[LogPre] failed to coerce storedLogs:', e, storedLogs)
        source = 'Waiting for logs...'
      }
    }
    html = renderAnsiLogs(source)
  } catch (e) {
    console.error('[LogPre] render error:', e, { liveLogsLength: liveLogs?.length, storedLogsType: typeof storedLogs })
    html = '<span style="color:#f85149">[Error rendering logs]</span>'
  }
  return <pre dangerouslySetInnerHTML={{ __html: html }} className="text-textMuted" />
}
