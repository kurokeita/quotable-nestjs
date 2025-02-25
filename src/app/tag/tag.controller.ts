import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IndexTagDto } from './tag.dto'
import { TagService } from './tag.service'

@ApiTags('Tags')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/api/tags')
export class TagController {
	constructor(private readonly tagService: TagService) {}

	@Get()
	async index(@Query() request: IndexTagDto) {
		return await this.tagService.index(request)
	}
}
