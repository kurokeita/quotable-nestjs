import { Injectable } from '@nestjs/common'
import { AuthorRepository } from './author.repository'

@Injectable()
export class GetAuthorByIdService {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async handle(id: number) {
    return await this.authorRepository.getById(id)
  }
}
