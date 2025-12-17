'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add indexes for friendship table to improve query performance
      try {
        await queryInterface.addIndex('friendships', ['user_id', 'status']);
        console.log('Added index on (user_id, status) in friendships table');
      } catch (e) {
        console.log('Index already exists or error:', e.message);
      }

      try {
        await queryInterface.addIndex('friendships', ['status']);
        console.log('Added index on status in friendships table');
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
      await queryInterface.removeIndex('friendships', ['user_id', 'status']);
      await queryInterface.removeIndex('friendships', ['status']);
    } catch (err) {
      console.error('Rollback error:', err);
    }
  }
};
