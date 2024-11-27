/* eslint-disable @typescript-eslint/no-require-imports */

require('ts-node/register')
const Sequelize = require('sequelize')
const process = require('process')

const sequelize = new Sequelize(
  `${process.env.DB_DIALECT}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`,
)
const database = process.env.DB_NAME
// console.log(process.env.NODE_ENV)
// sequelize.query('SELECT 1 + 1').then((result) => console.log(result))

sequelize
  .query(`DROP DATABASE IF EXISTS ${database} WITH (FORCE)`)
  .then(() => sequelize.query(`CREATE DATABASE ${database}`))
