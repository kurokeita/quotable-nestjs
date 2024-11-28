import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiHeader, ApiTags } from '@nestjs/swagger'
import {
  CreateQuoteDto,
  GetRandomQuoteDto,
  GetRandomQuotesDto,
  IndexQuotesDto,
  UpdateQuoteDto,
} from './quote.dto'
import { QuoteService } from './quote.service'

@ApiTags('Quotes')
@Controller('api/quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get('random')
  async random(@Query() request: GetRandomQuoteDto) {
    return {
      quote: await this.quoteService.getRandomQuote(request),
    }
  }

  @Get('random/quotes')
  async randomQuotes(@Query() request: GetRandomQuotesDto) {
    return {
      quotes: await this.quoteService.getRandomQuotes(request),
    }
  }

  @Get()
  async index(@Query() request: IndexQuotesDto) {
    return await this.quoteService.index(request)
  }

  @Post()
  @ApiHeader({
    name: 'x-api-key',
    description: 'the resource manipulation api key',
    required: true,
  })
  async create(@Body() request: CreateQuoteDto) {
    return await this.quoteService.create(request)
  }

  @Patch(':id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'the resource manipulation api key',
    required: true,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateQuoteDto,
  ) {
    return await this.quoteService.update(id, request)
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.quoteService.getById(id)
  }

  @Delete(':id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'the resource manipulation api key',
    required: true,
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.quoteService.delete(id)

    return {
      success: true,
    }
  }
}
