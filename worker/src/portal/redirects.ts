import type { SuiObjectResponse } from '@mysten/sui/jsonRpc'

export function checkRedirect(object: SuiObjectResponse): string | null {
  const display = object.data?.display
  const walrusSite = display?.data?.['walrus site address']
  if (typeof walrusSite === 'string' && walrusSite) return walrusSite
  return null
}
