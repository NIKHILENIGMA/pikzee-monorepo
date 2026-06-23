import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './libs/shared/db/src/migrations',
  schema: './libs/shared/db/src/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://pikzee:secret@postgres:5432/pikzee',
  },
})
