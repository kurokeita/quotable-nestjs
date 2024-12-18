import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import PaginatedResponse from 'src/interfaces/paginated_response.interface'
import { Transaction } from '../../db'
import { Author } from '../../db/schema/author.schema'
import { BulkCreateResult } from '../../interfaces/bulk_create_result.interface'
import {
  AuthorDto,
  CreateAuthorDto,
  IndexAuthorsDto,
  UpdateAuthorDto,
} from './author.dto'
import { AuthorRepository } from './author.repository'

@Injectable()
export class AuthorService {
  public BULK_SIZE = 500

  constructor(protected readonly authorRepository: AuthorRepository) {}

  async create(input: CreateAuthorDto) {
    const author = await this.authorRepository.create(input)

    return this.convertToAuthorDtos([author])[0]
  }

  async update(uuid: string, input: UpdateAuthorDto) {
    const author = await this.authorRepository.update(uuid, input)

    return this.convertToAuthorDtos([author])[0]
  }

  async delete(uuid: string) {
    const author = await this.authorRepository.delete(uuid)

    return this.convertToAuthorDtos([author])[0]
  }

  async getBySlug(slug: string) {
    const author = await this.authorRepository.getBySlug(slug, {
      findOrFail: true,
    })

    return this.convertToAuthorDtos([author])[0]
  }

  async getByUuid(uuid: string) {
    const author = await this.authorRepository.getByUuid(uuid, {
      findOrFail: true,
    })

    return this.convertToAuthorDtos([author])[0]
  }

  async index(input: IndexAuthorsDto): Promise<PaginatedResponse<AuthorDto>> {
    const result = await this.authorRepository.index(input)

    return {
      data: this.convertToAuthorDtos(result.data),
      metadata: result.metadata,
    }
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

  private convertToAuthorDtos(authors: Author[]): AuthorDto[] {
    return authors.map((a) => plainToInstance(AuthorDto, a))
  }
}
