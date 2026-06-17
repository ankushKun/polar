import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { listDeployments, type Deployment } from '../lib/api'
import { encodeRepoUrl, repoName } from '../lib/repos'
import { getWalrusStorageStatus, shouldShowPipelineStatusBadge, storageStatusPriority } from '../lib/epochs'
import { WalrusStorageStatusBadge } from '../components/WalrusStorageStatusBadge'
import { DeploymentStatusBadge } from '../components/DeploymentStatusBadge'
import { StatPill } from '../components/StatPill'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { MetadataRow } from '../components/MetadataRow'
import { PreviewUrlLink } from '../components/PreviewUrlLink'
import { GithubIcon } from '../components/icons/GithubIcon'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Plus, Box, ChevronRight } from 'lucide-react'

function findLiveDeployment(deployments: Deployment[]): Deployment | undefined {
  return deployments.find((d) => d.status === 'deployed' && (d.base36Url || d.objectId))
}

interface Project {
  repoUrl: string
  name: string
  deployments: Deployment[]
  latest: Deployment | null
  live: Deployment | null
  storagePriority: number
}

export default function Dashboard() {
  const { isAuthenticated, login, isConnecting } = useAuth()
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    listDeployments().then(setDeployments).catch(console.error).finally(() => setLoading(false))
    const interval = setInterval(() => {
      listDeployments().then(setDeployments).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const projects = useMemo<Project[]>(() => {
    const groups = new Map<string, Deployment[]>()
    for (const d of deployments) {
      if (d.status === 'deleted') continue
      const existing = groups.get(d.repoUrl) || []
      existing.push(d)
      groups.set(d.repoUrl, existing)
    }

    const result: Project[] = []
    for (const [repoUrl, deps] of groups) {
      deps.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      const live = findLiveDeployment(deps) ?? null
      const storageStatus = live ? getWalrusStorageStatus(live).status : 'unknown'
      result.push({
        repoUrl,
        name: repoName(repoUrl),
        deployments: deps,
        latest: deps[0] || null,
        live,
        storagePriority: storageStatusPriority(storageStatus),
      })
    }
    result.sort((a, b) => {
      if (a.storagePriority !== b.storagePriority) {
        return a.storagePriority - b.storagePriority
      }
      const da = a.latest ? +new Date(a.latest.createdAt) : 0
      const db = b.latest ? +new Date(b.latest.createdAt) : 0
      return db - da
    })
    return result
  }, [deployments])

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<GithubIcon className="w-8 h-8 text-primary" />}
        title="Sign in"
        description="Sign in with GitHub to view your projects and deployments."
        actionLabel="Sign in with GitHub"
        onAction={() => void login()}
        loading={isConnecting}
      />
    )
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Projects"
        actions={
          <Link to="/deploy">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Deploy
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner className="w-8 h-8 text-primary mb-4" />
          <p className="text-textMuted font-medium">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl flex flex-col items-center justify-center py-24 px-4 bg-backgroundSubtle/50">
          <Box className="w-12 h-12 text-textMuted mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">No projects yet</h3>
          <p className="text-textMuted mb-6 text-center max-w-sm">
            You haven&apos;t deployed any projects yet. Connect your GitHub and ship your first site.
          </p>
          <Link to="/deploy">
            <Button>Deploy your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const latest = project.latest
            const live = project.live
            const liveStorage = live ? getWalrusStorageStatus(live) : null
            const latestStorage = latest?.status === 'deployed' ? getWalrusStorageStatus(latest) : null
            const showLatestStatusBadge =
              latest && shouldShowPipelineStatusBadge(latest.status, latestStorage?.status)
            const total = project.deployments.length
            const liveCount = project.deployments.filter((d) => d.status === 'deployed').length
            const failedCount = project.deployments.filter((d) => d.status === 'failed').length
            const preview = live ?? latest
            const previewUrl = preview?.base36Url
            const showTotalPill = total !== liveCount + failedCount

            return (
              <Link
                key={project.repoUrl}
                to={`/projects/${encodeRepoUrl(project.repoUrl)}`}
                className="group block p-5 bg-surface rounded-xl shadow-sm hover:shadow-md hover:bg-surface/90 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                        {project.name}
                      </span>
                      {showLatestStatusBadge && latest && (
                        <DeploymentStatusBadge status={latest.status} />
                      )}
                      {liveStorage && (
                        <WalrusStorageStatusBadge status={liveStorage.status} />
                      )}
                    </div>

                    {latest && (
                      <MetadataRow
                        branch={latest.branch}
                        commitSha={latest.commitSha}
                        commitTitle={latest.commitMessage}
                        network={latest.network}
                        createdAt={latest.createdAt}
                      />
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {showTotalPill && (
                        <StatPill variant="neutral">
                          {total} deploy{total !== 1 ? 's' : ''}
                        </StatPill>
                      )}
                      {liveCount > 0 && (
                        <StatPill variant="live">
                          {liveCount} live
                        </StatPill>
                      )}
                      {failedCount > 0 && (
                        <StatPill variant="failed">
                          {failedCount} failed
                        </StatPill>
                      )}
                    </div>

                    {previewUrl && preview && (
                      <PreviewUrlLink
                        base36Url={previewUrl}
                        network={preview.network}
                        viewUrl={preview.viewUrl}
                        projectName={project.name}
                      />
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-textMuted group-hover:text-text transition-colors shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
