import { registerAs } from '@nestjs/config'
import { SequelizeModuleAsyncOptions } from '@nestjs/sequelize'
import mysql2 from 'mysql2'
import { Author } from '../app/author/author.entity'
import { Quote } from '../app/quote/quote.entity'
import { QuoteTag } from '../app/tag/quote_tag.entity'
import { Tag } from '../app/tag/tag.entity'

export default registerAs(
  'database',
  (): SequelizeModuleAsyncOptions =>
    ({
      dialect: 'mysql',
      dialectModule: mysql2,
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
