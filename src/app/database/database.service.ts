import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DatabaseService {
  constructor(private readonly configService: ConfigService) {}

  getDialect(): string {
    return this.configService.getOrThrow<string>('database.dialect')
  }

  random(): string {
    switch (this.getDialect()) {
      case 'mysql':
        return 'RAND()'
      case 'postgres':
        return 'RANDOM()'
      default:
        throw new Error(`Unsupported dialect: ${this.getDialect()}`)
    }
  }
}
