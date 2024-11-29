import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Author } from '../author/author.entity'
import { Quote } from '../quote/quote.entity'
import { QuoteTag } from '../tag/quote_tag.entity'
import { Tag } from '../tag/tag.entity'

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Author, Quote, Tag, QuoteTag])],
  providers: [],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
