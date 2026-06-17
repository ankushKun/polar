import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { PolarApiError, PolarClient, waitForDeployment } from './polar-client.js'
import {
  deployRequestSchema,
  deploymentIdSchema,
  errorResult,
  ownerRepoSchema,
  projectIdSchema,
  secretNameSchema,
  textResult,
} from './schemas.js'
import { z } from 'zod'

function wrapTool(fn: () => Promise<unknown>) {
  return async () => {
    try {
      return textResult(await fn())
    } catch (err) {
      if (err instanceof PolarApiError) {
        return errorResult(`${err.message} (HTTP ${err.status})`)
      }
      return errorResult(err instanceof Error ? err.message : 'unknown error')
    }
  }
}

export function registerPolarTools(server: McpServer, client: PolarClient) {
  server.registerTool(
    'polar_get_me',
    { description: 'Get the authenticated Polar user (GitHub-linked account).' },
    wrapTool(() => client.get('/me')),
  )

  server.registerTool(
    'polar_get_github_status',
    { description: 'Check whether GitHub is connected for this Polar account.' },
    wrapTool(() => client.get('/github/status')),
  )

  server.registerTool(
    'polar_list_repos',
    {
      description: 'List GitHub repositories accessible to the authenticated user.',
      inputSchema: { page: z.number().int().min(1).optional() },
    },
    async ({ page }) =>
      wrapTool(() => client.get('/github/repos', { page: page ?? 1 }))(),
  )

  server.registerTool(
    'polar_list_repo_branches',
    {
      description: 'List branches for a GitHub repository.',
      inputSchema: ownerRepoSchema.shape,
    },
    async ({ owner, repo }) =>
      wrapTool(() => client.get(`/github/repos/${owner}/${repo}/branches`))(),
  )

  server.registerTool(
    'polar_list_repo_commits',
    {
      description: 'List recent commits on a branch.',
      inputSchema: ownerRepoSchema.extend({ branch: z.string().default('main') }).shape,
    },
    async ({ owner, repo, branch }) =>
      wrapTool(() =>
        client.get(`/github/repos/${owner}/${repo}/commits`, { branch }),
      )(),
  )

  server.registerTool(
    'polar_detect_repo_projects',
    {
      description: 'Detect monorepo projects / framework build settings in a repository.',
      inputSchema: ownerRepoSchema.extend({ branch: z.string().optional() }).shape,
    },
    async ({ owner, repo, branch }) =>
      wrapTool(() =>
        client.post(`/github/repos/${owner}/${repo}/detect`, branch ? { branch } : {}),
      )(),
  )

  server.registerTool(
    'polar_detect_frameworks',
    {
      description: 'Batch quick-detect frameworks for multiple repos.',
      inputSchema: {
        repos: z.array(
          z.object({
            owner: z.string(),
            name: z.string(),
            branch: z.string(),
          }),
        ),
      },
    },
    async ({ repos }) =>
      wrapTool(() => client.post('/github/repos/detect-frameworks', { repos }))(),
  )

  server.registerTool(
    'polar_list_repo_contents',
    {
      description: 'List files at a path in a GitHub repository.',
      inputSchema: ownerRepoSchema.extend({ path: z.string().default('') }).shape,
    },
    async ({ owner, repo, path }) =>
      wrapTool(() =>
        client.get(`/github/repos/${owner}/${repo}/contents`, { path }),
      )(),
  )

  server.registerTool(
    'polar_list_projects',
    { description: 'List all Polar projects for the authenticated user.' },
    wrapTool(() => client.get('/projects')),
  )

  server.registerTool(
    'polar_get_project',
    {
      description: 'Get a project and its deployments by project ID.',
      inputSchema: projectIdSchema.shape,
    },
    async ({ projectId }) =>
      wrapTool(() => client.get(`/projects/${projectId}`))(),
  )

  server.registerTool(
    'polar_delete_project',
    {
      description: 'Delete a Polar project and its configuration.',
      inputSchema: projectIdSchema.shape,
    },
    async ({ projectId }) =>
      wrapTool(() => client.delete(`/projects/${projectId}`))(),
  )

  server.registerTool(
    'polar_deploy_project_latest',
    {
      description: 'Deploy the latest commit on the configured branch for a project.',
      inputSchema: projectIdSchema.shape,
    },
    async ({ projectId }) =>
      wrapTool(() => client.post(`/projects/${projectId}/deploy-latest`))(),
  )

  server.registerTool(
    'polar_list_project_secrets',
    {
      description: 'List secret names for a project (values are never returned).',
      inputSchema: projectIdSchema.shape,
    },
    async ({ projectId }) =>
      wrapTool(() => client.get(`/projects/${projectId}/secrets`))(),
  )

  server.registerTool(
    'polar_set_project_secret',
    {
      description: 'Create or update an encrypted project secret.',
      inputSchema: {
        projectId: z.string().uuid(),
        name: z.string().min(1),
        value: z.string().min(1),
      },
    },
    async ({ projectId, name, value }) =>
      wrapTool(() =>
        client.put(`/projects/${projectId}/secrets/${encodeURIComponent(name)}`, {
          value,
        }),
      )(),
  )

  server.registerTool(
    'polar_import_project_secrets',
    {
      description: 'Import secrets from .env file content.',
      inputSchema: {
        projectId: z.string().uuid(),
        content: z.string().min(1),
      },
    },
    async ({ projectId, content }) =>
      wrapTool(() =>
        client.post(`/projects/${projectId}/secrets/import`, { content }),
      )(),
  )

  server.registerTool(
    'polar_delete_project_secret',
    {
      description: 'Delete a project secret by name.',
      inputSchema: {
        projectId: z.string().uuid(),
        name: z.string().min(1),
      },
    },
    async ({ projectId, name }) =>
      wrapTool(() =>
        client.delete(`/projects/${projectId}/secrets/${encodeURIComponent(name)}`),
      )(),
  )

  server.registerTool(
    'polar_deploy',
    {
      description: 'Create a new Walrus deployment from a GitHub repository.',
      inputSchema: deployRequestSchema.shape,
    },
    async (args) => wrapTool(() => client.post('/deploy', args))(),
  )

  server.registerTool(
    'polar_list_deployments',
    {
      description: 'List recent deployments.',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      },
    },
    async ({ limit, offset }) =>
      wrapTool(() => client.get('/deployments', { limit, offset }))(),
  )

  server.registerTool(
    'polar_get_deployment',
    {
      description: 'Get deployment status, URLs, and metadata.',
      inputSchema: deploymentIdSchema.shape,
    },
    async ({ deploymentId }) =>
      wrapTool(() => client.get(`/deployments/${encodeURIComponent(deploymentId)}`))(),
  )

  server.registerTool(
    'polar_delete_deployment',
    {
      description: 'Mark a deployment as deleted.',
      inputSchema: deploymentIdSchema.shape,
    },
    async ({ deploymentId }) =>
      wrapTool(() => client.delete(`/deployments/${encodeURIComponent(deploymentId)}`))(),
  )

  server.registerTool(
    'polar_retry_deployment',
    {
      description: 'Retry a failed deployment with the same configuration.',
      inputSchema: deploymentIdSchema.shape,
    },
    async ({ deploymentId }) =>
      wrapTool(() =>
        client.post(`/deployments/${encodeURIComponent(deploymentId)}/retry`),
      )(),
  )

  server.registerTool(
    'polar_redeploy_deployment',
    {
      description: 'Redeploy from an existing deployment record.',
      inputSchema: deploymentIdSchema.extend({
        epochs: z.union([z.number(), z.literal('max')]).optional(),
      }).shape,
    },
    async ({ deploymentId, epochs }) =>
      wrapTool(() =>
        client.post(
          `/deployments/${encodeURIComponent(deploymentId)}/redeploy`,
          epochs !== undefined ? { epochs } : undefined,
        ),
      )(),
  )

  server.registerTool(
    'polar_wait_for_deployment',
    {
      description: 'Poll until a deployment reaches deployed or failed status.',
      inputSchema: deploymentIdSchema.extend({
        timeoutMs: z.number().int().optional(),
      }).shape,
    },
    async ({ deploymentId, timeoutMs }) =>
      wrapTool(() => waitForDeployment(client, deploymentId, { timeoutMs }))(),
  )

  server.registerTool(
    'polar_get_deployment_logs',
    {
      description: 'Fetch build/deploy logs for a deployment (JSON snapshot).',
      inputSchema: deploymentIdSchema.shape,
    },
    async ({ deploymentId }) =>
      wrapTool(async () => {
        try {
          return await client.get(
            `/deployments/${encodeURIComponent(deploymentId)}/logs`,
            { format: 'json' },
          )
        } catch (err) {
          if (err instanceof PolarApiError && err.status === 404) {
            const dep = await client.get<Record<string, unknown>>(
              `/deployments/${encodeURIComponent(deploymentId)}`,
            )
            return { logs: dep.logs ?? '' }
          }
          throw err
        }
      })(),
  )

  server.registerTool(
    'polar_estimate_cost',
    {
      description: 'Run a full build to estimate WAL and SUI costs before deploying.',
      inputSchema: deployRequestSchema.shape,
    },
    async (args) => wrapTool(() => client.post('/estimate', args))(),
  )

  server.registerTool(
    'polar_get_platform_wallet',
    { description: 'Read platform deployer wallet SUI/WAL balances (public).' },
    wrapTool(() => client.get('/wallet')),
  )
}

export function createPolarMcpServer(client: PolarClient): McpServer {
  const server = new McpServer({ name: 'polar', version: '0.1.0' })
  registerPolarTools(server, client)
  return server
}
