import { GitBranch, Globe, Hash, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

function shortSha(sha: string | null | undefined): string {
  return sha ? sha.slice(0, 7) : 'unknown'
}

export function MetadataRow({
  branch,
  commitSha,
  commitTitle: commitTitleProp,
  network,
  createdAt,
  className,
}: {
  branch?: string
  commitSha?: string | null
  commitTitle?: string | null
  network?: 'mainnet' | 'testnet'
  createdAt?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-xs font-medium text-textMuted', className)}>
      {branch && (
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5" />
          {branch}
        </div>
      )}
      {commitSha !== undefined && (
        <div className="flex items-center gap-1.5" title={commitTitleProp || undefined}>
          <Hash className="w-3.5 h-3.5" />
          {shortSha(commitSha)}
        </div>
      )}
      {network && (
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          {network === 'testnet' ? 'Testnet' : 'Mainnet'}
        </div>
      )}
      {createdAt && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date(createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}
