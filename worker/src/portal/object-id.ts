import { fromHex, isValidSuiObjectId, toHex } from '@mysten/sui/utils'
import baseX from 'base-x'

const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz'
const b36 = baseX(BASE36)

export function base36ToHex(subdomain: string): string | null {
  try {
    const objectId = '0x' + toHex(b36.decode(subdomain.toLowerCase()))
    return isValidSuiObjectId(objectId) ? objectId : null
  } catch {
    return null
  }
}

export function hexToBase36(objectId: string): string {
  return b36.encode(fromHex(objectId.slice(2))).toLowerCase()
}
