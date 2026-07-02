const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const COOKIE_CONFIG = {
    ACCESS_TOKEN: {
        httpOnly: true,
        secure: true, // Must be true when sameSite is 'none'
        sameSite: isProduction ? 'none' : 'strict', // 'none' required for cross-domain Vercel <-> Render
        maxAge: 15 * 60 * 1000 // 15 minutes
    },
    REFRESH_TOKEN: {
        httpOnly: true,
        secure: true, // Must be true when sameSite is 'none'
        sameSite: isProduction ? 'none' : 'strict',
        path: '/api/auth/refresh', // Restrict refresh token to this endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
};

module.exports = { COOKIE_CONFIG };