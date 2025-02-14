const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Funder = require('../models/Funder.js');
const path = require('path');

// Register User with File Upload
const registerFunder = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }


    // Check if the user already exists
    const existingUser = await Funder.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newFunder = new Funder({
      name,
      email,
      password: hashedPassword,
    });

    await newFunder.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login User
const loginFunder = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await Funder.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User does not exist' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, 'Deekshi', { expiresIn: '1h' });

    // Respond with user info and token
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Authentication Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, 'Deekshi', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

// Protected Route Example (Dashboard)
const getDashboard = (req, res) => {
  res.json({ message: 'Welcome to the dashboard', user: req.user });
};

module.exports = {
  registerFunder,
  loginFunder,
  authenticate,
  getDashboard
};
