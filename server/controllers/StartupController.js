const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Startup = require('../models/Startup'); // Ensure your model is correctly defined
const path = require('path');

// Register Startup with File Upload
const registerStartup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, location, domain } = req.body;

    // Check for required fields
    if (!name || !email || !password || !phoneNumber || !location || !domain) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if the user already exists
    const existingUser = await Startup.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Startup entry
    const newStartup = new Startup({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      location,
      domain,
      uploadedFile: req.file.path, // Save the file path
    });

    await newStartup.save();
    res.status(201).json({ message: 'Startup registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login User
const loginStartup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user in the database
    const user = await Startup.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id },'Deekshi', { expiresIn: '1h' });

    // Send token in cookie and response
    res.cookie('Deekshi', token, {
      httpOnly: true,
      secure: false, // Change to true if using HTTPS
      maxAge: 3600000, // 1 hour expiration time
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

// Protected Dashboard Route
const getDashboard = (req, res) => {
  res.json({ message: 'Welcome to the dashboard', user: req.user });
};

module.exports = {
  registerStartup,
  loginStartup,
  authenticate,
  getDashboard,
};
