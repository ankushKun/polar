import { useEffect, useState } from 'react'
import { FlaskConical, Globe } from 'lucide-react'

interface WalletInfo {
  address: string | null
  message?: string
  testnet: { sui: string; wal: string }
  mainnet: { sui: string; wal: string }
}

function fmtMist(balance: string): string {
  const n = Number(balance) / 1e9
  if (n === 0) return '0'
  if (n < 0.001) return '<0.001'
  if (n < 1) return n.toFixed(3)
  if (n < 1000) return n.toFixed(2)
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function WalletFooter() {
  const [info, setInfo] = useState<WalletInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchWallet = () => {
      const base = import.meta.env.VITE_API_BASE || '/api'
      fetch(`${base}/wallet?t=${Date.now()}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setInfo(d) })
        .catch(() => {})
    }
    fetchWallet()
    const i = setInterval(fetchWallet, 30000)
    return () => { cancelled = true; clearInterval(i) }
  }, [])

  if (!info || !info.address) return null

  return (
    <footer className="mt-12 py-4 border-t border-border text-xs text-textMuted flex flex-wrap gap-6 items-center justify-center">
      <span className="text-textMuted font-medium">Deploy wallet</span>
      <a
        href={`https://suiscan.xyz/testnet/account/${info.address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-info font-mono hover:text-info/80 transition-colors"
        title={info.address}
      >
        {shortAddr(info.address)}
      </a>

      <span className="text-border hidden sm:inline">|</span>

      <span className="inline-flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5 text-warning" />
        <span>{fmtMist(info.testnet.sui)} SUI</span>
        {Number(info.testnet.wal) > 0 && (
          <span className="text-textMuted">{fmtMist(info.testnet.wal)} WAL</span>
        )}
      </span>

      <span className="text-border hidden sm:inline">|</span>

      <span className="inline-flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-success" />
        <span>{fmtMist(info.mainnet.sui)} SUI</span>
        {Number(info.mainnet.wal) > 0 && (
          <span className="text-textMuted">{fmtMist(info.mainnet.wal)} WAL</span>
        )}
      </span>
    </footer>
  )
}
