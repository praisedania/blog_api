'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.hasMany(models.post, { foreignKey: 'categoryId', as: 'posts' });
      Category.belongsToMany(models.User, { 
        through: 'UserCategories',
        foreignKey: 'categoryId',
        as: 'authors'
      });
    }
  }
  Category.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};