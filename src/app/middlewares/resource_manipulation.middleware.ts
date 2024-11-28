import { Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class ResourceManipulationMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const headerApiKey = req.header('x-api-key')
    const appUserResourceProtection =
      this.configService.get<boolean>('app.resource_protection') || false
    const appResourceManipulationApiKey = this.configService.get<string>(
      'app.resource_manipulation_api_key',
    )

    if (
      appUserResourceProtection &&
      headerApiKey !== appResourceManipulationApiKey
    ) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    next()
  }
}
