import { Injectable } from '@nestjs/common'
import { AuthorService } from './author.service'

@Injectable()
export class GetAuthorBySlugService extends AuthorService {
  async handle(slug: string) {
    return await this.authorRepository.getBySlug(slug)
  }
}
