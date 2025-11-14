
const { Friendship, Notification } = require('../models');

const sendRequest = async (req, res) => {
  const userId = req.user.id;
  const { friend_id } = req.body;
  if (!friend_id) return res.status(400).json({ message: 'Thiếu friend_id' });
  if (friend_id === userId) return res.status(400).json({ message: 'Không thể kết bạn với chính mình' });

  let f = await Friendship.findOne({
    where: {
      [Op.or]: [
        { user_id: userId, friend_id },
        { user_id: friend_id, friend_id: userId }
      ]
    }
  });

  if (f) return res.status(409).json({ message: 'Đã gửi request trước đó' });

  const newF = await Friendship.create({ user_id: userId, friend_id, status: 'pending', created_at: new Date() });

  await Notification.create({ receiver_id: friend_id, sender_id: userId, type: 'friend_request', content: 'Bạn có lời mời kết bạn', created_at: new Date() });

  res.json({ friendship: newF });
};

const respondRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId, action } = req.body;
  const f = await Friendship.findByPk(requestId);
  if (!f) return res.status(404).json({ message: 'Không tìm thấy request' });
  if (f.friend_id !== userId) return res.status(403).json({ message: 'Không đủ quyền' });

  if (action === 'accept') {
    await f.update({ status: 'accepted', updated_at: new Date() });
    await Friendship.findOrCreate({ where: { user_id: userId, friend_id: f.user_id }, defaults: { status: 'accepted', created_at: new Date() } });
    res.json({ message: 'Đã chấp nhận' });
  } else if (action === 'block') {
    await f.update({ status: 'blocked', updated_at: new Date() });
    res.json({ message: 'Đã chặn' });
  } else {
    await f.destroy();
    res.json({ message: 'Đã từ chối' });
  }
};

const listFriends = async (req, res) => {
  const userId = req.user.id;
  const friends = await Friendship.findAll({ where: { user_id: userId, status: 'accepted' } });
  res.json({ friends });
};

module.exports = { sendRequest, respondRequest, listFriends };
