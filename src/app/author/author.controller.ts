import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiHeader, ApiTags } from '@nestjs/swagger'
import { CreateAuthorDto, IndexAuthorsDto, UpdateAuthorDto } from './author.dto'
import { AuthorService } from './author.service'

@ApiTags('Authors')
@Controller('api/authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get('/:id')
  async getAuthorById(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.getById(id)
  }

  @Get('/slug/:slug')
  async getAuthorBySlug(@Param('slug') slug: string) {
    return await this.authorService.getBySlug(slug)
  }

  @Get('/')
  async index(@Query() request: IndexAuthorsDto) {
    return await this.authorService.index(request)
  }

  @Post('/')
  @ApiHeader({
    name: 'x-api-key',
    description: 'the resource manipulation api key',
    required: true,
  })
  async create(@Body() request: CreateAuthorDto) {
    return await this.authorService.create(request)
  }

  @Patch('/:id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'the resource manipulation api key',
    required: true,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateAuthorDto,
  ) {
    return await this.authorService.update(id, request)
  }

  @Delete('/:id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'the resource manipulation api key',
    required: true,
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.delete(id)
  }
}
