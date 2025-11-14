
const { Post, PostMedia } = require('../models');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, privacy } = req.body;

    const post = await Post.create({
      user_id: userId,
      content,
      privacy: privacy || 'public',
      created_at: new Date()
    });

    if (req.files && req.files.length > 0) {
      const uploads = [];

      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: 'social_app/posts'
        });

        uploads.push({
          post_id: post.id,
          media_url: result.secure_url,
          type: isVideo ? 'video' : 'image',
          public_id: result.public_id || null
        });

        try { fs.unlinkSync(file.path); } catch (e) { }
      }

      await PostMedia.bulkCreate(uploads);
    }

    const media = await PostMedia.findAll({ where: { post_id: post.id } });
    res.json({ post, media });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi upload bài viết', error: err.message });
  }
};

const getPost = async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
  res.json({ post });
};

const listPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;
  const posts = await Post.findAll({ order: [['created_at', 'DESC']], limit, offset });
  res.json({ posts, page });
};

const deletePost = async (req, res) => {
  const userId = req.user.id;
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Không tìm thấy' });
  if (post.user_id !== userId) return res.status(403).json({ message: 'Không có quyền' });
  const medias = await PostMedia.findAll({ where: { post_id: post.id } });
  
  for (const m of medias) {
    if (m.public_id) {
      await cloudinary.uploader.destroy(m.public_id, {
        resource_type: "auto"
      });
    }
  }

  await PostMedia.destroy({ where: { post_id: post.id } });
  await post.destroy();
  res.json({ message: 'Xóa thành công' });
};

module.exports = { createPost, getPost, listPosts, deletePost };
