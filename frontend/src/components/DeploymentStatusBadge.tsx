import { Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from './ui/Badge'
import { Spinner } from './ui/Spinner'
import type { Deployment } from '../lib/api'

type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'default'

const STATUS_CONFIG: Record<
  string,
  { color: StatusColor; label: string; icon: React.ReactNode }
> = {
  queued: { color: 'default', label: 'Queued', icon: <Clock className="w-3 h-3" /> },
  building: { color: 'warning', label: 'Building', icon: <Spinner className="w-3 h-3" /> },
  built: { color: 'info', label: 'Built', icon: <CheckCircle2 className="w-3 h-3" /> },
  deploying: { color: 'warning', label: 'Deploying', icon: <Spinner className="w-3 h-3" /> },
  deployed: { color: 'success', label: 'Live', icon: <CheckCircle2 className="w-3 h-3" /> },
  failed: { color: 'danger', label: 'Failed', icon: <XCircle className="w-3 h-3" /> },
}

export function getDeploymentStatus(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.queued
}

export function DeploymentStatusBadge({
  status,
  className,
}: {
  status: Deployment['status'] | string
  className?: string
}) {
  const s = getDeploymentStatus(status)
  return (
    <Badge variant={s.color} className={`gap-1.5 normal-case font-medium ${className ?? ''}`}>
      {s.icon} {s.label}
    </Badge>
  )
}
