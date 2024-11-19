import * as dotenv from 'dotenv'
import { Dialect } from 'sequelize'

dotenv.config()

interface ISequelizeConfig {
  [key: string]: {
    dialect: Dialect
    url: string
  }
}

const config: ISequelizeConfig = {
  development: {
    dialect: 'mysql',
    url: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
  test: {
    dialect: 'mysql',
    url: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
  production: {
    dialect: 'mysql',
    url: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
}

export = config
