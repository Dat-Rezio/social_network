
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User, Profile } = require('../models');
const { Op } = require('sequelize');

const register = async (req, res) => {
  try {
    const { username, password, email, fullname } = req.body;
    if (!username || !password || !email) return res.status(400).json({ message: 'Thiếu thông tin' });

    const exists = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (exists) return res.status(409).json({ message: 'Username hoặc email đã tồn tại' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash, email });

    if (fullname) {
      await Profile.create({ user_id: user.id, fullname });
    }

    res.json({user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ message: 'Thiếu thông tin' });

    const user = await User.findOne({ where: { [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } });
    if (!user) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };
