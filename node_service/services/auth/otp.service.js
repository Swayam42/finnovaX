const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../sesService'); // Existing AWS / Resend service
const { sendSMS } = require('../snsService'); // Existing AWS / Twilio service
exports.generateAndSendOTP = async (user) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    
    user.otpCode = otpHash;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send OTP via Email (Resend in Production / SES Local)
    try {
        await sendEmail({
            to: user.email,
            subject: `FinnovaX Login Verification`,
            message: `<h1>Your Verification Code</h1><p>Your code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
        });
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
    }

    // Try sending OTP via SMS (Twilio in Production / SNS Local) if they have a phone number
    if (user.phoneNumber) {
        try {
            await sendSMS({
                phoneNumber: user.phoneNumber,
                message: `FinnovaX Verification Code: ${otp}. Expires in 10 mins.`
            });
        } catch (smsError) {
            console.error('Failed to send OTP SMS:', smsError);
        }
    }
};