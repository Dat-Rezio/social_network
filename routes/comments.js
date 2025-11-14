const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createComment, deleteComment } = require('../controllers/commentController');

router.post('/', auth, createComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
