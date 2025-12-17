const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/changePassword', authMiddleware, changePassword);

module.exports = router;
