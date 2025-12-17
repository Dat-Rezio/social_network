const { DataTypes, Model } = require('sequelize');

class Notification extends Model {
  static initModel(sequelize) {
    Notification.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      receiver_id: { type: DataTypes.INTEGER, allowNull: false },
      sender_id: { type: DataTypes.INTEGER },
      type: { type: DataTypes.ENUM('like','comment','friend_request','message') },
      content: { type: DataTypes.TEXT },
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      metadata: { type: DataTypes.JSON }
    }, {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: false
    });
  }
}

module.exports = Notification;