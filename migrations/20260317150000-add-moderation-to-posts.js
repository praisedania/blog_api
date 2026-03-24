'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'status', {
      type: Sequelize.ENUM('draft', 'pending', 'published', 'rejected'),
      allowNull: false,
      defaultValue: 'published'
    });

    await queryInterface.addColumn('posts', 'moderationReason', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'status');
    await queryInterface.removeColumn('posts', 'moderationReason');
  }
};
