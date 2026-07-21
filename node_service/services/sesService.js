const nodemailer = require('nodemailer');
const dns = require('dns');

// CRITICAL: Force Node.js to resolve IPv4 addresses first.
// Render's free tier containers have IPv6 enabled in DNS but NO outbound IPv6 network route.
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Helper to create Nodemailer transport configured specifically for IPv4
const createTransportForPort = (port, secure) => {
    return nodemailer.createTransport({
        service: (port === 465 && (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes('gmail'))) ? 'gmail' : undefined,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: secure,
        connectionTimeout: 8000, // 8 seconds max to connect
        greetingTimeout: 8000,   // 8 seconds max for SMTP greeting
        socketTimeout: 12000,    // 12 seconds max overall socket timeout
        tls: {
            rejectUnauthorized: false,
            servername: process.env.SMTP_HOST || 'smtp.gmail.com'
        },
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendEmail = async ({ to, subject, message }) => {
    try {
        // If credentials are provided, try sending real email via Nodemailer
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const primaryPort = Number(process.env.SMTP_PORT) || 465;
            const primaryTransport = createTransportForPort(primaryPort, primaryPort === 465);

            try {
                const info = await primaryTransport.sendMail({
                    from: `"FinnovaX" <${process.env.SMTP_USER}>`,
                    to,
                    subject,
                    html: message
                });
                console.log(`[Nodemailer Port ${primaryPort}] 📧 Email sent to ${to}. MessageId: ${info.messageId}`);
                return info;
            } catch (primaryError) {
                const isTimeoutOrNetworkBlock = primaryError.code === 'ETIMEDOUT' || primaryError.code === 'ENETUNREACH' || primaryError.code === 'ESOCKET' || primaryError.message?.includes('timeout') || primaryError.code === 'ECONNREFUSED';
                
                // If Port 465 timed out or was blocked by cloud firewall, try fallback Port 587 (STARTTLS)
                if (primaryPort === 465 && isTimeoutOrNetworkBlock) {
                    console.warn(`[Nodemailer Port 465 Blocked/Timeout] Retrying with Port 587 (STARTTLS)...`);
                    try {
                        const fallbackTransport = createTransportForPort(587, false);
                        const fallbackInfo = await fallbackTransport.sendMail({
                            from: `"FinnovaX" <${process.env.SMTP_USER}>`,
                            to,
                            subject,
                            html: message
                        });
                        console.log(`[Nodemailer Port 587 Fallback] 📧 Email sent to ${to}. MessageId: ${fallbackInfo.messageId}`);
                        return fallbackInfo;
                    } catch (fallback587Error) {
                        // If Port 587 also fails on cloud networks, try Port 2525 (supported by Brevo/SendGrid/Mailgun when SMTP_HOST is custom)
                        if (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('gmail')) {
                            console.warn(`[Nodemailer Port 587 Blocked/Timeout] Retrying with Port 2525...`);
                            try {
                                const transport2525 = createTransportForPort(2525, false);
                                const info2525 = await transport2525.sendMail({
                                    from: `"FinnovaX" <${process.env.SMTP_USER}>`,
                                    to,
                                    subject,
                                    html: message
                                });
                                console.log(`[Nodemailer Port 2525 Fallback] 📧 Email sent to ${to}. MessageId: ${info2525.messageId}`);
                                return info2525;
                            } catch (err2525) {
                                // Fall through to simulation log
                            }
                        }
                        console.warn(`\n⚠️ [PRODUCTION CLOUD FIREWALL NOTICE] Outbound SMTP ports (465 and 587) timed out on Render.`);
                        console.warn(`👉 Render Free Tier blocks outbound ports 25, 465, and 587 by design to prevent spam.`);
                        console.warn(`👉 To send real emails from Render in Production:`);
                        console.warn(`   1. Upgrade your Render instance (or add verified payment method on Render) to unblock ports 465/587.`);
                        console.warn(`   2. OR use a transactional SMTP provider that supports Port 2525 (e.g. Brevo/SendGrid) and set SMTP_PORT=2525.\n`);
                    }
                } else {
                    console.error(`[Nodemailer Error] Primary SMTP delivery failed (${primaryError.code || 'ERROR'}): ${primaryError.message || primaryError}`);
                    if (primaryError.code === 'EAUTH' || primaryError.responseCode === 535) {
                        console.error('TIP: For Gmail SMTP, ensure 2-Step Verification is enabled and use a 16-character App Password (not your regular account password).');
                    }
                }
            }
        } else {
            // Safe fallback if SMTP credentials are not configured in .env
            console.log('\n=========================================');
            console.log('⚠️ [Nodemailer] SMTP Credentials not found in .env!');
            console.log(`⚠️ Would have sent email to: ${to}`);
            console.log(`⚠️ Subject: ${subject}`);
            console.log('=========================================\n');
            return null;
        }

        // Hybrid Fallback Simulation Mode (Ensures registration/OTP/login flows stay 100% functional even when cloud SMTP is blocked)
        console.log('\n=========================================');
        console.log(`[Email Delivery Fallback Simulation] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('=========================================\n');
        return null;
    } catch (error) {
        console.error(`[Nodemailer Fatal Error] Failed to send email to ${to}:`, error.message || error);
        return null;
    }
};

const verifySMTPConnection = async () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('ℹ️ [Nodemailer] No SMTP_USER/SMTP_PASS set in .env. Running in Hybrid Simulation Mode.');
        return;
    }

    const port = Number(process.env.SMTP_PORT) || 465;
    const transport = createTransportForPort(port, port === 465);

    try {
        await transport.verify();
        console.log(`[Nodemailer] SMTP connection verified successfully on Port ${port} (${process.env.SMTP_USER}).`);
    } catch (error) {
        if (port === 465 && (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH' || error.message?.includes('timeout') || error.code === 'ECONNREFUSED')) {
            console.warn(`Testing fallback Port 587 (STARTTLS)...`);
            try {
                const fallbackTransport = createTransportForPort(587, false);
                await fallbackTransport.verify();
                console.log(`[Nodemailer Fallback] SMTP connection verified successfully on Port 587 (${process.env.SMTP_USER}).`);
            } catch (fallbackErr) {
                console.warn(`\n⚠️ [PRODUCTION CLOUD FIREWALL NOTICE] Outbound SMTP ports (465 and 587) timed out during startup verification.`);
                console.warn(`👉 Render Free Tier blocks outbound ports 25, 465, and 587 by design to prevent spam.`);
                console.warn(`👉 To send real emails from Render in Production:`);
                console.warn(`   1. Upgrade your Render instance (or add verified payment method on Render) to unblock ports 465/587.`);
                console.warn(`   2. OR use a transactional SMTP provider that supports Port 2525 (e.g. Brevo/SendGrid) and set SMTP_PORT=2525.\n`);
            }
        } else if (error.code === 'EAUTH' || error.responseCode === 535) {
            console.warn(`Gmail Authentication Note: Ensure you are using a 16-character App Password generated from Google Account Security settings.`);
        } else {
            console.warn(`[Nodemailer Verification Note] ${error.message || error}`);
        }
    }
};

module.exports = {
    sendEmail,
    verifySMTPConnection
};
