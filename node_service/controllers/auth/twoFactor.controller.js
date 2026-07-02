const speakeasy = require('speakeasy');
const User = require('../../models/User');

/**
 * Generate a new TOTP secret and return QR code URL.
 * The secret is saved to the user but twoFactorEnabled remains false
 * until they successfully verify a code from their authenticator app.
 */
exports.generate2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate a new TOTP secret using speakeasy
        const secret = speakeasy.generateSecret({
            name: `FinnovaX (${user.email})`,
            length: 20,
            issuer: 'FinnovaX'
        });

        // Persist the base32 secret (not yet enabled — pending verification)
        await User.findByIdAndUpdate(req.user.id, {
            twoFactorSecret: secret.base32,
            twoFactorEnabled: false
        });

        return res.status(200).json({
            success: true,
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url
        });
    } catch (error) {
        console.error('[2FA] Error generating TOTP secret:', error);
        return res.status(500).json({ success: false, message: 'Server error generating 2FA' });
    }
};

/**
 * Verify a TOTP code from the authenticator app.
 * Only enables 2FA on the user account if the code is valid.
 */
exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token || !/^\d{6}$/.test(token.trim())) {
            return res.status(400).json({ success: false, message: 'A valid 6-digit token is required.' });
        }

        // Must explicitly select the hidden twoFactorSecret field
        const user = await User.findById(req.user.id).select('+twoFactorSecret');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: '2FA not initialized. Please generate a QR code first.'
            });
        }

        // Verify TOTP code with a ±1 window (allows for 30s clock drift)
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token.trim(),
            window: 1
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid authenticator code. Please try again with a fresh code.'
            });
        }

        // Code is valid — activate 2FA
        user.twoFactorEnabled = true;
        user.twoFactorType = 'GOOGLE';
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Google Authenticator 2FA has been successfully enabled.'
        });
    } catch (error) {
        console.error('[2FA] Error verifying TOTP code:', error);
        return res.status(500).json({ success: false, message: 'Server error verifying 2FA' });
    }
};

const otpService = require('../../services/auth/otp.service');
const passwordService = require('../../services/auth/password.service');
const { sendEmail } = require('../../services/sesService');

exports.generateEmail2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await otpService.generateAndSendOTP(user, 'SETUP_2FA');

        return res.status(200).json({
            success: true,
            message: 'OTP sent to email successfully'
        });
    } catch (error) {
        console.error('[2FA] Error generating email OTP:', error);
        return res.status(500).json({ success: false, message: 'Server error generating email 2FA' });
    }
};

exports.verifyEmail2FA = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.otpCode || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
        }

        const isMatch = await passwordService.comparePassword(otp, user.otpCode);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Clear OTP state and activate email 2FA
        user.otpCode = undefined;
        user.otpExpires = undefined;
        user.twoFactorType = 'EMAIL';
        await user.save();

        // Send confirmation email asynchronously (non-blocking)
        sendEmail({
            to: user.email,
            subject: 'FinnovaX — 2FA Preference Updated',
            message: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fbfbfb; padding: 40px 20px; color: #18181b;">
                    <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #e4e4e7; border-radius: 12px;">
                        <h2 style="color: #18181b; font-size: 20px; font-weight: 600; margin-top: 0;">2FA Preference Updated</h2>
                        <p style="color: #52525b;">Hello ${user.name || 'Valued Investor'},</p>
                        <p style="color: #52525b;">Your Two-Factor Authentication has been updated to <strong>Email OTP</strong>. All future login OTPs will be sent to this email address.</p>
                    </div>
                </div>
            `
        }).catch(err => console.error('[2FA] Confirmation email failed:', err));

        const userService = require('../../services/auth/user.service');
        return res.status(200).json({
            success: true,
            message: 'Email 2FA enabled successfully.',
            user: userService.getPublicProfile(user)
        });
    } catch (error) {
        console.error('[2FA] Error verifying email OTP:', error);
        return res.status(500).json({ success: false, message: 'Server error verifying email 2FA' });
    }
};
