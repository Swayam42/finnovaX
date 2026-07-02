const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    let token = req.cookies.finnovax_access_token;

    // Fallback to Bearer token if cookies are blocked by cross-origin settings
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { ...decoded, id: decoded.userId }; 
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden. Role '${req.user.role}' is not permitted.`,
            });
        }
        next();
    };
};

exports.optionalAuthenticate = (req, res, next) => {
    let token = req.cookies.finnovax_access_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { ...decoded, id: decoded.userId }; 
    } catch (err) {
        // Just ignore errors
    }
    next();
};