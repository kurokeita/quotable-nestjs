import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import Transaction from 'sequelize/types/transaction'
import { IndexTagDto } from './tag.dto'
import { Tag } from './tag.entity'

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

  constructor(
    @InjectModel(Tag)
    private readonly tagModel: typeof Tag,
  ) {}

  async getByNames(
    names: string[],
    options: { transaction?: Transaction } = {},
  ): Promise<Tag[]> {
    return (
      (await this.tagModel.findAll({
        where: {
          name: {
            [Op.in]: names,
          },
        },
        transaction: options.transaction,
      })) ?? []
    )
  }

  async upsertMultiple(
    names: string[],
    options: { transaction?: Transaction } = {},
  ): Promise<Tag[]> {
    return await this.tagModel.bulkCreate(
      names.map((name) => ({ name })),
      {
        transaction: options.transaction,
        fields: ['name'],
        updateOnDuplicate: ['name'],
      },
    )
  }

  async index(
    input: IndexTagDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Tag[]> {
    const { sortBy = this.DEFAULT_SORT_BY, order = this.DEFAULT_ORDER } = input

    return await this.tagModel.scope('withQuotesCount').findAll({
      order: [[sortBy, order]],
      transaction: options.transaction,
    })
  }
}
