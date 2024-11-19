import { registerAs } from '@nestjs/config'

export interface AppConfig {
  env: string
  port: number
}

export default registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV || 'development',
    port: (process.env.APP_PORT as unknown as number) || 3000,
  }),
)
