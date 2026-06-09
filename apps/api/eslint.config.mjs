import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@pikzee/ui',
              message:
                'API code must not import UI components. Move shared non-UI types/helpers to a contract or utility library.',
            },
            {
              name: 'react',
              message: 'API code runs on Node/NestJS and must not depend on React.',
            },
            {
              name: 'react-dom',
              message: 'API code runs on Node/NestJS and must not depend on React DOM.',
            },
            {
              name: 'next',
              message:
                'API code must stay independent from Next.js. Put web-only code in a web app or browser library.',
            },
          ],
          patterns: [
            {
              group: ['@pikzee/ui/*', 'next/*', 'lucide-react', 'radix-ui', 'radix-ui/*'],
              message:
                'API code must not import browser/UI packages. Keep backend code in Node/NestJS boundaries.',
            },
          ],
        },
      ],
    },
  },
]
