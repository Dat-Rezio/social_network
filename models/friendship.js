const { DataTypes, Model } = require('sequelize');

class Friendship extends Model {
  static initModel(sequelize) {
    Friendship.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      friend_id: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'accepted', 'blocked'), defaultValue: 'pending' },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE },
      meta: { type: DataTypes.JSON }
    }, {
      sequelize,          
      modelName: 'Friendship',
      tableName: 'friendships',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'friend_id']
        }
      ]
    });
  }
}

module.exports = Friendship;