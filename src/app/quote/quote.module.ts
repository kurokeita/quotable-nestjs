import { Module } from '@nestjs/common'
import { AuthorModule } from '../author/author.module'
import { TagModule } from '../tag/tag.module'
import { QuoteController } from './quote.controller'
import { QuoteRepository } from './quote.repository'
import { QuoteService } from './quote.service'

@Module({
  imports: [AuthorModule, TagModule],
  controllers: [QuoteController],
  providers: [QuoteRepository, QuoteService],
  exports: [AuthorModule, TagModule, QuoteRepository, QuoteService],
})
export class QuoteModule {}
