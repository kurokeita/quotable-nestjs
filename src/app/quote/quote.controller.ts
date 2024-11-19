import { Controller, Get } from '@nestjs/common'
import { GetRandomQuoteService } from './get_random_quote.service'

@Controller('api/quotes')
export class QuoteController {
  constructor(private readonly randomQuoteService: GetRandomQuoteService) {}

  @Get('random')
  async random() {
    return await this.randomQuoteService.handle()
  }
}
