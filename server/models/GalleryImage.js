const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, default: '' },
  category: { type: String, default: 'Cakes' },
  publicId: { type: String, default: '' }, // cloudinary public_id for deletion
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
