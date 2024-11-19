import { Injectable } from '@nestjs/common'
import { AuthorRepository } from './author.repository'

@Injectable()
export class AuthorService {
  constructor(protected readonly authorRepository: AuthorRepository) {}
}
