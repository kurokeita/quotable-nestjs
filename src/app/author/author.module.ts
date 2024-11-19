import { Module } from '@nestjs/common'
import { AuthorController } from './author.controller'
import { AuthorRepository } from './author.repository'
import { GetAuthorByIdService } from './get_author_by_id.service'

@Module({
  imports: [],
  controllers: [AuthorController],
  providers: [AuthorRepository, GetAuthorByIdService],
})
export class AuthorModule {}
