'use strict'

import { QueryInterface } from 'sequelize'

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    queryInterface.addIndex('quotes', ['content'], {
      name: 'quotes_content_unique',
      unique: true,
    })
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex('quotes', 'quotes_content_unique')
  },
}
