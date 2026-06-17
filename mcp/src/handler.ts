import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { PolarClient } from './polar-client.js'
import { createPolarMcpServer } from './tools.js'

export type McpHandlerOptions = {
  polarApiBase: string
  getAuthorization: (request: Request) => string | null
}

export async function handlePolarMcpRequest(
  request: Request,
  options: McpHandlerOptions,
): Promise<Response> {
  const authorization = options.getAuthorization(request)
  if (!authorization) {
    return Response.json({ error: 'missing Authorization header' }, { status: 401 })
  }

  const apiBase = options.polarApiBase.replace(/\/+$/, '')
  const client = new PolarClient(apiBase, authorization)

  const me = await fetch(`${apiBase}/me`, {
    headers: { Authorization: authorization, Accept: 'application/json' },
  })
  if (!me.ok) {
    return Response.json({ error: 'invalid or expired API key' }, { status: 401 })
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  const server = createPolarMcpServer(client)
  await server.connect(transport)
  return transport.handleRequest(request)
}
