require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const https = require('https');

const app = express();

app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/referrers', require('./routes/referrerRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Self-ping every 14 min to prevent Render free tier cold starts
      if (process.env.RENDER_EXTERNAL_URL) {
        setInterval(() => {
          https.get(`${process.env.RENDER_EXTERNAL_URL}/api/ping`, (res) => {
            console.log(`Keep-alive ping: ${res.statusCode}`);
          }).on('error', () => {});
        }, 14 * 60 * 1000);
      }
    });
  })
  .catch((err) => console.error('DB connection error:', err));
