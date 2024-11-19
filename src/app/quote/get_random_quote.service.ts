import { Injectable } from '@nestjs/common'
import { Quote } from './quote.entity'
import { QuoteRepository } from './quote.repository'

@Injectable()
export class GetRandomQuoteService {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async handle(): Promise<Quote | null> {
    return await this.quoteRepository.random()
  }
}
