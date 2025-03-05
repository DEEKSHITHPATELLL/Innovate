const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require('path');
const Funder = require('./routes/FunderRoutes');  // Correct path (no .js extension needed)
const Startup = require('./routes/StartupRoutes');  // Correct path (no .js extension needed)
const People = require('./routes/peopleRoutes');
const chatRoutes = require("./routes/ChartRoutes");
const uploadRoutes = require("./routes/UploadRoutes");
const { funderDB, peopleDB, startupDB } = require('./config/db');  

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

funderDB.once('open', () => console.log('Connected to funderDB'));
peopleDB.once('open', () => console.log('Connected to peopleDB'));
startupDB.once('open', () => console.log('Connected to startupDB'));

app.use('/api/funder', Funder);
app.use('/api/startup', Startup);
app.use('/api/people', People);
app.use("/chat", chatRoutes);
app.use("/upload", uploadRoutes);

app.listen(8000, () => {
  console.log('Server running on http://localhost:8000');
});
