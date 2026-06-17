export function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-textMuted text-sm shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="text-sm font-medium text-text truncate max-w-[min(280px,50%)] text-right"
        title={value}
      >
        {value}
      </div>
    </div>
  )
}
