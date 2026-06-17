import { FlaskConical, Globe } from 'lucide-react'
import { Badge } from './ui/Badge'
import { cn } from '../lib/utils'

export function NetworkBadge({
  network,
  className,
  showIcon = true,
}: {
  network: 'mainnet' | 'testnet'
  className?: string
  showIcon?: boolean
}) {
  const isTestnet = network === 'testnet'
  return (
    <Badge
      variant={isTestnet ? 'warning' : 'success'}
      className={cn('gap-1 normal-case tracking-normal font-medium', className)}
    >
      {showIcon && (isTestnet ? <FlaskConical className="w-3 h-3" /> : <Globe className="w-3 h-3" />)}
      {isTestnet ? 'Testnet' : 'Mainnet'}
    </Badge>
  )
}
