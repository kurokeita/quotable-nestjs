'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('quotes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT.UNSIGNED,
      },
      authorId: {
        allowNull: false,
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
          model: 'authors',
          key: 'id',
        },
      },
      content: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(6),
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE(6),
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE(6),
        defaultValue: null,
      },
    })
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('quotes')
  },
}
