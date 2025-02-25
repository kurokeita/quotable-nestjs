import { Module } from '@nestjs/common'
import { AuthorService } from '../author/author.service'
import { QuoteModule } from '../quote/quote.module'
import { QuoteService } from '../quote/quote.service'
import { TagService } from '../tag/tag.service'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Module({
	imports: [QuoteModule],
	controllers: [UploadController],
	providers: [UploadService, AuthorService, QuoteService, TagService],
	exports: [],
})
export class UploadModule {}
