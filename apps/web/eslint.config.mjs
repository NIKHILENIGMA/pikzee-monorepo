import nextEslintPluginNext from '@next/eslint-plugin-next'
import nx from '@nx/eslint-plugin'
import baseConfig from '../../eslint.config.mjs'

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...nx.configs['flat/react-typescript'],
  ...baseConfig,
  {
    ignores: ['.next/**/*'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@pikzee/api', '@pikzee/api/*'],
              message:
                'Web app code must not import backend NestJS/API modules. Expose shared shapes through contract libraries instead.',
            },
          ],
        },
      ],
    },
  },
]
