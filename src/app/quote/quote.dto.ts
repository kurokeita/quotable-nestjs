import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator'
import * as _ from 'lodash'
import { OrderEnum } from '../../enums/order.enum'
import { PagingLimitEnum } from '../../enums/paging_limit.enum'
import { AuthorSortByEnum } from '../author/author.repository'
import { QuoteSortByEnum } from './quote.repository'

export class IndexQuotesDto {
  @IsEnum(AuthorSortByEnum)
  @IsOptional()
  @ApiPropertyOptional({
    enum: Object.keys(AuthorSortByEnum).map((k) => _.camelCase(_.toLower(k))),
  })
  @Transform(({ value }) => {
    if (!value) return value

    return AuthorSortByEnum[
      _.toUpper(_.snakeCase(value)) as keyof typeof AuthorSortByEnum
    ]
  })
  sortBy: QuoteSortByEnum

  @IsEnum(OrderEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: Object.values(OrderEnum) })
  order: OrderEnum

  @IsIn(PagingLimitEnum)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ enum: PagingLimitEnum })
  limit: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ minimum: 0 })
  page: number

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  author: string

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ minimum: 0 })
  minLength: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ minimum: 0 })
  maxLength: number

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  query: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  tags: string
}

export class GetRandomQuotesDto extends OmitType(IndexQuotesDto, [
  'page',
] as const) {}

export class GetRandomQuoteDto extends OmitType(IndexQuotesDto, [
  'page',
  'limit',
  'order',
  'sortBy',
] as const) {}

export class CreateQuoteDto {
  @IsString()
  @ApiProperty()
  content: string

  @IsString()
  @ValidateIf((o) => o.authorId === undefined || o.authorId === null)
  @ApiProperty()
  author?: string

  @IsInt()
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
  tags: string[]
}

export class UpdateQuoteDto extends OmitType(CreateQuoteDto, [
  'authorId',
  'author',
] as const) {}
