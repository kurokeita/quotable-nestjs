import { CreateAuthorDto } from '../author/author.dto'
import { CreateQuoteDto } from '../quote/quote.dto'

export class UploadContentDto {
	authors?: CreateAuthorDto[]

	quotes: CreateQuoteDto[]
}
