import { useEffect, useState } from 'react'
import { FlaskConical, Globe } from 'lucide-react'
import { CopyButton } from './CopyButton'
import { shortHash } from '../lib/format'

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

  if (!info || !info.address) {
    return (
      <footer className="mt-auto pt-8 pb-12 border-t border-divider text-xs text-textMuted text-center">
        <a href="/" className="hover:text-text transition-colors">Polar</a>
        <span className="mx-2 text-border">·</span>
        <a
          href="https://github.com/ankushKun/polar"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text transition-colors"
        >
          GitHub
        </a>
      </footer>
    )
  }

  return (
    <footer className="mt-auto pt-8 pb-12 border-t border-divider text-sm text-textMuted flex flex-wrap gap-6 items-center justify-center">
      <span className="font-medium">Deploy wallet</span>
      <span className="inline-flex items-center gap-1.5">
        <a
          href={`https://suiscan.xyz/testnet/account/${info.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-info font-mono hover:text-info/80 transition-colors"
          title={info.address}
        >
          {shortHash(info.address, 6, 4)}
        </a>
        <CopyButton value={info.address} title="Copy wallet address" />
      </span>

      <span className="text-border hidden sm:inline">|</span>

      <span className="inline-flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-warning" />
        <span className="text-text">{fmtMist(info.testnet.sui)} SUI</span>
        {Number(info.testnet.wal) > 0 && (
          <span>{fmtMist(info.testnet.wal)} WAL</span>
        )}
      </span>

      <span className="text-border hidden sm:inline">|</span>

      <span className="inline-flex items-center gap-2">
        <Globe className="w-4 h-4 text-success" />
        <span className="text-text">{fmtMist(info.mainnet.sui)} SUI</span>
        {Number(info.mainnet.wal) > 0 && (
          <span>{fmtMist(info.mainnet.wal)} WAL</span>
        )}
      </span>
    </footer>
  )
}
