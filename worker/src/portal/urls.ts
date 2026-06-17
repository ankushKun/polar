import type { WalrusNetwork } from './types'

export function portalPathPrefix(network: WalrusNetwork): 'm' | 't' {
  return network === 'mainnet' ? 'm' : 't'
}

export function deploymentViewUrl(
  base36: string,
  network: WalrusNetwork,
  origin: string,
): string {
  const prefix = portalPathPrefix(network)
  const base = origin.replace(/\/+$/, '')
  return `${base}/${prefix}/${base36}/`
}

export function parsePortalRequestPath(
  pathname: string,
  networkPrefix: 'm' | 't',
): { base36: string; sitePath: string } | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length < 2 || segments[0] !== networkPrefix) return null

  const base36 = segments[1]
  const rest = segments.slice(2).join('/')
  const sitePath = rest ? `/${rest}` : '/'

  return { base36, sitePath }
}

export function injectBaseTag(html: string, baseHref: string): string {
  const baseTag = `<base href="${baseHref}">`
  if (/<base\s/i.test(html)) return html
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`)
  }
  return `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`
}

/** Prefix root-relative paths for /m/{id}/ style portals. Leaves // protocol-relative URLs unchanged. */
export function prefixRootRelativePath(path: string, portalPrefix: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  if (path === portalPrefix || path.startsWith(`${portalPrefix}/`)) return path
  return `${portalPrefix}${path}`
}

const HTML_ROOT_RELATIVE_ATTR =
  /\b(src|href|action|formaction|poster|data)=(["'])(\/(?!\/)[^"']*)\2/gi

export function rewritePortalHtml(html: string, portalPrefix: string): string {
  const withBase = injectBaseTag(html, `${portalPrefix}/`)
  return withBase.replace(HTML_ROOT_RELATIVE_ATTR, (_, attr, quote, path) => {
    return `${attr}=${quote}${prefixRootRelativePath(path, portalPrefix)}${quote}`
  })
}

export function rewritePortalCss(css: string, portalPrefix: string): string {
  let out = css.replace(
    /url\(\s*(["']?)(\/(?!\/)[^"')]*)\1\s*\)/gi,
    (_, quote, path) => `url(${quote}${prefixRootRelativePath(path, portalPrefix)}${quote})`,
  )
  out = out.replace(
    /@import\s+(["'])(\/(?!\/)[^"']*)\1/gi,
    (_, quote, path) => `@import ${quote}${prefixRootRelativePath(path, portalPrefix)}${quote}`,
  )
  return out
}

export function rewriteLocationHeader(
  location: string,
  portalPrefix: string,
): string {
  if (location.startsWith('http://') || location.startsWith('https://')) return location
  if (location.startsWith('/')) return `${portalPrefix}${location}`
  return location
}
