export class PolarApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message)
    this.name = 'PolarApiError'
  }
}

export class PolarClient {
  constructor(
    readonly apiBase: string,
    private readonly authorization: string,
  ) {}

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      Authorization: this.authorization,
      'Content-Type': 'application/json',
      ...extra,
    }
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const base = this.apiBase.replace(/\/+$/, '')
    const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
      }
    }

    const resp = await fetch(url.toString(), {
      method,
      headers: this.headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      const err = (data as { error?: string }).error || resp.statusText
      throw new PolarApiError(err, resp.status, data)
    }
    return data as T
  }

  get<T>(path: string, query?: Record<string, string | number | undefined>) {
    return this.request<T>('GET', path, undefined, query)
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body)
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body)
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path)
  }
}

const TERMINAL = new Set(['deployed', 'failed', 'deleted'])

export async function waitForDeployment(
  client: PolarClient,
  id: string,
  options?: { intervalMs?: number; timeoutMs?: number },
): Promise<unknown> {
  const intervalMs = options?.intervalMs ?? 3000
  const timeoutMs = options?.timeoutMs ?? 600_000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const dep = await client.get<Record<string, unknown>>(`/deployments/${encodeURIComponent(id)}`)
    if (TERMINAL.has(String(dep.status))) return dep
    await new Promise((r) => setTimeout(r, intervalMs))
  }

  throw new Error(`deployment ${id} did not reach terminal status within ${timeoutMs}ms`)
}
