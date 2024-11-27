import { Injectable } from '@nestjs/common'
import Transaction from 'sequelize/types/transaction'
import { Quote } from '../quote/quote.entity'
import { QuoteTag } from './quote_tag.entity'
import { IndexTagDto } from './tag.dto'
import { Tag } from './tag.entity'
import { TagRepository } from './tag.repository'

@Injectable()
export class TagService {
  constructor(private tagRepository: TagRepository) {}

  async index(request: IndexTagDto): Promise<Tag[]> {
    return await this.tagRepository.index(request)
  }

  async sync(
    quote: Quote,
    tags: string[],
    options: { t?: Transaction } = {},
  ): Promise<Quote> {
    const upsertedTags = await this.tagRepository.upsertMultiple(tags, {
      transaction: options.t,
    })

    const newTags = upsertedTags.filter((t) => t.id !== null)
    const existedTagNames = upsertedTags
      .filter((t) => t.id === null)
      .map((t) => t.name)

    const existedTags = await this.tagRepository.getByNames(existedTagNames, {
      transaction: options.t,
    })

    await quote.$set('tags', [...newTags, ...existedTags], {
      transaction: options.t,
    })

    return quote
  }

  async bulkSync(
    quoteTags: Map<number, string[]>,
    options: { transaction?: Transaction } = {},
  ): Promise<void> {
    const tags = Array.from(quoteTags.values()).flat()

    const upsertedResult = await this.tagRepository.upsertMultiple(tags, {
      transaction: options.transaction,
    })

    const newTags = upsertedResult.filter((t) => t.id)
    const existedTagNames = upsertedResult
      .filter((t) => !t.id)
      .map((t) => t.name)

    const existedTags = await this.tagRepository.getByNames(existedTagNames, {
      transaction: options.transaction,
    })

    const tagsMap = new Map(
      newTags.concat(existedTags).map((t) => [t.name, t.id]),
    )

    const dataToSync: QuoteTag[] = []
    quoteTags.forEach((tags, quoteId) => {
      dataToSync.push(
        ...tags.map(
          (t) => ({ quoteId: quoteId, tagId: tagsMap.get(t) }) as QuoteTag,
        ),
      )
    })

    await this.tagRepository.bulkUpsertQuoteTags(dataToSync, {
      transaction: options.transaction,
    })
  }
}
