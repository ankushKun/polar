export async function sha256(message: ArrayBuffer): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', message)
  return new Uint8Array(hash)
}
