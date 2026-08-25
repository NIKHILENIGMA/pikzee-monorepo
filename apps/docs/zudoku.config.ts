import type { ZudokuConfig } from 'zudoku'

const config: ZudokuConfig = {
  site: {
    title: 'Pikzee Internal Docs',
    logo: {
      src: { light: '/logo-light.svg', dark: '/logo-dark.svg' },
      alt: 'Pikzee',
    },
  },

  navigation: [
    {
      type: 'category',
      label: '📋 Product Requirements',
      items: [{ type: 'doc', file: 'product/prd', label: 'PRD & Vision' }],
    },
    {
      type: 'category',
      label: '🏗️ Architecture & Decisions',
      items: [
        { type: 'doc', file: 'architecture/monorepo-layout', label: 'Monorepo Layout' },
        { type: 'doc', file: 'architecture/data-flow', label: 'Data Flow & API' },
        { type: 'doc', file: 'architecture/design-patterns', label: 'Design Patterns & Rules' },
        { type: 'doc', file: 'architecture/database', label: 'Database Architecture' },
        { type: 'doc', file: 'decisions/index', label: 'ADR Overview' },
        { type: 'doc', file: 'decisions/d-01-auth', label: 'D-01 · Auth Strategy' },
        { type: 'doc', file: 'decisions/d-02-workspace', label: 'D-02 · Workspace Model' },
        { type: 'doc', file: 'decisions/d-03-collab', label: 'D-03 · Collab Architecture' },
      ],
    },
    {
      type: 'category',
      label: '📜 Coding Rules & Standards',
      items: [
        { type: 'doc', file: 'rules/typescript', label: 'TypeScript Guide' },
        { type: 'doc', file: 'rules/testing-commit', label: 'Testing & Commits' },
        { type: 'doc', file: 'rules/security-errors', label: 'Security & Errors' },
      ],
    },
    {
      type: 'category',
      label: '🛠️ Feature Guides',
      items: [
        {
          type: 'category',
          label: '🏢 Workspace Overview',
          items: [
            { type: 'doc', file: 'features/invitation', label: 'Invitation' },
            { type: 'doc', file: 'features/members', label: 'Members' },
            { type: 'doc', file: 'features/permissions', label: 'Roles & Permission' },
            { type: 'doc', file: 'features/projects', label: 'Projects' },
            { type: 'doc', file: 'features/notification', label: 'Notification' },
          ],
        },
        { type: 'doc', file: 'features/authentication', label: '🔐 Authentication' },
        {
          type: 'category',
          label: '📦 DAM (Digital Asset Management)',
          items: [
            { type: 'doc', file: 'features/dam', label: 'DAM Overview' },
            { type: 'doc', file: 'features/dam/image', label: 'Image' },
            { type: 'doc', file: 'features/dam/video', label: 'Video' },
            { type: 'doc', file: 'features/dam/audio', label: 'Audio' },
            { type: 'doc', file: 'features/dam/document', label: 'Document' },
          ],
        },
        {
          type: 'category',
          label: '📤 Upload (S3)',
          items: [
            { type: 'doc', file: 'features/upload', label: 'Upload Overview' },
            { type: 'doc', file: 'features/upload/presigned-url', label: 'Presigned URL (Small)' },
            { type: 'doc', file: 'features/upload/multipart', label: 'Multipart (Large)' },
          ],
        },
        {
          type: 'category',
          label: '📝 Editor',
          items: [
            { type: 'doc', file: 'features/editor', label: 'Editor Overview' },
            { type: 'doc', file: 'features/editor/tiptap', label: 'TipTap Setup' },
            { type: 'doc', file: 'features/editor/extensions', label: 'Extensions' },
          ],
        },
        {
          type: 'category',
          label: '⚙️ Infra Overview',
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
          label: '📦 Packages Overview',
          items: [
            { type: 'doc', file: 'packages/index', label: 'Overview' },
            { type: 'doc', file: 'packages/shared-types', label: '@pikzee/shared-types' },
            { type: 'doc', file: 'packages/shared-db', label: '@pikzee/shared-db' },
            { type: 'doc', file: 'packages/shared-ui', label: '@pikzee/shared-ui' },
            { type: 'doc', file: 'packages/shared-utils', label: '@pikzee/shared-utils' },
            { type: 'doc', file: 'packages/editor', label: '@pikzee/editor (Future)' },
            { type: 'doc', file: 'packages/assets', label: '@pikzee/assets (Future)' },
            { type: 'doc', file: 'packages/collab', label: '@pikzee/collab (Future)' },
          ],
        },
        { type: 'doc', file: 'frontend/index', label: '🖥️ Frontend Overview' },
        { type: 'doc', file: 'frontend/authentication', label: 'Authentication (Frontend)' },
        { type: 'doc', file: 'backend/index', label: '⚙️ Backend Overview' },
        { type: 'doc', file: 'backend/auth', label: 'Auth (Backend)' },
        { type: 'doc', file: 'backend/modules', label: 'Module Map' },
        { type: 'doc', file: 'backend/database', label: 'Database (Backend)' },
      ],
    },
    {
      type: 'category',
      label: '📍 Roadmap & Phases',
      items: [{ type: 'doc', file: 'roadmap/phases', label: 'Phases & Progress' }],
    },
    {
      type: 'category',
      label: '🎨 Design System',
      items: [
        { type: 'doc', file: 'design/principles', label: 'Aesthetic Principles' },
        { type: 'doc', file: 'design/components', label: 'Component Library' },
        { type: 'doc', file: 'design/motion-a11y', label: 'Motion & Accessibility' },
      ],
    },
    {
      type: 'category',
      label: '📖 Developer Guides',
      items: [{ type: 'doc', file: 'guides/local-setup', label: 'Local Setup & Run' }],
    },
    {
      type: 'category',
      label: '🤖 AI Assistant Context',
      items: [{ type: 'doc', file: 'ai/memory', label: 'Handoff Memory' }],
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

  redirects: [
    { from: '/', to: '/product/prd' },
    { from: '/getting-started/todolist', to: '/roadmap/phases' },
  ],

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
