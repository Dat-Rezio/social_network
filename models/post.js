const { DataTypes, Model } = require('sequelize');

class Post extends Model {
  static initModel(sequelize) {
    Post.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      content: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE },
      privacy: { type: DataTypes.ENUM('public','friends','private'), defaultValue: 'public' }
    }, {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      timestamps: false
    });
  }
}

module.exports = Post;