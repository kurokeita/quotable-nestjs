import * as dotenv from 'dotenv'
import { Dialect } from 'sequelize'

dotenv.config()

interface ISequelizeConfig {
  [key: string]: {
    dialect: Dialect
    url: string
  }
}

const dialect = process.env.DB_DIALECT as Dialect

const config: ISequelizeConfig = {
  development: {
    dialect: `${dialect}`,
    url: `${dialect}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
  test: {
    dialect: `${dialect}`,
    url: `${dialect}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
  production: {
    dialect: `${dialect}`,
    url: `${dialect}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
}

export = config
