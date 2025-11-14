const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { getMyProfile, updateProfile, updateAvatar } = require('../controllers/userController');

router.get('/me', auth, getMyProfile);
router.put('/me', auth, updateProfile);
router.post('/avatar', auth, upload.single('avatar'), updateAvatar);

module.exports = router;
