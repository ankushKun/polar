export function blobAggregatorEndpoint(blobId: string, aggregatorUrl: string): URL {
  const base = aggregatorUrl.replace(/\/$/, '')
  return new URL(`${base}/v1/blobs/${encodeURIComponent(blobId)}`)
}

export function quiltAggregatorEndpoint(quiltPatchId: string, aggregatorUrl: string): URL {
  const base = aggregatorUrl.replace(/\/$/, '')
  return new URL(`${base}/v1/blobs/by-quilt-patch-id/${encodeURIComponent(quiltPatchId)}`)
}
