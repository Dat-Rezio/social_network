
const { User, Profile, Friendship } = require('../models');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { Op } = require('sequelize');

const getMyProfile = async (req, res) => {
  const user = req.user;
  const profile = await Profile.findOne({ where: { user_id: user.id } });
  res.json({ user: { id: user.id, username: user.username, email: user.email, status: user.status }, profile });
};

const getProfileById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy thông tin', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    
    // Xử lý birthday: nếu trống thì set null, nếu không phải date hợp lệ thì set null
    if (!data.birthday || data.birthday.trim() === '') {
      data.birthday = null;
    } else {
      // Kiểm tra xem có phải date hợp lệ không
      const dateTest = new Date(data.birthday);
      if (isNaN(dateTest.getTime())) {
        data.birthday = null;
      }
    }
    
    let profile = await Profile.findOne({ where: { user_id: user.id } });
    if (!profile) {
      data.user_id = user.id;
      profile = await Profile.create(data);
    } else {
      await profile.update({ ...data, updated_at: new Date() });
    }
    res.json({ profile });
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    res.status(500).json({ message: 'Lỗi cập nhật profile', error: err.message });
  }
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
      image_url: result.secure_url 
    });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi upload avatar', error: err.message });
  }
};

const updateCover = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: 'Chưa có file upload' });

    // Upload cover mới
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'social_app/covers',
      resource_type: "auto" 
    });
    fs.unlinkSync(req.file.path);

    // Lấy profile
    let profile = await Profile.findOne({ where: { user_id: userId } });

    // Xóa cover cũ nếu có
    if (profile && profile.cover_public_id) {
      try {
        await cloudinary.uploader.destroy(profile.cover_public_id, {
          resource_type: "image"
        });
      } catch (e) {
        console.error("Lỗi khi xóa cover cũ:", e);
      }
    }

    // Cập nhật hoặc tạo
    if (!profile) {
      profile = await Profile.create({
        user_id: userId,
        cover_url: result.secure_url,
        cover_public_id: result.public_id,
        updated_at: new Date()
      });
    } else {
      await profile.update({
        cover_url: result.secure_url,
        cover_public_id: result.public_id,
        updated_at: new Date()
      });
    }

    res.json({ 
      message: 'Cập nhật ảnh bìa thành công', 
      image_url: result.secure_url 
    });

  } catch (err) {
    res.status(500).json({ message: 'Lỗi upload ảnh bìa', error: err.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng nhập tên người dùng' });
    }

    // Tìm kiếm profile theo fullname (không case sensitive)
    const profiles = await Profile.findAll({
      where: {
        fullname: {
          [Op.like]: `%${keyword}%`
        }
      },
      limit: 20
    });

    // Lấy thông tin người dùng và trạng thái kết bạn
    const results = await Promise.all(
      profiles.map(async (profile) => {
        // Không hiển thị profile của chính mình
        if (profile.user_id === currentUserId) {
          return null;
        }

        // Kiểm tra trạng thái kết bạn
        const friendship = await Friendship.findOne({
          where: {
            [Op.or]: [
              { user_id: currentUserId, friend_id: profile.user_id },
              { user_id: profile.user_id, friend_id: currentUserId }
            ]
          }
        });

        // Lấy thông tin user
        const user = await User.findByPk(profile.user_id);

        return {
          user_id: profile.user_id,
          fullname: profile.fullname,
          avatar_url: profile.avatar_url,
          des: profile.des,
          friendship: {
            id: friendship ? friendship.id : null,
            status: friendship ? friendship.status : null
          }
        };
      })
    );

    // Lọc bỏ null (profile của chính mình)
    const filteredResults = results.filter(r => r !== null);

    res.json({ users: filteredResults });
  } catch (err) {
    console.error('Lỗi tìm kiếm người dùng:', err);
    res.status(500).json({ message: 'Lỗi tìm kiếm người dùng', error: err.message });
  }
};

module.exports = { getMyProfile, getProfileById, updateProfile, updateAvatar, updateCover, searchUsers };
