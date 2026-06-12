const express = require('express');
const router = express.Router();
const { uploadCake } = require('../middleware/cloudinaryUpload');

// POST /api/menu/upload — upload a menu item image to Cloudinary
router.post('/upload', uploadCake.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path });
});

module.exports = router;
