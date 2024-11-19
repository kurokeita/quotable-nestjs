import { Module } from '@nestjs/common'
import { AuthorController } from './author.controller'
import { AuthorRepository } from './author.repository'
import { AuthorService } from './author.service'
import { GetAuthorByIdService } from './get_author_by_id.service'
import { GetAuthorBySlugService } from './get_author_by_slug.service'

@Module({
  imports: [],
  controllers: [AuthorController],
  providers: [
    AuthorRepository,
    AuthorService,
    GetAuthorByIdService,
    GetAuthorBySlugService,
  ],
})
export class AuthorModule {}
