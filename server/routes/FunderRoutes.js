const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  registerFunder,
  loginFunder,
  authenticate,
  getDashboard
} = require('../controllers/FunderController.js');

// Define the uploads directory and ensure it exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Filename format
  },
});

const upload = multer({ storage });

// Register route with file upload
router.post('/register', upload.single('uploadedFile'), registerFunder);

// Login route
router.post('/login', loginFunder);


// Protected dashboard route
router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
