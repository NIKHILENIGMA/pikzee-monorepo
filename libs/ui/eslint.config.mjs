import nx from '@nx/eslint-plugin'
import baseConfig from '../../eslint.config.mjs'

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next',
              message:
                'Shared UI components must not depend on Next.js. Keep framework-specific code inside the app.',
            },
          ],
          patterns: [
            {
              group: [
                '@nestjs/*',
                '@pikzee/api',
                '@pikzee/api/*',
                'next/*',
                'node:*',
              ],
              message:
                'Shared UI components must stay browser/UI-only and must not import backend, framework, or Node-only modules.',
            },
          ],
        },
      ],
    },
  },
]
