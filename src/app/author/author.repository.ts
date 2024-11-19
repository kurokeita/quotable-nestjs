import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Author } from './author.entity'

@Injectable()
export class AuthorRepository {
  constructor(
    @InjectModel(Author)
    private readonly authorModel: typeof Author,
  ) {}

  async getById(id: number): Promise<Author | null> {
    return await this.authorModel.scope('withQuotesCount').findByPk(id)
  }
}
