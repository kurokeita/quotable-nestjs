import { Module } from '@nestjs/common'
import { AuthorController } from './author.controller'
import { AuthorRepository } from './author.repository'
import { AuthorService } from './author.service'

@Module({
	imports: [],
	controllers: [AuthorController],
	providers: [AuthorRepository, AuthorService],
	exports: [AuthorRepository, AuthorService],
})
export class AuthorModule {}
