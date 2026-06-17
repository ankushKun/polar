import { toBase64 } from '@mysten/bcs'
import { blobAggregatorEndpoint, quiltAggregatorEndpoint } from './aggregator'
import { AGGREGATOR_TIMEOUT_MS, QUILT_PATCH_INTERNAL_HEADER, getPortalConfig } from './config'
import { sha256 } from './crypto'
import { QuiltPatch } from './quilt'
import { ResourceFetcher, WalrusSitesRouter } from './resource'
import { PortalRpcClient } from './rpc-client'
import type { WalrusNetwork } from './types'
import { HttpStatusCodes, isResource, optionalRangeToHeaders } from './types'
import {
  aggregatorFail,
  blobUnavailable,
  custom404NotFound,
  hashMismatch,
  redirectLoopDetected,
  siteNotFound,
} from './errors'

export type FetchUrlResult =
  | { status: 'ok'; response: Response }
  | { status: 'not_found' }
  | { status: 'blob_unavailable'; response: Response }
  | { status: 'aggregator_fail'; response: Response }
  | { status: 'hash_mismatch'; response: Response }

export class PortalFetcher {
  private resourceFetcher: ResourceFetcher
  private router: WalrusSitesRouter
  private aggregatorUrls: string[]

  constructor(network: WalrusNetwork) {
    const config = getPortalConfig(network)
    const rpc = new PortalRpcClient(config.rpcUrls, network)
    this.resourceFetcher = new ResourceFetcher(rpc, config.sitePackageId)
    this.router = new WalrusSitesRouter(rpc)
    this.aggregatorUrls = config.aggregatorUrls
  }

  async fetchSiteResource(objectId: string, path: string): Promise<Response> {
    const normalizedPath = normalizeSitePath(path)

    const routingPromise = this.router.getRoutesAndRedirects(objectId)
    const fetchResult = await this.fetchUrl(objectId, normalizedPath)

    if (fetchResult.status !== 'not_found') {
      return unwrapFetchResult(fetchResult)
    }

    const { routes, redirects } = await routingPromise

    if (redirects) {
      const redirect = this.router.matchPathToRedirect(normalizedPath, redirects)
      if (redirect) {
        if (redirect.location === normalizedPath) return redirectLoopDetected()
        return new Response(null, {
          status: redirect.status_code,
          headers: { Location: redirect.location },
        })
      }
    }

    if (routes) {
      const matchingRoute = this.router.matchPathToRoute(normalizedPath, routes)
      if (matchingRoute) {
        const routeResult = await this.fetchUrl(objectId, matchingRoute)
        if (routeResult.status !== 'not_found') return unwrapFetchResult(routeResult)
      }
    }

    if (normalizedPath !== '/404.html') {
      const notFoundResult = await this.fetchUrl(objectId, '/404.html')
      if (notFoundResult.status !== 'not_found') return unwrapFetchResult(notFoundResult)
    }

    return custom404NotFound()
  }

  private async fetchUrl(objectId: string, path: string): Promise<FetchUrlResult> {
    const result = await this.resourceFetcher.fetchResource(objectId, path)

    if (typeof result === 'number') {
      if (result === HttpStatusCodes.NOT_FOUND) return { status: 'not_found' }
      return { status: 'ok', response: siteNotFound() }
    }

    if (!isResource(result) || !result.blob_id) return { status: 'not_found' }

    const quiltInternalId = result.headers.get(QUILT_PATCH_INTERNAL_HEADER)
    let endpointBuilder: (url: string) => URL

    if (quiltInternalId) {
      const patchId = new QuiltPatch(result.blob_id, quiltInternalId).deriveId()
      endpointBuilder = (url) => quiltAggregatorEndpoint(patchId, url)
    } else {
      endpointBuilder = (url) => blobAggregatorEndpoint(result.blob_id, url)
    }

    const rangeHeaders = optionalRangeToHeaders(result.range)
    const aggregatorResult = await this.fetchFromAggregators(endpointBuilder, rangeHeaders)

    if (aggregatorResult.type === 'fail') {
      return { status: 'aggregator_fail', response: aggregatorFail() }
    }
    if (aggregatorResult.type === 'blob_unavailable') {
      return { status: 'blob_unavailable', response: blobUnavailable(result.blob_id) }
    }

    const body = aggregatorResult.body
    const hash = toBase64(await sha256(body))
    if (result.blob_hash !== hash) {
      return { status: 'hash_mismatch', response: hashMismatch() }
    }

    const responseHeaders: Record<string, string> = {
      ...Object.fromEntries(result.headers),
      'x-resource-sui-object-version': result.version,
      'x-resource-sui-object-id': result.objectId,
      'x-unix-time-cached': Date.now().toString(),
    }
    delete responseHeaders[QUILT_PATCH_INTERNAL_HEADER]

    return {
      status: 'ok',
      response: new Response(body, {
        status: path === '/404.html' ? 404 : 200,
        headers: responseHeaders,
      }),
    }
  }

  private async fetchFromAggregators(
    endpointBuilder: (url: string) => URL,
    headers: Record<string, string>,
  ): Promise<
    | { type: 'ok'; body: ArrayBuffer }
    | { type: 'blob_unavailable' }
    | { type: 'fail' }
  > {
    for (const aggregatorUrl of this.aggregatorUrls) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const endpoint = endpointBuilder(aggregatorUrl)
        try {
          const response = await fetch(endpoint, {
            headers,
            signal: AbortSignal.timeout(AGGREGATOR_TIMEOUT_MS),
          })

          if (response.ok) {
            return { type: 'ok', body: await response.arrayBuffer() }
          }
          if (response.status === 404) return { type: 'blob_unavailable' }
          if (response.status === 502 || response.status >= 500) continue
          if (response.status === 403) break
          return { type: 'fail' }
        } catch {
          continue
        }
      }
    }
    return { type: 'fail' }
  }
}

function normalizeSitePath(path: string): string {
  if (path === '/' || path === '') return '/index.html'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function unwrapFetchResult(result: Exclude<FetchUrlResult, { status: 'not_found' }>): Response {
  return result.response
}

const fetcherCache = new Map<WalrusNetwork, PortalFetcher>()

export function getPortalFetcher(network: WalrusNetwork): PortalFetcher {
  let fetcher = fetcherCache.get(network)
  if (!fetcher) {
    fetcher = new PortalFetcher(network)
    fetcherCache.set(network, fetcher)
  }
  return fetcher
}
