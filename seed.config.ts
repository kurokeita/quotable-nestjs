import { SeedPostgres } from '@snaplet/seed/adapter-postgres'
import { defineConfig } from '@snaplet/seed/config'
import postgres from 'postgres'

export default defineConfig({
  adapter: () => {
    const client = postgres(
      `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    )
    return new SeedPostgres(client)
  },
  select: [
    'public.authors',
    'public.quotes',
    'public.tags',
    'public.quote_tags',
  ],
})
