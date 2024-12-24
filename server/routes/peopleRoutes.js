const express = require('express');
const router = express.Router();
const { registerPeople, loginPeople, authenticate, getDashboard } = require('../controllers/PeopleControllers.js');  

// Register a new user
router.post('/register', registerPeople);

// Login a user
router.post('/login', loginPeople);

// Protected route to get user dashboard
router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
