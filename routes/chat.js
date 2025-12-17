const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const {
  createPrivateConversation,
  createGroupConversation,
  getMessages,
  getConversations
} = require('../controllers/chatController');

// Test route (không cần auth)
router.get('/test', (req, res) => {
  res.json({ message: 'Chat API is working', timestamp: new Date() });
});

router.post('/private', auth, createPrivateConversation);
router.post('/group', auth, createGroupConversation);
router.get('/conversations', auth, getConversations);
router.get('/:conversationId/messages', auth, getMessages);

module.exports = router;
