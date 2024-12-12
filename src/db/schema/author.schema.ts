import { sql } from 'drizzle-orm'
import {
  bigserial,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import slugify from 'slugify'

export const authors = pgTable(
  'authors',
  {
    id: bigserial({ mode: 'number' }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    description: text(),
    bio: text(),
    link: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP(6)`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP(6)`)
      .notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: 'string' }),
  },
  (table) => [unique('authors_slug_key').on(table.slug)],
)

export type Author = typeof authors.$inferSelect
export type NewAuthor = typeof authors.$inferInsert

export const getAuthorSlug = (name: string) => slugify(name, { lower: true })