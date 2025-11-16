const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

// Middleware kiểm tra type + size
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");

  if (!isImage && !isVideo) return cb(new Error('Chỉ hỗ trợ ảnh và video'), false);

  // Lưu thông tin file vào object để kiểm tra sau
  file._isImage = isImage;
  file._isVideo = isVideo;
  
  cb(null, true);
};

// Khởi tạo multer (bỏ limits chung)
const upload = multer({ storage, fileFilter });

// Middleware kiểm tra size riêng ảnh/video
const checkFileSize = (req, res, next) => {
  const files = req.files || [];
  for (const file of files) {
    if (file._isImage && file.size > 1 * 1024 * 1024)
      return res.status(400).json({ message: `Ảnh ${file.originalname} quá lớn (max 1MB)` });
    if (file._isVideo && file.size > 10 * 1024 * 1024)
      return res.status(400).json({ message: `Video ${file.originalname} quá lớn (max 10MB)` });
  }
  next();
};

module.exports = { upload, checkFileSize };
