const express = require('express');
const authRoutes = require('./routes/AuthRoutes');
const quizRoutes = require('./routes/QuizRoutes');
const userRoutes = require('./routes/UserRoutes');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db/db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Handle graceful shutdown
/*const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    db.end()
      .then(() => {
        console.log('Database connection closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error closing database connection', err);
        process.exit(1);
      });
  });
};*/

app.use(helmet()); // Adds security headers to responses
app.use(
  cors({
    origin: 'http://localhost:3000', // frontend's URL
    credentials: true, // Allow credentials
  })
);

app.use(express.json()); // Parse JSON payloads

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later',
});
app.use('/api/auth/login', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
// Register user routes
app.use('/api/users', userRoutes);
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to check and serve the JSON file
app.get('/api/config/userDetailsConfig.json', (req, res) => {
  console.log('Fetch config');
  const filePath = path.join(
    __dirname,
    'public/config',
    'userDetailsConfig.json'
  );
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send({ error: 'Config file not found' });
    } else {
      console.log('file exists', filePath);
      res.sendFile(filePath);
    }
  });
});
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//process.on('SIGTERM', shutdown);
//process.on('SIGINT', shutdown);

// Export the app for testing
//Put it under test flag.. export when imported through some test.
module.exports = app;
