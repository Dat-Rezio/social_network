
const { Op } = require('sequelize');
const { Friendship, Notification, User } = require('../models');

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

  await Notification.create({ 
    receiver_id: friend_id, 
    sender_id: userId, 
    type: 'friend_request', 
    content: 'Bạn có lời mời kết bạn', 
    created_at: new Date(),
    metadata: { friendship_id: newF.id }
  });

  res.json({ friendship: newF });
};

const respondRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId, action } = req.body;
  const f = await Friendship.findByPk(requestId);
  if (!f) return res.status(404).json({ message: 'Không tìm thấy request' });
  
  // Đối với action 'unfriend', cả hai người đều có quyền xóa
  if (action !== 'unfriend') {
    // Kiểm tra xem userId có phải là người nhận lời mời không
    if (f.friend_id !== userId) {
      return res.status(403).json({ message: 'Không đủ quyền' });
    }
  } else {
    // Kiểm tra xem userId có phải là một trong hai người trong quan hệ bạn bè không
    if (f.user_id !== userId && f.friend_id !== userId) {
      return res.status(403).json({ message: 'Không đủ quyền' });
    }
  }

  if (action === 'accept') {
    await f.update({ status: 'accepted', updated_at: new Date() });
    await Friendship.findOrCreate({ where: { user_id: userId, friend_id: f.user_id }, defaults: { status: 'accepted', created_at: new Date() } });
    // Xóa thông báo sau khi accept
    await Notification.destroy({ where: { sender_id: f.user_id, receiver_id: userId, type: 'friend_request' } });
    res.json({ message: 'Đã chấp nhận' });
  } else if (action === 'block') {
    await f.update({ status: 'blocked', updated_at: new Date() });
    // Xóa thông báo sau khi block
    await Notification.destroy({ where: { sender_id: f.user_id, receiver_id: userId, type: 'friend_request' } });
    res.json({ message: 'Đã chặn' });
  } else if (action === 'reject') {
    // Xóa thông báo lời mời kết bạn
    await Notification.destroy({ where: { sender_id: f.user_id, receiver_id: userId, type: 'friend_request' } });
    // Xóa lời mời kết bạn
    await f.destroy();
    res.json({ message: 'Đã từ chối' });
  } else if (action === 'unfriend') {
    // Xác định friendId là ai
    const friendId = f.user_id === userId ? f.friend_id : f.user_id;
    
    // Xóa cả hai phía của quan hệ bạn bè
    const deleted = await Friendship.destroy({ 
      where: { 
        [Op.or]: [
          { user_id: userId, friend_id: friendId },
          { user_id: friendId, friend_id: userId }
        ]
      } 
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Không tìm thấy quan hệ bạn bè' });
    }
    
    res.json({ message: 'Đã hủy kết bạn' });
  } else {
    res.status(400).json({ message: 'Action không hợp lệ' });
  }
};

const listFriends = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.dataValues?.id;
    
    if (!userId) {
      console.error('[listFriends] No userId found in req.user:', req.user);
      return res.status(400).json({ message: 'Invalid user' });
    }
    
    console.log(`[listFriends] Fetching friends for user ${userId}`);
    
    // Simple query: Get friendships
    const friendships = await Friendship.findAll({ 
      where: { user_id: userId, status: 'accepted' },
      attributes: ['friend_id']
    });

    console.log(`[listFriends] Found ${friendships.length} friendships`);
    
    if (friendships.length === 0) {
      return res.json({ friends: [] });
    }

    // Get all friend IDs
    const friendIds = friendships.map(f => f.friend_id);
    
    // Fetch users with their profiles in one query
    const { Profile } = require('../models');
    const users = await User.findAll({
      where: { id: { [Op.in]: friendIds } },
      attributes: ['id', 'username'],
      include: [{
        model: Profile,
        attributes: ['fullname', 'avatar_url'],
        required: false
      }]
    });

    console.log(`[listFriends] Fetched ${users.length} user details`);

    // Format response
    const friends = users.map(user => ({
      friend_id: user.id,
      username: user.username,
      name: user.Profile?.fullname || user.username,
      avatar: user.Profile?.avatar_url || null
    }));

    res.json({ friends });
  } catch (err) {
    console.error('[listFriends] Error:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

module.exports = { sendRequest, respondRequest, listFriends };
