import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Quote } from './quote.entity'

@Injectable()
export class QuoteRepository {
  constructor(
    @InjectModel(Quote)
    private readonly quoteModel: typeof Quote,
  ) {}

  async random(): Promise<Quote | null> {
    return await this.quoteModel.scope(['defaultScope', 'random']).findOne()
  }
}
