import { CreationOptional } from 'sequelize'
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { Author } from '../author/author.entity'
import { QuoteTag } from '../tag/quote_tag.entity'
import { Tag } from '../tag/tag.entity'

@DefaultScope(() => ({
  include: [
    {
      model: Author,
    },
    {
      model: Tag,
      through: { attributes: [] },
    },
  ],
}))
@Table({ tableName: 'quotes', paranoid: true })
export class Quote extends Model<Partial<Quote>> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number

  @Column({
    type: DataType.TEXT,
  })
  content: string

  @ForeignKey(() => Author)
  @Column({ type: DataType.BIGINT })
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

  toJSON(): { [key: string]: any } {
    const values = { ...this.get() }

    delete values.deletedAt

    return values
  }
}
