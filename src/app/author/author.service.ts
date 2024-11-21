import { Injectable } from '@nestjs/common'
import Transaction from 'sequelize/types/transaction'
import { BulkCreateResult } from 'src/interfaces/bulk_create_result.interface'
import { CreateAuthorDto, IndexAuthorsDto, UpdateAuthorDto } from './author.dto'
import { AuthorRepository } from './author.repository'

@Injectable()
export class AuthorService {
  constructor(protected readonly authorRepository: AuthorRepository) {}

  async create(input: CreateAuthorDto) {
    return await this.authorRepository.create(input)
  }

  async update(id: number, input: UpdateAuthorDto) {
    return await this.authorRepository.update(id, input)
  }

  async delete(id: number) {
    return await this.authorRepository.delete(id)
  }

  async getBySlug(slug: string) {
    return await this.authorRepository.getBySlug(slug, { findOrFail: true })
  }

  async getById(id: number) {
    return await this.authorRepository.getById(id, { findOrFail: true })
  }

  async index(input: IndexAuthorsDto) {
    return await this.authorRepository.index(input)
  }

  async bulkCreate(
    input: CreateAuthorDto[],
    options: { transaction: Transaction },
  ): Promise<BulkCreateResult<CreateAuthorDto>> {
    // TODO: implement the bulk create logic here

    return {
      input: 0,
      created: 0,
      skipped: 0,
      skippedData: [],
    }
  }
}
