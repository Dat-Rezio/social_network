const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { sendRequest, respondRequest, listFriends } = require('../controllers/friendshipController');

// Test route (không cần auth)
router.get('/test', (req, res) => {
  res.json({ message: 'Friendships API is working', timestamp: new Date() });
});

router.post('/send', auth, sendRequest);
router.post('/respond', auth, respondRequest);
router.get('/list', auth, listFriends);

module.exports = router;
