import { Globe, Link2, Sparkles, ExternalLink, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

const PLANNED_FEATURES = [
  'Assign a SuiNS name (e.g. myapp.sui) to your live Walrus Site object',
  'Serve the site at a human-readable *.wal.app URL on the public Walrus portal (mainnet)',
  'Link or unlink names when you redeploy or switch deployments',
  'Keep your Polar preview URL as a fallback while a custom name is pending',
] as const

type SuinsComingSoonProps = {
  variant: 'teaser' | 'full'
  onOpenTab?: () => void
  hasDeployedSite?: boolean
}

export function SuinsComingSoon({ variant, onOpenTab, hasDeployedSite = true }: SuinsComingSoonProps) {
  if (variant === 'teaser') {
    return (
      <Card
        className={cn(
          'border-border/80',
          hasDeployedSite && onOpenTab && 'cursor-pointer hover:border-primary/40 transition-colors',
        )}
        onClick={hasDeployedSite && onOpenTab ? onOpenTab : undefined}
        role={hasDeployedSite && onOpenTab ? 'button' : undefined}
        tabIndex={hasDeployedSite && onOpenTab ? 0 : undefined}
        onKeyDown={
          hasDeployedSite && onOpenTab
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenTab()
                }
              }
            : undefined
        }
      >
        <CardHeader className="pb-3 border-b border-divider">
          <CardTitle className="text-sm flex items-center justify-between gap-2 text-textMuted">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Custom domain (SuiNS)
            </span>
            <Badge variant="outline">Coming soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {hasDeployedSite ? (
            <p className="text-sm text-textMuted leading-relaxed">
              Replace object IDs with a memorable SuiNS name and serve on{' '}
              <span className="text-text font-medium">*.wal.app</span>. Open the SuiNS tab to see
              what&apos;s planned.
            </p>
          ) : (
            <p className="text-sm text-textMuted leading-relaxed">
              Deploy your project first to assign a custom SuiNS name. Open the SuiNS tab to see
              what&apos;s planned.
            </p>
          )}
          {onOpenTab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenTab()
              }}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-info hover:text-info/80 transition-colors"
            >
              Learn more
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-info" />
                <h2 className="text-lg font-semibold text-text">SuiNS custom names</h2>
                <Badge variant="outline">Coming soon</Badge>
              </div>
              <p className="text-sm text-textMuted max-w-xl leading-relaxed">
                Give your Walrus deployment a human-readable name on the public Walrus portal instead
                of sharing a long object ID.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4 border-b border-divider">
            <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
              <Link2 className="w-4 h-4" /> Assign a name
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label uppercase={false} className="normal-case tracking-normal text-textMuted">
                SuiNS name
              </Label>
              <Input
                value=""
                readOnly
                disabled
                placeholder="myapp.sui"
                className="font-mono text-sm opacity-60"
              />
            </div>
            <p className="text-xs text-textMuted font-mono bg-surface/60 px-3 py-2 rounded border border-border">
              https://myapp.wal.app
            </p>
            <Button disabled className="w-full opacity-60">
              Assign SuiNS name
            </Button>
            <p className="text-xs text-textMuted">
              Mainnet deployments only · wallet signing required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b border-divider">
            <CardTitle className="text-sm flex items-center gap-2 text-textMuted">
              <Globe className="w-4 h-4" /> What you&apos;ll be able to do
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {PLANNED_FEATURES.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-sm text-textMuted leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-info shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-textMuted text-center">
        Learn more about{' '}
        <a
          href="https://suins.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-info hover:text-info/80 inline-flex items-center gap-0.5 transition-colors"
        >
          SuiNS
          <ExternalLink className="w-3 h-3" />
        </a>
      </p>
    </div>
  )
}
