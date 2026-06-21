const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');

exports.finalizeTicket = async (req, res) => {
    const { ticketId, action } = req.body;
    
    // Fallback mock ID for L2 Admin Checker
    const adminId = req.user ? req.user.id : new mongoose.Types.ObjectId('60d5ecb8b392d700153f3a02');

    if (!ticketId || !action) {
        return res.status(400).json({ message: "ticketId and action (APPROVE or REJECT) are required fields." });
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be exactly 'APPROVE' or 'REJECT'." });
    }

    // 1. Strict MongoDB ACID Multi-Document Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Safely find the ticket ensuring it's exactly in L2_APPROVAL state
        const ticket = await Ticket.findOne({ _id: ticketId, status: 'L2_APPROVAL' }).session(session);
        if (!ticket) {
            throw new Error("Target Ticket not found or is not currently pending L2_APPROVAL status.");
        }

        const previousStatus = ticket.status;
        const newStatus = action === 'APPROVE' ? 'RESOLVED' : 'CLOSED';

        // 3. Update Status
        ticket.status = newStatus;
        await ticket.save({ session });

        // 4. Securely write final state to AuditLog
        const auditLog = new AuditLog({
            entityId: ticket._id,
            entityType: 'Ticket',
            action: action === 'APPROVE' ? 'L2_TICKET_APPROVED' : 'L2_TICKET_REJECTED',
            performedBy: adminId, // L2 Checker ID
            details: {
                previousStatus,
                newStatus,
                note: `L2 Checker executed the ${action} action. Ticket finalized.`
            }
        });

        await auditLog.save({ session });

        // 5. Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: `Ticket successfully finalized. Automated workflow advanced ticket from ${previousStatus} to ${newStatus}.`,
            ticket
        });

    } catch (error) {
        // 6. Transaction Rollback
        await session.abortTransaction();
        session.endSession();
        console.error("L2 Checker Transaction safely aborted:", error);
        
        const statusCode = error.message.includes("not found") ? 404 : 500;
        return res.status(statusCode).json({
            message: "Failed to finalize ticket. MongoDB Transaction aborted.",
            error: error.message
        });
    }
};
