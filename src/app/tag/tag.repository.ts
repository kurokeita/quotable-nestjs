import { Injectable } from '@nestjs/common'
import { and, eq, getTableColumns, inArray, isNull, or, sql } from 'drizzle-orm'
import { UUIDTypes } from 'uuid'
import { getClient, Transaction } from '../../db/index'
import { quotes } from '../../db/schema/quote.schema'
import { QuoteTag, quoteTags, Tag, tags, TagWithQuotesCount } from '../../db/schema/tag.schema'
import generateShortId from '../../utils/short_id'
import { IndexTagDto } from './tag.dto'

export enum TagSortByEnum {
	NAME = 'name',
	QUOTES_COUNT = 'quotesCount',
	DATE_CREATED = 'createdAt',
	DATE_MODIFIED = 'updatedAt',
}

@Injectable()
export class TagRepository {
	public DEFAULT_SORT_BY = TagSortByEnum.DATE_CREATED
	public DEFAULT_ORDER = 'ASC'

	async getByNames(names: string[], options: { transaction?: Transaction } = {}): Promise<Tag[]> {
		return await getClient(options.transaction)
			.select()
			.from(tags)
			.where(and(inArray(tags.name, names), isNull(tags.deletedAt)))
	}

	async index(input: IndexTagDto, options: { transaction?: Transaction } = {}): Promise<TagWithQuotesCount[]> {
		const { sortBy = this.DEFAULT_SORT_BY, order = this.DEFAULT_ORDER } = input

		return await getClient(options.transaction)
			.select({
				...getTableColumns(tags),
				quotesCount: sql<number>`count(${quotes.id})`.mapWith(Number).as('quotesCount'),
			})
			.from(quoteTags)
			.innerJoin(tags, eq(tags.id, quoteTags.tagId))
			.innerJoin(quotes, eq(quotes.id, quoteTags.quoteId))
			.where(and(isNull(tags.deletedAt), isNull(quotes.deletedAt)))
			.groupBy(tags.id)
			.orderBy(sql`${sql.identifier(sortBy)} ${sql.raw(order)}`)
	}

	async upsertMultiple(names: string[], options: { transaction?: Transaction } = {}): Promise<Tag[]> {
		return await getClient(options.transaction)
			.insert(tags)
			.values(names.filter(Boolean).map((name) => ({ name: name, shortId: generateShortId() })))
			.onConflictDoNothing({ target: tags.name })
			.returning()
	}

	async bulkUpsertQuoteTags(data: QuoteTag[], options: { transaction?: Transaction } = {}): Promise<void> {
		await getClient(options.transaction)
			.insert(quoteTags)
			.values(data)
			.onConflictDoNothing({
				target: [quoteTags.quoteId, quoteTags.tagId],
			})
			.returning()
	}

	async bulkDeleteQuoteTags(data: QuoteTag[], options: { transaction?: Transaction } = {}): Promise<void> {
		await getClient(options.transaction)
			.delete(quoteTags)
			.where(or(...data.map((d) => and(eq(quoteTags.quoteId, d.quoteId), eq(quoteTags.tagId, d.tagId)))))
	}

	async deleteAllQuoteTags(quoteId: UUIDTypes, options: { transaction?: Transaction }) {
		await getClient(options.transaction).delete(quoteTags).where(eq(quoteTags.quoteId, quoteId.toString()))
	}

	async getQuoteTags(quoteId: UUIDTypes, options: { transaction?: Transaction }): Promise<QuoteTag[]> {
		return await getClient(options.transaction)
			.select()
			.from(quoteTags)
			.where(eq(quoteTags.quoteId, quoteId.toString()))
	}
}
