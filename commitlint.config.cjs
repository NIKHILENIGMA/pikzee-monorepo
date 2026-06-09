module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'scope-enum': [
      2,
      'always',
      ['web', 'api', 'api-e2e', 'ui', 'repo', 'deps', 'config'],
    ],
  },
}
