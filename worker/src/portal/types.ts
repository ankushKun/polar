export type WalrusNetwork = 'mainnet' | 'testnet'

export type Range = {
  start: number | null
  end: number | null
}

export type Resource = {
  path: string
  headers: Map<string, string>
  blob_id: string
  blob_hash: string
  range: Range | null
}

export type VersionedResource = Resource & {
  version: string
  objectId: string
}

export type Redirect = {
  location: string
  status_code: number
}

export type Routes = {
  routes_list: Map<string, string>
}

export type Redirects = {
  redirect_list: Map<string, Redirect>
}

export function isResource(obj: unknown): obj is Resource {
  if (!obj || typeof obj !== 'object') return false
  const r = obj as Resource
  return (
    typeof r.path === 'string' &&
    r.headers instanceof Map &&
    typeof r.blob_id === 'string' &&
    typeof r.blob_hash === 'string'
  )
}

export function optionalRangeToHeaders(range: Range | null): Record<string, string> {
  if (!range || (range.start == null && range.end == null)) return {}
  return { range: `bytes=${range.start ?? ''}-${range.end ?? ''}` }
}

export enum HttpStatusCodes {
  TOO_MANY_REDIRECTS = 310,
  NOT_FOUND = 404,
  LOOP_DETECTED = 508,
}
