import { base64UrlSafeEncode } from './url-safe-base64'

export class QuiltPatch {
  constructor(
    private quiltBlobId: string,
    private quiltPatchInternalId: string,
  ) {}

  deriveId(): string {
    const internalId = this.quiltPatchInternalId.startsWith('0x')
      ? this.quiltPatchInternalId.slice(2)
      : this.quiltPatchInternalId

    const littleEndian = true
    const buffer = new Uint8Array(37)
    const blobIdBytes = Uint8Array.from(atob(this.quiltBlobId.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
      c.charCodeAt(0),
    )
    buffer.set(blobIdBytes.subarray(0, Math.min(blobIdBytes.length, 32)))

    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    const internalBuf = hexToBytes(internalId)
    const internalDv = new DataView(internalBuf.buffer, internalBuf.byteOffset, internalBuf.byteLength)
    view.setUint8(32, internalDv.getInt8(0))
    view.setUint16(33, internalDv.getInt16(1, littleEndian), littleEndian)
    view.setUint16(35, internalDv.getInt16(3, littleEndian), littleEndian)

    return base64UrlSafeEncode(buffer).slice(0, 50)
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}
