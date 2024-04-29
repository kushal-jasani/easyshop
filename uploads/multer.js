const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/avif" ||
    file.mimetype === "image/webp" || 
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/mpeg" ||
    file.mimetype === "video/quicktime"
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: fileFilter,
});

module.exports = { upload };
