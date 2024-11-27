import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { FindOptions, Includeable, Op, Sequelize, Transaction } from 'sequelize'
import { Literal, Where } from 'sequelize/types/utils'
import { OrderEnum } from '../../enums/order.enum'
import PaginatedResponse from '../../interfaces/paginated_response.interface'
import { Author } from '../author/author.entity'
import { AuthorRepository } from '../author/author.repository'
import { Tag } from '../tag/tag.entity'
import {
  CreateQuoteDto,
  GetRandomQuoteDto,
  GetRandomQuotesDto,
  IndexQuotesDto,
  UpdateQuoteDto,
} from './quote.dto'
import { Quote } from './quote.entity'

interface QuoteFilters {
  author?: string
  query?: string
  minLength?: number
  maxLength?: number
  tags?: string
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

  constructor(
    @InjectModel(Quote)
    private readonly quoteModel: typeof Quote,
    private readonly authorRepository: AuthorRepository,
  ) {}

  async getById(
    id: number,
    options: { findOrFail: true; transaction?: Transaction },
  ): Promise<Quote>
  async getById(
    id: number,
    options?: { findOrFail?: false; transaction?: Transaction },
  ): Promise<Quote | null>
  async getById(
    id: number,
    options: { findOrFail?: boolean; transaction?: Transaction } = {},
  ): Promise<Quote | null> {
    const quote = await this.quoteModel.findOne({
      where: { id },
      include: [Author, Tag],
      transaction: options.transaction,
    })

    if (options.findOrFail && !quote) {
      throw new UnprocessableEntityException(`Quote with ID ${id} not found`)
    }

    return quote
  }

  async random(input: GetRandomQuoteDto): Promise<Quote | null> {
    return await this.quoteModel
      .scope(['defaultScope', 'random'])
      .findOne(this.createFilter(input))
  }

  async randomQuotes(input: GetRandomQuotesDto): Promise<Quote[]> {
    const {
      limit = this.DEFAULT_LIMIT,
      sortBy = this.DEFAULT_SORT_BY,
      order = this.DEFAULT_ORDER,
    } = input

    return await this.quoteModel.findAll({
      ...this.createFilter(input),
      limit: limit,
      order: [Sequelize.literal('rand()'), [sortBy, order]],
    })
  }

  async index(input: IndexQuotesDto): Promise<PaginatedResponse<Quote>> {
    const {
      limit = this.DEFAULT_LIMIT,
      page = this.DEFAULT_PAGE,
      sortBy = this.DEFAULT_SORT_BY,
      order = this.DEFAULT_ORDER,
    } = input

    const { count, rows } = await this.quoteModel.findAndCountAll({
      ...this.createFilter(input),
      limit,
      offset: limit * page,
      order: [[sortBy, order]],
      distinct: true,
      col: 'Quote.id',
    })

    const lastPage = Math.max(0, Math.ceil(count / limit) - 1)

    return {
      data: rows,
      metadata: {
        total: count,
        page,
        lastPage,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 0,
      },
    } as PaginatedResponse<Quote>
  }

  async create(
    input: CreateQuoteDto,
    options: { t?: Transaction } = {},
  ): Promise<Quote> {
    let authorId: number

    if (!input.authorId) {
      const author = await this.authorRepository.getBySlug(
        input.author as string,
        {
          findOrFail: true,
        },
      )

      authorId = author.id
    } else {
      const author = await this.authorRepository.getById(
        input.authorId as number,
        {
          findOrFail: true,
        },
      )

      authorId = author.id
    }

    return await this.quoteModel.create<Quote>(
      {
        content: input.content,
        authorId: authorId,
      },
      {
        include: [Author, Tag],
        transaction: options.t,
      },
    )
  }

  async bulkUpsert(
    input: CreateQuoteDto[],
    options: { transaction: Transaction },
  ): Promise<Quote[]> {
    return await this.quoteModel.bulkCreate(
      input.map((i) => ({
        content: i.content,
        authorId: i.authorId,
      })),
      { transaction: options.transaction, ignoreDuplicates: true },
    )
  }

  async update(
    id: number,
    input: UpdateQuoteDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Quote> {
    const quote = await this.getById(id, {
      findOrFail: true,
      transaction: options.transaction,
    })

    await quote.update(
      {
        content: input.content ?? quote.content,
      },
      {
        transaction: options.transaction,
      },
    )

    return quote
  }

  async delete(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Quote> {
    const quote = await this.getById(id, {
      findOrFail: true,
      transaction: options.transaction,
    })

    await quote.$remove('tags', quote.tags, {
      transaction: options.transaction,
    })

    await quote.destroy({ transaction: options.transaction })

    return quote
  }

  private createFilter(params: QuoteFilters): FindOptions<Quote> {
    const { author, query, minLength, maxLength, tags } = params

    return {
      where: {
        [Op.and]: this.filterByContent({ query, minLength, maxLength }),
      },
      include: [this.filterByAuthor(author), this.filterByTags(tags)].filter(
        (f) => f !== null,
      ),
    }
  }

  private filterByContent(queries?: {
    query?: string
    minLength?: number
    maxLength?: number
  }): Array<Literal | Where> {
    if (!queries) {
      return []
    }

    const filters = []
    const { query, minLength, maxLength } = queries

    if (query) {
      const keywords = query
        .split(/[\s,;]+/)
        .map((w) => w + '*')
        .join(',')

      filters.push(
        Sequelize.literal(
          `MATCH(content) AGAINST('${keywords}' IN BOOLEAN MODE)`,
        ),
      )
    }

    // Filter by content length if provided
    if (minLength) {
      filters.push(
        Sequelize.where(
          Sequelize.fn('CHAR_LENGTH', Sequelize.col('content')),
          '>=',
          minLength,
        ),
      )
    }

    if (maxLength) {
      filters.push(
        Sequelize.where(
          Sequelize.fn('CHAR_LENGTH', Sequelize.col('content')),
          '<=',
          maxLength,
        ),
      )
    }

    return filters
  }

  private filterByAuthor(author?: string): Includeable | null {
    if (!author) {
      return null
    }

    return {
      model: Author,
      where: {
        slug: Author.getSlug(author),
      },
      require: true,
    } as Includeable
  }

  private filterByTags(tags?: string): Includeable | null {
    if (!tags) {
      return null
    }

    if (tags.includes('|')) {
      const tagsList: string[] = tags.split('|')

      return {
        model: Tag,
        where: {
          name: {
            [Op.in]: tagsList,
          },
        },
        required: true,
      } as Includeable
    }

    const tagsList: string[] = tags.split(',')

    // Ensuing that each quote must have all tags
    const tagConditions = tagsList.map((tag) =>
      Sequelize.literal(`EXISTS (
        SELECT 1 FROM tags
        INNER JOIN quote_tags ON tags.id = quote_tags.tagId
        WHERE quote_tags.quoteId = \`Quote\`.\`id\`
        AND tags.name = '${tag}'
      )`),
    )

    return {
      model: Tag,
      required: true,
      through: {
        attributes: [],
      },
      duplicating: false,
      where: {
        [Op.and]: tagConditions,
      },
    } as Includeable
  }
}
