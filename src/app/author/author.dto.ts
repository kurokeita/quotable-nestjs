import { ApiProperty, ApiSchema, OmitType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsDefined,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator'
import * as _ from 'lodash'
import { OrderEnum } from '../../enums/order.enum'
import { PagingLimitEnum } from '../../enums/paging_limit.enum'
import { AuthorSortByEnum } from './author.repository'

export class IndexAuthorsDto {
  @IsIn(PagingLimitEnum)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ enum: PagingLimitEnum, required: false })
  limit: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ minimum: 0, required: false })
  page: number

  @IsEnum(AuthorSortByEnum)
  @IsOptional()
  @ApiProperty({
    enum: Object.keys(AuthorSortByEnum).map((k) => _.camelCase(_.toLower(k))),
    required: false,
  })
  @Transform(({ value }) => {
    if (!value) return value

    return AuthorSortByEnum[
      _.toUpper(_.snakeCase(value)) as keyof typeof AuthorSortByEnum
    ]
  })
  sortBy: AuthorSortByEnum

  @IsEnum(OrderEnum)
  @IsOptional()
  @ApiProperty({ enum: Object.values(OrderEnum), required: false })
  order: OrderEnum
}

@ApiSchema({ name: 'Create Author Request' })
export class CreateAuthorDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  name: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  bio: string

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsOptional()
  link: string
}

@ApiSchema({ name: 'Update Author Request' })
export class UpdateAuthorDto extends OmitType(CreateAuthorDto, [
  'name',
] as const) {}
