import { Controller, Get, Param } from '@nestjs/common'
import { GetAuthorByIdService } from './get_author_by_id.service'
import { GetAuthorBySlugService } from './get_author_by_slug.service'

@Controller('api/authors')
export class AuthorController {
  constructor(
    private readonly getByIdService: GetAuthorByIdService,
    private readonly getBySlugService: GetAuthorBySlugService,
  ) {}

  @Get('/:id')
  async getAuthorById(@Param('id') id: number) {
    return await this.getByIdService.handle(Number(id))
  }

  @Get('/slug/:slug')
  async getAuthorBySlug(@Param('slug') slug: string) {
    return await this.getBySlugService.handle(slug)
  }
}
