import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import Transaction from 'sequelize/types/transaction'
import { getClient } from 'src/db'
import PaginatedResponse from 'src/interfaces/paginated_response.interface'
import { Quote, QuoteWithRelationships } from '../../db/schema/quote.schema'
import { BulkCreateResult } from '../../interfaces/bulk_create_result.interface'
import { AuthorService } from '../author/author.service'
import { TagService } from '../tag/tag.service'
import {
  CreateQuoteDto,
  GetRandomQuotesDto,
  IndexQuotesDto,
  UpdateQuoteDto,
} from './quote.dto'
import { QuoteRepository } from './quote.repository'

type RandomQuoteResult =
  | { isMultiple: true; data: Quote[] }
  | { isMultiple: false; data: Quote | null }

@Injectable()
export class QuoteService {
  public BULK_SIZE = 500

  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly tagService: TagService,
    private readonly authorService: AuthorService,
    private sequelize: Sequelize,
  ) {}

  async getRandom(request: GetRandomQuotesDto): Promise<RandomQuoteResult> {
    if (request.limit) {
      return {
        isMultiple: true,
        data: await this.quoteRepository.randomQuotes(request),
      }
    }

    return {
      isMultiple: false,
      data: await this.quoteRepository.random(request),
    }
  }

  async index(
    request: IndexQuotesDto,
  ): Promise<PaginatedResponse<QuoteWithRelationships>> {
    return await this.quoteRepository.index(request)
  }

  async create(request: CreateQuoteDto): Promise<Quote> {
    // const t = await this.sequelize.transaction()

    // try {
    //   const quote = await this.quoteRepository.create(request, {
    //     t: t,
    //   })

    //   await this.tagService.sync(quote, request.tags, {
    //     t: t,
    //   })

    //   const result = await this.legacyQuoteRepository.getById(quote.id, {
    //     transaction: t,
    //     findOrFail: true,
    //   })

    //   await t.commit()

    //   return result
    // } catch (e) {
    //   await t.rollback()

    //   throw e
    // }

    return await getClient().transaction(async (t) => {
      const quote = await this.quoteRepository.create(request, {
        transaction: t,
      })

      return quote
    })
  }

  async update(id: number, request: UpdateQuoteDto): Promise<Quote> {
    return await getClient().transaction(async (t) => {
      const quote = await this.quoteRepository.update(id, request, {
        transaction: t,
      })

      return quote
    })
    // const t = await this.sequelize.transaction()

    // try {
    //   const quote = await this.legacyQuoteRepository.update(id, request, {
    //     transaction: t,
    //   })

    //   await this.tagService.sync(quote, request.tags, {
    //     t: t,
    //   })

    //   const result = await this.legacyQuoteRepository.getById(quote.id, {
    //     transaction: t,
    //     findOrFail: true,
    //   })

    //   await t.commit()

    //   return result
    // } catch (e) {
    //   await t.rollback()

    //   throw e
    // }
  }

  async getById(id: number): Promise<QuoteWithRelationships> {
    return await this.quoteRepository.getById(id, { findOrFail: true })
  }

  async delete(id: number): Promise<Quote> {
    return await getClient().transaction(async (t) => {
      const quote = await this.quoteRepository.delete(id, {
        transaction: t,
      })

      return quote
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

    // for (const chunk of chunks) {
    //   const authorsById = await this.authorService.getByIds(
    //     chunk.map((q) => q.authorId as number).filter(Boolean),
    //     { transaction: options.transaction },
    //   )
    //   const mappedIds = new Map(authorsById.map((a) => [a.id, a]))

    //   const authorsBySlug = await this.authorService.getBySlugs(
    //     chunk.map((q) => q.author as string).filter(Boolean),
    //     { transaction: options.transaction },
    //   )
    //   const mappedSlugs = new Map(authorsBySlug.map((a) => [a.slug, a]))

    //   const convertedChunk = chunk.map((q) => ({
    //     ...q,
    //     authorId:
    //       q.authorId ?? mappedSlugs.get(Author.getSlug(q.author as string))?.id,
    //   }))
    //   const contentMap = new Map(convertedChunk.map((q) => [q.content, q]))

    //   const validatedData = convertedChunk.filter(
    //     (q) =>
    //       (q.authorId && mappedIds.has(q.authorId)) ||
    //       (q.author && mappedSlugs.has(Author.getSlug(q.author as string))),
    //   )

    //   skippedData.push(
    //     ...convertedChunk.filter(
    //       (q) =>
    //         !(
    //           (q.authorId && mappedIds.has(q.authorId)) ||
    //           (q.author && mappedSlugs.has(Author.getSlug(q.author as string)))
    //         ),
    //     ),
    //   )

    //   const result = await this.quoteRepository.bulkUpsert(
    //     validatedData,
    //     options,
    //   )
    //   const inserted = result.filter((q) => q.id)
    //   quotes.push(...inserted)
    //   const quoteTags = new Map(
    //     inserted.map((q) => [q.id, contentMap.get(q.content)?.tags ?? []]),
    //   )
    //   await this.tagService.bulkSync(quoteTags, {
    //     transaction: options.transaction,
    //   })

    //   skippedData.push(
    //     ...result
    //       .filter((q) => !q.id)
    //       .map(
    //         (q) =>
    //           ({
    //             content: q.content,
    //             authorId: q.authorId,
    //           }) as CreateQuoteDto,
    //       ),
    //   )
    // }

    return {
      input: input.length,
      created: quotes.length,
      skipped: skippedData.length,
      skippedData: skippedData,
    }
  }
}
