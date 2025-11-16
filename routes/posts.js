const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {upload,checkFileSize }= require('../middlewares/upload');
const { createPost, getPost, listPosts, deletePost } = require('../controllers/postController');

router.post('/', auth, upload.array('media', 10), createPost);
router.get('/', listPosts);
router.get('/:id', getPost);
router.delete('/:id', auth, deletePost);

module.exports = router;
