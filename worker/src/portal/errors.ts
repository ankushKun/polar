function htmlError(status: number, title: string, message: string): Response {
  const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><p>${message}</p></body></html>`
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export function siteNotFound(): Response {
  return htmlError(404, 'Site not found', 'This Walrus Site object ID could not be resolved.')
}

export function custom404NotFound(): Response {
  return htmlError(404, 'Page not found', 'The requested page does not exist on this Walrus Site.')
}

export function aggregatorFail(): Response {
  return htmlError(503, 'Service unavailable', 'Failed to fetch content from the Walrus aggregator. Please try again later.')
}

export function blobUnavailable(blobId: string): Response {
  return htmlError(
    404,
    'Content unavailable',
    `This content is no longer available on Walrus (blob may have expired). Blob ID: ${blobId}`,
  )
}

export function hashMismatch(): Response {
  return htmlError(422, 'Integrity check failed', 'The fetched content did not match the on-chain hash.')
}

export function redirectLoopDetected(): Response {
  return htmlError(508, 'Redirect loop', 'A redirect on this site points back to the same path.')
}

export function invalidSiteId(): Response {
  return htmlError(400, 'Invalid site ID', 'The site ID in the URL is not a valid Walrus Site object ID.')
}
