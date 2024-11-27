'use strict'

import { DataTypes, QueryInterface, Sequelize } from 'sequelize'

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

    queryInterface.changeColumn('authors', 'createdAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
    })

    queryInterface.changeColumn('authors', 'updatedAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
    })

    queryInterface.changeColumn('quotes', 'content', {
      type: DataTypes.TEXT,
      allowNull: true,
    })

    queryInterface.changeColumn('quotes', 'createdAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
    })

    queryInterface.changeColumn('quotes', 'updatedAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
    })

    queryInterface.addIndex('tags', ['name'], {
      name: 'unique_tags_name',
      unique: true,
    })

    queryInterface.changeColumn('tags', 'createdAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
    })

    queryInterface.changeColumn('tags', 'updatedAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
    })
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

    queryInterface.changeColumn('authors', 'createdAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: 'NULL',
    })

    queryInterface.changeColumn('authors', 'updatedAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: 'NULL',
    })

    queryInterface.changeColumn('quotes', 'content', {
      type: DataTypes.STRING,
      allowNull: false,
    })

    queryInterface.changeColumn('quotes', 'createdAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: 'NULL',
    })

    queryInterface.changeColumn('quotes', 'updatedAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: 'NULL',
    })

    queryInterface.removeIndex('tags', 'unique_tags_name')

    queryInterface.changeColumn('tags', 'createdAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: 'NULL',
    })

    queryInterface.changeColumn('tags', 'updatedAt', {
      type: DataTypes.DATE(6),
      allowNull: false,
      defaultValue: 'NULL',
    })
  },
}
