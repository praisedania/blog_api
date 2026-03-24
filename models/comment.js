'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Comment belongs to User
      comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Comment belongs to Post
      comment.belongsTo(models.post, { foreignKey: 'postId', as: 'post' });
      // Comment can have parent Comment (for nested replies)
      comment.belongsTo(models.comment, { foreignKey: 'parentId', as: 'parent' });
      // Comment can have child Comments (replies)
      comment.hasMany(models.comment, { foreignKey: 'parentId', as: 'replies' });
    }
  }
  comment.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000] // Max 1000 characters
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'comment',
  });
  return comment;
};