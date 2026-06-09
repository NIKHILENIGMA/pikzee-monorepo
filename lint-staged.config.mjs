export default {
  '*.{ts,tsx,js,jsx}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,mdx,css,scss,html,yml,yaml}': ['prettier --write'],
}
