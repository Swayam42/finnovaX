const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const adminController = require('../controllers/admin.controller');

const mockAdminL1Middleware = (req, res, next) => {
    req.user = { id: '60d5ecb8b392d700153f3a01', role: 'ADMIN_L1' };
    next();
};

// Route: POST /api/admin/verify-document
router.post('/verify-document', mockAdminL1Middleware, upload.single('file'), adminController.verifyInvestorDocument);

// Route: PUT /api/admin/escalate/:id
router.put('/escalate/:id', mockAdminL1Middleware, adminController.escalateTicket);

module.exports = router;
