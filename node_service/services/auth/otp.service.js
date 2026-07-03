const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { sendEmail } = require('../sesService'); // Existing AWS / Resend service
const { sendSMS } = require('../snsService'); // Existing AWS / Twilio service

/**
 * Generates a 6-digit OTP, hashes it with bcrypt, persists it on the user
 * document, and emails it to the user's actual email address.
 *
 * The OTP expires after 10 minutes.
 */

exports.generateAndSendOTP = async (user, context = 'LOGIN') => {
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Add bright ANSI colors to make it unmissable in the terminal
    const bgGreen = '\x1b[42m';
    const fgBlack = '\x1b[30m';
    const fgYellow = '\x1b[33m';
    const bold = '\x1b[1m';
    const reset = '\x1b[0m';
    
    console.log('\n' + fgYellow + bold + '=========================================' + reset);
    console.log(bgGreen + fgBlack + bold + '  >>> 🔐 DEVELOPMENT OTP: ' + otp + ' <<<  ' + reset);
    console.log(fgYellow + bold + `  👤 User: ${user.email} [${context}]` + reset);
    console.log(fgYellow + bold + '=========================================\n' + reset);
    
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpCode = otpHash;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    let subject = 'FinnovaX — Login Verification Code';
    let promptText = 'Please use the following one-time code to complete your login.';
    
    if (context === 'FORGOT_PASSWORD') {
        subject = 'FinnovaX — Password Reset Code';
        promptText = 'Please use the following one-time code to reset your password.';
    } else if (context === 'SETUP_2FA') {
        subject = 'FinnovaX — 2FA Setup Code';
        promptText = 'Please use the following one-time code to complete your 2FA setup.';
    }

    // Send OTP via Email (await to ensure delivery in cloud containers)
    try {
        await sendEmail({
            to: user.email,
            subject: subject,
            message: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfbfb; padding: 40px 20px; color: #18181b; line-height: 1.6;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #e4e4e7; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">FinnovaX</h1>
                            <div style="height: 2px; width: 40px; background-color: #18181b; margin: 15px auto;"></div>
                        </div>
                        <h2 style="color: #18181b; font-size: 20px; font-weight: 600; margin-top: 0;">Verification Code</h2>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">Hello ${user.name || 'Valued Investor'},</p>
                        <p style="color: #52525b; font-size: 15px; margin-bottom: 24px;">${promptText} This code will expire in 10 minutes.</p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; display: inline-block;">
                                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b;">${otp}</span>
                            </div>
                        </div>

                        <p style="color: #71717a; font-size: 14px; margin-bottom: 0;">If you did not request this code, please ignore this email or contact support immediately.</p>
                        
                        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
                        <p style="color: #a1a1aa; font-size: 13px; margin: 0; text-align: center;">Secure Login • FinnovaX Security Team</p>
                    </div>
                </div>
            `
        });
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError.message || emailError);
    }

    // Try sending OTP via SMS (Twilio in Production / SNS Local) if they have a phone number
    if (user.phoneNumber) {
        try {
            await sendSMS({
                phoneNumber: user.phoneNumber,
                message: `FinnovaX Verification Code: ${otp}. Expires in 10 mins.`
            });
        } catch (smsError) {
            console.error('Failed to send OTP SMS (non-fatal):', smsError.message || smsError);
        }
    }
};

