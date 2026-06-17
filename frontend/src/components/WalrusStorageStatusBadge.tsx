import { AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from './ui/Badge'
import type { WalrusStorageStatus } from '../lib/epochs'

export function WalrusStorageStatusBadge({
  status,
  className,
}: {
  status: WalrusStorageStatus
  className?: string
}) {
  if (status === 'active' || status === 'unknown') return null

  if (status === 'expired') {
    return (
      <Badge variant="danger" className={`gap-1.5 normal-case font-medium ${className ?? ''}`}>
        <XCircle className="w-3 h-3" /> Storage expired
      </Badge>
    )
  }

  return (
    <Badge variant="warning" className={`gap-1.5 normal-case font-medium ${className ?? ''}`}>
      <AlertTriangle className="w-3 h-3" /> Expiring soon
    </Badge>
  )
}

export function WalrusStorageStatusLabel({ status }: { status: WalrusStorageStatus }) {
  switch (status) {
    case 'expired':
      return 'Storage expired'
    case 'expiring_soon':
      return 'Expiring soon'
    case 'active':
      return 'Storage active'
    default:
      return null
  }
}

export function WalrusStorageStatusIcon({ status }: { status: WalrusStorageStatus }) {
  switch (status) {
    case 'expired':
      return <XCircle className="w-3 h-3" />
    case 'expiring_soon':
      return <AlertTriangle className="w-3 h-3" />
    default:
      return null
  }
}
