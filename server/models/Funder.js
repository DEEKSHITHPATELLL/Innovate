const mongoose = require('mongoose');
const { funderDB } = require('../config/db'); // Import the funderDB connection instance

// Define schema for the Funder collection
const FunderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Create model using the funderDB connection
const Funder = funderDB.model('Funder', FunderSchema);

module.exports = Funder;
