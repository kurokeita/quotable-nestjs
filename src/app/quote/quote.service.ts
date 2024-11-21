import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import PaginatedResponse from 'src/interfaces/paginated_response.interface'
import { TagService } from '../tag/tag.service'
import {
  CreateQuoteDto,
  GetRandomQuoteDto,
  GetRandomQuotesDto,
  IndexQuotesDto,
  UpdateQuoteDto,
} from './quote.dto'
import { Quote } from './quote.entity'
import { QuoteRepository } from './quote.repository'

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly tagService: TagService,
    private sequelize: Sequelize,
  ) {}

  async getRandomQuote(request: GetRandomQuoteDto): Promise<Quote | null> {
    return await this.quoteRepository.random(request)
  }

  async getRandomQuotes(request: GetRandomQuotesDto): Promise<Quote[]> {
    return await this.quoteRepository.randomQuotes(request)
  }

  async index(request: IndexQuotesDto): Promise<PaginatedResponse<Quote>> {
    return await this.quoteRepository.index(request)
  }

  async create(request: CreateQuoteDto): Promise<Quote> {
    const t = await this.sequelize.transaction()

    try {
      const quote = await this.quoteRepository.create(request, {
        t: t,
      })

      await this.tagService.sync(quote, request.tags, {
        t: t,
      })

      const result = await this.quoteRepository.getById(quote.id, {
        transaction: t,
        findOrFail: true,
      })

      await t.commit()

      return result
    } catch (e) {
      await t.rollback()

      throw e
    }
  }

  async update(id: number, request: UpdateQuoteDto): Promise<Quote> {
    const t = await this.sequelize.transaction()

    try {
      const quote = await this.quoteRepository.update(id, request, {
        transaction: t,
      })

      await this.tagService.sync(quote, request.tags, {
        t: t,
      })

      const result = await this.quoteRepository.getById(quote.id, {
        transaction: t,
        findOrFail: true,
      })

      await t.commit()

      return result
    } catch (e) {
      await t.rollback()

      throw e
    }
  }

  async getById(id: number): Promise<Quote> {
    return await this.quoteRepository.getById(id, { findOrFail: true })
  }

  async delete(id: number): Promise<void> {
    const t = await this.sequelize.transaction()

    try {
      await this.quoteRepository.delete(id, { transaction: t })

      await t.commit()
    } catch (e) {
      await t.rollback()

      throw e
    }
  }
}
