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
  },
}))
@Table({ tableName: 'authors' })
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
  description: string

  @Column(DataType.STRING)
  bio: string

  @Column(DataType.STRING)
  link: string

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
}
