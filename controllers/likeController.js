
const { Like, Notification } = require('../models');

const likePost = async (req, res) => {
  const userId = req.user.id;
  const { post_id, reaction } = req.body;
  if (!post_id) return res.status(400).json({ message: 'Thiếu post_id' });

  let [like, created] = await Like.findOrCreate({
    where: { user_id: userId, post_id },
    defaults: { reaction, created_at: new Date() }
  });
  if (!created) {
    await like.update({ reaction, created_at: new Date() });
  }

  await Notification.create({ receiver_id: req.body.postOwnerId || null, sender_id: userId, type: 'like', content: 'Thích bài viết', created_at: new Date() });

  res.json({ like });
};

const unlikePost = async (req, res) => {
  const userId = req.user.id;
  const { post_id } = req.body;
  const like = await Like.findOne({ where: { user_id: userId, post_id } });
  if (!like) return res.status(404).json({ message: 'Chưa thích trước đó' });
  await like.destroy();
  res.json({ message: 'Bỏ thích thành công' });
};

module.exports = { likePost, unlikePost };
