import * as dotenv from 'dotenv'
import { ExtractTablesWithRelations } from 'drizzle-orm'
import { PgTransaction } from 'drizzle-orm/pg-core'
import { drizzle, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as authors from './schema/author.schema'
import * as quotes from './schema/quote.schema'
import * as relations from './schema/relations'
import * as tags from './schema/tag.schema'

dotenv.config()

const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const schema = { ...authors, ...quotes, ...tags, ...relations }

export const db = drizzle({
  client,
  schema: schema,
  logger: process.env.NODE_ENV === 'development',
})

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

export const getClient = (t: Transaction | undefined = undefined) => t || db
