import { fromBase64 } from '@mysten/bcs'
import { bcs } from '@mysten/bcs'
import { deriveDynamicFieldID } from '@mysten/sui/utils'
import type { SuiObjectData } from '@mysten/sui/jsonRpc'
import picomatch from 'picomatch'
import {
  DynamicFieldStruct,
  ResourcePathStruct,
  ResourceStruct,
  RoutesStruct,
  RedirectsStruct,
} from './bcs-data-parsing'
import { MAX_REDIRECT_DEPTH } from './config'
import { checkRedirect } from './redirects'
import { PortalRpcClient } from './rpc-client'
import type { Resource, VersionedResource, Routes, Redirects } from './types'
import { HttpStatusCodes } from './types'

export class ResourceFetcher {
  private readonly resourcePathMoveType: string

  constructor(
    private rpc: PortalRpcClient,
    sitePackageId: string,
  ) {
    this.resourcePathMoveType = `${sitePackageId}::site::ResourcePath`
  }

  async fetchResource(
    objectId: string,
    path: string,
    seenResources: Set<string> = new Set(),
    depth = 0,
  ): Promise<VersionedResource | HttpStatusCodes> {
    if (seenResources.has(objectId)) return HttpStatusCodes.LOOP_DETECTED
    if (depth >= MAX_REDIRECT_DEPTH) return HttpStatusCodes.TOO_MANY_REDIRECTS

    const dynamicFieldId = deriveDynamicFieldID(
      objectId,
      this.resourcePathMoveType,
      bcs.string().serialize(path).toBytes(),
    )

    const [primary, dynamicField] = await this.rpc.multiGetObjects(
      [objectId, dynamicFieldId],
      { showBcs: true, showDisplay: true },
    )

    seenResources.add(objectId)

    const redirectId = checkRedirect(primary)
    if (redirectId) {
      return this.fetchResource(redirectId, path, seenResources, depth + 1)
    }

    if (!dynamicField.data) return HttpStatusCodes.NOT_FOUND

    const siteResource = parseResourceFields(dynamicField.data)
    if (!siteResource?.blob_id) return HttpStatusCodes.NOT_FOUND

    return {
      ...siteResource,
      version: dynamicField.data.version,
      objectId: dynamicFieldId,
    }
  }
}

function parseResourceFields(data: SuiObjectData): Resource | null {
  if (data.bcs?.dataType !== 'moveObject') return null
  const df = DynamicFieldStruct(ResourcePathStruct, ResourceStruct).parse(
    fromBase64(data.bcs.bcsBytes),
  )
  return df.value
}

export class WalrusSitesRouter {
  constructor(private rpc: PortalRpcClient) {}

  async getRoutesAndRedirects(siteObjectId: string): Promise<{
    routes: Routes | undefined
    redirects: Redirects | undefined
  }> {
    const routesDfId = deriveSiteFieldId(siteObjectId, 'routes')
    const redirectsDfId = deriveSiteFieldId(siteObjectId, 'redirects')

    const responses = await this.rpc.multiGetObjects([routesDfId, redirectsDfId], {
      showBcs: true,
    })

    return {
      routes: parseRoutesField(responses[0]),
      redirects: parseRedirectsField(responses[1]),
    }
  }

  matchPathToRoute(path: string, routes: Routes): string | undefined {
    if (routes.routes_list.size === 0) return undefined

    const filtered = [...routes.routes_list.entries()].filter(([pattern]) =>
      new RegExp(`^${pattern.replace(/\*/g, '.*')}$`).test(path),
    )
    if (filtered.length === 0) return undefined

    return filtered.reduce((a, b) => (a[0].length >= b[0].length ? a : b))[1]
  }

  matchPathToRedirect(path: string, redirects: Redirects) {
    if (redirects.redirect_list.size === 0) return undefined

    const filtered = [...redirects.redirect_list.entries()].filter(([pattern]) =>
      picomatch(pattern, { dot: true })(path),
    )
    if (filtered.length === 0) return undefined

    return filtered.reduce((a, b) => (a[0].length >= b[0].length ? a : b))[1]
  }
}

function deriveSiteFieldId(siteObjectId: string, fieldName: string): string {
  return deriveDynamicFieldID(
    siteObjectId,
    'vector<u8>',
    bcs.vector(bcs.u8()).serialize(new TextEncoder().encode(fieldName)).toBytes(),
  )
}

function parseRoutesField(response: { data?: SuiObjectData | null }): Routes | undefined {
  if (response.data?.bcs?.dataType !== 'moveObject') return undefined
  const df = DynamicFieldStruct(bcs.vector(bcs.u8()), RoutesStruct).parse(
    fromBase64(response.data.bcs.bcsBytes),
  )
  return df.value
}

function parseRedirectsField(response: { data?: SuiObjectData | null }): Redirects | undefined {
  if (response.data?.bcs?.dataType !== 'moveObject') return undefined
  const df = DynamicFieldStruct(bcs.vector(bcs.u8()), RedirectsStruct).parse(
    fromBase64(response.data.bcs.bcsBytes),
  )
  return df.value
}
