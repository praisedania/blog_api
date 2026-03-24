'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Like belongs to User
      like.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Like belongs to Post
      like.belongsTo(models.post, { foreignKey: 'postId', as: 'post' });
    }
  }
  like.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'like',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'postId']
      }
    ]
  });
  return like;
};