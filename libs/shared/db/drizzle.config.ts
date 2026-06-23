import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './libs/shared/db/src/migrations',
  schema: './libs/shared/db/src/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
})
