export { PolarClient, PolarApiError, waitForDeployment } from './polar-client.js'
export { handlePolarMcpRequest } from './handler.js'
export type { McpHandlerOptions } from './handler.js'
export { createPolarMcpServer, registerPolarTools } from './tools.js'
export {
  MCP_DOCS_URL,
  mcpDocsMarkdown,
  serveMcpDocs,
  shouldServeMcpDocs,
  wantsMcpDocsHtml,
} from './docs.js'
