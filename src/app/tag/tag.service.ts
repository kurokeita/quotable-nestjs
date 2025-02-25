import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { Transaction } from '../../db/index'
import { Quote } from '../../db/schema/quote.schema'
import { QuoteTag } from '../../db/schema/tag.schema'
import { IndexTagDto, TagDto } from './tag.dto'
import { TagRepository } from './tag.repository'

@Injectable()
export class TagService {
	constructor(private tagRepository: TagRepository) {}

	async index(request: IndexTagDto): Promise<TagDto[]> {
		const tags = await this.tagRepository.index(request)

		return tags.map((t) => plainToInstance(TagDto, t))
	}

	async sync(quote: Quote, tags?: string[], options: { transaction?: Transaction } = {}): Promise<Quote> {
		if (tags === undefined) {
			return quote
		}

		if (tags.length === 0) {
			await this.tagRepository.deleteAllQuoteTags(quote.id, options)

			return quote
		}

		const orginalQuoteTags = await this.tagRepository.getQuoteTags(quote.id, options)

		const upsertedTags = await this.tagRepository.upsertMultiple(tags, options)

		const newTags = upsertedTags.filter((t) => t.id !== null)
		const existedTagNames = upsertedTags.filter((t) => t.id === null).map((t) => t.name)

		const existedTags = await this.tagRepository.getByNames(existedTagNames, {
			transaction: options.transaction,
		})

		const quoteTagsToBeInserted = [...newTags, ...existedTags].map((t) => ({
			quoteId: quote.id,
			tagId: t.id,
		}))
		const quoteTagsMap = new Map(quoteTagsToBeInserted.map((t) => [`${t.quoteId}.${t.tagId}`, t]))

		await this.tagRepository.bulkUpsertQuoteTags(quoteTagsToBeInserted, {
			transaction: options.transaction,
		})

		const quoteTagsToBeDeleted = orginalQuoteTags.filter((t) => !quoteTagsMap.has(`${t.quoteId}.${t.tagId}`))

		if (quoteTagsToBeDeleted.length) {
			await this.tagRepository.bulkDeleteQuoteTags(quoteTagsToBeDeleted, options)
		}

		return quote
	}

	async bulkSync(quoteTags: Map<string, string[]>, options: { transaction?: Transaction } = {}): Promise<void> {
		const tags = [...new Set(Array.from(quoteTags.values()).flat())]

		const upsertedResult = await this.tagRepository.upsertMultiple(tags, {
			transaction: options.transaction,
		})
		const upsertedMap = new Map(upsertedResult.map((t) => [t.name, t]))

		const newTags = upsertedResult.filter((t) => t.id)
		const existedTagNames = tags.filter((t) => !upsertedMap.has(t))

		const existedTags = await this.tagRepository.getByNames(existedTagNames, {
			transaction: options.transaction,
		})

		const tagsMap = new Map(newTags.concat(existedTags).map((t) => [t.name, t.id]))

		const dataToSync: QuoteTag[] = []
		quoteTags.forEach((tags, quoteId) => {
			dataToSync.push(...tags.map((t) => ({ quoteId: quoteId, tagId: tagsMap.get(t) }) as QuoteTag))
		})

		await this.tagRepository.bulkUpsertQuoteTags(
			dataToSync.filter((t) => t.tagId && t.quoteId),
			{
				transaction: options.transaction,
			},
		)
	}
}
