/**
 * Auth Controller
 * 
 * Handles profile-related operations on the backend.
 * Note: Actual auth (signup/login) is handled by Supabase on the frontend.
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');

/**
 * Get current user's profile
 */
const getProfile = async (req, res) => {
    try {
        // Profile already fetched by auth middleware
        res.json({
            success: true,
            data: {
                user: req.profile,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch profile',
            },
        });
    }
};

/**
 * Update current user's profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const allowedFields = [
            'full_name',
            'phone',
            'date_of_birth',
            'blood_type',
            'address',
            'emergency_contact',
        ];

        // Filter only allowed fields
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No valid fields to update',
                },
            });
        }

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update profile error:', error);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: error.message,
                },
            });
        }

        res.json({
            success: true,
            data: {
                user: data,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update profile',
            },
        });
    }
};

/**
 * Get user by ID (admin only)
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found',
                },
            });
        }

        res.json({
            success: true,
            data: {
                user: data,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch user',
            },
        });
    }
};

/**
 * List all users (admin only)
 */
const listUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('users')
            .select('*', { count: 'exact' });

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data: {
                users: data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit),
                },
            },
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch users',
            },
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getUserById,
    listUsers,
};
