import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { and, eq, exists, getTableName, inArray, isNull, SQL, sql } from 'drizzle-orm'
import ShortUniqueId from 'short-unique-id'
import { UUIDTypes } from 'uuid'
import { getClient, Transaction } from '../../db/index'
import { Author, authors, getAuthorSlug } from '../../db/schema/author.schema'
import { NewQuote, Quote, quotes, QuoteWithRelationships } from '../../db/schema/quote.schema'
import { QuoteTag, quoteTags, Tag, tags } from '../../db/schema/tag.schema'
import { OrderEnum } from '../../enums/order.enum'
import PaginatedResponse from '../../interfaces/paginated_response.interface'
import generateShortId from '../../utils/short_id'
import { AuthorRepository } from '../author/author.repository'
import { CreateQuoteDto, GetRandomQuotesDto, IndexQuotesDto, UpdateQuoteDto } from './quote.dto'

interface QuoteFilters {
	author?: string
	query?: string
	minLength?: number
	maxLength?: number
	tags?: string
}

interface QuoteFindManyResult {
	quotes: Quote
	authors: Author
	quote_tags: QuoteTag
	tags: Tag
}

export enum QuoteSortByEnum {
	DATE_CREATED = 'createdAt',
	DATE_MODIFIED = 'updatedAt',
	CONTENT = 'content',
}

@Injectable()
export class QuoteRepository {
	public DEFAULT_SORT_BY = QuoteSortByEnum.DATE_CREATED
	public DEFAULT_ORDER = OrderEnum.ASC
	public DEFAULT_LIMIT = 10
	public DEFAULT_PAGE = 0

	constructor(private readonly authorRepository: AuthorRepository) {}

	async getById(
		id: UUIDTypes,
		options: {
			findOrFail: true
			withRelationships: true
			transaction?: Transaction
		},
	): Promise<QuoteWithRelationships>
	async getById(
		id: UUIDTypes,
		options: {
			findOrFail: true
			withRelationships?: false
			transaction?: Transaction
		},
	): Promise<Quote>
	async getById(
		id: UUIDTypes,
		options?: {
			findOrFail?: false
			withRelationships: true
			transaction?: Transaction
		},
	): Promise<QuoteWithRelationships | null>
	async getById(
		id: UUIDTypes,
		options?: {
			findOrFail?: false
			withRelationships?: false
			transaction?: Transaction
		},
	): Promise<Quote | null>
	async getById(
		id: UUIDTypes,
		options: {
			findOrFail?: boolean
			withRelationships?: boolean
			transaction?: Transaction
		} = {},
	): Promise<QuoteWithRelationships | Quote | null> {
		const { findOrFail = false, withRelationships = true, transaction = undefined } = options

		const quote = await getClient(transaction).query.quotes.findFirst({
			where: and(eq(quotes.id, id.toString()), isNull(quotes.deletedAt)),
			with: withRelationships
				? {
						author: true,
						quoteTags: {
							columns: {
								tagId: false,
								quoteId: false,
							},
							with: {
								tag: true,
							},
						},
					}
				: undefined,
		})

		if (findOrFail && !quote) {
			throw new UnprocessableEntityException(`Quote with ID ${id} not found`)
		}

		return quote ? this.transform(quote) : null
	}

	async getByShortId(
		id: string,
		options: {
			findOrFail: true
			withRelationships: true
			transaction?: Transaction
		},
	): Promise<QuoteWithRelationships>
	async getByShortId(
		id: string,
		options: {
			findOrFail: true
			withRelationships?: false
			transaction?: Transaction
		},
	): Promise<Quote>
	async getByShortId(
		id: string,
		options?: {
			findOrFail?: false
			withRelationships: true
			transaction?: Transaction
		},
	): Promise<QuoteWithRelationships | null>
	async getByShortId(
		id: string,
		options?: {
			findOrFail?: false
			withRelationships?: false
			transaction?: Transaction
		},
	): Promise<Quote | null>
	async getByShortId(
		id: string,
		options: {
			findOrFail?: boolean
			withRelationships?: boolean
			transaction?: Transaction
		} = {},
	): Promise<QuoteWithRelationships | Quote | null> {
		const { findOrFail = false, withRelationships = true, transaction = undefined } = options

		const quote = await getClient(transaction).query.quotes.findFirst({
			where: and(eq(quotes.shortId, id), isNull(quotes.deletedAt)),
			with: withRelationships
				? {
						author: true,
						quoteTags: {
							columns: {
								tagId: false,
								quoteId: false,
							},
							with: {
								tag: true,
							},
						},
					}
				: undefined,
		})

		if (findOrFail && !quote) {
			throw new UnprocessableEntityException(`Quote with id ${id} not found`)
		}

		return quote ? this.transform(quote) : null
	}

	async getByIds(
		ids: UUIDTypes[],
		options: {
			sortBy?: QuoteSortByEnum
			order?: OrderEnum
			transaction?: Transaction
		} = {},
	): Promise<QuoteWithRelationships[]> {
		const { sortBy = this.DEFAULT_SORT_BY, order = this.DEFAULT_ORDER } = options

		const result = await getClient(options.transaction).query.quotes.findMany({
			where: and(
				inArray(
					quotes.id,
					ids.map((i) => i.toString()),
				),
				isNull(quotes.deletedAt),
			),
			with: {
				author: true,
				quoteTags: {
					columns: {
						tagId: false,
						quoteId: false,
					},
					with: {
						tag: true,
					},
				},
			},
			orderBy: sql`${sql.identifier(sortBy)} ${sql.raw(order)}`,
		})

		return result.map((q) => this.transform(q))
	}

	async random(input: GetRandomQuotesDto & { limit: undefined | 1 }): Promise<QuoteWithRelationships>
	async random(input: GetRandomQuotesDto & { limit: number }): Promise<QuoteWithRelationships[]>
	async random(input: GetRandomQuotesDto): Promise<QuoteWithRelationships[] | QuoteWithRelationships> {
		const { limit = 1, sortBy = this.DEFAULT_SORT_BY, order = this.DEFAULT_ORDER } = input

		// Build a sub query to filter quotes with the given filters and get a random one
		const sq = getClient()
			.$with('sq')
			.as(
				getClient()
					.select({ id: quotes.id })
					.from(quotes)
					.orderBy(sql`RANDOM()`)
					.where(and(isNull(quotes.deletedAt), ...this.createFilters(input)))
					.limit(limit),
			)

		// The main query to get the quote with relationships
		const data = await getClient()
			.with(sq)
			.select()
			.from(quotes)
			.innerJoin(authors, eq(authors.id, quotes.authorId))
			.innerJoin(quoteTags, eq(quoteTags.quoteId, quotes.id))
			.innerJoin(tags, eq(tags.id, quoteTags.tagId))
			.innerJoin(sq, eq(sq.id, quotes.id))
			.where(eq(quotes.id, sq.id))
			.orderBy(sql`${sql.raw(getTableName(quotes))}.${sql.identifier(sortBy)} ${sql.raw(order)}`)

		const result = this.transformQuotes(data)

		return limit === 1 ? result[0] : result
	}

	async index(input: IndexQuotesDto): Promise<PaginatedResponse<QuoteWithRelationships>> {
		const {
			limit = this.DEFAULT_LIMIT,
			page = this.DEFAULT_PAGE,
			sortBy = this.DEFAULT_SORT_BY,
			order = this.DEFAULT_ORDER,
		} = input

		const filter = this.createFilters(input)
		const sq = getClient()
			.$with('sq')
			.as(
				getClient()
					.select({ id: quotes.id })
					.from(quotes)
					.where(and(isNull(quotes.deletedAt), ...filter))
					.limit(limit),
			)

		const [countResult, selectResult] = await Promise.all([
			getClient()
				.select({
					count: sql<number>`count(distinct ${quotes.id})`.mapWith(Number),
				})
				.from(quotes)
				.innerJoin(authors, eq(authors.id, quotes.authorId))
				.innerJoin(quoteTags, eq(quoteTags.quoteId, quotes.id))
				.innerJoin(tags, eq(tags.id, quoteTags.tagId))
				.where(and(isNull(quotes.deletedAt), ...this.createFilters(input))),
			getClient()
				.with(sq)
				.select()
				.from(quotes)
				.innerJoin(authors, eq(authors.id, quotes.authorId))
				.innerJoin(quoteTags, eq(quoteTags.quoteId, quotes.id))
				.innerJoin(tags, eq(tags.id, quoteTags.tagId))
				.innerJoin(sq, eq(sq.id, quotes.id))
				.where(eq(quotes.id, sq.id))
				.offset(limit * page)
				.orderBy(sql`"${sql.raw(getTableName(quotes))}".${sql.identifier(sortBy)} ${sql.raw(order)}`),
		])

		const count = countResult[0]?.count || 0
		const lastPage = Math.max(0, Math.ceil(count / limit) - 1)

		return {
			data: this.transformQuotes(selectResult),
			metadata: {
				total: count,
				page,
				lastPage,
				hasNextPage: page < lastPage,
				hasPreviousPage: page > 0,
			},
		} as PaginatedResponse<QuoteWithRelationships>
	}

	async create(input: CreateQuoteDto, options: { transaction?: Transaction } = {}): Promise<Quote> {
		let authorId: string
		let shortId = generateShortId()

		while (await this.checkShortId(shortId, options)) {
			shortId = generateShortId()
		}

		if (!input.authorId) {
			const author = await this.authorRepository.getBySlug(input.author as string, {
				findOrFail: true,
			})

			authorId = author.id
		} else {
			const author = await this.authorRepository.getByShortId(input.authorId, {
				findOrFail: true,
			})

			authorId = author.id
		}

		const data: NewQuote = {
			content: input.content,
			authorId: authorId.toString(),
			shortId: new ShortUniqueId({ length: 10 }).rnd(),
		}

		const inserted = await getClient(options.transaction).insert(quotes).values(data).returning()

		return inserted[0]
	}

	async bulkUpsert(input: CreateQuoteDto[], options: { transaction: Transaction }): Promise<Quote[]> {
		return await getClient(options.transaction)
			.insert(quotes)
			.values(
				input.map((i) => ({
					content: i.content,
					authorId: (i.authorId as UUIDTypes).toString(),
					shortId: new ShortUniqueId({ length: 10 }).rnd(),
				})),
			)
			.onConflictDoNothing({ target: quotes.content })
			.returning()
	}

	async update(uuid: string, input: UpdateQuoteDto, options: { transaction?: Transaction } = {}): Promise<Quote> {
		const quote = await this.getByShortId(uuid, {
			findOrFail: true,
			withRelationships: false,
			transaction: options.transaction,
		})

		const result = await getClient(options.transaction)
			.update(quotes)
			.set({ content: input.content ?? quote.content })
			.where(eq(quotes.id, quote.id))
			.returning()

		return result[0]
	}

	async delete(uuid: string, options: { transaction?: Transaction } = {}): Promise<Quote> {
		const quote = await this.getByShortId(uuid, {
			findOrFail: true,
			withRelationships: false,
			transaction: options.transaction,
		})

		const result = await getClient()
			.update(quotes)
			.set({ deletedAt: sql`now()` })
			.where(eq(quotes.id, quote.id))
			.returning()

		return result[0]
	}

	private createFilters(params: QuoteFilters) {
		const { author, query, minLength, maxLength, tags } = params

		return [
			...this.filtersByContent({ query, minLength, maxLength }),
			this.filterByAuthor(author),
			this.fitlerByTags(tags),
		].filter(Boolean)
	}

	private filtersByContent(queries?: { query?: string; minLength?: number; maxLength?: number }): SQL[] {
		if (!queries) {
			return []
		}

		const filters = []
		const { query, minLength, maxLength } = queries

		if (query) {
			const keywords = query
				.replace(/[+\-<>~*"@]/g, ' ')
				.trim()
				.replace(/\s+/g, ' ')
				.split(' ')
				.map((word) => `${word}:*`)
				.join(' & ')

			filters.push(sql`to_tsvector('english', ${quotes.content}) @@ to_tsquery('english', ${keywords})`)
		}

		if (minLength) {
			filters.push(sql`length(${quotes.content}) >= ${minLength}`)
		}

		if (maxLength) {
			filters.push(sql`length(${quotes.content}) <= ${maxLength}`)
		}

		return filters
	}

	private filterByAuthor(author?: string): SQL | undefined {
		if (!author) {
			return undefined
		}

		return exists(
			getClient()
				.select({ n: sql`1` })
				.from(authors)
				.where(and(eq(authors.slug, getAuthorSlug(author)), eq(authors.id, quotes.authorId))),
		)
	}

	private fitlerByTags(tagQueries?: string): SQL | undefined {
		if (!tagQueries) {
			return undefined
		}

		if (tagQueries.includes('|')) {
			const tagsList: string[] = tagQueries.split('|')

			return exists(
				getClient()
					.select({ n: sql`1` })
					.from(tags)
					.innerJoin(quoteTags, eq(quoteTags.tagId, tags.id))
					.where(and(inArray(tags.name, tagsList), eq(quoteTags.quoteId, quotes.id))),
			)
		}

		const tagsList: string[] = tagQueries.split(',')

		return and(
			...tagsList.map((tag) =>
				exists(
					getClient()
						.select({ n: sql`1` })
						.from(tags)
						.innerJoin(quoteTags, eq(quoteTags.tagId, tags.id))
						.where(and(eq(tags.name, tag), eq(quoteTags.quoteId, quotes.id))),
				),
			),
		)
	}

	private transform(quote: Quote & { author?: Author; quoteTags?: { tag: Tag }[] }): QuoteWithRelationships {
		const { quoteTags, ...rest } = quote

		return {
			...rest,
			tags: quoteTags?.map((t) => t.tag) || [],
		}
	}

	private transformQuotes(data: QuoteFindManyResult[]): QuoteWithRelationships[] {
		const result: Map<UUIDTypes, QuoteWithRelationships> = new Map<UUIDTypes, QuoteWithRelationships>()

		data.forEach((i) => {
			const quote: QuoteWithRelationships = result.get(i.quotes.id) || this.transform(i.quotes)
			quote.author = i.authors
			quote.tags = quote.tags?.concat(i.tags) || [i.tags]
			result.set(i.quotes.id, quote)
		})

		return Array.from(result.values())
	}

	private async checkShortId(shortId: string, options: { transaction?: Transaction } = {}): Promise<boolean> {
		return (
			(await getClient(options.transaction).select().from(quotes).where(eq(quotes.shortId, shortId)).limit(1)) ===
			undefined
		)
	}
}
