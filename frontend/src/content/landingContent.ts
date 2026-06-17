export type SplitHeadline = {
  plain: string
  accent: string
}

export const LANDING_INTRO = {
  headline: {
    plain: 'Web2 Workflow, ',
    accent: 'Web3 Storage',
  } satisfies SplitHeadline,
  paragraphs: [
    'Polar is a one-click deployment platform that bridges the Web2 developer experience with Web3 infrastructure. Sign in with GitHub, pick a repo, and go live on Walrus in under 60 seconds.',
    'You never touch a Sui wallet, never buy WAL, and never run a CLI. Polar itself is deployed via Polar on SuiNS at polar.wal.app.',
  ],
  chips: [
    { label: 'GitHub sign-in' },
    { label: '8+ frameworks' },
    { label: 'Live preview URL' },
  ],
  stack: [
    { label: 'Walrus', hrefKey: 'walrus' as const },
    { label: 'Sui', hrefKey: 'sui' as const },
  ],
} as const

export const LANDING_DEMO = {
  headline: {
    plain: 'See Polar ',
    accent: 'in Action',
  } satisfies SplitHeadline,
  description: 'Watch a full deploy from GitHub sign-in to a live Walrus preview URL.',
  urlBar: 'polar.wal.app',
} as const

export const LANDING_WORKFLOW = {
  headline: {
    plain: 'From Push to ',
    accent: 'Live Site',
  } satisfies SplitHeadline,
  description: 'Three steps. Polar handles build, publish, and hosting for you.',
  steps: [
    {
      title: 'Connect GitHub',
      description: 'Sign in with your GitHub account. No wallet or extra setup.',
    },
    {
      title: 'Select a repo',
      description: 'Pick the project you want to deploy. Polar detects your framework automatically.',
    },
    {
      title: 'Deploy and go live',
      description: 'Hit deploy and get a live preview URL you can share right away.',
    },
  ],
  pipelineStages: [
    {
      id: 'connect',
      label: 'Connect',
      title: 'Signed in with GitHub',
      detail: '@developer',
    },
    {
      id: 'repo',
      label: 'Select repo',
      title: 'my-app',
      detail: 'Vite',
      framework: 'Vite',
    },
    {
      id: 'live',
      label: 'Go live',
      title: 'my-site.wal.app',
      detail: 'Live preview',
    },
  ],
} as const

export const LANDING_FEATURES = {
  headline: {
    plain: 'Everything You Need to ',
    accent: 'Ship on Walrus',
  } satisfies SplitHeadline,
  description: 'Vercel-like deploy features on decentralized storage. No Web3 knowledge required.',
  frameworks: ['Next.js', 'Vite', 'Astro', 'Nuxt', 'Gatsby', 'SvelteKit', 'Remix', 'Angular'],
  tiles: [
    {
      id: 'wallet',
      title: 'Zero Web3 friction',
      description: 'No Sui wallet, no WAL tokens, no CLI. Connect GitHub and deploy.',
      wide: false,
    },
    {
      id: 'frameworks',
      title: 'Framework auto-detection',
      description: 'Polar detects 8+ frameworks, package managers, and build settings from your repo.',
      wide: true,
    },
    {
      id: 'secrets',
      title: 'Encrypted secrets',
      description: 'Project env vars are encrypted at rest and injected during build only.',
      wide: false,
    },
    {
      id: 'estimate',
      title: 'Cost estimate first',
      description: 'Run a full build to see exact WAL and SUI costs before you publish.',
      wide: false,
    },
    {
      id: 'walrus-deploy',
      title: 'Powered by walrus-deploy',
      description:
        'Our custom site-builder wrapper handles SPA routing, gas budgets, and Walrus Site creation.',
      wide: false,
      linkLabel: 'View on GitHub',
      linkKey: 'walrusDeploy' as const,
    },
  ],
} as const

export const LANDING_FAQ = {
  headline: {
    plain: 'Frequently Asked ',
    accent: 'Questions',
  } satisfies SplitHeadline,
  contact: 'Questions about Polar? Open an issue on GitHub or reach out on X.',
  items: [
    {
      question: 'Do I need a Sui wallet to deploy?',
      answer:
        'No. Sign in with GitHub, pick a repo, and deploy. Polar handles everything else on the backend.',
    },
    {
      question: 'What is walrus-deploy?',
      answer:
        'walrus-deploy is our open-source wrapper over site-builder that powers Polar Walrus deploys. It adds SPA routing, ws-resources generation, CI wallet injection, dry-run mode, and formatted deploy summaries.',
      linkLabel: 'github.com/ankushKun/walrus-deploy',
      linkKey: 'walrusDeploy' as const,
    },
    {
      question: 'What frameworks are supported?',
      answer:
        'Next.js, Vite, Astro, Nuxt, Gatsby, SvelteKit, Remix, Angular, and generic React or static HTML projects. Polar auto-detects framework and package manager from your repo.',
    },
    {
      question: 'Where does my site get hosted?',
      answer:
        'Static files are stored on Walrus decentralized storage. Each deployment creates a Walrus Site object on Sui. Preview URLs are served through the Polar portal at {id}.polar.ankush.one.',
    },
    {
      question: 'How do preview URLs work?',
      answer:
        'Every deployed site gets a unique preview URL based on its Walrus Site object ID. Mainnet and testnet are auto-detected. No SuiNS name is required.',
    },
    {
      question: 'Are environment variables safe?',
      answer:
        'Yes. Secrets are AES-256-GCM encrypted in the database, injected during install and build only, and redacted from logs. They never appear in clone steps.',
    },
    {
      question: 'Can I redeploy or roll back?',
      answer:
        'Every deployment is pinned to a Git commit SHA. You can redeploy any previous deployment or retry failed builds with the same configuration.',
    },
  ],
} as const

export const LANDING_CTA = {
  headline: {
    plain: 'Ready to ',
    accent: 'Go Live',
  } satisfies SplitHeadline,
  description:
    'Connect GitHub and ship your first site to Walrus in under 60 seconds. No Web3 knowledge required.',
} as const
