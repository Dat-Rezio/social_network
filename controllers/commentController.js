
const { Comment, Notification, User, Profile } = require('../models');

const createComment = async (req, res) => {
  const userId = req.user.id;
  const { post_id, content } = req.body;
  if (!post_id || !content) return res.status(400).json({ message: 'Thiếu dữ liệu' });
  const comment = await Comment.create({ post_id, user_id: userId, content, created_at: new Date() });
  await Notification.create({ receiver_id: req.body.postOwnerId || null, sender_id: userId, type: 'comment', content: 'Có bình luận mới', created_at: new Date() });
  const fullComment = await Comment.findByPk(comment.id, {
    include: [
      {
        model: User,
        attributes: ['id', 'username'],
        include: [{ model: Profile }]
      }
    ]
  });

  res.json({ comment: fullComment });

};

const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Không tìm thấy' });
  if (comment.user_id !== userId) return res.status(403).json({ message: 'Không có quyền' });
  await comment.destroy();
  res.json({ message: 'Xóa thành công' });
};

module.exports = { createComment, deleteComment };
