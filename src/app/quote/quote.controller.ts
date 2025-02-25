import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseInterceptors,
} from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateQuoteDto, GetRandomQuotesDto, IndexQuotesDto, UpdateQuoteDto } from './quote.dto'
import { QuoteService } from './quote.service'

@ApiTags('Quotes')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/quotes')
export class QuoteController {
	constructor(private readonly quoteService: QuoteService) {}

	@ApiOperation({
		summary: 'Get random quote(s)',
		description: 'Returns either a single random quote or multiple random quotes based on the limit parameter',
	})
	@Get('random')
	async random(@Query() request: GetRandomQuotesDto) {
		const { isMultiple, data } = await this.quoteService.getRandom(request)

		return isMultiple ? { quotes: data } : { quote: data }
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
	async update(@Param('id', ParseUUIDPipe) id: string, @Body() request: UpdateQuoteDto) {
		return await this.quoteService.update(id, request)
	}

	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: string) {
		return await this.quoteService.getById(id)
	}

	@Delete(':id')
	@ApiHeader({
		name: 'x-api-key',
		description: 'the resource manipulation api key',
		required: true,
	})
	async delete(@Param('id', ParseUUIDPipe) id: string) {
		await this.quoteService.delete(id)

		return {
			success: true,
		}
	}
}
