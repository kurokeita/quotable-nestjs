import { Injectable } from '@nestjs/common'
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus'
import { getClient } from './index'

@Injectable()
export class DbHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await getClient().execute('SELECT 1')

      return this.getStatus(key, true)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new HealthCheckError(
        'Database is not available',
        this.getStatus(key, false),
      )
    }
  }
}
