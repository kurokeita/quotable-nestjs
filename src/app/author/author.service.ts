import { Injectable } from '@nestjs/common'
import { Transaction } from '../../db'
import { Author } from '../../db/schema/author.schema'
import { BulkCreateResult } from '../../interfaces/bulk_create_result.interface'
import { CreateAuthorDto, IndexAuthorsDto, UpdateAuthorDto } from './author.dto'
import { AuthorRepository } from './author.repository'

@Injectable()
export class AuthorService {
  public BULK_SIZE = 500

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
    return await this.authorRepository.getBySlug(slug, {
      findOrFail: true,
    })
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
    const chunks = Array.from(
      {
        length: Math.ceil(input.length / this.BULK_SIZE),
      },
      (_, i) => {
        return input.slice(i * this.BULK_SIZE, (i + 1) * this.BULK_SIZE)
      },
    ).filter((chunk) => chunk.length > 0)

    const authors: Author[] = []
    const skippedData: CreateAuthorDto[] = []

    for (const chunk of chunks) {
      const result = await this.authorRepository.bulkUpsert(chunk, options)
      authors.push(...result.filter((a) => a.id))

      skippedData.push(
        ...result
          .filter((a) => !a.id)
          .map(
            (a) =>
              ({
                name: a.name,
                description: a.description,
                bio: a.bio,
                link: a.link,
              }) as CreateAuthorDto,
          ),
      )
    }

    return {
      input: input.length,
      created: authors.length,
      skipped: skippedData.length,
      skippedData: skippedData,
    }
  }

  async getByIds(ids: number[], options: { transaction?: Transaction } = {}) {
    return await this.authorRepository.getByIds(ids, options)
  }

  async getBySlugs(
    slugs: string[],
    options: { transaction?: Transaction } = {},
  ) {
    return await this.authorRepository.getBySlugs(slugs, options)
  }
}
