const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { sendRequest, respondRequest, listFriends } = require('../controllers/friendshipController');

router.post('/send', auth, sendRequest);
router.post('/respond', auth, respondRequest);
router.get('/list', auth, listFriends);

module.exports = router;
