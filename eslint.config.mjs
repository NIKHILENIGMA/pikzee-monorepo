import checkFile from 'eslint-plugin-check-file'
import importPlugin from 'eslint-plugin-import'
import nx from '@nx/eslint-plugin'

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'check-file': checkFile,
      import: importPlugin,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx,js,jsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [
            {
              pattern: '@pikzee/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
            // Enforce that browser runtime projects do not depend on node runtime projects
            {
              sourceTag: 'runtime:browser',
              notDependOnLibsWithTags: ['runtime:node'],
            },
            // Enforce that node runtime projects do not depend on browser runtime projects
            {
              sourceTag: 'runtime:node',
              notDependOnLibsWithTags: ['runtime:browser'],
            },
            // Customer apps should not depend on admin apps
            {
              sourceTag: 'scope:customer',
              notDependOnLibsWithTags: ['scope:admin'],
            },
            // Admin apps should not depend on customer apps
            {
              sourceTag: 'scope:admin',
              notDependOnLibsWithTags: ['scope:customer'],
            },
            // Contracts cannot import from any other project except other contracts
            {
              sourceTag: 'type:contract',
              onlyDependOnLibsWithTags: ['type:contract'],
            },
            // UI can only import from other UI or contracts
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:contract'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/**/*.{ts,tsx,js,jsx}'],
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
  {
    files: [
      'apps/web/**/*.{ts,tsx,js,jsx}',
      'libs/ui/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@pikzee/api', '@pikzee/api/*'],
              message:
                'Browser/UI code must not import backend NestJS/API modules. Expose shared shapes through contract libraries instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['apps/api/**/*.{ts,js}', 'apps/api-e2e/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
    },
  },
]
