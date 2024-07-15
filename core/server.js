const express = require('express');
const authRoutes = require('./routes/AuthRoutes');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
