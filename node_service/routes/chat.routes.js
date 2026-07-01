const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

// Route: GET /api/chat/history
// Retrieve previous chat history for the user or session
router.get('/history', optionalAuthenticate, chatController.getHistory);

// Route: POST /api/chat/ask
// Any user can use the AI Chatbot
// Proxy mapped directly to the Python RAG endpoint
router.post('/ask', optionalAuthenticate, chatController.askAssistant);

module.exports = router;
