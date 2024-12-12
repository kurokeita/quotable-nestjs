import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import {
  and,
  asc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
} from 'drizzle-orm'
import {
  Author,
  authors,
  getAuthorSlug,
  NewAuthor,
} from '../..//db/schema/author.schema'
import { getClient, Transaction } from '../../db'
import { quotes } from '../../db/schema/quote.schema'
import { OrderEnum } from '../../enums/order.enum'
import PaginatedResponse from '../../interfaces/paginated_response.interface'
import { CreateAuthorDto, IndexAuthorsDto, UpdateAuthorDto } from './author.dto'

export enum AuthorSortByEnum {
  NAME = 'name',
  QUOTES_COUNT = 'quotesCount',
  DATE_CREATED = 'createdAt',
  DATE_MODIFIED = 'updatedAt',
}

@Injectable()
export class AuthorRepository {
  public DEFAULT_SORT_BY = AuthorSortByEnum.DATE_CREATED
  public DEFAULT_ORDER = OrderEnum.ASC
  public DEFAULT_LIMIT = 10
  public DEFAULT_PAGE = 0

  async getById(
    id: number,
    options: { findOrFail: true; transaction?: Transaction },
  ): Promise<Author>
  async getById(
    id: number,
    options?: { findOrFail?: false; transaction?: Transaction },
  ): Promise<Author | undefined>
  async getById(
    id: number,
    options: { findOrFail?: boolean; transaction?: Transaction } = {},
  ): Promise<Author | undefined> {
    const { findOrFail = false, transaction } = options
    const author = await getClient(transaction).query.authors.findFirst({
      where: and(eq(authors.id, id), isNull(authors.deletedAt)),
    })

    if (findOrFail && !author) {
      throw new UnprocessableEntityException(`Author with ID ${id} not found`)
    }

    return author
  }

  async getByIds(
    ids: number[],
    options: { transaction?: Transaction } = {},
  ): Promise<Author[]> {
    return await getClient(options.transaction)
      .select()
      .from(authors)
      .where(and(inArray(authors.id, ids), isNull(authors.deletedAt)))
  }

  async getBySlug(
    slug: string,
    options: { findOrFail: true; transaction?: Transaction },
  ): Promise<Author>
  async getBySlug(
    slug: string,
    options?: { findOrFail?: false; transaction?: Transaction },
  ): Promise<Author | undefined>
  async getBySlug(
    slug: string,
    options: { findOrFail?: boolean; transaction?: Transaction } = {},
  ): Promise<Author | undefined> {
    const { findOrFail = false, transaction } = options

    const author = await getClient(transaction).query.authors.findFirst({
      where: and(
        eq(authors.slug, getAuthorSlug(slug)),
        isNull(authors.deletedAt),
      ),
    })

    if (findOrFail && !author) {
      throw new UnprocessableEntityException(
        `Author with slug ${slug} not found`,
      )
    }

    return author
  }

  async getBySlugs(
    slugs: string[],
    options: { transaction?: Transaction } = {},
  ): Promise<Author[]> {
    return await getClient(options.transaction)
      .select()
      .from(authors)
      .where(
        and(
          inArray(
            authors.slug,
            slugs.map((slug) => getAuthorSlug(slug)),
          ),
          isNull(authors.deletedAt),
        ),
      )
  }

  async create(
    input: CreateAuthorDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Author> {
    const data: NewAuthor = {
      name: input.name,
      slug: getAuthorSlug(input.name),
      description: input.description,
      bio: input.bio,
      link: input.link,
    }

    const inserted = await getClient(options.transaction)
      .insert(authors)
      .values(data)
      .returning()

    return inserted[0]
  }

  async bulkUpsert(
    input: CreateAuthorDto[],
    options: { transaction: Transaction },
  ): Promise<Author[]> {
    return await getClient(options.transaction)
      .insert(authors)
      .values(
        input.map((i) => ({
          name: i.name,
          slug: getAuthorSlug(i.name),
          description: i.description,
          bio: i.bio,
          link: i.link,
        })),
      )
      .onConflictDoNothing({ target: authors.slug })
  }

  async update(
    id: number,
    input: UpdateAuthorDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Author> {
    const { transaction } = options
    const author = (await this.getById(id, {
      findOrFail: true,
      transaction: transaction,
    })) as Author

    const result = await getClient(transaction)
      .update(authors)
      .set({
        description: input.description ?? author.description,
        bio: input.bio ?? author.bio,
        link: input.link ?? author.link,
      })
      .where(eq(authors.id, id))
      .returning()

    return result[0]
  }

  async delete(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Author> {
    await this.getById(id, {
      findOrFail: true,
      transaction: options.transaction,
    })

    const result = await getClient(options.transaction)
      .update(authors)
      .set({ deletedAt: sql`now()` })
      .where(eq(authors.id, id))
      .returning()

    return result[0]
  }

  async index(
    input: IndexAuthorsDto,
    options: { transaction?: Transaction } = {},
  ): Promise<PaginatedResponse<Author>> {
    const {
      limit = this.DEFAULT_LIMIT,
      page = this.DEFAULT_PAGE,
      sortBy = this.DEFAULT_SORT_BY,
      order = this.DEFAULT_ORDER,
    } = input

    const client = getClient(options.transaction)

    const [count, rows] = await Promise.all([
      client.$count(authors, isNull(authors.deletedAt)),
      client
        .select({
          ...getTableColumns(authors),
          quotesCount: sql<number>`count(${quotes.id})`
            .mapWith(Number)
            .as('quotesCount'),
        })
        .from(authors)
        .leftJoin(quotes, eq(quotes.authorId, authors.id))
        .where(isNull(authors.deletedAt))
        .orderBy(
          sql`${sql.identifier(sortBy)} ${sql.raw(order)}`,
          asc(authors.id),
        )
        .limit(limit)
        .offset(limit * page)
        .groupBy(authors.id),
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
    } as PaginatedResponse<Author>
  }
}
