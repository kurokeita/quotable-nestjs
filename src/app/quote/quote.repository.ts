import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { FindOptions, Includeable, Op, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { OrderEnum } from '../../enums/order.enum'
import PaginatedResponse from '../../interfaces/paginated_response.interface'
import { Author } from '../author/author.entity'
import { AuthorRepository } from '../author/author.repository'
import { Tag } from '../tag/tag.entity'
import {
  CreateQuoteDto,
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
    private readonly sequelize: Sequelize,
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

  async random(input: GetRandomQuotesDto): Promise<Quote | null> {
    const quote = await this.quoteModel.findOne({
      ...this.createFilter(input),
      order: Sequelize.fn('RANDOM'),
    })

    // Why this? Because of a bug in Sequelize where `LIMIT` would break the query with top level complex clauses
    // Reference: https://github.com/sequelize/sequelize/issues/12971
    return quote ? await this.getById(quote.id, { findOrFail: true }) : null
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
      order: [Sequelize.fn('RANDOM'), [sortBy, order]],
    })
  }

  async index(input: IndexQuotesDto): Promise<PaginatedResponse<Quote>> {
    const {
      limit = this.DEFAULT_LIMIT,
      page = this.DEFAULT_PAGE,
      sortBy = this.DEFAULT_SORT_BY,
      order = this.DEFAULT_ORDER,
    } = input

    // Can not use the `findAndCountAll` because `GROUP BY` will mess up the count query
    const [count, rows] = await Promise.all([
      this.quoteModel.unscoped().count({
        ...this.createFilter(input),
        distinct: true,
        col: 'id',
      }),
      this.quoteModel.findAll({
        ...this.createFilter(input),
        limit,
        offset: limit * page,
        order: [[sortBy, order]],
      }),
    ])

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

    const tagFilters = this.filterByTags(tags)
    const authorFilter = this.filterByAuthor(author)
    const contentFilters = this.filterByContent({ query, minLength, maxLength })

    return {
      where: contentFilters.where,
      include: [
        ...(tagFilters.include || []),
        ...(authorFilter.include || []),
      ].filter(Boolean),
      subQuery: false,
    }
  }

  private filterByContent(queries?: {
    query?: string
    minLength?: number
    maxLength?: number
  }): FindOptions<Quote> {
    if (!queries) {
      return {}
    }

    const filters = []
    const { query, minLength, maxLength } = queries

    if (query) {
      const keywords = query
        .replace(/[+\-<>~*"@]/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')

      // PostgreSQL full-text search
      filters.push(
        Sequelize.where(
          Sequelize.fn('to_tsvector', 'english', Sequelize.col('content')),
          '@@',
          Sequelize.fn(
            'to_tsquery',
            'english',
            keywords.split(' ').join(' & '),
          ),
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

    return {
      where: {
        [Op.and]: filters,
      },
    }
  }

  private filterByAuthor(
    author?: string,
  ): FindOptions<Quote> & { include?: Includeable[] } {
    if (!author) {
      return {}
    }

    return {
      where: {
        [Op.and]: [
          {
            '$author.slug$': Author.getSlug(author),
          },
        ],
      },
      include: [
        {
          model: Author,
          required: true,
        },
      ],
    }
  }

  private filterByTags(
    tags?: string,
  ): FindOptions<Quote> & { include?: Includeable[] } {
    if (!tags) {
      return {}
    }

    if (tags.includes('|')) {
      const tagsList: string[] = tags.split('|')

      return {
        include: [
          {
            model: Tag,
            as: Tag.tableName,
            where: {
              name: {
                [Op.in]: tagsList,
              },
            },
            required: true,
          },
        ],
      }
    }

    const tagsList: string[] = tags.split(',')

    // Ensuing that each quote must have all tags
    const tagConditions = tagsList.map((tag) =>
      Sequelize.literal(`EXISTS (
        SELECT 1 FROM tags
        INNER JOIN quote_tags ON "tags"."id" = "quote_tags"."tagId"
        WHERE "quote_tags"."quoteId" = "Quote"."id"
        AND "tags"."name" = ${this.sequelize.escape(tag)}
      )`),
    )

    return {
      include: [
        {
          model: Tag,
          as: Tag.tableName,
          required: true,
          where: {
            [Op.and]: tagConditions,
          },
        },
      ],
    }
  }
}
