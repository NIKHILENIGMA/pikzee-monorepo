import type { ZudokuConfig } from 'zudoku'

const config: ZudokuConfig = {
  site: {
    title: 'Pikzee Internal Docs',
    description: 'Internal developer portal for the Pikzee monorepo',
    logo: {
      src: { light: '/logo-light.svg', dark: '/logo-dark.svg' },
      alt: 'Pikzee',
    },
  },

  navigation: [
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        { type: 'doc', file: 'getting-started/index', label: 'Welcome' },
        { type: 'doc', file: 'getting-started/local-setup', label: 'Local Setup' },
        { type: 'doc', file: 'getting-started/commands', label: 'Commands' },
        { type: 'doc', file: 'getting-started/project-structure', label: 'Project Structure' },
      ],
    },
    {
      type: 'category',
      label: '🖥️ Frontend',
      items: [
        { type: 'doc', file: 'frontend/index', label: 'Frontend Overview' },
        { type: 'doc', file: 'frontend/authentication', label: 'Authentication' },
      ],
    },
    {
      type: 'category',
      label: '⚙️ Backend',
      items: [
        { type: 'doc', file: 'backend/index', label: 'Backend Overview' },
        { type: 'doc', file: 'backend/auth', label: 'Auth (Backend)' },
        { type: 'doc', file: 'backend/modules', label: 'Module Map' },
        { type: 'doc', file: 'backend/database', label: 'Database' },
      ],
    },
    {
      type: 'category',
      label: '🏗️ Infrastructure',
      items: [
        { type: 'doc', file: 'infra/index', label: 'Infra Overview' },
        { type: 'doc', file: 'infra/docker', label: 'Docker Setup' },
        { type: 'doc', file: 'infra/redis', label: 'Redis' },
        { type: 'doc', file: 'infra/database', label: 'Database Setup' },
        { type: 'doc', file: 'infra/ci', label: 'CI/CD' },
      ],
    },
    {
      type: 'category',
      label: '📦 Packages',
      items: [
        { type: 'doc', file: 'packages/index', label: 'Packages Overview' },
        { type: 'doc', file: 'packages/shared-types', label: 'shared-types' },
        { type: 'doc', file: 'packages/shared-ui', label: 'shared-ui' },
        { type: 'doc', file: 'packages/shared-config', label: 'shared-config' },
        { type: 'doc', file: 'packages/shared-utils', label: 'shared-utils' },
      ],
    },
    {
      type: 'category',
      label: '🤝 Collaboration',
      items: [
        { type: 'doc', file: 'collaboration/index', label: 'Collab Overview' },
        { type: 'doc', file: 'collaboration/yjs-hocuspocus', label: 'Yjs & Hocuspocus' },
        { type: 'doc', file: 'collaboration/presence', label: 'Presence Engine' },
        { type: 'doc', file: 'collaboration/asset-feed', label: 'Asset Feed' },
      ],
    },
    {
      type: 'category',
      label: '📋 Decisions',
      items: [
        { type: 'doc', file: 'decisions/index', label: 'Overview' },
        { type: 'doc', file: 'decisions/d-01-auth', label: 'D-01 · Auth Strategy' },
        { type: 'doc', file: 'decisions/d-02-workspace', label: 'D-02 · Workspace Model' },
        { type: 'doc', file: 'decisions/d-03-collab', label: 'D-03 · Collab' },
      ],
    },
    {
      type: 'category',
      label: '📓 Dev Log',
      items: [
        { type: 'doc', file: 'devlog/index', label: 'Dev Log' },
        { type: 'doc', file: 'devlog/2026-07-04', label: '2026-07-04' },
      ],
    },
  ],

  // Uncomment and point to your NestJS OpenAPI JSON when apps/api is running
  // apis: [
  //   {
  //     type: 'url',
  //     input: 'http://localhost:3001/api-json',
  //     navigationId: 'api',
  //   },
  // ],

  redirects: [{ from: '/', to: '/getting-started' }],

  theme: {
    light: {
      primary: 'hsl(250, 84%, 60%)',
      primaryForeground: 'hsl(0, 0%, 100%)',
    },
    dark: {
      primary: 'hsl(250, 84%, 65%)',
      primaryForeground: 'hsl(0, 0%, 100%)',
    },
  },
}

export default config
