const mongoose = require('mongoose');

// Create separate connections for each database
const funderDB = mongoose.createConnection('mongodb://localhost:27017/funderDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const peopleDB = mongoose.createConnection('mongodb://localhost:27017/peopleDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const startupDB = mongoose.createConnection('mongodb://localhost:27017/startupDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Log connection status
funderDB.once('open', () => console.log('Connected to funderDB'));
peopleDB.once('open', () => console.log('Connected to peopleDB'));
startupDB.once('open', () => console.log('Connected to startupDB'));

// Export connection instances
module.exports = {
  funderDB,
  peopleDB,
  startupDB,
};
