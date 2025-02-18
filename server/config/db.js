const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
if (!process.env.MONGODB_FUNDERS || !process.env.MONGODB_PEOPLE || !process.env.MONGODB_STARTUP) {
  console.error("Error: Missing MongoDB environment variables!");
  process.exit(1);
}
const funderDB = mongoose.createConnection(process.env.MONGODB_FUNDERS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const peopleDB = mongoose.createConnection(process.env.MONGODB_PEOPLE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const startupDB = mongoose.createConnection(process.env.MONGODB_STARTUP, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
funderDB.on('open', () => console.log('Connected to funderDB'));
funderDB.on('error', (err) => console.error(' Error connecting to funderDB:', err));

peopleDB.on('open', () => console.log(' Connected to peopleDB'));
peopleDB.on('error', (err) => console.error(' Error connecting to peopleDB:', err));

startupDB.on('open', () => console.log('Connected to startupDB'));
startupDB.on('error', (err) => console.error(' Error connecting to startupDB:', err));

module.exports = { funderDB, peopleDB, startupDB };
