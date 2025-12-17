const { Model, DataTypes } = require('sequelize');

class conversation extends Model {
  static initModel(sequelize) {
    conversation.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.ENUM('private','group'), allowNull: false, defaultValue: 'private' },
      name: { type: DataTypes.STRING(255), allowNull: true }, // tên nhóm
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: true }
    }, {
      sequelize,
      tableName: 'conversations',
      timestamps: false,
      underscored: true,
      hooks: {
        beforeCreate: (conversation) => {
          if (!conversation.created_at) {
            conversation.created_at = new Date();
          }
          // Don't set updated_at if column doesn't exist yet
          // It will be set by database default
        },
        beforeUpdate: (conversation) => {
          conversation.updated_at = new Date();
        }
      }
    });
  }
}

module.exports = conversation;
