import { Controller, Get, Param } from '@nestjs/common'
import { GetAuthorByIdService } from './get_author_by_id.service'

@Controller('api/authors')
export class AuthorController {
  constructor(private readonly randomAuthorService: GetAuthorByIdService) {}

  @Get('/:id')
  async getAuthorById(@Param('id') id: number) {
    return await this.randomAuthorService.handle(Number(id))
  }
}
