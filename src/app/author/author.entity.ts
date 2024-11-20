import { CreationOptional } from 'sequelize'
import {
  Column,
  DataType,
  HasMany,
  Index,
  Model,
  Scopes,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import slugify from 'slugify'
import { Quote } from '../quote/quote.entity'

@Scopes(() => ({
  withQuotesCount: {
    include: [
      {
        model: Quote.unscoped(),
        attributes: [],
        duplicating: false,
      },
    ],
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('quotes.id')), 'quotesCount'],
      ],
    },
    having: Sequelize.literal('Author.id IS NOT NULL'), // Make sure that we don't get this kind of Author instance `{id: null, name: null, ..., quotesCount: 0}`
    group: ['Author.id'],
  },
}))
@Table({ tableName: 'authors', paranoid: true })
export class Author extends Model {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number

  @Column(DataType.STRING)
  name: string

  @Index({ name: 'unique-slug', unique: true })
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  slug: string

  @Column(DataType.STRING)
  description?: string

  @Column(DataType.STRING)
  bio?: string

  @Column(DataType.STRING)
  link?: string

  @Column({
    type: DataType.DATE(6),
    defaultValue: DataType.NOW,
  })
  createdAt: CreationOptional<Date>

  @Column({
    type: DataType.DATE(6),
    defaultValue: DataType.NOW,
  })
  updatedAt: CreationOptional<Date>

  @Column({
    type: DataType.DATE(6),
    defaultValue: null,
  })
  deletedAt?: CreationOptional<Date>

  @HasMany(() => Quote, 'authorId')
  quotes: Quote[]

  @Column({
    type: DataType.VIRTUAL(DataType.INTEGER),
  })
  quotesCount: number

  static getSlug = (name: string) => slugify(name, { lower: true })
}
