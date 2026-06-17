export function base64UrlSafeEncode(data: Uint8Array): string {
  let binary = ''
  for (const byte of data) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '')
}
