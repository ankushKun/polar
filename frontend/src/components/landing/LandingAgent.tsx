import { Link } from 'react-router-dom'
import { LANDING_AGENT } from '../../content/landingContent'
import { buildMcpJson, MCP_URL } from '../../lib/mcp'
import { LandingSection } from './LandingSection'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LandingReveal } from './LandingReveal'
import { useAuth } from '../../hooks/useAuth'

export function LandingAgent() {
  const { isAuthenticated } = useAuth()
  const mcpJson = buildMcpJson()

  return (
    <LandingSection id="agents">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <LandingReveal>
          <LandingSectionHeading headline={LANDING_AGENT.headline} align="left" />
          <p className="mt-4 text-sm md:text-base text-textMuted leading-relaxed">
            {LANDING_AGENT.description}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-textMuted">
            {LANDING_AGENT.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-accentSoft shrink-0">→</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Link
                to="/agents"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Get your API key
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Sign in to connect
              </Link>
            )}
            <a
              href={MCP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-divider bg-surface/50 px-5 py-2.5 text-sm font-medium text-textMuted hover:text-text transition-colors"
            >
              {MCP_URL.replace('https://', '')}
            </a>
          </div>
        </LandingReveal>

        <LandingReveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden">
            <div className="border-b border-divider px-4 py-2.5 text-xs font-medium text-textMuted">
              .cursor/mcp.json
            </div>
            <pre className="overflow-x-auto p-4 text-xs text-text font-mono leading-relaxed max-h-[320px]">
              {mcpJson}
            </pre>
          </div>
        </LandingReveal>
      </div>
    </LandingSection>
  )
}
