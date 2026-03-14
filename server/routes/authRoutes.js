const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: true, token: process.env.ADMIN_TOKEN });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (token === process.env.ADMIN_TOKEN) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

module.exports = router;
