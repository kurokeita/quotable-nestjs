import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { Sequelize } from 'sequelize-typescript'
import { CreateAuthorDto } from '../author/author.dto'
import { AuthorService } from '../author/author.service'
import { CreateQuoteDto } from '../quote/quote.dto'
import { QuoteService } from '../quote/quote.service'
import { TagService } from '../tag/tag.service'
import { UploadContentDto } from './upload.dto'

export interface BulkCreateResult {
  input: number
  created: number
  skipped: number
  skippedData: Array<CreateAuthorDto | CreateQuoteDto>
}

@Injectable()
export class UploadService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly authorService: AuthorService,
    private readonly quoteService: QuoteService,
    private readonly tagService: TagService,
  ) {}

  async upload(
    file: Express.Multer.File,
  ): Promise<{ authors: BulkCreateResult; quotes: BulkCreateResult }> {
    const content = JSON.parse(file.buffer.toString())
    const uploadContentDto = plainToInstance(UploadContentDto, content)
    const authors = uploadContentDto.authors?.filter((i) => i.name) ?? []
    const quotes =
      uploadContentDto.quotes?.filter(
        (i) => i.content && (i.author || i.authorId),
      ) ?? []

    if (authors.length === 0 || quotes.length === 0) {
      return {
        authors: { input: 0, created: 0, skipped: 0, skippedData: [] },
        quotes: { input: 0, created: 0, skipped: 0, skippedData: [] },
      }
    }

    const t = await this.sequelize.transaction()

    try {
      await t.commit()

      return {
        authors: { input: 0, created: 0, skipped: 0, skippedData: [] },
        quotes: { input: 0, created: 0, skipped: 0, skippedData: [] },
      }
    } catch (e) {
      await t.rollback()
      throw e
    }
  }
}
