export const MCP_URL = import.meta.env.VITE_MCP_URL || 'https://polar.ankush.one/mcp'

export function buildMcpJson(token?: string): string {
  const bearer = token ? `Bearer ${token}` : 'Bearer YOUR_API_KEY'
  const config = {
    mcpServers: {
      polar: {
        url: MCP_URL,
        headers: {
          Authorization: bearer,
        },
      },
    },
  }
  return JSON.stringify(config, null, 2)
}
