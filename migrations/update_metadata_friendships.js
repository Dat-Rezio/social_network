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
    console.log('Bắt đầu migration: update friendship_id trong metadata...');
    
    // Cập nhật metadata cho các notification không có friendship_id
    await sequelize.query(`
      UPDATE notifications n
      LEFT JOIN friendships f ON 
        (f.user_id = n.sender_id AND f.friend_id = n.receiver_id AND f.status = 'pending') OR
        (f.user_id = n.sender_id AND f.friend_id = n.receiver_id AND f.status = 'blocked')
      SET n.metadata = JSON_OBJECT('friendship_id', f.id)
      WHERE n.type = 'friend_request' AND n.metadata IS NULL AND f.id IS NOT NULL
    `);

    console.log('✓ Đã cập nhật metadata thành công');
    process.exit(0);
  } catch (error) {
    console.error('✗ Lỗi migration:', error.message);
    process.exit(1);
  }
};

runMigration();
