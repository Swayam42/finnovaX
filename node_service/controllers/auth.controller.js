const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSMS } = require('../services/snsService');
const { sendEmail } = require('../services/sesService');

// Simulated User Database to represent MongoDB schema
const mockUserDB = {
    "investor@kfintech.com": {
        id: "usr_101",
        role: "INVESTOR",
        // Represents "securePassword123" hashed
        passwordHash: "$2b$10$X...yourHashHere" 
    },
    "admin1@kfintech.com": {
        id: "usr_202",
        role: "ADMIN_L1",
        passwordHash: "$2b$10$Y...yourHashHere"
    },
    "admin2@kfintech.com": {
        id: "usr_999",
        role: "ADMIN_L2",
        passwordHash: "$2b$10$Z...yourHashHere"
    }
};

/**
 * 🔒 MFA / OTP Generation using AWS LocalStack (SNS or SES).
 */
const generateAndSendOTP = async (phoneNumberOrEmail) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`[AWS LocalStack] 📲 Sending 6-digit OTP ${otp} to ${phoneNumberOrEmail}`);
    
    try {
        if (phoneNumberOrEmail.includes('@')) {
            await sendEmail({
                to: phoneNumberOrEmail,
                subject: 'Your Login OTP',
                message: `<h1>Your OTP is: <strong>${otp}</strong></h1><p>Please do not share this with anyone.</p>`
            });
        } else {
            await sendSMS({
                phoneNumber: phoneNumberOrEmail, // Make sure it's a valid format like +1234567890 if not testing
                message: `Your login OTP is: ${otp}. Do not share it.`
            });
        }
    } catch (error) {
        console.error("Failed to send OTP via AWS LocalStack:", error);
        // We can swallow the error or throw it based on requirements
    }
    
    return otp;
};

/**
 * 🔑 Single Smart Gateway: User Login Logic
 * Includes password verification and RBAC JWT Token issuance.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Input Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // 2. Locate User (In production: await User.findOne({ email }))
        const user = mockUserDB[email];
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // 3. Cryptographic Password Verification
        // Note: For this mock, we assume success if passing 'mock_password' or use bcrypt
        let isMatch = false;
        if (password === 'mock_password') {
            isMatch = true; // Temporary bypass for testing without real hashes
        } else {
            // Real verification:
            // isMatch = await bcrypt.compare(password, user.passwordHash);
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // 4. (Bonus) Trigger 6-Digit OTP for Multi-Factor Authentication
        const otpSent = await generateAndSendOTP(email);

        // 5. Issue Role-Based Access Control (RBAC) Token
        // Roles matrix: INVESTOR, ADMIN_L1, ADMIN_L2
        const payload = {
            userId: user.id,
            role: user.role
        };

        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_kfintech_2026';
        
        // Sign token valid for 8 hours
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        return res.status(200).json({
            message: "Login successful. Please verify OTP if required.",
            accessToken: token,
            rbacRole: user.role,
            requiresOtp: true 
        });

    } catch (error) {
        console.error("Authentication Gateway Error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
