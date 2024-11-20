import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetRandomQuoteService } from './get_random_quote.service'

@ApiTags('Quotes')
@Controller('api/quotes')
export class QuoteController {
  constructor(private readonly randomQuoteService: GetRandomQuoteService) {}

  @Get('random')
  async random() {
    return await this.randomQuoteService.handle()
  }
}
