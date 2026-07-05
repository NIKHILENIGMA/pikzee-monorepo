import { defineConfig } from 'vite'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/apps/docs',
  plugins: [nxViteTsPaths()],
})
