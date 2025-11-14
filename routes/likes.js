const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { likePost, unlikePost } = require('../controllers/likeController');

router.post('/', auth, likePost);
router.delete('/', auth, unlikePost);

module.exports = router;
