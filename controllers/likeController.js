
const { Like, Notification, Post } = require('../models');

const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id, reaction } = req.body;
    if (!post_id) return res.status(400).json({ message: 'Thiếu post_id' });

    // Lấy post để tìm owner
    const post = await Post.findByPk(post_id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    let [like, created] = await Like.findOrCreate({
      where: { user_id: userId, post_id },
      defaults: { reaction, created_at: new Date() }
    });
    if (!created) {
      await like.update({ reaction, created_at: new Date() });
    }

    // Tạo notification cho post owner (nếu không phải chính họ)
    if (post.user_id !== userId) {
      await Notification.create({ 
        receiver_id: post.user_id, 
        sender_id: userId, 
        type: 'like', 
        content: 'Thích bài viết', 
        created_at: new Date() 
      });
    }

    res.json({ like });
  } catch (err) {
    console.error('Lỗi like post:', err);
    res.status(500).json({ message: 'Lỗi like bài viết', error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post_id } = req.body;
    const like = await Like.findOne({ where: { user_id: userId, post_id } });
    if (!like) return res.status(404).json({ message: 'Chưa thích trước đó' });
    await like.destroy();
    res.json({ message: 'Bỏ thích thành công' });
  } catch (err) {
    console.error('Lỗi unlike post:', err);
    res.status(500).json({ message: 'Lỗi bỏ thích bài viết', error: err.message });
  }
};

module.exports = { likePost, unlikePost };
