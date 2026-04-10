/**
 * Auth Middleware
 * 
 * - Validates JWT from Authorization header via Supabase
 * - Fetches user role from public.users (Option A approach)
 * - Provides role-based access control via requireRole()
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');

/**
 * Authenticate user from JWT token
 * Attaches user and profile to req object
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Missing or invalid authorization header',
                },
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token',
                },
            });
        }

        // Fetch user profile with role from public.users
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'PROFILE_ERROR',
                    message: 'Failed to fetch user profile',
                },
            });
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: 'User profile not found',
                },
            });
        }

        // Attach user and profile to request
        req.user = user;
        req.profile = profile;
        req.role = profile.role;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication failed',
            },
        });
    }
};

/**
 * Require specific role(s) for access
 * Must be used after authenticate middleware
 * 
 * @param {string|string[]} allowedRoles - Role or array of roles allowed
 */
const requireRole = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.role) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
        }

        if (!roles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: `Access denied. Required role: ${roles.join(' or ')}`,
                },
            });
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work both authenticated and unauthenticated
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue without auth
        }

        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);

        if (user) {
            const { data: profile } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            req.user = user;
            req.profile = profile;
            req.role = profile?.role;
        }

        next();
    } catch (error) {
        // Don't fail, just continue without auth
        next();
    }
};

module.exports = {
    authenticate,
    requireRole,
    optionalAuth,
};
