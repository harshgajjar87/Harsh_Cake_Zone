const express = require('express');
const router = express.Router();
const { uploadCake } = require('../middleware/cloudinaryUpload');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', uploadCake.single('cakeImage'), createOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
