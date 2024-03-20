const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = (folderName) => {
  const uploadDir = path.join(__dirname, 'uploads', folderName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  } else {
    // Remove existing files from the upload directory
    fs.readdirSync(uploadDir).forEach((file) => {
      const filePath = path.join(uploadDir, file);
      fs.unlinkSync(filePath);
    });
  }

  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        const extension = file.originalname.split(".").pop();
        const filename = `${uniqueSuffix}.${extension}`;
        cb(null, filename);
      }
    })
  });
};

module.exports = { upload };