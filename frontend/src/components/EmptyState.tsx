import type { ReactNode } from 'react'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  loading,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
  loading?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold text-text mb-3">{title}</h2>
      <p className="text-textMuted mb-8 max-w-md">{description}</p>
      {action ?? (actionLabel && onAction && (
        <Button onClick={onAction} disabled={loading} size="lg" className="px-8">
          {loading ? <Spinner className="mr-2" /> : null}
          {loading ? 'Redirecting…' : actionLabel}
        </Button>
      ))}
    </div>
  )
}
