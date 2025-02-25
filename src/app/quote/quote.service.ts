import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UUIDTypes } from 'uuid'
import { getClient } from '../../db'
import { Transaction } from '../../db/index'
import { getAuthorSlug } from '../../db/schema/author.schema'
import { Quote, QuoteWithRelationships } from '../../db/schema/quote.schema'
import { BulkCreateResult } from '../../interfaces/bulk_create_result.interface'
import PaginatedResponse from '../../interfaces/paginated_response.interface'
import { AuthorService } from '../author/author.service'
import { TagService } from '../tag/tag.service'
import { CreateQuoteDto, GetRandomQuotesDto, IndexQuotesDto, QuoteDto, UpdateQuoteDto } from './quote.dto'
import { QuoteRepository } from './quote.repository'

type RandomQuoteResult =
	| { isMultiple: true; data: QuoteWithRelationships[] }
	| { isMultiple: false; data: QuoteWithRelationships | null }

@Injectable()
export class QuoteService {
	public BULK_SIZE = 500

	constructor(
		private readonly quoteRepository: QuoteRepository,
		private readonly tagService: TagService,
		private readonly authorService: AuthorService,
	) {}

	async getRandom(request: GetRandomQuotesDto): Promise<RandomQuoteResult> {
		if (request.limit) {
			return {
				isMultiple: true,
				data: this.convertToQuoteDtos(
					await this.quoteRepository.random({
						...request,
						limit: request.limit as number,
					}),
				),
			}
		}

		return {
			isMultiple: false,
			data: this.convertToQuoteDtos([await this.quoteRepository.random({ ...request, limit: undefined })])[0],
		}
	}

	async index(request: IndexQuotesDto): Promise<PaginatedResponse<QuoteDto>> {
		const data = await this.quoteRepository.index(request)

		return {
			data: this.convertToQuoteDtos(data.data),
			metadata: data.metadata,
		}
	}

	async create(request: CreateQuoteDto): Promise<QuoteDto> {
		return await getClient().transaction(async (t) => {
			const quote = await this.quoteRepository.create(request, {
				transaction: t,
			})

			await this.tagService.sync(quote, request.tags, {
				transaction: t,
			})

			return this.convertToQuoteDtos([
				await this.quoteRepository.getById(quote.id, {
					transaction: t,
					findOrFail: true,
				}),
			])[0]
		})
	}

	async update(uuid: string, request: UpdateQuoteDto): Promise<QuoteDto> {
		return await getClient().transaction(async (t) => {
			const quote = await this.quoteRepository.update(uuid, request, {
				transaction: t,
			})

			await this.tagService.sync(quote, request.tags, {
				transaction: t,
			})

			return this.convertToQuoteDtos([
				await this.quoteRepository.getById(quote.id, {
					transaction: t,
					findOrFail: true,
				}),
			])[0]
		})
	}

	async getById(uuid: string): Promise<QuoteDto> {
		return this.convertToQuoteDtos([await this.quoteRepository.getByShortId(uuid, { findOrFail: true })])[0]
	}

	async delete(uuid: string): Promise<QuoteDto> {
		return await getClient().transaction(async (t) => {
			const quote = await this.quoteRepository.delete(uuid, {
				transaction: t,
			})

			return this.convertToQuoteDtos([quote])[0]
		})
	}

	async bulkCreate(
		input: CreateQuoteDto[],
		options: { transaction: Transaction },
	): Promise<BulkCreateResult<CreateQuoteDto>> {
		const chunks = Array.from(
			{
				length: Math.ceil(input.length / this.BULK_SIZE),
			},
			(_, i) => {
				return input.slice(i * this.BULK_SIZE, (i + 1) * this.BULK_SIZE)
			},
		).filter((chunk) => chunk.length > 0)

		const quotes: Quote[] = []
		const skippedData: CreateQuoteDto[] = []

		for (const chunk of chunks) {
			const authorsById = await this.authorService.getByIds(chunk.map((q) => q.authorId as UUIDTypes).filter(Boolean), {
				transaction: options.transaction,
			})
			const mappedIds = new Map(authorsById.map((a) => [a.id, a]))

			const authorsBySlug = await this.authorService.getBySlugs(chunk.map((q) => q.author as string).filter(Boolean), {
				transaction: options.transaction,
			})
			const mappedSlugs = new Map(authorsBySlug.map((a) => [a.slug, a]))

			const convertedChunk = chunk.map((q) => ({
				...q,
				authorId: q.authorId ?? mappedSlugs.get(getAuthorSlug(q.author as string))?.id,
			}))
			const contentMap = new Map(convertedChunk.map((q) => [q.content, q]))

			const validatedData = convertedChunk.filter(
				(q) =>
					(q.authorId && mappedIds.has(q.authorId.toString())) ||
					(q.author && mappedSlugs.has(getAuthorSlug(q.author as string))),
			)

			skippedData.push(
				...convertedChunk.filter(
					(q) =>
						!(
							(q.authorId && mappedIds.has(q.authorId.toString())) ||
							(q.author && mappedSlugs.has(getAuthorSlug(q.author as string)))
						),
				),
			)

			const result = await this.quoteRepository.bulkUpsert(validatedData, options)
			const insertedMap = new Map(result.map((q) => [q.content, q]))
			quotes.push(...result)
			const quoteTags = new Map(result.map((q) => [q.id, contentMap.get(q.content)?.tags ?? []]))

			if (quoteTags.size > 0) {
				await this.tagService.bulkSync(quoteTags, {
					transaction: options.transaction,
				})
			}

			skippedData.push(
				...validatedData
					.filter((q) => !insertedMap.has(q.content))
					.map(
						(q) =>
							({
								content: q.content,
								authorId: q.authorId,
							}) as CreateQuoteDto,
					),
			)
		}

		return {
			input: input.length,
			created: quotes.length,
			skipped: skippedData.length,
			skippedData: skippedData,
		}
	}

	private convertToQuoteDtos(quotes: Quote[]): QuoteDto[] {
		return quotes.map((q) => plainToInstance(QuoteDto, q))
	}
}
