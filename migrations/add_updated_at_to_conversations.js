'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column exists
      const table = await queryInterface.describeTable('conversations');
      
      if (!table.updated_at) {
        await queryInterface.addColumn('conversations', 'updated_at', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: true
        });
        console.log('Added updated_at column to conversations');
      }
      
      // Add indexes for performance
      try {
        await queryInterface.addIndex('conversations', ['updated_at']);
        console.log('Added index on updated_at');
      } catch (e) {
        console.log('Index already exists or error:', e.message);
      }

      try {
        await queryInterface.addIndex('conversation_members', ['user_id']);
        console.log('Added index on user_id in conversation_members');
      } catch (e) {
        console.log('Index already exists or error:', e.message);
      }

      try {
        await queryInterface.addIndex('conversation_members', ['conversation_id']);
        console.log('Added index on conversation_id in conversation_members');
      } catch (e) {
        console.log('Index already exists or error:', e.message);
      }
    } catch (err) {
      console.error('Migration error:', err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('conversations', 'updated_at');
    } catch (err) {
      console.error('Rollback error:', err);
    }
  }
};
