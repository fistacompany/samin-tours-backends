const bcrypt = require('bcryptjs');

/**
 * Simple authentication middleware for admin routes
 * Uses basic auth with username/password from environment
 */
async function authenticateAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Decode base64 credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        // Verify credentials
        const validUsername = process.env.ADMIN_USERNAME || 'admin';
        const validPasswordHash = process.env.ADMIN_PASSWORD;

        console.log('Auth attempt - Username:', username);
        console.log('Valid username:', validUsername);
        console.log('Password hash exists:', !!validPasswordHash);

        if (username !== validUsername) {
            console.log('Username mismatch');
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        let isValidPassword = false;

        // Check if stored password is a bcrypt hash (starts with $2a$ or $2b$)
        if (validPasswordHash.startsWith('$2a$') || validPasswordHash.startsWith('$2b$')) {
            isValidPassword = await bcrypt.compare(password, validPasswordHash);
        } else {
            // Fallback to plain text comparison (for easier setup)
            isValidPassword = (password === validPasswordHash);
        }

        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            console.log('Password mismatch');
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        console.log('✅ Authentication successful');
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

module.exports = { authenticateAdmin };
