import { registerAs } from '@nestjs/config'
import * as dotenv from 'dotenv'

dotenv.config()
const resourceManipulationApiKey =
  process.env.RESOURCE_MANIPULATION_API_KEY?.trim() || undefined

export interface AppConfig {
  env: string
  port: number
  resource_protection: boolean
  resource_manipulation_api_key?: string
}

export default registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV || 'development',
    port: (process.env.APP_PORT as unknown as number) || 3000,
    resource_protection: process.env.RESOURCE_PROTECTION === 'true',
    resource_manipulation_api_key: resourceManipulationApiKey,
  }),
)
