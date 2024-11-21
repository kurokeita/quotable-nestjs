'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    queryInterface.changeColumn('authors', 'description', {
      type: DataTypes.TEXT,
      allowNull: true,
    })

    queryInterface.changeColumn('authors', 'bio', {
      type: DataTypes.TEXT,
      allowNull: true,
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE authors
      ALTER COLUMN createdAt
      SET DEFAULT CURRENT_TIMESTAMP(6)
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE authors
      ALTER COLUMN updatedAt
      SET DEFAULT CURRENT_TIMESTAMP(6)
    `)

    queryInterface.changeColumn('quotes', 'content', {
      type: DataTypes.TEXT,
      allowNull: true,
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ALTER COLUMN createdAt
      SET DEFAULT CURRENT_TIMESTAMP(6)
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ALTER COLUMN updatedAt
      SET DEFAULT CURRENT_TIMESTAMP(6)
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ADD FULLTEXT(content)
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE tags
      ADD UNIQUE INDEX unique_tags_name (name);
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE tags
      ALTER COLUMN createdAt
      SET DEFAULT CURRENT_TIMESTAMP(6)
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE tags
      ALTER COLUMN updatedAt
      SET DEFAULT CURRENT_TIMESTAMP(6)
    `)
  },

  down: async (queryInterface: QueryInterface) => {
    queryInterface.changeColumn('authors', 'description', {
      type: DataTypes.STRING,
      allowNull: true,
    })

    queryInterface.changeColumn('authors', 'bio', {
      type: DataTypes.STRING,
      allowNull: true,
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE authors
      ALTER COLUMN createdAt
      SET DEFAULT NULL
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE authors
      ALTER COLUMN updatedAt
      SET DEFAULT NULL
    `)

    queryInterface.changeColumn('quotes', 'content', {
      type: DataTypes.STRING,
      allowNull: false,
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ALTER COLUMN createdAt
      SET DEFAULT NULL
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ALTER COLUMN updatedAt
      SET DEFAULT NULL
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      DROP FULLTEXT(content)
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      DROP INDEX unique_tags_name
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ALTER COLUMN createdAt
      SET DEFAULT NULL
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE tags
      ALTER COLUMN updatedAt
      SET DEFAULT NULL
    `)
  },
}
