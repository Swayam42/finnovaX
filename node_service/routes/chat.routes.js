const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Generic Auth Guard enforcing that the user is securely authenticated
const mockAuthMiddleware = (req, res, next) => {
    // Mocking an authenticated user (Could be INVESTOR or ADMIN)
    req.user = { id: 'usr_101', role: 'INVESTOR' }; 
    
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. Please login to access the AI Chatbot." });
    }
    next();
};

// Route: POST /api/chat/ask
// Proxy mapped directly to the Python LLAMA 3 endpoint
router.post('/ask', mockAuthMiddleware, chatController.askAssistant);

module.exports = router;
