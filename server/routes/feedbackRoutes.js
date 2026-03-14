const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbacks } = require('../controllers/feedbackController');

router.get('/', getFeedbacks);
router.post('/', submitFeedback);

module.exports = router;
