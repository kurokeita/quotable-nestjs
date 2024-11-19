import { Module } from '@nestjs/common'
import { GetRandomQuoteService } from './get_random_quote.service'
import { QuoteController } from './quote.controller'
import { QuoteRepository } from './quote.repository'

@Module({
  imports: [],
  controllers: [QuoteController],
  providers: [QuoteRepository, GetRandomQuoteService],
})
export class QuoteModule {}
