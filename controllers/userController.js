
const { User, Profile } = require('../models');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const getMyProfile = async (req, res) => {
  const user = req.user;
  const profile = await Profile.findOne({ where: { user_id: user.id } });
  res.json({ user: { id: user.id, username: user.username, email: user.email, status: user.status }, profile });
};

const updateProfile = async (req, res) => {
  const user = req.user;
  const data = req.body;
  let profile = await Profile.findOne({ where: { user_id: user.id } });
  if (!profile) {
    data.user_id = user.id;
    profile = await Profile.create(data);
  } else {
    await profile.update({ ...data, updated_at: new Date() });
  }
  res.json({ profile });
};

const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: 'Chưa có file upload' });

    // Upload avatar mới
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'social_app/avatars',
      resource_type: "auto" 
    });
    fs.unlinkSync(req.file.path);

    // Lấy profile
    let profile = await Profile.findOne({ where: { user_id: userId } });

    // Xóa avatar cũ nếu có
    if (profile && profile.avatar_public_id) {
      try {
        await cloudinary.uploader.destroy(profile.avatar_public_id, {
          resource_type: "image"
        });
      } catch (e) {
        console.error("Lỗi khi xóa avatar cũ:", e);
      }
    }

    // Cập nhật hoặc tạo
    if (!profile) {
      profile = await Profile.create({
        user_id: userId,
        avatar_url: result.secure_url,
        avatar_public_id: result.public_id,
        updated_at: new Date()
      });
    } else {
      await profile.update({
        avatar_url: result.secure_url,
        avatar_public_id: result.public_id,
        updated_at: new Date()
      });
    }

    res.json({ 
      message: 'Cập nhật avatar thành công', 
      avatar_url: result.secure_url 
    });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi upload avatar', error: err.message });
  }
};


module.exports = { getMyProfile, updateProfile, updateAvatar };
