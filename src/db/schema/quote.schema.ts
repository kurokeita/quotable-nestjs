import { sql } from 'drizzle-orm'
import { foreignKey, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { Author, authors } from './author.schema'
import { Tag } from './tag.schema'

export const quotes = pgTable(
	'quotes',
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		shortId: varchar({ length: 10 }).notNull().unique(),
		authorId: uuid().notNull(),
		content: text().notNull(),
		createdAt: timestamp({ withTimezone: true, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP(6)`)
			.notNull(),
		updatedAt: timestamp({ withTimezone: true, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP(6)`)
			.notNull(),
		deletedAt: timestamp({ withTimezone: true, mode: 'string' }),
	},
	(table) => [
		uniqueIndex('quotes_content_unique').using('btree', table.content.asc().nullsLast().op('text_ops')),
		foreignKey({
			columns: [table.authorId],
			foreignColumns: [authors.id],
			name: 'quotes_authorId_fkey',
		}),
	],
)

export type Quote = typeof quotes.$inferSelect
export type NewQuote = typeof quotes.$inferInsert
export type QuoteWithRelationships = Quote & {
	author?: Author
	tags?: Tag[]
}
