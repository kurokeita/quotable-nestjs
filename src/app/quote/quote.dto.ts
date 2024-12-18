import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Exclude, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator'
import * as _ from 'lodash'
import { Quote } from '../../db/schema/quote.schema'
import { OrderEnum } from '../../enums/order.enum'
import { PagingLimitEnum } from '../../enums/paging_limit.enum'
import { AuthorDto } from '../author/author.dto'
import { TagDto } from '../tag/tag.dto'
import { QuoteSortByEnum } from './quote.repository'

export class IndexQuotesDto {
  @IsEnum(QuoteSortByEnum)
  @IsOptional()
  @ApiPropertyOptional({
    enum: Object.keys(QuoteSortByEnum).map((k) => _.camelCase(_.toLower(k))),
  })
  @Transform(({ value }) => {
    if (!value) return value

    return QuoteSortByEnum[
      _.toUpper(_.snakeCase(value)) as keyof typeof QuoteSortByEnum
    ]
  })
  sortBy?: QuoteSortByEnum

  @IsEnum(OrderEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: Object.values(OrderEnum) })
  order?: OrderEnum

  @IsIn(PagingLimitEnum)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ enum: PagingLimitEnum })
  limit?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ minimum: 0 })
  page?: number

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  author?: string

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ minimum: 0 })
  minLength?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ minimum: 0 })
  maxLength?: number

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  query?: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  tags?: string
}

export class GetRandomQuotesDto extends OmitType(IndexQuotesDto, [
  'page',
] as const) {}

export class CreateQuoteDto {
  @IsString()
  @ApiProperty()
  @IsDefined()
  content: string

  @IsString()
  @IsDefined()
  @ValidateIf((o) => o.authorId === undefined || o.authorId === null)
  @ApiProperty()
  author?: string

  @IsInt()
  @IsDefined()
  @ValidateIf((o) => o.author === undefined || o.author === null)
  @ApiProperty()
  authorId?: number

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',')
    }
    return value
  })
  @ApiPropertyOptional()
  tags?: string[]
}

export class UpdateQuoteDto extends OmitType(CreateQuoteDto, [
  'authorId',
  'author',
] as const) {}

export class QuoteDto implements Quote {
  @Exclude()
  id: number
  uuid: string
  @Exclude()
  authorId: number
  content: string
  @Exclude()
  createdAt: string
  @Exclude()
  updatedAt: string
  @Exclude()
  deletedAt: string | null
  @Type(() => AuthorDto)
  author: AuthorDto
  @Type(() => TagDto)
  tags: TagDto[]
}
