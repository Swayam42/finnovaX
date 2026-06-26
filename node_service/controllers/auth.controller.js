const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSMS } = require('../services/snsService');
const { sendEmail } = require('../services/sesService');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_kfintech_2026';
const JWT_EXPIRES_IN = '8h';

const generateAndSendOTP = async (phoneNumberOrEmail) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`[AWS LocalStack] 📲 Sending 6-digit OTP ${otp} to ${phoneNumberOrEmail}`);

    try {
        if (phoneNumberOrEmail.includes('@')) {
            await sendEmail({
                to: phoneNumberOrEmail,
                subject: 'Your KFintech Login OTP',
                message: `<h1>Your OTP is: <strong>${otp}</strong></h1><p>Valid for 10 minutes. Do not share this with anyone.</p>`
            });
        } else {
            await sendSMS({
                phoneNumber: phoneNumberOrEmail,
                message: `Your KFintech login OTP is: ${otp}. Do not share it.`
            });
        }
    } catch (error) {
        // Non-critical: OTP send failure should not block login in dev/test
        console.error('[OTP] Failed to send OTP via AWS LocalStack:', error.message);
    }

    return otp;
};

exports.register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            name,
            email: email.toLowerCase().trim(),
            phoneNumber,
            passwordHash,
            role: 'INVESTOR',
            isActive: true
        });

        // Generate token and return
        const payload = {
            userId: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.status(201).json({
            message: 'Registration successful.',
            accessToken: token,
            rbacRole: user.role
        });
    } catch (error) {
        console.error('[Auth] Register error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 2. Locate user — explicitly select passwordHash (excluded by default via select:false)
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is disabled. Contact your administrator.' });
        }

        // 4. Cryptographic password verification
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 5. MFA Notification
        try {
            await generateAndSendOTP(user.email);
        } catch (otpErr) {
            console.warn('[OTP] Skipped OTP step:', otpErr.message);
        }

        // 6. Issue RBAC JWT token
        const payload = {
            userId: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.status(200).json({
            message: 'Login successful.',
            accessToken: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.me = async (req, res) => {
    try {
        // req.user is populated by the authenticate middleware
        const user = await User.findById(req.user.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'User not found or account disabled.' });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[Auth] /me error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.logout = async (req, res) => {
    return res.status(200).json({ message: 'Logged out successfully.' });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Do not leak if user exists
            return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const resetOtpHash = await bcrypt.hash(otp, 10);
        
        user.resetOtpHash = resetOtpHash;
        user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        user.resetOtpUsed = false;
        await user.save();

        console.log(`[AWS LocalStack] 📲 Sending password reset OTP ${otp} to ${user.email}`);

        // Send Email
        try {
            await sendEmail({
                to: user.email,
                subject: 'KFintech Password Reset OTP',
                message: `<h1>Your Password Reset OTP is: <strong>${otp}</strong></h1><p>Valid for 10 minutes. Do not share this.</p>`
            });
        } catch(err) {
            console.error('[SES] Failed:', err);
        }

        // Send SMS if phone exists
        if (user.phoneNumber) {
            try {
                await sendSMS({
                    phoneNumber: user.phoneNumber,
                    message: `Your KFintech Password Reset OTP is: ${otp}. Do not share it.`
                });
            } catch(err) {
                console.error('[SNS] Failed:', err);
            }
        }

        const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => p1 + p2.replace(/./g, '*'));
        const maskedPhone = user.phoneNumber ? user.phoneNumber.replace(/(.*\d)(\d{4})$/, (m, p1, p2) => p1.replace(/\d/g, '*') + p2) : null;

        return res.status(200).json({
            message: 'OTP sent to registered channels.',
            channels: {
                email: maskedEmail,
                phone: maskedPhone
            }
        });

    } catch (error) {
        console.error('[Auth] forgotPassword error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetOtpHash +resetOtpExpires +resetOtpUsed');
        if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        if (user.resetOtpUsed) {
            return res.status(400).json({ message: 'OTP has already been used.' });
        }

        if (new Date() > user.resetOtpExpires) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        const isValid = await bcrypt.compare(otp.toString(), user.resetOtpHash);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        user.resetOtpUsed = true;
        await user.save();

        const resetToken = jwt.sign(
            { userId: user._id, type: 'password_reset' },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        return res.status(200).json({
            message: 'OTP verified successfully.',
            resetToken
        });
    } catch (error) {
        console.error('[Auth] verifyResetOtp error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password are required.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ message: 'Invalid token type.' });
        }

        const user = await User.findById(decoded.userId).select('+resetOtpHash +resetOtpExpires +resetOtpUsed');
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = passwordHash;
        
        // Clear OTP fields
        user.resetOtpHash = undefined;
        user.resetOtpExpires = undefined;
        user.resetOtpUsed = undefined;

        await user.save();

        return res.status(200).json({ message: 'Password has been successfully reset.' });
    } catch (error) {
        console.error('[Auth] resetPassword error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
