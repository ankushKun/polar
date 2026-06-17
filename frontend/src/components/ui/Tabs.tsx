import { cn } from '../../lib/utils'

export type TabItem = {
  id: string
  label: React.ReactNode
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  className,
}: {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn('border-b border-border overflow-x-auto', className)}>
      <div className="flex gap-6 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
              activeId === tab.id
                ? 'text-text border-primary'
                : 'text-textMuted border-transparent hover:text-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
