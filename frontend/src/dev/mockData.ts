import type { Deployment, Project } from '../lib/api'

const DEV_USER = 'github:dev-local'
const POLAR_REPO = 'https://github.com/ankushKun/polar.git'
const TUSKD_REPO = 'https://github.com/ankushKun/tuskd.git'

const polarBase36 = '2pfa1sxhawztfmrqiy8c9ckyatpn7q7bkb6g9mz0kjfwxb2wp'
const tuskdBase36 = '2pfat8kexamplebase36fortuskdproject0000001'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const MOCK_PROJECT_POLAR: Project = {
  id: 'mock-project-polar',
  userAddress: DEV_USER,
  repoUrl: POLAR_REPO,
  branch: 'main',
  baseDir: '.',
  installCommand: 'npm install',
  buildCommand: 'npm run build',
  outputDir: 'dist',
  network: 'mainnet',
  createdAt: daysAgo(120),
  updatedAt: daysAgo(1),
}

export const MOCK_PROJECT_TUSKD: Project = {
  id: 'mock-project-tuskd',
  userAddress: DEV_USER,
  repoUrl: TUSKD_REPO,
  branch: 'main',
  baseDir: '.',
  installCommand: 'npm install',
  buildCommand: 'npm run build',
  outputDir: 'dist',
  network: 'mainnet',
  createdAt: daysAgo(90),
  updatedAt: daysAgo(3),
}

export const MOCK_DEPLOYMENTS: Deployment[] = [
  {
    id: 'mock-dep-polar-live',
    userAddress: DEV_USER,
    repoUrl: POLAR_REPO,
    branch: 'main',
    baseDir: '.',
    commitSha: 'f84c9e0123456789abcdef0123456789abcdef0',
    commitRef: 'main',
    commitMessage: 'Optimize Polar foreground asset sizing',
    commitAuthorName: 'dev-local',
    commitAuthorDate: daysAgo(1),
    commitUrl: null,
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    network: 'mainnet',
    epochs: 2,
    status: 'deployed',
    error: null,
    objectId: '0x38e30399de60840a7724d41df8edc2b4110abf3d0b06eef59f4633f6f56cc143',
    base36Url: polarBase36,
    viewUrl: `https://${polarBase36}.polar.ankush.one/`,
    logs: '',
    createdAt: daysAgo(75),
    updatedAt: daysAgo(75),
  },
  {
    id: 'mock-dep-polar-failed',
    userAddress: DEV_USER,
    repoUrl: POLAR_REPO,
    branch: 'main',
    baseDir: '.',
    commitSha: 'a1b2c3d0123456789abcdef0123456789abcdef0',
    commitRef: 'main',
    commitMessage: 'Try experimental build flags',
    commitAuthorName: 'dev-local',
    commitAuthorDate: daysAgo(10),
    commitUrl: null,
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    network: 'mainnet',
    epochs: 2,
    status: 'failed',
    error: 'Build failed: mock error for UI preview',
    objectId: null,
    base36Url: null,
    viewUrl: null,
    logs: 'mock build log\nerror: exit code 1',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: 'mock-dep-tuskd-live',
    userAddress: DEV_USER,
    repoUrl: TUSKD_REPO,
    branch: 'main',
    baseDir: '.',
    commitSha: 'b9f8485123456789abcdef0123456789abcdef0',
    commitRef: 'main',
    commitMessage: 'Update landing copy',
    commitAuthorName: 'dev-local',
    commitAuthorDate: daysAgo(2),
    commitUrl: null,
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    network: 'mainnet',
    epochs: 2,
    status: 'deployed',
    error: null,
    objectId: '0x1111111111111111111111111111111111111111111111111111111111111111',
    base36Url: tuskdBase36,
    viewUrl: `https://${tuskdBase36}.polar.ankush.one/`,
    logs: '',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
]

export function mockFetchMe() {
  return Promise.resolve({ user_id: DEV_USER, github_login: 'dev-local' })
}

export function mockListProjects(): Promise<Project[]> {
  return Promise.resolve([MOCK_PROJECT_POLAR, MOCK_PROJECT_TUSKD])
}

export function mockListDeployments(): Promise<Deployment[]> {
  return Promise.resolve([...MOCK_DEPLOYMENTS])
}

export function mockGetProject(id: string): Promise<{ project: Project; deployments: Deployment[] }> {
  const project =
    id === MOCK_PROJECT_POLAR.id
      ? MOCK_PROJECT_POLAR
      : id === MOCK_PROJECT_TUSKD.id
        ? MOCK_PROJECT_TUSKD
        : null
  if (!project) {
    return Promise.reject(new Error('project not found'))
  }
  const deployments = MOCK_DEPLOYMENTS.filter((d) => d.repoUrl === project.repoUrl)
  return Promise.resolve({ project, deployments })
}
