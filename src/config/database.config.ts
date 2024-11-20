import { registerAs } from '@nestjs/config'
import { SequelizeModuleAsyncOptions } from '@nestjs/sequelize'
import { Author } from 'src/app/author/author.entity'
import { Quote } from 'src/app/quote/quote.entity'
import { QuoteTag } from 'src/app/tag/quote_tag.entity'
import { Tag } from 'src/app/tag/tag.entity'

export default registerAs(
  'database',
  (): SequelizeModuleAsyncOptions =>
    ({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Author, Quote, Tag, QuoteTag],
      autoLoadModels: true,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    }) as SequelizeModuleAsyncOptions,
)
