import { z } from 'zod'

export const deployRequestSchema = z.object({
  repoUrl: z.string().url().describe('GitHub repository URL'),
  branch: z.string().optional().describe('Branch name (default main)'),
  commitSha: z.string().optional().describe('Exact commit SHA to deploy'),
  network: z.enum(['mainnet', 'testnet']).optional(),
  baseDir: z.string().optional(),
  installCommand: z.string().optional(),
  buildCommand: z.string().optional(),
  outputDir: z.string().optional(),
  siteName: z.string().optional(),
  epochs: z.union([z.number(), z.literal('max')]).optional(),
  env: z.record(z.string(), z.string()).optional().describe('Env vars to import for this deploy'),
})

export const ownerRepoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
})

export const projectIdSchema = z.object({
  projectId: z.string().uuid(),
})

export const deploymentIdSchema = z.object({
  deploymentId: z.string().min(1),
})

export const secretNameSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  value: z.string().optional(),
})

export function textResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  }
}

export function errorResult(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true as const,
  }
}
