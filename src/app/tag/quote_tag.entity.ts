import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Quote } from '../quote/quote.entity'
import { Tag } from './tag.entity'

@Table({ tableName: 'quote_tags', timestamps: false })
export class QuoteTag extends Model<QuoteTag> {
  @ForeignKey(() => Quote)
  @Column
  quoteId: number

  @ForeignKey(() => Tag)
  @Column
  tagId: number
}
