'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Post belongs to User
      post.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Post has many Comments
      post.hasMany(models.comment, { foreignKey: 'postId', as: 'comments' });
      // Post has many Likes
      post.hasMany(models.like, { foreignKey: 'postId', as: 'likes' });
    }
  }
  post.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected'),
      allowNull: false,
      defaultValue: 'published'
    },
    moderationReason: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};