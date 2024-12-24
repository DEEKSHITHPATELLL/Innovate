const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  registerStartup,
  loginStartup,
  authenticate,
  getDashboard,
} = require('../controllers/StartupController');

// Define the uploads directory and ensure it exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage setup for handling the uploaded file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

// Create the upload instance using multer
const upload = multer({ storage });

// Register route with file upload
router.post('/register', upload.single('uploadedFile'), registerStartup);
router.post('/login', loginStartup);
router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
