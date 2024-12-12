import { sql } from 'drizzle-orm'
import {
  bigint,
  bigserial,
  foreignKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { authors } from './author.schema'

export const quotes = pgTable(
  'quotes',
  {
    id: bigserial({ mode: 'number' }).primaryKey().notNull(),
    authorId: bigint({ mode: 'number' }).notNull(),
    content: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP(6)`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP(6)`)
      .notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: 'string' }),
  },
  (table) => [
    uniqueIndex('quotes_content_unique').using(
      'btree',
      table.content.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [authors.id],
      name: 'quotes_authorId_fkey',
    }),
  ],
)
