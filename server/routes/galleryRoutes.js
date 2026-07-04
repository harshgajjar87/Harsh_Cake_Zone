const express = require('express');
const router = express.Router();
const { uploadCake, cloudinary } = require('../middleware/cloudinaryUpload');
const GalleryImage = require('../models/GalleryImage');

// GET all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload a new gallery image
router.post('/', uploadCake.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const image = await GalleryImage.create({
      url: req.file.path,
      name: req.body.name || '',
      category: req.body.category || 'Cakes',
      publicId: req.file.filename,
    });
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE a gallery image
router.delete('/:id', async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Not found' });
    // Remove from cloudinary too
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId).catch(() => {});
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
