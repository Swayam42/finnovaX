const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./sesService');
const { sendSMS } = require('./snsService');

const createNotification = async ({
    userId,
    ticketId = null,
    type,
    title,
    message,
    channels = { inApp: true, email: false, sms: false }
}, options = {}) => {
    if (!userId || !type || !title || !message) return null;

    // Auto-enable email for important SaaS events
    const IMPORTANT_EVENTS = ['TICKET_CREATED', 'TICKET_RESOLVED', 'TICKET_REJECTED', 'DOCUMENT_REJECTED', 'STATUS_CHANGED'];
    if (IMPORTANT_EVENTS.includes(type)) {
        channels.email = true;
    }

    const notification = new Notification({
        userId,
        ticketId,
        type,
        title,
        message,
        channels: {
            inApp: channels.inApp !== false,
            email: !!channels.email,
            sms: !!channels.sms
        }
    });

    await notification.save(options);

    if (channels.email || channels.sms) {
        try {
            const user = await User.findById(userId).select('email phoneNumber name').lean();
            if (channels.email && user?.email) {
                const baseContainerOpen = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbfb; padding: 40px 20px; color: #18181b; line-height: 1.6;">
                        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #e4e4e7; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">FinnovaX</h1>
                                <div style="height: 2px; width: 40px; background-color: #18181b; margin: 15px auto;"></div>
                            </div>
                `;
                const baseContainerClose = `
                            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
                            <p style="color: #a1a1aa; font-size: 13px; margin: 0; text-align: center;">FinnovaX Support Team</p>
                        </div>
                    </div>
                `;

                let innerHtml = `<p>Hello ${user.name || 'Investor'},</p><p>${message}</p>`;
                
                if (type === 'TICKET_CREATED') {
                    innerHtml = `
                        <h2 style="color: #18181b; font-size: 20px; font-weight: 600; margin-top: 0;">We've received your request! 📝</h2>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Hello ${user.name || 'Investor'},</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Your ticket has been successfully submitted and is now in our queue.</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">We'll notify you as soon as our agents begin reviewing your case.</p>
                        <br/>
                        <p style="color: #18181b; font-size: 15px; font-weight: 500;">Best,<br/>The FinnovaX Team</p>
                    `;
                } else if (type === 'TICKET_RESOLVED') {
                    innerHtml = `
                        <h2 style="color: #10b981; font-size: 20px; font-weight: 600; margin-top: 0;">Good News! Ticket Resolved 🎉</h2>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Hello ${user.name || 'Investor'},</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">We're happy to let you know that your request has been fully processed and approved.</p>
                        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 24px 0;">
                            <p style="color: #065f46; font-size: 14px; margin: 0;"><strong>Note from our team:</strong><br/>${message}</p>
                        </div>
                        <br/>
                        <p style="color: #18181b; font-size: 15px; font-weight: 500;">Best,<br/>The FinnovaX Team</p>
                    `;
                } else if (type === 'TICKET_REJECTED' || type === 'DOCUMENT_REJECTED') {
                    innerHtml = `
                        <h2 style="color: #ef4444; font-size: 20px; font-weight: 600; margin-top: 0;">Action Required on Your Ticket ⚠️</h2>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Hello ${user.name || 'Investor'},</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Unfortunately, we could not process your request at this time.</p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 24px 0;">
                            <p style="color: #991b1b; font-size: 14px; margin: 0;"><strong>Reason for rejection:</strong><br/>${message}</p>
                        </div>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Please log in to your dashboard to review the details and resubmit if necessary.</p>
                        <br/>
                        <p style="color: #18181b; font-size: 15px; font-weight: 500;">Best,<br/>The FinnovaX Team</p>
                    `;
                } else if (type === 'STATUS_CHANGED') {
                    innerHtml = `
                        <h2 style="color: #3b82f6; font-size: 20px; font-weight: 600; margin-top: 0;">Ticket Status Update 🔄</h2>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Hello ${user.name || 'Investor'},</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">${message}</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Log in to your FinnovaX dashboard to track its progress.</p>
                        <br/>
                        <p style="color: #18181b; font-size: 15px; font-weight: 500;">Best,<br/>The FinnovaX Team</p>
                    `;
                }

                await sendEmail({
                    to: user.email,
                    subject: title,
                    message: baseContainerOpen + innerHtml + baseContainerClose
                });
            }
            if (channels.sms && user?.phoneNumber) {
                await sendSMS({ phoneNumber: user.phoneNumber, message });
            }
        } catch (err) {
            console.error('[Notifications] Delivery failed:', err.message);
        }
    }

    return notification;
};

module.exports = { createNotification };
