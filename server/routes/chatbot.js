/**
 * Chatbot Routes
 */
const express = require('express');
const router = express.Router();
const { processMessage, getQuickReplies, executeBooking, getSymptomHints } = require('../controllers/chatbotController');

// Process chat message
router.post('/message', processMessage);

// Get quick reply suggestions
router.get('/suggestions', getQuickReplies);

// Execute booking action
router.post('/book', executeBooking);

// Get symptom hints for autocomplete
router.get('/symptoms', getSymptomHints);

module.exports = router;

