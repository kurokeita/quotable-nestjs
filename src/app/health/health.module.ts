import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { DbHealthIndicator } from '../../db/db.health'
import { HealthController } from './health.controller'

@Module({
	imports: [TerminusModule],
	controllers: [HealthController],
	providers: [DbHealthIndicator],
})
export class HealthModule {}
