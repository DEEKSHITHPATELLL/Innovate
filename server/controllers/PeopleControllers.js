const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const People = require('../models/people.js');  // Ensure this is the correct model path

// Register User (Only with name, email, and password)
const registerPeople = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if the user already exists
    const existingUser = await People.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance using People model
    const newPeople = new People({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newPeople.save();  // Using newPeople.save() as per your request
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login User (Only with email and password)
const loginPeople = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if the user exists
    const user = await People.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'Deekshi', { expiresIn: '1h' });

    // Set the token in a cookie (for session management)
    res.cookie('auth_token', token, {
      httpOnly: true, // Make the cookie accessible only via HTTP
      secure: process.env.NODE_ENV === 'production',  // Set to true in production with HTTPS
      maxAge: 3600000, // 1 hour expiration time
    });

    res.json({ message: 'Login successful', token }); // Send the response with token
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

  jwt.verify(token, process.env.JWT_SECRET || 'Deekshi', (err, decoded) => {
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
  registerPeople,
  loginPeople,
  authenticate,
  getDashboard
};
