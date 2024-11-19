import { CreationOptional } from 'sequelize'
import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript'
import { Quote } from '../quote/quote.entity'
import { QuoteTag } from './quote_tag.entity'

@Table({ tableName: 'tags', paranoid: true })
export class Tag extends Model<Tag> {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number

  @Column(DataType.STRING)
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
}
