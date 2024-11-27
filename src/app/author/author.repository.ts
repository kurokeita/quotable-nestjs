import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { OrderEnum } from '../../enums/order.enum'
import PaginatedResponse from '../../interfaces/paginated_response.interface'
import { CreateAuthorDto, IndexAuthorsDto, UpdateAuthorDto } from './author.dto'
import { Author } from './author.entity'

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

  constructor(
    @InjectModel(Author)
    private readonly authorModel: typeof Author,
  ) {}

  async getById(
    id: number,
    options: { findOrFail: true; transaction?: Transaction },
  ): Promise<Author>
  async getById(
    id: number,
    options?: { findOrFail?: false; transaction?: Transaction },
  ): Promise<Author | null>
  async getById(
    id: number,
    options: { findOrFail?: boolean; transaction?: Transaction } = {},
  ): Promise<Author | null> {
    const { findOrFail = false, transaction } = options

    const author = await this.authorModel
      .scope('withQuotesCount')
      .findByPk(id, { transaction: transaction })

    if (findOrFail && !author) {
      throw new UnprocessableEntityException(`Author with ID ${id} not found`)
    }

    return author
  }

  async getByIds(
    ids: number[],
    options: { transaction?: Transaction } = {},
  ): Promise<Author[]> {
    return await this.authorModel.findAll({
      where: { id: ids },
      transaction: options.transaction,
    })
  }

  async getBySlug(
    slug: string,
    options: { findOrFail: true; transaction?: Transaction },
  ): Promise<Author>
  async getBySlug(
    slug: string,
    options?: { findOrFail?: false; transaction?: Transaction },
  ): Promise<Author | null>
  async getBySlug(
    slug: string,
    options: { findOrFail?: boolean; transaction?: Transaction } = {},
  ): Promise<Author | null> {
    const { findOrFail = false, transaction } = options

    const author = await this.authorModel.scope('withQuotesCount').findOne({
      where: { slug: Author.getSlug(slug) },
      transaction: transaction,
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
    return await this.authorModel.findAll({
      where: { slug: { [Op.in]: slugs.map((slug) => Author.getSlug(slug)) } },
      transaction: options.transaction,
    })
  }

  async create(
    input: CreateAuthorDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Author> {
    return await this.authorModel.create<Author>(
      {
        name: input.name,
        slug: Author.getSlug(input.name),
        description: input.description,
        bio: input.bio,
        link: input.link,
      },
      { transaction: options.transaction },
    )
  }

  async bulkUpsert(
    input: CreateAuthorDto[],
    options: { transaction: Transaction },
  ): Promise<Author[]> {
    return await this.authorModel.bulkCreate(
      input.map((i) => ({
        name: i.name,
        slug: Author.getSlug(i.name),
        description: i.description,
        bio: i.bio,
        link: i.link,
      })),
      { transaction: options.transaction, ignoreDuplicates: true },
    )
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

    await author.update(
      {
        description: input.description ?? author.description,
        bio: input.bio ?? author.bio,
        link: input.link ?? author.link,
      },
      { transaction: transaction },
    )

    return author
  }

  async delete(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Author> {
    const author = (await this.getById(id, {
      findOrFail: true,
      transaction: options.transaction,
    })) as Author

    await author.destroy({ transaction: options.transaction })

    return author
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

    const { count, rows } = await this.authorModel
      .scope('withQuotesCount')
      .findAndCountAll({
        limit,
        offset: limit * page,
        order: [[sortBy, order]],
        transaction: options.transaction,
        distinct: true,
        col: 'Author.id',
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
    } as PaginatedResponse<Author>
  }
}
