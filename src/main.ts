import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

declare const module: any

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.enableCors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
	const configService = app.get(ConfigService)

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		}),
	)

	if (configService.get<boolean>('app.resource_protection')) {
		const resourceManipulationKey = configService.getOrThrow<string>('app.resource_manipulation_api_key')

		if (resourceManipulationKey.length < 32) {
			throw new Error('resource_manipulation_api_key must be at least 32 characters long')
		}
	}

	const config = new DocumentBuilder()
		.setTitle('Quotable API')
		.setVersion('1.0')
		.setExternalDoc('GitHub Repository', 'https://github.com/kurokeita/quotable-nestjs')
		.build()
	const documentFactory = () => SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('/', app, documentFactory, {
		customJs: [
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
		],
		customCssUrl: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css'],
		customfavIcon: 'https://raw.githubusercontent.com/kurokeita/quotable-nestjs/refs/heads/main/public/favicon.png',
	})

	await app.listen(configService.getOrThrow<number>('app.port'), '0.0.0.0')

	if (module.hot) {
		module.hot.accept()
		module.hot.dispose(() => app.close())
	}
}
bootstrap()
