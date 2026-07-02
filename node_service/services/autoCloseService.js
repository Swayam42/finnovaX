const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const startAutoCloseJob = () => {
    // For testing purposes, we use a very short grace period
    // In production, this would be set to 3 days: 3 * 24 * 60 * 60 * 1000
    const GRACE_PERIOD_MS = parseInt(process.env.AUTO_CLOSE_GRACE_PERIOD_MS) || 3 * 24 * 60 * 60 * 1000; 
    
    const CHECK_INTERVAL_MS = parseInt(process.env.AUTO_CLOSE_CHECK_INTERVAL_MS) || 60 * 60 * 1000;

    console.log(`[AutoCloseJob] Initialized. Grace Period: ${GRACE_PERIOD_MS}ms, Check Interval: ${CHECK_INTERVAL_MS}ms`);

    setInterval(async () => {
        try {
            const cutoffTime = new Date(Date.now() - GRACE_PERIOD_MS);
            const ticketsToClose = await Ticket.find({
                status: 'RESOLVED',
                resolvedAt: { $lt: cutoffTime }
            });

            if (ticketsToClose.length === 0) {
                return; 
            }

            console.log(`[AutoCloseJob] Found ${ticketsToClose.length} tickets to auto-close.`);

            for (const ticket of ticketsToClose) {
                try {
                    // Update ticket status
                    ticket.status = 'CLOSED';
                    await ticket.save();

                    // Create Audit Log
                    const auditLog = new AuditLog({
                        entityId: ticket._id,
                        entityType: 'Ticket',
                        action: 'SYSTEM_AUTO_CLOSED',
                        performedBy: ticket.investorId, // Usually system, but required by schema to be a User ID. We use investorId as fallback.
                        details: {
                            note: 'Ticket was automatically closed by the system after the grace period.',
                            oldStatus: 'RESOLVED',
                            newStatus: 'CLOSED'
                        }
                    });
                    
                    await auditLog.save();

                    console.log(`[AutoCloseJob] Auto-closed ticket: ${ticket._id}`);
                } catch (err) {
                    console.error(`[AutoCloseJob] Failed to close ticket ${ticket._id}:`, err);
                }
            }
        } catch (error) {
            console.error('[AutoCloseJob] Error running job:', error);
        }
    }, CHECK_INTERVAL_MS);
};

module.exports = { startAutoCloseJob };
