import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '../lib/utils'

export type BreadcrumbItem = {
  label: string
  to?: string
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-sm font-medium text-textMuted mb-6', className)}>
      <LayoutDashboard className="w-4 h-4 shrink-0" />
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2 min-w-0">
          {i > 0 && <span className="text-border">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-white transition-colors truncate max-w-[150px]">
              {item.label}
            </Link>
          ) : (
            <span className="text-white truncate max-w-[150px]">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}
