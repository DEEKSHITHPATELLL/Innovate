const mongoose = require('mongoose');
const { startupDB } = require('../config/db'); // Ensure this is correctly initialized

// Define the Startup Schema
const StartupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true, // Ensure email is unique
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true, // Set to false if optional // Ensure phone number is unique
    },
    location: {
      type: String,
      required: true, // Set to false if optional
    },
    domain: {
      type: String,
      required: true, // Set to false if optional
    },
    uploadedFile: {
      type: String,
      required: true, // Adjust based on file handling logic
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Create and export the model
const Startup = startupDB.model('Startup', StartupSchema);

module.exports = Startup;
