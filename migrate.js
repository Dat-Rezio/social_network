require('dotenv').config();
const { sequelize } = require('./models');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Sync database - this will create tables if they don't exist
    await sequelize.sync({ alter: false });
    
    console.log('✅ Database synced successfully');
    
    // Run migration to add updated_at column if needed
    const migration = require('./migrations/add_updated_at_to_conversations');
    const QueryInterface = sequelize.getQueryInterface();
    
    console.log('Running migration: add_updated_at_to_conversations...');
    await migration.up(QueryInterface, require('sequelize').DataTypes);
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
