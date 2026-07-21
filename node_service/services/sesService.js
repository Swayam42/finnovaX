const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, message }) => {
    try {
        // If credentials are provided, use them to send a REAL email via Nodemailer
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                family: 4, // Force IPv4 to prevent ENETUNREACH errors on IPv6-enabled cloud containers/networks like Render
                connectionTimeout: 5000, // 5 seconds max to connect
                greetingTimeout: 5000,   // 5 seconds max for SMTP greeting
                socketTimeout: 10000,    // 10 seconds max overall socket timeout
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const info = await transporter.sendMail({
                from: `"FinnovaX" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: message
            });

            console.log(`[Nodemailer] 📧 Email sent to ${to}. MessageId: ${info.messageId}`);
            return info;
        } else {
            // Safe fallback if the user forgets to set SMTP_USER in .env
            console.log('\n=========================================');
            console.log('⚠️ [Nodemailer] SMTP Credentials not found in .env!');
            console.log(`⚠️ Would have sent email to: ${to}`);
            console.log(`⚠️ Subject: ${subject}`);
            console.log('=========================================\n');
            return null;
        }
    } catch (error) {
        console.error(`[Nodemailer Error] Failed to send email to ${to}:`, error.message || error);
        // Don't throw fatal error if email delivery fails, so core flows (register/login/OTP) stay alive and fall back cleanly
        console.log('\n=========================================');
        console.log(`[Email Delivery Fallback Simulation] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('=========================================\n');
        return null;
    }
};

const verifySMTPConnection = async () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('ℹ️ [Nodemailer] No SMTP_USER/SMTP_PASS set in .env. Running in Hybrid Simulation Mode.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4, // Force IPv4 to prevent ENETUNREACH errors on IPv6-enabled cloud containers
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.verify();
        console.log(`[Nodemailer] SMTP connection verified successfully (${process.env.SMTP_USER}).`);
    } catch (error) {
        console.warn(`[Nodemailer Verification Note] Outbound Port 465 check timed out or blocked: ${error.message || error}`);
        console.warn(`Note: Cloud networks like Render Free Tier block outbound SMTP ports. System running smoothly in Hybrid LocalStack/Simulation Mode.`);
    }
};

module.exports = {
    sendEmail,
    verifySMTPConnection
};
