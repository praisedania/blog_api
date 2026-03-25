'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'categoryId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporarily null to avoid breaking existing data
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    // Remove the old string-based category column
    await queryInterface.removeColumn('posts', 'category');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'category', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.removeColumn('posts', 'categoryId');
  }
};
