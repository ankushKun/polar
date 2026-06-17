import { bcs, type BcsType } from '@mysten/bcs'
import { fromHex, toHex, toBase64 } from '@mysten/sui/utils'
import { base64UrlSafeEncode } from './url-safe-base64'
import type { Range } from './types'

const Address = bcs.bytes(32).transform({
  input: (id: string) => fromHex(id),
  output: (id) => toHex(id),
})

const BLOB_ID = bcs.u256().transform({
  input: (id: string) => id,
  output: (id) => base64UrlSafeEncode(bcs.u256().serialize(id).toBytes()),
})

const DATA_HASH = bcs.u256().transform({
  input: (id: string) => id,
  output: (id) => toBase64(bcs.u256().serialize(id).toBytes()),
})

export const ResourcePathStruct = bcs.struct('ResourcePath', {
  path: bcs.string(),
})

const OPTION_U64 = bcs.option(bcs.u64()).transform({
  input: (value: number | null) => value,
  output: (value: string | null) => (value ? Number(value) : null),
})

const RangeStruct = bcs.struct('Range', {
  start: OPTION_U64,
  end: OPTION_U64,
})

const OptionalRangeStruct = bcs.option(RangeStruct).transform({
  input: (value: Range | null) => value,
  output: (value) => (value ? value : null),
})

export const ResourceStruct = bcs.struct('Resource', {
  path: bcs.string(),
  headers: bcs.map(bcs.string(), bcs.string()),
  blob_id: BLOB_ID,
  blob_hash: DATA_HASH,
  range: OptionalRangeStruct,
})

export function DynamicFieldStruct<K, V>(K: BcsType<K>, V: BcsType<V>) {
  return bcs.struct(`DynamicFieldStruct<${K.name}, ${V.name}>`, {
    parentId: Address,
    name: K,
    value: V,
  })
}

export const RoutesStruct = bcs.struct('Routes', {
  routes_list: bcs.map(bcs.string(), bcs.string()),
})

export const RedirectStruct = bcs.struct('Redirect', {
  location: bcs.string(),
  status_code: bcs.u16(),
})

export const RedirectsStruct = bcs.struct('Redirects', {
  redirect_list: bcs.map(bcs.string(), RedirectStruct),
})
