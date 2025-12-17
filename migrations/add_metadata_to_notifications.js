const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
  }
);

const runMigration = async () => {
  try {
    console.log('Bắt đầu migration...');
    
    // Kiểm tra xem cột metadata có tồn tại không
    const result = await sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'metadata'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (result.length > 0) {
      console.log('Cột metadata đã tồn tại');
      process.exit(0);
    }

    // Thêm cột metadata
    await sequelize.query(
      "ALTER TABLE notifications ADD COLUMN metadata JSON AFTER created_at"
    );

    console.log('✓ Đã thêm cột metadata thành công');
    process.exit(0);
  } catch (error) {
    console.error('✗ Lỗi migration:', error.message);
    process.exit(1);
  }
};

runMigration();
