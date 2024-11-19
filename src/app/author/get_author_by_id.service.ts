import { Injectable } from '@nestjs/common'
import { AuthorService } from './author.service'

@Injectable()
export class GetAuthorByIdService extends AuthorService {
  async handle(id: number) {
    return await this.authorRepository.getById(id)
  }
}
