const { DataTypes, Model } = require('sequelize');

class Like extends Model {
  static initModel(sequelize) {
    Like.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      post_id: { type: DataTypes.INTEGER, allowNull: false },
      reaction: { type: DataTypes.STRING },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
      sequelize,
      modelName: 'Like',
      tableName: 'likes',
      timestamps: false
    });
  }
}

module.exports = Like;