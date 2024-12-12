import { relations } from 'drizzle-orm/relations'
import { authors } from './author.schema'
import { quotes } from './quote.schema'
import { quoteTags, tags } from './tag.schema'

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  author: one(authors, {
    fields: [quotes.authorId],
    references: [authors.id],
  }),
  quoteTags: many(quoteTags),
}))

export const authorsRelations = relations(authors, ({ many }) => ({
  quotes: many(quotes),
}))

export const quoteTagsRelations = relations(quoteTags, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteTags.quoteId],
    references: [quotes.id],
  }),
  tag: one(tags, {
    fields: [quoteTags.tagId],
    references: [tags.id],
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  quoteTags: many(quoteTags),
}))
