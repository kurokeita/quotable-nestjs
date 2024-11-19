import { OmitType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { OrderEnum } from 'src/enums/order.enum'
import { AuthorSortByEnum } from './author.repository'

export class IndexAuthorsDto {
  @IsIn([10, 25, 50, 100])
  @IsOptional()
  @Type(() => Number)
  limit: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  page: number

  @IsEnum(AuthorSortByEnum)
  @IsOptional()
  sortBy: AuthorSortByEnum

  @IsEnum(OrderEnum)
  @IsOptional()
  order: OrderEnum
}

export class CreateAuthorDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description: string

  @IsString()
  @IsOptional()
  bio: string

  @IsString()
  @IsOptional()
  link: string
}

export class UpdateAuthorDto extends OmitType(CreateAuthorDto, [
  'name',
] as const) {}
