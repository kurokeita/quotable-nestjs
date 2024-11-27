import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { Sequelize } from 'sequelize-typescript'
import { BulkCreateResult } from 'src/interfaces/bulk_create_result.interface'
import { CreateAuthorDto } from '../author/author.dto'
import { AuthorService } from '../author/author.service'
import { CreateQuoteDto } from '../quote/quote.dto'
import { QuoteService } from '../quote/quote.service'
import { TagService } from '../tag/tag.service'
import { UploadContentDto } from './upload.dto'

@Injectable()
export class UploadService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly authorService: AuthorService,
    private readonly quoteService: QuoteService,
    private readonly tagService: TagService,
  ) {}

  async upload(file: Express.Multer.File): Promise<{
    authors: BulkCreateResult<CreateAuthorDto>
    quotes: BulkCreateResult<CreateQuoteDto>
  }> {
    const content = JSON.parse(file.buffer.toString())
    const uploadContentDto = plainToInstance(UploadContentDto, content)
    const originalCount = {
      authors: uploadContentDto.authors?.length ?? 0,
      quotes: uploadContentDto.quotes?.length ?? 0,
    }

    const authorsInput = uploadContentDto.authors?.filter((i) => i.name) ?? []
    const quotesInput =
      uploadContentDto.quotes?.filter(
        (i) => i.content && (i.author || i.authorId),
      ) ?? []

    if (authorsInput.length === 0 && quotesInput.length === 0) {
      return {
        authors: { input: 0, created: 0, skipped: 0, skippedData: [] },
        quotes: { input: 0, created: 0, skipped: 0, skippedData: [] },
      }
    }

    const t = await this.sequelize.transaction()

    try {
      const createAuthorResult = await this.authorService.bulkCreate(
        authorsInput,
        {
          transaction: t,
        },
      )
      const createQuoteResult = await this.quoteService.bulkCreate(
        quotesInput,
        {
          transaction: t,
        },
      )

      await t.commit()

      return {
        authors: { ...createAuthorResult, input: originalCount.authors },
        quotes: { ...createQuoteResult, input: originalCount.quotes },
      }
    } catch (e) {
      await t.rollback()
      throw e
    }
  }
}
