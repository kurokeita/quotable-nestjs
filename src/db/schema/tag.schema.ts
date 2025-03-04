import { sql } from 'drizzle-orm'
import { foreignKey, pgTable, primaryKey, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { quotes } from './quote.schema'

export const tags = pgTable(
	'tags',
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		shortId: varchar({ length: 10 }).notNull().unique(),
		name: varchar({ length: 255 }).notNull(),
		createdAt: timestamp({ withTimezone: true, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP(6)`)
			.notNull(),
		updatedAt: timestamp({ withTimezone: true, mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP(6)`)
			.notNull(),
		deletedAt: timestamp({ withTimezone: true, mode: 'string' }),
	},
	(table) => [uniqueIndex('unique_tags_name').using('btree', table.name.asc().nullsLast().op('text_ops'))],
)

export const quoteTags = pgTable(
	'quote_tags',
	{
		quoteId: uuid().notNull(),
		tagId: uuid().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: 'quote_tags_quoteId_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: 'quote_tags_tagId_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.quoteId, table.tagId],
			name: 'quote_tags_pkey',
		}),
	],
)

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
export type QuoteTag = typeof quoteTags.$inferSelect
export type NewQuoteTag = typeof quoteTags.$inferInsert
export type TagWithQuotesCount = Tag & { quotesCount: number }
