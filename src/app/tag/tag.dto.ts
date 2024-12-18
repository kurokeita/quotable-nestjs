import { ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import * as _ from 'lodash'
import { Tag } from '../../db/schema/tag.schema'
import { OrderEnum } from '../../enums/order.enum'
import { TagSortByEnum } from './tag.repository'

export class IndexTagDto {
  @IsEnum(TagSortByEnum)
  @IsOptional()
  @ApiPropertyOptional({
    enum: Object.keys(TagSortByEnum).map((k) => _.camelCase(_.toLower(k))),
  })
  @Transform(({ value }) => {
    if (!value) return value

    return TagSortByEnum[
      _.toUpper(_.snakeCase(value)) as keyof typeof TagSortByEnum
    ]
  })
  sortBy?: TagSortByEnum

  @IsEnum(OrderEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: Object.values(OrderEnum) })
  order?: OrderEnum
}

export class TagDto implements Tag {
  @Exclude()
  id: number
  uuid: string
  name: string
  @Exclude()
  createdAt: string
  @Exclude()
  updatedAt: string
  @Exclude()
  deletedAt: string | null
  quotesCount: number
}
