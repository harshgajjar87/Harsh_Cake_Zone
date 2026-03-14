const express = require('express');
const router = express.Router();
const { uploadBill } = require('../middleware/cloudinaryUpload');
const {
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');

router.get('/', getExpenses);
router.get('/summary', getExpenseSummary);
router.post('/', uploadBill.single('billImage'), createExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
