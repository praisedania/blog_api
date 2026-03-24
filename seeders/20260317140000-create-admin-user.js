'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcrypt');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('Users', [{
      userName: 'Owner',
      email: 'praise@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'praisdania@gmail.com' }, {});
  }
};
