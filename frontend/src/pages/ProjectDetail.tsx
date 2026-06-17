import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  getProject,
  deleteProject,
  deployLatestProject,
  listProjects,
  listDeployments,
  listProjectSecrets,
  rotateProjectSecret,
  importProjectSecrets,
  deleteProjectSecret,
  listRepoCommits,
  redeployDeployment,
  type Project,
  type Deployment,
  type ProjectSecret,
  type GithubCommit,
} from '../lib/api'
import { decodeRepoUrl, repoDisplay, encodeRepoUrl, repoOwner, repoName as repoNameFromUrl } from '../lib/repos'
import { shortHash } from '../lib/format'
import { CopyButton } from '../components/CopyButton'
import {
  walrusRetentionCalendarDays,
  MAINNET_DAYS_PER_EPOCH,
  getWalrusStorageStatus,
  formatStorageEndLabel,
  shouldShowPipelineStatusBadge,
  storageStatusPriority,
} from '../lib/epochs'
import { WalrusStorageStatusBadge } from '../components/WalrusStorageStatusBadge'
import { SuinsComingSoon } from '../components/SuinsComingSoon'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DetailRow } from '../components/DetailRow'
import { DeploymentStatusBadge } from '../components/DeploymentStatusBadge'
import { LiveUrlCard } from '../components/LiveUrlCard'
import { PreviewUrlLink } from '../components/PreviewUrlLink'
import { MetadataRow } from '../components/MetadataRow'
import {
  WalrusStorageAlert,
} from '../components/WalrusStorageAlert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Tabs } from '../components/ui/Tabs'
import { Spinner } from '../components/ui/Spinner'
import {
  ArrowLeft, ExternalLink, GitBranch, Globe, Terminal,
  Clock, AlertCircle, XCircle,
  Hash, FolderOutput, Code2, Database, Trash2,
  KeyRound, Plus, RefreshCcw, Upload, ChevronRight
} from 'lucide-react'
const SECRET_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
const RESERVED_SECRET_NAMES = new Set([
  'PATH', 'HOME', 'SHELL', 'USER', 'PWD', 'OLDPWD', 'NODE_ENV', 'CI', 'PORT', 'HOST',
  'GITHUB_TOKEN', 'SUI_KEYSTORE', 'SUI_ADDRESS', 'SECRETS_ENCRYPTION_KEY', 'JWT_SECRET',
  'GITHUB_CLIENT_SECRET', 'WEBHOOK_SECRET', 'WALRUS_NETWORK', 'WALRUS_EPOCHS',
])
const RESERVED_SECRET_PREFIXES = ['SUI_', 'CF_', 'CLOUDFLARE_', 'WRANGLER_', 'POLAR_']

function validateSecretName(name: string): string | null {
  if (!SECRET_NAME_RE.test(name)) return 'Use letters, numbers, and underscores, starting with a letter or underscore.'
  const upper = name.toUpperCase()
  if (RESERVED_SECRET_NAMES.has(upper) || RESERVED_SECRET_PREFIXES.some((prefix) => upper.startsWith(prefix))) {
    return `${name} is reserved.`
  }
  return null
}

function parseSecretNames(content: string): string[] {
  const names: string[] = []
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue
    const source = line.startsWith('export ') ? line.slice(7).trimStart() : line
    const eq = source.indexOf('=')
    if (eq <= 0) throw new Error(`Invalid env line ${i + 1}`)
    const name = source.slice(0, eq).trim()
    const err = validateSecretName(name)
    if (err) throw new Error(`Line ${i + 1}: ${err}`)
    names.push(name)
  }
  return Array.from(new Set(names)).sort()
}

function shortSha(sha: string | null | undefined): string {
  return sha ? sha.slice(0, 7) : 'unknown'
}

function commitTitle(message: string | null | undefined): string {
  return (message || 'Unknown commit').split('\n')[0]
}

function countCommitsBehind(commits: GithubCommit[], commitSha: string | null | undefined): number | null {
  if (!commitSha || commits.length === 0) return null
  const index = commits.findIndex((commit) => commit.sha === commitSha)
  return index > 0 ? index : null
}

type Tab = 'overview' | 'deployments' | 'secrets' | 'suins'

export default function ProjectDetail() {
  const { encodedRepo } = useParams<{ encodedRepo: string }>()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [secrets, setSecrets] = useState<ProjectSecret[]>([])
  const [branchCommits, setBranchCommits] = useState<GithubCommit[]>([])
  const [loadingBranchHead, setLoadingBranchHead] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [deleting, setDeleting] = useState(false)
  const [deployingLatest, setDeployingLatest] = useState(false)
  const [renewingSite, setRenewingSite] = useState(false)
  const [hasProjectId, setHasProjectId] = useState(false)
  const [secretName, setSecretName] = useState('')
  const [secretValue, setSecretValue] = useState('')
  const [secretError, setSecretError] = useState<string | null>(null)
  const [savingSecret, setSavingSecret] = useState(false)
  const [importText, setImportText] = useState('')
  const [importFileName, setImportFileName] = useState('')
  const [importingSecrets, setImportingSecrets] = useState(false)

  const repoUrl = decodeRepoUrl(encodedRepo || '')
  const repoName = repoNameFromUrl(repoUrl)
  const importPreview = useMemo(() => {
    try {
      return { names: parseSecretNames(importText), error: null as string | null }
    } catch (err) {
      return { names: [] as string[], error: err instanceof Error ? err.message : 'Invalid env file' }
    }
  }, [importText])

  useEffect(() => {
    if (!isAuthenticated || !repoUrl) { setLoading(false); return }
    setLoading(true)

    async function load() {
      try {
        // Try to find a real project first
        const projects = await listProjects()
        const p = projects.find((pr) => pr.repoUrl === repoUrl)

        if (p) {
          const [data, secretList] = await Promise.all([
            getProject(p.id),
            listProjectSecrets(p.id).catch(() => [] as ProjectSecret[]),
          ])
          setProject(data.project)
          setDeployments(data.deployments)
          setSecrets(secretList)
          setHasProjectId(true)
          setError(null)
          setLoading(false)
          return
        }

        // Fallback: construct a synthetic project from deployments
        const allDeployments = await listDeployments(100, 0)
        const repoDeployments = allDeployments
          .filter((d) => d.repoUrl === repoUrl)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

        if (repoDeployments.length === 0) {
          setError('Project not found')
          setLoading(false)
          return
        }

        const latest = repoDeployments[0]
        const syntheticProject: Project = {
          id: '',
          userAddress: latest.userAddress,
          repoUrl: latest.repoUrl,
          branch: latest.branch,
          baseDir: latest.baseDir,
          installCommand: latest.installCommand,
          buildCommand: latest.buildCommand,
          outputDir: latest.outputDir,
          network: latest.network,
          createdAt: latest.createdAt,
          updatedAt: latest.updatedAt,
        }

        setProject(syntheticProject)
        setDeployments(repoDeployments)
        setSecrets([])
        setHasProjectId(false)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isAuthenticated, repoUrl])

  useEffect(() => {
    if (!isAuthenticated || !project || !hasProjectId) {
      setBranchCommits([])
      return
    }

    let cancelled = false
    const currentProject = project
    async function loadBranchHead() {
      setLoadingBranchHead(true)
      try {
        const owner = repoOwner(currentProject.repoUrl)
        const name = repoNameFromUrl(currentProject.repoUrl)
        if (!owner || !name) {
          if (!cancelled) setBranchCommits([])
          return
        }
        const commits = await listRepoCommits(owner, name, currentProject.branch)
        if (!cancelled) setBranchCommits(commits)
      } catch {
        if (!cancelled) setBranchCommits([])
      } finally {
        if (!cancelled) setLoadingBranchHead(false)
      }
    }

    void loadBranchHead()
    return () => { cancelled = true }
  }, [isAuthenticated, project, hasProjectId])

  async function handleDelete() {
    if (!project || !hasProjectId || !confirm('Delete this project and all its deployments? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteProject(project.id)
      window.location.href = '/dashboard'
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  async function handleDeployLatest() {
    if (!project || !hasProjectId) return
    setDeployingLatest(true)
    try {
      const { id } = await deployLatestProject(project.id)
      navigate(`/deployments/${id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deploy latest failed')
      setDeployingLatest(false)
    }
  }

  async function handleRenewSite(deploymentId: string, epochs?: number | 'max') {
    setRenewingSite(true)
    try {
      const { id } = await redeployDeployment(
        deploymentId,
        epochs !== undefined ? { epochs } : undefined,
      )
      navigate(`/deployments/${id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Renew failed')
      setRenewingSite(false)
    }
  }

  async function handleRotateSecret() {
    if (!project || !hasProjectId) return
    const name = secretName.trim()
    const nameError = validateSecretName(name)
    if (nameError) {
      setSecretError(nameError)
      return
    }
    if (!secretValue) {
      setSecretError('Secret value is required.')
      return
    }

    setSavingSecret(true)
    setSecretError(null)
    try {
      const updated = await rotateProjectSecret(project.id, name, secretValue)
      setSecrets(updated)
      setSecretName('')
      setSecretValue('')
    } catch (err) {
      setSecretError(err instanceof Error ? err.message : 'Failed to save secret')
    } finally {
      setSavingSecret(false)
    }
  }

  async function handleImportSecrets() {
    if (!project || !hasProjectId || !importText.trim() || importPreview.error) return
    setImportingSecrets(true)
    setSecretError(null)
    try {
      const updated = await importProjectSecrets(project.id, importText)
      setSecrets(updated)
      setImportText('')
      setImportFileName('')
    } catch (err) {
      setSecretError(err instanceof Error ? err.message : 'Failed to import secrets')
    } finally {
      setImportingSecrets(false)
    }
  }

  async function handleDeleteSecret(name: string) {
    if (!project || !hasProjectId || !confirm(`Delete ${name}? Builds will no longer receive this variable.`)) return
    setSecretError(null)
    try {
      setSecrets(await deleteProjectSecret(project.id, name))
    } catch (err) {
      setSecretError(err instanceof Error ? err.message : 'Failed to delete secret')
    }
  }

  async function handleImportFile(file: File) {
    setImportFileName(file.name)
    setImportText(await file.text())
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-textMuted mb-6">Please sign in to view this project.</p>
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
        <p className="text-textMuted font-medium">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="w-12 h-12 text-danger mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-danger">Project Not Found</h2>
        <p className="text-textMuted mb-6">{error || 'Invalid project URL.'}</p>
        <Link to="/dashboard">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const latest = deployments[0]
  const latestStorage = latest?.status === 'deployed' ? getWalrusStorageStatus(latest) : null
  const showLatestStatusBadge =
    latest && shouldShowPipelineStatusBadge(latest.status, latestStorage?.status)
  const branchHead = branchCommits[0] || null
  const hasActiveDeployment = deployments.some((d) => ['queued', 'building', 'built', 'deploying'].includes(d.status))
  const knownLatestMismatch = !!(latest?.commitSha && branchHead?.sha && latest.commitSha !== branchHead.sha)
  const commitsBehind = countCommitsBehind(branchCommits, latest?.commitSha)
  const showUpdateDeployment = hasProjectId && !!latest && !hasActiveDeployment && knownLatestMismatch
  const liveDeployment = deployments.find(
    (d) => d.status === 'deployed' && (d.base36Url || d.objectId),
  )
  const liveStorage = liveDeployment ? getWalrusStorageStatus(liveDeployment) : null
  const renewTarget = liveDeployment ?? (latest?.status === 'deployed' ? latest : null)
  const showStorageRenew =
    !!renewTarget &&
    (liveStorage?.status === 'expired' || liveStorage?.status === 'expiring_soon')

  let walrusRetentionOverview: React.ReactNode = null
  if (liveDeployment && liveStorage) {
    const effEpochs =
      liveStorage.effectiveEpochs ?? (liveDeployment.network === 'mainnet' ? 2 : 1)
    const endLabel = liveStorage.endDate
      ? formatStorageEndLabel(liveStorage.endDate)
      : ''
    const days = walrusRetentionCalendarDays(liveDeployment.network, effEpochs)
    const est = liveDeployment.epochs == null
    const cardBorder =
      liveStorage.status === 'expired'
        ? 'bg-danger/5'
        : liveStorage.status === 'expiring_soon'
          ? 'bg-warning/5'
          : ''

    walrusRetentionOverview = (
      <Card className={cardBorder}>
        <CardHeader className="pb-4 border-b border-divider">
          <CardTitle className="text-sm flex items-center justify-between gap-2 text-textMuted">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Walrus storage (approx.)
            </span>
            <WalrusStorageStatusBadge status={liveStorage.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {liveStorage.status === 'expired' && liveStorage.endDate && (
            <p className="text-sm font-medium text-danger">
              Storage likely expired around {endLabel}.
            </p>
          )}
          {liveStorage.status === 'expiring_soon' && liveStorage.daysRemaining != null && (
            <p className="text-sm font-medium text-warning">
              About {Math.ceil(liveStorage.daysRemaining)} day{Math.ceil(liveStorage.daysRemaining) === 1 ? '' : 's'} remaining. Expires around {endLabel}.
            </p>
          )}
          {liveStorage.status === 'active' && (
            <p className="text-sm text-text leading-relaxed">
              The live site is stored in Walrus for roughly{' '}
              <span className="font-semibold text-info">{days} calendar days</span>
              {liveDeployment.network === 'mainnet' ? (
                <> (~{effEpochs} epochs × ~{MAINNET_DAYS_PER_EPOCH} days each)</>
              ) : (
                <> (~{effEpochs} epoch{effEpochs === 1 ? '' : 's'} × ~1 day each)</>
              )}
              {est ? ', estimated from defaults for older deploys.' : '.'}
            </p>
          )}
          <p className="text-sm text-textMuted">
            {liveStorage.status === 'active' ? (
              <>
                That points to about{' '}
                <span className="text-text font-medium">{endLabel}</span>
              </>
            ) : (
              <>Original retention window ended around <span className="text-text font-medium">{endLabel}</span>.</>
            )}
            <span className="block mt-2 text-xs opacity-80">
              Walrus follows Sui epochs; this is a calendar guide from your deploy time, not a guaranteed on-chain timestamp.
            </span>
          </p>
        </CardContent>
      </Card>
    )
  }

  const showStorageBadge =
    liveStorage &&
    (liveStorage.status === 'expired' || liveStorage.status === 'expiring_soon')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-surface text-textMuted hover:text-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Breadcrumbs className="mb-0" items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: repoName },
        ]} />
      </div>

      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-3">
            {repoName}
          </h1>
          <a
            href={repoUrl.replace('.git', '')}
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-info hover:text-info/80 transition-colors flex items-center gap-1 mt-1"
          >
            View on GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex items-center gap-3">
          {showStorageBadge && liveStorage && (
            <WalrusStorageStatusBadge status={liveStorage.status} className="text-sm py-1 px-3" />
          )}
          {!showStorageBadge && showLatestStatusBadge && latest && (
            <DeploymentStatusBadge status={latest.status} className="text-sm py-1 px-3" />
          )}
          {showUpdateDeployment && (
            <Button variant="primary" onClick={handleDeployLatest} disabled={deployingLatest} size="sm">
              {deployingLatest ? <Spinner className="mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
              {deployingLatest ? 'Deploying...' : 'Update Deployment'}
            </Button>
          )}
          {hasProjectId && (
            <Button variant="danger" onClick={handleDelete} disabled={deleting} size="sm">
              {deleting ? <Spinner className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          )}
        </div>
      </div>

      {/* Latest Deployment Card */}
      {latest && (
        <Card className="border-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text">Latest Deployment</h2>
              <Link to={`/deployments/${latest.id}`}>
                <Button variant="secondary" size="sm">View Details</Button>
              </Link>
            </div>

            <MetadataRow
              commitSha={latest.commitSha}
              commitTitle={latest.commitMessage}
              createdAt={latest.createdAt}
              className="mb-4 text-sm"
            />

            {showUpdateDeployment && (
              <div className="mb-4 rounded-xl bg-warning/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-warning">
                      New commit available{commitsBehind ? ` (${commitsBehind} commit${commitsBehind === 1 ? '' : 's'} behind)` : ''}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-textMuted">
                      <span className="font-mono text-info">{shortSha(branchHead?.sha)}</span>
                      <span className="truncate">{commitTitle(branchHead?.message)}</span>
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleDeployLatest} disabled={deployingLatest} size="sm" className="shrink-0">
                    {deployingLatest ? <Spinner className="mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    {deployingLatest ? 'Deploying...' : 'Update Deployment'}
                  </Button>
                </div>
              </div>
            )}

            {!showUpdateDeployment && latest.commitSha && branchHead?.sha === latest.commitSha && !hasActiveDeployment && (
              <div className="mb-4 rounded-lg bg-primary/15 px-3 py-2 text-xs text-success">
                Latest deployment matches {project.branch} at {shortSha(branchHead.sha)}.
              </div>
            )}

            {!showUpdateDeployment && !latest.commitSha && !hasActiveDeployment && (
              <div className="mb-4 rounded-lg border border-border bg-surface/50 px-3 py-2 text-xs text-textMuted">
                This deployment predates commit tracking. {loadingBranchHead ? 'Checking the latest repository commit...' : 'Deploy latest to start tracking exact commits.'}
              </div>
            )}

            {showStorageRenew && liveStorage && renewTarget && (
              <div className="mb-4">
                <WalrusStorageAlert
                  storage={liveStorage}
                  disabled={hasActiveDeployment}
                  renewing={renewingSite}
                  deployment={renewTarget}
                  onRenew={(epochs) => handleRenewSite(renewTarget.id, epochs)}
                />
              </div>
            )}

            {latest.status === 'deployed' && latest.base36Url && (
              <LiveUrlCard
                base36Url={latest.base36Url}
                network={latest.network}
                viewUrl={latest.viewUrl}
                storageStatus={liveStorage?.status ?? 'active'}
                projectName={repoName}
              />
            )}

            {latest.status === 'deployed' && latest.base36Url && (
              <p className="mt-2 text-xs text-textMuted">
                Preview link uses your Walrus Site ID; custom names via SuiNS coming soon.
              </p>
            )}

            {latest.error && (
              <div className="mt-4 bg-danger/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-danger font-semibold mb-1">
                  <XCircle className="w-4 h-4" /> Build Failed
                </div>
                <pre className="text-sm text-danger/90 font-mono whitespace-pre-wrap break-words">{latest.error}</pre>
              </div>
            )}
          </div>
        </Card>
      )}

      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as Tab)}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'deployments', label: `Deployments (${deployments.length})` },
          { id: 'secrets', label: `Secrets (${secrets.length})` },
          {
            id: 'suins',
            label: (
              <span className="inline-flex items-center gap-2">
                SuiNS
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal normal-case tracking-normal">
                  Soon
                </Badge>
              </span>
            ),
          },
        ]}
      />

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Build Config */}
            <Card>
            <CardHeader className="pb-4 border-b border-divider">
              <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
                <Code2 className="w-4 h-4" /> Build Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <DetailRow icon={<GitBranch className="w-4 h-4" />} label="Branch" value={project.branch} />
              <DetailRow icon={<Globe className="w-4 h-4" />} label="Network" value={project.network === 'testnet' ? 'Testnet' : 'Mainnet'} />
              <DetailRow icon={<Terminal className="w-4 h-4" />} label="Install Cmd" value={project.installCommand || 'auto'} />
              <DetailRow icon={<Terminal className="w-4 h-4" />} label="Build Cmd" value={project.buildCommand || 'auto'} />
              <DetailRow icon={<FolderOutput className="w-4 h-4" />} label="Output Dir" value={project.outputDir || 'auto'} />
              <DetailRow icon={<FolderOutput className="w-4 h-4" />} label="Base Dir" value={project.baseDir || '.'} />
            </CardContent>
          </Card>

          {/* Storage Details */}
          {latest?.objectId && (
            <Card>
              <CardHeader className="pb-4 border-b border-divider">
                <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
                  <Database className="w-4 h-4" /> Storage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-xs font-mono text-info bg-info/10 px-3 py-2 rounded-lg min-w-0">
                  <span className="truncate" title={latest.objectId}>
                    ID: {shortHash(latest.objectId, 8, 6)}
                  </span>
                  <CopyButton value={latest.objectId} title="Copy object ID" />
                </div>
              </CardContent>
            </Card>
          )}
          </div>

          <SuinsComingSoon
            variant="teaser"
            onOpenTab={() => setActiveTab('suins')}
            hasDeployedSite={latest?.status === 'deployed'}
          />

          {walrusRetentionOverview}
        </div>
      ) : activeTab === 'deployments' ? (
        <div className="space-y-3">
          {deployments.length === 0 ? (
            <div className="text-center py-12 text-textMuted">No deployments for this project yet.</div>
          ) : (
            deployments.map((d) => {
              const deploymentStorage = d.status === 'deployed' ? getWalrusStorageStatus(d) : null
              const showPipelineBadge = shouldShowPipelineStatusBadge(d.status, deploymentStorage?.status)
              return (
                <Link
                  key={d.id}
                  to={`/deployments/${d.id}`}
                  className="group block p-4 bg-surface rounded-xl border border-border hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        {showPipelineBadge && (
                          <DeploymentStatusBadge status={d.status} />
                        )}
                        <span className="text-xs text-textMuted font-mono">{d.id.slice(0, 8)}...</span>
                      </div>
                      <MetadataRow
                        branch={d.branch}
                        commitSha={d.commitSha}
                        commitTitle={commitTitle(d.commitMessage)}
                        network={d.network}
                        createdAt={d.createdAt}
                      />
                      {d.base36Url && (
                        <PreviewUrlLink
                          base36Url={d.base36Url}
                          network={d.network}
                          viewUrl={d.viewUrl}
                          projectName={repoName}
                        />
                      )}
                      {d.status === 'deployed' && deploymentStorage && deploymentStorage.status !== 'active' && deploymentStorage.status !== 'unknown' ? (
                        <WalrusStorageStatusBadge status={deploymentStorage.status} />
                      ) : null}
                    </div>
                    <ChevronRight className="w-5 h-5 text-textMuted group-hover:text-text transition-colors shrink-0" />
                  </div>
                </Link>
              )
            })
          )}
        </div>
      ) : activeTab === 'suins' ? (
        <SuinsComingSoon variant="full" />
      ) : (
        <div className="space-y-6">
          {!hasProjectId ? (
            <Card>
              <CardContent className="py-10 text-center text-textMuted">
                Secrets are available after this repository has a project record.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-4 border-b border-divider">
                    <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
                      <KeyRound className="w-4 h-4" /> Rotate Secret
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      value={secretName}
                      onChange={(e) => setSecretName(e.target.value)}
                      placeholder="VITE_API_URL"
                      className="font-mono text-sm"
                    />
                    <Input
                      value={secretValue}
                      onChange={(e) => setSecretValue(e.target.value)}
                      placeholder="New value"
                      type="password"
                      className="font-mono text-sm"
                    />
                    <Button onClick={handleRotateSecret} disabled={savingSecret} className="w-full">
                      {savingSecret ? <Spinner className="mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                      Save Secret
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4 border-b border-divider">
                    <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
                      <Upload className="w-4 h-4" /> Import Env File
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const file = e.dataTransfer.files[0]
                        if (file) void handleImportFile(file)
                      }}
                      className="block rounded-lg border border-dashed border-border bg-surface/40 p-3 hover:border-info/25 transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        accept=".env,text/plain"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void handleImportFile(file)
                        }}
                      />
                      <div className="flex items-center gap-2 text-sm text-textMuted">
                        <Upload className="w-4 h-4" />
                        <span>{importFileName || 'Drop an .env file or click to choose one'}</span>
                      </div>
                    </label>
                    <Textarea
                      value={importText}
                      onChange={(e) => {
                        setImportText(e.target.value)
                        if (!e.target.value) setImportFileName('')
                      }}
                      spellCheck={false}
                      placeholder="VITE_API_URL=https://example.com"
                      className="min-h-[112px]"
                    />
                    {importPreview.error ? (
                      <p className="text-xs text-danger">{importPreview.error}</p>
                    ) : importPreview.names.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {importPreview.names.slice(0, 8).map((name) => (
                          <Badge key={name} variant="info" className="font-mono text-[11px] normal-case tracking-normal">
                            {name}
                          </Badge>
                        ))}
                        {importPreview.names.length > 8 && <span className="text-xs text-textMuted">+{importPreview.names.length - 8} more</span>}
                      </div>
                    ) : null}
                    <Button
                      variant="secondary"
                      onClick={handleImportSecrets}
                      disabled={importingSecrets || !importText.trim() || !!importPreview.error}
                      className="w-full"
                    >
                      {importingSecrets ? <Spinner className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Import Secrets
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {secretError && (
                <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/12">
                  {secretError}
                </div>
              )}

              <Card>
                <CardHeader className="pb-4 border-b border-divider">
                  <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
                    <KeyRound className="w-4 h-4" /> Project Secrets
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {secrets.length === 0 ? (
                    <div className="py-10 text-center text-textMuted">No secrets configured.</div>
                  ) : (
                    <div className="divide-y divide-divider">
                      {secrets.map((secret) => (
                        <div key={secret.name} className="flex items-center justify-between gap-4 py-4">
                          <div className="min-w-0">
                            <div className="font-mono text-sm text-white truncate">{secret.name}</div>
                            <div className="text-xs text-textMuted mt-1">
                              Last rotated {new Date(secret.updatedAt).toLocaleString()}
                            </div>
                          </div>
                          <Button variant="danger" size="sm" onClick={() => void handleDeleteSecret(secret.name)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
