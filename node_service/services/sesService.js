const nodemailer = require('nodemailer');

// Helper to create Nodemailer transport with specific port and security setting
const createTransportForPort = (port, secure) => {
    return nodemailer.createTransport({
        service: port === 465 ? 'gmail' : undefined,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: secure,
        family: 4, // Force IPv4 to prevent ENETUNREACH errors on IPv6-enabled cloud containers
        connectionTimeout: 10000, // 10 seconds max to connect
        greetingTimeout: 10000,   // 10 seconds max for SMTP greeting
        socketTimeout: 15000,     // 15 seconds max overall socket timeout
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendEmail = async ({ to, subject, message }) => {
    try {
        // 1. Check if Resend HTTP API is configured (HTTPS port 443 - NEVER blocked by cloud firewalls like Render/DigitalOcean)
        if (process.env.RESEND_API_KEY) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: process.env.RESEND_FROM || 'FinnovaX <onboarding@resend.dev>',
                        to: [to],
                        subject: subject,
                        html: message
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(`[Resend HTTP API] 📧 Email sent to ${to}. ID: ${data.id}`);
                    return data;
                } else {
                    const errText = await response.text();
                    console.warn(`⚠️ [Resend HTTP API] Failed (${response.status}): ${errText}. Falling back to Nodemailer SMTP.`);
                }
            } catch (httpErr) {
                console.warn(`⚠️ [Resend HTTP Error] ${httpErr.message}. Falling back to Nodemailer SMTP.`);
            }
        }

        // 2. If SMTP credentials exist, try sending via Nodemailer (Primary: Port 465 SSL/TLS)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const primaryPort = Number(process.env.SMTP_PORT) || 465;
            const primarySecure = primaryPort === 465;
            const primaryTransport = createTransportForPort(primaryPort, primarySecure);

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
                // Check if port 465 timed out or was blocked by cloud firewall (ETIMEDOUT / ENETUNREACH / ESOCKET / Connection timeout)
                const isNetworkBlock = primaryError.code === 'ETIMEDOUT' || primaryError.code === 'ENETUNREACH' || primaryError.code === 'ESOCKET' || primaryError.message?.includes('timeout');
                
                // If primary was 465 and network was blocked, automatically retry with fallback Port 587 (STARTTLS)
                if (primaryPort === 465 && isNetworkBlock) {
                    console.warn(`⚠️ [Nodemailer Port 465 Blocked/Timeout] Cloud firewall likely blocking port 465. Retrying with Port 587 (STARTTLS)...`);
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
                    } catch (fallbackError) {
                        console.error(`[Nodemailer Fallback Error] Port 587 also failed: ${fallbackError.message || fallbackError}`);
                    }
                } else {
                    console.error(`[Nodemailer Error] Primary SMTP delivery failed (${primaryError.code || 'ERROR'}): ${primaryError.message || primaryError}`);
                    if (primaryError.code === 'EAUTH' || primaryError.responseCode === 535) {
                        console.error('🔑 TIP: For Gmail SMTP, ensure 2-Step Verification is enabled and use a 16-character App Password (not your regular account password).');
                    }
                }
            }
        } else {
            // Safe fallback if SMTP credentials are not configured in .env
            console.log('\n=========================================');
            console.log('⚠️ [Nodemailer] SMTP Credentials (SMTP_USER/SMTP_PASS) not found in .env!');
            console.log(`⚠️ Would have sent email to: ${to}`);
            console.log(`⚠️ Subject: ${subject}`);
            console.log('=========================================\n');
            return null;
        }

        // 3. Simulation Fallback Mode (So registration/OTP workflows never crash if mail delivery is blocked)
        console.log('\n=========================================');
        console.log(`📧 [Email Delivery Fallback Simulation] To: ${to}`);
        console.log(`📋 Subject: ${subject}`);
        console.log('=========================================\n');
        return null;
    } catch (error) {
        console.error(`[Email Service Fatal Error] Failed to process email for ${to}:`, error.message || error);
        return null;
    }
};

// Startup verification check called by server.js to diagnose cloud SMTP connectivity
const verifySMTPConnection = async () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('ℹ️ [Nodemailer] No SMTP_USER/SMTP_PASS set in .env. Running in Email Simulation Mode.');
        return;
    }

    const port = Number(process.env.SMTP_PORT) || 465;
    const transport = createTransportForPort(port, port === 465);

    try {
        await transport.verify();
        console.log(`✅ [Nodemailer] SMTP connection verified successfully on Port ${port} (${process.env.SMTP_USER}).`);
    } catch (error) {
        console.warn(`⚠️ [Nodemailer Verification Warning] Could not verify SMTP connection on Port ${port}: ${error.message || error}`);
        if (port === 465 && (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH' || error.message?.includes('timeout'))) {
            console.warn(`ℹ️ Note: Your cloud provider might be blocking outbound port 465. The service will automatically try Port 587 (STARTTLS) or Simulation Mode when sending emails.`);
        } else if (error.code === 'EAUTH' || error.responseCode === 535) {
            console.warn(`🔑 Gmail Authentication Note: Ensure you are using a 16-character App Password generated from Google Account Security settings.`);
        }
    }
};

module.exports = {
    sendEmail,
    verifySMTPConnection
};
