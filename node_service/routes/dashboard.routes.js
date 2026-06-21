const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Temporary mock middleware for routes to ensure user is logged in
const mockAuthMiddleware = (req, res, next) => {
    // Ideally this will use the JWT token decode to map to req.user
    next();
};

// 1. Investor Dashboard
router.get('/investor/:id', mockAuthMiddleware, dashboardController.getInvestorTickets);

// 2. L1 Maker Desk Queue
router.get('/l1-queue', mockAuthMiddleware, dashboardController.getL1Queue);

// 3. L2 Checker Desk Queue
router.get('/l2-queue', mockAuthMiddleware, dashboardController.getL2Queue);

module.exports = router;
