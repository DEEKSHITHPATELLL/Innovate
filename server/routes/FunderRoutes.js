const express = require('express');
const router = express.Router();
const {
  registerFunder,
  loginFunder,
  authenticate,
  getDashboard
} = require('../controllers/FunderController.js');

router.post('/register', registerFunder);

// Login route
router.post('/login', loginFunder);

router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
