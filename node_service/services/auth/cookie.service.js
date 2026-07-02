const { COOKIE_CONFIG } = require('../../config/cookies');

exports.setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('finnovax_access_token', accessToken, COOKIE_CONFIG.ACCESS_TOKEN);
    res.cookie('finnovax_refresh_token', refreshToken, COOKIE_CONFIG.REFRESH_TOKEN);
};

exports.clearAuthCookies = (res) => {
    res.clearCookie('finnovax_access_token', { ...COOKIE_CONFIG.ACCESS_TOKEN, maxAge: 0 });
    res.clearCookie('finnovax_refresh_token', { ...COOKIE_CONFIG.REFRESH_TOKEN, maxAge: 0 });
};