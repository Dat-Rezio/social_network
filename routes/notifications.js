const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { listNotifications, markRead } = require('../controllers/notificationController');

router.get('/', auth, listNotifications);
router.post('/:id/read', auth, markRead);

module.exports = router;
