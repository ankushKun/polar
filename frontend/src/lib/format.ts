export function truncateMiddle(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  const keep = Math.max(2, Math.floor((maxLen - 1) / 2))
  return `${str.slice(0, keep)}…${str.slice(-keep)}`
}

export function shortHash(value: string, head = 6, tail = 4): string {
  const v = value.trim()
  if (v.length <= head + tail + 1) return v
  return `${v.slice(0, head)}…${v.slice(-tail)}`
}

export function shortBase36Host(label: string, maxLen = 36): string {
  const dot = label.indexOf('.')
  if (dot === -1) return truncateMiddle(label, maxLen)
  const host = label.slice(0, dot)
  const rest = label.slice(dot)
  if (host.length + rest.length <= maxLen) return label
  const budget = maxLen - rest.length - 1
  if (budget < 4) return truncateMiddle(label, maxLen)
  return `${truncateMiddle(host, budget)}${rest}`
}
