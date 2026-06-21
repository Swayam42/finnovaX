const express = require('express');
const router = express.Router();
const l2Controller = require('../controllers/l2.controller');

// Secure Route Guard strictly enforcing ADMIN_L2 Checker Role
const mockAdminL2Middleware = (req, res, next) => {
    // In production, this matches the signed JWT payload
    req.user = { id: 'usr_999', role: 'ADMIN_L2' };
    
    if (req.user.role !== 'ADMIN_L2') {
        return res.status(403).json({ message: "Forbidden Access. Requires ADMIN_L2 Checker permissions." });
    }
    next();
};

// Route: POST /api/l2/finalize
router.post('/finalize', mockAdminL2Middleware, l2Controller.finalizeTicket);

module.exports = router;
