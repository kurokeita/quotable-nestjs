'use strict'

import { QueryInterface } from 'sequelize'

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addIndex('quotes', ['content'], {
      unique: true,
      name: 'quotes_content_unique',
    })
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex('quotes', 'quotes_content_unique')

    await queryInterface.sequelize.query(`
      ALTER TABLE quotes
      ADD FULLTEXT(content)
    `)
  },
}
