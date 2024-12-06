import { CreationOptional } from 'sequelize'
import {
  BelongsToMany,
  Column,
  DataType,
  Index,
  Model,
  Scopes,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { Quote } from '../quote/quote.entity'
import { QuoteTag } from './quote_tag.entity'

@Scopes(() => ({
  withQuotesCount: {
    include: [
      {
        model: Quote.unscoped(),
        attributes: [],
        duplicating: false,
        through: { attributes: [] },
      },
    ],
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('quotes.id')), 'quotesCount'],
      ],
    },
    group: ['Tag.id'],
  },
}))
@Table({ tableName: 'tags', paranoid: true })
export class Tag extends Model<Partial<Tag>> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number

  @Column(DataType.STRING)
  @Index({ unique: true })
  name: string

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

  @BelongsToMany(() => Quote, () => QuoteTag)
  quotes: Array<Quote & { QuoteTag: QuoteTag }>

  toJSON(): { [key: string]: any } {
    const values = { ...this.get() }
    delete values.deletedAt
    return values
  }
}
