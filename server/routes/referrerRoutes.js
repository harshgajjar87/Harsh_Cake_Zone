const express = require('express');
const router = express.Router();
const {
  getReferrers,
  createReferrer,
  updateReferrer,
  deleteReferrer,
  updateOrderCommission,
  getRates,
} = require('../controllers/referrerController');

router.get('/', getReferrers);
router.get('/rates', getRates);
router.post('/', createReferrer);
router.patch('/:id', updateReferrer);
router.delete('/:id', deleteReferrer);
router.patch('/order/:orderId/commission', updateOrderCommission);

module.exports = router;
