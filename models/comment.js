const { DataTypes, Model } = require('sequelize');

class Comment extends Model {
  static initModel(sequelize) {
    Comment.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      post_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      content: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE }
    }, {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      timestamps: false
    });
  }
}

module.exports = Comment;