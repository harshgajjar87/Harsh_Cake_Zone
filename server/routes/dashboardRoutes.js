const express = require('express');
const router = express.Router();
const { getFinancialSummary, getMonthlyTrend } = require('../controllers/dashboardController');

router.get('/summary', getFinancialSummary);
router.get('/trend', getMonthlyTrend);

module.exports = router;
