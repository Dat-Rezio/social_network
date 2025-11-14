const { DataTypes, Model } = require('sequelize');

class User extends Model {
  static initModel(sequelize) {
    User.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      password: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      status: { type: DataTypes.ENUM('active','banned'), defaultValue: 'active' }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false
    });
  }
}

module.exports = User;