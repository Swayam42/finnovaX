const userService = require('../../services/auth/user.service');
const passwordService = require('../../services/auth/password.service');
const otpService = require('../../services/auth/otp.service');
const tokenService = require('../../services/auth/token.service');
const cookieService = require('../../services/auth/cookie.service');
const speakeasy = require('speakeasy');

exports.initiateLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

        const user = await userService.getUserByEmail(email);
        if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials.' });
        
        // Wait, getUserByEmail doesn't fetch passwordHash. We need a helper or use User directly for login.
        // Actually, let's keep User.findOne here just for the +passwordHash selection, or move it to userService.
        const userWithPwd = await require('../../models/User').findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
        
        const isMatch = await passwordService.comparePassword(password, userWithPwd.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (user.role !== 'INVESTOR') {
            const accessToken = tokenService.generateAccessToken(user);
            const refreshToken = await tokenService.generateRefreshToken(user._id);
            cookieService.setAuthCookies(res, accessToken, refreshToken);
            return res.status(200).json({ 
                message: 'Login successful.', 
                requiresOtp: false, 
                user: userService.getPublicProfile(user),
                accessToken 
            });
        }

        // INVESTOR 2FA Handling
        if (user.twoFactorType === 'GOOGLE' && user.twoFactorEnabled) {
            return res.status(200).json({ 
                message: '2FA required.', 
                requiresOtp: true, 
                type: 'GOOGLE', 
                email: user.email 
            });
        }

        if (user.twoFactorType === 'EMAIL') {
            await otpService.generateAndSendOTP(user);
            return res.status(200).json({ 
                message: 'OTP sent via email.', 
                requiresOtp: true, 
                type: 'EMAIL', 
                email: user.email 
            });
        }

        // If NONE or unrecognized type, allow instant login
        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = await tokenService.generateRefreshToken(user._id);
        cookieService.setAuthCookies(res, accessToken, refreshToken);
        return res.status(200).json({ 
            message: 'Login successful.', 
            requiresOtp: false, 
            user: userService.getPublicProfile(user),
            accessToken 
        });
    } catch (error) {
        console.error('[Auth] Login init error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required.' });

        const user = await require('../../models/User').findOne({ email: email.toLowerCase().trim() }).select('+twoFactorSecret');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (user.twoFactorType === 'GOOGLE' && user.twoFactorEnabled) {
            if (!user.twoFactorSecret) {
                return res.status(500).json({ message: '2FA secret missing. Please reconfigure your authenticator.' });
            }
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: otp.trim(),
                window: 1
            });
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid Authenticator code. Please try again.' });
            }
        } else {
            // Email OTP Verification
            if (!user.otpCode || user.otpExpires < Date.now()) {
                return res.status(401).json({ message: 'OTP expired or invalid.' });
            }
            const isMatch = await passwordService.comparePassword(otp, user.otpCode);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid OTP.' });
            }
            // Clear OTP state
            user.otpCode = undefined;
            user.otpExpires = undefined;
            await user.save();
        }

        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = await tokenService.generateRefreshToken(user._id);

        cookieService.setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({ 
            message: 'Login successful.', 
            user: userService.getPublicProfile(user),
            accessToken 
        });
    } catch (error) {
        console.error('[Auth] Verify OTP error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};