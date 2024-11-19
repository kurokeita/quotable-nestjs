import { CreationOptional } from 'sequelize'
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  Scopes,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { Author } from '../author/author.entity'
import { QuoteTag } from '../tag/quote_tag.entity'
import { Tag } from '../tag/tag.entity'

@DefaultScope(() => ({
  include: [
    Author,
    {
      model: Tag,
      through: { attributes: [] },
    },
  ],
}))
@Scopes(() => ({
  random: {
    order: Sequelize.literal('rand()'),
  },
}))
@Table({ tableName: 'quotes' })
export class Quote extends Model<Quote> {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number

  @Column({ type: DataType.STRING })
  content: string

  @ForeignKey(() => Author)
  @Column({ type: DataType.BIGINT.UNSIGNED })
  authorId: number

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

  @BelongsTo(() => Author, 'authorId')
  author: Author

  @BelongsToMany(() => Tag, () => QuoteTag)
  tags: Array<Tag & { QuoteTag: QuoteTag }>
}
