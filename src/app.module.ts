import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthorModule } from './app/author/author.module'
import { HealthModule } from './app/health/health.module'
import { ResourceManipulationMiddleware } from './app/middlewares/resource_manipulation.middleware'
import { QuoteModule } from './app/quote/quote.module'
import { TagModule } from './app/tag/tag.module'
import { UploadModule } from './app/upload/upload.module'
import appConfig from './config/app.config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig],
		}),
		HealthModule,
		AuthorModule,
		QuoteModule,
		TagModule,
		UploadModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(ResourceManipulationMiddleware)
			.forRoutes(
				{ path: '*', method: RequestMethod.POST },
				{ path: '*', method: RequestMethod.PATCH },
				{ path: '*', method: RequestMethod.DELETE },
			)
	}
}
