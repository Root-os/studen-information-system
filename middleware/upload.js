const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/user");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|pdf/;

  const ext = allowedExt.test(
    path.extname(file.originalname).toLowerCase()
  );

  const allowedMime =
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/");

  if (ext && allowedMime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;