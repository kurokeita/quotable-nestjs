import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { AuthorModule } from './app/author/author.module'
import { DatabaseModule } from './app/database/database.module'
import { HealthModule } from './app/health/health.module'
import { QuoteModule } from './app/quote/quote.module'
import { TagModule } from './app/tag/tag.module'
import { UploadModule } from './app/upload/upload.module'
import appConfig from './config/app.config'
import databaseConfig from './config/database.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    SequelizeModule.forRootAsync(databaseConfig.asProvider()),
    DatabaseModule,
    HealthModule,
    AuthorModule,
    QuoteModule,
    TagModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
