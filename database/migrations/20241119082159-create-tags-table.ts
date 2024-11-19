'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT.UNSIGNED,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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

    // Create join table for many-to-many relationship between quotes and tags
    await queryInterface.createTable('quote_tags', {
      quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'quotes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tagId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    })

    // Add composite primary key to quote_tags
    await queryInterface.addConstraint('quote_tags', {
      fields: ['quoteId', 'tagId'],
      type: 'primary key',
      name: 'quote_tags_pkey',
    })
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('quote_tags')
    await queryInterface.dropTable('tags')
  },
}
