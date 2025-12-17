
const { sequelize, Post, PostMedia, User, Profile, Like, Comment } = require('../models');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const createPost = async (req, res) => {
  console.log('--- CREATE POST ---');
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);
  console.log('Number of files:', req.files?.length);
  
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
        console.log(`Processing file: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size}`);
        const isVideo = file.mimetype.startsWith('video/');
        
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "auto",
            folder: 'social_app/posts',
            // Thêm timeout cho video upload dài
            timeout: 120000,
          });
          
          console.log(`✓ Uploaded ${file.originalname} to Cloudinary:`, result.secure_url);

          uploads.push({
            post_id: post.id,
            media_url: result.secure_url,
            type: isVideo ? 'video' : 'image',
            public_id: result.public_id || null
          });
        } catch (uploadError) {
          console.error(`✗ Failed to upload ${file.originalname}:`, uploadError.message);
          throw uploadError;
        }

        try { fs.unlinkSync(file.path); } catch (e) { }
      }

      await PostMedia.bulkCreate(uploads);
      console.log(`✓ Created ${uploads.length} media records`);
    }

    const media = await PostMedia.findAll({ where: { post_id: post.id } });
    res.json({ post, media });
  } catch (err) {
    console.error('CREATE POST ERROR:', err);
    res.status(500).json({ message: 'Lỗi upload bài viết', error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.post_id = Post.id)'), 'likeCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)'), 'commentCount']
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          include: {
            model: Profile,
            attributes: ['fullname', 'avatar_url']
          }
        },
        {
          model: PostMedia,
          attributes: ['id', 'media_url', 'type'],
          required: false
        }
      ]
    });
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
  }
};

const listPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;
    const userId = req.query.userId ? parseInt(req.query.userId) : null;

    const where = {};
    if (userId) {
      where.user_id = userId;
    }

    const posts = await Post.findAll({
      where,
      raw: false,
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.post_id = Post.id)'), 'likeCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)'), 'commentCount']
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          include: {
            model: Profile,
            attributes: ['fullname', 'avatar_url']
          }
        },
        {
          model: PostMedia,
          attributes: ['id', 'media_url', 'type'],
          required: false
        },
        {
          model: Like,
          attributes: ['id'],
          required: false
        },
        {
          model: Comment,
          attributes: ['id'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    // Debug logging
    if (posts.length > 0) {
    }

    res.json(posts.length > 0 ? posts : []);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết', error: err.message });
  }
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

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          include: {
            model: Profile,
            attributes: ['fullname', 'avatar_url']
          }
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận', error: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const existingLike = await Like.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Bạn đã thích bài viết này rồi' });
    }

    const like = await Like.create({
      post_id: postId,
      user_id: userId,
      created_at: new Date()
    });

    res.json({ message: 'Thích bài viết thành công', like });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thích bài viết', error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const like = await Like.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (!like) {
      return res.status(404).json({ message: 'Bạn chưa thích bài viết này' });
    }

    await like.destroy();
    res.json({ message: 'Bỏ thích bài viết thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi bỏ thích bài viết', error: err.message });
  }
};

module.exports = { createPost, getPost, listPosts, deletePost, getPostComments, likePost, unlikePost };
