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
      <div className="flex items-center gap-2 text-textMuted text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-white truncate max-w-[200px]" title={value}>
        {value}
      </div>
    </div>
  )
}
