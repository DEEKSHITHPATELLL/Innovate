const express = require("express");
const multer = require("multer");
const { handleFileUpload } = require("../controllers/UploadController");

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

// File upload endpoint
router.post("/", upload.single("file"), handleFileUpload);

module.exports = router;
